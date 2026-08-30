# MediaPipe Tasks Vision

- Package: `@mediapipe/tasks-vision`
- Version: `0.10.35`
- Source: https://www.npmjs.com/package/@mediapipe/tasks-vision/v/0.10.35
- Upstream: https://github.com/google-ai-edge/mediapipe
- License: Apache-2.0 (see `LICENSE`)

Vendored files:

- `vision_bundle.mjs`
- `wasm/vision_wasm_module_internal.js`
- `wasm/vision_wasm_module_internal.wasm`

These files are copied unchanged from the published npm package so the pose
runtime works offline in both the Chrome app shell and packaged Electron app.
The runtime explicitly selects the module WASM build to avoid packaging unused
classic and no-SIMD variants.
