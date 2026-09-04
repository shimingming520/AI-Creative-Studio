export const RUNNINGHUB_DEFAULT_INSTANCE_TYPE = "default";
export const RUNNINGHUB_PLUS_INSTANCE_TYPE = "plus";
export const RUNNINGHUB_ULTRA_INSTANCE_TYPE = "Ultra";
export const RUNNINGHUB_INSTANCE_OPTIONS = Object.freeze([Object.freeze({
  value: RUNNINGHUB_DEFAULT_INSTANCE_TYPE,
  label: "24G"
}), Object.freeze({
  value: RUNNINGHUB_PLUS_INSTANCE_TYPE,
  label: "48G"
})]);
export const RUNNINGHUB_DEVELOPER_INSTANCE_OPTIONS = Object.freeze([Object.freeze({
  value: RUNNINGHUB_ULTRA_INSTANCE_TYPE,
  label: "96G"
})]);
export const RUNNINGHUB_INSTANCE_TYPE_ALLOWED_VALUES = Object.freeze([RUNNINGHUB_DEFAULT_INSTANCE_TYPE, RUNNINGHUB_PLUS_INSTANCE_TYPE, RUNNINGHUB_ULTRA_INSTANCE_TYPE]);
export function normalizeRunningHubInstanceType(_0x488a41) {
  const _0x43b4fd = String(_0x488a41 || "").trim().toLowerCase();
  if (_0x43b4fd === RUNNINGHUB_PLUS_INSTANCE_TYPE) {
    return RUNNINGHUB_PLUS_INSTANCE_TYPE;
  }
  if (_0x43b4fd === RUNNINGHUB_ULTRA_INSTANCE_TYPE.toLowerCase()) {
    return RUNNINGHUB_ULTRA_INSTANCE_TYPE;
  }
  return RUNNINGHUB_DEFAULT_INSTANCE_TYPE;
}
export function getRunningHubInstanceTypeLabel(_0x66a99e) {
  const _0x20411c = normalizeRunningHubInstanceType(_0x66a99e);
  if (_0x20411c === RUNNINGHUB_ULTRA_INSTANCE_TYPE) {
    return "96G";
  }
  if (_0x20411c === RUNNINGHUB_PLUS_INSTANCE_TYPE) {
    return "48G";
  }
  return "24G";
}