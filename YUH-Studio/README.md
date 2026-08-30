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

首次安装会下载 Electron 开发运行时；应用默认从 `bundled-resources/` 加载 AI 引擎、模型运行库和 CUDA 依赖。ComfyUI 的外部共享目录现在放在 `F:\PyCharm_Project\ComfyUI-Shared`，并且可以在工作区设置里指定外部 ComfyUI 安装目录。

`npm start` 当前运行的是 `dev-src/` 中的可读代码，不是 `app-full/` 的原始构建副本。执行 `npm run check` 可以在启动前检查三层 JavaScript 语法。

修改 `engine-source/` 中的 Python 或配置后，启动脚本会自动执行 `npm run sync-engine`，把源文件同步到 `bundled-resources/engine` 再运行。

## TSX 开发模式

新的 React + TypeScript 入口位于 `ui-src/`，可运行类型检查和 Vite 开发服务器：

```powershell
npm run typecheck
npm run start:ui
```

`npm start` 和 `npm run dev` 默认启动从原程序提取的完整界面，适合日常使用和基于原版功能进行二次开发。`start:ui` 会启动 Vite，再让 Electron 主进程通过 `ELECTRON_RENDERER_URL` 加载 TSX 迁移页面；它是可选的迁移实验入口，不会替代默认原版界面。

开发原版功能时直接运行 `npm run dev`，修改 `dev-src/renderer/`、`dev-src/main/` 或 `dev-src/preload/` 后重启 Electron。需要继续迁移 React 页面时，再运行 `npm run start:ui`；Vite 会热更新 `ui-src/` 页面。

## 独立打包

项目已配置 Electron Builder：

```powershell
npm run check
npm run dist
```

`dist` 默认打包完整原版界面；如果要测试 TSX 迁移页面，再使用 `npm run dist:ui`。产物位于 `release/`。打包配置会把 `bundled-resources/` 放到应用资源目录，因此卸载 `F:\Program_Files\YUH Studio` 后，打包应用仍能找到 IndexTTS、TTS、`llama.cpp` 和 `uv.exe`。模型目录、输出目录和 ComfyUI 共享资源现在统一走 `F:\PyCharm_Project\ComfyUI-Shared`；如果你想让项目接管外部 ComfyUI，请在工作区里填它的安装目录，或者直接设置 `COMFYUI_PATH`。

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
