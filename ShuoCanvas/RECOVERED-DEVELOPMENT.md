# SHUO Canvas 0.7.9 恢复工程说明

## 当前结果

本工作区基于官方 `v0.7.9` 发布标签和本机 Windows 安装产物恢复。官方标签提交为 `1790265f3459a3f7a18da1ca518f1183c00fb312`，发布仓库只包含说明、图片和许可证；实际业务代码来自安装目录 `D:\Program_Files\SHUO Canvas\resources\app`。

恢复后的可开发项目位于 `app/`：

- Electron 主进程与 IPC：`app/electron/`
- 渲染层业务代码：`app/src/`
- API 适配层：`app/api/`
- 可见 Python 服务：`app/backend/`
- 页面与样式：`app/index.html`、`app/styles/`、`app/style.css`
- 静态资源与原生截图助手：`app/assets/`、`app/images/`、`app/native/`

共扫描 1285 个一方 JavaScript 模块，其中 1281 个经过 AST 去混淆，4 个原本未混淆，处理失败数为 0。原始混淆 JavaScript 保存在 `evidence/original-obfuscated-js/`，完整处理记录位于 `evidence/deobfuscation-report.json`。

如需从原始快照重新执行去混淆，先运行 `tools/install-deobfuscator.ps1` 安装固定版本工具，再运行 `node tools/deobfuscate-app.mjs`。

## 开发环境

当前恢复工程使用：

- Electron `43.4.0`
- Node.js `24.18.1`
- Chrome `150.0.7871.224`
- `electron-updater` `6.8.9`
- Python 原生后端运行时 `3.12.9`

安装包中的后端由 Nuitka 编译，运行时内部仍包含 `server.py` 和 `backend.services` 模块。当前工程保留安装包中可见的 Python 文件，并通过目录联接复用已安装原生后端；以后补入完整 `app/server.py` 后，开发启动会自动优先使用 Python 源码入口。

## 启动

在 PowerShell 中执行：

```powershell
cd F:\PyCharm_Project\ShuoCanvas
.\tools\prepare-electron-shell.ps1
.\tools\prepare-local-runtime.ps1
cd F:\PyCharm_Project\ShuoCanvas\app
npm install
npm run check
npm start
```

本地运行时准备完成后，即可卸载已安装版本。若你想重新同步一次运行时：

```powershell
cd F:\PyCharm_Project\ShuoCanvas
.\tools\prepare-local-runtime.ps1 -InstalledRuntime "D:\Program_Files\SHUO Canvas\resources\runtime" -Force
```

开发启动默认使用 Electron `BrowserWindow`，DevTools 可用；通过 `AICANVAS_PORT` 可以指定独立后端端口。
Electron 开发壳直接取自已安装的 43.4.0 版本，因此启动和本地构建不依赖 npm 下载 Electron 压缩包。
源代码中的 `package.json` 保持 UTF-8 with BOM；构建包装器会在 `electron-builder` 子进程运行期间临时去除 BOM，结束后自动恢复。
开发启动使用忽略提交的临时 Electron 入口包，不修改源代码目录中的 `package.json`。

## 构建

目录版构建：

```powershell
cd F:\PyCharm_Project\ShuoCanvas\app
npm run build:dir
```

Windows NSIS 安装包：

```powershell
cd F:\PyCharm_Project\ShuoCanvas\app
npm run build:win
```

NSIS 安装包构建首次执行时会由 `electron-builder` 下载其 Windows 打包组件；目录版构建使用本地 Electron 开发壳，可离线完成。

构建默认优先使用 `app/.electron-runtime/runtime` 里的本地运行时，若本地副本不存在才回退到 `D:\Program_Files\SHUO Canvas\resources\runtime`。路径变化时仍可设置 `AIC_RUNTIME_SOURCE`：

```powershell
$env:AIC_RUNTIME_SOURCE = "目标运行时目录"
npm run build:win
```

恢复版使用独立的应用标识和产品名，并停用官方自动更新检查，避免覆盖恢复工程。

## 校验与证据

重新生成哈希清单：

```powershell
cd F:\PyCharm_Project\ShuoCanvas
.\tools\collect-evidence.ps1
```

重要文件：

- `evidence/release-info.json`：安装包、主程序、版本和运行时信息
- `evidence/installed-app-manifest.csv`：安装产物文件哈希
- `evidence/runtime-manifest.csv`：原生运行时文件哈希
- `evidence/recovered-app-manifest.csv`：恢复后项目文件哈希
- `evidence/build-manifest.csv`：离线目录构建产物文件哈希
- `evidence/backend-module-inventory.txt`：Nuitka 原生后端模块路径和构建指纹
- `evidence/deobfuscation-report.json`：逐文件去混淆报告

## 编码与许可证

恢复后生成或修改的文本文件采用 UTF-8 with BOM。`evidence/original-obfuscated-js/` 为保持安装原件字节一致而保留原始编码。

项目根目录 `LICENSE` 声明个人学习、研究、评估和非商业修改范围；商业用途、收费服务、企业生产系统、再分发或白标使用需要版权方书面商业授权。二次开发时应继续保留许可证与版权声明。
