import { describe, expect, it } from "vitest";
import {
  cellToPixels,
  cellsInRect,
  clampStrokePoints,
  collageSlots,
  compareOrderAfterClick,
  gridCell,
  gridCellByIndex,
  gridCells,
  normalizeRect,
  rescaleStrokes,
  selectionRect,
  strokeBounds,
  type WbStroke,
} from "../../src/shared/media-tools";

describe("media-tools / gridCells", () => {
  it("produces rows*cols normalized cells", () => {
    const cells = gridCells(2, 3);
    expect(cells).toHaveLength(6);
    expect(cells[0]).toMatchObject({ row: 0, col: 0, x: 0, y: 0, w: 1 / 3, h: 0.5 });
    expect(cells[5]).toMatchObject({ row: 1, col: 2 });
    expect((cells[5]?.x ?? 0) + (cells[5]?.w ?? 0)).toBeCloseTo(1);
  });

  it("clamps invalid counts and returns at least one cell", () => {
    expect(gridCells(0, 0)).toHaveLength(1);
    expect(gridCells(999, 1)).toHaveLength(16);
  });

  it("gridCell / gridCellByIndex resolve correctly", () => {
    expect(gridCell(3, 3, 1, 1)?.index).toBe(4);
    expect(gridCellByIndex(3, 3, 8)).toMatchObject({ row: 2, col: 2 });
    expect(gridCell(3, 3, 9, 0)).toBeNull();
    expect(gridCellByIndex(3, 3, 99)).toBeNull();
  });
});

describe("media-tools / cellToPixels", () => {
  it("converts normalized cell to pixel rect", () => {
    const rect = cellToPixels({ x: 0.25, y: 0.5, w: 0.25, h: 0.5 }, 400, 200);
    expect(rect).toMatchObject({ left: 100, top: 100, width: 100, height: 100 });
  });

  it("never exceeds image bounds for edge cells", () => {
    const rect = cellToPixels({ x: 0.9, y: 0.9, w: 0.1, h: 0.1 }, 300, 100);
    expect(rect.left + rect.width).toBeLessThanOrEqual(300);
    expect(rect.top + rect.height).toBeLessThanOrEqual(100);
  });
});

describe("media-tools / normalizeRect", () => {
  it("clamps out-of-range coordinates and sizes", () => {
    expect(normalizeRect({ x: -1, y: 2, w: 5, h: -5 })).toMatchObject({ x: 0, y: 1, w: 1, h: 0.02 });
  });

  it("keeps valid rects unchanged", () => {
    expect(normalizeRect({ x: 0.1, y: 0.2, w: 0.3, h: 0.4 })).toMatchObject({
      x: 0.1,
      y: 0.2,
      w: 0.3,
      h: 0.4,
    });
  });
});

describe("media-tools / collageSlots", () => {
  it("lays out 4 images as a 2x2 grid", () => {
    const slots = collageSlots(4);
    expect(slots).toHaveLength(4);
    expect(slots[0]?.w).toBeCloseTo(0.5);
    expect(slots[0]?.h).toBeCloseTo(0.5);
    expect(slots[3]?.x).toBeCloseTo(0.5);
    expect(slots[3]?.y).toBeCloseTo(0.5);
  });

  it("always produces at least one slot and caps at 12", () => {
    expect(collageSlots(0)).toHaveLength(1);
    expect(collageSlots(99)).toHaveLength(12);
  });
});

describe("media-tools / compareOrderAfterClick", () => {
  it("moves clicked image to the front as the main image", () => {
    expect(compareOrderAfterClick(4, 2)).toEqual([2, 0, 1, 3]);
    expect(compareOrderAfterClick(4, 0)).toEqual([0, 1, 2, 3]);
  });

  it("clamps invalid click indexes", () => {
    expect(compareOrderAfterClick(3, 9)).toEqual([2, 0, 1]);
    expect(compareOrderAfterClick(3, -1)).toEqual([0, 1, 2]);
  });
});

describe("media-tools / grid selection", () => {
  it("cellsInRect picks cells whose centers fall inside the rect", () => {
    const cells = gridCells(3, 3);
    // 左侧 1/3 列
    const picked = cellsInRect(cells, { x: 0, y: 0, w: 0.4, h: 1 });
    expect(picked.map((cell) => cell.index)).toEqual([0, 3, 6]);
    // 右上角 1×1 单元
    const corner = cellsInRect(cells, { x: 0.7, y: 0, w: 1, h: 0.4 });
    expect(corner.map((cell) => cell.index)).toEqual([2]);
  });

  it("cellsInRect returns [] for out-of-canvas rects", () => {
    const cells = gridCells(2, 2);
    expect(cellsInRect(cells, { x: 2, y: 2, w: 1, h: 1 })).toEqual([]);
  });

  it("selectionRect normalizes drag direction", () => {
    const rect = selectionRect({ x: 0.9, y: 0.8 }, { x: 0.1, y: 0.2 });
    expect(rect.x).toBeCloseTo(0.1);
    expect(rect.y).toBeCloseTo(0.2);
    expect(rect.w).toBeCloseTo(0.8);
    expect(rect.h).toBeCloseTo(0.6);
  });
});

describe("media-tools / whiteboard strokes", () => {
  const strokes: WbStroke[] = [
    {
      id: "s1",
      tool: "pen",
      color: "#ff0000",
      width: 4,
      points: [
        { x: 0.2, y: 0.2 },
        { x: 0.8, y: 0.8 },
      ],
    },
    {
      id: "s2",
      tool: "arrow",
      color: "#00ff00",
      width: 2,
      points: [
        { x: 0.1, y: 0.9 },
        { x: 0.15, y: 0.95 },
      ],
    },
  ];

  it("computes the union bounds of all strokes", () => {
    const bounds = strokeBounds(strokes);
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeCloseTo(0.1);
    expect(bounds!.y).toBeCloseTo(0.2);
    expect(bounds!.w).toBeCloseTo(0.7);
    expect(bounds!.h).toBeCloseTo(0.75);
  });

  it("returns null for empty strokes", () => {
    expect(strokeBounds([])).toBeNull();
  });

  it("rescales strokes into the target bounds preserving aspect", () => {
    const scaled = rescaleStrokes(strokes, { x: 0, y: 0, w: 1, h: 1 });
    expect(scaled).toHaveLength(2);
    const bounds = strokeBounds(scaled);
    expect(bounds!.x).toBeCloseTo(0);
    expect(bounds!.y).toBeCloseTo(0);
    // 按比例缩放:保持原纵横比,并填充目标盒的一边。
    const aspect = 0.7 / 0.75;
    expect(bounds!.h).toBeCloseTo(1);
    expect(bounds!.w / bounds!.h).toBeCloseTo(aspect);
    expect(bounds!.w).toBeLessThanOrEqual(1 + 1e-6);
  });

  it("clamps stroke points into 0..1", () => {
    const points = clampStrokePoints([
      { x: -2, y: 3 },
      { x: 0.5, y: 0.5 },
      { x: NaN, y: 0.2 },
    ]);
    expect(points[0]).toMatchObject({ x: 0, y: 1 });
    expect(points[1]).toMatchObject({ x: 0.5, y: 0.5 });
    expect(points[2]).toMatchObject({ x: 0, y: 0.2 });
  });
});
