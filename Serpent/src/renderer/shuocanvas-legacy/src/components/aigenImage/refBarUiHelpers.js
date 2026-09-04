import { bindRefThumbOrderDrag } from "../../modules/refThumbDragController.js";
import { escapeInputSlotLabelHtml, formatInputSlotLabelHtml } from "../shared/inputSlotLabelFormatter.js";
export function escapeRefBarHtml(_0xa0876d) {
  return escapeInputSlotLabelHtml(_0xa0876d);
}
export function formatRefUploadLabel(_0x1fe311) {
  return formatInputSlotLabelHtml(_0x1fe311);
}
export function syncImageRefBarButtonIcon({
  refBarEl: _0x11f534,
  pickMode: _0x594e19,
  nodeId: _0x57ef85
}) {
  const _0x327125 = _0x11f534?.querySelector(".btn-icon");
  if (!_0x327125) {
    return;
  }
  if (_0x594e19 && _0x594e19.active && _0x594e19.sourceNodeId === _0x57ef85) {
    _0x327125.style.opacity = "0";
    _0x327125.style.transform = "scale(0.4)";
    _0x327125.style.transition = "opacity 0.2s ease, transform 0.2s ease";
  } else {
    _0x327125.style.opacity = "";
    _0x327125.style.transform = "";
  }
}
export function bindImageRefThumbOrderDrag({
  owner: _0x2619ca,
  refBar: _0x221cef,
  store: _0x12c9d3,
  nodeId: _0x2ba283
}) {
  bindRefThumbOrderDrag({
    owner: _0x2619ca,
    container: _0x221cef,
    store: _0x12c9d3,
    nodeId: _0x2ba283
  });
}