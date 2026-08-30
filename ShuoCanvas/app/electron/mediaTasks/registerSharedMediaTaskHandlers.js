import { createAudioComposeMediaTaskHandler } from "./audioComposeTask.js";
import { createAsrRuntimeInstallMediaTaskHandler } from "./asrRuntimeInstallTask.js";
import { createAudioVoiceComposeMediaTaskHandler } from "./audioVoiceComposeTask.js";
import { createAudioVoiceModelPrepareMediaTaskHandler, createAudioVoiceAnalyzeMediaTaskHandler, createFunasrGpuTorchInstallMediaTaskHandler, createFunasrModelPrepareMediaTaskHandler, createFunasrRuntimeCheckMediaTaskHandler } from "./audioVoiceAnalyzeTask.js";
import { createMediaClipExportTaskHandler } from "./mediaClipExportTask.js";
import { createVideoReverseMediaTaskHandler } from "./videoReverseTask.js";
export function registerSharedMediaTaskHandlers(_0x6b0cad, _0x43fc8e = {}) {
  if (!_0x6b0cad || typeof _0x6b0cad.setHandler !== "function") {
    return;
  }
  _0x6b0cad.setHandler("asrRuntimeInstall", createAsrRuntimeInstallMediaTaskHandler({
    appRoot: _0x43fc8e.appRoot,
    getAsrRuntimeManifestUrl: _0x43fc8e.getAsrRuntimeManifestUrl,
    getUserDataRoot: _0x43fc8e.getUserDataRoot,
    resolveFallbackPythonCommand: _0x43fc8e.resolveFallbackPythonCommand
  }));
  _0x6b0cad.setHandler("audioCompose", createAudioComposeMediaTaskHandler({
    createOutputFilename: _0x43fc8e.createOutputFilename,
    ffprobeHasAudio: _0x43fc8e.ffprobeHasAudio,
    getOutputDir: _0x43fc8e.getOutputDir,
    getRuntimeToolOrFallback: _0x43fc8e.getRuntimeToolOrFallback,
    resolveMediaTaskSource: _0x43fc8e.resolveMediaTaskSource,
    toOutputLocalPath: _0x43fc8e.toOutputLocalPath
  }));
  _0x6b0cad.setHandler("audioVoiceCompose", createAudioVoiceComposeMediaTaskHandler({
    createOutputFilename: _0x43fc8e.createOutputFilename,
    ffprobeVideoMeta: _0x43fc8e.ffprobeVideoMeta,
    getOutputDir: _0x43fc8e.getOutputDir,
    getRuntimeToolOrFallback: _0x43fc8e.getRuntimeToolOrFallback,
    runFfmpegTask: _0x43fc8e.runFfmpegTask,
    resolveMediaTaskSource: _0x43fc8e.resolveMediaTaskSource,
    toOutputLocalPath: _0x43fc8e.toOutputLocalPath
  }));
  _0x6b0cad.setHandler("audioVoiceAnalyze", createAudioVoiceAnalyzeMediaTaskHandler({
    createOutputFilename: _0x43fc8e.createOutputFilename,
    ffprobeHasAudio: _0x43fc8e.ffprobeHasAudio,
    ffprobeVideoMeta: _0x43fc8e.ffprobeVideoMeta,
    getDoubaoAsrConfig: _0x43fc8e.getDoubaoAsrConfig,
    getFunasrModelRootDir: _0x43fc8e.getFunasrModelRootDir,
    getPythonCertificateEnv: _0x43fc8e.getPythonCertificateEnv,
    getSortformerModelRootDir: _0x43fc8e.getSortformerModelRootDir,
    getOutputDir: _0x43fc8e.getOutputDir,
    getRuntimeToolOrFallback: _0x43fc8e.getRuntimeToolOrFallback,
    resolveMediaTaskSource: _0x43fc8e.resolveMediaTaskSource,
    resolvePythonCommand: _0x43fc8e.resolvePythonCommand,
    appRoot: _0x43fc8e.appRoot,
    toOutputLocalPath: _0x43fc8e.toOutputLocalPath
  }));
  _0x6b0cad.setHandler("audioVoiceModelPrepare", createAudioVoiceModelPrepareMediaTaskHandler({
    getFunasrModelRootDir: _0x43fc8e.getFunasrModelRootDir,
    getPythonCertificateEnv: _0x43fc8e.getPythonCertificateEnv,
    getSortformerModelRootDir: _0x43fc8e.getSortformerModelRootDir,
    resolvePythonCommand: _0x43fc8e.resolvePythonCommand,
    appRoot: _0x43fc8e.appRoot
  }));
  _0x6b0cad.setHandler("funasrModelPrepare", createFunasrModelPrepareMediaTaskHandler({
    getFunasrModelRootDir: _0x43fc8e.getFunasrModelRootDir,
    getPythonCertificateEnv: _0x43fc8e.getPythonCertificateEnv,
    resolvePythonCommand: _0x43fc8e.resolvePythonCommand,
    appRoot: _0x43fc8e.appRoot
  }));
  _0x6b0cad.setHandler("funasrRuntimeCheck", createFunasrRuntimeCheckMediaTaskHandler({
    getFunasrModelRootDir: _0x43fc8e.getFunasrModelRootDir,
    getPythonCertificateEnv: _0x43fc8e.getPythonCertificateEnv,
    resolvePythonCommand: _0x43fc8e.resolvePythonCommand,
    appRoot: _0x43fc8e.appRoot
  }));
  _0x6b0cad.setHandler("funasrGpuTorchInstall", createFunasrGpuTorchInstallMediaTaskHandler({
    getFunasrModelRootDir: _0x43fc8e.getFunasrModelRootDir,
    getPythonCertificateEnv: _0x43fc8e.getPythonCertificateEnv,
    resolvePythonCommand: _0x43fc8e.resolvePythonCommand,
    appRoot: _0x43fc8e.appRoot
  }));
  _0x6b0cad.setHandler("mediaClipExport", createMediaClipExportTaskHandler({
    createOutputFilename: _0x43fc8e.createOutputFilename,
    ffprobeHasAudio: _0x43fc8e.ffprobeHasAudio,
    ffprobeVideoMeta: _0x43fc8e.ffprobeVideoMeta,
    getOutputDir: _0x43fc8e.getOutputDir,
    getRuntimeToolOrFallback: _0x43fc8e.getRuntimeToolOrFallback,
    runFfmpegTask: _0x43fc8e.runFfmpegTask,
    resolveMediaTaskSource: _0x43fc8e.resolveMediaTaskSource,
    toOutputLocalPath: _0x43fc8e.toOutputLocalPath
  }));
  _0x6b0cad.setHandler("videoReverse", createVideoReverseMediaTaskHandler({
    createOutputFilename: _0x43fc8e.createOutputFilename,
    ffprobeHasAudio: _0x43fc8e.ffprobeHasAudio,
    ffprobeVideoMeta: _0x43fc8e.ffprobeVideoMeta,
    getOutputDir: _0x43fc8e.getOutputDir,
    getRuntimeToolOrFallback: _0x43fc8e.getRuntimeToolOrFallback,
    runFfmpegTask: _0x43fc8e.runFfmpegTask,
    resolveMediaTaskSource: _0x43fc8e.resolveMediaTaskSource,
    toOutputLocalPath: _0x43fc8e.toOutputLocalPath
  }));
}