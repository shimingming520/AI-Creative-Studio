// 订阅/CDKEY 服务已移除。保留兼容导出，避免旧版调用方崩溃。
export async function fetchSubscriptionStatus() {
  return { success: true, status: "active" };
}

export async function activateCdkey() {
  return { success: true, status: "active" };
}

export async function clearSubscriptionAuthorization() {
  return { success: true, status: "active" };
}
