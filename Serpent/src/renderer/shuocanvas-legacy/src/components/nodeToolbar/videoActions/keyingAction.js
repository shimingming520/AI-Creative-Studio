import { t } from "../../../i18n/index.js";
import { VIDEO_KEYING_TASK_CHANGE_EVENT, cancelVideoKeyingTaskForNode, hasRunningVideoKeyingTaskForNode } from "../../../modules/videoKeyingTaskRuntime.js";
function videoToolbarText(_0x5215ba) {
  return t("nodeToolbar.video." + _0x5215ba);
}
export function bindVideoKeyingAction(_0x168126) {
  const {
    toolbarEl: _0x2417c6,
    nodeData: _0x1a1491,
    getStateSnapshot: _0x5ae3b7,
    VideoClipController: _0x3cfebb,
    VideoKeyingController: _0x128499,
    VIDEO_TOOLBAR_FOCUS_PADDING: _0x59d241,
    VIDEO_TOOLBAR_FOCUS_DURATION_MS: _0x18c694,
    VIDEO_TOOLBAR_FOCUS_MAX_ZOOM: _0x282a93,
    KEYING_CANCEL_ICON_HTML: _0x4fc6fb
  } = _0x168126;
  const _0x13d6a8 = _0x2417c6.querySelector(".act-keying");
  if (_0x13d6a8) {
    const _0x547954 = {
      html: _0x13d6a8.innerHTML,
      tooltip: _0x13d6a8.dataset.tooltip || "",
      aria: _0x13d6a8.getAttribute("aria-label") || "",
      title: _0x13d6a8.title || ""
    };
    const _0x4e4628 = () => String(_0x1a1491?.id || "").trim();
    let _0x4f5acd = null;
    const _0x17925a = () => {
      if (_0x2417c6.isConnected === false) {
        window.removeEventListener?.(VIDEO_KEYING_TASK_CHANGE_EVENT, _0x17925a);
        return;
      }
      const _0xc54ec1 = hasRunningVideoKeyingTaskForNode(_0x4e4628(), {
        mode: "keying"
      });
      if (_0x4f5acd === _0xc54ec1) {
        return;
      }
      _0x4f5acd = _0xc54ec1;
      _0x13d6a8.classList.toggle("is-task-cancel", _0xc54ec1);
      if (_0xc54ec1) {
        _0x13d6a8.innerHTML = _0x4fc6fb;
        _0x13d6a8.dataset.tooltip = videoToolbarText("cancelKeyingTask");
        _0x13d6a8.setAttribute("aria-label", videoToolbarText("cancelKeyingTask"));
        _0x13d6a8.title = videoToolbarText("cancelKeyingTask");
        return;
      }
      _0x13d6a8.innerHTML = _0x547954.html;
      if (_0x547954.tooltip) {
        _0x13d6a8.dataset.tooltip = _0x547954.tooltip;
      } else {
        delete _0x13d6a8.dataset.tooltip;
      }
      if (_0x547954.aria) {
        _0x13d6a8.setAttribute("aria-label", _0x547954.aria);
      } else {
        _0x13d6a8.removeAttribute("aria-label");
      }
      _0x13d6a8.title = _0x547954.title;
    };
    window.addEventListener?.(VIDEO_KEYING_TASK_CHANGE_EVENT, _0x17925a);
    _0x13d6a8._cleanupKeyingButtonState = () => {
      window.removeEventListener?.(VIDEO_KEYING_TASK_CHANGE_EVENT, _0x17925a);
    };
    _0x17925a();
    _0x13d6a8.addEventListener("click", _0x1bf949 => {
      _0x1bf949.preventDefault();
      _0x1bf949.stopPropagation();
      if (hasRunningVideoKeyingTaskForNode(_0x4e4628(), {
        mode: "keying"
      })) {
        cancelVideoKeyingTaskForNode(_0x4e4628(), {
          mode: "keying",
          notify: true
        }).finally(_0x17925a);
        return;
      }
      const _0x28e646 = _0x5ae3b7();
      if (_0x28e646.videoKeying?.active) {
        window.showToast?.(videoToolbarText("exitKeyingMode"), "info");
        return;
      }
      if (_0x28e646.videoClip?.active) {
        window.showToast?.(videoToolbarText("exitClipMode"), "info");
        return;
      }
      _0x3cfebb.exit({
        silent: true
      });
      if (window.v2FocusOnNode) {
        window.v2FocusOnNode(_0x1a1491.id, _0x59d241, _0x18c694, _0x282a93);
        setTimeout(() => {
          _0x128499.init(_0x1a1491.id);
        }, _0x18c694);
      } else {
        _0x128499.init(_0x1a1491.id);
      }
    });
  }
}