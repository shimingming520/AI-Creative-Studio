# IPC 通道索引

通道来自主进程 `electron.ipcMain.handle(...)` 和预加载 `ipcRenderer.invoke(...)` 注册点，按功能分组如下：

- 后端：`backend:status`、`backend:start`、`backend:restart`、`backend:unload-gpu`
- 视觉反推：`vision-reverse:status`、`vision-reverse:start`、`vision-reverse:run`、`vision-reverse:cancel`、`vision-reverse:stop`、`vision-reverse:download-model`、`vision-reverse:cancel-download`、`vision-reverse:list-model-files`、`vision-reverse:search-models`、`vision-reverse:save-settings`、`vision-reverse:load-templates`、`vision-reverse:save-templates`、`vision-reverse:save-caption`
- 语音：`tts:status`、`tts:start`、`tts:stop`、`tts:unload`、`tts:voice_design`、`indextts:status`、`indextts:start`、`indextts:stop`、`indextts:unload`、`indextts:clone`
- Provider/任务：`providers:list`、`providers:save`、`providers:remove`、`providers:models`、`tasks:list`、`tasks:create`、`tasks:create-image`、`tasks:prepare-mode`、`tasks:interrupt`、`tasks:cancel`
- 文件与媒体：`files:pick`、`files:resolve`、`files:thumbnail`、`files:read-as-data-url`、`files:trash`、`files:copy-image`、`files:copy-images`、`files:download-to-desktop`、`utilities:convert`、`utilities:split`、`utilities:slice`、`utilities:stitch`、`utilities:mosaic`、`utilities:manual-mosaic`、`utilities:motion`、`utilities:upscale`、`utilities:vectorize`、`utilities:extract-audio`、`utilities:extract-frame`、`utilities:merge-videos`、`utilities:trim-audio`
- 画布/工作区：`canvas:load-projects`、`canvas:save-projects`、`canvas:load-drama-session`、`canvas:save-drama-session`、`canvas:import-workflow`、`canvas:import-workflow-zip`、`canvas:import-skill`、`canvas:export-workflow`、`canvas:export-workflow-zip`、`workspace:get`、`workspace:save`、`workspace:pick-directory`
- 文本/聊天：`text-workbench:pick-files`、`text-workbench:local-proofread`、`text-workbench:export-word`、`chat:send`、`chat:load-sessions`、`chat:save-session`、`chat:delete-session`
- 系统/窗口：`system:usage`、`system:app-icon`、`system:toggle-devtools`、`window:set-theme`、`shell:open-path`、`shell:show-item`、`shell:save-item`、`autostart:get`、`autostart:set`、`app-lifecycle:get-close-behavior`、`app-lifecycle:set-close-behavior`
- 其他服务：`local-comfy:run`、`local-comfy:cancel`、`runninghub:run`、`runninghub:cancel`、`vectorizer-ai:get-settings`、`vectorizer-ai:save-settings`、`vectorizer-ai:get-credit`、`vectorizer-ai:test-connection`、`vectorizer-ai:vectorize`、`vectorizer-ai:cancel`、`sharing:start`、`sharing:stop`、`sharing:status`、`sharing:broadcast-canvas`、`storage:scan-outputs`、`storage:trash-outputs`、`storage:list-canvas-projects`、`storage:list-canvas-backups`、`storage:restore-canvas-backup`

