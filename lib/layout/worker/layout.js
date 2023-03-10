"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayoutWorker = void 0;
var _work = _interopRequireDefault(require("./work"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var LayoutWorker = function LayoutWorker(workerScriptURL) {
  if (workerScriptURL === void 0) {
    workerScriptURL = 'https://unpkg.com/@antv/layout@latest/dist/layout.min.js';
  }
  function workerCode() {
    var LAYOUT_MESSAGE = {
      // run layout
      RUN: 'LAYOUT_RUN',
      // layout ended with success
      END: 'LAYOUT_END',
      // layout error
      ERROR: 'LAYOUT_ERROR',
      // layout tick, used in force directed layout
      TICK: 'LAYOUT_TICK',
      GPURUN: 'GPU_LAYOUT_RUN',
      GPUEND: 'GPU_LAYOUT_END'
    };
    // @ts-ignore
    layout.registerLayout('grid', layout.GridLayout);
    // @ts-ignore
    layout.registerLayout('random', layout.RandomLayout);
    // @ts-ignore
    layout.registerLayout('force', layout.ForceLayout);
    // @ts-ignore
    layout.registerLayout('circular', layout.CircularLayout);
    // @ts-ignore
    layout.registerLayout('dagre', layout.DagreLayout);
    // @ts-ignore
    layout.registerLayout('dagreCompound', layout.DagreCompoundLayout);
    // @ts-ignore
    layout.registerLayout('radial', layout.RadialLayout);
    // @ts-ignore
    layout.registerLayout('concentric', layout.ConcentricLayout);
    // @ts-ignore
    layout.registerLayout('mds', layout.MDSLayout);
    // @ts-ignore
    layout.registerLayout('fruchterman', layout.FruchtermanLayout);
    // @ts-ignore
    layout.registerLayout('fruchterman-gpu', layout.FruchtermanGPULayout);
    // @ts-ignore
    layout.registerLayout('gForce', layout.GForceLayout);
    // @ts-ignore
    layout.registerLayout('gForce-gpu', layout.GForceGPULayout);
    // @ts-ignore
    layout.registerLayout('comboForce', layout.ComboForceLayout);
    // @ts-ignore
    layout.registerLayout('comboCombined', layout.ComboCombinedLayout);
    // @ts-ignore
    layout.registerLayout('forceAtlas2', layout.ForceAtlas2Layout);
    function isLayoutMessage(event) {
      var type = event.data.type;
      return type === LAYOUT_MESSAGE.RUN || type === LAYOUT_MESSAGE.GPURUN;
    }
    function handleLayoutMessage(event) {
      var _this = this;
      var type = event.data.type;
      switch (type) {
        case LAYOUT_MESSAGE.RUN:
          {
            var _a = event.data,
              nodes_1 = _a.nodes,
              edges = _a.edges,
              _b = _a.layoutCfg,
              layoutCfg = _b === void 0 ? {} : _b;
            var layoutType = layoutCfg.type;
            // @ts-ignore
            var LayoutClass = layout.getLayoutByName(layoutType);
            if (!LayoutClass) {
              this.postMessage({
                type: LAYOUT_MESSAGE.ERROR,
                message: "layout ".concat(layoutType, " not found")
              });
              break;
            }
            // eslint-disable-next-line prefer-const
            var layoutMethod_1;
            layoutCfg.onLayoutEnd = function () {
              _this.postMessage({
                type: LAYOUT_MESSAGE.END,
                nodes: nodes_1
              });
              layoutMethod_1 === null || layoutMethod_1 === void 0 ? void 0 : layoutMethod_1.destroy();
            };
            layoutMethod_1 = new LayoutClass(layoutCfg);
            layoutMethod_1.init({
              nodes: nodes_1,
              edges: edges
            });
            layoutMethod_1.execute();
            break;
          }
        case LAYOUT_MESSAGE.GPURUN:
          {
            var _c = event.data,
              nodes = _c.nodes,
              edges = _c.edges,
              _d = _c.layoutCfg,
              layoutCfg = _d === void 0 ? {} : _d,
              canvas = _c.canvas;
            var layoutType = layoutCfg.type;
            // @ts-ignore
            var LayoutClass = layout.getLayoutByName(layoutType);
            if (!LayoutClass) {
              this.postMessage({
                type: LAYOUT_MESSAGE.ERROR,
                message: "layout ".concat(layoutType, " not found")
              });
              break;
            }
            if (layoutType.split('-')[1] !== 'gpu') {
              this.postMessage({
                type: LAYOUT_MESSAGE.ERROR,
                message: "layout ".concat(layoutType, " does not support GPU")
              });
              break;
            }
            var layoutMethod = new LayoutClass(layoutCfg);
            layoutMethod.init({
              nodes: nodes,
              edges: edges
            });
            layoutMethod.executeWithWorker(canvas, this);
            break;
          }
        default:
          break;
      }
    }
    onmessage = function onmessage(event) {
      if (isLayoutMessage(event)) {
        handleLayoutMessage(event);
      }
    };
  }
  var layoutWorker = new _work.default(workerCode, workerScriptURL);
  return layoutWorker;
};
exports.LayoutWorker = LayoutWorker;