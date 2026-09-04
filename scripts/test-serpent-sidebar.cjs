"use strict";
/**
 * serpent-sidebar-inject.js 状态机回归测试（模拟最小 DOM，运行真实注入脚本）。
 *
 * 覆盖场景：
 *   A. 资源管理（Serpent 可见）→ 点“软件设置” → 弹层流程：
 *      设置弹窗可见期间 Serpent 保持隐藏；
 *      再点“外部 ComfyUI 安装目录”（切换到工作区设置 setup-backdrop）时
 *      Serpent 不得重新出现（本回归的核心：旧清单缺 setup-* 类）；
 *      关闭工作区设置后（无返回目标）自动恢复资源管理。
 *   B. 直接关闭软件设置（app-settings-modal）→ 恢复资源管理。
 *   C. 弹层切换被 React 分两次提交（中间一帧无弹层）→ 不得误恢复。
 *
 * 运行：node scripts/test-serpent-sidebar.cjs
 */
const assert = require("node:assert");
const path = require("node:path");
const fs = require("node:fs");

// ---------------------------------------------------------------- 最小 DOM
class FakeClsList {
  constructor(el) {
    this.el = el;
  }
  _set() {
    return (this.el.className || "").split(/\s+/).filter(Boolean);
  }
  contains(c) {
    return this._set().includes(c);
  }
  add(c) {
    const set = this._set();
    if (!set.includes(c)) {
      set.push(c);
      this.el.className = set.join(" ");
    }
  }
  remove(c) {
    this.el.className = this._set()
      .filter((x) => x !== c)
      .join(" ");
  }
  toggle(c, force) {
    const on = force !== undefined ? force : !this.contains(c);
    if (on) this.add(c);
    else this.remove(c);
    return on;
  }
}

const allElems = [];

class FakeEl {
  constructor(tag, className, id) {
    this.tag = tag || "div";
    this.id = id || "";
    this.className = className || "";
    this.parentNode = null;
    this.children = [];
    this.dataset = {};
    this.isConnected = true;
    this._visible = false;
    this._attrs = {};
    this.innerHTML = "";
    this.title = "";
    this.type = "";
    this.disabled = false;
    this.classList = new FakeClsList(this);
    allElems.push(this);
  }
  getClientRects() {
    return this._visible ? [{ left: 0, top: 0, width: 800, height: 600 }] : [];
  }
  getBoundingClientRect() {
    return { left: 180, top: 40, width: 800, height: 600 };
  }
  getAttribute(name) {
    return this._attrs[name];
  }
  setAttribute(name, value) {
    this._attrs[name] = String(value);
  }
  matchesSel(sel) {
    const parts = sel.split(",").map((s) => s.trim());
    return parts.some((s) => matchOne(this, s));
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
  querySelectorAll(sel) {
    return allElems.filter((el) => el !== this && this.containsNode(el) && el.matchesSel(sel));
  }
  containsNode(el) {
    for (let p = el.parentNode; p; p = p.parentNode) {
      if (p === this) return true;
    }
    return false;
  }
  closest(sel) {
    const parts = sel.split(",").map((s) => s.trim());
    for (let p = this; p; p = p.parentNode) {
      if (parts.some((s) => closestMatch(p, s))) return p;
    }
    return null;
  }
  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  insertBefore(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
  addEventListener() {}
}

function matchOne(el, sel) {
  if (sel === "aside.left-rail nav") return el.id === "rail-nav";
  if (sel === "aside.left-rail") return el.id === "rail";
  if (sel === "aside.left-rail nav button") return el.tag === "button" && el._inRavNav;
  if (sel === ".app-body") return el.id === "app-body";
  if (sel === "button") return el.tag === "button";
  if (sel.startsWith("[class*='")) {
    const needle = sel.slice(sel.indexOf("'") + 1, sel.lastIndexOf("'"));
    return (el.className || "").includes(needle);
  }
  if (sel.startsWith(".")) return el.classList.contains(sel.slice(1));
  if (sel === "nav") return el.tag === "nav";
  return false;
}

function closestMatch(el, sel) {
  if (sel === "aside.left-rail nav button") return el.tag === "button" && el._inRavNav;
  if (sel === '.topbar-actions .icon-button[aria-label="软件设置"]') {
    return el.className.includes("icon-button") && el.getAttribute("aria-label") === "软件设置";
  }
  if (sel === ".topbar-actions .engine-pill") return el.className.includes("engine-pill");
  if (sel === "button.rail-settings") return el.className.includes("rail-settings");
  if (sel === "button.settings-link") return el.className.includes("settings-link");
  return matchOne(el, sel);
}

// ------------------------------------------------------------ 外部 mock api
const calls = { hide: 0, show: 0 };
const statusCbs = [];
let state = { visible: false, enabled: true };
function pushState(next) {
  state = { ...state, ...next };
  for (const cb of statusCbs) cb(state);
}
const serpentApi = {
  hide: () => {
    calls.hide += 1;
    pushState({ visible: false });
    return Promise.resolve(true);
  },
  show: () => {
    calls.show += 1;
    pushState({ visible: true });
    return Promise.resolve(true);
  },
  toggle: () => Promise.resolve(true),
  reportLayout: () => Promise.resolve(),
  onStatus: (cb) => {
    statusCbs.push(cb);
    return () => {};
  },
  status: () => Promise.resolve({ ...state }),
};

// ------------------------------------------------------------ document/window
const docListeners = new Map();
let bodyObserverCb = null;
const nav = new FakeEl("nav", "", "rail-nav");
const rail = new FakeEl("aside", "left-rail", "rail");
rail.appendChild(nav);
const body = new FakeEl("div", "", "app-body");

const documentStub = {
  readyState: "complete",
  head: new FakeEl("head", "", "head"),
  body,
  getElementById: (id) => allElems.find((el) => el.id === id) || null,
  createElement: (tag) => new FakeEl(tag),
  querySelector: (sel) => allElems.find((el) => el.matchesSel(sel)) || null,
  querySelectorAll: (sel) => allElems.filter((el) => el.matchesSel(sel)),
  addEventListener: (name, fn) => {
    docListeners.set(name, fn);
  },
};
const windowStub = {
  addEventListener: () => {},
  h3: { serpent: serpentApi },
};

global.window = windowStub;
global.document = documentStub;
global.MutationObserver = class {
  constructor(cb) {
    this.cb = cb;
  }
  observe(target) {
    if (target === documentStub.body) bodyObserverCb = this.cb;
  }
  disconnect() {}
};

// ------------------------------------------------------------- 运行真实脚本
const scriptPath = path.join(
  __dirname,
  "..",
  "dev-src",
  "serpent-sidebar-inject.js",
);
const raw = fs.readFileSync(scriptPath, "utf8");
// eslint-disable-next-line no-new-func
new Function(raw)();

const tick = (ms) => new Promise((r) => setTimeout(r, ms));
async function flushMutations() {
  bodyObserverCb();
  await tick(0);
}

// 弹层注册：present=false 时从 DOM 移除
const overlayEls = new Map();
function setOverlay(name, visible, present = true) {
  let el = overlayEls.get(name);
  if (present && !el) {
    el = new FakeEl("div", name, name);
    overlayEls.set(name, el);
  }
  if (!present) {
    if (el) {
      el._visible = false;
      if (el.parentNode) el.parentNode.children = el.parentNode.children.filter((c) => c !== el);
      el.parentNode = null;
      overlayEls.delete(name);
    }
    return;
  }
  el._visible = visible;
  if (!el.parentNode) body.appendChild(el);
}

const tabButtons = new Map();
function ensureTab(key) {
  let b = tabButtons.get(key);
  if (!b) {
    b = new FakeEl("button", "", `tab-${key}`);
    b._inRavNav = true;
    nav.appendChild(b);
    tabButtons.set(key, b);
  }
  return b;
}

function clickOpener() {
  const gear = new FakeEl("button", "icon-button", "gear-" + Math.random().toString(36).slice(2));
  gear.setAttribute("aria-label", "软件设置");
  docListeners.get("click")({ target: gear });
}

async function enterLibrary() {
  await serpentApi.show();
  await tick(30); // 等 boot 完成 + onStatus 同步
}

async function main() {
  await tick(400); // 等 boot 的 setInterval 完成一次（nav 已就绪）

  // ---------------------------------------------------------------- 场景 A
  console.log("[A] 资源管理 → 软件设置 → 外部 ComfyUI 配置 → 关闭");
  const home = ensureTab("home");
  home.classList.add("active");
  await enterLibrary();
  assert.strictEqual(calls.show, 1, "Serpent 显示一次");
  const showBeforeA = calls.show;

  clickOpener(); // A1 顶栏“软件设置”capture 守卫先隐藏
  assert.strictEqual(calls.hide, 1, "A1 开启器隐藏 Serpent");
  setOverlay("modal-backdrop app-settings-modal", true); // A2 软件设置弹窗
  await flushMutations();
  await tick(200);
  assert.strictEqual(calls.show, showBeforeA, "A2 弹窗打开期间不恢复 Serpent");

  // A3 点“外部 ComfyUI 安装目录”→ 软件设置关闭、工作区设置打开（同一提交）
  setOverlay("modal-backdrop app-settings-modal", false);
  setOverlay("setup-backdrop", true);
  setOverlay("setup-modal", true);
  await flushMutations();
  await tick(250); // 覆盖 80ms 延迟复查窗口
  assert.strictEqual(
    calls.show,
    showBeforeA,
    "A3 切换到工作区设置后 Serpent 不得重新出现（回归核心）",
  );
  assert.strictEqual(calls.hide, 1, "A3 未触发额外隐藏");

  // A4 关闭工作区设置 → 80ms 复查后恢复资源管理
  setOverlay("setup-backdrop", false);
  setOverlay("setup-modal", false);
  await flushMutations();
  await tick(30);
  assert.strictEqual(calls.show, showBeforeA, "A4 关闭后先不恢复（等待复查）");
  await tick(200);
  assert.strictEqual(calls.show, showBeforeA + 1, "A4 复查后恢复 Serpent");
  console.log("  A PASS");

  // ---------------------------------------------------------------- 场景 B
  console.log("[B] 资源管理 → 软件设置 → 直接关闭");
  ensureTab("home").classList.add("active");
  await enterLibrary();
  const showBeforeB = calls.show;
  const hideBeforeB = calls.hide;

  clickOpener();
  assert.strictEqual(calls.hide, hideBeforeB + 1, "B1 开启器隐藏");
  setOverlay("modal-backdrop app-settings-modal", true);
  await flushMutations();
  await tick(120);
  assert.strictEqual(calls.show, showBeforeB, "B2 弹窗打开期间保持隐藏");
  setOverlay("modal-backdrop app-settings-modal", false);
  await flushMutations();
  await tick(200);
  assert.strictEqual(calls.show, showBeforeB + 1, "B3 关闭软件设置后恢复资源管理");
  console.log("  B PASS");

  // ---------------------------------------------------------------- 场景 C
  console.log("[C] 弹层切换分两次提交（中间一帧无弹层）→ 不得误恢复");
  await enterLibrary();
  const showBeforeC = calls.show;
  const hideBeforeC = calls.hide;

  clickOpener();
  assert.strictEqual(calls.hide, hideBeforeC + 1, "C1 开启器隐藏");
  setOverlay("modal-backdrop app-settings-modal", true);
  await flushMutations(); // 第一次提交：软件设置打开
  setOverlay("modal-backdrop app-settings-modal", false);
  await flushMutations(); // 第二次提交（尚无 setup）：一帧无弹层 → 调度复查
  await tick(30);
  assert.strictEqual(calls.show, showBeforeC, "C2 复查前不恢复");
  setOverlay("setup-backdrop", true);
  setOverlay("setup-modal", true);
  await flushMutations(); // 第三次提交：工作区设置出现（复查命中 → 保持隐藏）
  await tick(200);
  assert.strictEqual(calls.show, showBeforeC, "C3 复查命中新弹层，不得恢复（回归）");
  setOverlay("setup-backdrop", false);
  setOverlay("setup-modal", false);
  await flushMutations();
  await tick(250);
  assert.strictEqual(calls.show, showBeforeC + 1, "C4 关闭后恢复资源管理");
  console.log("  C PASS");

  console.log(`hide=${calls.hide} show=${calls.show}`);
  console.log("ALL PASS");
}

main().catch((error) => {
  console.error("TEST FAILED:", error && error.stack ? error.stack : error);
  process.exit(1);
});
