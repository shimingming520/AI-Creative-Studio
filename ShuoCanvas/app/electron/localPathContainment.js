import { realpathSync } from "node:fs";
import a246_0x55d478 from "node:path";
export function isPathInsideRoot(_0xee7ea5, _0x5ab81a) {
  try {
    const _0x1f23c6 = a246_0x55d478.resolve(_0xee7ea5);
    const _0x5b5dc9 = a246_0x55d478.resolve(_0x5ab81a);
    const _0x381379 = a246_0x55d478.relative(_0x5b5dc9, _0x1f23c6);
    return _0x381379 === "" || _0x381379 !== ".." && !_0x381379.startsWith(".." + a246_0x55d478.sep) && !a246_0x55d478.isAbsolute(_0x381379);
  } catch {
    return false;
  }
}
export function resolveExistingPathWithinRoot(_0x4540d9, _0x5db4e8, {
  realpath = realpathSync
} = {}) {
  try {
    const _0x17d969 = a246_0x55d478.resolve(_0x4540d9);
    const _0x57b287 = a246_0x55d478.resolve(_0x17d969, _0x5db4e8);
    if (!isPathInsideRoot(_0x57b287, _0x17d969)) {
      return "";
    }
    const _0x4fffe9 = realpath(_0x17d969);
    const _0x291868 = realpath(_0x57b287);
    if (isPathInsideRoot(_0x291868, _0x4fffe9)) {
      return _0x291868;
    } else {
      return "";
    }
  } catch {
    return "";
  }
}