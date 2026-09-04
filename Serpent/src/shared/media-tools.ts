/**
 * 媒体工具(轻量工具坊)— 宫格/拼图/图像对比/白板 shared model & pure helpers.
 *
 * 对齐 ShuoCanvas 的宫格节点、拼图节点、图像对比、白板节点:
 *   - 宫格节点:批量组织和拆解分镜(3×3 等分 + 可指定 cell);
 *   - 拼图节点:自由组合多张图片(本模块提供槽位布局数学);
 *   - 图像对比:框选 2 个以上图像,点击素材设置位置(主图 + 缩略图);
 *   - 白板节点:草图、标注与创意协作(笔画模型 + 缩放/边界计算)。
 *
 * 本模块只包含纯函数与类型;宿主工具调用(mt:split-grid / mt:stitch-grid /
 * mt:save-annotation)由 YUH 主进程代理既有 utilities:* 能力。
 */

// ---------------------------------------------------------------------------
// 宫格
// ---------------------------------------------------------------------------

/** 归一化矩形(0..1):x/y 为左上角,w/h 为宽高。 */
export type NormalizedRect = { x: number; y: number; w: number; h: number };

/** 宫格单元(归一化)。 */
export type GridCell = NormalizedRect & { row: number; col: number; index: number };

/** 生成 rows×cols 宫格的归一化单元列表(index = row*cols+col 顺序)。 */
export function gridCells(rows: number, cols: number): GridCell[] {
  const safeRows = Math.max(1, Math.min(16, Math.round(rows) || 1));
  const safeCols = Math.max(1, Math.min(16, Math.round(cols) || 1));
  const cells: GridCell[] = [];
  for (let row = 0; row < safeRows; row += 1) {
    for (let col = 0; col < safeCols; col += 1) {
      cells.push({
        row,
        col,
        index: row * safeCols + col,
        x: col / safeCols,
        y: row / safeRows,
        w: 1 / safeCols,
        h: 1 / safeRows,
      });
    }
  }
  return cells;
}

/** 指定行/列的单元(越界返回 null)。 */
export function gridCell(rows: number, cols: number, row: number, col: number): GridCell | null {
  const cells = gridCells(rows, cols);
  return cells.find((cell) => cell.row === row && cell.col === col) || null;
}

/** 按序号取单元(宫格「拆解第 N 格」)。 */
export function gridCellByIndex(rows: number, cols: number, index: number): GridCell | null {
  const cells = gridCells(rows, cols);
  return cells[index] || null;
}

/** 归一化单元 → 像素矩形(供切片工具使用,自动钳制到图像内)。 */
export function cellToPixels(
  cell: NormalizedRect,
  imageWidth: number,
  imageHeight: number,
): { left: number; top: number; width: number; height: number } {
  const width = Math.max(1, Math.round(cell.w * imageWidth));
  const height = Math.max(1, Math.round(cell.h * imageHeight));
  return {
    left: Math.max(0, Math.min(imageWidth - 1, Math.round(cell.x * imageWidth))),
    top: Math.max(0, Math.min(imageHeight - 1, Math.round(cell.y * imageHeight))),
    width: Math.min(width, Math.max(1, imageWidth)),
    height: Math.min(height, Math.max(1, imageHeight)),
  };
}

/** 归一化矩形钳制(非法值修正,保证 0..1 且 w/h>0)。 */
export function normalizeRect(rect: NormalizedRect): NormalizedRect {
  const x = Number.isFinite(rect.x) ? Math.max(0, Math.min(1, rect.x)) : 0;
  const y = Number.isFinite(rect.y) ? Math.max(0, Math.min(1, rect.y)) : 0;
  const w = Number.isFinite(rect.w) ? Math.max(0.02, Math.min(1 - x, rect.w)) : 1;
  const h = Number.isFinite(rect.h) ? Math.max(0.02, Math.min(1 - y, rect.h)) : 1;
  return { x, y, w, h };
}

/** 与选区矩形相交的宫格单元(单元中心点落入矩形内即选中)。 */
export function cellsInRect(cells: GridCell[], rect: NormalizedRect): GridCell[] {
  const r = normalizeRect(rect);
  const right = r.x + r.w;
  const bottom = r.y + r.h;
  return cells.filter((cell) => {
    const cx = cell.x + cell.w / 2;
    const cy = cell.y + cell.h / 2;
    return cx >= r.x && cx <= right && cy >= r.y && cy <= bottom;
  });
}

/** 宫格选区矩形(归一化,拖拽起点→终点,自动翻转)。 */
export function selectionRect(from: { x: number; y: number }, to: { x: number; y: number }): NormalizedRect {
  return normalizeRect({
    x: Math.min(from.x, to.x),
    y: Math.min(from.y, to.y),
    w: Math.abs(to.x - from.x),
    h: Math.abs(to.y - from.y),
  });
}

// ---------------------------------------------------------------------------
// 拼图
// ---------------------------------------------------------------------------

/** 拼图槽位(归一化):N 张图自动布局为近方形网格。 */
export type CollageSlot = NormalizedRect & { index: number };

/**
 * 根据图片数量计算拼图槽位布局:
 * 列数 = ceil(sqrt(count)),行数按列数铺满,最后一行靠左对齐。
 */
export function collageSlots(count: number): CollageSlot[] {
  const safeCount = Math.max(1, Math.min(12, Math.round(count) || 1));
  const cols = Math.ceil(Math.sqrt(safeCount));
  const rows = Math.ceil(safeCount / cols);
  const slots: CollageSlot[] = [];
  for (let index = 0; index < safeCount; index += 1) {
    const row = Math.floor(index / cols);
    const col = index % cols;
    slots.push({
      index,
      x: col / cols,
      y: row / rows,
      w: 1 / cols,
      h: 1 / rows,
    });
  }
  return slots;
}

// ---------------------------------------------------------------------------
// 图像对比
// ---------------------------------------------------------------------------

/**
 * 对比布局:index 0 为主图(点击后),其余为可点击缩略图。
 * 点击缩略图 i 后,该图成为新主图,原主图排到其原位置之后。
 */
export function compareOrderAfterClick(count: number, clicked: number): number[] {
  const safeCount = Math.max(2, Math.round(count) || 2);
  const safeClicked = Math.max(0, Math.min(safeCount - 1, Math.round(clicked) || 0));
  const order: number[] = [];
  order.push(safeClicked);
  for (let index = 0; index < safeCount; index += 1) {
    if (index !== safeClicked) order.push(index);
  }
  return order;
}

// ---------------------------------------------------------------------------
// 白板
// ---------------------------------------------------------------------------

export type WbTool = "pen" | "eraser" | "arrow";

export type WbPoint = { x: number; y: number };

export type WbStroke = {
  id: string;
  tool: WbTool;
  color: string;
  width: number;
  /** 归一化坐标点集(相对画布宽高,0..1)。 */
  points: WbPoint[];
};

export type WbBounds = { x: number; y: number; w: number; h: number };

/** 全部笔画的外接边界(归一化);无笔画返回 null。 */
export function strokeBounds(strokes: WbStroke[]): WbBounds | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const stroke of strokes) {
    for (const point of stroke.points) {
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      if (point.x < minX) minX = point.x;
      if (point.y < minY) minY = point.y;
      if (point.x > maxX) maxX = point.x;
      if (point.y > maxY) maxY = point.y;
    }
  }
  if (!Number.isFinite(minX)) return null;
  return {
    x: minX,
    y: minY,
    w: Math.max(0.001, maxX - minX),
    h: Math.max(0.001, maxY - minY),
  };
}

/** 笔画从一块归一化画布缩放到另一块(坐标系变化,如导出/回放)。 */
export function rescaleStrokes(strokes: WbStroke[], to: WbBounds): WbStroke[] {
  const bounds = strokeBounds(strokes);
  if (!bounds) return [];
  const sx = to.w / bounds.w;
  const sy = to.h / bounds.h;
  const scale = Math.min(sx, sy);
  return strokes.map((stroke) => ({
    ...stroke,
    points: stroke.points.map((point) => ({
      x: to.x + (point.x - bounds.x) * scale,
      y: to.y + (point.y - bounds.y) * scale,
    })),
  }));
}

/** 笔画点集钳制到 0..1(手写输入防越界)。 */
export function clampStrokePoints(points: WbPoint[]): WbPoint[] {
  return points.map((point) => ({
    x: Number.isFinite(point.x) ? Math.max(0, Math.min(1, point.x)) : 0,
    y: Number.isFinite(point.y) ? Math.max(0, Math.min(1, point.y)) : 0,
  }));
}
