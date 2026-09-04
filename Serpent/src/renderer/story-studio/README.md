# 剧本工作室 · Story Studio — 对齐说明

把侧栏「剧本工作室」从原先的简化界面(StoryboardScriptWorkspace: 文案→分镜脚本→角色资产→分镜批量生成)
对齐到 ShuoCanvas 的「剧本工作室」storyWorkspace(剧本/素材/分集 一站式工作台)。

## 目标源码(ShuoCanvas, 只读参照)
- `app/src/modules/storyWorkspace/storyWorkspace.js` — 主控(13305 行): 步骤、页面、项目会话、事件。
- `storyWorkspaceChromePresentation.js` / `storyWorkspaceChromeProjection.js` — 顶部工具条 + 底部 footer(上一步/下一步)。
- `storyHomePresentation.js` — 首页: hero / tabs(上传剧本/剧本创作/复刻视频) / composer / model bar / projects。
- `storyStyleCatalog.js` — 风格库(categories + presets + custom)。
- `storyProjectPlanning.js` — promptMode / episodeCount / aspectRatio / scriptMode 等规划常量。
- `workspaceProjectHome.js` — 项目卡片 / 排序 / 搜索。
- `app/styles/story-workspace.css` + `app/styles/story-workspace/*.css` — 版式(依赖 `variables.css` + `themes/dark.css`)。

## 本仓库实现(Serpent 渲染层)
- `src/renderer/story-studio/story-studio-data.ts` — 纯数据/纯函数: 步骤、tabs、画幅、提示词模式、分集数、风格库、
  项目实体、localStorage 持久化、列表查询排序。
- `src/renderer/story-studio/story-studio.css` — 自包含版式(复用 Serpent 主题变量 --text/--divider/--pane/--raised/--accent)。
- `src/renderer/story-studio/StoryStudioWorkspace.tsx` — 首页 + 项目外壳(工具条/步骤导航/页面主体/footer)。
- `src/renderer/App.tsx` — 复用宿主并替换入口; `storyboardWorkbenchGroup` 改为读取 `story-studio:projects:v1`。

## 宿主 API(复用 storyboard-script/host.ts)
`window.serpent.host.sw.*`: listProviders / listModels / generateScript / saveText / workspace /
pickImages / generateImage / generateVideo / thumbnail / showItem / ensureWorkbenchProjectDir。

## 数据流
- 首页 tab 就绪 → 生成/导入 → 经 `generateScript`(或直接导入文本)得到剧本 → `createEmptyStoryProject` 入库并打开项目。
- 项目持久化 `story-studio:projects:v1`; 首页状态 `story-studio:home:v1`。
- 打开项目即 `ensureWorkbenchProjectDir('剧本工作室/<项目id>')`, 让侧栏「工作台资源」分级可见。

## 里程(Phase)
- Phase 1(已完成): 首页 + 项目外壳。步骤导航 1 剧情大纲 / 2 素材设定 / 3 分集视频; footer 上一步/下一步。
- Phase 2(已完成): 步骤门控(isStepDisabled / block message) + 逐步生成:
  - 第1步→第2步 = 提取角色/场景/道具(经 generateScript + JSON 解析 + 兜底)。
  - 第2步→第3步 = 依集数切分完整剧本为分集大纲(splitScriptIntoEpisodes)。
  - 第3步 = 建立分镜片段(splitTextIntoClips) + 逐片段生成视频(generateVideo) + 素材形象参考图(generateImage)。
- Phase 3(已完成): 素材设定完整交互
  - 分类 tab(角色/场景/道具/素材库) + 卡片(appearances 缩略图/数量)。
  - 单个「生成形象」→ generateImage(以其既有 appearances 作为 references)。
  - 「批量生成形象」→ 依序生成该类所有素材。
  - 「选择参考图」→ pickImages 追加到该素材 appearances(素材库/本地图片接入)。
  - 「从文件导入」→ pickImages 新建该类素材。
  - 生成时注入 references: generateClipVideo 使用 referencesForProject(整个项目的形象参考图)。
- Phase 4(已完成): 分集视频完整交互
  - 视频模型/质量设置(写入 project.videoModel/videoResolution, 供 generateClipVideo 使用)。
  - 「批量生成全部视频」→ 依序为所有分集全部镜头生成视频。
  - 「导出」→ storyboardToText 生成分镜表并 saveText 落盘。
  - 「加入画布」→ buildStorySyncSnapshot 桥接到替换工作室(buildReplacementProject/syncCharactersIntoProject → saveReplacementProject → openReplacementStudio)。
- 数据模型: story-studio-data.ts 的 StoryProject 新增 videoModel/videoResolution。
- 风格库 popover(StoryStylePicker.tsx): 对齐 renderStoryStylePicker 的 搜索/分类 tabs/预设 grid/自定义卡片。
- 文案模型选择器(TextModelSelector.tsx): 对齐 aigenText/modelSelector 的 pill 触发器 + 按中转站分组的浮层菜单 + 搜索; 数据来自 Serpent listProviders/listModels。

## 验证
- `cd Serpent && npx tsc --noEmit -p tsconfig.json` 通过(0 errors)。
- `cd Serpent && npx vite build --config vite.renderer.config.ts` 通过(主渲染包含 StoryStudio 模块)。
- 重新构建渲染器后在 YUH+Serpent 应用中打开侧栏「剧本工作室」查看首页与工作区。

## 当前状态 / 局限
- 已完成一套「剧本/素材/分集」一站式工作台: 首页(tabs + composer + model bar + 项目列表) + 项目工作区
  (步骤导航 1 剧情大纲·2 素材设定·3 分集视频 + 门控 + footer) + 素材设定 + 分集视频, 复用 host.ts 与资源管理。
- 复用 Serpent 宿主 API: listProviders/listModels/generateScript/saveText/pickImages/generateImage/
  generateVideo/thumbnail/showItem/ensureWorkbenchProjectDir + 替换工作室桥接。
- 未做(或因 Serpent 宿主/架构受限):
  1. 生命周期内未在 Electron 应用真机跑通并截图(本环境无屏幕), 仅以 typecheck + vite bundle 验证。
  2. 素材提取为启发式/generateScript 一步, 非 ShuoCanvas 的多步 agent 提取。
  3. 「加入画布」同步到替换工作室(Serpent 存在的下游管线), 而非 ShuoCanvas 的画布合成。
  4. 视频模型选择复用中转站模型列表, 未接入 ShuoCanvas 的模型目录/描述/线路选择。
  5. 风格库 preset 缩略图依赖 `images/story-styles/*.webp`(ShuoCanvas 资源), Serpent 中为缺省占位。
