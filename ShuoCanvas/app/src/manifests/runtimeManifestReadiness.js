let pendingRuntimeManifestLoad = Promise.resolve();
let pendingRuntimeManifestLoadCount = 0;
export function trackRuntimeManifestLoad(_0x183aa8) {
  pendingRuntimeManifestLoadCount += 1;
  const _0x292c80 = Promise.resolve(_0x183aa8).then(() => undefined, () => undefined).finally(() => {
    pendingRuntimeManifestLoadCount = Math.max(0, pendingRuntimeManifestLoadCount - 1);
  });
  pendingRuntimeManifestLoad = Promise.all([pendingRuntimeManifestLoad, _0x292c80]).then(() => undefined);
  return _0x183aa8;
}
export function hasPendingRuntimeManifestLoad() {
  return pendingRuntimeManifestLoadCount > 0;
}
export async function waitForRuntimeManifestLoad({
  timeoutMs = 500
} = {}) {
  const _0x4b9d5a = pendingRuntimeManifestLoad;
  const _0x182907 = Math.max(0, Number(timeoutMs) || 0);
  if (!_0x182907) {
    await _0x4b9d5a;
    return true;
  }
  let _0x53d353 = null;
  try {
    return await Promise.race([_0x4b9d5a.then(() => true), new Promise(_0xf62643 => {
      _0x53d353 = setTimeout(() => _0xf62643(false), _0x182907);
    })]);
  } finally {
    if (_0x53d353 !== null) {
      clearTimeout(_0x53d353);
    }
  }
}