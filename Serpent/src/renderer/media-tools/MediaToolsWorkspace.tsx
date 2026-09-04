/**
 * 媒体工具(轻量工具坊)— 宫格 / 拼图 / 图像对比 / 白板 工作区。
 *
 *   - 宫格:选择图片 + rows×cols → 拖拽/点选单元 → 导出选中分块(mt:split-grid);
 *   - 拼图:选择 2~6 张图 → 自动槽位预览 → 导出拼接(mt:collage,2 图可选方向);
 *   - 图像对比:选择 2+ 张图 → 点击缩略图切换主图(对齐 ShuoCanvas 素材对比);
 *   - 白板:画笔/箭头/橡皮标注 → 导出 PNG(mt:save-annotation)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cellsInRect,
  clampStrokePoints,
  compareOrderAfterClick,
  gridCells,
  selectionRect,
  strokeBounds,
  type NormalizedRect,
  type WbStroke,
  type WbTool,
} from "../../shared/media-tools";
import { ensureMtHostApi, type MtHostApi, type MtFilePick } from "./host";
import { errorText } from "../replacement-studio/host";
import "./media-tools.css";

type TabKey = "grid" | "collage" | "compare" | "whiteboard";

const TABS: { key: TabKey; label: string }[] = [
  { key: "grid", label: "宫格" },
  { key: "collage", label: "拼图" },
  { key: "compare", label: "图像对比" },
  { key: "whiteboard", label: "白板" },
];

const WB_TOOLS: { key: WbTool; label: string }[] = [
  { key: "pen", label: "画笔" },
  { key: "arrow", label: "箭头" },
  { key: "eraser", label: "橡皮" },
];

function fmtPath(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts.length > 3 ? `…${parts.slice(-3).join("/")}` : path;
}

export function MediaToolsWorkspace({ onExit }: { onExit: () => void }) {
  const [tab, setTab] = useState<TabKey>("grid");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [files, setFiles] = useState<MtFilePick[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string | null>>({});
  const hostRef = useRef<MtHostApi | null>(null);

  // 宿主初始化。
  useEffect(() => {
    let cancelled = false;
    ensureMtHostApi()
      .then((host) => {
        if (cancelled) return;
        hostRef.current = host;
        return host.workspace();
      })
      .then((workspace) => {
        if (!cancelled && workspace?.outputDir) setOutputDir(workspace.outputDir);
      })
      .catch((reason) => {
        if (!cancelled) setError(errorText(reason));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 选择图片(追加)。
  const pickMore = useCallback(async (multiple = true) => {
    try {
      const picked = await hostRef.current?.pickImages(multiple);
      if (picked?.length) {
        setFiles((prev) => [
          ...prev,
          ...picked.filter(
            (item) => !prev.some((existing) => existing.path === item.path),
          ),
        ]);
      }
    } catch (reason) {
      setError(errorText(reason));
    }
  }, []);

  // 缩略图(懒加载)。
  useEffect(() => {
    let cancelled = false;
    for (const item of files) {
      if (item.path in thumbs) continue;
      hostRef.current
        ?.thumbnail(item.path, 320)
        .then((url) => {
          if (!cancelled) setThumbs((prev) => ({ ...prev, [item.path]: url ?? null }));
        })
        .catch(() => {
          if (!cancelled) setThumbs((prev) => ({ ...prev, [item.path]: null }));
        });
    }
    return () => {
      cancelled = true;
    };
  }, [files, thumbs]);

  // ---- 宫格 ----
  const [gridRows, setGridRows] = useState(3);
  const [gridCols, setGridCols] = useState(3);
  const gridCellsList = useMemo(() => gridCells(gridRows, gridCols), [gridRows, gridCols]);
  const gridSource = files[0] ?? null;
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [selRect, setSelRect] = useState<NormalizedRect | null>(null);
  const dragRef = useRef<{ from: { x: number; y: number }; moved: boolean } | null>(null);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setThumbs({});
    setError("");
    setBusy("");
    setSelectedIndexes([]);
    setSelRect(null);
  }, []);

  const gridPoint = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  }, []);

  const toggleCell = useCallback(
    (row: number, col: number) => {
      const cellIndex = row * gridCols + col;
      setSelectedIndexes((prev) =>
        prev.includes(cellIndex) ? prev.filter((i) => i !== cellIndex) : [...prev, cellIndex],
      );
    },
    [gridCols],
  );

  const onGridPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const from = gridPoint(event);
      dragRef.current = { from, moved: false };
      (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    },
    [gridPoint],
  );

  const onGridPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const to = gridPoint(event);
      const dx = Math.abs(to.x - drag.from.x);
      const dy = Math.abs(to.y - drag.from.y);
      if (dx > 0.02 || dy > 0.02) drag.moved = true;
      if (drag.moved) {
        setSelRect(selectionRect(drag.from, to));
      }
    },
    [gridPoint],
  );

  const onGridPointerUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (drag.moved && selRect) {
      setSelectedIndexes(cellsInRect(gridCellsList, selRect).map((cell) => cell.index));
    } else if (!drag.moved) {
      // 单击:命中最近单元 → 切换选区。
      const hit = gridCellsList.find(
        (cell) =>
          drag.from.x >= cell.x &&
          drag.from.x <= cell.x + cell.w &&
          drag.from.y >= cell.y &&
          drag.from.y <= cell.y + cell.h,
      );
      if (hit) toggleCell(hit.row, hit.col);
    }
    setSelRect(null);
  }, [selRect, gridCellsList, toggleCell]);

  const runSplit = useCallback(async () => {
    const host = hostRef.current;
    if (!host || !gridSource) return;
    setBusy("正在导出宫格分块…");
    setError("");
    try {
      const result = await host.splitGrid({
        file: gridSource.path,
        rows: gridRows,
        cols: gridCols,
        outputDir: outputDir || undefined,
        indexes: selectedIndexes.length ? selectedIndexes : undefined,
      });
      setBusy(
        `已导出 ${result.outputPaths.length} 个分块${
          selectedIndexes.length ? `(选中 ${selectedIndexes.length} 格)` : ""
        }`,
      );
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [gridSource, gridRows, gridCols, outputDir, selectedIndexes]);

  // ---- 拼图 ----
  const [collageDirection, setCollageDirection] = useState<"horizontal" | "vertical">(
    "horizontal",
  );
  const collageCount = Math.max(2, Math.min(6, files.length));
  const collagePreviewCols = collageCount === 2 ? collageCount : Math.ceil(Math.sqrt(collageCount));

  const runCollage = useCallback(async () => {
    const host = hostRef.current;
    if (!host || files.length < 2) return;
    setBusy("正在生成拼图…");
    setError("");
    try {
      const result = await host.collage({
        files: files.slice(0, 6).map((item) => item.path),
        direction: collageDirection,
        outputDir: outputDir || undefined,
      });
      setBusy(
        `已导出:${fmtPath(result.outputPaths[0] ?? "")} · ${result.message || ""}`,
      );
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [files, collageDirection, outputDir]);

  // ---- 图像对比 ----
  const compareOrder = useMemo(() => {
    const order: number[] = [];
    for (let index = 0; index < files.length; index += 1) order.push(index);
    return order;
  }, [files.length]);

  const [compareActive, setCompareActive] = useState<number[]>([]);
  const currentCompareOrder = useMemo(
    () => (compareActive.length === files.length ? compareActive : compareOrder),
    [compareActive, compareOrder, files.length],
  );

  const clickCompare = useCallback(
    (fileIndex: number) => {
      const next = compareOrderAfterClick(files.length, fileIndex);
      setCompareActive(next);
    },
    [files.length],
  );

  // ---- 白板 ----
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<WbStroke[]>([]);
  const [penColor, setPenColor] = useState("#ff5c5c");
  const [penWidth, setPenWidth] = useState(4);
  const [wbTool, setWbTool] = useState<WbTool>("pen");
  const drawingRef = useRef<{ stroke: WbStroke } | null>(null);

  const drawArrowHead = useCallback(
    (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);
      const headLen = 12;
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - headLen * Math.cos(angle - Math.PI / 6),
        to.y - headLen * Math.sin(angle - Math.PI / 6),
      );
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - headLen * Math.cos(angle + Math.PI / 6),
        to.y - headLen * Math.sin(angle + Math.PI / 6),
      );
      ctx.stroke();
    },
    [],
  );

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    if (canvas.width !== Math.round(rect.width * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const stroke of strokes) {
      if (stroke.points.length === 0) continue;
      if (stroke.tool === "eraser") {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = stroke.width * 4;
        ctx.beginPath();
        stroke.points.forEach((point, index) => {
          const x = point.x * rect.width;
          const y = point.y * rect.height;
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.restore();
        continue;
      }
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      const px = (point: { x: number; y: number }) => ({
        x: point.x * rect.width,
        y: point.y * rect.height,
      });
      if (stroke.tool === "arrow" && stroke.points.length >= 2) {
        const from = px(stroke.points[0]!);
        const to = px(stroke.points[stroke.points.length - 1]!);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        drawArrowHead(ctx, from, to);
      } else {
        ctx.beginPath();
        stroke.points.forEach((point, index) => {
          const p = px(point);
          if (index === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    }
  }, [strokes, drawArrowHead]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const canvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    };
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      const point = canvasPoint(event);
      const stroke: WbStroke = {
        id: `wb-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
        tool: wbTool,
        color: penColor,
        width: penWidth,
        points: [point],
      };
      drawingRef.current = { stroke };
      setStrokes((prev) => [...prev, stroke]);
      (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
    },
    [canvasPoint, wbTool, penColor, penWidth],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const drawing = drawingRef.current;
      if (!drawing) return;
      const point = canvasPoint(event);
      setStrokes((prev) =>
        prev.map((stroke) =>
          stroke.id === drawing.stroke.id
            ? { ...stroke, points: clampStrokePoints([...stroke.points, point]) }
            : stroke,
        ),
      );
    },
    [canvasPoint],
  );

  const onPointerUp = useCallback(() => {
    drawingRef.current = null;
  }, []);

  const exportWhiteboard = useCallback(async () => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    setBusy("正在导出白板…");
    setError("");
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const result = await host.saveAnnotation({
        dataUrl,
        sourceName: "whiteboard",
        outputDir: outputDir || undefined,
      });
      setBusy(`已导出:${fmtPath(result.outputPaths[0] ?? "")}`);
    } catch (reason) {
      setError(errorText(reason));
    }
  }, [outputDir]);

  return (
    <div className="mt-workspace" role="dialog" aria-label="媒体工具">
      <header className="mt-header">
        <div className="mt-title">
          <h1>媒体工具</h1>
          <span className="mt-subtitle">宫格 · 拼图 · 图像对比 · 白板</span>
        </div>
        <div className="mt-actions">
          <button type="button" className="mt-btn" onClick={() => void pickMore(true)}>
            选择图片
          </button>
          <button type="button" className="mt-btn" onClick={clearFiles} disabled={!files.length}>
            清空
          </button>
          <button type="button" className="mt-btn mt-btn-quiet" onClick={onExit}>
            返回资源库
          </button>
        </div>
      </header>

      <nav className="mt-tabs">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`mt-tab${tab === item.key ? " active" : ""}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="mt-body">
        {tab === "grid" && (
          <div className="mt-pane">
            <div className="mt-controls">
              <label>
                行
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={gridRows}
                  onChange={(event) => {
                    setGridRows(Number(event.target.value) || 1);
                    setSelectedIndexes([]);
                  }}
                />
              </label>
              <label>
                列
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={gridCols}
                  onChange={(event) => {
                    setGridCols(Number(event.target.value) || 1);
                    setSelectedIndexes([]);
                  }}
                />
              </label>
              <button
                type="button"
                className="mt-btn mt-btn-primary"
                onClick={() => void runSplit()}
                disabled={!gridSource}
              >
                导出宫格分块
              </button>
              <button
                type="button"
                className="mt-btn"
                onClick={() => setSelectedIndexes([])}
                disabled={!selectedIndexes.length}
              >
                清除选择
              </button>
              {!gridSource && <span className="mt-hint">先选择一张图片作为宫格源</span>}
              {gridSource && (
                <span className="mt-hint">
                  {selectedIndexes.length
                    ? `已选中 ${selectedIndexes.length} 格(拖拽框选 / 点击切换)`
                    : "拖拽框选或点击选择单元(不选则导出全部)"}
                </span>
              )}
            </div>
            {gridSource && (
              <div
                className="mt-grid-preview"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                  gridTemplateRows: `repeat(${gridRows}, 1fr)`,
                }}
                onPointerDown={onGridPointerDown}
                onPointerMove={onGridPointerMove}
                onPointerUp={onGridPointerUp}
                onPointerLeave={onPointerUp}
              >
                {gridCellsList.map((cell) => (
                  <div
                    className={`mt-grid-cell${
                      selectedIndexes.includes(cell.index) ? " selected" : ""
                    }`}
                    key={cell.index}
                  >
                    {thumbs[gridSource.path] ? (
                      <img
                        src={thumbs[gridSource.path]!}
                        alt=""
                        style={{ objectPosition: `${cell.x * 100}% ${cell.y * 100}%` }}
                      />
                    ) : null}
                    <span className="mt-grid-index">{cell.index + 1}</span>
                  </div>
                ))}
                {selRect && (
                  <div
                    className="mt-grid-select-rect"
                    style={{
                      left: `${selRect.x * 100}%`,
                      top: `${selRect.y * 100}%`,
                      width: `${selRect.w * 100}%`,
                      height: `${selRect.h * 100}%`,
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {tab === "collage" && (
          <div className="mt-pane">
            <div className="mt-controls">
              {collageCount === 2 && (
                <label>
                  方向
                  <select
                    value={collageDirection}
                    onChange={(event) =>
                      setCollageDirection(event.target.value as "horizontal" | "vertical")
                    }
                  >
                    <option value="horizontal">横排</option>
                    <option value="vertical">竖排</option>
                  </select>
                </label>
              )}
              <button
                type="button"
                className="mt-btn mt-btn-primary"
                onClick={() => void runCollage()}
                disabled={files.length < 2}
              >
                导出拼图
              </button>
              <span className="mt-hint">
                支持 2~6 张图({Math.max(0, Math.min(6, files.length))}/6)
                {collageCount > 2 ? " · 自动近方形网格" : ""}
              </span>
            </div>
            <div
              className="mt-collage-preview"
              style={{ gridTemplateColumns: `repeat(${collagePreviewCols}, 1fr)` }}
            >
              {files.slice(0, 6).map((item, index) => (
                <div className="mt-collage-cell" key={item.path}>
                  {thumbs[item.path] ? (
                    <img src={thumbs[item.path]!} alt="" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "compare" && (
          <div className="mt-pane">
            <div className="mt-controls">
              <span className="mt-hint">
                点击下方缩略图切换主图(与 ShuoCanvas 素材对比一致)
              </span>
            </div>
            {currentCompareOrder[0] !== undefined && files[currentCompareOrder[0]] && (
              <div className="mt-compare-main">
                {thumbs[files[currentCompareOrder[0]]!.path] ? (
                  <img src={thumbs[files[currentCompareOrder[0]]!.path]!} alt="" />
                ) : null}
                <span className="mt-compare-label">主图</span>
              </div>
            )}
            <div className="mt-compare-strip">
              {currentCompareOrder.map((fileIndex) => (
                <button
                  key={files[fileIndex]!.path}
                  type="button"
                  className={`mt-compare-thumb${
                    currentCompareOrder[0] === fileIndex ? " active" : ""
                  }`}
                  onClick={() => clickCompare(fileIndex)}
                >
                  {thumbs[files[fileIndex]!.path] ? (
                    <img src={thumbs[files[fileIndex]!.path]!} alt={files[fileIndex]!.name} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "whiteboard" && (
          <div className="mt-pane">
            <div className="mt-controls">
              <div className="mt-wb-tools">
                {WB_TOOLS.map((tool) => (
                  <button
                    key={tool.key}
                    type="button"
                    className={`mt-btn${wbTool === tool.key ? " active" : ""}`}
                    onClick={() => setWbTool(tool.key)}
                  >
                    {tool.label}
                  </button>
                ))}
              </div>
              <label>
                颜色
                <input
                  type="color"
                  value={penColor}
                  onChange={(event) => setPenColor(event.target.value)}
                />
              </label>
              <label>
                粗细
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={penWidth}
                  onChange={(event) => setPenWidth(Number(event.target.value) || 4)}
                />
              </label>
              <button
                type="button"
                className="mt-btn"
                onClick={() => setStrokes([])}
                disabled={!strokes.length}
              >
                清空
              </button>
              <button
                type="button"
                className="mt-btn mt-btn-primary"
                onClick={() => void exportWhiteboard()}
                disabled={!strokes.length}
              >
                导出 PNG
              </button>
              <span className="mt-hint">
                笔画数 {strokes.length}
                {strokeBounds(strokes) ? " · 已归一化存储" : ""}
              </span>
            </div>
            <canvas
              ref={canvasRef}
              className="mt-whiteboard"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>
        )}

        {busy && <p className="mt-busy">{busy}</p>}
        {error && <p className="mt-error">{error}</p>}
      </section>
    </div>
  );
}
