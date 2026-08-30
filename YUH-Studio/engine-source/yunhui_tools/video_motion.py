import json
import math
import sys
from pathlib import Path

import cv2
import numpy as np
try:
    from moviepy import VideoFileClip, concatenate_videoclips
except ImportError:
    from moviepy.editor import VideoFileClip, concatenate_videoclips


def smooth(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def main():
    with open(sys.argv[1], 'r', encoding='utf-8') as handle:
        config = json.load(handle)
    source = config['file']
    output_dir = Path(config['outputDir'])
    output_dir.mkdir(parents=True, exist_ok=True)
    preset = config.get('preset', '缓慢推进')
    intensity = max(0.05, min(1.0, float(config.get('intensity', 45)) / 100.0))
    speed = max(0.25, min(4.0, float(config.get('speed', 1.0))))
    loop_count = max(1, min(20, int(config.get('loopCount', 1))))
    requested_duration = float(config.get('clipDuration', 0) or 0)
    clip_duration = max(.2, requested_duration) if requested_duration > 0 else 0
    target_fps = max(0, min(120, int(config.get('targetFps', 0) or 0)))
    keyframes = sorted(config.get('keyframes') or [], key=lambda item: float(item.get('time', 0)))
    output_path = output_dir / f'{Path(source).stem}_motion.mp4'

    clip = VideoFileClip(source)
    if clip_duration:
        if clip.duration >= clip_duration:
            clip = clip.subclipped(0, clip_duration) if hasattr(clip, 'subclipped') else clip.subclip(0, clip_duration)
        else:
            repeats = int(math.ceil(clip_duration / max(clip.duration, .01)))
            repeated = concatenate_videoclips([clip] * repeats)
            clip = repeated.subclipped(0, clip_duration) if hasattr(repeated, 'subclipped') else repeated.subclip(0, clip_duration)
    duration = max(clip.duration, 0.01)

    def keyframe_value(name, time_value, default):
        if not keyframes:
            return default
        if time_value <= float(keyframes[0].get('time', 0)):
            return float(keyframes[0].get(name, default))
        for left, right in zip(keyframes, keyframes[1:]):
            start_time, end_time = float(left.get('time', 0)), float(right.get('time', 0))
            if start_time <= time_value <= end_time:
                ratio = 0 if end_time == start_time else (time_value - start_time) / (end_time - start_time)
                start_value, end_value = float(left.get(name, default)), float(right.get(name, default))
                return start_value + (end_value - start_value) * smooth(ratio)
        return float(keyframes[-1].get(name, default))

    def transform(get_frame, time_value):
        frame = get_frame(time_value)
        height, width = frame.shape[:2]
        progress = smooth(time_value / duration)
        zoom = 1.0
        offset_x = 0.0
        offset_y = 0.0
        if keyframes:
            scale = max(.1, keyframe_value('scale', time_value, 100) / 100.0)
            position_x = keyframe_value('positionX', time_value, 0)
            position_y = keyframe_value('positionY', time_value, 0)
            resized_width, resized_height = max(2, int(width * scale)), max(2, int(height * scale))
            resized = cv2.resize(frame, (resized_width, resized_height), interpolation=cv2.INTER_LANCZOS4)
            if scale >= 1:
                crop_x = max(0, min(resized_width - width, (resized_width - width) // 2 - int(position_x)))
                crop_y = max(0, min(resized_height - height, (resized_height - height) // 2 - int(position_y)))
                return resized[crop_y:crop_y + height, crop_x:crop_x + width]
            canvas = np.zeros_like(frame)
            left = max(0, min(width - resized_width, (width - resized_width) // 2 + int(position_x)))
            top = max(0, min(height - resized_height, (height - resized_height) // 2 + int(position_y)))
            canvas[top:top + resized_height, left:left + resized_width] = resized
            return canvas
        if preset == '缓慢推进':
            zoom = 1.0 + 0.32 * intensity * progress
        elif preset == '平稳拉远':
            zoom = 1.0 + 0.32 * intensity * (1.0 - progress)
        elif preset == '左向右横移':
            zoom = 1.0 + 0.18 * intensity
            offset_x = (progress * 2.0 - 1.0) * 0.45 * intensity
        elif preset == '半环绕运镜':
            zoom = 1.0 + 0.22 * intensity * math.sin(progress * math.pi)
            offset_x = math.sin((progress - .5) * math.pi) * .34 * intensity
            offset_y = math.sin(progress * math.pi) * -.08 * intensity
        elif preset == '低机位跟拍':
            zoom = 1.0 + 0.16 * intensity
            offset_x = (progress * 2.0 - 1.0) * .22 * intensity
            offset_y = .22 * intensity
        elif preset == '航拍下降':
            zoom = 1.0 + .28 * intensity * progress
            offset_y = -.38 * intensity * (1.0 - progress)

        crop_width = max(2, int(width / zoom))
        crop_height = max(2, int(height / zoom))
        max_x = max(0, (width - crop_width) // 2)
        max_y = max(0, (height - crop_height) // 2)
        center_x = width // 2 + int(max_x * offset_x)
        center_y = height // 2 + int(max_y * offset_y)
        left = max(0, min(width - crop_width, center_x - crop_width // 2))
        top = max(0, min(height - crop_height, center_y - crop_height // 2))
        cropped = frame[top:top + crop_height, left:left + crop_width]
        return cv2.resize(cropped, (width, height), interpolation=cv2.INTER_LANCZOS4)

    processed = clip.transform(transform) if hasattr(clip, 'transform') else clip.fl(transform)
    if loop_count > 1:
        processed = concatenate_videoclips([processed] * loop_count)
    if abs(speed - 1.0) > .001:
        processed = processed.with_speed_scaled(speed) if hasattr(processed, 'with_speed_scaled') else processed.speedx(speed)
    processed.write_videofile(
        str(output_path), codec='libx264', audio_codec='aac', fps=target_fps or clip.fps,
        preset='medium', threads=max(2, min(8, int(config.get('threads', 4)))), logger=None
    )
    processed.close()
    clip.close()
    print(json.dumps({'success': True, 'outputPaths': [str(output_path)]}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'success': False, 'error': str(error)}, ensure_ascii=False))
        sys.exit(1)
