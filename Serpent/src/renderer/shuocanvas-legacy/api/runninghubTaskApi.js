import { post } from "./apiBase.js";
import { getRunningHubProviderProfileId } from "../src/modules/runningHubProviderProfiles.js";
export async function cancelRunningHubTask({
  apiKey: _0x5dfe5e,
  taskId: _0x57c3be,
  providerProfileId = "",
  rhProviderProfileId = ""
}) {
  try {
    const _0x3a0741 = await post("/api/v2/runninghubwf/cancel", {
      apiKey: _0x5dfe5e,
      taskId: _0x57c3be,
      providerProfileId: getRunningHubProviderProfileId({
        providerProfileId: providerProfileId,
        rhProviderProfileId: rhProviderProfileId
      })
    }, 60000);
    if (!_0x3a0741.success) {
      if (_0x3a0741.error && (_0x3a0741.error.includes("<") || _0x3a0741.error.includes("DOCTYPE") || _0x3a0741.error.includes("html"))) {
        throw new Error("取消失败：服务器返回了非预期的响应格式");
      }
      throw new Error(_0x3a0741.error || "取消失败");
    }
    return _0x3a0741.data;
  } catch (_0x2fd0eb) {
    if (_0x2fd0eb.message && _0x2fd0eb.message.includes("Unexpected token") && (_0x2fd0eb.message.includes("DOCTYPE") || _0x2fd0eb.message.includes("<"))) {
      throw new Error("取消失败：服务器返回了非预期的响应格式");
    }
    if (_0x2fd0eb.name === "AbortError" || _0x2fd0eb.message.includes("signal is aborted")) {
      throw new Error("取消操作已执行");
    }
    throw _0x2fd0eb;
  }
}