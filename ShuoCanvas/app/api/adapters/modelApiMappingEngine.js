function isPlainObject(_0x569c48) {
  return !!_0x569c48 && typeof _0x569c48 === "object" && !Array.isArray(_0x569c48);
}
function isPresentValue(_0xeab98d) {
  if (_0xeab98d === undefined || _0xeab98d === null) {
    return false;
  }
  if (typeof _0xeab98d === "string") {
    return _0xeab98d.trim() !== "";
  }
  if (Array.isArray(_0xeab98d)) {
    return _0xeab98d.length > 0;
  }
  return true;
}
export function getPathValue(_0x466446, _0x5d26e3) {
  const _0x4e9ff3 = String(_0x5d26e3 || "").trim();
  if (!_0x4e9ff3) {
    return undefined;
  }
  return _0x4e9ff3.split(".").reduce((_0x3e0136, _0x83d96e) => {
    if (_0x3e0136 === undefined || _0x3e0136 === null) {
      return undefined;
    }
    return _0x3e0136[_0x83d96e];
  }, _0x466446);
}
export function setPathValue(_0x5698d0, _0x520570, _0x383115) {
  const _0x5f1d41 = String(_0x520570 || "").trim();
  if (!_0x5f1d41) {
    return _0x5698d0;
  }
  const _0x1656c0 = _0x5f1d41.split(".").filter(Boolean);
  if (_0x1656c0.length === 0) {
    return _0x5698d0;
  }
  let _0x4064a2 = _0x5698d0;
  for (let _0x4bd099 = 0; _0x4bd099 < _0x1656c0.length - 1; _0x4bd099 += 1) {
    const _0x5f52e3 = _0x1656c0[_0x4bd099];
    if (!isPlainObject(_0x4064a2[_0x5f52e3])) {
      _0x4064a2[_0x5f52e3] = {};
    }
    _0x4064a2 = _0x4064a2[_0x5f52e3];
  }
  _0x4064a2[_0x1656c0[_0x1656c0.length - 1]] = _0x383115;
  return _0x5698d0;
}
function normalizeFieldList(_0xaec856) {
  const _0x192076 = _0xaec856?.fields !== undefined ? _0xaec856.fields : _0xaec856?.field;
  const _0x466e52 = Array.isArray(_0x192076) ? _0x192076 : [_0x192076];
  return _0x466e52.map(_0x404580 => String(_0x404580 || "").trim()).filter(Boolean);
}
function resolveFirstPayloadValue(_0x59518c, _0x587c54) {
  for (const _0x2b7fc3 of _0x587c54) {
    const _0x2ed1f3 = getPathValue(_0x59518c, _0x2b7fc3);
    if (isPresentValue(_0x2ed1f3)) {
      return _0x2ed1f3;
    }
  }
  return undefined;
}
function valuesEqual(_0x836321, _0x55e347) {
  if (typeof _0x55e347 === "boolean") {
    const _0x3bfad7 = String(_0x836321 ?? "").trim().toLowerCase();
    return _0x836321 === _0x55e347 || _0x3bfad7 === String(_0x55e347);
  }
  if (typeof _0x55e347 === "number") {
    return Number(_0x836321) === _0x55e347;
  }
  return String(_0x836321 ?? "").trim() === String(_0x55e347 ?? "").trim();
}
function evaluateWhenRule(_0x2a28a6, _0x492481) {
  if (!_0x2a28a6 || typeof _0x2a28a6 !== "object") {
    return true;
  }
  const _0x5e8081 = _0x2a28a6.field ? resolveFirstPayloadValue(_0x492481.payload || {}, normalizeFieldList({
    field: _0x2a28a6.field
  })) : undefined;
  const _0x3524cd = isPresentValue(_0x5e8081);
  if (Object.prototype.hasOwnProperty.call(_0x2a28a6, "exists")) {
    if (Boolean(_0x2a28a6.exists) !== _0x3524cd) {
      return false;
    }
  }
  if (_0x2a28a6.truthy === true && !Boolean(_0x5e8081)) {
    return false;
  }
  if (_0x2a28a6.falsy === true && Boolean(_0x5e8081)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(_0x2a28a6, "equals") && !valuesEqual(_0x5e8081, _0x2a28a6.equals)) {
    return false;
  }
  if (Object.prototype.hasOwnProperty.call(_0x2a28a6, "notEquals") && valuesEqual(_0x5e8081, _0x2a28a6.notEquals)) {
    return false;
  }
  if (Array.isArray(_0x2a28a6.in) && !_0x2a28a6.in.some(_0x44f5b0 => valuesEqual(_0x5e8081, _0x44f5b0))) {
    return false;
  }
  if (Array.isArray(_0x2a28a6.notIn) && _0x2a28a6.notIn.some(_0x593e30 => valuesEqual(_0x5e8081, _0x593e30))) {
    return false;
  }
  return true;
}
function shouldApplyEntry(_0xd6de46, _0x50e968) {
  if (!_0xd6de46?.when) {
    return true;
  }
  if (Array.isArray(_0xd6de46.when)) {
    return _0xd6de46.when.every(_0x15461e => evaluateWhenRule(_0x15461e, _0x50e968));
  }
  return evaluateWhenRule(_0xd6de46.when, _0x50e968);
}
function normalizeMappingEntries(_0x3c1955) {
  if (Array.isArray(_0x3c1955)) {
    return _0x3c1955;
  }
  if (Array.isArray(_0x3c1955?.entries)) {
    return _0x3c1955.entries;
  }
  return [];
}
function resolveEntrySourceValue(_0x211b82, _0x13981c) {
  const _0x2d884f = String(_0x211b82?.from || "").trim();
  if (_0x2d884f === "prompt") {
    return _0x13981c.finalPrompt || "";
  }
  if (_0x2d884f === "param") {
    return resolveFirstPayloadValue(_0x13981c.payload || {}, normalizeFieldList(_0x211b82));
  }
  if (_0x2d884f === "inputImages") {
    return _0x13981c.inputImages || [];
  }
  if (_0x2d884f === "inputVideos") {
    return _0x13981c.inputVideos || [];
  }
  if (_0x2d884f === "inputAudios") {
    return _0x13981c.inputAudios || [];
  }
  if (_0x2d884f === "model") {
    return _0x13981c.modelToken || "";
  }
  if (_0x2d884f === "constant") {
    if (Object.prototype.hasOwnProperty.call(_0x211b82, "value")) {
      return _0x211b82.value;
    } else {
      return _0x211b82.defaultValue;
    }
  }
  return undefined;
}
function normalizeTransformList(_0x1306ef) {
  if (!_0x1306ef) {
    return [];
  }
  if (Array.isArray(_0x1306ef)) {
    return _0x1306ef;
  } else {
    return [_0x1306ef];
  }
}
async function applyTransforms(_0x205af5, _0xb4355f, _0x120fdb, _0x48be0d) {
  let _0xadbe36 = _0x205af5;
  for (const _0x3442fc of normalizeTransformList(_0xb4355f?.transform)) {
    const _0x2ed440 = typeof _0x3442fc === "string" ? {
      name: _0x3442fc
    } : isPlainObject(_0x3442fc) ? _0x3442fc : {
      name: ""
    };
    const _0x2277db = String(_0x2ed440.name || "").trim();
    if (!_0x2277db) {
      continue;
    }
    const _0x7fd1d3 = _0x48be0d?.[_0x2277db];
    if (typeof _0x7fd1d3 !== "function") {
      throw new Error("Unsupported model API bodyMapping transform: " + _0x2277db);
    }
    _0xadbe36 = await _0x7fd1d3(_0xadbe36, {
      entry: _0xb4355f,
      context: _0x120fdb,
      spec: _0x2ed440
    });
  }
  return _0xadbe36;
}
export async function buildBodyFromMapping({
  bodyMapping: _0xf78623,
  context: _0x546291,
  transforms = {}
}) {
  const _0x1ec932 = {};
  const _0x4f12d7 = normalizeMappingEntries(_0xf78623);
  const _0x65211a = {
    ..._0x546291,
    body: _0x1ec932
  };
  for (const _0x532385 of _0x4f12d7) {
    if (!_0x532385?.path || !shouldApplyEntry(_0x532385, _0x65211a)) {
      continue;
    }
    let _0x18ad53 = resolveEntrySourceValue(_0x532385, _0x65211a);
    if (!isPresentValue(_0x18ad53) && Object.prototype.hasOwnProperty.call(_0x532385, "defaultValue")) {
      _0x18ad53 = _0x532385.defaultValue;
    }
    _0x18ad53 = await applyTransforms(_0x18ad53, _0x532385, _0x65211a, transforms);
    if (_0x532385.omitWhenEmpty === true && !isPresentValue(_0x18ad53)) {
      continue;
    }
    setPathValue(_0x1ec932, _0x532385.path, _0x18ad53);
  }
  return _0x1ec932;
}
function collectValuesByPath(_0x53dc59, _0xa379e1) {
  const _0x3e0c9e = String(_0xa379e1 || "").trim().split(".").filter(Boolean);
  if (_0x3e0c9e.length === 0) {
    return [];
  }
  const _0x3a9557 = (_0x2aa199, _0x541f31) => {
    if (_0x2aa199 === undefined || _0x2aa199 === null) {
      return [];
    }
    if (_0x541f31 >= _0x3e0c9e.length) {
      if (Array.isArray(_0x2aa199)) {
        return _0x2aa199;
      } else {
        return [_0x2aa199];
      }
    }
    const _0x179771 = _0x3e0c9e[_0x541f31];
    if (_0x179771.endsWith("[]")) {
      const _0x131116 = _0x179771.slice(0, -2);
      const _0x3c3c62 = _0x131116 ? _0x2aa199?.[_0x131116] : _0x2aa199;
      if (!Array.isArray(_0x3c3c62)) {
        return [];
      }
      return _0x3c3c62.flatMap(_0x148bd4 => _0x3a9557(_0x148bd4, _0x541f31 + 1));
    }
    return _0x3a9557(_0x2aa199?.[_0x179771], _0x541f31 + 1);
  };
  return _0x3a9557(_0x53dc59, 0).flatMap(_0x21197e => Array.isArray(_0x21197e) ? _0x21197e : [_0x21197e]);
}
export function resolveMappedResponseValues(_0x6f8f51, _0x41c072 = []) {
  const _0x32082e = Array.isArray(_0x41c072) ? _0x41c072 : [_0x41c072];
  const _0x2222ac = [];
  for (const _0x4ccace of _0x32082e) {
    for (const _0x473e2b of collectValuesByPath(_0x6f8f51, _0x4ccace)) {
      if (_0x473e2b && typeof _0x473e2b === "object") {
        const _0x1469e4 = _0x473e2b.url || _0x473e2b.imageUrl || _0x473e2b.image_url || _0x473e2b.videoUrl || _0x473e2b.video_url || _0x473e2b.fileUrl;
        if (_0x1469e4) {
          _0x2222ac.push(String(_0x1469e4).trim());
        }
        continue;
      }
      const _0x50c7e5 = String(_0x473e2b ?? "").trim();
      if (_0x50c7e5) {
        _0x2222ac.push(_0x50c7e5);
      }
    }
  }
  return Array.from(new Set(_0x2222ac.filter(Boolean)));
}
function normalizeImageMimeType(_0x4a5ce5, _0x1378fd = "image/png") {
  const _0x16325d = String(_0x4a5ce5 || "").trim().toLowerCase();
  if (/^image\/[a-z0-9.+-]{1,64}$/.test(_0x16325d)) {
    return _0x16325d;
  }
  const _0x3d83c1 = String(_0x1378fd || "").trim().toLowerCase();
  if (/^image\/[a-z0-9.+-]{1,64}$/.test(_0x3d83c1)) {
    return _0x3d83c1;
  } else {
    return "image/png";
  }
}
function normalizeImageBase64DataUrl(_0x4cccc7, _0x329bf6) {
  const _0x58945b = String(_0x4cccc7 || "").trim();
  if (/^data:image\/[a-z0-9.+-]{1,64};base64,[a-z0-9+/=_-]+$/i.test(_0x58945b)) {
    return _0x58945b;
  }
  const _0x4c088b = _0x58945b.replace(/\s+/g, "");
  if (!_0x4c088b || !/^[a-z0-9+/=_-]+$/i.test(_0x4c088b)) {
    return "";
  }
  return "data:" + _0x329bf6 + ";base64," + _0x4c088b;
}
const DEFAULT_IMAGE_RESULT_PATHS = Object.freeze(["data[].url", "data[].image_url", "data[].imageUrl", "data[].file_url", "data[].fileUrl", "data.results[].url", "data.results[].image_url", "data.results[].imageUrl", "data.result.images[].url", "data.result.images[].image_url", "data.result.images[].imageUrl", "results[].url", "results[].image_url", "results[].imageUrl", "results[].file_url", "results[].fileUrl", "result.images[].url", "result.images[].image_url", "result.images[].imageUrl", "images[].url", "images[].image_url", "images[].imageUrl", "image_url", "imageUrl", "file_url", "fileUrl", "url"]);
const DEFAULT_IMAGE_BASE64_PATHS = Object.freeze(["data[].b64_json", "data[].b64Json", "data[].base64", "data[].base64_data", "data[].base64Data", "data[].image_base64", "data[].imageBase64", "data.results[].b64_json", "data.results[].b64Json", "data.results[].base64", "data.results[].base64_data", "data.results[].base64Data", "data.results[].image_base64", "data.results[].imageBase64", "data.result.images[].b64_json", "data.result.images[].b64Json", "data.result.images[].base64", "data.result.images[].base64_data", "data.result.images[].base64Data", "data.result.images[].image_base64", "data.result.images[].imageBase64", "results[].b64_json", "results[].b64Json", "results[].base64", "results[].base64_data", "results[].base64Data", "results[].image_base64", "results[].imageBase64", "result.images[].b64_json", "result.images[].b64Json", "result.images[].base64", "result.images[].base64_data", "result.images[].base64Data", "result.images[].image_base64", "result.images[].imageBase64", "images[].b64_json", "images[].b64Json", "images[].base64", "images[].base64_data", "images[].base64Data", "images[].image_base64", "images[].imageBase64", "outputs[].b64_json", "outputs[].b64Json", "outputs[].base64", "outputs[].base64Data", "output.images[].b64_json", "output.images[].b64Json", "output.images[].base64", "b64_json", "b64Json", "base64", "base64_data", "base64Data", "image_base64", "imageBase64"]);
const DEFAULT_IMAGE_BASE64_MIME_TYPE_PATHS = Object.freeze(["data[].mime_type", "data[].mimeType", "data[].content_type", "data[].contentType", "data.results[].mime_type", "data.results[].mimeType", "data.result.images[].mime_type", "data.result.images[].mimeType", "results[].mime_type", "results[].mimeType", "results[].content_type", "results[].contentType", "result.images[].mime_type", "result.images[].mimeType", "images[].mime_type", "images[].mimeType", "mime_type", "mimeType", "content_type", "contentType"]);
export function resolveMappedImageResponseValues(_0x4f1640, _0x1b85c6 = {}) {
  const _0x5a33e4 = Array.isArray(_0x1b85c6?.resultPaths) ? _0x1b85c6.resultPaths : Array.isArray(_0x1b85c6?.paths) ? _0x1b85c6.paths : [];
  const _0x4cef44 = resolveMappedResponseValues(_0x4f1640, Array.from(new Set([..._0x5a33e4, ...DEFAULT_IMAGE_RESULT_PATHS])));
  const _0x19bc0a = Array.from(new Set([...DEFAULT_IMAGE_BASE64_PATHS, ...(Array.isArray(_0x1b85c6?.base64Paths) ? _0x1b85c6.base64Paths : [])]));
  const _0x87cb49 = Array.from(new Set([...DEFAULT_IMAGE_BASE64_MIME_TYPE_PATHS, ...(Array.isArray(_0x1b85c6?.base64MimeTypePaths) ? _0x1b85c6.base64MimeTypePaths : [])]));
  const _0x1a054f = _0x87cb49.flatMap(_0x5d576b => collectValuesByPath(_0x4f1640, _0x5d576b));
  const _0x2108db = normalizeImageMimeType(_0x1b85c6?.base64DefaultMimeType);
  const _0xc7eb31 = _0x19bc0a.flatMap(_0x2e7956 => collectValuesByPath(_0x4f1640, _0x2e7956));
  const _0x200161 = _0xc7eb31.map((_0x2652a5, _0x231a1c) => normalizeImageBase64DataUrl(_0x2652a5, normalizeImageMimeType(_0x1a054f[_0x231a1c], _0x2108db))).filter(Boolean);
  // Base64 is self-contained and avoids expiring URLs/CORS failures. When a
  // provider returns both forms, use the inline image and only fall back to
  // the URL when no valid Base64 payload was found.
  return _0x200161.length > 0 ? Array.from(new Set(_0x200161)) : Array.from(new Set(_0x4cef44));
}
export function resolveMappedResponseValue(_0x1af5d7, _0xf4de04 = []) {
  return resolveMappedResponseValues(_0x1af5d7, _0xf4de04)[0] || "";
}
