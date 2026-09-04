export const STORYBOARD_3D_IMAGE_POSE_RUNTIME = Object.freeze({
  id: "mediapipe-pose-landmarker-heavy-v1",
  adapterType: "localRuntime",
  version: "0.10.35",
  maxPoses: 1,
  input: Object.freeze({
    accept: Object.freeze(["image/jpeg", "image/png", "image/webp"]),
    maxBytes: 25165824
  }),
  options: Object.freeze({
    runningMode: "IMAGE",
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  })
});
export function validateStoryboard3DImagePoseFile(_0x55baf9, _0xbfeb02 = STORYBOARD_3D_IMAGE_POSE_RUNTIME) {
  const _0x199687 = String(_0x55baf9?.type || "").toLowerCase();
  const _0x9be206 = String(_0x55baf9?.name || "").toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  const _0x31f9f7 = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp"
  }[_0x9be206];
  const _0x5fd5b6 = _0x199687 === "image/jpg" ? "image/jpeg" : _0x199687 || _0x31f9f7 || "";
  const _0x6838b5 = Math.max(0, Number(_0x55baf9?.size) || 0);
  if (!_0xbfeb02.input.accept.includes(_0x5fd5b6)) {
    const _0x139695 = new Error("请选择 JPG、PNG 或 WebP 图片。");
    _0x139695.code = "POSE_IMAGE_TYPE_UNSUPPORTED";
    throw _0x139695;
  }
  if (_0x6838b5 <= 0) {
    const _0x24a274 = new Error("图片为空或无法读取。");
    _0x24a274.code = "POSE_IMAGE_EMPTY";
    throw _0x24a274;
  }
  if (_0x6838b5 > _0xbfeb02.input.maxBytes) {
    const _0x34dac4 = new Error("图片不能超过 24 MB。");
    _0x34dac4.code = "POSE_IMAGE_TOO_LARGE";
    throw _0x34dac4;
  }
  return {
    type: _0x5fd5b6,
    size: _0x6838b5
  };
}