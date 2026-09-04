const zhCN = Object.freeze({
  app: Object.freeze({
    documentTitle: "SHUO Canvas - 阿硕画布",
    starting: "SHUO Canvas 正在启动",
    serverDisconnected: "⚠️ 本地服务连接异常，部分功能暂不可用，正在自动重连。若长时间未恢复，请退出并重新打开 SHUO Canvas。",
    quickGenerate: "SHUO Agent",
    debugSandbox: "V2 架构验证沙盒 · 拖拽节点进行测试",
    canvasArea: "画布区域",
    sourceDefaults: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频",
      text: "文本",
      node: "节点"
    }),
    globalScreenshot: Object.freeze({
      nodeName: "全局截图",
      added: "截图已添加到画布",
      importFailed: "截图回填失败",
      shortcutRegistrationFailed: "全局 {accelerator} 注册失败，仍可在应用内使用 {accelerator}",
      captureFailed: "全局截图失败，请检查屏幕录制权限或稍后重试"
    }),
    nodeLabel: Object.freeze({
      renameTooltip: "点击重命名"
    })
  }),
  appShell: Object.freeze({
    currentVersionBadge: "当前版本：V {version}"
  }),
  selectionMediaProperties: Object.freeze({
    ariaLabel: "选中节点属性",
    image: "图片",
    video: "视频",
    audio: "音频",
    text: "文本",
    fields: Object.freeze({
      dimensions: "尺寸",
      duration: "时长",
      fps: "帧率",
      frames: "帧数",
      characters: "字数"
    }),
    values: Object.freeze({
      seconds: "{value} 秒",
      frames: "{value} 帧",
      framesApproximate: "约 {value} 帧"
    })
  }),
  common: Object.freeze({
    close: "关闭"
  }),
  appBusinessEvents: Object.freeze({
    copyMedia: Object.freeze({
      selectSingleImageNode: "请单选一个图像节点",
      copied: "图像已复制",
      noMedia: "当前节点没有可复制的媒体",
      clipboardUnsupported: "当前环境不支持系统剪贴板复制",
      copyFailed: "复制图像失败"
    }),
    toggles: Object.freeze({
      snapGuides: Object.freeze({
        on: "辅助线吸附已开启",
        off: "辅助线吸附已关闭"
      }),
      snapGrid: Object.freeze({
        on: "网格吸附已开启",
        off: "网格吸附已关闭"
      }),
      gridDots: Object.freeze({
        on: "网格点显示已开启",
        off: "网格点显示已关闭"
      }),
      connectionLines: Object.freeze({
        on: "连接线显示已开启",
        off: "连接线显示已关闭"
      }),
      selectionRelatedHighlight: Object.freeze({
        on: "关联节点高亮已开启",
        off: "关联节点高亮已关闭"
      }),
      titleFollowsZoom: Object.freeze({
        on: "标题跟随画布缩放已开启",
        off: "标题跟随画布缩放已关闭"
      }),
      mediaNodeResize: Object.freeze({
        on: "图像视频节点缩放已开启",
        off: "图像视频节点缩放已关闭"
      }),
      promptBoxResize: Object.freeze({
        on: "提示词栏下拉已开启",
        off: "提示词栏下拉已关闭"
      }),
      nodeAvoidOverlap: Object.freeze({
        on: "新节点自动避让已开启",
        off: "新节点自动避让已关闭"
      })
    }),
    nodeDefaults: Object.freeze({
      sourceText: "源文本",
      aiText: "生成文本",
      aiImage: "生成图像",
      aiVideo: "生成视频",
      aiAudio: "生成音频",
      sceneDetection: "场景检测"
    })
  }),
  format: Object.freeze({
    relativeTime: Object.freeze({
      justNow: "刚刚",
      minuteOne: "{count} 分钟前",
      minute: "{count} 分钟前",
      hourOne: "{count} 小时前",
      hour: "{count} 小时前",
      dayOne: "{count} 天前",
      day: "{count} 天前",
      weekOne: "{count} 周前",
      week: "{count} 周前",
      monthOne: "{count} 个月前",
      month: "{count} 个月前",
      yearOne: "{count} 年前",
      year: "{count} 年前"
    })
  }),
  project: Object.freeze({
    newProject: "新项目",
    addCanvasPage: "新建画布页面",
    currentVersion: "当前版本",
    canvasProject: "画布项目",
    canvasTitle: "阿硕画布",
    loading: "加载中...",
    newCanvas: "新建画布"
  }),
  projectManager: Object.freeze({
    defaultProjectName: "画板 {date}",
    newProjectFallback: "新项目",
    loadFailed: "读取项目失败",
    loading: "加载中...",
    newProject: "新建项目",
    delete: "删除",
    confirm: Object.freeze({
      cancel: "取消",
      deleteConfirm: "确认删除"
    }),
    deleteConfirm: Object.freeze({
      title: "确认删除",
      message: "删除后项目将无法恢复，确定要继续吗？"
    })
  }),
  canvasTabs: Object.freeze({
    defaultCanvasName: "默认画布",
    newCanvasName: "画布 {index}",
    untitledCanvas: "未命名画布",
    downloadedWorkflow: "工作流已下载：{filename}",
    keepOneCanvas: "至少保留一个画布页面",
    closeCanvas: "关闭此画布",
    switchBlockedByTasks: "当前画布还有 {count} 个任务尚不能安全恢复，请等待任务取得远端 ID 或完成后再切换。",
    deleteBlockedByTasks: "当前画布仍有生成任务，请等待任务完成或取消后再删除。",
    contextMenu: Object.freeze({
      save: "保存",
      saveAs: "另存为...",
      collectProject: "收集当前项目",
      delete: "删除"
    }),
    deleteUnsaved: Object.freeze({
      title: "删除未保存画布？",
      message: "「{name}」有未保存改动，删除后这些改动会丢失。",
      cancel: "取消",
      delete: "删除"
    })
  }),
  projectDropdown: Object.freeze({
    unnamedCanvas: "未命名画布",
    loadedPackageBase: "加载的项目包",
    externalProject: "外部项目",
    packageFallback: "项目包",
    listSeparator: "、",
    listMore: "{items} 等 {count} 个",
    elapsedSeconds: "已用 {seconds} 秒",
    elapsedMinutesSeconds: "已用 {minutes}分{seconds}秒",
    packageProcessing: "正在处理项目包...",
    collectingCurrentProject: "正在收集当前项目",
    loadingProjectTitle: "正在加载项目",
    loadingProjectDefault: "正在加载项目...",
    readingLocalProject: "正在读取本地项目...",
    renderingCanvas: "正在渲染画布...",
    savingLocal: "另存本地项目中...",
    opened: "已打开：{name}",
    openLocalFailed: "打开本地项目失败",
    saveAsSucceeded: "另存成功：{filename}",
    saveAsFailed: "另存失败",
    readingProjectPackage: "正在读取项目包...",
    renderingProjectPackage: "正在渲染项目包...",
    readingProjectData: "正在读取项目数据...",
    savingCurrentSession: "正在保存当前项目的恢复会话...",
    switchBlockedByTasks: "当前项目还有 {count} 个任务尚不能安全恢复，请等待任务取得远端 ID 或完成后再切换。",
    confirmExternalDirty: "当前画布有未保存改动。\n\n是否放弃未保存改动并打开「{filename}」？",
    externalOpenFailed: "打开外部项目失败",
    loading: "加载中...",
    emptyProjects: "暂无保存的画布项目",
    confirm: "确定",
    cancel: "取消",
    deleted: "已删除",
    deleteFailed: "删除失败",
    renamed: "已重命名：{name}",
    renameFailed: "重命名失败",
    nameExists: "项目名已存在",
    renameAria: "重命名项目 {name}",
    listLoadFailed: "加载失败，请确认服务器运行中",
    loaded: "已加载：{name}",
    loadFailed: "加载失败",
    saveSucceeded: "保存成功：{name}",
    saveFailed: "保存失败",
    newCanvasCreated: "已新建画布",
    contextMenu: Object.freeze({
      rename: "重命名",
      delete: "删除"
    }),
    actions: Object.freeze({
      openLocal: "打开本地项目",
      saveAsLocal: "另存为本地项目",
      collectCurrent: "收集当前项目",
      loadPackage: "加载项目包"
    }),
    packageExport: Object.freeze({
      missingLocalWithSummary: "收集失败：缺少本地素材 {summary}",
      missingLocal: "收集失败：当前项目引用的本地素材文件不存在",
      remoteNotLocalizedWithSummary: "收集失败：远程素材未本地化 {summary}",
      remoteNotLocalized: "收集失败：当前项目还有未本地化的远程素材",
      missingOriginalVideos: "{count} 个历史原始视频缺失，已打包现存派生素材",
      failed: "收集当前项目失败",
      collected: "已收集项目包：{filename}",
      collectedWithWarning: "已收集项目包：{filename}（{warning}）"
    }),
    packageImport: Object.freeze({
      loaded: "已加载项目包：{name}",
      failed: "加载项目包失败"
    })
  }),
  assetManager: Object.freeze({
    title: "素材",
    libraryTitle: "素材库",
    back: "返回",
    close: "关闭",
    confirm: "确定",
    cancel: "取消",
    folders: "文件夹",
    favorites: "收藏",
    newFolder: "新建文件夹",
    folderNamePlaceholder: "输入文件夹名称",
    searchPlaceholder: "搜索素材",
    searchAria: "搜索素材库",
    emptyFolder: "该文件夹暂无素材",
    emptyFavorites: "暂无收藏素材",
    emptySearch: "没有匹配的素材",
    emptyLibrary: "素材库为空",
    loading: "正在加载素材…",
    reuseMaterial: "复用素材 {name} 到画布",
    doubleClickMaterial: "双击或拖拽素材 {name} 到画布",
    renameMaterialAria: "重命名素材 {name}",
    expandFolder: "展开文件夹 {name}",
    collapseFolder: "收起文件夹 {name}",
    expandMaterial: "展开素材 {name}",
    collapseMaterial: "收起素材 {name}",
    copySuffix: " 副本",
    deleteCategory: "删除文件夹",
    deleteCategoryAria: "删除文件夹 {category}",
    renameCategoryAria: "重命名文件夹 {category}",
    categoryLimit: "分类最多 {limit} 条",
    categorySaveFailed: "分类保存失败",
    categoryNameExists: "已存在同名文件夹",
    categoryNameUnavailable: "不能使用该文件夹名称",
    categoryRenamed: "文件夹已重命名",
    categoryRenameFailed: "文件夹重命名失败",
    deleteFailed: "删除失败",
    categoryHasAssets: "文件夹下还有素材，不能删除",
    categoryDeleted: "文件夹已删除",
    categoryDeleteFailed: "文件夹删除失败",
    thumbnailAlt: "缩略图",
    coverAlt: "封面",
    loadToCanvas: "载入到画布",
    deleteAsset: "删除素材",
    unnamedAsset: "未命名素材",
    newAsset: "新素材",
    assetAlt: "素材",
    unknownTime: "未知",
    uncategorized: "未分类",
    emptyCategory: "暂无{category}素材",
    tabsPrevAria: "查看左侧素材分类",
    tabsNextAria: "查看右侧素材分类",
    categories: Object.freeze({
      people: "角色",
      scenes: "场景",
      objects: "道具",
      styles: "风格",
      soundEffects: "音效",
      others: "Others",
      storyWorkspace: "剧本工作室",
      replacementStudio: "替换工作室",
      history: "出图历史",
      custom: "自定义"
    }),
    types: Object.freeze({
      text: "文本",
      audio: "音频",
      video: "视频",
      image: "图像",
      other: "节点"
    }),
    createPanel: Object.freeze({
      createTitle: "创建素材",
      saveTitle: "保存到素材库",
      updateTitle: "更新历史素材",
      createTab: "创建新素材",
      updateTab: "更新历史素材",
      create: "创建",
      save: "保存",
      creating: "创建中",
      overwrite: "覆盖",
      confirmOverwrite: "确认覆盖",
      saving: "保存中",
      join: "加入",
      joining: "加入中",
      confirmOverwriteAsset: "确认用当前选中内容覆盖「{name}」？",
      searchAssets: "搜索{category}素材",
      noMatchedAssets: "没有匹配的历史素材",
      noCategoryAssets: "还没有{category}素材",
      currentSelection: "当前选中内容",
      selectedNodes: "{count} 个节点",
      assetName: "素材名称",
      assetNamePlaceholder: "输入素材名称",
      category: "分类",
      categoryNamePlaceholder: "分类名称",
      folderListAria: "选择素材文件夹"
    }),
    errors: Object.freeze({
      noSavableNodes: "当前没有可保存的节点",
      selectAssetToUpdate: "请选择要更新的历史素材",
      assetUpdateFailed: "素材更新失败",
      assetCreateFailed: "素材创建失败",
      noJoinableNodes: "当前没有可加入的节点",
      selectAssetToJoin: "请选择要加入的历史素材",
      assetJoinFailed: "素材加入失败",
      nameRequired: "名称不能为空",
      renameFailed: "重命名失败"
    }),
    toasts: Object.freeze({
      assetUpdated: "素材已更新",
      assetCreated: "素材创建成功",
      assetJoined: "素材已加入",
      renamed: "已重命名",
      subAssetAdded: "已添加子素材到画布",
      assetAdded: "素材已添加到画布",
      favoriteUpdated: "收藏状态已更新",
      moved: "素材已移动",
      duplicated: "素材副本已创建",
      deleted: "素材已删除"
    }),
    detail: Object.freeze({
      meta: "{category} · {count} 节点 · 更新 {time}",
      content: "内容",
      empty: "此素材为空",
      childAssetName: "子素材{index}"
    }),
    menu: Object.freeze({
      aria: "素材操作",
      open: "打开素材 {name} 的更多操作",
      favorite: "收藏",
      unfavorite: "取消收藏",
      rename: "重命名",
      moveTo: "移动到…",
      duplicate: "创建副本",
      download: "下载",
      delete: "删除",
      confirmDelete: "确定删除「{name}」？",
      processing: "处理中…",
      noMoveTarget: "没有其他文件夹",
      noDownloadableMedia: "该素材没有可下载的媒体",
      downloadTitle: "下载素材「{name}」",
      downloadFailed: "素材下载失败",
      actionFailed: "素材操作失败"
    })
  }),
  sidebar: Object.freeze({
    toolbarLabel: "画布工具栏",
    assets: "素材",
    workflows: "工作流",
    rhAiApp: "自定义AI应用",
    files: "文件管理",
    nodeManager: "节点管理",
    tasks: "任务",
    taskBeta: "任务 beta",
    pin: "固定画布工具栏",
    autoHide: "自动隐藏画布工具栏",
    settings: "设置"
  }),
  nodeManager: Object.freeze({
    title: "节点管理",
    projectNameAria: "画布项目名称",
    renameProjectAria: "重命名画布项目",
    listAria: "画布节点列表",
    listTitle: "节点",
    search: "搜索节点",
    searchPlaceholder: "搜索节点",
    closeSearch: "关闭搜索",
    filter: "筛选节点",
    expandAll: "展开全部组",
    collapseAll: "收起全部组",
    expandGroup: "展开组「{name}」",
    collapseGroup: "收起组「{name}」",
    collapsePanel: "收起节点管理",
    empty: "没有匹配的节点",
    unnamed: "未命名节点",
    groupCount: "{count} 个节点",
    total: "共 {count} 个节点",
    filters: Object.freeze({
      all: "全部",
      text: "文本",
      video: "视频",
      image: "图像",
      audio: "音频"
    }),
    actions: Object.freeze({
      menuAria: "{name} 的节点操作",
      more: "更多操作",
      rename: "重命名",
      download: "下载",
      delete: "删除"
    }),
    toasts: Object.freeze({
      renameFailed: "节点重命名失败",
      deleteFailed: "节点删除失败",
      projectRenameFailed: "项目重命名失败",
      duplicateFailed: "复制节点失败"
    })
  }),
  settings: Object.freeze({
    nav: Object.freeze({
      title: "设置",
      general: "常规",
      canvasAlign: "画布与对齐",
      nodeBehavior: "节点创建与行为",
      fileSave: "文件与保存",
      apiInput: "模型服务(apikey)",
      objectStorage: "对象存储",
      cliLogin: "CLI接口登录",
      subscription: "订阅中心",
      shortcuts: "键盘快捷键"
    }),
    menu: Object.freeze({
      settings: "设置",
      tutorial: "使用教程",
      checkForUpdates: "检测更新",
      githubOfficial: "GitHub 官方",
      featureFeedback: "功能反馈",
      feedbackGroup: "反馈/交流群",
      about: "关于",
      openGithub: "打开 GitHub 官方仓库",
      openFeedback: "打开功能反馈",
      openFeedbackGroup: "打开反馈/交流群"
    }),
    feedbackGroup: Object.freeze({
      title: "反馈/交流群",
      qrAlt: "反馈/交流群二维码",
      qrLoadFailed: "二维码加载失败，可复制微信号添加。",
      desc: "如果失效请加:yumengashuo 备注来意"
    }),
    language: Object.freeze({
      label: "语言",
      desc: "选择界面显示语言，切换后立即生效",
      selectAria: "选择界面语言",
      options: Object.freeze({
        "zh-CN": "简体中文",
        "en-US": "English"
      })
    }),
    common: Object.freeze({
      on: "开",
      off: "关",
      shortcut: "快捷键："
    }),
    completionSound: Object.freeze({
      saved: "完成提示音设置已保存",
      saveFailed: "保存完成提示音设置失败：{error}",
      listUnsupported: "当前环境不支持读取系统提示音目录",
      readingSystemSounds: "正在读取系统提示音目录...",
      foundMp3Files: "找到 {count} 个 mp3 文件",
      emptyMp3Directory: "当前目录没有 mp3",
      listFailed: "读取系统提示音目录失败：{error}",
      openFolderUnsupported: "当前环境不支持打开系统提示音目录",
      openFolderFailed: "打开系统提示音目录失败：{error}",
      loadFailed: "加载完成提示音设置失败",
      unknownError: "未知错误"
    }),
    general: Object.freeze({
      title: "常规",
      appearance: "界面外观",
      inputPreferences: "输入偏好",
      imageInput: "图片输入",
      videoPlayback: "视频播放",
      completionNotifications: "完成通知",
      theme: Object.freeze({
        label: "应用主题",
        desc: "切换界面整体明暗外观",
        dusk: "暗夕",
        dawn: "晨雾",
        day: "白昼"
      }),
      promptActionSurface: Object.freeze({
        label: "提示词与动作栏质感",
        desc: "控制节点底部输入栏和浮动动作栏的背景样式",
        transparent: "透明",
        themed: "毛玻璃"
      }),
      canvasToolbarPlacement: Object.freeze({
        label: "画布工具栏位置",
        desc: "选择主工具栏显示在画布左侧、右侧或底部中央",
        left: "左侧",
        right: "右侧",
        bottom: "底部"
      }),
      nodeManagerPlacement: Object.freeze({
        label: "节点管理位置",
        desc: "选择节点管理面板显示在画布左侧、右侧或底部",
        left: "左侧",
        right: "右侧",
        bottom: "底部"
      }),
      leftSidebarAutoHide: Object.freeze({
        label: "画布工具栏自动隐藏",
        desc: "开启后画布工具栏会收回到所在屏幕边缘，鼠标移入或聚焦时展开"
      }),
      bottomLeftBarAutoHide: Object.freeze({
        label: "左下角栏自动隐藏",
        desc: "开启后左下角控制栏和小地图会收回到左下角，鼠标移入或聚焦时展开"
      }),
      canvasWheelBehavior: Object.freeze({
        label: "操作习惯",
        desc: "触控板模式：双指自由平移、捏合缩放；鼠标可用 Ctrl/⌘+滚轮缩放",
        zoom: "滚轮缩放",
        pan: "触控板模式"
      }),
      cursorSize: Object.freeze({
        label: "鼠标大小",
        desc: "选择光标显示大小",
        small: "小",
        medium: "中",
        large: "大"
      }),
      promptAttachmentButtonHidden: Object.freeze({
        label: "鼠标连线按钮是否隐藏",
        desc: "隐藏节点左上角添加参考连线入口，不影响已存在连接和 @ 引用",
        no: "否",
        yes: "是"
      }),
      promptPresetButtonHidden: Object.freeze({
        label: "提示词预设按钮是否隐藏",
        desc: "隐藏提示词输入框右上角的书本入口，仍可输入 / 打开预设",
        no: "否",
        yes: "是"
      }),
      inputFontSize: Object.freeze({
        label: "输入字体大小",
        desc: "调整节点提示词输入框的字体大小",
        small: "小",
        medium: "中",
        large: "大"
      }),
      promptEnterBehavior: Object.freeze({
        label: "提示词回车行为",
        desc: "切到 Enter 换行后，可用 Ctrl/⌘+Enter 发送",
        submit: "Enter 发送",
        newline: "Enter 换行"
      }),
      imageUploadQuality: Object.freeze({
        label: "图片入参上传质量",
        desc: "生成前参考图上传的压缩档位",
        standard: "标准",
        highFidelity: "高保真",
        originalFirst: "原图优先"
      }),
      videoAudioDefaultEnabled: Object.freeze({
        label: "视频音频",
        desc: "控制视频节点创建或打开时的音频播放状态"
      }),
      completionSound: Object.freeze({
        label: "生成完成提示音",
        desc: "生成任务成功后播放提示音",
        on: "开",
        off: "关"
      }),
      completionNotification: Object.freeze({
        label: "右下角通知",
        desc: "画布窗口未激活时，生成成功后显示系统通知",
        on: "开",
        off: "关"
      }),
      completionVolume: Object.freeze({
        label: "提示音音量",
        desc: "控制完成提示音播放大小"
      }),
      systemSound: Object.freeze({
        label: "系统提示音",
        desc: "把 .mp3 放到系统提示音目录，点击刷新后选择使用",
        selectAria: "选择提示音文件",
        openFolder: "打开系统提示音目录",
        refresh: "刷新提示音列表",
        preview: "试听提示音"
      })
    }),
    canvasAlign: Object.freeze({
      title: "画布与对齐",
      canvasDisplay: "画布显示",
      dragSnapping: "拖拽吸附",
      multiSelectAlign: "多选对齐",
      gridDots: Object.freeze({
        label: "网格点显示",
        desc: "只影响显示，不影响网格吸附"
      }),
      connectionLines: Object.freeze({
        label: "连接线显示",
        desc: "只控制画布上的连接线可见性，不影响节点连接关系"
      }),
      connectionLineStyle: Object.freeze({
        label: "连接线样式",
        desc: "切换画布连线和拖拽预览的路径样式",
        curve: "曲线",
        orthogonal: "直角线",
        straight: "直线"
      }),
      relatedHighlight: Object.freeze({
        label: "点击节点时高亮关联节点",
        desc: "选中节点后高亮直接连接的上下游节点和连线"
      }),
      highlightColor: Object.freeze({
        label: "高亮颜色",
        desc: "设置关联节点边框与光晕颜色"
      }),
      colors: Object.freeze({
        white: "白色",
        blue: "蓝色",
        green: "绿色",
        cyan: "青色",
        purple: "紫色",
        red: "红色",
        yellow: "黄色"
      }),
      snapGuides: Object.freeze({
        label: "辅助线吸附",
        desc: "开启后单节点拖拽时显示辅助线并自动吸附"
      }),
      snapGrid: Object.freeze({
        label: "网格吸附",
        desc: "开启后拖拽节点时按网格吸附对齐"
      }),
      alignTrigger: Object.freeze({
        label: "启动多选对齐功能",
        desc: "可设置为长按或点击快捷键触发中心对齐面板",
        hold: "长按开启",
        click: "点击开启",
        off: "关闭"
      }),
      alignGap: Object.freeze({
        label: "对齐间距",
        desc: "分布时固定首节点，后续节点按该间距顺排"
      })
    }),
    nodeBehavior: Object.freeze({
      title: "节点创建与行为",
      nodeDisplay: "节点显示",
      nodeInteraction: "节点交互",
      commentNote: "注释节点",
      newNode: "新节点生成",
      selectionMediaProperties: Object.freeze({
        label: "选中节点属性",
        desc: "显示选中媒体的属性；编辑提示词或文本时显示字数"
      }),
      titleFollowsZoom: Object.freeze({
        label: "标题跟随画布缩放",
        desc: "开启后普通节点标题会随画布缩放；关闭后保持屏幕大小不变"
      }),
      mediaResize: Object.freeze({
        label: "图像视频节点缩放",
        desc: "开启后可在图像/视频节点右下角拖拽缩放（不影响“恢复默认大小”快捷键）"
      }),
      promptBoxResize: Object.freeze({
        label: "允许提示词栏下拉",
        desc: "开启后可在提示词栏底边拖拽上下调整高度"
      }),
      commentJumpFocus: Object.freeze({
        label: "注释跳转聚焦位置",
        desc: "触发注释节点跳转快捷键时，节点中心落在画布视口的对应比例位置",
        x: "左右",
        y: "上下"
      }),
      nodeSpacing: Object.freeze({
        label: "创建节点间距",
        desc: "新节点生成时的水平偏移距离"
      }),
      nodeDirection: Object.freeze({
        label: "新节点连续生成方向",
        desc: "遇到空间重叠占用时向哪找出路",
        right: "向右",
        down: "向下"
      }),
      nodeAvoidOverlap: Object.freeze({
        label: "新节点自动避让",
        desc: "新节点生成时自动避让已有节点"
      })
    }),
    fileSave: Object.freeze({
      title: "文件与保存",
      lead: "配置项目、素材数据和生成输出的本地保存目录。授权、API Key 和用户设置固定保存在应用数据目录。",
      rootDir: Object.freeze({
        label: "保存根目录",
        desc: "项目、数据和输出会统一保存在该目录下",
        placeholder: "例如 D:\\SHUO Canvas Files",
        pickAria: "选择保存根目录",
        choose: "选择"
      }),
      subtitleRecognition: Object.freeze({
        engineLabel: "字幕识别引擎",
        engineDesc: "用于语音工作室的本地字幕识别模型",
        cpu: "CPU",
        gpu: "GPU 加速",
        saved: "字幕识别设置已保存",
        saveFailed: "保存字幕识别设置失败：{error}",
        readyToast: "字幕识别与说话人分离模型已就绪",
        prepareFailed: "准备字幕识别与说话人分离模型失败：{error}",
        runtimeCheckFailed: "检测字幕识别运行时失败：{error}",
        gpuInstallReadyToast: "GPU 加速组件已安装",
        gpuInstallFailed: "安装 GPU 加速组件失败：{error}",
        gpuUnavailableToast: "GPU 加速不可用，请切回 CPU 或安装 GPU 加速组件。",
        status: Object.freeze({
          download: "下载字幕识别组件 / 下载模型",
          downloading: "下载中 {percent}",
          installing: "安装中 {percent}",
          checking: "检测中",
          ready: "已就绪",
          retry: "重试",
          gpuRequired: "需安装 GPU 加速组件"
        }),
        runtime: Object.freeze({
          noTaskId: "模型准备任务没有返回任务 ID",
          checkingGpu: "正在检测 GPU 加速...",
          installingGpuTorch: "正在安装 CUDA 版 torch...",
          gpuUnavailable: "当前运行时无法使用 CUDA。可切回 CPU，或安装 GPU 加速组件。",
          torchCpuOnly: "当前运行时安装的是 CPU 版 torch，无法使用 GPU。请安装 CUDA 版 torch。",
          torchCpuOnlyWithGpu: "已检测到 NVIDIA GPU（{gpu}），但当前运行时安装的是 CPU 版 torch。请安装 CUDA 版 torch。",
          torchMissing: "当前运行时未安装 torch。请安装 GPU 加速组件或切回 CPU。",
          cudaUnavailable: "已安装 CUDA 版 torch，但 CUDA 初始化失败。请检查显卡驱动与 torch CUDA 版本。"
        })
      }),
      migration: Object.freeze({
        label: "迁移保存位置",
        preparing: "准备迁移文件",
        migrating: "正在迁移文件",
        creatingTask: "正在创建迁移任务",
        migrateOutput: "正在迁移输出文件保存路径",
        done: "迁移完成",
        processed: "已处理",
        copied: "已复制",
        skipped: "已跳过",
        failed: "失败",
        current: "当前：{file}",
        itemFailed: "迁移失败",
        noJobId: "迁移任务未返回 jobId",
        failedMessage: "文件迁移失败",
        summary: "迁移完成：复制 {copied} 个，跳过 {skipped} 个，失败 {failed} 个"
      }),
      validation: Object.freeze({
        chooseRoot: "请选择保存根目录",
        projectPath: "请输入项目保存路径",
        dataPath: "请输入数据文件保存路径",
        outputPath: "请输入输出文件保存路径"
      }),
      runtime: Object.freeze({
        saving: "迁移中...",
        choose: "选择",
        choosing: "选择中...",
        pickerUnsupported: "当前环境不支持选择目录",
        pickTitle: "选择保存根目录",
        pickFailed: "选择目录失败：{error}",
        loadFailed: "加载文件与保存路径失败",
        partialMigrationFailed: "保存位置已更新，但部分文件迁移失败。{summary}",
        saveFailed: "保存文件路径失败：{error}",
        unknownError: "未知错误"
      }),
      localCleanup: Object.freeze({
        label: "清理未引用文件",
        desc: "扫描缩略图、派生图、视频封面、波形和裁剪结果，只列出未被项目或节点引用的本地文件",
        scan: "扫描未引用文件",
        trash: "移到回收站",
        count: "可清理文件",
        size: "预计可清理",
        idle: "点击扫描后再选择是否清理",
        scanning: "正在扫描本地素材引用...",
        scanBusy: "扫描中...",
        scanSuccess: "扫描完成，已列出可清理文件",
        scanEmpty: "扫描完成，未发现可清理文件",
        trashing: "正在移到系统回收站...",
        trashBusy: "处理中...",
        confirmPrefix: "确认将 ",
        success: "未引用文件已移到回收站"
      }),
      legacyCleanup: Object.freeze({
        label: "清理旧 C 盘资源",
        desc: "路径迁移后，扫描旧默认保存位置里的项目素材、输出和缓存文件，确认后移到系统回收站",
        scan: "扫描旧位置",
        trash: "移到回收站",
        count: "可清理文件",
        size: "预计可清理",
        idle: "路径迁移完成后，可扫描旧默认保存位置",
        scanning: "正在扫描旧默认保存位置...",
        scanBusy: "扫描中...",
        scanSuccess: "扫描完成，已列出旧位置可清理文件",
        scanEmpty: "扫描完成，旧位置没有可清理文件",
        trashing: "正在移到系统回收站...",
        trashBusy: "处理中...",
        confirmPrefix: "确认将旧位置中的 ",
        success: "旧位置文件已移到回收站"
      }),
      cleanupRuntime: Object.freeze({
        notSupported: "当前环境不支持本地素材清理",
        scanIncomplete: "扫描未完成",
        scanEmptySummary: "已扫描 {candidateCount} 个本地文件，未发现可清理文件",
        scanFoundSummary: "已扫描 {candidateCount} 个本地文件，发现 {orphanCount} 个可清理文件，预计可清理 {orphanBytes}",
        mediaKind: "media",
        moreFiles: "还有 {count} 个文件未展开显示",
        scanFailed: "扫描失败",
        scanFailedDetail: "扫描失败：{error}",
        confirmTrash: "{prefix}{count} 个文件移到系统回收站？\n预计可清理 {bytes}。",
        trashedMessage: "已移到回收站 {count} 个文件，{bytes}",
        trashPartial: "{message}；跳过 {skipped} 个，失败 {failed} 个",
        trashPartialToast: "部分文件未能移到回收站",
        trashFailed: "清理失败",
        trashFailedDetail: "清理失败：{error}"
      }),
      diagnostics: Object.freeze({
        label: "错误日志与诊断",
        desc: "生成诊断包后可直接发送给开发者排查问题，不包含项目文件、素材或 API Key",
        create: "生成诊断包",
        openLogs: "打开日志目录",
        creating: "生成中...",
        collecting: "正在收集日志并生成诊断包...",
        created: "诊断包已生成",
        createdWithFile: "诊断包已生成：{filename}",
        createFailed: "生成诊断包失败",
        openLogsFailed: "打开日志目录失败"
      }),
      save: "保存"
    }),
    objectStorage: Object.freeze({
      title: "对象存储",
      lead: "选择正在使用的对象存储厂商，程序会自动处理各厂商的连接差异。",
      enabled: Object.freeze({
        label: "使用自定义对象存储"
      }),
      providerPicker: Object.freeze({
        aria: "对象存储厂商"
      }),
      providers: Object.freeze({
        cloudflareR2: Object.freeze({
          title: "Cloudflare R2",
          badge: "R2",
          desc: "填写 R2 的 S3 API 地址、存储桶和公开访问域名。",
          console: "打开 R2 控制台",
          accessKeyIdLabel: "访问密钥 ID（Access Key ID）",
          secretAccessKeyLabel: "秘密访问密钥（Secret Access Key）"
        }),
        tencentCos: Object.freeze({
          title: "腾讯云 COS",
          badge: "COS",
          desc: "Bucket 请填写包含 APPID 的完整名称；建议使用已配置的自定义域名或 CDN 域名。",
          console: "打开 COS 控制台",
          accessKeyIdLabel: "密钥 ID（SecretId）",
          secretAccessKeyLabel: "密钥（SecretKey）"
        }),
        aliyunOss: Object.freeze({
          title: "阿里云 OSS",
          badge: "OSS",
          desc: "填写 Bucket 所在地域，程序会自动生成对应的 S3 接口地址。",
          console: "打开 OSS 控制台",
          accessKeyIdLabel: "访问密钥 ID（AccessKey ID）",
          secretAccessKeyLabel: "访问密钥（AccessKey Secret）"
        }),
        s3Compatible: Object.freeze({
          title: "其他 S3 存储",
          badge: "S3",
          desc: "用于其他兼容 S3 的存储服务，可手动填写地域和 Bucket 地址方式。",
          accessKeyIdLabel: "访问密钥 ID（Access Key ID）",
          secretAccessKeyLabel: "秘密访问密钥（Secret Access Key）"
        })
      }),
      s3: Object.freeze({
        title: "S3 兼容存储"
      }),
      fields: Object.freeze({
        endpoint: "S3 API（Endpoint）",
        region: "地域（Region）",
        bucket: "存储桶（Bucket）",
        accessKeyId: "访问密钥 ID（Access Key ID）",
        secretAccessKey: "秘密访问密钥（Secret Access Key）",
        publicBaseUrl: "公开访问地址（Public URL）",
        publicBaseUrlDesc: "该地址必须能直接打开文件；私有存储桶请为 SHUO-Canvas 目录开放读取或使用已配置的 CDN 域名。",
        addressingStyle: "Bucket 地址方式"
      }),
      placeholders: Object.freeze({
        endpoint: "https://<account-id>.r2.cloudflarestorage.com",
        region: "ap-guangzhou",
        bucket: "aicanvas-assets",
        accessKeyId: "请输入访问密钥 ID",
        secretAccessKey: "请输入秘密访问密钥",
        publicBaseUrl: "https://assets.example.com"
      }),
      addressing: Object.freeze({
        path: "Bucket 在路径中",
        virtualHosted: "Bucket 在域名中"
      }),
      actions: Object.freeze({
        tutorial: "使用教程",
        register: "Cloudflare R2 注册",
        test: "测试连接",
        testing: "测试中...",
        saving: "保存中..."
      }),
      status: Object.freeze({
        disabled: "当前未启用。",
        enabled: "当前已启用，字段修改会自动保存。",
        testing: "正在上传并回读临时测试图片...",
        testSuccess: "连接测试通过，上传和公网读取均正常。",
        ready: "已就绪",
        testCleanupWarning: "临时测试文件未能自动删除，请检查删除权限或生命周期规则。",
        testFailed: "连接测试失败：{error}",
        testRequired: "请先完成并通过测试连接，测试通过后才能开启对象存储。",
        changedRequiresRetest: "对象存储配置已保存。连接验证已失效，已自动关闭，请重新测试连接。",
        savedEnabled: "对象存储已启用，后续公共中转图片将自动使用此存储。",
        savedDisabled: "对象存储已关闭，已恢复现有上传方式。",
        saveSuccess: "对象存储设置已保存",
        saveFailed: "对象存储设置保存失败：{error}",
        providerSelected: "已切换到 {provider}。",
        providerSelectedDisabled: "已切换到 {provider}。请填写并测试连接后再开启。",
        unknownError: "未知错误"
      })
    }),
    cliLogin: Object.freeze({
      title: "CLI接口登录",
      lead: "管理通过本地 CLI 组件授权的服务账号。",
      localAccount: "本机账号",
      statusLabel: "登录状态",
      checking: "检测中...",
      login: "登录",
      logout: "退出登录",
      providers: Object.freeze({
        codex: Object.freeze({
          title: "OpenAI CLI",
          description: "未登录时，点击登录后按终端提示在浏览器完成 ChatGPT 官方登录；不要选择 API Key 或 Access Token。"
        })
      })
    }),
    apiInput: Object.freeze({
      title: "模型服务(apikey)",
      lead: "只需连接准备使用的一个模型服务，不需要全部填写。未配置对应服务时，模型不会提交生成请求。",
      apiKey: "API 密钥",
      apiToken: "API 令牌",
      endpoint: "接口地址",
      testConnection: "测试连接",
      getKey: "获取 Key",
      save: "保存",
      catalog: Object.freeze({
        categoryAria: "按节点类型筛选模型服务",
        categoryAll: "全部",
        categoryText: "文本",
        categoryImage: "图像",
        categoryVideo: "视频",
        categoryAudio: "音频",
        providerAria: "模型服务厂商",
        routeLabel: "服务线路",
        routeAria: "选择服务线路",
        routeDomestic: "国内版",
        routeInternational: "国际版",
        allRoutesReady: "全部已通过",
        routesReady: "已通过 {count}/{total}"
      }),
      readiness: Object.freeze({
        title: "先连接一个模型服务",
        checking: "正在检查已保存的模型服务配置...",
        checkingShort: "检查中",
        requiredShort: "需配置",
        empty: "尚未连接模型服务。选择下面任意一个厂商，填写并保存 API Key 后即可生成。",
        emptyShort: "未配置",
        ready: "已连接 {count} 个模型服务，可使用对应厂商的模型。",
        readyShort: "已配置 {count} 个"
      }),
      route: Object.freeze({
        label: "线路",
        apimartAria: "APIMart 线路",
        domestic1: "国内线路1",
        domestic2: "国内线路2",
        overseas: "海外线路",
        custom: "自定义线路：{value}"
      }),
      customProvider: Object.freeze({
        title: "自定义中转站模型",
        lead: "先识别 /v1/models，再选择要启用到节点菜单里的模型；未验证模型仅发送必要参数。",
        addProvider: "新增中转站",
        editorTitle: "配置中转站",
        editorNote: "填写地址和 Key 后识别模型。模型参数未验证前使用最小兼容模式。",
        refreshBundles: "刷新",
        refreshBundlesTitle: "刷新自定义清单",
        baseUrl: "Base URL",
        baseUrlPlaceholder: "https://xxx.com",
        apiKey: "API Key",
        apiKeyPlaceholder: "sk-...",
        documentationUrl: "API 文档地址 / 本地文档（可选）",
        documentationUrlPlaceholder: "可选；留空时从 Base URL 自动查找文档",
        documentationAgentHint: "留空时会从 Base URL 网站首页和常见 OpenAPI / Swagger 路径自动查找文档。自动查找失败时，可填写 Apifox 等文档站入口，或选择本地 Markdown、文本、JSON、YAML 文档。",
        selectDocumentationFile: "选择文档",
        localDocumentationSelected: "本地文档：{name}",
        localDocumentationTooLarge: "本地 API 文档不能超过 2 MB。",
        localDocumentationUnsupported: "请选择 Markdown、TXT、JSON、YAML 或 HTML 文档。",
        localDocumentationReadFailed: "读取本地 API 文档失败：{error}",
        discover: "识别模型",
        addModels: "添加模型",
        saveModels: "保存模型",
        verifyParameters: "验证模型参数",
        verifyingParameters: "正在验证参数...",
        documentationUrlRequired: "请先填写 API 文档地址，或选择一个本地文档。",
        documentationAutoDiscoveryFailed: "未能从 Base URL 自动找到 API 文档，请补充文档地址或选择本地文档。",
        parametersVerified: "参数验证完成：{documented} 个模型已根据文档设置参数。",
        parametersVerifiedPartial: "参数验证部分完成：{documented}/{count} 个模型已设置参数，其余模型仍使用最小参数。",
        parameterVerificationFailed: "模型参数验证失败：{error}",
        providerDraftInitial: "中转站 1",
        providerDraftTitle: "中转站 {index}",
        deleteProviderDraft: "删除中转站",
        providerDisplayName: "厂商显示名",
        providerDisplayNamePlaceholder: "默认使用网址名",
        selectModels: "选择要添加的模型",
        selectionHint: "选中的模型会进入对应节点菜单；参数未验证时不会发送比例、分辨率、数量等推测字段。",
        capabilityUnverified: "参数未验证",
        capabilityUnverifiedHint: "当前只启用模型和提示词等必要字段，避免推测参数导致请求失败。",
        capabilityDocumented: "文档已识别",
        capabilityDocumentedHint: "参数来自 API 文档并已通过清单校验，但尚未发送真实计费请求验证。",
        modelKindLabel: "模型分类：",
        classifyBeforeSelecting: "请先在上方选择模型分类",
        vipRequired: "自定义中转站是 VIP 功能，请先激活授权。",
        discovering: "发现中...",
        analyzingDocumentation: "正在分析 API 文档...",
        validating: "校验中",
        saved: "已保存 {count} 个模型",
        savedWithUnverified: "已保存 {count} 个模型（{unverified} 个模型参数未验证，使用最小兼容参数）",
        savedDocumented: "已保存 {count} 个模型，其中 {documented} 个已从文档识别参数",
        documentationAgentUnavailable: "文档不是 OpenAPI，且尚未配置画布 Agent 文本模型；已按最小兼容参数保存。",
        documentationNoMatchingProfile: "文档中没有找到与所选模型类型匹配的接口，相关模型仍按最小兼容参数保存。",
        documentationAgentInaccessible: "Agent 无法打开或继续浏览该 API 文档网页。请确认当前 Agent 模型支持网页访问，并检查文档是否需要登录。",
        documentationSelectedModelNotFound: "Agent 已按当前选中的模型定向查找，但文档中没有找到该模型对应的接口。",
        documentationAsyncLifecycleUnsupported: "已找到该模型接口，但文档缺少完整的任务轮询信息（taskId、状态接口或结果路径），暂时只能按最小参数保存。",
        documentationAnalysisFailed: "API 文档分析失败：{error}；已按最小兼容参数保存。",
        savedBundles: "已添加的模型",
        notLoaded: "未加载",
        noBundles: "还没有保存自定义清单",
        loadingBundles: "正在读取自定义清单...",
        resultSummary: "发现 {count} 个模型，可选择 {supported} 个，未知 {unknown} 个",
        unsupportedSummary: "{count} 个模型暂不支持注册",
        bundleMeta: "{modelCount} 个模型 · {kindList}",
        bundleTitle: "{providerName} -> {models}",
        bundleExpand: "展开",
        bundleCollapse: "收起",
        deleteBundle: "删除",
        deleteBundleTitle: "删除自定义清单",
        deleteSuccess: "自定义清单已删除",
        fillRequired: "请填写 Base URL 和 API Key",
        apiUnsupported: "当前版本未接入自定义中转站接口",
        noModelsDiscovered: "没有识别到可选择的模型",
        noModelsInFilter: "当前分类没有可选择的模型",
        noModelsSelected: "请先选择至少一个模型",
        configSavedNoSupportedModels: "已保存中转站配置；请在“未知”分类中为模型指定类型后再添加。",
        duplicateProviderDomain: "已经存在相同域名的中转站，请不要重复添加同一个域名。",
        noSupportedModels: "没有可注册的 text / image / video / audio 模型",
        loadBundlesFailed: "读取自定义清单失败: {error}",
        saveFailed: "自定义中转站保存失败: {error}",
        deleteFailed: "删除自定义清单失败: {error}",
        kindAll: "全部",
        kindText: "文本",
        kindImage: "图像",
        kindVideo: "视频",
        kindAudio: "音频",
        kindEmbedding: "Embedding",
        kindUnknown: "未知",
        modelsMore: "还有 {count} 个"
      }),
      diagnostics: Object.freeze({
        skipped: "跳过",
        passed: "通过",
        failed: "失败",
        partialPassed: "部分通过",
        notPassed: "未通过",
        step: "步骤",
        testUnsupported: "当前版本不支持连接测试",
        fillProviderKey: "请先填写该厂商的 API Key",
        fillProviderUrl: "请先填写该厂商的接口地址",
        fillOneProviderKey: "请先填写至少一个厂商的 API Key",
        testing: "测试中",
        testingBusy: "测试中...",
        testFailed: "连接测试失败",
        testPassed: "连接测试通过",
        testNotPassed: "连接测试未通过",
        providerPassed: "{label} 连接测试通过",
        allPassed: "API 连接测试通过",
        providerFailed: "连接测试未通过：{label} - {error}",
        testFailedWithDetail: "连接测试失败: {error}",
        unknownError: "未知错误",
        loadFailed: "加载 API 配置失败: {error}",
        saveSuccess: "API 配置已保存",
        saveFailed: "保存失败: {error}"
      }),
      statuses: Object.freeze({
        unconfigured: "未配置",
        configured: "已填写，未验证",
        configuredCount: "已配置 {count}/{total}",
        deprecated: "准备下架",
        unavailable: "不可用",
        frontendPlaceholder: "前端占位",
        oauthLogin: "OAuth 登录"
      }),
      providers: Object.freeze({
        binghuo: Object.freeze({
          title: "便宜渠道bh",
          testTitle: "测试便宜渠道bh连接",
          getTitle: "前往便宜渠道bh获取 API Token",
          guideButtonTitle: "查看便宜渠道bh使用攻略",
          guideButton: "新手使用教程"
        }),
        apimart: Object.freeze({
          testTitle: "测试 APIMart 连接",
          getTitle: "前往 APIMart 获取 API Key",
          guideButtonTitle: "查看 APIMart API Key 获取攻略",
          guideButton: "新手使用教程",
          close: "关闭",
          guideTitle: "怎么获取 APIMart API Key",
          guideSubtitle: "登录 APIMart 后，点右上角头像打开菜单，选择“API 密钥”，再创建或复制密钥。",
          guideAlt: "APIMart API Key 获取步骤长图",
          guideChecklistTitle: "操作步骤",
          guideNote1: "点击“获取 Key”打开 APIMart；已有账号直接登录，没有账号先注册。",
          guideNote2: "登录后点击右上角头像（如 G），弹出菜单后点“API 密钥”。",
          guideNote3: "进入“API 密钥”页面后，点右上角“+ 创建 API 密钥”；已有密钥也可以点复制图标。",
          guideNote4: "复制 sk- 开头的密钥，回到 SHUO Canvas 的 APIMart 输入框粘贴；线路默认国内线路 1，不通再切换。",
          openConsole: "打开 APIMart",
          openSettings: "去设置填写"
        }),
        minimax: Object.freeze({
          domesticName: "MiniMAX官方（国内版）",
          internationalName: "MiniMAX官方（国际版）",
          domesticTestTitle: "测试 MiniMAX 官方国内版连接",
          internationalTestTitle: "测试 MiniMAX 官方国际版连接",
          domesticGetTitle: "前往 MiniMAX 官方国内版获取 API Key",
          internationalGetTitle: "前往 MiniMAX 官方国际版获取 API Key"
        }),
        agnes: Object.freeze({
          domesticName: "Agnes AI（国内版）",
          internationalName: "Agnes AI（国际版）",
          domesticTestTitle: "测试 Agnes AI 国内版连接",
          internationalTestTitle: "测试 Agnes AI 国际版连接",
          testTitle: "测试 Agnes AI 连接",
          getTitle: "前往 Agnes AI 获取 API Key",
          guideButtonTitle: "查看 Agnes AI API Key 获取攻略",
          guideButton: "新手使用教程",
          close: "关闭",
          guideTitle: "怎么获取 Agnes AI API Key",
          guideSubtitle: "打开 Agnes 平台的 API 密钥页，左侧“设置”里点击“API 密钥”，再点“创建新的密钥”并复制个人密钥。",
          guideAlt: "Agnes AI API Key 获取步骤长图",
          guideChecklistTitle: "操作步骤",
          guideNote1: "点击“获取 Key”打开 Agnes 平台；未登录时先登录，登录后进入设置里的“API 密钥”页。",
          guideNote2: "页面左侧“设置”分组下点击“API 密钥”，主区域标题会显示“API 密钥”。",
          guideNote3: "点击“创建新的密钥”，在个人密钥表格里复制 sk- 开头的密钥；下方“企业密钥”是企业账号再用。",
          guideNote4: "回到 SHUO Canvas 的设置 > API Key > Agnes AI，粘贴密钥后点击测试连接。",
          openConsole: "打开 Agnes 密钥页",
          openSettings: "去设置填写"
        }),
        volcengine: Object.freeze({
          title: "火山方舟",
          testTitle: "测试火山方舟连接",
          getTitle: "前往火山方舟获取 API Key",
          guideButtonTitle: "查看火山方舟 API Key 获取攻略",
          guideButton: "新手使用教程",
          close: "关闭",
          guideTitle: "怎么获取火山方舟 API Key",
          guideSubtitle: "先在火山方舟“开通管理”里开通要用的模型服务，再进入“API Key 管理”创建或复制 Key。",
          guideAlt: "火山方舟 API Key 获取步骤长图",
          guideChecklistTitle: "操作步骤",
          guideNote1: "进入火山方舟控制台后，左侧点击“开通管理”。未登录时先完成火山引擎账号登录。",
          guideNote2: "在“开通管理”里找到 SHUO Canvas 要用的模型，点击右侧“开通服务”；也可以使用页面右上角“一键开通所有模型”。",
          guideNote3: "开通后进入“API Key 管理”，创建 API Key 或复制已有可用 Key。",
          guideNote4: "回到 SHUO Canvas 的设置 > API Key > 火山方舟，粘贴密钥后点击测试连接。",
          openConsole: "打开火山方舟开通管理",
          openSettings: "去设置填写"
        }),
        volcengineSpeech: Object.freeze({
          title: "豆包语音",
          testTitle: "查看豆包语音开通情况",
          getTitle: "前往豆包语音 API Key 管理",
          guideButtonTitle: "查看豆包语音开通与 API Key 获取攻略",
          guideButton: "新手使用教程",
          apiKeyPlaceholder: "豆包语音 X-Api-Key，不是火山方舟 Key..."
        }),
        runninghub: Object.freeze({
          domesticName: "RunningHUB（国内版）",
          internationalName: "RunningHUB（国际版）",
          testTitle: "测试 RunningHUB 连接",
          getTitle: "前往 RunningHUB 获取 API Key",
          guideButtonTitle: "查看 RunningHUB API Key 获取攻略",
          guideButton: "新手使用教程",
          setDefaultSite: "设为默认站点",
          workflowApiKey: "工作流 API 密钥（消费级-会员）",
          workflowApiKeyHint: "调用工作流 / AI 应用，消耗账户积分（RH 币）。",
          modelApiKey: "模型 API 密钥（企业级-共享）",
          modelApiKeyHint: "调用模型 API，消耗钱包余额。",
          modelApiKeyPlaceholder: "模型 API Key...",
          close: "关闭",
          guideTitle: "怎么获取 RunningHUB API Key",
          guideSubtitle: "先从 RunningHUB 官网进入，点顶部 API，再点顶部“密钥”。消费级-会员 Key 调用工作流并消耗积分；企业级-共享 Key 调用模型 API 并消耗钱包余额。",
          guideAlt: "RunningHUB API Key 获取步骤长图",
          guideChecklistTitle: "操作步骤",
          guideNote1: "打开 RunningHUB 官网，点击顶部导航里的 API，再点击 API 页面顶部的“密钥”。",
          guideNote2: "在“消费级-会员”页复制 API Key，填到工作流 API 密钥，用于调用工作流 / AI 应用。",
          guideNote3: "切到“企业级-共享”页复制 API Key，填到模型 API 密钥，用于调用模型 API。",
          guideNote4: "如果页面要求登录，请先登录 RunningHub；不要把 Key 发给别人。",
          openConsole: "打开 RunningHUB 官网",
          openSettings: "去设置填写"
        }),
        comfyui: Object.freeze({
          title: "ComfyUI 本地/云端",
          testTitle: "测试 ComfyUI 连接",
          endpoint: "ComfyUI 地址",
          localEndpoint: "ComfyUI 本地地址",
          cloudEndpoint: "ComfyUI 云端地址",
          placeholder: "127.0.0.1:8188",
          cloudPlaceholder: "把云端Comfyui地址栏复制到此处",
          hint: "本地地址默认 127.0.0.1:8188；云端地址用于已启动的云平台 ComfyUI。"
        }),
        grsai: Object.freeze({
          testTitle: "测试 GRSAI 连接",
          getTitle: "前往 GRSAI 获取 API Key",
          guideButtonTitle: "查看 GRSAI API Key 获取攻略",
          guideButton: "新手使用教程",
          close: "关闭",
          guideTitle: "怎么获取 GRSAI API Key",
          guideSubtitle: "打开 GRSAI 后台左侧栏的 API Management 分组，点击“API Key”，在页面里创建或复制 Key。",
          guideAlt: "GRSAI API Key 获取步骤长图",
          guideChecklistTitle: "操作步骤",
          guideNote1: "点击“获取 Key”打开 GRSAI 的 API Key 页面；未登录时页面会提示“请先登录”，点“立即登录”。",
          guideNote2: "登录后左侧栏找到 API Management 分组，点击下面的“API Key”。",
          guideNote3: "进入“API Key / 管理您的API Key”页面后，点“创建API Key”或复制已有 Key；不要复制余额或套餐文字。",
          guideNote4: "回到 SHUO Canvas 的设置 > API Key > GRSAI，粘贴密钥后点击测试连接。",
          openConsole: "打开 GRSAI API Key",
          openSettings: "去设置填写"
        }),
        ppio: Object.freeze({
          title: "派欧云 (PPIO)",
          testTitle: "测试 PPIO 连接",
          getTitle: "前往派欧云获取 API Key"
        }),
        openai: Object.freeze({
          title: "OpenAI兼容的API格式",
          testTitle: "测试 OpenAI 兼容连接",
          formatHintAria: "OpenAI 格式说明",
          hintPrefix: "正确的 OpenAI 通用接口格式 是在",
          hintSuffix: "后面 例如："
        }),
        dreamina: Object.freeze({
          title: "即梦 （目前仅高级会员可用）",
          badge: "即",
          logoAlt: "即梦",
          noticeAria: "即梦使用说明",
          noticeTitle: "使用前需要知道",
          noticeEntitlement: "生成任务会消耗账户权益或积分，目前仅供高级会员以上可用",
          noticeCreditPolicy: "您使用即梦 CLI 生成内容所需消耗的积分，与即梦网页端 Agent 模式下相同生成能力所消耗的积分标准一致，具体以产品规则及积分消耗记录为准",
          loginStatus: "登录状态",
          checking: "检测中...",
          readingStatus: "正在读取即梦状态...",
          accountCredit: "账户额度",
          creditPlaceholder: "登录后显示余额",
          login: "登录",
          logout: "退出登录",
          desc: "使用即梦官方 OAuth 授权网页登录；在网页完成确认后，系统会自动同步登录状态。",
          modalAria: "即梦登录",
          closeAria: "关闭即梦登录窗口",
          accountBadge: "即梦账号",
          starting: "正在启动即梦登录...",
          qrAlt: "即梦登录二维码",
          waitText: "在授权网页完成登录后，系统会自动同步状态",
          retry: "重新拉起登录",
          guideTitle: "OAuth 网页授权",
          stepAuth: "打开授权网页并完成登录确认",
          authUrlAria: "即梦授权链接",
          open: "打开授权网页",
          copy: "复制",
          viewLogin: "查看登录",
          relogin: "重新登录",
          waitingAuthUrl: "等待授权链接...",
          missingValue: "未检测到{label}，请稍候后重试",
          browserOpenFailedCopied: "浏览器未能直接打开，已复制{label}",
          browserOpenFailedCopyFirst: "浏览器未能直接打开，请先复制{label}",
          copySuccess: "{label}已复制",
          copyFailed: "{label}复制失败，请手动选中文本复制",
          authLinkLabel: "即梦授权链接",
          jsonParseFailed: "JSON 解析失败",
          jsonPasteRequired: "请先粘贴第 2 步最终跳转页面返回的完整 JSON",
          jsonMustBeObject: "JSON 必须是对象格式",
          jsonFormatInvalid: "JSON 格式不正确，请粘贴第 2 步最终跳转页面返回的完整 JSON",
          jsonImportUnsupported: "当前版本不支持 JSON 导入，请升级后重试",
          importFailed: "导入登录态失败",
          importedSyncing: "登录态已导入，正在同步状态",
          qrLoadFailed: "二维码图片加载失败",
          creditTotal: "总额度 {total}（会员 {vip} / 赠送 {gift} / 购买 {purchase}）",
          loginSuccess: "即梦已登录成功",
          loginReused: "当前即梦登录态仍然有效",
          loginFailed: "即梦登录失败",
          statusPreparing: "准备中",
          statusWaitingAuth: "等待授权",
          statusLoggingIn: "登录中",
          statusLoggedIn: "已登录",
          statusLoggedOut: "未登录",
          waitBrowserFailed: "浏览器未能自动打开，请点击“打开授权网页”完成登录确认。",
          waitOpenAuth: "请点击“打开授权网页”完成登录确认；系统会自动同步登录状态。",
          waitPendingTooLong: "登录等待时间较长，请确认已在授权网页完成登录。",
          waitQrDeprecated: "二维码登录已不再作为主流程，请使用下方 OAuth 授权网页。",
          waitFailed: "登录失败，请重新打开授权网页完成确认。",
          waitConfirm: "请在授权网页完成即梦登录确认。",
          waitUseOAuth: "请使用 OAuth 授权网页完成登录。",
          waitDone: "登录完成，正在更新账户信息...",
          waitOAuthPreparing: "正在等待即梦返回授权链接，请稍候。",
          waitPreparing: "正在准备即梦登录，请稍候...",
          modalSynced: "即梦已登录成功，正在同步账号状态...",
          modalBrowserFailed: "浏览器未能自动打开，请点击下方按钮打开授权网页。",
          modalOAuthStarted: "授权网页已准备好，请点击“打开授权网页”完成登录。",
          modalPendingTooLong: "登录流程耗时较长，请确认已在授权网页完成登录。",
          modalQrAbnormal: "二维码显示异常，请改用下方 OAuth 授权网页。",
          modalRetryAuth: "登录暂未完成，请重新打开授权网页。",
          modalAuthorizeOnPage: "请打开即梦授权网页并完成登录确认",
          modalScanQr: "请使用抖音 App 扫描下方二维码",
          modalProcessing: "正在处理即梦登录...",
          guideCollapse: "收起登录引导",
          guideRecommended: "登录引导（推荐）",
          guide: "登录引导",
          notLoggedInHint: "未登录，点击登录即可使用",
          fetchStatusFailed: "获取即梦状态失败",
          startFailed: "即梦登录启动失败",
          reloginStarted: "即梦重新登录已启动，请打开授权网页完成登录确认",
          loginStarted: "即梦登录已启动，请打开授权网页完成登录确认",
          logoutFailed: "退出即梦登录失败",
          loggedOut: "已退出即梦登录"
        })
      })
    }),
    subscription: Object.freeze({
      title: "订阅中心",
      statusLabel: "订阅状态",
      inactive: "未激活",
      loading: "同步中...",
      active: "已激活",
      vipAuthorization: "VIP授权",
      annualVipAuthorization: "年费VIP授权",
      expired: "已过期",
      expirePrefix: "到期时间：",
      inputLabel: "输入 CDKEY",
      cdkeyPlaceholder: "例如 DEMO-V54-365D",
      contact: "联系管理员获取授权码",
      clearAuthorization: "清空授权",
      activateCdkey: "激活 CDKEY",
      gate: Object.freeze({
        aria: "订阅解锁",
        title: "需要VIP授权",
        desc: "联系管理员获取授权码，或直接输入 CDKEY 立即解锁。",
        cdkeyPlaceholder: "输入 CDKEY",
        cancel: "取消",
        activate: "激活"
      }),
      contactInfo: Object.freeze({
        wechatLabel: "微信：",
        wechatAria: "管理员微信",
        qrNotConfigured: "管理员二维码暂未配置，请稍后重试。",
        qrAlt: "管理员微信二维码",
        qrLoadFailed: "二维码加载失败，可复制微信号添加。"
      }),
      missingInstallIdSync: "缺少 installId，无法同步订阅状态",
      syncFailed: "订阅状态同步失败",
      enterCdkey: "请输入 CDKEY",
      missingInstallIdActivate: "缺少 installId，无法激活",
      activationFailed: "CDKEY 激活失败",
      activated: "CDKEY 激活成功",
      submitted: "已提交，正在校验授权...",
      serverNotConfirmed: "服务器未确认激活，请稍后重试",
      clearConfirm: "确定要清空当前授权吗？清空后当前设备会回到未激活状态。",
      clearing: "清理中...",
      clearSuccess: "已清空当前授权",
      clearFailed: "清空授权失败",
      checking: "校验中",
      gateFailed: "激活校验失败",
      activeSyncTip: "订阅状态已激活，正在同步后请再试一次"
    }),
    shortcuts: Object.freeze({
      title: "键盘快捷键",
      presetLabel: "预设方案",
      desc: "自定义你的创作效率。点击下方动作对应的按键可录制新快捷键。",
      presets: Object.freeze({
        default: "默认预设",
        ashuo: "阿硕预设",
        custom: "用户自定义"
      }),
      escExitRecording: "退出录制",
      closePanel: "关闭面板",
      resetDefault: "恢复默认设置",
      recording: "录制中...",
      unset: "未设置",
      searchPlaceholder: "搜索操作、分组或按键",
      searchAria: "搜索快捷键",
      noResults: "没有找到匹配的快捷键",
      presetSwitched: "已切换预设：{preset}",
      conflict: "快捷键冲突：已被「{label}」占用",
      updated: "快捷键已更新",
      restored: "已恢复默认快捷键",
      groups: Object.freeze({
        general: "通用",
        editSelection: "编辑与选择",
        settingToggles: "设置开关",
        createNodes: "创建节点",
        sidebar: "侧边栏",
        brushTools: "画笔功能",
        imageTools: "图像功能",
        videoTools: "视频功能",
        audioTools: "音频功能",
        clipTools: "剪辑功能",
        textTools: "文本功能",
        panoramaStage: "3D导演台"
      }),
      actions: Object.freeze({
        "zoom-in": "放大",
        "zoom-out": "缩小",
        "fit-all": "聚焦节点/适应画布",
        minimap: "小地图",
        "pan-canvas": "拖动画布（按住）",
        copy: "复制节点",
        "copy-media": "复制图像",
        cut: "剪切节点",
        "canvas-screenshot": "画布截图",
        "duplicate-with-edges": "拖拽创建连线副本",
        paste: "粘贴节点",
        undo: "撤销",
        redo: "重做",
        delete: "删除节点",
        "select-all": "全选",
        "multi-select": "多选节点（配合点击）",
        group: "编组",
        "align-feature": "多选对齐功能",
        "grid-dots": "显示网格点",
        "toggle-connection-lines": "显示/隐藏连接线",
        "toggle-selection-related-highlight": "点击节点时高亮关联节点",
        "snap-guides": "辅助线吸附",
        "snap-grid": "网格吸附开关",
        "toggle-title-follows-zoom": "标题跟随画布缩放",
        "toggle-media-node-resize": "图像视频节点缩放",
        "toggle-prompt-box-resize": "允许提示词栏下拉",
        "toggle-node-avoid-overlap": "新节点自动避让",
        "reset-media-size": "恢复节点默认大小",
        "add-reference": "添加参考",
        "toggle-agent": "打开/关闭 SHUO Agent",
        "create-text": "创建源文本节点",
        "create-comment-note": "创建注释节点",
        "create-ai-text": "创建生成文本节点",
        "create-ai-image": "创建生成图像节点",
        "create-ai-video": "创建生成视频节点",
        "create-ai-audio": "创建生成音频节点",
        "upload-file": "上传文件",
        "cut-edge": "剪刀（切断连线）",
        save: "保存画布",
        "open-settings": "打开设置",
        "open-canvas-projects": "打开画布项目",
        "open-assets": "打开素材",
        "open-workflows": "打开工作流",
        "open-node-manager": "打开/关闭节点管理",
        "open-files": "打开文件管理",
        "open-task-center": "打开任务进程",
        "open-custom-ai-app": "打开自定义AI应用",
        "escape-all": "取消/关闭所有菜单弹窗",
        "editor-tool-brush": "画笔（切换模式）",
        "editor-tool-rect": "矩形",
        "editor-tool-eraser": "橡皮擦",
        "editor-tool-bucket": "油漆桶",
        "editor-clear": "清空",
        "image-tool-matting": "遮罩编辑器",
        "image-tool-repaint": "重绘",
        "image-tool-erase": "擦除",
        "image-tool-hd": "高清",
        "image-tool-expand": "扩图",
        "image-tool-auto-subject": "自动识别主体",
        "image-tool-multigrid": "宫格裁剪",
        "image-tool-multiangle": "控制角度",
        "image-tool-annotate": "标注",
        "image-tool-crop": "裁剪",
        "image-tool-fullscreen": "全屏显示",
        "image-tool-download": "下载",
        "video-tool-clip": "裁剪视频",
        "video-tool-separate-av": "音画分离",
        "video-tool-capture-frame": "截取当前帧",
        "video-tool-keying": "抠像",
        "video-tool-hd": "高清",
        "video-tool-fullscreen": "全屏显示",
        "video-tool-download": "下载",
        "ms-sync-video-play": "同步播放视频",
        "audio-tool-clip": "裁剪音频",
        "audio-tool-speed": "倍速",
        "audio-tool-download": "下载",
        "clip-tool-crop": "剪辑裁剪",
        "text-tool-copy": "复制",
        "text-tool-fullscreen": "全屏显示",
        "panorama-scene-tool-toggle-mouse": "鼠标",
        "panorama-scene-tool-move": "移动",
        "panorama-scene-tool-scale": "缩放",
        "panorama-scene-tool-rotate": "旋转",
        "panorama-scene-reset-view": "重置视角",
        "panorama-scene-capture": "截图",
        "panorama-scene-camera-create": "创建机位书签",
        "panorama-scene-camera-1": "跳转机位书签 1",
        "panorama-scene-camera-2": "跳转机位书签 2",
        "panorama-scene-camera-3": "跳转机位书签 3",
        "panorama-scene-camera-4": "跳转机位书签 4",
        "panorama-scene-camera-5": "跳转机位书签 5",
        "panorama-scene-camera-6": "跳转机位书签 6",
        "panorama-scene-camera-7": "跳转机位书签 7",
        "panorama-scene-camera-8": "跳转机位书签 8",
        "panorama-scene-camera-9": "跳转机位书签 9",
        "panorama-scene-camera-0": "跳转机位书签 10",
        "panorama-scene-camera-save-1": "保存当前视图到机位书签 1",
        "panorama-scene-camera-save-2": "保存当前视图到机位书签 2",
        "panorama-scene-camera-save-3": "保存当前视图到机位书签 3",
        "panorama-scene-camera-save-4": "保存当前视图到机位书签 4",
        "panorama-scene-camera-save-5": "保存当前视图到机位书签 5",
        "panorama-scene-camera-save-6": "保存当前视图到机位书签 6",
        "panorama-scene-camera-save-7": "保存当前视图到机位书签 7",
        "panorama-scene-camera-save-8": "保存当前视图到机位书签 8",
        "panorama-scene-camera-save-9": "保存当前视图到机位书签 9",
        "panorama-scene-camera-save-0": "保存当前视图到机位书签 10"
      })
    })
  }),
  saveDialog: Object.freeze({
    title: "保存画布",
    subtitle: "文件将保存到 user/Canvas Project/ 文件夹",
    placeholder: "输入画布名称...",
    cancel: "取消",
    save: "保存"
  }),
  about: Object.freeze({
    title: "SHUO Canvas",
    tagline: "把想法，连成作品。",
    author: "作者：",
    authorName: "阿硕",
    bilibili: "访问 Bilibili 主页",
    footer: "© 2026 SHUO Canvas · 阿硕画布. All rights reserved."
  }),
  appPanels: Object.freeze({
    tutorial: Object.freeze({
      apiOnboarding: "新手 API 接入教程",
      bernini: "RH模型Bernini详细使用说明",
      usage: "使用说明1",
      storyStudio: "剧本工作室使用教程",
      replacementStudioFullTutorial: "【替换工作室】完整使用教程",
      fullAudioReferenceVideoGeneration: "全音频参考生成视频 音参宗成立！",
      rhAiAppComfyUiIntegration: "RH AI应用/comfyui本地云端 接入教程",
      scail2VoiceStudioFilmRemix: "新影视二创高效做法Scail2+语音工作室演示",
      browserNode: "浏览器节点用法",
      seedanceLineCamera: "seedance2.0 线条控制运镜玩法",
      latest: "游戏实际演示制作教程",
      scail2FullReview: "Scail2全面实测使用方法",
      characterReplacement: "影视人物替换演示",
      panorama: "人物\\场景一致性 360°全景图提取 SD2.0生成 演示！"
    }),
    aiAssistant: Object.freeze({
      responses: Object.freeze({
        idea: "这是一个很棒的想法，我们可以把这些元素组合起来。",
        prompt: "我明白了，我先给你一版可直接复用的提示词草稿。",
        connect: "需要我帮你把这段结果自动连接到下一个节点吗？",
        optimize: "没问题，我正在优化你当前选中区域的描述。"
      }),
      greeting: "你好，我是你的 AI 创作助手。输入你的想法，我们就开始创作。"
    }),
    emptyHint: Object.freeze({
      textNode: "生成文本",
      imageNode: "生成图像",
      videoNode: "生成视频"
    }),
    devMode: Object.freeze({
      entered: "已进入开发者模式",
      exited: "已返回常规模式",
      enterAction: "进入开发者模式",
      exitAction: "返回常规模式",
      clickHint: "再点 {count} 次{action}"
    })
  }),
  taskCenter: Object.freeze({
    ariaLabel: "任务",
    title: "任务",
    collapse: "收起任务中心",
    expand: "展开任务中心",
    clearDone: "清理完成",
    summary: "进行中 {active} · 失败 {failed} · 已完成 {done}",
    unavailableSummary: "当前环境没有桌面后台任务",
    unavailable: "桌面任务不可用",
    empty: "暂无后台任务",
    sections: Object.freeze({
      active: "正在处理",
      failed: "失败",
      done: "最近完成"
    }),
    taskKinds: Object.freeze({
      dreaminaVideo: "即梦视频生成",
      runningHubWorkflow: "RunningHub 工作流",
      videoPoster: "生成视频封面",
      audioWaveform: "生成音频波形",
      videoFirstFrame: "提取视频首帧",
      videoCut: "视频裁剪",
      videoReverse: "视频倒放",
      audioCut: "音频裁剪",
      videoAudioSeparate: "音频分离",
      videoCompose: "视频合成",
      videoAudioMux: "完整视频封装",
      audioCompose: "音频合并",
      audioVoiceCompose: "语音工作室合成",
      mediaTask: "媒体任务"
    }),
    statuses: Object.freeze({
      waiting: "等待",
      processing: "处理中",
      complete: "完成",
      failed: "失败",
      cancelled: "已取消",
      fallback: "任务"
    }),
    actions: Object.freeze({
      cancel: "取消",
      reveal: "定位文件",
      copyError: "复制错误"
    }),
    duration: "耗时 {duration}",
    cancelledMessage: "已取消",
    cancelFailed: "取消任务失败",
    revealFailed: "定位文件失败",
    copyFailed: "复制失败",
    copySuccess: "已复制错误信息"
  }),
  nodeToolbar: Object.freeze({
    faceDetect: Object.freeze({
      defaultTooltip: "apimart提供 seedance2.0人脸检测",
      passedTooltip: "apimart seedance2.0人脸检测 已经通过",
      failedTooltip: "人脸检测未通过",
      failedTooltipWithError: "人脸检测未通过：{error}",
      processingTooltip: "人脸检测中",
      missingUrlError: "没有找到可检测的素材 URL",
      missingUrlToast: "人脸检测失败：没有找到可检测的素材 URL",
      apiKeyMissing: "APIMART API Key 未配置",
      running: "正在进行 APIMart 人脸检测...",
      passedToast: "人脸检测通过，已记录 Seedance 2.0 入参 URL",
      failedFallback: "APIMart 人脸检测未通过",
      failedToastWithError: "人脸检测未通过：{error}"
    }),
    autoSubject: Object.freeze({
      buttonTooltip: "自动识别主体",
      modeLabel: "RH抠图",
      modeDesc: "RH工作流 一键自动识别主体",
      chooseMode: "选中识别模式",
      chooseBackground: "选择背景色",
      backgrounds: Object.freeze({
        transparent: "透明背景",
        white: "白色背景",
        black: "黑色背景",
        gray: "灰色背景"
      }),
      cancelledName: "主体识别图像 (已取消)",
      cancelledOutput: "模型: {model}\n状态: 已取消",
      cancelledToast: "已取消主体识别任务",
      cancelTooltip: "取消主体识别",
      invalidBackground: "背景色参数无效",
      outputText: "模型: {model}\n背景: {background}",
      noProcessableImage: "没有可处理的图像",
      apiKeyMissing: "RunningHUB API Key 未配置",
      sourceNodeMissing: "找不到原节点",
      processingName: "主体识别图像 (处理中)",
      uploadFailed: "图片上传失败",
      createTaskFailed: "创建任务失败",
      missingResultImage: "任务完成但未返回图片",
      resultName: "主体识别图像",
      failedName: "主体识别图像 (失败)",
      unknownError: "未知错误",
      outputTextWithError: "{outputText}\n错误: {error}",
      completed: "✅ 主体识别完成（{background}）",
      failedWithError: "主体识别失败: {error}"
    }),
    storyboardScriptAction: Object.freeze({
      videoDefaultPrompt: "根据这个视频生成一版分镜脚本，自动按视频内容拆分镜头",
      missingSource: "请先选择一个可连接的文本或视频节点",
      invalidConnection: "当前节点不能连接到分镜脚本节点",
      missingAddNode: "创建分镜脚本节点失败：Store 不支持 addNode",
      connectFailed: "连接分镜脚本节点失败"
    }),
    videoFrameInterpolation: Object.freeze({
      modelLabel: "RH视频补帧",
      processingName: "补帧视频 (处理中)",
      resultName: "补帧视频",
      failedName: "补帧视频 (失败)",
      cancelledName: "补帧视频 (已取消)",
      outputText: "模型: {model}\n状态: {status}",
      outputTextWithError: "{outputText}\n错误: {error}",
      status: Object.freeze({
        processing: "处理中",
        complete: "完成",
        failed: "失败",
        cancelled: "已取消"
      }),
      cancelTooltip: "取消补帧",
      cancelledToast: "已取消补帧任务",
      taskCancelled: "已取消任务",
      sourceNodeMissing: "找不到原节点",
      noProcessableVideo: "没有可处理的视频",
      apiKeyMissing: "RunningHUB API Key 未配置",
      uploading: "正在上传视频到 RH...",
      uploadNoDownloadUrl: "RH 上传未返回 download_url",
      processingToast: "正在补帧处理视频...",
      taskIdMissing: "任务 ID 未返回",
      missingOutputUrl: "未获取到可用的输出视频 URL",
      localSaveFailed: "已生成但本地保存失败",
      successToast: "✅ 补帧视频生成完成",
      failedWithError: "视频补帧失败: {error}"
    }),
    videoHd: Object.freeze({
      choosePlan: "选择高清方案",
      modelFallback: "视频高清",
      promptLabel: "高清修复视频",
      options: Object.freeze({
        sharp: Object.freeze({
          title: "高清效率",
          desc: "RH工作流 增强视频锐度"
        }),
        quality: Object.freeze({
          title: "高清质量",
          desc: "RH工作流 提升视频质量"
        }),
        basic: Object.freeze({
          title: "基础高清",
          desc: "RH工作流 一键高清修复视频"
        })
      }),
      processingName: "高清视频 (处理中)",
      resultName: "高清视频",
      failedName: "高清视频 (失败)",
      cancelledName: "高清视频 (已取消)",
      outputText: "模型: {model}\n提示词: {prompt}",
      outputTextWithStatus: "{outputText}\n状态: {status}",
      outputTextWithError: "{outputText}\n错误: {error}",
      cancelledOutput: "模型: {model}\n提示词: {prompt}\n状态: {status}",
      status: Object.freeze({
        cancelled: "已取消"
      }),
      cancelTooltip: "取消视频高清",
      cancelledToast: "已取消视频高清任务",
      taskCancelled: "已取消任务",
      sourceNodeMissing: "找不到原节点",
      noProcessableVideo: "没有可处理的视频",
      apiKeyMissing: "RunningHUB API Key 未配置",
      uploading: "正在上传视频到 RH...",
      uploadNoDownloadUrl: "RH 上传未返回 download_url",
      processingToast: "正在高清处理视频...",
      taskIdMissing: "任务 ID 未返回",
      missingOutputUrl: "未获取到可用的输出视频 URL",
      localSaveFailed: "已生成但本地保存失败",
      successToast: "✅ 高清视频生成完成",
      failedWithError: "视频高清失败: {error}"
    }),
    imageHd: Object.freeze({
      choosePlan: "选择高清方案",
      chooseResolution: "选择放大分辨率",
      modelLabel: "RH高清放大",
      modelDesc: "RH工作流 一键高清放大图像",
      promptLabel: "高清放大图像",
      processingName: "高清图像 (处理中)",
      resultName: "高清图像",
      failedName: "高清图像 (失败)",
      cancelledName: "高清图像 (已取消)",
      outputText: "模型: {model}\n提示词: {prompt}\n分辨率: {resolution}",
      outputTextWithStatus: "{outputText}\n状态: {status}",
      outputTextWithError: "{outputText}\n错误: {error}",
      status: Object.freeze({
        cancelled: "已取消"
      }),
      cancelTooltip: "取消高清放大",
      cancelledToast: "已取消高清放大任务",
      taskCancelled: "已取消任务",
      noProcessableImage: "没有可处理的图像",
      apiKeyMissing: "RunningHUB API Key 未配置",
      sourceNodeMissing: "找不到原节点",
      uploadEmpty: "图像上传失败：processInputImages 返回空数组",
      uploadFailed: "图像上传失败",
      taskIdMissing: "任务 ID 未返回",
      missingResultImage: "任务完成但未返回图片",
      unknownError: "未知错误",
      successToast: "✅ 高清图像生成完成",
      failedWithError: "高清放大失败: {error}"
    }),
    midjourney: Object.freeze({
      modelLabel: "APIMart Midjourney",
      variationAction: "MJ变体",
      hdAction: "MJ高清",
      chooseVariation: "选择变体",
      variationWeakAction: "弱变体",
      variationMediumAction: "中变体",
      variationStrongAction: "强变体",
      variationProcessingName: "MJ变体 (处理中)",
      hdProcessingName: "MJ高清 (处理中)",
      variationResultName: "MJ变体图",
      hdResultName: "MJ高清图",
      failedName: "MJ二次操作 (失败)",
      cancelledName: "MJ二次操作 (已取消)",
      outputText: "模型: {model}\n动作: {action}\n来源: 第 {index} 张",
      outputTextWithStatus: "{outputText}\n状态: {status}",
      outputTextWithError: "{outputText}\n错误: {error}",
      status: Object.freeze({
        cancelled: "已取消"
      }),
      busy: "MJ二次操作正在处理中",
      missingContext: "当前图片没有可用的 Midjourney 二次操作信息",
      hdUnsupported: "Midjourney V8.2 暂不支持 MJ 高清",
      hdCustomIdMissing: "缺少 MJ 高清按钮信息，请重新生成一次 Midjourney 图片后再试",
      sourceNodeMissing: "找不到原节点",
      missingResultImage: "任务完成但未返回图片",
      unknownError: "未知错误",
      successToast: "✅ MJ二次操作完成",
      pendingToast: "MJ任务仍在处理中，已保留任务节点，可稍后恢复",
      cancelledToast: "已取消 MJ 二次操作",
      failedWithError: "MJ二次操作失败: {error}"
    }),
    panorama360: Object.freeze({
      modelLabel: "RH 一键360°全景图",
      processingName: "360°全景图 (处理中)",
      resultName: "360°全景图",
      failedName: "360°全景图 (失败)",
      cancelledName: "360°全景图 (已取消)",
      outputText: "模型: {model}",
      outputTextWithStatus: "{outputText}\n状态: {status}",
      outputTextWithError: "{outputText}\n错误: {error}",
      status: Object.freeze({
        cancelled: "已取消"
      }),
      cancelTooltip: "取消360°全景图",
      cancelledToast: "已取消 360°全景图任务",
      busy: "360°全景图任务正在处理中",
      noProcessableImage: "没有可处理的图像",
      apiKeyMissing: "RunningHUB API Key 未配置",
      sourceNodeMissing: "找不到原节点",
      uploadFailed: "图片上传失败",
      createTaskFailed: "创建任务失败",
      missingResultImage: "任务完成但未返回图片",
      unknownError: "未知错误",
      successToast: "✅ 360°全景图生成完成",
      pendingToast: "RunningHub 仍在生成，已保留任务，会继续查询",
      failedWithError: "360°全景图生成失败: {error}"
    }),
    multigrid: Object.freeze({
      chooseGrid: "选择宫格",
      grid4Title: "4宫格",
      grid4Desc: "2×2 网格",
      grid9Title: "9宫格",
      grid9Desc: "3×3 网格",
      grid16Title: "16宫格",
      grid16Desc: "4×4 网格",
      grid25Title: "25宫格",
      grid25Desc: "5×5 网格",
      crop: "裁剪",
      create: "创建",
      nodeMissing: "节点数据已丢失",
      storyboardName: "宫格分镜",
      storyboardCreated: "分镜节点已创建",
      unknownError: "未知错误",
      storyboardFailed: "创建分镜失败: {error}",
      cropTooltip: "裁剪成 {count} 张",
      cropLoading: "读取中...",
      cropSuccess: "✅ 已创建 {count} 个裁剪节点",
      cropEmpty: "裁剪失败，未生成任何节点",
      createTooltip: "创建 {cols}×{rows} 分镜",
      createBusy: "处理中...",
      customTitle: "自定义",
      customDesc: "1×1-5×5 任意规格",
      chooseSpec: "选择规格",
      customBusy: "正在创建 {cols}×{rows}",
      customPreview: "点击创建 {cols}×{rows} 分镜",
      customMenuTitle: "自定义宫格",
      customAria: "自定义宫格规格",
      cellAria: "创建 {cols}×{rows} 分镜"
    }),
    comment: Object.freeze({
      fontSize: "字号",
      fontDec: "减小字号",
      fontInc: "增大字号",
      convertMarkdown: "转为 Markdown 注释",
      convertPlainText: "切回普通注释",
      markdownConverted: "已转为 Markdown 注释",
      plainTextConverted: "已切回普通注释",
      textColor: "文字颜色",
      bgColor: "背景颜色",
      deleteNode: "删除节点",
      jumpShortcut: "跳转快捷键",
      jumpShortcutRow: "快捷键",
      jumpClear: "清空快捷键",
      jumpClearAria: "清空跳转快捷键",
      jumpHintRecording: "按下组合键，Esc 取消",
      jumpEmpty: "未设置",
      jumpUpdated: "跳转快捷键已更新",
      jumpCleared: "已清空跳转快捷键",
      jumpZoom: "缩放",
      jumpTooltip: "跳转快捷键 | {shortcut}",
      jumpConflictGlobal: "快捷键冲突 | 已被「{label}」占用",
      jumpConflictOther: "快捷键冲突 | 已被其他注释节点占用",
      textColorLabel: Object.freeze({
        white: "白色文字",
        red: "红色文字",
        orange: "橙色文字",
        yellow: "黄色文字",
        green: "绿色文字",
        blue: "蓝色文字",
        purple: "紫色文字",
        cyan: "青色文字",
        pink: "粉色文字",
        gray: "灰色文字"
      }),
      bgColorLabel: Object.freeze({
        transparent: "取消背景",
        white: "白色背景",
        red: "红色背景",
        orange: "橙色背景",
        yellow: "黄色背景",
        green: "绿色背景",
        blue: "蓝色背景",
        purple: "紫色背景",
        cyan: "青色背景",
        gray: "灰色背景"
      })
    }),
    common: Object.freeze({
      developmentSuffix: "{text} （开发中）",
      cancelTask: "取消任务",
      taskCancelled: "已取消任务",
      upload: "上传",
      download: "下载",
      fullscreen: "全屏显示",
      resetSize: "恢复默认大小",
      nodeMissing: "节点数据已丢失",
      noDownloadableImage: "没有可下载的图像",
      noDownloadableVideo: "没有可下载的视频",
      imageSaved: "图片已保存：{filename}",
      videoSaved: "视频已保存：{filename}",
      audioSaved: "音频已保存：{filename}"
    }),
    audio: Object.freeze({
      clip: "裁剪音频",
      separate: "人声分离",
      voiceStudio: "语音工作室",
      speed: "倍速"
    }),
    image: Object.freeze({
      matting: "遮罩编辑器",
      repaint: "重绘",
      erase: "擦除",
      hd: "高清",
      mjVariation: "MJ变体",
      mjHd: "MJ高清",
      expand: "扩图",
      autoSubject: "自动识别主体",
      faceDetectTooltip: "apimart提供 seedance2.0人脸检测",
      faceDetect: "人脸检测",
      panorama360: "一键360全景图",
      multigrid: "宫格裁切",
      multiangle: "控制角度",
      annotate: "标注",
      crop: "裁切",
      more: "更多",
      moreTools: "更多工具",
      customize: "自定义工具",
      customizeTip: "拖动高亮按钮可换位，可放到外部或更多区",
      done: "完成",
      doneCustomize: "完成自定义",
      generate: "生成",
      generating: "生成中...",
      repaintCancelledName: "重绘结果 (已取消)",
      repaintCancelledOutput: "模型: 图像重绘\n状态: 已取消",
      repaintCancelledToast: "已取消重绘任务",
      cancelRepaint: "取消重绘",
      eraseCancelledName: "擦除结果 (已取消)",
      eraseCancelledOutput: "模型: 图像擦除\n状态: 已取消",
      eraseCancelledToast: "已取消擦除任务",
      cancelErase: "取消擦除",
      expandCancelledName: "扩图结果 (已取消)",
      expandCancelledOutput: "模型: 扩图\n状态: 已取消",
      expandCancelledToast: "已取消扩图任务",
      cancelExpand: "取消扩图",
      rotateCancelledName: "旋转结果 (已取消)",
      rotateCancelledOutput: "模型: 控制角度\n状态: 已取消",
      rotateCancelledToast: "已取消控制角度任务",
      cancelRotate: "取消控制角度",
      taskCancelled: "任务已取消",
      localSaveGeneratedFailed: "已生成但本地保存失败"
    }),
    video: Object.freeze({
      clip: "裁剪视频",
      voiceReplace: "语音工作室",
      reverse: "视频倒放",
      reverseBusyTooltip: "{tooltip}中...",
      reverseUnavailable: "视频倒放功能不可用",
      reverseFailed: "视频倒放失败",
      reverseFailedWithError: "视频倒放失败: {error}",
      keying: "抠像",
      storyboardScript: "分镜脚本",
      faceDetectTooltip: "apimart提供 seedance2.0人脸检测",
      faceDetect: "人脸检测",
      hd: "高清",
      frameInterpolation: "补帧",
      remove: "视频擦除",
      separateAv: "音画分离",
      more: "更多",
      moreTools: "更多工具",
      customize: "自定义工具",
      customizeTip: "拖动高亮按钮可换位，可放到外部或更多区",
      exitCurrentEditMode: "请先退出当前视频编辑模式",
      exitKeyingMode: "请先退出抠像模式",
      exitClipMode: "请先退出裁剪视频模式",
      cancelKeyingTask: "取消抠像任务",
      cancelRemoveTask: "取消视频擦除",
      extractKeyframes: "提取关键帧",
      extractUnavailable: "提取关键帧功能不可用",
      extractPreparing: "提取关键帧：准备中",
      extractProgress: "提取关键帧：{progress}",
      extractStarted: "⏳ 正在智能剪辑：分析场景并提取关键帧...",
      extractNoSegments: "未检测到场景变化",
      extractNoKeyframes: "智能剪辑没有生成有效关键帧",
      extractComplete: "✅ 智能剪辑完成，已生成 {count} 张关键帧",
      smartClipFailed: "智能剪辑失败",
      extractFailed: "❌ 提取关键帧失败: {error}",
      invalidVideoSource: "视频源无效",
      analyzingScenes: "正在分析视频场景...",
      sourceNodeMissing: "找不到原节点",
      sceneNodeName: "场景 {index}",
      sceneNodesCreated: "✅ 已创建 {count} 个场景节点",
      smartClipFailedRetry: "智能剪辑失败，请重试",
      durationLimit: "视频不能超过 {seconds} 秒，请先裁剪视频",
      hdVipRequired: "该高清模型需要 VIP 授权",
      saveInvalidUrl: "保存失败：无效视频地址",
      saveEmptyDownload: "保存失败：视频下载为空",
      saveMalformed: "本地保存失败：返回格式异常",
      savingLocal: "正在保存到本地…",
      localSaveFailed: "本地保存失败"
    }),
    text: Object.freeze({
      copy: "复制",
      copied: "已复制",
      copyFailed: "复制失败",
      noTextToCopy: "没有可复制的文本",
      clearEmptyLines: "清除空行",
      storyboardScript: "分镜脚本",
      fullscreen: "全屏显示",
      noTextToClean: "没有可清理的文本",
      noBlankLines: "未检测到空行",
      clearedBlankLines: "已清除空行",
      close: "关闭",
      heading1: "一级标题",
      heading2: "二级标题",
      heading3: "三级标题",
      paragraph: "正文",
      bold: "加粗",
      italic: "斜体",
      unorderedList: "无序列表",
      orderedList: "有序列表",
      divider: "分割线"
    })
  }),
  videoClip: Object.freeze({
    controls: Object.freeze({
      cancel: "取消",
      done: "完成",
      start: "开始",
      loading: "加载中..."
    }),
    errors: Object.freeze({
      videoNodeMissing: "找不到视频节点",
      invalidSource: "视频源无效",
      smartClipEndpointMissing: "后端接口不存在：/api/v2/video/smart_clip（请重启 server.py）",
      cutEndpointMissing: "后端接口不存在：/api/v2/video/cut（请重启 server.py）",
      startFailed: "启动失败",
      startMissingJobId: "启动失败：缺少 jobId",
      exitedClipMode: "已退出裁剪模式",
      smartClipFailed: "智能剪辑失败",
      sourceNodeMissing: "找不到原节点",
      cutFailed: "视频裁剪失败"
    }),
    smartClip: Object.freeze({
      stages: Object.freeze({
        prepare: "准备中",
        detect: "分析中",
        cut: "裁剪中",
        frame: "提帧中",
        processing: "处理中"
      }),
      preparing: "准备中...",
      progressWithTotal: "{stage} {done}/{total} ({pct}%)",
      progressPercent: "{stage} ({pct}%)",
      extractingFrame: "提帧中 {current}/{total}",
      keyframeNodeName: "智能剪辑关键帧 {index}",
      segmentNodeName: "智能剪辑 {index}",
      startedKeyframes: "⏳ 正在智能剪辑：分析场景并提取关键帧...",
      startedSegments: "⏳ 正在智能剪辑：分析场景并裁剪为多个文件...",
      noSegments: "未检测到场景变化",
      noKeyframes: "智能剪辑没有生成有效关键帧",
      noResults: "智能剪辑没有生成有效片段",
      completeKeyframes: "✅ 智能剪辑完成，已生成 {count} 张关键帧",
      completeSegments: "✅ 智能剪辑完成，已生成 {count} 段",
      failedWithError: "❌ 智能剪辑失败: {error}"
    }),
    helper: Object.freeze({
      cancel: "取消",
      rangePlayPause: "区间播放/暂停",
      moveSelectionByFrame: "逐帧移动裁剪区域",
      moveSelectionByLargeStep: "大步移动裁剪区 ({frames}帧)",
      setInOut: "设置入点/出点",
      fineTuneInPoint: "微调入点 ({frames}帧)",
      fineTuneOutPoint: "微调出点 ({frames}帧)",
      wheelKey: "滚轮",
      wheelMove: "同方向键 (上滚=←)",
      clickKey: "鼠标点击",
      jumpPlayhead: "播放头跳转",
      doubleClickRangeKey: "双击选区",
      resetDefaultRange: "恢复默认 {seconds}s"
    }),
    smartPanel: Object.freeze({
      smartClipButton: "智能剪辑",
      extractFrame: "提取视频帧",
      title: "智能剪辑设置",
      output: "输出",
      outputTip: "提取视频片段：生成视频节点\n提取视频关键帧：每段只取开头第一帧，生成图片节点",
      outputSegments: "提取视频片段",
      outputKeyframes: "提取视频关键帧",
      mode: "模式",
      modeTip: "稳：适合口播/影视，结果更干净\n均衡：更容易切出更多镜头\n敏感：适合快剪/混剪，优先保证能切出来",
      modeStable: "稳",
      modeBalanced: "均衡",
      modeSensitive: "敏感",
      fps: "帧率",
      fpsTip: "16 帧更省时，24 帧更通用，30 帧更顺滑但处理更慢",
      fpsValue: "{fps}帧",
      maxSegments: "最多生成",
      maxSegmentsTip: "最多生成 {max} 段，避免镜头太碎导致画布一次出现大量节点\n按住数字左右拖动调整，点击可输入",
      maxSegmentsAria: "最多生成段数",
      segmentUnit: "段",
      hintDefault: "镜头很碎时会自动降级，保证能生成结果",
      hintKeyframes: "关键帧模式会为每段生成开头第一帧图片"
    }),
    cut: Object.freeze({
      processing: "⏳ 正在后端裁剪视频...",
      videoFallback: "视频",
      newNodeName: "剪辑自 {name}",
      success: "✅ 视频裁剪成功，已生成新文件",
      failedWithError: "❌ 视频裁剪失败: {error}",
      cancelled: "已取消裁剪视频"
    })
  }),
  nodeMenu: Object.freeze({
    addNodes: "添加节点",
    addResources: "添加资源",
    upload: "上传",
    text: "文本",
    image: "图像",
    video: "视频",
    testVideo: "测试视频",
    audio: "音频",
    mediaClip: "剪辑",
    collage: "拼图",
    panoramaScene: "3D导演台",
    panorama360: "360全景图",
    storyboardScript: "分镜脚本"
  }),
  storyboard: Object.freeze({
    toolbar: Object.freeze({
      toggleAspect: "切换比例",
      aspectLabel: "比例 {aspectRatio}",
      toggleGrid: "切换网格",
      gridLabel: "网格 {cols}×{rows}",
      adjustSplitLines: "调整分割线",
      applying: "正在应用",
      applyingSplitLines: "正在应用分割线",
      finishAdjust: "完成调整",
      finishAdjustSplitLines: "完成调整分割线",
      edit: "编辑分镜",
      exitEdit: "退出编辑分镜",
      editShort: "编辑",
      exitEditShort: "退出",
      compose: "合成",
      clear: "清空",
      expand: "展开",
      collapse: "折叠",
      customGridHint: "拖动分割线调整裁剪，按 Esc 取消",
      editHint: "拖拽单元格进行互换，或拖出生成新图",
      enterEditHint: "双击进入分镜编辑",
      customGridPartialRefreshFailed: "自定义分割已保存，但部分格子刷新失败"
    }),
    cell: Object.freeze({
      loadFailed: "加载失败",
      dropImage: "拖入图片"
    }),
    imageRuntime: Object.freeze({
      sourceImageLoadFailed: "源图加载失败"
    })
  }),
  storyboardScript: Object.freeze({
    defaultName: "分镜脚本",
    loading: "生成分镜脚本中",
    mediaModeAria: "分镜脚本生成模式",
    mediaMode: Object.freeze({
      image: "图像提示词",
      video: "视频提示词"
    }),
    viewModeAria: "分镜脚本视图",
    viewMode: Object.freeze({
      list: "列表视图",
      card: "卡片视图"
    }),
    promptPlaceholder: "输入剧情、文案或分镜要求",
    generate: "生成",
    advancedSettings: "高级设置",
    selectionCount: "已选 {selected} 个，共 {total} 个分镜",
    selectAllAria: "选择全部分镜",
    selectRowAria: "选择第 {index} 个分镜",
    shotFallback: "镜头 {index}",
    imageBatchGroupName: "分镜图像生成",
    imageNodeName: "分镜 {shot}",
    columns: Object.freeze({
      shotNo: "镜号",
      duration: "时长",
      shotSize: "景别",
      scene: "场景",
      visualDescription: "画面描述",
      character: "角色",
      characterDescription: "角色描述",
      characterAction: "角色动作",
      emotion: "情绪",
      characterImage: "角色图",
      reference: "参考",
      imagePrompt: "图片提示词",
      videoPrompt: "视频提示词",
      dialogue: "对白",
      soundEffect: "音效"
    }),
    toolbar: Object.freeze({
      editMode: "编辑/生成分镜",
      exitEdit: "退出编辑",
      generateSelected: "生成选中分镜",
      fullscreen: "全屏显示",
      download: "下载",
      downloadTable: "下载表格",
      queue: "加入队列"
    }),
    fullscreen: Object.freeze({
      close: "关闭全屏显示",
      aria: "分镜脚本全屏显示",
      meta: "{count} 个分镜 · {media} · {view}"
    }),
    empty: Object.freeze({
      title: "暂无分镜脚本数据",
      hint: "选中节点后，在提示词栏输入剧情或文案即可生成。"
    }),
    toasts: Object.freeze({
      generateScriptFirst: "请先生成分镜脚本",
      noFullscreenData: "暂无可全屏显示的分镜脚本",
      missingPromptOrReference: "请输入剧情、文案或连接参考图片/视频后再生成分镜",
      selectStoryboardsFirst: "请先勾选要生成的分镜",
      missingImagePrompt: "选中的分镜缺少图片提示词，请补齐后再生成",
      createdAndStartedImageNodes: "已创建并开始生成 {count} 个图像节点",
      createdImageNodes: "已创建 {count} 个图像生成节点",
      autoStartPartialFailed: "部分图像节点已创建，但未能自动开始生成",
      noDownloadData: "暂无可下载的分镜脚本",
      downloadedTable: "已下载分镜脚本表格"
    }),
    errors: Object.freeze({
      invalidJsonTooManyFrames: "模型未返回合法分镜 JSON，请重试或减少视频切片数量",
      invalidJsonSwitchModel: "模型未返回合法分镜 JSON，请重试或切换火山模型",
      videoPreprocessFailed: "视频分镜预处理失败",
      generationFailed: "分镜脚本生成失败"
    })
  }),
  promptPresets: Object.freeze({
    userInputPill: "提示词",
    triggerLabel: "提示词预设（也可输入 /）",
    templatePlaceholder: "例如：生成全身三视图，包含正视图、45度侧视图、后视图，背景简洁 人物参考",
    customGroupTitle: "用户自定义",
    customGroupDesc: "已保存的自定义预设",
    customPresetFallback: "自定义预设",
    customPresetFallbackWithIndex: "自定义预设 {index}",
    presetDescFallback: "输入说明与提示词模板",
    slash: Object.freeze({
      header: "选择预设生成",
      subItemsDesc: "包含多个子选项",
      customTitle: "自定义预设",
      customBadge: "管理",
      customDesc: "点击编辑或新建当前专属配置"
    }),
    nodeTypes: Object.freeze({
      image: "图像节点",
      text: "文本节点",
      video: "视频节点",
      audio: "音频节点",
      storyboardScript: "分镜脚本节点",
      node: "节点"
    }),
    tabs: Object.freeze({
      text: Object.freeze({
        label: "文本预设"
      }),
      image: Object.freeze({
        label: "图像预设"
      }),
      video: Object.freeze({
        label: "视频预设"
      }),
      audio: Object.freeze({
        label: "音频预设"
      }),
      storyboardScript: Object.freeze({
        label: "分镜脚本预设"
      })
    }),
    manager: Object.freeze({
      title: "用户预设",
      desc: "管理 {nodeType} 的生成预设",
      close: "关闭",
      new: "新建",
      emptyList: "左侧点击新建，创建一个自定义预设。",
      emptyDetail: "选择左侧预设，或点击新建开始编辑。",
      deleteAria: "删除 {title}"
    }),
    editor: Object.freeze({
      name: "名字",
      namePlaceholder: "预设名称",
      desc: "说明",
      descPlaceholder: "说明这个预设适合什么场景",
      template: "提示词模板",
      insertPrompt: "点击插入提示词栏内容",
      save: "保存",
      saving: "保存中...",
      titleRequired: "请填写预设名称",
      templateRequired: "请填写预设内容",
      saved: "自定义预设已保存",
      saveFailed: "保存自定义预设失败",
      duplicateUserInput: "一个预设内容只能插入一次提示词"
    }),
    triggerModes: Object.freeze({
      aria: "预设触发方式",
      label: "模式：",
      direct: "直接触发",
      insertPrompt: "加入提示词"
    }),
    thumbnail: Object.freeze({
      upload: "上传缩略图",
      updated: "缩略图已更新，保存后生效",
      chooseImage: "请选择图片文件",
      readFailed: "读取缩略图失败",
      uploadFailed: "上传缩略图失败"
    }),
    delete: Object.freeze({
      deleted: "自定义预设已删除",
      failed: "删除自定义预设失败"
    }),
    emptyInput: Object.freeze({
      image: "请输入提示词或添加参考图片",
      panorama: "请输入场景或添加参考图片"
    }),
    presets: Object.freeze({
      sceneReferenceGroup: Object.freeze({
        title: "场景参考",
        desc: "一键生成场景多视图和全景图"
      }),
      sceneFourView: Object.freeze({
        title: "场景四视图",
        desc: "一键生成场景多视图",
        template: "{用户输入}, 生成一张四宫格场景图（没有人物）包含（顶视图 (Plan View)，轴测图/45° 俯视图 (Axonometric View)，2个多个正交立面图 (Elevations)）"
      }),
      sceneNineView: Object.freeze({
        title: "场景九视图",
        desc: "同一场景的 9 个连续多视角设定图",
        template: "根据用户输入的场景描述或上传的参考图，生成一张3×3九宫格场景设定图。\n\n九张图必须表现同一个连续、完整的场景。若提供参考图，以参考图中的空间结构、物体造型、家具位置、门窗位置、材质、颜色、灯光和整体风格为主要依据。参考图未展示的区域只进行最小合理补全，不得随意重新设计场景。\n\n九格固定顺序：\n\n1. 正面视角\n2. 左前方45°\n3. 右前方45°\n4. 左侧视角\n5. 右侧视角\n6. 后方视角\n7. 入口视角\n8. 高空45°俯视\n9. 正交俯视平面布局图\n\n前八格只改变摄影机位置，不改变场景。所有画面中的空间比例、门窗、建筑、家具、主要物体、物品数量、颜色、材质、灯光、天气和物品分布必须保持一致。\n\n第八格是高处45度斜俯视，不是垂直俯视。\n\n第九格必须是与前八格严格对应的二维正交平面布局图。室内场景表现墙体、门窗、房间、家具和入口；户外场景表现建筑、道路、地形、设施和出入口。使用简洁中文标注主要区域。\n\n严格3×3等尺寸排版，每格有细边框和白色中文标题栏。标题依次为：正面视角、左前方45°、右前方45°、左侧视角、右侧视角、后方视角、入口视角、高空45°俯视、平面布局图。\n\n禁止九个不同场景、重复视角、物体随机移动、左右关系颠倒、错误镜像、跨格画面、平面图与场景不一致、中文乱码和英文标签。\n\n{{用户输入}}"
      }),
      panorama360: Object.freeze({
        title: "360°无缝全景图",
        desc: "生成适合 VR 查看的一张无缝 360° 全景图",
        imageInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless 360° wrap-around environment 参考图片场景生成{用户输入}",
        textInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless 360° wrap-around environment 场景为：{用户输入}"
      }),
      minimaxH3Group: Object.freeze({
        title: "Minimax H3",
        desc: "人物替换提示词预设"
      }),
      minimaxH3FullCharacterReplacement: Object.freeze({
        title: "完整人物替换",
        desc: "完整替换人物外貌与穿搭"
      }),
      minimaxH3GeneralCharacterReplacement: Object.freeze({
        title: "通用人物替换",
        desc: "通用人物身份与动作继承提示词"
      }),
      minimaxH3UniversalObjectReplacement: Object.freeze({
        title: "万能换物提示词",
        desc: "局部替换指定物体并保持场景"
      }),
      minimaxH3HandheldItemReplacement: Object.freeze({
        title: "手持物品替换",
        desc: "替换手中物品并保持自然握持"
      }),
      minimaxH3VehicleReplacement: Object.freeze({
        title: "车辆替换",
        desc: "替换行驶车辆并保持物理运动"
      }),
      minimaxH3MultiPersonReplacement: Object.freeze({
        title: "多人替换",
        desc: "同步替换两名指定人物"
      }),
      minimaxH3ClothingOnlyReplacement: Object.freeze({
        title: "仅衣服替换",
        desc: "只替换主要人物服装"
      }),
      minimaxH3ClothingAndHairstyleReplacement: Object.freeze({
        title: "衣服+发型替换",
        desc: "只替换主要人物服装与发型"
      }),
      minimaxH3ReplaceOneOfTwoPeople: Object.freeze({
        title: "双人替换其中一个",
        desc: "只替换画面左侧指定人物"
      }),
      characterReferenceGroup: Object.freeze({
        title: "人设参考",
        desc: "一键生成人物多视图 三视图、三视图加脸部、人设拆解图"
      }),
      characterThreeView: Object.freeze({
        title: "人物三视图",
        desc: "纯正的三向视图展示",
        template: "生成全身三视图，右边放正视图，45度的侧视图，后视图，{用户输入 || 灰色背景}"
      }),
      characterThreeViewFace: Object.freeze({
        title: "人物三视图+脸部",
        desc: "带脸部特写的三视图",
        template: "生成全身三视图以及一张脸部特写（最左边占满三分之一的位置是上半身特写），右边三分之二放正视图，45度的侧视图，后视图，{用户输入 || 灰色背景}"
      }),
      characterFrontBackViewFace: Object.freeze({
        title: "前后视图+脸部",
        desc: "脸部特写与无头前后全身视图",
        template: "专业角色素材分页布局。左侧则展示角色脸部的大面积高细节特写肖像，突出发型、眼、肤质、妆容及表情。右侧展示同一女性角色的两个全身图，分别为正面和背面视角，重点呈现服装、轮廓、比例及靴子，头部被裁剪，不要显示头部，以突出身体与服饰设计。背景为干净的白色无缝设计，采用极简风格，现代编辑排版，留白整洁\n\n{用户输入}"
      }),
      characterAnalysis: Object.freeze({
        title: "人设解析图",
        desc: "包含细节拆解的设定集",
        template: "生成人设解析图，包含正视图、侧视图、背视图，以及服装细节拆解、面部特征特写，排版紧凑，{用户输入 || 灰色背景}"
      }),
      multiGridGroup: Object.freeze({
        title: "多宫格",
        desc: "一键生成剧情连续的多宫格图片"
      }),
      multiGrid4: Object.freeze({
        title: "4宫格",
        desc: "起承转合更清晰，适合一句话剧情",
        template: "生成一张无缝的四宫格（2x2）的连贯剧情分镜图。要求：同一角色的外观、服饰、发型保持一致；场景与光影风格统一；镜头从左上到右下依次推进；每一格都有明确动作与主体，构图干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}"
      }),
      multiGrid9: Object.freeze({
        title: "9宫格",
        desc: "3x3 更细动作与情绪递进",
        template: "生成一张无缝的九宫格（3x3）的连贯剧情分镜图。要求：角色一致性极强（外观、服饰、配色不变）；同一场景基调延续；每格推进一个小动作或情绪变化；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}"
      }),
      multiGrid16: Object.freeze({
        title: "16宫格",
        desc: "4x4 更密的节奏推进与镜头切换",
        template: "生成一张无缝的十六宫格（4x4）的连贯剧情分镜图。要求：角色与关键道具保持完全一致；每一个分镜都必须是下一个分镜的时间上或因果上的延续，不能跳跃，每格节奏更细（动作拆分、表情递进、镜头切换合理）；整体风格统一；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}"
      }),
      multiGrid25: Object.freeze({
        title: "25宫格",
        desc: "5x5 长连续剧情，适合完整片段",
        template: "生成一张无缝的二十五宫格（5x5）的连贯剧情分镜图。要求：连续叙事、强一致性（角色/服饰/配色/画风固定）；每一个分镜都必须是下一个分镜的时间上或因果上的延续，不能跳跃；镜头语言清晰；分镜顺序从左上到右下；画面干净、排版紧凑。故事/描述：{用户输入 || 一段简短剧情}"
      }),
      storyboardGroup: Object.freeze({
        title: "故事板分镜",
        desc: "一键生成故事板分镜"
      }),
      storyboardVertical: Object.freeze({
        title: "竖版故事分镜",
        desc: "竖版分镜，从上到下推进",
        template: "请根据我后面提供的【用户输入】，生成一张“专业影视分镜设定板 / Storyboard Board”。\n\n要求：\n1. 输出的是一整张竖版分镜板，不是单张插画，不是漫画页，不是海报。\n2. 整体风格为：黑灰底、细线分栏、专业影视项目提案风格。\n3. 参考图规则：如果用户输入中写了“某角色参考@图片1 / 场景参考@图片2”，则必须严格参考对应图片，保持角色外观、服装、发型、年龄气质、场景结构、时代背景、光影氛围的一致性。\n4. 整张图固定分为三部分：\n   - 顶部标题区：标题、总时长、风格关键词\n   - 中部 Storyboard 区：按用户输入中的时间段拆成 4-6 个 CUT，每行分为左中右三栏：\n     左栏：CUT编号 + 时间段\n     中栏：该镜头对应的电影感画面\n     右栏：主体 / 动作 / 描述 / 镜头 / 台词 / 音效\n5. 分镜画面必须叙事连贯、角色一致、场景一致、服装一致、光影一致。\n6. 所有中间画面都要像电影剧照，镜头语言明确，严格体现用户输入中的动作、表情、氛围和情绪推进。\n7. 右侧说明栏必须用简洁专业的中文排版，字段固定为：\n   主体：\n   动作：\n   描述：\n   镜头：\n   台词：\n   音效：\n8. 文字尽量清晰可读，不要乱码，排版整洁克制，高级感强。\n9. 最终输出只生成一张完整的、专业的、电影级影视分镜设定板。\n\n# 【用户输入】\n{用户输入 || 一段简短剧情}"
      }),
      storyboardVerticalScene: Object.freeze({
        title: "竖版故事分镜+场景",
        desc: "竖版分镜，包含场景设定参考",
        template: "请根据我后面提供的【用户输入】，生成一张“专业影视分镜设定板 / Storyboard Board”。\n\n要求：\n1. 输出的是一整张竖版分镜板，不是单张插画，不是漫画页，不是海报。\n2. 整体风格为：黑灰底、细线分栏、专业影视项目提案风格。\n3. 参考图规则：如果用户输入中写了“某角色参考@图片1 / 场景参考@图片2”，则必须严格参考对应图片，保持角色外观、服装、发型、年龄气质、场景结构、时代背景、光影氛围的一致性。\n4. 整张图固定分为三部分：\n   - 顶部标题区：标题、总时长、风格关键词\n   - 中部 Storyboard 区：按用户输入中的时间段拆成 4-6 个 CUT，每行分为左中右三栏：\n     左栏：CUT编号 + 时间段\n     中栏：该镜头对应的电影感画面\n     右栏：主体 / 动作 / 描述 / 镜头 / 台词 / 音效\n   - 底部补充区：场景图 Secondary（2张小图）+ 光影与氛围 Lighting & Mood（1张小图）+ 色彩板与风格说明（5-6个色块）\n5. 分镜画面必须叙事连贯、角色一致、场景一致、服装一致、光影一致。\n6. 所有中间画面都要像电影剧照，镜头语言明确，严格体现用户输入中的动作、表情、氛围和情绪推进。\n7. 右侧说明栏必须用简洁专业的中文排版，字段固定为：\n   主体：\n   动作：\n   描述：\n   镜头：\n   台词：\n   音效：\n8. 文字尽量清晰可读，不要乱码，排版整洁克制，高级感强。\n9. 最终输出只生成一张完整的、专业的、电影级影视分镜设定板。\n\n# 【用户输入】\n{用户输入 || 一段简短剧情}"
      }),
      storyboardHorizontal: Object.freeze({
        title: "横版故事分镜",
        desc: "横版分镜，从左到右推进",
        template: "请根据我后面提供的【用户输入】，生成一张“横版专业影视故事板 / Storyboard Sheet”。  \n要求： \n1. 输出必须是一整张横版16:9故事板表格，不是海报，不是漫画页，不是竖版分镜板。 \n2. 主体必须是“表格结构”，每一行对应一个 CUT。 \n3. 表头固定为： CUT｜秒数｜图片内容｜场景｜主体｜动作｜描述｜镜头｜台词｜音效｜色彩/光影 \n4. 按用户输入中的时间顺序，从上到下排列所有 CUT。 \n5. “图片内容”列中，每个 CUT 必须对应一张横向16:9的电影感分镜画面，真实人物质感，镜头语言明确。 \n6. “场景”列用于写该镜头的环境与空间信息。 \n7. “色彩/光影”列用于写该镜头的色调、光源、冷暖关系与氛围重点。 \n8. 其余列分别填写该镜头的主体、动作、描述、镜头、台词、音效，文字风格必须像正规影视故事板备注，简洁、专业、整齐。 \n9. 如果用户输入中有“角色参考@图片1 / 场景参考@图片2 / 道具参考@图片3”，必须严格参考并保持角色、服装、场景、氛围一致。 \n10. 整体风格为黑灰底、细线分栏、专业影视提案风格。 \n11. 最终只输出一张完整的横版故事板表格图。  \n#【用户输入】\n{用户输入 || 一段简短剧情}"
      }),
      storyboardHorizontalScene: Object.freeze({
        title: "横版故事分镜+场景",
        desc: "横版分镜，包含场景设定参考",
        template: "请根据我后面提供的【用户输入】，生成一张“横版专业影视故事板 / Storyboard Sheet”。  \n要求： \n1. 输出必须是一整张横版16:9故事板表格，不是海报，不是漫画页，不是竖版分镜板。 \n2. 主体必须是“表格结构”，每一行对应一个 CUT。 \n3. 表头固定为： CUT｜秒数｜图片内容｜场景｜主体｜动作｜描述｜镜头｜台词｜音效｜色彩/光影 \n4. 按用户输入中的时间顺序，从上到下排列所有 CUT。 \n5. “图片内容”列中，每个 CUT 必须对应一张横向16:9的电影感分镜画面，真实人物质感，镜头语言明确。 \n6. “场景”列用于写该镜头的环境与空间信息。 \n7. “色彩/光影”列用于写该镜头的色调、光源、冷暖关系与氛围重点。 \n8. 其余列分别填写该镜头的主体、动作、描述、镜头、台词、音效，文字风格必须像正规影视故事板备注，简洁、专业、整齐。 \n9. 如果用户输入中有“角色参考@图片1 / 场景参考@图片2 / 道具参考@图片3”，必须严格参考并保持角色、服装、场景、氛围一致。 \n10. 整体风格为黑灰底、细线分栏、专业影视提案风格。 \n11. 表格底部增加一条补充信息区，包含：场景总设定、综合色彩色板、整体风格说明。 \n12. 最终只输出一张完整的横版故事板表格图。  \n#【用户输入】\n{用户输入 || 一段简短剧情}"
      }),
      filmStoryboard: Object.freeze({
        title: "电影分镜故事板",
        desc: "电影镜头故事板模板",
        template: "做一张 3×4 的电影分镜网格，共 12 格，所有画面都出现同一个角色：一位短发亚洲女性，25岁左右，黑色齐耳短发，五官清冷精致，穿米白色长风衣、白色内搭、浅蓝牛仔裤和黑色短靴，气质独立、安静、有故事感。场景设定为：晴天下午的东京街头，干净街道、便利店、斑马线、路边电线杆、远处城市建筑，光线明亮柔和，有空气感。\n  12 格分别表现不同景别与镜头语言：正面近景、眼神特写、背影中景、侧脸特写、过肩镜头、全身远景、低角度仰拍、街角行走、回头瞬间、手部细节、风吹衣摆、黄昏街头收尾镜头。\n  每一格都要保持角色身份高度一致，包括脸型、发型、服装、气质和色彩设定。画面整体明亮、清晰、有电影感，构图丰富但统一，像专业影视前期分镜稿。风格参考：都市电影前期分镜、日系清新电影感、明亮写实插画。避免角色变脸、服装变化过大、画面过暗、杂乱背景、低质量线稿。"
      }),
      advertisingStoryboard: Object.freeze({
        title: "广告故事板",
        desc: "广告创意故事板模板",
        template: "生成一张 16:9 横版高清广告前期制作板，主题为「泰国冰汽水广告故事板」。整体采用深蓝色信息板底色，白色细线分区，画面整洁、商业感强，像专业广告提案板。\n  包含艺术指导、角色与风格参考、环境与场景设计、8 格故事板、灯光情绪、关键词、音频音调、镜头类型等模块。整体是明亮清凉的热带动漫广告风格，画面中冰块、气泡、水花、冷凝水、阳光高光非常明显，色彩清爽，角色一致性高，场景统一，适合品牌广告前期制作展示。"
      }),
      gameStoryStoryboard: Object.freeze({
        title: "游戏剧情故事板",
        desc: "游戏剧情演出故事板模板",
        template: "生成一张「修仙缘起」的 15 秒剧情分镜图，整体风格为黑金复古、东方美学、水墨意境。画面采用专业游戏 CG 动画前期分镜版式，包含 6 个连续分镜。\n  6 个分镜依次表现：灵根觉醒的神秘山门场景、古老测试石碑发出微光、主角缓缓走近并触碰石碑、金色符文从石碑中浮现、天灵根被选中的震撼瞬间、主角手指悬停在发光符文前的特写。\n  要求画面风格统一，角色形象一致，动作连贯，镜头衔接自然，情绪从疑惑、紧张到震撼与觉醒逐步变化。整体具有黑金东方玄幻质感、水墨氛围、电影级光影和游戏剧情宣传片的视觉冲击力。"
      }),
      sportsTrainingStoryboard: Object.freeze({
        title: "体育训练故事板",
        desc: "体育训练动作故事板模板",
        template: "生成一张 16 步篮球训练动作示意图，采用 4×4 网格布局。主角是一名年轻篮球运动员，穿着 oversized 篮球衫、黑色短裤、连脚袜和高帮运动鞋。每个格子展示一个不同的篮球训练动作，包括原地运球、交叉步运球、胯下运球、背后运球、变向突破、急停跳投、三威胁姿势、防守滑步、转身护球、上篮起步、抛投动作、后撤步投篮、接球投篮、低位脚步、传球姿势、投篮收尾。\n  风格为彩色铅笔画，色调柔和，能看出铅笔纹理。要求动作清晰，身体姿势、篮球位置、手部动作、脚的站位和重心变化明显不同。背景干净，网格排版整齐，适合作为篮球训练教学动作示意图。"
      }),
      animationStoryboard: Object.freeze({
        title: "动画故事板",
        desc: "动画镜头故事板模板",
        template: "生成一张「发光森林冒险」的动画故事板，整体风格为可爱卡通、明亮奇幻、童话冒险。画面采用专业动画前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：萤火虫入口发出微光，小主角走进森林；主角发现一颗发光种子；沿着盘绕的树根小路前进；古树裂缝缓缓睁开像眼睛一样发光；神秘守夜者从树影中出现并开口说话；主角在藤蔓追赶中惊险躲避；发光种子被放入古树中心，点亮整片森林；最后以蓝色月光下的森林全景收尾。\n  每个分镜包含简单对白气泡，例如「这里好亮！」「它在呼唤我们」「快跑！」「森林醒来了」。要求角色一致，动作连贯，情绪从好奇、惊讶、紧张到温暖治愈逐步变化。画面风格统一，色彩明亮，分镜清晰，像专业动画故事板。"
      }),
      musicVideoStoryboard: Object.freeze({
        title: "MV音乐视频故事板",
        desc: "音乐视频画面故事板模板",
        template: "生成一张「霓虹雨夜」的 MV 音乐视频故事版，整体风格为赛博都市、霓虹灯光、孤独浪漫。画面采用专业音乐视频前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：雨夜城市远景，霓虹灯在湿润街道上反射；女歌手撑着透明雨伞走进画面；近景拍摄她低头轻唱第一句歌词；街边广告屏闪烁蓝紫色光；副歌部分她站在天桥中央，身后车流形成光轨；舞蹈段落中多人剪影在雨中起舞；情绪高潮时女歌手抬头看向天空，雨滴被霓虹照亮；最后以清晨微光下空荡街道收尾。\n  每个分镜加入简短歌词片段或情绪提示，例如「雨落下时，我还在等你」「城市不说话」「灯光替我记得你」。要求角色一致，情绪从孤独、克制到释放再到释然，画面统一，灯光高级，像专业 MV 故事板。"
      }),
      comicStoryboardPage: Object.freeze({
        title: "漫画分镜页",
        desc: "漫画页面分镜模板",
        template: "生成一张「午夜觉醒」的漫画分镜页，整体风格为现代热血青年漫画、黑白墨线、局部红色强调。画面采用专业漫画页构图，包含 8 个大小不同的分镜。\n  8 个分镜依次表现：深夜城市天台，男主独自站在风中；眼神特写，瞳孔中出现红色光芒；手机收到神秘信息「你被选中了」；天空突然裂开，黑色能量降落；男主被冲击波震退，手臂浮现金色符文；敌人剪影从烟雾中出现；男主握紧拳头，能量爆发；最后一格为大画幅英雄站姿，男主说「从现在开始，由我决定命运。」\n  加入对白气泡、速度线、冲击线、墨迹飞溅和音效字，例如「轰！！」「咔嚓」「嗡——」。要求分镜节奏紧张，情绪从疑惑、震惊到觉醒爆发，画面统一，像正式漫画连载页。"
      }),
      socialShortVideoStoryboard: Object.freeze({
        title: "社交媒体短视频分镜",
        desc: "短视频节奏分镜模板",
        template: "生成一张「5分钟整理书桌」的社交媒体短视频分镜图，整体风格为清新生活方式、小红书感、明亮治愈。画面采用短视频脚本前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：开头钩子，凌乱书桌特写，字幕「你的桌面是不是也这样？」；人物皱眉看着桌面；清空桌面，把物品分类；擦拭桌面，阳光照进房间；摆放收纳盒、笔筒和台灯；整理前后对比画面；人物坐下开始学习，表情放松；最后展示干净桌面全景，字幕「5分钟，让学习状态回来」。\n  要求字幕清晰，镜头有近景、俯拍、对比镜头和全景，节奏从混乱到治愈，画面明亮统一，适合短视频拍摄前期分镜。"
      }),
      brandPromotionStoryboard: Object.freeze({
        title: "品牌宣传故事版",
        desc: "品牌宣传画面故事版模板",
        template: "生成一张「LUMO 智能台灯」的品牌宣传故事版，整体风格为现代极简、温暖科技、生活方式广告。画面采用专业品牌宣传片前期分镜版式，包含 8 个连续分镜。\n  8 个分镜依次表现：夜晚书桌前，年轻设计师疲惫地揉眼睛；桌面光线昏暗，设计稿散落；LUMO 智能台灯轻轻亮起，柔和光线覆盖桌面；手机 App 自动调节亮度与色温；设计师重新开始绘图，表情放松；清晨阳光进入房间，作品完成；台灯与整洁桌面形成高级产品特写；最后品牌口号出现：「LUMO，让灵感被温柔照亮。」\n  要求品牌感高级，产品出现自然，人物情绪从疲惫到专注再到满足，画面干净统一，像真实品牌宣传片故事板。"
      }),
      tutorialStoryboard: Object.freeze({
        title: "教程类分镜图",
        desc: "教程步骤画面分镜模板",
        template: "生成一张「手冲咖啡教学」的教程类分镜图，整体风格为温暖生活方式、极简插画、咖啡馆氛围。画面采用清晰步骤教学版式，包含 8 个连续步骤分镜。\n  8 个步骤依次表现：准备滤杯、滤纸、咖啡豆和手冲壶；研磨咖啡豆；放入滤纸并用热水润湿；倒入咖啡粉并轻轻铺平；第一次注水进行闷蒸；分三次画圈注水；咖啡滴滤完成；倒入杯中并展示成品咖啡。\n  每个分镜加入箭头、编号和简短说明文字，例如「研磨」「润湿滤纸」「闷蒸30秒」「缓慢注水」。要求动作清晰、器具位置准确、步骤连贯，画面干净高级，像专业教程信息图。"
      }),
      hdFilmProductionBoard: Object.freeze({
        title: "高清电影制作板",
        desc: "高清电影制作板模板",
        template: "创建一张 16:9 横版高清电影制作板 / 视觉规划表，主题为「奔驰跑车性能广告」。整体呈现高端汽车广告前期制作板风格，布局简洁、结构清晰、分区明确，具有影视级商业质感，适合作为导演拍摄指南。\n  画面主体围绕一辆银灰色奔驰 AMG 跑车，强调速度、精准、豪华、操控和夜间赛道性能。整体视觉为深色高级底板，搭配白色细线分区、冷蓝灯光、银灰金属质感、红色尾灯轨迹和少量品牌红色点缀。\n  顶部栏为艺术指导区，展示项目概述：16:9 赛车性能短片、8 个主要镜头、夜晚赛车场环境、统一色卡、影片基调关键词。色卡包括深黑、炭灰、银灰、冷蓝、尾灯红。\n  左侧为车辆与赛车手风格参考区：展示奔驰跑车的正面、侧面、背面、车灯特写、轮毂特写、内饰方向盘、车标细节；同时展示赛车手在车内的驾驶姿态参考，赛车手必须佩戴黑色全盔、黑色赛车服、赛车手套，形象保持一致，不出现车外站立画面。\n  中上区域为环境与场景设计：展示一个极具电影感的夜晚赛车场，湿润赛道反射冷蓝灯光，远处看台、泛光灯、赛道护栏、弯道漂移区域清晰可见。旁边加入俯视赛道示意图，用红色路线标出赛车移动路径，并标注摄像机位置、跟拍点、漂移弯道、低机位、车内镜头、无人机俯拍等镜头类型。\n  中部为 8 格故事板分镜，所有分镜为 16:9 小画幅，编号清晰，展示完整拍摄流程：\n  1. 夜晚赛车场广角建立镜头，奔驰跑车进入赛道；\n  2. 低机位车头推进，车灯划破黑暗；\n  3. 车内特写，赛车手戴头盔握紧方向盘；\n  4. 轮胎与地面微距，轮胎打滑，水花和烟雾飞溅；\n  5. 跑车高速过弯漂移，加入强烈运动模糊；\n  6. 车尾跟拍，红色尾灯形成光轨；\n  7. 无人机俯拍，车辆沿赛道路线高速穿梭；\n  8. 英雄收尾镜头，跑车停在赛道灯光下，车身反射高级冷光。\n  每个分镜下方加入小型信息条，标注镜头类型、景别、运动方式、动作描述和情绪进展，例如：广角 / 中景 / 特写 / 微距，静态 / 跟拍 / 低机位 / 手持 / 航拍，速度感、压迫感、精准操控、胜利收束。\n  底部模块包含灯光与情绪、关键词、音频音调、镜头语言与后期风格。灯光强调冷蓝赛道灯、红色尾灯、金属反光、湿地反射和高对比阴影；关键词包括性能、速度、精准、控制、豪华、夜赛、漂移；音频包括低频电子音乐、引擎轰鸣、轮胎摩擦、水花飞溅、风噪和加速声浪；镜头语言包括低角度推进、车内主观镜头、轮胎微距、跟车镜头、无人机俯拍、运动模糊和高速剪辑。\n  整体画面必须保持专业、整洁、连贯、商业广告感强，分镜节奏清晰，禁止出现赛车手在车外的画面，赛车手始终在车内并佩戴头盔。画面要一眼传达奔驰跑车的速度、力量、精密操控和高级豪华气质。"
      }),
      xianxiaGuomanStoryboard: Object.freeze({
        title: "修仙国漫故事板",
        desc: "修仙国漫剧情故事板模板",
        template: "创建一张 16:9 横版高清「30 秒科幻修仙国漫影视视觉开发板」，参考好莱坞工业化电影前期制作标准，整体为冷调写实电影质感、东方玄幻美学、未来科技感和国漫高燃叙事风格。\n  画面采用高级深色信息板排版，分为 6 大模块：顶部项目信息栏，展示片名、时长、类型、调性、镜头数量和主色调；左上双主角人设设计栏，展示两位主角的正面、侧面、背面三视图、面部特写、服装细节、武器法器和科技装备，角色造型必须高度一致；右上核心场景概念图，展示悬浮仙城、灵能天门、赛博仙山或量子阵法等宏大科幻修仙场景；中部 3 组连续镜头故事板序列，展示镜头编号、景别、运镜、动作和情绪推进；镜头运动与技术示意区，包含运镜轨迹、相机运动流程、机位图标和空间调度；底部专业技术参数栏，展示灯光氛围、色卡、镜头参数、后期风格、音频基调和视觉关键词。\n  整体要求专业影视工业级排版，信息密度高但清晰有序，画面统一精致，角色不变脸，文字不混乱，无低质拼贴。色调以冷蓝、玄黑、银灰、暗金、灵能青和能量白为主。4K 超清，ultra-detailed，professional film production layout，cinematic shot design，适配 Seedance 2.0 专业视频生成。」\n  整体视觉要求：\n   高级教程海报、清晰排版、上下结构明确、标题醒目、提示词区域可读性强、留白合理、设计感强。严格保持 3:4 教程图模板结构，不要把整张图做成横版影视视觉开发板。不要杂乱，不要低质截图感，不要文字堆叠混乱，不要廉价海报风。"
      }),
      reverseImagePrompt: Object.freeze({
        title: "反推图片提示词",
        desc: "根据参考图反推出中英文生图提示词",
        template: "你是一名专业 AI 图像提示词反推工程师。\n\n我将上传一张图片，请你根据图片内容，反推出一段可以用于 AI 生图模型生成同款图片的提示词。\n\n要求：\n1. 不要只是普通描述图片，而是要写成“可直接用于 AI 生图”的提示词。\n2. 请完整分析画面中的：主体、人物数量、性别年龄、外貌特征、服装、发型、动作、姿态、表情、视线方向、手部动作。\n3. 请分析景别与构图：特写/近景/中景/全身/远景，正面/侧面/背影，俯拍/仰拍/平视，人物在画面中的位置，背景虚化程度。\n4. 请分析环境：室内/室外、地点、时间、天气、背景元素、前景/中景/远景。\n5. 请分析光线：自然光/棚拍光/逆光/侧光/柔光/硬光、光源方向、阴影、高光。\n6. 请分析色彩与氛围：主色调、冷暖、饱和度、对比度、情绪氛围。\n7. 请分析风格：真实摄影、电影感、杂志大片、日系写真、商业广告、动漫、3D、油画等。\n8. 请分析镜头语言：镜头焦段、景深、画质、胶片感、颗粒感、清晰度。\n9. 如果图片中有无法确定的信息，请根据画面合理推断，但不要编造明显不存在的元素。\n10. 最终请输出一段完整的中文提示词、一段英文提示词，以及一段反向提示词。\n\n\n输出格式如下：\n\n【画面拆解】\n主体：\n景别与构图：\n人物动作：\n表情与视线：\n服装与造型：\n场景环境：\n光线：\n色彩氛围：\n风格：\n镜头与画质：\n\n【中文完整提示词】\n把上面的信息整合成一段流畅、专业、可直接用于 AI 生图的中文提示词。\n\n【English Prompt】\nTranslate and optimize the prompt into natural English for AI image generation.\n\n【反向提示词】\n输出用于避免低质量、畸变、错误细节、文字水印等问题的中文反向提示词。"
      }),
      longToShort: Object.freeze({
        title: "长篇精缩V1",
        desc: "一键把长篇内容精缩成短篇",
        template: "\n    {用户输入} # 对以上的小说剧情文案进行大幅精简（目标篇幅约为原文的50*-70%）\n完整保留原文对话，同时按照“对白驱动剧情”的结构重新梳理旁白与独白，保留原文段落结构与标点符号。\n用第一人称进行改文\n锁定所有对话： 识别并保护所有直接引语，确保一字不改。\n构建开篇（10%）： 提炼原文关键背景（时代、世界观、人物身份），用简短叙事交代框架。\n精简叙事（20%）： 大幅删减环境描写和过度修饰，仅保留连接对话必要的动作和场景推进。\n筛选独白（30%）： 保留能强化冲突、体现人物压力和真实状态的核心心理描写，删去流水账式的心理活动。\n格式输出： 保持小说文本格式，保留标点符号，保留原段落分行（必要时可合并过碎的描述段落，但不可合并对话段落）。\n# 结构与内容规则\n## 【整体篇幅控制】\n总字数目标： 控制在原文的 50-70% 左右。\n精简策略： 由于对话不能动，主要通过大幅删减“非对话部分的废话”来达成字数减半的目标。\n## 【文本结构比例】\n对白（核心）： 占比最高。严格保持原文，不得增删改一字。\n内心独白（约30%）： 紧贴对话，用于强化情绪、痛感、压迫或绝望。\n叙事（约20%）： 仅作铺垫和连接，禁止写成分镜（如“镜头一转”），禁止扩写。\n背景（约10%）： 开篇必须交代，不可省略。\n##【写作形式与风格】\n输出格式： 纯正的小说文本，保留标点符号，保留段落感。\n风格要求： 对白驱动剧情。通过精简旁白，让对话节奏更紧凑，冲突更集中。\n## 禁止项：\n❌ 禁止出现分镜词（特写、远景、淡入淡出）。\n❌ 禁止出现时间轴（0-5秒）。\n❌ 禁止删除或修改任何一句对话。\n❌ 禁止新增原文没有的情节或设定。\n## 情绪与逻辑\n逻辑： 尽管大幅删减了旁白，必须确保对话与动作的衔接流畅，事件顺序严格遵照原文。\n氛围： 突出原文中的冲突与张力，保留关键的情绪转折点。\n## 输出要求\n直接输出修改后的完整文案。\n保留标点符号和段落格式。"
      }),
      extractInfo: Object.freeze({
        title: "提取人物场景道具信息",
        desc: "提取文本中的人物、场景、道具信息",
        template: "{用户输入}\n# 筛选出以上故事里的角色（包括主要怪物）、场景以及道具物品\n把以上每个角色根据剧情写出详细中文提示词包括五官相貌，脸型，发型，全身服饰提示词。重要物品，场景\n用 --- 符号来分割每一个角色,先把人设输出完毕，最后再输出场景，如有角色不同状态也需要标注出来(但不需要太详细)，不用输出多余说明，不带有格式\n# 输出示例：\n\n#人设\n1. 主角：沈仪\n# 中文提示词：\n1个青年男性，古风，捕快，英俊硬朗，剑眉星目，黑色长发，凌乱发髻，身穿古代黑色官差制服，衣衫不整，暗黑武侠，电影光效。\n# 中文提示词(受伤状态)：\n.....\n\n---\n\n2. 配角：刘家丫头\n...\n...\n...\n\n---\n# 重要物品\n1. 腰间佩戴的一把制式长刀（佩刀），刀柄古旧；\n2. 。。。。\n# 场景：\n1. 昏暗的破旧土屋或夜晚的院落，月光惨白，暗黑压抑氛围。\n2. ....\n"
      }),
      formatShortDrama: Object.freeze({
        title: "格式化短剧提示词",
        desc: "将小说一键转化为标准AI视频提示词脚本",
        template: "{用户输入}\n\n将以上故事转化为标准 AI 短剧视频提示词脚本。按剧情顺序拆分为连续镜头，忠实保留原始情节与对白；每个镜头写清楚场景、角色、动作、运镜、情绪、台词、音效和视觉连续性说明。不要新增原文没有的事件。"
      }),
      storyboardScript: Object.freeze({
        title: "影视级叙事分镜脚本",
        desc: "将小说一键转化为标准戏剧化脚本，专为AI短剧视频量身定制",
        template: "## 核心任务\n你是一个专业的AI分镜脚本生成器。任务是基于提供的文本信息，生成“视频提示词”的分镜脚本，分割后的上下分镜必须十分丝滑的连贯。\n\n# 输入信息\n\n**故事情节：**\n{用户输入}\n\n# 视频提示词原则\n\n## 视觉关键词密集度\n\n- 规则：为最大化 AI 模型对画面的控制力，必须使用大量具体的、高辨识度的视觉描述词汇\n- 场景、角色、光影、特效必须混合使用（例如：“幽蓝色的霓虹线路”、“血红色的赛博月亮”、“凌厉的金色电光”、“数码化的爆炸效果”）。\n\n## 运镜的专业化和指令化\n\n- 规则：采用专业电影术语而非简单描述，以明确规定画面的动态行为。\n- 严格使用【超广角】、【特写】等**景别**，以及【慢速推轨】、【环绕慢摇】、【动态手持】等**镜头运动**指令。\n\n## *动作的分解与强调\n\n- 逻辑：复杂的动作不能一笔带过，必须分解成关键帧和关键特写，确保动作的冲击力。\n- 使用【爆发式跃出】（远景）接【腰部极限扭转】（近景），再接【接触的瞬间】（慢动作特写），突出高速和高冲击。\n\n## 人物台词\n- 原文中的对话内容不允许进行擅自删改。要把输入文案作为唯一的信息来源，忠实地将其内容转化为分镜脚本，避免添加任何文案中未提及的情节、动作、场景或角色心理活动。\n- 对话要用“”标示出来。\n\n## 时长与节奏的控制：\n\n- 为每个分镜设定一个合理的时长，以控制最终视频的节奏感。短时间用于高冲击特写，长时间用于场景铺垫或关键动作。\n- 提示词应用的视频时长15秒及以内，剧本包含画面，运镜，所以每一幕的提示词不能超过该时间\n\n## 听觉元素\n\n- 在关键动作后备注音效提示，如“尖锐的破空声与低沉的能量轰鸣”或“无台词，只有金属、能量、符文破碎的声音”。\n\n# 输出格式严格遵循的规则：\n1.  保持连续性：\n    - 为保证场景一致性，若前后剧情为统一场景则需要延续上一则剧本的场景\n\n2.  剧情不能改变：\n    - 保留剧情上的所有对话。 \n\n3.  设定角色、场景映射：\n    - 但凡该幕出场的所有角色都应该有角色映射（[人名]参考@图片参考@音频）\n\n4.  输出格式：\n    - 按顺序输出分镜描述，不需要解释或分析过程。\n    - 输出的内容应当没字体样式。\n\n5. **提示词推理限制：不得出现任何违禁词，违禁词包括词典如下**：\n\n“ 血液相关：血液飞溅、喷血、鲜血淋漓、血池、血祭、断头血、内脏出血、血腥场面、血债、血洗\n暴力场景：分尸、碎尸、斩首、砍头、挖眼、掏心、剥皮、凌迟、虐杀、酷刑、断肢、爆头、穿刺、撕咬\n其他暴力：屠杀、灭门、焚尸、鞭尸、尸横遍野、血肉模糊、骨裂、脑浆、内脏外露、残肢断臂\n裸露低俗类：全裸、半裸、袒胸露背、露脐、露臀、露私密部位、一丝不挂、裸体、赤裸 低俗暗示：性感暴露、挑逗性裸露、低俗姿势、暴露隐私部位、酥胸半露、衣不蔽体\n违规场景：色情暗示、艳情、低俗互动、性挑逗、裸露祭祀\n色情与性暗示类：色情、淫秽、嫖娼、卖淫、性交易、一夜情、通奸、乱伦、恋童、兽交 暗示类：约炮、撩骚、打炮、床上戏、胸器、美腿诱惑、性感撩拨、暧昧低俗、艳舞、脱衣舞 敏感部位描述：乳房、阴部、阴茎、臀部\n其他高危敏感词封建迷信：血腥祭祀、活人献祭、血咒、尸变、僵尸吸血、妖魔鬼怪（恐怖化描述，如 \"食人恶鬼\"） \n危害公序良俗：自残、自杀、暴力教唆、聚众斗殴、黑帮火拼、恐怖袭击、校园暴力\n敏感宗教 / 政治：邪教仪式、极端宗教、分裂、恐怖组织、反动、颠）”\n\n# 固定的模板格式\n    - 使用 ---  作为每一幕提示词的分隔符。 \n    - 提示词第一部分：最顶部固定是（第X幕）无字幕，无BGM\n    - 第二部分为内容（每一幕都用动作来收尾，为了更好的衔接视频上下文）。\n    - 场景基调要固定好！为了更好的衔接上下镜头（如：秋季，大风，漆黑的夜晚）。\n\n## 输出样例\n第一幕：\n无字幕，无BGM\n沈仪的形象参考@图片1音色参考@音频1，犬妖参考@图片2音色参考@音频2\n夜晚，破旧院落。\n【中景镜头】，沈仪脸上挤出僵硬的笑容，用肩膀撞了一下犬妖的胳膊。\n（人声强颜欢笑） 沈仪说：“老弟的本事你还不清楚，哪里快的起来。走走走，今晚我请酒。”\n沈仪试图推着犬妖往外走，但犬妖纹丝不动。\n犬妖低头俯视沈仪，眼神冰冷漠然。\n犬妖甩开沈仪的手，转身走向院内。沈仪下意识伸手去拦，被犬妖毛茸茸的爪子一把抓住手腕。\n（人声冷漠）犬妖说：“伱当我是蠢猪？”\n【特写镜头】，犬妖猛然贴近沈仪的脸，张开满是尖牙的大嘴，唾液拉丝。\n\n--- \n\n第二幕：\n无字幕，无BGM\n沈仪的形象参考@图片1音色参考@音频1，犬妖参考@图片4音色参考@音频3\n夜晚，破旧院落。\n【特写镜头】，犬妖猛然贴近沈仪的脸，张开满是尖牙的大嘴，唾液拉丝。\n（人声愤怒）犬妖说：“姓沈的，你好像真拿自己当个东西了。里面的动静我听的清清楚楚，你他妈敢反水？！”\n【镜头快速后拉】，犬妖抬起粗壮的大腿猛地蹬向沈仪腹部。\n沈仪面部表情扭曲，整个人如破麻袋般倒飞出去，撞破屋门摔入屋内。\n（人声痛苦）沈仪说：“不是，你属狗的？说翻脸就翻脸？”\n（人声愤怒）犬妖说：“给脸不要脸的东西，合该拿你一起来祭我五脏六腑。”\n沈仪瘫软在地，用力捂住小腹\n"
      }),
      storyboardScriptTimed: Object.freeze({
        title: "影视级叙事分镜脚本-秒级",
        desc: "精确到秒的光影渲染、运镜与音效控制，专为AI短剧视频量身定制",
        template: "## 核心任务\n你是一个专业的AI分镜脚本生成器。任务是基于提供的文本信息，生成“视频提示词”的分镜脚本，分割后的上下分镜必须十分丝滑的连贯。\n# 输入信息\n\n**故事情节：**\n{用户输入}\n\n# 视频提示词原则\n\n## 视觉关键词密集度\n\n- 规则：为最大化 AI 模型对画面的控制力，必须使用大量具体的、高辨识度的视觉描述词汇\n- 场景、角色、光影、特效必须混合使用（例如：“幽蓝色的霓虹线路”、“血红色的赛博月亮”、“凌厉的金色电光”、“数码化的爆炸效果”）。\n\n## 运镜的专业化和指令化\n\n- 规则：采用专业电影术语而非简单描述，以明确规定画面的动态行为。\n- 严格使用【超广角】、【特写】等**景别**，以及【慢速推轨】、【环绕慢摇】、【动态手持】等**镜头运动**指令。\n\n## *动作的分解与强调\n\n- 逻辑：复杂的动作不能一笔带过，必须分解成关键帧和关键特写，确保动作的冲击力。\n- 使用【爆发式跃出】（远景）接【腰部极限扭转】（近景），再接【接触的瞬间】（慢动作特写），突出高速和高冲击。\n\n## 人物台词\n- 原文中的对话内容不允许进行擅自删改。要把输入文案作为唯一的信息来源，忠实地将其内容转化为分镜脚本，避免添加任何文案中未提及的情节、动作、场景或角色心理活动。\n- 对话要用“”标示出来。\n\n## 时长与节奏的控制：\n\n- 为每个分镜设定一个合理的时长，以控制最终视频的节奏感。短时间用于高冲击特写，长时间用于场景铺垫或关键动作。\n- 提示词应用的视频时长15秒及以内，剧本包含画面，运镜，所以每一幕的提示词不能超过该时间\n\n## 听觉元素\n\n- 在关键动作后备注音效提示，如“尖锐的破空声与低沉的能量轰鸣”或“无台词，只有金属、能量、符文破碎的声音”。\n\n# 输出格式严格遵循的规则：\n1.  保持连续性：\n    - 为保证场景一致性，若前后剧情为统一场景则需要延续上一则剧本的场景\n\n2.  剧情不能改变：\n    - 保留剧情上的所有对话。 \n\n3.  设定角色、场景映射：\n    - 但凡该幕出场的所有角色都应该有角色映射（[人名]参考@图片参考@音频）\n\n4.  输出格式：\n    - 按顺序输出分镜描述，不需要解释或分析过程。\n    - 输出给我的内容应当没字体样式。\n\n5. **提示词推理限制：不得出现任何违禁词，违禁词包括词典如下**：\n\n“ 血液相关：血液飞溅、喷血、鲜血淋漓、血池、血祭、断头血、内脏出血、血腥场面、血债、血洗\n暴力场景：分尸、碎尸、斩首、砍头、挖眼、掏心、剥皮、凌迟、虐杀、酷刑、断肢、爆头、穿刺、撕咬\n其他暴力：屠杀、灭门、焚尸、鞭尸、尸横遍野、血肉模糊、骨裂、脑浆、内脏外露、残肢断臂\n裸露低俗类：全裸、半裸、袒胸露背、露脐、露臀、露私密部位、一丝不挂、裸体、赤裸 低俗暗示：性感暴露、挑逗性裸露、低俗姿势、暴露隐私部位、酥胸半露、衣不蔽体\n违规场景：色情暗示、艳情、低俗互动、性挑逗、裸露祭祀\n色情与性暗示类：色情、淫秽、嫖娼、卖淫、性交易、一夜情、通奸、乱伦、恋童、兽交 暗示类：约炮、撩骚、打炮、床上戏、胸器、美腿诱惑、性感撩拨、暧昧低俗、艳舞、脱衣舞 敏感部位描述：乳房、阴部、阴茎、臀部\n其他高危敏感词封建迷信：血腥祭祀、活人献祭、血咒、尸变、僵尸吸血、妖魔鬼怪（恐怖化描述，如 \"食人恶鬼\"） \n危害公序良俗：自残、自杀、暴力教唆、聚众斗殴、黑帮火拼、恐怖袭击、校园暴力\n敏感宗教 / 政治：邪教仪式、极端宗教、分裂、恐怖组织、反动、颠）”\n\n# 固定的模板格式\n    - 使用 ---  作为每一幕提示词的分隔符。 \n    - 提示词第一部分：最顶部固定是（第X幕）无字幕，无BGM\n    - 第二部分为内容（可以的话每一幕都用动作来收尾，为了更好的衔接视频上下文）。\n    - 场景基调要固定好！为了更好的衔接上下镜头（如：秋季，大风，漆黑的夜晚）。\n\n# 输出样例\n第1幕\n无字幕，无BGM\n沈仪参考@图片1，刘家丫头参考@图片2\n场景参考@图片4 昏暗潮湿的土屋，夜间，油灯摇曳，阴冷压抑的色调，空气中漂浮尘埃。\n0-1.5s：【特写】沈仪猛然睁眼，满头冷汗，呼吸急促。镜头快速推向其手掌，指缝间沾染暗红印记\n1.5-3s：【主观镜头】沈仪视线。床脚刘家丫头衣衫凌乱、瑟瑟发抖；身侧老头佝偻，手中木棒顶端滴落粘稠暗色液体。\n3-6s：【中景】沈仪按着后脑，神情痛苦狰狞，戾气在眉宇间聚集。\n6-9s：【特写】沈仪咬牙，眼神凶狠，胸膛剧烈起伏。\n（愤怒）沈仪：“嗬哧！……我说……”\n音效：沉重的喘息声，心跳如鼓点，油灯爆裂的滋滋声。\n9-15s：【低角度特写】刘丫头突然扑上前来，双手死死抱住沈仪小腿，神情绝望癫狂。\n（惊恐）刘丫头：“爷！我给您！我什么都给您！您放俺爹回乡下好不好？”\n\n--- \n\n第2幕\n.....\n.....\n....."
      }),
      seedance2VideoFormat: Object.freeze({
        title: "Seedance2.0视频格式",
        desc: "按用户秒数或默认15秒输出 Seedance 2.0 秒级视频提示词",
        template: "{用户输入}\n如用户指定秒数就按照用户的来，如没指定就按照15秒来写提示词，不要输出多余内容。严格按照下面格式输出提示词\nx-xs：景别，行为\nx-xs：景别，行为\nx-xs：景别，行为\n示例：0-1s：特写镜头，人物拿起刀.............../"
      })
    })
  }),
  webPreview: Object.freeze({
    tabs: Object.freeze({
      defaultTitle: "新标签页",
      loginWindow: "登录窗口"
    }),
    nodeName: "浏览器",
    addressPlaceholder: "输入网址或搜索内容",
    status: Object.freeze({
      default: "输入网址或搜索内容后按 Enter 预览",
      loading: "正在加载网页...",
      loaded: "网页已加载",
      refreshing: "正在刷新网页...",
      loadFailed: "网页加载失败",
      blocked: "已阻止该跳转",
      nativeUnsupported: "当前环境不支持原生浏览器"
    }),
    toolbar: Object.freeze({
      back: "后退",
      forward: "前进",
      open: "打开网页",
      refresh: "刷新",
      extractMedia: "提取页面素材",
      extractImages: "提取页面图片",
      extractVideos: "识别页面视频",
      saveReference: "保存网页参考卡片",
      openExternal: "在浏览器打开",
      exitFullscreen: "退出全屏",
      fullscreen: "全屏显示"
    }),
    startPage: Object.freeze({
      title: "浏览器"
    }),
    shortcutEditor: Object.freeze({
      namePlaceholder: "名称",
      urlPlaceholder: "网址",
      cancel: "取消",
      save: "保存"
    }),
    shortcuts: Object.freeze({
      add: "添加快捷方式",
      more: "更多",
      menu: Object.freeze({
        rename: "重命名",
        delete: "删除",
        unpin: "从页面取消固定",
        pin: "固定到页面",
        deleteHistory: "删除记录"
      })
    }),
    toasts: Object.freeze({
      addressRequired: "请输入网址或搜索内容",
      maxTabs: "标签页数量已达上限",
      textSent: "网页文本已发送到画布",
      sourceTextSent: "网页文本已发送到源文本",
      imagePromptCreated: "已创建图像节点",
      imagePromptGenerateStarted: "已创建图像节点，正在自动生成",
      imagePromptGenerateFailed: "已创建图像节点，但自动生成失败：{error}",
      imagePromptGenerateNodeNotReady: "图像节点尚未完成挂载",
      videoPromptCreated: "已创建视频节点",
      videoPromptGenerateStarted: "已创建视频节点，正在自动生成",
      videoPromptGenerateFailed: "已创建视频节点，但自动生成失败：{error}",
      videoPromptGenerateNodeNotReady: "视频节点尚未完成挂载",
      imageAdded: "网页图片已加入画布",
      reversePromptCreated: "已创建反推提示词节点",
      reversePromptGenerateStarted: "已创建反推提示词节点，正在自动生成",
      reversePromptGenerateFailed: "已创建反推提示词节点，但自动生成失败：{error}",
      reversePromptGenerateUnavailable: "生成命令不可用",
      reversePromptGenerateNodeNotReady: "节点尚未完成挂载",
      openPageFirst: "请先打开网页",
      extractMediaFailed: "页面素材提取失败",
      saveReferenceFailed: "网页参考卡片保存失败",
      referenceAdded: "网页参考卡片已添加到画布",
      openExternalFailed: "无法打开外部链接",
      invalidShortcutUrl: "请输入有效的 http/https 网页地址",
      saveShortcutFailed: "保存快捷方式失败"
    }),
    capture: Object.freeze({
      fallback: Object.freeze({
        image: "网页图片",
        video: "网页视频",
        reference: "网页参考"
      }),
      nodeNames: Object.freeze({
        generatedText: "生成文本",
        sourceText: "源文本",
        imagePrompt: "生成图像",
        videoPrompt: "生成视频",
        webReference: "网页参考"
      }),
      videoSources: Object.freeze({
        player: "播放器",
        pageLink: "页面链接",
        pageAttribute: "页面属性",
        loadedResource: "加载资源",
        scriptUrl: "脚本直链",
        structuredData: "页面数据",
        douyinDetail: "抖音详情",
        videoSource: "视频来源"
      }),
      videoTooltip: Object.freeze({
        source: "来源：{source}",
        url: "地址：{url}",
        page: "页面：{url}"
      }),
      mediaPicker: Object.freeze({
        title: "提取页面素材",
        videoNotice: "视频仅保存页面公开暴露的直链素材，不解析流媒体播放列表、不绕过登录或平台限制。请确认你有权保存和使用所选视频。",
        consent: "我确认有权保存和使用所选网页视频素材",
        count: "图片 {imageSelected}/{imageMax} · 视频 {videoSelected}/{videoMax}"
      }),
      videoPicker: Object.freeze({
        title: "保存页面视频素材",
        notice: "仅保存页面公开暴露的直链视频，不解析流媒体播放列表、不绕过登录或平台限制。请确认你有权保存和使用所选素材。"
      }),
      imagePicker: Object.freeze({
        title: "提取图片"
      }),
      buttons: Object.freeze({
        selectAll: "全选",
        clearSelection: "取消全选",
        cancel: "取消",
        addToCanvas: "添加到画布",
        saveAsSourceVideo: "保存为源视频节点"
      }),
      filters: Object.freeze({
        all: "全部",
        image: "图片",
        video: "视频"
      }),
      toasts: Object.freeze({
        noMedia: "当前页面没有可提取的图片或可保存的公开直链视频",
        imageLimit: "一次最多提取 {limit} 张图片",
        videoLimit: "一次最多保存 {limit} 个视频素材",
        mediaAdded: "已添加 {count} 个网页素材",
        noVideos: "当前页面没有可保存的公开直链视频",
        videosSaved: "已保存 {count} 个网页视频素材",
        noImages: "当前页面没有可提取的图片",
        imagesAdded: "已添加 {count} 张网页图片"
      })
    })
  }),
  mediaProcessing: Object.freeze({
    compose: Object.freeze({
      buttonLabel: "合成",
      video: Object.freeze({
        buttonLabel: "合成视频",
        minSelection: "至少选择 2 个视频片段",
        invalidSource: "选中的视频源无效",
        progress: "⏳ 正在合成视频...",
        missingApi: "后端接口不存在：/api/v2/video/compose（请重启 server.py）",
        fallback: "合成失败",
        resultName: "合成视频",
        success: "✅ 合成完成，已生成新视频节点",
        failedWithMessage: "❌ 合成失败: {message}"
      }),
      audio: Object.freeze({
        buttonLabel: "合并音频",
        minSelection: "至少选择 2 个音频片段",
        invalidSource: "选中的音频源无效",
        progress: "⏳ 正在合并音频...",
        missingApi: "后端接口不存在：/api/v2/audio/compose（请重启 server.py）",
        fallback: "合并失败",
        resultName: "合并音频",
        success: "✅ 合并完成，已生成新音频节点",
        failedWithMessage: "❌ 合并失败: {message}"
      }),
      audioVoice: Object.freeze({
        invalidSource: "语音工作室合成源无效",
        missingTask: "当前环境不支持本地语音合成任务",
        videoProgress: "正在合成完整视频...",
        audioProgress: "正在合成完整音频...",
        videoResultName: "语音工作室视频",
        audioResultName: "语音工作室音频",
        videoSuccess: "合成完成，已生成新视频节点",
        audioSuccess: "合成完成，已生成新音频节点",
        fallback: "语音工作室合成失败",
        failedWithMessage: "语音工作室合成失败: {message}"
      })
    }),
    videoAudioSeparation: Object.freeze({
      incompleteResult: "音画分离返回结果不完整",
      videoFallback: "视频",
      videoNodeName: "画面自 {name}",
      audioNodeName: "音频自 {name}",
      unsupportedNode: "当前节点不支持音画分离",
      busy: "当前视频正在处理中，请稍后再试",
      notLocalFile: "当前视频不是可处理的本地文件",
      progress: "正在音画分离...",
      success: "音画分离完成，已生成画面和音频节点",
      fallback: "音画分离失败",
      failedWithMessage: "音画分离失败: {message}"
    }),
    audioSeparation: Object.freeze({
      localSaveFailed: "已生成但本地保存失败",
      missingResultUrls: "任务已完成，但未提取到人声和背景声音频地址",
      success: "人声分离完成",
      fallback: "人声分离失败",
      failedWithMessage: "人声分离失败: {message}",
      missingTaskId: "缺少 RunningHub 音频任务ID",
      submitting: "正在提交 RH 人声分离任务...",
      unsupportedNode: "当前节点不支持人声分离",
      busy: "当前音频正在处理中，请稍后再试",
      missingAudio: "当前节点还没有可用音频",
      cancelled: "已取消人声分离任务",
      nodeNames: Object.freeze({
        vocalsProcessing: "人声 (处理中)",
        backgroundProcessing: "背景声 (处理中)",
        vocals: "人声",
        background: "背景声",
        vocalsFailed: "人声 (失败)",
        backgroundFailed: "背景声 (失败)",
        vocalsCancelled: "人声 (已取消)",
        backgroundCancelled: "背景声 (已取消)"
      })
    })
  }),
  autoUpdate: Object.freeze({
    notes: Object.freeze({
      empty: "本次更新未提供详细说明。",
      defaultSectionTitle: "更新内容",
      releaseFooterTitle: "发布说明"
    }),
    versions: Object.freeze({
      newVersion: "新版本",
      currentVersion: "当前版本",
      unknownVersion: "未知版本"
    }),
    banner: Object.freeze({
      versionUpdateTitle: "版本更新 {version}",
      currentVersionSuffix: " | 当前版本：{version}",
      closeAria: "关闭更新提示",
      subtitleCurrent: "当前版本 {localVersion}。",
      subtitleWithDate: "当前版本 {localVersion}。发布时间 {pubDate}。",
      subtitleNoUpdate: "当前版本 {localVersion}，线上版本 {remoteVersion}。"
    }),
    buttons: Object.freeze({
      retrying: "正在重试...",
      downloading: "正在下载...",
      close: "关闭",
      cancel: "取消",
      skipVersion: "跳过此版本",
      gotIt: "我知道了",
      restartInstall: "重启并安装",
      retryDownloadInstall: "重试下载并安装",
      downloadInstall: "下载并安装",
      programUpdateUnavailable: "程序内更新暂不可用",
      updateNow: "立即更新",
      preparingDownload: "准备下载...",
      restarting: "正在重启...",
      updating: "更新中...",
      restartingWait: "重启中，请稍候...",
      later: "稍后",
      restartingInstall: "正在重启安装..."
    }),
    progress: Object.freeze({
      downloading: "正在下载更新 {percent}",
      retrying: "下载失败，正在第 {count} 次重试..."
    }),
    status: Object.freeze({
      autoRetry: "下载遇到问题，正在自动重试。",
      downloadingAutoInstall: "正在下载新版本，下载完成后将自动重启安装。",
      downloadedRestarting: "更新已下载完成，正在重启安装。"
    }),
    errors: Object.freeze({
      hotApplyFailed: "热更新失败：{error}",
      programUpdateRequired: "当前版本仅支持通过程序内更新，请稍后重试。",
      unknownProgramUpdate: "未知错误，请通过程序内更新重试",
      networkProgramUpdate: "网络错误，请通过程序内更新重试"
    }),
    desktop: Object.freeze({
      downloadedNotes: "应用更新已下载完成。点击立即重启后将完成安装。",
      subtitleDownloaded: "当前版本 {localVersion}。新版本 {remoteVersion} 已下载完成，重启应用后将自动完成安装。",
      subtitleDownloading: "当前版本 {localVersion}。正在下载新版本 {remoteVersion}。",
      subtitleAvailable: "当前版本 {localVersion}。新版本 {remoteVersion} 已可用。",
      downloadFailedMessage: "程序内下载更新失败，请稍后重试。",
      downloadFailedWithRetries: "{message} 已自动重试 {retryCount}/{maxRetries} 次。",
      downloadFailedNotes: "更新只能在程序内下载和安装，请稍后重试。"
    }),
    toasts: Object.freeze({
      programUpdateFailed: "程序内更新暂不可用，请稍后重试",
      downloadCancelled: "已取消更新下载",
      cancelDownloadFailed: "取消更新下载失败，请稍后再试",
      restartInstallFailed: "重启安装失败，请稍后再试",
      previewOnly: "更新信息预览：不会执行真实更新",
      alreadyLatest: "当前已是最新版本",
      installing: "正在重启安装更新...",
      updateFailed: "应用更新失败，请稍后再试",
      checkingDesktop: "正在检查桌面更新...",
      desktopCheckFailed: "桌面更新检查失败，请稍后再试",
      checkingUpdate: "正在检测更新...",
      noRemoteInfo: "没有获取到线上更新信息",
      remoteCheckFailed: "真实更新检查失败，请稍后再试",
      generatingPreview: "正在获取线上更新信息...",
      noLocalPreview: "没有获取到线上更新信息",
      localPreviewFailed: "线上更新信息获取失败，请稍后再试"
    }),
    tutorial: Object.freeze({
      defaultTitle: "使用说明：",
      title: "使用教程",
      versionedTitle: "{version}版本 使用教程",
      linkLabel: "{title}：",
      subtitle: "选择教程视频播放"
    })
  }),
  workflows: Object.freeze({
    manager: Object.freeze({
      unknown: "未知",
      title: "工作流",
      detailTitle: "工作流详情",
      sidebarAria: "工作流面板",
      searchPlaceholder: "搜索名称、标签、备注",
      loadFailed: "工作流加载失败",
      coverAlt: "工作流封面",
      loadToCanvas: "载入到画布",
      deleteWorkflow: "删除工作流",
      rename: "重命名",
      confirm: "确定",
      cancel: "取消",
      name: "工作流名称",
      unnamedWorkflow: "未命名工作流",
      noteAria: "工作流备注：{note}",
      workflowMissing: "工作流不存在",
      content: "内容",
      editMeta: "编辑信息",
      updateContent: "更新内容",
      applyToCanvas: "应用到画布",
      applying: "应用中",
      nodeFallback: "节点",
      renamed: "已重命名",
      renameFailed: "重命名失败",
      deleted: "已删除",
      deleteFailed: "删除失败",
      saving: "保存中",
      createConfirm: "确认创建",
      currentCover: "当前封面",
      updating: "更新中",
      saveMeta: "保存信息",
      confirmOverwrite: "确认覆盖",
      updateConfirm: "确认更新",
      note: "备注",
      notePlaceholder: "用途、适用场景、操作步骤",
      tags: "标签",
      tagLimitReached: "标签已达上限",
      addTagPlaceholder: "添加标签",
      addTag: "添加",
      created: "工作流已创建",
      saveFailed: "工作流保存失败",
      metaSaved: "工作流信息已保存",
      metaSaveFailed: "工作流信息保存失败",
      updated: "工作流已更新",
      updateFailed: "工作流更新失败",
      applied: "工作流已应用到画布",
      applyFailed: "工作流应用失败",
      meta: Object.freeze({
        used: "使用 {date}",
        updated: "更新 {date}",
        line: "{nodeCount} 节点 · {edgeCount} 连线 · {time}"
      }),
      tabs: Object.freeze({
        create: "创建新工作流",
        update: "更新历史工作流"
      }),
      empty: Object.freeze({
        noMatches: "没有匹配的工作流",
        noWorkflows: "还没有工作流",
        noNote: "暂无工作流备注",
        noPreviewContent: "这个工作流里还没有可预览的内容",
        noNodePreviewContent: "这个节点当前没有可展示的内容",
        noGroupNodes: "当前组内没有可保存的节点",
        noCanvasNodes: "当前画布没有可保存的节点",
        noApplicableNodes: "这个工作流没有可应用的节点"
      }),
      errors: Object.freeze({
        nameRequired: "名称不能为空",
        tagLimit: "最多添加 {limit} 个标签",
        tagExists: "标签已存在",
        selectWorkflowToUpdate: "请选择要更新的工作流"
      }),
      source: Object.freeze({
        currentGroup: "当前节点组",
        wholeCanvas: "整个画布",
        historyWorkflow: "历史工作流",
        savingContent: "将保存的内容",
        moreNodes: "还有 {count} 个节点"
      }),
      modal: Object.freeze({
        editMetaTitle: "编辑工作流信息",
        updateTitle: "更新工作流",
        createTitle: "创建工作流"
      }),
      updatePicker: Object.freeze({
        title: "选择历史工作流",
        resultCount: "{count} 个结果",
        searchPlaceholder: "搜索工作流"
      })
    }),
    preview: Object.freeze({
      nodeTypes: Object.freeze({
        group: "节点组",
        text: "文本",
        aiText: "AI 文本",
        image: "图片",
        aiImage: "AI 图片",
        video: "视频",
        aiVideo: "AI 视频",
        audio: "音频",
        aiAudio: "AI 音频",
        note: "备注",
        debug: "调试",
        storyboard: "分镜",
        storyboardScript: "分镜脚本",
        scene: "场景",
        panoramaScene: "3D导演台",
        panorama360: "360全景图",
        node: "节点"
      }),
      tags: Object.freeze({
        matting: "抠图",
        storyboard: "分镜",
        scene: "场景",
        video: "视频",
        audio: "音频",
        image: "图片",
        text: "文本"
      }),
      suggested: Object.freeze({
        workflowName: "{name}工作流",
        fromTags: "{tags}流程",
        tagJoiner: "",
        nodeFlow: "{count}节点流程",
        canvasWorkflow: "画布工作流"
      }),
      source: Object.freeze({
        currentGroup: "当前节点组",
        wholeCanvas: "整个画布"
      }),
      hasContent: "已包含{label}内容"
    }),
    canvas: Object.freeze({
      workflowNameRequired: "工作流名称不能为空",
      missingUpdateWorkflowId: "缺少要更新的工作流 ID"
    }),
    service: Object.freeze({
      nameRequired: "名称不能为空",
      workflowMissing: "工作流不存在",
      deleteFailed: "删除失败"
    }),
    selectors: Object.freeze({
      unnamedWorkflow: "未命名工作流"
    }),
    covers: Object.freeze({
      titleFallback: "工作流",
      summary: "{nodeCount} 节点 · {edgeCount} 连线",
      snapshotLabel: "工作流快照",
      coverNodeLabel: "节点 {index}",
      nodeTypes: Object.freeze({
        video: "视频",
        audio: "音频",
        image: "图像",
        text: "文本",
        mask: "遮罩",
        group: "组",
        node: "节点"
      })
    })
  }),
  videoNode: Object.freeze({
    referenceInput: Object.freeze({
      kind: Object.freeze({
        text: "文本",
        image: "图片",
        video: "视频",
        audio: "音频"
      }),
      slots: Object.freeze({
        sourceVideo: "源视频",
        refImage: "参考图",
        firstFrame: "首帧图",
        videoMask: "遮罩视频",
        maskImage: "遮罩",
        audio: "音频"
      }),
      removeReference: "移除参考",
      uploadReference: "上传参考",
      fullLength: "全长",
      sourceVideoFramesLabel: "帧数{frames}·帧率{fps}·分辨率{resolution}",
      fixedInputs: "固定入参",
      fixedInputsAria: "{label} 入参"
    }),
    parameterPanel: Object.freeze({
      generateTitle: "生成视频",
      cancelTooltip: "点击生成，再次点击可以取消运行",
      cancelGenerateAria: "取消生成视频",
      defaultPromptPlaceholder: "描述视频内容，按 @ 引用素材，/呼出指令...",
      resolution: "分辨率",
      resolutionUnavailable: "该模型不可用此分辨率",
      aspectRatio: "比例",
      adaptive: "自适应",
      ratioResolutionLabel: "{aspectRatio} · {resolution}",
      mode: Object.freeze({
        allReference: "全能参考",
        firstLastFrame: "首尾帧"
      }),
      duration: "视频时长",
      advancedSettings: "高级设置",
      debugApiParams: "调试 API 参数",
      modelUnavailable: "模型已失效，请重新选择",
      vipRequired: "需要VIP授权，请先激活CDKEY",
      videoGenerationUnavailable: "视频生成功能目前不可用",
      smartMultiframeUnavailable: "智能多帧暂未开放",
      missingPromptOrReference: "缺少提示词或引用媒体，无法生成",
      debugNodeName: "调试节点",
      debugParamsShown: "🔧 已展示最终 API 参数",
      buildRequestFailed: "构造请求失败: {error}",
      dreaminaPrompt: Object.freeze({
        frames2video: "输入文字，描述你想创作的画面内容、运动方式等。例如：一个3D形象的小男孩，在公园滑滑板。",
        reference: "上传1-12个参考素材、输入文字，自由组合图、文、音、视频多元素，定义精彩互动。例如：@图片1 模仿 @视频1 的动作，音色参考 @音频1。"
      }),
      providers: Object.freeze({
        dreamina: "即梦官方",
        volcengine: "火山方舟",
        default: "即梦视频"
      })
    })
  }),
  canvasControls: Object.freeze({
    minimap: "开启/关闭小地图 (M)",
    grid: "开启/关闭网格点 (.)",
    connectionLines: "显示/隐藏连接线 (B)",
    connectionLinesAria: "显示或隐藏连接线",
    fit: "适应画布 (F)",
    pinBar: "固定左下角栏",
    autoHideBar: "自动隐藏左下角栏"
  }),
  emptyHint: Object.freeze({
    action: "双击",
    subtitle: "画布自由生成，或查看工作流模板",
    text: "生文本",
    image: "生图像",
    video: "生视频"
  }),
  coreUi: Object.freeze({
    rendererOverlays: Object.freeze({
      contextMenuTitle: "菜单",
      delete: "删除",
      pickConnectBanner: "点击目标节点完成连接"
    }),
    fastPreviewTypes: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频",
      text: "文本",
      node: "节点"
    }),
    generationTask: Object.freeze({
      cancelled: "任务已取消",
      generateFailed: "生成失败",
      queued: "排队中",
      resumeFailed: "恢复失败"
    }),
    renderer: Object.freeze({
      dreaminaPhase: Object.freeze({
        failed: "查询失败",
        syncing: "同步结果中",
        queued: "排队中",
        generating: "生成中",
        done: "已完成"
      }),
      videoMeta: Object.freeze({
        framesFps: "{frames}帧·{fps}fps"
      }),
      defaultNodeNames: Object.freeze({
        node: "节点",
        image: "图片",
        video: "视频",
        audio: "音频",
        text: "文本"
      }),
      picker: Object.freeze({
        addNode: "添加节点",
        items: Object.freeze({
          aiText: "✨  生成文本",
          aiImage: "✨  生成图像",
          aiVideo: "✨  生成视频",
          aiAudio: "✨  生成音频"
        }),
        defaults: Object.freeze({
          aiText: "生成文本",
          aiImage: "生成图像",
          aiVideo: "生成视频",
          aiAudio: "生成音频"
        })
      }),
      multiSelect: Object.freeze({
        syncVideoPlay: "同步播放视频",
        syncVideoPause: "同步暂停视频",
        runSelected: "执行选中节点",
        createAsset: "创建素材",
        batchDownload: "批量下载",
        group: "打组",
        resetDefaultSize: "恢复默认大小",
        composeVideo: "合成视频",
        createCollage: "创建拼图"
      }),
      align: Object.freeze({
        left: "左对齐",
        hCenter: "水平居中",
        right: "右对齐",
        top: "顶部对齐",
        bottom: "底部对齐",
        distributeH: "水平均匀分布",
        vCenter: "垂直居中",
        distributeV: "垂直均匀分布",
        arrangeGrid: "宫格排列",
        arrangeGridHint: "宫格排列（右键或 ↓ 选择列数）",
        gridMenu: "选择宫格列数",
        gridAuto: "自动列数",
        gridColumns: "{count} 列"
      })
    })
  }),
  nodeBatchExport: Object.freeze({
    toasts: Object.freeze({
      started: "正在批量下载...",
      completed: "批量下载完成：已导出 {count} 个",
      completedWithSkipped: "已导出 {exported} 个，跳过 {skipped} 个",
      noExportable: "选中的节点没有可下载内容",
      unsupported: "当前环境不支持批量下载",
      failed: "批量下载失败",
      failedWithMessage: "批量下载失败：{message}"
    })
  }),
  coreServices: Object.freeze({
    completion: Object.freeze({
      notificationBody: "生成任务已完成。",
      notificationNodeBody: "“{name}”生成完成。",
      soundPlaybackFailed: "提示音播放失败，请检查文件"
    }),
    projectFile: Object.freeze({
      unnamedCanvas: "未命名画布"
    }),
    externalLink: Object.freeze({
      externalLink: "外部链接",
      link: "链接",
      blocked: "不允许打开该外部链接",
      missing: "未检测到{label}",
      openFailed: "无法打开外部链接"
    }),
    diagnostics: Object.freeze({
      packageUnsupported: "当前环境不支持生成诊断包",
      logsUnsupported: "当前环境不支持打开日志目录"
    })
  }),
  canvasInteraction: Object.freeze({
    grids: Object.freeze({
      grid4: "4宫格",
      grid9: "9宫格",
      grid16: "16宫格",
      grid25: "25宫格",
      createGrid: "创建宫格",
      collageName: "拼图",
      noImages: "选区里没有可拼图的图片节点",
      boundsFailed: "无法计算拼图边界",
      created: "已创建拼图节点"
    }),
    contextMenu: Object.freeze({
      copyNode: "复制节点",
      cutNode: "剪切节点",
      paste: "粘贴",
      materialComparison: "素材对比",
      createCollage: "创建拼图",
      copyImage: "复制图像",
      addAsset: "添加素材",
      revealAsset: "在资源管理器中显示素材",
      openOutputFolder: "打开输出文件夹",
      duplicate: "创建副本",
      copyText: "复制文本",
      pasteText: "粘贴文本",
      deleteNode: "删除节点",
      addResource: "添加资源",
      addNode: "添加节点",
      undo: "撤销",
      redo: "重做"
    }),
    toasts: Object.freeze({
      nodeCopied: "节点已复制",
      nodeCut: "节点已剪切",
      assetPanelFailed: "无法打开资源面板",
      assetRevealFailed: "无法定位该素材",
      outputFolderFailed: "无法打开输出文件夹",
      duplicateWithEdgesCreated: "包含连线的副本已创建",
      textCopied: "文本已复制到剪贴板",
      selectedTextCopied: "已复制选中文本",
      copyFailed: "复制失败，请检查浏览器权限",
      noNodeText: "节点暂无文本",
      unsupportedUpload: "仅支持上传图片、视频或音频文件",
      materialComparisonFailed: "无法打开素材对比"
    }),
    generation: Object.freeze({
      text: "生成文本",
      image: "生成图像",
      video: "生成视频",
      audio: "生成音频"
    }),
    materialComparison: Object.freeze({
      title: "素材对比",
      ariaLabel: "素材对比查看器",
      localCache: "对比库为本地缓存",
      modeGroupLabel: "对比方式",
      slideMode: "滑动对比",
      sideBySideMode: "左右对比",
      dividerLabel: "拖动调整左右图片分界",
      close: "关闭",
      library: "对比库",
      libraryHint: "依次点击素材指定左图和右图，再继续循环",
      left: "左",
      right: "右",
      untitled: "素材 {index}",
      thumbnailLabel: "第 {index} 张素材：{name}"
    }),
    generationNames: Object.freeze({
      text: "生成文本",
      image: "生成图像",
      video: "生成视频",
      audio: "生成音频"
    }),
    group: Object.freeze({
      newGroup: "新建组"
    }),
    uploadTypeNames: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频"
    })
  }),
  edgeController: Object.freeze({
    addConnection: "添加连接",
    quoteMenuTitle: "引用该节点生成",
    inputMenuTitle: "创建输入节点"
  }),
  fileService: Object.freeze({
    unknownError: "未知错误",
    defaultNames: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频",
      mediaClip: "剪辑",
      text: "文本",
      file: "文件",
      webImage: "网页图片",
      webVideo: "网页视频",
      unknownFile: "未知文件"
    }),
    errors: Object.freeze({
      remoteImageImportFailed: "远程图片入库失败",
      remoteVideoImportFailed: "远程视频入库失败",
      remoteImportUnsupported: "当前环境不支持远程素材导入",
      webVideoRightsRequired: "请先确认有权保存和使用该网页视频素材",
      unsupportedFileType: "暂不支持该文件类型：{file}",
      videoTooLarge: "视频文件不能超过 {maxMB} MB：{file}",
      importFailed: "导入失败",
      importFailedWithFile: "导入失败：{file}。{reason}",
      importFailedReason: "原因：{reason}",
      jsonParseFailed: "JSON 解析失败",
      fileReadFailed: "文件读取失败"
    })
  }),
  projectLifecycle: Object.freeze({
    untitledProject: "未命名项目",
    untitledCanvas: "未命名画布",
    defaultCanvas: "默认画布",
    loadingWorkspaceFiles: "加载工作区文件中...",
    projectPersistenceLoading: "画布项目正在安全加载，请稍后再保存。",
    projectPersistenceLoadFailed: "画布项目加载失败，已暂停保存以防覆盖原数据。",
    historicalAiLocalizationStarted: "检测到 {count} 个历史生成结果未本地化，正在修复…",
    historicalAiLocalizationFixed: "已修复 {count} 个生成结果（已落盘到 output）",
    historicalImageDerivativesFixed: "已补齐 {count} 个图片节点的 display/thumb",
    packageUnsupported: "当前环境不支持加载项目包",
    packagePathMissing: "无法读取项目包路径",
    localArchiveLoaded: "成功加载本地存档: {name}",
    jsonArchiveParseFailed: "解析 JSON 存档失败"
  }),
  imageFunctionMenu: Object.freeze({
    providers: Object.freeze({
      grsai: Object.freeze({
        description: "高性能 AI 图像生成服务"
      }),
      apimart: Object.freeze({
        description: "一个 API 搞定一切——节省 30-70%"
      }),
      runninghub: Object.freeze({
        name: "RunningHUB模型",
        description: "模型 API：文生图/图生图/图片编辑"
      }),
      runninghubWorkflow: Object.freeze({
        name: "RunningHUB工作流",
        description: "控制角度专用工作流"
      })
    }),
    modes: Object.freeze({
      normal: "常规",
      fast: "快速",
      lowPrice: "低价版",
      official: "官方版",
      lowPriceRoute: "低价线路",
      lowPriceRoute2: "低价线路2",
      highValueRoute: "高性价比线路",
      officialDirectRoute: "官方直连线路"
    }),
    families: Object.freeze({
      base: "基础模型",
      pro: "专业增强模型",
      secondGen: "第二代模型"
    })
  }),
  imageModelConfig: Object.freeze({
    providers: Object.freeze({
      grsai: Object.freeze({
        description: "高性能 AI 图像生成服务"
      }),
      ppio: Object.freeze({
        name: "PPIO 派欧云",
        description: "高性价比、超弹性、低延迟的产品"
      }),
      apimart: Object.freeze({
        description: "一个 API 搞定一切——节省 30-70%"
      }),
      runninghub: Object.freeze({
        description: "AI 工作流与模型 API 聚合平台"
      }),
      aicanvas: Object.freeze({
        description: "SHUO Canvas 开发者模式占位厂商",
        placeholderImageModel: "开发者模式占位图像模型"
      })
    })
  }),
  aigenText: Object.freeze({
    previewPlaceholder: "输入提示词开始创作",
    promptPlaceholder: "输入提示词开始创作   (Enter 生成，Shift+Enter 换行)",
    customModelTitle: "自定义模型",
    customModelSubtitle: "OpenAI 兼容文本/图文接口",
    debugApiParams: "调试 API 参数",
    generate: "生成",
    customModel: Object.freeze({
      addModel: "添加模型",
      namePlaceholder: "输入模型名称",
      confirm: "确定"
    }),
    refs: Object.freeze({
      maskBadge: "遮罩",
      remove: "移除",
      removeReference: "移除参考",
      groupShortName: "组",
      nodeShortName: "节点",
      types: Object.freeze({
        text: "文本",
        image: "图片",
        video: "视频",
        audio: "音频",
        group: "编组",
        other: "节点"
      })
    }),
    debug: Object.freeze({
      nodeName: "调试节点",
      paramsShown: "🔧 已展示最终 API 请求（未发送）",
      buildRequestFailed: "构造请求失败: {error}"
    }),
    task: Object.freeze({
      promptRequired: "请输入提示词后再生成",
      imageReferenceRequired: "该模型需要图片参考",
      generationFailed: "文本生成失败",
      generationFailedWithError: "文本生成失败: {error}"
    }),
    result: Object.freeze({
      timeoutTitle: "生成超时",
      timeoutReason: "API 在超时时间内没有返回结果，通常是厂商接口繁忙或上游模型响应过慢。",
      timeoutRetry: "请稍后重试，或先切换到其他可用模型。",
      errorDetail: "错误详情：{detail}"
    })
  }),
  aigenImage: Object.freeze({
    prompt: Object.freeze({
      placeholder: "描述任何你想要生成的内容，按 @ 引用素材，/呼出指令   (Enter 生成，Shift+Enter 换行)"
    }),
    refs: Object.freeze({
      maskBadge: "遮罩",
      referenceImage: "参考图",
      replaceTarget: "替换目标",
      replacedImage: "被替换图",
      uploadReference: "上传参考",
      removeReference: "移除参考",
      types: Object.freeze({
        text: "文本",
        image: "图片",
        video: "视频",
        audio: "音频"
      })
    }),
    uiSchema: Object.freeze({
      fullLength: "全长",
      numericValueAria: "{label}数值",
      random: "随机",
      fixed: "固定",
      randomAria: "{label}随机",
      singleControl: "单人控制",
      controlColon: "：",
      efficiency: "效率",
      stable: "稳定",
      multiControl: "多人控制",
      yes: "是",
      no: "否",
      maskExpandValue: "外扩遮罩数值",
      assetInput: Object.freeze({
        image: "图片",
        video: "视频",
        audio: "音频"
      })
    }),
    controls: Object.freeze({
      advancedSettings: "高级设置",
      debugApiParams: "调试 API 参数",
      generate: "生成",
      cancelGenerate: "取消生成",
      cancelTaskTooltip: "点击取消任务"
    }),
    debug: Object.freeze({
      missingPayload: "缺少提示词或引用媒体，无法生成",
      nodeName: "调试节点",
      paramsShown: "🔧 已展示最终 API 参数",
      buildRequestFailed: "构造请求失败: {error}"
    }),
    access: Object.freeze({
      vipRequired: "需要VIP授权，请先激活CDKEY"
    }),
    upload: Object.freeze({
      missingUrl: "上传失败：未返回文件地址",
      failedRetry: "上传失败，请重试"
    }),
    result: Object.freeze({
      generationFailed: "生成失败",
      imageFallbackName: "图片",
      dragUnavailable: "这张结果图还没有可拖出的本地图片",
      imageCount: "{count} 张",
      restrictedOrFailed: "生成受限/失败"
    }),
    task: Object.freeze({
      apiKeyMissing: Object.freeze({
        volcengine: "请先在设置里填写火山方舟 API Key",
        runninghubModel: "请先在设置里填写 RunningHub Model API Key",
        runninghub: "请先在设置里填写 RunningHub API Key",
        apimart: "请先在设置里填写 APIMart API Key",
        ppio: "请先在设置里填写 PPIO API Key",
        grsai: "请先在设置里填写 GRSAI API Key"
      }),
      dreaminaLoginRequired: "即梦 CLI 尚未登录，请点击旁边的「去设置」完成登录",
      dreaminaLoginStatusUnavailable: "无法确认即梦 CLI 登录状态，请点击旁边的「去设置」检查登录状态",
      openSettings: "去设置",
      checkingDreaminaLogin: "正在检查即梦登录状态",
      generating: "生成中",
      submitting: "提交中",
      completed: "已完成",
      generationFailed: "生成失败",
      imageGenerationFailed: "图像生成失败",
      interrupted: "生成已中断",
      interruptedMissingTaskId: "生成已中断：任务尚未返回 ID",
      cancelMissingApiKey: "取消失败：缺少 API Key",
      cancelFailed: "取消失败",
      cancelSuccess: "取消成功",
      taskNotFound: "任务不存在",
      cancelledToast: "已取消任务",
      referenceImageRequired: "请先添加至少一张参考图再生成",
      replacePairRequired: "请先添加两张图片：替换目标、被替换图",
      promptOrReferenceRequired: "请输入提示词或添加参考素材"
    }),
    qwen: Object.freeze({
      versionTooltips: Object.freeze({
        qwen2509: "2509：多图编辑与单图一致性增强，适合人物/产品/文字编辑；支持深度图、边缘图、关键点/姿势图等 ControlNet 条件图。",
        qwen2511: "2511：新一代指令图像编辑，人物/多人一致性、材质/光照、工业设计与文字编辑更强；支持 1-3 张参考图和多轮编辑。"
      }),
      firstImageModes: Object.freeze({
        original: "原图",
        pose: "姿势图",
        depth: "深度图"
      })
    }),
    modelMenu: Object.freeze({
      unavailable: "{model} 目前不可用",
      qwenEdit: Object.freeze({
        title: "Qwen-图像编辑",
        description: "多图指令编辑，适合人物/产品一致性、文字修改与姿势/深度控制"
      }),
      animeReal: Object.freeze({
        title: "漫画转真人V2",
        description: "基于工作流把二次元角色转写实人像"
      }),
      personReplaceV21: Object.freeze({
        title: "人物替换人物替换V2.1",
        description: "双图人物替换，支持目标/被替换图遮罩"
      }),
      personReplaceV3: Object.freeze({
        title: "人物替换图片编辑V3",
        description: "保持构图与光影，快速替换人物/服饰/物品"
      })
    }),
    dreamina: Object.freeze({
      alt: "即梦",
      label: "即梦官方（需高级会员）",
      subtitle: "按版本直选，自动文生图/图生图"
    })
  }),
  sharedPromptPanel: Object.freeze({
    promptPlaceholder: "输入提示词...",
    customModelTitle: "自定义模型",
    customModelSubtitle: "OpenAI 兼容文本接口",
    addModel: "添加模型",
    modelNamePlaceholder: "输入模型名称",
    confirm: "确定",
    debugApiParams: "调试 API 参数",
    debugNodeName: "调试节点",
    debugParamsShown: "🔧 已展示最终 API 参数",
    buildRequestFailed: "构造请求失败: {error}",
    generate: "生成"
  }),
  nodePromptShared: Object.freeze({
    materialFallback: "素材",
    assetFallback: "素材",
    assetUnavailable: "该素材没有当前模型可用的素材",
    useEntireAsset: "使用整个素材",
    assetTypes: Object.freeze({
      text: "文本",
      image: "图像",
      video: "视频",
      audio: "音频"
    })
  }),
  groupNode: Object.freeze({
    defaultName: "新建组",
    renameTooltip: "点击重命名",
    toolbar: Object.freeze({
      runGroup: "整组执行",
      stopGroup: "停止组内生成",
      syncPlay: "同步播放视频",
      color: "颜色",
      createWorkflow: "创建工作流",
      ungroup: "解组"
    })
  }),
  mediaClip: Object.freeze({
    menu: Object.freeze({
      addToCanvas: "合成到画布",
      export: "导出"
    }),
    tools: Object.freeze({
      splitMaterial: "剪开素材 (C)",
      export: "导出"
    }),
    pick: Object.freeze({
      addByConnection: "鼠标连线添加片段",
      continueAdd: "继续添加片段"
    }),
    empty: Object.freeze({
      selectMaterial: "选择要添加的片段",
      connectHint: "轻点鼠标连线按钮，在画布上选取视频、图片或者音频",
      exit: "ESC 退出"
    }),
    audioLane: Object.freeze({
      mute: "静音声轨",
      unmute: "取消静音声轨"
    }),
    outputNames: Object.freeze({
      image: "剪辑图片",
      audio: "剪辑音频",
      video: "剪辑视频"
    }),
    export: Object.freeze({
      loading: "正在导出素材",
      noMaterial: "没有可导出的素材",
      materialAdded: "素材已导出到画布",
      materialFailed: "素材导出失败",
      noClips: "没有可导出的片段",
      clipExported: "剪辑已导出",
      clipFailed: "剪辑导出失败"
    }),
    playback: Object.freeze({
      previewUnavailable: "当前素材无法播放预览",
      play: "播放",
      pause: "暂停"
    }),
    toasts: Object.freeze({
      splitAtMiddle: "把播放头移到素材中间再剪开"
    }),
    hints: Object.freeze({
      playPause: "播放/暂停",
      splitAtPlayhead: "剪开播放头处素材",
      deleteCurrent: "删除当前素材",
      dragMaterial: "拖动素材",
      adjustOrder: "调整顺序",
      dragEdges: "拖动两端",
      trimMaterial: "裁剪素材",
      rightClick: "右键",
      exportOrDelete: "导出或删除素材",
      connectButtonAdd: "连线按钮添加片段",
      zoomTimeline: "+ 滚轮缩放时间线"
    }),
    materialMenu: Object.freeze({
      exportToCanvas: "导出素材到画布",
      enable: "启用素材",
      disable: "禁用素材",
      delete: "删除素材"
    }),
    preview: Object.freeze({
      collapse: "收起",
      audioClip: "音频剪辑"
    }),
    trim: Object.freeze({
      left: "左裁剪",
      right: "右裁剪"
    })
  }),
  sourceImageNode: Object.freeze({
    upload: Object.freeze({
      button: "上传",
      transcoding: "转码中...",
      uploading: "上传中...",
      canvasTranscodeFailed: "Canvas 转码失败",
      imageLoadFailed: "图片加载失败",
      failedRetry: "上传失败，请重试"
    }),
    toasts: Object.freeze({
      generateUnsupported: "源图像节点不支持生成功能"
    }),
    recovery: Object.freeze({
      taskFailed: "任务恢复失败",
      failed: "恢复失败",
      failedWithMessage: "恢复失败: {message}",
      imageTaskFailed: "图片任务恢复失败",
      dreaminaImageTaskFailed: "即梦图片任务恢复失败",
      asyncImageTaskFailed: "异步图片任务恢复失败",
      noOutputImage: "未获取到可用的输出图片"
    }),
    result: Object.freeze({
      defaultName: "图像结果"
    }),
    status: Object.freeze({
      generating: "生成中",
      completed: "已完成",
      queuedBackground: "排队中（后台查询）",
      cancelled: "已取消",
      generationFailed: "生成失败"
    })
  }),
  sourceVideoNode: Object.freeze({
    upload: Object.freeze({
      button: "上传",
      uploading: "上传中...",
      failedRetry: "上传失败，请重试"
    }),
    controls: Object.freeze({
      toggleMute: "切换静音",
      captureFrame: "截取当前帧"
    }),
    recovery: Object.freeze({
      taskFailed: "任务恢复失败",
      failedWithMessage: "恢复失败: {message}",
      noOutputVideoUrl: "未获取到可用的输出视频 URL",
      runninghubApiKeyMissing: "RunningHUB API Key 未配置"
    }),
    result: Object.freeze({
      defaultName: "视频结果",
      hdVideo: "高清视频"
    })
  }),
  sourceTextNode: Object.freeze({
    placeholder: Object.freeze({
      initial: "输入提示词开始创作",
      edit: "双击进入输入模式开始创作"
    }),
    charCount: "{count} 字"
  }),
  sourceAudioNode: Object.freeze({
    upload: Object.freeze({
      button: "上传",
      uploading: "上传中...",
      failedRetry: "上传失败，请重试"
    }),
    toolbar: Object.freeze({
      cancelAudioSeparation: "取消人声分离"
    }),
    download: Object.freeze({
      missingAudio: "没有可下载的音频"
    })
  }),
  generationNodeHelpTip: Object.freeze({
    ariaLabel: "生成模型说明",
    advancedVoiceClone: Object.freeze({
      title: "进阶声音克隆用法",
      duration: "支持 [[red:3~15 秒音频]]",
      noAudio: "[[red:无音频入口]]时 TTS语音 根据提示词生成随机音色",
      promptExample: "例：今晚月色真好",
      oneAudio: "[[red:1个音频入口]]时 克隆语音",
      twoAudio: "[[red:2个音频入口]]时 多人克隆音色对话",
      examples: "例：",
      audio1: "@音频1",
      audio2: "@音频2",
      exampleSpeaker1: "你今晚回家吗",
      exampleSpeaker2: "不回了加班要忙到很晚"
    })
  }),
  audioModelMenu: Object.freeze({
    runninghub: Object.freeze({
      label: "RunningHUB工作流",
      subtitle: "音频生成工作流"
    })
  }),
  previewGenerateButton: Object.freeze({
    generate: "生成",
    clickCancelTask: "点击取消任务",
    cancelGenerate: "取消生成"
  }),
  videoFrameExtraction: Object.freeze({
    videoNotLoaded: "当前视频还未加载完成",
    captureUnsupported: "当前视频源暂不支持截帧",
    capturedFrameName: "截取第{frameIndex}帧",
    capturedFrameNameWithSource: "{sourceName}.{frameIndex}帧",
    localSaveFailed: "本地保存失败",
    shownButSaveFailed: "截图已显示，但本地保存失败"
  }),
  videoSyncPlayback: Object.freeze({
    fewerThanTwo: "可同步播放的视频少于 2 个",
    selectedUnmounted: "选中的视频当前未挂载，无法同步播放",
    playedCount: "已同步播放 {count} 个视频",
    none: "没有可同步播放的视频"
  }),
  videoResultRender: Object.freeze({
    generationFailed: "生成失败",
    elapsedMinutesSeconds: "{minutes}分{seconds}秒",
    elapsedSeconds: "{seconds}秒"
  }),
  audioGenerationResult: Object.freeze({
    localSaveFailed: "已生成但本地保存失败",
    missingLocalAudioPath: "音频结果无效：缺少本地音频路径"
  }),
  videoGenerationResult: Object.freeze({
    failed: "生成失败"
  }),
  runningHubVideoSubmit: Object.freeze({
    visualInputRequired: "请接入一个视频或参考图输入",
    audioInputRequired: "请接入一个音频输入",
    referenceImageFramesRequired: "参考图入参请设置大于 0 的帧数",
    videoDurationMissing: "无法读取视频时长，请等待视频信息加载后再生成",
    audioDurationMissing: "无法读取音频时长，请等待音频加载后再生成",
    videoLongerThanAudio: "生成视频时长不能超过音频时长"
  }),
  dreaminaVideo: Object.freeze({
    route: Object.freeze({
      multimodal2video: "全能参考",
      frames2video: "首尾帧",
      multiframe2video: "智能多帧"
    }),
    task: Object.freeze({
      video: "即梦视频",
      text2video: "文生视频",
      image2video: "首帧生视频",
      frames2video: "首尾帧",
      multiframe2video: "智能多帧",
      multimodal2video: "全能参考"
    }),
    validation: Object.freeze({
      framesOnlyImages: "首尾帧模式仅支持图片参考",
      imageAtLeastOne: "首尾帧模式至少需要 1 张图片",
      imageAtMostOneSingle: "首尾帧模式最多支持 1 张图片进入单图链路",
      framesNeedTwo: "首尾帧模式需要 2 张图片",
      framesAtMostTwo: "首尾帧模式最多支持 2 张图片",
      allReferenceNeedsVisual: "全能参考至少需要 1 张图片或 1 个视频，音频不能单独使用",
      allReferenceMaxImages: "全能参考最多支持 {max} 张图片",
      allReferenceMaxVideos: "全能参考最多支持 {max} 个视频",
      allReferenceMaxAudios: "全能参考最多支持 {max} 个音频",
      multiframeOnlyImages: "智能多帧仅支持图片参考",
      multiframeAtLeastTwo: "智能多帧至少需要 2 张图片",
      multiframeMaxImages: "智能多帧最多支持 20 张图片"
    })
  }),
  modelInputPolicy: Object.freeze({
    unsupported: "当前模型不支持这种素材",
    limitReached: "当前模型只支持 {max} 个{type}，请先删除已有 @ 引用",
    required: "当前模型至少需要 {min} 个{type}输入",
    inputKinds: Object.freeze({
      text: "文本",
      image: "图片",
      video: "视频",
      audio: "音频",
      material: "素材"
    })
  }),
  aigenAudioNode: Object.freeze({
    validation: Object.freeze({
      promptRequired: "请输入提示词",
      referenceVoiceRequired: "请接入参考音色",
      voiceConvertRefsRequired: "音色转换需要声线参考和语气参考",
      advancedVoiceDuration: "{label}时长约 {duration} 秒，进阶声音克隆仅支持 3~15 秒音频"
    }),
    refs: Object.freeze({
      referenceVoice: "参考音色",
      audio1: "音频1",
      audio2: "音频2",
      inputAria: "音频入参",
      connectAudio: "连接音频",
      remove: "移除"
    }),
    help: Object.freeze({
      ariaLabel: "生成节点说明"
    }),
    errors: Object.freeze({
      localSaveGeneratedFailed: "已生成但本地保存失败"
    }),
    buttons: Object.freeze({
      generate: "生成",
      generateCancellable: "点击生成，再次点击可以取消运行",
      cancelAudioGeneration: "取消生成音频"
    }),
    controls: Object.freeze({
      advancedSettings: "高级设置"
    }),
    vip: Object.freeze({
      needAuthorization: "需要VIP授权，请先激活CDKEY",
      needSubscription: "该模型为 VIP，请先激活 CDKEY/订阅"
    }),
    cancel: Object.freeze({
      interruptedMissingTaskId: "生成已中断：任务尚未返回 ID",
      failed: "取消失败",
      success: "取消成功",
      taskMissing: "任务不存在",
      missingApiKey: "取消失败：缺少 API Key"
    }),
    generation: Object.freeze({
      failed: "音频生成失败",
      interrupted: "生成已中断",
      completed: "音频生成完成",
      failedWithError: "音频生成失败: {error}"
    }),
    upload: Object.freeze({
      audioOnly: "该位置只支持上传音频文件",
      missingUrl: "上传失败：未返回文件地址",
      anchorMissing: "上传失败：找不到锚点节点",
      sourceAudioName: "源音频",
      failedRetry: "上传失败，请重试"
    }),
    prompt: Object.freeze({
      placeholder: "描述你想要生成的音频内容。"
    }),
    debug: Object.freeze({
      buttonTitle: "调试 API 参数",
      nodeName: "调试节点",
      paramsShown: "🔧 已展示最终 API 参数",
      buildRequestFailed: "构造请求失败: {error}"
    }),
    toolbar: Object.freeze({
      cancelAudioSeparation: "取消人声分离"
    }),
    download: Object.freeze({
      missingAudio: "没有可下载的音频"
    }),
    assetTypes: Object.freeze({
      text: "文本",
      image: "图片",
      video: "视频",
      audio: "音频"
    })
  }),
  collageNode: Object.freeze({
    errors: Object.freeze({
      exportBlobFailed: "拼图导出失败",
      emptyImageUrl: "图片地址为空",
      imageLoadFailed: "图片加载失败",
      emptyCollage: "拼图里没有图片可处理",
      canvasCreateFailed: "拼图画布创建失败",
      nothingDrawn: "没有图片成功绘制",
      composeFailed: "拼图合成失败",
      exportFailed: "拼图导出失败"
    }),
    toolbar: Object.freeze({
      outerPadding: "外边框",
      gap: "格子间距",
      cornerRadius: "格子圆角",
      edit: "编辑拼图",
      exitEdit: "退出编辑拼图",
      compose: "合成",
      composeBusy: "合成中",
      composeBusyEllipsis: "合成中...",
      export: "导出",
      exportBusy: "导出中",
      expand: "展开",
      collapse: "折叠"
    }),
    ratio: Object.freeze({
      tooltip: "拼图比例",
      fallback: "比例",
      optionAria: "拼图比例{label}"
    }),
    templates: Object.freeze({
      tooltip: "拼图网格",
      label: "拼图网格",
      countAria: "{count}图模板"
    }),
    background: Object.freeze({
      tooltip: "背景颜色",
      optionAria: "背景{label}"
    }),
    compose: Object.freeze({
      optionAria: "合成{label}",
      created: "合成成功，源图像节点已生成",
      saveFailed: "合成节点已生成，但保存失败"
    }),
    export: Object.freeze({
      optionAria: "导出{label}",
      exported: "拼图已导出"
    }),
    preview: Object.freeze({
      imageAlt: "拼图图片",
      empty: "空拼图",
      expandAria: "展开拼图",
      dividerAria: "调整拼图间距"
    }),
    output: Object.freeze({
      name: "拼图_{resolution}"
    }),
    backgrounds: Object.freeze({
      transparent: "透明",
      white: "白色",
      black: "黑色",
      indigo: "靛蓝",
      green: "绿色",
      gold: "金色",
      red: "红色",
      purple: "紫色",
      pink: "粉色",
      slate: "灰蓝",
      cyan: "青色"
    }),
    layouts: Object.freeze({
      freeform: "自由",
      "puzzle-2-rows": "上下",
      "puzzle-2-cols": "左右",
      "puzzle-3-rows": "三横",
      "puzzle-3-cols": "三竖",
      "puzzle-3-top-wide": "上1下2",
      "puzzle-3-bottom-wide": "上2下1",
      "puzzle-3-left-tall": "左1右2",
      "puzzle-3-right-tall": "左2右1",
      "puzzle-3-hero-top": "大上",
      "puzzle-3-hero-left": "大左",
      "puzzle-4-even": "四宫格",
      "puzzle-4-rows": "四横",
      "puzzle-4-cols": "四竖",
      "puzzle-4-top-wide": "上1下3",
      "puzzle-4-bottom-wide": "上3下1",
      "puzzle-4-left-wide": "左1右3",
      "puzzle-4-right-wide": "左3右1",
      "puzzle-4-bands": "横向组合",
      "puzzle-4-hero-top": "大上"
    })
  }),
  debugNode: Object.freeze({
    title: "API 调试接收器",
    empty: "// 等待接收请求 Payload... \n// (请在其他生成节点点击 🔧 发送)\n// 这里内容可选择复制。"
  }),
  webReferenceCard: Object.freeze({
    openSource: "打开来源",
    sourceLabel: "网页参考",
    openFailed: "无法打开来源网页",
    noSelection: "未选择网页文字"
  }),
  audioVoicePanel: Object.freeze({
    title: "语音工作室",
    betaBadge: "测试版",
    fabTitle: "语音工作室",
    vip: Object.freeze({
      needAuthorization: "需要VIP授权，请先激活CDKEY"
    }),
    close: "关闭换声面板",
    resizeLabel: "调整换声面板宽度",
    sections: Object.freeze({
      source: "媒体源",
      mode: "声音来源",
      sentences: "句子轨"
    }),
    source: Object.freeze({
      empty: "未选择视频或音频",
      emptyMeta: "选择一个视频或音频节点",
      pickNotice: "请选择一个视频或音频",
      localVideo: "本地视频",
      canvasVideo: "画布视频",
      localAudio: "本地音频",
      canvasAudio: "画布音频"
    }),
    modes: Object.freeze({
      clone: "克隆音色",
      audioNode: "音频节点",
      keep: "保留原声"
    }),
    sentences: Object.freeze({
      extract: "识别原声句子",
      voice: "生成替换语音",
      compose: "合成新视频",
      insertedSource: "新插入片段，点击编辑源文本",
      sourcePlaceholder: "待填写源音频文本",
      convertedPlaceholder: "未生成修改音频",
      convertedSuffix: "修改后",
      analysisHint: "点击顶部「开始分析」后自动拆分视频或音频句子"
    }),
    status: Object.freeze({
      pending: "待处理",
      detected: "已识别",
      notAnalyzed: "未分析",
      analyzing: "分析中",
      edited: "已编辑",
      generating: "生成中",
      stopping: "正在停止",
      translating: "翻译中",
      composing: "合成中",
      merging: "合并中",
      composed: "已合成",
      ready: "已生成",
      removed: "已移除",
      detectedCount: "已识别 {count} 句",
      noSource: "未选择视频或音频",
      analysisFailed: "分析失败"
    }),
    progress: Object.freeze({
      "asr-runtime-check": "检查本地识别组件",
      "asr-runtime-manifest": "读取本地识别组件清单",
      "asr-runtime-download": "下载本地识别组件",
      "asr-runtime-extract": "解压本地识别组件",
      "asr-runtime-verify": "校验本地识别组件",
      "gpu-torch-check": "检查显卡加速组件",
      "gpu-torch-install": "安装显卡加速组件",
      "gpu-torch-verify": "校验显卡加速组件",
      "model-download": "准备字幕识别模型",
      "model-prepare": "准备识别音频",
      transcribe: "识别字幕文本",
      "diarization-model-download": "下载说话人分离模型",
      "diarization-model-prepare": "加载说话人分离模型",
      diarize: "区分说话人",
      slice: "切割句子音频"
    }),
    labels: Object.freeze({
      sourceAudio: "源音频",
      convertedAudio: "修改音频"
    }),
    actions: Object.freeze({
      loadSelected: "载入视频/音频",
      startAnalyze: "开始分析",
      startAnalyzeTooltip: "首次运行可能需要下载模型。开始分析会识别语音并切出句子音频。",
      more: "更多选项",
      playAudio: "试听当前音频",
      generateAudio: "生成音频",
      editSource: "编辑源音频",
      editSourceTooltip: "编辑源音频：可裁剪、分段音频；每段都会作为克隆语音参考，建议每段至少 3 秒。",
      alignSourceText: "对齐源文本",
      history: "历史记录",
      generate: "生成",
      translate: "翻译",
      translateTooltip: "将全部或选中的句子翻译为其他语言",
      cancelGeneration: "终止生成",
      batchAudioInputParam: "批量更换音频入参",
      batchAudioInputParamDisabled: "请先选中句子轨再更换音频入参",
      batchGenerate: "批量生成",
      batchGenerateTooltip: "生成所有句子轨的修改音频",
      selectedGenerate: "选中生成",
      selectedGenerateTooltip: "只生成已选中句子轨的修改音频",
      stopBatchGeneration: "停止批量生成",
      composeAll: "合成",
      composeAllTooltip: "按时间码把句子音频合成回原视频或原音频",
      recomposeTooltip: "已合成，点击可重新合成",
      segmentModel: "单独选择模型",
      useGlobalModel: "使用全局模型",
      segmentModelWithName: "单句模型：{model}",
      globalSettings: "全局模型",
      globalModelWithName: "全局模型：{model}",
      subtitleRecognitionWithName: "识别字幕：{provider}",
      segmentGrid: "片段布局",
      audioInputParam: "音频入参",
      changeAudioInputParam: "更换音频入参",
      voiceCloneInputParam: "点击添加声线参考",
      changeVoiceCloneInputParam: "更换音色克隆入参",
      clearVoiceCloneInputParam: "清除音色克隆入参",
      imitateTone: "模仿语气",
      imitateToneTooltip: "开启后会模仿原句的语气",
      toneCloneBadge: "音色转换",
      merge: "合并",
      insertSegment: "插入片段"
    }),
    settings: Object.freeze({
      subtitleRecognition: "字幕识别",
      voiceModel: "声音模型",
      noModels: "暂无可用声音模型"
    }),
    asrProviders: Object.freeze({
      doubao: Object.freeze({
        label: "火山语音",
        subtitle: "录音文件识别大模型，自动多语种与说话人识别"
      }),
      funasr: Object.freeze({
        label: "本地",
        subtitle: "本地离线识别"
      })
    }),
    asrApiKeyHelp: Object.freeze({
      missingTitle: "火山语音 API Key 未配置",
      invalidTitle: "火山语音 API Key 不可用",
      missingMessage: "当前字幕识别选择了火山语音，但还没有填写 X-Api-Key。",
      invalidMessage: "火山语音连接测试未通过。请确认填写的是火山语音 API Key 管理页里的 X-Api-Key，不是火山方舟 Ark Key，并确认录音文件识别服务已开通。",
      howToGet: "怎么获取 API Key",
      openSettings: "去设置填写",
      close: "关闭",
      guideTitle: "怎么获取火山语音 X-Api-Key",
      guideSubtitle: "按火山语音官方新版控制台 API Key 说明整理：字幕识别使用录音文件识别大模型（bigmodel），配音/语音生成还需要 doubao-seed-tts-2.0 和 doubao-seed-audio-1.0；都用火山语音 X-Api-Key，不使用火山方舟 Ark Key。",
      guideAlt: "火山语音 X-Api-Key 获取步骤长图",
      guideOfficialKey: "操作步骤",
      guideNote1: "登录火山引擎控制台，进入豆包语音/火山语音服务，并开通录音文件识别 2.0、doubao-seed-tts-2.0 和 doubao-seed-audio-1.0。",
      guideNote2: "打开 API Key 管理页，创建或复制 X-Api-Key，并给这个 Key 开启语音识别、doubao-seed-tts-2.0 和 doubao-seed-audio-1.0 访问权限。",
      guideNote3: "回到 SHUO Canvas 的设置 > API Key > 火山语音，粘贴 X-Api-Key 后点击测试连接。",
      guideNote4: "如果 Key 泄漏或填错，请在官方控制台禁用或删除后重新创建。",
      openConsole: "打开 API Key 管理"
    }),
    translationApiKeyHelp: Object.freeze({
      missingTitle: "火山方舟 API Key 未配置",
      invalidTitle: "翻译模型未开通或 API Key 不可用",
      missingMessage: "句子翻译使用火山方舟豆包文本模型，但还没有填写 API Key。",
      invalidMessage: "无法使用句子翻译模型。请确认已在火山方舟开通对应豆包文本模型，并在设置中填写可用的 API Key。",
      howToGet: "怎么获取 API Key",
      openSettings: "去设置填写",
      close: "关闭"
    }),
    toolbar: Object.freeze({
      selectAll: "全选",
      cancelSelectAll: "取消全选",
      voice: "音色",
      speed: "语速",
      convertLanguage: "转换语言"
    }),
    translation: Object.freeze({
      menuLabel: "选择翻译目标语言",
      confirmTitle: "确认翻译",
      confirmAll: "是否将全部 {count} 个句子翻译为{language}？",
      confirmSelected: "是否将选中的 {count} 个句子翻译为{language}？",
      cancel: "取消",
      confirm: "开始翻译",
      languages: Object.freeze({
        zhCN: "简体中文",
        en: "英语",
        ja: "日语",
        ko: "韩语",
        es: "西班牙语",
        fr: "法语",
        de: "德语",
        pt: "葡萄牙语"
      })
    }),
    history: Object.freeze({
      empty: "暂无生成音频",
      play: "试听历史音频",
      itemTitle: "生成音频 {index}"
    }),
    menu: Object.freeze({
      useGenerated: "使用生成音频",
      useSource: "使用原音频",
      downloadSource: "下载原音频",
      downloadConverted: "下载转换音频",
      remove: "移除该声音片段"
    }),
    toasts: Object.freeze({
      selectVideo: "请先选择一个视频节点",
      selectSource: "请先选择一个视频或音频节点",
      pipelinePending: "语音工作室任务链路待接入",
      playPending: "试听功能待接入",
      sourcePickStarted: "请选择画布上的视频或音频节点",
      sourcePickCancelled: "已退出视频/音频选择",
      sourcePickUnsupported: "请选择一个视频或音频节点",
      videoPickStarted: "请选择画布上的视频节点",
      videoPickCancelled: "已退出视频选择",
      videoPickUnsupported: "请选择一个视频节点",
      audioPickStarted: "请选择画布上的音频节点",
      audioPickCancelled: "已退出音频入参选择",
      audioPickUnsupported: "请选择一个音频节点",
      audioPickInvalid: "选中的音频节点没有可用本地音频",
      audioPickSelected: "已选择音频入参",
      audioPickBatchSelected: "已为 {count} 个句子更换音频入参",
      selectSentenceForVoice: "请先选中句子轨再更换音频入参",
      invalidVideoSource: "选中的视频还没有可用本地源",
      invalidSource: "选中的视频或音频还没有可用本地源",
      analysisComplete: "已分析 {count} 个片段",
      analysisFailed: "声音分析失败",
      asrConfigReadFailed: "读取火山语音配置失败，请打开设置检查 API Key",
      asrApiKeyMissing: "请先在设置 > API Key > 火山语音填写 X-Api-Key，不要使用火山方舟 Key",
      asrApiKeyInvalid: "火山语音 ASR Key 无效。请填写火山语音 API Key 管理页里的 X-Api-Key，不要使用火山方舟 Key，并确认已开通录音文件识别",
      asrPermissionDenied: "火山语音 ASR Key 没有录音文件识别权限，请确认语音服务已开通并给该 Key 开启 ASR 权限",
      noSubtitlesDetected: "未识别到字幕，已仅按静音完成切句",
      sourceClipApplied: "源音频拆分已应用",
      sourceClipFailed: "源音频拆分失败",
      mergeChanged: "句子内容已变化，本次合并已取消",
      sourceClipNeedsAnalysis: "请先完成语音分析，再拆分源音频",
      noTranslationText: "没有可翻译的句子文本",
      translationConfigReadFailed: "读取火山方舟配置失败，请打开设置检查 API Key",
      translationComplete: "已将 {count} 个句子翻译为{language}",
      translationFailed: "句子翻译失败",
      translationFailedWithMessage: "句子翻译失败：{message}",
      translationStale: "句子内容或素材已变化，本次翻译结果未应用",
      generateComplete: "已生成替换音频",
      generationCompleteSingle: "语音生成完成。",
      generationCompleteBatch: "{count} 条语音已全部生成完成。",
      generationBatchSettled: "本次语音生成已结束：成功 {succeeded} 条，未完成 {incomplete} 条。",
      generateFailed: "音频生成失败",
      generationCancelled: "已终止音频生成",
      batchCancellationRequested: "已停止后续批量生成，正在结束当前任务。",
      composeNeedsMoreAudio: "至少需要一段句子音频才能合成",
      composeFailed: "声音合成失败",
      noGenerateTargets: "没有可生成的句子音频",
      missingVoiceRefAudio: "请先选择声线参考音频",
      missingSecondVoiceRefAudio: "请先通过左侧 + 选择音色克隆音频",
      missingSourceAudio: "当前模型需要这一句的源音频",
      voiceCloneUnsupported: "当前模型不支持音色克隆",
      missingPromptText: "生成前请填写源文本或修改文本",
      unsupportedVoiceModel: "当前声音模型暂不支持在这里生成",
      audioMissing: "这一句没有可试听音频",
      playUnavailable: "当前环境无法播放音频",
      playFailed: "音频播放失败",
      localSaveGeneratedFailed: "已生成，但保存到本地失败",
      operationFailed: "操作失败"
    })
  }),
  sceneDetectionNode: Object.freeze({
    title: "场景检测",
    input: Object.freeze({
      videoSource: "视频源",
      dropVideoHere: "拖拽视频节点到此处"
    }),
    settings: Object.freeze({
      sensitivity: "检测敏感度",
      low: "低",
      high: "高"
    }),
    results: Object.freeze({
      placeholder: "点击开始检测按钮分析视频场景",
      countPrefix: "检测到",
      countSuffix: "个场景"
    }),
    actions: Object.freeze({
      startDetection: "开始检测",
      detecting: "检测中...",
      autoClip: "自动裁剪",
      exportScenes: "导出场景",
      clip: "裁剪"
    }),
    timeline: Object.freeze({
      changeAt: "场景切换：{time}"
    }),
    scene: Object.freeze({
      label: "场景 {index}"
    }),
    export: Object.freeze({
      unknownVideo: "未知视频"
    }),
    toasts: Object.freeze({
      connectVideoFirst: "请先连接视频源",
      invalidVideoSource: "视频源无效",
      detected: "成功检测到 {count} 个场景",
      detectFailed: "场景检测失败，请重试",
      createdClipNodes: "已创建 {count} 个裁剪节点",
      createdSceneClipNode: "已创建场景 {index} 的裁剪节点",
      exported: "场景数据已导出"
    })
  }),
  imageCrop: Object.freeze({
    actions: Object.freeze({
      exit: "退出 (Esc)",
      confirm: "确认裁剪",
      processing: "处理中..."
    }),
    ratios: Object.freeze({
      free: "自由比例",
      original: "原图比例"
    }),
    output: Object.freeze({
      imageFallback: "图片",
      nodeName: "裁剪自 {name}"
    }),
    errors: Object.freeze({
      sourceLoadFailed: "原图加载失败"
    }),
    toasts: Object.freeze({
      success: "裁剪成功",
      failed: "裁剪失败: {error}"
    })
  }),
  imageMatting: Object.freeze({
    tooltips: Object.freeze({
      cancel: "取消 (Esc)",
      brush: "画笔 B（再按切换模式）",
      brushNormal: "画笔 B（再按切换模式）",
      brushNormalToggle: "画笔（点击切换模式）",
      brushAlphaToggle: "Alpha遮罩画笔（点击切换模式）",
      eraser: "橡皮擦 E",
      bucket: "油漆桶 G",
      undo: "撤销 Ctrl+Z",
      redo: "重绘 Ctrl+Y",
      clear: "清空 R",
      save: "保存"
    }),
    actions: Object.freeze({
      save: "保存",
      saving: "保存中..."
    }),
    errors: Object.freeze({
      canvasExportFailed: "Canvas 导出失败",
      imageLoadFailed: "图像加载失败"
    }),
    toasts: Object.freeze({
      noImage: "没有可抠图的图像",
      cancelled: "已取消抠图",
      saveFailed: "保存失败"
    })
  }),
  imageAnnotate: Object.freeze({
    toolbar: Object.freeze({
      cancel: "取消",
      brush: "画笔",
      rect: "矩形",
      bucket: "油漆桶 G",
      text: "文本",
      eraser: "橡皮擦",
      numberLabel: "数字标注",
      color: "颜色",
      flipHorizontal: "水平反转",
      flipVertical: "垂直反转",
      undo: "撤销 Ctrl+Z",
      redo: "重绘",
      clear: "清空 R",
      newBoard: "新画板",
      generate: "生成",
      repaintPlaceholder: "例：把框选区域的人变成小狗",
      debugApiParams: "调试 API 参数"
    }),
    colors: Object.freeze({
      red: "红色",
      orange: "橙色",
      yellow: "黄色",
      green: "绿色",
      blue: "蓝色",
      purple: "紫色",
      black: "黑色",
      white: "白色"
    }),
    actions: Object.freeze({
      save: "保存",
      generate: "生成",
      saving: "保存中...",
      generating: "生成中..."
    }),
    debug: Object.freeze({
      nodeName: "调试节点",
      shown: "🔧 已展示最终 API 参数",
      buildRequestFailed: "构造请求失败: {error}"
    }),
    errors: Object.freeze({
      imageLoadFailed: "图像加载失败"
    }),
    output: Object.freeze({
      baseImage: "图片",
      repaintName: "{baseName} 重绘",
      eraseName: "{baseName} 擦除",
      annotateName: "{baseName} 标注",
      repaintCreated: "✅ 已创建重绘图片节点",
      eraseCreated: "✅ 已创建擦除图片节点",
      annotateCreated: "✅ 已创建标注图片节点"
    }),
    toasts: Object.freeze({
      noImage: "没有可标注的图像",
      cancelled: "已取消标注",
      newBoard: "已切换为新画板",
      saveFailed: "保存失败"
    })
  }),
  videoReverse: Object.freeze({
    fallback: Object.freeze({
      video: "视频"
    }),
    output: Object.freeze({
      nodeName: "倒放视频：{name}"
    }),
    status: Object.freeze({
      processing: "视频倒放中"
    }),
    errors: Object.freeze({
      incompleteResult: "视频倒放返回结果不完整"
    }),
    toasts: Object.freeze({
      unsupportedNode: "当前节点不支持视频倒放",
      videoBusy: "当前视频正在处理中，请稍后再试",
      notLocalFile: "当前视频不是可处理的本地文件",
      running: "正在倒放视频...",
      completed: "视频倒放完成，已生成新视频节点",
      failed: "视频倒放失败",
      failedWithError: "视频倒放失败: {error}"
    })
  }),
  groupExecution: Object.freeze({
    groupNotFound: "未找到可执行的组节点",
    groupNoExecutable: "组内没有可执行的生成节点",
    groupTriggered: "已触发 {count} 个组内生成节点",
    groupRunning: "组内生成节点正在运行",
    groupNoTriggerable: "组内没有可触发的生成按钮",
    groupCancelTriggered: "已请求停止 {count} 个组内生成节点",
    selectedCancelTriggered: "已请求停止 {count} 个选中生成节点",
    selectedNoExecutable: "选中的节点里没有可执行的生成节点",
    selectedTriggered: "已触发 {count} 个选中生成节点",
    selectedRunning: "选中的生成节点正在运行",
    selectedNoTriggerable: "选中节点里没有可触发的生成按钮",
    stopSelected: "停止选中生成"
  }),
  imageGridCrop: Object.freeze({
    errors: Object.freeze({
      canvasBlobFailed: "Canvas toBlob 失败",
      canvasCorsBlocked: "Canvas 导出受限 (CORS)",
      localImageLoadFailed: "本地原图加载失败",
      noImage: "没有可裁剪的图像",
      localFileReadFailed: "本地文件读取失败，请检查文件是否存在",
      sourceMaybeRemoved: "加载原图失败：本地文件可能已被移除",
      sourceNodeMissing: "找不到原节点"
    }),
    output: Object.freeze({
      nodeName: "裁剪 {row}-{col}"
    })
  }),
  imageExpand: Object.freeze({
    ratio: Object.freeze({
      original: "原图比例",
      selectedOriginal: "比例"
    }),
    actions: Object.freeze({
      exit: "退出 (Esc)",
      debugApiParams: "调试 API 参数",
      generate: "生成扩图"
    }),
    task: Object.freeze({
      submitting: "提交中",
      generating: "生成中",
      completed: "已完成",
      failed: "生成失败"
    }),
    output: Object.freeze({
      promptDisplay: "移除绿区域，并在绿色区域内生成符合画面的场景",
      started: "模型: {model}\n提示词: {prompt}",
      failed: "模型: {model}\n提示词: {prompt}\n错误: {error}",
      generatingName: "扩图中...",
      failedName: "扩图生成失败",
      resultName: "扩图结果"
    }),
    debug: Object.freeze({
      nodeName: "调试节点"
    }),
    errors: Object.freeze({
      createExpandedImageFailed: "无法创建扩展图像",
      sourceImageLoadFailed: "无法加载原始图像",
      unknown: "未知错误"
    }),
    toasts: Object.freeze({
      sourceNodeMissing: "找不到原节点，无法构造调试参数",
      debugShown: "🔧 已展示扩图 API 参数",
      debugBuildFailed: "调试参数构建失败: {error}",
      generating: "正在生成扩图...",
      success: "扩图生成成功",
      failed: "扩图生成失败: {error}"
    })
  }),
  imageFreeAngle: Object.freeze({
    runningTask: Object.freeze({
      clickCancel: "点击取消",
      cancel: "取消",
      clickCancelTask: "点击取消任务"
    }),
    actions: Object.freeze({
      exit: "退出",
      exitControl: "退出控制角度",
      reset: "重置",
      debugApiParams: "调试 API 参数",
      generate: "生成"
    }),
    panel: Object.freeze({
      title: "拖拽正方体改变角度"
    }),
    cube: Object.freeze({
      back: "后",
      right: "右",
      left: "左",
      top: "上",
      bottom: "下"
    }),
    controls: Object.freeze({
      rotation: "水平角度",
      pitch: "垂直角度",
      distance: "距离"
    }),
    task: Object.freeze({
      submitting: "提交中",
      generating: "生成中",
      completed: "已完成",
      failed: "生成失败"
    }),
    output: Object.freeze({
      generatingName: "旋转中...",
      resultName: "旋转结果",
      failedName: "生成失败",
      angle: "模型: {model}\n相机角度: 旋转{rotation}° 俯仰{pitch}° 缩放{scale}",
      failedReason: "失败原因: {error}"
    }),
    debug: Object.freeze({
      nodeName: "调试节点"
    }),
    errors: Object.freeze({
      noGeneratedImageUrl: "无法获取生成的图像 URL",
      unknown: "未知错误"
    }),
    toasts: Object.freeze({
      success: "图像生成成功！",
      failed: "生成失败: {error}",
      debugBuildFailed: "调试参数构建失败: {error}"
    })
  }),
  aigenVideoNode: Object.freeze({
    vip: Object.freeze({
      modelFallback: "该模型"
    }),
    upload: Object.freeze({
      noFileUrl: "上传失败：未返回文件地址",
      anchorMissing: "上传失败：找不到锚点节点",
      videoOnly: "该位置只支持上传视频文件",
      imageOnly: "该位置只支持上传图片文件",
      audioOnly: "该位置只支持上传音频文件",
      unsupportedAsset: "该位置不支持上传此类素材",
      failedRetry: "上传失败，请重试"
    }),
    inputNames: Object.freeze({
      maskVideo: "遮罩视频",
      sourceVideo: "源视频",
      sourceAudio: "源音频"
    }),
    prompt: Object.freeze({
      placeholder: "描述视频内容，按 @ 引用素材，/呼出指令..."
    }),
    ratio: Object.freeze({
      adaptive: "自适应"
    }),
    help: Object.freeze({
      ariaLabel: "生成节点说明"
    })
  }),
  videoTask: Object.freeze({
    controls: Object.freeze({
      generateTitle: "生成视频",
      cancelTooltip: "点击生成，再次点击可以取消运行",
      cancelGenerateAria: "取消生成视频"
    }),
    task: Object.freeze({
      queueing: "排队中",
      backgroundQueueing: "排队中（后台查询）",
      submitting: "提交中",
      generating: "生成中",
      completed: "已完成",
      queryFailed: "查询失败",
      staleRecoveryStopped: "历史任务状态暂时无法确认，已停止后台查询：{message}",
      generationFailed: "生成失败",
      generationCancelled: "生成已取消",
      videoGenerationFailed: "视频生成失败"
    }),
    validation: Object.freeze({
      localVideoMissing: "本地视频文件已丢失，请重新选择或重新上传：{path}",
      removePromptVideoRefs: "，请移除提示词里的 @视频 引用",
      imageModeRejectsVideo: "图生视频模式不接受视频入参{hint}",
      imageModeNeedsFirstFrame: "图生视频模式需要 1 张首帧图",
      referenceImageModeRejectsVideo: "参考图生视频模式不接受视频入参{hint}",
      referenceImageModeNeedsReference: "参考图生视频模式需要至少 1 张参考图",
      videoEditNeedsVideo: "视频编辑模式需要 1 个视频入参",
      videoEditNeedsSourceVideo: "视频编辑模式需要 1 个原视频入参",
      videoEditRejectsImageUseReferenceVideo: "视频编辑模式不支持图片入参，请使用参考视频",
      videoEditRejectsImage: "视频编辑模式不支持图片入参",
      videoEditRejectsAudio: "视频编辑模式不支持音频入参",
      videoExtendRejectsImage: "视频续写模式不接受图片入参{hint}",
      videoExtendRejectsAudio: "视频续写模式不支持音频入参",
      referenceVideoNeedsMedia: "参考生视频模式需要参考图或参考视频",
      referenceAudioNeedsImage: "参考生视频音频需要搭配参考图，用于参考音色",
      mediaInputLimits: Object.freeze({
        maxImages: "图片入参不能超过 {max} 张",
        maxVideos: "视频入参不能超过 {max} 个",
        maxAudios: "音频入参不能超过 {max} 个",
        maxTotalVideoSeconds: "视频入参总时长不能超过 {max} 秒",
        maxTotalAudioSeconds: "音频入参总时长不能超过 {max} 秒",
        minImageSeconds: "单个图片入参时长不能少于 {min} 秒",
        maxImageSeconds: "单个图片入参时长不能超过 {max} 秒",
        minVideoSeconds: "单个视频入参时长不能少于 {min} 秒",
        maxVideoSeconds: "单个视频入参时长不能超过 {max} 秒",
        minAudioSeconds: "单个音频入参时长不能少于 {min} 秒",
        maxAudioSeconds: "单个音频入参时长不能超过 {max} 秒",
        invalidImageExtension: "图片格式不支持，请使用：{allowed}",
        invalidVideoExtension: "视频格式不支持，请使用：{allowed}",
        invalidAudioExtension: "音频格式不支持，请使用：{allowed}",
        maxImageMegabytes: "单个图片入参不能超过 {max} MB",
        maxVideoMegabytes: "单个视频入参不能超过 {max} MB",
        maxAudioMegabytes: "单个音频入参不能超过 {max} MB"
      }),
      happyHorse: Object.freeze({
        promptRequired: "HappyHorse 1.0 必须填写提示词",
        chooseMode: "请选择 HappyHorse 1.0 的模式后再生成",
        editUnsupported: "当前 HappyHorse 模型不支持视频编辑模式，请改用图生或参考图生视频",
        editVideoMaxSeconds: "HappyHorse 1.0 视频编辑入参不能超过 {seconds} 秒，请裁剪后再生成"
      }),
      wan27: Object.freeze({
        audioDuration: "Wan2.7 音频必须为 2-30 秒，请更换或裁剪后再生成",
        audioSize: "Wan2.7 音频必须小于 15MB，请压缩后再生成",
        extendMaxSeconds: "Wan2.7 视频续写入参不能超过 10 秒，请裁剪后再生成",
        referenceVideoMaxSeconds: "Wan2.7 参考视频不能超过 30 秒，请裁剪后再生成",
        editVideoDuration: "Wan2.7 视频编辑原视频必须为 2-10 秒，请裁剪后再生成"
      }),
      klingV3Omni: Object.freeze({
        editVideoDuration: "Kling V3 Omni 视频编辑原视频必须为 3-10 秒，请裁剪后再生成"
      }),
      klingO1: Object.freeze({
        editAndFeatureExclusive: "Kling O1 编辑视频和特征参考视频只能接入其中一个",
        onlyOneVideo: "Kling O1 只能接入 1 个视频，请保留编辑视频或特征参考视频其中一个",
        referenceVideoDuration: "Kling O1 参考视频必须为 3-10 秒，请裁剪后再生成",
        editVideoRejectsImage: "Kling O1 编辑视频不能同时接参考图片，请移除参考图片后再生成",
        featureVideoMaxOneImage: "Kling O1 特征参考视频同时只能使用 1 张参考图片"
      })
    }),
    cancel: Object.freeze({
      missingApiKey: "取消失败：缺少 API Key",
      interruptedNoTaskId: "生成已中断：任务尚未返回 ID",
      failed: "取消失败",
      success: "取消成功",
      taskNotFound: "任务不存在",
      interrupted: "生成已中断"
    }),
    errors: Object.freeze({
      missingAsyncResumeModelOrProvider: "缺少异步视频恢复所需的模型或厂商信息"
    }),
    toasts: Object.freeze({
      localSaveFailed: "视频已生成，但本地保存到 output 失败：{error}",
      missingInstallId: "缺少 installId，无法校验订阅，请刷新后重试",
      subscriptionSyncing: "订阅状态同步中，请稍后再试",
      dreaminaBackgroundQueueing: "即梦排队较久，已转为后台查询",
      smartMultiframeUnavailable: "智能多帧暂未开放"
    })
  }),
  panoramaSceneNode: Object.freeze({
    defaults: Object.freeze({
      sceneNodeName: "3D导演台",
      panorama360NodeName: "360全景图"
    }),
    toolbar: Object.freeze({
      edit: "编辑",
      closeEdit: "关闭编辑",
      uploadPanorama: "上传全景图",
      fullscreen: "全屏显示",
      exitFullscreen: "退出全屏",
      collapse: "折叠",
      expand: "展开",
      mouse: "鼠标",
      mouseMode: "鼠标模式",
      boxSelectMouse: "框选鼠标",
      flyMode: "飞行模式 [Shift+F]",
      frameSelection: "构图选中对象 [F]",
      move: "移动",
      rotate: "旋转",
      scale: "缩放",
      switchEnvironment: "切换环境",
      switchToNight: "切换到夜景",
      switchToDay: "切换到日景",
      createCube: "创建方块",
      assetLibrary: "场景素材库",
      mannequin: "人偶",
      poseEditor: "人偶姿势",
      grid: "矩形排列",
      capture: "截图",
      captureWithMode: "截图 · {mode}",
      createCameraBookmark: "创建机位书签",
      cameraTimeline: "摄像机时间线",
      transformWorld: "世界坐标",
      transformLocal: "本地坐标",
      snap: "吸附",
      groundLock: "锁定地面",
      uniformScale: "等比缩放",
      focus: "焦距",
      resetView: "重置视角"
    }),
    assets: Object.freeze({
      title: "场景素材（{count}）",
      categoryAria: "素材分类",
      searchPlaceholder: "搜索素材",
      searchAria: "搜索场景素材",
      empty: "没有匹配素材",
      categories: Object.freeze({
        all: "全部",
        architecture: "建筑",
        furniture: "家具",
        stage: "舞台",
        props: "道具",
        nature: "自然"
      })
    }),
    poseEditor: Object.freeze({
      title: "人偶姿势",
      presetAria: "姿势预设",
      custom: "自定义",
      boneAria: "角色骨骼",
      saveCustom: "保存自定义姿势",
      customName: "自定义姿势 {suffix}",
      bones: Object.freeze({
        root: "根骨",
        pelvis: "骨盆",
        spine_01: "腰部",
        spine_02: "胸部",
        spine_03: "上胸",
        neck_01: "颈部",
        Head: "头部",
        clavicle_l: "左锁骨",
        clavicle_r: "右锁骨",
        upperarm_l: "左上臂",
        upperarm_r: "右上臂",
        lowerarm_l: "左前臂",
        lowerarm_r: "右前臂",
        hand_l: "左手",
        hand_r: "右手",
        thigh_l: "左大腿",
        thigh_r: "右大腿",
        calf_l: "左小腿",
        calf_r: "右小腿",
        foot_l: "左脚",
        foot_r: "右脚"
      })
    }),
    cameraTimeline: Object.freeze({
      play: "播放",
      pause: "暂停",
      playAria: "播放摄像机动画",
      pauseAria: "暂停摄像机动画",
      addKeyframe: "添加关键帧",
      addKeyframeAria: "添加摄像机关键帧",
      trackAria: "摄像机时间线",
      duration: "时长（秒）",
      durationAria: "动画时长（秒）",
      fps: "帧率",
      fpsAria: "摄像机动画帧率",
      loop: "循环",
      keyframeTitle: "{time}，第 {frame} 帧",
      keyframeAria: "摄像机关键帧：{time}，第 {frame} 帧"
    }),
    contextMenu: Object.freeze({
      deleteObject: "删除对象"
    }),
    capture: Object.freeze({
      modes: Object.freeze({
        adaptive: "自适应",
        vertical: "9:16",
        cinema: "2.35:1"
      }),
      modeAria: "截图比例 {label}",
      nodeName: "场景截图",
      pending: "截图正在进行中",
      noImage: "未获取到截图图像",
      success: "截图已生成源图像节点",
      saveInvalidPath: "截图已显示，但本地保存未返回有效路径",
      localSaveFailed: "本地保存失败",
      localSaveWarning: "截图已显示，但本地保存失败",
      failed: "截图失败",
      failedWithError: "截图失败：{error}"
    }),
    camera: Object.freeze({
      bookmarkAria: "机位书签 {slot}",
      deleteBookmark: "删除机位书签",
      defaultName: "机位 {slot}",
      fallbackName: "机位",
      limitWarning: "最多只能创建 {count} 个机位"
    }),
    focus: Object.freeze({
      title: "焦距",
      sliderAria: "当前镜头焦距"
    }),
    grid: Object.freeze({
      title: "矩形排列",
      rows: "行",
      cols: "列",
      spacingX: "间距X",
      spacingZ: "间距Z",
      gender: "性别",
      color: "颜色",
      rowsAria: "行数",
      colsAria: "列数",
      spacingXAria: "间距X（米）",
      spacingZAria: "间距Z（米）",
      setGenderAria: "设置{label}人偶",
      setColorAria: "设置{label}色",
      apply: "创建排列"
    }),
    mannequin: Object.freeze({
      title: "创建人偶",
      setGenderAria: "选择{label}人偶",
      createColorAria: "创建{label}色人偶",
      genders: Object.freeze({
        male: "男",
        female: "女"
      }),
      colors: Object.freeze({
        red: "红",
        green: "绿",
        blue: "蓝",
        yellow: "黄",
        purple: "紫",
        cyan: "青",
        white: "白"
      })
    }),
    status: Object.freeze({
      cameraSelected: "已选机位书签",
      objectSelected: "已选对象",
      noObjectSelected: "未选对象",
      panoramaMode: "全景模式",
      sceneMode: "场景模式",
      editing: "编辑中 · {mode} · {selection}",
      collapsed: "已折叠",
      normalNode: "普通节点"
    }),
    hint: Object.freeze({
      doubleClickEdit: "双击进入编辑",
      clickEditPanorama: "点击编辑进入全景",
      clickEditScene: "点击编辑进入场景",
      panoramaControls: "拖拽旋转视角，滚轮缩放",
      boxSelect: "框选模式：拖拽框选对象",
      flyControls: "飞行模式：右键观察，WASD移动，Q/E升降，Shift加速",
      defaultMouse: "默认鼠标：左键空白环绕，左键对象拖动XZ"
    }),
    upload: Object.freeze({
      unsupportedNode: "3D导演台不支持上传全景图，请使用 360全景图 节点",
      ratioWarning: "当前图片为 {width}×{height}（比例 {ratio}），不是标准 2:1 全景图，显示可能出现拉伸。",
      success: "全景图已上传",
      failed: "上传失败",
      failedWithError: "全景图上传失败：{error}"
    }),
    errors: Object.freeze({
      unknown: "未知错误",
      captureCropFailed: "截图裁切失败",
      captureExportFailed: "截图导出失败",
      panoramaLoadFailed: "全景图加载失败",
      pngNormalizeFailed: "360 全景图 PNG 归一化失败",
      pngSaveInvalidPath: "PNG 落盘失败：未返回有效路径",
      panoramaImageInputMissing: "360 全景图缺少可用图片入参",
      readPanoramaInputFailed: "读取 360 全景图入参失败：{error}",
      panoramaInputEmpty: "读取 360 全景图入参失败：返回内容为空",
      panoramaPngConvertFailed: "360 全景图 PNG 归一化失败：无法转换为 PNG"
    })
  }),
  audioClip: Object.freeze({
    controls: Object.freeze({
      cancel: "取消",
      split: "裁剪",
      undoSplit: "撤回裁剪",
      done: "完成"
    }),
    helpers: Object.freeze({
      cancel: "取消",
      playPauseRange: "区间播放/暂停",
      moveRange: "移动裁剪区",
      moveRangeLarge: "大步移动裁剪区",
      setInOut: "设置入点/出点",
      fineTuneIn: "微调入点",
      fineTuneOut: "微调出点",
      wheelKey: "滚轮",
      sameAsArrows: "同方向键",
      doubleClickSelection: "双击选区",
      restoreDefault: "恢复默认 3s"
    }),
    status: Object.freeze({
      loading: "加载中..."
    }),
    output: Object.freeze({
      audioFallback: "音频",
      nodeName: "剪辑自 {name}"
    }),
    errors: Object.freeze({
      cutApiMissing: "后端接口不存在：/api/v2/audio/cut（请重启 server.py）",
      cutFailed: "音频裁剪失败"
    }),
    toasts: Object.freeze({
      uploadFirst: "请先上传音频",
      playerMissing: "找不到音频播放器",
      cutting: "⏳ 正在后端裁剪音频...",
      splitAtMiddle: "请把时间线放在选区中间位置再裁剪",
      success: "✅ 音频裁剪成功，已生成新文件",
      failed: "❌ 音频裁剪失败: {error}",
      cancelled: "已取消裁剪音频"
    })
  }),
  videoKeying: Object.freeze({
    models: Object.freeze({
      keying: "RH视频抠像",
      remove: "RH视频擦除"
    }),
    status: Object.freeze({
      processing: "处理中",
      completed: "完成",
      cancelled: "已取消",
      failed: "失败"
    }),
    output: Object.freeze({
      withTask: "模型: {model}\n任务: {taskId}\n状态: {status}",
      status: "模型: {model}\n状态: {status}",
      failed: "模型: {model}\n状态: {status}\n原因: {reason}",
      removeGeneratingName: "视频擦除生成中...",
      removeResultName: "视频擦除结果",
      removeFailedName: "视频擦除失败",
      keyingResultName: "抠像结果 {name}",
      videoFallback: "视频"
    }),
    tools: Object.freeze({
      cancel: "取消",
      brush: "画笔",
      eraser: "橡皮擦",
      undo: "撤销",
      redo: "重做",
      clear: "清空",
      clearAll: "清空所有",
      keying: "抠像",
      remove: "视频擦除",
      settings: "设置"
    }),
    hint: Object.freeze({
      removeTitle: "视频擦除",
      shortcutPrefix: "  ·  快捷键：",
      wheelBrushSize: "  ·  滚轮调笔刷大小",
      leftClick: "左键",
      selectTarget: "选中目标",
      rightClick: "右键",
      excludeTarget: "排除目标",
      clearAllPoints: "清空所有点"
    }),
    helper: Object.freeze({
      meta: "帧率：{fps} · 分辨率：{resolution} · 当前帧：{frameIndex}"
    }),
    settings: Object.freeze({
      title: "参数设置",
      resolution: "分辨率",
      resolutionTip: "分辨率越高细节越清晰、边缘更稳定。\n同时显存占用与生成耗时会明显增加。",
      fps: "帧率",
      fpsValue: "{fps}帧",
      fpsTip: "帧率越高运动更顺滑、动作更连贯。\n但生成更慢、成本更高。\n常用 24 帧；想更快或更省可选 16 帧，想更顺滑可选 30 帧。",
      maskMode: "抠像模式",
      maskModeTip: "Sec：默认模式，适合大多数常规抠像。\nSam3：适合主体复杂或边缘更细的场景。\nMA2：兼容旧工作流中的 MatAnyone2 模式。",
      vram: "显存",
      vramTip: "48G：可跑更大分辨率/多帧数，费用×2",
      debugParams: "调试参数"
    }),
    errors: Object.freeze({
      maskSizeInvalid: "无法计算视频擦除遮罩尺寸",
      noBrush: "请先在视频上涂抹要擦除的区域",
      maskCanvasUnavailable: "无法创建视频擦除遮罩",
      noVideoUrl: "未返回视频地址",
      removeMaskFailed: "生成视频擦除遮罩失败",
      removeFailed: "视频擦除失败",
      keyingFailed: "抠像失败",
      maskExportFailed: "无法导出擦除遮罩",
      unknown: "未知错误"
    }),
    debug: Object.freeze({
      nodeName: "调试节点"
    }),
    toasts: Object.freeze({
      connectSourceVideoFirst: "请先接入源视频",
      configReadFailed: "读取 RunningHub 配置失败，请打开设置检查 API Key",
      apiKeyMissing: "请先在设置里填写 RunningHub API Key",
      removeSuccess: "视频擦除生成成功",
      removeFailed: "视频擦除失败: {error}",
      sourceVideoTooLarge: "裁剪后视频仍超过 {maxMB}MB，请继续裁剪或压缩",
      keyingSubmitting: "⏳ 正在提交 RH 视频抠像任务...",
      keyingSuccess: "✅ 抠像完成，已生成新视频",
      keyingFailed: "❌ 抠像失败: {error}",
      keyingCancelled: "已取消该视频的抠像任务",
      removeCancelled: "已取消该视频的擦除任务",
      clearedPoints: "已清空所有点",
      debugBuildFailed: "调试参数构建失败: {error}",
      debugRemoveShown: "🔧 已展示 RH 视频擦除请求参数",
      debugKeyingShown: "🔧 已展示 RH 抠像请求参数",
      debugFailed: "调试失败: {error}",
      removeClosed: "已关闭视频擦除",
      keyingClosed: "已关闭抠像"
    })
  }),
  devEntry: Object.freeze({
    buttons: Object.freeze({
      dev: "开发",
      preview: "预览",
      upload: "上传",
      updatePreview: "更新预览"
    }),
    titles: Object.freeze({
      devOn: "开发者模式已开启，点击关闭",
      devOff: "开启开发者模式",
      previewOn: "预览模式已开启，点击关闭",
      previewOff: "开启预览模式",
      upload: "上传预览结果到当前选中节点",
      updatePreview: "预览线上更新信息"
    }),
    toasts: Object.freeze({
      devOn: "已进入开发者模式",
      devOff: "已返回常规模式",
      previewOn: "已进入预览模式",
      previewOff: "已退出预览模式"
    })
  }),
  mascot: Object.freeze({
    tips: Object.freeze({
      viewWheelZoom: "💡 视图：滚轮可以缩放画布，右下角滑杆也能精细调整缩放比例。",
      viewShortcutZoom: "💡 视图：【{zoomIn} / {zoomOut}】能快速放大或缩小画布。",
      viewFocus: "💡 视图：按【{shortcut}】会聚焦选中的节点；没选中时会适应整个画布。",
      viewMinimap: "💡 视图：按【{shortcut}】可以开启或关闭右下角小地图。",
      viewSpacePan: "💡 视图：按住【{shortcut}】再拖动鼠标左键，可以平移画布。",
      viewMiddlePan: "💡 视图：按鼠标中键拖动，也能快速平移画布。",
      createDoubleClick: "💡 创建：双击画布空白处，可以打开节点创建菜单。",
      createLeftPlus: "💡 创建：点左侧加号，可以打开节点大全，也能上传本地素材。",
      createNote: "💡 创建：按【{shortcut}】可以快速创建注释节点，用来写说明和待办。",
      createTextImage: "💡 创建：按【{text}】创建生成文本节点，【{image}】创建生成图像节点。",
      createVideoAudio: "💡 创建：按【{video}】创建生成视频节点，【{audio}】创建生成音频节点。",
      createDragMedia: "💡 创建：把图片、视频或音频拖进画布，会自动生成对应的源节点。",
      editSelectAll: "💡 编辑：【{shortcut}】可以全选画布里的节点。",
      editShiftSelect: "💡 编辑：按住【{shortcut}】点击节点，可以追加或取消多选。",
      editBoxSelect: "💡 编辑：在画布空白处拖拽，可以框选多个节点。",
      editCopyPaste: "💡 编辑：【{copy}】复制节点，【{paste}】粘贴节点。",
      editCut: "💡 编辑：【{shortcut}】可以剪切当前选中的节点。",
      editDelete: "💡 编辑：选中节点后按【{shortcut}】可以删除。",
      editUndoRedo: "💡 编辑：【{undo}】撤销，【{redo}】重做。",
      organizeGroup: "💡 整理：多选节点后按【{shortcut}】可以把它们打成组。",
      organizeAlign: "💡 整理：多选节点后按【{shortcut}】可以打开对齐面板。",
      organizeGuides: "💡 整理：按【{shortcut}】可以开启或关闭辅助线吸附。",
      organizeGrid: "💡 整理：按【{shortcut}】可以开启或关闭网格吸附。",
      organizeResetSize: "💡 整理：选中图片或视频节点后，按【{shortcut}】可恢复默认大小。",
      edgeConnect: "💡 连线：拖住节点边上的连接点，再松到另一个节点上就能建立连线。",
      edgeCut: "💡 连线：连错了可以按住【{shortcut}】在连线上横划，快速切断连线。",
      edgeScissors: "💡 连线：鼠标停在连线上一会儿，会出现剪刀按钮，点击即可删除连线。",
      nodeRename: "💡 节点：双击节点标题或标签名，可以给节点重命名。",
      imageTools: "💡 图像：单选图像节点后，使用【{shortcuts}】可以触发遮罩、重绘、擦除等图像工具。",
      imageCopy: "💡 图像：【{shortcut}】可以复制当前单选图像节点的图片。",
      videoTools: "💡 视频：单选视频节点后，使用【{shortcuts}】可以依次触发裁剪、抠像、高清、全屏和下载。",
      videoCaptureFrame: "💡 视频：单选视频节点后，按【{shortcut}】可以截取当前帧。",
      audioTools: "💡 音频：单选音频节点后，使用【{shortcuts}】可以依次触发裁剪、倍速和下载。",
      textTools: "💡 文本：单选文本节点后，使用【{shortcuts}】可以依次复制内容和全屏查看。",
      sceneTools: "💡 3D：进入 3D导演台后，使用【{shortcuts}】可以依次切换鼠标模式、移动、缩放和旋转。",
      sceneCapture: "💡 3D：进入 3D导演台后，按【{shortcut}】可以截图。",
      projectSave: "💡 项目：【{shortcut}】可以保存当前画布项目。",
      projectSettings: "💡 项目：按【{shortcut}】可以打开设置面板。",
      settingsShortcuts: "💡 设置：键盘快捷键可以在设置里自定义，适合按自己的习惯调整。",
      hintEsc: "💡 提示：按【Esc】可以关闭菜单、弹窗或退出当前临时模式。"
    })
  }),
  previewUpload: Object.freeze({
    upload: "上传",
    uploading: "上传中",
    selectSingleNode: "请选择一个要写入结果的节点",
    selectedNodeMissing: "找不到当前选中的节点",
    unsupportedNode: "当前节点不支持预览上传",
    invalidFileType: "请上传{label}文件",
    uploadFailed: "上传失败，请重试",
    types: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频"
    }),
    success: Object.freeze({
      image: "已将上传图片写入当前节点",
      video: "已将上传视频写入当前节点",
      audio: "已将上传音频写入当前节点"
    })
  }),
  previewUploadResult: Object.freeze({
    missingLocalPath: "上传结果无效：缺少{kind}本地路径",
    missingNodeId: "上传结果无效：缺少节点 ID",
    kind: Object.freeze({
      media: "媒体",
      image: "图片",
      video: "视频",
      audio: "音频"
    })
  }),
  textInputContextMenu: Object.freeze({
    undo: "撤销",
    cut: "剪切",
    copy: "复制",
    pasteText: "粘贴文本",
    delete: "删除",
    selectAll: "全选",
    clipboardReadFailed: "读取剪贴板失败，请检查权限",
    clipboardWriteFailed: "写入剪贴板失败，请检查权限",
    clipboardUnsupported: "当前环境不支持读取剪贴板文本",
    clipboardEmpty: "剪贴板没有可粘贴的文本"
  }),
  workspaceContextMenu: Object.freeze({
    openProject: "打开项目",
    renameProject: "重命名",
    duplicateProject: "复制项目",
    archiveProject: "归档项目",
    unarchiveProject: "取消归档",
    deleteProject: "删除项目",
    switchVersion: "切换到此版本",
    deleteVersion: "删除版本",
    switchResult: "切换到此结果",
    deleteResult: "删除结果",
    selectClip: "选择片段",
    deleteClip: "删除片段",
    viewAsset: "查看素材",
    viewLibraryAsset: "查看总素材",
    deleteAsset: "删除素材",
    openEpisode: "打开分集",
    view: "查看",
    delete: "删除"
  }),
  canvasNodeFlows: Object.freeze({
    media: Object.freeze({
      image: "图片",
      video: "视频",
      audio: "音频"
    }),
    paste: Object.freeze({
      nodeName: Object.freeze({
        image: "粘贴图片",
        video: "粘贴视频",
        audio: "粘贴音频",
        text: "粘贴文本"
      }),
      filePasted: "文件已粘贴到画布",
      filesPasted: "{count} 个文件已粘贴到画布",
      mediaPasted: "{label}已粘贴到画布",
      textPasted: "文本已粘贴到画布",
      clipboardReadFailed: "读取剪贴板失败，请检查浏览器权限",
      clipboardEmpty: "剪贴板中没有可粘贴的内容"
    })
  }),
  canvasScreenshot: Object.freeze({
    unsupported: "当前环境不支持截图",
    entryNotReady: "截图入口未就绪",
    captureFailed: "截图失败，请稍后重试",
    confirmAria: "确定截图",
    cancelAria: "取消截图",
    areaTooSmall: "截图区域太小",
    nodeName: "截图图片",
    added: "截图已添加到画布",
    addFailed: "截图添加失败",
    hints: Object.freeze({
      selectArea: "拖拽选择截图区域，Esc 取消",
      adjustArea: "可拖拽移动，拉动边角调整"
    })
  }),
  generationHistoryFileManager: Object.freeze({
    panel: Object.freeze({
      ariaLabel: "文件管理",
      title: "文件管理",
      sourceTabsAria: "文件来源",
      filtersAria: "文件类型筛选",
      orderAria: "排序"
    }),
    filters: Object.freeze({
      all: "所有",
      image: "图像",
      video: "视频",
      audio: "声音"
    }),
    sources: Object.freeze({
      currentCanvas: "当前画布生成",
      history: "历史生成",
      output: "输出文件夹"
    }),
    mediaKinds: Object.freeze({
      image: "图像",
      video: "视频",
      audio: "声音",
      folder: "文件夹",
      file: "文件"
    }),
    fallback: Object.freeze({
      outputFile: "输出文件",
      folder: "文件夹",
      file: "文件"
    }),
    contextMenu: Object.freeze({
      addToCanvas: "添加到画布",
      addManyToCanvas: "添加 {count} 个到画布",
      fullscreen: "全屏放大",
      reveal: "打开资源管理器",
      delete: "删除",
      deleteMany: "删除 {count} 个"
    }),
    loading: Object.freeze({
      initial: "加载中...",
      more: "加载更多..."
    }),
    empty: Object.freeze({
      output: "输出文件夹暂无可显示文件",
      currentCanvas: "当前画布暂无生成结果",
      history: "暂无生成媒体历史",
      filtered: "暂无{label}"
    }),
    sort: Object.freeze({
      ascAria: "当前正序，点击切换倒序",
      descAria: "当前倒序，点击切换正序",
      ascTitle: "正序",
      descTitle: "倒序"
    }),
    subtitle: Object.freeze({
      output: "浏览 output 输出目录",
      currentCanvas: "当前画布生成媒体历史",
      history: "当前项目生成媒体历史"
    }),
    breadcrumbs: Object.freeze({
      up: "上一级"
    }),
    alt: Object.freeze({
      videoHistory: "视频历史",
      imageHistory: "图像历史"
    }),
    toasts: Object.freeze({
      addedMany: "已添加 {count} 个文件到画布",
      addedOutput: "已添加文件到画布",
      addedHistory: "已添加历史{label}到画布",
      revealFailed: "打开资源管理器失败",
      deletedMany: "已删除文件",
      deletedOne: "已删除",
      deleteFailed: "删除失败"
    }),
    deleteConfirm: Object.freeze({
      ariaLabel: "删除文件确认",
      title: "删除文件？",
      messageOne: "确认删除该文件？",
      messageMany: "确认删除 {count} 个文件？",
      cancel: "取消",
      delete: "删除"
    })
  }),
  generationHistory: Object.freeze({
    fileFallback: Object.freeze({
      image: "出图历史 {date}",
      video: "视频历史 {date}",
      audio: "声音历史 {date}"
    }),
    assetName: Object.freeze({
      image: "出图 {date}",
      video: "视频 {date}",
      audio: "声音 {date}"
    })
  }),
  whiteboardNode: Object.freeze({
    background: Object.freeze({
      upload: "上传",
      imageOnly: "白板背景只能上传图片文件",
      uploadSuccess: "背景图片已连接到白板",
      uploadFailed: "背景图片上传失败"
    }),
    style: Object.freeze({
      lineType: "线型",
      arrowheads: "箭头",
      colors: Object.freeze({
        black: "黑色",
        gray: "灰色",
        pink: "粉色",
        purple: "紫色",
        blue: "蓝色",
        indigo: "靛蓝色",
        cyan: "青色",
        red: "红色",
        orange: "橙色",
        yellow: "黄色",
        green: "绿色",
        white: "白色"
      }),
      sizes: Object.freeze({
        small: "小",
        medium: "中",
        large: "大",
        extraLarge: "超大"
      }),
      fill: Object.freeze({
        none: "无填充",
        solid: "实心填充"
      }),
      dash: Object.freeze({
        solid: "实线",
        dashed: "虚线",
        dotted: "点线"
      }),
      font: Object.freeze({
        sans: "无衬线",
        serif: "衬线",
        mono: "等宽"
      }),
      arrowKind: Object.freeze({
        straight: "直线",
        arc: "弧线",
        elbow: "折线"
      }),
      terminal: Object.freeze({
        start: "起点样式",
        end: "终点样式"
      }),
      arrowhead: Object.freeze({
        none: "无箭头",
        arrow: "箭头",
        triangle: "三角箭头",
        square: "方形端点",
        circle: "圆形端点",
        diamond: "菱形端点",
        inverted: "反三角箭头",
        bar: "横线端点"
      })
    })
  }),
  storyboard3d: Object.freeze({
    defaults: Object.freeze({
      projectName: "未命名 3D 分镜",
      sceneName: "场景 1",
      shotName: "镜头 1"
    }),
    saveStatus: Object.freeze({
      saved: "已保存",
      saving: "保存中",
      error: "保存失败"
    }),
    editor: Object.freeze({
      ariaLabel: "3D 场景预演编辑器",
      projectName: "模块名称",
      modeAria: "编辑器模式",
      editMode: "编辑",
      exploreMode: "探索镜头",
      newProject: "新建",
      importProject: "导入 JSON",
      exportProject: "导出 JSON",
      save: "保存",
      close: "关闭 3D 场景预演编辑器",
      inspector: "属性",
      closeInspector: "关闭属性面板",
      project: "项目",
      scenes: "场景",
      activeScene: "当前场景",
      outline: "场景大纲",
      assets: "素材",
      assetsPending: "模型素材库将在外部模型导入阶段接入。",
      viewport: "3D 主视口",
      tools: "变换工具",
      stageOneKicker: "阶段 1 · 模块壳层",
      viewportPendingTitle: "独立 WebGL 视口接入点已就绪",
      viewportPendingDescription: "当前纵向切片先验证父画布节点、项目状态、独立工作区和持久化边界。选择、变换与真实 3D 渲染将在基础编辑器阶段启用。",
      reuseDirectorBridge: "将复用现有 PanoramaScene3DBridge，不重复创建渲染内核",
      miniMap: "Mini Map",
      shots: "镜头",
      addShot: "添加摄像机",
      addShotDescription: "按当前视角创建镜头并绑定一个可移动摄像机",
      cameraTimeline: "镜头时间轴",
      context: "上下文",
      currentScene: "当前场景",
      environment: "环境",
      grid: "网格",
      objects: "物体",
      enabled: "开启",
      disabled: "关闭",
      selection: "当前选择",
      noSelection: "未选择对象",
      noSelectionDescription: "接入真实 3D 视口后，这里将根据人物、道具、相机或灯光动态切换。",
      aiAssistant: "AI 助手",
      aiPending: "结构化命令、事务校验和语音复用将在命令系统稳定后接入。",
      sceneMeta: "{shots} 镜头 · {objects} 物体",
      emptyOutlineTitle: "场景中还没有物体",
      emptyOutlineDescription: "阶段 2 接入内置物体和 3D 选择后，这里会与主视口双向同步。",
      hidden: "隐藏",
      visible: "可见",
      previewPending: "待生成预览",
      shotNumber: "镜头 {index}",
      stage2Hint: "基础 3D 编辑器将在阶段 2 接入",
      stage3Hint: "场景增删改将在命令系统接入后开放",
      stage4: "阶段 4",
      stage4Hint: "摄像机与镜头管理将在阶段 4 开放",
      stage5: "阶段 5",
      stage8: "阶段 8",
      stage8Hint: "Mini Map 与背景图片将在阶段 8 开放",
      stage9Hint: "镜头探索将在阶段 9 开放",
      stage10: "阶段 10",
      savedMessage: "项目快照已写回父画布节点。",
      newProjectConfirm: "新建项目会替换当前模块快照，是否继续？",
      importSucceeded: "项目 JSON 已导入并写回父画布节点。",
      importFailed: "项目导入失败：{error}",
      exportUnavailable: "当前运行环境不支持浏览器文件导出。",
      exportSucceeded: "项目 JSON 已导出。"
    }),
    errors: Object.freeze({
      renderShotPending: "单镜头渲染将在阶段 2/4 接入真实 3D 视口后开放。",
      storyboardExportPending: "分镜图导出将在阶段 6 开放。"
    })
  }),
  nodeCreation: Object.freeze({
    sections: Object.freeze({
      generation: "生成节点",
      source: "源节点",
      function: "功能节点"
    }),
    upload: Object.freeze({
      label: "上传文件",
      subtitle: "图片、视频、音频"
    }),
    items: Object.freeze({
      aiText: Object.freeze({
        label: "文本",
        defaultName: "文本",
        subtitle: "文案、脚本、提示词"
      }),
      aiImage: Object.freeze({
        label: "图像",
        defaultName: "图像",
        subtitle: "图片、海报、角色素材"
      }),
      aiVideo: Object.freeze({
        label: "视频",
        defaultName: "视频",
        subtitle: "短片、转场、动态镜头"
      }),
      aiAudio: Object.freeze({
        label: "音频",
        defaultName: "音频",
        subtitle: "配音、音效、音乐"
      }),
      sourceText: Object.freeze({
        label: "源文本",
        defaultName: "源文本",
        subtitle: "文案、脚本、提示词输入"
      }),
      sourceImage: Object.freeze({
        label: "源图像",
        defaultName: "源图像",
        subtitle: "参考图、首帧、素材"
      }),
      sourceVideo: Object.freeze({
        label: "源视频",
        defaultName: "源视频",
        subtitle: "参考、剪辑、视频输入"
      }),
      sourceAudio: Object.freeze({
        label: "源音频",
        defaultName: "源音频",
        subtitle: "配音、音乐、声音参考"
      }),
      commentNote: Object.freeze({
        label: "注释",
        defaultName: "",
        subtitle: "说明、备注、待办"
      }),
      webPreview: Object.freeze({
        label: "浏览器",
        defaultName: "浏览器",
        subtitle: "输入网址并在画布内浏览"
      }),
      panoramaScene: Object.freeze({
        label: "3D导演台",
        defaultName: "3D导演台",
        subtitle: "3D 场景、人物、机位"
      }),
      panorama360: Object.freeze({
        label: "360全景图",
        defaultName: "360全景图",
        subtitle: "全景画面与空间关系"
      }),
      storyboard: Object.freeze({
        label: "宫格图",
        defaultName: "宫格图",
        subtitle: "空白 3×3 宫格图"
      }),
      storyboardScript: Object.freeze({
        label: "分镜脚本",
        defaultName: "分镜脚本",
        subtitle: "镜头表、提示词、节奏"
      }),
      collage: Object.freeze({
        label: "拼图",
        defaultName: "拼图",
        subtitle: "图片排版与导出"
      }),
      whiteboard: Object.freeze({
        label: "白板",
        defaultName: "白板",
        subtitle: "画图、标注、文字说明"
      }),
      mediaClip: Object.freeze({
        label: "剪辑",
        defaultName: "剪辑",
        subtitle: "音视频剪切整理"
      }),
      debug: Object.freeze({
        label: "调试节点",
        defaultName: "调试节点",
        subtitle: "查看 Payload 与任务状态"
      })
    })
  })
});
export default zhCN;
