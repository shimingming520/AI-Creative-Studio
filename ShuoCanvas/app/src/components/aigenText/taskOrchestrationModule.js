import { appendAssetMentionToPrompt, getPromptInputSubmitLabelFromPillNode, insertPresetPromptIntoEditor, previewPresetPromptInEditor, resolveTextReferenceContent, shouldUsePromptPreviewForPreset } from "../../modules/nodePromptShared.js";
import { resolvePromptPresetTemplate } from "../../modules/promptPresetTemplate.js";
import { isPreviewModeEnabled, isPreviewNodeLoading, startPreviewNodeLoading } from "../../modules/previewMode.js";
import { createPreviewGenerateButtonCallbacks } from "../../modules/previewGenerateButtonUi.js";
import { resolveGenerationInputImageUrl } from "../../services/imageReferenceUrlService.js";
import { submitTask } from "../../core/generationTaskRuntime.js";
import { localPathToUrl } from "../../utils/localMediaPath.js";
import { isModelApiModel, resolveModelExecution, resolveModelProvider } from "../../manifests/index.js";
import { showProviderApiKeyMissingToastForError } from "../../modules/providerApiKeyMissingToast.js";
import { guardModelGenerationCredentials } from "../../modules/modelCredentialUi.js";
import { buildTextGenerationFailurePatch, buildTextGenerationResultPatch, isTextGenerationTimeoutError } from "./textGenerationResultRenderer.js";
import { t as a353_0x232d67 } from "../../i18n/index.js";
import { resolveModelGenerationProviderProfileId } from "../../modules/modelProviderProfileSelection.js";
function toLocalPathUrl(_0x4acf4d) {
  return localPathToUrl(_0x4acf4d);
}
function pickResultItem(_0x2fa3ff, _0x5614bc) {
  if (!Array.isArray(_0x2fa3ff) || _0x2fa3ff.length === 0) {
    return null;
  }
  const _0xffc47 = Number(_0x5614bc);
  const _0xedf183 = Number.isFinite(_0xffc47) ? Math.max(0, Math.trunc(_0xffc47)) : 0;
  return _0x2fa3ff[Math.min(_0xedf183, _0x2fa3ff.length - 1)] || null;
}
function resolveImageRefUrl(_0x32bddc) {
  return resolveGenerationInputImageUrl(_0x32bddc);
}
function resolveVideoRefUrl(_0x19b01b) {
  const _0x3242aa = pickResultItem(_0x19b01b?.videos, _0x19b01b?.mainVideoIndex);
  return [String(_0x3242aa?.videoUrl || "").trim(), String(_0x3242aa?.url || "").trim(), String(_0x3242aa?.src || "").trim(), toLocalPathUrl(_0x3242aa?.localPath), String(_0x19b01b?.videoUrl || "").trim(), String(_0x19b01b?.src || "").trim(), toLocalPathUrl(_0x19b01b?.localPath), String(_0x19b01b?.thumbUrl || "").trim(), String(_0x19b01b?.imageUrl || "").trim(), String(_0x3242aa?.thumbUrl || "").trim(), toLocalPathUrl(_0x3242aa?.thumbLocalPath), String(_0x3242aa?.poster || "").trim()].find(Boolean) || "";
}
function resolveAudioRefUrl(_0x18d73a) {
  const _0x3b6d04 = pickResultItem(_0x18d73a?.audios, _0x18d73a?.mainAudioIndex);
  return [String(_0x3b6d04?.audioUrl || "").trim(), String(_0x3b6d04?.url || "").trim(), String(_0x3b6d04?.src || "").trim(), toLocalPathUrl(_0x3b6d04?.localPath), String(_0x18d73a?.audioUrl || "").trim(), String(_0x18d73a?.src || "").trim(), toLocalPathUrl(_0x18d73a?.localPath)].find(Boolean) || "";
}
const REFERENCE_LABEL_ALIASES = Object.freeze({
  text: Object.freeze(["文本", "Text"]),
  image: Object.freeze(["图片", "Image"]),
  video: Object.freeze(["视频", "Video"]),
  audio: Object.freeze(["音频", "Audio"]),
  other: Object.freeze(["节点", "Node"])
});
function getReferenceTypeLabel(_0x176d2f) {
  const _0x331942 = {
    text: a353_0x232d67("aigenText.refs.types.text"),
    image: a353_0x232d67("aigenText.refs.types.image"),
    video: a353_0x232d67("aigenText.refs.types.video"),
    audio: a353_0x232d67("aigenText.refs.types.audio"),
    other: a353_0x232d67("aigenText.refs.types.other")
  };
  return _0x331942[_0x176d2f] || _0x331942.other;
}
function buildReferenceLabelAliases(_0x16ba07, _0x377524) {
  const _0x5a40be = ["@" + getReferenceTypeLabel(_0x16ba07) + _0x377524, ...(REFERENCE_LABEL_ALIASES[_0x16ba07] || []).map(_0x41ed79 => "@" + _0x41ed79 + _0x377524)];
  return Array.from(new Set(_0x5a40be));
}
function isRunningHubImageToTextModel(_0x3842bc, _0xf2ec65) {
  return _0xf2ec65 === "runninghub" && isModelApiModel(_0x3842bc, _0xf2ec65) && String(_0x3842bc || "").endsWith("/image-to-text");
}
export function createAIGenTextNodeTaskOrchestrationModule(_0x13654b) {
  const {
    store: _0x1317df,
    api: _0xcf8691,
    getDisplayModelName: _0x5cba89,
    ensureThumbDecoded: _0x5c7210,
    revealRefThumbMedia: _0x16fa01,
    commit: _0x592150,
    TEXT_TOOLBAR_HTML: _0x12d96a,
    bindTextToolbarEvents: _0x11458e,
    getPromptPresets: _0x4db3a9,
    openCustomPresetsManager: _0x52d920,
    startLoading: _0xe904e1,
    stopLoading: _0x360fc8,
    bindRefThumbHoverPreview: _0x15a811,
    checkSlashTrigger: _0x3e0562,
    handleSlashKeyboardNavigation: _0x3ad0b3,
    closeSlashMenu: _0x56a693,
    activateMenuKeyboard: _0x3b30db,
    _checkAtTrigger: _0x5366e8,
    _populateMentionMenu: _0x2aa984,
    _handleMentionMenuKeyboard: _0x512d49,
    _handlePillKeyboard: _0x3c57d1,
    _rehydratePromptPills: _0x2d73d8,
    _handlePillHover: _0x1ae5e1,
    _handlePillOut: _0x285a28,
    _syncEdgesOrderFromPills: _0x434b68,
    _syncPillLabels: _0x4433f2,
    getCustomTextModels: _0x5e1b27,
    saveCustomTextModels: _0x390adb
  } = _0x13654b;
  class _0x34f37c {
    async _buildPayload(_0x50f23d = null) {
      const _0x5c89a1 = _0x1317df.getState();
      const _0x352b6c = _0x1317df.getIncomingEdges(this.nodeId);
      const _0x171b53 = _0x5c89a1.nodes || {};
      const _0x242330 = {
        text: [],
        image: [],
        video: [],
        audio: []
      };
      const _0x3456a5 = {
        text: 0,
        image: 0,
        video: 0,
        audio: 0
      };
      _0x352b6c.forEach(_0x256c7e => {
        const _0x15108f = _0x171b53[_0x256c7e.sourceId];
        if (!_0x15108f) {
          return;
        }
        let _0x1afd44 = "";
        const _0x1785a9 = _0x15108f.type || "";
        if (_0x1785a9 === "text" || _0x1785a9 === "source-text" || _0x1785a9 === "ai-text") {
          _0x1afd44 = "text";
        } else if (_0x1785a9 === "source-image" || _0x1785a9 === "ai-image") {
          _0x1afd44 = "image";
        } else if (_0x1785a9 === "source-video" || _0x1785a9 === "video" || _0x1785a9 === "ai-video") {
          _0x1afd44 = "video";
        } else if (_0x1785a9 === "source-audio" || _0x1785a9 === "audio" || _0x1785a9 === "ai-audio") {
          _0x1afd44 = "audio";
        } else {
          _0x1afd44 = "other";
        }
        let _0x3919bb = "";
        let _0x128ed9 = "";
        if (_0x1afd44 === "text") {
          _0x3919bb = resolveTextReferenceContent(_0x15108f);
        } else if (_0x1afd44 === "image") {
          _0x128ed9 = resolveImageRefUrl(_0x15108f);
          if (!_0x128ed9) {
            return;
          }
        } else if (_0x1afd44 === "video") {
          _0x128ed9 = resolveVideoRefUrl(_0x15108f);
          if (!_0x128ed9) {
            return;
          }
        } else if (_0x1afd44 === "audio") {
          _0x128ed9 = resolveAudioRefUrl(_0x15108f);
          if (!_0x128ed9) {
            return;
          }
        } else {
          _0x128ed9 = String(_0x15108f.src || _0x15108f.imageUrl || "").trim();
          if (!_0x128ed9) {
            return;
          }
        }
        _0x3456a5[_0x1afd44]++;
        const _0x3a115a = buildReferenceLabelAliases(_0x1afd44, _0x3456a5[_0x1afd44]);
        const _0xdc8f04 = _0x3a115a[0];
        _0x242330[_0x1afd44].push({
          label: _0xdc8f04,
          labels: _0x3a115a,
          content: _0x3919bb,
          url: _0x128ed9,
          used: false,
          type: _0x1afd44,
          sourceId: String(_0x256c7e.sourceId || "")
        });
      });
      const _0xe7370c = [..._0x242330.text, ..._0x242330.image, ..._0x242330.video, ..._0x242330.audio];
      const _0xc458b1 = {};
      const _0x22f972 = {};
      _0xe7370c.forEach(_0x75bac => {
        (_0x75bac.labels || [_0x75bac.label]).forEach(_0x58390b => {
          _0xc458b1[_0x58390b.replace(/\s+/g, "")] = _0x75bac;
        });
        if (_0x75bac.sourceId) {
          _0x22f972[_0x75bac.sourceId] = _0x75bac;
        }
      });
      let _0x3513db = [];
      let _0x126abf = [];
      let _0x1cfcf8 = [];
      let _0x330568 = [];
      const _0x2d0996 = [];
      const _0x3073dc = {
        image: 0,
        video: 0,
        audio: 0
      };
      const _0x426e5f = _0x28064d => {
        if (!_0x28064d?.url) {
          return;
        }
        if (!_0x3513db.includes(_0x28064d.url)) {
          _0x3513db.push(_0x28064d.url);
        }
        if (_0x28064d.type === "image" && !_0x126abf.includes(_0x28064d.url)) {
          _0x126abf.push(_0x28064d.url);
        }
        if (_0x28064d.type === "video" && !_0x1cfcf8.includes(_0x28064d.url)) {
          _0x1cfcf8.push(_0x28064d.url);
        }
        if (_0x28064d.type === "audio" && !_0x330568.includes(_0x28064d.url)) {
          _0x330568.push(_0x28064d.url);
        }
      };
      const _0x469e57 = _0x48d2d6 => {
        let _0x573986 = "";
        const _0x16322a = _0x1f3bc7 => {
          for (const _0x14476e of _0x1f3bc7.childNodes) {
            if (_0x14476e.nodeType === Node.TEXT_NODE) {
              _0x573986 += _0x14476e.textContent;
            } else if (_0x14476e.nodeType === Node.ELEMENT_NODE) {
              if (_0x14476e.classList.contains("ref-pill")) {
                const _0x3c9b9c = _0x14476e.dataset.nodeId || "";
                const _0x1bf36b = _0x14476e.dataset.label || _0x14476e.textContent.trim();
                const _0x53df0c = [];
                if (appendAssetMentionToPrompt({
                  domNode: _0x14476e,
                  rawLabel: _0x1bf36b,
                  promptParts: _0x53df0c,
                  inputRefs: _0x2d0996,
                  mediaCounts: _0x3073dc
                })) {
                  _0x573986 += _0x53df0c.join("");
                  _0x2d0996.forEach(_0x426e5f);
                  continue;
                }
                const _0x1b3062 = getPromptInputSubmitLabelFromPillNode(_0x14476e, _0x1bf36b) || _0x1bf36b;
                const _0xc8834 = _0x1b3062.replace(/\s+/g, "");
                const _0x47c570 = _0x3c9b9c && _0x22f972[_0x3c9b9c] || _0xc458b1[_0xc8834];
                const _0x3c6302 = getPromptInputSubmitLabelFromPillNode(_0x14476e, _0x47c570?.label || _0x1b3062) || _0x1b3062;
                if (_0x47c570) {
                  _0x47c570.used = true;
                  if (_0x47c570.content) {
                    _0x573986 += " " + _0x47c570.content + " ";
                  } else if (_0x47c570.url) {
                    _0x573986 += " " + _0x3c6302 + " ";
                    _0x426e5f(_0x47c570);
                  }
                } else {
                  _0x573986 += " " + _0x3c6302 + " ";
                }
              } else if (_0x14476e.tagName === "BR") {
                _0x573986 += "\n";
              } else {
                _0x16322a(_0x14476e);
              }
            }
          }
        };
        if (!_0x48d2d6) {
          return "";
        }
        _0x16322a(_0x48d2d6);
        let _0x78067b = _0x573986.replace(/[\s\u00A0]+/g, " ").trim();
        if (_0x50f23d) {
          _0x78067b = resolvePromptPresetTemplate(_0x50f23d, _0x78067b);
        } else {
          _0x78067b = _0x78067b || "";
        }
        return _0x78067b;
      };
      let _0x597923 = _0x469e57(this.promptEl);
      const _0x2b6417 = _0xe7370c.flatMap(_0x56d26e => (_0x56d26e.labels || [_0x56d26e.label]).map(_0x5a9885 => ({
        ref: _0x56d26e,
        label: _0x5a9885
      }))).sort((_0x4b8c03, _0x28dfa2) => _0x28dfa2.label.length - _0x4b8c03.label.length);
      _0x2b6417.forEach(({
        ref: _0x3d4925,
        label: _0x267e97
      }) => {
        if (!_0x3d4925.used) {
          const _0x297955 = new RegExp(_0x267e97.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "[\\s\\u00A0]*"), "g");
          if (_0x297955.test(_0x597923)) {
            _0x3d4925.used = true;
            if (_0x3d4925.content) {
              _0x597923 = _0x597923.replace(_0x297955, " " + _0x3d4925.content + " ");
            } else if (_0x3d4925.url) {
              _0x597923 = _0x597923.replace(_0x297955, " " + _0x267e97.trim() + " ");
              _0x426e5f(_0x3d4925);
            }
          }
        }
      });
      let _0x4c3978 = "";
      _0x242330.text.forEach(_0x1fd245 => {
        if (!_0x1fd245.used && _0x1fd245.content) {
          _0x4c3978 += _0x1fd245.content + "\n";
          _0x1fd245.used = true;
        }
      });
      if (_0x4c3978) {
        _0x597923 = _0x4c3978 + _0x597923;
      }
      _0xe7370c.forEach(_0x29d88c => {
        if (!_0x29d88c.used && _0x29d88c.url && !_0x3513db.includes(_0x29d88c.url)) {
          _0x426e5f(_0x29d88c);
        }
      });
      if (!_0x597923) {
        window.showToast?.(a353_0x232d67("aigenText.task.promptRequired"), "warn");
        return null;
      }
      const _0x1ed8d2 = _0x5e1b27();
      const _0x551ca3 = this._data.model || "apimart/kimi-k2-instruct";
      const _0x8a1f90 = resolveModelProvider(_0x551ca3, "", {
        allowProviderHint: false
      });
      let _0x175369 = this._data.provider;
      if (_0x1ed8d2.includes(_0x551ca3)) {
        _0x175369 = "custom";
      } else if (_0x8a1f90) {
        _0x175369 = _0x8a1f90;
      } else if (!_0x175369) {
        _0x175369 = (_0x551ca3.startsWith("gemini") || _0x551ca3.startsWith("gpt") || _0x551ca3.startsWith("claude")) && !_0x551ca3.includes("/") ? "grsai" : "openai";
      }
      if (isRunningHubImageToTextModel(_0x551ca3, _0x175369) && _0x126abf.length === 0) {
        window.showToast?.(a353_0x232d67("aigenText.task.imageReferenceRequired"), "warn");
        return null;
      }
      const _0x2f47bc = _0x171b53?.[this.nodeId]?.providerProfileId || this._data?.providerProfileId;
      const _0xd78342 = resolveModelGenerationProviderProfileId(_0x551ca3, _0x175369, _0x2f47bc);
      return {
        prompt: _0x597923,
        inputUrls: _0x3513db,
        inputImageUrls: _0x126abf,
        inputVideoUrls: _0x1cfcf8,
        inputAudioUrls: _0x330568,
        model: _0x551ca3,
        provider: _0x175369,
        ...(_0xd78342 ? {
          providerProfileId: _0xd78342
        } : {}),
        nodeId: this.nodeId
      };
    }
    _getPreviewGenerateButtonLoadingOptions() {
      return createPreviewGenerateButtonCallbacks(this, a353_0x232d67("aigenText.generate"));
    }
    async runGeneration(_0x4d2dcd = {}) {
      return this._onGenerate(null, _0x4d2dcd);
    }
    cancelGeneration() {
      return {
        ok: false,
        status: "not-cancellable",
        message: "Text generation is not cancellable yet."
      };
    }
    getGenerationStatus() {
      const _0x4eaf61 = _0x1317df.getState?.()?.nodes?.[this.nodeId] || this._data || {};
      const _0x395906 = String(_0x4eaf61.jobStatus || _0x4eaf61.textJobStatus || (this._isGenerating ? "running" : "idle"));
      return {
        nodeId: this.nodeId,
        jobStatus: _0x395906,
        isGenerating: this._isGenerating === true || _0x395906 === "running" || _0x395906 === "pending",
        taskId: String(_0x4eaf61.taskId || _0x4eaf61.asyncTaskId || ""),
        cancellable: false,
        resumable: false
      };
    }
    async _onGenerate(_0x424365 = null, _0x2af4ea = {}) {
      if (this._isGenerating) {
        return;
      }
      if (_0x2af4ea?.insertPrompt === true) {
        insertPresetPromptIntoEditor({
          storeApi: _0x1317df,
          nodeId: this.nodeId,
          promptEl: this.promptEl,
          template: _0x424365,
          inEdges: _0x1317df.getIncomingEdges(this.nodeId),
          nodes: _0x1317df.getState().nodes || {},
          allowedAssetTypes: ["text", "image", "video", "audio"]
        });
        this._updateSubmitButtonState?.();
        return;
      }
      if (shouldUsePromptPreviewForPreset(_0x424365)) {
        const _0x4a9064 = await this._buildPayload(_0x424365);
        if (!_0x4a9064) {
          return;
        }
        previewPresetPromptInEditor({
          storeApi: _0x1317df,
          nodeId: this.nodeId,
          promptEl: this.promptEl,
          promptText: _0x4a9064.prompt
        });
        return;
      }
      if (isPreviewModeEnabled()) {
        if (!isPreviewNodeLoading(this.nodeId)) {
          startPreviewNodeLoading(this.nodeId, this.previewEl, this._getPreviewGenerateButtonLoadingOptions());
        }
        return;
      }
      const _0x4346cf = _0x1317df.getState?.()?.nodes?.[this.nodeId] || this._data || {};
      const _0x1383be = guardModelGenerationCredentials({
        modelId: _0x4346cf?.model,
        provider: _0x4346cf?.provider,
        providerProfileId: _0x4346cf?.providerProfileId || _0x4346cf?.rhProviderProfileId
      });
      if (!_0x1383be.ready) {
        return;
      }
      const _0x5a864e = await this._buildPayload(_0x424365);
      if (!_0x5a864e) {
        return;
      }
      const _0x18dd1b = resolveModelExecution(_0x5a864e.model, {
        providerHint: _0x5a864e.provider
      }) || resolveModelExecution(_0x5a864e.model);
      const _0x458e88 = _0x18dd1b?.executionManifest?.adapterType || "modelApi";
      const _0x2112eb = _0x18dd1b?.executionManifest?.id || "text." + (_0x5a864e.provider || this._data.provider || "modelApi") + "." + (_0x5a864e.model || this._data.model || "default");
      this._isGenerating = true;
      _0xe904e1(this.previewEl);
      const _0x490ae7 = Date.now();
      this._updateSubmitButtonState?.();
      let _0x23a373 = null;
      try {
        _0x23a373 = await submitTask({
          sourceNodeId: this.nodeId,
          targetNodeId: this.nodeId,
          trigger: "node",
          taskType: "text-generation",
          provider: _0x5a864e.provider || this._data.provider || "",
          adapterType: _0x458e88,
          modelId: _0x5a864e.model || this._data.model || "",
          executionId: _0x2112eb,
          payload: _0x5a864e,
          cancellable: false,
          resumable: false,
          async: false,
          submit: () => _0xcf8691.generateText(_0x5a864e),
          resultBuilder: async (_0x15efb6, _0xe8f795) => {
            const _0x4fd261 = buildTextGenerationResultPatch(_0x15efb6, {
              startedAt: _0xe8f795.startedAt
            });
            const _0x48f546 = String(_0x4fd261?.outputText || "").trim();
            if (_0x48f546 && this.outputEl) {
              this._renderOutputText?.(_0x48f546);
            }
            return _0x4fd261;
          },
          failureBuilder: (_0x14f118, _0x4001bd) => {
            const _0x356879 = buildTextGenerationFailurePatch({
              error: _0x14f118 || a353_0x232d67("aigenText.task.generationFailed"),
              startedAt: _0x4001bd.startedAt
            });
            const _0x46fdd2 = String(_0x356879?.outputText || "").trim();
            if (_0x46fdd2 && this.outputEl) {
              this._renderOutputText?.(_0x46fdd2);
            }
            return _0x356879;
          },
          parseError: _0xe71bf3 => _0xe71bf3?.message || a353_0x232d67("aigenText.task.generationFailed")
        }, {
          store: _0x1317df,
          startedAt: _0x490ae7
        });
        if (_0x23a373.status === "failed") {
          const _0xe5d58e = _0x23a373.error;
          console.error("[AIGenTextNode] 生成失败:", _0xe5d58e);
          const _0x34a86c = showProviderApiKeyMissingToastForError(_0xe5d58e, {
            providerId: _0x5a864e?.providerProfileId || _0x5a864e?.provider,
            model: _0x5a864e?.model,
            adapterType: _0x458e88
          });
          if (!_0x34a86c && !isTextGenerationTimeoutError(_0xe5d58e)) {
            window.showToast?.(a353_0x232d67("aigenText.task.generationFailedWithError", {
              error: _0xe5d58e?.message || _0xe5d58e
            }), "error");
          }
        }
        return _0x23a373;
      } finally {
        this._isGenerating = false;
        this._updateSubmitButtonState?.();
        _0x360fc8(this.previewEl);
      }
    }
  }
  return _0x34f37c.prototype;
}