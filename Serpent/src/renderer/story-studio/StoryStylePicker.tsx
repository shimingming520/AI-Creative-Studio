/**
 * 剧本工作室 · 风格库选择器(Story Studio home model bar)。
 * 对齐 ShuoCanvas storyHomePresentation.js::renderStoryStylePicker:
 *   - trigger(缩略图或 ✦ + 标签 + chevron)
 *   - popover: 风格库 header(标题 + 搜索) + 分类 tabs + 风格 grid(预设卡片 + 自定义卡片)
 */
import { useMemo, useState } from "react";
import {
  STORY_STYLE_CATEGORIES,
  STORY_STYLE_CUSTOM_ID,
  STORY_STYLE_PRESETS,
  type StoryStyleCategoryId,
  type StoryStyleSelection,
  type StoryStylePreset,
} from "./story-studio-data";

export function StoryStylePicker({
  value,
  customPrompt,
  onSelect,
}: {
  value: string;
  customPrompt: string;
  onSelect: (styleId: string, stylePrompt: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<StoryStyleCategoryId>("all");
  const [query, setQuery] = useState("");
  const [draftPrompt, setDraftPrompt] = useState(customPrompt || "");

  const selection: StoryStyleSelection = useMemo(() => {
    const preset = STORY_STYLE_PRESETS.find((p) => p.id === value);
    if (preset) return { styleId: preset.id, stylePrompt: preset.prompt, label: preset.label, thumbnail: preset.thumbnail || "", isCustom: false };
    return { styleId: STORY_STYLE_CUSTOM_ID, stylePrompt: customPrompt, label: customPrompt || "自定义风格提示词", thumbnail: "", isCustom: true };
  }, [value, customPrompt]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("zh-CN");
    return STORY_STYLE_PRESETS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (q && !p.label.toLocaleLowerCase("zh-CN").includes(q)) return false;
      return true;
    });
  }, [category, query]);

  const applyPreset = (preset: StoryStylePreset) => {
    onSelect(preset.id, preset.prompt);
    setOpen(false);
  };
  const applyCustom = (prompt: string) => {
    onSelect(STORY_STYLE_CUSTOM_ID, prompt.trim());
    setOpen(false);
  };

  return (
    <div className="story-home-param-picker story-style-picker">
      <button
        type="button"
        className="story-home-param-trigger story-menu-trigger story-style-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {selection.thumbnail ? (
          <img src={selection.thumbnail} alt="" draggable={false} />
        ) : (
          <span className="story-home-param-icon story-style-custom-icon" aria-hidden="true">✦</span>
        )}
        <span className="story-style-trigger-label">{selection.label}</span>
        <span className="story-home-param-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <section className="story-home-param-popover story-style-popover" role="dialog" aria-label="风格库">
          <div className="story-style-library">
            <div className="story-style-header">
              <div>
                <strong>风格库</strong>
                <small>为后续角色、场景、道具和分集画面统一视觉方向</small>
              </div>
              <label className="story-style-search">
                <span aria-hidden="true">⌕</span>
                <input type="search" placeholder="搜索风格" autoComplete="off" value={query} onChange={(ev) => setQuery(ev.target.value)} />
              </label>
            </div>
            <div className="story-style-tabs" role="tablist">
              {STORY_STYLE_CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={"story-style-tab" + (category === c.id ? " is-active" : "")}
                  role="tab"
                  aria-selected={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="story-style-grid">
              <button
                type="button"
                className={"story-style-card story-style-card--custom" + (selection.isCustom ? " is-selected" : "")}
                onClick={() => setDraftPrompt(selection.isCustom ? selection.stylePrompt : "")}
              >
                <span className="story-style-custom-mark" aria-hidden="true">✦</span>
                <span>自定义风格提示词</span>
              </button>
              {filtered.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  className={"story-style-card" + (value === p.id ? " is-selected" : "")}
                  onClick={() => applyPreset(p)}
                >
                  {p.thumbnail ? (
                    <img className="story-style-card-thumb" src={p.thumbnail} alt="" loading="lazy" />
                  ) : (
                    <span className="story-style-card-thumb story-style-card-thumb--text">{p.label}</span>
                  )}
                  <span className="story-style-card-label">{p.label}</span>
                </button>
              ))}
              {filtered.length === 0 && <span className="story-empty" style={{ gridColumn: "1 / -1", padding: 20 }}>没有匹配的风格。</span>}
            </div>
            <div className="story-style-custom-editor">
              <label className="story-field-label" htmlFor="storyStyleCustomPrompt">自定义风格提示词</label>
              <textarea
                id="storyStyleCustomPrompt"
                className="story-textarea"
                style={{ minHeight: 64, fontSize: 12 }}
                value={draftPrompt}
                placeholder="用一句话描述你想要的视觉风格…"
                onChange={(ev) => setDraftPrompt(ev.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button type="button" className="story-secondary-button" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => setOpen(false)}>
                  取消
                </button>
                <button
                  type="button"
                  className="story-primary-button"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  disabled={!draftPrompt.trim()}
                  onClick={() => applyCustom(draftPrompt)}
                >
                  应用
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
