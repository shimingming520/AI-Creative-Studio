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

功能与 ShuoCanvas「替换工作室」对应（完整 5 步工作流 + 四栏布局 + 镜头时间线）：

- **步骤导航**：素材设定 → 图像替换 → 视频替换 → 声音克隆 → 合成视频；每步有
  gate（未通过时锁定并显示原因），页脚提供引导 + 上一步/进入下一步。
- **素材设定**：导入视频/图片 → 智能裁剪（平衡/稳定/敏感三档，FFmpeg `scdet` 场景
  检测近似 ShuoCanvas smart-clip）自动切分镜头 → 逐镜头抽取关键帧 → 视觉大模型检测
  人物（bbox + 外貌描述，近似 OSNET 检测）→ 描述相似度跨镜头身份聚类（近似
  OSNET 身份聚类）→ 目标角色绑定；左侧素材库（人物/场景/音频/总素材）管理目标角色、
  参考形象、场景参考、音色参考音频。
- **图像替换**（四栏布局）：左=目标素材栏；中=舞台（关键帧 + 彩色字母检测框
  overlay + 人物描述/绑定徽标 + 镜头前后导航）+ 底部镜头时间线；右=生成面板
  （身份绑定/提示词/模型参数/生成按钮/结果预览）。多图引导生成：原图 + 字母位置
  标注图 + 目标形象参考图（可选场景参考），走 `cloud-images:generate`。
- **视频替换**：输入模式（替换首帧 / 人物参考图）+ 逐镜头/批量生成，走
  `cloud-videos:generate`（可选参考原视频）。
- **声音克隆**：逐镜头台词（可 Whisper 转写近似）+ 目标角色音色参考 →
  YUH IndexTTS 克隆（`rs:clone-voice`）。
- **合成视频**：镜头片段 ffmpeg 素材化 → 按序拼接 + 克隆音轨对齐混合 →
  保存对话框导出（`rs:compose`）。

代码位置：

- 渲染层：`Serpent/src/renderer/replacement-studio/`（React）；纯逻辑与类型
  `Serpent/src/shared/replacement-studio.ts`（归一化/聚类/提示词编译，
  单元测试 `Serpent/tests/unit/replacement-studio.test.ts`）。
- 宿主桥：`Serpent/src/preload/index.ts`（`window.serpent.host.*` → YUH IPC 白名单）。
- YUH 主进程：`dev-src/main/index.js` 的 `registerReplacementStudioIpc()`（`rs:*` 通道：
  项目持久化、probe/smart-clip/定时抽帧/片段素材化/转写/克隆/合成；ffmpeg 用
  `FFMPEG_PATH` 或 PATH，不依赖外置 ComfyUI 运行时）+ `serpent:open-view`；
  项目数据存于 `<userData>/serpent/replacement-studio/`。
- 生成/检测依赖 YUH 中转站配置（`providers:list/save`）；检测还需填写视觉模型 ID
  （如 qwen-vl-max）；智能裁剪需本机 ffmpeg（可用 `FFMPEG_PATH` 指定）。

修改 Serpent 源码后需重建 hosted 产物再重启应用：

```powershell
cd ..\Serpent
node scripts/hosted-rebuild.mjs
```

调试/E2E 脚本：`scripts/cdp-replacement-v2.mjs`（前端结构）、
`scripts/cdp-rs-backend-test.mjs`（rs 后端链路）、`scripts/cdp-replacement-ui-flow.mjs`
（智能裁剪 UI 流程）、`scripts/cdp-production-layout.mjs`（四栏生产布局）、
`scripts/test-serpent-sidebar.cjs`（注入状态机回归）。

## 剧本工作室与媒体工具（并行轨道·阶段1 脚手架）

替换工作室之外，新开了两条并行轨道，模式与替换工作室一致（Serpent 渲染层 +
YUH 中转站/既有工具能力 + 输出目录落盘）。侧栏注入已泛化为多子视图状态机
（`activeSubView`），三个工作室入口共用「再次点击收起 / 点击其它切换」行为，
回归测试见 `scripts/test-serpent-sidebar.cjs`。

### Track A — 剧本工作室 · 分镜脚本（view id: `storyboard-script`）

- 纯逻辑与类型：`Serpent/src/shared/storyboard-script.ts`（提示词模板工厂、
  `parseStoryScript` JSON 解析/规范化/时长钳制、`scriptToPlainText`、`splitStoryText`），
  单测 `Serpent/tests/unit/storyboard-script.test.ts`。
- 工作区：`Serpent/src/renderer/storyboard-script/StoryboardScriptWorkspace.tsx`
  （文案 → 中转站 chat → 分镜表，每镜提示词可编辑，复制/导出 TXT/查看 JSON，
  草稿存 localStorage `sw:draft:v1`）。
- 宿主桥：`sw:generate-script`（主进程只发 chat 完成，提示词由前端构建）、
  `sw:save-text`（输出目录 UTF-8 落盘）。主进程实现见
  `dev-src/main/index.js::registerStoryWorkflowIpc()`。
- 阶段2（未开始）：分镜批量生成（云生图/生视频）、资产设定、角色一致性、
  与替换工作室联动。

### Track B — 媒体工具（view id: `media-tools`）

- 纯逻辑与类型：`Serpent/src/shared/media-tools.ts`（宫格单元、拼图槽位、
  对比切换顺序、白板笔画模型），单测 `Serpent/tests/unit/media-tools.test.ts`。
- 工作区：`Serpent/src/renderer/media-tools/MediaToolsWorkspace.tsx`，
  四个选项卡：宫格（rows×cols 分块导出）/ 拼图（2 图横竖拼接）/
  图像对比（点击缩略图切主图，对齐 ShuoCanvas 素材对比）/ 白板（笔画标注导出 PNG）。
- 宿主桥：`mt:split-grid`（代理 `splitImages`）、`mt:stitch-grid`（代理
  `stitchImages`）、`mt:save-annotation`（代理 `saveCanvasAnnotation`），全部输出到
  「存储设置 → 输出文件夹」，落盘后资源管理「生成资产」自动可见。主进程实现见
  `dev-src/main/index.js::registerMediaToolIpc()`。

### 并行开发约定

- 每条轨道只改自己的目录：`Serpent/src/shared/<track>.ts`、
  `Serpent/src/renderer/<track>/`、`Serpent/tests/unit/<track>.test.ts`；
  YUH 侧只新增 `register<Track>Ipc()`，不触碰既有 handler。
- 共享修改点（需串行合并）：`Serpent/src/preload/index.ts`（通道白名单）、
  `Serpent/src/renderer/App.tsx`（studio 视图注册）、
  `dev-src/serpent-sidebar-inject.js`（侧栏入口）、`dev-src/main/index.js` 的
  `registerIpc()` 调用清单。
- hosted 重建唯一入口：`cd ..\Serpent && node scripts/hosted-rebuild.mjs`。

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
