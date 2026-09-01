/**
 * 位置标注图生成(人物字母 + 彩色边框) — 渲染层 canvas 绘制,经
 * host.saveDataImage 落盘后作为云图生成参考图之一。
 */
import type { RsBbox } from "../../shared/replacement-studio";

export type RsGuideBox = {
  letter: string;
  bbox: RsBbox;
  name: string | null;
};

const GUIDE_COLORS = [
  "#ff3b30",
  "#0a84ff",
  "#30d158",
  "#ffd60a",
  "#bf5af2",
  "#ff9f0a",
  "#64d2ff",
  "#ff375f",
];

export const GUIDE_LETTERS = "ABCDEFGH";

export function guideColor(index: number): string {
  return GUIDE_COLORS[index % GUIDE_COLORS.length] ?? GUIDE_COLORS[0]!;
}

export function guideBoxesForCharacters(
  characters: { label: string; bbox: RsBbox; targetCharacterId?: string | null }[],
): RsGuideBox[] {
  return characters.map((c, index) => {
    const letter = c.label.replace(/^人物/, "") || (GUIDE_LETTERS[index] ?? "A");
    const targetName = c.targetCharacterId ? "目标形象" : null;
    return { letter, bbox: c.bbox, name: targetName };
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片加载失败"));
    image.src = source;
  });
}

/** 把图片 + 标注框画成一张 PNG data URL。 */
export async function renderGuideImage(options: {
  imageDataUrl: string;
  boxes: RsGuideBox[];
  maxWidth?: number;
}): Promise<string> {
  const { imageDataUrl, boxes } = options;
  const maxWidth = Math.max(256, Math.min(1600, options.maxWidth ?? 1536));
  const image = await loadImage(imageDataUrl);
  const scale = Math.min(1, maxWidth / Math.max(1, image.naturalWidth));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");
  ctx.drawImage(image, 0, 0, width, height);

  boxes.forEach((box, index) => {
    const color = guideColor(index);
    const x = box.bbox.x * width;
    const y = box.bbox.y * height;
    const w = box.bbox.w * width;
    const h = box.bbox.h * height;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.14;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.lineWidth = Math.max(2, Math.round(width / 640));
    ctx.strokeStyle = color;
    ctx.strokeRect(x, y, w, h);

    // 字母标牌(左上角):白底/彩边 + 字母 + 参考名
    const fontSize = Math.max(14, Math.round(width / 52));
    ctx.font = `700 ${fontSize}px system-ui, "Microsoft YaHei", sans-serif`;
    const label = `${box.letter}${box.name ? `·${box.name}` : ""}`;
    const metrics = ctx.measureText(label);
    const pad = Math.max(4, Math.round(fontSize / 4));
    const badgeW = metrics.width + pad * 2;
    const badgeH = fontSize + pad * 2;
    const badgeX = Math.max(0, Math.min(width - badgeW, x));
    const badgeY = Math.max(0, y - badgeH - 4);
    ctx.fillStyle = "rgba(12, 12, 14, 0.85)";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fillText(label, badgeX + pad, badgeY + fontSize + pad / 2);
  });

  return canvas.toDataURL("image/png");
}
