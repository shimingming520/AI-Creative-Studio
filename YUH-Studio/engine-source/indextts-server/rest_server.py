# coding=utf-8
"""
IndexTTS 2.5 REST API 服务（韵绘 YUNHUI 内置集成用）
启动后监听 127.0.0.1:7862，提供 REST 接口：
  GET  /health                健康检查 + 模型可用性
  POST /clone                 语音克隆合成（上传参考音频 + 文本 → 输出 wav）
启动方式：python rest_server.py --model-dir <IndexTTS模型目录> [--port 7862]
模型目录约定：含 config.yaml + codec.pth + gpt.pth + s2mel.pth 等 2.5 模型文件
"""
import os
import sys
import tempfile
import argparse
import traceback
import importlib.util
import shutil
from typing import Optional

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# 添加 indextts 源码路径（注意：源码 clone 到 engine/indextts/，内部包名也是 indextts）
# 所以 import indextts.infer_v2_5 需要把 engine/indextts/ 加到 sys.path
INDEX_TTS_ROOT = os.environ.get(
    'YUNHUI_INDEXTTS_SOURCE_DIR',
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'indextts'),
)
if os.path.isdir(INDEX_TTS_ROOT) and INDEX_TTS_ROOT not in sys.path:
    sys.path.insert(0, os.path.abspath(INDEX_TTS_ROOT))


def _ensure_ascii_wetext_path():
    """Windows 下 kaldifst 无法打开含中文目录的 FST，复制纯 Python 包到英文缓存路径。"""
    spec = importlib.util.find_spec('wetext')
    if not spec or not spec.submodule_search_locations:
        return
    source = os.path.abspath(next(iter(spec.submodule_search_locations)))
    try:
        source.encode('ascii')
        return
    except UnicodeEncodeError:
        pass
    cache_root = os.environ.get(
        'YUNHUI_INDEXTTS_CACHE_DIR',
        os.path.join(tempfile.gettempdir(), 'YUH-Studio-IndexTTS'),
    )
    target = os.path.join(cache_root, 'wetext')
    source_marker = os.path.join(source, '__init__.py')
    target_marker = os.path.join(target, '__init__.py')
    if not os.path.isfile(target_marker) or os.path.getmtime(target_marker) < os.path.getmtime(source_marker):
        os.makedirs(cache_root, exist_ok=True)
        shutil.copytree(source, target, dirs_exist_ok=True)
    if cache_root not in sys.path:
        sys.path.insert(0, cache_root)


_ensure_ascii_wetext_path()

# === 兼容性补丁：transformers 4.57+ 移除了 QuantizedCacheConfig，但 IndexTTS 2.5 引用了它 ===
# 如果当前 transformers 版本没有这个类，注入一个空 stub 避免导入失败
try:
    from transformers.cache_utils import QuantizedCacheConfig  # type: ignore
except ImportError:
    try:
        import transformers.cache_utils as _cu
        if not hasattr(_cu, 'QuantizedCacheConfig'):
            # 用 QuantizedCache 的 config 类（同模块下）或退化为 dataclass 占位
            class QuantizedCacheConfig:  # type: ignore
                """Stub for transformers>=4.57 where QuantizedCacheConfig was removed.
                IndexTTS only uses it in the quantized cache codepath, which we don't hit."""
                def __init__(self, *args, **kwargs):
                    self.backend = getattr(kwargs, 'backend', 'quanto')
            _cu.QuantizedCacheConfig = QuantizedCacheConfig  # type: ignore
    except Exception:
        pass

app = Flask(__name__)
CORS(app)

# 全局模型目录
_MODELS_DIR = os.environ.get('YUNHUI_INDEXTTS_MODELS_DIR', '')

# 全局 TTS 引擎（懒加载）
_tts_engine = None
_tts_loading = False
_tts_error = ''


def _resolve_models_dir() -> str:
    """优先用环境变量/命令行参数指定的目录，否则在常见位置自动发现"""
    if _MODELS_DIR and os.path.isfile(os.path.join(_MODELS_DIR, 'config.yaml')):
        return _MODELS_DIR
    # 自动扫描：F:/tts/IndexTTS-2.5, G:/checkpoints 等
    candidates = [
        os.environ.get('YUNHUI_INDEXTTS_MODELS_DIR', ''),
        'F:/tts/IndexTTS-2.5',
        'G:/checkpoints',
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'checkpoints'),
    ]
    for d in candidates:
        if d and os.path.isdir(d) and os.path.isfile(os.path.join(d, 'config.yaml')) \
                and os.path.isfile(os.path.join(d, 'gpt.pth')):
            return d
    return ''


def get_engine():
    """懒加载 IndexTTS2 引擎（首次调用时加载，加载较慢约 30-60 秒）"""
    global _tts_engine, _tts_loading, _tts_error
    if _tts_engine is not None:
        return _tts_engine
    if _tts_loading:
        return None
    _tts_loading = True
    _tts_error = ''
    try:
        import torch
        import torchaudio
        import soundfile as sf

        # torchaudio 2.9+ 把 save 委托给可选的 TorchCodec；IndexTTS 本身未声明该依赖。
        # WAV 输出直接交给 soundfile，规避额外的 CUDA/FFmpeg 二进制兼容风险。
        def _save_wav(path, tensor, sample_rate, *args, **kwargs):
            audio = tensor.detach().cpu()
            if audio.ndim == 2:
                audio = audio.transpose(0, 1)
            data = audio.numpy()
            subtype = 'PCM_16' if str(data.dtype) == 'int16' else None
            sf.write(path, data, sample_rate, subtype=subtype)

        torchaudio.save = _save_wav
        from indextts.infer_v2_5 import IndexTTS2
        model_dir = _resolve_models_dir()
        if not model_dir:
            raise RuntimeError('未找到 IndexTTS 2.5 模型目录（需含 config.yaml + gpt.pth）')
        cfg_path = os.path.join(model_dir, 'config.yaml')
        device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
        use_bf16 = device.startswith('cuda')
        print(f'[IndexTTS] 加载模型: {model_dir}')
        print(f'[IndexTTS] device={device}, use_bf16={use_bf16}')
        _tts_engine = IndexTTS2(
            cfg_path=cfg_path,
            model_dir=model_dir,
            use_bf16=use_bf16,
            device=device,
        )
        print(f'[IndexTTS] 模型加载成功')
    except Exception as e:
        _tts_error = f'{type(e).__name__}: {e}'
        print(f'[IndexTTS] 模型加载失败: {_tts_error}')
        traceback.print_exc()
    finally:
        _tts_loading = False
    return _tts_engine


@app.route('/health', methods=['GET'])
def health():
    model_dir = _resolve_models_dir()
    return jsonify({
        'service': 'yunhui-indextts-2.5',
        'status': 'ok',
        'engine_loaded': _tts_engine is not None,
        'engine_loading': _tts_loading,
        'engine_error': _tts_error,
        'models_dir': model_dir,
        'models_available': bool(model_dir),
    })


@app.route('/unload', methods=['POST'])
def unload():
    """卸载模型并释放显存"""
    global _tts_engine
    try:
        import gc
        import torch
        if _tts_engine is not None:
            # 把子模型尽量移到 CPU
            try:
                for attr in dir(_tts_engine):
                    val = getattr(_tts_engine, attr, None)
                    if hasattr(val, 'cpu') and callable(val.cpu):
                        try: val.cpu()
                        except: pass
            except: pass
            _tts_engine = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.synchronize() if hasattr(torch.cuda, 'synchronize') else None
            gc.collect()
            torch.cuda.empty_cache()
        print('[IndexTTS] 已卸载模型，显存已释放')
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'ok': False, 'error': f'{type(e).__name__}: {e}'}), 500


@app.route('/clone', methods=['POST'])
def clone():
    """语音克隆合成
    Body JSON:
      text:        必填，要合成的文本
      ref_audio:   必填，参考音频文件路径（本地路径）
      lang:        可选，语言（zh/en/ja/yue/zhja），默认 zh
      output_dir:  可选，输出目录，默认用系统 temp
      emo_audio:   可选，情感参考音频路径
      emo_alpha:   可选，情感强度（0-2），默认 1.0
    返回：wav 文件
    """
    data = request.json or {}
    text = (data.get('text') or '').strip()
    ref_audio = (data.get('ref_audio') or '').strip()
    lang = (data.get('lang') or 'zh').strip()
    output_dir = (data.get('output_dir') or '').strip()
    emo_audio = (data.get('emo_audio') or '').strip() or None
    emo_alpha = max(0.0, min(1.0, float(data.get('emo_alpha') or 0.8)))
    duration_factor = max(0.5, min(2.0, float(data.get('duration_factor') or 1.0)))
    if not text:
        return jsonify({'error': 'text 不能为空'}), 400
    if not ref_audio or not os.path.isfile(ref_audio):
        return jsonify({'error': f'参考音频文件不存在: {ref_audio}'}), 400
    try:
        engine = get_engine()
        if engine is None:
            return jsonify({'error': f'IndexTTS 引擎未就绪: {_tts_error or "正在加载中，请稍后再试"}'}), 503
        # 输出路径
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            output_path = os.path.join(output_dir, f'indextts-{os.getpid()}-{int(__import__("time").time()*1000)}.wav')
        else:
            tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False, dir=tempfile.gettempdir())
            tmp.close()
            output_path = tmp.name
        print(f'[IndexTTS] 合成: text="{text[:30]}...", ref={ref_audio}, lang={lang}')
        engine.infer(
            spk_audio_prompt=ref_audio,
            text=text,
            output_path=output_path,
            lang=lang,
            emo_audio_prompt=emo_audio,
            emo_alpha=emo_alpha,
            duration_factor=duration_factor,
            verbose=False,
        )
        if not os.path.isfile(output_path):
            return jsonify({'error': '合成完成但未找到输出文件'}), 500
        response = send_file(output_path, mimetype='audio/wav', as_attachment=True, download_name='indextts-clone.wav')
        response.headers['X-Output-Path'] = output_path
        return response
    except Exception as e:
        print(f'[IndexTTS] 合成失败: {e}')
        traceback.print_exc()
        return jsonify({'error': f'{type(e).__name__}: {e}'}), 500


def main():
    global _MODELS_DIR
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=7862)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--model-dir', default='', help='IndexTTS 2.5 模型目录')
    args = parser.parse_args()
    if args.model_dir:
        _MODELS_DIR = os.path.abspath(args.model_dir)
    print(f'[IndexTTS] REST API server starting on {args.host}:{args.port}')
    print(f'[IndexTTS] model_dir hint: {_MODELS_DIR or "(自动检测)"}')
    model_dir = _resolve_models_dir()
    print(f'[IndexTTS] resolved model dir: {model_dir or "(未找到，请在请求时指定)"}')
    app.run(host=args.host, port=args.port, debug=False, threaded=False)


if __name__ == '__main__':
    main()
