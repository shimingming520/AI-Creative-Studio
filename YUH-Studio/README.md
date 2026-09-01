# YUH Studio 反编译工程

本目录由已安装的 `YUH Studio 0.8.0` 提取而来，目标安装目录为：

`F:\Program_Files\YUH Studio`

## 目录说明

- `app-full/`：完整提取的 `resources/app.asar`，包含 `out/main`、`out/preload`、`out/renderer` 和运行时 `node_modules`。
- `app-readable/`：经过 Prettier 格式化的核心 JavaScript/CSS 副本，适合阅读和检索；它不替代 `app-full/` 中的原始构建产物。
- `dev-src/`：当前 `npm start` 实际加载的开发源码树；修改这里的文件即可直接运行验证。
- `bundled-resources/`：项目自带的完整引擎、`llama.cpp`、`runtime-tools` 和模型运行库，不依赖原安装目录。
- `engine-source/`：从安装目录 `resources/engine` 复制出的源文件（Python、JavaScript、JSON、YAML、TOML、Markdown、批处理脚本等），不包含模型权重和大型二进制文件。
- `package.json`：独立开发配置，入口为 `dev-src/main/index.js`。
- `.npmrc`：固定 Electron 下载镜像，降低首次安装时的网络波动。
- `IPC-CHANNELS.md`：主进程与预加载层的 IPC 通道索引。
- `DECOMPILATION-REPORT.md`：提取统计、架构判断和边界说明。

## 快速开始

在本目录执行：

```powershell
npm install
npm start
```

首次安装会下载 Electron 开发运行时；应用默认从 `bundled-resources/` 加载 AI 引擎、模型运行库和 CUDA 依赖。ComfyUI 的外部共享目录现在放在 `F:\Comfy-Desktop\ComfyUI-Shared`（`models/`、`output/`、`input/`、`workflows/`），并且可以在工作区设置里指定外部 ComfyUI 安装目录，填 `F:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI`（根目录下含 `main.py`）。

`npm start` 当前运行的是 `dev-src/` 中的可读代码，不是 `app-full/` 的原始构建副本。执行 `npm run check` 可以在启动前检查三层 JavaScript 语法。

修改 `engine-source/` 中的 Python 或配置后，启动脚本会自动执行 `npm run sync-engine`，把源文件同步到 `bundled-resources/engine` 再运行。

## 资源管理中的「生成资产」固定标签

Serpent 侧栏（Serpent`src/renderer/NavigationSidebar.tsx`）新增固定分区「生成资产」：

- 路径即 YUH 的「存储设置 → 输出文件夹」（`outputDir()`）；`dev-src/serpent-host.js` 通过 `setHostedGeneratedAssetsRoot` 把该路径推给 Serpent 主进程，渲染层再按绝对路径匹配链接文件夹（自动创建的「ComfyUI 输出」）。
- 按类型分级：全部生成资产 / 图像 / 视频 / 音频 / 其他，统计数量随资产变更（fs watcher 收录新生成物）自动刷新；点击行浏览对应类型（链接文件夹递归范围 + `format` 过滤），支持搜索、标签、收藏、删除等常规资源管理操作。
- 未配置/未链接时该分区隐藏或显示提示；独立运行 Serpent 可用环境变量 `SERPENT_GENERATED_ASSETS_ROOT` 指定同一目录。

## 替换工作室（迁移自 ShuoCanvas personReplacement 核心流程）

左侧边栏（原版 UI「无限画布」之下、资源管理之上）新增「替换工作室」入口；点击后显示
Serpent 嵌入视图并切换到替换工作室全屏工作区（`serpent-sidebar-inject.js` 注入按钮 →
`h3.serpent.openView("replacement-studio")` → 主进程 `serpent:open-view` →
`dev-src/serpent-host.js::openView` → Serpent 渲染层 `App.tsx` 叠加层）。

功能与 ShuoCanvas「替换工作室」对应关系：

- **项目库 → 素材设定**：基础图片或视频（视频自动抽取首帧）；目标角色 + 参考形象。
- **人物绑定**：手动框选 + AI 智能检测（通用视觉大模型，经 YUH `chat:send` 中转站；
  相比 ShuoCanvas 的本机 OSNET 模型包更通用，无需下载模型）；每个人物可绑定角色/形象
  与替换范围（完整人物/脸发/服装/手部/脚部）。
- **图像替换**：多图引导生成（原图 + 彩色字母位置标注图 + 目标形象参考图），提示词模板
  自动组装（`{bindings}`/`{scopeLines}`/`{shot}`），走 `cloud-images:generate`
  （OpenAI 兼容图片编辑），结果自动保存到输出目录。
- **视频替换**：以激活替换图为起始帧（可选参考原视频）走 `cloud-videos:generate`。
- **导出**：输出目录即「ComfyUI 输出」链接 → 资源管理「生成资产」自动可见；支持定位/
  打开文件夹与生成历史。

代码位置：

- 渲染层：`Serpent/src/renderer/replacement-studio/`（React）；纯逻辑与类型
  `Serpent/src/shared/replacement-studio.ts`（单元测试 `Serpent/tests/unit/replacement-studio.test.ts`）。
- 宿主桥：`Serpent/src/preload/index.ts`（`window.serpent.host.*` → YUH IPC 白名单）。
- YUH 主进程：`dev-src/main/index.js` 的 `registerReplacementStudioIpc()`（`rs:*` 通道）
  与 `registerSerpentIpc()` 中新增的 `serpent:open-view`；项目数据存于
  `<userData>/serpent/replacement-studio/`。
- 生成/检测依赖 YUH 中转站配置（`providers:list/save`，AI 对话设置界面里相同的
  中转站列表）；需要配置 API Key 的图片编辑模型（如 gpt-image-1/seedream 类）。

修改 Serpent 源码后需重建 hosted 产物再重启应用：

```powershell
cd ..\Serpent
node scripts/hosted-rebuild.mjs
```

调试脚本：`scripts/cdp-replacement-studio.mjs`（侧栏入口 + 嵌入视图 + rs IPC 往返 E2E）、
`scripts/cdp-replacement-editor.mjs`（新建项目 + 步骤导航）、
`scripts/test-serpent-sidebar.cjs`（注入状态机回归）。

## TSX 开发模式

新的 React + TypeScript 入口位于 `ui-src/`，可运行类型检查和 Vite 开发服务器：
```powershell
npm run typecheck
npm run start:ui
```

`npm start` 和 `npm run dev` 默认启动从原程序提取的完整界面，适合日常使用和基于原版功能进行二次开发。`start:ui` 会启动 Vite，再让 Electron 主进程通过 `ELECTRON_RENDERER_URL` 加载 TSX 迁移页面；它是可选的迁移实验入口，不会替代默认原版界面。

开发原版功能时直接运行 `npm run dev`，修改 `dev-src/renderer/`、`dev-src/main/` 或 `dev-src/preload/` 后重启 Electron。需要继续迁移 React 页面时，再运行 `npm run start:ui`；Vite 会热更新 `ui-src/` 页面。

## 自定义工作流（直接运行 ComfyUI 工作流同步库）

`ui-src/`（`npm run start:ui` 打开）包含一个「自定义工作流」页：

- 自动扫描 `F:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI\user\default\workflows`（与 ComfyUI 网页保存目录一致，网页里保存即同步；ComfyUI Desktop 与程序共用一个安装目录）。
- 主进程实现：`dev-src/main/workflows.js` —— UI 格式 → API 格式转换（支持 `widgets_values_named` 新版与旧版位置映射、seed 双值组件、bypassed/muted 节点跳过、死分支剪枝）、参数槽自动识别（提示词/宽高/时长/步数/种子/CFG/FPS）、模型文件槽位识别、提交前校验（自定义节点存在性 + 枚举候选 + 模型文件注册列表）。
- IPC：`workflows:list` / `workflows:inspect` / `workflows:validate` / `workflows:run` / `workflows:cancel`（`dev-src/preload/index.js` 暴露 `window.h3.workflows.*`），运行结果走统一任务系统（进度、输出、历史）。
- 已知限制：程序自建的 Python 运行时只安装 ComfyUI 根目录 `requirements.txt`，**不会**安装各自定义节点的依赖（`gguf`、`llama_cpp` 等）。因此使用自定义节点的工作流在程序内启动的引擎（8190）可能报「缺少自定义节点」；此时可在软件设置里把「远程后端」指向 ComfyUI Desktop 实例（`http://127.0.0.1:8188`，模型目录相同），或手动向运行时 venv 安装对应依赖。
- 调试脚本：`node scripts/test-workflows.cjs`（扫描/转换/槽位/实时校验冒烟测试）。

## 独立打包

项目已配置 Electron Builder：

```powershell
npm run check
npm run dist
```

`dist` 默认打包完整原版界面；如果要测试 TSX 迁移页面，再使用 `npm run dist:ui`。产物位于 `release/`。打包配置会把 `bundled-resources/` 放到应用资源目录，因此卸载 `F:\Program_Files\YUH Studio` 后，打包应用仍能找到 IndexTTS、TTS、`llama.cpp` 和 `uv.exe`。模型目录、输出目录和 ComfyUI 共享资源现在统一走 `F:\Comfy-Desktop\ComfyUI-Shared`；如果你想让项目接管外部 ComfyUI，请在工作区里填它的安装目录（`F:\Comfy-Desktop\ComfyUI-Installs\ComfyUI\ComfyUI`），或者直接设置 `COMFYUI_PATH`。

## 二次开发建议

1. 新 UI 功能优先写入 `ui-src/`，入口为 `ui-src/App.tsx`，样式为 `ui-src/styles.css`。
2. 修改 `dev-src/main/index.js`，这里包含窗口创建、运行时管理、任务调度和 IPC 注册。
3. 修改 `dev-src/preload/index.js`，这里是渲染层可调用的 API 白名单；新增 API 后同步更新 `ui-src/types.ts`。
4. 原始 UI bundle 保留在 `dev-src/renderer/`，用于功能对照和兼容回退，不建议直接在压缩 bundle 上继续开发。
5. Python 引擎运行副本位于 `bundled-resources/engine`；`engine-source/` 是便于检索的源文件快照。需要修改 Python 引擎时，把变更同步到 `bundled-resources/engine` 后再启动验证。
6. 修改后运行 `npm run check`、`npm run typecheck`、`npm run ui:build`，确认无误后使用 `npm run dist` 打包。

## 重要路径

- 主进程：`dev-src/main/index.js`
- 预加载：`dev-src/preload/index.js`
- TSX 渲染入口：`ui-src/index.html`、`ui-src/main.tsx`
- 旧版渲染入口：`dev-src/renderer/index.html`
- 旧版渲染脚本：`dev-src/renderer/assets/index-B9rdyvCR.js`
- TSX 构建产物（可选）：`ui-build/index.html`
- 原始 ASAR：`F:\Program_Files\YUH Studio\resources\app.asar`
- 项目内引擎：`bundled-resources/engine`
