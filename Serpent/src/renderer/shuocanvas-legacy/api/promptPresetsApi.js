import { get as a113_0x321906, post as a113_0xb5dce6 } from "./requester.js";
export async function fetchPromptPresetsFromServer() {
  try {
    const _0x4f3040 = await a113_0x321906("/api/v2/user/presets", {
      provider: "local"
    });
    if (_0x4f3040 && typeof _0x4f3040 === "object") {
      return _0x4f3040;
    } else {
      return {};
    }
  } catch {
    return {};
  }
}
export async function savePromptPresetToServer({
  nodeType: _0x8f146b,
  title: _0x2ad7ff,
  desc = "",
  template: _0x427a75,
  triggerMode = "",
  thumbnailDataUrl = "",
  thumbLocalPath = "",
  originalTitle = "",
  installId = ""
} = {}) {
  return await a113_0xb5dce6("/api/v2/user/presets/save", {
    nodeType: _0x8f146b,
    title: _0x2ad7ff,
    desc: desc,
    template: _0x427a75,
    triggerMode: triggerMode,
    thumbnailDataUrl: thumbnailDataUrl,
    thumbLocalPath: thumbLocalPath,
    originalTitle: originalTitle,
    installId: installId
  }, {
    provider: "local"
  });
}
export async function deletePromptPresetFromServer({
  nodeType: _0x20b78c,
  title: _0x45eda9
} = {}) {
  return await a113_0xb5dce6("/api/v2/user/presets/delete", {
    nodeType: _0x20b78c,
    title: _0x45eda9
  }, {
    provider: "local"
  });
}