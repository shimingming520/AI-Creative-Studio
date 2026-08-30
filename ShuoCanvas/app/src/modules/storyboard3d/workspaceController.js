import { getStoryboard3DModelPackStatus, installStoryboard3DModelPack } from "../../../api/storyboard3dModelPackApi.js";
import a1318_0xb6bd9f from "../../core/stores/appStore.js";
import { t } from "../../i18n/index.js";
import { commit } from "../history.js";
import { closeActiveStoryboard3DEditor, openStoryboard3DProjectEditor } from "./editorLauncher.js";
import { generateStoryboard3DProjectDraft } from "./projectGeneration.js";
import { createStoryboard3DProject, migrateStoryboard3DProject } from "./projectModel.js";
import { saveStoryboard3DProjectAsCopy } from "./sceneProjectOperations.js";
import { getStoryboard3DWorkspaceProjects, initStoryboard3DWorkspaceHome } from "./workspaceHome.js";
const EDITOR_OPENED_EVENT = "storyboard-3d:editor-opened";
const EDITOR_CLOSED_EVENT = "storyboard-3d:editor-closed";
const SAVE_AS_COPY_EVENT = "storyboard-3d:save-as-copy";
function getStoreState(_0x314c18) {
  return _0x314c18?.getStateRaw?.() || _0x314c18?.getState?.() || {};
}
function createWorkspaceItemId(_0x443a43 = "item", _0x4cf7f0 = globalThis.window) {
  const _0x472686 = _0x4cf7f0?.crypto?.randomUUID?.() || globalThis.crypto?.randomUUID?.();
  if (_0x472686) {
    return _0x443a43 + "_" + _0x472686;
  }
  return _0x443a43 + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
}
function enqueueMicrotask(_0x3ed875, _0x90dbf7) {
  if (typeof _0x3ed875?.queueMicrotask === "function") {
    _0x3ed875.queueMicrotask(_0x90dbf7);
    return;
  }
  if (typeof globalThis.queueMicrotask === "function") {
    globalThis.queueMicrotask(_0x90dbf7);
    return;
  }
  Promise.resolve().then(_0x90dbf7);
}
export function createStoryboard3DWorkspaceController({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  storeInstance = a1318_0xb6bd9f,
  commitChanges = commit,
  translate = t,
  modelPackApi = {
    getStatus: getStoryboard3DModelPackStatus,
    install: installStoryboard3DModelPack
  },
  createWorkspaceHome = initStoryboard3DWorkspaceHome,
  getProjects = getStoryboard3DWorkspaceProjects,
  createProjectModel = createStoryboard3DProject,
  migrateProjectModel = migrateStoryboard3DProject,
  copyProject = saveStoryboard3DProjectAsCopy,
  generateProjectDraft = generateStoryboard3DProjectDraft,
  openProjectEditor = openStoryboard3DProjectEditor,
  closeActiveEditor = closeActiveStoryboard3DEditor,
  getWorkspaceModeCoordinator = () => null,
  showNotification = (_0x22451b, _0xea0da4) => windowObject?.showToast?.(_0x22451b, _0xea0da4),
  now = () => Date.now(),
  idFactory = _0x5215ad => createWorkspaceItemId(_0x5215ad, windowObject)
} = {}) {
  if (typeof storeInstance?.upsertStoryboard3DProject !== "function") {
    throw new TypeError("Storyboard 3D Workspace requires project upsert capability.");
  }
  if (typeof storeInstance?.deleteStoryboard3DProject !== "function") {
    throw new TypeError("Storyboard 3D Workspace requires project delete capability.");
  }
  let _0x88b92f = false;
  const _0x53aed2 = _0x2ebff5 => {
    const _0x3f44c6 = String(_0x2ebff5 || "").trim();
    if (!_0x3f44c6) {
      return null;
    }
    const _0x3c973d = getStoreState(storeInstance);
    const _0x382e83 = Array.isArray(_0x3c973d.storyboard3dProjects) ? _0x3c973d.storyboard3dProjects : [];
    return _0x382e83.find(_0xdd63f3 => String(_0xdd63f3?.id || "") === _0x3f44c6) || null;
  };
  const _0x2333e4 = _0xd29601 => {
    const _0xf619f0 = String(_0xd29601 || "").trim();
    if (!_0xf619f0 || _0x88b92f) {
      return null;
    }
    return openProjectEditor({
      projectId: _0xf619f0,
      storeInstance: storeInstance,
      commitChanges: commitChanges,
      documentObject: documentObject,
      windowObject: windowObject
    });
  };
  const _0x486863 = ({
    project = null
  } = {}) => {
    if (_0x88b92f) {
      return null;
    }
    const _0x5b9367 = getProjects(getStoreState(storeInstance)).length;
    const _0x4c7066 = translate("storyboard3d.defaults.projectName");
    const _0x2c7898 = String(project?.name || "").trim();
    const _0x5bb634 = _0x2c7898 || (_0x5b9367 > 0 ? _0x4c7066 + " " + (_0x5b9367 + 1) : _0x4c7066);
    const _0x5624ed = project ? migrateProjectModel({
      ...project,
      name: _0x5bb634
    }) : createProjectModel({
      name: _0x5bb634
    });
    storeInstance.upsertStoryboard3DProject(_0x5624ed);
    commitChanges?.();
    return _0x2333e4(_0x5624ed.id);
  };
  const _0x4e64cb = async (_0x1d7be3 = {}) => {
    if (_0x88b92f) {
      return null;
    }
    const _0x580426 = await generateProjectDraft(_0x1d7be3);
    if (_0x88b92f) {
      return null;
    }
    return _0x486863({
      project: _0x580426
    });
  };
  const _0x3b43d1 = _0x4132ad => {
    const _0xa0201e = _0x53aed2(_0x4132ad);
    if (!_0xa0201e || _0x88b92f) {
      return null;
    }
    const _0x36014c = copyProject(_0xa0201e, {
      name: (_0xa0201e.name || "3D Storyboard") + " 副本",
      now: now(),
      idFactory: idFactory
    });
    storeInstance.upsertStoryboard3DProject(_0x36014c);
    commitChanges?.();
    return _0x36014c;
  };
  const _0x1de56d = (_0x148783, _0x1c69ac) => {
    const _0x480d2f = _0x53aed2(_0x148783);
    const _0x4daa22 = String(_0x1c69ac || "").trim();
    if (!_0x480d2f || !_0x4daa22 || _0x88b92f) {
      return null;
    }
    const _0x5bdfb9 = {
      ..._0x480d2f,
      name: _0x4daa22,
      updatedAt: now()
    };
    storeInstance.upsertStoryboard3DProject(_0x5bdfb9);
    commitChanges?.();
    return _0x5bdfb9;
  };
  const _0x97bf05 = _0x1be60c => {
    if (_0x88b92f) {
      return false;
    }
    const _0x3064b3 = storeInstance.deleteStoryboard3DProject(_0x1be60c);
    if (_0x3064b3) {
      commitChanges?.();
    }
    return _0x3064b3;
  };
  const _0x594501 = createWorkspaceHome({
    documentObject: documentObject,
    modelPackApi: modelPackApi,
    getProjects: () => getProjects(getStoreState(storeInstance)),
    onCreateProject: () => _0x486863(),
    onGenerateProject: _0x4e64cb,
    onOpenProject: _0x2333e4,
    onCloneProject: _0x3b43d1,
    onRenameProject: _0x1de56d,
    onDeleteProject: _0x97bf05,
    onNotify: showNotification
  });
  const _0x8198ef = () => {
    if (_0x88b92f) {
      return;
    }
    const _0xf4320c = getWorkspaceModeCoordinator?.();
    if (_0xf4320c?.getMode?.() !== "storyboard3d") {
      _0xf4320c?.setMode?.("storyboard3d", {
        activate: false
      });
    }
    _0x594501.hide();
  };
  const _0x1d1503 = _0x497bb7 => {
    if (_0x88b92f) {
      return;
    }
    const _0x3ee648 = getWorkspaceModeCoordinator?.();
    if (_0x3ee648?.getMode?.() !== "storyboard3d") {
      return;
    }
    enqueueMicrotask(windowObject, () => {
      if (_0x88b92f || getWorkspaceModeCoordinator?.()?.getMode?.() !== "storyboard3d") {
        return;
      }
      _0x594501.show();
      _0x594501.focusProject(_0x497bb7?.detail?.projectId);
    });
  };
  const _0x39f2bc = _0x44fad5 => {
    const _0x4184ab = _0x44fad5?.detail?.project;
    if (!_0x4184ab || _0x88b92f) {
      return;
    }
    _0x486863({
      project: _0x4184ab
    });
  };
  windowObject?.addEventListener?.(EDITOR_OPENED_EVENT, _0x8198ef);
  windowObject?.addEventListener?.(EDITOR_CLOSED_EVENT, _0x1d1503);
  windowObject?.addEventListener?.(SAVE_AS_COPY_EVENT, _0x39f2bc);
  return Object.freeze({
    openHome() {
      if (_0x88b92f) {
        return null;
      }
      closeActiveEditor?.();
      return _0x594501.show();
    },
    close() {
      if (_0x88b92f) {
        return false;
      }
      _0x594501.hide();
      closeActiveEditor?.();
      return true;
    },
    dispose() {
      if (_0x88b92f) {
        return;
      }
      _0x88b92f = true;
      windowObject?.removeEventListener?.(EDITOR_OPENED_EVENT, _0x8198ef);
      windowObject?.removeEventListener?.(EDITOR_CLOSED_EVENT, _0x1d1503);
      windowObject?.removeEventListener?.(SAVE_AS_COPY_EVENT, _0x39f2bc);
      _0x594501.destroy?.();
    }
  });
}