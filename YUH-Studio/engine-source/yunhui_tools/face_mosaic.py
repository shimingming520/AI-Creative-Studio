import json
import os
import sys
from pathlib import Path

import cv2
import numpy as np


def read_image(file_path: str):
    """np.fromfile + imdecode 支持中文路径；失败时回退 PIL，兼容更多格式"""
    try:
        data = np.fromfile(file_path, dtype=np.uint8)
        image = cv2.imdecode(data, cv2.IMREAD_COLOR)
        if image is not None:
            return image
    except Exception:
        pass
    try:
        from PIL import Image
        pil = Image.open(file_path).convert('RGB')
        return cv2.cvtColor(np.array(pil), cv2.COLOR_RGB2BGR)
    except Exception:
        return None


def write_image(file_path: str, image) -> bool:
    suffix = Path(file_path).suffix.lower() or '.png'
    encode_suffix = suffix if suffix in ('.jpg', '.jpeg', '.png', '.webp') else '.png'
    options = [cv2.IMWRITE_JPEG_QUALITY, 96] if encode_suffix in ('.jpg', '.jpeg') else []
    ok, encoded = cv2.imencode(encode_suffix, image, options)
    if not ok:
        return False
    encoded.tofile(file_path)
    return True


def iou(a, b) -> float:
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    left, top = max(ax, bx), max(ay, by)
    right, bottom = min(ax + aw, bx + bw), min(ay + ah, by + bh)
    if right <= left or bottom <= top:
        return 0.0
    inter = (right - left) * (bottom - top)
    union = aw * ah + bw * bh - inter
    return inter / union if union > 0 else 0.0


def nms(candidates, threshold=0.3):
    """非极大值抑制：按面积从大到小，丢弃与已保留框 IoU 过大的框"""
    kept = []
    for box in sorted(candidates, key=lambda b: b[2] * b[3], reverse=True):
        box = tuple(int(v) for v in box)
        if not any(iou(box, k) > threshold for k in kept):
            kept.append(box)
    return kept


def load_cascade(file_name: str):
    # OpenCV 在 Windows 上无法总是打开包含中文的模型路径。
    # 通过 FileStorage 内存模式加载 XML，保证无论安装目录如何都能便携运行。
    cascade_path = Path(cv2.data.haarcascades) / file_name
    xml_text = cascade_path.read_text(encoding='utf-8')
    storage = cv2.FileStorage(xml_text, cv2.FILE_STORAGE_READ | cv2.FILE_STORAGE_MEMORY)
    cascade = cv2.CascadeClassifier()
    loaded = storage.isOpened() and cascade.read(storage.getFirstTopLevelNode())
    storage.release()
    if not loaded or cascade.empty():
        raise RuntimeError(f'无法加载人脸检测模型：{file_name}')
    return cascade


def detect_faces(gray):
    cascades = [
        load_cascade('haarcascade_frontalface_default.xml'),
        load_cascade('haarcascade_frontalface_alt.xml'),
        load_cascade('haarcascade_frontalface_alt2.xml'),
        load_cascade('haarcascade_profileface.xml'),
    ]
    h, w = gray.shape[:2]
    # 更小的最小检测尺寸（//60），避免漏掉画面中远距离的人脸
    min_side = max(20, min(h, w) // 60)
    candidates = []
    # 三个正脸级联，参数宽松以提高召回率
    for cascade in cascades[:3]:
        candidates.extend(cascade.detectMultiScale(
            gray, scaleFactor=1.08, minNeighbors=3,
            minSize=(min_side, min_side), flags=cv2.CASCADE_SCALE_IMAGE,
        ))
    # 侧脸：原图 + 水平镜像，覆盖左右两个朝向
    profile = cascades[3]
    candidates.extend(profile.detectMultiScale(
        gray, scaleFactor=1.08, minNeighbors=3,
        minSize=(min_side, min_side), flags=cv2.CASCADE_SCALE_IMAGE,
    ))
    flipped = cv2.flip(gray, 1)
    for x, y, fw, fh in profile.detectMultiScale(
        flipped, scaleFactor=1.08, minNeighbors=3,
        minSize=(min_side, min_side), flags=cv2.CASCADE_SCALE_IMAGE,
    ):
        candidates.append((w - x - fw, y, fw, fh))
    return nms(candidates, 0.3)


def pixelate(image, box, block_size: int):
    x, y, w, h = box
    margin_x, margin_y = int(w * .14), int(h * .22)
    x1, y1 = max(0, x - margin_x), max(0, y - margin_y)
    x2, y2 = min(image.shape[1], x + w + margin_x), min(image.shape[0], y + h + margin_y)
    region = image[y1:y2, x1:x2]
    if region.size == 0:
        return
    mosaic_cells = max(4, min(48, int(block_size)))
    small = cv2.resize(region, (mosaic_cells, mosaic_cells), interpolation=cv2.INTER_LINEAR)
    image[y1:y2, x1:x2] = cv2.resize(small, (region.shape[1], region.shape[0]), interpolation=cv2.INTER_NEAREST)


def main():
    config_path = sys.argv[1]
    with open(config_path, 'r', encoding='utf-8') as handle:
        config = json.load(handle)
    output_dir = config['outputDir']
    block_size = max(6, int(config.get('blockSize', 18)))
    os.makedirs(output_dir, exist_ok=True)
    outputs = []
    face_total = 0
    for source in config['files']:
        image = read_image(source)
        if image is None:
            raise RuntimeError(f'无法读取图片：{source}')
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        faces = detect_faces(gray)
        for face in faces:
            pixelate(image, face, block_size)
        source_path = Path(source)
        output_path = str(Path(output_dir) / f'{source_path.stem}_face_mosaic{source_path.suffix or ".png"}')
        if not write_image(output_path, image):
            raise RuntimeError(f'无法保存图片：{output_path}')
        outputs.append(output_path)
        face_total += len(faces)
    print(json.dumps({'success': True, 'outputPaths': outputs, 'faceCount': face_total}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(json.dumps({'success': False, 'error': str(error)}, ensure_ascii=False))
        sys.exit(1)
