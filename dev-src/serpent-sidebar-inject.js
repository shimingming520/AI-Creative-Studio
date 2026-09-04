/* eslint-disable */
// 该文件由主进程通过 executeJavaScript 注入 legacy renderer（页面主世界）。
// 职责：
//   1) 在左侧导航（aside.left-rail > nav）中动态插入“资源管理”入口按钮；
//   2) 点击时切换 Serpent 嵌入视图（window.h3.serpent.toggle）；
//   3) 点击其它导航按钮时自动隐藏 Serpent 视图（切回 YUH）；
//   4) 上报侧边栏实测布局（railWidth / bodyTop）供主进程定位嵌入视图；
//   5) 订阅 Serpent 状态并同步按钮 active / 快捷面板状态；
//   6) 高亮互斥：Serpent 可见时清除其它 YUH 标签的选中态（含 React 重渲染
//      重新刷回来的），隐藏后全无选中时补回原标签，保证导航恰好一个高亮；
//   7) 弹层让位：页面出现设置等全屏弹层时自动隐藏 Serpent（避免弹层被
//      嵌入视图压住而“看不到”），弹层关闭后若仍在原视图则自动恢复 Serpent，
//      保持停留在资源管理。
(() => {
  "use strict";
  const NS = "__yuhSerpentSidebar";
  if (window[NS]) return;
  window[NS] = true;

  const api = () => (window.h3 && window.h3.serpent) || null;

  const ENTRY_CLASS = "yuh-serpent-entry";
  const REPLACEMENT_ENTRY_CLASS = "yuh-replacement-entry";
  // 后续嵌入子视图入口(剧本工作室 / 媒体工具)共用类,与资源管理区分高亮。
  const STUDIO_ENTRY_CLASS = "yuh-studio-entry";
  // 图标：近似 lucide “library-big”（两侧书本造型的档案库）
  const ICON_LIBRARY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>' +
    '<path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' +
    "</svg>";
  // 图标：近似 lucide “repeat-2”（交换箭头）
  const ICON_SWAP_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<path d="m2 9 3-3 3 3"/><path d="M13 18H7a2 2 0 0 1-2-2V6"/><path d="m22 15-3 3-3-3"/><path d="M11 6h6a2 2 0 0 1 2 2v10"/>' +
    "</svg>";
  // 图标：近似 lucide “clapperboard”（剧本/分镜）
  const ICON_SCRIPT_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<path d="M20.2 6c-1.1-1.3-2.4-2.5-3.6-3.7l-12.9 7.5 3.5 3.5"/>' +
    '<path d="M20.2 6 4 22.2c-.4-.4-2-1.9-2.8-3l-1-1.2c-.6-.8.2-1.7 1-1.1l1.1.9c1 .8 2.1 1.7 2.8 3"/>' +
    '<path d="M20.2 6c.7.7 1.3 1.6 1.8 2.7l-14.5 8"/><path d="M10 11.5 13 15"/>' +
    "</svg>";
  // 图标：近似 lucide “layout-grid”（宫格/媒体工具）
  const ICON_TOOLS_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>' +
    '<rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>' +
    "</svg>";
  // 图标：近似 lucide “mic”（语音工作室）
  const ICON_VOICE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>' +
    '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>' +
    "</svg>";

  // 当前打开的嵌入子视图 id(null = 资源库视图);各子视图与资源管理互斥高亮。
  let activeSubView = null;

  // 注入按钮样式（尽力对齐 .left-rail button 视觉；避免直接改原版 CSS 文件）
  function ensureStyles() {
    const id = "yuh-serpent-entry-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent =
      "aside.left-rail button." + ENTRY_CLASS + " svg, " +
      "aside.left-rail button." + REPLACEMENT_ENTRY_CLASS + " svg, " +
      "aside.left-rail button." + STUDIO_ENTRY_CLASS + " svg { width: 18px; height: 18px; " +
      "flex: 0 0 18px; }" +
      "aside.left-rail button." + ENTRY_CLASS + ".busy, " +
      "aside.left-rail button." + REPLACEMENT_ENTRY_CLASS + ".busy, " +
      "aside.left-rail button." + STUDIO_ENTRY_CLASS + ".busy { opacity: .55; pointer-events: none; }" +
      "aside.left-rail button." + ENTRY_CLASS + ":disabled, " +
      "aside.left-rail button." + REPLACEMENT_ENTRY_CLASS + ":disabled, " +
      "aside.left-rail button." + STUDIO_ENTRY_CLASS + ":disabled { opacity: .45; }" +
      "aside.left-rail button." + ENTRY_CLASS + " span, " +
      "aside.left-rail button." + REPLACEMENT_ENTRY_CLASS + " span, " +
      "aside.left-rail button." + STUDIO_ENTRY_CLASS + " span { pointer-events: none; }";
    document.head.appendChild(style);
  }

  function makeEntryButton(config) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = config.cls;
    btn.dataset.entry = config.dataEntry;
    btn.dataset.entryLabel = config.label;
    btn.title = config.title;
    btn.innerHTML = config.icon + "<span>" + config.label + "</span>";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const a = api();
      if (!a) return;
      if (btn.classList.contains("busy")) return;
      btn.classList.add("busy");
      Promise.resolve(config.onClick(a, btn))
        .catch(() => {})
        .finally(() => btn.classList.remove("busy"));
    });
    return btn;
  }

  // 子视图入口统一点击行为:
  //   再次点击当前子视图 → 收起 Serpent 视图(回到 YUH 原界面);
  //   点击其它子视图 → openView(viewId) 切换(不收起 Serpent)。
  function subViewClick(viewId) {
    return function (a, btn) {
      if (activeSubView === viewId) {
        activeSubView = null;
        setEntryActive(btn, false);
        return a.hide ? a.hide() : undefined;
      }
      const open = a.openView
        ? a.openView(viewId)
        : a.show
          ? a.show()
          : undefined;
      return Promise.resolve(open).then((ok) => {
        activeSubView = Boolean(ok) ? viewId : null;
        syncButtons();
      });
    };
  }

  function entryConfigs() {
    return [
      {
        cls: STUDIO_ENTRY_CLASS,
        dataEntry: "storyboard-script",
        title: "剧本工作室",
        label: "剧本工作室",
        icon: ICON_SCRIPT_SVG,
        onClick: subViewClick("storyboard-script"),
      },
      {
        cls: STUDIO_ENTRY_CLASS,
        dataEntry: "media-tools",
        title: "媒体工具",
        label: "媒体工具",
        icon: ICON_TOOLS_SVG,
        onClick: subViewClick("media-tools"),
      },
      {
        cls: STUDIO_ENTRY_CLASS,
        dataEntry: "voice-studio",
        title: "语音工作室",
        label: "语音工作室",
        icon: ICON_VOICE_SVG,
        onClick: subViewClick("voice-studio"),
      },
      {
        cls: REPLACEMENT_ENTRY_CLASS,
        dataEntry: "replacement-studio",
        title: "替换工作室",
        label: "替换工作室",
        icon: ICON_SWAP_SVG,
        // 与其它子视图不同:替换工作室 always-open(幂等)。
        // 原因:Serpent 渲染层可能因重载/崩溃重置视图状态,若沿用
        // “再点一次=收起”的切换语义,页面重载后点按钮会变成隐藏。
        onClick(a) {
          activeSubView = "replacement-studio";
          const open = a.openView
            ? a.openView("replacement-studio")
            : a.show
              ? a.show()
              : undefined;
          return Promise.resolve(open).then((ok) => {
            activeSubView = Boolean(ok) ? "replacement-studio" : null;
            syncButtons();
          });
        },
      },
      {
        cls: ENTRY_CLASS,
        dataEntry: "serpent",
        title: "资源管理（Serpent 素材库）",
        label: "资源管理",
        icon: ICON_LIBRARY_SVG,
        onClick(a) {
          if (activeSubView) {
            // 子视图已打开：切回资源库视图（保持 Serpent 可见）。
            activeSubView = null;
            const close = a.openView ? a.openView("serpent") : null;
            return Promise.resolve(close).then((ok) => {
              if (!ok) activeSubView = null;
              syncButtons();
            });
          }
          return a.toggle ? a.toggle() : undefined;
        },
      },
    ];
  }

  function ensureEntries() {
    const nav = document.querySelector("aside.left-rail nav");
    if (!nav) return [];
    const created = [];
    for (const config of entryConfigs()) {
      let btn = nav.querySelector("." + config.cls);
      if (!btn) {
        btn = makeEntryButton(config);
        // 插入到“无限画布”之后、rail-divider（实用工具分组线）之前：
        // 各工作室入口在资源管理上方，资源管理保持最后一位。
        const divider = nav.querySelector(".rail-divider");
        if (divider && divider.parentNode === nav) {
          nav.insertBefore(btn, divider);
        } else {
          nav.appendChild(btn);
        }
      }
      created.push(btn);
    }
    return created;
  }

  /** 当前 Serpent 内各入口按钮(按 dataEntry 索引)。 */
  function entryMap() {
    const map = {};
    for (const btn of ensureEntries()) map[btn.dataset.entry] = btn;
    return map;
  }

  /** 是否为本脚本注入的侧栏按钮(高亮互斥时跳过)。 */
  function isOwnEntryBtn(btn) {
    return Boolean(
      btn &&
        (btn.classList.contains(ENTRY_CLASS) ||
          btn.classList.contains(REPLACEMENT_ENTRY_CLASS) ||
          btn.classList.contains(STUDIO_ENTRY_CLASS)),
    );
  }

  let syncingActive = false; // 当前 Serpent 视图是否可见（高亮互斥依据）
  let lastYuhActiveButton = null; // 进入 Serpent 前由 React 选中的 YUH 标签
  let underlyingTabButton = null; // 进入 Serpent 前的 YUH 标签（弹层恢复用）
  let autoHiddenForOverlay = false; // 因 YUH 弹层而隐藏（关闭后需自动恢复）
  let autoHiddenRestoreTimer = null; // 弹层关闭后的延迟复查定时器

  function setEntryActive(btn, active) {
    if (btn) btn.classList.toggle("active", Boolean(active));
  }

  function syncButtons() {
    const entries = entryMap();
    const resourceBtn = entries.serpent;
    for (const [entryId, btn] of Object.entries(entries)) {
      if (entryId === "serpent") continue;
      setEntryActive(btn, syncingActive && activeSubView === entryId);
    }
    setEntryActive(resourceBtn, syncingActive && !activeSubView);
    // 「资源管理」永远可点击。onClick 对 activeSubView 已单独处理：子视图打开
    // 时点击会回到资源库视图（openView("serpent")）。之前这里在子视图打开时把
    // 按钮置为 disabled，导致「点替换工作室/剧本工作室后无法再点资源管理」。
    if (resourceBtn) {
      resourceBtn.disabled = false;
    }
  }

  function clearOtherActiveButtons(resetRecord) {
    const nav = document.querySelector("aside.left-rail nav");
    if (!nav) return;
    if (resetRecord) lastYuhActiveButton = null;
    for (const button of nav.querySelectorAll("button")) {
      if (isOwnEntryBtn(button)) continue;
      if (button.classList.contains("active")) {
        if (!lastYuhActiveButton) lastYuhActiveButton = button;
        button.classList.remove("active");
      }
    }
  }

  function restoreUndecoratedTab() {
    // Serpent 已隐藏且没有 YUH 标签处于选中态时，补回之前记录的选中标签，
    // 让导航栏总是恰好有一个选中项（与底层 React 视图一致）。
    if (syncingActive) return;
    const nav = document.querySelector("aside.left-rail nav");
    if (!nav) return;
    const yuhButtons = [...nav.querySelectorAll("button")].filter(
      (b) => !isOwnEntryBtn(b),
    );
    const hasActive = yuhButtons.some((b) => b.classList.contains("active"));
    if (
      !hasActive &&
      lastYuhActiveButton &&
      lastYuhActiveButton.isConnected &&
      lastYuhActiveButton.parentNode === nav
    ) {
      lastYuhActiveButton.classList.add("active");
    }
    lastYuhActiveButton = null;
  }

  function enforceSingleActive() {
    if (syncingActive) clearOtherActiveButtons(false);
    else restoreUndecoratedTab();
  }

  function syncState(state) {
    const entries = entryMap();
    const enabled = Boolean(state && state.enabled);
    const active = Boolean(state && state.visible);
    syncingActive = active;
    if (!active) {
      // Serpent 不可见时子视图必然未打开（隐藏即退出视图）。
      activeSubView = null;
    }
    for (const [entryId, btn] of Object.entries(entries)) {
      if (entryId === "serpent") continue;
      const isOpen = active && activeSubView === entryId;
      btn.classList.toggle("active", isOpen);
      btn.disabled = !enabled;
      btn.title = !enabled
        ? `${btn.dataset.entryLabel || entryId}（Serpent 当前不可用）`
        : isOpen
          ? `${btn.dataset.entryLabel || entryId}（点击收起）`
          : btn.dataset.entryLabel || entryId;
    }
    const resourceBtn = entries.serpent;
    if (resourceBtn) {
      resourceBtn.classList.toggle("active", active && !activeSubView);
      resourceBtn.disabled = !enabled;
      resourceBtn.title = !enabled
        ? "资源管理（Serpent 当前不可用）"
        : active && !activeSubView
          ? "资源管理（点击返回 YUH Studio）"
          : active && activeSubView
            ? "资源管理（点击返回素材库）"
            : "资源管理（Serpent 素材库）";
    }
    if (active) {
      // Serpent 视图接管了内容区：清除其它 YUH 标签的选中态，避免两个
      // 标签同时高亮（YUH 的 React 不知道 Serpent 已被切换进来）。
      clearOtherActiveButtons(true);
      // 记住进入 Serpent 前的 YUH 标签：设置等弹层关闭后可据此回到资源管理。
      underlyingTabButton = lastYuhActiveButton;
    } else {
      // 稍等 60ms 让 React 完成这次导航渲染；若它已给新标签加回 active
      // （例如点了另一个标签），就不用恢复；全无选中时才补回原来的，
      // 覆盖“Serpent 可见时再次点击同一个标签”时 React bailout 的情况。
      setTimeout(restoreUndecoratedTab, 60);
    }
  }

  // 点击任何非 Serpent 导航按钮 → 隐藏 Serpent 视图（切回 YUH）。
  function installNavGuards() {
    document.addEventListener(
      "click",
      (event) => {
        const navBtn = event.target &&
          event.target.closest &&
          event.target.closest("aside.left-rail nav button");
        if (!navBtn) return;
        if (isOwnEntryBtn(navBtn)) return;
        activeSubView = null;
        const a = api();
        if (a) a.hide && a.hide().catch(() => {});
      },
      true, // capture：先于 React 的 onClick 处理
    );
  }

  // 点击“弹层开启器”（顶栏设置齿轮/引擎详情、侧栏底部“软件设置”等）时，
  // 若 Serpent 可见就立即隐藏让位——不等弹层渲染完，保证弹窗一定可见。
  // 同时记录“因弹层隐藏”，弹窗关闭后由 overlay 观察器自动恢复资源管理
  // （状态更新是异步 IPC，可能晚于弹窗首次渲染到达，不能只靠观察器置位）。
  function installModalOpenerGuards() {
    document.addEventListener(
      "click",
      (event) => {
        if (!syncingActive) return;
        const target = event.target;
        if (!target || !target.closest) return;
        const opener = target.closest(
          [
            '.topbar-actions .icon-button[aria-label="软件设置"]',
            ".topbar-actions .engine-pill",
            "button.rail-settings",
            "button.settings-link",
          ].join(","),
        );
        if (!opener) return;
        const a = api();
        if (a) {
          autoHiddenForOverlay = true;
          a.hide && a.hide().catch(() => {});
        }
      },
      true, // capture：先于 React 的 onClick 处理
    );
  }

  // Serpent 视图覆盖整个 YUH 内容区；YUH 的弹层（软件设置、工作区/外部
  // ComfyUI 配置、推理环境详情、各种 modal/backdrop）都渲染在页面里，会被
  // Serpent 压住而“看不到”。页面出现“可见”的全屏弹层时先把 Serpent 隐藏
  // （记录进入 Serpent 前的 YUH 标签）；弹层全部关闭后再自动恢复 Serpent，
  // 让“资源管理”界面保持。若弹层开启期间用户已切换到别的 YUH 标签，则不恢复。
  // 注意：必须按“可见性”判断。keep-alive 视图可能在 DOM 里常驻隐藏的
  // backdrop/modal 元素，若按“是否存在”判断，首次快照即为 true，之后
  // 打开设置时状态无变化，观察器会永远跳过（v2 的回归点）。
  // 弹层识别用类名后缀（backdrop / modal / overlay）而不是固定清单：软件
  // 设置里的“外部 ComfyUI 安装目录 / 工作区与模型目录”会先关掉自身再打开
  // 工作区设置（setup-backdrop/setup-modal），旧清单没收录它，弹层切换时
  // 计数归零、Serpent 被立即重新挂回并盖住弹窗，看起来就是“没有对应的
  // 设置页面”。
  function installOverlayAutoHide() {
    const OVERLAY_CLASS_RE =
      /(?:^|\s)(?:[a-z0-9_-]*(?:backdrop|modal|overlay))(?:\s|$)/i;
    // 画布上的局部浮动层 / 编辑器整页容器：不是需要让位的弹层，出现时若
    // 计数会把 Serpent 误隐藏（打开资源管理后任意一次 DOM 变更就会发生）。
    const OVERLAY_IGNORED_RE =
      /(?:^|\s)(?:annotation-text-overlay|video-editor-overlay)(?:\s|$)/i;
    const isOverlayElement = (el) => {
      const cls = typeof el.className === "string" ? el.className : "";
      if (!cls || OVERLAY_IGNORED_RE.test(cls)) return false;
      return OVERLAY_CLASS_RE.test(cls);
    };
    const visibleOverlayCount = () => {
      let count = 0;
      // 弹层内部的子元素（modal-header/body/title 等）也会匹配，但它们只在
      // 弹层打开时才有可见矩形，不影响计数；关闭状态下匹配命中很少。
      for (const el of document.querySelectorAll(
        "[class*='backdrop'],[class*='modal'],[class*='overlay']",
      )) {
        if (isOverlayElement(el) && el.getClientRects().length > 0) count += 1;
      }
      return count;
    };

    const checkOverlays = () => {
      if (visibleOverlayCount() > 0) {
        // 弹层可见且 Serpent 在 → 让位（幂等，无需状态迁移）。
        if (syncingActive) {
          autoHiddenForOverlay = true;
          void api()?.hide?.().catch(() => {});
        }
        return;
      }
      // 弹层已全部关闭：延迟一帧再复查。弹层之间切换（软件设置 → 工作区
      // 设置）时，若 React 分两次提交，中间一帧可能“无弹层”，直接恢复会把
      // 紧接着出现的弹窗盖住；复查仍无弹层才恢复 Serpent。
      if (!autoHiddenForOverlay || autoHiddenRestoreTimer) return;
      autoHiddenRestoreTimer = setTimeout(() => {
        autoHiddenRestoreTimer = null;
        if (visibleOverlayCount() > 0) return; // 新弹层已打开 → 保持隐藏。
        autoHiddenForOverlay = false;
        const nav = document.querySelector("aside.left-rail nav");
        let activeYuh = null;
        if (nav) {
          for (const button of nav.querySelectorAll("button")) {
            if (isOwnEntryBtn(button)) continue;
            if (button.classList.contains("active")) {
              activeYuh = button;
              break;
            }
          }
        }
        // 仍停留在打开弹层前的那个 YUH 视图（或导航无选中）→ 回到资源管理。
        if (!activeYuh || activeYuh === underlyingTabButton) {
          void api()?.show?.().catch(() => {});
        }
        underlyingTabButton = null;
      }, 80);
    };
    const observer = new MutationObserver(checkOverlays);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function reportLayout() {
    const a = api();
    if (!a || !a.reportLayout) return;
    const rail = document.querySelector("aside.left-rail");
    const body = document.querySelector(".app-body");
    let railWidth = 0;
    let bodyTop = 0;
    let railLeft = 0;
    try {
      if (rail) {
        const r = rail.getBoundingClientRect();
        railWidth = Math.round(r.width);
        railLeft = Math.round(r.left + r.width);
      }
      if (body) {
        bodyTop = Math.round(body.getBoundingClientRect().top);
      }
    } catch {}
    if (railWidth > 0) {
      a.reportLayout({ railWidth, bodyTop, railLeft }).catch(() => {});
    }
  }

  function boot() {
    // 等待 React 完成首屏渲染（nav 出现）
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      const entries = ensureEntries();
      if (entries.length > 0 || tries > 60) {
        clearInterval(timer);
        if (entries.length === 0) return;
        ensureStyles();
        installNavGuards();
        installModalOpenerGuards();
        installOverlayAutoHide();
        reportLayout();
        // React 重渲染可能移除我们的按钮：用 MutationObserver 兜底补回；
        // 同时监听 class 变化，在 Serpent 可见时清除 React 重新刷回来的
        // YUH 标签选中态（低优先级,防抖处理批量变更）。
        const nav = document.querySelector("aside.left-rail nav");
        if (nav) {
          let enforceQueued = false;
          const observer = new MutationObserver(() => {
            ensureEntries();
            if (enforceQueued) return;
            enforceQueued = true;
            setTimeout(() => {
              enforceQueued = false;
              enforceSingleActive();
            }, 0);
          });
          observer.observe(nav, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
          });
        }
        const a = api();
        if (a) {
          try {
            a.onStatus(syncState);
            a.status().then(syncState).catch(() => {});
          } catch {}
        }
        return;
      }
    }, 300);

    window.addEventListener("resize", () => {
      setTimeout(reportLayout, 120);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
