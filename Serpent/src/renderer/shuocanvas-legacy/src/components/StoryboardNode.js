import a546_0x42b4cc from "../core/stores/appStore.js";
import { generateId } from "../core/math.js";
import { buildStoryboardGridTemplate, getStoryboardCellIndexAtWorldPoint, isStoryboardCellEmpty, normalizeEmptyStoryboardCell, normalizeStoryboardGridGap, resolveStoryboardCellSourceIndex, resolveStoryboardGridLayout, resolveStoryboardCellPreviewSrc } from "../core/storyboardCellUtils.js";
import { createStoryboardToolbar, setStoryboardSplitLinesButtonContent, storyboardToolbarText } from "./storyboard/storyboardToolbar.js";
import { closeStoryboardToolbarMenu, createStoryboardFloatingMenu, mountStoryboardToolbarMenu } from "./storyboard/storyboardToolbarMenu.js";
import { STORYBOARD_ASPECT_MENU_OPTIONS, STORYBOARD_GRID_MENU_OPTIONS } from "./storyboard/storyboardMenuOptions.js";
import { buildReusableStoryboardCellImageMap, createStoryboardCellContentNode } from "./storyboard/storyboardCellContent.js";
import { appendStoryboardCellElements, rebuildStoryboardGridCellElements } from "./storyboard/storyboardCellDom.js";
import { updateStoryboardCellDOM } from "./storyboard/storyboardCellDomUpdate.js";
import { getStoryboardBackdropImageUrl, getStoryboardCellDisplayImageUrl, getStoryboardCellLiveSourceImageUrl, getStoryboardCellResidualImageUrl, getStoryboardCellSourceDisplayUrl, getStoryboardCellSourceImageUrl, getStoryboardPuzzleSourceImageUrl, normalizeStoryboardLocalImageUrl } from "./storyboard/storyboardAssetRefs.js";
import { createStoryboardBackdropImage, syncStoryboardBackdropImage } from "./storyboard/storyboardBackdrop.js";
import { adjustAdjacentStoryboardGridTracks, buildStoryboardActiveGridNode, buildStoryboardBaseGridLayout, getStoryboardActiveCellLayoutBounds, getStoryboardBaseCellLayoutBounds, getStoryboardCellCutoutRect, getStoryboardCustomGridLinePosition, hasCustomStoryboardGridLayout, isDefaultStoryboardTrackList, isSameStoryboardGridLayout } from "./storyboard/storyboardGridLayoutState.js";
import { bindStoryboardNodeEvents } from "./storyboard/storyboardEvents.js";
import { getImageElementSource, getLoadedStoryboardSourceImageForCell, isExpectedImageSource, isLoadedImageElement, loadStoryboardSourceImage, resolveStoryboardCommitSourceImage } from "./storyboard/storyboardImageRuntime.js";
import { buildStoryboardMaterializedCellCrop, cropStoryboardCellFromSource, materializeStoryboardCellsForConfirmedGrid, materializeStoryboardSourceBackedCellsForEditing } from "./storyboard/storyboardSourceMaterialize.js";
import { applyStoryboardCellLayoutStyles, applyStoryboardDefaultCellImageStyles, applyStoryboardEmptyCutoutStyles, applyStoryboardEmptyResidualImageStyles, applyStoryboardSourceCropImageStyles, captureStoryboardCellVisualState, syncStoryboardSourceCacheImage } from "./storyboard/storyboardCellStyles.js";
import { applyStoryboardCustomGridLineSize, removeStoryboardCustomGridOverlay, renderStoryboardCustomGridOverlay } from "./storyboard/storyboardCustomGridOverlay.js";
import { beginStoryboardCustomGridLineDrag, buildStoryboardCustomGridDragDraft, endStoryboardCustomGridLineDrag } from "./storyboard/storyboardCustomGridDrag.js";
import { bindStoryboardSplitLinesMenuDismiss, createStoryboardSplitLinesMenu } from "./storyboard/storyboardSplitLinesMenu.js";
import { composeStoryboardNode, drawStoryboardComposeCell, getStoryboardComposeCellDisplayUrl, getStoryboardComposeCellImageElement } from "./storyboard/storyboardComposeFlow.js";
import { applyImmediateStoryboardCellSwap } from "./storyboard/storyboardCellSwapDom.js";
import { createStoryboardCollapsedBadge, createStoryboardContainer, createStoryboardGridElement, createStoryboardHint, createStoryboardScaleWrap } from "./storyboard/storyboardMountDom.js";
import { isStoryboardEditingOnlyDisplayUpdate } from "./storyboard/storyboardUpdateGuards.js";
import { buildStoryboardCollapsePatch, calculateStoryboardDimsByAspect } from "./storyboard/storyboardCollapseState.js";
import { normalizeStoryboardUpdateData, syncStoryboardEditingHint, syncStoryboardToolbarLabels, updateStoryboardCellsForDataChange } from "./storyboard/storyboardUpdateFlow.js";
import { clearInlineStoryboardThumbUrls } from "./storyboard/storyboardThumbnailBackfill.js";
export class StoryboardNode {
  constructor(_0x35b81f) {
    try {
      this._data = structuredClone(_0x35b81f);
    } catch (_0x9447ae) {
      this._data = JSON.parse(JSON.stringify(_0x35b81f));
    }
    if (!Array.isArray(this._data.cells)) {
      this._data.cells = [];
    }
    this.id = this._data.id;
    this.el = document.createElement("div");
    this.el.className = "v2-node-component storyboard-node";
    this.el.id = "sb-node-" + this.id;
    this._isEditing = !!this._data.isEditing;
    this._isCollapsed = !!this._data.isCollapsed;
    this._isComposing = false;
    this._isCustomGridEditing = false;
    this._isCustomGridConfirming = false;
    this._customGridDraft = null;
    this._customGridDraftGap = null;
    this._customGridDrag = null;
    this._customGridKeydownHandler = null;
    this._customGridRefreshVersion = 0;
    this._customGridFrozenCellStyles = null;
    this._backdropEl = null;
    if (this._isEditing) {
      this.el.classList.add("is-editing-mode");
    } else {
      this.el.classList.remove("is-editing-mode");
    }
  }
  _setSplitLinesButtonContent(_0x2a5ff5) {
    setStoryboardSplitLinesButtonContent(_0x2a5ff5);
  }
  mount() {
    const _0x484619 = this.el;
    const _0x274afd = this._data;
    _0x484619.replaceChildren();
    const _0x4a9e21 = createStoryboardToolbar({
      data: _0x274afd,
      isEditing: this._isEditing,
      isCollapsed: this._isCollapsed
    });
    _0x484619.appendChild(_0x4a9e21);
    const _0x25ceed = createStoryboardScaleWrap();
    const _0x5cac12 = createStoryboardContainer();
    const _0x2debce = this._getBaseGridLayout(_0x274afd);
    const _0x581522 = createStoryboardGridElement(_0x2debce);
    const _0x426d1e = _0x274afd.cells || [];
    const _0x50158e = appendStoryboardCellElements({
      grid: _0x581522,
      nodeId: this.id,
      cells: _0x426d1e,
      createContentNode: (_0x5f3734, _0x2ba10d) => this._createCellContentNode(_0x5f3734, _0x2ba10d),
      applyCellCropStyles: (_0x209407, _0xb7af51, _0x30b91f) => this._applyCellCropStyles(_0x209407, _0xb7af51, _0x30b91f)
    });
    _0x5cac12.appendChild(_0x581522);
    if (this._isCollapsed) {
      _0x5cac12.appendChild(createStoryboardCollapsedBadge((_0x274afd.cols || 2) * (_0x274afd.rows || 2)));
    }
    _0x25ceed.appendChild(_0x5cac12);
    _0x484619.appendChild(_0x25ceed);
    _0x484619.appendChild(createStoryboardHint(this._isEditing));
    this._container = _0x5cac12;
    this._grid = _0x581522;
    this._cellEls = _0x50158e;
    this._syncBackdropImage();
    this._syncCustomGridOverlay();
    this._updateGridGapButtonState();
    this._updateCustomGridButtonState();
    this._initEvents();
    this._ensureThumbnails();
    return _0x484619;
  }
  async _ensureThumbnails() {
    const _0x52dd3d = clearInlineStoryboardThumbUrls(this._data.cells || []);
    if (_0x52dd3d) {
      a546_0x42b4cc.updateNodeData(this.id, {
        cells: _0x52dd3d
      });
    }
  }
  _getCellFinalUrl(_0x4994ad) {
    return resolveStoryboardCellPreviewSrc(_0x4994ad);
  }
  _isCellEmpty(_0x446041) {
    return isStoryboardCellEmpty(_0x446041);
  }
  _normalizeLocalImageUrl(_0x148552) {
    return normalizeStoryboardLocalImageUrl(_0x148552);
  }
  _getCellSourceImageUrl(_0x38d587) {
    return getStoryboardCellSourceImageUrl(_0x38d587);
  }
  _getCellLiveSourceImageUrl(_0x441fdd) {
    return getStoryboardCellLiveSourceImageUrl(_0x441fdd, this._data);
  }
  _getCellSourceDisplayUrl(_0x53c4b4) {
    return getStoryboardCellSourceDisplayUrl(_0x53c4b4, this._data);
  }
  _getCellDisplayImageUrl(_0xace381) {
    return getStoryboardCellDisplayImageUrl(_0xace381, this._data);
  }
  _getCellSourceIndex(_0x1b2938, _0x48e1d1) {
    return resolveStoryboardCellSourceIndex(_0x1b2938, _0x48e1d1, this._data);
  }
  _getStoryboardPuzzleSourceImageUrl() {
    return getStoryboardPuzzleSourceImageUrl(this._data);
  }
  _getCellResidualImageUrl(_0x1a2e8f) {
    return getStoryboardCellResidualImageUrl(_0x1a2e8f);
  }
  _getStoryboardBackdropImageUrl() {
    return getStoryboardBackdropImageUrl(this._data);
  }
  _createBackdropImage(_0x128235 = this._getStoryboardBackdropImageUrl()) {
    return createStoryboardBackdropImage(_0x128235);
  }
  _syncBackdropImage(_0x49a427 = this._container) {
    this._backdropEl = syncStoryboardBackdropImage({
      container: _0x49a427,
      grid: this._grid,
      backdropEl: this._backdropEl,
      nextUrl: this._getStoryboardBackdropImageUrl()
    });
  }
  _getGridGap() {
    return normalizeStoryboardGridGap(this._data?.gridGap);
  }
  _loadStoryboardSourceImage(_0x3d228e) {
    return loadStoryboardSourceImage(_0x3d228e);
  }
  _isLoadedImageElement(_0x2de202) {
    return isLoadedImageElement(_0x2de202);
  }
  _getImageElementSource(_0x43e092) {
    return getImageElementSource(_0x43e092);
  }
  _isExpectedImageSource(_0x450239, _0x10c911 = "") {
    return isExpectedImageSource(_0x450239, _0x10c911);
  }
  _getLoadedSourceImageForCell(_0x1ea897, _0x309b9e = "") {
    return getLoadedStoryboardSourceImageForCell({
      cellEls: this._cellEls,
      backdropEl: this._backdropEl,
      index: _0x1ea897,
      sourceUrl: _0x309b9e
    });
  }
  _buildMaterializedCellCrop(_0x2885f0, _0x514f2a, _0xb4b65b) {
    return buildStoryboardMaterializedCellCrop({
      cell: _0x2885f0,
      index: _0x514f2a,
      img: _0xb4b65b,
      sourceNode: this._getActiveGridNode()
    });
  }
  _materializeSourceBackedCellsForEditing() {
    return materializeStoryboardSourceBackedCellsForEditing({
      node: this._getActiveGridNode(),
      cells: this._data.cells,
      getLoadedSourceImageForCell: (_0x3ded3c, _0x203f37) => this._getLoadedSourceImageForCell(_0x3ded3c, _0x203f37)
    });
  }
  async _resolveCommitSourceImage(_0x52ef34, _0x2cf06e, _0x5a7dc7) {
    return resolveStoryboardCommitSourceImage({
      index: _0x52ef34,
      sourceUrl: _0x2cf06e,
      imageCache: _0x5a7dc7,
      cellEls: this._cellEls,
      backdropEl: this._backdropEl,
      loadImage: _0x2b1b15 => this._loadStoryboardSourceImage(_0x2b1b15)
    });
  }
  async _cropStoryboardCellFromSource(_0x316cf0, _0x3c5c27, _0x1e8f6d, _0x3a35a0) {
    return cropStoryboardCellFromSource({
      cell: _0x316cf0,
      index: _0x3c5c27,
      sourceNode: _0x1e8f6d,
      imageCache: _0x3a35a0,
      resolveSourceImage: (_0x2a14fb, _0x3569ac, _0x4923e) => this._resolveCommitSourceImage(_0x2a14fb, _0x3569ac, _0x4923e)
    });
  }
  async _materializeCellsForConfirmedGrid(_0x5740c8, _0x5b4a49, _0x30fbb2 = null) {
    return materializeStoryboardCellsForConfirmedGrid({
      node: this._data,
      gridLayout: _0x5740c8,
      gridGap: _0x5b4a49,
      cellsOverride: _0x30fbb2,
      cropCell: (_0x169061, _0x584bf1, _0x54566e, _0x4d6483) => this._cropStoryboardCellFromSource(_0x169061, _0x584bf1, _0x54566e, _0x4d6483)
    });
  }
  async _refreshSourceBackedCellsForLayout(_0x1bfd4b, _0x5aa3f7 = null) {
    const {
      cells: _0x52110c
    } = await this._materializeCellsForConfirmedGrid(_0x1bfd4b, this._getGridGap(), _0x5aa3f7);
    return _0x52110c;
  }
  _isSourceCropCell(_0x402adc) {
    return !!this._getCellSourceImageUrl(_0x402adc);
  }
  _applyDefaultCellImageStyles(_0x1ca26f, _0x5c3a14, _0x32cd04) {
    applyStoryboardDefaultCellImageStyles(_0x1ca26f, _0x5c3a14, _0x32cd04);
  }
  _applySourceCropImageStyles(_0x1089a1, _0x3e3f73, _0x4bcdae, _0x121556) {
    applyStoryboardSourceCropImageStyles({
      img: _0x1089a1,
      cell: _0x3e3f73,
      index: _0x4bcdae,
      sourceUrl: _0x121556,
      node: this._data,
      sourceIndex: this._getCellSourceIndex(_0x3e3f73, _0x4bcdae),
      isLoadedImageElement: _0x4d8fac => this._isLoadedImageElement(_0x4d8fac),
      onImageLoad: () => this._applySourceCropImageStyles(_0x1089a1, _0x3e3f73, _0x4bcdae, _0x121556)
    });
  }
  _applyCellCropStyles(_0x15c333, _0x106f61, _0x45ebb7) {
    if (!_0x15c333) {
      return;
    }
    this._applyEmptyResidualStyles(_0x15c333, _0x106f61, _0x45ebb7);
    const _0xbaf8b5 = Array.from(_0x15c333.querySelectorAll?.(".storyboard-cell-img") || []).find(_0x2c513c => !_0x2c513c.classList?.contains?.("storyboard-empty-residual-img") && !_0x2c513c.classList?.contains?.("storyboard-cell-source-cache"));
    if (!_0xbaf8b5) {
      return;
    }
    const _0x272044 = this._getCellSourceDisplayUrl(_0x106f61);
    if (_0x272044) {
      this._applySourceCropImageStyles(_0xbaf8b5, _0x106f61, _0x45ebb7, _0x272044);
      this._syncSourceCacheImage(_0x15c333, _0x106f61, _0x272044);
      return;
    }
    const _0x286cac = this._getCellLiveSourceImageUrl(_0x106f61);
    if (_0x286cac) {
      this._syncSourceCacheImage(_0x15c333, _0x106f61, _0x286cac);
    } else {
      this._syncSourceCacheImage(_0x15c333, _0x106f61);
    }
    const _0x2958b9 = this._getCellFinalUrl(_0x106f61);
    this._applyDefaultCellImageStyles(_0xbaf8b5, _0x2958b9, _0x106f61);
  }
  _syncSourceCacheImage(_0x2f58db, _0x19c507, _0xdacca = "", _0x7460b0 = null) {
    const _0x4771e4 = String(_0xdacca || this._getCellSourceImageUrl(_0x19c507) || "").trim();
    syncStoryboardSourceCacheImage({
      cellEl: _0x2f58db,
      sourceUrl: _0x4771e4,
      onReady: _0x7460b0,
      isLoadedImageElement: _0x41ba3e => this._isLoadedImageElement(_0x41ba3e)
    });
  }
  _applyAllCellCropStyles() {
    if (!this._cellEls) {
      return;
    }
    const _0x5ed8c7 = this._data.cells || [];
    this._cellEls.forEach((_0x20374b, _0x1716d7) => {
      this._applyCellCropStyles(_0x20374b, _0x5ed8c7[_0x1716d7], _0x1716d7);
    });
  }
  _getActiveGridNode() {
    return buildStoryboardActiveGridNode(this._data, this._getGridGap());
  }
  _getBaseGridLayout(_0x2e6ee8 = this._data) {
    return buildStoryboardBaseGridLayout(_0x2e6ee8);
  }
  _getCellLayoutBounds(_0x2fef30) {
    return getStoryboardActiveCellLayoutBounds(this._data, _0x2fef30, this._getGridGap());
  }
  _getBaseCellLayoutBounds(_0x2292d0) {
    return getStoryboardBaseCellLayoutBounds(this._data, _0x2292d0);
  }
  _getCellCutoutRect(_0x4c12db) {
    return getStoryboardCellCutoutRect(this._data, _0x4c12db, this._getGridGap());
  }
  _applyEmptyCutoutStyles(_0x376fbb, _0x448480) {
    applyStoryboardEmptyCutoutStyles(_0x376fbb, _0x448480);
  }
  _applyEmptyResidualImageStyles(_0x268105, _0x17b328, _0x1522ad) {
    const _0x4147ed = _0x268105?.querySelector?.(".storyboard-empty-residual-img");
    applyStoryboardEmptyResidualImageStyles({
      img: _0x4147ed,
      cell: _0x17b328,
      node: this._data,
      activeBounds: this._getCellLayoutBounds(_0x1522ad)
    });
  }
  _applyEmptyResidualStyles(_0x3439db, _0x2cc9f3, _0x4664c7) {
    this._applyEmptyResidualImageStyles(_0x3439db, _0x2cc9f3, _0x4664c7);
    const _0x3db869 = _0x3439db?.querySelector?.(".storyboard-empty-residual") || null;
    if (!_0x3db869) {
      return;
    }
    this._applyEmptyCutoutStyles(_0x3db869, _0x4664c7);
  }
  _applyCellLayoutStyles(_0x35ed01, _0x2e8eeb) {
    applyStoryboardCellLayoutStyles({
      cellEl: _0x35ed01,
      isCustomGridEditing: this._isCustomGridEditing,
      frozen: this._customGridFrozenCellStyles?.[_0x2e8eeb],
      bounds: this._getCellLayoutBounds(_0x2e8eeb)
    });
  }
  _applyAllCellLayoutStyles() {
    if (!this._cellEls) {
      return;
    }
    this._cellEls.forEach((_0x1443f3, _0x291922) => {
      this._applyCellLayoutStyles(_0x1443f3, _0x291922);
    });
  }
  _captureCustomGridCellVisualState() {
    this._customGridFrozenCellStyles = captureStoryboardCellVisualState(this._cellEls);
  }
  _restoreCustomGridCellVisualState() {
    if (!this._cellEls || !this._customGridFrozenCellStyles) {
      return;
    }
    this._cellEls.forEach((_0x3ec64a, _0x57996c) => {
      this._applyCellLayoutStyles(_0x3ec64a, _0x57996c);
    });
  }
  _createCellContentNode(_0x350b49, _0xbbb782 = 0) {
    return createStoryboardCellContentNode({
      cell: _0x350b49,
      finalUrl: this._getCellDisplayImageUrl(_0x350b49),
      residualUrl: this._getCellResidualImageUrl(_0x350b49),
      index: _0xbbb782
    });
  }
  _buildReusableCellImageMap() {
    return buildReusableStoryboardCellImageMap(this._cellEls);
  }
  _renderCells() {}
  _updateCellDOM(_0x30a113, _0x5f7dc0, _0x38c6ec = null) {
    const _0x4c2378 = Number(_0x30a113?.dataset?.index) || 0;
    updateStoryboardCellDOM({
      cellEl: _0x30a113,
      cell: _0x5f7dc0,
      reusableImageMap: _0x38c6ec,
      getCellDisplayImageUrl: _0x154e03 => this._getCellDisplayImageUrl(_0x154e03),
      getCellResidualImageUrl: _0x57f4b4 => this._getCellResidualImageUrl(_0x57f4b4),
      createContentNode: _0x3640e2 => this._createCellContentNode(_0x3640e2),
      applyCropStyles: () => this._applyCellCropStyles(_0x30a113, _0x5f7dc0, _0x4c2378)
    });
  }
  _initEvents() {
    bindStoryboardNodeEvents(this, {
      store: a546_0x42b4cc,
      normalizeEmptyCell: normalizeEmptyStoryboardCell
    });
  }
  _getActiveGridLayout() {
    return resolveStoryboardGridLayout(this._data);
  }
  _getCustomGridOverlayLayout() {
    if (this._isCustomGridEditing && this._customGridDraft) {
      return resolveStoryboardGridLayout({
        cols: this._data.cols,
        rows: this._data.rows,
        gridLayout: this._customGridDraft
      });
    }
    return resolveStoryboardGridLayout(this._data);
  }
  _getCustomGridDraftGap() {
    const _0x277f41 = Number(this._customGridDraftGap);
    if (Number.isFinite(_0x277f41)) {
      return normalizeStoryboardGridGap(_0x277f41, this._getGridGap());
    }
    return this._getGridGap();
  }
  _applyGridLayout() {
    if (this._isCustomGridEditing && this._customGridFrozenCellStyles) {
      this._restoreCustomGridCellVisualState();
      return;
    }
    const _0x534e0a = this._grid || this.el.querySelector(".cells-grid");
    if (!_0x534e0a) {
      return;
    }
    const _0x973807 = this._getBaseGridLayout();
    _0x534e0a.style.gridTemplateColumns = buildStoryboardGridTemplate(_0x973807.columns, _0x973807.cols);
    _0x534e0a.style.gridTemplateRows = buildStoryboardGridTemplate(_0x973807.rowTracks, _0x973807.rows);
    _0x534e0a.style.gap = "0px";
    this._applyAllCellLayoutStyles();
    this._applyAllCellCropStyles();
  }
  _isTrackListEqual(_0x5ade78) {
    return isDefaultStoryboardTrackList(_0x5ade78);
  }
  _hasCustomGridLayout(_0x43ed43 = resolveStoryboardGridLayout(this._data)) {
    return hasCustomStoryboardGridLayout(_0x43ed43);
  }
  _isEditingOnlyDisplayUpdate(_0x4c2336 = {}, _0x58795c = {}) {
    return isStoryboardEditingOnlyDisplayUpdate(_0x4c2336, _0x58795c, {
      isCellEmpty: _0x4b5a94 => this._isCellEmpty(_0x4b5a94),
      getCellDisplayImageUrl: _0x4a2708 => this._getCellDisplayImageUrl(_0x4a2708),
      getCellSourceImageUrl: _0x474145 => this._getCellSourceImageUrl(_0x474145),
      getCellLiveSourceImageUrl: _0x4e99a5 => this._getCellLiveSourceImageUrl(_0x4e99a5)
    });
  }
  _isSameGridLayout(_0x255397, _0x464ea7) {
    return isSameStoryboardGridLayout(_0x255397, _0x464ea7);
  }
  _refreshSourceBackedCellsForLayoutInBackground(_0x484820, _0x433644) {
    if (typeof Image !== "function" && this._refreshSourceBackedCellsForLayout === StoryboardNode.prototype._refreshSourceBackedCellsForLayout) {
      return;
    }
    if (!Array.isArray(_0x433644) || !_0x433644.some(_0x2486e5 => !this._isCellEmpty(_0x2486e5)) || !this._getStoryboardPuzzleSourceImageUrl()) {
      return;
    }
    const _0x189e12 = ++this._customGridRefreshVersion;
    this._refreshSourceBackedCellsForLayout(_0x484820, _0x433644).then(_0x1ce51e => {
      if (!_0x1ce51e || _0x189e12 !== this._customGridRefreshVersion) {
        return;
      }
      const _0x4bfb37 = typeof a546_0x42b4cc.getStateRaw === "function" ? a546_0x42b4cc.getStateRaw() : a546_0x42b4cc.getState();
      const _0xec616b = _0x4bfb37?.nodes?.[this.id];
      if (!_0xec616b || !this._isSameGridLayout(_0xec616b, _0x484820)) {
        return;
      }
      const _0x296c4d = Array.isArray(_0xec616b.cells) ? _0xec616b.cells : [];
      const _0x4dbfa9 = _0x296c4d.map((_0x59d556, _0x5a564a) => {
        const _0x4c8fd5 = _0x433644[_0x5a564a];
        const _0x4e3a1c = _0x1ce51e[_0x5a564a];
        if (!_0x59d556 || !_0x4c8fd5 || !_0x4e3a1c) {
          return _0x59d556;
        }
        if (_0x59d556.id !== _0x4c8fd5.id) {
          return _0x59d556;
        }
        if (this._isCellEmpty(_0x59d556)) {
          return _0x59d556;
        }
        return {
          ..._0x59d556,
          ..._0x4e3a1c
        };
      });
      a546_0x42b4cc.updateNodeData(this.id, {
        cells: _0x4dbfa9
      });
    }).catch(_0x89136e => {
      console.error("[Storyboard] Custom grid crop refresh failed:", _0x89136e);
      if (typeof window !== "undefined") {
        window.showToast?.(storyboardToolbarText("customGridPartialRefreshFailed"), "warning");
      }
    });
  }
  _shouldShowCustomGridOverlay(_0x263967 = this._getActiveGridLayout()) {
    if (this._isCustomGridEditing) {
      return true;
    }
    return _0x263967.cols > 1 || _0x263967.rows > 1;
  }
  _syncCustomGridOverlay({
    applyLayout = true
  } = {}) {
    const _0x1c5883 = this._getCustomGridOverlayLayout();
    if (applyLayout) {
      this._applyGridLayout();
    } else if (this._isCustomGridEditing && this._customGridFrozenCellStyles) {
      this._restoreCustomGridCellVisualState();
    }
    if (this._shouldShowCustomGridOverlay(_0x1c5883)) {
      this._renderCustomGridHandles({
        editable: this._isCustomGridEditing,
        layout: _0x1c5883
      });
    } else {
      this._removeCustomGridHandles();
    }
  }
  _updateCustomGridButtonState() {
    const _0x21b751 = this.el.querySelector(".act-split-lines");
    if (!_0x21b751) {
      return;
    }
    _0x21b751.classList.toggle("active", this._isCustomGridEditing);
    _0x21b751.classList.remove("is-confirm");
    _0x21b751.disabled = this._isCustomGridConfirming;
    _0x21b751.dataset.tooltip = this._isCustomGridConfirming ? storyboardToolbarText("applying") : this._isCustomGridEditing ? storyboardToolbarText("finishAdjust") : storyboardToolbarText("adjustSplitLines");
    _0x21b751.setAttribute("aria-label", this._isCustomGridConfirming ? storyboardToolbarText("applyingSplitLines") : this._isCustomGridEditing ? storyboardToolbarText("finishAdjustSplitLines") : storyboardToolbarText("adjustSplitLines"));
    this._setSplitLinesButtonContent(_0x21b751);
  }
  _updateGridGapButtonState() {
    const _0x48d785 = this.el.querySelector(".act-split-lines");
    if (!_0x48d785) {
      return;
    }
    if (this._isCustomGridEditing) {
      return;
    }
    _0x48d785.dataset.tooltip = storyboardToolbarText("adjustSplitLines");
    _0x48d785.setAttribute("aria-label", storyboardToolbarText("adjustSplitLines"));
  }
  _setCustomGridHint(_0x485c29) {
    const _0x215b0b = this.el.querySelector(".v2-storyboard-hint");
    if (!_0x215b0b) {
      return;
    }
    if (_0x485c29) {
      _0x215b0b.textContent = storyboardToolbarText("customGridHint");
      return;
    }
    _0x215b0b.textContent = this._isEditing ? storyboardToolbarText("editHint") : storyboardToolbarText("enterEditHint");
  }
  _enterCustomGridEdit() {
    if (this._isCollapsed || this._isCustomGridConfirming) {
      return false;
    }
    this._closeMenu();
    if (this._isEditing) {
      this._toggleEdit(false);
    }
    const _0x7faf45 = resolveStoryboardGridLayout(this._data);
    this._isCustomGridEditing = true;
    this._customGridDraftGap = this._getGridGap();
    this._customGridDraft = {
      columns: [..._0x7faf45.columns],
      rows: [..._0x7faf45.rowTracks]
    };
    this._captureCustomGridCellVisualState();
    this.el.classList.add("is-custom-grid-mode");
    this._bindCustomGridKeyboard();
    this._syncCustomGridOverlay({
      applyLayout: false
    });
    this._updateCustomGridButtonState();
    this._setCustomGridHint(true);
    return true;
  }
  async _confirmCustomGridEdit() {
    if (!this._isCustomGridEditing || this._isCustomGridConfirming) {
      return;
    }
    this._isCustomGridConfirming = true;
    this._updateCustomGridButtonState();
    const _0xf17bfa = this._getNormalizedCustomGridDraft();
    const _0x381a3d = this._getCustomGridDraftGap();
    const _0x426d15 = Array.isArray(this._data.cells) ? this._data.cells : [];
    try {
      const _0x5e1dbe = {
        gridGap: _0x381a3d,
        gridLayout: _0xf17bfa
      };
      this._data = {
        ...this._data,
        ..._0x5e1dbe
      };
      a546_0x42b4cc.updateNodeData(this.id, _0x5e1dbe);
      this._exitCustomGridEdit();
      this._refreshSourceBackedCellsForLayoutInBackground(_0xf17bfa, _0x426d15);
    } finally {
      if (this._isCustomGridEditing) {
        this._isCustomGridConfirming = false;
        this._updateCustomGridButtonState();
      }
    }
  }
  _cancelCustomGridEdit() {
    if (!this._isCustomGridEditing || this._isCustomGridConfirming) {
      return;
    }
    this._exitCustomGridEdit();
    this._closeMenu();
  }
  _isSplitLinesMenuMounted() {
    return this._activeMenu === "split-lines" && !!this._menuEl && this._menuEl.classList?.contains("storyboard-split-lines-menu");
  }
  _showSplitLinesMenu(_0x37ec52) {
    if (!_0x37ec52) {
      return;
    }
    this._closeMenu({
      force: true
    });
    this._activeMenu = "split-lines";
    _0x37ec52.classList.add("active");
    const _0x2972ad = createStoryboardSplitLinesMenu({
      getGap: () => this._getCustomGridDraftGap(),
      onGapChange: _0x412fb2 => {
        this._customGridDraftGap = _0x412fb2;
        this._syncCustomGridOverlay({
          applyLayout: false
        });
      }
    });
    this._mountToolbarMenu(_0x2972ad, _0x37ec52);
    this._dismissHandler = bindStoryboardSplitLinesMenuDismiss({
      menu: _0x2972ad,
      anchor: _0x37ec52,
      shouldKeepOpen: () => this._isCustomGridEditing,
      onDismiss: () => this._closeMenu()
    });
  }
  _exitCustomGridEdit() {
    const _0x314244 = this._activeMenu === "split-lines";
    this._endCustomGridLineDrag();
    this._isCustomGridEditing = false;
    this._isCustomGridConfirming = false;
    this._customGridDraft = null;
    this._customGridDraftGap = null;
    this._customGridFrozenCellStyles = null;
    this.el.classList.remove("is-custom-grid-mode");
    this._unbindCustomGridKeyboard();
    this._syncCustomGridOverlay();
    this._updateCustomGridButtonState();
    this._setCustomGridHint(false);
    if (_0x314244) {
      this._closeMenu({
        force: true
      });
    }
  }
  _updateEditButtonState() {
    const _0x2e0ccf = this.el.querySelector(".act-edit");
    if (!_0x2e0ccf) {
      return;
    }
    _0x2e0ccf.classList.toggle("active", this._isEditing);
    _0x2e0ccf.dataset.tooltip = this._isEditing ? storyboardToolbarText("exitEdit") : storyboardToolbarText("edit");
    _0x2e0ccf.setAttribute("aria-label", this._isEditing ? storyboardToolbarText("exitEdit") : storyboardToolbarText("edit"));
    const _0xb17e6c = _0x2e0ccf.querySelector("span");
    if (_0xb17e6c) {
      _0xb17e6c.textContent = this._isEditing ? storyboardToolbarText("exitEditShort") : storyboardToolbarText("editShort");
    }
  }
  _getNormalizedCustomGridDraft() {
    const _0x27308c = resolveStoryboardGridLayout({
      cols: this._data.cols,
      rows: this._data.rows,
      gridLayout: this._customGridDraft
    });
    return {
      columns: _0x27308c.columns,
      rows: _0x27308c.rowTracks
    };
  }
  _bindCustomGridKeyboard() {
    if (this._customGridKeydownHandler) {
      return;
    }
    this._customGridKeydownHandler = _0x270c90 => {
      if (_0x270c90.key !== "Escape") {
        return;
      }
      _0x270c90.preventDefault?.();
      _0x270c90.stopPropagation?.();
      this._cancelCustomGridEdit();
    };
    document.addEventListener("keydown", this._customGridKeydownHandler, true);
  }
  _unbindCustomGridKeyboard() {
    if (!this._customGridKeydownHandler) {
      return;
    }
    document.removeEventListener("keydown", this._customGridKeydownHandler, true);
    this._customGridKeydownHandler = null;
  }
  _removeCustomGridHandles() {
    this._customGridOverlay = removeStoryboardCustomGridOverlay(this._customGridOverlay);
  }
  _getCustomGridLinePosition(_0x208806, _0x4009f2) {
    return getStoryboardCustomGridLinePosition(_0x208806, _0x4009f2);
  }
  _applyCustomGridLineSize(_0x5b4ed2, _0x192441, _0x55190d) {
    applyStoryboardCustomGridLineSize(_0x5b4ed2, _0x192441, _0x55190d);
  }
  _renderCustomGridHandles({
    editable = this._isCustomGridEditing,
    layout = this._getActiveGridLayout()
  } = {}) {
    const _0x26f204 = this._isCustomGridEditing ? this._getCustomGridDraftGap() : this._getGridGap();
    this._customGridOverlay = renderStoryboardCustomGridOverlay({
      grid: this._grid,
      overlay: this._customGridOverlay,
      editable: editable,
      layout: layout,
      lineSize: _0x26f204,
      getLinePosition: (_0x5106bb, _0x1237d1) => this._getCustomGridLinePosition(_0x5106bb, _0x1237d1),
      onPointerDown: (_0xcd18f2, _0x348f2e, _0x9d0fa0) => this._beginCustomGridLineDrag(_0xcd18f2, _0x348f2e, _0x9d0fa0)
    });
  }
  _beginCustomGridLineDrag(_0x2d4137, _0x900482, _0xc45ddb) {
    if (!this._isCustomGridEditing || !this._grid) {
      return;
    }
    this._customGridDrag = beginStoryboardCustomGridLineDrag({
      event: _0x2d4137,
      axis: _0x900482,
      index: _0xc45ddb,
      grid: this._grid,
      rootEl: this.el,
      layout: this._getCustomGridOverlayLayout(),
      endDrag: () => this._endCustomGridLineDrag(),
      onDragMove: _0x28305f => this._dragCustomGridLine(_0x28305f),
      ensureVisualState: () => {
        if (!this._customGridFrozenCellStyles) {
          this._captureCustomGridCellVisualState();
        }
      }
    });
  }
  _dragCustomGridLine(_0x3bf5b6) {
    const _0x576c32 = buildStoryboardCustomGridDragDraft({
      event: _0x3bf5b6,
      drag: this._customGridDrag,
      draft: this._customGridDraft,
      adjustTracks: (_0x493f7b, _0x50b9cd, _0x34738a) => this._adjustAdjacentGridTracks(_0x493f7b, _0x50b9cd, _0x34738a)
    });
    if (!_0x576c32) {
      return;
    }
    this._customGridDraft = _0x576c32;
    this._syncCustomGridOverlay({
      applyLayout: false
    });
  }
  _adjustAdjacentGridTracks(_0x1f8c6e, _0x70c0d0, _0x153a69) {
    return adjustAdjacentStoryboardGridTracks(_0x1f8c6e, _0x70c0d0, _0x153a69);
  }
  _endCustomGridLineDrag() {
    this._customGridDrag = endStoryboardCustomGridLineDrag({
      drag: this._customGridDrag,
      rootEl: this.el
    });
  }
  _toggleCollapse(_0x28e515) {
    this._isCollapsed = _0x28e515;
    const _0x396d6a = buildStoryboardCollapsePatch(this._data, _0x28e515);
    a546_0x42b4cc.updateNodeData(this.id, _0x396d6a);
  }
  _showAspectMenu(_0x1df485) {
    this._showFloatingMenu(_0x1df485, "aspect", STORYBOARD_ASPECT_MENU_OPTIONS.map(_0x315fdc => ({
      label: _0x315fdc.label,
      icon: _0x315fdc.icon,
      action: () => {
        const _0x3331f0 = this._calculateDimsByAspect(_0x315fdc.label);
        const _0x32f590 = this._data;
        const _0xfa3ac7 = {
          aspectRatio: _0x315fdc.label,
          width: _0x3331f0.w,
          height: _0x3331f0.h
        };
        this._data = {
          ..._0x32f590,
          ..._0xfa3ac7
        };
        syncStoryboardToolbarLabels(this.el, this._data, _0x32f590);
        try {
          a546_0x42b4cc.updateNodeData(this.id, _0xfa3ac7);
        } catch (_0x3c031a) {
          this._data = _0x32f590;
          syncStoryboardToolbarLabels(this.el, _0x32f590, _0xfa3ac7);
          throw _0x3c031a;
        }
      }
    })));
  }
  _showGridMenu(_0x168386) {
    this._showFloatingMenu(_0x168386, "grid", STORYBOARD_GRID_MENU_OPTIONS.map(_0x53307e => ({
      label: _0x53307e.label,
      icon: _0x53307e.icon,
      action: () => {
        this._updateGrid(_0x53307e.cols, _0x53307e.rows);
      }
    })));
  }
  _showFloatingMenu(_0x4e6067, _0x567777, _0x3eeacc) {
    this._closeMenu();
    this._activeMenu = _0x567777;
    const _0x3799ad = _0x4e6067.querySelector(".ftb-chevron");
    if (_0x3799ad) {
      _0x3799ad.style.transform = "rotate(180deg)";
    }
    _0x4e6067.classList.add("active");
    const _0x2ab975 = createStoryboardFloatingMenu(_0x3eeacc, () => this._closeMenu());
    this._mountToolbarMenu(_0x2ab975, _0x4e6067);
    const _0xafd0b1 = _0x33b4ab => {
      if (!_0x2ab975.contains(_0x33b4ab.target) && !_0x4e6067.contains(_0x33b4ab.target)) {
        this._closeMenu();
      }
    };
    this._dismissHandler = _0xafd0b1;
    setTimeout(() => {
      if (this._menuEl !== _0x2ab975) {
        return;
      }
      document.addEventListener("pointerdown", _0xafd0b1);
    }, 10);
  }
  _mountToolbarMenu(_0x199e25, _0x59aa41) {
    this._menuEl = mountStoryboardToolbarMenu(_0x199e25, _0x59aa41);
  }
  _closeMenu({
    force = false
  } = {}) {
    const _0x27c915 = closeStoryboardToolbarMenu({
      rootEl: this.el,
      menuEl: this._menuEl,
      activeMenu: this._activeMenu,
      isCustomGridEditing: this._isCustomGridEditing,
      dismissHandler: this._dismissHandler,
      force: force
    });
    this._menuEl = _0x27c915.menuEl;
    this._activeMenu = _0x27c915.activeMenu;
    this._dismissHandler = _0x27c915.dismissHandler;
  }
  _updateGrid(_0x9abc74, _0x5bdea3) {
    this._customGridRefreshVersion += 1;
    this._exitCustomGridEdit();
    const _0x2b0650 = this._data.cells || [];
    const _0x2f1a97 = this._data.cols || 2;
    const _0x6638b0 = this._data.rows || 2;
    const _0x34cab2 = [];
    for (let _0xaaf217 = 0; _0xaaf217 < _0x5bdea3; _0xaaf217++) {
      for (let _0x3f4b92 = 0; _0x3f4b92 < _0x9abc74; _0x3f4b92++) {
        const _0x531619 = _0xaaf217 * _0x2f1a97 + _0x3f4b92;
        const _0xf17757 = _0xaaf217 < _0x6638b0 && _0x3f4b92 < _0x2f1a97 ? _0x2b0650[_0x531619] : null;
        if (_0xf17757) {
          _0x34cab2.push({
            ..._0xf17757
          });
        } else {
          _0x34cab2.push({
            id: generateId("cell"),
            url: "",
            isEmpty: true
          });
        }
      }
    }
    const _0x8cf1e3 = this._data;
    const _0x51f04d = {
      cols: _0x9abc74,
      rows: _0x5bdea3,
      cells: _0x34cab2,
      gridLayout: null
    };
    this._data = {
      ..._0x8cf1e3,
      ..._0x51f04d
    };
    syncStoryboardToolbarLabels(this.el, this._data, _0x8cf1e3);
    this._rebuildGrid(_0x9abc74, _0x5bdea3, _0x34cab2);
    try {
      a546_0x42b4cc.updateNodeData(this.id, _0x51f04d);
    } catch (_0x74406d) {
      this._data = _0x8cf1e3;
      syncStoryboardToolbarLabels(this.el, _0x8cf1e3, _0x51f04d);
      this._rebuildGrid(_0x8cf1e3.cols || 2, _0x8cf1e3.rows || 2, _0x8cf1e3.cells || []);
      throw _0x74406d;
    }
  }
  _toggleEdit(_0x2dee9d) {
    const _0x122e41 = !!_0x2dee9d;
    if (_0x122e41 && this._isCustomGridEditing) {
      this._cancelCustomGridEdit();
    }
    this._isEditing = _0x122e41;
    this.el.classList.toggle("is-editing-mode", _0x122e41);
    this._updateEditButtonState();
    syncStoryboardEditingHint(this.el, _0x122e41);
    if (this._isCustomGridEditing) {
      this._setCustomGridHint(true);
    }
    const _0x55deb8 = {
      isEditing: _0x122e41
    };
    if (_0x122e41) {
      const _0x4bd4eb = this._getStoryboardBackdropImageUrl();
      const _0x3a08ca = this._materializeSourceBackedCellsForEditing();
      if (_0x3a08ca) {
        _0x55deb8.cells = _0x3a08ca;
        if (_0x4bd4eb) {
          _0x55deb8.storyboardBackdropUrl = _0x4bd4eb;
        }
        this._data = {
          ...this._data,
          cells: _0x3a08ca,
          ...(_0x4bd4eb ? {
            storyboardBackdropUrl: _0x4bd4eb
          } : {})
        };
        this._syncBackdropImage();
        this._applyAllCellCropStyles();
      }
    }
    a546_0x42b4cc.updateNodeData(this.id, _0x55deb8);
  }
  _getComposeCellImageElement(_0x3362dc) {
    return getStoryboardComposeCellImageElement(this._cellEls, _0x3362dc);
  }
  _getComposeCellDisplayUrl(_0x5f5840) {
    return getStoryboardComposeCellDisplayUrl({
      cellEls: this._cellEls,
      cellIndex: _0x5f5840,
      getImageElementSource: _0x119047 => this._getImageElementSource(_0x119047)
    });
  }
  async _drawComposeCell(_0x572819, {
    cell: _0x1c982e,
    cellIndex: _0xe04f2f,
    displayUrl: _0x18831b,
    imageEl: _0x280118,
    target: _0x3490b9,
    loadImage: _0xea2f5b
  }) {
    return drawStoryboardComposeCell(_0x572819, {
      cell: _0x1c982e,
      cellIndex: _0xe04f2f,
      displayUrl: _0x18831b,
      imageEl: _0x280118,
      target: _0x3490b9,
      loadImage: _0xea2f5b,
      cellEls: this._cellEls,
      getImageElementSource: _0x2a7629 => this._getImageElementSource(_0x2a7629)
    });
  }
  async _compose() {
    return composeStoryboardNode({
      node: this._data,
      rootEl: this.el,
      cellEls: this._cellEls,
      isCellEmpty: _0x80f06f => this._isCellEmpty(_0x80f06f),
      getImageElementSource: _0x2bd2b7 => this._getImageElementSource(_0x2bd2b7),
      getBackdropUrl: () => this._getStoryboardBackdropImageUrl(),
      markComposing: _0x4804dc => {
        this._isComposing = _0x4804dc;
      }
    });
  }
  _calculateDimsByAspect(_0x7d260b) {
    return calculateStoryboardDimsByAspect(this._data, _0x7d260b);
  }
  hitTestCell(_0x2c7f8e, _0x2a3bce) {
    if (this._isCollapsed) {
      return -1;
    }
    return getStoryboardCellIndexAtWorldPoint(this._data, _0x2c7f8e, _0x2a3bce);
  }
  highlightCell(_0x55ecb7) {
    if (this._lastHighlightIndex === _0x55ecb7) {
      return;
    }
    this._lastHighlightIndex = _0x55ecb7;
    if (!this._cellEls) {
      return;
    }
    this._cellEls.forEach((_0x5c8cee, _0x41d137) => {
      if (_0x41d137 === _0x55ecb7) {
        _0x5c8cee.classList.add("drag-hover");
      } else {
        _0x5c8cee.classList.remove("drag-hover");
      }
    });
  }
  applyImmediateCellSwap(_0x477820, _0xec249a) {
    return applyImmediateStoryboardCellSwap(this._cellEls, _0x477820, _0xec249a);
  }
  update(_0x1176c3) {
    const _0x32a360 = this._data || {};
    this._data = normalizeStoryboardUpdateData(_0x1176c3);
    if (this._data.isCollapsed !== _0x32a360.isCollapsed) {
      this._exitCustomGridEdit();
      this._isCollapsed = !!this._data.isCollapsed;
      this.mount();
      return;
    }
    if (this._data.isEditing !== _0x32a360.isEditing) {
      this._isEditing = !!this._data.isEditing;
      if (this._isEditing && this._isCustomGridEditing) {
        this._cancelCustomGridEdit();
      }
      this.el.classList.toggle("is-editing-mode", this._isEditing);
      this._updateEditButtonState();
      syncStoryboardEditingHint(this.el, this._isEditing);
      if (this._isEditingOnlyDisplayUpdate(_0x32a360, this._data)) {
        this._syncBackdropImage();
        this._updateGridGapButtonState();
        this._updateCustomGridButtonState();
        return;
      }
    }
    syncStoryboardToolbarLabels(this.el, this._data, _0x32a360);
    if (this._data.cols === _0x32a360.cols && this._data.rows === _0x32a360.rows) {
      const _0x31ea41 = this._data.cells || [];
      const _0x282fe2 = _0x32a360.cells || [];
      updateStoryboardCellsForDataChange({
        cellEls: this._cellEls,
        newCells: _0x31ea41,
        oldCells: _0x282fe2,
        buildReusableImageMap: () => this._buildReusableCellImageMap(),
        updateCellDOM: (_0x27b19b, _0x59ffbf, _0x1f2919) => this._updateCellDOM(_0x27b19b, _0x59ffbf, _0x1f2919),
        applyCellCropStyles: (_0x28fd08, _0x2650a3, _0x203d42) => this._applyCellCropStyles(_0x28fd08, _0x2650a3, _0x203d42),
        renderCells: () => this._renderCells(),
        accessors: {
          isCellEmpty: _0x39a76f => this._isCellEmpty(_0x39a76f),
          getCellDisplayImageUrl: _0xa5fc16 => this._getCellDisplayImageUrl(_0xa5fc16),
          getCellSourceImageUrl: _0x22b965 => this._getCellSourceImageUrl(_0x22b965),
          getCellLiveSourceImageUrl: _0x2b332a => this._getCellLiveSourceImageUrl(_0x2b332a)
        }
      });
    } else {
      this._rebuildGrid(this._data.cols, this._data.rows, this._data.cells);
    }
    this._syncBackdropImage();
    this._syncCustomGridOverlay();
    if (this._isCustomGridEditing) {
      this._setCustomGridHint(true);
    }
    this._updateGridGapButtonState();
    this._updateCustomGridButtonState();
  }
  _rebuildGrid(_0x180cdf, _0xc16c7b, _0x25a03b) {
    const _0x2e7b0e = this.el.querySelector(".cells-grid");
    if (!_0x2e7b0e) {
      return;
    }
    this._grid = _0x2e7b0e;
    this._cellEls = rebuildStoryboardGridCellElements({
      grid: _0x2e7b0e,
      nodeId: this.id,
      cells: _0x25a03b,
      createContentNode: (_0x5dbf35, _0x57ded0) => this._createCellContentNode(_0x5dbf35, _0x57ded0),
      applyCellCropStyles: (_0x41822e, _0x1da823, _0x49952f) => this._applyCellCropStyles(_0x41822e, _0x1da823, _0x49952f)
    });
    this._syncBackdropImage();
    this._syncCustomGridOverlay();
  }
  unmount() {
    this._exitCustomGridEdit();
    this._closeMenu();
    this._removeCustomGridHandles();
  }
}