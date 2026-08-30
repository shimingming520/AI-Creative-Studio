# -*- coding: utf-8 -*-
"""位图转 SVG 矢量图：kmeans 颜色量化 + 轮廓追踪。
输入：JSON 配置文件路径 { file, outputDir, colors?, detail? }
输出：最后一行打印 JSON { success, outputPaths, colors, error? }
适合扁平风格图片（插画、图标、海报）；照片类图片会得到色块化效果。
"""
import json
import sys
from pathlib import Path

import cv2
import numpy as np


def read_image(file_path: str):
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


def contour_to_path(contour) -> str:
    pts = contour.reshape(-1, 2)
    if len(pts) < 3:
        return ''
    parts = [f'M {int(pts[0][0])} {int(pts[0][1])}']
    for x, y in pts[1:]:
        parts.append(f'L {int(x)} {int(y)}')
    parts.append('Z')
    return ' '.join(parts)


def vectorize(file_path: str, output_path: str, colors: int, detail: float) -> int:
    image = read_image(file_path)
    if image is None:
        raise RuntimeError('无法读取图片')

    # 限制处理尺寸，超大图先降采样加速（SVG 本身是矢量的，视觉损失可忽略）
    h, w = image.shape[:2]
    max_dim = 1600
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        image = cv2.resize(image, (round(w * scale), round(h * scale)), interpolation=cv2.INTER_AREA)
        h, w = image.shape[:2]

    # 双边滤波保边去噪，让色块更干净
    smooth = cv2.bilateralFilter(image, 9, 60, 60)

    # kmeans 颜色量化
    z = smooth.reshape((-1, 3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 24, 1.0)
    k = max(2, min(24, colors))
    _compact, labels, centers = cv2.kmeans(z, k, None, criteria, 4, cv2.KMEANS_PP_CENTERS)
    centers = np.uint8(centers)
    quantized = centers[labels.flatten()].reshape(image.shape)

    # 每个颜色层的面积（用于跳过噪点层、按面积排序）
    flat = labels.flatten()
    areas = [(int((flat == i).sum()), i) for i in range(k)]
    areas.sort(reverse=True)
    min_area = max(24, int(h * w * 0.0002))

    # detail: 0.1~2.0，越小越精细（多边形逼近阈值）
    epsilon = max(0.0005, 0.0012 * detail)

    paths = []
    for area, idx in areas:
        if area < min_area:
            continue
        b, g, r = (int(centers[idx][0]), int(centers[idx][1]), int(centers[idx][2]))
        mask = (labels.reshape(h, w) == idx).astype(np.uint8) * 255
        kernel = np.ones((3, 3), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        contours, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            continue
        # 按轮廓配对内外边界：RETR_CCOMP 下顶层为外轮廓，其子轮廓为孔洞
        layer_paths = []
        for ci, contour in enumerate(contours):
            if cv2.contourArea(contour) < min_area:
                continue
            approx = cv2.approxPolyDP(contour, epsilon * cv2.arcLength(contour, True), True)
            d = contour_to_path(approx)
            if d:
                layer_paths.append(d)
        if layer_paths:
            # evenodd 让孔洞自动镂空
            paths.append((area, f'<path fill="#{r:02x}{g:02x}{b:02x}" fill-rule="evenodd" d="{" ".join(layer_paths)}"/>'))

    paths.sort(key=lambda item: -item[0])
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
        f'viewBox="0 0 {w} {h}">\n' + '\n'.join(p for _a, p in paths) + '\n</svg>\n'
    )
    Path(output_path).write_text(svg, encoding='utf-8')
    return len(paths)


def main() -> None:
    config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    file_path = config['file']
    output_dir = Path(config['outputDir'])
    output_dir.mkdir(parents=True, exist_ok=True)
    colors = int(config.get('colors', 12))
    detail = float(config.get('detail', 1.0))
    stem = Path(file_path).stem
    output_path = output_dir / f'{stem}_vector.svg'
    counter = 1
    while output_path.exists():
        output_path = output_dir / f'{stem}_vector_{counter}.svg'
        counter += 1
    layers = vectorize(file_path, str(output_path), colors, detail)
    print(json.dumps({'success': True, 'outputPaths': [str(output_path)], 'layers': layers}, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({'success': False, 'error': str(exc)}, ensure_ascii=False))
        sys.exit(1)
