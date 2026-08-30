import { normalizeWebPreviewFaviconUrl, normalizeWebPreviewUrl } from "../src/modules/webPreviewUrl.js";
import { resolveDouyinCurrentPageMedia } from "./douyinWebPreviewResolver.js";
const MIN_VIEW_SIZE = 16;
const WEB_PREVIEW_IMAGE_DROP_MIME = "application/x-ai-canvas-web-preview-image";
const DEFAULT_WEB_PREVIEW_BROWSER_PROFILE_ID = "default";
const WEB_PREVIEW_PARTITION_PREFIX = "persist:ai-canvas-web-preview";
const READY_SNAPSHOT_IDLE_DELAY_MS = 180;
const POPUP_REGISTRATION_GRACE_MS = 5000;
const WEB_PREVIEW_IMAGE_EXTRACTION_LIMIT = 120;
const WEB_PREVIEW_VIDEO_EXTRACTION_LIMIT = 40;
const WEB_PREVIEW_EXTRACT_MIN_IMAGE_WIDTH = 96;
const WEB_PREVIEW_EXTRACT_MIN_IMAGE_HEIGHT = 96;
const WEB_PREVIEW_EXTRACT_MIN_IMAGE_AREA = 12000;
const WEB_PREVIEW_SELECTED_TEXT_LIMIT = 5000;
const WEB_PREVIEW_DIRECT_VIDEO_EXTENSION_RE = /\.(?:mp4|webm|mov|m4v|ogv)(?:[?#].*)?$/i;
const WEB_PREVIEW_STREAM_MEDIA_EXTENSION_RE = /\.(?:m3u8|mpd|m4s)(?:[?#].*)?$/i;
const WEB_PREVIEW_AUTH_POPUP_WIDTH = 520;
const WEB_PREVIEW_AUTH_POPUP_HEIGHT = 680;
const WEB_PREVIEW_AUTH_POPUP_MIN_WIDTH = 360;
const WEB_PREVIEW_AUTH_POPUP_MIN_HEIGHT = 420;
const WEB_PREVIEW_AUTH_POPUP_REQUEST_TTL_MS = 10000;
const WEB_PREVIEW_INPUT_BRIDGE_MESSAGE_PREFIX = "__AI_CANVAS_WEB_PREVIEW_INPUT__:";
const WEB_PREVIEW_CONTEXT_MENU_BRIDGE_DEDUPE_MS = 500;
const WEB_PREVIEW_TEXT_ACTION_PROMPT = "send-selected-text";
const WEB_PREVIEW_TEXT_ACTION_SOURCE = "send-selected-text-source";
const WEB_PREVIEW_TEXT_ACTION_IMAGE_PROMPT = "send-selected-text-to-image";
const WEB_PREVIEW_TEXT_ACTION_IMAGE_PROMPT_GENERATE = "send-selected-text-to-image-generate";
const WEB_PREVIEW_TEXT_ACTION_VIDEO_PROMPT = "send-selected-text-to-video";
const WEB_PREVIEW_TEXT_ACTION_VIDEO_PROMPT_GENERATE = "send-selected-text-to-video-generate";
function buildWebPreviewDragBridgeScript({
  nodeId = "",
  tabId = "",
  inputBridgeToken = ""
} = {}) {
  return "\n(() => {\n  const hasDragBridge = !!window.__AI_CANVAS_WEB_PREVIEW_DRAG_BRIDGE__;\n  if (!hasDragBridge) {\n    Object.defineProperty(window, \"__AI_CANVAS_WEB_PREVIEW_DRAG_BRIDGE__\", {\n      value: true,\n      configurable: false,\n    });\n  }\n  const MIME = " + JSON.stringify(WEB_PREVIEW_IMAGE_DROP_MIME) + ";\n  const INPUT_PREFIX = " + JSON.stringify(WEB_PREVIEW_INPUT_BRIDGE_MESSAGE_PREFIX) + ";\n  const INPUT_TOKEN = " + JSON.stringify(String(inputBridgeToken || "")) + ";\n  const escapeHtml = (value) => String(value || \"\").replace(/[&<>\"']/g, (ch) => ({\n    \"&\": \"&amp;\",\n    \"<\": \"&lt;\",\n    \">\": \"&gt;\",\n    '\"': \"&quot;\",\n    \"'\": \"&#39;\",\n  })[ch]);\n  const normalizeUrl = (value) => {\n    try {\n      const url = new URL(String(value || \"\"), document.baseURI);\n      if (url.protocol !== \"http:\" && url.protocol !== \"https:\") return \"\";\n      url.username = \"\";\n      url.password = \"\";\n      return url.href;\n    } catch {\n      return \"\";\n    }\n  };\n  const parseSrcset = (value) => String(value || \"\")\n    .split(\",\")\n    .map((item) => normalizeUrl(item.trim().split(/\\s+/)[0] || \"\"))\n    .filter(Boolean);\n  const parseCssUrls = (value) => {\n    const urls = [];\n    const text = String(value || \"\");\n    const re = /url\\(([\"']?)(.*?)\\1\\)/g;\n    let match = null;\n    while ((match = re.exec(text))) {\n      const url = normalizeUrl(match[2] || \"\");\n      if (url) urls.push(url);\n    }\n    return urls;\n  };\n  const getImageUrl = (image) => normalizeUrl(\n    image?.currentSrc ||\n      image?.src ||\n      image?.getAttribute?.(\"src\") ||\n      image?.dataset?.src ||\n      image?.dataset?.original ||\n      image?.dataset?.lazySrc ||\n      parseSrcset(image?.srcset || image?.getAttribute?.(\"srcset\") || \"\")[0] ||\n      \"\",\n  );\n  const getElementTitle = (element, fallback = \"\") =>\n    String(\n      element?.alt ||\n        element?.title ||\n        element?.getAttribute?.(\"aria-label\") ||\n        fallback ||\n        document.title ||\n        \"网页图片\",\n    ).slice(0, 120);\n  const findImageElement = (target) => {\n    if (!target?.closest) return null;\n    return (\n      target.closest(\"img\") ||\n      target.closest(\"picture\")?.querySelector?.(\"img\") ||\n      target.querySelector?.(\"img, picture img\") ||\n      null\n    );\n  };\n  const findBackgroundImageSource = (target) => {\n    let element = target?.nodeType === 1 ? target : null;\n    for (let i = 0; element && i < 4; i += 1, element = element.parentElement) {\n      const url = parseCssUrls(window.getComputedStyle?.(element)?.backgroundImage || \"\")[0];\n      if (url) {\n        return {\n          element,\n          url,\n          title: getElementTitle(element),\n          width: Math.max(0, Math.round(Number(element.clientWidth || 0) || 0)),\n          height: Math.max(0, Math.round(Number(element.clientHeight || 0) || 0)),\n        };\n      }\n    }\n    return null;\n  };\n  const findImageSource = (target) => {\n    const image = findImageElement(target);\n    if (image) return { image, element: image, url: getImageUrl(image) };\n    return findBackgroundImageSource(target);\n  };\n  const findContextImageSource = (event) => {\n    const candidates = [];\n    try {\n      const pointElements = document.elementsFromPoint?.(\n        Number(event?.clientX || 0) || 0,\n        Number(event?.clientY || 0) || 0,\n      );\n      if (Array.isArray(pointElements)) candidates.push(...pointElements);\n    } catch {}\n    if (event?.target) candidates.push(event.target);\n    const seen = new Set();\n    for (const element of candidates) {\n      if (!element || seen.has(element)) continue;\n      seen.add(element);\n      const source = findImageSource(element);\n      if (source?.url) return source;\n    }\n    return null;\n  };\n  const buildImagePayload = (source) => {\n    const image = source?.image || null;\n    const element = source?.element || image || null;\n    const url = normalizeUrl(source?.url || getImageUrl(image));\n    if (!url) return null;\n    const title = getElementTitle(image || element, source?.title);\n    const pageUrl = normalizeUrl(location.href);\n    return {\n      kind: \"image\",\n      url,\n      title,\n      sourceUrl: pageUrl,\n      pageUrl,\n      nodeId: " + JSON.stringify(toNodeId(nodeId)) + ",\n      tabId: " + JSON.stringify(toTabId(tabId)) + ",\n      width: Math.max(0, Math.round(Number(source?.width || image?.naturalWidth || image?.width || element?.clientWidth || 0) || 0)),\n      height: Math.max(0, Math.round(Number(source?.height || image?.naturalHeight || image?.height || element?.clientHeight || 0) || 0)),\n    };\n  };\n  const emitImageContextMenuRequest = (payload, event) => {\n    if (!payload?.url || !INPUT_TOKEN) return;\n    try {\n      console.info(\n        INPUT_PREFIX +\n          JSON.stringify({\n            ...payload,\n            token: INPUT_TOKEN,\n            type: \"image-context-menu\",\n            contextX: Math.max(0, Math.round(Number(event?.clientX || 0) || 0)),\n            contextY: Math.max(0, Math.round(Number(event?.clientY || 0) || 0)),\n          }),\n      );\n    } catch {}\n  };\n  const getSelectedText = () => {\n    try {\n      const active = document.activeElement;\n      if (\n        active &&\n        typeof active.value === \"string\" &&\n        Number.isFinite(active.selectionStart) &&\n        Number.isFinite(active.selectionEnd) &&\n        active.selectionEnd > active.selectionStart\n      ) {\n        return String(active.value.slice(active.selectionStart, active.selectionEnd)).trim();\n      }\n    } catch {}\n    try {\n      return String(window.getSelection?.()?.toString?.() || \"\").trim();\n    } catch {\n      return \"\";\n    }\n  };\n  const stopContextMenuEvent = (event) => {\n    try {\n      Object.defineProperty(event, \"__AI_CANVAS_WEB_PREVIEW_CONTEXT_IMAGE_HANDLED__\", {\n        value: true,\n      });\n    } catch {}\n    try { event.preventDefault(); } catch {}\n    try { event.stopPropagation(); } catch {}\n    try { event.stopImmediatePropagation?.(); } catch {}\n  };\n  const emitTextContextMenuRequest = (text, event) => {\n    if (!text || !INPUT_TOKEN) return;\n    try {\n      console.info(\n        INPUT_PREFIX +\n          JSON.stringify({\n            token: INPUT_TOKEN,\n            type: \"text-context-menu\",\n            text,\n            pageUrl: normalizeUrl(location.href),\n            contextX: Math.max(0, Math.round(Number(event?.clientX || 0) || 0)),\n            contextY: Math.max(0, Math.round(Number(event?.clientY || 0) || 0)),\n          }),\n      );\n    } catch {}\n  };\n  if (!window.__AI_CANVAS_WEB_PREVIEW_CONTEXT_IMAGE_BRIDGE__) {\n    Object.defineProperty(window, \"__AI_CANVAS_WEB_PREVIEW_CONTEXT_IMAGE_BRIDGE__\", {\n      value: true,\n      configurable: false,\n    });\n    const handleContextImageMenu = (event) => {\n      if (event.__AI_CANVAS_WEB_PREVIEW_CONTEXT_IMAGE_HANDLED__) return;\n      const selectedText = getSelectedText();\n      if (selectedText && INPUT_TOKEN) {\n        window.__AI_CANVAS_WEB_PREVIEW_LAST_CONTEXT_IMAGE__ = null;\n        stopContextMenuEvent(event);\n        emitTextContextMenuRequest(selectedText, event);\n        return;\n      }\n      const payload = buildImagePayload(findContextImageSource(event));\n      window.__AI_CANVAS_WEB_PREVIEW_LAST_CONTEXT_IMAGE__ = payload\n        ? {\n            ...payload,\n            contextX: Math.max(0, Math.round(Number(event.clientX || 0) || 0)),\n            contextY: Math.max(0, Math.round(Number(event.clientY || 0) || 0)),\n            capturedAt: Date.now(),\n          }\n        : null;\n      if (!payload?.url) return;\n      stopContextMenuEvent(event);\n      emitImageContextMenuRequest(payload, event);\n    };\n    window.addEventListener(\"contextmenu\", handleContextImageMenu, true);\n    document.addEventListener(\"contextmenu\", handleContextImageMenu, true);\n  }\n  if (!hasDragBridge) {\n    document.addEventListener(\"dragstart\", (event) => {\n      const payloadObject = buildImagePayload(findImageSource(event.target));\n      const url = payloadObject?.url || \"\";\n      if (!url || !event.dataTransfer) return;\n      const title = payloadObject.title || \"网页图片\";\n      const payload = JSON.stringify(payloadObject);\n      try { event.dataTransfer.setData(MIME, payload); } catch {}\n      try { event.dataTransfer.setData(\"text/uri-list\", url); } catch {}\n      try { event.dataTransfer.setData(\"text/plain\", url); } catch {}\n      try {\n        event.dataTransfer.setData(\"text/html\", '<img src=\"' + escapeHtml(url) + '\" alt=\"' + escapeHtml(title) + '\">');\n      } catch {}\n      event.dataTransfer.effectAllowed = \"copy\";\n    }, true);\n  }\n  if (!window.__AI_CANVAS_WEB_PREVIEW_INPUT_BRIDGE__ && INPUT_TOKEN) {\n    Object.defineProperty(window, \"__AI_CANVAS_WEB_PREVIEW_INPUT_BRIDGE__\", {\n      value: true,\n      configurable: false,\n    });\n    let spaceHeld = false;\n    let lastPanStartAt = 0;\n    let lastPanStartButton = -1;\n    const isSpaceKey = (event) =>\n      event?.code === \"Space\" ||\n      event?.key === \" \" ||\n      event?.key === \"Spacebar\" ||\n      event?.key === \"Space\";\n    const setSpaceHeld = (held) => {\n      spaceHeld = held === true;\n    };\n    document.addEventListener(\"keydown\", (event) => {\n      if (isSpaceKey(event)) setSpaceHeld(true);\n    }, true);\n    document.addEventListener(\"keyup\", (event) => {\n      if (isSpaceKey(event)) setSpaceHeld(false);\n    }, true);\n    window.addEventListener(\"blur\", () => setSpaceHeld(false), true);\n    const emitPanStartPreview = (event) => {\n      const button = Number(event?.button);\n      const isMiddle = button === 1;\n      const isLeft = button === 0;\n      if (!isMiddle && !isLeft) return;\n      const now = Date.now();\n      if (button === lastPanStartButton && now - lastPanStartAt < 32) return;\n      lastPanStartAt = now;\n      lastPanStartButton = button;\n      try {\n        console.info(\n          INPUT_PREFIX +\n            JSON.stringify({\n              token: INPUT_TOKEN,\n              type: \"pan-start-preview\",\n              button,\n              spaceHeld: isLeft && spaceHeld === true,\n              buttons: Number(event?.buttons || 0) || 0,\n              clientX: Math.max(0, Math.round(Number(event?.clientX || 0) || 0)),\n              clientY: Math.max(0, Math.round(Number(event?.clientY || 0) || 0)),\n            }),\n        );\n      } catch {}\n    };\n    window.addEventListener(\"pointerdown\", emitPanStartPreview, true);\n    window.addEventListener(\"mousedown\", emitPanStartPreview, true);\n    document.addEventListener(\"pointerdown\", emitPanStartPreview, true);\n    document.addEventListener(\"mousedown\", emitPanStartPreview, true);\n  }\n  return true;\n})()\n";
}
function buildWebPreviewContextImageProbeScript({
  nodeId = "",
  tabId = "",
  x = 0,
  y = 0
} = {}) {
  const _0x474bc8 = Math.max(0, Math.round(Number(x || 0) || 0));
  const _0x4fb747 = Math.max(0, Math.round(Number(y || 0) || 0));
  return "\n(() => {\n  const nodeId = " + JSON.stringify(toNodeId(nodeId)) + ";\n  const tabId = " + JSON.stringify(toTabId(tabId)) + ";\n  const contextX = " + _0x474bc8 + ";\n  const contextY = " + _0x4fb747 + ";\n  const normalizeUrl = (value) => {\n    try {\n      const url = new URL(String(value || \"\"), document.baseURI);\n      if (url.protocol !== \"http:\" && url.protocol !== \"https:\") return \"\";\n      url.username = \"\";\n      url.password = \"\";\n      return url.href;\n    } catch {\n      return \"\";\n    }\n  };\n  const pageUrl = normalizeUrl(location.href);\n  const pageTitle = String(document.title || \"\").slice(0, 160);\n  const parseSrcset = (value) => String(value || \"\")\n    .split(\",\")\n    .map((item) => normalizeUrl(item.trim().split(/\\s+/)[0] || \"\"))\n    .filter(Boolean);\n  const parseCssUrls = (value) => {\n    const urls = [];\n    const text = String(value || \"\");\n    const re = /url\\(([\"']?)(.*?)\\1\\)/g;\n    let match = null;\n    while ((match = re.exec(text))) {\n      const url = normalizeUrl(match[2] || \"\");\n      if (url) urls.push(url);\n    }\n    return urls;\n  };\n  const getImageUrl = (image) => normalizeUrl(\n    image?.currentSrc ||\n      image?.src ||\n      image?.getAttribute?.(\"src\") ||\n      image?.dataset?.src ||\n      image?.dataset?.original ||\n      image?.dataset?.lazySrc ||\n      parseSrcset(image?.srcset || image?.getAttribute?.(\"srcset\") || \"\")[0] ||\n      \"\",\n  );\n  const getElementTitle = (element, fallback = \"\") =>\n    String(\n      element?.alt ||\n        element?.title ||\n        element?.getAttribute?.(\"aria-label\") ||\n        fallback ||\n        pageTitle ||\n        \"网页图片\",\n    ).slice(0, 160);\n  const findImageElement = (target) => {\n    if (!target?.closest) return null;\n    return (\n      target.closest(\"img\") ||\n      target.closest(\"picture\")?.querySelector?.(\"img\") ||\n      target.querySelector?.(\"img, picture img\") ||\n      null\n    );\n  };\n  const findBackgroundImageSource = (target) => {\n    let element = target?.nodeType === 1 ? target : null;\n    for (let i = 0; element && i < 4; i += 1, element = element.parentElement) {\n      const url = parseCssUrls(window.getComputedStyle?.(element)?.backgroundImage || \"\")[0];\n      if (url) {\n        return {\n          element,\n          url,\n          title: getElementTitle(element),\n          width: Math.max(0, Math.round(Number(element.clientWidth || 0) || 0)),\n          height: Math.max(0, Math.round(Number(element.clientHeight || 0) || 0)),\n        };\n      }\n    }\n    return null;\n  };\n  const findImageSource = (target) => {\n    const image = findImageElement(target);\n    if (image) return { image, element: image, url: getImageUrl(image) };\n    return findBackgroundImageSource(target);\n  };\n  const findContextImageSource = () => {\n    const candidates = [];\n    try {\n      const pointElements = document.elementsFromPoint?.(contextX, contextY);\n      if (Array.isArray(pointElements)) candidates.push(...pointElements);\n    } catch {}\n    const seen = new Set();\n    for (const element of candidates) {\n      if (!element || seen.has(element)) continue;\n      seen.add(element);\n      const source = findImageSource(element);\n      if (source?.url) return source;\n    }\n    return null;\n  };\n  const buildImagePayload = (source) => {\n    const image = source?.image || null;\n    const element = source?.element || image || null;\n    const url = normalizeUrl(source?.url || getImageUrl(image));\n    if (!url) return null;\n    return {\n      kind: \"image\",\n      url,\n      title: getElementTitle(image || element, source?.title),\n      alt: String(image?.alt || \"\").slice(0, 160),\n      pageUrl,\n      pageTitle,\n      nodeId,\n      tabId,\n      contextX,\n      contextY,\n      width: Math.max(0, Math.round(Number(source?.width || image?.naturalWidth || image?.width || element?.clientWidth || 0) || 0)),\n      height: Math.max(0, Math.round(Number(source?.height || image?.naturalHeight || image?.height || element?.clientHeight || 0) || 0)),\n    };\n  };\n  const stored = window.__AI_CANVAS_WEB_PREVIEW_LAST_CONTEXT_IMAGE__;\n  if (stored?.url) {\n    return {\n      ok: true,\n      image: {\n        ...stored,\n        pageTitle: String(stored.pageTitle || pageTitle || \"\").slice(0, 160),\n        contextX,\n        contextY,\n      },\n      pageUrl,\n      pageTitle,\n    };\n  }\n  const payload = buildImagePayload(findContextImageSource());\n  return { ok: !!payload, image: payload, pageUrl, pageTitle };\n})()\n";
}
function buildWebPreviewImageExtractionScript({
  nodeId = "",
  tabId = ""
} = {}) {
  return "\n(() => {\n  const MAX = " + WEB_PREVIEW_IMAGE_EXTRACTION_LIMIT + ";\n  const MIN_WIDTH = " + WEB_PREVIEW_EXTRACT_MIN_IMAGE_WIDTH + ";\n  const MIN_HEIGHT = " + WEB_PREVIEW_EXTRACT_MIN_IMAGE_HEIGHT + ";\n  const MIN_AREA = " + WEB_PREVIEW_EXTRACT_MIN_IMAGE_AREA + ";\n  const nodeId = " + JSON.stringify(toNodeId(nodeId)) + ";\n  const tabId = " + JSON.stringify(toTabId(tabId)) + ";\n  const normalizeUrl = (value) => {\n    try {\n      const url = new URL(String(value || \"\"), document.baseURI);\n      if (url.protocol !== \"http:\" && url.protocol !== \"https:\") return \"\";\n      url.username = \"\";\n      url.password = \"\";\n      return url.href;\n    } catch {\n      return \"\";\n    }\n  };\n  const parseSrcset = (value) => String(value || \"\")\n    .split(\",\")\n    .map((item) => normalizeUrl(item.trim().split(/\\s+/)[0] || \"\"))\n    .filter(Boolean);\n  const parseCssUrls = (value) => {\n    const urls = [];\n    const text = String(value || \"\");\n    const re = /url\\(([\"']?)(.*?)\\1\\)/g;\n    let match = null;\n    while ((match = re.exec(text))) {\n      const url = normalizeUrl(match[2]);\n      if (url) urls.push(url);\n    }\n    return urls;\n  };\n  const pageUrl = normalizeUrl(location.href);\n  const pageTitle = String(document.title || \"\").slice(0, 160);\n  const seen = new Set();\n  const images = [];\n  const hasExtractableSize = (width, height) => {\n    const safeWidth = Math.max(0, Math.round(Number(width || 0) || 0));\n    const safeHeight = Math.max(0, Math.round(Number(height || 0) || 0));\n    if (!safeWidth || !safeHeight) return true;\n    return safeWidth >= MIN_WIDTH && safeHeight >= MIN_HEIGHT && safeWidth * safeHeight >= MIN_AREA;\n  };\n  const push = (url, source = {}) => {\n    const normalizedUrl = normalizeUrl(url);\n    const width = Math.max(0, Math.round(Number(source.width || 0) || 0));\n    const height = Math.max(0, Math.round(Number(source.height || 0) || 0));\n    if (!normalizedUrl || !hasExtractableSize(width, height) || seen.has(normalizedUrl) || images.length >= MAX) return;\n    seen.add(normalizedUrl);\n    images.push({\n      url: normalizedUrl,\n      title: String(source.title || pageTitle || \"网页图片\").slice(0, 160),\n      alt: String(source.alt || \"\").slice(0, 160),\n      width,\n      height,\n      pageUrl,\n      pageTitle,\n      nodeId,\n      tabId,\n    });\n  };\n  for (const img of Array.from(document.images || [])) {\n    if (images.length >= MAX) break;\n    const title = img.alt || img.title || img.getAttribute(\"aria-label\") || pageTitle || \"网页图片\";\n    const source = {\n      title,\n      alt: img.alt || \"\",\n      width: img.naturalWidth || img.width || img.clientWidth || 0,\n      height: img.naturalHeight || img.height || img.clientHeight || 0,\n    };\n    push(img.currentSrc || img.src || img.getAttribute(\"src\") || img.dataset?.src || \"\", source);\n    for (const url of parseSrcset(img.srcset || img.getAttribute(\"srcset\") || \"\")) push(url, source);\n    const picture = img.closest?.(\"picture\");\n    for (const sourceEl of Array.from(picture?.querySelectorAll?.(\"source[srcset]\") || [])) {\n      for (const url of parseSrcset(sourceEl.getAttribute(\"srcset\") || \"\")) push(url, source);\n    }\n  }\n  for (const el of Array.from(document.querySelectorAll(\"body *\"))) {\n    if (images.length >= MAX) break;\n    let backgroundImage = \"\";\n    try {\n      backgroundImage = getComputedStyle(el).backgroundImage;\n    } catch {}\n    for (const url of parseCssUrls(backgroundImage)) {\n      if (images.length >= MAX) break;\n      push(url, {\n        title: el.getAttribute?.(\"aria-label\") || el.getAttribute?.(\"title\") || pageTitle || \"网页图片\",\n        width: el.clientWidth || 0,\n        height: el.clientHeight || 0,\n      });\n    }\n  }\n  return { ok: true, images, pageUrl, pageTitle };\n})()\n";
}
function buildWebPreviewVideoExtractionScript({
  nodeId = "",
  tabId = ""
} = {}) {
  return "\n(() => {\n  const MAX = " + WEB_PREVIEW_VIDEO_EXTRACTION_LIMIT + ";\n  const DIRECT_VIDEO_RE = " + WEB_PREVIEW_DIRECT_VIDEO_EXTENSION_RE + ";\n  const STREAM_MEDIA_RE = " + WEB_PREVIEW_STREAM_MEDIA_EXTENSION_RE + ";\n  const nodeId = " + JSON.stringify(toNodeId(nodeId)) + ";\n  const tabId = " + JSON.stringify(toTabId(tabId)) + ";\n  const normalizeUrl = (value) => {\n    try {\n      const url = new URL(String(value || \"\"), document.baseURI);\n      if (url.protocol !== \"http:\" && url.protocol !== \"https:\") return \"\";\n      url.username = \"\";\n      url.password = \"\";\n      return url.href;\n    } catch {\n      return \"\";\n    }\n  };\n  const isDirectVideoUrl = (value) => {\n    try {\n      return DIRECT_VIDEO_RE.test(new URL(value).pathname);\n    } catch {\n      return false;\n    }\n  };\n  const isStreamMediaUrl = (value) => {\n    try {\n      return STREAM_MEDIA_RE.test(new URL(value).pathname);\n    } catch {\n      return false;\n    }\n  };\n  const pageUrl = normalizeUrl(location.href);\n  const pageTitle = String(document.title || \"\").slice(0, 160);\n  const seen = new Set();\n  const videos = [];\n  const douyinDetailApiUrls = [];\n  const douyinDetailApiSeen = new Set();\n  const DOUYIN_DETAIL_API_RE = /\\/aweme\\/v1\\/web\\/aweme\\/detail\\//i;\n  const pushDouyinDetailApiUrl = (value) => {\n    const normalizedUrl = normalizeUrl(value);\n    if (!normalizedUrl || douyinDetailApiSeen.has(normalizedUrl)) return;\n    try {\n      const parsed = new URL(normalizedUrl);\n      const host = parsed.hostname.toLowerCase();\n      const isDouyinHost =\n        host === \"douyin.com\" ||\n        host.endsWith(\".douyin.com\") ||\n        host === \"iesdouyin.com\" ||\n        host.endsWith(\".iesdouyin.com\");\n      if (!isDouyinHost || !DOUYIN_DETAIL_API_RE.test(parsed.pathname)) return;\n      if (!/\\d{15,25}/.test(parsed.searchParams.get(\"aweme_id\") || \"\")) return;\n    } catch {\n      return;\n    }\n    douyinDetailApiSeen.add(normalizedUrl);\n    douyinDetailApiUrls.push(normalizedUrl);\n  };\n  const finiteNumber = (value) => {\n    const n = Number(value);\n    return Number.isFinite(n) && n > 0 ? n : 0;\n  };\n  const push = (url, source = {}) => {\n    const normalizedUrl = normalizeUrl(url);\n    if (!normalizedUrl || seen.has(normalizedUrl) || videos.length >= MAX) return;\n    if (isStreamMediaUrl(normalizedUrl)) return;\n    const type = String(source.type || \"\").trim().toLowerCase();\n    const recognizable = Boolean(\n      source.fromVideo ||\n        type.startsWith(\"video/\") ||\n        isDirectVideoUrl(normalizedUrl),\n    );\n    if (!recognizable) return;\n    seen.add(normalizedUrl);\n    videos.push({\n      kind: \"video\",\n      url: normalizedUrl,\n      title: String(source.title || pageTitle || \"网页视频\").slice(0, 160),\n      pageUrl,\n      pageTitle,\n      nodeId,\n      tabId,\n      width: Math.max(0, Math.round(finiteNumber(source.width))),\n      height: Math.max(0, Math.round(finiteNumber(source.height))),\n      duration: finiteNumber(source.duration),\n      sourceType: String(source.sourceType || \"media\").slice(0, 40),\n      mimeType: type,\n    });\n  };\n  for (const video of Array.from(document.querySelectorAll(\"video\"))) {\n    if (videos.length >= MAX) break;\n    const title =\n      video.getAttribute(\"aria-label\") ||\n      video.getAttribute(\"title\") ||\n      video.getAttribute(\"alt\") ||\n      pageTitle ||\n      \"网页视频\";\n    const source = {\n      fromVideo: true,\n      sourceType: \"video\",\n      title,\n      width: video.videoWidth || video.clientWidth || 0,\n      height: video.videoHeight || video.clientHeight || 0,\n      duration: video.duration,\n    };\n    push(video.currentSrc || video.src || video.getAttribute(\"src\") || \"\", source);\n    for (const sourceEl of Array.from(video.querySelectorAll(\"source[src]\"))) {\n      push(sourceEl.getAttribute(\"src\") || \"\", {\n        ...source,\n        type: sourceEl.getAttribute(\"type\") || \"\",\n        sourceType: \"video-source\",\n      });\n    }\n  }\n  for (const sourceEl of Array.from(document.querySelectorAll(\"source[src]\"))) {\n    if (videos.length >= MAX) break;\n    const type = sourceEl.getAttribute(\"type\") || \"\";\n    if (!String(type).toLowerCase().startsWith(\"video/\")) continue;\n    const media = sourceEl.closest?.(\"video\");\n    push(sourceEl.getAttribute(\"src\") || \"\", {\n      fromVideo: true,\n      type,\n      sourceType: \"source\",\n      title: media?.getAttribute?.(\"title\") || pageTitle || \"网页视频\",\n      width: media?.videoWidth || media?.clientWidth || 0,\n      height: media?.videoHeight || media?.clientHeight || 0,\n      duration: media?.duration,\n    });\n  }\n  for (const link of Array.from(document.querySelectorAll(\"a[href]\"))) {\n    if (videos.length >= MAX) break;\n    const href = link.getAttribute(\"href\") || \"\";\n    const normalizedUrl = normalizeUrl(href);\n    if (!normalizedUrl || !isDirectVideoUrl(normalizedUrl) || isStreamMediaUrl(normalizedUrl)) continue;\n    push(normalizedUrl, {\n      sourceType: \"link\",\n      title: link.textContent?.trim() || link.getAttribute(\"title\") || pageTitle || \"网页视频\",\n    });\n  }\n  for (const el of Array.from(document.querySelectorAll(\"[data-src], [data-url], [data-video-src]\"))) {\n    if (videos.length >= MAX) break;\n    const candidates = [\n      el.getAttribute(\"data-video-src\"),\n      el.getAttribute(\"data-play-url\"),\n      el.getAttribute(\"data-video-url\"),\n      el.getAttribute(\"data-src\"),\n      el.getAttribute(\"data-url\"),\n    ];\n    for (const candidate of candidates) {\n      if (videos.length >= MAX) break;\n      const normalizedUrl = normalizeUrl(candidate);\n      if (!normalizedUrl || !isDirectVideoUrl(normalizedUrl) || isStreamMediaUrl(normalizedUrl)) continue;\n      push(normalizedUrl, {\n        sourceType: \"data-attribute\",\n        title: el.getAttribute(\"aria-label\") || el.getAttribute(\"title\") || pageTitle || \"网页视频\",\n        width: el.clientWidth || 0,\n        height: el.clientHeight || 0,\n      });\n    }\n  }\n  for (const resource of Array.from(performance?.getEntriesByType?.(\"resource\") || [])) {\n    if (videos.length >= MAX) break;\n    const normalizedUrl = normalizeUrl(resource?.name);\n    if (!normalizedUrl || isStreamMediaUrl(normalizedUrl)) continue;\n    pushDouyinDetailApiUrl(normalizedUrl);\n    const initiatorType = String(resource?.initiatorType || \"\").trim().toLowerCase();\n    const fromMediaResource =\n      initiatorType === \"video\" ||\n      initiatorType === \"media\" ||\n      initiatorType === \"source\";\n    if (!fromMediaResource && !isDirectVideoUrl(normalizedUrl)) continue;\n    push(normalizedUrl, {\n      fromVideo: fromMediaResource,\n      sourceType: \"video-resource\",\n      title: pageTitle || \"网页视频\",\n    });\n  }\n  const normalizeEmbeddedUrl = (value) =>\n    normalizeUrl(\n      String(value || \"\")\n        .replace(/\\\\u002[fF]/g, \"/\")\n        .replace(/\\\\\\//g, \"/\"),\n    );\n  const embeddedUrlRe = /https?:\\\\?\\/\\\\?\\/[^\"'\\s<>]+/g;\n  for (const script of Array.from(document.scripts || [])) {\n    if (videos.length >= MAX) break;\n    const text = String(script.textContent || \"\").slice(0, 400000);\n    let match = null;\n    while ((match = embeddedUrlRe.exec(text))) {\n      if (videos.length >= MAX) break;\n      const normalizedUrl = normalizeEmbeddedUrl(match[0]);\n      pushDouyinDetailApiUrl(normalizedUrl);\n      if (!normalizedUrl || !isDirectVideoUrl(normalizedUrl) || isStreamMediaUrl(normalizedUrl)) continue;\n      push(normalizedUrl, {\n        sourceType: \"embedded-url\",\n        title: pageTitle || \"网页视频\",\n      });\n    }\n  }\n  const STRUCTURED_VIDEO_SOURCE_TYPE = \"structured-data\";\n  const DOUYIN_DETAIL_SOURCE_TYPE = \"douyin-detail\";\n  const STRUCTURED_VIDEO_KEY_RE =\n    /(?:video|play|download|stream|dash|media|aweme|xigua|note|vod|mp4|h264|h265|hevc|url[_-]?list|backup[_-]?urls|masterurl|baseurl|playurl|downloadurl)/i;\n  const STRUCTURED_URL_KEY_RE =\n    /^(?:url|uri|src|source|playurl|play_url|playaddr|play_addr|downloadurl|download_url|downloadaddr|download_addr|masterurl|master_url|baseurl|base_url|mainurl|main_url|file|contenturl)$/i;\n  const NON_VIDEO_ASSET_RE = /.(?:png|jpe?g|webp|gif|bmp|svg|avif|css|js)(?:[?#].*)?$/i;\n  const KNOWN_STATE_KEYS = [\n    \"__INITIAL_STATE__\",\n    \"__NEXT_DATA__\",\n    \"__NUXT__\",\n    \"__APOLLO_STATE__\",\n    \"__INITIAL_PROPS__\",\n    \"RENDER_DATA\",\n    \"SIGI_STATE\",\n    \"SSR_RENDER_DATA\",\n  ];\n  const unescapeStructuredUrlText = (value) =>\n    String(value || \"\")\n      .replace(/\\\\u002[fF]/g, \"/\")\n      .replace(/\\\\u0026/g, \"&\")\n      .replace(/\\\\u003[dD]/g, \"=\")\n      .replace(/\\\\\\//g, \"/\")\n      .replace(/&amp;/g, \"&\");\n  const extractUrlsFromText = (value) => {\n    const text = unescapeStructuredUrlText(value).trim();\n    if (!text) return [];\n    const urls = [];\n    const direct = normalizeUrl(text);\n    if (direct) urls.push(direct);\n    const urlRe = /https?:\\/\\/[^\"'\\s<>]+/g;\n    let match = null;\n    while ((match = urlRe.exec(text))) {\n      const url = normalizeUrl(match[0]);\n      if (url) urls.push(url);\n    }\n    return Array.from(new Set(urls));\n  };\n  const isNonVideoAssetUrl = (value) => {\n    try {\n      return NON_VIDEO_ASSET_RE.test(new URL(value).pathname);\n    } catch {\n      return false;\n    }\n  };\n  const hasStructuredVideoContext = (path = []) =>\n    path.some((key) => STRUCTURED_VIDEO_KEY_RE.test(String(key || \"\")));\n  const readStructuredNumber = (object, keys) => {\n    if (!object || typeof object !== \"object\") return 0;\n    for (const key of keys) {\n      const value = finiteNumber(object[key]);\n      if (value) return value;\n    }\n    return 0;\n  };\n  const normalizeDouyinDuration = (value) => {\n    const duration = finiteNumber(value);\n    if (!duration) return 0;\n    return duration >= 1000 ? duration / 1000 : duration;\n  };\n  const pickLastStructuredUrl = (items) => {\n    const urls = [];\n    const list = Array.isArray(items) ? items : [items];\n    for (const item of list) {\n      urls.push(...extractUrlsFromText(item));\n    }\n    return urls.filter(Boolean).at(-1) || \"\";\n  };\n  const readDouyinAddressUrl = (address) => {\n    if (!address) return \"\";\n    if (typeof address === \"string\") return pickLastStructuredUrl(address);\n    if (typeof address !== \"object\") return \"\";\n    const urlList = Array.isArray(address.url_list)\n      ? address.url_list\n      : Array.isArray(address.urlList)\n        ? address.urlList\n        : [];\n    return (\n      pickLastStructuredUrl(urlList) ||\n      pickLastStructuredUrl(address.url) ||\n      pickLastStructuredUrl(address.uri) ||\n      pickLastStructuredUrl(address.main_url) ||\n      pickLastStructuredUrl(address.mainUrl)\n    );\n  };\n  const hasDouyinVideoAddress = (video) =>\n    Boolean(\n      video &&\n        typeof video === \"object\" &&\n        (video.play_addr_h264 || video.play_addr_256 || video.play_addr || video.download_addr),\n    );\n  const readDouyinVideoUrl = (video) => {\n    if (!hasDouyinVideoAddress(video)) return \"\";\n    const sources = [video.play_addr_h264, video.play_addr_256, video.play_addr, video.download_addr];\n    for (const source of sources) {\n      const url = readDouyinAddressUrl(source);\n      if (url) return url;\n    }\n    return \"\";\n  };\n  const readDouyinTitle = (aweme) =>\n    String(\n      aweme?.desc ||\n        aweme?.item_title ||\n        aweme?.share_info?.share_title ||\n        pageTitle ||\n        \"网页视频\",\n    )\n      .trim()\n      .slice(0, 160);\n  const pushDouyinAwemeDetail = (aweme) => {\n    if (!aweme || typeof aweme !== \"object\" || !hasDouyinVideoAddress(aweme.video)) return;\n    const url = readDouyinVideoUrl(aweme.video);\n    if (!url || isStreamMediaUrl(url) || isNonVideoAssetUrl(url)) return;\n    push(url, {\n      fromVideo: true,\n      sourceType: DOUYIN_DETAIL_SOURCE_TYPE,\n      title: readDouyinTitle(aweme),\n      width: readStructuredNumber(aweme.video, [\"width\", \"w\", \"videoWidth\"]),\n      height: readStructuredNumber(aweme.video, [\"height\", \"h\", \"videoHeight\"]),\n      duration: normalizeDouyinDuration(\n        aweme.video.duration || aweme.duration || aweme.video.videoDuration,\n      ),\n    });\n  };\n  const visitedDouyinDetailObjects = new WeakSet();\n  const scanDouyinAwemeDetails = (value, depth = 0) => {\n    if (videos.length >= MAX || depth > 10 || !value || typeof value !== \"object\") return;\n    if (visitedDouyinDetailObjects.has(value)) return;\n    visitedDouyinDetailObjects.add(value);\n    if (value.aweme_detail) pushDouyinAwemeDetail(value.aweme_detail);\n    if (Array.isArray(value.aweme_list)) {\n      for (const aweme of value.aweme_list) pushDouyinAwemeDetail(aweme);\n    }\n    if (hasDouyinVideoAddress(value.video)) pushDouyinAwemeDetail(value);\n    for (const key of Object.keys(value).slice(0, 180)) {\n      if (videos.length >= MAX) break;\n      const item = value[key];\n      if (item && typeof item === \"object\") scanDouyinAwemeDetails(item, depth + 1);\n    }\n  };\n  const pushStructuredVideoUrl = (url, source = {}) => {\n    const normalizedUrl = normalizeUrl(url);\n    if (!normalizedUrl || isStreamMediaUrl(normalizedUrl) || isNonVideoAssetUrl(normalizedUrl)) {\n      return;\n    }\n    if (!isDirectVideoUrl(normalizedUrl)) return;\n    push(normalizedUrl, {\n      fromVideo: true,\n      sourceType: STRUCTURED_VIDEO_SOURCE_TYPE,\n      title: source.title || pageTitle || \"网页视频\",\n      width: source.width || 0,\n      height: source.height || 0,\n      duration: source.duration || 0,\n    });\n  };\n  const visitedStructuredObjects = new WeakSet();\n  let structuredObjectCount = 0;\n  const walkStructuredMedia = (value, path = [], depth = 0, inheritedContext = false) => {\n    if (videos.length >= MAX || structuredObjectCount > 3000 || depth > 10) return;\n    if (typeof value === \"string\") {\n      const context =\n        inheritedContext ||\n        hasStructuredVideoContext(path) ||\n        STRUCTURED_URL_KEY_RE.test(String(path.at(-1) || \"\"));\n      if (!context) return;\n      for (const url of extractUrlsFromText(value)) {\n        pushStructuredVideoUrl(url, { hasStructuredVideoContext: context });\n      }\n      return;\n    }\n    if (!value || typeof value !== \"object\") return;\n    if (visitedStructuredObjects.has(value)) return;\n    visitedStructuredObjects.add(value);\n    structuredObjectCount += 1;\n\n    const keys = Object.keys(value).slice(0, 180);\n    const objectContext =\n      inheritedContext ||\n      hasStructuredVideoContext(path) ||\n      keys.some((key) => STRUCTURED_VIDEO_KEY_RE.test(key));\n    const dimensions = {\n      width: readStructuredNumber(value, [\"width\", \"w\", \"videoWidth\"]),\n      height: readStructuredNumber(value, [\"height\", \"h\", \"videoHeight\"]),\n      duration: readStructuredNumber(value, [\"duration\", \"durationSec\", \"videoDuration\"]),\n    };\n    for (const key of keys) {\n      if (videos.length >= MAX) break;\n      const item = value[key];\n      const nextPath = path.concat(key);\n      const keyContext =\n        objectContext ||\n        STRUCTURED_VIDEO_KEY_RE.test(key) ||\n        STRUCTURED_URL_KEY_RE.test(key);\n      if (typeof item === \"string\") {\n        if (!keyContext) continue;\n        for (const url of extractUrlsFromText(item)) {\n          pushStructuredVideoUrl(url, {\n            ...dimensions,\n            hasStructuredVideoContext: keyContext,\n          });\n        }\n        continue;\n      }\n      if (item && typeof item === \"object\") {\n        walkStructuredMedia(item, nextPath, depth + 1, keyContext);\n      }\n    }\n  };\n  const tryParseStructuredJson = (value) => {\n    const text = String(value || \"\").trim();\n    if (!text) return null;\n    try {\n      return JSON.parse(text);\n    } catch {}\n    try {\n      return JSON.parse(decodeURIComponent(text));\n    } catch {}\n    return null;\n  };\n  const extractJsonValueAt = (text, startIndex) => {\n    let index = Math.max(0, Number(startIndex || 0) || 0);\n    while (index < text.length && /\\s/.test(text[index])) index += 1;\n    const open = text[index];\n    const close = open === \"{\" ? \"}\" : open === \"[\" ? \"]\" : \"\";\n    if (!close) return \"\";\n    let depth = 0;\n    let quote = \"\";\n    let escaped = false;\n    for (let i = index; i < text.length; i += 1) {\n      const ch = text[i];\n      if (quote) {\n        if (escaped) {\n          escaped = false;\n        } else if (ch === \"\\\\\") {\n          escaped = true;\n        } else if (ch === quote) {\n          quote = \"\";\n        }\n        continue;\n      }\n      if (ch === '\"' || ch === \"'\") {\n        quote = ch;\n        continue;\n      }\n      if (ch === open) {\n        depth += 1;\n      } else if (ch === close) {\n        depth -= 1;\n        if (depth === 0) return text.slice(index, i + 1);\n      }\n    }\n    return \"\";\n  };\n  const scanStructuredScriptText = (value) => {\n    const text = String(value || \"\").slice(0, 800000);\n    const parsed = tryParseStructuredJson(text);\n    if (parsed) {\n      scanDouyinAwemeDetails(parsed);\n      walkStructuredMedia(parsed, [\"script-json\"]);\n    }\n    const decodedText = unescapeStructuredUrlText(text);\n    const decoded = decodedText !== text ? tryParseStructuredJson(decodedText) : null;\n    if (decoded) {\n      scanDouyinAwemeDetails(decoded);\n      walkStructuredMedia(decoded, [\"script-json-decoded\"]);\n    }\n\n    const keyRe =\n      /[\"']?(aweme_detail|video_info(?:_v2)?|video|play_addr(?:_h(?:264|265)|_256)?|download_addr|url_list|backup_urls|dash|stream)[\"']?\\s*:/gi;\n    let match = null;\n    let scanned = 0;\n    while ((match = keyRe.exec(decodedText)) && scanned < 120 && videos.length < MAX) {\n      scanned += 1;\n      const colonIndex = decodedText.indexOf(\":\", match.index);\n      const jsonValue = extractJsonValueAt(decodedText, colonIndex + 1);\n      const partial = tryParseStructuredJson(jsonValue);\n      if (partial) {\n        scanDouyinAwemeDetails(partial);\n        walkStructuredMedia(partial, [match[1]]);\n      }\n    }\n  };\n  for (const key of KNOWN_STATE_KEYS) {\n    if (videos.length >= MAX) break;\n    try {\n      const value = window[key];\n      if (typeof value === \"string\") {\n        const parsed = tryParseStructuredJson(unescapeStructuredUrlText(value));\n        if (parsed) {\n          scanDouyinAwemeDetails(parsed);\n          walkStructuredMedia(parsed, [key]);\n        } else {\n          walkStructuredMedia(value, [key]);\n        }\n      } else if (value && typeof value === \"object\") {\n        scanDouyinAwemeDetails(value);\n        walkStructuredMedia(value, [key]);\n      }\n    } catch {}\n  }\n  for (const script of Array.from(document.scripts || [])) {\n    if (videos.length >= MAX) break;\n    const type = String(script.type || script.getAttribute?.(\"type\") || \"\").toLowerCase();\n    const id = String(script.id || \"\").toLowerCase();\n    const shouldScan =\n      type.includes(\"json\") ||\n      id.includes(\"data\") ||\n      id.includes(\"state\") ||\n      /play_addr|download_addr|url_list|backup_urls|video_info|aweme_detail/i.test(script.textContent || \"\");\n    if (!shouldScan) continue;\n    scanStructuredScriptText(script.textContent || \"\");\n  }\n  return { ok: true, videos, douyinDetailApiUrls, pageUrl, pageTitle };\n})()\n";
}
function buildWebPreviewReferenceSnapshotScript() {
  return "\n(() => {\n  const normalizeUrl = (value) => {\n    try {\n      const url = new URL(String(value || \"\"), document.baseURI);\n      if (url.protocol !== \"http:\" && url.protocol !== \"https:\") return \"\";\n      url.username = \"\";\n      url.password = \"\";\n      return url.href;\n    } catch {\n      return \"\";\n    }\n  };\n  const selectedText = String(window.getSelection?.().toString?.() || \"\").trim();\n  return {\n    ok: true,\n    pageUrl: normalizeUrl(location.href),\n    pageTitle: String(document.title || \"\").slice(0, 160),\n    selectedText: selectedText.slice(0, " + WEB_PREVIEW_SELECTED_TEXT_LIMIT + "),\n  };\n})()\n";
}
function toNodeId(_0x1483e3) {
  return String(_0x1483e3 || "").trim();
}
function toTabId(_0x14fc71) {
  return String(_0x14fc71 || "default").trim() || "default";
}
function normalizeExtractedImageDimension(_0x43affc) {
  return Math.max(0, Math.round(Number(_0x43affc || 0) || 0));
}
function hasExtractableImageSize(_0x4f2675, _0x31c466) {
  const _0x378622 = normalizeExtractedImageDimension(_0x4f2675);
  const _0x5836a5 = normalizeExtractedImageDimension(_0x31c466);
  if (!_0x378622 || !_0x5836a5) {
    return true;
  }
  return _0x378622 >= WEB_PREVIEW_EXTRACT_MIN_IMAGE_WIDTH && _0x5836a5 >= WEB_PREVIEW_EXTRACT_MIN_IMAGE_HEIGHT && _0x378622 * _0x5836a5 >= WEB_PREVIEW_EXTRACT_MIN_IMAGE_AREA;
}
function filterExtractedImageCandidates(_0x26b915 = []) {
  if (!Array.isArray(_0x26b915)) {
    return [];
  }
  return _0x26b915.filter(_0x279c28 => hasExtractableImageSize(_0x279c28?.width, _0x279c28?.height));
}
function normalizeExtractedMediaUrl(_0x36980e) {
  const _0x5857ab = String(_0x36980e || "").trim();
  if (!_0x5857ab) {
    return "";
  }
  try {
    const _0x8885be = new URL(_0x5857ab);
    if (_0x8885be.protocol !== "http:" && _0x8885be.protocol !== "https:") {
      return "";
    }
    _0x8885be.username = "";
    _0x8885be.password = "";
    return _0x8885be.href;
  } catch {
    return "";
  }
}
function isDirectVideoMediaUrl(_0x3eca70) {
  const _0x40a524 = normalizeExtractedMediaUrl(_0x3eca70);
  if (!_0x40a524) {
    return false;
  }
  try {
    const _0x42d5fe = new URL(_0x40a524).pathname;
    return WEB_PREVIEW_DIRECT_VIDEO_EXTENSION_RE.test(_0x42d5fe) && !WEB_PREVIEW_STREAM_MEDIA_EXTENSION_RE.test(_0x42d5fe);
  } catch {
    return false;
  }
}
function filterExtractedVideoCandidates(_0x3ee0b9 = []) {
  if (!Array.isArray(_0x3ee0b9)) {
    return [];
  }
  const _0x1e2a72 = new Set();
  const _0x4c0fad = [];
  for (const _0x4ee784 of _0x3ee0b9) {
    const _0x57b84c = normalizeExtractedMediaUrl(_0x4ee784?.url);
    if (!_0x57b84c || _0x1e2a72.has(_0x57b84c)) {
      continue;
    }
    let _0x1295db = "";
    try {
      _0x1295db = new URL(_0x57b84c).pathname;
    } catch {}
    if (WEB_PREVIEW_STREAM_MEDIA_EXTENSION_RE.test(_0x1295db)) {
      continue;
    }
    const _0x558dba = String(_0x4ee784?.mimeType || "").trim().toLowerCase();
    const _0x481402 = String(_0x4ee784?.sourceType || "media").trim().toLowerCase();
    const _0x3bdee5 = _0x558dba.startsWith("video/") || isDirectVideoMediaUrl(_0x57b84c) || _0x481402 === "video" || _0x481402 === "video-source" || _0x481402 === "source" || _0x481402 === "video-resource" || _0x481402 === "douyin-detail";
    if (!_0x3bdee5) {
      continue;
    }
    _0x1e2a72.add(_0x57b84c);
    _0x4c0fad.push({
      kind: "video",
      url: _0x57b84c,
      title: String(_0x4ee784?.title || _0x4ee784?.pageTitle || "网页视频").trim().slice(0, 160),
      pageUrl: normalizeExtractedMediaUrl(_0x4ee784?.pageUrl),
      pageTitle: String(_0x4ee784?.pageTitle || "").trim().slice(0, 160),
      nodeId: String(_0x4ee784?.nodeId || "").trim(),
      tabId: String(_0x4ee784?.tabId || "").trim(),
      width: Math.max(0, Math.round(Number(_0x4ee784?.width || 0) || 0)),
      height: Math.max(0, Math.round(Number(_0x4ee784?.height || 0) || 0)),
      duration: Math.max(0, Number(_0x4ee784?.duration || 0) || 0),
      sourceType: _0x481402.slice(0, 40),
      mimeType: _0x558dba
    });
    if (_0x4c0fad.length >= WEB_PREVIEW_VIDEO_EXTRACTION_LIMIT) {
      break;
    }
  }
  return _0x4c0fad;
}
function mergeExtractedImageCandidates(..._0x477fdd) {
  const _0x1be6a4 = new Set();
  const _0x2ec633 = [];
  for (const _0x427452 of _0x477fdd) {
    for (const _0x1e71db of filterExtractedImageCandidates(_0x427452)) {
      const _0x1401a8 = normalizeExtractedMediaUrl(_0x1e71db?.url);
      if (!_0x1401a8 || _0x1be6a4.has(_0x1401a8)) {
        continue;
      }
      _0x1be6a4.add(_0x1401a8);
      _0x2ec633.push({
        ..._0x1e71db,
        url: _0x1401a8
      });
      if (_0x2ec633.length >= WEB_PREVIEW_IMAGE_EXTRACTION_LIMIT) {
        return _0x2ec633;
      }
    }
  }
  return _0x2ec633;
}
function mergeExtractedVideoCandidates(..._0x46cf6b) {
  const _0x2a7542 = new Set();
  const _0x5ca295 = [];
  for (const _0x5aea12 of _0x46cf6b) {
    for (const _0x13da42 of filterExtractedVideoCandidates(_0x5aea12)) {
      if (!_0x13da42?.url || _0x2a7542.has(_0x13da42.url)) {
        continue;
      }
      _0x2a7542.add(_0x13da42.url);
      _0x5ca295.push(_0x13da42);
      if (_0x5ca295.length >= WEB_PREVIEW_VIDEO_EXTRACTION_LIMIT) {
        return _0x5ca295;
      }
    }
  }
  return _0x5ca295;
}
function toEntryKey(_0x51395b, _0x4c1955 = "default") {
  return toNodeId(_0x51395b) + "\n" + toTabId(_0x4c1955);
}
function toBrowserProfileId(_0x3f86ee) {
  const _0x28a431 = String(_0x3f86ee || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return _0x28a431 || DEFAULT_WEB_PREVIEW_BROWSER_PROFILE_ID;
}
function toPersistentPartitionId(_0x41b697) {
  return WEB_PREVIEW_PARTITION_PREFIX + "-" + toBrowserProfileId(_0x41b697);
}
function isBlankPopupUrl(_0x35c7db) {
  const _0x379955 = String(_0x35c7db || "").trim().toLowerCase();
  return !_0x379955 || _0x379955 === "about:blank" || _0x379955.startsWith("about:blank#") || _0x379955.startsWith("about:blank?");
}
function isGoogleAccountsUrl(_0x14feac) {
  const _0x1f45d3 = normalizeWebPreviewUrl(_0x14feac);
  if (!_0x1f45d3) {
    return false;
  }
  try {
    const _0x1be008 = new URL(_0x1f45d3).hostname.toLowerCase();
    return _0x1be008 === "accounts.google.com" || _0x1be008.startsWith("accounts.google.");
  } catch {
    return false;
  }
}
function shouldUseNativeAuthPopup(_0x1d10c3) {
  return isBlankPopupUrl(_0x1d10c3) || isGoogleAccountsUrl(_0x1d10c3);
}
function normalizeBounds(_0x1753dd = {}) {
  const _0x1e01be = Math.round(Number(_0x1753dd.x));
  const _0x247c66 = Math.round(Number(_0x1753dd.y));
  const _0x4de485 = Math.round(Number(_0x1753dd.width));
  const _0x16fe8d = Math.round(Number(_0x1753dd.height));
  if (!Number.isFinite(_0x1e01be) || !Number.isFinite(_0x247c66) || !Number.isFinite(_0x4de485) || !Number.isFinite(_0x16fe8d) || _0x4de485 < MIN_VIEW_SIZE || _0x16fe8d < MIN_VIEW_SIZE) {
    return null;
  }
  return {
    x: _0x1e01be,
    y: _0x247c66,
    width: _0x4de485,
    height: _0x16fe8d
  };
}
function normalizeZoomFactor(_0x4be921) {
  const _0x4f0ea3 = Number(_0x4be921);
  if (!Number.isFinite(_0x4f0ea3) || _0x4f0ea3 <= 0) {
    return 1;
  }
  return Math.min(5, Math.max(0.25, _0x4f0ea3));
}
function boundsEqual(_0x244f96, _0x2791f7) {
  return _0x244f96?.x === _0x2791f7?.x && _0x244f96?.y === _0x2791f7?.y && _0x244f96?.width === _0x2791f7?.width && _0x244f96?.height === _0x2791f7?.height;
}
function zoomFactorEqual(_0x468715, _0x3a456e) {
  return Math.abs(Number(_0x468715 || 1) - Number(_0x3a456e || 1)) < 0.001;
}
function getViewsPayload(_0x25bd5c) {
  if (Array.isArray(_0x25bd5c?.views)) {
    return _0x25bd5c.views;
  } else {
    return [];
  }
}
function getNavigationState(_0x4914c5) {
  return {
    canGoBack: Boolean(_0x4914c5?.canGoBack?.()),
    canGoForward: Boolean(_0x4914c5?.canGoForward?.())
  };
}
function createInputBridgeToken() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
function getConsoleMessageFromArgs(_0x5eb6f8 = []) {
  for (const _0x5d8693 of _0x5eb6f8) {
    if (typeof _0x5d8693 === "string") {
      return _0x5d8693;
    }
    if (_0x5d8693 && typeof _0x5d8693.message === "string") {
      return _0x5d8693.message;
    }
  }
  return "";
}
function parseWebPreviewInputBridgeMessage(_0x25d38a = "") {
  const _0x427dd4 = String(_0x25d38a || "");
  if (!_0x427dd4.startsWith(WEB_PREVIEW_INPUT_BRIDGE_MESSAGE_PREFIX)) {
    return null;
  }
  try {
    const _0x1a3cc4 = JSON.parse(_0x427dd4.slice(WEB_PREVIEW_INPUT_BRIDGE_MESSAGE_PREFIX.length));
    if (_0x1a3cc4?.type !== "pan-start-preview" && _0x1a3cc4?.type !== "image-context-menu" && _0x1a3cc4?.type !== "text-context-menu") {
      return null;
    }
    return _0x1a3cc4;
  } catch {
    return null;
  }
}
export function createWebPreviewViewManager({
  WebContentsView: _0x2dfea9,
  BrowserWindow: _0x31e415,
  getMainWindow: _0x17fc37,
  openExternalUrl: _0x236bf9,
  createContextMenu: _0x40288a,
  logDiagnosticEvent: _0x12c6fa,
  resolveDouyinMedia = resolveDouyinCurrentPageMedia,
  setTimeoutFn = globalThis.setTimeout?.bind(globalThis),
  clearTimeoutFn = globalThis.clearTimeout?.bind(globalThis),
  readySnapshotDelayMs = READY_SNAPSHOT_IDLE_DELAY_MS
} = {}) {
  const _0x287c64 = new Map();
  const _0x42ee87 = new Set();
  const _0x136b0f = new Set();
  let _0x1e0a4c = 0;
  function _0x48abda() {
    const _0x1de7fc = typeof _0x17fc37 === "function" ? _0x17fc37() : null;
    if (_0x1de7fc && !_0x1de7fc.isDestroyed?.()) {
      return _0x1de7fc;
    } else {
      return null;
    }
  }
  function _0x2b45da(_0x35dedb, _0x1266e1, _0x6b904c = "") {
    const _0x2bbd9d = _0x48abda();
    if (!_0x2bbd9d?.webContents || _0x2bbd9d.webContents.isDestroyed?.()) {
      return;
    }
    _0x2bbd9d.webContents.send("webPreview:event", {
      nodeId: _0x35dedb,
      ...(_0x6b904c ? {
        tabId: _0x6b904c
      } : {}),
      ..._0x1266e1
    });
  }
  function _0x259598(_0x5c3dec, _0x3d68a4, _0x1af776 = "") {
    _0x2b45da(_0x5c3dec, {
      type: "blocked",
      url: String(_0x3d68a4 || ""),
      message: "浏览器节点仅允许打开 http/https 链接"
    }, _0x1af776);
  }
  function _0x25d154(_0x280275, _0x50ee5b, _0x993a9f = "") {
    _0x2b45da(_0x280275, {
      type: "navigation-state",
      ...getNavigationState(_0x50ee5b)
    }, _0x993a9f);
  }
  function _0x1556d4(_0xd9cd82) {
    let _0x54cc86 = "";
    do {
      _0x1e0a4c += 1;
      _0x54cc86 = "popup-" + Date.now() + "-" + _0x1e0a4c;
    } while (_0x287c64.has(toEntryKey(_0xd9cd82, _0x54cc86)));
    return _0x54cc86;
  }
  function _0x26775d(_0x224b2e) {
    return {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      partition: _0x224b2e
    };
  }
  function _0x4c8cea(_0x4049 = []) {
    if (!Array.isArray(_0x4049)) {
      return "";
    }
    for (const _0x182f21 of _0x4049) {
      const _0x24f559 = normalizeWebPreviewFaviconUrl(_0x182f21);
      if (_0x24f559) {
        return _0x24f559;
      }
    }
    return "";
  }
  function _0x2598d7(_0x50898d) {
    if (!_0x50898d?.readySnapshotTimer) {
      return;
    }
    clearTimeoutFn?.(_0x50898d.readySnapshotTimer);
    _0x50898d.readySnapshotTimer = null;
  }
  function _0x3c7e44(_0x1db1b4, _0xf49082, _0x1e3119, _0x45f917, _0x2a5392 = "", _0x30a93d = _0xf49082?.snapshotEpoch || 0) {
    const _0x149b23 = _0xf49082?.view?.webContents;
    if (!_0x149b23 || _0x149b23.isDestroyed?.()) {
      return false;
    }
    if (typeof _0x149b23.capturePage !== "function") {
      return false;
    }
    const _0x54b8b3 = _0x2a5392 || _0xf49082?.url || _0xf49082?.requestedUrl || "";
    let _0x42d1fb = null;
    try {
      _0x42d1fb = _0x149b23.capturePage();
    } catch (_0x26e157) {
      _0x12c6fa?.({
        type: "web_preview.snapshot_failed",
        level: "warn",
        source: "main",
        message: "Web preview snapshot capture failed",
        error: _0x26e157,
        context: {
          nodeId: _0x1db1b4,
          freezeToken: _0x1e3119
        }
      });
      return false;
    }
    Promise.resolve(_0x42d1fb).then(_0x2d68e5 => {
      const _0x2ace9e = _0x2d68e5?.toDataURL?.();
      if (!_0x2ace9e) {
        return;
      }
      if (_0xf49082 && _0xf49082.snapshotEpoch !== _0x30a93d) {
        return;
      }
      if (_0x54b8b3 && _0xf49082?.requestedUrl && _0xf49082.requestedUrl !== _0x54b8b3) {
        return;
      }
      _0xf49082.hasSnapshot = true;
      _0xf49082.snapshotUrl = _0x54b8b3;
      _0xf49082.snapshotFreezeToken = String(_0x1e3119 || "");
      _0x2b45da(_0x1db1b4, {
        type: "snapshot",
        dataUrl: _0x2ace9e,
        freezeToken: _0x1e3119,
        width: _0xf49082.bounds?.width || 0,
        height: _0xf49082.bounds?.height || 0,
        zoomFactor: _0xf49082.zoomFactor || 1
      }, _0xf49082.tabId);
    }).catch(_0x55eb5d => {
      _0x12c6fa?.({
        type: "web_preview.snapshot_failed",
        level: "warn",
        source: "main",
        message: "Web preview snapshot capture failed",
        error: _0x55eb5d,
        context: {
          nodeId: _0x1db1b4,
          freezeToken: _0x1e3119
        }
      });
    }).finally(() => {
      _0x45f917?.();
    });
    return true;
  }
  function _0x1a4d7c(_0x516416, _0x138d9e, _0x4bd5e8 = _0x138d9e?.snapshotEpoch || 0) {
    const _0x10037a = _0x138d9e?.url || _0x138d9e?.requestedUrl || "";
    if (!_0x138d9e?.bounds || !_0x10037a || _0x138d9e.readySnapshotPending) {
      return false;
    }
    if (_0x138d9e.hasSnapshot && _0x138d9e.snapshotUrl === _0x10037a) {
      return false;
    }
    _0x138d9e.readySnapshotPending = true;
    const _0x1a53ef = _0x3c7e44(_0x516416, _0x138d9e, "ready", () => {
      _0x138d9e.readySnapshotPending = false;
    }, _0x10037a, _0x4bd5e8);
    if (!_0x1a53ef) {
      _0x138d9e.readySnapshotPending = false;
    }
    return _0x1a53ef;
  }
  function _0x19d3e9(_0xbbe30f, _0x1897a1) {
    const _0x520646 = _0x1897a1?.url || _0x1897a1?.requestedUrl || "";
    if (!_0x1897a1?.loaded || !_0x1897a1.bounds || !_0x520646 || _0x1897a1.visible !== true || _0x1897a1.freezeToken || _0x1897a1.readySnapshotPending || _0x1897a1.readySnapshotTimer) {
      return false;
    }
    if (_0x1897a1.hasSnapshot && _0x1897a1.snapshotUrl === _0x520646) {
      return false;
    }
    if (typeof setTimeoutFn !== "function") {
      return _0x1a4d7c(_0xbbe30f, _0x1897a1);
    }
    const _0x5439b0 = _0x1897a1.snapshotEpoch;
    const _0x27baf6 = Math.max(0, Number(readySnapshotDelayMs) || 0);
    _0x1897a1.readySnapshotTimer = setTimeoutFn(() => {
      _0x1897a1.readySnapshotTimer = null;
      const _0x342073 = _0x287c64.get(toEntryKey(_0xbbe30f, _0x1897a1.tabId));
      const _0x3d6d08 = _0x342073?.url || _0x342073?.requestedUrl || "";
      if (_0x342073 !== _0x1897a1 || _0x342073.snapshotEpoch !== _0x5439b0 || _0x3d6d08 !== _0x520646 || _0x342073.loaded !== true || _0x342073.visible !== true) {
        return;
      }
      if (_0x342073.freezeToken) {
        _0x19d3e9(_0xbbe30f, _0x342073);
        return;
      }
      _0x1a4d7c(_0xbbe30f, _0x342073, _0x5439b0);
    }, _0x27baf6);
    return true;
  }
  function _0x1aa9ae(_0x25dac6, _0x5bb978, _0x276de9 = "", _0x5a9d0e = "") {
    if (typeof _0x5bb978?.executeJavaScript !== "function") {
      return;
    }
    _0x5bb978.executeJavaScript(buildWebPreviewDragBridgeScript({
      nodeId: _0x25dac6,
      tabId: _0x276de9,
      inputBridgeToken: _0x5a9d0e
    }), true).catch(_0x8fc08e => {
      _0x12c6fa?.({
        type: "web_preview.drag_bridge_failed",
        level: "warn",
        source: "main",
        message: "Web preview drag bridge injection failed",
        error: _0x8fc08e,
        context: {
          nodeId: _0x25dac6,
          tabId: _0x276de9
        }
      });
    });
  }
  function _0x5a0043(_0x39a50f, _0x2fc8eb, _0x181dbf, _0x49a3f6 = {}, _0x44da93 = WEB_PREVIEW_TEXT_ACTION_PROMPT) {
    const _0x368e6e = String(_0x49a3f6?.selectionText || "").trim();
    if (!_0x368e6e) {
      return false;
    }
    const _0x50c936 = _0x287c64.get(toEntryKey(_0x39a50f, _0x2fc8eb));
    const _0x535634 = normalizeWebPreviewUrl(_0x49a3f6?.pageURL) || normalizeWebPreviewUrl(_0x50c936?.url) || normalizeWebPreviewUrl(_0x50c936?.requestedUrl) || "";
    const _0x2d9667 = String(_0x181dbf?.getTitle?.() || "").trim();
    _0x2b45da(_0x39a50f, {
      type: _0x44da93,
      text: _0x368e6e.slice(0, WEB_PREVIEW_SELECTED_TEXT_LIMIT),
      pageUrl: _0x535634,
      webSourceTitle: _0x2d9667.slice(0, 160),
      contextX: Math.max(0, Math.round(Number(_0x49a3f6?.x || 0) || 0)),
      contextY: Math.max(0, Math.round(Number(_0x49a3f6?.y || 0) || 0))
    }, _0x2fc8eb);
    return true;
  }
  function _0x1483ac(_0x232580, _0x2a0405 = {}) {
    const _0x1db082 = String(_0x2a0405?.selectionText || "").trim();
    if (!_0x1db082) {
      return false;
    }
    try {
      if (typeof _0x232580?.copy === "function") {
        _0x232580.copy();
        return true;
      }
    } catch {}
    return false;
  }
  function _0x10e26a(_0x4093b9) {
    return Math.max(0, Math.round(Number(_0x4093b9 || 0) || 0));
  }
  function _0x351c71(_0x33785b = {}, _0x13a0ba = null) {
    const _0x36c33c = normalizeWebPreviewUrl(_0x33785b?.pageUrl) || normalizeWebPreviewUrl(_0x33785b?.sourceUrl) || normalizeWebPreviewUrl(_0x13a0ba?.url) || normalizeWebPreviewUrl(_0x13a0ba?.requestedUrl) || "";
    return {
      mediaType: "image",
      srcURL: normalizeWebPreviewUrl(_0x33785b?.url) || "",
      titleText: String(_0x33785b?.title || _0x33785b?.alt || "").trim().slice(0, 160),
      pageURL: _0x36c33c,
      frameURL: _0x36c33c,
      x: _0x10e26a(_0x33785b?.contextX ?? _0x33785b?.clientX),
      y: _0x10e26a(_0x33785b?.contextY ?? _0x33785b?.clientY)
    };
  }
  function _0x33f8dd(_0x9f70f0 = {}, _0x25d3c2 = null) {
    const _0x3668cd = normalizeWebPreviewUrl(_0x9f70f0?.pageUrl) || normalizeWebPreviewUrl(_0x9f70f0?.sourceUrl) || normalizeWebPreviewUrl(_0x25d3c2?.url) || normalizeWebPreviewUrl(_0x25d3c2?.requestedUrl) || "";
    return {
      selectionText: String(_0x9f70f0?.text || "").trim().slice(0, WEB_PREVIEW_SELECTED_TEXT_LIMIT),
      pageURL: _0x3668cd,
      frameURL: _0x3668cd,
      x: _0x10e26a(_0x9f70f0?.contextX ?? _0x9f70f0?.clientX),
      y: _0x10e26a(_0x9f70f0?.contextY ?? _0x9f70f0?.clientY)
    };
  }
  function _0x13aab8(_0x4e6d0f, _0x2d8611 = {}) {
    if (!_0x4e6d0f) {
      return;
    }
    _0x4e6d0f.lastBridgeImageContextMenuAt = Date.now();
    _0x4e6d0f.lastBridgeImageContextMenuX = _0x10e26a(_0x2d8611?.x);
    _0x4e6d0f.lastBridgeImageContextMenuY = _0x10e26a(_0x2d8611?.y);
  }
  function _0x2b51d8(_0x565d23, _0x3c079d = {}) {
    const _0x45b24f = Number(_0x565d23?.lastBridgeImageContextMenuAt || 0);
    if (!_0x45b24f || Date.now() - _0x45b24f > WEB_PREVIEW_CONTEXT_MENU_BRIDGE_DEDUPE_MS) {
      return false;
    }
    const _0x5155de = _0x10e26a(_0x3c079d?.x);
    const _0x2eed38 = _0x10e26a(_0x3c079d?.y);
    return Math.abs(_0x5155de - _0x10e26a(_0x565d23?.lastBridgeImageContextMenuX)) <= 2 && Math.abs(_0x2eed38 - _0x10e26a(_0x565d23?.lastBridgeImageContextMenuY)) <= 2;
  }
  function _0x37d5c8(_0x2072d3, _0xdc706d, _0x48fa0b, _0xa78e46 = {}, _0x19a45f = null) {
    const _0x7a50b7 = String(_0xa78e46?.mediaType || "").toLowerCase() === "image" || Boolean(_0x19a45f?.url);
    if (!_0x7a50b7) {
      return null;
    }
    const _0x124f8c = normalizeWebPreviewUrl(_0x19a45f?.url || _0xa78e46?.srcURL);
    if (!_0x124f8c) {
      return null;
    }
    const _0xb5caf7 = _0x287c64.get(toEntryKey(_0x2072d3, _0xdc706d));
    const _0x22a89f = normalizeWebPreviewUrl(_0x19a45f?.pageUrl) || normalizeWebPreviewUrl(_0xa78e46?.pageURL) || normalizeWebPreviewUrl(_0xa78e46?.frameURL) || normalizeWebPreviewUrl(_0xb5caf7?.url) || normalizeWebPreviewUrl(_0xb5caf7?.requestedUrl) || "";
    const _0x8cf6c9 = String(_0x19a45f?.pageTitle || _0x48fa0b?.getTitle?.() || "").trim().slice(0, 160);
    const _0x27b9ed = String(_0x19a45f?.title || _0x19a45f?.alt || _0xa78e46?.titleText || _0x8cf6c9 || "网页图片").trim().slice(0, 160);
    const _0x1fd987 = {
      kind: "image",
      url: _0x124f8c,
      title: _0x27b9ed,
      pageUrl: _0x22a89f,
      pageTitle: _0x8cf6c9,
      nodeId: _0x2072d3,
      tabId: _0xdc706d,
      contextX: Math.max(0, Math.round(Number(_0xa78e46?.x || 0) || 0)),
      contextY: Math.max(0, Math.round(Number(_0xa78e46?.y || 0) || 0))
    };
    const _0x475a1c = Math.max(0, Math.round(Number(_0x19a45f?.width || 0) || 0));
    const _0x189ee3 = Math.max(0, Math.round(Number(_0x19a45f?.height || 0) || 0));
    if (_0x475a1c) {
      _0x1fd987.width = _0x475a1c;
    }
    if (_0x189ee3) {
      _0x1fd987.height = _0x189ee3;
    }
    return _0x1fd987;
  }
  async function _0x58f930(_0x48857b, _0xcecf43, _0x3755b8, _0x5b9eac = {}) {
    if (typeof _0x3755b8?.executeJavaScript !== "function") {
      return null;
    }
    try {
      const _0x168f7a = await _0x3755b8.executeJavaScript(buildWebPreviewContextImageProbeScript({
        nodeId: _0x48857b,
        tabId: _0xcecf43,
        x: _0x5b9eac?.x,
        y: _0x5b9eac?.y
      }), true);
      const _0x474707 = _0x168f7a?.image && typeof _0x168f7a.image === "object" ? _0x168f7a.image : _0x168f7a;
      return _0x37d5c8(_0x48857b, _0xcecf43, _0x3755b8, _0x5b9eac, _0x474707);
    } catch (_0x2d80e7) {
      _0x12c6fa?.({
        type: "web_preview.context_image_probe_failed",
        level: "warn",
        source: "main",
        message: "Web preview context image probe failed",
        error: _0x2d80e7,
        context: {
          nodeId: _0x48857b,
          tabId: _0xcecf43
        }
      });
      return null;
    }
  }
  async function _0x443024(_0x50376c, _0x2a7e6a, _0x27a25a, _0x565f12 = {}) {
    if (String(_0x565f12?.mediaType || "").toLowerCase() !== "image") {
      return null;
    }
    const _0x44779c = await _0x58f930(_0x50376c, _0x2a7e6a, _0x27a25a, _0x565f12);
    return _0x44779c || _0x37d5c8(_0x50376c, _0x2a7e6a, _0x27a25a, _0x565f12);
  }
  function _0x3e7e29(_0x27a4e8, _0x2bb521, _0x67a248, _0x3580b0 = "send-image-to-canvas") {
    if (!_0x67a248) {
      return false;
    }
    _0x2b45da(_0x27a4e8, {
      ..._0x67a248,
      type: _0x3580b0
    }, _0x2bb521);
    return true;
  }
  async function _0x39b9ad(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38 = {}) {
    if (typeof _0x40288a !== "function") {
      return;
    }
    const _0x365a27 = [];
    const _0x12196c = await _0x443024(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38);
    if (_0x12196c) {
      _0x365a27.push({
        label: "加入到画布",
        click: () => _0x3e7e29(_0x50cf8e, _0x1eb4c9, _0x12196c, "send-image-to-canvas")
      }, {
        label: "反推提示词-创建",
        click: () => _0x3e7e29(_0x50cf8e, _0x1eb4c9, _0x12196c, "reverse-image-prompt")
      }, {
        label: "反推提示词-生成",
        click: () => _0x3e7e29(_0x50cf8e, _0x1eb4c9, _0x12196c, "reverse-image-prompt-generate")
      });
    }
    const _0x31265a = String(_0x1a6a38?.selectionText || "").trim();
    if (_0x31265a) {
      if (_0x365a27.length) {
        _0x365a27.push({
          type: "separator"
        });
      }
      _0x365a27.push({
        label: "复制文本",
        click: () => _0x1483ac(_0x5495f1, _0x1a6a38)
      }, {
        label: "发送到文本节点",
        submenu: [{
          label: "源节点",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_SOURCE)
        }, {
          label: "生成文本",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_PROMPT)
        }]
      }, {
        label: "发送到图像节点",
        submenu: [{
          label: "创建",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_IMAGE_PROMPT)
        }, {
          label: "生成",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_IMAGE_PROMPT_GENERATE)
        }]
      }, {
        label: "发送到视频节点",
        submenu: [{
          label: "创建",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_VIDEO_PROMPT)
        }, {
          label: "生成",
          click: () => _0x5a0043(_0x50cf8e, _0x1eb4c9, _0x5495f1, _0x1a6a38, WEB_PREVIEW_TEXT_ACTION_VIDEO_PROMPT_GENERATE)
        }]
      });
    }
    if (!_0x365a27.length) {
      return;
    }
    const _0x162378 = _0x40288a(_0x365a27);
    _0x162378?.popup?.({
      window: _0x48abda()
    });
  }
  function _0x5bf56f(_0x321c10, _0x2beae3, _0xd756ad, _0x362010) {
    if (!_0xd756ad?.isPopup || _0xd756ad.popupOpened || !_0x362010) {
      return false;
    }
    _0xd756ad.popupOpened = true;
    _0xd756ad.pendingPopup = false;
    _0xd756ad.url = _0x362010;
    _0xd756ad.requestedUrl = _0x362010;
    _0x2b45da(_0x321c10, {
      type: "open-popup",
      url: _0x362010,
      popupTabId: _0x2beae3
    }, _0xd756ad.openerTabId || "");
    return true;
  }
  function _0x293491(_0x3fa23c, _0xffdac9, _0x3fb59b) {
    if (!_0x3fb59b?.isPopup || _0x3fb59b.popupOpened) {
      return false;
    }
    _0x3fb59b.popupOpened = true;
    _0x3fb59b.pendingPopup = true;
    _0x3fb59b.url = "";
    _0x3fb59b.requestedUrl = "";
    _0x2b45da(_0x3fa23c, {
      type: "open-popup",
      url: "",
      popupTabId: _0xffdac9,
      pendingPopup: true
    }, _0x3fb59b.openerTabId || "");
    return true;
  }
  function _0x4c4fb6(_0x11cad1) {
    const _0x4fc440 = _0x48abda();
    const _0x3809af = {
      parent: _0x4fc440 || undefined,
      modal: false,
      show: true,
      width: WEB_PREVIEW_AUTH_POPUP_WIDTH,
      height: WEB_PREVIEW_AUTH_POPUP_HEIGHT,
      minWidth: WEB_PREVIEW_AUTH_POPUP_MIN_WIDTH,
      minHeight: WEB_PREVIEW_AUTH_POPUP_MIN_HEIGHT,
      title: "Login",
      autoHideMenuBar: true,
      webPreferences: _0x26775d(_0x11cad1)
    };
    const _0x173719 = _0x4fc440?.getBounds?.();
    if (_0x173719 && Number.isFinite(_0x173719.x) && Number.isFinite(_0x173719.y) && Number.isFinite(_0x173719.width) && Number.isFinite(_0x173719.height) && _0x173719.width > WEB_PREVIEW_AUTH_POPUP_MIN_WIDTH && _0x173719.height > WEB_PREVIEW_AUTH_POPUP_MIN_HEIGHT) {
      const _0x111ea8 = Math.min(WEB_PREVIEW_AUTH_POPUP_WIDTH, Math.max(WEB_PREVIEW_AUTH_POPUP_MIN_WIDTH, _0x173719.width - 48));
      const _0x3f58cc = Math.min(WEB_PREVIEW_AUTH_POPUP_HEIGHT, Math.max(WEB_PREVIEW_AUTH_POPUP_MIN_HEIGHT, _0x173719.height - 48));
      _0x3809af.width = _0x111ea8;
      _0x3809af.height = _0x3f58cc;
      _0x3809af.x = Math.round(_0x173719.x + (_0x173719.width - _0x111ea8) / 2);
      _0x3809af.y = Math.round(_0x173719.y + (_0x173719.height - _0x3f58cc) / 2);
    }
    return _0x3809af;
  }
  function _0xf95182(_0x3beda1 = () => true) {
    for (const _0x48ef5a of [..._0x136b0f]) {
      if (_0x3beda1(_0x48ef5a)) {
        _0x136b0f.delete(_0x48ef5a);
      }
    }
    for (const _0x17c785 of [..._0x42ee87]) {
      if (!_0x3beda1(_0x17c785)) {
        continue;
      }
      _0x42ee87.delete(_0x17c785);
      try {
        if (_0x17c785.popupWindow?.isDestroyed?.() !== true) {
          _0x17c785.popupWindow?.close?.();
        }
      } catch {}
    }
  }
  function _0x201fe9() {
    const _0x40f05b = Date.now();
    for (const _0x4e848d of [..._0x136b0f]) {
      if (_0x4e848d.expiresAt <= _0x40f05b) {
        _0x136b0f.delete(_0x4e848d);
      }
    }
  }
  function _0x334c66({
    nodeId: _0x22beb7,
    tabId: _0x2a8e6b,
    partition: _0x4f60be
  }) {
    _0x201fe9();
    const _0x411a4d = {
      nodeId: _0x22beb7,
      tabId: _0x2a8e6b,
      partition: _0x4f60be,
      expiresAt: Date.now() + WEB_PREVIEW_AUTH_POPUP_REQUEST_TTL_MS
    };
    _0x136b0f.add(_0x411a4d);
    return _0x411a4d;
  }
  function _0x5076c2({
    nodeId: _0x298814,
    tabId: _0x55ecd5,
    url: _0x531e1b
  }) {
    _0x201fe9();
    let _0x258b24 = null;
    for (const _0x3f993b of _0x136b0f) {
      if (_0x3f993b.nodeId !== _0x298814 || _0x3f993b.tabId !== _0x55ecd5) {
        continue;
      }
      _0x258b24 = _0x3f993b;
      if (shouldUseNativeAuthPopup(_0x531e1b)) {
        break;
      }
    }
    if (_0x258b24) {
      _0x136b0f.delete(_0x258b24);
    }
    return _0x258b24;
  }
  function _0x163669({
    nodeId: _0x4290dc,
    tabId: _0x43752a,
    partition: _0x3bf885,
    webContents: _0x565d67
  }) {
    _0x565d67.setWindowOpenHandler?.(({
      url: _0x5cc80b
    } = {}) => {
      const _0x56f132 = normalizeWebPreviewUrl(_0x5cc80b);
      if (!_0x56f132 && !isBlankPopupUrl(_0x5cc80b)) {
        _0x259598(_0x4290dc, _0x5cc80b, _0x43752a);
        return {
          action: "deny"
        };
      }
      return {
        action: "allow",
        outlivesOpener: true,
        overrideBrowserWindowOptions: {
          webPreferences: _0x26775d(_0x3bf885)
        }
      };
    });
    const _0x4f41a4 = (_0x459ecb, _0x1987ed) => {
      if (isBlankPopupUrl(_0x1987ed) || normalizeWebPreviewUrl(_0x1987ed)) {
        return;
      }
      _0x459ecb?.preventDefault?.();
      _0x259598(_0x4290dc, _0x1987ed, _0x43752a);
    };
    const _0x3976f6 = (_0x1a34d1, _0x3a661a, ..._0x9a06d0) => {
      const _0x2d394d = _0x9a06d0.some(_0x2f1f0e => _0x2f1f0e === true);
      if (!_0x2d394d) {
        return;
      }
      _0x4f41a4(_0x1a34d1, _0x3a661a);
    };
    _0x565d67.on?.("will-navigate", _0x4f41a4);
    _0x565d67.on?.("will-frame-navigate", _0x3976f6);
    _0x565d67.on?.("did-fail-load", (_0x1a4662, _0x2ea612, _0x17dce4, _0x17f979) => {
      _0x2b45da(_0x4290dc, {
        type: "failed",
        url: String(_0x17f979 || ""),
        errorCode: _0x2ea612,
        message: String(_0x17dce4 || "Login popup load failed")
      }, _0x43752a);
    });
    const _0xdb6f22 = _0x565d67.session;
    _0xdb6f22?.setPermissionRequestHandler?.((_0x33f8f5, _0x55c284, _0x532d7b) => {
      _0x532d7b(false);
    });
    _0xdb6f22?.on?.("will-download", _0x33d6d8 => {
      _0x33d6d8?.preventDefault?.();
    });
  }
  function _0x276a21({
    nodeId: _0x377b45,
    tabId: _0x5231cd,
    partition: _0x58cb54,
    popupWindow: _0x515b98
  }) {
    const _0xd64a93 = _0x515b98?.webContents;
    if (!_0x515b98 || !_0xd64a93) {
      return false;
    }
    const _0x232aa8 = {
      nodeId: _0x377b45,
      tabId: _0x5231cd,
      popupWindow: _0x515b98
    };
    _0x42ee87.add(_0x232aa8);
    const _0x2424c0 = () => _0x42ee87.delete(_0x232aa8);
    _0x515b98.on?.("closed", _0x2424c0);
    _0xd64a93.on?.("destroyed", _0x2424c0);
    _0x163669({
      nodeId: _0x377b45,
      tabId: _0x5231cd,
      partition: _0x58cb54,
      webContents: _0xd64a93
    });
    return true;
  }
  function _0x229a90(_0xd1e198, _0x550b9f, _0x1167bc, _0x5a3578 = "") {
    _0x1167bc.setWindowOpenHandler?.(({
      url: _0x1fde63
    } = {}) => {
      const _0x24dd18 = normalizeWebPreviewUrl(_0x1fde63);
      const _0x155ae9 = isBlankPopupUrl(_0x1fde63);
      if (!_0x24dd18 && !_0x155ae9) {
        _0x259598(_0xd1e198, _0x1fde63, _0x550b9f);
        return {
          action: "deny"
        };
      }
      const _0x3cf50a = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      const _0x29e4d4 = _0x1556d4(_0xd1e198);
      const _0x2b5300 = _0x3cf50a?.browserProfileId || DEFAULT_WEB_PREVIEW_BROWSER_PROFILE_ID;
      const _0x512c53 = _0x3cf50a?.partition || toPersistentPartitionId(_0x2b5300);
      if (shouldUseNativeAuthPopup(_0x1fde63) && typeof _0x31e415 === "function") {
        _0x334c66({
          nodeId: _0xd1e198,
          tabId: _0x550b9f,
          partition: _0x512c53
        });
        return {
          action: "allow",
          outlivesOpener: true,
          overrideBrowserWindowOptions: _0x4c4fb6(_0x512c53)
        };
      }
      if (typeof _0x2dfea9 !== "function") {
        if (_0x24dd18) {
          _0x2b45da(_0xd1e198, {
            type: "open-popup",
            url: _0x24dd18
          }, _0x550b9f);
        }
        return {
          action: "deny"
        };
      }
      return {
        action: "allow",
        outlivesOpener: true,
        overrideBrowserWindowOptions: {
          webPreferences: _0x26775d(_0x512c53)
        },
        createWindow: () => {
          const _0x288105 = _0x4248b8({
            nodeId: _0xd1e198,
            tabId: _0x29e4d4,
            browserProfileId: _0x2b5300,
            partition: _0x512c53,
            url: _0x24dd18 || "",
            openerTabId: _0x550b9f
          });
          if (_0x24dd18) {
            _0x5bf56f(_0xd1e198, _0x29e4d4, _0x288105, _0x24dd18);
          } else {
            _0x293491(_0xd1e198, _0x29e4d4, _0x288105);
          }
          return _0x288105.view.webContents;
        }
      };
    });
    _0x1167bc.on?.("did-create-window", (_0xae70f2, _0x3d2599 = {}) => {
      const _0x41cb0a = _0x5076c2({
        nodeId: _0xd1e198,
        tabId: _0x550b9f,
        url: _0x3d2599?.url
      });
      if (!_0x41cb0a) {
        return;
      }
      _0x276a21({
        nodeId: _0xd1e198,
        tabId: _0x550b9f,
        partition: _0x41cb0a.partition,
        popupWindow: _0xae70f2
      });
    });
    const _0x1b557a = (_0x357b9f, _0x42a571) => {
      const _0x3ab6f8 = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (_0x3ab6f8?.isPopup && isBlankPopupUrl(_0x42a571) && !_0x3ab6f8.requestedUrl) {
        return;
      }
      if (normalizeWebPreviewUrl(_0x42a571)) {
        return;
      }
      _0x357b9f?.preventDefault?.();
      _0x259598(_0xd1e198, _0x42a571, _0x550b9f);
    };
    const _0x1e85ad = (_0xc6b055, _0x5942f6, ..._0x5a0d9c) => {
      const _0x37b3d4 = _0x5a0d9c.some(_0x18da7e => _0x18da7e === true);
      if (!_0x37b3d4) {
        return;
      }
      _0x1b557a(_0xc6b055, _0x5942f6);
    };
    _0x1167bc.on?.("will-navigate", _0x1b557a);
    _0x1167bc.on?.("will-frame-navigate", _0x1e85ad);
    _0x1167bc.on?.("dom-ready", () => _0x1aa9ae(_0xd1e198, _0x1167bc, _0x550b9f, _0x5a3578));
    _0x1167bc.on?.("did-start-loading", () => {
      const _0x2f0740 = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      let _0xaeb55f = "";
      let _0x18202c = false;
      if (_0x2f0740) {
        const _0x2aef41 = _0x2f0740.url || _0x2f0740.requestedUrl || "";
        _0xaeb55f = _0x2aef41;
        const _0x322ceb = _0x2f0740.holdSnapshotOnNextLoadStart === true && _0x2f0740.hasSnapshot === true && _0x2f0740.snapshotUrl && _0x2f0740.snapshotUrl === _0x2aef41;
        _0x18202c = Boolean(_0x322ceb);
        _0x2598d7(_0x2f0740);
        _0x2f0740.snapshotEpoch += 1;
        _0x2f0740.loaded = false;
        if (_0x18202c) {
          _0x2f0740.snapshotStaleAfterLoad = true;
        } else {
          _0x2f0740.hasSnapshot = false;
          _0x2f0740.snapshotUrl = "";
          _0x2f0740.snapshotFreezeToken = "";
          _0x2f0740.snapshotStaleAfterLoad = false;
        }
        _0x2f0740.readySnapshotPending = false;
        _0x2f0740.holdSnapshotOnNextLoadStart = false;
      }
      _0x2b45da(_0xd1e198, {
        type: "loading",
        url: _0xaeb55f,
        holdSnapshot: _0x18202c
      }, _0x550b9f);
    });
    _0x1167bc.on?.("did-stop-loading", () => {
      _0x1aa9ae(_0xd1e198, _0x1167bc, _0x550b9f, _0x5a3578);
      _0x2b45da(_0xd1e198, {
        type: "loaded"
      }, _0x550b9f);
      _0x25d154(_0xd1e198, _0x1167bc, _0x550b9f);
      const _0x1ff7a6 = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (_0x1ff7a6) {
        _0x1ff7a6.loaded = true;
        if (_0x1ff7a6.snapshotStaleAfterLoad) {
          _0x1ff7a6.hasSnapshot = false;
          _0x1ff7a6.snapshotUrl = "";
          _0x1ff7a6.snapshotFreezeToken = "";
          _0x1ff7a6.snapshotStaleAfterLoad = false;
        }
        _0x19d3e9(_0xd1e198, _0x1ff7a6);
      }
    });
    _0x1167bc.on?.("did-fail-load", (_0x57026d, _0x142d95, _0x559c68, _0x159edf) => {
      _0x2b45da(_0xd1e198, {
        type: "failed",
        url: String(_0x159edf || ""),
        errorCode: _0x142d95,
        message: String(_0x559c68 || "网页加载失败")
      }, _0x550b9f);
    });
    _0x1167bc.on?.("did-navigate", (_0x2cb515, _0x5ab297) => {
      const _0x54a06b = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (_0x54a06b?.isPopup && isBlankPopupUrl(_0x5ab297) && !_0x54a06b.requestedUrl) {
        return;
      }
      const _0x1d95a5 = normalizeWebPreviewUrl(_0x5ab297) || String(_0x5ab297 || "");
      const _0x1ecfd9 = normalizeWebPreviewUrl(_0x1d95a5);
      if (_0x54a06b && _0x1ecfd9) {
        if (_0x5bf56f(_0xd1e198, _0x550b9f, _0x54a06b, _0x1ecfd9)) {
          return;
        }
        const _0x26cbb3 = _0x54a06b.pendingPopup === true;
        _0x54a06b.url = _0x1ecfd9;
        if (_0x26cbb3) {
          _0x54a06b.requestedUrl = _0x1ecfd9;
        }
        _0x54a06b.loadIssuedUrl = _0x1ecfd9;
        _0x54a06b.pendingPopup = false;
      }
      _0x2b45da(_0xd1e198, {
        type: "navigated",
        url: _0x1d95a5
      }, _0x550b9f);
      _0x25d154(_0xd1e198, _0x1167bc, _0x550b9f);
    });
    _0x1167bc.on?.("did-navigate-in-page", (_0x227d43, _0xb410d6, _0x6fb76b) => {
      if (_0x6fb76b === false) {
        return;
      }
      const _0x2f1ced = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (_0x2f1ced?.isPopup && isBlankPopupUrl(_0xb410d6) && !_0x2f1ced.requestedUrl) {
        return;
      }
      const _0x7fc664 = normalizeWebPreviewUrl(_0xb410d6) || String(_0xb410d6 || "");
      const _0x3c2b7e = normalizeWebPreviewUrl(_0x7fc664);
      if (_0x2f1ced && _0x3c2b7e) {
        if (_0x5bf56f(_0xd1e198, _0x550b9f, _0x2f1ced, _0x3c2b7e)) {
          return;
        }
        const _0x53405f = _0x2f1ced.pendingPopup === true;
        _0x2f1ced.url = _0x3c2b7e;
        if (_0x53405f) {
          _0x2f1ced.requestedUrl = _0x3c2b7e;
        }
        _0x2f1ced.loadIssuedUrl = _0x3c2b7e;
        _0x2f1ced.pendingPopup = false;
      }
      _0x2b45da(_0xd1e198, {
        type: "navigated",
        url: _0x7fc664
      }, _0x550b9f);
      _0x25d154(_0xd1e198, _0x1167bc, _0x550b9f);
    });
    _0x1167bc.on?.("page-favicon-updated", (_0x379525, _0x3c50e0) => {
      const _0x10a4fd = _0x4c8cea(_0x3c50e0);
      if (!_0x10a4fd) {
        return;
      }
      _0x2b45da(_0xd1e198, {
        type: "favicon",
        faviconUrl: _0x10a4fd
      }, _0x550b9f);
    });
    _0x1167bc.on?.("context-menu", (_0xb6d0b6, _0x541d91) => {
      const _0x2b0e47 = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (_0x2b51d8(_0x2b0e47, _0x541d91)) {
        return;
      }
      _0x39b9ad(_0xd1e198, _0x550b9f, _0x1167bc, _0x541d91).catch(_0xdac155 => {
        _0x12c6fa?.({
          type: "web_preview.context_menu_failed",
          level: "warn",
          source: "main",
          message: "Web preview context menu failed",
          error: _0xdac155,
          context: {
            nodeId: _0xd1e198,
            tabId: _0x550b9f
          }
        });
      });
    });
    _0x1167bc.on?.("console-message", (..._0x369de6) => {
      const _0x5110e2 = parseWebPreviewInputBridgeMessage(getConsoleMessageFromArgs(_0x369de6));
      if (!_0x5110e2) {
        return;
      }
      const _0x423b66 = _0x287c64.get(toEntryKey(_0xd1e198, _0x550b9f));
      if (!_0x423b66 || _0x5110e2.token !== _0x423b66.inputBridgeToken) {
        return;
      }
      if (_0x5110e2.type === "text-context-menu") {
        const _0x5529de = _0x33f8dd(_0x5110e2, _0x423b66);
        _0x13aab8(_0x423b66, _0x5529de);
        _0x39b9ad(_0xd1e198, _0x550b9f, _0x1167bc, _0x5529de).catch(_0x15f73b => {
          _0x12c6fa?.({
            type: "web_preview.context_menu_failed",
            level: "warn",
            source: "main",
            message: "Web preview context menu failed",
            error: _0x15f73b,
            context: {
              nodeId: _0xd1e198,
              tabId: _0x550b9f,
              source: "bridge"
            }
          });
        });
        return;
      }
      if (_0x5110e2.type === "image-context-menu") {
        const _0x251574 = _0x351c71(_0x5110e2, _0x423b66);
        _0x13aab8(_0x423b66, _0x251574);
        _0x39b9ad(_0xd1e198, _0x550b9f, _0x1167bc, _0x251574).catch(_0xd1e548 => {
          _0x12c6fa?.({
            type: "web_preview.context_menu_failed",
            level: "warn",
            source: "main",
            message: "Web preview context menu failed",
            error: _0xd1e548,
            context: {
              nodeId: _0xd1e198,
              tabId: _0x550b9f,
              source: "bridge"
            }
          });
        });
        return;
      }
      const _0x4fb55b = Number(_0x5110e2.button);
      const _0x46726b = _0x4fb55b === 1;
      const _0x1cb2ee = _0x4fb55b === 0 && (_0x5110e2.spaceHeld === true || _0x423b66.canvasSpaceHeld === true);
      if (!_0x46726b && !_0x1cb2ee) {
        return;
      }
      _0x2b45da(_0xd1e198, {
        type: "pan-start-preview",
        source: "web-contents-view",
        button: _0x4fb55b,
        spaceHeld: _0x1cb2ee,
        clientX: Math.max(0, Math.round(Number(_0x5110e2.clientX || 0) || 0)),
        clientY: Math.max(0, Math.round(Number(_0x5110e2.clientY || 0) || 0))
      }, _0x550b9f);
    });
    _0x1167bc.on?.("destroyed", () => {
      const _0x3ff90b = toEntryKey(_0xd1e198, _0x550b9f);
      const _0x3d890f = _0x287c64.get(_0x3ff90b);
      if (!_0x3d890f || _0x3d890f.disposing) {
        return;
      }
      const _0x3aeadb = _0x48abda();
      try {
        _0x3aeadb?.contentView?.removeChildView?.(_0x3d890f.view);
      } catch {}
      _0x2598d7(_0x3d890f);
      _0x287c64.delete(_0x3ff90b);
      if (_0x3d890f.isPopup) {
        _0x2b45da(_0xd1e198, {
          type: "closed"
        }, _0x550b9f);
      }
    });
    const _0x3f24fd = _0x1167bc.session;
    _0x3f24fd?.setPermissionRequestHandler?.((_0x50e84c, _0x321b21, _0x55d572) => {
      _0x55d572(false);
    });
    _0x3f24fd?.on?.("will-download", _0x11df90 => {
      _0x11df90?.preventDefault?.();
    });
  }
  function _0x27a0b5({
    nodeId: _0x19a6df,
    tabId: _0x29a12a,
    browserProfileId: _0x74ac1c,
    partition: _0x5919f7,
    view: _0x4ca213,
    url = "",
    isPopup = false,
    openerTabId = "",
    pendingRegistrationUntil = 0
  }) {
    _0x4ca213.setVisible?.(false);
    const _0xc08d52 = createInputBridgeToken();
    const _0x35125a = {
      nodeId: _0x19a6df,
      tabId: _0x29a12a,
      browserProfileId: _0x74ac1c,
      partition: _0x5919f7,
      view: _0x4ca213,
      url: url,
      requestedUrl: url,
      loadIssuedUrl: "",
      attached: false,
      bounds: null,
      visible: false,
      selected: false,
      freezeToken: "",
      snapshotPending: false,
      freezeHiddenWithSnapshot: false,
      readySnapshotPending: false,
      readySnapshotTimer: null,
      holdSnapshotOnNextLoadStart: false,
      snapshotStaleAfterLoad: false,
      snapshotEpoch: 0,
      loaded: false,
      hasSnapshot: false,
      snapshotUrl: "",
      snapshotFreezeToken: "",
      zoomFactor: 1,
      canvasSpaceHeld: false,
      inputBridgeToken: _0xc08d52,
      isPopup: isPopup,
      openerTabId: openerTabId,
      popupOpened: !isPopup,
      pendingPopup: false,
      disposing: false,
      pendingRegistrationUntil: pendingRegistrationUntil
    };
    _0x287c64.set(toEntryKey(_0x19a6df, _0x29a12a), _0x35125a);
    _0x229a90(_0x19a6df, _0x29a12a, _0x4ca213.webContents, _0xc08d52);
    return _0x35125a;
  }
  function _0x2b7349(_0x1bf3a6, _0x2cc500, _0x31aeed) {
    if (typeof _0x2dfea9 !== "function") {
      throw new Error("当前 Electron 环境不支持 WebContentsView");
    }
    const _0x1378ca = toBrowserProfileId(_0x31aeed);
    const _0x8638a2 = toPersistentPartitionId(_0x1378ca);
    const _0x10e36b = new _0x2dfea9({
      webPreferences: _0x26775d(_0x8638a2)
    });
    return _0x27a0b5({
      nodeId: _0x1bf3a6,
      tabId: _0x2cc500,
      browserProfileId: _0x1378ca,
      partition: _0x8638a2,
      view: _0x10e36b
    });
  }
  function _0x4248b8({
    nodeId: _0x5249b8,
    tabId: _0x5dc259,
    browserProfileId: _0x38aa45,
    partition: _0x3cb9c7,
    url: _0x52aa04,
    openerTabId = ""
  }) {
    const _0x24825b = toBrowserProfileId(_0x38aa45);
    const _0x205db9 = _0x3cb9c7 || toPersistentPartitionId(_0x24825b);
    const _0x5441cb = new _0x2dfea9({
      webPreferences: _0x26775d(_0x205db9)
    });
    return _0x27a0b5({
      nodeId: _0x5249b8,
      tabId: _0x5dc259,
      browserProfileId: _0x24825b,
      partition: _0x205db9,
      view: _0x5441cb,
      url: _0x52aa04,
      isPopup: true,
      openerTabId: openerTabId,
      pendingRegistrationUntil: Date.now() + POPUP_REGISTRATION_GRACE_MS
    });
  }
  function _0x193986(_0x68cfde) {
    const _0x4ee697 = _0x287c64.get(_0x68cfde);
    if (!_0x4ee697) {
      return false;
    }
    const _0x32fc38 = _0x48abda();
    _0xf95182(_0x271566 => _0x271566.nodeId === _0x4ee697.nodeId && _0x271566.tabId === _0x4ee697.tabId);
    try {
      _0x32fc38?.contentView?.removeChildView?.(_0x4ee697.view);
    } catch {}
    _0x2598d7(_0x4ee697);
    _0x4ee697.attached = false;
    _0x4ee697.visible = false;
    _0x4ee697.disposing = true;
    try {
      if (!_0x4ee697.view?.webContents?.isDestroyed?.()) {
        _0x4ee697.view?.webContents?.destroy?.();
      }
    } catch {}
    _0x287c64.delete(_0x68cfde);
    return true;
  }
  function _0xc435d(_0x3deef6, _0xe1dbbb = null) {
    if (_0xe1dbbb !== null && typeof _0xe1dbbb !== "undefined") {
      return _0x193986(toEntryKey(_0x3deef6, _0xe1dbbb));
    }
    let _0x33069c = false;
    for (const [_0x2b1622, _0x150033] of [..._0x287c64]) {
      if (_0x150033.nodeId === _0x3deef6 && _0x193986(_0x2b1622)) {
        _0x33069c = true;
      }
    }
    return _0x33069c;
  }
  function _0x49ada7(_0x39c487) {
    const _0x7606a6 = _0x287c64.get(_0x39c487);
    if (!_0x7606a6) {
      return;
    }
    if (_0x7606a6.visible !== false) {
      _0x7606a6.view?.setVisible?.(false);
      _0x7606a6.visible = false;
    }
  }
  async function _0x353acb(_0x266a41 = {}) {
    const _0x4126ab = _0x48abda();
    if (!_0x4126ab?.contentView) {
      return {
        ok: false,
        error: "主窗口尚未就绪"
      };
    }
    const _0x4ca294 = new Set();
    const _0x278bde = getViewsPayload(_0x266a41);
    let _0x24b627 = 0;
    let _0x22c8eb = false;
    const _0x35b0ba = [];
    for (const _0x30f6d1 of _0x278bde) {
      const _0x26a643 = toNodeId(_0x30f6d1?.nodeId);
      if (!_0x26a643) {
        continue;
      }
      const _0x24ae2d = toTabId(_0x30f6d1?.tabId);
      const _0x2e5625 = toEntryKey(_0x26a643, _0x24ae2d);
      _0x4ca294.add(_0x2e5625);
      const _0x5a5fd5 = normalizeWebPreviewUrl(_0x30f6d1?.webUrl || _0x30f6d1?.url);
      if (!_0x5a5fd5) {
        if (_0x30f6d1?.pendingPopup === true) {
          const _0x2bbaa9 = _0x287c64.get(_0x2e5625);
          if (!_0x2bbaa9?.isPopup || _0x2bbaa9.requestedUrl) {
            _0x2b45da(_0x26a643, {
              type: "failed",
              message: "登录窗口尚未就绪"
            }, _0x24ae2d);
            continue;
          }
          if (_0x30f6d1?.visible === false) {
            _0x49ada7(_0x2e5625);
            continue;
          }
          const _0x5f3a7f = normalizeBounds(_0x30f6d1?.bounds);
          if (!_0x5f3a7f) {
            _0x49ada7(_0x2e5625);
            continue;
          }
          _0x2bbaa9.pendingRegistrationUntil = 0;
          const _0x55b3c7 = Boolean(_0x30f6d1?.selected);
          if (_0x2bbaa9.selected !== _0x55b3c7) {
            _0x2bbaa9.selected = _0x55b3c7;
            _0x22c8eb = true;
          }
          _0x2bbaa9.canvasSpaceHeld = _0x30f6d1?.canvasSpaceHeld === true;
          if (!_0x2bbaa9.attached) {
            _0x4126ab.contentView.addChildView(_0x2bbaa9.view);
            _0x2bbaa9.attached = true;
            _0x22c8eb = true;
          }
          _0x35b0ba.push(_0x2e5625);
          if (!boundsEqual(_0x2bbaa9.bounds, _0x5f3a7f)) {
            _0x2bbaa9.bounds = _0x5f3a7f;
            _0x2bbaa9.view.setBounds(_0x5f3a7f);
          }
          const _0x14ee7e = normalizeZoomFactor(_0x30f6d1?.zoomFactor);
          _0x2bbaa9.pendingZoomFactor = _0x14ee7e;
          if (_0x30f6d1?.deferZoomFactor !== true && !zoomFactorEqual(_0x2bbaa9.zoomFactor, _0x14ee7e)) {
            _0x2bbaa9.zoomFactor = _0x14ee7e;
            _0x2bbaa9.view.webContents.setZoomFactor?.(_0x14ee7e);
          }
          if (_0x2bbaa9.visible !== true) {
            _0x2bbaa9.view.setVisible?.(true);
            _0x2bbaa9.visible = true;
          }
          _0x24b627 += 1;
          continue;
        }
        _0x193986(_0x2e5625);
        _0x2b45da(_0x26a643, {
          type: "failed",
          message: "网页地址无效"
        }, _0x24ae2d);
        continue;
      }
      if (_0x30f6d1?.visible === false) {
        const _0x1c3f31 = _0x287c64.get(_0x2e5625);
        if (_0x1c3f31) {
          _0x1c3f31.pendingRegistrationUntil = 0;
          const _0x49fdb0 = _0x30f6d1?.frozen === true && _0x30f6d1?.showSnapshot === true && _0x1c3f31.requestedUrl === _0x5a5fd5;
          if (_0x49fdb0) {
            _0x2598d7(_0x1c3f31);
            const _0x2daf51 = String(_0x30f6d1?.freezeToken || "0");
            if (_0x1c3f31.freezeToken !== _0x2daf51) {
              _0x1c3f31.freezeToken = _0x2daf51;
              _0x1c3f31.freezeHiddenWithSnapshot = false;
            }
            const _0x2f73d3 = _0x1c3f31.hasSnapshot === true && _0x1c3f31.snapshotUrl === _0x5a5fd5;
            const _0x1a76ca = _0x2f73d3 && _0x1c3f31.snapshotFreezeToken === _0x2daf51;
            const _0x19698c = _0x2f73d3 && _0x1c3f31.snapshotFreezeToken === "ready" && _0x30f6d1?.allowReusableSnapshot === true && _0x30f6d1?.snapshotReady === true;
            const _0x459b01 = (_0x1a76ca || _0x19698c) && (_0x30f6d1?.snapshotReady === true || _0x1c3f31.freezeHiddenWithSnapshot === true);
            if (_0x459b01) {
              _0x1c3f31.snapshotPending = false;
              _0x1c3f31.freezeHiddenWithSnapshot = true;
              _0x49ada7(_0x2e5625);
              continue;
            }
            _0x1c3f31.freezeHiddenWithSnapshot = false;
            const _0x3e2961 = normalizeBounds(_0x30f6d1?.snapshotBounds) || _0x1c3f31.bounds;
            if (_0x3e2961) {
              if (!_0x1c3f31.attached) {
                _0x4126ab.contentView.addChildView(_0x1c3f31.view);
                _0x1c3f31.attached = true;
                _0x22c8eb = true;
              }
              if (!boundsEqual(_0x1c3f31.bounds, _0x3e2961)) {
                _0x1c3f31.bounds = _0x3e2961;
                _0x1c3f31.view.setBounds(_0x3e2961);
              }
              const _0x250b09 = normalizeZoomFactor(_0x30f6d1?.zoomFactor);
              _0x1c3f31.pendingZoomFactor = _0x250b09;
              if (_0x30f6d1?.deferZoomFactor !== true && !zoomFactorEqual(_0x1c3f31.zoomFactor, _0x250b09)) {
                _0x1c3f31.zoomFactor = _0x250b09;
                _0x1c3f31.view.webContents.setZoomFactor?.(_0x250b09);
              }
              if (_0x1c3f31.visible !== true) {
                _0x1c3f31.view.setVisible?.(true);
                _0x1c3f31.visible = true;
              }
              if (_0x30f6d1?.snapshotHold !== true && _0x1c3f31.snapshotPending !== true && !_0x1a76ca) {
                const _0x510afb = _0x3c7e44(_0x26a643, _0x1c3f31, _0x2daf51, () => {
                  const _0x47fa01 = _0x287c64.get(_0x2e5625);
                  if (_0x47fa01 === _0x1c3f31) {
                    _0x47fa01.snapshotPending = false;
                  }
                }, _0x5a5fd5);
                _0x1c3f31.snapshotPending = _0x510afb;
              }
              _0x24b627 += 1;
              continue;
            }
          }
          _0x1c3f31.freezeToken = "";
          _0x1c3f31.snapshotPending = false;
          _0x1c3f31.freezeHiddenWithSnapshot = false;
        }
        _0x49ada7(_0x2e5625);
        continue;
      }
      const _0x409d6f = normalizeBounds(_0x30f6d1?.bounds);
      if (!_0x409d6f) {
        _0x49ada7(_0x2e5625);
        continue;
      }
      const _0x4ad6b6 = toBrowserProfileId(_0x30f6d1?.browserProfileId);
      const _0x2d01ff = toPersistentPartitionId(_0x4ad6b6);
      let _0x57e829 = _0x287c64.get(_0x2e5625);
      if (_0x57e829 && _0x57e829.partition !== _0x2d01ff) {
        _0x193986(_0x2e5625);
        _0x57e829 = null;
        _0x22c8eb = true;
      }
      if (!_0x57e829) {
        _0x57e829 = _0x2b7349(_0x26a643, _0x24ae2d, _0x4ad6b6);
        _0x22c8eb = true;
      }
      _0x57e829.pendingRegistrationUntil = 0;
      const _0x22f5e1 = Boolean(_0x30f6d1?.selected);
      if (_0x57e829.selected !== _0x22f5e1) {
        _0x57e829.selected = _0x22f5e1;
        _0x22c8eb = true;
      }
      _0x57e829.canvasSpaceHeld = _0x30f6d1?.canvasSpaceHeld === true;
      if (!_0x57e829.attached) {
        _0x4126ab.contentView.addChildView(_0x57e829.view);
        _0x57e829.attached = true;
        _0x22c8eb = true;
      }
      _0x35b0ba.push(_0x2e5625);
      const _0x23811b = String(_0x30f6d1?.freezeToken || "0");
      const _0x2b90bc = _0x30f6d1?.frozen === true && _0x57e829.requestedUrl === _0x5a5fd5;
      if (_0x2b90bc) {
        _0x2598d7(_0x57e829);
        if (_0x57e829.freezeToken !== _0x23811b) {
          _0x57e829.freezeToken = _0x23811b;
          _0x57e829.freezeHiddenWithSnapshot = false;
        }
        const _0x560d82 = _0x57e829.hasSnapshot === true && _0x57e829.snapshotUrl === _0x5a5fd5;
        const _0x5c04fc = _0x560d82 && _0x57e829.snapshotFreezeToken === _0x23811b;
        const _0x43e7e2 = _0x560d82 && _0x57e829.snapshotFreezeToken === "ready" && _0x30f6d1?.snapshotReady === true;
        const _0x5ef83d = (_0x5c04fc || _0x43e7e2) && (_0x30f6d1?.snapshotReady === true || _0x57e829.freezeHiddenWithSnapshot === true);
        if (_0x5ef83d) {
          _0x57e829.snapshotPending = false;
          _0x57e829.freezeHiddenWithSnapshot = true;
          _0x49ada7(_0x2e5625);
        } else {
          _0x57e829.freezeHiddenWithSnapshot = false;
          if (!boundsEqual(_0x57e829.bounds, _0x409d6f)) {
            _0x57e829.bounds = _0x409d6f;
            _0x57e829.view.setBounds(_0x409d6f);
          }
          if (_0x57e829.visible !== true) {
            _0x57e829.view.setVisible?.(true);
            _0x57e829.visible = true;
          }
          if (_0x30f6d1?.snapshotHold !== true && _0x57e829.snapshotPending !== true && !_0x5c04fc) {
            const _0x52791d = _0x3c7e44(_0x26a643, _0x57e829, _0x23811b, () => {
              const _0x2c79ca = _0x287c64.get(_0x2e5625);
              if (_0x2c79ca === _0x57e829) {
                _0x2c79ca.snapshotPending = false;
              }
            }, _0x5a5fd5);
            _0x57e829.snapshotPending = _0x52791d;
          }
        }
        _0x24b627 += 1;
        continue;
      }
      _0x57e829.freezeToken = "";
      _0x57e829.snapshotPending = false;
      _0x57e829.freezeHiddenWithSnapshot = false;
      if (!boundsEqual(_0x57e829.bounds, _0x409d6f)) {
        _0x57e829.bounds = _0x409d6f;
        _0x57e829.view.setBounds(_0x409d6f);
      }
      const _0x2948c = normalizeZoomFactor(_0x30f6d1?.zoomFactor);
      _0x57e829.pendingZoomFactor = _0x2948c;
      if (_0x30f6d1?.deferZoomFactor !== true && !zoomFactorEqual(_0x57e829.zoomFactor, _0x2948c)) {
        _0x57e829.zoomFactor = _0x2948c;
        _0x57e829.view.webContents.setZoomFactor?.(_0x2948c);
      }
      if (_0x57e829.visible !== true) {
        _0x57e829.view.setVisible?.(true);
        _0x57e829.visible = true;
      }
      _0x19d3e9(_0x26a643, _0x57e829);
      _0x24b627 += 1;
      const _0x5429e3 = _0x57e829.url === _0x5a5fd5 || _0x57e829.loadIssuedUrl === _0x5a5fd5;
      const _0x1325d9 = _0x57e829.requestedUrl !== _0x5a5fd5 && !_0x5429e3 || _0x57e829.isPopup && _0x57e829.requestedUrl === _0x5a5fd5 && _0x57e829.loadIssuedUrl !== _0x5a5fd5 && _0x57e829.loaded !== true;
      if (!_0x1325d9 && _0x57e829.requestedUrl !== _0x5a5fd5 && _0x5429e3) {
        _0x57e829.requestedUrl = _0x5a5fd5;
      }
      if (_0x1325d9) {
        _0x2598d7(_0x57e829);
        _0x57e829.requestedUrl = _0x5a5fd5;
        _0x57e829.url = _0x5a5fd5;
        _0x57e829.loadIssuedUrl = _0x5a5fd5;
        _0x57e829.snapshotEpoch += 1;
        _0x57e829.loaded = false;
        _0x57e829.hasSnapshot = false;
        _0x57e829.snapshotUrl = "";
        _0x57e829.snapshotFreezeToken = "";
        _0x57e829.readySnapshotPending = false;
        _0x57e829.holdSnapshotOnNextLoadStart = false;
        _0x57e829.snapshotStaleAfterLoad = false;
        try {
          const _0x33b1f7 = _0x57e829.view.webContents.loadURL(_0x5a5fd5);
          if (_0x33b1f7 && typeof _0x33b1f7.catch === "function") {
            _0x33b1f7.catch(_0x12a5b8 => {
              _0x12c6fa?.({
                type: "web_preview.load_failed",
                level: "warn",
                source: "main",
                message: "Web preview loadURL failed",
                error: _0x12a5b8,
                context: {
                  nodeId: _0x26a643,
                  tabId: _0x24ae2d
                }
              });
              _0x2b45da(_0x26a643, {
                type: "failed",
                url: _0x5a5fd5,
                message: String(_0x12a5b8?.message || "网页加载失败")
              }, _0x24ae2d);
            });
          }
        } catch (_0x344a64) {
          _0x12c6fa?.({
            type: "web_preview.load_failed",
            level: "warn",
            source: "main",
            message: "Web preview loadURL failed",
            error: _0x344a64,
            context: {
              nodeId: _0x26a643,
              tabId: _0x24ae2d
            }
          });
          _0x2b45da(_0x26a643, {
            type: "failed",
            url: _0x5a5fd5,
            message: String(_0x344a64?.message || "网页加载失败")
          }, _0x24ae2d);
        }
      }
    }
    if (_0x22c8eb) {
      for (const _0x14a299 of _0x35b0ba) {
        const _0x599561 = _0x287c64.get(_0x14a299);
        if (_0x599561?.view && _0x599561.attached) {
          _0x4126ab.contentView.addChildView(_0x599561.view);
        }
      }
    }
    const _0x15bd23 = Date.now();
    for (const _0x3fb961 of [..._0x287c64.keys()]) {
      if (_0x4ca294.has(_0x3fb961)) {
        continue;
      }
      const _0x348326 = _0x287c64.get(_0x3fb961);
      if (_0x348326?.pendingRegistrationUntil > _0x15bd23) {
        continue;
      }
      _0x193986(_0x3fb961);
    }
    return {
      ok: true,
      count: _0x287c64.size,
      visibleCount: _0x24b627
    };
  }
  function _0x1a6e4e(_0x2f7ca6 = {}) {
    const _0xa7d9e = Array.isArray(_0x2f7ca6?.nodeIds) ? _0x2f7ca6.nodeIds.map(toNodeId).filter(Boolean) : [];
    const _0x3cd599 = Array.isArray(_0x2f7ca6?.tabIds) ? _0x2f7ca6.tabIds.map(toTabId).filter(Boolean) : [];
    let _0x44ce61 = 0;
    if (_0xa7d9e.length > 0 && _0x3cd599.length > 0) {
      for (const _0x3ebc60 of _0xa7d9e) {
        for (const _0x368a24 of _0x3cd599) {
          if (_0xc435d(_0x3ebc60, _0x368a24)) {
            _0x44ce61 += 1;
          }
        }
      }
      _0xf95182(_0x5d6dcc => _0xa7d9e.includes(_0x5d6dcc.nodeId) && _0x3cd599.includes(_0x5d6dcc.tabId));
    } else if (_0xa7d9e.length > 0) {
      for (const _0x459803 of _0xa7d9e) {
        for (const [_0x24da24, _0x2cda46] of [..._0x287c64]) {
          if (_0x2cda46.nodeId === _0x459803 && _0x193986(_0x24da24)) {
            _0x44ce61 += 1;
          }
        }
      }
      _0xf95182(_0x3c6ee1 => _0xa7d9e.includes(_0x3c6ee1.nodeId));
    } else {
      for (const _0x393d92 of [..._0x287c64.keys()]) {
        if (_0x193986(_0x393d92)) {
          _0x44ce61 += 1;
        }
      }
      _0xf95182();
    }
    return {
      ok: true,
      disposed: _0x44ce61
    };
  }
  function _0x5973a6(_0x45dcaf, _0xba5d08, _0x4789b5) {
    return Promise.resolve(_0x45dcaf.executeJavaScript(buildWebPreviewImageExtractionScript({
      nodeId: _0xba5d08,
      tabId: _0x4789b5
    }), true)).then(_0x23e5d2 => ({
      ok: true,
      images: filterExtractedImageCandidates(_0x23e5d2?.images),
      pageUrl: String(_0x23e5d2?.pageUrl || ""),
      pageTitle: String(_0x23e5d2?.pageTitle || "")
    })).catch(_0xac757 => {
      _0x12c6fa?.({
        type: "web_preview.extract_images_failed",
        level: "warn",
        source: "main",
        message: "Web preview image extraction failed",
        error: _0xac757,
        context: {
          nodeId: _0xba5d08,
          tabId: _0x4789b5
        }
      });
      return {
        ok: false,
        error: "extract-failed",
        images: []
      };
    });
  }
  function _0x34f323(_0x225b8c, _0xf004b5, _0x57345e) {
    return Promise.resolve(_0x225b8c.executeJavaScript(buildWebPreviewVideoExtractionScript({
      nodeId: _0xf004b5,
      tabId: _0x57345e
    }), true)).then(_0x28214d => ({
      ok: true,
      videos: filterExtractedVideoCandidates(_0x28214d?.videos),
      douyinDetailApiUrls: Array.isArray(_0x28214d?.douyinDetailApiUrls) ? _0x28214d.douyinDetailApiUrls : [],
      pageUrl: String(_0x28214d?.pageUrl || ""),
      pageTitle: String(_0x28214d?.pageTitle || "")
    })).catch(_0x2e4b15 => {
      _0x12c6fa?.({
        type: "web_preview.extract_videos_failed",
        level: "warn",
        source: "main",
        message: "Web preview video extraction failed",
        error: _0x2e4b15,
        context: {
          nodeId: _0xf004b5,
          tabId: _0x57345e
        }
      });
      return {
        ok: false,
        error: "extract-failed",
        videos: [],
        douyinDetailApiUrls: []
      };
    });
  }
  function _0x2b2082(_0x401321 = {}) {
    const _0x2dc6f3 = toNodeId(_0x401321?.nodeId);
    const _0x4fcc0c = toTabId(_0x401321?.tabId);
    const _0x2cdadd = String(_0x401321?.action || "").trim();
    if (!_0x2dc6f3) {
      return {
        ok: false,
        error: "missing-node"
      };
    }
    const _0x168b2b = _0x287c64.get(toEntryKey(_0x2dc6f3, _0x4fcc0c));
    if (!_0x168b2b?.view?.webContents || _0x168b2b.view.webContents.isDestroyed?.()) {
      return {
        ok: false,
        error: "missing-view"
      };
    }
    const _0x16c4b9 = _0x168b2b.view.webContents;
    if (_0x2cdadd === "back") {
      if (!_0x16c4b9.canGoBack?.()) {
        _0x2b45da(_0x2dc6f3, {
          type: "blocked",
          message: "没有上一页"
        }, _0x4fcc0c);
        return {
          ok: false,
          error: "no-history",
          ...getNavigationState(_0x16c4b9)
        };
      }
      _0x16c4b9.goBack?.();
    } else if (_0x2cdadd === "forward") {
      if (!_0x16c4b9.canGoForward?.()) {
        _0x2b45da(_0x2dc6f3, {
          type: "blocked",
          message: "没有下一页"
        }, _0x4fcc0c);
        return {
          ok: false,
          error: "no-history",
          ...getNavigationState(_0x16c4b9)
        };
      }
      _0x16c4b9.goForward?.();
    } else if (_0x2cdadd === "reload") {
      const _0x54bc97 = _0x168b2b.url || _0x168b2b.requestedUrl || "";
      _0x168b2b.holdSnapshotOnNextLoadStart = Boolean(_0x168b2b.hasSnapshot === true && _0x168b2b.snapshotUrl && _0x54bc97 && _0x168b2b.snapshotUrl === _0x54bc97);
      _0x168b2b.snapshotStaleAfterLoad = false;
      if (typeof _0x16c4b9.reloadIgnoringCache === "function") {
        _0x16c4b9.reloadIgnoringCache();
      } else if (typeof _0x16c4b9.reload === "function") {
        _0x16c4b9.reload();
      } else if (_0x168b2b.url || _0x168b2b.requestedUrl) {
        _0x16c4b9.loadURL?.(_0x168b2b.url || _0x168b2b.requestedUrl);
      }
    } else if (_0x2cdadd === "extract-media") {
      if (typeof _0x16c4b9.executeJavaScript !== "function") {
        return {
          ok: false,
          error: "unsupported-action"
        };
      }
      return Promise.all([_0x5973a6(_0x16c4b9, _0x2dc6f3, _0x4fcc0c), _0x34f323(_0x16c4b9, _0x2dc6f3, _0x4fcc0c)]).then(async ([_0x3ba171, _0x32fdfe]) => {
        if (_0x3ba171?.ok === false && _0x32fdfe?.ok === false) {
          return {
            ok: false,
            error: "extract-failed"
          };
        }
        const _0xe1487a = String(_0x32fdfe?.pageUrl || _0x3ba171?.pageUrl || _0x168b2b.url || _0x168b2b.requestedUrl || "");
        const _0xa9b9ac = String(_0x32fdfe?.pageTitle || _0x3ba171?.pageTitle || "");
        let _0x1abd30 = {
          images: [],
          videos: [],
          detailApiUrls: [],
          fetchedCount: 0
        };
        if (typeof resolveDouyinMedia === "function") {
          try {
            _0x1abd30 = (await resolveDouyinMedia({
              pageUrl: _0xe1487a,
              pageTitle: _0xa9b9ac,
              nodeId: _0x2dc6f3,
              tabId: _0x4fcc0c,
              imageResult: _0x3ba171,
              videoResult: _0x32fdfe,
              webContents: _0x16c4b9,
              logDiagnosticEvent: _0x12c6fa
            })) || _0x1abd30;
          } catch (_0x52132e) {
            _0x12c6fa?.({
              type: "web_preview.douyin_media_resolve_failed",
              level: "warn",
              source: "main",
              message: "Douyin media resolver failed",
              error: _0x52132e,
              context: {
                nodeId: _0x2dc6f3,
                tabId: _0x4fcc0c,
                pageUrl: _0xe1487a
              }
            });
          }
        }
        return {
          ok: true,
          action: _0x2cdadd,
          ...(_0x401321?.tabId ? {
            tabId: _0x4fcc0c
          } : {}),
          images: mergeExtractedImageCandidates(_0x1abd30?.images, _0x3ba171?.images),
          videos: mergeExtractedVideoCandidates(_0x1abd30?.videos, _0x32fdfe?.videos),
          pageUrl: _0xe1487a,
          pageTitle: _0xa9b9ac,
          douyin: {
            detailApiUrls: Array.isArray(_0x1abd30?.detailApiUrls) ? _0x1abd30.detailApiUrls : [],
            fetchedCount: Number(_0x1abd30?.fetchedCount || 0) || 0
          },
          ...getNavigationState(_0x16c4b9)
        };
      });
    } else if (_0x2cdadd === "extract-images") {
      if (typeof _0x16c4b9.executeJavaScript !== "function") {
        return {
          ok: false,
          error: "unsupported-action"
        };
      }
      return _0x5973a6(_0x16c4b9, _0x2dc6f3, _0x4fcc0c).then(_0x20e904 => _0x20e904.ok === false ? {
        ok: false,
        error: _0x20e904.error || "extract-failed"
      } : {
        ok: true,
        action: _0x2cdadd,
        ...(_0x401321?.tabId ? {
          tabId: _0x4fcc0c
        } : {}),
        images: _0x20e904.images,
        pageUrl: String(_0x20e904.pageUrl || _0x168b2b.url || _0x168b2b.requestedUrl || ""),
        pageTitle: String(_0x20e904?.pageTitle || ""),
        ...getNavigationState(_0x16c4b9)
      });
    } else if (_0x2cdadd === "extract-videos") {
      if (typeof _0x16c4b9.executeJavaScript !== "function") {
        return {
          ok: false,
          error: "unsupported-action"
        };
      }
      return _0x34f323(_0x16c4b9, _0x2dc6f3, _0x4fcc0c).then(_0x1e9cd2 => _0x1e9cd2.ok === false ? {
        ok: false,
        error: _0x1e9cd2.error || "extract-failed"
      } : {
        ok: true,
        action: _0x2cdadd,
        ...(_0x401321?.tabId ? {
          tabId: _0x4fcc0c
        } : {}),
        videos: _0x1e9cd2.videos,
        pageUrl: String(_0x1e9cd2.pageUrl || _0x168b2b.url || _0x168b2b.requestedUrl || ""),
        pageTitle: String(_0x1e9cd2?.pageTitle || ""),
        ...getNavigationState(_0x16c4b9)
      });
    } else if (_0x2cdadd === "capture-reference") {
      if (typeof _0x16c4b9.executeJavaScript !== "function" || typeof _0x16c4b9.capturePage !== "function") {
        return {
          ok: false,
          error: "unsupported-action"
        };
      }
      return Promise.all([Promise.resolve(_0x16c4b9.executeJavaScript(buildWebPreviewReferenceSnapshotScript(), true)), Promise.resolve(_0x16c4b9.capturePage()).then(_0x54582a => _0x54582a?.toDataURL?.() || "")]).then(([_0x3a7d6d, _0x56f833]) => ({
        ok: true,
        action: _0x2cdadd,
        ...(_0x401321?.tabId ? {
          tabId: _0x4fcc0c
        } : {}),
        pageUrl: String(_0x3a7d6d?.pageUrl || _0x168b2b.url || _0x168b2b.requestedUrl || ""),
        pageTitle: String(_0x3a7d6d?.pageTitle || _0x16c4b9.getTitle?.() || ""),
        selectedText: String(_0x3a7d6d?.selectedText || "").slice(0, WEB_PREVIEW_SELECTED_TEXT_LIMIT),
        screenshotDataUrl: String(_0x56f833 || ""),
        capturedAt: new Date().toISOString(),
        ...getNavigationState(_0x16c4b9)
      })).catch(_0x4296a5 => {
        _0x12c6fa?.({
          type: "web_preview.capture_reference_failed",
          level: "warn",
          source: "main",
          message: "Web preview reference capture failed",
          error: _0x4296a5,
          context: {
            nodeId: _0x2dc6f3,
            tabId: _0x4fcc0c
          }
        });
        return {
          ok: false,
          error: "capture-failed"
        };
      });
    } else {
      return {
        ok: false,
        error: "unknown-action"
      };
    }
    _0x25d154(_0x2dc6f3, _0x16c4b9, _0x4fcc0c);
    return {
      ok: true,
      action: _0x2cdadd,
      ...(_0x401321?.tabId ? {
        tabId: _0x4fcc0c
      } : {}),
      ...getNavigationState(_0x16c4b9)
    };
  }
  return {
    syncViews: _0x353acb,
    disposeViews: _0x1a6e4e,
    controlView: _0x2b2082,
    getEntryCount: () => _0x287c64.size,
    _getEntry: (_0x13fe30, _0x351a80 = "default") => _0x287c64.get(toEntryKey(_0x13fe30, _0x351a80))
  };
}