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
  // 图标：近似 lucide “library-big”（两侧书本造型的档案库）
  const ICON_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" width="19" height="19" aria-hidden="true">' +
    '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>' +
    '<path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>' +
    "</svg>";

  // 注入按钮样式（尽力对齐 .left-rail button 视觉；避免直接改原版 CSS 文件）
  function ensureStyles() {
    const id = "yuh-serpent-entry-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent =
      "aside.left-rail button." + ENTRY_CLASS + " svg { width: 18px; height: 18px; " +
      "flex: 0 0 18px; }" +
      "aside.left-rail button." + ENTRY_CLASS + ".busy { opacity: .55; pointer-events: none; }" +
      "aside.left-rail button." + ENTRY_CLASS + ":disabled { opacity: .45; }" +
      "aside.left-rail button." + ENTRY_CLASS + " span { pointer-events: none; }";
    document.head.appendChild(style);
  }

  function makeEntryButton(title) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = ENTRY_CLASS;
    btn.dataset.entry = "serpent";
    btn.title = title || "资源管理（Serpent 素材库）";
    btn.innerHTML = ICON_SVG + "<span>资源管理</span>";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const a = api();
      if (!a) return;
      if (btn.classList.contains("busy")) return;
      btn.classList.add("busy");
      Promise.resolve(a.toggle())
        .catch(() => {})
        .finally(() => btn.classList.remove("busy"));
    });
    return btn;
  }

  function ensureEntry() {
    const nav = document.querySelector("aside.left-rail nav");
    if (!nav) return null;
    let btn = nav.querySelector("." + ENTRY_CLASS);
    if (!btn) {
      btn = makeEntryButton();
      // 插入到“无限画布”之后、rail-divider（实用工具分组线）之前
      const divider = nav.querySelector(".rail-divider");
      if (divider && divider.parentNode === nav) {
        nav.insertBefore(btn, divider);
      } else {
        nav.appendChild(btn);
      }
    }
    return btn;
  }

  let syncingActive = false; // 当前 Serpent 视图是否可见（高亮互斥依据）
  let lastYuhActiveButton = null; // 进入 Serpent 前由 React 选中的 YUH 标签
  let underlyingTabButton = null; // 进入 Serpent 前的 YUH 标签（弹层恢复用）
  let autoHiddenForOverlay = false; // 因 YUH 弹层而隐藏（关闭后需自动恢复）
  let autoHiddenRestoreTimer = null; // 弹层关闭后的延迟复查定时器

  function clearOtherActiveButtons(resetRecord) {
    const nav = document.querySelector("aside.left-rail nav");
    if (!nav) return;
    if (resetRecord) lastYuhActiveButton = null;
    for (const button of nav.querySelectorAll("button")) {
      if (button.classList.contains(ENTRY_CLASS)) continue;
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
      (b) => !b.classList.contains(ENTRY_CLASS),
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
    const btn = ensureEntry();
    if (!btn) return;
    const enabled = Boolean(state && state.enabled);
    const active = Boolean(state && state.visible);
    syncingActive = active;
    btn.classList.toggle("active", active);
    btn.disabled = !enabled;
    btn.title = !enabled
      ? "资源管理（Serpent 当前不可用）"
      : active
        ? "资源管理（点击返回 YUH Studio）"
        : "资源管理（Serpent 素材库）";
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
        if (navBtn.classList.contains(ENTRY_CLASS)) return;
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
            if (button.classList.contains(ENTRY_CLASS)) continue;
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
      const btn = ensureEntry();
      if (btn || tries > 60) {
        clearInterval(timer);
        if (!btn) return;
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
            ensureEntry();
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
