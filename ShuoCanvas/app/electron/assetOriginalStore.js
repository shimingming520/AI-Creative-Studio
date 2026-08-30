import { createHash, randomBytes } from "node:crypto";
import { mkdir, lstat, open, rename, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import a200_0x4c1d57 from "node:path";
import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
export function getExistingAssetOriginalFilename(_0x2e5469, _0x3a4b24 = {}) {
  const _0x56f08f = String(_0x2e5469 || "").trim();
  if (!SHA256_PATTERN.test(_0x56f08f)) {
    return "";
  }
  const _0x305bdd = String(_0x3a4b24.originalLocalPath || "").replace(/\\/g, "/");
  if (a200_0x4c1d57.posix.dirname(_0x305bdd) !== "data/assets/original") {
    return "";
  }
  const _0x336566 = a200_0x4c1d57.posix.basename(_0x305bdd);
  if (!_0x336566.startsWith(_0x56f08f)) {
    return "";
  }
  const _0x3105f4 = _0x336566.slice(_0x56f08f.length);
  if (_0x3105f4 && !/^\.[a-z0-9]{1,12}$/i.test(_0x3105f4)) {
    return "";
  }
  return _0x336566;
}
const targetQueues = new Map();
export class AssetOriginalIntegrityError extends Error {
  constructor({
    expectedSha256: _0x8d97f9,
    actualSha256: _0x40c717,
    expectedSize: _0x4b771f,
    actualSize: _0x43db8d
  }) {
    super("Asset original integrity mismatch: expected " + _0x4b771f + " bytes/" + _0x8d97f9 + ", got " + _0x43db8d + " bytes/" + (_0x40c717 ?? "unavailable"));
    this.name = "AssetOriginalIntegrityError";
    this.code = "ASSET_ORIGINAL_INTEGRITY_MISMATCH";
    this.expectedSha256 = _0x8d97f9;
    this.actualSha256 = _0x40c717;
    this.expectedSize = _0x4b771f;
    this.actualSize = _0x43db8d;
  }
}
function normalizeOptions(_0x3f467b) {
  if (!_0x3f467b || typeof _0x3f467b !== "object") {
    throw new TypeError("Asset original options must be an object");
  }
  const {
    targetPath: _0x3e06ba,
    expectedSha256: _0x2469f7,
    expectedSize: _0x278c2f,
    sourcePath: _0x4bbae9,
    sourceBuffer: _0x4343c5,
    sourceStream: _0x569811,
    createSourceStream: _0x49dc2d
  } = _0x3f467b;
  if (typeof _0x3e06ba !== "string" || _0x3e06ba.trim() === "") {
    throw new TypeError("targetPath must be a non-empty string");
  }
  if (typeof _0x2469f7 !== "string" || !SHA256_PATTERN.test(_0x2469f7)) {
    throw new TypeError("expectedSha256 must be a 64-character hex string");
  }
  if (!Number.isSafeInteger(_0x278c2f) || _0x278c2f < 0) {
    throw new RangeError("expectedSize must be a non-negative safe integer");
  }
  const _0x14b073 = [_0x4bbae9 !== undefined, _0x4343c5 !== undefined, _0x569811 !== undefined, _0x49dc2d !== undefined].filter(Boolean).length;
  if (_0x14b073 !== 1) {
    throw new TypeError("Exactly one of sourcePath, sourceBuffer, sourceStream, or createSourceStream is required");
  }
  if (_0x4bbae9 !== undefined && typeof _0x4bbae9 !== "string") {
    throw new TypeError("sourcePath must be a string");
  }
  if (_0x4343c5 !== undefined && !Buffer.isBuffer(_0x4343c5) && !(_0x4343c5 instanceof Uint8Array) && !(_0x4343c5 instanceof ArrayBuffer)) {
    throw new TypeError("sourceBuffer must be a Buffer, Uint8Array, or ArrayBuffer");
  }
  if (_0x49dc2d !== undefined && typeof _0x49dc2d !== "function") {
    throw new TypeError("createSourceStream must be a function");
  }
  return {
    targetPath: a200_0x4c1d57.resolve(_0x3e06ba),
    expectedSha256: _0x2469f7.toLowerCase(),
    expectedSize: _0x278c2f,
    sourcePath: _0x4bbae9 === undefined ? undefined : a200_0x4c1d57.resolve(_0x4bbae9),
    sourceBuffer: _0x4343c5,
    sourceStream: _0x569811,
    createSourceStream: _0x49dc2d
  };
}
function targetQueueKey(_0x57fd47) {
  if (process.platform === "win32" || process.platform === "darwin") {
    return _0x57fd47.toLowerCase();
  } else {
    return _0x57fd47;
  }
}
function runForTarget(_0x47c135, _0x1d4482) {
  const _0x117e92 = targetQueueKey(_0x47c135);
  const _0x78416c = targetQueues.get(_0x117e92) ?? Promise.resolve();
  const _0x41b362 = _0x78416c.catch(() => undefined).then(_0x1d4482);
  targetQueues.set(_0x117e92, _0x41b362);
  return _0x41b362.finally(() => {
    if (targetQueues.get(_0x117e92) === _0x41b362) {
      targetQueues.delete(_0x117e92);
    }
  });
}
async function inspectExistingTarget({
  targetPath: _0x1ca563,
  expectedSha256: _0x220579,
  expectedSize: _0x5748c6
}) {
  try {
    const _0x43526c = await lstat(_0x1ca563);
    if (!_0x43526c.isFile()) {
      const _0x244f56 = new Error("Asset original target exists but is not a regular file: " + _0x1ca563);
      _0x244f56.code = "ASSET_ORIGINAL_TARGET_NOT_FILE";
      throw _0x244f56;
    }
    if (_0x43526c.size !== _0x5748c6) {
      return {
        exists: true,
        valid: false
      };
    }
    const _0x19c5ef = createHash("sha256");
    let _0x5df4c7 = 0;
    for await (const _0x2427a1 of createReadStream(_0x1ca563)) {
      _0x19c5ef.update(_0x2427a1);
      _0x5df4c7 += _0x2427a1.length;
    }
    const _0x29825d = _0x19c5ef.digest("hex");
    return {
      exists: true,
      valid: _0x5df4c7 === _0x5748c6 && _0x29825d === _0x220579
    };
  } catch (_0x408330) {
    if (_0x408330?.code === "ENOENT") {
      return {
        exists: false,
        valid: false
      };
    }
    throw _0x408330;
  }
}
function copySourceBuffer(_0x2a9d70) {
  if (Buffer.isBuffer(_0x2a9d70) || _0x2a9d70 instanceof Uint8Array) {
    return Buffer.from(_0x2a9d70);
  }
  return Buffer.from(new Uint8Array(_0x2a9d70));
}
async function resolveSource(_0x536960) {
  if (_0x536960.sourcePath !== undefined) {
    return createReadStream(_0x536960.sourcePath);
  }
  if (_0x536960.sourceBuffer !== undefined) {
    return Readable.from([copySourceBuffer(_0x536960.sourceBuffer)]);
  }
  if (_0x536960.createSourceStream !== undefined) {
    const _0x15f907 = await _0x536960.createSourceStream();
    if (_0x15f907 === undefined || _0x15f907 === null) {
      throw new TypeError("createSourceStream must return a readable source");
    }
    return _0x15f907;
  }
  if (_0x536960.sourceStream === null) {
    throw new TypeError("sourceStream must be a readable source");
  }
  return _0x536960.sourceStream;
}
async function disposeUnusedSource(_0x2be6e5) {
  if (!_0x2be6e5) {
    return;
  }
  if (typeof _0x2be6e5.destroy === "function") {
    _0x2be6e5.destroy();
    return;
  }
  if (typeof _0x2be6e5.cancel === "function") {
    try {
      await _0x2be6e5.cancel();
    } catch {}
  }
}
function createPartPath(_0x84db24) {
  const _0x3e2d7b = a200_0x4c1d57.dirname(_0x84db24);
  const _0x909c9b = a200_0x4c1d57.basename(_0x84db24);
  const _0x3723c6 = randomBytes(8).toString("hex");
  return a200_0x4c1d57.join(_0x3e2d7b, "." + _0x909c9b + "." + process.pid + "." + Date.now() + "." + _0x3723c6 + ".part");
}
function createFileHandleWritable(_0x4b7d66) {
  return new Writable({
    write(_0x24f958, _0x499a7a, _0x1c04bc) {
      const _0x2c3e43 = Buffer.isBuffer(_0x24f958) ? _0x24f958 : Buffer.from(_0x24f958, _0x499a7a);
      (async () => {
        let _0x1513e1 = 0;
        while (_0x1513e1 < _0x2c3e43.length) {
          const {
            bytesWritten: _0x135e81
          } = await _0x4b7d66.write(_0x2c3e43, _0x1513e1, _0x2c3e43.length - _0x1513e1, null);
          if (_0x135e81 === 0) {
            throw new Error("Unable to make progress writing asset part file");
          }
          _0x1513e1 += _0x135e81;
        }
      })().then(() => _0x1c04bc(), _0x1c04bc);
    }
  });
}
async function writeVerifiedPart({
  partPath: _0x1abbc1,
  source: _0xef6e23,
  expectedSha256: _0x4f6098,
  expectedSize: _0x2cf2cd
}) {
  let _0x5dc248;
  const _0x444aa7 = createHash("sha256");
  let _0x52dbe1 = 0;
  try {
    _0x5dc248 = await open(_0x1abbc1, "wx", 384);
    const _0x10e932 = new Transform({
      transform(_0x5e5f1a, _0x13284d, _0x3709d4) {
        try {
          const _0x5ba7fd = Buffer.isBuffer(_0x5e5f1a) ? _0x5e5f1a : Buffer.from(_0x5e5f1a, _0x13284d);
          _0x52dbe1 += _0x5ba7fd.length;
          if (_0x52dbe1 > _0x2cf2cd) {
            _0x3709d4(new AssetOriginalIntegrityError({
              expectedSha256: _0x4f6098,
              actualSha256: null,
              expectedSize: _0x2cf2cd,
              actualSize: _0x52dbe1
            }));
            return;
          }
          _0x444aa7.update(_0x5ba7fd);
          _0x3709d4(null, _0x5ba7fd);
        } catch (_0x5ee268) {
          _0x3709d4(_0x5ee268);
        }
      }
    });
    const _0x58ec4f = createFileHandleWritable(_0x5dc248);
    await pipeline(_0xef6e23, _0x10e932, _0x58ec4f);
    await _0x5dc248.sync();
    const _0x2f77ce = _0x444aa7.digest("hex");
    if (_0x52dbe1 !== _0x2cf2cd || _0x2f77ce !== _0x4f6098) {
      throw new AssetOriginalIntegrityError({
        expectedSha256: _0x4f6098,
        actualSha256: _0x2f77ce,
        expectedSize: _0x2cf2cd,
        actualSize: _0x52dbe1
      });
    }
  } finally {
    if (_0x5dc248) {
      await _0x5dc248.close();
    }
  }
}
async function syncDirectoryBestEffort(_0x38dd85) {
  let _0xc3a09b;
  try {
    _0xc3a09b = await open(_0x38dd85, "r");
    await _0xc3a09b.sync();
  } catch {} finally {
    if (_0xc3a09b) {
      try {
        await _0xc3a09b.close();
      } catch {}
    }
  }
}
async function materializeNormalized(_0x470215) {
  const _0x276e5d = a200_0x4c1d57.dirname(_0x470215.targetPath);
  await mkdir(_0x276e5d, {
    recursive: true
  });
  const _0x28baa6 = await inspectExistingTarget(_0x470215);
  if (_0x28baa6.valid) {
    await disposeUnusedSource(_0x470215.sourceStream);
    return {
      targetPath: _0x470215.targetPath,
      sha256: _0x470215.expectedSha256,
      size: _0x470215.expectedSize,
      reused: true,
      repaired: false,
      created: false
    };
  }
  const _0x4c6fe5 = createPartPath(_0x470215.targetPath);
  try {
    const _0x46ede7 = await resolveSource(_0x470215);
    await writeVerifiedPart({
      partPath: _0x4c6fe5,
      source: _0x46ede7,
      expectedSha256: _0x470215.expectedSha256,
      expectedSize: _0x470215.expectedSize
    });
    await rename(_0x4c6fe5, _0x470215.targetPath);
    await syncDirectoryBestEffort(_0x276e5d);
  } finally {
    await rm(_0x4c6fe5, {
      force: true
    });
  }
  return {
    targetPath: _0x470215.targetPath,
    sha256: _0x470215.expectedSha256,
    size: _0x470215.expectedSize,
    reused: false,
    repaired: _0x28baa6.exists,
    created: !_0x28baa6.exists
  };
}
export function createAssetOriginalStore() {
  return {
    materialize(_0x2c33ba) {
      const _0x42db20 = normalizeOptions(_0x2c33ba);
      return runForTarget(_0x42db20.targetPath, () => materializeNormalized(_0x42db20));
    }
  };
}
const defaultStore = createAssetOriginalStore();
export function materializeAssetOriginal(_0x57d923) {
  return defaultStore.materialize(_0x57d923);
}