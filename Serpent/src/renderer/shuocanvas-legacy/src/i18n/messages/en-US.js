const enUS = Object.freeze({
  app: Object.freeze({
    documentTitle: "SHUO Canvas - Create your world.",
    starting: "SHUO Canvas is starting",
    serverDisconnected: "⚠️ The local service is temporarily unavailable. Some features may not work while the app reconnects. If this persists, quit and reopen SHUO Canvas.",
    quickGenerate: "SHUO Agent",
    debugSandbox: "V2 architecture sandbox · Drag nodes to test",
    canvasArea: "Canvas area",
    sourceDefaults: Object.freeze({
      image: "Image",
      video: "Video",
      audio: "Audio",
      text: "Text",
      node: "Node"
    }),
    globalScreenshot: Object.freeze({
      nodeName: "Global screenshot",
      added: "Screenshot added to canvas",
      importFailed: "Failed to add screenshot to canvas",
      shortcutRegistrationFailed: "Global {accelerator} registration failed. You can still use {accelerator} inside the app.",
      captureFailed: "Global screenshot failed. Check screen recording permission or try again later."
    }),
    nodeLabel: Object.freeze({
      renameTooltip: "Click to rename"
    })
  }),
  appShell: Object.freeze({
    currentVersionBadge: "Current version: V{version}"
  }),
  selectionMediaProperties: Object.freeze({
    ariaLabel: "Selected node properties",
    image: "Image",
    video: "Video",
    audio: "Audio",
    text: "Text",
    fields: Object.freeze({
      dimensions: "Dimensions",
      duration: "Duration",
      fps: "Frame rate",
      frames: "Frames",
      characters: "Characters"
    }),
    values: Object.freeze({
      seconds: "{value} sec",
      frames: "{value} frames",
      framesApproximate: "About {value} frames"
    })
  }),
  common: Object.freeze({
    close: "Close"
  }),
  appBusinessEvents: Object.freeze({
    copyMedia: Object.freeze({
      selectSingleImageNode: "Select one image node",
      copied: "Image copied",
      noMedia: "The current node has no media to copy",
      clipboardUnsupported: "System clipboard copy is not supported in this environment",
      copyFailed: "Failed to copy image"
    }),
    toggles: Object.freeze({
      snapGuides: Object.freeze({
        on: "Guide snapping is on",
        off: "Guide snapping is off"
      }),
      snapGrid: Object.freeze({
        on: "Grid snapping is on",
        off: "Grid snapping is off"
      }),
      gridDots: Object.freeze({
        on: "Grid dots are visible",
        off: "Grid dots are hidden"
      }),
      connectionLines: Object.freeze({
        on: "Connection lines are visible",
        off: "Connection lines are hidden"
      }),
      selectionRelatedHighlight: Object.freeze({
        on: "Related-node highlight is on",
        off: "Related-node highlight is off"
      }),
      titleFollowsZoom: Object.freeze({
        on: "Titles now follow canvas zoom",
        off: "Titles no longer follow canvas zoom"
      }),
      mediaNodeResize: Object.freeze({
        on: "Image/video node resizing is on",
        off: "Image/video node resizing is off"
      }),
      promptBoxResize: Object.freeze({
        on: "Prompt box resizing is on",
        off: "Prompt box resizing is off"
      }),
      nodeAvoidOverlap: Object.freeze({
        on: "New-node overlap avoidance is on",
        off: "New-node overlap avoidance is off"
      })
    }),
    nodeDefaults: Object.freeze({
      sourceText: "Source text",
      aiText: "Generated text",
      aiImage: "Generated image",
      aiVideo: "Generated video",
      aiAudio: "Generated audio",
      sceneDetection: "Scene detection"
    })
  }),
  format: Object.freeze({
    relativeTime: Object.freeze({
      justNow: "Just now",
      minuteOne: "{count} minute ago",
      minute: "{count} minutes ago",
      hourOne: "{count} hour ago",
      hour: "{count} hours ago",
      dayOne: "{count} day ago",
      day: "{count} days ago",
      weekOne: "{count} week ago",
      week: "{count} weeks ago",
      monthOne: "{count} month ago",
      month: "{count} months ago",
      yearOne: "{count} year ago",
      year: "{count} years ago"
    })
  }),
  project: Object.freeze({
    newProject: "New project",
    addCanvasPage: "New canvas page",
    currentVersion: "Current version",
    canvasProject: "Canvas projects",
    canvasTitle: "SHUO Canvas",
    loading: "Loading...",
    newCanvas: "New canvas"
  }),
  projectManager: Object.freeze({
    defaultProjectName: "Canvas {date}",
    newProjectFallback: "New project",
    loadFailed: "Failed to read project",
    loading: "Loading...",
    newProject: "New project",
    delete: "Delete",
    confirm: Object.freeze({
      cancel: "Cancel",
      deleteConfirm: "Confirm delete"
    }),
    deleteConfirm: Object.freeze({
      title: "Confirm delete",
      message: "This project cannot be restored after deletion. Continue?"
    })
  }),
  canvasTabs: Object.freeze({
    defaultCanvasName: "Default canvas",
    newCanvasName: "Canvas {index}",
    untitledCanvas: "Untitled canvas",
    downloadedWorkflow: "Workflow downloaded: {filename}",
    keepOneCanvas: "Keep at least one canvas page",
    closeCanvas: "Close this canvas",
    switchBlockedByTasks: "{count} task(s) on the current canvas cannot be resumed safely yet. Wait for a remote task ID or completion before switching.",
    deleteBlockedByTasks: "This canvas still has generation tasks. Wait for them to finish or cancel them before deleting it.",
    contextMenu: Object.freeze({
      save: "Save",
      saveAs: "Save as...",
      collectProject: "Collect current project",
      delete: "Delete"
    }),
    deleteUnsaved: Object.freeze({
      title: "Delete unsaved canvas?",
      message: "\"{name}\" has unsaved changes. Deleting it will discard them.",
      cancel: "Cancel",
      delete: "Delete"
    })
  }),
  projectDropdown: Object.freeze({
    unnamedCanvas: "Untitled canvas",
    loadedPackageBase: "Loaded project package",
    externalProject: "External project",
    packageFallback: "Project package",
    listSeparator: ", ",
    listMore: "{items}, and {count} total",
    elapsedSeconds: "{seconds}s elapsed",
    elapsedMinutesSeconds: "{minutes}m {seconds}s elapsed",
    packageProcessing: "Processing project package...",
    collectingCurrentProject: "Collecting current project",
    loadingProjectTitle: "Loading project",
    loadingProjectDefault: "Loading project...",
    readingLocalProject: "Reading local project...",
    renderingCanvas: "Rendering canvas...",
    savingLocal: "Saving local project as...",
    opened: "Opened: {name}",
    openLocalFailed: "Failed to open local project",
    saveAsSucceeded: "Saved as: {filename}",
    saveAsFailed: "Save as failed",
    readingProjectPackage: "Reading project package...",
    renderingProjectPackage: "Rendering project package...",
    readingProjectData: "Reading project data...",
    savingCurrentSession: "Saving the current project's recovery session...",
    switchBlockedByTasks: "{count} task(s) in the current project cannot be resumed safely yet. Wait for a remote task ID or completion before switching.",
    confirmExternalDirty: "The current canvas has unsaved changes.\n\nDiscard unsaved changes and open \"{filename}\"?",
    externalOpenFailed: "Failed to open external project",
    loading: "Loading...",
    emptyProjects: "No saved canvas projects",
    confirm: "Confirm",
    cancel: "Cancel",
    deleted: "Deleted",
    deleteFailed: "Delete failed",
    renamed: "Renamed: {name}",
    renameFailed: "Rename failed",
    nameExists: "Project name already exists",
    renameAria: "Rename project {name}",
    listLoadFailed: "Loading failed. Confirm the server is running.",
    loaded: "Loaded: {name}",
    loadFailed: "Loading failed",
    saveSucceeded: "Saved: {name}",
    saveFailed: "Save failed",
    newCanvasCreated: "New canvas created",
    contextMenu: Object.freeze({
      rename: "Rename",
      delete: "Delete"
    }),
    actions: Object.freeze({
      openLocal: "Open local project",
      saveAsLocal: "Save as local project",
      collectCurrent: "Collect current project",
      loadPackage: "Load project package"
    }),
    packageExport: Object.freeze({
      missingLocalWithSummary: "Collection failed: missing local assets {summary}",
      missingLocal: "Collection failed: local asset files referenced by this project do not exist",
      remoteNotLocalizedWithSummary: "Collection failed: remote assets are not localized {summary}",
      remoteNotLocalized: "Collection failed: this project still has remote assets that are not localized",
      missingOriginalVideos: "{count} historical original videos are missing; existing derived assets were packaged",
      failed: "Failed to collect current project",
      collected: "Project package collected: {filename}",
      collectedWithWarning: "Project package collected: {filename} ({warning})"
    }),
    packageImport: Object.freeze({
      loaded: "Project package loaded: {name}",
      failed: "Failed to load project package"
    })
  }),
  assetManager: Object.freeze({
    title: "Materials",
    libraryTitle: "Material library",
    back: "Back",
    close: "Close",
    confirm: "Confirm",
    cancel: "Cancel",
    folders: "Folders",
    favorites: "Favorites",
    newFolder: "New folder",
    folderNamePlaceholder: "Folder name",
    searchPlaceholder: "Search materials",
    searchAria: "Search material library",
    emptyFolder: "No materials in this folder",
    emptyFavorites: "No favorite materials",
    emptySearch: "No matching materials",
    emptyLibrary: "The material library is empty",
    loading: "Loading materials…",
    reuseMaterial: "Reuse material {name} on canvas",
    doubleClickMaterial: "Double-click or drag material {name} onto the canvas",
    renameMaterialAria: "Rename material {name}",
    expandFolder: "Expand folder {name}",
    collapseFolder: "Collapse folder {name}",
    expandMaterial: "Expand material {name}",
    collapseMaterial: "Collapse material {name}",
    copySuffix: " Copy",
    deleteCategory: "Delete folder",
    deleteCategoryAria: "Delete folder {category}",
    renameCategoryAria: "Rename folder {category}",
    categoryLimit: "Up to {limit} categories",
    categorySaveFailed: "Failed to save categories",
    categoryNameExists: "A folder with this name already exists",
    categoryNameUnavailable: "This folder name is unavailable",
    categoryRenamed: "Folder renamed",
    categoryRenameFailed: "Failed to rename folder",
    deleteFailed: "Delete failed",
    categoryHasAssets: "This category still contains assets and cannot be deleted",
    categoryDeleted: "Folder deleted",
    categoryDeleteFailed: "Failed to delete folder",
    thumbnailAlt: "Thumbnail",
    coverAlt: "Cover",
    loadToCanvas: "Load to canvas",
    deleteAsset: "Delete asset",
    unnamedAsset: "Untitled asset",
    newAsset: "New asset",
    assetAlt: "Asset",
    unknownTime: "Unknown",
    uncategorized: "Uncategorized",
    emptyCategory: "No {category} assets",
    tabsPrevAria: "View categories to the left",
    tabsNextAria: "View categories to the right",
    categories: Object.freeze({
      people: "Characters",
      scenes: "Scenes",
      objects: "Props",
      styles: "Styles",
      soundEffects: "Sound effects",
      others: "Others",
      storyWorkspace: "Story Workspace",
      replacementStudio: "Replacement Studio",
      history: "Generation history",
      custom: "Custom"
    }),
    types: Object.freeze({
      text: "Text",
      audio: "Audio",
      video: "Video",
      image: "Image",
      other: "Node"
    }),
    createPanel: Object.freeze({
      createTitle: "Create asset",
      saveTitle: "Save to material library",
      updateTitle: "Update existing asset",
      createTab: "Create new asset",
      updateTab: "Update existing asset",
      create: "Create",
      save: "Save",
      creating: "Creating",
      overwrite: "Overwrite",
      confirmOverwrite: "Confirm overwrite",
      saving: "Saving",
      join: "Add",
      joining: "Adding",
      confirmOverwriteAsset: "Overwrite \"{name}\" with the current selection?",
      searchAssets: "Search {category} assets",
      noMatchedAssets: "No matching existing assets",
      noCategoryAssets: "No {category} assets yet",
      currentSelection: "Current selection",
      selectedNodes: "{count} nodes",
      assetName: "Asset name",
      assetNamePlaceholder: "Enter asset name",
      category: "Category",
      categoryNamePlaceholder: "Category name",
      folderListAria: "Choose a material folder"
    }),
    errors: Object.freeze({
      noSavableNodes: "There are no nodes to save",
      selectAssetToUpdate: "Select an existing asset to update",
      assetUpdateFailed: "Failed to update asset",
      assetCreateFailed: "Failed to create asset",
      noJoinableNodes: "There are no nodes to add",
      selectAssetToJoin: "Select an existing asset to add to",
      assetJoinFailed: "Failed to add to asset",
      nameRequired: "Name is required",
      renameFailed: "Rename failed"
    }),
    toasts: Object.freeze({
      assetUpdated: "Asset updated",
      assetCreated: "Asset created",
      assetJoined: "Added to asset",
      renamed: "Renamed",
      subAssetAdded: "Sub-asset added to canvas",
      assetAdded: "Asset added to canvas",
      favoriteUpdated: "Favorite updated",
      moved: "Material moved",
      duplicated: "Material copy created",
      deleted: "Material deleted"
    }),
    detail: Object.freeze({
      meta: "{category} · {count} nodes · Updated {time}",
      content: "Contents",
      empty: "This asset is empty",
      childAssetName: "Sub-asset {index}"
    }),
    menu: Object.freeze({
      aria: "Material actions",
      open: "Open more actions for material {name}",
      favorite: "Favorite",
      unfavorite: "Remove from favorites",
      rename: "Rename",
      moveTo: "Move to…",
      duplicate: "Create copy",
      download: "Download",
      delete: "Delete",
      confirmDelete: "Delete “{name}”?",
      processing: "Working…",
      noMoveTarget: "No other folders",
      noDownloadableMedia: "This material has no downloadable media",
      downloadTitle: "Download material “{name}”",
      downloadFailed: "Material download failed",
      actionFailed: "Material action failed"
    })
  }),
  sidebar: Object.freeze({
    toolbarLabel: "Canvas toolbar",
    assets: "Materials",
    workflows: "Workflows",
    rhAiApp: "Custom AI App",
    files: "Files",
    nodeManager: "Node manager",
    tasks: "Tasks",
    taskBeta: "Tasks beta",
    pin: "Pin canvas toolbar",
    autoHide: "Auto-hide canvas toolbar",
    settings: "Settings"
  }),
  nodeManager: Object.freeze({
    title: "Node manager",
    projectNameAria: "Canvas project name",
    renameProjectAria: "Rename canvas project",
    listAria: "Canvas node list",
    listTitle: "Nodes",
    search: "Search nodes",
    searchPlaceholder: "Search nodes",
    closeSearch: "Close search",
    filter: "Filter nodes",
    expandAll: "Expand all groups",
    collapseAll: "Collapse all groups",
    expandGroup: "Expand group “{name}”",
    collapseGroup: "Collapse group “{name}”",
    collapsePanel: "Collapse node manager",
    empty: "No matching nodes",
    unnamed: "Untitled node",
    groupCount: "{count} nodes",
    total: "{count} nodes total",
    filters: Object.freeze({
      all: "All",
      text: "Text",
      video: "Video",
      image: "Image",
      audio: "Audio"
    }),
    actions: Object.freeze({
      menuAria: "Actions for {name}",
      more: "More actions",
      rename: "Rename",
      download: "Download",
      delete: "Delete"
    }),
    toasts: Object.freeze({
      renameFailed: "Failed to rename node",
      deleteFailed: "Failed to delete node",
      projectRenameFailed: "Failed to rename project",
      duplicateFailed: "Failed to duplicate node"
    })
  }),
  settings: Object.freeze({
    nav: Object.freeze({
      title: "Settings",
      general: "General",
      canvasAlign: "Canvas & Alignment",
      nodeBehavior: "Node Creation & Behavior",
      fileSave: "Files & Save",
      apiInput: "Model Services",
      objectStorage: "Object Storage",
      cliLogin: "CLI Login",
      subscription: "Subscription",
      shortcuts: "Keyboard Shortcuts"
    }),
    menu: Object.freeze({
      settings: "Settings",
      tutorial: "Tutorial",
      checkForUpdates: "Check for Updates",
      githubOfficial: "GitHub",
      featureFeedback: "Feedback",
      feedbackGroup: "Feedback / Community",
      about: "About",
      openGithub: "Open the official GitHub repository",
      openFeedback: "Open feature feedback",
      openFeedbackGroup: "Open feedback/community group"
    }),
    feedbackGroup: Object.freeze({
      title: "Feedback / Community",
      qrAlt: "Feedback/community group QR code",
      qrLoadFailed: "QR code failed to load. You can copy the WeChat ID instead.",
      desc: "If the QR code expires, add WeChat: yumengashuo and note your purpose."
    }),
    language: Object.freeze({
      label: "Language",
      desc: "Choose the interface language. Changes apply immediately.",
      selectAria: "Choose interface language",
      options: Object.freeze({
        "zh-CN": "简体中文",
        "en-US": "English"
      })
    }),
    common: Object.freeze({
      on: "On",
      off: "Off",
      shortcut: "Shortcut:"
    }),
    completionSound: Object.freeze({
      saved: "Completion sound settings saved",
      saveFailed: "Failed to save completion sound settings: {error}",
      listUnsupported: "This environment cannot read the system sound folder",
      readingSystemSounds: "Reading system sound folder...",
      foundMp3Files: "Found {count} mp3 files",
      emptyMp3Directory: "No mp3 files in this folder",
      listFailed: "Failed to read system sound folder: {error}",
      openFolderUnsupported: "This environment cannot open the system sound folder",
      openFolderFailed: "Failed to open system sound folder: {error}",
      loadFailed: "Failed to load completion sound settings",
      unknownError: "Unknown error"
    }),
    general: Object.freeze({
      title: "General",
      appearance: "Appearance",
      inputPreferences: "Input Preferences",
      imageInput: "Image Input",
      videoPlayback: "Video Playback",
      completionNotifications: "Completion Notifications",
      theme: Object.freeze({
        label: "App theme",
        desc: "Switch the overall light or dark interface style",
        dusk: "Dusk",
        dawn: "Dawn",
        day: "Day"
      }),
      promptActionSurface: Object.freeze({
        label: "Prompt and action bar surface",
        desc: "Controls the background style of node prompt bars and floating action bars",
        transparent: "Transparent",
        themed: "Frosted"
      }),
      canvasToolbarPlacement: Object.freeze({
        label: "Canvas toolbar position",
        desc: "Show the primary toolbar on the left, right, or centered along the bottom",
        left: "Left",
        right: "Right",
        bottom: "Bottom"
      }),
      nodeManagerPlacement: Object.freeze({
        label: "Node manager position",
        desc: "Show the node manager on the left, right, or bottom of the canvas",
        left: "Left",
        right: "Right",
        bottom: "Bottom"
      }),
      leftSidebarAutoHide: Object.freeze({
        label: "Auto-hide canvas toolbar",
        desc: "When enabled, the canvas toolbar tucks into its current screen edge and expands on hover or focus"
      }),
      bottomLeftBarAutoHide: Object.freeze({
        label: "Auto-hide bottom-left bar",
        desc: "When enabled, the bottom-left controls and minimap tuck into the corner and expand on hover or focus"
      }),
      canvasWheelBehavior: Object.freeze({
        label: "Control style",
        desc: "Trackpad mode: pan freely with two fingers and pinch to zoom; use Ctrl/⌘+wheel with a mouse to zoom",
        zoom: "Wheel zoom",
        pan: "Trackpad mode"
      }),
      cursorSize: Object.freeze({
        label: "Cursor size",
        desc: "Choose the displayed cursor size",
        small: "Small",
        medium: "Medium",
        large: "Large"
      }),
      promptAttachmentButtonHidden: Object.freeze({
        label: "Hide mouse connect button",
        desc: "Hides the add-reference connect entry at the top-left of nodes without affecting existing links or @ references",
        no: "No",
        yes: "Yes"
      }),
      promptPresetButtonHidden: Object.freeze({
        label: "Hide prompt preset button",
        desc: "Hides the book entry at the top-right of prompt fields; type / to open presets instead",
        no: "No",
        yes: "Yes"
      }),
      inputFontSize: Object.freeze({
        label: "Input font size",
        desc: "Adjust the font size of node prompt inputs",
        small: "Small",
        medium: "Medium",
        large: "Large"
      }),
      promptEnterBehavior: Object.freeze({
        label: "Prompt Enter behavior",
        desc: "When Enter inserts a new line, use Ctrl/⌘+Enter to send",
        submit: "Enter sends",
        newline: "Enter inserts line"
      }),
      imageUploadQuality: Object.freeze({
        label: "Image input upload quality",
        desc: "Compression quality for reference images before generation",
        standard: "Standard",
        highFidelity: "High fidelity",
        originalFirst: "Original first"
      }),
      videoAudioDefaultEnabled: Object.freeze({
        label: "Video audio",
        desc: "Controls the audio playback state when video nodes are created or opened"
      }),
      completionSound: Object.freeze({
        label: "Completion sound",
        desc: "Play a sound after generation tasks succeed",
        on: "On",
        off: "Off"
      }),
      completionNotification: Object.freeze({
        label: "Bottom-right notification",
        desc: "Show a system notification after generation succeeds when the canvas window is inactive",
        on: "On",
        off: "Off"
      }),
      completionVolume: Object.freeze({
        label: "Sound volume",
        desc: "Control the completion sound volume"
      }),
      systemSound: Object.freeze({
        label: "System sound",
        desc: "Put .mp3 files in the system sound folder, then refresh and choose one",
        selectAria: "Choose notification sound file",
        openFolder: "Open system sound folder",
        refresh: "Refresh sound list",
        preview: "Preview sound"
      })
    }),
    canvasAlign: Object.freeze({
      title: "Canvas & Alignment",
      canvasDisplay: "Canvas Display",
      dragSnapping: "Drag Snapping",
      multiSelectAlign: "Multi-select Alignment",
      gridDots: Object.freeze({
        label: "Grid dots",
        desc: "Only affects display; grid snapping is unchanged"
      }),
      connectionLines: Object.freeze({
        label: "Connection lines",
        desc: "Controls connection line visibility only; node links are unchanged"
      }),
      connectionLineStyle: Object.freeze({
        label: "Connection line style",
        desc: "Choose the path style for canvas connections and drag previews",
        curve: "Curve",
        orthogonal: "Right angle",
        straight: "Straight"
      }),
      relatedHighlight: Object.freeze({
        label: "Highlight related nodes on selection",
        desc: "Highlight directly connected upstream and downstream nodes and lines"
      }),
      highlightColor: Object.freeze({
        label: "Highlight color",
        desc: "Set the border and glow color for related nodes"
      }),
      colors: Object.freeze({
        white: "White",
        blue: "Blue",
        green: "Green",
        cyan: "Cyan",
        purple: "Purple",
        red: "Red",
        yellow: "Yellow"
      }),
      snapGuides: Object.freeze({
        label: "Guide snapping",
        desc: "Show guide lines and snap automatically when dragging a single node"
      }),
      snapGrid: Object.freeze({
        label: "Grid snapping",
        desc: "Snap dragged nodes to the grid when enabled"
      }),
      alignTrigger: Object.freeze({
        label: "Enable multi-select alignment",
        desc: "Choose hold or click behavior for the center alignment panel shortcut",
        hold: "Hold to open",
        click: "Click to open",
        off: "Off"
      }),
      alignGap: Object.freeze({
        label: "Alignment gap",
        desc: "Keep the first node fixed, then distribute following nodes by this gap"
      })
    }),
    nodeBehavior: Object.freeze({
      title: "Node Creation & Behavior",
      nodeDisplay: "Node Display",
      nodeInteraction: "Node Interaction",
      commentNote: "Comment Nodes",
      newNode: "New Node Creation",
      selectionMediaProperties: Object.freeze({
        label: "Selected node properties",
        desc: "Show selected media details and character counts while editing prompts or text"
      }),
      titleFollowsZoom: Object.freeze({
        label: "Titles follow canvas zoom",
        desc: "When enabled, regular node titles scale with the canvas; when disabled, they keep their screen size"
      }),
      mediaResize: Object.freeze({
        label: "Image and video node resizing",
        desc: "Allow resizing image/video nodes from the bottom-right corner without changing the reset-size shortcut"
      }),
      promptBoxResize: Object.freeze({
        label: "Resizable prompt boxes",
        desc: "Allow dragging the bottom edge of prompt boxes to adjust height"
      }),
      commentJumpFocus: Object.freeze({
        label: "Comment jump focus position",
        desc: "When jumping to a comment node, place its center at this relative position in the canvas viewport",
        x: "Horizontal",
        y: "Vertical"
      }),
      nodeSpacing: Object.freeze({
        label: "Node creation spacing",
        desc: "Horizontal offset used when generating new nodes"
      }),
      nodeDirection: Object.freeze({
        label: "Continuous node direction",
        desc: "Direction to search when nearby space is occupied",
        right: "Right",
        down: "Down"
      }),
      nodeAvoidOverlap: Object.freeze({
        label: "Avoid existing nodes",
        desc: "Automatically avoid existing nodes when creating new nodes"
      })
    }),
    fileSave: Object.freeze({
      title: "Files & Save",
      lead: "Configure local folders for projects, asset data, and generated outputs. Authorization, API keys, and user settings stay in the app data folder.",
      rootDir: Object.freeze({
        label: "Save root folder",
        desc: "Projects, data, and outputs are saved together under this folder",
        placeholder: "For example D:\\SHUO Canvas Files",
        pickAria: "Choose save root folder",
        choose: "Choose"
      }),
      subtitleRecognition: Object.freeze({
        engineLabel: "Subtitle recognition engine",
        engineDesc: "Local subtitle recognition model used by Voice Studio",
        cpu: "CPU",
        gpu: "GPU acceleration",
        saved: "Subtitle recognition settings saved",
        saveFailed: "Failed to save subtitle recognition settings: {error}",
        readyToast: "Subtitle recognition and speaker separation models are ready",
        prepareFailed: "Failed to prepare subtitle recognition and speaker separation models: {error}",
        runtimeCheckFailed: "Failed to check subtitle recognition runtime: {error}",
        gpuInstallReadyToast: "GPU acceleration component installed",
        gpuInstallFailed: "Failed to install GPU acceleration component: {error}",
        gpuUnavailableToast: "GPU acceleration is unavailable. Switch to CPU or install the GPU acceleration component.",
        status: Object.freeze({
          download: "Download subtitle component / models",
          downloading: "Downloading {percent}",
          installing: "Installing {percent}",
          checking: "Checking",
          ready: "Ready",
          retry: "Retry",
          gpuRequired: "Install GPU component"
        }),
        runtime: Object.freeze({
          noTaskId: "Model preparation task did not return a task ID",
          checkingGpu: "Checking GPU acceleration...",
          installingGpuTorch: "Installing CUDA-enabled torch...",
          gpuUnavailable: "CUDA is unavailable in the current runtime. Switch to CPU or install the GPU acceleration component.",
          torchCpuOnly: "The current runtime has CPU-only torch installed, so GPU acceleration cannot be used. Install CUDA-enabled torch.",
          torchCpuOnlyWithGpu: "NVIDIA GPU detected ({gpu}), but the current runtime has CPU-only torch installed. Install CUDA-enabled torch.",
          torchMissing: "The current runtime does not have torch installed. Install the GPU acceleration component or switch to CPU.",
          cudaUnavailable: "CUDA-enabled torch is installed, but CUDA failed to initialize. Check the GPU driver and torch CUDA version."
        })
      }),
      migration: Object.freeze({
        label: "Migrate save location",
        preparing: "Preparing files for migration",
        migrating: "Migrating files",
        creatingTask: "Creating migration task",
        migrateOutput: "Migrating output save path",
        done: "Migration complete",
        processed: "Processed",
        copied: "Copied",
        skipped: "Skipped",
        failed: "Failed",
        current: "Current: {file}",
        itemFailed: "Migration failed",
        noJobId: "Migration task did not return a jobId",
        failedMessage: "File migration failed",
        summary: "Migration complete: copied {copied}, skipped {skipped}, failed {failed}"
      }),
      validation: Object.freeze({
        chooseRoot: "Choose a save root folder",
        projectPath: "Enter a project save path",
        dataPath: "Enter a data file save path",
        outputPath: "Enter an output file save path"
      }),
      runtime: Object.freeze({
        saving: "Migrating...",
        choose: "Choose",
        choosing: "Choosing...",
        pickerUnsupported: "Directory selection is not supported in this environment",
        pickTitle: "Choose save root folder",
        pickFailed: "Failed to choose folder: {error}",
        loadFailed: "Failed to load file and save paths",
        partialMigrationFailed: "Save location was updated, but some files failed to migrate. {summary}",
        saveFailed: "Failed to save file paths: {error}",
        unknownError: "Unknown error"
      }),
      localCleanup: Object.freeze({
        label: "Clean unused files",
        desc: "Scan thumbnails, derived images, video covers, waveforms, and clip results, listing only local files not referenced by projects or nodes",
        scan: "Scan unused files",
        trash: "Move to Recycle Bin",
        count: "Cleanable files",
        size: "Estimated cleanup",
        idle: "Scan first, then choose whether to clean up",
        scanning: "Scanning local asset references...",
        scanBusy: "Scanning...",
        scanSuccess: "Scan complete. Cleanable files are listed.",
        scanEmpty: "Scan complete. No cleanable files found.",
        trashing: "Moving files to the system Recycle Bin...",
        trashBusy: "Processing...",
        confirmPrefix: "Move ",
        success: "Unused files moved to the Recycle Bin"
      }),
      legacyCleanup: Object.freeze({
        label: "Clean old C drive assets",
        desc: "After path migration, scan the old default save location for project assets, outputs, and cache files, then move confirmed files to the system Recycle Bin",
        scan: "Scan old location",
        trash: "Move to Recycle Bin",
        count: "Cleanable files",
        size: "Estimated cleanup",
        idle: "After path migration, you can scan the old default save location",
        scanning: "Scanning old default save location...",
        scanBusy: "Scanning...",
        scanSuccess: "Scan complete. Cleanable old-location files are listed.",
        scanEmpty: "Scan complete. No cleanable files found in the old location.",
        trashing: "Moving files to the system Recycle Bin...",
        trashBusy: "Processing...",
        confirmPrefix: "Move ",
        success: "Old-location files moved to the Recycle Bin"
      }),
      cleanupRuntime: Object.freeze({
        notSupported: "Local asset cleanup is not supported in this environment",
        scanIncomplete: "Scan not complete",
        scanEmptySummary: "Scanned {candidateCount} local files and found no cleanable files",
        scanFoundSummary: "Scanned {candidateCount} local files, found {orphanCount} cleanable files, estimated cleanup {orphanBytes}",
        mediaKind: "media",
        moreFiles: "{count} more files are not expanded",
        scanFailed: "Scan failed",
        scanFailedDetail: "Scan failed: {error}",
        confirmTrash: "{prefix}{count} files to the system Recycle Bin?\nEstimated cleanup {bytes}.",
        trashedMessage: "Moved {count} files to the Recycle Bin, {bytes}",
        trashPartial: "{message}; skipped {skipped}, failed {failed}",
        trashPartialToast: "Some files could not be moved to the Recycle Bin",
        trashFailed: "Cleanup failed",
        trashFailedDetail: "Cleanup failed: {error}"
      }),
      diagnostics: Object.freeze({
        label: "Error logs & diagnostics",
        desc: "Create a diagnostics package that can be sent to developers for troubleshooting. It does not include project files, assets, or API keys.",
        create: "Create diagnostics package",
        openLogs: "Open logs folder",
        creating: "Creating...",
        collecting: "Collecting logs and creating diagnostics package...",
        created: "Diagnostics package created",
        createdWithFile: "Diagnostics package created: {filename}",
        createFailed: "Failed to create diagnostics package",
        openLogsFailed: "Failed to open logs folder"
      }),
      save: "Save"
    }),
    objectStorage: Object.freeze({
      title: "Object Storage",
      lead: "Choose your object storage provider. Provider-specific connection details are handled automatically.",
      enabled: Object.freeze({
        label: "Use custom object storage"
      }),
      providerPicker: Object.freeze({
        aria: "Object storage provider"
      }),
      providers: Object.freeze({
        cloudflareR2: Object.freeze({
          title: "Cloudflare R2",
          badge: "R2",
          desc: "Enter the R2 S3 API endpoint, bucket, and public access domain.",
          console: "Open R2 console",
          accessKeyIdLabel: "Access Key ID",
          secretAccessKeyLabel: "Secret Access Key"
        }),
        tencentCos: Object.freeze({
          title: "Tencent Cloud COS",
          badge: "COS",
          desc: "Enter the full Bucket name including APPID. A configured custom or CDN domain is recommended.",
          console: "Open COS console",
          accessKeyIdLabel: "SecretId",
          secretAccessKeyLabel: "SecretKey"
        }),
        aliyunOss: Object.freeze({
          title: "Alibaba Cloud OSS",
          badge: "OSS",
          desc: "Enter the Bucket region. The matching S3 endpoint is generated automatically.",
          console: "Open OSS console",
          accessKeyIdLabel: "AccessKey ID",
          secretAccessKeyLabel: "AccessKey Secret"
        }),
        s3Compatible: Object.freeze({
          title: "Other S3 storage",
          badge: "S3",
          desc: "For other S3-compatible services. Region and Bucket address style can be configured manually.",
          accessKeyIdLabel: "Access Key ID",
          secretAccessKeyLabel: "Secret Access Key"
        })
      }),
      s3: Object.freeze({
        title: "S3-compatible storage"
      }),
      fields: Object.freeze({
        endpoint: "S3 API (Endpoint)",
        region: "Region",
        bucket: "Bucket",
        accessKeyId: "Access Key ID",
        secretAccessKey: "Secret Access Key",
        publicBaseUrl: "Public base URL",
        publicBaseUrlDesc: "Files must open directly at this address. For private buckets, allow reads for the SHUO-Canvas prefix or use a configured CDN domain.",
        addressingStyle: "Bucket address style"
      }),
      placeholders: Object.freeze({
        endpoint: "https://<account-id>.r2.cloudflarestorage.com",
        region: "ap-guangzhou",
        bucket: "aicanvas-assets",
        accessKeyId: "Access Key ID",
        secretAccessKey: "Secret Access Key",
        publicBaseUrl: "https://assets.example.com"
      }),
      addressing: Object.freeze({
        path: "Bucket in path",
        virtualHosted: "Bucket in domain"
      }),
      actions: Object.freeze({
        tutorial: "Tutorial",
        register: "Register for Cloudflare R2",
        test: "Test connection",
        testing: "Testing...",
        saving: "Saving..."
      }),
      status: Object.freeze({
        disabled: "Not enabled.",
        enabled: "Enabled. Field changes are saved automatically.",
        testing: "Uploading and reading back a temporary test image...",
        testSuccess: "Connection test passed. Upload and public read access both work.",
        ready: "Ready",
        testCleanupWarning: "The temporary test file could not be deleted. Check delete permission or lifecycle rules.",
        testFailed: "Connection test failed: {error}",
        testRequired: "Pass the connection test before enabling object storage.",
        changedRequiresRetest: "Object storage settings were saved. Verification is no longer valid, so storage was disabled. Test the connection again.",
        savedEnabled: "Object storage is enabled. Future public relay images will use it automatically.",
        savedDisabled: "Object storage is disabled. The current upload path is restored.",
        saveSuccess: "Object storage settings saved",
        saveFailed: "Failed to save object storage settings: {error}",
        providerSelected: "Switched to {provider}.",
        providerSelectedDisabled: "Switched to {provider}. Complete the fields and test the connection before enabling it.",
        unknownError: "Unknown error"
      })
    }),
    cliLogin: Object.freeze({
      title: "CLI Login",
      lead: "Manage service accounts authorized through local CLI components.",
      localAccount: "Local account",
      statusLabel: "Login status",
      checking: "Checking...",
      login: "Log in",
      logout: "Log out",
      providers: Object.freeze({
        codex: Object.freeze({
          title: "OpenAI CLI",
          description: "When signed out, click Log in and complete the official ChatGPT sign-in in the browser as prompted. Do not choose API Key or Access Token."
        })
      })
    }),
    apiInput: Object.freeze({
      title: "Model Services",
      lead: "Connect only the model service you plan to use. Models cannot submit generation requests until their service is configured.",
      apiKey: "API key",
      apiToken: "API token",
      endpoint: "Endpoint",
      testConnection: "Test connection",
      getKey: "Get Key",
      save: "Save",
      catalog: Object.freeze({
        categoryAria: "Filter model services by node type",
        categoryAll: "All",
        categoryText: "Text",
        categoryImage: "Image",
        categoryVideo: "Video",
        categoryAudio: "Audio",
        providerAria: "Model service providers",
        routeLabel: "Service route",
        routeAria: "Choose a service route",
        routeDomestic: "Mainland China",
        routeInternational: "International",
        allRoutesReady: "All verified",
        routesReady: "{count}/{total} verified"
      }),
      readiness: Object.freeze({
        title: "Connect a model service first",
        checking: "Checking saved model service settings...",
        checkingShort: "Checking",
        requiredShort: "Setup needed",
        empty: "No model service is connected. Choose a provider below, enter an API key, and save it to enable generation.",
        emptyShort: "Not configured",
        ready: "{count} model services are connected. Their models are ready to use.",
        readyShort: "{count} configured"
      }),
      route: Object.freeze({
        label: "Route",
        apimartAria: "APIMart route",
        domestic1: "China route 1",
        domestic2: "China route 2",
        overseas: "Overseas route",
        custom: "Custom route: {value}"
      }),
      customProvider: Object.freeze({
        title: "Custom provider models",
        lead: "Discover /v1/models first, then choose models for node menus. Unverified models send required fields only.",
        addProvider: "New provider",
        editorTitle: "Configure provider",
        editorNote: "Enter the endpoint and key, then discover models. Unverified capabilities use a minimal compatibility profile.",
        refreshBundles: "Refresh",
        refreshBundlesTitle: "Refresh custom manifests",
        baseUrl: "Base URL",
        baseUrlPlaceholder: "https://xxx.com",
        apiKey: "API Key",
        apiKeyPlaceholder: "sk-...",
        documentationUrl: "API documentation URL / local file (optional)",
        documentationUrlPlaceholder: "Optional; leave blank to discover docs from the Base URL",
        documentationAgentHint: "When left blank, documentation is discovered from the Base URL homepage and common OpenAPI or Swagger paths. If discovery fails, enter an Apifox or other documentation URL, or choose a local Markdown, text, JSON, or YAML document.",
        selectDocumentationFile: "Choose document",
        localDocumentationSelected: "Local document: {name}",
        localDocumentationTooLarge: "Local API documentation must not exceed 2 MB.",
        localDocumentationUnsupported: "Choose a Markdown, TXT, JSON, YAML, or HTML document.",
        localDocumentationReadFailed: "Failed to read local API documentation: {error}",
        discover: "Discover models",
        addModels: "Add models",
        saveModels: "Save models",
        verifyParameters: "Verify model parameters",
        verifyingParameters: "Verifying parameters...",
        documentationUrlRequired: "Enter an API documentation URL or choose a local document first.",
        documentationAutoDiscoveryFailed: "No API documentation was found from the Base URL. Enter a documentation URL or choose a local document.",
        parametersVerified: "Parameter verification completed: {documented} model(s) received documented parameters.",
        parametersVerifiedPartial: "Parameter verification partially completed: {documented}/{count} model(s) received parameters; the rest still use the minimal profile.",
        parameterVerificationFailed: "Model parameter verification failed: {error}",
        providerDraftInitial: "Provider 1",
        providerDraftTitle: "Provider {index}",
        deleteProviderDraft: "Delete provider",
        providerDisplayName: "Provider display name",
        providerDisplayNamePlaceholder: "Defaults to the site name",
        selectModels: "Choose models to add",
        selectionHint: "Selected models appear in matching node menus. Unverified models do not send guessed ratio, resolution, count, or quality fields.",
        capabilityUnverified: "Params unverified",
        capabilityUnverifiedHint: "Only required model and prompt fields are enabled to avoid failures from guessed parameters.",
        capabilityDocumented: "Docs recognized",
        capabilityDocumentedHint: "Parameters came from API documentation and passed manifest validation, but no real billable request has verified them yet.",
        modelKindLabel: "Model category:",
        classifyBeforeSelecting: "Choose a model category above first",
        vipRequired: "Custom providers are a VIP feature. Activate access first.",
        discovering: "Discovering...",
        analyzingDocumentation: "Analyzing API documentation...",
        validating: "Validating",
        saved: "Saved {count} models",
        savedWithUnverified: "Saved {count} models ({unverified} have unverified parameters and use the minimal profile)",
        savedDocumented: "Saved {count} models; {documented} received documented parameters",
        documentationAgentUnavailable: "The documentation is not OpenAPI and no canvas Agent text model is configured. Models were saved with minimal parameters.",
        documentationNoMatchingProfile: "No documented operation matched the selected model kinds. Those models were saved with minimal parameters.",
        documentationAgentInaccessible: "The Agent could not open or continue browsing the API documentation. Confirm that the selected Agent model supports web access and that the docs do not require sign-in.",
        documentationSelectedModelNotFound: "The Agent searched specifically for the selected model, but the documentation did not contain its API operation.",
        documentationAsyncLifecycleUnsupported: "The model API was found, but the docs are missing complete polling details: task id, status endpoint, or result path. It will be saved with the minimal profile for now.",
        documentationAnalysisFailed: "API documentation analysis failed: {error}. Models were saved with minimal parameters.",
        savedBundles: "Added models",
        notLoaded: "Not loaded",
        noBundles: "No custom manifests saved yet",
        loadingBundles: "Loading custom manifests...",
        resultSummary: "Discovered {count} models, {supported} selectable, {unknown} unknown",
        unsupportedSummary: "{count} models are not supported for registration yet",
        bundleMeta: "{modelCount} models · {kindList}",
        bundleTitle: "{providerName} -> {models}",
        bundleExpand: "Expand",
        bundleCollapse: "Collapse",
        deleteBundle: "Delete",
        deleteBundleTitle: "Delete custom manifest",
        deleteSuccess: "Custom manifest deleted",
        fillRequired: "Enter Base URL and API Key",
        apiUnsupported: "Custom provider endpoints are not connected in this build",
        noModelsDiscovered: "No selectable models were discovered",
        noModelsInFilter: "No selectable models in this category",
        noModelsSelected: "Select at least one model first",
        configSavedNoSupportedModels: "Custom provider configuration was saved. Assign categories under Unknown before adding models.",
        duplicateProviderDomain: "A provider with the same domain already exists. Do not add the same domain twice.",
        noSupportedModels: "No registrable text / image / video / audio models found",
        loadBundlesFailed: "Failed to load custom manifests: {error}",
        saveFailed: "Failed to save custom provider: {error}",
        deleteFailed: "Failed to delete custom manifest: {error}",
        kindAll: "All",
        kindText: "Text",
        kindImage: "Image",
        kindVideo: "Video",
        kindAudio: "Audio",
        kindEmbedding: "Embedding",
        kindUnknown: "Unknown",
        modelsMore: "{count} more"
      }),
      diagnostics: Object.freeze({
        skipped: "Skipped",
        passed: "Passed",
        failed: "Failed",
        partialPassed: "Partially passed",
        notPassed: "Not passed",
        step: "Step",
        testUnsupported: "Connection testing is not supported in this version",
        fillProviderKey: "Enter this provider's API key first",
        fillProviderUrl: "Enter this provider's endpoint first",
        fillOneProviderKey: "Enter at least one provider API key first",
        testing: "Testing",
        testingBusy: "Testing...",
        testFailed: "Connection test failed",
        testPassed: "Connection test passed",
        testNotPassed: "Connection test did not pass",
        providerPassed: "{label} connection test passed",
        allPassed: "API connection test passed",
        providerFailed: "Connection test did not pass: {label} - {error}",
        testFailedWithDetail: "Connection test failed: {error}",
        unknownError: "Unknown error",
        loadFailed: "Failed to load API config: {error}",
        saveSuccess: "API config saved",
        saveFailed: "Save failed: {error}"
      }),
      statuses: Object.freeze({
        unconfigured: "Not configured",
        configured: "Filled, not verified",
        configuredCount: "{count}/{total} configured",
        deprecated: "Deprecated soon",
        unavailable: "Unavailable",
        frontendPlaceholder: "Frontend placeholder",
        oauthLogin: "OAuth login"
      }),
      providers: Object.freeze({
        binghuo: Object.freeze({
          title: "Cheap Channel BH",
          testTitle: "Test Cheap Channel BH connection",
          getTitle: "Go to Cheap Channel BH to get an API token",
          guideButtonTitle: "View the Cheap Channel BH guide",
          guideButton: "Beginner tutorial"
        }),
        apimart: Object.freeze({
          testTitle: "Test APIMart connection",
          getTitle: "Go to APIMart to get an API key",
          guideButtonTitle: "Open the APIMart API key guide",
          guideButton: "Beginner tutorial",
          close: "Close",
          guideTitle: "How to get an APIMart API key",
          guideSubtitle: "After signing in to APIMart, open the top-right avatar menu, choose API 密钥, then create or copy an API key.",
          guideAlt: "Long guide image for getting an APIMart API key",
          guideChecklistTitle: "Setup steps",
          guideNote1: "The Get Key button opens APIMart. Sign in if you already have an account, or register first.",
          guideNote2: "After signing in, click the top-right avatar, such as G, and choose API 密钥 from the menu.",
          guideNote3: "On the API 密钥 page, click + 创建 API 密钥 on the top right. You can also copy an existing key row.",
          guideNote4: "Copy the sk- API key and paste it into SHUO Canvas APIMart. Keep Domestic route 1 unless testing fails.",
          openConsole: "Open APIMart",
          openSettings: "Open settings"
        }),
        minimax: Object.freeze({
          domesticName: "MiniMAX Official (Mainland China)",
          internationalName: "MiniMAX Official (International)",
          domesticTestTitle: "Test MiniMAX Mainland China connection",
          internationalTestTitle: "Test MiniMAX international connection",
          domesticGetTitle: "Go to MiniMAX Mainland China for an API key",
          internationalGetTitle: "Go to MiniMAX International for an API key"
        }),
        agnes: Object.freeze({
          domesticName: "Agnes AI (Mainland China)",
          internationalName: "Agnes AI (International)",
          domesticTestTitle: "Test Agnes AI Mainland China connection",
          internationalTestTitle: "Test Agnes AI international connection",
          testTitle: "Test Agnes AI connection",
          getTitle: "Go to Agnes AI to get an API key",
          guideButtonTitle: "Open the Agnes AI API key guide",
          guideButton: "Beginner tutorial",
          close: "Close",
          guideTitle: "How to get an Agnes AI API key",
          guideSubtitle: "Open the Agnes platform API key page, use Settings > API 密钥 in the left sidebar, then click 创建新的密钥 and copy the personal key.",
          guideAlt: "Long guide image for getting an Agnes AI API key",
          guideChecklistTitle: "Setup steps",
          guideNote1: "Click Get Key to open the Agnes platform. Sign in first if needed, then open the API 密钥 page under Settings.",
          guideNote2: "In the left sidebar, under 设置, click API 密钥. The main page title should also be API 密钥.",
          guideNote3: "Click 创建新的密钥 and copy the sk- personal key from the table. 企业密钥 is for enterprise accounts.",
          guideNote4: "Return to SHUO Canvas Settings > API Key > Agnes AI, paste the key, and test the connection.",
          openConsole: "Open Agnes keys",
          openSettings: "Open settings"
        }),
        volcengine: Object.freeze({
          title: "Volcengine Ark",
          testTitle: "Test Volcengine Ark connection",
          getTitle: "Go to Volcengine Ark to get an API key",
          guideButtonTitle: "Open the Volcengine Ark API key guide",
          guideButton: "Beginner tutorial",
          close: "Close",
          guideTitle: "How to get a Volcengine Ark API key",
          guideSubtitle: "Enable the required models in Volcengine Ark 开通管理 first, then open API Key 管理 to create or copy a key.",
          guideAlt: "Long guide image for getting a Volcengine Ark API key",
          guideChecklistTitle: "Setup steps",
          guideNote1: "In the Volcengine Ark console, click 开通管理 in the left sidebar. Sign in first if redirected.",
          guideNote2: "Find the model SHUO Canvas will use and click 开通服务 on the right. You can also use 一键开通所有模型 at the top right.",
          guideNote3: "After enabling the service, open API Key 管理, then create an API key or copy an existing usable key.",
          guideNote4: "Return to SHUO Canvas Settings > API Key > Volcengine Ark, paste the key, and test the connection.",
          openConsole: "Open Ark service activation",
          openSettings: "Open settings"
        }),
        volcengineSpeech: Object.freeze({
          title: "Volcengine Speech",
          testTitle: "View Volcengine Speech service status",
          getTitle: "Go to Volcengine Speech API Key Management",
          guideButtonTitle: "Open the Volcengine Speech setup and API key guide",
          guideButton: "Beginner tutorial",
          apiKeyPlaceholder: "Speech X-Api-Key, not an Ark key..."
        }),
        runninghub: Object.freeze({
          domesticName: "RunningHUB (Mainland China)",
          internationalName: "RunningHUB (International)",
          testTitle: "Test RunningHUB connection",
          getTitle: "Go to RunningHUB to get an API key",
          guideButtonTitle: "Open the RunningHUB API key guide",
          guideButton: "Beginner tutorial",
          setDefaultSite: "Set as default site",
          workflowApiKey: "Workflow API key (consumer membership)",
          workflowApiKeyHint: "Calls workflows / AI apps and consumes account credits (RH coins).",
          modelApiKey: "Model API key (enterprise shared)",
          modelApiKeyHint: "Calls model APIs and consumes wallet balance.",
          modelApiKeyPlaceholder: "Model API key...",
          close: "Close",
          guideTitle: "How to get RunningHUB API keys",
          guideSubtitle: "Start from the RunningHUB website, click API in the top navigation, then click Keys. The consumer-membership key calls workflows and consumes credits; the enterprise-shared key calls model APIs and consumes wallet balance.",
          guideAlt: "Long guide image for getting RunningHUB API keys",
          guideChecklistTitle: "Setup steps",
          guideNote1: "Open the RunningHUB website, click API in the top navigation, then click Keys on the API page.",
          guideNote2: "Copy the key on Consumer Membership and paste it into Workflow API key for workflows / AI apps.",
          guideNote3: "Switch to Enterprise Shared, copy that API key, and paste it into Model API key for model APIs.",
          guideNote4: "If the page asks you to sign in, sign in to RunningHub first. Do not share your keys.",
          openConsole: "Open RunningHUB website",
          openSettings: "Open settings"
        }),
        comfyui: Object.freeze({
          title: "ComfyUI Local/Cloud",
          testTitle: "Test ComfyUI connection",
          endpoint: "ComfyUI address",
          localEndpoint: "ComfyUI local address",
          cloudEndpoint: "ComfyUI cloud address",
          placeholder: "127.0.0.1:8188",
          cloudPlaceholder: "Paste the cloud ComfyUI address here",
          hint: "The local address defaults to 127.0.0.1:8188. Use the cloud address for an already-started cloud ComfyUI instance."
        }),
        grsai: Object.freeze({
          testTitle: "Test GRSAI connection",
          getTitle: "Go to GRSAI to get an API key",
          guideButtonTitle: "Open the GRSAI API key guide",
          guideButton: "Beginner tutorial",
          close: "Close",
          guideTitle: "How to get a GRSAI API key",
          guideSubtitle: "Open the GRSAI backend, then use the left sidebar: API Management > API Key. Create or copy a key on that page.",
          guideAlt: "Long guide image for getting a GRSAI API key",
          guideChecklistTitle: "Setup steps",
          guideNote1: "Click Get Key to open the GRSAI API Key page. If it says 请先登录, click 立即登录.",
          guideNote2: "After sign-in, find the API Management group in the left sidebar and click API Key.",
          guideNote3: "On the API Key / 管理您的API Key page, click 创建API Key or copy an existing key. Do not copy balances or plan text.",
          guideNote4: "Return to SHUO Canvas Settings > API Key > GRSAI, paste the key, and test the connection.",
          openConsole: "Open GRSAI API Key",
          openSettings: "Open settings"
        }),
        ppio: Object.freeze({
          title: "PPIO",
          testTitle: "Test PPIO connection",
          getTitle: "Go to PPIO to get an API key"
        }),
        openai: Object.freeze({
          title: "OpenAI-Compatible API Format",
          testTitle: "Test OpenAI-compatible connection",
          formatHintAria: "OpenAI format help",
          hintPrefix: "The correct generic OpenAI endpoint format comes after",
          hintSuffix: "for example:"
        }),
        dreamina: Object.freeze({
          title: "Dreamina (Currently advanced members only)",
          badge: "D",
          logoAlt: "Dreamina",
          noticeAria: "Dreamina usage notes",
          noticeTitle: "Before using",
          noticeEntitlement: "Generation tasks consume account entitlements or credits and are currently available only to advanced members and above.",
          noticeCreditPolicy: "Credits consumed by Dreamina CLI generation follow the same credit standards as equivalent capabilities in Dreamina web Agent mode. Final rules and credit records in the product apply.",
          loginStatus: "Login status",
          checking: "Checking...",
          readingStatus: "Reading Dreamina status...",
          accountCredit: "Account credits",
          creditPlaceholder: "Balance appears after login",
          login: "Log in",
          logout: "Log out",
          desc: "Use the official Dreamina OAuth authorization page. After confirming login on the page, the app will sync login status automatically.",
          modalAria: "Dreamina login",
          closeAria: "Close Dreamina login window",
          accountBadge: "Dreamina account",
          starting: "Starting Dreamina login...",
          qrAlt: "Dreamina login QR code",
          waitText: "After completing login on the authorization page, the app will sync status automatically.",
          retry: "Restart login",
          guideTitle: "OAuth Web Authorization",
          stepAuth: "Open the authorization page and confirm login",
          authUrlAria: "Dreamina authorization link",
          open: "Open Authorization Page",
          copy: "Copy",
          viewLogin: "View login",
          relogin: "Log in again",
          waitingAuthUrl: "Waiting for authorization link...",
          missingValue: "{label} was not detected. Try again shortly.",
          browserOpenFailedCopied: "The browser could not open directly. {label} was copied.",
          browserOpenFailedCopyFirst: "The browser could not open directly. Copy {label} first.",
          copySuccess: "{label} copied",
          copyFailed: "Failed to copy {label}. Select the text manually to copy.",
          authLinkLabel: "Dreamina authorization link",
          jsonParseFailed: "Failed to parse JSON",
          jsonPasteRequired: "Paste the full JSON returned by the final redirect page in step 2 first",
          jsonMustBeObject: "JSON must be an object",
          jsonFormatInvalid: "Invalid JSON format. Paste the full JSON returned by the final redirect page in step 2.",
          jsonImportUnsupported: "This version does not support JSON import. Upgrade and try again.",
          importFailed: "Failed to import login state",
          importedSyncing: "Login state imported. Syncing status.",
          qrLoadFailed: "QR image failed to load",
          creditTotal: "Total credits {total} (membership {vip} / gift {gift} / purchase {purchase})",
          loginSuccess: "Dreamina login succeeded",
          loginReused: "Current Dreamina login is still valid",
          loginFailed: "Dreamina login failed",
          statusPreparing: "Preparing",
          statusWaitingAuth: "Waiting for authorization",
          statusLoggingIn: "Logging in",
          statusLoggedIn: "Logged in",
          statusLoggedOut: "Not logged in",
          waitBrowserFailed: "The browser could not open automatically. Click Open Authorization Page to continue.",
          waitOpenAuth: "Click Open Authorization Page and confirm login. The app will sync login status automatically.",
          waitPendingTooLong: "Login is taking longer than expected. Confirm that login was completed on the authorization page.",
          waitQrDeprecated: "QR login is no longer the main flow. Use the OAuth authorization page below.",
          waitFailed: "Login failed. Reopen the authorization page and confirm login.",
          waitConfirm: "Complete Dreamina login confirmation on the authorization page.",
          waitUseOAuth: "Use the OAuth authorization page to complete login.",
          waitDone: "Login complete. Updating account information...",
          waitOAuthPreparing: "Waiting for Dreamina to return the authorization link...",
          waitPreparing: "Preparing Dreamina login...",
          modalSynced: "Dreamina login succeeded. Syncing account status...",
          modalBrowserFailed: "The browser could not open automatically. Use the button below to open the authorization page.",
          modalOAuthStarted: "The authorization page is ready. Click Open Authorization Page to continue.",
          modalPendingTooLong: "Login is taking longer than expected. Confirm that login was completed on the authorization page.",
          modalQrAbnormal: "QR display failed. Use the OAuth authorization page below.",
          modalRetryAuth: "Login is not complete. Reopen the authorization page.",
          modalAuthorizeOnPage: "Open the Dreamina authorization page and confirm login",
          modalScanQr: "Scan the QR code below with the Douyin app",
          modalProcessing: "Processing Dreamina login...",
          guideCollapse: "Collapse login guide",
          guideRecommended: "Login guide (recommended)",
          guide: "Login guide",
          notLoggedInHint: "Not logged in. Click Log in to use Dreamina.",
          fetchStatusFailed: "Failed to get Dreamina status",
          startFailed: "Failed to start Dreamina login",
          reloginStarted: "Dreamina re-login started. Open the authorization page and confirm login.",
          loginStarted: "Dreamina login started. Open the authorization page and confirm login.",
          logoutFailed: "Failed to log out of Dreamina",
          loggedOut: "Logged out of Dreamina"
        })
      })
    }),
    subscription: Object.freeze({
      title: "Subscription",
      statusLabel: "Subscription status",
      inactive: "Inactive",
      loading: "Syncing...",
      active: "Active",
      vipAuthorization: "VIP authorization",
      annualVipAuthorization: "Annual VIP authorization",
      expired: "Expired",
      expirePrefix: "Expires:",
      inputLabel: "Enter CDKEY",
      cdkeyPlaceholder: "For example DEMO-V54-365D",
      contact: "Contact admin for an authorization code",
      clearAuthorization: "Clear authorization",
      activateCdkey: "Activate CDKEY",
      gate: Object.freeze({
        aria: "Subscription unlock",
        title: "VIP authorization required",
        desc: "Contact the admin for an authorization code, or enter a CDKEY to unlock now.",
        cdkeyPlaceholder: "Enter CDKEY",
        cancel: "Cancel",
        activate: "Activate"
      }),
      contactInfo: Object.freeze({
        wechatLabel: "WeChat:",
        wechatAria: "Admin WeChat",
        qrNotConfigured: "Admin QR code is not configured. Try again later.",
        qrAlt: "Admin WeChat QR code",
        qrLoadFailed: "QR code failed to load. You can copy the WeChat ID instead."
      }),
      missingInstallIdSync: "Missing installId, unable to sync subscription status",
      syncFailed: "Failed to sync subscription status",
      enterCdkey: "Enter a CDKEY",
      missingInstallIdActivate: "Missing installId, unable to activate",
      activationFailed: "CDKEY activation failed",
      activated: "CDKEY activated",
      submitted: "Submitted. Checking authorization...",
      serverNotConfirmed: "The server has not confirmed activation. Try again later",
      clearConfirm: "Clear the current authorization? This device will return to inactive status.",
      clearing: "Clearing...",
      clearSuccess: "Current authorization cleared",
      clearFailed: "Failed to clear authorization",
      checking: "Checking",
      gateFailed: "Activation check failed",
      activeSyncTip: "Subscription is active. Syncing now, then try again."
    }),
    shortcuts: Object.freeze({
      title: "Keyboard Shortcuts",
      presetLabel: "Preset",
      desc: "Customize your creation workflow. Click the key for any action below to record a new shortcut.",
      presets: Object.freeze({
        default: "Default preset",
        ashuo: "Ashuo preset",
        custom: "Custom"
      }),
      escExitRecording: "Exit recording",
      closePanel: "Close panel",
      resetDefault: "Restore defaults",
      recording: "Recording...",
      unset: "Not set",
      searchPlaceholder: "Search actions, groups, or keys",
      searchAria: "Search keyboard shortcuts",
      noResults: "No matching shortcuts found",
      presetSwitched: "Preset switched: {preset}",
      conflict: "Shortcut conflict: already used by \"{label}\"",
      updated: "Shortcut updated",
      restored: "Default shortcuts restored",
      groups: Object.freeze({
        general: "General",
        editSelection: "Edit & Selection",
        settingToggles: "Setting Toggles",
        createNodes: "Create Nodes",
        sidebar: "Sidebar",
        brushTools: "Brush Tools",
        imageTools: "Image Tools",
        videoTools: "Video Tools",
        audioTools: "Audio Tools",
        clipTools: "Clip Tools",
        textTools: "Text Tools",
        panoramaStage: "3D Stage"
      }),
      actions: Object.freeze({
        "zoom-in": "Zoom in",
        "zoom-out": "Zoom out",
        "fit-all": "Focus nodes / fit canvas",
        minimap: "Minimap",
        "pan-canvas": "Pan canvas (hold)",
        copy: "Copy node",
        "copy-media": "Copy image",
        cut: "Cut node",
        "canvas-screenshot": "Canvas screenshot",
        "duplicate-with-edges": "Drag to create linked duplicate",
        paste: "Paste node",
        undo: "Undo",
        redo: "Redo",
        delete: "Delete node",
        "select-all": "Select all",
        "multi-select": "Multi-select nodes (with click)",
        group: "Group",
        "align-feature": "Multi-select alignment",
        "grid-dots": "Show grid dots",
        "toggle-connection-lines": "Show/hide connection lines",
        "toggle-selection-related-highlight": "Highlight related nodes on click",
        "snap-guides": "Guide snapping",
        "snap-grid": "Grid snapping toggle",
        "toggle-title-follows-zoom": "Titles follow canvas zoom",
        "toggle-media-node-resize": "Image/video node resizing",
        "toggle-prompt-box-resize": "Resizable prompt boxes",
        "toggle-node-avoid-overlap": "Avoid existing nodes",
        "reset-media-size": "Reset node size",
        "add-reference": "Add reference",
        "toggle-agent": "Toggle SHUO Agent",
        "create-text": "Create source text node",
        "create-comment-note": "Create comment node",
        "create-ai-text": "Create generated text node",
        "create-ai-image": "Create generated image node",
        "create-ai-video": "Create generated video node",
        "create-ai-audio": "Create generated audio node",
        "upload-file": "Upload file",
        "cut-edge": "Scissors (cut connection)",
        save: "Save canvas",
        "open-settings": "Open settings",
        "open-canvas-projects": "Open canvas projects",
        "open-assets": "Open materials",
        "open-workflows": "Open workflows",
        "open-node-manager": "Toggle node manager",
        "open-files": "Open file manager",
        "open-task-center": "Open task center",
        "open-custom-ai-app": "Open custom AI app",
        "escape-all": "Cancel/close all menus and dialogs",
        "editor-tool-brush": "Brush (toggle mode)",
        "editor-tool-rect": "Rectangle",
        "editor-tool-eraser": "Eraser",
        "editor-tool-bucket": "Paint bucket",
        "editor-clear": "Clear",
        "image-tool-matting": "Mask editor",
        "image-tool-repaint": "Repaint",
        "image-tool-erase": "Erase",
        "image-tool-hd": "HD",
        "image-tool-expand": "Expand image",
        "image-tool-auto-subject": "Auto-detect subject",
        "image-tool-multigrid": "Grid crop",
        "image-tool-multiangle": "Control angle",
        "image-tool-annotate": "Annotate",
        "image-tool-crop": "Crop",
        "image-tool-fullscreen": "Fullscreen",
        "image-tool-download": "Download",
        "video-tool-clip": "Trim video",
        "video-tool-separate-av": "Separate audio/video",
        "video-tool-capture-frame": "Capture current frame",
        "video-tool-keying": "Chroma key",
        "video-tool-hd": "HD",
        "video-tool-fullscreen": "Fullscreen",
        "video-tool-download": "Download",
        "ms-sync-video-play": "Sync video playback",
        "audio-tool-clip": "Trim audio",
        "audio-tool-speed": "Speed",
        "audio-tool-download": "Download",
        "clip-tool-crop": "Clip crop",
        "text-tool-copy": "Copy",
        "text-tool-fullscreen": "Fullscreen",
        "panorama-scene-tool-toggle-mouse": "Mouse",
        "panorama-scene-tool-move": "Move",
        "panorama-scene-tool-scale": "Scale",
        "panorama-scene-tool-rotate": "Rotate",
        "panorama-scene-reset-view": "Reset view",
        "panorama-scene-capture": "Screenshot",
        "panorama-scene-camera-create": "Create camera bookmark",
        "panorama-scene-camera-1": "Jump to camera bookmark 1",
        "panorama-scene-camera-2": "Jump to camera bookmark 2",
        "panorama-scene-camera-3": "Jump to camera bookmark 3",
        "panorama-scene-camera-4": "Jump to camera bookmark 4",
        "panorama-scene-camera-5": "Jump to camera bookmark 5",
        "panorama-scene-camera-6": "Jump to camera bookmark 6",
        "panorama-scene-camera-7": "Jump to camera bookmark 7",
        "panorama-scene-camera-8": "Jump to camera bookmark 8",
        "panorama-scene-camera-9": "Jump to camera bookmark 9",
        "panorama-scene-camera-0": "Jump to camera bookmark 10",
        "panorama-scene-camera-save-1": "Save current view to camera bookmark 1",
        "panorama-scene-camera-save-2": "Save current view to camera bookmark 2",
        "panorama-scene-camera-save-3": "Save current view to camera bookmark 3",
        "panorama-scene-camera-save-4": "Save current view to camera bookmark 4",
        "panorama-scene-camera-save-5": "Save current view to camera bookmark 5",
        "panorama-scene-camera-save-6": "Save current view to camera bookmark 6",
        "panorama-scene-camera-save-7": "Save current view to camera bookmark 7",
        "panorama-scene-camera-save-8": "Save current view to camera bookmark 8",
        "panorama-scene-camera-save-9": "Save current view to camera bookmark 9",
        "panorama-scene-camera-save-0": "Save current view to camera bookmark 10"
      })
    })
  }),
  saveDialog: Object.freeze({
    title: "Save Canvas",
    subtitle: "The file will be saved to the user/Canvas Project/ folder",
    placeholder: "Enter a canvas name...",
    cancel: "Cancel",
    save: "Save"
  }),
  about: Object.freeze({
    title: "SHUO Canvas",
    tagline: "Create your world.",
    author: "Author:",
    authorName: "Ashuo",
    bilibili: "Visit Bilibili profile",
    footer: "© 2026 SHUO Canvas · 阿硕画布. All rights reserved."
  }),
  appPanels: Object.freeze({
    tutorial: Object.freeze({
      apiOnboarding: "Beginner API integration tutorial",
      bernini: "RH Bernini model detailed usage guide",
      usage: "Getting started 1",
      storyStudio: "Story Studio tutorial",
      replacementStudioFullTutorial: "Replacement Studio complete tutorial",
      fullAudioReferenceVideoGeneration: "Full audio-reference video generation tutorial",
      rhAiAppComfyUiIntegration: "RH AI app / local and cloud ComfyUI integration tutorial",
      scail2VoiceStudioFilmRemix: "New efficient film remix workflow with Scail2 + Voice Studio demo",
      browserNode: "Browser node usage",
      seedanceLineCamera: "Seedance 2.0 line-controlled camera movement workflow",
      latest: "Game production demo tutorial",
      scail2FullReview: "Scail2 full review and usage guide",
      characterReplacement: "Film character replacement demo",
      panorama: "Character/scene consistency 360° panorama extraction and SD2.0 generation demo"
    }),
    aiAssistant: Object.freeze({
      responses: Object.freeze({
        idea: "This is a strong idea. We can combine these elements together.",
        prompt: "Got it. I will draft a reusable prompt for you first.",
        connect: "Would you like me to connect this result to the next node automatically?",
        optimize: "No problem. I am refining the description for your selected area."
      }),
      greeting: "Hi, I am your AI creation assistant. Share an idea and we can start creating."
    }),
    emptyHint: Object.freeze({
      textNode: "Generate text",
      imageNode: "Generate image",
      videoNode: "Generate video"
    }),
    devMode: Object.freeze({
      entered: "Developer mode enabled",
      exited: "Returned to regular mode",
      enterAction: "enable developer mode",
      exitAction: "return to regular mode",
      clickHint: "Click {count} more times to {action}"
    })
  }),
  taskCenter: Object.freeze({
    ariaLabel: "Tasks",
    title: "Tasks",
    collapse: "Collapse task center",
    expand: "Expand task center",
    clearDone: "Clear done",
    summary: "Active {active} · Failed {failed} · Done {done}",
    unavailableSummary: "Desktop background tasks are unavailable in this environment",
    unavailable: "Desktop tasks unavailable",
    empty: "No background tasks",
    sections: Object.freeze({
      active: "In progress",
      failed: "Failed",
      done: "Recently done"
    }),
    taskKinds: Object.freeze({
      dreaminaVideo: "Dreamina video generation",
      runningHubWorkflow: "RunningHub workflow",
      videoPoster: "Generate video poster",
      audioWaveform: "Generate audio waveform",
      videoFirstFrame: "Extract first video frame",
      videoCut: "Video trim",
      videoReverse: "Video reverse",
      audioCut: "Audio trim",
      videoAudioSeparate: "Audio separation",
      videoCompose: "Video compose",
      videoAudioMux: "Final video mux",
      audioCompose: "Audio merge",
      audioVoiceCompose: "Voice Studio compose",
      mediaTask: "Media task"
    }),
    statuses: Object.freeze({
      waiting: "Waiting",
      processing: "Processing",
      complete: "Complete",
      failed: "Failed",
      cancelled: "Cancelled",
      fallback: "Task"
    }),
    actions: Object.freeze({
      cancel: "Cancel",
      reveal: "Reveal file",
      copyError: "Copy error"
    }),
    duration: "Elapsed {duration}",
    cancelledMessage: "Cancelled",
    cancelFailed: "Failed to cancel task",
    revealFailed: "Failed to reveal file",
    copyFailed: "Failed to copy",
    copySuccess: "Error details copied"
  }),
  nodeToolbar: Object.freeze({
    faceDetect: Object.freeze({
      defaultTooltip: "APIMart Seedance 2.0 face detection",
      passedTooltip: "APIMart Seedance 2.0 face detection passed",
      failedTooltip: "Face detection failed",
      failedTooltipWithError: "Face detection failed: {error}",
      processingTooltip: "Face detection in progress",
      missingUrlError: "No detectable asset URL found",
      missingUrlToast: "Face detection failed: no detectable asset URL found",
      apiKeyMissing: "APIMART API Key is not configured",
      running: "Running APIMart face detection...",
      passedToast: "Face detection passed. Seedance 2.0 input URL recorded.",
      failedFallback: "APIMart face detection failed",
      failedToastWithError: "Face detection failed: {error}"
    }),
    autoSubject: Object.freeze({
      buttonTooltip: "Auto-detect subject",
      modeLabel: "RH Matting",
      modeDesc: "RunningHub workflow · One-click subject detection",
      chooseMode: "Choose detection mode",
      chooseBackground: "Choose background color",
      backgrounds: Object.freeze({
        transparent: "Transparent background",
        white: "White background",
        black: "Black background",
        gray: "Gray background"
      }),
      cancelledName: "Subject detection image (cancelled)",
      cancelledOutput: "Model: {model}\nStatus: cancelled",
      cancelledToast: "Subject detection task cancelled",
      cancelTooltip: "Cancel subject detection",
      invalidBackground: "Invalid background parameter",
      outputText: "Model: {model}\nBackground: {background}",
      noProcessableImage: "No processable image",
      apiKeyMissing: "RunningHUB API Key is not configured",
      sourceNodeMissing: "Source node not found",
      processingName: "Subject detection image (processing)",
      uploadFailed: "Image upload failed",
      createTaskFailed: "Failed to create task",
      missingResultImage: "Task completed but did not return an image",
      resultName: "Subject detection image",
      failedName: "Subject detection image (failed)",
      unknownError: "Unknown error",
      outputTextWithError: "{outputText}\nError: {error}",
      completed: "Subject detection complete ({background})",
      failedWithError: "Subject detection failed: {error}"
    }),
    storyboardScriptAction: Object.freeze({
      videoDefaultPrompt: "Generate a storyboard script from this video and automatically split it into shots based on the content.",
      missingSource: "Select a connectable text or video node first",
      invalidConnection: "This node cannot connect to a storyboard script node",
      missingAddNode: "Failed to create storyboard script node: Store does not support addNode",
      connectFailed: "Failed to connect storyboard script node"
    }),
    videoFrameInterpolation: Object.freeze({
      modelLabel: "RH video frame interpolation",
      processingName: "Frame-interpolated video (processing)",
      resultName: "Frame-interpolated video",
      failedName: "Frame-interpolated video (failed)",
      cancelledName: "Frame-interpolated video (cancelled)",
      outputText: "Model: {model}\nStatus: {status}",
      outputTextWithError: "{outputText}\nError: {error}",
      status: Object.freeze({
        processing: "processing",
        complete: "complete",
        failed: "failed",
        cancelled: "cancelled"
      }),
      cancelTooltip: "Cancel frame interpolation",
      cancelledToast: "Frame interpolation task cancelled",
      taskCancelled: "Task cancelled",
      sourceNodeMissing: "Source node not found",
      noProcessableVideo: "No processable video",
      apiKeyMissing: "RunningHUB API Key is not configured",
      uploading: "Uploading video to RunningHub...",
      uploadNoDownloadUrl: "RunningHub upload did not return download_url",
      processingToast: "Processing frame interpolation...",
      taskIdMissing: "Task ID was not returned",
      missingOutputUrl: "No usable output video URL found",
      localSaveFailed: "Generated but local save failed",
      successToast: "Frame interpolation complete",
      failedWithError: "Frame interpolation failed: {error}"
    }),
    videoHd: Object.freeze({
      choosePlan: "Choose HD Plan",
      modelFallback: "Video HD",
      promptLabel: "Video HD restoration",
      options: Object.freeze({
        sharp: Object.freeze({
          title: "HD Sharpen",
          desc: "RunningHub workflow · Enhance video sharpness"
        }),
        quality: Object.freeze({
          title: "HD Quality",
          desc: "RunningHub workflow · Improve video quality"
        }),
        basic: Object.freeze({
          title: "Basic HD",
          desc: "RunningHub workflow · One-click video restoration"
        })
      }),
      processingName: "HD video (processing)",
      resultName: "HD video",
      failedName: "HD video (failed)",
      cancelledName: "HD video (cancelled)",
      outputText: "Model: {model}\nPrompt: {prompt}",
      outputTextWithStatus: "{outputText}\nStatus: {status}",
      outputTextWithError: "{outputText}\nError: {error}",
      cancelledOutput: "Model: {model}\nPrompt: {prompt}\nStatus: {status}",
      status: Object.freeze({
        cancelled: "cancelled"
      }),
      cancelTooltip: "Cancel video HD",
      cancelledToast: "Video HD task cancelled",
      taskCancelled: "Task cancelled",
      sourceNodeMissing: "Source node not found",
      noProcessableVideo: "No processable video",
      apiKeyMissing: "RunningHUB API Key is not configured",
      uploading: "Uploading video to RunningHub...",
      uploadNoDownloadUrl: "RunningHub upload did not return download_url",
      processingToast: "Processing video HD...",
      taskIdMissing: "Task ID was not returned",
      missingOutputUrl: "No usable output video URL found",
      localSaveFailed: "Generated but local save failed",
      successToast: "Video HD complete",
      failedWithError: "Video HD failed: {error}"
    }),
    imageHd: Object.freeze({
      choosePlan: "Choose HD Plan",
      chooseResolution: "Choose upscale resolution",
      modelLabel: "RH image upscaler",
      modelDesc: "RunningHub workflow · One-click image upscaling",
      promptLabel: "Image upscaling",
      processingName: "HD image (processing)",
      resultName: "HD image",
      failedName: "HD image (failed)",
      cancelledName: "HD image (cancelled)",
      outputText: "Model: {model}\nPrompt: {prompt}\nResolution: {resolution}",
      outputTextWithStatus: "{outputText}\nStatus: {status}",
      outputTextWithError: "{outputText}\nError: {error}",
      status: Object.freeze({
        cancelled: "cancelled"
      }),
      cancelTooltip: "Cancel image upscaling",
      cancelledToast: "Image upscaling task cancelled",
      taskCancelled: "Task cancelled",
      noProcessableImage: "No processable image",
      apiKeyMissing: "RunningHUB API Key is not configured",
      sourceNodeMissing: "Source node not found",
      uploadEmpty: "Image upload failed: processInputImages returned an empty array",
      uploadFailed: "Image upload failed",
      taskIdMissing: "Task ID was not returned",
      missingResultImage: "Task completed but did not return an image",
      unknownError: "Unknown error",
      successToast: "Image upscaling complete",
      failedWithError: "Image upscaling failed: {error}"
    }),
    midjourney: Object.freeze({
      modelLabel: "APIMart Midjourney",
      variationAction: "MJ variations",
      hdAction: "MJ HD",
      chooseVariation: "Choose variation",
      variationWeakAction: "Weak variation",
      variationMediumAction: "Medium variation",
      variationStrongAction: "Strong variation",
      variationProcessingName: "MJ variations (processing)",
      hdProcessingName: "MJ HD (processing)",
      variationResultName: "MJ variations",
      hdResultName: "MJ HD image",
      failedName: "MJ action (failed)",
      cancelledName: "MJ action (cancelled)",
      outputText: "Model: {model}\nAction: {action}\nSource: image {index}",
      outputTextWithStatus: "{outputText}\nStatus: {status}",
      outputTextWithError: "{outputText}\nError: {error}",
      status: Object.freeze({
        cancelled: "cancelled"
      }),
      busy: "MJ action is already processing",
      missingContext: "This image has no usable Midjourney action metadata",
      hdUnsupported: "Midjourney V8.2 does not support MJ HD",
      hdCustomIdMissing: "Missing MJ HD button metadata. Generate the Midjourney image again and retry.",
      sourceNodeMissing: "Source node not found",
      missingResultImage: "Task completed but did not return an image",
      unknownError: "Unknown error",
      successToast: "MJ action complete",
      pendingToast: "MJ task is still processing. The task node was kept and can be resumed later.",
      cancelledToast: "MJ action cancelled",
      failedWithError: "MJ action failed: {error}"
    }),
    panorama360: Object.freeze({
      modelLabel: "RH one-click 360 panorama",
      processingName: "360 panorama (processing)",
      resultName: "360 panorama",
      failedName: "360 panorama (failed)",
      cancelledName: "360 panorama (cancelled)",
      outputText: "Model: {model}",
      outputTextWithStatus: "{outputText}\nStatus: {status}",
      outputTextWithError: "{outputText}\nError: {error}",
      status: Object.freeze({
        cancelled: "cancelled"
      }),
      cancelTooltip: "Cancel 360 panorama",
      cancelledToast: "360 panorama task cancelled",
      busy: "360 panorama task is already processing",
      noProcessableImage: "No processable image",
      apiKeyMissing: "RunningHUB API Key is not configured",
      sourceNodeMissing: "Source node not found",
      uploadFailed: "Image upload failed",
      createTaskFailed: "Failed to create task",
      missingResultImage: "Task completed but did not return an image",
      unknownError: "Unknown error",
      successToast: "360 panorama complete",
      pendingToast: "RunningHub is still generating. The task was kept and will continue polling.",
      failedWithError: "360 panorama generation failed: {error}"
    }),
    multigrid: Object.freeze({
      chooseGrid: "Choose grid",
      grid4Title: "4-grid",
      grid4Desc: "2×2 grid",
      grid9Title: "9-grid",
      grid9Desc: "3×3 grid",
      grid16Title: "16-grid",
      grid16Desc: "4×4 grid",
      grid25Title: "25-grid",
      grid25Desc: "5×5 grid",
      crop: "Crop",
      create: "Create",
      nodeMissing: "Node data is missing",
      storyboardName: "Grid storyboard",
      storyboardCreated: "Storyboard node created",
      unknownError: "Unknown error",
      storyboardFailed: "Failed to create storyboard: {error}",
      cropTooltip: "Crop into {count} tiles",
      cropLoading: "Loading...",
      cropSuccess: "Created {count} cropped nodes",
      cropEmpty: "Crop failed. No nodes were created.",
      createTooltip: "Create {cols}×{rows} storyboard",
      createBusy: "Processing...",
      customTitle: "Custom",
      customDesc: "Any size from 1×1 to 5×5",
      chooseSpec: "Choose size",
      customBusy: "Creating {cols}×{rows}",
      customPreview: "Click to create a {cols}×{rows} storyboard",
      customMenuTitle: "Custom grid",
      customAria: "Custom grid size",
      cellAria: "Create {cols}×{rows} storyboard"
    }),
    comment: Object.freeze({
      fontSize: "Font size",
      fontDec: "Decrease font size",
      fontInc: "Increase font size",
      convertMarkdown: "Convert to Markdown note",
      convertPlainText: "Switch to plain note",
      markdownConverted: "Converted to Markdown note",
      plainTextConverted: "Switched to plain note",
      textColor: "Text color",
      bgColor: "Background color",
      deleteNode: "Delete node",
      jumpShortcut: "Jump shortcut",
      jumpShortcutRow: "Shortcut",
      jumpClear: "Clear shortcut",
      jumpClearAria: "Clear jump shortcut",
      jumpHintRecording: "Press a shortcut, Esc to cancel",
      jumpEmpty: "Not set",
      jumpUpdated: "Jump shortcut updated",
      jumpCleared: "Jump shortcut cleared",
      jumpZoom: "Zoom",
      jumpTooltip: "Jump shortcut | {shortcut}",
      jumpConflictGlobal: "Shortcut conflict | Already used by \"{label}\"",
      jumpConflictOther: "Shortcut conflict | Already used by another comment note",
      textColorLabel: Object.freeze({
        white: "White text",
        red: "Red text",
        orange: "Orange text",
        yellow: "Yellow text",
        green: "Green text",
        blue: "Blue text",
        purple: "Purple text",
        cyan: "Cyan text",
        pink: "Pink text",
        gray: "Gray text"
      }),
      bgColorLabel: Object.freeze({
        transparent: "Remove background",
        white: "White background",
        red: "Red background",
        orange: "Orange background",
        yellow: "Yellow background",
        green: "Green background",
        blue: "Blue background",
        purple: "Purple background",
        cyan: "Cyan background",
        gray: "Gray background"
      })
    }),
    common: Object.freeze({
      developmentSuffix: "{text} (In development)",
      cancelTask: "Cancel task",
      taskCancelled: "Task cancelled",
      upload: "Upload",
      download: "Download",
      fullscreen: "Fullscreen",
      resetSize: "Reset size",
      nodeMissing: "Node data is missing",
      noDownloadableImage: "No downloadable image",
      noDownloadableVideo: "No downloadable video",
      imageSaved: "Image saved: {filename}",
      videoSaved: "Video saved: {filename}",
      audioSaved: "Audio saved: {filename}"
    }),
    audio: Object.freeze({
      clip: "Trim audio",
      separate: "Separate vocals",
      voiceStudio: "Voice Studio",
      speed: "Speed"
    }),
    image: Object.freeze({
      matting: "Mask editor",
      repaint: "Repaint",
      erase: "Erase",
      hd: "Enhance",
      mjVariation: "MJ variations",
      mjHd: "MJ HD",
      expand: "Expand image",
      autoSubject: "Auto-detect subject",
      faceDetectTooltip: "APIMart Seedance 2.0 face detection",
      faceDetect: "Face detection",
      panorama360: "One-click 360 panorama",
      multigrid: "Grid crop",
      multiangle: "Control angle",
      annotate: "Annotate",
      crop: "Crop",
      more: "More",
      moreTools: "More tools",
      customize: "Customize tools",
      customizeTip: "Drag highlighted buttons to move them outside or into More",
      done: "Done",
      doneCustomize: "Done customizing",
      generate: "Generate",
      generating: "Generating...",
      repaintCancelledName: "Repaint result (cancelled)",
      repaintCancelledOutput: "Model: image repaint\nStatus: cancelled",
      repaintCancelledToast: "Repaint task cancelled",
      cancelRepaint: "Cancel repaint",
      eraseCancelledName: "Erase result (cancelled)",
      eraseCancelledOutput: "Model: image erase\nStatus: cancelled",
      eraseCancelledToast: "Erase task cancelled",
      cancelErase: "Cancel erase",
      expandCancelledName: "Expanded image (cancelled)",
      expandCancelledOutput: "Model: image expansion\nStatus: cancelled",
      expandCancelledToast: "Image expansion task cancelled",
      cancelExpand: "Cancel image expansion",
      rotateCancelledName: "Rotated image (cancelled)",
      rotateCancelledOutput: "Model: control angle\nStatus: cancelled",
      rotateCancelledToast: "Control angle task cancelled",
      cancelRotate: "Cancel control angle",
      taskCancelled: "Task cancelled",
      localSaveGeneratedFailed: "Generated but local save failed"
    }),
    video: Object.freeze({
      clip: "Trim video",
      voiceReplace: "Voice Studio",
      reverse: "Reverse video",
      reverseBusyTooltip: "{tooltip}...",
      reverseUnavailable: "Video reverse is unavailable",
      reverseFailed: "Video reverse failed",
      reverseFailedWithError: "Video reverse failed: {error}",
      keying: "Keying",
      storyboardScript: "Storyboard script",
      faceDetectTooltip: "APIMart Seedance 2.0 face detection",
      faceDetect: "Face detection",
      hd: "Enhance",
      frameInterpolation: "Frame interpolation",
      remove: "Video erase",
      separateAv: "Separate audio/video",
      more: "More",
      moreTools: "More tools",
      customize: "Customize tools",
      customizeTip: "Drag highlighted buttons to move them outside or into More",
      exitCurrentEditMode: "Exit the current video editing mode first",
      exitKeyingMode: "Exit keying mode first",
      exitClipMode: "Exit video trim mode first",
      cancelKeyingTask: "Cancel keying task",
      cancelRemoveTask: "Cancel video erase",
      extractKeyframes: "Extract keyframes",
      extractUnavailable: "Keyframe extraction is unavailable",
      extractPreparing: "Extract keyframes: preparing",
      extractProgress: "Extract keyframes: {progress}",
      extractStarted: "Analyzing scenes and extracting keyframes...",
      extractNoSegments: "No scene changes detected",
      extractNoKeyframes: "Smart clip did not create valid keyframes",
      extractComplete: "Smart clip complete. Created {count} keyframes",
      smartClipFailed: "Smart clip failed",
      extractFailed: "Failed to extract keyframes: {error}",
      invalidVideoSource: "Invalid video source",
      analyzingScenes: "Analyzing video scenes...",
      sourceNodeMissing: "Source node not found",
      sceneNodeName: "Scene {index}",
      sceneNodesCreated: "Created {count} scene nodes",
      smartClipFailedRetry: "Smart clip failed. Please try again.",
      durationLimit: "Videos must be {seconds} seconds or shorter. Trim the video first.",
      hdVipRequired: "This HD model requires VIP access",
      saveInvalidUrl: "Save failed: invalid video URL",
      saveEmptyDownload: "Save failed: downloaded video is empty",
      saveMalformed: "Local save failed: invalid response format",
      savingLocal: "Saving locally…",
      localSaveFailed: "Local save failed"
    }),
    text: Object.freeze({
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Copy failed",
      noTextToCopy: "No text to copy",
      clearEmptyLines: "Clear empty lines",
      storyboardScript: "Storyboard script",
      fullscreen: "Fullscreen",
      noTextToClean: "No text to clean",
      noBlankLines: "No empty lines detected",
      clearedBlankLines: "Empty lines cleared",
      close: "Close",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      paragraph: "Body text",
      bold: "Bold",
      italic: "Italic",
      unorderedList: "Unordered list",
      orderedList: "Ordered list",
      divider: "Divider"
    })
  }),
  videoClip: Object.freeze({
    controls: Object.freeze({
      cancel: "Cancel",
      done: "Done",
      start: "Start",
      loading: "Loading..."
    }),
    errors: Object.freeze({
      videoNodeMissing: "Video node not found",
      invalidSource: "Invalid video source",
      smartClipEndpointMissing: "Backend endpoint missing: /api/v2/video/smart_clip (restart server.py)",
      cutEndpointMissing: "Backend endpoint missing: /api/v2/video/cut (restart server.py)",
      startFailed: "Failed to start",
      startMissingJobId: "Failed to start: missing jobId",
      exitedClipMode: "Exited trim mode",
      smartClipFailed: "Smart clip failed",
      sourceNodeMissing: "Source node not found",
      cutFailed: "Video trim failed"
    }),
    smartClip: Object.freeze({
      stages: Object.freeze({
        prepare: "Preparing",
        detect: "Analyzing",
        cut: "Trimming",
        frame: "Extracting frames",
        processing: "Processing"
      }),
      preparing: "Preparing...",
      progressWithTotal: "{stage} {done}/{total} ({pct}%)",
      progressPercent: "{stage} ({pct}%)",
      extractingFrame: "Extracting frame {current}/{total}",
      keyframeNodeName: "Smart clip keyframe {index}",
      segmentNodeName: "Smart clip {index}",
      startedKeyframes: "Analyzing scenes and extracting keyframes...",
      startedSegments: "Analyzing scenes and trimming video clips...",
      noSegments: "No scene changes detected",
      noKeyframes: "Smart clip did not create valid keyframes",
      noResults: "Smart clip did not create valid clips",
      completeKeyframes: "Smart clip complete. Created {count} keyframes",
      completeSegments: "Smart clip complete. Created {count} clips",
      failedWithError: "Smart clip failed: {error}"
    }),
    helper: Object.freeze({
      cancel: "Cancel",
      rangePlayPause: "Play/pause selected range",
      moveSelectionByFrame: "Move trim range frame by frame",
      moveSelectionByLargeStep: "Move trim range by {frames} frames",
      setInOut: "Set in/out points",
      fineTuneInPoint: "Fine-tune in point ({frames} frame)",
      fineTuneOutPoint: "Fine-tune out point ({frames} frame)",
      wheelKey: "Wheel",
      wheelMove: "Same as arrow keys (scroll up = ←)",
      clickKey: "Click",
      jumpPlayhead: "Move playhead",
      doubleClickRangeKey: "Double-click range",
      resetDefaultRange: "Reset to default {seconds}s"
    }),
    smartPanel: Object.freeze({
      smartClipButton: "Smart clip",
      extractFrame: "Extract video frame",
      title: "Smart Clip Settings",
      output: "Output",
      outputTip: "Extract video clips: create video nodes\nExtract keyframes: take the first frame of each segment and create image nodes",
      outputSegments: "Extract video clips",
      outputKeyframes: "Extract keyframes",
      mode: "Mode",
      modeTip: "Stable: cleaner results for talking-head or cinematic footage\nBalanced: cuts more shots\nSensitive: better for fast edits and montages",
      modeStable: "Stable",
      modeBalanced: "Balanced",
      modeSensitive: "Sensitive",
      fps: "Frame rate",
      fpsTip: "16 fps is faster, 24 fps is versatile, 30 fps is smoother but slower",
      fpsValue: "{fps} fps",
      maxSegments: "Max output",
      maxSegmentsTip: "Generate up to {max} clips to avoid flooding the canvas\nDrag the number left or right, or click to type",
      maxSegmentsAria: "Maximum generated segments",
      segmentUnit: "clips",
      hintDefault: "Very dense shots will be downgraded automatically so results can still be generated",
      hintKeyframes: "Keyframe mode creates an image from the first frame of each segment"
    }),
    cut: Object.freeze({
      processing: "Trimming video on the backend...",
      videoFallback: "Video",
      newNodeName: "Trimmed from {name}",
      success: "Video trimmed. A new file was created.",
      failedWithError: "Video trim failed: {error}",
      cancelled: "Video trim cancelled"
    })
  }),
  nodeMenu: Object.freeze({
    addNodes: "Add nodes",
    addResources: "Add resources",
    upload: "Upload",
    text: "Text",
    image: "Image",
    video: "Video",
    testVideo: "Test video",
    audio: "Audio",
    mediaClip: "Clip",
    collage: "Collage",
    panoramaScene: "3D Stage",
    panorama360: "360 Panorama",
    storyboardScript: "Storyboard"
  }),
  storyboard: Object.freeze({
    toolbar: Object.freeze({
      toggleAspect: "Switch aspect ratio",
      aspectLabel: "Aspect {aspectRatio}",
      toggleGrid: "Switch grid",
      gridLabel: "Grid {cols}×{rows}",
      adjustSplitLines: "Adjust split lines",
      applying: "Applying",
      applyingSplitLines: "Applying split lines",
      finishAdjust: "Finish adjustment",
      finishAdjustSplitLines: "Finish split-line adjustment",
      edit: "Edit storyboard",
      exitEdit: "Exit storyboard editing",
      editShort: "Edit",
      exitEditShort: "Exit",
      compose: "Compose",
      clear: "Clear",
      expand: "Expand",
      collapse: "Collapse",
      customGridHint: "Drag split lines to adjust the crop. Press Esc to cancel.",
      editHint: "Drag cells to swap them, or drag out to create a new image.",
      enterEditHint: "Double-click to edit storyboard",
      customGridPartialRefreshFailed: "Custom split saved, but some cells failed to refresh."
    }),
    cell: Object.freeze({
      loadFailed: "Load failed",
      dropImage: "Drop image"
    }),
    imageRuntime: Object.freeze({
      sourceImageLoadFailed: "Source image failed to load"
    })
  }),
  storyboardScript: Object.freeze({
    defaultName: "Storyboard",
    loading: "Generating storyboard script",
    mediaModeAria: "Storyboard script generation mode",
    mediaMode: Object.freeze({
      image: "Image prompts",
      video: "Video prompts"
    }),
    viewModeAria: "Storyboard script view",
    viewMode: Object.freeze({
      list: "List view",
      card: "Card view"
    }),
    promptPlaceholder: "Enter a story, copy, or storyboard requirements",
    generate: "Generate",
    advancedSettings: "Advanced settings",
    selectionCount: "{selected} selected, {total} shots total",
    selectAllAria: "Select all shots",
    selectRowAria: "Select shot {index}",
    shotFallback: "Shot {index}",
    imageBatchGroupName: "Storyboard image generation",
    imageNodeName: "Storyboard {shot}",
    columns: Object.freeze({
      shotNo: "Shot",
      duration: "Duration",
      shotSize: "Shot size",
      scene: "Scene",
      visualDescription: "Visual description",
      character: "Character",
      characterDescription: "Character description",
      characterAction: "Character action",
      emotion: "Emotion",
      characterImage: "Character image",
      reference: "Reference",
      imagePrompt: "Image prompt",
      videoPrompt: "Video prompt",
      dialogue: "Dialogue",
      soundEffect: "Sound effect"
    }),
    toolbar: Object.freeze({
      editMode: "Edit/generate storyboard",
      exitEdit: "Exit editing",
      generateSelected: "Generate selected shots",
      fullscreen: "Fullscreen",
      download: "Download",
      downloadTable: "Download table",
      queue: "Add to queue"
    }),
    fullscreen: Object.freeze({
      close: "Close fullscreen",
      aria: "Storyboard script fullscreen view",
      meta: "{count} shots · {media} · {view}"
    }),
    empty: Object.freeze({
      title: "No storyboard script yet",
      hint: "Select the node, then enter a story or copy in the prompt bar to generate one."
    }),
    toasts: Object.freeze({
      generateScriptFirst: "Generate a storyboard script first",
      noFullscreenData: "No storyboard script available for fullscreen",
      missingPromptOrReference: "Enter a story, copy, or connect reference images/videos before generating",
      selectStoryboardsFirst: "Select the shots to generate first",
      missingImagePrompt: "Selected shots are missing image prompts. Complete them before generating.",
      createdAndStartedImageNodes: "Created and started {count} image nodes",
      createdImageNodes: "Created {count} image generation nodes",
      autoStartPartialFailed: "Some image nodes were created, but automatic generation did not start",
      noDownloadData: "No storyboard script available to download",
      downloadedTable: "Storyboard script table downloaded"
    }),
    errors: Object.freeze({
      invalidJsonTooManyFrames: "The model did not return valid storyboard JSON. Try again or reduce the number of video slices.",
      invalidJsonSwitchModel: "The model did not return valid storyboard JSON. Try again or switch the Volcengine model.",
      videoPreprocessFailed: "Video storyboard preprocessing failed",
      generationFailed: "Storyboard script generation failed"
    })
  }),
  promptPresets: Object.freeze({
    userInputPill: "Prompt",
    triggerLabel: "Prompt presets (or type /)",
    templatePlaceholder: "Example: generate full-body three views with front, 45-degree side, back views, clean background, character reference",
    customGroupTitle: "User custom",
    customGroupDesc: "Saved custom presets",
    customPresetFallback: "Custom preset",
    customPresetFallbackWithIndex: "Custom preset {index}",
    presetDescFallback: "Add a description and prompt template",
    slash: Object.freeze({
      header: "Choose a preset",
      subItemsDesc: "Includes multiple options",
      customTitle: "Custom presets",
      customBadge: "Manage",
      customDesc: "Edit or create presets for this node"
    }),
    nodeTypes: Object.freeze({
      image: "Image node",
      text: "Text node",
      video: "Video node",
      audio: "Audio node",
      storyboardScript: "Storyboard script node",
      node: "Node"
    }),
    tabs: Object.freeze({
      text: Object.freeze({
        label: "Text presets"
      }),
      image: Object.freeze({
        label: "Image presets"
      }),
      video: Object.freeze({
        label: "Video presets"
      }),
      audio: Object.freeze({
        label: "Audio presets"
      }),
      storyboardScript: Object.freeze({
        label: "Storyboard script presets"
      })
    }),
    manager: Object.freeze({
      title: "User presets",
      desc: "Manage generation presets for {nodeType}",
      close: "Close",
      new: "New",
      emptyList: "Click New on the left to create a custom preset.",
      emptyDetail: "Select a preset on the left, or click New to start editing.",
      deleteAria: "Delete {title}"
    }),
    editor: Object.freeze({
      name: "Name",
      namePlaceholder: "Preset name",
      desc: "Description",
      descPlaceholder: "Describe when this preset is useful",
      template: "Prompt template",
      insertPrompt: "Insert prompt field content",
      save: "Save",
      saving: "Saving...",
      titleRequired: "Enter a preset name",
      templateRequired: "Enter preset content",
      saved: "Custom preset saved",
      saveFailed: "Failed to save custom preset",
      duplicateUserInput: "A preset can include the prompt field only once"
    }),
    triggerModes: Object.freeze({
      aria: "Preset trigger mode",
      label: "Mode:",
      direct: "Run directly",
      insertPrompt: "Add to prompt"
    }),
    thumbnail: Object.freeze({
      upload: "Upload thumbnail",
      updated: "Thumbnail updated. Save to apply it.",
      chooseImage: "Choose an image file",
      readFailed: "Failed to read thumbnail",
      uploadFailed: "Failed to upload thumbnail"
    }),
    delete: Object.freeze({
      deleted: "Custom preset deleted",
      failed: "Failed to delete custom preset"
    }),
    emptyInput: Object.freeze({
      image: "Enter a prompt or add a reference image",
      panorama: "Enter a scene or add a reference image"
    }),
    presets: Object.freeze({
      sceneReferenceGroup: Object.freeze({
        title: "Scene reference",
        desc: "Generate scene multi-views and panoramas in one click"
      }),
      sceneFourView: Object.freeze({
        title: "Scene four views",
        desc: "Generate scene multi-views in one click",
        template: "{用户输入}, create a four-view scene reference sheet with no characters unless requested. Include a top plan view, a 45-degree axonometric view, and multiple orthographic elevation views. Keep the same space, materials, props, and lighting across all panels."
      }),
      sceneNineView: Object.freeze({
        title: "Scene nine views",
        desc: "Nine continuous multi-view design panels for one scene",
        template: "User description: {用户输入 || the scene shown in the reference image}\nCreate a 3x3 multi-view scene design sheet for the same location, not nine different locations. Keep layout, major objects, materials, and lighting consistent. Show front wide view, entrance wide view, main subject medium view, main subject closeup, left 45-degree view, right 45-degree view, low-angle view, high-angle view, and rear reverse view. Add concise English view labels only."
      }),
      panorama360: Object.freeze({
        title: "360° seamless panorama",
        desc: "Generate a seamless 360° panorama for VR viewing",
        imageInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless wrap-around environment based on the reference image scene {用户输入}",
        textInputTemplate: "360-degree equirectangular panorama, spherical panorama for VR viewing, seamless wrap-around environment. Scene: {用户输入}"
      }),
      minimaxH3Group: Object.freeze({
        title: "Minimax H3",
        desc: "Character-replacement prompt presets"
      }),
      minimaxH3FullCharacterReplacement: Object.freeze({
        title: "Full character replacement",
        desc: "Replace the character's complete appearance and outfit"
      }),
      minimaxH3GeneralCharacterReplacement: Object.freeze({
        title: "General character replacement",
        desc: "General identity and motion-preservation prompt"
      }),
      minimaxH3UniversalObjectReplacement: Object.freeze({
        title: "Universal object replacement",
        desc: "Replace one object while preserving the scene"
      }),
      minimaxH3HandheldItemReplacement: Object.freeze({
        title: "Handheld item replacement",
        desc: "Replace a held item with a natural grip"
      }),
      minimaxH3VehicleReplacement: Object.freeze({
        title: "Vehicle replacement",
        desc: "Replace a moving vehicle with realistic motion"
      }),
      minimaxH3MultiPersonReplacement: Object.freeze({
        title: "Multi-person replacement",
        desc: "Replace two specified people in sync"
      }),
      minimaxH3ClothingOnlyReplacement: Object.freeze({
        title: "Clothing-only replacement",
        desc: "Replace only the main character's clothing"
      }),
      minimaxH3ClothingAndHairstyleReplacement: Object.freeze({
        title: "Clothing + hairstyle replacement",
        desc: "Replace only the main character's clothing and hairstyle"
      }),
      minimaxH3ReplaceOneOfTwoPeople: Object.freeze({
        title: "Replace one of two people",
        desc: "Replace only the specified person on the left"
      }),
      characterReferenceGroup: Object.freeze({
        title: "Character reference",
        desc: "Generate character multi-views, three views, face closeups, and design breakdowns"
      }),
      characterThreeView: Object.freeze({
        title: "Character three views",
        desc: "Clean three-direction character view sheet",
        template: "Create a full-body character three-view sheet for {用户输入 || a character on a neutral gray background}. Include front view, 45-degree side view, and back view. Keep outfit, hairstyle, body proportions, colors, and facial identity consistent. Clean layout, professional character design sheet."
      }),
      characterThreeViewFace: Object.freeze({
        title: "Character three views + face",
        desc: "Three-view sheet with a face closeup",
        template: "Create a full-body character three-view sheet plus one face closeup for {用户输入 || a character on a neutral gray background}. Use the left third for the upper-body face closeup and the right two thirds for front, 45-degree side, and back views. Keep identity, outfit, hairstyle, and proportions consistent."
      }),
      characterFrontBackViewFace: Object.freeze({
        title: "Front and back views + face",
        desc: "Face closeup with headless front and back full-body views",
        template: "Professional character asset page layout. The left side presents a large, highly detailed close-up portrait of the character's face, highlighting the hairstyle, eyes, skin texture, makeup, and expression. The right side presents two full-body views of the same female character, from the front and back respectively, emphasizing the clothing, silhouette, proportions, and boots. Crop out the head and do not show it, keeping the focus on the body and costume design. Use a clean, seamless white background with minimalist styling, modern editorial layout, and tidy negative space.\n\n{用户输入}"
      }),
      characterAnalysis: Object.freeze({
        title: "Character design breakdown",
        desc: "A design sheet with detail callouts",
        template: "Create a character design breakdown sheet for {用户输入 || a character on a neutral gray background}. Include front, side, and back views, face feature closeups, costume material details, accessory callouts, color swatches, and concise English annotations. Clean professional layout."
      }),
      multiGridGroup: Object.freeze({
        title: "Multi-grid",
        desc: "Generate continuous story grid images in one click"
      }),
      multiGrid4: Object.freeze({
        title: "4-grid",
        desc: "Clear setup, turn, and payoff for a one-line story",
        template: "Create a seamless 2x2 four-panel story grid. Story: {用户输入 || a short one-line story}. Keep the same character design, outfit, hairstyle, scene, lighting, and art style. Read left to right, top to bottom. Each panel should show a clear action beat with clean composition."
      }),
      multiGrid9: Object.freeze({
        title: "9-grid",
        desc: "3x3 grid with finer action and emotion progression",
        template: "Create a seamless 3x3 nine-panel story grid. Story: {用户输入 || a short story}. Keep character appearance, costume, colors, scene, and lighting consistent. Each panel advances one small action or emotion beat. Read left to right, top to bottom."
      }),
      multiGrid16: Object.freeze({
        title: "16-grid",
        desc: "4x4 grid with denser pacing and shot changes",
        template: "Create a seamless 4x4 sixteen-panel story grid. Story: {用户输入 || a short story}. Maintain strict character, prop, scene, color, and style consistency. Every panel must be the next time or cause-and-effect beat, with finer action breakdowns and sensible shot changes."
      }),
      multiGrid25: Object.freeze({
        title: "25-grid",
        desc: "5x5 long continuous story for a full sequence",
        template: "Create a seamless 5x5 twenty-five-panel continuous story grid. Story: {用户输入 || a complete short sequence}. Keep character, outfit, scene, props, lighting, and art style consistent. No time jumps. Each panel advances the story in clear left-to-right, top-to-bottom order."
      }),
      storyboardGroup: Object.freeze({
        title: "Storyboard",
        desc: "Generate storyboard panels in one click"
      }),
      storyboardVertical: Object.freeze({
        title: "Vertical storyboard",
        desc: "Vertical storyboard progressing top to bottom",
        template: "Based on {用户输入 || a short story}, create one complete vertical professional film storyboard board. Use a clean dark production-board layout with 4-6 cuts stacked top to bottom. Each cut includes a cinematic frame plus concise English notes for subject, action, description, camera, dialogue, and sound. Keep character, scene, costume, lighting, and story continuity consistent."
      }),
      storyboardVerticalScene: Object.freeze({
        title: "Vertical storyboard + scene",
        desc: "Vertical storyboard with scene setting references",
        template: "Based on {用户输入 || a short story}, create one complete vertical professional film storyboard board with an additional scene reference area. Use a clean dark production-board layout with 4-6 cuts, cinematic frames, scene thumbnails, lighting and mood references, color swatches, and concise English notes for subject, action, description, camera, dialogue, and sound."
      }),
      storyboardHorizontal: Object.freeze({
        title: "Horizontal storyboard",
        desc: "Horizontal storyboard progressing left to right",
        template: "Based on {用户输入 || a short story}, create one complete 16:9 horizontal professional storyboard sheet. Use a structured table layout where each row is one cut. Columns include cut number, duration, frame image, scene, subject, action, description, camera, dialogue, sound, and color/lighting. Keep cinematic continuity and clean readable English notes."
      }),
      storyboardHorizontalScene: Object.freeze({
        title: "Horizontal storyboard + scene",
        desc: "Horizontal storyboard with scene setting references",
        template: "Based on {用户输入 || a short story}, create one complete 16:9 horizontal professional storyboard sheet with a bottom reference section. Each row is one cut with a cinematic frame and concise English notes. Add scene concept, overall color palette, and style notes at the bottom. Keep character, costume, scene, lighting, and story continuity consistent."
      }),
      filmStoryboard: Object.freeze({
        title: "Film storyboard",
        desc: "Film shot storyboard template",
        template: "Create a professional film storyboard for {用户输入 || a cinematic short scene}. Include 8 sequential panels with shot size, camera movement, action, mood, and brief dialogue or sound notes. Maintain visual continuity, cinematic lighting, and consistent characters."
      }),
      advertisingStoryboard: Object.freeze({
        title: "Advertising storyboard",
        desc: "Advertising creative storyboard template",
        template: "Create an advertising storyboard for {用户输入 || a product or brand concept}. Use 8 sequential panels: hook, problem, product reveal, key benefit, usage moment, emotional payoff, product closeup, and closing tagline. Clean commercial composition, consistent brand style."
      }),
      gameStoryStoryboard: Object.freeze({
        title: "Game story storyboard",
        desc: "Game story performance storyboard template",
        template: "Create a game cinematic storyboard for {用户输入 || a dramatic game story beat}. Use 8 sequential panels with establishing shot, character entrance, conflict reveal, action beat, reaction shot, skill or item closeup, climax, and ending frame. Keep UI-free cinematic game art style."
      }),
      sportsTrainingStoryboard: Object.freeze({
        title: "Sports training storyboard",
        desc: "Sports training action storyboard template",
        template: "Create a sports training storyboard for {用户输入 || a training routine}. Use 8 panels showing warmup, posture setup, key movement phases, correction notes, peak action, recovery, and final result. Clear athletic motion, readable arrows, and consistent coach/athlete design."
      }),
      animationStoryboard: Object.freeze({
        title: "Animation storyboard",
        desc: "Animation shot storyboard template",
        template: "Create an animation storyboard for {用户输入 || a charming animated story}. Use 8 panels with clear acting poses, readable silhouettes, emotion progression, simple dialogue bubbles, and consistent character design. Bright cohesive color and professional preproduction layout."
      }),
      musicVideoStoryboard: Object.freeze({
        title: "MV storyboard",
        desc: "Music video visual storyboard template",
        template: "Create a music video storyboard for {用户输入 || a neon rainy-night song mood}. Use 8 panels with performance shots, environment cutaways, rhythm-driven camera moves, lighting changes, dance or gesture beats, emotional closeups, and a final visual motif."
      }),
      comicStoryboardPage: Object.freeze({
        title: "Comic storyboard page",
        desc: "Comic page storyboard template",
        template: "Create a comic storyboard page for {用户输入 || a dramatic awakening scene}. Use 8 varied panels with manga-style composition, speech bubbles, speed lines, impact lettering, and a strong final hero panel. Keep pacing, character design, and visual energy consistent."
      }),
      socialShortVideoStoryboard: Object.freeze({
        title: "Social short-video storyboard",
        desc: "Short-video pacing storyboard template",
        template: "Create a social short-video storyboard for {用户输入 || a quick lifestyle transformation}. Use 8 panels: hook, relatable problem, setup, process steps, before/after contrast, satisfying result, human reaction, and final caption. Bright clean vertical-video style."
      }),
      brandPromotionStoryboard: Object.freeze({
        title: "Brand promo storyboard",
        desc: "Brand promotion visual storyboard template",
        template: "Create a premium brand promotion storyboard for {用户输入 || a modern product}. Use 8 panels with lifestyle pain point, elegant product reveal, feature demonstration, emotional use moment, detail closeups, environment beauty shot, hero product frame, and tagline."
      }),
      tutorialStoryboard: Object.freeze({
        title: "Tutorial storyboard",
        desc: "Tutorial step-by-step visual storyboard template",
        template: "Create a tutorial storyboard for {用户输入 || a practical step-by-step process}. Use 8 clear panels with numbered steps, arrows, concise labels, closeups of tools or actions, and a final result frame. Clean instructional layout and readable English annotations."
      }),
      hdFilmProductionBoard: Object.freeze({
        title: "HD film production board",
        desc: "HD film production board template",
        template: "Create a 16:9 high-definition film production board for {用户输入 || a premium vehicle performance commercial}. Include project overview, reference images, environment design, 8-shot storyboard strip, camera movement notes, color palette, lighting mood, audio tone, and post-production style."
      }),
      xianxiaGuomanStoryboard: Object.freeze({
        title: "Xianxia anime storyboard",
        desc: "Xianxia anime story storyboard template",
        template: "Create a 16:9 high-definition sci-fi xianxia anime visual development board for {用户输入 || a 30-second fantasy action sequence}. Include character model views, key environment concept, three storyboard sequences, camera movement diagrams, lighting palette, VFX keywords, and production notes."
      }),
      reverseImagePrompt: Object.freeze({
        title: "Reverse image prompt",
        desc: "Reverse-engineer Chinese and English image prompts from a reference image",
        template: "You are a professional AI image prompt reverse-engineering expert. Analyze the uploaded reference image and produce: 1. a concise visual breakdown covering subject, composition, environment, lighting, color, style, camera language, and image quality; 2. a complete Chinese prompt suitable for image generation; 3. a natural English prompt optimized for image generation; 4. a negative prompt to avoid low quality, distortion, watermark, bad anatomy, bad hands, and unwanted text. Do not invent elements that are clearly absent from the image."
      }),
      longToShort: Object.freeze({
        title: "Long-to-short V1",
        desc: "Condense long-form content into a shorter version in one click",
        template: "{用户输入}\n\nCondense the text above to about 50-70% of its original length. Preserve all direct dialogue exactly, including wording and punctuation. Remove redundant narration and excessive description, keep the plot logic clear, strengthen key emotional turns, and maintain paragraph readability. Output only the revised text."
      }),
      extractInfo: Object.freeze({
        title: "Extract characters, scenes, and props",
        desc: "Extract character, scene, and prop information from text",
        template: "{用户输入}\n\nExtract all important characters, scenes, and props from the story above. For each character, write a detailed image-generation description including facial features, body type, hairstyle, clothing, temperament, and any state changes. Then list important props and scenes. Separate entries with --- and output only the extracted information."
      }),
      formatShortDrama: Object.freeze({
        title: "Format short-drama prompts",
        desc: "Convert a novel into a standard AI video prompt script",
        template: "{用户输入}\n\nConvert the story above into a standard AI short-drama video prompt script. Break it into sequential shots, keep the original plot and dialogue faithful, and for each shot write the scene, characters, action, camera movement, emotion, dialogue, sound, and visual continuity notes. Avoid adding events that are not in the source text."
      }),
      storyboardScript: Object.freeze({
        title: "Cinematic narrative storyboard script",
        desc: "Convert a novel into a standard dramatic script tailored for AI short-drama video",
        template: "{用户输入}\n\nTurn the source text into a cinematic narrative storyboard script for AI video generation. Split the story into clear shots with continuous cause-and-effect. For each shot include duration, shot size, scene, image description, character description, character action, emotion, image prompt, video prompt, dialogue, and sound. Use concrete visible actions instead of abstract emotion words. Output a clean structured script."
      }),
      storyboardScriptTimed: Object.freeze({
        title: "Cinematic narrative storyboard script - timed",
        desc: "Second-level lighting, camera movement, and sound control for AI short-drama video",
        template: "{用户输入}\n\nCreate a second-level timed cinematic storyboard script for AI video generation. Divide the content into timed shots, each with exact seconds, lighting, camera movement, action, emotion, sound, dialogue, image prompt, and video prompt. Keep continuity strict and make every video prompt describe observable motion, body mechanics, facial expression, and camera behavior."
      }),
      seedance2VideoFormat: Object.freeze({
        title: "Seedance 2.0 video format",
        desc: "Output Seedance 2.0 second-level video prompts using the user's duration or 15 seconds by default",
        template: "{用户输入}\n\nFormat the content above as a Seedance 2.0 video prompt. If the user provided a duration, use it; otherwise design a 15-second video. Write time-coded segments with subject, scene, action, camera movement, lighting, style, sound, and transition notes. Keep the prompt concise, concrete, and directly usable for video generation."
      })
    })
  }),
  webPreview: Object.freeze({
    tabs: Object.freeze({
      defaultTitle: "New tab",
      loginWindow: "Login window"
    }),
    nodeName: "Browser",
    addressPlaceholder: "Enter a URL or search",
    status: Object.freeze({
      default: "Enter a URL or search, then press Enter to preview",
      loading: "Loading page...",
      loaded: "Page loaded",
      refreshing: "Refreshing page...",
      loadFailed: "Page failed to load",
      blocked: "Navigation blocked",
      nativeUnsupported: "Native browser is not supported in this environment"
    }),
    toolbar: Object.freeze({
      back: "Back",
      forward: "Forward",
      open: "Open page",
      refresh: "Refresh",
      extractMedia: "Extract page media",
      extractImages: "Extract page images",
      extractVideos: "Detect page videos",
      saveReference: "Save web reference card",
      openExternal: "Open in browser",
      exitFullscreen: "Exit fullscreen",
      fullscreen: "Fullscreen"
    }),
    startPage: Object.freeze({
      title: "Browser"
    }),
    shortcutEditor: Object.freeze({
      namePlaceholder: "Name",
      urlPlaceholder: "URL",
      cancel: "Cancel",
      save: "Save"
    }),
    shortcuts: Object.freeze({
      add: "Add shortcut",
      more: "More",
      menu: Object.freeze({
        rename: "Rename",
        delete: "Delete",
        unpin: "Unpin from page",
        pin: "Pin to page",
        deleteHistory: "Delete history"
      })
    }),
    toasts: Object.freeze({
      addressRequired: "Enter a URL or search",
      maxTabs: "Tab limit reached",
      textSent: "Web text sent to canvas",
      sourceTextSent: "Web text sent as source text",
      imagePromptCreated: "Image node created",
      imagePromptGenerateStarted: "Image node created. Generating...",
      imagePromptGenerateFailed: "Image node created, but auto generation failed: {error}",
      imagePromptGenerateNodeNotReady: "Image node is not ready yet",
      videoPromptCreated: "Video node created",
      videoPromptGenerateStarted: "Video node created. Generating...",
      videoPromptGenerateFailed: "Video node created, but auto generation failed: {error}",
      videoPromptGenerateNodeNotReady: "Video node is not ready yet",
      imageAdded: "Web image added to canvas",
      reversePromptCreated: "Reverse prompt node created",
      reversePromptGenerateStarted: "Reverse prompt node created. Generating...",
      reversePromptGenerateFailed: "Reverse prompt node created, but auto generation failed: {error}",
      reversePromptGenerateUnavailable: "Generation command is unavailable",
      reversePromptGenerateNodeNotReady: "Node is not ready yet",
      openPageFirst: "Open a page first",
      extractMediaFailed: "Failed to extract page media",
      saveReferenceFailed: "Failed to save web reference card",
      referenceAdded: "Web reference card added to canvas",
      openExternalFailed: "Failed to open external link",
      invalidShortcutUrl: "Enter a valid http/https page URL",
      saveShortcutFailed: "Failed to save shortcut"
    }),
    capture: Object.freeze({
      fallback: Object.freeze({
        image: "Web image",
        video: "Web video",
        reference: "Web reference"
      }),
      nodeNames: Object.freeze({
        generatedText: "Generated text",
        sourceText: "Source text",
        imagePrompt: "Generate image",
        videoPrompt: "Generate video",
        webReference: "Web reference"
      }),
      videoSources: Object.freeze({
        player: "Player",
        pageLink: "Page link",
        pageAttribute: "Page attribute",
        loadedResource: "Loaded resource",
        scriptUrl: "Script direct URL",
        structuredData: "Page data",
        douyinDetail: "Douyin details",
        videoSource: "Video source"
      }),
      videoTooltip: Object.freeze({
        source: "Source: {source}",
        url: "URL: {url}",
        page: "Page: {url}"
      }),
      mediaPicker: Object.freeze({
        title: "Extract Page Media",
        videoNotice: "Videos only save direct media links publicly exposed by the page. This does not parse streaming playlists or bypass login or platform restrictions. Confirm you have the right to save and use the selected videos.",
        consent: "I confirm I have the right to save and use the selected web video assets",
        count: "Images {imageSelected}/{imageMax} · Videos {videoSelected}/{videoMax}"
      }),
      videoPicker: Object.freeze({
        title: "Save Page Videos",
        notice: "Only direct videos publicly exposed by the page are saved. This does not parse streaming playlists or bypass login or platform restrictions. Confirm you have the right to save and use the selected assets."
      }),
      imagePicker: Object.freeze({
        title: "Extract Images"
      }),
      buttons: Object.freeze({
        selectAll: "Select all",
        clearSelection: "Clear selection",
        cancel: "Cancel",
        addToCanvas: "Add to canvas",
        saveAsSourceVideo: "Save as source video node"
      }),
      filters: Object.freeze({
        all: "All",
        image: "Images",
        video: "Videos"
      }),
      toasts: Object.freeze({
        noMedia: "This page has no extractable images or public direct-link videos to save",
        imageLimit: "You can extract up to {limit} images at once",
        videoLimit: "You can save up to {limit} video assets at once",
        mediaAdded: "Added {count} web media assets",
        noVideos: "This page has no public direct-link videos to save",
        videosSaved: "Saved {count} web video assets",
        noImages: "This page has no extractable images",
        imagesAdded: "Added {count} web images"
      })
    })
  }),
  mediaProcessing: Object.freeze({
    compose: Object.freeze({
      buttonLabel: "Compose",
      video: Object.freeze({
        buttonLabel: "Compose video",
        minSelection: "Select at least 2 video clips",
        invalidSource: "Selected video sources are invalid",
        progress: "Composing video...",
        missingApi: "Backend endpoint is missing: /api/v2/video/compose. Restart server.py.",
        fallback: "Composition failed",
        resultName: "Composed video",
        success: "Composition complete. New video node created.",
        failedWithMessage: "Composition failed: {message}"
      }),
      audio: Object.freeze({
        buttonLabel: "Merge audio",
        minSelection: "Select at least 2 audio clips",
        invalidSource: "Selected audio sources are invalid",
        progress: "Merging audio...",
        missingApi: "Backend endpoint is missing: /api/v2/audio/compose. Restart server.py.",
        fallback: "Merge failed",
        resultName: "Merged audio",
        success: "Merge complete. New audio node created.",
        failedWithMessage: "Merge failed: {message}"
      }),
      audioVoice: Object.freeze({
        invalidSource: "Voice Studio compose source is invalid",
        missingTask: "Local Voice Studio compose task is unavailable",
        videoProgress: "Composing complete video...",
        audioProgress: "Composing complete audio...",
        videoResultName: "Voice Studio video",
        audioResultName: "Voice Studio audio",
        videoSuccess: "Composition complete. New video node created.",
        audioSuccess: "Composition complete. New audio node created.",
        fallback: "Voice Studio composition failed",
        failedWithMessage: "Voice Studio composition failed: {message}"
      })
    }),
    videoAudioSeparation: Object.freeze({
      incompleteResult: "Video/audio separation returned an incomplete result",
      videoFallback: "Video",
      videoNodeName: "Video from {name}",
      audioNodeName: "Audio from {name}",
      unsupportedNode: "This node does not support video/audio separation",
      busy: "This video is currently processing. Try again later.",
      notLocalFile: "This video is not a processable local file",
      progress: "Separating video and audio...",
      success: "Video/audio separation complete. Video and audio nodes created.",
      fallback: "Video/audio separation failed",
      failedWithMessage: "Video/audio separation failed: {message}"
    }),
    audioSeparation: Object.freeze({
      localSaveFailed: "Generated, but local save failed",
      missingResultUrls: "Task completed, but vocal and background audio URLs were not found",
      success: "Vocal separation complete",
      fallback: "Vocal separation failed",
      failedWithMessage: "Vocal separation failed: {message}",
      missingTaskId: "Missing RunningHub audio task ID",
      submitting: "Submitting RH vocal separation task...",
      unsupportedNode: "This node does not support vocal separation",
      busy: "This audio is currently processing. Try again later.",
      missingAudio: "This node has no available audio yet",
      cancelled: "Vocal separation task cancelled",
      nodeNames: Object.freeze({
        vocalsProcessing: "Vocals (processing)",
        backgroundProcessing: "Background (processing)",
        vocals: "Vocals",
        background: "Background",
        vocalsFailed: "Vocals (failed)",
        backgroundFailed: "Background (failed)",
        vocalsCancelled: "Vocals (cancelled)",
        backgroundCancelled: "Background (cancelled)"
      })
    })
  }),
  autoUpdate: Object.freeze({
    notes: Object.freeze({
      empty: "No detailed notes were provided for this update.",
      defaultSectionTitle: "Update Contents",
      releaseFooterTitle: "Release Notes"
    }),
    versions: Object.freeze({
      newVersion: "New version",
      currentVersion: "Current version",
      unknownVersion: "Unknown version"
    }),
    banner: Object.freeze({
      versionUpdateTitle: "Version update {version}",
      currentVersionSuffix: " | Current version: {version}",
      closeAria: "Close update notice",
      subtitleCurrent: "Current version {localVersion}.",
      subtitleWithDate: "Current version {localVersion}. Published {pubDate}.",
      subtitleNoUpdate: "Current version {localVersion}; online version {remoteVersion}."
    }),
    buttons: Object.freeze({
      retrying: "Retrying...",
      downloading: "Downloading...",
      close: "Close",
      cancel: "Cancel",
      skipVersion: "Skip this version",
      gotIt: "Got it",
      restartInstall: "Restart and install",
      retryDownloadInstall: "Retry download and install",
      downloadInstall: "Download and install",
      programUpdateUnavailable: "In-app update unavailable",
      updateNow: "Update now",
      preparingDownload: "Preparing download...",
      restarting: "Restarting...",
      updating: "Updating...",
      restartingWait: "Restarting. Please wait...",
      later: "Later",
      restartingInstall: "Restarting to install..."
    }),
    progress: Object.freeze({
      downloading: "Downloading update {percent}",
      retrying: "Download failed. Retry {count}..."
    }),
    status: Object.freeze({
      autoRetry: "Download hit a problem and is retrying automatically.",
      downloadingAutoInstall: "Downloading the new version. The app will restart and install after download.",
      downloadedRestarting: "Update downloaded. Restarting to install."
    }),
    errors: Object.freeze({
      hotApplyFailed: "Hot update failed: {error}",
      programUpdateRequired: "This version only supports in-app updates. Try again later.",
      unknownProgramUpdate: "Unknown error. Retry the update inside the app.",
      networkProgramUpdate: "Network error. Retry the update inside the app."
    }),
    desktop: Object.freeze({
      downloadedNotes: "The app update has been downloaded. Restart to finish installation.",
      subtitleDownloaded: "Current version {localVersion}. New version {remoteVersion} has been downloaded and will install after restart.",
      subtitleDownloading: "Current version {localVersion}. Downloading new version {remoteVersion}.",
      subtitleAvailable: "Current version {localVersion}. New version {remoteVersion} is available.",
      downloadFailedMessage: "In-app update download failed. Try again later.",
      downloadFailedWithRetries: "{message} Automatically retried {retryCount}/{maxRetries} times.",
      downloadFailedNotes: "Updates can only be downloaded and installed inside the app. Try again later."
    }),
    toasts: Object.freeze({
      programUpdateFailed: "In-app update is unavailable. Try again later.",
      downloadCancelled: "Update download cancelled.",
      cancelDownloadFailed: "Unable to cancel the update download. Try again later.",
      restartInstallFailed: "Restart installation failed. Try again later.",
      previewOnly: "Update information preview: no real update will run.",
      alreadyLatest: "You are already on the latest version",
      installing: "Restarting to install update...",
      updateFailed: "App update failed. Try again later.",
      checkingDesktop: "Checking desktop update...",
      desktopCheckFailed: "Desktop update check failed. Try again later.",
      checkingUpdate: "Checking for updates...",
      noRemoteInfo: "No online update information was found",
      remoteCheckFailed: "Live update check failed. Try again later.",
      generatingPreview: "Fetching online update information...",
      noLocalPreview: "No online update information was found",
      localPreviewFailed: "Failed to fetch online update information. Try again later."
    }),
    tutorial: Object.freeze({
      defaultTitle: "Tutorial:",
      title: "Tutorial",
      versionedTitle: "Version {version} Tutorial",
      linkLabel: "{title}:",
      subtitle: "Choose a tutorial video to play"
    })
  }),
  workflows: Object.freeze({
    manager: Object.freeze({
      unknown: "Unknown",
      title: "Workflows",
      detailTitle: "Workflow details",
      sidebarAria: "Workflow panel",
      searchPlaceholder: "Search name, tags, or notes",
      loadFailed: "Failed to load workflows",
      coverAlt: "Workflow cover",
      loadToCanvas: "Load to canvas",
      deleteWorkflow: "Delete workflow",
      rename: "Rename",
      confirm: "Confirm",
      cancel: "Cancel",
      name: "Workflow name",
      unnamedWorkflow: "Untitled workflow",
      noteAria: "Workflow note: {note}",
      workflowMissing: "Workflow not found",
      content: "Contents",
      editMeta: "Edit info",
      updateContent: "Update content",
      applyToCanvas: "Apply to canvas",
      applying: "Applying",
      nodeFallback: "Node",
      renamed: "Renamed",
      renameFailed: "Rename failed",
      deleted: "Deleted",
      deleteFailed: "Delete failed",
      saving: "Saving",
      createConfirm: "Create",
      currentCover: "Current cover",
      updating: "Updating",
      saveMeta: "Save info",
      confirmOverwrite: "Overwrite",
      updateConfirm: "Update",
      note: "Note",
      notePlaceholder: "Use, scenario, or steps",
      tags: "Tags",
      tagLimitReached: "Tag limit reached",
      addTagPlaceholder: "Add tag",
      addTag: "Add",
      created: "Workflow created",
      saveFailed: "Failed to save workflow",
      metaSaved: "Workflow info saved",
      metaSaveFailed: "Failed to save workflow info",
      updated: "Workflow updated",
      updateFailed: "Failed to update workflow",
      applied: "Workflow applied to canvas",
      applyFailed: "Failed to apply workflow",
      meta: Object.freeze({
        used: "Used {date}",
        updated: "Updated {date}",
        line: "Nodes {nodeCount} · Connections {edgeCount} · {time}"
      }),
      tabs: Object.freeze({
        create: "Create workflow",
        update: "Update existing workflow"
      }),
      empty: Object.freeze({
        noMatches: "No matching workflows",
        noWorkflows: "No workflows yet",
        noNote: "No workflow note",
        noPreviewContent: "This workflow has no previewable content yet",
        noNodePreviewContent: "This node has no previewable content",
        noGroupNodes: "No savable nodes in the current group",
        noCanvasNodes: "No savable nodes on the current canvas",
        noApplicableNodes: "This workflow has no nodes to apply"
      }),
      errors: Object.freeze({
        nameRequired: "Name is required",
        tagLimit: "Add up to {limit} tags",
        tagExists: "Tag already exists",
        selectWorkflowToUpdate: "Select a workflow to update"
      }),
      source: Object.freeze({
        currentGroup: "Current group",
        wholeCanvas: "Whole canvas",
        historyWorkflow: "Existing workflow",
        savingContent: "Content to save",
        moreNodes: "{count} more nodes"
      }),
      modal: Object.freeze({
        editMetaTitle: "Edit workflow info",
        updateTitle: "Update workflow",
        createTitle: "Create workflow"
      }),
      updatePicker: Object.freeze({
        title: "Choose existing workflow",
        resultCount: "{count} results",
        searchPlaceholder: "Search workflows"
      })
    }),
    preview: Object.freeze({
      nodeTypes: Object.freeze({
        group: "Node group",
        text: "Text",
        aiText: "AI Text",
        image: "Image",
        aiImage: "AI Image",
        video: "Video",
        aiVideo: "AI Video",
        audio: "Audio",
        aiAudio: "AI Audio",
        note: "Note",
        debug: "Debug",
        storyboard: "Storyboard",
        storyboardScript: "Storyboard script",
        scene: "Scene",
        panoramaScene: "3D Stage",
        panorama360: "360 Panorama",
        node: "Node"
      }),
      tags: Object.freeze({
        matting: "Matting",
        storyboard: "Storyboard",
        scene: "Scene",
        video: "Video",
        audio: "Audio",
        image: "Image",
        text: "Text"
      }),
      suggested: Object.freeze({
        workflowName: "{name} workflow",
        fromTags: "{tags} workflow",
        tagJoiner: " ",
        nodeFlow: "{count}-node workflow",
        canvasWorkflow: "Canvas workflow"
      }),
      source: Object.freeze({
        currentGroup: "Current group",
        wholeCanvas: "Whole canvas"
      }),
      hasContent: "Contains {label} content"
    }),
    canvas: Object.freeze({
      workflowNameRequired: "Workflow name is required",
      missingUpdateWorkflowId: "Missing workflow ID to update"
    }),
    service: Object.freeze({
      nameRequired: "Name is required",
      workflowMissing: "Workflow not found",
      deleteFailed: "Delete failed"
    }),
    selectors: Object.freeze({
      unnamedWorkflow: "Untitled workflow"
    }),
    covers: Object.freeze({
      titleFallback: "Workflow",
      summary: "Nodes {nodeCount} · Connections {edgeCount}",
      snapshotLabel: "Workflow snapshot",
      coverNodeLabel: "Node {index}",
      nodeTypes: Object.freeze({
        video: "Video",
        audio: "Audio",
        image: "Image",
        text: "Text",
        mask: "Mask",
        group: "Group",
        node: "Node"
      })
    })
  }),
  videoNode: Object.freeze({
    referenceInput: Object.freeze({
      kind: Object.freeze({
        text: "Text",
        image: "Image",
        video: "Video",
        audio: "Audio"
      }),
      slots: Object.freeze({
        sourceVideo: "Source video",
        refImage: "Reference image",
        firstFrame: "First frame",
        videoMask: "Mask video",
        maskImage: "Mask",
        audio: "Audio"
      }),
      removeReference: "Remove reference",
      uploadReference: "Upload reference",
      fullLength: "Full length",
      sourceVideoFramesLabel: "Frames {frames} · FPS {fps} · Resolution {resolution}",
      fixedInputs: "Fixed inputs",
      fixedInputsAria: "{label} inputs"
    }),
    parameterPanel: Object.freeze({
      generateTitle: "Generate video",
      cancelTooltip: "Click generate again to cancel the run",
      cancelGenerateAria: "Cancel video generation",
      defaultPromptPlaceholder: "Describe the video. Use @ to reference assets, or / for commands...",
      resolution: "Resolution",
      resolutionUnavailable: "This resolution is unavailable for this model",
      aspectRatio: "Aspect ratio",
      adaptive: "Adaptive",
      ratioResolutionLabel: "{aspectRatio} · {resolution}",
      mode: Object.freeze({
        allReference: "All-purpose reference",
        firstLastFrame: "First/last frame"
      }),
      duration: "Video duration",
      advancedSettings: "Advanced settings",
      debugApiParams: "Debug API parameters",
      modelUnavailable: "Model unavailable. Select another model.",
      vipRequired: "VIP access required. Activate your CDKEY first.",
      videoGenerationUnavailable: "Video generation is currently unavailable",
      smartMultiframeUnavailable: "Smart multi-frame is not available yet",
      missingPromptOrReference: "Missing prompt or reference media. Cannot generate.",
      debugNodeName: "Debug node",
      debugParamsShown: "Final API parameters displayed",
      buildRequestFailed: "Failed to build request: {error}",
      dreaminaPrompt: Object.freeze({
        frames2video: "Enter text describing the scene and motion you want. Example: a 3D boy skateboarding in a park.",
        reference: "Upload 1-12 reference assets and enter text to combine image, text, audio, and video elements. Example: @Image1 imitates the motion from @Video1, with voice tone from @Audio1."
      }),
      providers: Object.freeze({
        dreamina: "Dreamina official",
        volcengine: "Volcengine Ark",
        default: "Dreamina video"
      })
    })
  }),
  canvasControls: Object.freeze({
    minimap: "Show/hide minimap (M)",
    grid: "Show/hide grid dots (.)",
    connectionLines: "Show/hide connection lines (B)",
    connectionLinesAria: "Show or hide connection lines",
    fit: "Fit canvas (F)",
    pinBar: "Pin bottom-left bar",
    autoHideBar: "Auto-hide bottom-left bar"
  }),
  emptyHint: Object.freeze({
    action: "Double-click",
    subtitle: "Create freely on the canvas, or browse workflow templates",
    text: "Text",
    image: "Image",
    video: "Video"
  }),
  coreUi: Object.freeze({
    rendererOverlays: Object.freeze({
      contextMenuTitle: "Menu",
      delete: "Delete",
      pickConnectBanner: "Click a target node to complete the connection"
    }),
    fastPreviewTypes: Object.freeze({
      image: "Image",
      video: "Video",
      audio: "Audio",
      text: "Text",
      node: "Node"
    }),
    generationTask: Object.freeze({
      cancelled: "Task cancelled",
      generateFailed: "Generation failed",
      queued: "Queued",
      resumeFailed: "Resume failed"
    }),
    renderer: Object.freeze({
      dreaminaPhase: Object.freeze({
        failed: "Query failed",
        syncing: "Syncing result",
        queued: "Queued",
        generating: "Generating",
        done: "Completed"
      }),
      videoMeta: Object.freeze({
        framesFps: "{frames} frames · {fps}fps"
      }),
      defaultNodeNames: Object.freeze({
        node: "Node",
        image: "Image",
        video: "Video",
        audio: "Audio",
        text: "Text"
      }),
      picker: Object.freeze({
        addNode: "Add node",
        items: Object.freeze({
          aiText: "✨  Generate text",
          aiImage: "✨  Generate image",
          aiVideo: "✨  Generate video",
          aiAudio: "✨  Generate audio"
        }),
        defaults: Object.freeze({
          aiText: "Generated text",
          aiImage: "Generated image",
          aiVideo: "Generated video",
          aiAudio: "Generated audio"
        })
      }),
      multiSelect: Object.freeze({
        syncVideoPlay: "Sync video playback",
        syncVideoPause: "Pause synchronized videos",
        runSelected: "Run selected nodes",
        createAsset: "Create asset",
        batchDownload: "Batch download",
        group: "Group",
        resetDefaultSize: "Reset default size",
        composeVideo: "Compose video",
        createCollage: "Create collage"
      }),
      align: Object.freeze({
        left: "Align left",
        hCenter: "Align horizontal center",
        right: "Align right",
        top: "Align top",
        bottom: "Align bottom",
        distributeH: "Distribute horizontally",
        vCenter: "Align vertical center",
        distributeV: "Distribute vertically",
        arrangeGrid: "Arrange in grid",
        arrangeGridHint: "Arrange in grid (right-click or ↓ for columns)",
        gridMenu: "Choose grid columns",
        gridAuto: "Automatic columns",
        gridColumns: "{count} columns"
      })
    })
  }),
  nodeBatchExport: Object.freeze({
    toasts: Object.freeze({
      started: "Batch download started...",
      completed: "Batch download complete: exported {count}",
      completedWithSkipped: "Exported {exported}, skipped {skipped}",
      noExportable: "The selected nodes do not have downloadable content",
      unsupported: "Batch download is not supported in this environment",
      failed: "Batch download failed",
      failedWithMessage: "Batch download failed: {message}"
    })
  }),
  coreServices: Object.freeze({
    completion: Object.freeze({
      notificationBody: "Generation task completed.",
      notificationNodeBody: "“{name}” finished generating.",
      soundPlaybackFailed: "Completion sound playback failed. Check the file."
    }),
    projectFile: Object.freeze({
      unnamedCanvas: "Untitled canvas"
    }),
    externalLink: Object.freeze({
      externalLink: "External link",
      link: "link",
      blocked: "This external link is not allowed",
      missing: "No {label} detected",
      openFailed: "Unable to open external link"
    }),
    diagnostics: Object.freeze({
      packageUnsupported: "This environment does not support creating diagnostics packages",
      logsUnsupported: "This environment does not support opening the logs folder"
    })
  }),
  canvasInteraction: Object.freeze({
    grids: Object.freeze({
      grid4: "4-grid",
      grid9: "9-grid",
      grid16: "16-grid",
      grid25: "25-grid",
      createGrid: "Create grid storyboard",
      collageName: "Collage",
      noImages: "No image nodes in the selection for collage",
      boundsFailed: "Unable to calculate collage bounds",
      created: "Collage node created"
    }),
    contextMenu: Object.freeze({
      copyNode: "Copy node",
      cutNode: "Cut node",
      paste: "Paste",
      materialComparison: "Compare materials",
      createCollage: "Create collage",
      copyImage: "Copy image",
      addAsset: "Add material",
      revealAsset: "Show asset in File Explorer",
      openOutputFolder: "Open output folder",
      duplicate: "Duplicate",
      copyText: "Copy text",
      pasteText: "Paste text",
      deleteNode: "Delete node",
      addResource: "Add resource",
      addNode: "Add node",
      undo: "Undo",
      redo: "Redo"
    }),
    toasts: Object.freeze({
      nodeCopied: "Node copied",
      nodeCut: "Node cut",
      assetPanelFailed: "Unable to open asset panel",
      assetRevealFailed: "Unable to locate this asset",
      outputFolderFailed: "Unable to open output folder",
      duplicateWithEdgesCreated: "Duplicate with connections created",
      textCopied: "Text copied to clipboard",
      selectedTextCopied: "Selected text copied",
      copyFailed: "Copy failed. Check browser clipboard permission.",
      noNodeText: "This node has no text",
      unsupportedUpload: "Only image, video, or audio files can be uploaded",
      materialComparisonFailed: "Unable to open material comparison"
    }),
    generation: Object.freeze({
      text: "Generate text",
      image: "Generate image",
      video: "Generate video",
      audio: "Generate audio"
    }),
    materialComparison: Object.freeze({
      title: "Material comparison",
      ariaLabel: "Material comparison viewer",
      localCache: "Comparison library uses the local cache",
      modeGroupLabel: "Comparison mode",
      slideMode: "Slider",
      sideBySideMode: "Side by side",
      dividerLabel: "Drag to adjust the image divider",
      close: "Close",
      library: "Comparison library",
      libraryHint: "Click materials to assign left, then right, and repeat",
      left: "Left",
      right: "Right",
      untitled: "Material {index}",
      thumbnailLabel: "Material {index}: {name}"
    }),
    generationNames: Object.freeze({
      text: "Generated text",
      image: "Generated image",
      video: "Generated video",
      audio: "Generated audio"
    }),
    group: Object.freeze({
      newGroup: "New group"
    }),
    uploadTypeNames: Object.freeze({
      image: "Image",
      video: "Video",
      audio: "Audio"
    })
  }),
  edgeController: Object.freeze({
    addConnection: "Add connection",
    quoteMenuTitle: "Reference this node",
    inputMenuTitle: "Create input node"
  }),
  fileService: Object.freeze({
    unknownError: "Unknown error",
    defaultNames: Object.freeze({
      image: "Image",
      video: "Video",
      audio: "Audio",
      mediaClip: "Clip",
      text: "Text",
      file: "File",
      webImage: "Web image",
      webVideo: "Web video",
      unknownFile: "unknown file"
    }),
    errors: Object.freeze({
      remoteImageImportFailed: "Remote image import failed",
      remoteVideoImportFailed: "Remote video import failed",
      remoteImportUnsupported: "This environment does not support remote asset import",
      webVideoRightsRequired: "Confirm you have permission to save and use this web video asset first",
      unsupportedFileType: "This file type is not supported yet: {file}",
      videoTooLarge: "Video files cannot exceed {maxMB} MB: {file}",
      importFailed: "Import failed",
      importFailedWithFile: "Import failed: {file}. {reason}",
      importFailedReason: "Reason: {reason}",
      jsonParseFailed: "JSON parsing failed",
      fileReadFailed: "File read failed"
    })
  }),
  projectLifecycle: Object.freeze({
    untitledProject: "Untitled project",
    untitledCanvas: "Untitled canvas",
    defaultCanvas: "Default canvas",
    loadingWorkspaceFiles: "Loading workspace files...",
    projectPersistenceLoading: "Canvas projects are loading safely. Please wait before saving.",
    projectPersistenceLoadFailed: "Canvas projects failed to load. Saving is paused to prevent overwriting existing data.",
    historicalAiLocalizationStarted: "Detected {count} historical generation results that are not local. Repairing...",
    historicalAiLocalizationFixed: "Repaired {count} generation results (saved to output)",
    historicalImageDerivativesFixed: "Filled display/thumb for {count} image nodes",
    packageUnsupported: "Project package loading is not supported in this environment",
    packagePathMissing: "Unable to read project package path",
    localArchiveLoaded: "Loaded local archive: {name}",
    jsonArchiveParseFailed: "Failed to parse JSON archive"
  }),
  imageFunctionMenu: Object.freeze({
    providers: Object.freeze({
      grsai: Object.freeze({
        description: "High-performance AI image generation service"
      }),
      apimart: Object.freeze({
        description: "One API for everything, saving 30-70%"
      }),
      runninghub: Object.freeze({
        name: "RunningHUB Models",
        description: "Model API: text-to-image, image-to-image, image editing"
      }),
      runninghubWorkflow: Object.freeze({
        name: "RunningHUB Workflows",
        description: "Dedicated workflow for camera angle control"
      })
    }),
    modes: Object.freeze({
      normal: "Normal",
      fast: "Fast",
      lowPrice: "Low-price",
      official: "Official",
      lowPriceRoute: "Low-price route",
      lowPriceRoute2: "Low-price route 2",
      highValueRoute: "High-value route",
      officialDirectRoute: "Official direct route"
    }),
    families: Object.freeze({
      base: "Base model",
      pro: "Professional enhanced model",
      secondGen: "Second-generation model"
    })
  }),
  imageModelConfig: Object.freeze({
    providers: Object.freeze({
      grsai: Object.freeze({
        description: "High-performance AI image generation service"
      }),
      ppio: Object.freeze({
        name: "PPIO",
        description: "Cost-effective, elastic, low-latency products"
      }),
      apimart: Object.freeze({
        description: "One API for everything, saving 30-70%"
      }),
      runninghub: Object.freeze({
        description: "AI workflow and model API aggregation platform"
      }),
      aicanvas: Object.freeze({
        description: "SHUO Canvas developer-mode placeholder provider",
        placeholderImageModel: "Developer-mode placeholder image model"
      })
    })
  }),
  aigenText: Object.freeze({
    previewPlaceholder: "Enter a prompt to start creating",
    promptPlaceholder: "Enter a prompt to start creating   (Enter to generate, Shift+Enter for a new line)",
    customModelTitle: "Custom model",
    customModelSubtitle: "OpenAI-compatible text/vision endpoint",
    debugApiParams: "Debug API parameters",
    generate: "Generate",
    customModel: Object.freeze({
      addModel: "Add model",
      namePlaceholder: "Enter model name",
      confirm: "Confirm"
    }),
    refs: Object.freeze({
      maskBadge: "Mask",
      remove: "Remove",
      removeReference: "Remove reference",
      groupShortName: "Group",
      nodeShortName: "Node",
      types: Object.freeze({
        text: "Text",
        image: "Image",
        video: "Video",
        audio: "Audio",
        group: "Group",
        other: "Node"
      })
    }),
    debug: Object.freeze({
      nodeName: "Debug node",
      paramsShown: "Final API request displayed (not sent)",
      buildRequestFailed: "Failed to build request: {error}"
    }),
    task: Object.freeze({
      promptRequired: "Enter a prompt before generating",
      imageReferenceRequired: "This model requires an image reference",
      generationFailed: "Text generation failed",
      generationFailedWithError: "Text generation failed: {error}"
    }),
    result: Object.freeze({
      timeoutTitle: "Generation timed out",
      timeoutReason: "The API did not return a result within the timeout window. The provider may be busy, or the upstream model may be responding slowly.",
      timeoutRetry: "Try again later, or switch to another available model.",
      errorDetail: "Error details: {detail}"
    })
  }),
  aigenImage: Object.freeze({
    prompt: Object.freeze({
      placeholder: "Describe anything you want to generate, use @ to reference assets, or type / for commands   (Enter to generate, Shift+Enter for a new line)"
    }),
    refs: Object.freeze({
      maskBadge: "Mask",
      referenceImage: "Reference image",
      replaceTarget: "Target",
      replacedImage: "Replacement image",
      uploadReference: "Upload reference",
      removeReference: "Remove reference",
      types: Object.freeze({
        text: "Text",
        image: "Image",
        video: "Video",
        audio: "Audio"
      })
    }),
    uiSchema: Object.freeze({
      fullLength: "Full length",
      numericValueAria: "{label} value",
      random: "Random",
      fixed: "Fixed",
      randomAria: "{label} random",
      singleControl: "Single control",
      controlColon: ":",
      efficiency: "Efficiency",
      stable: "Stable",
      multiControl: "Multi-person control",
      yes: "Yes",
      no: "No",
      maskExpandValue: "Mask expansion value",
      assetInput: Object.freeze({
        image: "Image",
        video: "Video",
        audio: "Audio"
      })
    }),
    controls: Object.freeze({
      advancedSettings: "Advanced",
      debugApiParams: "Debug API parameters",
      generate: "Generate",
      cancelGenerate: "Cancel generation",
      cancelTaskTooltip: "Click to cancel task"
    }),
    debug: Object.freeze({
      missingPayload: "Missing prompt or referenced media. Cannot generate.",
      nodeName: "Debug node",
      paramsShown: "Final API parameters displayed",
      buildRequestFailed: "Failed to build request: {error}"
    }),
    access: Object.freeze({
      vipRequired: "VIP access required. Activate a CDKEY first."
    }),
    upload: Object.freeze({
      missingUrl: "Upload failed: no file URL returned",
      failedRetry: "Upload failed. Try again."
    }),
    result: Object.freeze({
      generationFailed: "Generation failed",
      imageFallbackName: "Image",
      dragUnavailable: "This result image has no local image available to drag out",
      imageCount: "{count} images",
      restrictedOrFailed: "Restricted/failed"
    }),
    task: Object.freeze({
      apiKeyMissing: Object.freeze({
        volcengine: "Set Volcengine Ark API Key in Settings first",
        runninghubModel: "Set RunningHub Model API Key in Settings first",
        runninghub: "Set RunningHub API Key in Settings first",
        apimart: "Set APIMart API Key in Settings first",
        ppio: "Set PPIO API Key in Settings first",
        grsai: "Set GRSAI API Key in Settings first"
      }),
      dreaminaLoginRequired: "Dreamina CLI is not signed in. Click Open settings to finish signing in.",
      dreaminaLoginStatusUnavailable: "Unable to verify the Dreamina CLI sign-in status. Click Open settings to check it.",
      openSettings: "Open settings",
      checkingDreaminaLogin: "Checking Dreamina sign-in status",
      generating: "Generating",
      submitting: "Submitting",
      completed: "Completed",
      generationFailed: "Generation failed",
      imageGenerationFailed: "Image generation failed",
      interrupted: "Generation interrupted",
      interruptedMissingTaskId: "Generation interrupted: task ID was not returned yet",
      cancelMissingApiKey: "Cancel failed: missing API Key",
      cancelFailed: "Cancel failed",
      cancelSuccess: "Cancelled",
      taskNotFound: "Task not found",
      cancelledToast: "Task cancelled",
      referenceImageRequired: "Add at least one reference image before generating",
      replacePairRequired: "Add two images first: target and replacement image",
      promptOrReferenceRequired: "Enter a prompt or add reference media"
    }),
    qwen: Object.freeze({
      versionTooltips: Object.freeze({
        qwen2509: "2509: improved multi-image editing and single-image consistency. Good for characters, products, text editing, and ControlNet inputs such as depth, edge, keypoint, or pose maps.",
        qwen2511: "2511: newer instruction image editing with stronger character and multi-person consistency, materials, lighting, industrial design, and text editing. Supports 1-3 reference images and multi-turn edits."
      }),
      firstImageModes: Object.freeze({
        original: "Original",
        pose: "Pose map",
        depth: "Depth map"
      })
    }),
    modelMenu: Object.freeze({
      unavailable: "{model} is currently unavailable",
      qwenEdit: Object.freeze({
        title: "Qwen image edit",
        description: "Multi-image instruction editing for character/product consistency, text edits, and pose/depth control"
      }),
      animeReal: Object.freeze({
        title: "Anime to realistic V2",
        description: "Workflow-based conversion from anime character to realistic portrait"
      }),
      personReplaceV21: Object.freeze({
        title: "Person replacement V2.1",
        description: "Two-image person replacement with target/replacement masks"
      }),
      personReplaceV3: Object.freeze({
        title: "Person replacement image edit V3",
        description: "Keep composition and lighting while replacing people, clothing, or objects"
      })
    }),
    dreamina: Object.freeze({
      alt: "Dreamina",
      label: "Dreamina Official (Advanced membership required)",
      subtitle: "Choose by version; text-to-image/image-to-image is automatic"
    })
  }),
  sharedPromptPanel: Object.freeze({
    promptPlaceholder: "Enter a prompt...",
    customModelTitle: "Custom model",
    customModelSubtitle: "OpenAI-compatible text endpoint",
    addModel: "Add model",
    modelNamePlaceholder: "Enter model name",
    confirm: "Confirm",
    debugApiParams: "Debug API parameters",
    debugNodeName: "Debug node",
    debugParamsShown: "Final API parameters displayed",
    buildRequestFailed: "Failed to build request: {error}",
    generate: "Generate"
  }),
  nodePromptShared: Object.freeze({
    materialFallback: "Asset",
    assetFallback: "Asset",
    assetUnavailable: "This asset has no media usable by the current model",
    useEntireAsset: "Use entire asset",
    assetTypes: Object.freeze({
      text: "Text",
      image: "Image",
      video: "Video",
      audio: "Audio"
    })
  }),
  groupNode: Object.freeze({
    defaultName: "New group",
    renameTooltip: "Click to rename",
    toolbar: Object.freeze({
      runGroup: "Run group",
      stopGroup: "Stop group generation",
      syncPlay: "Play videos together",
      color: "Color",
      createWorkflow: "Create workflow",
      ungroup: "Ungroup"
    })
  }),
  mediaClip: Object.freeze({
    menu: Object.freeze({
      addToCanvas: "Add to canvas",
      export: "Export"
    }),
    tools: Object.freeze({
      splitMaterial: "Split material (C)",
      export: "Export"
    }),
    pick: Object.freeze({
      addByConnection: "Add clips by connection",
      continueAdd: "Add another clip"
    }),
    empty: Object.freeze({
      selectMaterial: "Choose a clip to add",
      connectHint: "Click the connection button, then pick a video, image, or audio on the canvas",
      exit: "Esc exits"
    }),
    audioLane: Object.freeze({
      mute: "Mute audio lane",
      unmute: "Unmute audio lane"
    }),
    outputNames: Object.freeze({
      image: "Clipped image",
      audio: "Clipped audio",
      video: "Clipped video"
    }),
    export: Object.freeze({
      loading: "Exporting material",
      noMaterial: "No material to export",
      materialAdded: "Material exported to canvas",
      materialFailed: "Failed to export material",
      noClips: "No clips to export",
      clipExported: "Clip exported",
      clipFailed: "Failed to export clip"
    }),
    playback: Object.freeze({
      previewUnavailable: "This material cannot be previewed",
      play: "Play",
      pause: "Pause"
    }),
    toasts: Object.freeze({
      splitAtMiddle: "Move the playhead inside the material before splitting"
    }),
    hints: Object.freeze({
      playPause: "Play/Pause",
      splitAtPlayhead: "Split material at playhead",
      deleteCurrent: "Delete current material",
      dragMaterial: "Drag material",
      adjustOrder: "Reorder",
      dragEdges: "Drag edges",
      trimMaterial: "Trim material",
      rightClick: "Right-click",
      exportOrDelete: "Export or delete material",
      connectButtonAdd: "Connection button adds clips",
      zoomTimeline: "+ wheel to zoom timeline"
    }),
    materialMenu: Object.freeze({
      exportToCanvas: "Export material to canvas",
      enable: "Enable material",
      disable: "Disable material",
      delete: "Delete material"
    }),
    preview: Object.freeze({
      collapse: "Collapse",
      audioClip: "Audio clip"
    }),
    trim: Object.freeze({
      left: "Left trim",
      right: "Right trim"
    })
  }),
  sourceImageNode: Object.freeze({
    upload: Object.freeze({
      button: "Upload",
      transcoding: "Transcoding...",
      uploading: "Uploading...",
      canvasTranscodeFailed: "Canvas transcode failed",
      imageLoadFailed: "Image failed to load",
      failedRetry: "Upload failed. Try again."
    }),
    toasts: Object.freeze({
      generateUnsupported: "Source image nodes do not support generation"
    }),
    recovery: Object.freeze({
      taskFailed: "Task recovery failed",
      failed: "Recovery failed",
      failedWithMessage: "Recovery failed: {message}",
      imageTaskFailed: "Image task recovery failed",
      dreaminaImageTaskFailed: "Dreamina image task recovery failed",
      asyncImageTaskFailed: "Async image task recovery failed",
      noOutputImage: "No usable output image was returned"
    }),
    result: Object.freeze({
      defaultName: "Image result"
    }),
    status: Object.freeze({
      generating: "Generating",
      completed: "Completed",
      queuedBackground: "Queued (background check)",
      cancelled: "Cancelled",
      generationFailed: "Generation failed"
    })
  }),
  sourceVideoNode: Object.freeze({
    upload: Object.freeze({
      button: "Upload",
      uploading: "Uploading...",
      failedRetry: "Upload failed. Try again."
    }),
    controls: Object.freeze({
      toggleMute: "Toggle mute",
      captureFrame: "Capture current frame"
    }),
    recovery: Object.freeze({
      taskFailed: "Task recovery failed",
      failedWithMessage: "Recovery failed: {message}",
      noOutputVideoUrl: "No usable output video URL was returned",
      runninghubApiKeyMissing: "RunningHUB API Key is not configured"
    }),
    result: Object.freeze({
      defaultName: "Video result",
      hdVideo: "HD video"
    })
  }),
  sourceTextNode: Object.freeze({
    placeholder: Object.freeze({
      initial: "Enter a prompt to start creating",
      edit: "Double-click to enter text input mode"
    }),
    charCount: "{count} chars"
  }),
  sourceAudioNode: Object.freeze({
    upload: Object.freeze({
      button: "Upload",
      uploading: "Uploading...",
      failedRetry: "Upload failed. Try again."
    }),
    toolbar: Object.freeze({
      cancelAudioSeparation: "Cancel vocal separation"
    }),
    download: Object.freeze({
      missingAudio: "No audio to download"
    })
  }),
  generationNodeHelpTip: Object.freeze({
    ariaLabel: "Generation model help",
    advancedVoiceClone: Object.freeze({
      title: "Advanced Voice Clone Guide",
      duration: "Supports [[red:3-15s audio]]",
      noAudio: "With [[red:no audio input]], TTS generates a random voice from the prompt.",
      promptExample: "Example: The moonlight is beautiful tonight.",
      oneAudio: "With [[red:1 audio input]], clone that voice.",
      twoAudio: "With [[red:2 audio inputs]], create multi-speaker cloned dialogue.",
      examples: "Examples:",
      audio1: "@Audio 1",
      audio2: "@Audio 2",
      exampleSpeaker1: "Are you coming home tonight?",
      exampleSpeaker2: "No, I have to work late."
    })
  }),
  audioModelMenu: Object.freeze({
    runninghub: Object.freeze({
      label: "RunningHUB Workflows",
      subtitle: "Audio generation workflows"
    })
  }),
  previewGenerateButton: Object.freeze({
    generate: "Generate",
    clickCancelTask: "Click to cancel task",
    cancelGenerate: "Cancel generation"
  }),
  videoFrameExtraction: Object.freeze({
    videoNotLoaded: "The current video has not finished loading",
    captureUnsupported: "Frame capture is not supported for this video source",
    capturedFrameName: "Captured frame {frameIndex}",
    capturedFrameNameWithSource: "{sourceName}.{frameIndex}f",
    localSaveFailed: "Local save failed",
    shownButSaveFailed: "The frame is shown, but local save failed"
  }),
  videoSyncPlayback: Object.freeze({
    fewerThanTwo: "Fewer than 2 videos can be synced",
    selectedUnmounted: "The selected video is not mounted, so sync playback cannot start",
    playedCount: "Synced playback for {count} videos",
    none: "No videos can be synced"
  }),
  videoResultRender: Object.freeze({
    generationFailed: "Generation failed",
    elapsedMinutesSeconds: "{minutes}m {seconds}s",
    elapsedSeconds: "{seconds}s"
  }),
  audioGenerationResult: Object.freeze({
    localSaveFailed: "Generated, but local save failed",
    missingLocalAudioPath: "Invalid audio result: missing local audio path"
  }),
  videoGenerationResult: Object.freeze({
    failed: "Generation failed"
  }),
  runningHubVideoSubmit: Object.freeze({
    visualInputRequired: "Connect a video or reference image input",
    audioInputRequired: "Connect an audio input",
    referenceImageFramesRequired: "Set the reference image input frame count above 0",
    videoDurationMissing: "Cannot read video duration. Wait for video info to load, then generate again.",
    audioDurationMissing: "Cannot read audio duration. Wait for audio to load, then generate again.",
    videoLongerThanAudio: "Generated video duration cannot exceed audio duration"
  }),
  dreaminaVideo: Object.freeze({
    route: Object.freeze({
      multimodal2video: "All-purpose reference",
      frames2video: "First/last frames",
      multiframe2video: "Smart multiframe"
    }),
    task: Object.freeze({
      video: "Dreamina video",
      text2video: "Text to video",
      image2video: "First frame to video",
      frames2video: "First/last frames",
      multiframe2video: "Smart multiframe",
      multimodal2video: "All-purpose reference"
    }),
    validation: Object.freeze({
      framesOnlyImages: "First/last frame mode only supports image references",
      imageAtLeastOne: "First/last frame mode needs at least 1 image",
      imageAtMostOneSingle: "First/last frame mode supports only 1 image for the single-image path",
      framesNeedTwo: "First/last frame mode needs 2 images",
      framesAtMostTwo: "First/last frame mode supports at most 2 images",
      allReferenceNeedsVisual: "All-purpose reference needs at least 1 image or 1 video; audio cannot be used alone",
      allReferenceMaxImages: "All-purpose reference supports at most {max} images",
      allReferenceMaxVideos: "All-purpose reference supports at most {max} videos",
      allReferenceMaxAudios: "All-purpose reference supports at most {max} audio clips",
      multiframeOnlyImages: "Smart multiframe supports image references only",
      multiframeAtLeastTwo: "Smart multiframe needs at least 2 images",
      multiframeMaxImages: "Smart multiframe supports at most 20 images"
    })
  }),
  modelInputPolicy: Object.freeze({
    unsupported: "This model does not support this material type",
    limitReached: "This model supports only {max} {type} input(s). Remove an existing @ reference first.",
    required: "This model requires at least {min} {type} input(s)",
    inputKinds: Object.freeze({
      text: "text",
      image: "image",
      video: "video",
      audio: "audio",
      material: "material"
    })
  }),
  aigenAudioNode: Object.freeze({
    validation: Object.freeze({
      promptRequired: "Enter a prompt",
      referenceVoiceRequired: "Connect a reference voice",
      voiceConvertRefsRequired: "Voice conversion requires a voice-line reference and a prosody reference",
      advancedVoiceDuration: "{label} is about {duration}s. Advanced voice cloning supports 3-15s audio only."
    }),
    refs: Object.freeze({
      referenceVoice: "Reference voice",
      audio1: "Audio 1",
      audio2: "Audio 2",
      inputAria: "Audio inputs",
      connectAudio: "Connect audio",
      remove: "Remove"
    }),
    help: Object.freeze({
      ariaLabel: "Generation node help"
    }),
    errors: Object.freeze({
      localSaveGeneratedFailed: "Generated, but local save failed"
    }),
    buttons: Object.freeze({
      generate: "Generate",
      generateCancellable: "Click to generate. Click again to cancel.",
      cancelAudioGeneration: "Cancel audio generation"
    }),
    controls: Object.freeze({
      advancedSettings: "Advanced settings"
    }),
    vip: Object.freeze({
      needAuthorization: "VIP authorization required. Activate your CDKEY first.",
      needSubscription: "This model requires VIP. Activate CDKEY/subscription first."
    }),
    cancel: Object.freeze({
      interruptedMissingTaskId: "Generation interrupted: task ID was not returned",
      failed: "Cancel failed",
      success: "Cancelled",
      taskMissing: "Task not found",
      missingApiKey: "Cancel failed: missing API Key"
    }),
    generation: Object.freeze({
      failed: "Audio generation failed",
      interrupted: "Generation interrupted",
      completed: "Audio generation completed",
      failedWithError: "Audio generation failed: {error}"
    }),
    upload: Object.freeze({
      audioOnly: "Only audio files can be uploaded here",
      missingUrl: "Upload failed: file URL was not returned",
      anchorMissing: "Upload failed: anchor node not found",
      sourceAudioName: "Source audio",
      failedRetry: "Upload failed. Try again."
    }),
    prompt: Object.freeze({
      placeholder: "Describe the audio you want to generate."
    }),
    debug: Object.freeze({
      buttonTitle: "Debug API parameters",
      nodeName: "Debug node",
      paramsShown: "Final API parameters displayed",
      buildRequestFailed: "Failed to build request: {error}"
    }),
    toolbar: Object.freeze({
      cancelAudioSeparation: "Cancel vocal separation"
    }),
    download: Object.freeze({
      missingAudio: "No audio to download"
    }),
    assetTypes: Object.freeze({
      text: "Text",
      image: "Image",
      video: "Video",
      audio: "Audio"
    })
  }),
  collageNode: Object.freeze({
    errors: Object.freeze({
      exportBlobFailed: "Failed to export collage",
      emptyImageUrl: "Image URL is empty",
      imageLoadFailed: "Failed to load image",
      emptyCollage: "No images to process in this collage",
      canvasCreateFailed: "Failed to create collage canvas",
      nothingDrawn: "No images were rendered",
      composeFailed: "Collage composition failed",
      exportFailed: "Failed to export collage"
    }),
    toolbar: Object.freeze({
      outerPadding: "Outer padding",
      gap: "Grid spacing",
      cornerRadius: "Grid corner radius",
      edit: "Edit collage",
      exitEdit: "Exit collage editing",
      compose: "Compose",
      composeBusy: "Composing",
      composeBusyEllipsis: "Composing...",
      export: "Export",
      exportBusy: "Exporting",
      expand: "Expand",
      collapse: "Collapse"
    }),
    ratio: Object.freeze({
      tooltip: "Collage ratio",
      fallback: "Ratio",
      optionAria: "Collage ratio {label}"
    }),
    templates: Object.freeze({
      tooltip: "Collage grid",
      label: "Collage grid",
      countAria: "{count}-image templates"
    }),
    background: Object.freeze({
      tooltip: "Background color",
      optionAria: "Background {label}"
    }),
    compose: Object.freeze({
      optionAria: "Compose {label}",
      created: "Composition complete. Source image node created.",
      saveFailed: "Composition node created, but save failed."
    }),
    export: Object.freeze({
      optionAria: "Export {label}",
      exported: "Collage exported"
    }),
    preview: Object.freeze({
      imageAlt: "Collage image",
      empty: "Empty collage",
      expandAria: "Expand collage",
      dividerAria: "Adjust collage spacing"
    }),
    output: Object.freeze({
      name: "Collage_{resolution}"
    }),
    backgrounds: Object.freeze({
      transparent: "Transparent",
      white: "White",
      black: "Black",
      indigo: "Indigo",
      green: "Green",
      gold: "Gold",
      red: "Red",
      purple: "Purple",
      pink: "Pink",
      slate: "Slate",
      cyan: "Cyan"
    }),
    layouts: Object.freeze({
      freeform: "Freeform",
      "puzzle-2-rows": "Rows",
      "puzzle-2-cols": "Columns",
      "puzzle-3-rows": "Three rows",
      "puzzle-3-cols": "Three columns",
      "puzzle-3-top-wide": "One top, two bottom",
      "puzzle-3-bottom-wide": "Two top, one bottom",
      "puzzle-3-left-tall": "One left, two right",
      "puzzle-3-right-tall": "Two left, one right",
      "puzzle-3-hero-top": "Large top",
      "puzzle-3-hero-left": "Large left",
      "puzzle-4-even": "Four grid",
      "puzzle-4-rows": "Four rows",
      "puzzle-4-cols": "Four columns",
      "puzzle-4-top-wide": "One top, three bottom",
      "puzzle-4-bottom-wide": "Three top, one bottom",
      "puzzle-4-left-wide": "One left, three right",
      "puzzle-4-right-wide": "Three left, one right",
      "puzzle-4-bands": "Horizontal combination",
      "puzzle-4-hero-top": "Large top"
    })
  }),
  debugNode: Object.freeze({
    title: "API debug receiver",
    empty: "// Waiting for request payload...\n// (Click 🔧 Send on another generation node.)\n// You can select and copy this content."
  }),
  webReferenceCard: Object.freeze({
    openSource: "Open source",
    sourceLabel: "Web reference",
    openFailed: "Unable to open source page",
    noSelection: "No page text selected"
  }),
  audioVoicePanel: Object.freeze({
    title: "Voice Studio",
    betaBadge: "Beta",
    fabTitle: "Voice Studio",
    vip: Object.freeze({
      needAuthorization: "VIP authorization required. Activate your CDKEY first."
    }),
    close: "Close voice replacement panel",
    resizeLabel: "Resize voice replacement panel",
    sections: Object.freeze({
      source: "Media source",
      mode: "Voice source",
      sentences: "Sentence track"
    }),
    source: Object.freeze({
      empty: "No video or audio selected",
      emptyMeta: "Select a video or audio node",
      pickNotice: "Select a video or audio",
      localVideo: "Local video",
      canvasVideo: "Canvas video",
      localAudio: "Local audio",
      canvasAudio: "Canvas audio"
    }),
    modes: Object.freeze({
      clone: "Cloned voice",
      audioNode: "Audio node",
      keep: "Keep original"
    }),
    sentences: Object.freeze({
      extract: "Detect original sentences",
      voice: "Generate replacement voice",
      compose: "Compose new video",
      insertedSource: "New inserted segment, edit source text",
      sourcePlaceholder: "Source audio text pending",
      convertedPlaceholder: "Modified audio not generated",
      convertedSuffix: "after edit",
      analysisHint: "Click Analyze to split the video or audio into sentences"
    }),
    status: Object.freeze({
      pending: "Pending",
      detected: "Detected",
      notAnalyzed: "Not analyzed",
      analyzing: "Analyzing",
      edited: "Edited",
      generating: "Generating",
      stopping: "Stopping",
      translating: "Translating",
      composing: "Composing",
      merging: "Merging",
      composed: "Composed",
      ready: "Ready",
      removed: "Removed",
      detectedCount: "{count} sentences detected",
      noSource: "No video or audio selected",
      analysisFailed: "Analysis failed"
    }),
    progress: Object.freeze({
      "asr-runtime-check": "Checking local recognition runtime",
      "asr-runtime-manifest": "Reading local recognition runtime manifest",
      "asr-runtime-download": "Downloading local recognition runtime",
      "asr-runtime-extract": "Extracting local recognition runtime",
      "asr-runtime-verify": "Verifying local recognition runtime",
      "gpu-torch-check": "Checking GPU acceleration runtime",
      "gpu-torch-install": "Installing GPU acceleration runtime",
      "gpu-torch-verify": "Verifying GPU acceleration runtime",
      "model-download": "Preparing subtitle recognition model",
      "model-prepare": "Preparing audio for recognition",
      transcribe: "Recognizing subtitles",
      "diarization-model-download": "Downloading speaker separation model",
      "diarization-model-prepare": "Loading speaker separation model",
      diarize: "Separating speakers",
      slice: "Cutting sentence audio"
    }),
    labels: Object.freeze({
      sourceAudio: "Source audio",
      convertedAudio: "Modified audio"
    }),
    actions: Object.freeze({
      loadSelected: "Load video/audio",
      startAnalyze: "Analyze",
      startAnalyzeTooltip: "First run may download models. Analyze recognizes speech and cuts sentence audio.",
      more: "More options",
      playAudio: "Preview audio",
      generateAudio: "Generate audio",
      editSource: "Edit source audio",
      editSourceTooltip: "Edit source audio: trim or split audio. Each segment is used as a voice-clone reference; at least 3 seconds per segment is recommended.",
      alignSourceText: "Align source text",
      history: "History",
      generate: "Generate",
      translate: "Translate",
      translateTooltip: "Translate all or selected sentences into another language",
      cancelGeneration: "Cancel generation",
      batchAudioInputParam: "Batch change audio input",
      batchAudioInputParamDisabled: "Select sentence tracks before changing audio input",
      batchGenerate: "Batch generate",
      batchGenerateTooltip: "Generate modified audio for every sentence track",
      selectedGenerate: "Generate selected",
      selectedGenerateTooltip: "Generate modified audio only for selected sentence tracks",
      stopBatchGeneration: "Stop batch generation",
      composeAll: "Compose",
      composeAllTooltip: "Compose sentence audio back into the source video or audio by timecode",
      recomposeTooltip: "Composed. Click to compose again",
      segmentModel: "Single sentence model",
      useGlobalModel: "Use global model",
      segmentModelWithName: "Single sentence model: {model}",
      globalSettings: "Global model",
      globalModelWithName: "Global model: {model}",
      subtitleRecognitionWithName: "Subtitle recognition: {provider}",
      segmentGrid: "Segment layout",
      audioInputParam: "Audio input",
      changeAudioInputParam: "Change audio input",
      voiceCloneInputParam: "Click to add voice-line reference",
      changeVoiceCloneInputParam: "Change voice clone input",
      clearVoiceCloneInputParam: "Clear voice clone input",
      imitateTone: "Imitate tone",
      imitateToneTooltip: "When enabled, it imitates the original sentence tone",
      toneCloneBadge: "Voice conversion",
      merge: "Merge",
      insertSegment: "Insert segment"
    }),
    settings: Object.freeze({
      subtitleRecognition: "Subtitle recognition",
      voiceModel: "Voice model",
      noModels: "No voice models available"
    }),
    asrProviders: Object.freeze({
      doubao: Object.freeze({
        label: "Volcengine Speech",
        subtitle: "Audio-file recognition big model with automatic multilingual speaker recognition"
      }),
      funasr: Object.freeze({
        label: "Local",
        subtitle: "Local offline recognition"
      })
    }),
    asrApiKeyHelp: Object.freeze({
      missingTitle: "Volcengine Speech API key is missing",
      invalidTitle: "Volcengine Speech API key is unavailable",
      missingMessage: "Subtitle recognition is set to Volcengine Speech, but the X-Api-Key is empty.",
      invalidMessage: "Volcengine Speech connection test failed. Use the X-Api-Key from the Speech API key page, not a Volcengine Ark key, and confirm audio-file recognition is enabled.",
      howToGet: "How to get an API key",
      openSettings: "Open settings",
      close: "Close",
      guideTitle: "How to get a Volcengine Speech X-Api-Key",
      guideSubtitle: "Based on the official Volcengine Speech console guide: subtitle recognition uses the audio-file recognition big model (bigmodel), while dubbing and voice generation also need Speech Synthesis 2.0 and Doubao Audio Generation 1.0. These use the Volcengine Speech X-Api-Key, not a Volcengine Ark key.",
      guideAlt: "Long guide image for getting a Volcengine Speech X-Api-Key",
      guideOfficialKey: "Setup steps",
      guideNote1: "Sign in to the Volcengine console, open Doubao/Volcengine Speech, and enable Audio-file Recognition 2.0, Speech Synthesis 2.0, and Doubao Audio Generation 1.0.",
      guideNote2: "Open API Key Management, then create or copy the X-Api-Key and grant it speech recognition, speech synthesis, and Doubao audio generation access.",
      guideNote3: "Return to SHUO Canvas Settings > API Key > Volcengine Speech, paste the X-Api-Key, and run the connection test.",
      guideNote4: "If the key is leaked or wrong, disable or delete it in the official console and create a new one.",
      openConsole: "Open API Key Management"
    }),
    translationApiKeyHelp: Object.freeze({
      missingTitle: "Volcengine Ark API key is missing",
      invalidTitle: "Translation model is not enabled or the API key is unavailable",
      missingMessage: "Sentence translation uses a Volcengine Ark Doubao text model, but no API key is configured.",
      invalidMessage: "The sentence translation model is unavailable. Enable the corresponding Doubao text model in Volcengine Ark and enter a valid API key in settings.",
      howToGet: "How to get an API key",
      openSettings: "Open settings",
      close: "Close"
    }),
    toolbar: Object.freeze({
      selectAll: "Select all",
      cancelSelectAll: "Clear selection",
      voice: "Voice",
      speed: "Speed",
      convertLanguage: "Convert language"
    }),
    translation: Object.freeze({
      menuLabel: "Choose translation target language",
      confirmTitle: "Confirm translation",
      confirmAll: "Translate all {count} sentences into {language}?",
      confirmSelected: "Translate the selected {count} sentences into {language}?",
      cancel: "Cancel",
      confirm: "Start translation",
      languages: Object.freeze({
        zhCN: "Simplified Chinese",
        en: "English",
        ja: "Japanese",
        ko: "Korean",
        es: "Spanish",
        fr: "French",
        de: "German",
        pt: "Portuguese"
      })
    }),
    history: Object.freeze({
      empty: "No generated audio yet",
      play: "Preview history audio",
      itemTitle: "Generated audio {index}"
    }),
    menu: Object.freeze({
      useGenerated: "Use generated audio",
      useSource: "Use original audio",
      downloadSource: "Download original audio",
      downloadConverted: "Download converted audio",
      remove: "Remove this voice segment"
    }),
    toasts: Object.freeze({
      selectVideo: "Select a video node first",
      selectSource: "Select a video or audio node first",
      pipelinePending: "Voice Studio pipeline is not connected yet",
      playPending: "Audio preview is not connected yet",
      sourcePickStarted: "Pick a video or audio node on the canvas",
      sourcePickCancelled: "Video/audio picking cancelled",
      sourcePickUnsupported: "Pick a video or audio node",
      videoPickStarted: "Pick a video node on the canvas",
      videoPickCancelled: "Video picking cancelled",
      videoPickUnsupported: "Pick a video node",
      audioPickStarted: "Pick an audio node on the canvas",
      audioPickCancelled: "Audio input picking cancelled",
      audioPickUnsupported: "Pick an audio node",
      audioPickInvalid: "The selected audio node has no local audio",
      audioPickSelected: "Audio input selected",
      audioPickBatchSelected: "Audio input applied to {count} sentences",
      selectSentenceForVoice: "Select sentence tracks before changing audio input",
      invalidVideoSource: "The selected video has no local source yet",
      invalidSource: "The selected video or audio has no local source yet",
      analysisComplete: "Analyzed {count} segments",
      analysisFailed: "Voice analysis failed",
      asrConfigReadFailed: "Failed to read Volcengine Speech config. Open settings and check the API key.",
      asrApiKeyMissing: "Set the Volcengine Speech X-Api-Key in Settings > API Key first. Do not use a Volcengine Ark key.",
      asrApiKeyInvalid: "The Volcengine Speech ASR key is invalid. Use the X-Api-Key from the Speech API key page, not an Ark key, and confirm ASR audio-file recognition is enabled.",
      asrPermissionDenied: "The Volcengine Speech ASR key has no audio-file recognition permission. Enable the Speech service and ASR access for this key.",
      noSubtitlesDetected: "No subtitles recognized. Sentence splitting used silence only.",
      sourceClipApplied: "Source audio split applied",
      sourceClipFailed: "Source audio split failed",
      mergeChanged: "The sentence content changed, so this merge was cancelled",
      sourceClipNeedsAnalysis: "Analyze the source audio before splitting it",
      noTranslationText: "There is no sentence text to translate",
      translationConfigReadFailed: "Failed to read the Volcengine Ark config. Open settings and check the API key.",
      translationComplete: "Translated {count} sentences into {language}",
      translationFailed: "Sentence translation failed",
      translationFailedWithMessage: "Sentence translation failed: {message}",
      translationStale: "The sentence text or source changed, so this translation was not applied",
      generateComplete: "Generated replacement audio",
      generationCompleteSingle: "Voice generation completed.",
      generationCompleteBatch: "All {count} voice clips have been generated.",
      generationBatchSettled: "Voice generation finished: {succeeded} succeeded, {incomplete} incomplete.",
      generateFailed: "Audio generation failed",
      generationCancelled: "Audio generation cancelled",
      batchCancellationRequested: "Queued generation stopped. Finishing active tasks.",
      composeNeedsMoreAudio: "At least one sentence audio is needed to compose",
      composeFailed: "Audio composition failed",
      noGenerateTargets: "No sentence audio can be generated",
      missingVoiceRefAudio: "Select a voice-line reference audio input first",
      missingSecondVoiceRefAudio: "Select a voice clone audio input for this model first",
      missingSourceAudio: "This model needs source audio for the segment",
      voiceCloneUnsupported: "The current model does not support voice cloning",
      missingPromptText: "Enter source or modified text before generating",
      unsupportedVoiceModel: "This voice model is not supported here yet",
      audioMissing: "No playable audio for this segment",
      playUnavailable: "Audio playback is unavailable in this environment",
      playFailed: "Unable to play audio",
      localSaveGeneratedFailed: "Generated, but local save failed",
      operationFailed: "Operation failed"
    })
  }),
  sceneDetectionNode: Object.freeze({
    title: "Scene Detection",
    input: Object.freeze({
      videoSource: "Video source",
      dropVideoHere: "Drag a video node here"
    }),
    settings: Object.freeze({
      sensitivity: "Detection sensitivity",
      low: "Low",
      high: "High"
    }),
    results: Object.freeze({
      placeholder: "Click Start Detection to analyze video scenes",
      countPrefix: "Detected",
      countSuffix: "scenes"
    }),
    actions: Object.freeze({
      startDetection: "Start Detection",
      detecting: "Detecting...",
      autoClip: "Auto clip",
      exportScenes: "Export scenes",
      clip: "Clip"
    }),
    timeline: Object.freeze({
      changeAt: "Scene change: {time}"
    }),
    scene: Object.freeze({
      label: "Scene {index}"
    }),
    export: Object.freeze({
      unknownVideo: "Unknown video"
    }),
    toasts: Object.freeze({
      connectVideoFirst: "Connect a video source first",
      invalidVideoSource: "Invalid video source",
      detected: "Detected {count} scenes",
      detectFailed: "Scene detection failed. Try again.",
      createdClipNodes: "Created {count} clip nodes",
      createdSceneClipNode: "Created clip node for scene {index}",
      exported: "Scene data exported"
    })
  }),
  imageCrop: Object.freeze({
    actions: Object.freeze({
      exit: "Exit (Esc)",
      confirm: "Confirm crop",
      processing: "Processing..."
    }),
    ratios: Object.freeze({
      free: "Free ratio",
      original: "Original ratio"
    }),
    output: Object.freeze({
      imageFallback: "image",
      nodeName: "Cropped from {name}"
    }),
    errors: Object.freeze({
      sourceLoadFailed: "Failed to load source image"
    }),
    toasts: Object.freeze({
      success: "Crop completed",
      failed: "Crop failed: {error}"
    })
  }),
  imageMatting: Object.freeze({
    tooltips: Object.freeze({
      cancel: "Cancel (Esc)",
      brush: "Brush B (press again to switch mode)",
      brushNormal: "Brush B (press again to switch mode)",
      brushNormalToggle: "Brush (click to switch mode)",
      brushAlphaToggle: "Alpha mask brush (click to switch mode)",
      eraser: "Eraser E",
      bucket: "Paint bucket G",
      undo: "Undo Ctrl+Z",
      redo: "Redo Ctrl+Y",
      clear: "Clear R",
      save: "Save"
    }),
    actions: Object.freeze({
      save: "Save",
      saving: "Saving..."
    }),
    errors: Object.freeze({
      canvasExportFailed: "Canvas export failed",
      imageLoadFailed: "Image load failed"
    }),
    toasts: Object.freeze({
      noImage: "No image available for matting",
      cancelled: "Matting cancelled",
      saveFailed: "Save failed"
    })
  }),
  imageAnnotate: Object.freeze({
    toolbar: Object.freeze({
      cancel: "Cancel",
      brush: "Brush",
      rect: "Rectangle",
      bucket: "Paint bucket G",
      text: "Text",
      eraser: "Eraser",
      numberLabel: "Number label",
      color: "Color",
      flipHorizontal: "Flip horizontal",
      flipVertical: "Flip vertical",
      undo: "Undo Ctrl+Z",
      redo: "Redo",
      clear: "Clear R",
      newBoard: "New board",
      generate: "Generate",
      repaintPlaceholder: "Example: turn the selected person into a puppy",
      debugApiParams: "Debug API parameters"
    }),
    colors: Object.freeze({
      red: "Red",
      orange: "Orange",
      yellow: "Yellow",
      green: "Green",
      blue: "Blue",
      purple: "Purple",
      black: "Black",
      white: "White"
    }),
    actions: Object.freeze({
      save: "Save",
      generate: "Generate",
      saving: "Saving...",
      generating: "Generating..."
    }),
    debug: Object.freeze({
      nodeName: "Debug node",
      shown: "Final API parameters shown",
      buildRequestFailed: "Failed to build request: {error}"
    }),
    errors: Object.freeze({
      imageLoadFailed: "Image load failed"
    }),
    output: Object.freeze({
      baseImage: "Image",
      repaintName: "{baseName} repaint",
      eraseName: "{baseName} erase",
      annotateName: "{baseName} annotate",
      repaintCreated: "Repaint image node created",
      eraseCreated: "Erase image node created",
      annotateCreated: "Annotated image node created"
    }),
    toasts: Object.freeze({
      noImage: "No image available to annotate",
      cancelled: "Annotation cancelled",
      newBoard: "Switched to a new board",
      saveFailed: "Save failed"
    })
  }),
  videoReverse: Object.freeze({
    fallback: Object.freeze({
      video: "video"
    }),
    output: Object.freeze({
      nodeName: "Reversed video: {name}"
    }),
    status: Object.freeze({
      processing: "Reversing video"
    }),
    errors: Object.freeze({
      incompleteResult: "Video reverse returned an incomplete result"
    }),
    toasts: Object.freeze({
      unsupportedNode: "This node does not support video reverse",
      videoBusy: "This video is processing. Try again later.",
      notLocalFile: "This video is not a processable local file",
      running: "Reversing video...",
      completed: "Video reverse complete. New video node created.",
      failed: "Video reverse failed",
      failedWithError: "Video reverse failed: {error}"
    })
  }),
  groupExecution: Object.freeze({
    groupNotFound: "No executable group node found",
    groupNoExecutable: "No executable generation nodes in this group",
    groupTriggered: "Triggered {count} generation nodes in the group",
    groupRunning: "Generation nodes in this group are already running",
    groupNoTriggerable: "No triggerable generation buttons in this group",
    groupCancelTriggered: "Requested cancellation for {count} group generation nodes",
    selectedCancelTriggered: "Requested cancellation for {count} selected generation nodes",
    selectedNoExecutable: "No executable generation nodes selected",
    selectedTriggered: "Triggered {count} selected generation nodes",
    selectedRunning: "Selected generation nodes are already running",
    selectedNoTriggerable: "No triggerable generation buttons in the selection",
    stopSelected: "Stop selected generation"
  }),
  imageGridCrop: Object.freeze({
    errors: Object.freeze({
      canvasBlobFailed: "Canvas toBlob failed",
      canvasCorsBlocked: "Canvas export blocked (CORS)",
      localImageLoadFailed: "Failed to load local source image",
      noImage: "No image available to crop",
      localFileReadFailed: "Failed to read local file. Check whether it still exists.",
      sourceMaybeRemoved: "Failed to load source image. The local file may have been removed.",
      sourceNodeMissing: "Source node not found"
    }),
    output: Object.freeze({
      nodeName: "Crop {row}-{col}"
    })
  }),
  imageExpand: Object.freeze({
    ratio: Object.freeze({
      original: "Original ratio",
      selectedOriginal: "Ratio"
    }),
    actions: Object.freeze({
      exit: "Exit (Esc)",
      debugApiParams: "Debug API parameters",
      generate: "Generate expansion"
    }),
    task: Object.freeze({
      submitting: "Submitting",
      generating: "Generating",
      completed: "Completed",
      failed: "Generation failed"
    }),
    output: Object.freeze({
      promptDisplay: "Remove the green area and generate matching scene content inside it",
      started: "Model: {model}\nPrompt: {prompt}",
      failed: "Model: {model}\nPrompt: {prompt}\nError: {error}",
      generatingName: "Expanding...",
      failedName: "Expansion failed",
      resultName: "Expanded image"
    }),
    debug: Object.freeze({
      nodeName: "Debug node"
    }),
    errors: Object.freeze({
      createExpandedImageFailed: "Unable to create the expanded image",
      sourceImageLoadFailed: "Unable to load the source image",
      unknown: "Unknown error"
    }),
    toasts: Object.freeze({
      sourceNodeMissing: "Source node not found. Unable to build debug parameters.",
      debugShown: "Expansion API parameters shown",
      debugBuildFailed: "Failed to build debug parameters: {error}",
      generating: "Generating expansion...",
      success: "Expansion generated successfully",
      failed: "Expansion failed: {error}"
    })
  }),
  imageFreeAngle: Object.freeze({
    runningTask: Object.freeze({
      clickCancel: "Click to cancel",
      cancel: "Cancel",
      clickCancelTask: "Click to cancel task"
    }),
    actions: Object.freeze({
      exit: "Exit",
      exitControl: "Exit angle control",
      reset: "Reset",
      debugApiParams: "Debug API parameters",
      generate: "Generate"
    }),
    panel: Object.freeze({
      title: "Drag the cube to change angle"
    }),
    cube: Object.freeze({
      back: "Back",
      right: "Right",
      left: "Left",
      top: "Top",
      bottom: "Bottom"
    }),
    controls: Object.freeze({
      rotation: "Horizontal angle",
      pitch: "Vertical angle",
      distance: "Distance"
    }),
    task: Object.freeze({
      submitting: "Submitting",
      generating: "Generating",
      completed: "Completed",
      failed: "Generation failed"
    }),
    output: Object.freeze({
      generatingName: "Rotating...",
      resultName: "Rotation result",
      failedName: "Generation failed",
      angle: "Model: {model}\nCamera angle: rotate {rotation}° · pitch {pitch}° · zoom {scale}",
      failedReason: "Failure reason: {error}"
    }),
    debug: Object.freeze({
      nodeName: "Debug node"
    }),
    errors: Object.freeze({
      noGeneratedImageUrl: "Unable to get generated image URL",
      unknown: "Unknown error"
    }),
    toasts: Object.freeze({
      success: "Image generated successfully",
      failed: "Generation failed: {error}",
      debugBuildFailed: "Failed to build debug parameters: {error}"
    })
  }),
  aigenVideoNode: Object.freeze({
    vip: Object.freeze({
      modelFallback: "this model"
    }),
    upload: Object.freeze({
      noFileUrl: "Upload failed: no file URL returned",
      anchorMissing: "Upload failed: anchor node not found",
      videoOnly: "Only video files can be uploaded here",
      imageOnly: "Only image files can be uploaded here",
      audioOnly: "Only audio files can be uploaded here",
      unsupportedAsset: "This slot does not support this asset type",
      failedRetry: "Upload failed. Try again."
    }),
    inputNames: Object.freeze({
      maskVideo: "Mask video",
      sourceVideo: "Source video",
      sourceAudio: "Source audio"
    }),
    prompt: Object.freeze({
      placeholder: "Describe the video, @ reference assets, or type / for commands..."
    }),
    ratio: Object.freeze({
      adaptive: "Adaptive"
    }),
    help: Object.freeze({
      ariaLabel: "Generation node help"
    })
  }),
  videoTask: Object.freeze({
    controls: Object.freeze({
      generateTitle: "Generate video",
      cancelTooltip: "Click generate again to cancel the running task",
      cancelGenerateAria: "Cancel video generation"
    }),
    task: Object.freeze({
      queueing: "Queueing",
      backgroundQueueing: "Queueing (background polling)",
      submitting: "Submitting",
      generating: "Generating",
      completed: "Completed",
      queryFailed: "Query failed",
      staleRecoveryStopped: "The historical task status could not be confirmed, so background polling was stopped: {message}",
      generationFailed: "Generation failed",
      generationCancelled: "Generation cancelled",
      videoGenerationFailed: "Video generation failed"
    }),
    validation: Object.freeze({
      localVideoMissing: "The local video file is missing. Select or upload it again: {path}",
      removePromptVideoRefs: ", remove @video references from the prompt",
      imageModeRejectsVideo: "Image-to-video mode does not accept video inputs{hint}",
      imageModeNeedsFirstFrame: "Image-to-video mode needs 1 first-frame image",
      referenceImageModeRejectsVideo: "Reference image-to-video mode does not accept video inputs{hint}",
      referenceImageModeNeedsReference: "Reference image-to-video mode needs at least 1 reference image",
      videoEditNeedsVideo: "Video edit mode needs 1 video input",
      videoEditNeedsSourceVideo: "Video edit mode needs 1 source video input",
      videoEditRejectsImageUseReferenceVideo: "Video edit mode does not support image inputs. Use a reference video.",
      videoEditRejectsImage: "Video edit mode does not support image inputs",
      videoEditRejectsAudio: "Video edit mode does not support audio inputs",
      videoExtendRejectsImage: "Video extension mode does not accept image inputs{hint}",
      videoExtendRejectsAudio: "Video extension mode does not support audio inputs",
      referenceVideoNeedsMedia: "Reference video mode needs a reference image or video",
      referenceAudioNeedsImage: "Reference video audio needs a reference image for voice style",
      mediaInputLimits: Object.freeze({
        maxImages: "Image inputs cannot exceed {max} files",
        maxVideos: "Video inputs cannot exceed {max} files",
        maxAudios: "Audio inputs cannot exceed {max} files",
        maxTotalVideoSeconds: "The total duration of video inputs cannot exceed {max}s",
        maxTotalAudioSeconds: "The total duration of audio inputs cannot exceed {max}s",
        minImageSeconds: "Each image input must be at least {min}s",
        maxImageSeconds: "Each image input cannot exceed {max}s",
        minVideoSeconds: "Each video input must be at least {min}s",
        maxVideoSeconds: "Each video input cannot exceed {max}s",
        minAudioSeconds: "Each audio input must be at least {min}s",
        maxAudioSeconds: "Each audio input cannot exceed {max}s",
        invalidImageExtension: "Unsupported image format. Use one of: {allowed}",
        invalidVideoExtension: "Unsupported video format. Use one of: {allowed}",
        invalidAudioExtension: "Unsupported audio format. Use one of: {allowed}",
        maxImageMegabytes: "Each image input cannot exceed {max} MB",
        maxVideoMegabytes: "Each video input cannot exceed {max} MB",
        maxAudioMegabytes: "Each audio input cannot exceed {max} MB"
      }),
      happyHorse: Object.freeze({
        promptRequired: "HappyHorse 1.0 requires a prompt",
        chooseMode: "Choose a HappyHorse 1.0 mode before generating",
        editUnsupported: "The current HappyHorse model does not support video edit mode. Use image-to-video or reference image-to-video instead.",
        editVideoMaxSeconds: "HappyHorse 1.0 video edit input cannot exceed {seconds}s. Trim it before generating."
      }),
      wan27: Object.freeze({
        audioDuration: "Wan2.7 audio must be 2-30s. Replace or trim it before generating.",
        audioSize: "Wan2.7 audio must be under 15MB. Compress it before generating.",
        extendMaxSeconds: "Wan2.7 video extension input cannot exceed 10s. Trim it before generating.",
        referenceVideoMaxSeconds: "Wan2.7 reference video cannot exceed 30s. Trim it before generating.",
        editVideoDuration: "Wan2.7 edit source video must be 2-10s. Trim it before generating."
      }),
      klingV3Omni: Object.freeze({
        editVideoDuration: "Kling V3 Omni edit source video must be 3-10s. Trim it before generating."
      }),
      klingO1: Object.freeze({
        editAndFeatureExclusive: "Kling O1 edit video and feature reference video cannot both be connected",
        onlyOneVideo: "Kling O1 supports only 1 video. Keep either the edit video or feature reference video.",
        referenceVideoDuration: "Kling O1 reference video must be 3-10s. Trim it before generating.",
        editVideoRejectsImage: "Kling O1 edit video cannot also use reference images. Remove reference images before generating.",
        featureVideoMaxOneImage: "Kling O1 feature reference video can use only 1 reference image at the same time"
      })
    }),
    cancel: Object.freeze({
      missingApiKey: "Cancel failed: missing API Key",
      interruptedNoTaskId: "Generation interrupted: task ID has not returned yet",
      failed: "Cancel failed",
      success: "Cancel succeeded",
      taskNotFound: "Task not found",
      interrupted: "Generation interrupted"
    }),
    errors: Object.freeze({
      missingAsyncResumeModelOrProvider: "Missing model or provider information required to resume async video"
    }),
    toasts: Object.freeze({
      localSaveFailed: "Video generated, but saving locally to output failed: {error}",
      missingInstallId: "Missing installId. Refresh and try subscription verification again.",
      subscriptionSyncing: "Subscription status is syncing. Try again shortly.",
      dreaminaBackgroundQueueing: "Dreamina has been queueing for a while. Switched to background polling.",
      smartMultiframeUnavailable: "Smart multi-frame is not available yet"
    })
  }),
  panoramaSceneNode: Object.freeze({
    defaults: Object.freeze({
      sceneNodeName: "3D Stage",
      panorama360NodeName: "360 Panorama"
    }),
    toolbar: Object.freeze({
      edit: "Edit",
      closeEdit: "Close edit",
      uploadPanorama: "Upload panorama",
      fullscreen: "Fullscreen",
      exitFullscreen: "Exit fullscreen",
      collapse: "Collapse",
      expand: "Expand",
      mouse: "Mouse",
      mouseMode: "Mouse mode",
      boxSelectMouse: "Box select",
      flyMode: "Fly mode [Shift+F]",
      frameSelection: "Frame selection [F]",
      move: "Move",
      rotate: "Rotate",
      scale: "Scale",
      switchEnvironment: "Switch environment",
      switchToNight: "Switch to night",
      switchToDay: "Switch to day",
      createCube: "Create cube",
      assetLibrary: "Scene assets",
      mannequin: "Mannequin",
      poseEditor: "Mannequin pose",
      grid: "Grid layout",
      capture: "Screenshot",
      captureWithMode: "Screenshot · {mode}",
      createCameraBookmark: "Create camera bookmark",
      cameraTimeline: "Camera timeline",
      transformWorld: "World space",
      transformLocal: "Local space",
      snap: "Snap",
      groundLock: "Ground lock",
      uniformScale: "Uniform scale",
      focus: "Focal length",
      resetView: "Reset view"
    }),
    assets: Object.freeze({
      title: "Scene assets ({count})",
      categoryAria: "Asset category",
      searchPlaceholder: "Search assets",
      searchAria: "Search scene assets",
      empty: "No matching assets",
      categories: Object.freeze({
        all: "All",
        architecture: "Architecture",
        furniture: "Furniture",
        stage: "Stage",
        props: "Props",
        nature: "Nature"
      })
    }),
    poseEditor: Object.freeze({
      title: "Mannequin pose",
      presetAria: "Pose preset",
      custom: "Custom",
      boneAria: "Character bone",
      saveCustom: "Save custom pose",
      customName: "Custom pose {suffix}",
      bones: Object.freeze({
        root: "Root",
        pelvis: "Pelvis",
        spine_01: "Lower spine",
        spine_02: "Spine",
        spine_03: "Upper spine",
        neck_01: "Neck",
        Head: "Head",
        clavicle_l: "Left clavicle",
        clavicle_r: "Right clavicle",
        upperarm_l: "Left upper arm",
        upperarm_r: "Right upper arm",
        lowerarm_l: "Left forearm",
        lowerarm_r: "Right forearm",
        hand_l: "Left hand",
        hand_r: "Right hand",
        thigh_l: "Left thigh",
        thigh_r: "Right thigh",
        calf_l: "Left lower leg",
        calf_r: "Right lower leg",
        foot_l: "Left foot",
        foot_r: "Right foot"
      })
    }),
    cameraTimeline: Object.freeze({
      play: "Play",
      pause: "Pause",
      playAria: "Play camera animation",
      pauseAria: "Pause camera animation",
      addKeyframe: "Add keyframe",
      addKeyframeAria: "Add camera keyframe",
      trackAria: "Camera timeline",
      duration: "Duration (seconds)",
      durationAria: "Animation duration in seconds",
      fps: "Frame rate",
      fpsAria: "Camera animation frame rate",
      loop: "Loop",
      keyframeTitle: "{time}, frame {frame}",
      keyframeAria: "Camera keyframe at {time}, frame {frame}"
    }),
    contextMenu: Object.freeze({
      deleteObject: "Delete object"
    }),
    capture: Object.freeze({
      modes: Object.freeze({
        adaptive: "Adaptive",
        vertical: "9:16",
        cinema: "2.35:1"
      }),
      modeAria: "Screenshot ratio {label}",
      nodeName: "Scene screenshot",
      pending: "Screenshot in progress",
      noImage: "No screenshot image was captured",
      success: "Screenshot source image node created",
      saveInvalidPath: "Screenshot is visible, but local save did not return a valid path",
      localSaveFailed: "Local save failed",
      localSaveWarning: "Screenshot is visible, but local save failed",
      failed: "Screenshot failed",
      failedWithError: "Screenshot failed: {error}"
    }),
    camera: Object.freeze({
      bookmarkAria: "Camera bookmark {slot}",
      deleteBookmark: "Delete camera bookmark",
      defaultName: "Camera {slot}",
      fallbackName: "Camera",
      limitWarning: "You can create up to {count} cameras"
    }),
    focus: Object.freeze({
      title: "Focal length",
      sliderAria: "Current camera focal length"
    }),
    grid: Object.freeze({
      title: "Grid layout",
      rows: "Rows",
      cols: "Columns",
      spacingX: "Spacing X",
      spacingZ: "Spacing Z",
      gender: "Gender",
      color: "Color",
      rowsAria: "Row count",
      colsAria: "Column count",
      spacingXAria: "Spacing X in meters",
      spacingZAria: "Spacing Z in meters",
      setGenderAria: "Use {label} mannequin",
      setColorAria: "Set {label} color",
      apply: "Create layout"
    }),
    mannequin: Object.freeze({
      title: "Create mannequin",
      setGenderAria: "Choose {label} mannequin",
      createColorAria: "Create {label} mannequin",
      genders: Object.freeze({
        male: "male",
        female: "female"
      }),
      colors: Object.freeze({
        red: "red",
        green: "green",
        blue: "blue",
        yellow: "yellow",
        purple: "purple",
        cyan: "cyan",
        white: "white"
      })
    }),
    status: Object.freeze({
      cameraSelected: "Camera selected",
      objectSelected: "Object selected",
      noObjectSelected: "No object selected",
      panoramaMode: "Panorama mode",
      sceneMode: "Scene mode",
      editing: "Editing · {mode} · {selection}",
      collapsed: "Collapsed",
      normalNode: "Normal node"
    }),
    hint: Object.freeze({
      doubleClickEdit: "Double-click to edit",
      clickEditPanorama: "Click Edit to enter panorama",
      clickEditScene: "Click Edit to enter scene",
      panoramaControls: "Drag to rotate view, scroll to zoom",
      boxSelect: "Box select: drag to select objects",
      flyControls: "Fly: right-drag to look, WASD move, Q/E descend/ascend, Shift boosts",
      defaultMouse: "Mouse: drag empty space to orbit, drag objects on XZ"
    }),
    upload: Object.freeze({
      unsupportedNode: "3D Stage does not support panorama upload. Use a 360 Panorama node.",
      ratioWarning: "This image is {width}×{height} (ratio {ratio}), not a standard 2:1 panorama. It may appear stretched.",
      success: "Panorama uploaded",
      failed: "Upload failed",
      failedWithError: "Panorama upload failed: {error}"
    }),
    errors: Object.freeze({
      unknown: "Unknown error",
      captureCropFailed: "Failed to crop screenshot",
      captureExportFailed: "Failed to export screenshot",
      panoramaLoadFailed: "Failed to load panorama",
      pngNormalizeFailed: "Failed to normalize 360 panorama PNG",
      pngSaveInvalidPath: "PNG save failed: no valid path returned",
      panoramaImageInputMissing: "360 Panorama is missing a usable image input",
      readPanoramaInputFailed: "Failed to read 360 panorama input: {error}",
      panoramaInputEmpty: "Failed to read 360 panorama input: empty response",
      panoramaPngConvertFailed: "Failed to normalize 360 panorama PNG: unable to convert to PNG"
    })
  }),
  audioClip: Object.freeze({
    controls: Object.freeze({
      cancel: "Cancel",
      split: "Split",
      undoSplit: "Undo split",
      done: "Done"
    }),
    helpers: Object.freeze({
      cancel: "Cancel",
      playPauseRange: "Play/pause range",
      moveRange: "Move trim range",
      moveRangeLarge: "Move trim range by larger steps",
      setInOut: "Set in/out points",
      fineTuneIn: "Fine-tune in point",
      fineTuneOut: "Fine-tune out point",
      wheelKey: "Wheel",
      sameAsArrows: "Same as arrow keys",
      doubleClickSelection: "Double-click selection",
      restoreDefault: "Restore default 3s"
    }),
    status: Object.freeze({
      loading: "Loading..."
    }),
    output: Object.freeze({
      audioFallback: "audio",
      nodeName: "Clipped from {name}"
    }),
    errors: Object.freeze({
      cutApiMissing: "Backend endpoint missing: /api/v2/audio/cut (restart server.py)",
      cutFailed: "Audio clipping failed"
    }),
    toasts: Object.freeze({
      uploadFirst: "Upload audio first",
      playerMissing: "Audio player not found",
      cutting: "Cutting audio on backend...",
      splitAtMiddle: "Move the playhead inside the selected range before splitting",
      success: "Audio clip created as a new file",
      failed: "Audio clipping failed: {error}",
      cancelled: "Audio clipping cancelled"
    })
  }),
  videoKeying: Object.freeze({
    models: Object.freeze({
      keying: "RH video keying",
      remove: "RH video removal"
    }),
    status: Object.freeze({
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      failed: "Failed"
    }),
    output: Object.freeze({
      withTask: "Model: {model}\nTask: {taskId}\nStatus: {status}",
      status: "Model: {model}\nStatus: {status}",
      failed: "Model: {model}\nStatus: {status}\nReason: {reason}",
      removeGeneratingName: "Video removal generating...",
      removeResultName: "Video removal result",
      removeFailedName: "Video removal failed",
      keyingResultName: "Keying result {name}",
      videoFallback: "video"
    }),
    tools: Object.freeze({
      cancel: "Cancel",
      brush: "Brush",
      eraser: "Eraser",
      undo: "Undo",
      redo: "Redo",
      clear: "Clear",
      clearAll: "Clear all",
      keying: "Keying",
      remove: "Video removal",
      settings: "Settings"
    }),
    hint: Object.freeze({
      removeTitle: "Video removal",
      shortcutPrefix: "  ·  Shortcuts: ",
      wheelBrushSize: "  ·  Mouse wheel adjusts brush size",
      leftClick: "Left click",
      selectTarget: "select target",
      rightClick: "Right click",
      excludeTarget: "exclude target",
      clearAllPoints: "Clear all points"
    }),
    helper: Object.freeze({
      meta: "FPS: {fps} · Resolution: {resolution} · Frame: {frameIndex}"
    }),
    settings: Object.freeze({
      title: "Parameters",
      resolution: "Resolution",
      resolutionTip: "Higher resolution preserves more detail and steadier edges.\nIt also uses more VRAM and takes longer to generate.",
      fps: "Frame rate",
      fpsValue: "{fps} fps",
      fpsTip: "Higher frame rate makes motion smoother and more continuous.\nIt also generates more slowly and costs more.\n24 fps is common; choose 16 fps for faster or cheaper runs, or 30 fps for smoother motion.",
      maskMode: "Keying mode",
      maskModeTip: "Sec: default mode for most keying tasks.\nSam3: better for complex subjects or finer edges.\nMA2: compatible with the legacy MatAnyone2 workflow.",
      vram: "VRAM",
      vramTip: "48G can run larger resolutions or more frames, at 2x cost.",
      debugParams: "Debug parameters"
    }),
    errors: Object.freeze({
      maskSizeInvalid: "Unable to calculate the video removal mask size",
      noBrush: "Paint the area to remove on the video first",
      maskCanvasUnavailable: "Unable to create the video removal mask",
      noVideoUrl: "No video URL returned",
      removeMaskFailed: "Failed to generate the video removal mask",
      removeFailed: "Video removal failed",
      keyingFailed: "Keying failed",
      maskExportFailed: "Unable to export the removal mask",
      unknown: "Unknown error"
    }),
    debug: Object.freeze({
      nodeName: "Debug node"
    }),
    toasts: Object.freeze({
      connectSourceVideoFirst: "Connect a source video first",
      configReadFailed: "Failed to read RunningHub config. Open settings and check the API Key.",
      apiKeyMissing: "Add the RunningHub API Key in settings first",
      removeSuccess: "Video removal generated successfully",
      removeFailed: "Video removal failed: {error}",
      sourceVideoTooLarge: "The trimmed video is still over {maxMB}MB. Keep trimming or compress it.",
      keyingSubmitting: "Submitting RH video keying task...",
      keyingSuccess: "Keying complete. New video created.",
      keyingFailed: "Keying failed: {error}",
      keyingCancelled: "Cancelled the keying task for this video",
      removeCancelled: "Cancelled the removal task for this video",
      clearedPoints: "All points cleared",
      debugBuildFailed: "Failed to build debug parameters: {error}",
      debugRemoveShown: "RH video removal request parameters shown",
      debugKeyingShown: "RH keying request parameters shown",
      debugFailed: "Debug failed: {error}",
      removeClosed: "Video removal closed",
      keyingClosed: "Keying closed"
    })
  }),
  devEntry: Object.freeze({
    buttons: Object.freeze({
      dev: "Dev",
      preview: "Preview",
      upload: "Upload",
      updatePreview: "Update Preview"
    }),
    titles: Object.freeze({
      devOn: "Developer mode is on. Click to turn it off.",
      devOff: "Turn on developer mode",
      previewOn: "Preview mode is on. Click to turn it off.",
      previewOff: "Turn on preview mode",
      upload: "Upload preview result to the selected node",
      updatePreview: "Preview online update information"
    }),
    toasts: Object.freeze({
      devOn: "Developer mode enabled",
      devOff: "Returned to normal mode",
      previewOn: "Preview mode enabled",
      previewOff: "Preview mode disabled"
    })
  }),
  mascot: Object.freeze({
    tips: Object.freeze({
      viewWheelZoom: "💡 View: Use the mouse wheel to zoom the canvas. The lower-right slider gives finer control.",
      viewShortcutZoom: "💡 View: {zoomIn} / {zoomOut} quickly zooms in or out.",
      viewFocus: "💡 View: Press {shortcut} to focus selected nodes. With nothing selected, it fits the whole canvas.",
      viewMinimap: "💡 View: Press {shortcut} to show or hide the minimap.",
      viewSpacePan: "💡 View: Hold {shortcut} and drag with the left mouse button to pan the canvas.",
      viewMiddlePan: "💡 View: Drag with the middle mouse button to pan quickly.",
      createDoubleClick: "💡 Create: Double-click an empty canvas area to open the node creation menu.",
      createLeftPlus: "💡 Create: Click the left plus button to open all nodes and upload local media.",
      createNote: "💡 Create: Press {shortcut} to quickly create a note node for notes and to-dos.",
      createTextImage: "💡 Create: Press {text} for a text generation node, {image} for an image generation node.",
      createVideoAudio: "💡 Create: Press {video} for a video generation node, {audio} for an audio generation node.",
      createDragMedia: "💡 Create: Drag images, videos, or audio onto the canvas to create matching source nodes.",
      editSelectAll: "💡 Edit: {shortcut} selects all nodes on the canvas.",
      editShiftSelect: "💡 Edit: Hold {shortcut} and click nodes to add or remove them from the selection.",
      editBoxSelect: "💡 Edit: Drag on empty canvas space to box-select multiple nodes.",
      editCopyPaste: "💡 Edit: {copy} copies nodes, {paste} pastes nodes.",
      editCut: "💡 Edit: {shortcut} cuts the selected nodes.",
      editDelete: "💡 Edit: Select nodes and press {shortcut} to delete them.",
      editUndoRedo: "💡 Edit: {undo} undoes, {redo} redoes.",
      organizeGroup: "💡 Organize: Select multiple nodes and press {shortcut} to group them.",
      organizeAlign: "💡 Organize: Select multiple nodes and press {shortcut} to open the alignment panel.",
      organizeGuides: "💡 Organize: Press {shortcut} to toggle guide snapping.",
      organizeGrid: "💡 Organize: Press {shortcut} to toggle grid snapping.",
      organizeResetSize: "💡 Organize: Select an image or video node and press {shortcut} to restore its default size.",
      edgeConnect: "💡 Connections: Drag from a node connector to another node to create an edge.",
      edgeCut: "💡 Connections: Hold {shortcut} and swipe across an edge to cut it quickly.",
      edgeScissors: "💡 Connections: Hover an edge briefly to reveal scissors, then click to delete it.",
      nodeRename: "💡 Nodes: Double-click a node title or label to rename it.",
      imageTools: "💡 Images: Select one image node and use {shortcuts} to trigger mask, redraw, erase, and other image tools.",
      imageCopy: "💡 Images: {shortcut} copies the image from the selected image node.",
      videoTools: "💡 Videos: Select one video node and use {shortcuts} for crop, keying, HD, fullscreen, and download.",
      videoCaptureFrame: "💡 Videos: Select one video node and press {shortcut} to capture the current frame.",
      audioTools: "💡 Audio: Select one audio node and use {shortcuts} for trim, speed, and download.",
      textTools: "💡 Text: Select one text node and use {shortcuts} for copy content and fullscreen view.",
      sceneTools: "💡 3D: In the 3D director stage, use {shortcuts} for mouse mode, move, scale, and rotate.",
      sceneCapture: "💡 3D: In the 3D director stage, press {shortcut} to capture a screenshot.",
      projectSave: "💡 Project: {shortcut} saves the current canvas project.",
      projectSettings: "💡 Project: Press {shortcut} to open settings.",
      settingsShortcuts: "💡 Settings: Keyboard shortcuts can be customized to match your habits.",
      hintEsc: "💡 Tip: Press Esc to close menus, dialogs, or exit the current temporary mode."
    })
  }),
  previewUpload: Object.freeze({
    upload: "Upload",
    uploading: "Uploading",
    selectSingleNode: "Select one node to receive the upload",
    selectedNodeMissing: "Selected node not found",
    unsupportedNode: "The current node does not support preview upload",
    invalidFileType: "Upload {label} file",
    uploadFailed: "Upload failed. Try again.",
    types: Object.freeze({
      image: "image",
      video: "video",
      audio: "audio"
    }),
    success: Object.freeze({
      image: "Uploaded image applied to the current node",
      video: "Uploaded video applied to the current node",
      audio: "Uploaded audio applied to the current node"
    })
  }),
  previewUploadResult: Object.freeze({
    missingLocalPath: "Invalid upload result: missing {kind} local path",
    missingNodeId: "Invalid upload result: missing node ID",
    kind: Object.freeze({
      media: "media",
      image: "image",
      video: "video",
      audio: "audio"
    })
  }),
  textInputContextMenu: Object.freeze({
    undo: "Undo",
    cut: "Cut",
    copy: "Copy",
    pasteText: "Paste text",
    delete: "Delete",
    selectAll: "Select all",
    clipboardReadFailed: "Failed to read clipboard. Check permissions.",
    clipboardWriteFailed: "Failed to write to clipboard. Check permissions.",
    clipboardUnsupported: "This environment cannot read clipboard text",
    clipboardEmpty: "Clipboard has no text to paste"
  }),
  workspaceContextMenu: Object.freeze({
    openProject: "Open project",
    renameProject: "Rename",
    duplicateProject: "Duplicate project",
    archiveProject: "Archive project",
    unarchiveProject: "Unarchive project",
    deleteProject: "Delete project",
    switchVersion: "Switch to this version",
    deleteVersion: "Delete version",
    switchResult: "Switch to this result",
    deleteResult: "Delete result",
    selectClip: "Select clip",
    deleteClip: "Delete clip",
    viewAsset: "View asset",
    viewLibraryAsset: "View library asset",
    deleteAsset: "Delete asset",
    openEpisode: "Open episode",
    view: "View",
    delete: "Delete"
  }),
  canvasNodeFlows: Object.freeze({
    media: Object.freeze({
      image: "Image",
      video: "Video",
      audio: "Audio"
    }),
    paste: Object.freeze({
      nodeName: Object.freeze({
        image: "Pasted image",
        video: "Pasted video",
        audio: "Pasted audio",
        text: "Pasted text"
      }),
      filePasted: "File pasted to canvas",
      filesPasted: "{count} files pasted to canvas",
      mediaPasted: "{label} pasted to canvas",
      textPasted: "Text pasted to canvas",
      clipboardReadFailed: "Failed to read clipboard. Check browser permissions.",
      clipboardEmpty: "Clipboard has no pasteable content"
    })
  }),
  canvasScreenshot: Object.freeze({
    unsupported: "Screenshot is not supported in this environment",
    entryNotReady: "Screenshot entry is not ready",
    captureFailed: "Screenshot failed. Try again later.",
    confirmAria: "Confirm screenshot",
    cancelAria: "Cancel screenshot",
    areaTooSmall: "Screenshot area is too small",
    nodeName: "Screenshot image",
    added: "Screenshot added to canvas",
    addFailed: "Failed to add screenshot",
    hints: Object.freeze({
      selectArea: "Drag to select a screenshot area. Esc cancels.",
      adjustArea: "Drag to move, pull corners to resize"
    })
  }),
  generationHistoryFileManager: Object.freeze({
    panel: Object.freeze({
      ariaLabel: "File manager",
      title: "File Manager",
      sourceTabsAria: "File source",
      filtersAria: "File type filter",
      orderAria: "Sort order"
    }),
    filters: Object.freeze({
      all: "All",
      image: "Images",
      video: "Videos",
      audio: "Audio"
    }),
    sources: Object.freeze({
      currentCanvas: "Current canvas",
      history: "History",
      output: "Output folder"
    }),
    mediaKinds: Object.freeze({
      image: "image",
      video: "video",
      audio: "audio",
      folder: "folder",
      file: "file"
    }),
    fallback: Object.freeze({
      outputFile: "Output file",
      folder: "Folder",
      file: "File"
    }),
    contextMenu: Object.freeze({
      addToCanvas: "Add to canvas",
      addManyToCanvas: "Add {count} to canvas",
      fullscreen: "Fullscreen preview",
      reveal: "Show in Explorer",
      delete: "Delete",
      deleteMany: "Delete {count}"
    }),
    loading: Object.freeze({
      initial: "Loading...",
      more: "Loading more..."
    }),
    empty: Object.freeze({
      output: "No displayable files in the output folder",
      currentCanvas: "No generated results on the current canvas",
      history: "No generated media history",
      filtered: "No {label} yet"
    }),
    sort: Object.freeze({
      ascAria: "Currently ascending. Click to switch to descending.",
      descAria: "Currently descending. Click to switch to ascending.",
      ascTitle: "Ascending",
      descTitle: "Descending"
    }),
    subtitle: Object.freeze({
      output: "Browsing the output folder",
      currentCanvas: "Generated media on the current canvas",
      history: "Generated media in the current project"
    }),
    breadcrumbs: Object.freeze({
      up: "Up one level"
    }),
    alt: Object.freeze({
      videoHistory: "Video history",
      imageHistory: "Image history"
    }),
    toasts: Object.freeze({
      addedMany: "{count} files added to canvas",
      addedOutput: "File added to canvas",
      addedHistory: "Historical {label} added to canvas",
      revealFailed: "Failed to show in Explorer",
      deletedMany: "Files deleted",
      deletedOne: "Deleted",
      deleteFailed: "Delete failed"
    }),
    deleteConfirm: Object.freeze({
      ariaLabel: "Delete file confirmation",
      title: "Delete file?",
      messageOne: "Delete this file?",
      messageMany: "Delete {count} files?",
      cancel: "Cancel",
      delete: "Delete"
    })
  }),
  generationHistory: Object.freeze({
    fileFallback: Object.freeze({
      image: "Image history {date}",
      video: "Video history {date}",
      audio: "Audio history {date}"
    }),
    assetName: Object.freeze({
      image: "Image {date}",
      video: "Video {date}",
      audio: "Audio {date}"
    })
  }),
  whiteboardNode: Object.freeze({
    background: Object.freeze({
      upload: "Upload",
      imageOnly: "Whiteboard backgrounds must be image files",
      uploadSuccess: "Background image connected to the whiteboard",
      uploadFailed: "Failed to upload background image"
    }),
    style: Object.freeze({
      lineType: "Line",
      arrowheads: "Arrowheads",
      colors: Object.freeze({
        black: "Black",
        gray: "Gray",
        pink: "Pink",
        purple: "Purple",
        blue: "Blue",
        indigo: "Indigo",
        cyan: "Cyan",
        red: "Red",
        orange: "Orange",
        yellow: "Yellow",
        green: "Green",
        white: "White"
      }),
      sizes: Object.freeze({
        small: "Small",
        medium: "Medium",
        large: "Large",
        extraLarge: "Extra large"
      }),
      fill: Object.freeze({
        none: "No fill",
        solid: "Solid fill"
      }),
      dash: Object.freeze({
        solid: "Solid",
        dashed: "Dashed",
        dotted: "Dotted"
      }),
      font: Object.freeze({
        sans: "Sans",
        serif: "Serif",
        mono: "Mono"
      }),
      arrowKind: Object.freeze({
        straight: "Straight",
        arc: "Arc",
        elbow: "Elbow"
      }),
      terminal: Object.freeze({
        start: "Start terminal",
        end: "End terminal"
      }),
      arrowhead: Object.freeze({
        none: "No arrowhead",
        arrow: "Arrow",
        triangle: "Triangle",
        square: "Square terminal",
        circle: "Circle terminal",
        diamond: "Diamond terminal",
        inverted: "Inverted triangle",
        bar: "Bar terminal"
      })
    })
  }),
  storyboard3d: Object.freeze({
    defaults: Object.freeze({
      projectName: "Untitled 3D Storyboard",
      sceneName: "Scene 1",
      shotName: "Shot 1"
    }),
    saveStatus: Object.freeze({
      saved: "Saved",
      saving: "Saving",
      error: "Save failed"
    }),
    editor: Object.freeze({
      ariaLabel: "3D storyboard editor",
      projectName: "Module name",
      modeAria: "Editor mode",
      editMode: "Edit",
      exploreMode: "Explore shots",
      newProject: "New",
      importProject: "Import JSON",
      exportProject: "Export JSON",
      save: "Save",
      close: "Close 3D storyboard editor",
      inspector: "Inspector",
      closeInspector: "Close inspector",
      project: "Project",
      scenes: "Scenes",
      activeScene: "Active scene",
      outline: "Scene outline",
      assets: "Assets",
      assetsPending: "The model asset library will be connected during the import phase.",
      viewport: "3D viewport",
      tools: "Transform tools",
      stageOneKicker: "Phase 1 · Module shell",
      viewportPendingTitle: "Independent WebGL viewport mount is ready",
      viewportPendingDescription: "This vertical slice validates the parent node, project state, independent workspace, and persistence boundary. Selection, transforms, and live 3D rendering arrive in the base editor phase.",
      reuseDirectorBridge: "The existing PanoramaScene3DBridge will be reused instead of duplicating the renderer",
      miniMap: "Mini Map",
      shots: "Shots",
      addShot: "Add camera",
      addShotDescription: "Create a shot from the current view and bind a movable camera",
      cameraTimeline: "Camera timeline",
      context: "Context",
      currentScene: "Current scene",
      environment: "Environment",
      grid: "Grid",
      objects: "Objects",
      enabled: "On",
      disabled: "Off",
      selection: "Selection",
      noSelection: "No object selected",
      noSelectionDescription: "After the live 3D viewport is connected, this panel will switch between characters, props, cameras, and lights.",
      aiAssistant: "AI assistant",
      aiPending: "Structured commands, transaction validation, and voice reuse will follow a stable command system.",
      sceneMeta: "{shots} shots · {objects} objects",
      emptyOutlineTitle: "No objects in this scene",
      emptyOutlineDescription: "Built-in objects and synchronized 3D selection will be connected in phase 2.",
      hidden: "Hidden",
      visible: "Visible",
      previewPending: "Preview pending",
      shotNumber: "Shot {index}",
      stage2Hint: "The base 3D editor will be connected in phase 2",
      stage3Hint: "Scene mutations unlock after the command system is connected",
      stage4: "Phase 4",
      stage4Hint: "Camera and shot management unlock in phase 4",
      stage5: "Phase 5",
      stage8: "Phase 8",
      stage8Hint: "Mini Map and image backgrounds unlock in phase 8",
      stage9Hint: "Shot exploration unlocks in phase 9",
      stage10: "Phase 10",
      savedMessage: "The project snapshot was written back to the parent canvas node.",
      newProjectConfirm: "Creating a new project replaces this module snapshot. Continue?",
      importSucceeded: "Project JSON imported and written back to the parent node.",
      importFailed: "Project import failed: {error}",
      exportUnavailable: "This runtime does not support browser file export.",
      exportSucceeded: "Project JSON exported."
    }),
    errors: Object.freeze({
      renderShotPending: "Single-shot rendering unlocks after the live 3D viewport is connected in phases 2/4.",
      storyboardExportPending: "Storyboard export unlocks in phase 6."
    })
  }),
  nodeCreation: Object.freeze({
    sections: Object.freeze({
      generation: "Generation nodes",
      source: "Source nodes",
      function: "Utility nodes"
    }),
    upload: Object.freeze({
      label: "Upload file",
      subtitle: "Images, videos, audio"
    }),
    items: Object.freeze({
      aiText: Object.freeze({
        label: "Text",
        defaultName: "Text",
        subtitle: "Copy, scripts, prompts"
      }),
      aiImage: Object.freeze({
        label: "Image",
        defaultName: "Image",
        subtitle: "Images, posters, character assets"
      }),
      aiVideo: Object.freeze({
        label: "Video",
        defaultName: "Video",
        subtitle: "Short films, transitions, motion shots"
      }),
      aiAudio: Object.freeze({
        label: "Audio",
        defaultName: "Audio",
        subtitle: "Voiceover, sound effects, music"
      }),
      sourceText: Object.freeze({
        label: "Source text",
        defaultName: "Source text",
        subtitle: "Copy, scripts, prompt input"
      }),
      sourceImage: Object.freeze({
        label: "Source image",
        defaultName: "Source image",
        subtitle: "References, first frames, assets"
      }),
      sourceVideo: Object.freeze({
        label: "Source video",
        defaultName: "Source video",
        subtitle: "References, clips, video input"
      }),
      sourceAudio: Object.freeze({
        label: "Source audio",
        defaultName: "Source audio",
        subtitle: "Voiceover, music, sound references"
      }),
      commentNote: Object.freeze({
        label: "Comment",
        defaultName: "",
        subtitle: "Notes, annotations, todos"
      }),
      webPreview: Object.freeze({
        label: "Browser",
        defaultName: "Browser",
        subtitle: "Enter a URL and browse inside the canvas"
      }),
      panoramaScene: Object.freeze({
        label: "3D Stage",
        defaultName: "3D Stage",
        subtitle: "3D scenes, characters, cameras"
      }),
      panorama360: Object.freeze({
        label: "360 Panorama",
        defaultName: "360 Panorama",
        subtitle: "Panoramas and spatial relationships"
      }),
      storyboard: Object.freeze({
        label: "Grid image",
        defaultName: "Grid image",
        subtitle: "Blank 3x3 image grid"
      }),
      storyboardScript: Object.freeze({
        label: "Storyboard",
        defaultName: "Storyboard",
        subtitle: "Shot lists, prompts, pacing"
      }),
      collage: Object.freeze({
        label: "Collage",
        defaultName: "Collage",
        subtitle: "Image layout and export"
      }),
      whiteboard: Object.freeze({
        label: "Whiteboard",
        defaultName: "Whiteboard",
        subtitle: "Sketches, annotations, text notes"
      }),
      mediaClip: Object.freeze({
        label: "Clip",
        defaultName: "Clip",
        subtitle: "Audio/video trimming and organization"
      }),
      debug: Object.freeze({
        label: "Debug node",
        defaultName: "Debug node",
        subtitle: "Inspect payloads and task state"
      })
    })
  })
});
export default enUS;
