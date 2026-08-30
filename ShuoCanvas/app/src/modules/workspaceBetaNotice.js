function hasSeenWorkspaceBetaNotice(_0x217ae7, _0x5e7031) {
  try {
    return _0x217ae7?.localStorage?.getItem?.(_0x5e7031) === "1";
  } catch {
    return false;
  }
}
function markWorkspaceBetaNoticeSeen(_0x2aec45, _0x2ba45b) {
  try {
    _0x2aec45?.localStorage?.setItem?.(_0x2ba45b, "1");
    return true;
  } catch {
    return false;
  }
}
export function hasSeenBetaNotice({
  windowObject = globalThis.window,
  storageKey = ""
} = {}) {
  return hasSeenWorkspaceBetaNotice(windowObject, storageKey);
}
export function markBetaNoticeSeen({
  windowObject = globalThis.window,
  storageKey = ""
} = {}) {
  return markWorkspaceBetaNoticeSeen(windowObject, storageKey);
}
export function showWorkspaceBetaNotice({
  documentObject = globalThis.document,
  windowObject = globalThis.window,
  storageKey = "",
  title = "",
  message = ""
} = {}) {
  if (!documentObject?.body) {
    return false;
  }
  if (hasSeenWorkspaceBetaNotice(windowObject, storageKey)) {
    return false;
  }
  markWorkspaceBetaNoticeSeen(windowObject, storageKey);
  const _0xdbeca7 = "story-beta-notice-overlay";
  const _0xc4b13e = documentObject.getElementById(_0xdbeca7);
  if (typeof _0xc4b13e?._workspaceNoticeClose === "function") {
    _0xc4b13e._workspaceNoticeClose();
  } else {
    _0xc4b13e?.remove();
  }
  const _0x19d403 = documentObject.createElement("div");
  _0x19d403.id = _0xdbeca7;
  _0x19d403.className = "custom-confirm-overlay";
  _0x19d403.dataset.workspaceModeNotice = "1";
  const _0x274cc4 = documentObject.createElement("div");
  _0x274cc4.className = "custom-confirm-box";
  const _0x635899 = documentObject.createElement("div");
  _0x635899.className = "confirm-title";
  _0x635899.textContent = title;
  const _0x13ec64 = documentObject.createElement("div");
  _0x13ec64.className = "confirm-msg";
  _0x13ec64.textContent = message;
  const _0xf648eb = documentObject.createElement("div");
  _0xf648eb.className = "confirm-btns";
  const _0x434cf0 = documentObject.createElement("button");
  _0x434cf0.type = "button";
  _0x434cf0.className = "confirm-btn confirm-ok";
  _0x434cf0.textContent = "我知道了";
  let _0x48678c = false;
  const _0xe92135 = _0x5382b9 => {
    if (_0x5382b9.key !== "Escape") {
      return;
    }
    _0x5382b9.preventDefault();
    _0xd1806c();
  };
  const _0xd1806c = () => {
    if (_0x48678c) {
      return;
    }
    _0x48678c = true;
    documentObject.removeEventListener("keydown", _0xe92135, true);
    _0x19d403.remove();
  };
  _0x19d403._workspaceNoticeClose = _0xd1806c;
  _0x434cf0.addEventListener("click", _0xd1806c);
  _0x19d403.addEventListener("click", _0x29ee25 => {
    if (_0x29ee25.target === _0x19d403) {
      _0xd1806c();
    }
  });
  _0xf648eb.appendChild(_0x434cf0);
  _0x274cc4.append(_0x635899, _0x13ec64, _0xf648eb);
  _0x19d403.appendChild(_0x274cc4);
  documentObject.body.appendChild(_0x19d403);
  documentObject.addEventListener("keydown", _0xe92135, true);
  _0x434cf0.focus?.();
  return true;
}