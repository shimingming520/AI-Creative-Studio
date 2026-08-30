export function isReplacementStudioAuthorized() {
  return true;
}

export function requestReplacementStudioAuthorization({
  onSuccess = null
} = {}) {
  if (typeof onSuccess === "function") {
    onSuccess();
  }
  return true;
}
