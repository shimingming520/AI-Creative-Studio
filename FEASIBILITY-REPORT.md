# Serpent 合并可行性验证报告（Phase 1）

日期：2026-08-30
结论先行：**全部四个验证点已端到端通关（嵌入视图 / IPC / DB / 缩略图 artifact），且已定位并修复"worker fork 偶发卡死"的根因（不是 utilityProcess 竞态，而是 host 端 stdout 管道损坏引发的 EPIPE 未捕获异常风暴）。合并可行。核心约束：两应用必须统一 Electron 版本（43.1.0）。**

---

## 1. 验证了什么

| # | 验证点 | 结果 | 证据 |
|---|---|---|---|
| 1 | Serpent 主进程在 YUH 进程内以 `SERPENT_HOSTED=1` 加载（单进程合并的核心） | ✅ | `mount:services-started`：`startApplication()` 完整跑通（worker/DB、offscreen、扩展服务器 19876、全部 IPC handler 注册） |
| 2 | Serpent renderer 挂进 YUH 宿主窗口（WebContentsView + 自己的 preload） | ✅ | `mount:mounted :: true`：`#root .app-shell` 出现（Serpent 自己的挂载探针） |
| 3 | IPC 往返：renderer ↔ Serpent 主进程 handler | ✅ | `smoke:step-ipc.windowSerpentApi-ok` / `smoke:step-ipc.listRecent-ok`（`window.serpent.library.listRecent` 成功返回） |
| 4 | DB：better-sqlite3 worker 在宿主 Electron 内运行、建库写入 | ✅ | worker 日志 `worker.boot`；`library.create` 到达 worker；库目录 `.serpent/library.db` 创建，**48 张表全建**，FTS5 全文索引（`asset_search` + `asset_search_data`）完整，schema 迁移 v26 → 当前版本 |
| 5 | offscreen 缩略图服务初始化 | ✅ | `offscreen-thumbnail-renderer` 随 `startApplication()` 创建；页面 URL/`offscreen.js` preload 路径解析正确（`.vite/renderer/main_window/offscreen-thumbnail.html` 已就位） |
| 6 | 缩略图端到端（导入图片 → 生成 artifact） | ✅ | 导入 1 张 80×60 PNG → `thumbnail.importFiles` 成功（importedCount=1，assetId + revisionId 落库）→ `requestThumbnail` 返回 artifactId → `.serpent/artifacts/<artifactId>.jpg` 落盘（298B，JPEG 魔数 `ffd8ffdb` 已验证） |

**完整 smoke 报告**（`serpent-host-smoke/report.json`）6/6 步骤全部 `ok: true`：

```
ipc.windowSerpentApi     ✅ window.serpent API present
ipc.listRecent           ✅ []
db.createLibrary         ✅ libraryId + displayPath
thumbnail.importFiles    ✅ importedCount=1
thumbnail.requestThumbnail ✅ artifactId=<uuid>
thumbnail.artifactPng    ✅ <lib>/.serpent/artifacts/<uuid>.jpg (298 bytes, .jpg)
```

**确定性验证**：修复后同一 smoke 连续 3 次全流程运行，3/3 通过（每次均从干净状态：清 userData/库目录/进程 → fork → services → mounted → 全部 smoke 步骤 → 报告落盘 → 干净退出，`worker exit code=0`）。

## 2. 实现的结构（当前代码状态）

**Serpent 侧（仅 `src/main/index.ts` 补丁 + 2 个新文件，全部 `SERPENT_HOSTED` 环境守卫）**
- `SERPENT_HOSTED=1` 时：跳过 `app.setName`/`app.enableSandbox`/单实例锁/AppUserModelID/自动更新服务/应用菜单/窗口创建/托盘，只注册服务与 IPC；`startSerpentHosted()` / `stopSerpentHosted()` / `setSerpentHostedRenderer()` / `setSerpentHostedDialogWindow()` 四个导出供宿主调用。
- `serpentWebContents()` / `serpentDialogWindow()` / `serpentMainWindowId()` 三个 getter 把全部 `mainWindow` 引用（约 80 处）重定向到宿主视图的 webContents 与宿主窗口。
- `serpentUserDataDir()`：hosted 时重定向到 `SERPENT_USER_DATA_DIR`（宿主 userData 的 `serpent/` 子目录），不碰宿主自己的文件。
- 新增 `vite.hosted-main.config.ts`（外部化 electron/node:*/原生模块，避免浏览器化 shim）与 `scripts/hosted-assemble.cjs`（组装 hosted-build 目录）。

**YUH 侧（仅 3 个文件改动 + 2 个新文件）**
- `dev-src/main/index.js`：顶部 `require("../serpent-host").preload()`（必须在 app.ready 前，因为 Serpent 顶层要注册 privileged schemes）；`whenReady` 里 `mount()`；`before-quit` 里 `shutdown()`。
- `dev-src/serpent-host.js`（新）：环境设置、Serpent 模块加载、WebContentsView 创建与布局、挂载探测、smoke 探针、退出清理、**stdio 加固**（见 §4）。
- `dev-src/serpent-host-mark.js`（新，诊断用，可留可删；**已改为纯文件写入，不再 console.log**）。

**构建产物**：`Serpent/.vite/hosted-build/*`（main.js 为重建；preload/worker/offscreen 等为原版 forge 产物，**必须保持原版**，见 §3.2）。

## 3. 关键约束与决策

1. **统一 Electron 版本（硬约束）**：Serpent 的 `better-sqlite3` 是 ABI 敏感的 node-gyp 模块。Serpent = Electron 43（NODE_MODULE_VERSION 148），YUH = Electron 44（149）。官方 prebuild 最高只有 `electron-v148`（WiseLibs v12.11.2/v12.12.0 均已核实）。本机没有 VS 编译器，无法为 149 源码重编。
   - **结论：合并后的宿主必须运行在 Electron 43.1.0。** 用 YUH 的 44 二进制直接跑验证时，worker 因 ABI 不匹配无法加载（`NODE_MODULE_VERSION 148 vs 149`），主进程随即退出——这是实测结果。
   - 途径：把 YUH 的 `devDependencies.electron` 从 44.0.0 改到 43.1.0（推荐）；或等官方发布 v149 prebuild / 装 VS Build Tools 后重编 bs3（不推荐，前者不可控后两者太重）。可用 Serpent 项目自身的 `electron@43.1.0` 二进制运行 YUH（本验证即用此路径），但正式合并要把 YUH 依赖对齐。
2. **不得用 standalone `vite build` 重建 worker/preload**：Vite 默认把 `fs/path/zlib` 等浏览器化（`__vite-browser-external`），生成的 `library_worker.js` 在启动时抛 `n.inherits is not a function`——本验证期间曾因误用这个坏产物导致 worker 全部失败。worker/preload/offscreen 必须沿用 forge 构建的原版产物（`hosted-assemble.cjs` 已固定从 `.vite/build` 取）。
3. **Serpent 渲染器构建产物**从打包的 `app.asar` 中提取（547 个文件 → `Serpent/.vite/renderer/main_window/`），与源码 0.1.5 一致，避免跑完整 forge 流程。
4. **单实例锁**：hosted 模式下 Serpent 跳过 `requestSingleInstanceLock`（宿主 YUH 已持有）。
5. **userData 隔离**：Serpent 的库/设置写到 `<宿主 userData>/serpent/`；渲染进程的 Chromium profile 仍写在 `%APPDATA%\Serpent`（session/cache），可后续用 `app.setPath('userData')` 前全部接管，当前不冲突。
6. **缩略图格式**：图片缩略图 artifact 落盘为 **JPEG**（`<artifactId>.jpg`，由 sharp→vips 编码），不是 PNG——验证魔数时按 `ffd8ff` 判定。
7. **1×1 测试 PNG 不可用**：libpng 直接拒绝（`vipspng: libpng read error`），smoke 改用 80×60 有效 PNG（经 sharp 预校验）。

## 4. 已解决的"worker fork 偶发卡死"

**现象**：宿主场景下约 50% 的运行（含此前多次复现）卡在 `mount:startSerpentHosted`：`utilityProcess.fork()` 返回 `pid=undefined` 后既不触发 `spawn` 也不触发 `exit`，15s ready 超时与重试也不生效，进程静止（事件循环仍活着，心跳日志持续）。

**根因（本次定位）**：不是 Electron/utilityProcess 竞态，而是 **宿主 stdout 管道被后台任务宿主关闭后，`console.log`（诊断 mark 里的）在已断开的 Socket 上 `write`**：
- Node 的 stdout `write` 是异步的，`try/catch` 拦不住；EPIPE 以 `uncaughtException` 形式冒出。
- 最初的诊断 handler 在 `uncaughtException` 里再次调用 `mark()` → 又 `console.log` → 又 EPIPE → **自反馈风暴**（实测 368,725 次/80 秒，`EPIPE: broken pipe, write`，栈顶 `at mark (serpent-host-mark.js:11:11)`），把主进程事件循环占满，`utilityProcess.fork` 的 spawn/message 派发被饥饿 → 表现为"fork 卡死"。
- 最小 probe 成功是因为 probe 里没有诊断 logger 挂 stdout；YUH 的 vast console 输出放大了触发概率。

**修复（已落地并验证 3/3 通过）**：
1. `serpent-host-mark.js`：`mark()` 只写文件，**完全移除 console.log**。
2. `serpent-host.js`：stdio 加固——`YUH_SERPENT_STDIO_FILE` 存在时把 `process.stdout/stderr` 替换为写文件的 Writable（后台运行必开；正式桌面运行 stdout 正常时无需）。
3. `uncaughtException` 诊断 handler 只记录首次堆栈 + 计数，不再在 handler 内 console.log（避免同类自反馈）。

> 注：即使移除诊断日志，宿主在 stdout 损坏的环境下仍可能被自身 console.log 的 EPIPE 打断（YUH main 有大量 console 输出），所以 §2 的"stdio 加固"是正式合并时**应保留**的防御，而不只是诊断辅助。

## 5. 剩余待办（不阻塞可行性结论）

1. 把 YUH `electron` 依赖降到 43.1.0（当前 devDep 仍是 44.0.0；本验证用 Serpent 自带的 43.1.0 二进制跑的）。
2. 非 E2E（真实对话框）路径未跑：新建库/导入目录目前靠 `SERPENT_E2E` 注入路径跳过弹窗；合并时应把导出路由到宿主窗口（已按 `serpentDialogWindow` 实现，未在真弹窗场景实测）。
3. 自动更新服务、应用菜单、托盘在 hosted 下都被跳过——合并后需宿主侧承接或在集成版里恢复。
4. Serpent 上游更新会产生补丁冲突：`src/main/index.ts` 的 249 行差异需要 rebase（本阶段设计即是最小补丁面：全部集中在 index.ts + 2 个新文件）。

## 6. 下一步（建议顺序）

1. 把 YUH `electron` 依赖降到 43.1.0，跑通"非 E2E"路径（真对话框 + 真导入）。
2. 之后进入产品化阶段：侧边栏"资源管理"入口（原版 bundle 或 ui-src）、视图布局与切换、打包配置（extraResources 带 Serpent runtime）。
3. 上游更新管理：Serpent 侧维护补丁集（index.ts hosted 补丁 + vite config + assemble 脚本），上游合并后 rebase 重打。

## 7. 涉及的改动文件

Serpent 仓库：
- 修改 `src/main/index.ts`（hosted 补丁，git diff 249/122）
- 新增 `vite.hosted-main.config.ts`、`scripts/hosted-assemble.cjs`

YUH-Studio 仓库：
- 修改 `dev-src/main/index.js`（3 处：require+preload、mount、shutdown）
- 新增 `dev-src/serpent-host.js`、`dev-src/serpent-host-mark.js`
