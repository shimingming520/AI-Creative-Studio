import { t } from "../../../i18n/index.js";
import { createToolbarActionPopupAnchorPositionGetter, positionToolbarActionSubmenuAbove } from "../actionMenu.js";
function multigridText(_0x50e837, _0x4ce942 = {}) {
  return t("nodeToolbar.multigrid." + _0x50e837, _0x4ce942);
}
export function bindImageMultigridAction(_0x3d0014) {
  const {
    toolbarEl: _0x216d34,
    nodeId: _0x6068a1,
    getStateSnapshot: _0x1c26fa,
    store: _0x149a7f,
    generateId: _0x5d6369,
    buildStoryboardNodePayload: _0x50c8ab,
    computePreparedStoryboardSize: _0x18d0d3,
    resolveNearestStoryboardAspect: _0x14a386,
    calcSafeSpawnPosNearNode: _0x199161,
    executeGridCrop: _0x2d122d,
    prepareGridCells: _0x360e39
  } = _0x3d0014;
  const _0x987979 = _0x216d34.querySelector(".act-multigrid");
  if (_0x987979) {
    _0x987979.addEventListener("click", _0x538ce2 => {
      _0x538ce2.stopPropagation();
      _0x538ce2.preventDefault();
      const _0x52bae7 = document.querySelector(".v2-multigrid-popup");
      if (_0x52bae7) {
        const _0x35705b = _0x52bae7.__v2MultigridAnchorBtn && _0x52bae7.__v2MultigridAnchorBtn === _0x987979;
        const _0x24c078 = typeof _0x52bae7.__v2MultigridClose === "function" ? _0x52bae7.__v2MultigridClose : () => _0x52bae7.remove();
        _0x24c078();
        if (_0x35705b) {
          return;
        }
      }
      const _0x19b822 = document.createElement("div");
      _0x19b822.className = "v2-multigrid-popup node-toolbar-action-menu node-toolbar-action-menu--fit";
      _0x19b822.__v2MultigridAnchorBtn = _0x987979;
      const _0x1699b0 = createToolbarActionPopupAnchorPositionGetter(_0x987979);
      const _0x55765e = _0x1699b0();
      Object.assign(_0x19b822.style, {
        position: "fixed",
        left: _0x55765e.left + "px",
        top: _0x55765e.top + "px",
        transform: "translateY(10px)",
        opacity: "0",
        pointerEvents: "none"
      });
      const _0x5e9c69 = document.createElement("div");
      _0x5e9c69.className = "node-toolbar-action-menu-title";
      _0x5e9c69.textContent = multigridText("chooseGrid");
      _0x19b822.appendChild(_0x5e9c69);
      const _0x4c6fad = [{
        id: "grid-4",
        titleKey: "grid4Title",
        descKey: "grid4Desc",
        cols: 2,
        rows: 2,
        svgElements: [{
          tag: "rect",
          attrs: {
            x: "3",
            y: "3",
            width: "7",
            height: "7"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "14",
            y: "3",
            width: "7",
            height: "7"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "14",
            y: "14",
            width: "7",
            height: "7"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "3",
            y: "14",
            width: "7",
            height: "7"
          }
        }]
      }, {
        id: "grid-9",
        titleKey: "grid9Title",
        descKey: "grid9Desc",
        cols: 3,
        rows: 3,
        svgElements: [{
          tag: "rect",
          attrs: {
            x: "3",
            y: "3",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "10",
            y: "3",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "17",
            y: "3",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "3",
            y: "10",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "10",
            y: "10",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "17",
            y: "10",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "3",
            y: "17",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "10",
            y: "17",
            width: "4",
            height: "4"
          }
        }, {
          tag: "rect",
          attrs: {
            x: "17",
            y: "17",
            width: "4",
            height: "4"
          }
        }]
      }, {
        id: "grid-16",
        titleKey: "grid16Title",
        descKey: "grid16Desc",
        cols: 4,
        rows: 4,
        svgElements: [{
          tag: "path",
          attrs: {
            d: "M3 3h18v18H3z"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M7.5 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M12 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M16.5 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 7.5h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 12h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 16.5h18"
          }
        }]
      }, {
        id: "grid-25",
        titleKey: "grid25Title",
        descKey: "grid25Desc",
        cols: 5,
        rows: 5,
        svgElements: [{
          tag: "path",
          attrs: {
            d: "M3 3h18v18H3z"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M6.6 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M10.2 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M13.8 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M17.4 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 6.6h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 10.2h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 13.8h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 17.4h18"
          }
        }]
      }];
      const _0x1d7a0f = "http://www.w3.org/2000/svg";
      const _0x355c09 = 5;
      const _0x2ceccc = (_0x10fcb7, _0x261e31, _0x6a1e3c) => {
        const _0x4da037 = document.createElementNS(_0x1d7a0f, "svg");
        _0x4da037.setAttribute("viewBox", "0 0 24 24");
        _0x4da037.setAttribute("fill", "none");
        _0x4da037.setAttribute("stroke", "currentColor");
        _0x4da037.setAttribute("stroke-width", String(_0x10fcb7));
        _0x4da037.setAttribute("width", String(_0x261e31));
        _0x4da037.setAttribute("height", String(_0x6a1e3c));
        return _0x4da037;
      };
      const _0x6d549a = (_0x3fa541, _0x956de7) => {
        for (const _0x187181 of _0x956de7 || []) {
          if (!_0x187181 || !_0x187181.tag || !_0x187181.attrs) {
            continue;
          }
          const _0x13388e = document.createElementNS(_0x1d7a0f, _0x187181.tag);
          for (const [_0x12af2c, _0x20098a] of Object.entries(_0x187181.attrs)) {
            _0x13388e.setAttribute(_0x12af2c, String(_0x20098a));
          }
          _0x3fa541.appendChild(_0x13388e);
        }
      };
      const _0x3bbd80 = _0x131e1e => {
        _0x131e1e.replaceChildren();
        const _0x447239 = _0x2ceccc(2, 16, 16);
        const _0x248540 = document.createElementNS(_0x1d7a0f, "path");
        _0x248540.setAttribute("d", "M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2");
        _0x447239.appendChild(_0x248540);
        const _0x149fbc = document.createElement("span");
        _0x149fbc.textContent = multigridText("crop");
        _0x131e1e.appendChild(_0x447239);
        _0x131e1e.appendChild(_0x149fbc);
      };
      const _0x2fc815 = _0xccef50 => {
        _0xccef50.replaceChildren();
        const _0x4db150 = _0x2ceccc(2, 16, 16);
        const _0x9fb113 = document.createElementNS(_0x1d7a0f, "path");
        _0x9fb113.setAttribute("d", "M12 5v14M5 12h14");
        _0x4db150.appendChild(_0x9fb113);
        const _0x21f567 = document.createElement("span");
        _0x21f567.textContent = multigridText("create");
        _0xccef50.appendChild(_0x4db150);
        _0xccef50.appendChild(_0x21f567);
      };
      const _0xc13f9e = (_0x4b9a81, _0x10d6f9) => {
        const _0x33315d = Number(_0x4b9a81);
        const _0x17da5c = Number(_0x10d6f9);
        if (!Number.isFinite(_0x33315d) || !Number.isFinite(_0x17da5c) || _0x33315d <= 0 || _0x17da5c <= 0) {
          return null;
        }
        return {
          width: _0x33315d,
          height: _0x17da5c
        };
      };
      const _0x402170 = ({
        nodeData: _0x1f68f8,
        cells: _0x469f6c
      }) => {
        const _0x347616 = Number(_0x1f68f8?.mainImageIndex) || 0;
        const _0x4be900 = Array.isArray(_0x1f68f8?.images) ? _0x1f68f8.images[_0x347616] : null;
        const _0x256255 = [_0xc13f9e(_0x1f68f8?.originalWidth, _0x1f68f8?.originalHeight), _0xc13f9e(_0x1f68f8?.imageWidth, _0x1f68f8?.imageHeight), _0xc13f9e(_0x1f68f8?.imgWidth, _0x1f68f8?.imgHeight), _0xc13f9e(_0x1f68f8?.naturalWidth, _0x1f68f8?.naturalHeight), _0xc13f9e(_0x4be900?.originalWidth, _0x4be900?.originalHeight), _0xc13f9e(_0x4be900?.imageWidth, _0x4be900?.imageHeight), _0xc13f9e(_0x4be900?.width, _0x4be900?.height), _0xc13f9e(_0x469f6c?.[0]?.sourceWidth, _0x469f6c?.[0]?.sourceHeight), _0xc13f9e(_0x1f68f8?.width, _0x1f68f8?.height)];
        return _0x256255.find(Boolean) || {
          width: 1,
          height: 1
        };
      };
      const _0x3dc9fc = async ({
        cols: _0x245417,
        rows: _0x1fb34f
      }) => {
        const _0x1d446e = _0x1c26fa().nodes[_0x6068a1];
        if (!_0x1d446e) {
          throw new Error(multigridText("nodeMissing"));
        }
        const _0x2519a5 = await _0x360e39({
          nodeData: _0x1d446e,
          cols: _0x245417,
          rows: _0x1fb34f
        });
        _0x517f0d();
        const _0x239918 = _0x1c26fa();
        const _0xad686c = _0x239918.nodes[_0x6068a1];
        if (!_0xad686c) {
          return;
        }
        const _0x1a028f = _0x5d6369("storyboard");
        const _0x1fb73a = _0x402170({
          nodeData: _0xad686c,
          cells: _0x2519a5
        });
        const _0x5e2df9 = _0x14a386(_0x1fb73a.width, _0x1fb73a.height);
        const _0x4fa4b9 = _0x18d0d3({
          aspectLabel: _0x5e2df9,
          cols: _0x245417,
          rows: _0x1fb34f,
          sourceWidth: _0x1fb73a.width,
          sourceHeight: _0x1fb73a.height
        });
        const _0x1bf3d9 = _0x199161(_0x239918.nodes, _0xad686c, _0x4fa4b9.width, _0x4fa4b9.height);
        _0x149a7f.addNode(_0x50c8ab({
          id: _0x1a028f,
          name: multigridText("storyboardName"),
          x: _0x1bf3d9.x,
          y: _0x1bf3d9.y,
          width: _0x4fa4b9.width,
          height: _0x4fa4b9.height,
          cells: _0x2519a5,
          cols: _0x245417,
          rows: _0x1fb34f,
          aspectRatio: _0x5e2df9,
          isEditing: false
        }));
        _0x149a7f.setSelectedNodes([_0x1a028f]);
        window._triggerLocalCacheSave?.();
        window.showToast?.(multigridText("storyboardCreated"), "success");
      };
      const _0x3aa045 = async ({
        cols: _0x4f14f1,
        rows: _0x1354fe,
        onBusy: _0x17591c,
        onRestore: _0x135fa4
      }) => {
        const _0x5cdb57 = _0x987979?.querySelector("svg");
        _0x5cdb57?.classList.add("v2-spinning");
        _0x17591c?.();
        try {
          await _0x3dc9fc({
            cols: _0x4f14f1,
            rows: _0x1354fe
          });
        } catch (_0x230801) {
          console.error("[Storyboard] Create failed:", _0x230801);
          const _0x1e9d6f = _0x230801 instanceof Error ? _0x230801.message : String(_0x230801 || multigridText("unknownError"));
          window.showToast?.(multigridText("storyboardFailed", {
            error: _0x1e9d6f
          }), "error");
          _0x135fa4?.();
        } finally {
          _0x5cdb57?.classList.remove("v2-spinning");
        }
      };
      let _0x27a4ec = null;
      let _0xf24345 = () => {};
      const _0x5f38f1 = _0x5085a0 => {
        const _0x5e4215 = document.createElement("div");
        _0x5e4215.className = "node-toolbar-action-menu-item node-toolbar-action-grid-item";
        const _0x552c89 = document.createElement("div");
        _0x552c89.className = "node-toolbar-action-menu-icon";
        const _0x19cff2 = _0x2ceccc(1.5, 24, 24);
        _0x6d549a(_0x19cff2, _0x5085a0.svgElements);
        _0x552c89.appendChild(_0x19cff2);
        _0x5e4215.appendChild(_0x552c89);
        const _0x4edabc = document.createElement("div");
        _0x4edabc.className = "node-toolbar-action-menu-body";
        _0x4edabc.style.flex = "0 0 auto";
        _0x4edabc.style.minWidth = "64px";
        const _0x52daf7 = document.createElement("span");
        _0x52daf7.className = "node-toolbar-action-menu-item-title";
        _0x52daf7.textContent = multigridText(_0x5085a0.titleKey);
        _0x4edabc.appendChild(_0x52daf7);
        const _0x2d9110 = document.createElement("span");
        _0x2d9110.className = "node-toolbar-action-menu-item-desc";
        _0x2d9110.textContent = multigridText(_0x5085a0.descKey);
        _0x4edabc.appendChild(_0x2d9110);
        _0x5e4215.appendChild(_0x4edabc);
        const _0x3f49da = document.createElement("div");
        _0x3f49da.className = "node-toolbar-action-inline-actions";
        const _0x3ce656 = document.createElement("button");
        const _0x566299 = _0x5085a0.cols * _0x5085a0.rows;
        const _0xdb6fd5 = multigridText("cropTooltip", {
          count: _0x566299
        });
        _0x3ce656.type = "button";
        _0x3ce656.setAttribute("aria-label", _0xdb6fd5);
        _0x3ce656.setAttribute("title", _0xdb6fd5);
        _0x3ce656.setAttribute("data-tooltip", _0xdb6fd5);
        _0x3ce656.className = "node-toolbar-action-mini-button";
        _0x3bbd80(_0x3ce656);
        _0x3ce656.onclick = async _0x4b2657 => {
          _0x4b2657.stopPropagation();
          _0x517f0d();
          const _0x478c0d = _0x1c26fa().nodes[_0x6068a1];
          if (!_0x478c0d) {
            window.showToast?.(multigridText("nodeMissing"), "error");
            return;
          }
          const _0x309382 = _0x3ce656.textContent;
          const _0x33a6cf = _0x987979?.querySelector("svg");
          _0x3ce656.textContent = multigridText("cropLoading");
          _0x3ce656.style.pointerEvents = "none";
          _0x33a6cf?.classList.add("v2-spinning");
          try {
            const {
              newIds: _0x55ea1f
            } = await _0x2d122d({
              nodeData: _0x478c0d,
              cols: _0x5085a0.cols,
              rows: _0x5085a0.rows
            });
            if (_0x55ea1f.length > 0) {
              window.showToast?.(multigridText("cropSuccess", {
                count: _0x55ea1f.length
              }), "success");
            } else {
              window.showToast?.(multigridText("cropEmpty"), "error");
            }
          } catch (_0x298ded) {
            console.error("[GridCrop] Execute failed:", _0x298ded);
            const _0x28f2ec = _0x298ded instanceof Error ? _0x298ded.message : String(_0x298ded || multigridText("unknownError"));
            window.showToast?.(_0x28f2ec, "error");
          } finally {
            _0x3ce656.textContent = _0x309382;
            _0x3ce656.style.pointerEvents = "auto";
            _0x33a6cf?.classList.remove("v2-spinning");
          }
        };
        const _0x26dfe1 = document.createElement("button");
        const _0x22b931 = multigridText("createTooltip", {
          cols: _0x5085a0.cols,
          rows: _0x5085a0.rows
        });
        _0x26dfe1.type = "button";
        _0x26dfe1.setAttribute("aria-label", _0x22b931);
        _0x26dfe1.setAttribute("title", _0x22b931);
        _0x26dfe1.setAttribute("data-tooltip", _0x22b931);
        _0x26dfe1.className = "node-toolbar-action-mini-button node-toolbar-action-mini-button--primary";
        _0x2fc815(_0x26dfe1);
        _0x26dfe1.onclick = async _0x5d24f3 => {
          _0x5d24f3.stopPropagation();
          if (_0x26dfe1.disabled) {
            return;
          }
          await _0x3aa045({
            cols: _0x5085a0.cols,
            rows: _0x5085a0.rows,
            onBusy: () => {
              _0x26dfe1.disabled = true;
              _0x26dfe1.textContent = multigridText("createBusy");
            },
            onRestore: () => {
              _0x26dfe1.disabled = false;
              _0x2fc815(_0x26dfe1);
            }
          });
        };
        _0x3f49da.appendChild(_0x3ce656);
        _0x3f49da.appendChild(_0x26dfe1);
        _0x5e4215.appendChild(_0x3f49da);
        _0x5e4215.addEventListener("click", _0x4c46aa => {
          _0x4c46aa.stopPropagation();
        });
        return _0x5e4215;
      };
      const _0x20a4c7 = () => {
        const _0x2474bd = document.createElement("div");
        _0x2474bd.className = "node-toolbar-action-menu-item node-toolbar-action-grid-item node-toolbar-action-grid-custom";
        const _0x308d09 = document.createElement("div");
        _0x308d09.className = "node-toolbar-action-menu-icon";
        const _0x46b67b = _0x2ceccc(1.5, 24, 24);
        _0x6d549a(_0x46b67b, [{
          tag: "path",
          attrs: {
            d: "M3 3h18v18H3z"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M6.6 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M10.2 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M13.8 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M17.4 3v18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 6.6h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 10.2h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 13.8h18"
          }
        }, {
          tag: "path",
          attrs: {
            d: "M3 17.4h18"
          }
        }]);
        _0x308d09.appendChild(_0x46b67b);
        _0x2474bd.appendChild(_0x308d09);
        const _0x2105ed = document.createElement("div");
        _0x2105ed.className = "node-toolbar-action-menu-body node-toolbar-action-grid-custom-body";
        const _0x157b16 = document.createElement("span");
        _0x157b16.className = "node-toolbar-action-menu-item-title";
        _0x157b16.textContent = multigridText("customTitle");
        _0x2105ed.appendChild(_0x157b16);
        const _0x4ccbdf = document.createElement("span");
        _0x4ccbdf.className = "node-toolbar-action-menu-item-desc";
        _0x4ccbdf.textContent = multigridText("customDesc");
        _0x2105ed.appendChild(_0x4ccbdf);
        _0x2474bd.appendChild(_0x2105ed);
        const _0x289b63 = document.createElement("div");
        _0x289b63.className = "node-toolbar-action-caret";
        _0x289b63.innerHTML = "&gt;";
        _0x2474bd.appendChild(_0x289b63);
        let _0x35d154 = null;
        let _0xd8678b = 0;
        let _0x27fb72 = 0;
        let _0xfc73b3 = 0;
        let _0x4429bc = null;
        const _0x2ecc0c = () => {
          if (!_0x35d154) {
            return;
          }
          _0x35d154.querySelectorAll(".node-toolbar-action-grid-picker-cell").forEach(_0xbe0559 => _0xbe0559.classList.remove("is-preview"));
          const _0x26e384 = _0x35d154.querySelector(".node-toolbar-action-grid-submenu-preview");
          if (_0x26e384) {
            _0x26e384.textContent = multigridText("chooseSpec");
          }
        };
        const _0x440777 = ({
          cols: _0x166d5c,
          rows: _0x2cdb01,
          busy = false
        }) => {
          if (!_0x35d154) {
            return;
          }
          _0x35d154.querySelectorAll(".node-toolbar-action-grid-picker-cell").forEach(_0x40280e => {
            const _0x16d3a2 = Number(_0x40280e.dataset.gridCols) || 0;
            const _0x3b2a99 = Number(_0x40280e.dataset.gridRows) || 0;
            _0x40280e.classList.toggle("is-preview", _0x16d3a2 <= _0x166d5c && _0x3b2a99 <= _0x2cdb01);
          });
          const _0x347ae3 = _0x35d154.querySelector(".node-toolbar-action-grid-submenu-preview");
          if (_0x347ae3) {
            _0x347ae3.textContent = busy ? multigridText("customBusy", {
              cols: _0x166d5c,
              rows: _0x2cdb01
            }) : multigridText("customPreview", {
              cols: _0x166d5c,
              rows: _0x2cdb01
            });
          }
        };
        const _0x1c6610 = () => {
          if (_0xd8678b) {
            clearTimeout(_0xd8678b);
          }
          _0xd8678b = 0;
          if (_0x27fb72) {
            clearTimeout(_0x27fb72);
          }
          _0x27fb72 = 0;
          if (_0xfc73b3) {
            cancelAnimationFrame(_0xfc73b3);
          }
          _0xfc73b3 = 0;
          if (_0x4429bc) {
            document.removeEventListener("pointerdown", _0x4429bc);
            _0x4429bc = null;
          }
        };
        const _0x3e0c48 = () => {
          if (!_0x35d154) {
            return;
          }
          const _0x365795 = _0x35d154;
          _0x35d154 = null;
          _0x27a4ec = null;
          if (_0x19b822.__v2MultigridSubmenuEl === _0x365795) {
            _0x19b822.__v2MultigridSubmenuEl = null;
          }
          _0x2474bd.classList.remove("is-open");
          _0x1c6610();
          if (document.body.contains(_0x365795)) {
            _0x365795.remove();
          }
        };
        _0xf24345 = _0x3e0c48;
        const _0x5bc8a8 = () => {
          if (_0x27fb72) {
            clearTimeout(_0x27fb72);
          }
          _0x27fb72 = 0;
        };
        const _0xaec0f2 = () => {
          _0x5bc8a8();
          _0x27fb72 = setTimeout(() => _0x3e0c48(), 160);
        };
        const _0x37027a = () => {
          if (_0x35d154 && document.body.contains(_0x35d154)) {
            return _0x35d154;
          }
          const _0x2880d4 = document.querySelector(".v2-multigrid-custom-submenu");
          if (_0x2880d4) {
            _0x2880d4.remove();
          }
          _0x35d154 = document.createElement("div");
          _0x35d154.className = "v2-multigrid-custom-submenu node-toolbar-action-submenu node-toolbar-action-grid-submenu";
          _0x27a4ec = _0x35d154;
          _0x19b822.__v2MultigridSubmenuEl = _0x35d154;
          _0x2474bd.classList.add("is-open");
          Object.assign(_0x35d154.style, {
            position: "fixed",
            opacity: "0",
            pointerEvents: "none"
          });
          const _0x140189 = document.createElement("div");
          _0x140189.className = "node-toolbar-action-menu-title";
          _0x140189.textContent = multigridText("customMenuTitle");
          _0x35d154.appendChild(_0x140189);
          const _0x58272e = document.createElement("div");
          _0x58272e.className = "node-toolbar-action-grid-submenu-preview";
          _0x58272e.textContent = multigridText("chooseSpec");
          _0x35d154.appendChild(_0x58272e);
          const _0x1aa340 = document.createElement("div");
          _0x1aa340.className = "node-toolbar-action-grid-picker";
          _0x1aa340.setAttribute("role", "grid");
          _0x1aa340.setAttribute("aria-label", multigridText("customAria"));
          for (let _0xd55de9 = 1; _0xd55de9 <= _0x355c09; _0xd55de9 += 1) {
            for (let _0x508d67 = 1; _0x508d67 <= _0x355c09; _0x508d67 += 1) {
              const _0x56d64f = document.createElement("button");
              _0x56d64f.type = "button";
              _0x56d64f.className = "node-toolbar-action-grid-picker-cell";
              _0x56d64f.dataset.gridCols = String(_0x508d67);
              _0x56d64f.dataset.gridRows = String(_0xd55de9);
              _0x56d64f.setAttribute("role", "gridcell");
              _0x56d64f.setAttribute("aria-label", multigridText("cellAria", {
                cols: _0x508d67,
                rows: _0xd55de9
              }));
              _0x56d64f.setAttribute("title", _0x508d67 + "×" + _0xd55de9);
              _0x56d64f.addEventListener("pointerenter", () => _0x440777({
                cols: _0x508d67,
                rows: _0xd55de9
              }));
              _0x56d64f.addEventListener("focus", () => _0x440777({
                cols: _0x508d67,
                rows: _0xd55de9
              }));
              _0x56d64f.addEventListener("click", async _0x42a4c2 => {
                _0x42a4c2.stopPropagation();
                if (_0x2474bd.classList.contains("is-busy")) {
                  return;
                }
                await _0x3aa045({
                  cols: _0x508d67,
                  rows: _0xd55de9,
                  onBusy: () => {
                    _0x2474bd.classList.add("is-busy");
                    _0x1aa340.setAttribute("aria-busy", "true");
                    _0x440777({
                      cols: _0x508d67,
                      rows: _0xd55de9,
                      busy: true
                    });
                  },
                  onRestore: () => {
                    _0x2474bd.classList.remove("is-busy");
                    _0x1aa340.removeAttribute("aria-busy");
                    _0x440777({
                      cols: _0x508d67,
                      rows: _0xd55de9
                    });
                  }
                });
              });
              _0x1aa340.appendChild(_0x56d64f);
            }
          }
          _0x1aa340.addEventListener("pointerleave", () => {
            if (!_0x2474bd.classList.contains("is-busy")) {
              _0x2ecc0c();
            }
          });
          _0x35d154.appendChild(_0x1aa340);
          const _0x485b6c = () => {
            if (!_0x35d154 || !document.body.contains(_0x35d154) || !document.body.contains(_0x19b822)) {
              if (_0xfc73b3) {
                cancelAnimationFrame(_0xfc73b3);
              }
              _0xfc73b3 = 0;
              return;
            }
            const _0x2bd161 = _0x19b822.getBoundingClientRect();
            if (_0x2bd161.width <= 0 || _0x2bd161.height <= 0) {
              _0xfc73b3 = requestAnimationFrame(_0x485b6c);
              return;
            }
            const _0x2fcf51 = 12;
            const _0x4ff38a = 8;
            const _0x3f69f3 = Math.min(_0x2bd161.width, window.innerWidth - _0x4ff38a * 2);
            _0x35d154.style.width = _0x3f69f3 + "px";
            const _0x2d7107 = Math.min(_0x2bd161.height, window.innerHeight - _0x4ff38a * 2);
            _0x35d154.style.height = "auto";
            _0x35d154.style.maxHeight = _0x2d7107 + "px";
            const _0x47f6ef = _0x35d154.getBoundingClientRect().height;
            const _0x2919c7 = Math.min(_0x47f6ef > 0 ? _0x47f6ef : _0x35d154.scrollHeight, _0x2d7107);
            const _0x447693 = _0x2bd161.right + _0x2fcf51;
            const _0x280723 = _0x2bd161.left - _0x3f69f3 - _0x2fcf51;
            const _0x28b384 = window.innerWidth - _0x3f69f3 - _0x4ff38a;
            const _0x31da13 = window.innerHeight - _0x2919c7 - _0x4ff38a;
            const _0x1b3eb3 = _0x447693 <= _0x28b384 ? _0x447693 : Math.max(_0x4ff38a, _0x280723);
            const _0x2e2906 = Math.max(_0x4ff38a, Math.min(_0x2bd161.top, Math.max(_0x4ff38a, _0x31da13)));
            _0x35d154.style.left = _0x1b3eb3 + "px";
            _0x35d154.style.top = _0x2e2906 + "px";
            _0xfc73b3 = requestAnimationFrame(_0x485b6c);
          };
          _0xfc73b3 = requestAnimationFrame(_0x485b6c);
          _0x35d154.addEventListener("pointerenter", _0xfef84 => {
            if (_0xfef84.pointerType !== "mouse") {
              return;
            }
            _0x5bc8a8();
          });
          _0x35d154.addEventListener("pointerleave", _0x2a7b7a => {
            if (_0x2a7b7a.pointerType !== "mouse") {
              return;
            }
            _0xaec0f2();
          });
          document.body.appendChild(_0x35d154);
          _0x35d154.offsetHeight;
          _0x35d154.style.opacity = "1";
          _0x35d154.style.pointerEvents = "auto";
          _0x4429bc = _0x179069 => {
            if (!_0x35d154) {
              return;
            }
            if (!_0x35d154.contains(_0x179069.target) && !_0x2474bd.contains(_0x179069.target)) {
              _0x3e0c48();
            }
          };
          document.addEventListener("pointerdown", _0x4429bc);
          return _0x35d154;
        };
        _0x2474bd.__v2LastPointerType = "mouse";
        _0x2474bd.addEventListener("pointerdown", _0x1a72c7 => {
          _0x2474bd.__v2LastPointerType = _0x1a72c7.pointerType || "mouse";
        });
        const _0x46cd40 = () => {
          _0x5bc8a8();
          if (_0xd8678b) {
            clearTimeout(_0xd8678b);
          }
          _0xd8678b = setTimeout(() => _0x37027a(), 60);
        };
        _0x2474bd.addEventListener("pointerenter", _0x2f70e0 => {
          if (_0x2f70e0.pointerType !== "mouse") {
            return;
          }
          _0x46cd40();
        });
        _0x2474bd.addEventListener("pointerleave", _0x5374c2 => {
          if (_0x5374c2.pointerType !== "mouse") {
            return;
          }
          _0xaec0f2();
        });
        _0x2474bd.addEventListener("click", _0x158297 => {
          _0x158297.stopPropagation();
          if (_0x2474bd.__v2LastPointerType === "touch") {
            if (_0x35d154 && document.body.contains(_0x35d154)) {
              _0x3e0c48();
            } else {
              _0x37027a();
            }
            return;
          }
          _0x37027a();
        });
        return _0x2474bd;
      };
      _0x4c6fad.forEach(_0x5d2e76 => _0x19b822.appendChild(_0x5f38f1(_0x5d2e76)));
      _0x19b822.appendChild(_0x20a4c7());
      document.body.appendChild(_0x19b822);
      positionToolbarActionSubmenuAbove(_0x1699b0(), _0x19b822);
      _0x19b822.offsetHeight;
      _0x19b822.style.pointerEvents = "auto";
      _0x19b822.style.opacity = "1";
      _0x19b822.style.transform = "translateY(0)";
      let _0x2e9f8b = 0;
      let _0x1659ce = null;
      const _0x2bb1de = () => {
        if (_0x2e9f8b) {
          cancelAnimationFrame(_0x2e9f8b);
        }
        _0x2e9f8b = 0;
        _0xf24345();
        if (_0x1659ce) {
          document.removeEventListener("pointerdown", _0x1659ce);
          _0x1659ce = null;
        }
      };
      const _0x517f0d = () => {
        if (_0x19b822.__v2MultigridClosing) {
          return;
        }
        _0x19b822.__v2MultigridClosing = true;
        _0x2bb1de();
        _0x19b822.style.opacity = "0";
        _0x19b822.style.pointerEvents = "none";
        _0x19b822.style.transform = "translateY(10px)";
        setTimeout(() => _0x19b822.remove(), 250);
      };
      _0x19b822.__v2MultigridClose = _0x517f0d;
      const _0x53a95f = () => {
        if (!document.body.contains(_0x19b822) || !document.body.contains(_0x987979)) {
          _0x2bb1de();
          return;
        }
        if (!_0x1699b0.hasVisibleAnchor()) {
          _0x2e9f8b = requestAnimationFrame(_0x53a95f);
          return;
        }
        positionToolbarActionSubmenuAbove(_0x1699b0(), _0x19b822);
        _0x2e9f8b = requestAnimationFrame(_0x53a95f);
      };
      _0x2e9f8b = requestAnimationFrame(_0x53a95f);
      _0x1659ce = _0xa01b89 => {
        if (_0x19b822.__v2MultigridClosing) {
          return;
        }
        const _0x4016e5 = _0x27a4ec || _0x19b822.__v2MultigridSubmenuEl;
        const _0x59aeb3 = _0x19b822.contains(_0xa01b89.target);
        const _0x43c72c = _0x4016e5 && _0x4016e5.contains(_0xa01b89.target);
        if (!_0x59aeb3 && !_0x43c72c && _0xa01b89.target !== _0x987979) {
          _0x517f0d();
        }
      };
      setTimeout(() => document.addEventListener("pointerdown", _0x1659ce), 10);
    });
  }
}