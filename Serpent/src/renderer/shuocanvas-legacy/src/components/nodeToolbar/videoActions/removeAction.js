import { t } from "../../../i18n/index.js";
import { cancelVideoKeyingTaskForNode, getRunningVideoKeyingTaskForNode, hasRunningVideoKeyingTaskForNode } from "../../../modules/videoKeyingTaskRuntime.js";
function videoToolbarText(_0x5dbdf3) {
  return t("nodeToolbar.video." + _0x5dbdf3);
}
export function bindVideoRemoveAction(_0xa04fe6) {
  const {
    toolbarEl: _0x355184,
    nodeData: _0x1212be,
    getStateSnapshot: _0x29f349,
    VideoClipController: _0x5323ae,
    VideoKeyingController: _0x225460,
    VIDEO_TOOLBAR_FOCUS_PADDING: _0x2f85c1,
    VIDEO_TOOLBAR_FOCUS_DURATION_MS: _0x62d7b8,
    VIDEO_TOOLBAR_FOCUS_MAX_ZOOM: _0xc8d5ed,
    bindRunningHubToolbarTaskButton: _0x2dfc2f
  } = _0xa04fe6;
  const _0x38ebb3 = _0x355184.querySelector(".act-remove");
  if (_0x38ebb3) {
    _0x2dfc2f({
      button: _0x38ebb3,
      getTask: () => getRunningVideoKeyingTaskForNode(_0x1212be.id, {
        mode: "remove"
      }),
      cancelTask: () => cancelVideoKeyingTaskForNode(_0x1212be.id, {
        mode: "remove",
        notify: true
      }),
      cancelTooltip: videoToolbarText("cancelRemoveTask")
    });
    _0x38ebb3.addEventListener("click", _0x231aed => {
      if (hasRunningVideoKeyingTaskForNode(_0x1212be.id, {
        mode: "remove"
      })) {
        _0x231aed.preventDefault();
        _0x231aed.stopPropagation();
        cancelVideoKeyingTaskForNode(_0x1212be.id, {
          mode: "remove",
          notify: true
        });
        return;
      }
      _0x231aed.stopPropagation();
      const _0x1f0a89 = _0x29f349();
      if (_0x1f0a89.videoKeying?.active) {
        window.showToast?.(videoToolbarText("exitCurrentEditMode"), "info");
        return;
      }
      if (_0x1f0a89.videoClip?.active) {
        window.showToast?.(videoToolbarText("exitClipMode"), "info");
        return;
      }
      _0x5323ae.exit({
        silent: true
      });
      if (window.v2FocusOnNode) {
        window.v2FocusOnNode(_0x1212be.id, _0x2f85c1, _0x62d7b8, _0xc8d5ed);
        setTimeout(() => {
          _0x225460.init(_0x1212be.id, {
            uiMode: "remove"
          });
        }, _0x62d7b8);
      } else {
        _0x225460.init(_0x1212be.id, {
          uiMode: "remove"
        });
      }
    });
  }
}