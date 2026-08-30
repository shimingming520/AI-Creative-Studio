# 反编译报告

## 目标识别

- 产品：YUH Studio
- 版本：`0.8.0`
- Electron 应用：通过 `resources/app.asar`、`out/main`、`out/preload`、`out/renderer` 结构确认
- 主程序文件：`YUH Studio.exe`，文件版本 `0.8.0.0`
- 安装目录：`F:\Program_Files\YUH Studio`

## 已完成内容

- 完整提取 `resources/app.asar` 到 `app-full/`
- 提取主进程、预加载和渲染层构建产物
- 对核心 JS/CSS 生成格式化副本到 `app-readable/`
- 建立 `dev-src/` 可运行源码树，并将开发入口切换到该目录
- 复制约 2.24 GiB 的完整运行时到 `bundled-resources/`，并加入 Electron Builder 独立打包配置
- 复制引擎可读源文件到 `engine-source/`：1342 个文件，约 45.8 MiB
- 检查 Python 字节码：安装目录中的 `.pyc` 均存在对应 `.py` 源文件，不需要从字节码单独恢复
- 将完整运行时复制到 `bundled-resources/`，开发版不再依赖安装目录联接
- 使用 Electron Builder `--dir` 成功生成并启动 `release/win-unpacked/YUH Studio.exe`
- 建立 `ui-src/` React + TypeScript + Vite 迁移入口，保留 `npm start` 旧版兼容模式
- 生成 IPC 通道清单和开发入口说明

## 代码结构

### Electron 主进程

`app-full/out/main/index.js` 约 408 KiB，包含工作区设置、模型目录发现、ComfyUI/IndexTTS/TTS 后端管理、任务持久化、文件操作、媒体处理、云端 Provider、视觉反推、向量化、窗口管理和 IPC 注册。

### 预加载层

`app-full/out/preload/index.js` 约 15 KiB，通过 `contextBridge` 暴露 `backend`、`visionReverse`、`tts`、`indextts`、`providers`、`files`、`utilities`、`canvas`、`chat` 等 API。

### 渲染层

渲染入口为 `out/renderer/index.html`，核心脚本为 Vite 构建的 React bundle，约 3.66 MiB；样式约 0.51 MiB。未发现可直接使用的外部 source map 或原始 TSX 文件，因此变量名和模块边界部分已经过构建压缩/合并，但逻辑仍可检索和修改。

### Python/AI 引擎

`resources/engine` 包含 ComfyUI、IndexTTS、Qwen3-TTS 等组件。安装目录内已保留大量 `.py` 源文件；本工程只复制源代码和配置，未复制约 860 MiB 以上的模型、CUDA、TensorRT、FFmpeg 等大型二进制资源。

## 二进制边界

以下内容仍是原生二进制，未转换为 C/C++ 伪代码：`.exe`、`.dll`、`.node`、CUDA/TensorRT 库、模型权重和 Electron/Chromium 运行库。它们通常属于第三方运行时或硬件加速依赖；如需继续分析原生层，应使用 Ghidra、IDA 或 Binary Ninja，并以 `app-readable/main-index.js` 中的调用位置作为入口。

## 可复现性

- `app-full/` 是 ASAR 的完整文件树，可直接对照原始包校验。
- `app-readable/` 是独立副本，格式化不会影响原始提取结果。
- 原安装目录保持不变；所有输出均位于本工程的 `YUH-Studio-decompiled/`。
