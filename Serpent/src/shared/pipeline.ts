/**
 * 成片流水线 glue(view 无关的纯函数)。
 *
 * 打通:剧本工作室(分镜) → 替换工作室(人物替换/声音克隆 合成视频) →
 * 语音工作室(整段音轨合成) → 成片导出(视频 × 音频 mux)。
 *
 * 本模块只定义「成片 mux」的 ffmpeg 命令规格与输出命名,并给出整链的可跑酸检
 * (见 Serpent/scripts/pipeline-smoke.mjs)。不依赖 DOM / IPC。
 */

export type MuxOptions = {
  videoPath: string;
  audioPath: string;
  outputPath: string;
  /** 视频流编码;copy = 直接复用源视频流(默认)。 */
  videoCodec?: string;
  /** 音轨比特率(重编码为 aac)。 */
  audioBitrate?: string;
  /**
   * 音轨对齐视频:apad 补齐 + 用 -t 限制到视频时长(默认 true)。
   * 注意:此模式下必须提供 cameraDurationSec,否则 ffmpeg 会因 apad 无限流挂起。
   * 关闭则音轨保持原长(若长于视频会超出)。
   */
  syncToVideo?: boolean;
  /** 输入视频时长(秒),供 syncToVideo 用 -t 截断。 */
  videoDurationSec?: number;
};

/** 生成 ffmpeg 成片 mux 命令参数(供渲染层预览/酸检,主进程另有同规格实现)。 */
export function buildMuxArgs(options: MuxOptions): string[] {
  if (!options.videoPath || !options.audioPath || !options.outputPath) {
    throw new Error("成片需要 videoPath/audioPath/outputPath 三个路径");
  }
  const videoCodec = options.videoCodec || "copy";
  const audioBitrate = options.audioBitrate || "192k";
  const args = ["-y", "-i", options.videoPath, "-i", options.audioPath];
  if (options.syncToVideo !== false) {
    if (!Number.isFinite(options.videoDurationSec) || (options.videoDurationSec ?? 0) <= 0) {
      throw new Error("syncToVideo 模式需要提供视频时长 videoDurationSec");
    }
    // 音轨补齐对齐视频,再用 -t 限到视频时长(避免 apad+shortest 挂起)。
    args.push("-filter_complex", "[1:a]apad[aout]");
    args.push("-map", "0:v:0");
    args.push("-map", "[aout]");
    args.push("-t", String(options.videoDurationSec));
  } else {
    args.push("-map", "0:v:0", "-map", "1:a:0");
  }
  args.push("-c:v", videoCodec);
  args.push("-c:a", "aac", "-b:a", audioBitrate);
  args.push("-movflags", "+faststart");
  args.push(options.outputPath);
  return args;
}

/** 成片输出文件名(带时间戳,避免覆盖)。 */
export function recommendOutputName(prefix = "成片"): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `${prefix}-${stamp}.mp4`;
}

/** 校验成片输入是否有缺陷(返回可读提示,无缺陷返回 null)。 */
export function muxInputIssue(input: {
  videoPath: string;
  audioPath: string;
}): string | null {
  if (!input.videoPath || !input.audioPath) {
    return "缺少成片所需的视频或音频路径";
  }
  if (input.videoPath === input.audioPath) {
    return "视频与音频不能是同一个文件";
  }
  return null;
}
