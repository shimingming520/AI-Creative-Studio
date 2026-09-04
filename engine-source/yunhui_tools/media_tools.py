import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as functional
from PIL import Image


def _resolve_ffmpeg() -> str:
    """优先使用 imageio-ffmpeg 自带 ffmpeg，其次系统 PATH。"""
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        pass
    found = shutil.which('ffmpeg')
    if found:
        return found
    raise RuntimeError('未找到 ffmpeg，请确保 imageio-ffmpeg 已安装或系统 PATH 中有 ffmpeg')


def _resolve_ffprobe() -> str:
    """ffprobe 通常和 ffmpeg 同目录。"""
    ffmpeg_exe = _resolve_ffmpeg()
    ffprobe_candidate = str(Path(ffmpeg_exe).parent / 'ffprobe')
    # Windows
    ffprobe_exe = ffprobe_candidate + ('.exe' if sys.platform == 'win32' else '')
    if Path(ffprobe_exe).exists():
        return ffprobe_exe
    found = shutil.which('ffprobe')
    if found:
        return found
    # imageio-ffmpeg 没有 ffprobe，用 ffmpeg 代替（parse 输出）
    return ffmpeg_exe


FFMPEG = ''
FFPROBE = ''


def unique_path(directory: Path, stem: str, suffix: str) -> Path:
    candidate = directory / f'{stem}{suffix}'
    index = 1
    while candidate.exists():
        candidate = directory / f'{stem}_{index}{suffix}'
        index += 1
    return candidate


def upscale_array(frame: np.ndarray, scale: int) -> np.ndarray:
    """对单帧执行 GPU 双三次插值放大。"""
    tensor = torch.from_numpy(np.ascontiguousarray(frame)).to('cuda', non_blocking=True)
    tensor = tensor.permute(2, 0, 1).unsqueeze(0).float() / 255.0
    height, width = tensor.shape[-2:]
    max_scale = min(scale, 7680 / max(height, width))
    target_h = max(2, int(height * max_scale) // 2 * 2)
    target_w = max(2, int(width * max_scale) // 2 * 2)
    output = functional.interpolate(tensor, size=(target_h, target_w), mode='bicubic', align_corners=False, antialias=True)
    return output.squeeze(0).permute(1, 2, 0).clamp(0, 1).mul(255).byte().cpu().numpy()


def upscale_batch(frames: list[np.ndarray], scale: int) -> list[np.ndarray]:
    """批量 GPU 放大：将多帧合并为一个大 batch 提交给 GPU，充分利用显卡并行算力。"""
    if not frames:
        return []
    stacked = np.stack([np.ascontiguousarray(f) for f in frames], axis=0)
    tensor = torch.from_numpy(stacked).to('cuda', non_blocking=True)
    tensor = tensor.permute(0, 3, 1, 2).float() / 255.0
    height, width = tensor.shape[-2:]
    max_scale = min(scale, 7680 / max(height, width))
    target_h = max(2, int(height * max_scale) // 2 * 2)
    target_w = max(2, int(width * max_scale) // 2 * 2)
    output = functional.interpolate(tensor, size=(target_h, target_w), mode='bicubic', align_corners=False, antialias=True)
    result = output.permute(0, 2, 3, 1).clamp(0, 1).mul(255).byte().cpu().numpy()
    return [result[i] for i in range(len(frames))]


def upscale_image(source: Path, output_dir: Path, scale: int) -> Path:
    image = Image.open(source).convert('RGB')
    output = upscale_array(np.array(image), scale)
    target = unique_path(output_dir, f'{source.stem}_nvidia_{scale}x', '.png')
    Image.fromarray(output).save(target, format='PNG', compress_level=6)
    return target


def _probe_dimensions(source: Path) -> tuple[int, int, float]:
    """通过 ffprobe/ffmpeg 获取视频的宽、高、帧率。"""
    probe = FFPROBE or _resolve_ffprobe()
    try:
        result = subprocess.run(
            [probe, '-v', 'quiet', '-print_format', 'json', '-show_streams', str(source)],
            capture_output=True, text=True, timeout=30, check=True
        )
        streams = json.loads(result.stdout).get('streams', [])
        video_stream = next((s for s in streams if s.get('codec_type') == 'video'), {})
        width = int(video_stream.get('width', 1920))
        height = int(video_stream.get('height', 1080))
        fps_parts = video_stream.get('avg_frame_rate', '30/1').split('/')
        fps = float(fps_parts[0]) / float(fps_parts[1]) if len(fps_parts) == 2 and float(fps_parts[1]) > 0 else 30.0
        return width, height, fps
    except Exception:
        return 1920, 1080, 30.0


def _try_ffmpeg_gpu(source: Path, target: Path, target_w: int, target_h: int) -> bool:
    """尝试多种 ffmpeg CUDA 硬件滤镜 + NVENC 编码方案，成功返回 True。"""
    gpu_filters = [
        f'scale_npp={target_w}:{target_h}:format=yuv420p',
        f'scale_cuda={target_w}:{target_h}',
        f'hwupload_cuda,scale_npp={target_w}:{target_h}:format=yuv420p',
    ]
    for gpu_filter in gpu_filters:
        cmd = [
            FFMPEG or _resolve_ffmpeg(), '-y', '-hide_banner', '-loglevel', 'error',
            '-hwaccel', 'cuda', '-i', str(source),
            '-vf', gpu_filter,
            '-c:v', 'h264_nvenc', '-preset', 'p4', '-tune', 'hq', '-rc', 'vbr', '-cq', '20',
            '-b:v', '0', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '192k',
            str(target)
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
            if result.returncode == 0 and target.exists() and target.stat().st_size > 0:
                return True
            if target.exists():
                target.unlink()
        except Exception:
            if target.exists():
                target.unlink()
    return False


def _upscale_video_rawpipe(source: Path, target: Path, scale: int, src_w: int, src_h: int, target_w: int, target_h: int, fps: float) -> bool:
    """
    ffmpeg 解码 rawvideo 管道 → Python 批量 GPU 放大 → ffmpeg NVENC 编码。
    批量处理 8 帧/次，减少 CPU↔GPU 往返，充分压榨显卡算力。
    """
    frame_bytes = src_w * src_h * 3
    batch_capacity = 8
    ff = FFMPEG or _resolve_ffmpeg()

    decode_cmd = [
        ff, '-hide_banner', '-loglevel', 'error',
        '-i', str(source),
        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-an', '-'
    ]
    encode_cmd = [
        ff, '-y', '-hide_banner', '-loglevel', 'error',
        '-f', 'rawvideo', '-pix_fmt', 'rgb24',
        '-s', f'{target_w}x{target_h}', '-r', f'{fps:.3f}',
        '-i', '-',
        '-c:v', 'h264_nvenc', '-preset', 'p4', '-tune', 'hq', '-rc', 'vbr', '-cq', '20',
        '-b:v', '0', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        str(target)
    ]

    decoder = subprocess.Popen(decode_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    # 提取原始音频用于后续合并
    audio_path = target.with_suffix('.aac')
    has_audio = False
    try:
        audio_result = subprocess.run(
            [ff, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(source), '-vn', '-c:a', 'aac', '-b:a', '192k', str(audio_path)],
            capture_output=True, text=True, timeout=120
        )
        has_audio = audio_result.returncode == 0 and audio_path.exists() and audio_path.stat().st_size > 0
    except Exception:
        pass

    # 如果有音频，编码命令加上音频输入
    if has_audio:
        encode_cmd = [
            ff, '-y', '-hide_banner', '-loglevel', 'error',
            '-f', 'rawvideo', '-pix_fmt', 'rgb24',
            '-s', f'{target_w}x{target_h}', '-r', f'{fps:.3f}',
            '-i', '-',
            '-i', str(audio_path),
            '-c:v', 'h264_nvenc', '-preset', 'p4', '-tune', 'hq', '-rc', 'vbr', '-cq', '20',
            '-b:v', '0', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-b:a', '192k', '-shortest',
            str(target)
        ]

    encoder = subprocess.Popen(encode_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

    try:
        batch_frames: list[np.ndarray] = []
        while True:
            raw = decoder.stdout.read(frame_bytes)
            if len(raw) < frame_bytes:
                break
            frame = np.frombuffer(raw, dtype=np.uint8).reshape((src_h, src_w, 3))
            batch_frames.append(frame)
            if len(batch_frames) >= batch_capacity:
                # 批量提交 GPU 放大
                upscaled = upscale_batch(batch_frames, scale)
                for up_frame in upscaled:
                    encoder.stdin.write(up_frame.tobytes())
                batch_frames.clear()

        # 处理剩余帧
        if batch_frames:
            upscaled = upscale_batch(batch_frames, scale)
            for up_frame in upscaled:
                encoder.stdin.write(up_frame.tobytes())
            batch_frames.clear()

        encoder.stdin.close()
        encoder.wait(timeout=300)
        success = encoder.returncode == 0 and target.exists() and target.stat().st_size > 0
    except Exception:
        success = False
    finally:
        if decoder.poll() is None:
            decoder.kill()
            decoder.wait()
        if encoder.poll() is None:
            encoder.kill()
            encoder.wait()
        if has_audio and audio_path.exists():
            try:
                audio_path.unlink()
            except Exception:
                pass

    return success


def upscale_video(source: Path, output_dir: Path, scale: int) -> Path:
    """
    视频超分三级策略（全部优先使用 GPU）：
    1. 纯 ffmpeg CUDA 硬件管线（解码→放大→编码全在 GPU，CPU 几乎不参与）
    2. rawvideo 管道 + PyTorch 批量 GPU 放大 + NVENC 编码
    3. moviepy + PyTorch GPU 逐帧放大 + NVENC/libx264 编码（最终回退）
    """
    src_w, src_h, fps = _probe_dimensions(source)
    max_scale = min(scale, 7680 / max(src_w, src_h))
    target_w = max(2, int(src_w * max_scale) // 2 * 2)
    target_h = max(2, int(src_h * max_scale) // 2 * 2)

    target = unique_path(output_dir, f'{source.stem}_nvidia_{scale}x', '.mp4')

    # 方案 A：纯 ffmpeg CUDA 硬件管线
    if _try_ffmpeg_gpu(source, target, target_w, target_h):
        return target

    # 方案 B：rawvideo 管道 + PyTorch 批量 GPU 放大
    if _upscale_video_rawpipe(source, target, scale, src_w, src_h, target_w, target_h, fps):
        return target

    # 方案 C：moviepy 回退
    try:
        from moviepy import VideoFileClip
    except ImportError:
        from moviepy.editor import VideoFileClip

    clip = VideoFileClip(str(source))

    def transform(get_frame, time_value):
        return upscale_array(get_frame(time_value), scale)

    processed = clip.transform(transform) if hasattr(clip, 'transform') else clip.fl(transform)
    common = dict(audio_codec='aac', fps=clip.fps, preset='medium', threads=4, logger=None)
    try:
        processed.write_videofile(str(target), codec='h264_nvenc', ffmpeg_params=['-cq', '18'], **common)
    except Exception:
        if target.exists():
            target.unlink()
        processed.write_videofile(str(target), codec='libx264', **common)
    processed.close()
    clip.close()
    return target


def extract_audio(source: Path, output_dir: Path, output_format: str) -> Path:
    try:
        from moviepy import VideoFileClip
    except ImportError:
        from moviepy.editor import VideoFileClip
    clip = VideoFileClip(str(source))
    if clip.audio is None:
        clip.close()
        raise RuntimeError('所选视频没有可分离的音轨')
    suffix = '.mp3' if output_format == 'mp3' else '.wav'
    target = unique_path(output_dir, f'{source.stem}_audio', suffix)
    codec = 'libmp3lame' if output_format == 'mp3' else 'pcm_s16le'
    clip.audio.write_audiofile(str(target), codec=codec, logger=None)
    clip.close()
    return target


def main():
    global FFMPEG, FFPROBE
    FFMPEG = _resolve_ffmpeg()
    FFPROBE = _resolve_ffprobe()
    config_path = Path(sys.argv[1])
    config = json.loads(config_path.read_text(encoding='utf-8'))
    try:
        config_path.unlink(missing_ok=True)
    except Exception:
        pass
    source = Path(config['file'])
    output_dir = Path(config['outputDir'])
    output_dir.mkdir(parents=True, exist_ok=True)
    action = config['action']

    if action == 'upscale':
        if not torch.cuda.is_available():
            raise RuntimeError('未检测到可用的 NVIDIA CUDA 显卡，无法执行 GPU 高清放大')
        scale = int(config.get('scale', 2))
        target = upscale_image(source, output_dir, scale) if config.get('kind') == 'image' else upscale_video(source, output_dir, scale)
        message = f'NVIDIA GPU {scale}x 高清放大完成'
    elif action == 'extract-audio':
        target = extract_audio(source, output_dir, config.get('format', 'wav'))
        message = '视频音轨分离完成'
    else:
        raise RuntimeError(f'未知媒体操作：{action}')

    print(json.dumps({'success': True, 'outputPaths': [str(target)], 'message': message}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'success': False, 'error': str(error)}, ensure_ascii=False))
        sys.exit(1)
