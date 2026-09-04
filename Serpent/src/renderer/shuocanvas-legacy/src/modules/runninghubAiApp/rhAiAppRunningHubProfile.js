import { getProviderConfig } from "../../../api/configApi.js";
import { RUNNINGHUB_INTERNATIONAL_PROFILE_ID, normalizeRunningHubModelApiProfileId } from "../runningHubProviderProfiles.js";
export function getDefaultRunningHubProfileId() {
  return normalizeRunningHubModelApiProfileId(getProviderConfig("runninghubwf")?.providerProfileId);
}
export function getRunningHubProfileShortLabel(_0x4565cc) {
  if (normalizeRunningHubModelApiProfileId(_0x4565cc) === RUNNINGHUB_INTERNATIONAL_PROFILE_ID) {
    return "国际";
  } else {
    return "国内";
  }
}
export function syncRunningHubProfileBadge(_0x58fa4f, _0x53b6d1, _0x45d666 = true) {
  const _0x45c480 = _0x58fa4f?.querySelector?.("[data-role='preview-runninghub-runtime-label']");
  if (!_0x45c480) {
    return false;
  }
  _0x45c480.hidden = !_0x45d666;
  _0x45c480.textContent = getRunningHubProfileShortLabel(_0x53b6d1);
  return true;
}