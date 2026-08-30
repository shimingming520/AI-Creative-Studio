#define UNICODE
#define _UNICODE

#include <windows.h>
#include <windowsx.h>
#include <gdiplus.h>

#ifdef min
#undef min
#endif
#ifdef max
#undef max
#endif
#define NOMINMAX

#include <algorithm>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#pragma comment(lib, "gdiplus.lib")
#pragma comment(lib, "user32.lib")
#pragma comment(lib, "gdi32.lib")

using namespace Gdiplus;

namespace {

constexpr int HOTKEY_ID = 9001;
constexpr int MIN_SIZE = 8;
constexpr int HANDLE_SIZE = 10;
constexpr int TOOLBAR_WIDTH = 76;
constexpr int TOOLBAR_HEIGHT = 38;
constexpr int MAG_SIZE = 174;
constexpr int MAG_SOURCE = 29;

ULONG_PTR g_gdiplusToken = 0;

// Output helpers -------------------------------------------------------------

std::string Base64Encode(const std::vector<BYTE>& input) {
  static constexpr char table[] =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  std::string output;
  output.reserve(((input.size() + 2) / 3) * 4);
  for (size_t i = 0; i < input.size(); i += 3) {
    const uint32_t a = input[i];
    const uint32_t b = i + 1 < input.size() ? input[i + 1] : 0;
    const uint32_t c = i + 2 < input.size() ? input[i + 2] : 0;
    const uint32_t triple = (a << 16) | (b << 8) | c;
    output.push_back(table[(triple >> 18) & 0x3F]);
    output.push_back(table[(triple >> 12) & 0x3F]);
    output.push_back(i + 1 < input.size() ? table[(triple >> 6) & 0x3F] : '=');
    output.push_back(i + 2 < input.size() ? table[triple & 0x3F] : '=');
  }
  return output;
}

int GetEncoderClsid(const WCHAR* format, CLSID* clsid) {
  UINT count = 0;
  UINT size = 0;
  GetImageEncodersSize(&count, &size);
  if (size == 0) return -1;
  std::vector<BYTE> buffer(size);
  auto* info = reinterpret_cast<ImageCodecInfo*>(buffer.data());
  if (GetImageEncoders(count, size, info) != Ok) return -1;
  for (UINT i = 0; i < count; ++i) {
    if (wcscmp(info[i].MimeType, format) == 0) {
      *clsid = info[i].Clsid;
      return static_cast<int>(i);
    }
  }
  return -1;
}

std::vector<BYTE> StreamToBytes(IStream* stream) {
  STATSTG stat = {};
  if (stream->Stat(&stat, STATFLAG_NONAME) != S_OK) return {};
  LARGE_INTEGER start = {};
  stream->Seek(start, STREAM_SEEK_SET, nullptr);
  std::vector<BYTE> bytes(static_cast<size_t>(stat.cbSize.QuadPart));
  ULONG read = 0;
  stream->Read(bytes.data(), static_cast<ULONG>(bytes.size()), &read);
  bytes.resize(read);
  return bytes;
}

int ClampInt(int value, int minValue, int maxValue) {
  return std::min(maxValue, std::max(minValue, value));
}

std::wstring GetEnvString(const wchar_t* name) {
  const DWORD size = GetEnvironmentVariableW(name, nullptr, 0);
  if (size == 0) return L"";
  std::vector<wchar_t> buffer(size);
  const DWORD written = GetEnvironmentVariableW(name, buffer.data(), size);
  if (written == 0 || written >= size) return L"";
  return std::wstring(buffer.data(), written);
}

std::wstring ToUpperAscii(std::wstring value) {
  std::transform(value.begin(), value.end(), value.begin(), [](wchar_t ch) {
    if (ch >= L'a' && ch <= L'z') return static_cast<wchar_t>(ch - L'a' + L'A');
    return ch;
  });
  return value;
}

struct HotkeyConfig {
  UINT modifiers = MOD_ALT | MOD_NOREPEAT;
  UINT virtualKey = 'Q';
};

bool TryApplyHotkeyToken(const std::wstring& rawToken, HotkeyConfig& config, bool& hasMainKey) {
  const std::wstring token = ToUpperAscii(rawToken);
  if (token.empty()) return true;
  if (token == L"ALT" || token == L"OPTION") {
    config.modifiers |= MOD_ALT;
    return true;
  }
  if (
      token == L"CTRL" ||
      token == L"CONTROL" ||
      token == L"COMMANDORCONTROL" ||
      token == L"COMMANDORCTRL" ||
      token == L"CMDORCTRL") {
    config.modifiers |= MOD_CONTROL;
    return true;
  }
  if (token == L"SHIFT") {
    config.modifiers |= MOD_SHIFT;
    return true;
  }
  if (hasMainKey) return false;
  if (token.size() == 1 && token[0] >= L'A' && token[0] <= L'Z') {
    config.virtualKey = static_cast<UINT>(token[0]);
    hasMainKey = true;
    return true;
  }
  if (token.size() == 1 && token[0] >= L'0' && token[0] <= L'9') {
    config.virtualKey = static_cast<UINT>(token[0]);
    hasMainKey = true;
    return true;
  }
  if (token.size() >= 2 && token[0] == L'F') {
    const int number = _wtoi(token.c_str() + 1);
    if (number >= 1 && number <= 24) {
      config.virtualKey = VK_F1 + static_cast<UINT>(number - 1);
      hasMainKey = true;
      return true;
    }
  }
  if (token == L"SPACE") config.virtualKey = VK_SPACE;
  else if (token == L"TAB") config.virtualKey = VK_TAB;
  else if (token == L"ENTER" || token == L"RETURN") config.virtualKey = VK_RETURN;
  else if (token == L"ESCAPE" || token == L"ESC") config.virtualKey = VK_ESCAPE;
  else if (token == L"BACKSPACE") config.virtualKey = VK_BACK;
  else if (token == L"DELETE" || token == L"DEL") config.virtualKey = VK_DELETE;
  else if (token == L"INSERT" || token == L"INS") config.virtualKey = VK_INSERT;
  else if (token == L"HOME") config.virtualKey = VK_HOME;
  else if (token == L"END") config.virtualKey = VK_END;
  else if (token == L"PAGEUP") config.virtualKey = VK_PRIOR;
  else if (token == L"PAGEDOWN") config.virtualKey = VK_NEXT;
  else if (token == L"UP") config.virtualKey = VK_UP;
  else if (token == L"DOWN") config.virtualKey = VK_DOWN;
  else if (token == L"LEFT") config.virtualKey = VK_LEFT;
  else if (token == L"RIGHT") config.virtualKey = VK_RIGHT;
  else if (token == L"PLUS") config.virtualKey = VK_OEM_PLUS;
  else if (token == L"MINUS") config.virtualKey = VK_OEM_MINUS;
  else if (token == L"COMMA") config.virtualKey = VK_OEM_COMMA;
  else if (token == L"PERIOD") config.virtualKey = VK_OEM_PERIOD;
  else if (token == L"SLASH") config.virtualKey = VK_OEM_2;
  else if (token == L"BACKSLASH") config.virtualKey = VK_OEM_5;
  else if (token == L"SEMICOLON") config.virtualKey = VK_OEM_1;
  else if (token == L"QUOTE") config.virtualKey = VK_OEM_7;
  else if (token == L"BRACKETLEFT") config.virtualKey = VK_OEM_4;
  else if (token == L"BRACKETRIGHT") config.virtualKey = VK_OEM_6;
  else if (token == L"`" || token == L"BACKQUOTE") config.virtualKey = VK_OEM_3;
  else return false;
  hasMainKey = true;
  return true;
}

HotkeyConfig ReadHotkeyConfigFromEnv() {
  const std::wstring accelerator = GetEnvString(L"AICANVAS_SCREENSHOT_ACCELERATOR");
  if (accelerator.empty()) return {};

  HotkeyConfig config{};
  config.modifiers = MOD_NOREPEAT;
  config.virtualKey = 0;
  bool hasMainKey = false;
  size_t start = 0;
  while (start <= accelerator.size()) {
    const size_t plus = accelerator.find(L'+', start);
    const std::wstring token = accelerator.substr(
        start,
        plus == std::wstring::npos ? std::wstring::npos : plus - start);
    if (!TryApplyHotkeyToken(token, config, hasMainKey)) return {};
    if (plus == std::wstring::npos) break;
    start = plus + 1;
  }
  if (!hasMainKey) return {};
  return config;
}

std::wstring JoinPath(const std::wstring& dir, const wchar_t* file) {
  if (dir.empty()) return L"";
  if (dir.back() == L'\\' || dir.back() == L'/') return dir + file;
  return dir + L"\\" + file;
}

HCURSOR LoadCursorFile(const std::wstring& dir, const wchar_t* file) {
  const std::wstring path = JoinPath(dir, file);
  if (path.empty()) return nullptr;
  return static_cast<HCURSOR>(LoadImageW(
      nullptr,
      path.c_str(),
      IMAGE_CURSOR,
      0,
      0,
      LR_DEFAULTSIZE | LR_LOADFROMFILE));
}

void DestroyLoadedCursor(HCURSOR& cursor) {
  if (!cursor) return;
  DestroyCursor(cursor);
  cursor = nullptr;
}

// Capture data ---------------------------------------------------------------

struct CaptureData {
  RECT bounds{};
  int width = 0;
  int height = 0;
  std::vector<BYTE> bgra;
};

CaptureData CaptureMonitorAtCursor() {
  POINT cursor{};
  GetCursorPos(&cursor);
  HMONITOR monitor = MonitorFromPoint(cursor, MONITOR_DEFAULTTONEAREST);
  MONITORINFO info{};
  info.cbSize = sizeof(info);
  GetMonitorInfo(monitor, &info);

  const RECT rc = info.rcMonitor;
  const int width = rc.right - rc.left;
  const int height = rc.bottom - rc.top;
  CaptureData capture;
  capture.bounds = rc;
  capture.width = width;
  capture.height = height;
  capture.bgra.resize(static_cast<size_t>(width) * height * 4);

  HDC screen = GetDC(nullptr);
  HDC mem = CreateCompatibleDC(screen);
  BITMAPINFO bmi{};
  bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  bmi.bmiHeader.biWidth = width;
  bmi.bmiHeader.biHeight = -height;
  bmi.bmiHeader.biPlanes = 1;
  bmi.bmiHeader.biBitCount = 32;
  bmi.bmiHeader.biCompression = BI_RGB;
  void* bits = nullptr;
  HBITMAP bitmap = CreateDIBSection(screen, &bmi, DIB_RGB_COLORS, &bits, nullptr, 0);
  HGDIOBJ old = SelectObject(mem, bitmap);
  BitBlt(mem, 0, 0, width, height, screen, rc.left, rc.top, SRCCOPY | CAPTUREBLT);
  if (bits) {
    memcpy(capture.bgra.data(), bits, capture.bgra.size());
  }
  SelectObject(mem, old);
  DeleteObject(bitmap);
  DeleteDC(mem);
  ReleaseDC(nullptr, screen);
  return capture;
}

enum class Mode { Idle, Selecting, Selected, Busy };
enum class DragKind { None, Select, Move, Resize };

class OverlayWindow {
 public:
  ~OverlayWindow() {
    DestroyCustomCursors();
    ReleaseBackBuffer();
  }

  bool Create(HINSTANCE instance) {
    instance_ = instance;
    LoadCustomCursors();
    WNDCLASS wc{};
    wc.style = CS_DBLCLKS;
    wc.lpfnWndProc = &OverlayWindow::WndProcSetup;
    wc.hInstance = instance;
    wc.lpszClassName = L"AICanvasNativeScreenshotOverlay";
    wc.hCursor = CursorOrFallback(cursorPrecision_, IDC_CROSS);
    wc.hbrBackground = nullptr;
    RegisterClass(&wc);
    hwnd_ = CreateWindowEx(
        WS_EX_TOPMOST | WS_EX_TOOLWINDOW,
        wc.lpszClassName,
        L"SHUO Canvas Screenshot",
        WS_POPUP,
        0,
        0,
        1,
        1,
        nullptr,
        nullptr,
        instance,
        this);
    return hwnd_ != nullptr;
  }

  bool IsVisible() const {
    return hwnd_ && IsWindowVisible(hwnd_);
  }

  void Start() {
    capture_ = CaptureMonitorAtCursor();
    ResetInteraction();
    POINT cursor{};
    GetCursorPos(&cursor);
    lastPoint_ = {
        ClampInt(cursor.x - capture_.bounds.left, 0, std::max(0, capture_.width)),
        ClampInt(cursor.y - capture_.bounds.top, 0, std::max(0, capture_.height)),
    };
    EnsureBackBuffer();
    RenderIdleBaseBuffer();
    SetWindowPos(
        hwnd_,
        HWND_TOPMOST,
        capture_.bounds.left,
        capture_.bounds.top,
        capture_.width,
        capture_.height,
        SWP_SHOWWINDOW);
    SetForegroundWindow(hwnd_);
    SetFocus(hwnd_);
    RedrawWindow(hwnd_, nullptr, nullptr, RDW_INVALIDATE | RDW_UPDATENOW);
  }

  void Focus() {
    if (!hwnd_) return;
    SetWindowPos(hwnd_, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
    SetForegroundWindow(hwnd_);
  }

 private:
  // Win32 window plumbing ----------------------------------------------------

  static LRESULT CALLBACK WndProcSetup(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    if (msg == WM_NCCREATE) {
      auto* create = reinterpret_cast<CREATESTRUCT*>(lp);
      auto* self = reinterpret_cast<OverlayWindow*>(create->lpCreateParams);
      SetWindowLongPtr(hwnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(self));
      SetWindowLongPtr(hwnd, GWLP_WNDPROC, reinterpret_cast<LONG_PTR>(&OverlayWindow::WndProcThunk));
      self->hwnd_ = hwnd;
      return self->HandleMessage(msg, wp, lp);
    }
    return DefWindowProc(hwnd, msg, wp, lp);
  }

  static LRESULT CALLBACK WndProcThunk(HWND hwnd, UINT msg, WPARAM wp, LPARAM lp) {
    auto* self = reinterpret_cast<OverlayWindow*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));
    return self ? self->HandleMessage(msg, wp, lp) : DefWindowProc(hwnd, msg, wp, lp);
  }

  LRESULT HandleMessage(UINT msg, WPARAM wp, LPARAM lp) {
    switch (msg) {
      case WM_PAINT:
        Paint();
        return 0;
      case WM_ERASEBKGND:
        return 1;
      case WM_LBUTTONDOWN:
        OnMouseDown(GET_X_LPARAM(lp), GET_Y_LPARAM(lp));
        return 0;
      case WM_LBUTTONDBLCLK:
        OnDoubleClick(GET_X_LPARAM(lp), GET_Y_LPARAM(lp));
        return 0;
      case WM_MOUSEMOVE:
        OnMouseMove(GET_X_LPARAM(lp), GET_Y_LPARAM(lp));
        return 0;
      case WM_LBUTTONUP:
        OnMouseUp(GET_X_LPARAM(lp), GET_Y_LPARAM(lp));
        return 0;
      case WM_RBUTTONDOWN:
        if (mode_ == Mode::Idle) Hide();
        else ResetInteraction();
        InvalidateRect(hwnd_, nullptr, FALSE);
        return 0;
      case WM_KEYDOWN:
        if (wp == VK_ESCAPE) Hide();
        return 0;
      case WM_SETCURSOR:
        SetCursor(CursorForPoint(lastPoint_));
        return TRUE;
    }
    return DefWindowProc(hwnd_, msg, wp, lp);
  }

  // Lifecycle and buffers ----------------------------------------------------

  void ResetInteraction() {
    mode_ = Mode::Idle;
    dragKind_ = DragKind::None;
    resizeHandle_ = 0;
    rect_ = {};
    dragStart_ = {};
    startRect_ = {};
    hasLastMagnifierRect_ = false;
    hasLastSelectionPaintRect_ = false;
    hasPendingSelectionDirty_ = false;
  }

  void Hide() {
    ReleaseCapture();
    ResetInteraction();
    ShowWindow(hwnd_, SW_HIDE);
  }

  void ReleaseBackBuffer() {
    if (backBufferDc_) {
      if (backBufferOldBitmap_) {
        SelectObject(backBufferDc_, backBufferOldBitmap_);
        backBufferOldBitmap_ = nullptr;
      }
      DeleteDC(backBufferDc_);
      backBufferDc_ = nullptr;
    }
    if (backBufferBitmap_) {
      DeleteObject(backBufferBitmap_);
      backBufferBitmap_ = nullptr;
    }
    backBufferWidth_ = 0;
    backBufferHeight_ = 0;

    if (baseBufferDc_) {
      if (baseBufferOldBitmap_) {
        SelectObject(baseBufferDc_, baseBufferOldBitmap_);
        baseBufferOldBitmap_ = nullptr;
      }
      DeleteDC(baseBufferDc_);
      baseBufferDc_ = nullptr;
    }
    if (baseBufferBitmap_) {
      DeleteObject(baseBufferBitmap_);
      baseBufferBitmap_ = nullptr;
    }
    baseBufferWidth_ = 0;
    baseBufferHeight_ = 0;

    if (rawBufferDc_) {
      if (rawBufferOldBitmap_) {
        SelectObject(rawBufferDc_, rawBufferOldBitmap_);
        rawBufferOldBitmap_ = nullptr;
      }
      DeleteDC(rawBufferDc_);
      rawBufferDc_ = nullptr;
    }
    if (rawBufferBitmap_) {
      DeleteObject(rawBufferBitmap_);
      rawBufferBitmap_ = nullptr;
    }
    rawBufferWidth_ = 0;
    rawBufferHeight_ = 0;
  }

  void EnsureBackBuffer() {
    if (backBufferDc_ && backBufferBitmap_ &&
        backBufferWidth_ == capture_.width &&
        backBufferHeight_ == capture_.height &&
        baseBufferDc_ && baseBufferBitmap_ &&
        baseBufferWidth_ == capture_.width &&
        baseBufferHeight_ == capture_.height &&
        rawBufferDc_ && rawBufferBitmap_ &&
        rawBufferWidth_ == capture_.width &&
        rawBufferHeight_ == capture_.height) {
      return;
    }
    ReleaseBackBuffer();
    HDC screen = GetDC(nullptr);
    backBufferDc_ = CreateCompatibleDC(screen);
    backBufferBitmap_ = CreateCompatibleBitmap(screen, capture_.width, capture_.height);
    baseBufferDc_ = CreateCompatibleDC(screen);
    baseBufferBitmap_ = CreateCompatibleBitmap(screen, capture_.width, capture_.height);
    rawBufferDc_ = CreateCompatibleDC(screen);
    rawBufferBitmap_ = CreateCompatibleBitmap(screen, capture_.width, capture_.height);
    ReleaseDC(nullptr, screen);
    backBufferOldBitmap_ = SelectObject(backBufferDc_, backBufferBitmap_);
    baseBufferOldBitmap_ = SelectObject(baseBufferDc_, baseBufferBitmap_);
    rawBufferOldBitmap_ = SelectObject(rawBufferDc_, rawBufferBitmap_);
    backBufferWidth_ = capture_.width;
    backBufferHeight_ = capture_.height;
    baseBufferWidth_ = capture_.width;
    baseBufferHeight_ = capture_.height;
    rawBufferWidth_ = capture_.width;
    rawBufferHeight_ = capture_.height;
  }

  // Geometry -----------------------------------------------------------------

  RECT NormalizeRect(RECT rect) const {
    RECT out{};
    out.left = std::min<LONG>(rect.left, rect.right);
    out.right = std::max<LONG>(rect.left, rect.right);
    out.top = std::min<LONG>(rect.top, rect.bottom);
    out.bottom = std::max<LONG>(rect.top, rect.bottom);
    return out;
  }

  RECT LimitRect(RECT rect) const {
    rect = NormalizeRect(rect);
    int width = std::max(MIN_SIZE, static_cast<int>(rect.right - rect.left));
    int height = std::max(MIN_SIZE, static_cast<int>(rect.bottom - rect.top));
    rect.left = ClampInt(static_cast<int>(rect.left), 0, std::max(0, capture_.width - width));
    rect.top = ClampInt(static_cast<int>(rect.top), 0, std::max(0, capture_.height - height));
    rect.right = rect.left + width;
    rect.bottom = rect.top + height;
    return rect;
  }

  RECT ToolbarRect() const {
    return ToolbarRectFor(rect_);
  }

  RECT ToolbarRectFor(RECT rect) const {
    RECT tb{};
    rect = NormalizeRect(rect);
    tb.left = ClampInt(static_cast<int>(rect.right) - TOOLBAR_WIDTH, 8, std::max(8, capture_.width - TOOLBAR_WIDTH - 8));
    tb.top = rect.bottom + TOOLBAR_HEIGHT + 10 < capture_.height
        ? rect.bottom + 10
        : std::max(8, static_cast<int>(rect.top) - TOOLBAR_HEIGHT - 10);
    tb.right = tb.left + TOOLBAR_WIDTH;
    tb.bottom = tb.top + TOOLBAR_HEIGHT;
    return tb;
  }

  RECT ConfirmRect() const {
    RECT tb = ToolbarRect();
    return { tb.left + 5, tb.top + 4, tb.left + 37, tb.top + 34 };
  }

  RECT CancelRect() const {
    RECT tb = ToolbarRect();
    return { tb.left + 39, tb.top + 4, tb.left + 71, tb.top + 34 };
  }

  RECT ClampRectToCapture(RECT rect) const {
    rect.left = ClampInt(static_cast<int>(rect.left), 0, capture_.width);
    rect.right = ClampInt(static_cast<int>(rect.right), 0, capture_.width);
    rect.top = ClampInt(static_cast<int>(rect.top), 0, capture_.height);
    rect.bottom = ClampInt(static_cast<int>(rect.bottom), 0, capture_.height);
    return rect;
  }

  RECT InflatePaintRect(RECT rect, int padding) const {
    rect.left -= padding;
    rect.top -= padding;
    rect.right += padding;
    rect.bottom += padding;
    return ClampRectToCapture(rect);
  }

  RECT MagnifierRectForPoint(POINT p) const {
    int left = p.x + 18 + MAG_SIZE < capture_.width ? p.x + 18 : p.x - MAG_SIZE - 18;
    int top = p.y + 18 + MAG_SIZE + 50 < capture_.height ? p.y + 18 : p.y - MAG_SIZE - 58;
    left = ClampInt(left, 8, std::max(8, capture_.width - MAG_SIZE - 8));
    top = ClampInt(top, 8, std::max(8, capture_.height - MAG_SIZE - 58));
    return { left, top, left + MAG_SIZE, top + MAG_SIZE + 50 };
  }

  RECT SelectionPaintRect(RECT rect) const {
    rect = NormalizeRect(rect);
    return InflatePaintRect(rect, HANDLE_SIZE + 4);
  }

  RECT SelectionPaintRect(RECT rect, bool includeToolbar) const {
    RECT paintRect = SelectionPaintRect(rect);
    if (includeToolbar) {
      RECT toolbar = InflatePaintRect(ToolbarRectFor(rect), 4);
      RECT combined{};
      UnionRect(&combined, &paintRect, &toolbar);
      paintRect = ClampRectToCapture(combined);
    }
    return paintRect;
  }

  void InvalidateSelectionMove(RECT previousRect, RECT nextRect, bool includeToolbar) {
    RECT oldRect = hasLastSelectionPaintRect_
        ? lastSelectionPaintRect_
        : SelectionPaintRect(previousRect, includeToolbar);
    RECT newRect = SelectionPaintRect(nextRect, includeToolbar);
    RECT dirty{};
    UnionRect(&dirty, &oldRect, &newRect);
    pendingSelectionDirty_ = dirty;
    hasPendingSelectionDirty_ = true;
    lastSelectionPaintRect_ = newRect;
    hasLastSelectionPaintRect_ = true;
    InvalidateRect(hwnd_, &dirty, FALSE);
    UpdateWindow(hwnd_);
  }

  void InvalidateMagnifierMove(POINT previousPoint, POINT nextPoint) {
    RECT oldRect = hasLastMagnifierRect_
        ? lastMagnifierRect_
        : MagnifierRectForPoint(previousPoint);
    RECT newRect = MagnifierRectForPoint(nextPoint);
    oldRect = InflatePaintRect(oldRect, 2);
    newRect = InflatePaintRect(newRect, 2);
    RECT dirty{};
    UnionRect(&dirty, &oldRect, &newRect);
    pendingMagnifierDirty_ = dirty;
    hasPendingMagnifierDirty_ = true;
    InvalidateRect(hwnd_, &dirty, FALSE);
    lastMagnifierRect_ = newRect;
    hasLastMagnifierRect_ = true;
    UpdateWindow(hwnd_);
  }

  // Hit testing and cursors --------------------------------------------------

  int HitHandle(POINT p) const {
    if (mode_ != Mode::Selected) return 0;
    const POINT points[8] = {
        {rect_.left, rect_.top},
        {(rect_.left + rect_.right) / 2, rect_.top},
        {rect_.right, rect_.top},
        {rect_.right, (rect_.top + rect_.bottom) / 2},
        {rect_.right, rect_.bottom},
        {(rect_.left + rect_.right) / 2, rect_.bottom},
        {rect_.left, rect_.bottom},
        {rect_.left, (rect_.top + rect_.bottom) / 2},
    };
    for (int i = 0; i < 8; ++i) {
      RECT r{points[i].x - HANDLE_SIZE, points[i].y - HANDLE_SIZE,
             points[i].x + HANDLE_SIZE, points[i].y + HANDLE_SIZE};
      if (PtInRect(&r, p)) return i + 1;
    }
    return 0;
  }

  HCURSOR CursorOrFallback(HCURSOR cursor, LPCWSTR fallback) const {
    return cursor ? cursor : LoadCursor(nullptr, fallback);
  }

  void LoadCustomCursors() {
    const std::wstring cursorDir = GetEnvString(L"AICANVAS_CURSOR_DIR");
    cursorPrecision_ = LoadCursorFile(cursorDir, L"precision-small.cur");
    cursorMove_ = LoadCursorFile(cursorDir, L"move-small.cur");
    cursorResizeNwse_ = LoadCursorFile(cursorDir, L"dgn1-small.cur");
    cursorResizeNesw_ = LoadCursorFile(cursorDir, L"dgn2-small.cur");
    cursorResizeNs_ = LoadCursorFile(cursorDir, L"vert-small.cur");
    cursorResizeEw_ = LoadCursorFile(cursorDir, L"horz-small.cur");
  }

  void DestroyCustomCursors() {
    DestroyLoadedCursor(cursorPrecision_);
    DestroyLoadedCursor(cursorMove_);
    DestroyLoadedCursor(cursorResizeNwse_);
    DestroyLoadedCursor(cursorResizeNesw_);
    DestroyLoadedCursor(cursorResizeNs_);
    DestroyLoadedCursor(cursorResizeEw_);
  }

  HCURSOR CursorForPoint(POINT p) const {
    const int handle = HitHandle(p);
    if (handle == 1 || handle == 5) {
      return CursorOrFallback(cursorResizeNwse_, IDC_SIZENWSE);
    }
    if (handle == 3 || handle == 7) {
      return CursorOrFallback(cursorResizeNesw_, IDC_SIZENESW);
    }
    if (handle == 2 || handle == 6) {
      return CursorOrFallback(cursorResizeNs_, IDC_SIZENS);
    }
    if (handle == 4 || handle == 8) {
      return CursorOrFallback(cursorResizeEw_, IDC_SIZEWE);
    }
    if (mode_ == Mode::Selected && PtInRect(&rect_, p)) {
      return CursorOrFallback(cursorMove_, IDC_SIZEALL);
    }
    return CursorOrFallback(cursorPrecision_, IDC_CROSS);
  }

  // Mouse interaction --------------------------------------------------------

  void OnMouseDown(int x, int y) {
    POINT p{x, y};
    lastPoint_ = p;
    SetCapture(hwnd_);
    if (mode_ == Mode::Selected) {
      if (PtInRect(&ConfirmRect(), p)) {
        Confirm();
        return;
      }
      if (PtInRect(&CancelRect(), p)) {
        Hide();
        return;
      }
      const int handle = HitHandle(p);
      if (handle) {
        dragKind_ = DragKind::Resize;
        resizeHandle_ = handle;
        dragStart_ = p;
        startRect_ = rect_;
        lastSelectionPaintRect_ = SelectionPaintRect(rect_, true);
        hasLastSelectionPaintRect_ = true;
        return;
      }
      if (PtInRect(&rect_, p)) {
        dragKind_ = DragKind::Move;
        dragStart_ = p;
        startRect_ = rect_;
        lastSelectionPaintRect_ = SelectionPaintRect(rect_, true);
        hasLastSelectionPaintRect_ = true;
        return;
      }
    }
    if (mode_ == Mode::Idle) {
      mode_ = Mode::Selecting;
      dragKind_ = DragKind::Select;
      dragStart_ = p;
      rect_ = {x, y, x, y};
      RECT oldMagnifier = hasLastMagnifierRect_
          ? lastMagnifierRect_
          : MagnifierRectForPoint(lastPoint_);
      RECT newSelection = SelectionPaintRect(rect_);
      RECT dirty{};
      UnionRect(&dirty, &oldMagnifier, &newSelection);
      pendingSelectionDirty_ = InflatePaintRect(dirty, 2);
      hasPendingSelectionDirty_ = true;
      lastSelectionPaintRect_ = newSelection;
      hasLastSelectionPaintRect_ = true;
      InvalidateRect(hwnd_, &pendingSelectionDirty_, FALSE);
      UpdateWindow(hwnd_);
    }
  }

  void OnMouseMove(int x, int y) {
    POINT p{ClampInt(x, 0, capture_.width), ClampInt(y, 0, capture_.height)};
    POINT previousPoint = lastPoint_;
    lastPoint_ = p;
    if (dragKind_ == DragKind::Select) {
      RECT previousRect = rect_;
      rect_ = NormalizeRect({dragStart_.x, dragStart_.y, p.x, p.y});
      InvalidateSelectionMove(previousRect, rect_, false);
      return;
    } else if (dragKind_ == DragKind::Move) {
      RECT previousRect = rect_;
      const int dx = p.x - dragStart_.x;
      const int dy = p.y - dragStart_.y;
      rect_ = LimitRect({startRect_.left + dx, startRect_.top + dy,
                         startRect_.right + dx, startRect_.bottom + dy});
      InvalidateSelectionMove(previousRect, rect_, true);
      return;
    } else if (dragKind_ == DragKind::Resize) {
      RECT previousRect = rect_;
      RECT next = startRect_;
      if (resizeHandle_ == 1 || resizeHandle_ == 7 || resizeHandle_ == 8) next.left = p.x;
      if (resizeHandle_ == 3 || resizeHandle_ == 4 || resizeHandle_ == 5) next.right = p.x;
      if (resizeHandle_ == 1 || resizeHandle_ == 2 || resizeHandle_ == 3) next.top = p.y;
      if (resizeHandle_ == 5 || resizeHandle_ == 6 || resizeHandle_ == 7) next.bottom = p.y;
      rect_ = LimitRect(next);
      InvalidateSelectionMove(previousRect, rect_, true);
      return;
    } else if (mode_ == Mode::Idle) {
      InvalidateMagnifierMove(previousPoint, p);
      return;
    } else if (dragKind_ == DragKind::None) {
      return;
    }
    InvalidateRect(hwnd_, nullptr, FALSE);
  }

  void OnMouseUp(int, int) {
    ReleaseCapture();
    if (dragKind_ == DragKind::Select) {
      rect_ = LimitRect(rect_);
      if (rect_.right - rect_.left < MIN_SIZE || rect_.bottom - rect_.top < MIN_SIZE) {
        ResetInteraction();
      } else {
        mode_ = Mode::Selected;
        lastSelectionPaintRect_ = SelectionPaintRect(rect_, true);
        hasLastSelectionPaintRect_ = true;
      }
    }
    dragKind_ = DragKind::None;
    InvalidateRect(hwnd_, nullptr, FALSE);
  }

  void OnDoubleClick(int x, int y) {
    POINT p{x, y};
    lastPoint_ = p;
    if (mode_ == Mode::Selected && PtInRect(&rect_, p)) {
      Confirm();
    }
  }

  // Pixel and bitmap drawing -------------------------------------------------

  Color PixelAt(int x, int y) const {
    if (x < 0 || y < 0 || x >= capture_.width || y >= capture_.height) return Color(0, 0, 0);
    const size_t index = (static_cast<size_t>(y) * capture_.width + x) * 4;
    return Color(capture_.bgra[index + 2], capture_.bgra[index + 1], capture_.bgra[index]);
  }

  std::vector<BYTE> CopyMagnifierPatch(int sx, int sy) const {
    std::vector<BYTE> patch(static_cast<size_t>(MAG_SOURCE) * MAG_SOURCE * 4);
    if (capture_.bgra.empty() || capture_.width <= 0 || capture_.height <= 0) return patch;
    sx = ClampInt(sx, 0, std::max(0, capture_.width - MAG_SOURCE));
    sy = ClampInt(sy, 0, std::max(0, capture_.height - MAG_SOURCE));
    for (int row = 0; row < MAG_SOURCE; ++row) {
      const auto* src = capture_.bgra.data() +
          (static_cast<size_t>(sy + row) * capture_.width + sx) * 4;
      auto* dst = patch.data() + static_cast<size_t>(row) * MAG_SOURCE * 4;
      memcpy(dst, src, static_cast<size_t>(MAG_SOURCE) * 4);
    }
    return patch;
  }

  void DrawBitmap(HDC hdc, const RECT& target) {
    const int width = std::max(0L, target.right - target.left);
    const int height = std::max(0L, target.bottom - target.top);
    if (width <= 0 || height <= 0) return;
    BITMAPINFO bmi{};
    bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bmi.bmiHeader.biWidth = capture_.width;
    bmi.bmiHeader.biHeight = -capture_.height;
    bmi.bmiHeader.biPlanes = 1;
    bmi.bmiHeader.biBitCount = 32;
    bmi.bmiHeader.biCompression = BI_RGB;
    StretchDIBits(
        hdc,
        target.left,
        target.top,
        width,
        height,
        target.left,
        target.top,
        width,
        height,
        capture_.bgra.data(),
        &bmi,
        DIB_RGB_COLORS,
        SRCCOPY);
  }

  void RenderIdleBaseBuffer() {
    EnsureBackBuffer();
    if (!baseBufferDc_ || !rawBufferDc_) return;
    RECT full{0, 0, capture_.width, capture_.height};
    DrawBitmap(rawBufferDc_, full);
    BitBlt(baseBufferDc_, 0, 0, capture_.width, capture_.height, rawBufferDc_, 0, 0, SRCCOPY);
    Graphics graphics(baseBufferDc_);
    graphics.SetSmoothingMode(SmoothingModeAntiAlias);
    SolidBrush dim(Color(95, 0, 0, 0));
    graphics.FillRectangle(&dim, 0, 0, capture_.width, capture_.height);
    graphics.Flush(FlushIntentionSync);
  }

  void DrawSelectionChrome(Graphics& graphics) {
    if (mode_ != Mode::Selecting && mode_ != Mode::Selected) return;
    Pen border(Color(255, 32, 201, 151), 1);
    SolidBrush fill(Color(24, 255, 255, 255));
    graphics.FillRectangle(&fill, rect_.left, rect_.top, rect_.right - rect_.left, rect_.bottom - rect_.top);
    graphics.DrawRectangle(&border, rect_.left, rect_.top, rect_.right - rect_.left, rect_.bottom - rect_.top);
  }

  void DrawMagnifier(HDC hdc, Graphics& graphics) {
    if (mode_ != Mode::Idle) return;
    RECT magRect = MagnifierRectForPoint(lastPoint_);
    int left = magRect.left;
    int top = magRect.top;
    lastMagnifierRect_ = magRect;
    hasLastMagnifierRect_ = true;

    const int sx = ClampInt(lastPoint_.x - MAG_SOURCE / 2, 0, std::max(0, capture_.width - MAG_SOURCE));
    const int sy = ClampInt(lastPoint_.y - MAG_SOURCE / 2, 0, std::max(0, capture_.height - MAG_SOURCE));
    const std::vector<BYTE> patch = CopyMagnifierPatch(sx, sy);
    BITMAPINFO bmi{};
    bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bmi.bmiHeader.biWidth = MAG_SOURCE;
    bmi.bmiHeader.biHeight = -MAG_SOURCE;
    bmi.bmiHeader.biPlanes = 1;
    bmi.bmiHeader.biBitCount = 32;
    bmi.bmiHeader.biCompression = BI_RGB;
    SetStretchBltMode(hdc, COLORONCOLOR);
    StretchDIBits(hdc, left, top, MAG_SIZE, MAG_SIZE, 0, 0, MAG_SOURCE, MAG_SOURCE,
                  patch.data(), &bmi, DIB_RGB_COLORS, SRCCOPY);

    Pen pen(Color(255, 32, 201, 151), 1);
    graphics.DrawRectangle(&pen, left, top, MAG_SIZE, MAG_SIZE);
    graphics.DrawLine(&pen, left + MAG_SIZE / 2, top, left + MAG_SIZE / 2, top + MAG_SIZE);
    graphics.DrawLine(&pen, left, top + MAG_SIZE / 2, left + MAG_SIZE, top + MAG_SIZE / 2);

    SolidBrush panel(Color(235, 22, 27, 34));
    graphics.FillRectangle(&panel, left, top + MAG_SIZE, MAG_SIZE, 50);
    FontFamily family(L"Consolas");
    Font font(&family, 13, FontStyleRegular, UnitPixel);
    SolidBrush text(Color(255, 248, 250, 252));
    Color px = PixelAt(lastPoint_.x, lastPoint_.y);
    std::wstringstream ss;
    ss << L"POS: (" << capture_.bounds.left + lastPoint_.x << L", "
       << capture_.bounds.top + lastPoint_.y << L")\nRGB: ("
       << static_cast<int>(px.GetRed()) << L"," << static_cast<int>(px.GetGreen())
       << L"," << static_cast<int>(px.GetBlue()) << L")";
    graphics.DrawString(ss.str().c_str(), -1, &font, PointF(static_cast<REAL>(left + 7), static_cast<REAL>(top + MAG_SIZE + 6)), &text);
  }

  // Paint pipeline -----------------------------------------------------------

  void Paint() {
    PAINTSTRUCT ps{};
    HDC hdc = BeginPaint(hwnd_, &ps);
    EnsureBackBuffer();
    if (!backBufferDc_) {
      EndPaint(hwnd_, &ps);
      return;
    }

    RECT dirty = ClampRectToCapture(ps.rcPaint);
    if (dirty.right <= dirty.left || dirty.bottom <= dirty.top) {
      dirty = {0, 0, capture_.width, capture_.height};
    }
    if (mode_ == Mode::Idle && hasPendingMagnifierDirty_) {
      RECT combined{};
      UnionRect(&combined, &dirty, &pendingMagnifierDirty_);
      dirty = ClampRectToCapture(combined);
      hasPendingMagnifierDirty_ = false;
    }

    if (mode_ == Mode::Idle && baseBufferDc_) {
      BitBlt(
          backBufferDc_,
          dirty.left,
          dirty.top,
          dirty.right - dirty.left,
          dirty.bottom - dirty.top,
          baseBufferDc_,
          dirty.left,
          dirty.top,
          SRCCOPY);
      Graphics graphics(backBufferDc_);
      graphics.SetSmoothingMode(SmoothingModeAntiAlias);
      graphics.SetClip(
          Rect(dirty.left, dirty.top, dirty.right - dirty.left, dirty.bottom - dirty.top),
          CombineModeReplace);
      DrawMagnifier(backBufferDc_, graphics);
      graphics.Flush(FlushIntentionSync);
      BitBlt(hdc, dirty.left, dirty.top, dirty.right - dirty.left, dirty.bottom - dirty.top, backBufferDc_, dirty.left, dirty.top, SRCCOPY);
      EndPaint(hwnd_, &ps);
      return;
    }

    if ((mode_ == Mode::Selecting || mode_ == Mode::Selected) &&
        hasPendingSelectionDirty_ &&
        baseBufferDc_ &&
        rawBufferDc_) {
      if (hasPendingSelectionDirty_) {
        RECT combined{};
        UnionRect(&combined, &dirty, &pendingSelectionDirty_);
        dirty = ClampRectToCapture(combined);
        hasPendingSelectionDirty_ = false;
      }
      BitBlt(
          backBufferDc_,
          dirty.left,
          dirty.top,
          dirty.right - dirty.left,
          dirty.bottom - dirty.top,
          baseBufferDc_,
          dirty.left,
          dirty.top,
          SRCCOPY);
      RECT reveal{};
      if (IntersectRect(&reveal, &dirty, &rect_)) {
        BitBlt(
            backBufferDc_,
            reveal.left,
            reveal.top,
            reveal.right - reveal.left,
            reveal.bottom - reveal.top,
            rawBufferDc_,
            reveal.left,
            reveal.top,
            SRCCOPY);
      }
      {
        Graphics graphics(backBufferDc_);
        graphics.SetSmoothingMode(SmoothingModeAntiAlias);
        graphics.SetClip(
            Rect(dirty.left, dirty.top, dirty.right - dirty.left, dirty.bottom - dirty.top),
            CombineModeReplace);
        DrawSelectionChrome(graphics);
        if (mode_ == Mode::Selected) {
          DrawHandles(graphics);
          DrawToolbar(graphics);
        }
        graphics.Flush(FlushIntentionSync);
      }
      BitBlt(hdc, dirty.left, dirty.top, dirty.right - dirty.left, dirty.bottom - dirty.top, backBufferDc_, dirty.left, dirty.top, SRCCOPY);
      EndPaint(hwnd_, &ps);
      return;
    }

    if (rawBufferDc_) {
      BitBlt(backBufferDc_, 0, 0, capture_.width, capture_.height, rawBufferDc_, 0, 0, SRCCOPY);
    } else {
      RECT full{0, 0, capture_.width, capture_.height};
      DrawBitmap(backBufferDc_, full);
    }
    {
      Graphics graphics(backBufferDc_);
      graphics.SetSmoothingMode(SmoothingModeAntiAlias);
      SolidBrush dim(Color(95, 0, 0, 0));
      graphics.FillRectangle(&dim, 0, 0, capture_.width, rect_.top);
      graphics.FillRectangle(&dim, 0, rect_.bottom, capture_.width, capture_.height - rect_.bottom);
      graphics.FillRectangle(&dim, 0, rect_.top, rect_.left, rect_.bottom - rect_.top);
      graphics.FillRectangle(&dim, rect_.right, rect_.top, capture_.width - rect_.right, rect_.bottom - rect_.top);
      DrawSelectionChrome(graphics);
      if (mode_ == Mode::Selected) {
        DrawHandles(graphics);
        DrawToolbar(graphics);
      }
      graphics.Flush(FlushIntentionSync);
    }
    BitBlt(hdc, 0, 0, capture_.width, capture_.height, backBufferDc_, 0, 0, SRCCOPY);
    EndPaint(hwnd_, &ps);
  }

  // Selection chrome ---------------------------------------------------------

  void DrawHandles(Graphics& graphics) {
    SolidBrush fill(Color(255, 22, 27, 34));
    Pen border(Color(255, 32, 201, 151), 1);
    const POINT points[8] = {
        {rect_.left, rect_.top}, {(rect_.left + rect_.right) / 2, rect_.top},
        {rect_.right, rect_.top}, {rect_.right, (rect_.top + rect_.bottom) / 2},
        {rect_.right, rect_.bottom}, {(rect_.left + rect_.right) / 2, rect_.bottom},
        {rect_.left, rect_.bottom}, {rect_.left, (rect_.top + rect_.bottom) / 2}};
    for (const auto& p : points) {
      graphics.FillEllipse(&fill, p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      graphics.DrawEllipse(&border, p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    }
  }

  void DrawToolbar(Graphics& graphics) {
    RECT tb = ToolbarRect();
    SolidBrush panel(Color(245, 22, 27, 34));
    graphics.FillRectangle(&panel, tb.left, tb.top, tb.right - tb.left, tb.bottom - tb.top);
    FontFamily family(L"Segoe UI");
    Font font(&family, 22, FontStyleRegular, UnitPixel);
    SolidBrush green(Color(255, 32, 201, 151));
    SolidBrush red(Color(255, 239, 68, 68));
    graphics.DrawString(L"\u2713", -1, &font, PointF(static_cast<REAL>(ConfirmRect().left + 8), static_cast<REAL>(ConfirmRect().top + 1)), &green);
    graphics.DrawString(L"\u00D7", -1, &font, PointF(static_cast<REAL>(CancelRect().left + 8), static_cast<REAL>(CancelRect().top + 1)), &red);
  }

  // Capture output -----------------------------------------------------------

  std::vector<BYTE> CropPngBytes() const {
    const int w = rect_.right - rect_.left;
    const int h = rect_.bottom - rect_.top;
    if (w <= 0 || h <= 0) return {};
    Bitmap bitmap(w, h, PixelFormat32bppARGB);
    BitmapData data{};
    Rect lockRect(0, 0, w, h);
    if (bitmap.LockBits(&lockRect, ImageLockModeWrite, PixelFormat32bppARGB, &data) != Ok) return {};
    for (int row = 0; row < h; ++row) {
      auto* dst = static_cast<BYTE*>(data.Scan0) + row * data.Stride;
      const auto* src = capture_.bgra.data() +
          (static_cast<size_t>(rect_.top + row) * capture_.width + rect_.left) * 4;
      memcpy(dst, src, static_cast<size_t>(w) * 4);
    }
    bitmap.UnlockBits(&data);
    CLSID clsid{};
    if (GetEncoderClsid(L"image/png", &clsid) < 0) return {};
    IStream* stream = nullptr;
    if (CreateStreamOnHGlobal(nullptr, TRUE, &stream) != S_OK || !stream) return {};
    bitmap.Save(stream, &clsid, nullptr);
    std::vector<BYTE> bytes = StreamToBytes(stream);
    stream->Release();
    return bytes;
  }

  void Confirm() {
    mode_ = Mode::Busy;
    std::vector<BYTE> png = CropPngBytes();
    if (!png.empty()) {
      std::cout << "{\"type\":\"capture\",\"mimeType\":\"image/png\",\"pngBase64\":\""
                << Base64Encode(png) << "\"}" << std::endl;
      std::cout.flush();
    }
    Hide();
  }

  HINSTANCE instance_ = nullptr;
  HWND hwnd_ = nullptr;
  CaptureData capture_{};
  Mode mode_ = Mode::Idle;
  DragKind dragKind_ = DragKind::None;
  int resizeHandle_ = 0;
  RECT rect_{};
  RECT startRect_{};
  POINT dragStart_{};
  POINT lastPoint_{};
  RECT lastMagnifierRect_{};
  RECT pendingMagnifierDirty_{};
  RECT lastSelectionPaintRect_{};
  RECT pendingSelectionDirty_{};
  bool hasLastMagnifierRect_ = false;
  bool hasPendingMagnifierDirty_ = false;
  bool hasLastSelectionPaintRect_ = false;
  bool hasPendingSelectionDirty_ = false;
  HDC backBufferDc_ = nullptr;
  HBITMAP backBufferBitmap_ = nullptr;
  HGDIOBJ backBufferOldBitmap_ = nullptr;
  int backBufferWidth_ = 0;
  int backBufferHeight_ = 0;
  HDC baseBufferDc_ = nullptr;
  HBITMAP baseBufferBitmap_ = nullptr;
  HGDIOBJ baseBufferOldBitmap_ = nullptr;
  int baseBufferWidth_ = 0;
  int baseBufferHeight_ = 0;
  HDC rawBufferDc_ = nullptr;
  HBITMAP rawBufferBitmap_ = nullptr;
  HGDIOBJ rawBufferOldBitmap_ = nullptr;
  int rawBufferWidth_ = 0;
  int rawBufferHeight_ = 0;
  HCURSOR cursorPrecision_ = nullptr;
  HCURSOR cursorMove_ = nullptr;
  HCURSOR cursorResizeNwse_ = nullptr;
  HCURSOR cursorResizeNesw_ = nullptr;
  HCURSOR cursorResizeNs_ = nullptr;
  HCURSOR cursorResizeEw_ = nullptr;
};

}  // namespace

int main() {
  SetProcessDpiAwarenessContext(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);
  GdiplusStartupInput gdiplusInput;
  if (GdiplusStartup(&g_gdiplusToken, &gdiplusInput, nullptr) != Ok) return 2;
  HINSTANCE instance = GetModuleHandle(nullptr);
  OverlayWindow overlay;
  if (!overlay.Create(instance)) return 3;
  const HotkeyConfig hotkey = ReadHotkeyConfigFromEnv();
  if (!RegisterHotKey(nullptr, HOTKEY_ID, hotkey.modifiers, hotkey.virtualKey)) {
    std::cout << "{\"type\":\"status\",\"registered\":false}" << std::endl;
    std::cout.flush();
  } else {
    std::cout << "{\"type\":\"status\",\"registered\":true}" << std::endl;
    std::cout.flush();
  }

  MSG msg{};
  while (GetMessage(&msg, nullptr, 0, 0) > 0) {
    if (msg.message == WM_HOTKEY && msg.wParam == HOTKEY_ID) {
      if (overlay.IsVisible()) overlay.Focus();
      else overlay.Start();
      continue;
    }
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }
  UnregisterHotKey(nullptr, HOTKEY_ID);
  GdiplusShutdown(g_gdiplusToken);
  return 0;
}
