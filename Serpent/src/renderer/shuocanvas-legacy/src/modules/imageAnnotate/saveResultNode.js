import a989_0x3b222e from "../../core/stores/appStore.js";
import { generateId } from "../../core/math.js";
import { buildGenerationStartPatch } from "../../core/generationTaskLifecycle.js";
import { commit } from "../history.js";
import { calcSafeSpawnPosNearNode } from "../nodeSpawn.js";
import { saveOutputBlob } from "../project.js";
import { buildSourceMediaNodePayload } from "../../services/fileService.js";
import { buildCanvasLocalImageFields } from "../../services/canvasMediaLocalService.js";
import { localPathToUrl, pickResultLocalPath } from "../../utils/localMediaPath.js";
import { buildImageGenerationFailurePatch, buildImageGenerationResultPatch } from "../../components/aigenImage/imageGenerationResultRenderer.js";
import { addToolbarPendingResultNodes, persistToolbarResultNodes, selectToolbarResultNodes, updateToolbarResultNode } from "../toolbarPendingResultNodes.js";
import { t } from "../../i18n/index.js";
function imageAnnotateOutputText(_0x595faf, _0x218c6e = {}) {
  return t("imageAnnotate.output." + _0x595faf, _0x218c6e);
}
function imageAnnotateActionText(_0x551df1, _0x5c537b = {}) {
  return t("imageAnnotate.actions." + _0x551df1, _0x5c537b);
}
export const getSavedAnnotateNodeName = (_0x3aa462, _0x7eed6e) => {
  const _0x5e8fd7 = _0x7eed6e || imageAnnotateOutputText("baseImage");
  if (_0x3aa462 === "repaint") {
    return imageAnnotateOutputText("repaintName", {
      baseName: _0x5e8fd7
    });
  }
  if (_0x3aa462 === "erase") {
    return imageAnnotateOutputText("eraseName", {
      baseName: _0x5e8fd7
    });
  }
  return imageAnnotateOutputText("annotateName", {
    baseName: _0x5e8fd7
  });
};
export const getSavedAnnotateSuccessLabel = _0x2180cb => {
  if (_0x2180cb === "repaint") {
    return imageAnnotateOutputText("repaintCreated");
  }
  if (_0x2180cb === "erase") {
    return imageAnnotateOutputText("eraseCreated");
  }
  return imageAnnotateOutputText("annotateCreated");
};
function resolveAnnotateResultBaseNode(_0x241386, _0x596950) {
  return a989_0x3b222e.getState().nodes?.[_0x241386] || _0x596950 || {};
}
function resolveAnnotateResultLayout(_0x183b1c, _0x4d0ece) {
  const _0x51b408 = resolveAnnotateResultBaseNode(_0x183b1c, _0x4d0ece);
  const _0x6c9114 = _0x51b408.width || 260;
  const _0x422282 = _0x51b408.height || 260;
  const _0x2cec68 = calcSafeSpawnPosNearNode(a989_0x3b222e.getState().nodes, _0x51b408, _0x6c9114, _0x422282);
  return {
    baseNode: _0x51b408,
    width: _0x6c9114,
    height: _0x422282,
    x: _0x2cec68.x,
    y: _0x2cec68.y
  };
}
export const createPendingAnnotateExportNode = ({
  scene: _0x42a226,
  sourceNodeId: _0x214d19,
  baseNode: _0x3d8438,
  startedAt = Date.now()
} = {}) => {
  const _0x2729f1 = resolveAnnotateResultLayout(_0x214d19, _0x3d8438);
  const _0x3e66bc = generateId("source-image");
  const _0x306f83 = buildSourceMediaNodePayload({
    id: _0x3e66bc,
    type: "source-image",
    x: _0x2729f1.x,
    y: _0x2729f1.y,
    width: _0x2729f1.width,
    height: _0x2729f1.height,
    name: getSavedAnnotateNodeName(_0x42a226, _0x2729f1.baseNode.name),
    src: "",
    outputText: imageAnnotateActionText("saving"),
    ...buildGenerationStartPatch({
      startedAt: startedAt
    }),
    fixedSize: true,
    needsAutoResize: false
  });
  addToolbarPendingResultNodes({
    nodes: [_0x306f83]
  });
  return {
    newNodeId: _0x3e66bc,
    baseNode: _0x2729f1.baseNode,
    startedAt: startedAt
  };
};
function buildSavedAnnotateResultPatch({
  scene: _0x56370a,
  baseNode: _0x1151d1,
  saveResult: _0x1fc1e5,
  fileName: _0x51eb25,
  startedAt = 0
}) {
  const _0x21fc73 = pickResultLocalPath(_0x1fc1e5);
  const _0x9562f3 = buildCanvasLocalImageFields({
    ..._0x1fc1e5,
    localPath: _0x21fc73,
    imageUrl: _0x1fc1e5?.displayUrl || _0x1fc1e5?.thumbUrl || localPathToUrl(_0x21fc73) || String(_0x1fc1e5?.url || "").trim(),
    sourceUrl: _0x1fc1e5?.originalUrl || _0x1fc1e5?.url || localPathToUrl(_0x21fc73),
    thumbUrl: _0x1fc1e5?.thumbUrl,
    fileName: _0x51eb25
  }, {
    includeSrc: true
  });
  const _0x34d08a = _0x9562f3.src || _0x9562f3.imageUrl || localPathToUrl(_0x21fc73) || String(_0x1fc1e5?.url || "").trim();
  const _0x43fd22 = buildImageGenerationResultPatch({
    ..._0x1fc1e5,
    ..._0x9562f3,
    imageUrl: _0x9562f3.imageUrl || _0x34d08a,
    sourceUrl: _0x9562f3.sourceUrl || _0x34d08a,
    thumbUrl: _0x9562f3.thumbUrl || _0x34d08a,
    localPath: _0x9562f3.localPath || _0x21fc73,
    fileName: _0x51eb25
  }, {
    startedAt: startedAt
  }) || {};
  return {
    name: getSavedAnnotateNodeName(_0x56370a, _0x1151d1?.name),
    ..._0x43fd22,
    ..._0x9562f3,
    src: _0x34d08a,
    localPath: _0x9562f3.localPath || _0x21fc73,
    fileName: _0x51eb25,
    outputText: "",
    fixedSize: true,
    needsAutoResize: false
  };
}
export const markAnnotateExportNodeFailed = ({
  targetNodeId: _0x422a33,
  error: _0x3fc696,
  startedAt = 0
} = {}) => {
  const _0x54939e = String(_0x422a33 || "").trim();
  if (!_0x54939e) {
    return false;
  }
  const _0x1664a1 = updateToolbarResultNode(_0x54939e, buildImageGenerationFailurePatch({
    error: _0x3fc696 instanceof Error ? _0x3fc696.message : String(_0x3fc696 || ""),
    startedAt: startedAt
  }) || {});
  if (_0x1664a1) {
    persistToolbarResultNodes();
  }
  return _0x1664a1;
};
export const saveAnnotateExportResult = async ({
  blob: _0x432c12,
  exportType: _0x2e7de2,
  scene: _0x3d4490,
  sourceNodeId: _0x290fe5,
  baseNode: _0x4fe8a3,
  notify = (_0x54fb66, _0x566836) => window.showToast?.(_0x54fb66, _0x566836),
  triggerLocalCacheSave = () => window._triggerLocalCacheSave?.(),
  targetNodeId = "",
  startedAt = 0,
  saveOutputBlobImpl = saveOutputBlob
} = {}) => {
  const _0x3307ce = _0x2e7de2 === "image/png" ? "png" : "jpg";
  const _0x3d22fd = generateId("annotate");
  const _0x50abd8 = new File([_0x432c12], "annotate_" + _0x3d22fd + "." + _0x3307ce, {
    type: _0x2e7de2
  });
  const _0x40b1e6 = await saveOutputBlobImpl(_0x50abd8, {
    ext: _0x3307ce
  });
  const _0xb9f4f5 = pickResultLocalPath(_0x40b1e6);
  const _0x349d24 = resolveAnnotateResultBaseNode(_0x290fe5, _0x4fe8a3);
  const _0x4ec278 = String(targetNodeId || "").trim();
  const _0x374cbf = _0x4ec278 || generateId("source-image");
  const _0x192094 = buildSavedAnnotateResultPatch({
    scene: _0x3d4490,
    baseNode: _0x349d24,
    saveResult: _0x40b1e6,
    fileName: _0x40b1e6.filename || _0x50abd8.name,
    startedAt: startedAt
  });
  if (_0x4ec278) {
    updateToolbarResultNode(_0x374cbf, _0x192094);
  } else {
    const _0x9603bc = resolveAnnotateResultLayout(_0x290fe5, _0x349d24);
    a989_0x3b222e.addNode(buildSourceMediaNodePayload({
      id: _0x374cbf,
      type: "source-image",
      x: _0x9603bc.x,
      y: _0x9603bc.y,
      width: _0x9603bc.width,
      height: _0x9603bc.height,
      ..._0x192094
    }));
  }
  selectToolbarResultNodes([_0x374cbf]);
  commit();
  triggerLocalCacheSave();
  notify(getSavedAnnotateSuccessLabel(_0x3d4490), "success");
  return {
    newNodeId: _0x374cbf,
    localPath: _0xb9f4f5,
    srcUrl: _0x192094.src,
    response: _0x40b1e6
  };
};