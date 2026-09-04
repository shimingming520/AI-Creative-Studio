/**
 * 剧本工作室 · 文案模型选择器(Story Studio home model bar)。
 * 对齐 ShuoCanvas components/aigenText/modelSelector.js::renderAIGenTextModelSelectorMarkup:
 *   - 单个 pill 触发器(图标 badge + 模型名 + caret)
 *   - 以 provider 分组的浮层菜单(组头 + 模型项 + 搜索)
 * 数据来自 Serpent 宿主 listProviders/listModels(按中转站分组)。
 */
import { useMemo, useState } from "react";
import type { SwProviderInfo } from "../storyboard-script/host";

export function TextModelSelector({
  providers,
  modelsByProvider,
  providerId,
  model,
  onSelect,
}: {
  providers: SwProviderInfo[];
  modelsByProvider: Record<string, string[]>;
  providerId: string;
  model: string;
  onSelect: (providerId: string, model: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const currentProvider = providers.find((p) => p.id === providerId);
  const label = model || currentProvider?.name || "选择模型";

  const sections = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("zh-CN");
    return providers
      .map((p) => ({
        provider: p,
        models: (modelsByProvider[p.id] || []).filter((m) => !q || m.toLocaleLowerCase("zh-CN").includes(q)),
      }))
      .filter((s) => s.models.length > 0 || !query.trim());
  }, [providers, modelsByProvider, query]);

  return (
    <div className="aigen-text-model-selector">
      <div className="img-model-wrap">
        <button
          type="button"
          className="img-pill-btn img-model-btn-trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          title={label}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="text-model-icon text-model-icon-badge" aria-hidden="true">OA</span>
          <span className="img-model-label">{label}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="node-menu-caret" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && (
          <div className="floating-menu img-model-menu node-model-menu" role="menu" aria-label="选择文案模型">
            <label className="story-style-search">
              <span aria-hidden="true">⌕</span>
              <input type="search" placeholder="搜索模型" autoComplete="off" value={query} onChange={(ev) => setQuery(ev.target.value)} />
            </label>
            {sections.length === 0 && <div className="node-model-group-header">没有匹配的模型</div>}
            {sections.map(({ provider, models }) => (
              <div key={provider.id} className="node-model-group">
                <div className="node-model-group-header">{provider.name}</div>
                {models.map((m) => (
                  <button
                    type="button"
                    key={m}
                    className={"floating-menu-item node-model-item" + (m === model && provider.id === providerId ? " active" : "")}
                    role="menuitem"
                    onClick={() => {
                      onSelect(provider.id, m);
                      setOpen(false);
                    }}
                  >
                    <span className="node-model-item-label">{m}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
