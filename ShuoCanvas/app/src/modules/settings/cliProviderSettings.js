import { fetchCliProviderStatuses, logoutCliProvider, startCliProviderLogin } from "../../../api/cliProviderApi.js";
const PROVIDERS = Object.freeze({
  codex: Object.freeze({
    label: "OpenAI CLI",
    statusId: "codexCliStatusText",
    messageId: "codexCliStatusMessage",
    loginId: "btnCodexCliLogin",
    logoutId: "btnCodexCliLogout",
    signedOutMessage: "未登录。点击登录后，按终端提示在浏览器完成 ChatGPT 官方登录；不要选择 API Key 或 Access Token。"
  })
});
const LOGIN_STATUS_POLL_INTERVAL_MS = 2000;
const LOGIN_STATUS_POLL_MAX_ATTEMPTS = 45;
function pickStatusMessage(_0x57bf7e, _0x12dffe) {
  return String(_0x57bf7e?.message || _0x57bf7e?.error || _0x12dffe).trim();
}
export function formatCliProviderStatus(_0x2b13b0) {
  if (!_0x2b13b0 || typeof _0x2b13b0 !== "object" || Array.isArray(_0x2b13b0)) {
    return Object.freeze({
      statusText: "未检测",
      message: "尚未获取 CLI 状态",
      installed: false,
      loggedIn: false,
      busy: false
    });
  }
  const _0x10a9ec = !!_0x2b13b0.installed;
  const _0x4f7992 = !!_0x2b13b0.loggedIn;
  const _0xe980c5 = !!_0x2b13b0.busy || !!_0x2b13b0.active || !!_0x2b13b0.loginInProgress || !!_0x2b13b0.runtime?.active;
  if (_0xe980c5) {
    return Object.freeze({
      statusText: "登录中...",
      message: pickStatusMessage(_0x2b13b0, "正在等待浏览器授权"),
      installed: _0x10a9ec,
      loggedIn: _0x4f7992,
      busy: _0xe980c5
    });
  }
  if (_0x2b13b0.error) {
    return Object.freeze({
      statusText: "检测失败",
      message: pickStatusMessage(_0x2b13b0, "CLI 状态检测失败"),
      installed: _0x10a9ec,
      loggedIn: _0x4f7992,
      busy: _0xe980c5
    });
  }
  if (!_0x10a9ec) {
    return Object.freeze({
      statusText: "未安装",
      message: pickStatusMessage(_0x2b13b0, "未检测到本地 CLI"),
      installed: _0x10a9ec,
      loggedIn: false,
      busy: _0xe980c5
    });
  }
  if (_0x4f7992) {
    const _0xe0b22 = [_0x2b13b0.account, _0x2b13b0.version].filter(Boolean).join(" · ");
    return Object.freeze({
      statusText: "已登录",
      message: pickStatusMessage(_0x2b13b0, _0xe0b22 || "本地 CLI 已登录"),
      installed: _0x10a9ec,
      loggedIn: _0x4f7992,
      busy: _0xe980c5
    });
  }
  if (_0x2b13b0.authConfigured) {
    return Object.freeze({
      statusText: "已配置",
      message: pickStatusMessage(_0x2b13b0, "已配置本地登录方式，首次生成时验证账号状态"),
      installed: _0x10a9ec,
      loggedIn: _0x4f7992,
      busy: _0xe980c5
    });
  }
  return Object.freeze({
    statusText: "未登录",
    message: pickStatusMessage(_0x2b13b0, "点击登录以授权本地 CLI"),
    installed: _0x10a9ec,
    loggedIn: _0x4f7992,
    busy: _0xe980c5
  });
}
function getProviderElements(_0x32a7d1, _0xdd8a84) {
  return {
    statusTextEl: _0x32a7d1?.getElementById?.(_0xdd8a84.statusId) || null,
    messageEl: _0x32a7d1?.getElementById?.(_0xdd8a84.messageId) || null,
    loginButtonEl: _0x32a7d1?.getElementById?.(_0xdd8a84.loginId) || null,
    logoutButtonEl: _0x32a7d1?.getElementById?.(_0xdd8a84.logoutId) || null
  };
}
function resolveProviderStatus(_0x5c9e1e, _0x10de36) {
  if (!_0x5c9e1e || typeof _0x5c9e1e !== "object") {
    return null;
  }
  const _0x17cb07 = _0x5c9e1e.providers;
  if (_0x17cb07 && typeof _0x17cb07 === "object" && !Array.isArray(_0x17cb07)) {
    return _0x17cb07[_0x10de36] || null;
  }
  return _0x5c9e1e[_0x10de36] || null;
}
export async function initCliProviderSettings({
  documentObject = globalThis.document,
  showToast = globalThis.window?.showToast,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout,
  loginStatusPollIntervalMs = LOGIN_STATUS_POLL_INTERVAL_MS,
  loginStatusPollMaxAttempts = LOGIN_STATUS_POLL_MAX_ATTEMPTS
} = {}) {
  const _0x1f0abc = Object.entries(PROVIDERS).map(([_0x1398f6, _0x3b1a57]) => ({
    provider: _0x1398f6,
    config: _0x3b1a57,
    elements: getProviderElements(documentObject, _0x3b1a57)
  }));
  const _0x2ffcc2 = [];
  const _0x190229 = new Map();
  let _0xae1a83 = false;
  function _0x35b5ea(_0x4865c5) {
    const _0x4379ab = _0x190229.get(_0x4865c5);
    if (_0x4379ab !== undefined) {
      clearTimeoutFn?.(_0x4379ab);
    }
    _0x190229.delete(_0x4865c5);
  }
  function _0x106e09(_0x3c3d8a, _0x3e15a3) {
    const _0x333a9a = _0x1f0abc.find(_0xe1eaa => _0xe1eaa.provider === _0x3c3d8a);
    if (!_0x333a9a) {
      return;
    }
    const _0x12d38a = _0x3e15a3 && typeof _0x3e15a3 === "object" && !Array.isArray(_0x3e15a3) && _0x3e15a3.installed && !_0x3e15a3.loggedIn && !_0x3e15a3.authConfigured && !_0x3e15a3.message && !_0x3e15a3.error;
    const _0x7a00c2 = formatCliProviderStatus(_0x12d38a ? {
      ..._0x3e15a3,
      message: _0x333a9a.config.signedOutMessage
    } : _0x3e15a3);
    const {
      statusTextEl: _0x4ce449,
      messageEl: _0x1e68a3,
      loginButtonEl: _0x3b45b0,
      logoutButtonEl: _0x40ae76
    } = _0x333a9a.elements;
    if (_0x4ce449) {
      _0x4ce449.textContent = _0x7a00c2.statusText;
    }
    if (_0x1e68a3) {
      _0x1e68a3.textContent = _0x7a00c2.message;
    }
    if (_0x3b45b0) {
      _0x3b45b0.hidden = _0x7a00c2.loggedIn;
      _0x3b45b0.disabled = _0x7a00c2.busy;
    }
    if (_0x40ae76) {
      _0x40ae76.hidden = !_0x7a00c2.loggedIn;
      _0x40ae76.disabled = _0x7a00c2.busy;
    }
  }
  async function _0x33c6bd() {
    try {
      const _0x16d5da = await fetchCliProviderStatuses();
      if (_0xae1a83) {
        return _0x16d5da;
      }
      _0x1f0abc.forEach(({
        provider: _0x3890f6
      }) => {
        _0x106e09(_0x3890f6, resolveProviderStatus(_0x16d5da, _0x3890f6));
      });
      return _0x16d5da;
    } catch (_0x1fd04e) {
      if (!_0xae1a83) {
        _0x1f0abc.forEach(({
          provider: _0x34f5d5
        }) => {
          _0x106e09(_0x34f5d5, {
            error: _0x1fd04e?.message || "CLI 状态检测失败"
          });
        });
      }
      throw _0x1fd04e;
    }
  }
  function _0x4653eb(_0x625eb9) {
    _0x35b5ea(_0x625eb9);
    let _0x11528d = 0;
    const _0x13c172 = async () => {
      _0x190229.delete(_0x625eb9);
      if (_0xae1a83) {
        return;
      }
      _0x11528d += 1;
      try {
        const _0x275d6f = await _0x33c6bd();
        const _0x14aa69 = resolveProviderStatus(_0x275d6f, _0x625eb9);
        if (_0x14aa69?.loggedIn || _0x14aa69?.authConfigured) {
          _0x35b5ea(_0x625eb9);
          return;
        }
      } catch {}
      if (_0xae1a83 || _0x11528d >= loginStatusPollMaxAttempts) {
        return;
      }
      const _0x198124 = setTimeoutFn?.(_0x13c172, loginStatusPollIntervalMs);
      if (_0x198124 !== undefined) {
        _0x190229.set(_0x625eb9, _0x198124);
      }
    };
    const _0x507525 = setTimeoutFn?.(_0x13c172, loginStatusPollIntervalMs);
    if (_0x507525 !== undefined) {
      _0x190229.set(_0x625eb9, _0x507525);
    }
  }
  async function _0x1e3261(_0x11a1fc, _0x2212c8, _0x1075c9) {
    const _0x16e564 = _0x1f0abc.find(_0x4eac97 => _0x4eac97.provider === _0x11a1fc);
    if (!_0x16e564 || _0xae1a83) {
      return;
    }
    const {
      loginButtonEl: _0x4cd9ce,
      logoutButtonEl: _0x1658e3
    } = _0x16e564.elements;
    if (_0x4cd9ce) {
      _0x4cd9ce.disabled = true;
    }
    if (_0x1658e3) {
      _0x1658e3.disabled = true;
    }
    let _0x1bf998 = false;
    try {
      const _0x562629 = await _0x2212c8(_0x11a1fc);
      _0x1bf998 = !!_0x562629?.started;
      if (_0x1bf998) {
        _0x106e09(_0x11a1fc, {
          installed: true,
          busy: true,
          message: String(_0x562629?.instructions || "正在等待官方授权完成")
        });
        _0x4653eb(_0x11a1fc);
      }
      showToast?.(_0x1075c9, "success");
    } catch (_0x2e94fe) {
      showToast?.(_0x2e94fe?.message || _0x16e564.config.label + " 操作失败", "error");
    } finally {
      if (!_0xae1a83 && !_0x1bf998) {
        await _0x33c6bd().catch(_0x235067 => {
          showToast?.(_0x235067?.message || "CLI 状态刷新失败", "error");
        });
      }
    }
  }
  _0x1f0abc.forEach(({
    provider: _0x572436,
    config: _0x4bd6d3,
    elements: _0x54401f
  }) => {
    const _0x4a29eb = () => _0x1e3261(_0x572436, startCliProviderLogin, _0x4bd6d3.label + " 登录已启动");
    const _0x5bd9e9 = () => _0x1e3261(_0x572436, logoutCliProvider, _0x4bd6d3.label + " 已退出登录");
    _0x54401f.loginButtonEl?.addEventListener?.("click", _0x4a29eb);
    _0x54401f.logoutButtonEl?.addEventListener?.("click", _0x5bd9e9);
    _0x2ffcc2.push(() => {
      _0x54401f.loginButtonEl?.removeEventListener?.("click", _0x4a29eb);
      _0x54401f.logoutButtonEl?.removeEventListener?.("click", _0x5bd9e9);
    });
  });
  await _0x33c6bd().catch(_0x527443 => {
    showToast?.(_0x527443?.message || "CLI 状态刷新失败", "error");
  });
  return Object.freeze({
    refresh: _0x33c6bd,
    destroy() {
      if (_0xae1a83) {
        return;
      }
      _0xae1a83 = true;
      [..._0x190229.keys()].forEach(_0x35b5ea);
      _0x2ffcc2.splice(0).forEach(_0x4172f6 => _0x4172f6());
    }
  });
}