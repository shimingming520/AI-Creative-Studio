# coding=utf-8
"""
Qwen3-TTS REST API 服务（韵绘 YUNHUI 内置集成用）
启动后监听 127.0.0.1:7861，提供 REST 接口：
  GET  /health                  健康检查 + 模型可用性
  GET  /models                  列出已发现 TTS 模型
  POST /custom_voice            预置音色合成（含情感控制）
  POST /voice_design            自然语言设计音色合成
  POST /voice_clone             克隆参考音频合成
启动方式：python rest_server.py --models-dir <音频模型目录> [--port 7861]
模型目录约定：扫描子文件夹，自动识别 CustomVoice / VoiceDesign / Base 三类模型。
"""
import os
import sys
import json
import tempfile
import argparse
import glob
import traceback
from pathlib import Path
from typing import Dict, Any, Optional, List

import numpy as np
import torch
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# 添加 Qwen3-TTS 路径（内置源码）
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Qwen3-TTS-main'))
from qwen_tts import Qwen3TTSModel, VoiceClonePromptItem

app = Flask(__name__)
CORS(app)

# 全局模型目录（由命令行参数或环境变量注入）
_MODELS_DIR = os.environ.get('YUNHUI_TTS_MODELS_DIR', '')


def _discover_tts_models(base_dir: str) -> Dict[str, Optional[str]]:
    """在 base_dir 下自动发现 TTS 模型，返回 {model_key: path_or_None}。
    识别规则：子文件夹含 config.json + model.safetensors，且名称匹配关键词。
    同时递归扫描一层子目录，兼容 audio/Qwen3-TTS-XXX 这种结构。
    """
    result: Dict[str, Optional[str]] = {'custom_voice': None, 'voice_design': None, 'voice_clone': None}
    if not base_dir or not os.path.isdir(base_dir):
        return result

    def _config_text(full_path: str) -> str:
        """读取 config.json 原文做关键词识别：模型文件夹改名后（如改为中文或
        简短名），目录名不再含 voicedesign 等关键词，但 config.json 里的
        _name_or_path / architectures 通常仍保留官方模型名。"""
        try:
            with open(os.path.join(full_path, 'config.json'), 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().lower()
        except OSError:
            return ''

    def _try_match(entry_name: str, full_path: str) -> Optional[str]:
        """检查目录是否是 TTS 模型，返回匹配的 key 或 None。
        识别优先级：目录名关键词 > config.json 内容关键词（改名后仍可识别）。"""
        if not os.path.isdir(full_path):
            return None
        # 必须同时有 config.json 和 model.safetensors
        if not (os.path.isfile(os.path.join(full_path, 'config.json'))
                and os.path.isfile(os.path.join(full_path, 'model.safetensors'))):
            return None
        name_lower = entry_name.lower()
        signature = name_lower + ' ' + _config_text(full_path)
        if 'customvoice' in signature or 'custom_voice' in signature:
            return 'custom_voice'
        if 'voicedesign' in signature or 'voice_design' in signature or 'voice-design' in signature:
            return 'voice_design'
        # base 主模型按目录名判断（所有 TTS config 都含 qwen3/tts 字样，内容匹配会误报）
        if 'base' in name_lower and ('qwen3' in name_lower or 'tts' in name_lower):
            return 'voice_clone'
        return None

    # 第一层 + 第二层（递归一层）扫描
    for entry in os.listdir(base_dir):
        full = os.path.join(base_dir, entry)
        key = _try_match(entry, full)
        if key and not result[key]:
            result[key] = full
        elif os.path.isdir(full):
            # 进入第二层
            try:
                for sub in os.listdir(full):
                    sub_full = os.path.join(full, sub)
                    key2 = _try_match(sub, sub_full)
                    if key2 and not result[key2]:
                        result[key2] = sub_full
            except OSError:
                pass
    return result


# 模型管理
class TTSModelManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.models: Dict[str, Optional[Qwen3TTSModel]] = {
                'custom_voice': None,
                'voice_design': None,
                'voice_clone': None,
            }
            cls._instance._scan_done = False
            cls._instance.device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
            cls._instance.dtype = torch.bfloat16
        return cls._instance

    def model_paths(self) -> Dict[str, Optional[str]]:
        return _discover_tts_models(_MODELS_DIR)

    def ensure_scanned(self):
        if not self._scan_done:
            self._scan_done = True

    def load_model(self, model_key: str) -> Optional[Qwen3TTSModel]:
        if self.models.get(model_key):
            return self.models[model_key]
        paths = self.model_paths()
        path = paths.get(model_key)
        if not path or not os.path.isdir(path):
            print(f'[TTS] load_model({model_key}): 模型路径不存在 path={path}')
            return None
        try:
            print(f'[TTS] load_model({model_key}): 开始加载 {path}')
            # Qwen3TTSModel 使用 from_pretrained 加载（HF 风格）
            # 通过 kwargs 传递 device_map 和 dtype
            model = Qwen3TTSModel.from_pretrained(
                path,
                device_map=self.device,
                dtype=self.dtype,
            )
            self.models[model_key] = model
            print(f'[TTS] load_model({model_key}): 加载成功')
            return model
        except Exception as e:
            print(f'[TTS] load_model({model_key}) 失败: {e}')
            traceback.print_exc()
            return None

    def get_or_load(self, model_key: str) -> Optional[Qwen3TTSModel]:
        return self.load_model(model_key)


def _wav_to_file(wav: np.ndarray, sr: int) -> str:
    """把 wav 数组保存为临时 wav 文件，返回路径"""
    import soundfile as sf
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False, dir=tempfile.gettempdir())
    tmp.close()
    sf.write(tmp.name, wav, sr)
    return tmp.name


# 语言代码映射：前端/外部使用短码（zh/en/ja...），Qwen3-TTS 需要全名
_LANG_MAP = {
    'zh': 'chinese', 'cn': 'chinese', 'chinese': 'chinese',
    'en': 'english', 'english': 'english',
    'ja': 'japanese', 'japanese': 'japanese',
    'ko': 'korean', 'korean': 'korean',
    'fr': 'french', 'french': 'french',
    'de': 'german', 'german': 'german',
    'it': 'italian', 'italian': 'italian',
    'pt': 'portuguese', 'portuguese': 'portuguese',
    'ru': 'russian', 'russian': 'russian',
    'es': 'spanish', 'spanish': 'spanish',
    'auto': 'auto',
}


def _normalize_lang(lang: str) -> str:
    """短语言代码 -> Qwen3-TTS 要求的全名"""
    if not lang:
        return 'chinese'
    return _LANG_MAP.get(lang.lower(), lang.lower())


def _err(msg: str, exc: Optional[Exception] = None):
    """统一错误响应，附带完整 traceback 便于排查"""
    if exc is not None:
        print(f'[TTS][ERROR] {msg}: {type(exc).__name__}: {exc}')
        traceback.print_exc()
        return jsonify({'error': f'{msg}: {type(exc).__name__}: {exc}'}), 500
    return jsonify({'error': msg}), 500


@app.route('/health', methods=['GET'])
def health():
    mgr = TTSModelManager()
    paths = mgr.model_paths()
    return jsonify({
        'status': 'ok',
        'device': mgr.device,
        'models_dir': _MODELS_DIR,
        'models': {k: bool(v) for k, v in mgr.models.items()},
        'available': {k: bool(p) for k, p in paths.items()}
    })


@app.route('/models', methods=['GET'])
def list_models():
    mgr = TTSModelManager()
    paths = mgr.model_paths()
    return jsonify({
        'dir': _MODELS_DIR,
        'models': {k: {'path': p, 'loaded': bool(mgr.models.get(k)), 'available': bool(p)} for k, p in paths.items()}
    })


@app.route('/custom_voice', methods=['POST'])
def custom_voice():
    """预置音色合成"""
    data = request.json or {}
    text = data.get('text', '').strip()
    lang = _normalize_lang(data.get('lang', 'zh'))
    speaker = data.get('speaker', 'Cherry')
    instruct = data.get('instruct', '').strip() or None
    if not text:
        return jsonify({'error': 'text 不能为空'}), 400
    try:
        model = TTSModelManager().get_or_load('custom_voice')
        if not model:
            return jsonify({'error': 'CustomVoice 模型加载失败，请检查模型目录'}), 500
        # 新版 API: generate_custom_voice(text, speaker, language=, instruct=)
        wavs, sr = model.generate_custom_voice(
            text=text,
            speaker=speaker,
            language=lang,
            instruct=instruct,
        )
        path = _wav_to_file(wavs[0], sr)
        return send_file(path, mimetype='audio/wav', as_attachment=True, download_name='tts.wav')
    except Exception as e:
        return _err('CustomVoice 合成失败', e)


@app.route('/voice_design', methods=['POST'])
def voice_design():
    """自然语言设计音色合成"""
    data = request.json or {}
    text = data.get('text', '').strip()
    lang = _normalize_lang(data.get('lang', 'zh'))
    design = data.get('design', '').strip()
    if not text:
        return jsonify({'error': 'text 不能为空'}), 400
    if not design:
        return jsonify({'error': 'design（音色描述）不能为空'}), 400
    try:
        model = TTSModelManager().get_or_load('voice_design')
        if not model:
            return jsonify({'error': 'VoiceDesign 模型加载失败'}), 500
        # 新版 API: generate_voice_design(text, instruct, language=)
        wavs, sr = model.generate_voice_design(
            text=text,
            instruct=design,
            language=lang,
        )
        path = _wav_to_file(wavs[0], sr)
        return send_file(path, mimetype='audio/wav', as_attachment=True, download_name='tts_design.wav')
    except Exception as e:
        return _err('VoiceDesign 合成失败', e)


@app.route('/voice_clone', methods=['POST'])
def voice_clone():
    """克隆参考音频合成（需要上传参考音频文件 + 参考文本）
    新版 Qwen3-TTS API：直接传 ref_audio/ref_text 给 generate_voice_clone，
    模型内部自动调用 create_voice_clone_prompt 提取特征。
    """
    data = request.json or {}
    text = data.get('text', '').strip()
    lang = _normalize_lang(data.get('lang', 'zh'))
    ref_audio_path = data.get('ref_audio_path', '')
    ref_text = data.get('ref_text', '').strip()
    use_xvec = data.get('use_xvec', True)
    if not text:
        return jsonify({'error': 'text 不能为空'}), 400
    if not ref_audio_path or not os.path.isfile(ref_audio_path):
        return jsonify({'error': '参考音频文件不存在'}), 400
    if not ref_text:
        return jsonify({'error': '参考音频对应的文本不能为空'}), 400
    try:
        model = TTSModelManager().get_or_load('voice_clone')
        if not model:
            return jsonify({'error': 'VoiceClone 模型加载失败'}), 500
        # 新版 API: generate_voice_clone(text, language=, ref_audio=, ref_text=, x_vector_only_mode=)
        wavs, sr = model.generate_voice_clone(
            text=text,
            language=lang,
            ref_audio=ref_audio_path,
            ref_text=ref_text,
            x_vector_only_mode=use_xvec,
        )
        path = _wav_to_file(wavs[0], sr)
        return send_file(path, mimetype='audio/wav', as_attachment=True, download_name='tts_clone.wav')
    except Exception as e:
        return _err('VoiceClone 合成失败', e)


@app.route('/models/load', methods=['POST'])
def load_models():
    """预热模型（可选）"""
    data = request.json or {}
    keys = data.get('keys', ['custom_voice'])
    mgr = TTSModelManager()
    results = {}
    for k in keys:
        results[k] = bool(mgr.load_model(k))
    return jsonify({'loaded': results})


@app.route('/unload', methods=['POST'])
def unload_models():
    """卸载所有已加载的 TTS 模型并释放显存。
    用于在切换到视频/图片生成前腾出 GPU 内存，避免 TTS 模型常驻显存影响其他任务。
    流程：
      1. 把模型对象引用置 None（让 Python GC 回收）
      2. 调 torch.cuda.empty_cache() 强制释放 CUDA 缓存
      3. 调 gc.collect() 触发 Python 层垃圾回收
    """
    try:
        import gc
        mgr = TTSModelManager()
        freed_keys = []
        for k in list(mgr.models.keys()):
            if mgr.models.get(k):
                m = mgr.models[k]
                # 先断开管理器的强引用，确保即使迁移 CPU 失败，后续 del + GC 仍能释放。
                mgr.models[k] = None
                # 先把模型内部 tensor 显式移到 CPU 再删除引用，加速释放
                try:
                    if hasattr(m, 'model') and hasattr(m.model, 'cpu'):
                        m.model.cpu()
                except Exception:
                    pass
                finally:
                    del m
                freed_keys.append(k)
        # 强制 GC + CUDA 缓存清理
        gc.collect()
        if torch.cuda.is_available():
            if hasattr(torch.cuda, 'synchronize'):
                torch.cuda.synchronize()
            torch.cuda.empty_cache()
            if hasattr(torch.cuda, 'ipc_collect'):
                torch.cuda.ipc_collect()
            # 再 GC 一次，确保 tensor 被释放
            gc.collect()
            torch.cuda.empty_cache()
        print(f'[TTS] 已卸载模型: {freed_keys}, 显存已释放')
        return jsonify({'ok': True, 'unloaded': freed_keys})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'ok': False, 'error': f'{type(e).__name__}: {e}'}), 500


def main():
    global _MODELS_DIR
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=7861)
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--models-dir', default='', help='TTS 音频模型目录')
    args = parser.parse_args()
    if args.models_dir:
        _MODELS_DIR = os.path.abspath(args.models_dir)
    elif not _MODELS_DIR:
        _MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
    print(f'[TTS] REST API server starting on {args.host}:{args.port}')
    print(f'[TTS] device: {TTSModelManager().device}')
    print(f'[TTS] models_dir: {_MODELS_DIR}')
    paths = _discover_tts_models(_MODELS_DIR)
    for k, p in paths.items():
        print(f'[TTS] {k}: {p or "(未找到)"}')
    app.run(host=args.host, port=args.port, debug=False, threaded=False)


if __name__ == '__main__':
    main()
