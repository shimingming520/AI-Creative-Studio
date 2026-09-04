const COMFYUI_LOCAL_WORKFLOW_SVG = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"4\" y=\"4\" width=\"6\" height=\"6\" rx=\"1.5\"></rect><rect x=\"14\" y=\"4\" width=\"6\" height=\"6\" rx=\"1.5\"></rect><rect x=\"9\" y=\"14\" width=\"6\" height=\"6\" rx=\"1.5\"></rect><path d=\"M10 7h4\"></path><path d=\"m12 10v4\"></path></svg>";
const COMFYUI_CLOUD_WORKFLOW_SVG = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M7.5 18h9.2a4.3 4.3 0 0 0 .6-8.56A6.1 6.1 0 0 0 5.7 11.2 3.45 3.45 0 0 0 7.5 18Z\"></path><path d=\"M9 15h6\"></path><path d=\"m13 13 2 2-2 2\"></path></svg>";
function sanitizeClassList(_0x47b966 = "") {
  return String(_0x47b966 || "").split(/\s+/).filter(_0x85ff6c => /^[a-zA-Z0-9_-]+$/.test(_0x85ff6c)).join(" ");
}
function buildLogoClassName(_0x3d843a, _0x22d6b6 = "") {
  return ["custom-ai-app-logo", _0x3d843a, sanitizeClassList(_0x22d6b6)].filter(Boolean).join(" ");
}
export function renderRunningHubAiAppLogoHtml({
  className = ""
} = {}) {
  return "<span class=\"" + buildLogoClassName("custom-ai-app-logo--runninghub", className) + "\" aria-hidden=\"true\">RH</span>";
}
export function renderComfyUiLocalWorkflowLogoHtml({
  className = ""
} = {}) {
  return "<span class=\"" + buildLogoClassName("custom-ai-app-logo--comfyui-local", className) + "\" aria-hidden=\"true\">" + COMFYUI_LOCAL_WORKFLOW_SVG + "</span>";
}
export function renderComfyUiCloudWorkflowLogoHtml({
  className = ""
} = {}) {
  return "<span class=\"" + buildLogoClassName("custom-ai-app-logo--comfyui-cloud", className) + "\" aria-hidden=\"true\">" + COMFYUI_CLOUD_WORKFLOW_SVG + "</span>";
}
export function renderComfyUiGenericWorkflowLogoHtml({
  className = ""
} = {}) {
  return "<span class=\"" + buildLogoClassName("custom-ai-app-logo--comfyui-generic", className) + "\" aria-hidden=\"true\">C</span>";
}
export function renderComfyUiWorkflowLogoHtmlFromIconKind(_0x3bd677 = "", _0x30d806 = {}) {
  const _0xc62baf = String(_0x3bd677 || "").trim();
  if (_0xc62baf === "comfyUiCloudWorkflowBadge") {
    return renderComfyUiCloudWorkflowLogoHtml(_0x30d806);
  }
  if (_0xc62baf === "comfyUiLocalWorkflowBadge") {
    return renderComfyUiLocalWorkflowLogoHtml(_0x30d806);
  }
  return renderComfyUiGenericWorkflowLogoHtml(_0x30d806);
}