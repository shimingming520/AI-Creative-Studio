export function scrollAgentMessageListToEnd(_0x394f10) {
  if (!_0x394f10) {
    return;
  }
  const _0x275e4d = _0x394f10.style?.scrollBehavior || "";
  if (_0x394f10.style) {
    _0x394f10.style.scrollBehavior = "auto";
  }
  _0x394f10.scrollTop = _0x394f10.scrollHeight;
  if (!_0x394f10.style) {
    return;
  }
  if (_0x275e4d) {
    _0x394f10.style.scrollBehavior = _0x275e4d;
  } else if (typeof _0x394f10.style.removeProperty === "function") {
    _0x394f10.style.removeProperty("scroll-behavior");
  } else {
    _0x394f10.style.scrollBehavior = "";
  }
}