function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
import { __awaiter, __extends, __generator, __rest } from "tslib";
import { AbstractLayout, Util } from '@antv/g6-core';
import { Layout } from '../../layout';
import { LayoutWorker } from '../../layout/worker/layout';
import { LAYOUT_MESSAGE } from '../../layout/worker/layoutConst';
import { gpuDetector } from '../../util/gpu';
import { mix, clone } from '@antv/util';
// eslint-disable-next-line @typescript-eslint/no-implied-eval
var mockRaf = function mockRaf(cb) {
  return setTimeout(cb, 16);
};
var mockCaf = function mockCaf(reqId) {
  return clearTimeout(reqId);
};
var helper = {
  // pollyfill
  requestAnimationFrame: function requestAnimationFrame(callback) {
    var fn = typeof window !== 'undefined' ? window.requestAnimationFrame || window.webkitRequestAnimationFrame || mockRaf : mockRaf;
    return fn(callback);
  },
  cancelAnimationFrame: function cancelAnimationFrame(requestId) {
    var fn = typeof window !== 'undefined' ? window.cancelAnimationFrame || window.webkitCancelAnimationFrame || mockCaf : mockCaf;
    return fn(requestId);
  }
};
var GPU_LAYOUT_NAMES = ['fruchterman', 'gForce'];
var LAYOUT_PIPES_ADJUST_NAMES = ['force', 'grid', 'circular'];
var LayoutController = /** @class */function (_super) {
  __extends(LayoutController, _super);
  // the configurations of the layout
  // private layoutCfg: any; // LayoutOptions
  // the type name of the layout
  // private layoutType: string;
  // private data: GraphData;
  // private layoutMethods: typeof Layout;
  function LayoutController(graph) {
    var _this = _super.call(this, graph) || this;
    _this.graph = graph;
    _this.layoutCfg = graph.get('layout') || {};
    _this.layoutType = _this.getLayoutType();
    _this.worker = null;
    _this.workerData = {};
    _this.initLayout();
    return _this;
  }
  // eslint-disable-next-line class-methods-use-this
  LayoutController.prototype.initLayout = function () {
    // no data before rendering
  };
  // get layout worker and create one if not exists
  LayoutController.prototype.getWorker = function () {
    if (this.worker) {
      return this.worker;
    }
    if (typeof Worker === 'undefined') {
      // ?????????????????????????????? web worker??????????????? web worker
      console.warn('Web worker is not supported in current browser.');
      this.worker = null;
    } else {
      this.worker = LayoutWorker(this.layoutCfg.workerScriptURL);
    }
    return this.worker;
  };
  // stop layout worker
  LayoutController.prototype.stopWorker = function () {
    var workerData = this.workerData;
    if (!this.worker) {
      return;
    }
    this.worker.terminate();
    this.worker = null;
    // ?????????????????????????????????????????????????????????requestAnimationFrame???
    if (workerData.requestId) {
      helper.cancelAnimationFrame(workerData.requestId);
      workerData.requestId = null;
    }
    if (workerData.requestId2) {
      helper.cancelAnimationFrame(workerData.requestId2);
      workerData.requestId2 = null;
    }
  };
  LayoutController.prototype.execLayoutMethod = function (layoutCfg, order) {
    var _this = this;
    return new Promise(function (reslove, reject) {
      return __awaiter(_this, void 0, void 0, function () {
        var graph, layoutType, onTick_1, animate_1, isDefaultAnimateLayout_1, tick, enableTick, layoutMethod, onTick_2, tick, layoutData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              graph = this.graph;
              if (!graph || graph.get('destroyed')) return [2 /*return*/];
              layoutType = layoutCfg.type;
              // ?????????????????????????????????
              layoutCfg.onLayoutEnd = function () {
                graph.emit('aftersublayout', {
                  type: layoutType
                });
                reslove();
              };
              // ????????????????????? gpu??????????????????????????? webgl????????????????????? GPU ???????????????????????? fruchterman ??? gForce???????????? gpu ???????????????
              if (layoutType && this.isGPU) {
                if (!this.hasGPUVersion(layoutType)) {
                  console.warn("The '".concat(layoutType, "' layout does not support GPU calculation for now, it will run in CPU."));
                } else {
                  layoutType = "".concat(layoutType, "-gpu");
                }
              }
              if (Util.isForce(layoutType)) {
                onTick_1 = layoutCfg.onTick, animate_1 = layoutCfg.animate;
                isDefaultAnimateLayout_1 = animate_1 === undefined && (layoutType === 'force' || layoutType === 'force2');
                tick = function tick() {
                  if (onTick_1) {
                    onTick_1();
                  }
                  if (animate_1 || isDefaultAnimateLayout_1) graph.refreshPositions();
                };
                layoutCfg.tick = tick;
              } else if (layoutType === 'comboForce' || layoutType === 'comboCombined') {
                layoutCfg.comboTrees = graph.get('comboTrees');
              }
              enableTick = false;
              try {
                layoutMethod = new Layout[layoutType](layoutCfg);
                if (this.layoutMethods[order]) {
                  this.layoutMethods[order].destroy();
                }
                this.layoutMethods[order] = layoutMethod;
              } catch (e) {
                console.warn("The layout method: '".concat(layoutType, "' does not exist! Please specify it first."));
                reject();
              }
              // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
              enableTick = layoutMethod.enableTick;
              if (enableTick) {
                onTick_2 = layoutCfg.onTick;
                tick = function tick() {
                  if (onTick_2) {
                    onTick_2();
                  }
                  graph.refreshPositions();
                };
                layoutMethod.tick = tick;
              }
              layoutData = this.filterLayoutData(this.data, layoutCfg);
              addLayoutOrder(layoutData, order);
              layoutMethod.init(layoutData);
              // ??????????????????????????????????????????????????? layout?????? initPositions ??? random ?????????????????????????????????????????????????????? random ??????
              // ????????????????????????????????????????????? layout?????????????????????????????????????????????????????????
              graph.emit('beforesublayout', {
                type: layoutType
              });
              return [4 /*yield*/, layoutMethod.execute()];
            case 1:
              _a.sent();
              if (layoutMethod.isCustomLayout && layoutCfg.onLayoutEnd) layoutCfg.onLayoutEnd();
              return [2 /*return*/];
          }
        });
      });
    });
  };

  LayoutController.prototype.updateLayoutMethod = function (layoutMethod, layoutCfg) {
    var _this = this;
    return new Promise(function (reslove, reject) {
      return __awaiter(_this, void 0, void 0, function () {
        var graph, layoutType, layoutData;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              graph = this.graph;
              layoutType = layoutCfg === null || layoutCfg === void 0 ? void 0 : layoutCfg.type;
              // ?????????????????????????????????
              layoutCfg.onLayoutEnd = function () {
                graph.emit('aftersublayout', {
                  type: layoutType
                });
                reslove();
              };
              layoutData = this.filterLayoutData(this.data, layoutCfg);
              layoutMethod.init(layoutData);
              layoutMethod.updateCfg(layoutCfg);
              graph.emit('beforesublayout', {
                type: layoutType
              });
              return [4 /*yield*/, layoutMethod.execute()];
            case 1:
              _a.sent();
              if (layoutMethod.isCustomLayout && layoutCfg.onLayoutEnd) layoutCfg.onLayoutEnd();
              return [2 /*return*/];
          }
        });
      });
    });
  };
  /**
   * @param {function} success callback
   * @return {boolean} ????????????web worker??????
   */
  LayoutController.prototype.layout = function (success) {
    var _this = this;
    var _a;
    var graph = this.graph;
    if (!graph || graph.get('destroyed')) return;
    this.data = this.setDataFromGraph();
    var _b = this.data,
      nodes = _b.nodes,
      hiddenNodes = _b.hiddenNodes;
    if (!nodes) {
      return false;
    }
    var width = graph.get('width');
    var height = graph.get('height');
    var layoutCfg = {};
    Object.assign(layoutCfg, {
      width: width,
      height: height,
      center: [width / 2, height / 2]
    }, this.layoutCfg);
    this.layoutCfg = layoutCfg;
    var layoutType = layoutCfg.type;
    var prevHasNodes = false;
    (_a = this.layoutMethods) === null || _a === void 0 ? void 0 : _a.forEach(function (method) {
      var _a;
      return prevHasNodes = !!((_a = method.nodes) === null || _a === void 0 ? void 0 : _a.length) || prevHasNodes;
    });
    var preLayoutTypes = this.destoryLayoutMethods();
    graph.emit('beforelayout');
    // ?????????????????????????????????????????????????????????????????????????????????????????? treakInit
    if (prevHasNodes && layoutType && (preLayoutTypes === null || preLayoutTypes === void 0 ? void 0 : preLayoutTypes.length) === 1 && preLayoutTypes[0] === layoutType) {
      this.tweakInit();
    } else {
      // ?????????????????????????????? preset???????????? preset ??????????????????????????????????????????????????? grid
      this.initPositions(layoutCfg.center, nodes);
    }
    // init hidden nodes
    this.initPositions(layoutCfg.center, hiddenNodes);
    // ????????????????????? -gpu ??????????????????
    if (layoutType && layoutType.split('-')[1] === 'gpu') {
      layoutType = layoutType.split('-')[0];
      layoutCfg.gpuEnabled = true;
    }
    // ????????????????????? gpu??????????????????????????? webgl????????????????????? GPU ???????????????????????? fruchterman ??? gForce???????????? gpu ???????????????
    var enableGPU = false;
    if (layoutCfg.gpuEnabled) {
      enableGPU = true;
      // ?????????????????????????????? webworker ???????????? window
      if (!gpuDetector().webgl) {
        console.warn("Your browser does not support webGL or GPGPU. The layout will run in CPU.");
        enableGPU = false;
      }
    }
    // the layout does not support GPU, will run in CPU
    if (enableGPU && !this.hasGPUVersion(layoutType)) {
      console.warn("The '".concat(layoutType, "' layout does not support GPU calculation for now, it will run in CPU."));
      enableGPU = false;
    }
    this.isGPU = enableGPU;
    // ??? onAllLayoutEnd ???????????????????????? onLayoutEnd????????? afterlayout????????????????????????fitView/fitCenter????????? afterrender
    var onLayoutEnd = layoutCfg.onLayoutEnd,
      layoutEndFormatted = layoutCfg.layoutEndFormatted,
      adjust = layoutCfg.adjust;
    if (!layoutEndFormatted) {
      layoutCfg.layoutEndFormatted = true;
      layoutCfg.onAllLayoutEnd = function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                // ????????????????????? onLayoutEnd
                if (onLayoutEnd) {
                  onLayoutEnd(nodes);
                }
                // ??????????????????
                this.refreshLayout();
                if (!(adjust && layoutCfg.pipes)) return [3 /*break*/, 2];
                return [4 /*yield*/, this.adjustPipesBox(this.data, adjust)];
              case 1:
                _a.sent();
                this.refreshLayout();
                _a.label = 2;
              case 2:
                // ?????? afterlayout
                graph.emit('afterlayout');
                return [2 /*return*/];
            }
          });
        });
      };
    }

    this.stopWorker();
    if (layoutCfg.workerEnabled && this.layoutWithWorker(this.data, success)) {
      // ??????????????????web worker?????????????????????web worker??????web worker??????????????????????????????web worker?????????
      return true;
    }
    var start = Promise.resolve();
    var hasLayout = false;
    if (layoutCfg.type) {
      hasLayout = true;
      start = start.then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.execLayoutMethod(layoutCfg, 0)];
              case 1:
                return [2 /*return*/, _a.sent()];
            }
          });
        });
      });
    } else if (layoutCfg.pipes) {
      hasLayout = true;
      layoutCfg.pipes.forEach(function (cfg, index) {
        start = start.then(function () {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, this.execLayoutMethod(cfg, index)];
                case 1:
                  return [2 /*return*/, _a.sent()];
              }
            });
          });
        });
      });
    }
    if (hasLayout) {
      // ???????????????????????????onAllLayoutEnd
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
        // ????????? execute ??????????????? success????????? timeBar ?????? throttle??????????????? timeBar ?????? afterrender ?????? changeData ??? layout??????????????????
        // ?????? force ???????????????????????? fitView ????????????????????? onLayoutEnd ?????????
        if (success) success();
      }).catch(function (error) {
        console.warn('graph layout failed,', error);
      });
    } else {
      // ???????????????
      graph.refreshPositions();
      success === null || success === void 0 ? void 0 : success();
    }
    return false;
  };
  /**
   * ???????????????????????????
   */
  LayoutController.prototype.tweakInit = function () {
    var _a = this,
      data = _a.data,
      graph = _a.graph;
    var nodes = data.nodes,
      edges = data.edges;
    if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) return;
    var positionMap = {};
    nodes.forEach(function (node) {
      var x = node.x,
        y = node.y;
      if (!isNaN(x) && !isNaN(y)) {
        positionMap[node.id] = {
          x: x,
          y: y
        };
        // ????????????????????????????????????????????? mass
        node.mass = node.mass || 2;
      }
    });
    edges.forEach(function (edge) {
      var source = edge.source,
        target = edge.target;
      var sourcePosition = positionMap[source];
      var targetPosition = positionMap[target];
      if (!sourcePosition && targetPosition) {
        positionMap[source] = {
          x: targetPosition.x + (Math.random() - 0.5) * 80,
          y: targetPosition.y + (Math.random() - 0.5) * 80
        };
      } else if (!targetPosition && sourcePosition) {
        positionMap[target] = {
          x: sourcePosition.x + (Math.random() - 0.5) * 80,
          y: sourcePosition.y + (Math.random() - 0.5) * 80
        };
      }
    });
    var width = graph.get('width');
    var height = graph.get('height');
    nodes.forEach(function (node) {
      var position = positionMap[node.id] || {
        x: width / 2 + (Math.random() - 0.5) * 20,
        y: height / 2 + (Math.random() - 0.5) * 20
      };
      node.x = position.x;
      node.y = position.y;
    });
  };
  LayoutController.prototype.initWithPreset = function () {
    var _a = this,
      layoutCfg = _a.layoutCfg,
      data = _a.data;
    var preset = layoutCfg.preset;
    if (!(preset === null || preset === void 0 ? void 0 : preset.type) || !Layout[preset === null || preset === void 0 ? void 0 : preset.type]) return false;
    var presetLayout = new Layout[preset === null || preset === void 0 ? void 0 : preset.type](preset);
    presetLayout.layout(data);
    delete layoutCfg.preset;
    return true;
  };
  /**
   * layout with web worker
   * @param {object} data graph data
   * @return {boolean} ????????????web worker
   */
  LayoutController.prototype.layoutWithWorker = function (data, success) {
    var _this = this;
    var _a = this,
      layoutCfg = _a.layoutCfg,
      graph = _a.graph;
    var worker = this.getWorker();
    // ??????worker message event handler?????????????????????????????????????????????
    var workerData = this.workerData;
    if (!worker) {
      return false;
    }
    workerData.requestId = null;
    workerData.requestId2 = null;
    workerData.currentTick = null;
    workerData.currentTickData = null;
    graph.emit('beforelayout');
    var start = Promise.resolve();
    var hasLayout = false;
    if (layoutCfg.type) {
      hasLayout = true;
      start = start.then(function () {
        return _this.runWebworker(worker, data, layoutCfg);
      });
    } else if (layoutCfg.pipes) {
      hasLayout = true;
      var _loop_1 = function _loop_1(cfg) {
        start = start.then(function () {
          return _this.runWebworker(worker, data, cfg);
        });
      };
      for (var _i = 0, _b = layoutCfg.pipes; _i < _b.length; _i++) {
        var cfg = _b[_i];
        _loop_1(cfg);
      }
    }
    if (hasLayout) {
      // ???????????????????????????onAllLayoutEnd
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
        success === null || success === void 0 ? void 0 : success();
      }).catch(function (error) {
        console.error('layout failed', error);
      });
    }
    return true;
  };
  LayoutController.prototype.runWebworker = function (worker, allData, layoutCfg) {
    var _this = this;
    var isGPU = this.isGPU;
    var data = this.filterLayoutData(allData, layoutCfg);
    var nodes = data.nodes,
      edges = data.edges;
    var offScreenCanvas = document.createElement('canvas');
    var gpuWorkerAbility = isGPU && typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/dot-notation
    window.navigator && !navigator["gpu"] &&
    // WebGPU ???????????? OffscreenCanvas
    'OffscreenCanvas' in window && 'transferControlToOffscreen' in offScreenCanvas;
    // NOTE: postMessage???message???????????????????????????????????????postMessage????????????
    // ?????????'function could not be cloned'???
    // ???????????????https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
    // ???????????????????????????layoutCfg??????????????????????????????
    var filteredLayoutCfg = filterObject(layoutCfg, function (value) {
      return typeof value !== 'function';
    });
    if (!gpuWorkerAbility) {
      worker.postMessage({
        type: LAYOUT_MESSAGE.RUN,
        nodes: nodes,
        edges: edges,
        layoutCfg: filteredLayoutCfg
      });
    } else {
      var offscreen = offScreenCanvas.transferControlToOffscreen();
      // filteredLayoutCfg.canvas = offscreen;
      filteredLayoutCfg.type = "".concat(filteredLayoutCfg.type, "-gpu");
      worker.postMessage({
        type: LAYOUT_MESSAGE.GPURUN,
        nodes: nodes,
        edges: edges,
        layoutCfg: filteredLayoutCfg,
        canvas: offscreen
      }, [offscreen]);
    }
    return new Promise(function (reslove, reject) {
      worker.onmessage = function (event) {
        _this.handleWorkerMessage(reslove, reject, event, data, layoutCfg);
      };
    });
  };
  // success callback will be called when updating graph positions for the first time.
  LayoutController.prototype.handleWorkerMessage = function (reslove, reject, event, data, layoutCfg) {
    var _a = this,
      graph = _a.graph,
      workerData = _a.workerData;
    var eventData = event.data;
    var type = eventData.type;
    var onTick = function onTick() {
      if (layoutCfg.onTick) {
        layoutCfg.onTick();
      }
    };
    switch (type) {
      case LAYOUT_MESSAGE.TICK:
        workerData.currentTick = eventData.currentTick;
        workerData.currentTickData = eventData;
        if (!workerData.requestId) {
          workerData.requestId = helper.requestAnimationFrame(function requestId() {
            updateLayoutPosition(data, eventData);
            graph.refreshPositions();
            onTick();
            if (eventData.currentTick === eventData.totalTicks) {
              // ?????????????????????tick
              reslove();
            } else if (workerData.currentTick === eventData.totalTicks) {
              // ????????????workerData.currentTick???????????????????????????????????????????????????
              // ?????????requestAnimationFrame????????????????????????????????????tick???
              // ????????????tick??????????????????tick??????????????????tick??????????????????????????????????????????????????????tick???????????????????????????
              workerData.requestId2 = helper.requestAnimationFrame(function requestId2() {
                updateLayoutPosition(data, workerData.currentTickData);
                graph.refreshPositions();
                workerData.requestId2 = null;
                onTick();
                reslove();
              });
            }
            workerData.requestId = null;
          });
        }
        break;
      case LAYOUT_MESSAGE.END:
        // ????????????tick???????????????????????????
        if (workerData.currentTick == null) {
          updateLayoutPosition(data, eventData);
          reslove();
        }
        break;
      case LAYOUT_MESSAGE.GPUEND:
        // ????????????tick???????????????????????????
        if (workerData.currentTick == null) {
          updateGPUWorkerLayoutPosition(data, eventData);
          reslove();
        }
        break;
      case LAYOUT_MESSAGE.ERROR:
        console.warn('Web-Worker layout error!', eventData.message);
        reject();
        break;
      default:
        reject();
        break;
    }
  };
  // ??????????????????
  LayoutController.prototype.updateLayoutCfg = function (cfg) {
    var _this = this;
    var _a = this,
      graph = _a.graph,
      layoutMethods = _a.layoutMethods;
    if (!graph || graph.get('destroyed')) return;
    // disableTriggerLayout ???????????????????????????????????????
    var disableTriggerLayout = cfg.disableTriggerLayout,
      otherCfg = __rest(cfg, ["disableTriggerLayout"]);
    var layoutCfg = mix({}, this.layoutCfg, otherCfg);
    this.layoutCfg = layoutCfg;
    // disableTriggerLayout ???????????????????????????????????????
    if (disableTriggerLayout) {
      return;
    }
    if (!(layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length)) {
      this.layout();
      return;
    }
    this.data = this.setDataFromGraph();
    this.stopWorker();
    if (otherCfg.workerEnabled && this.layoutWithWorker(this.data, null)) {
      // ??????????????????web worker?????????????????????web worker??????web worker??????????????????????????????web worker?????????
      return;
    }
    graph.emit('beforelayout');
    var start = Promise.resolve();
    var hasLayout = false;
    if ((layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length) === 1) {
      hasLayout = true;
      start = start.then(function () {
        return __awaiter(_this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.updateLayoutMethod(layoutMethods[0], layoutCfg)];
              case 1:
                return [2 /*return*/, _a.sent()];
            }
          });
        });
      });
    } else if (layoutMethods === null || layoutMethods === void 0 ? void 0 : layoutMethods.length) {
      hasLayout = true;
      layoutMethods.forEach(function (layoutMethod, index) {
        var currentCfg = layoutCfg.pipes[index];
        start = start.then(function () {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  return [4 /*yield*/, this.updateLayoutMethod(layoutMethod, currentCfg)];
                case 1:
                  return [2 /*return*/, _a.sent()];
              }
            });
          });
        });
      });
    }
    if (hasLayout) {
      start.then(function () {
        if (layoutCfg.onAllLayoutEnd) layoutCfg.onAllLayoutEnd();
      }).catch(function (error) {
        console.warn('layout failed', error);
      });
    }
  };
  LayoutController.prototype.adjustPipesBox = function (data, adjust) {
    var _this = this;
    return new Promise(function (resolve) {
      var nodes = data.nodes;
      if (!(nodes === null || nodes === void 0 ? void 0 : nodes.length)) {
        resolve();
      }
      if (!LAYOUT_PIPES_ADJUST_NAMES.includes(adjust)) {
        console.warn("The adjust type ".concat(adjust, " is not supported yet, please assign it with 'force', 'grid', or 'circular'."));
        resolve();
      }
      var layoutCfg = {
        center: _this.layoutCfg.center,
        nodeSize: function nodeSize(d) {
          return Math.max(d.height, d.width);
        },
        preventOverlap: true,
        onLayoutEnd: function onLayoutEnd() {}
      };
      // ??????????????????
      var _a = _this.getLayoutBBox(nodes),
        groupNodes = _a.groupNodes,
        layoutNodes = _a.layoutNodes;
      var preNodes = clone(layoutNodes);
      // ???????????????????????????????????????????????????????????????nodes
      layoutCfg.onLayoutEnd = function () {
        layoutNodes === null || layoutNodes === void 0 ? void 0 : layoutNodes.forEach(function (ele, index) {
          var _a, _b, _c;
          var dx = ele.x - ((_a = preNodes[index]) === null || _a === void 0 ? void 0 : _a.x);
          var dy = ele.y - ((_b = preNodes[index]) === null || _b === void 0 ? void 0 : _b.y);
          (_c = groupNodes[index]) === null || _c === void 0 ? void 0 : _c.forEach(function (n) {
            n.x += dx;
            n.y += dy;
          });
        });
        resolve();
      };
      var layoutMethod = new Layout[adjust](layoutCfg);
      layoutMethod.layout({
        nodes: layoutNodes
      });
    });
  };
  LayoutController.prototype.hasGPUVersion = function (layoutName) {
    return GPU_LAYOUT_NAMES.includes(layoutName);
  };
  LayoutController.prototype.destroy = function () {
    this.destoryLayoutMethods();
    var worker = this.worker;
    if (worker) {
      worker.terminate();
      this.worker = null;
    }
    this.destroyed = true;
    this.graph.set('layout', undefined);
    this.layoutCfg = undefined;
    this.layoutType = undefined;
    this.layoutMethods = undefined;
    this.graph = null;
  };
  return LayoutController;
}(AbstractLayout);
export default LayoutController;
function updateLayoutPosition(data, layoutData) {
  var nodes = data.nodes;
  var layoutNodes = layoutData.nodes;
  var nodeLength = nodes.length;
  for (var i = 0; i < nodeLength; i++) {
    var node = nodes[i];
    node.x = layoutNodes[i].x;
    node.y = layoutNodes[i].y;
  }
}
function filterObject(collection, callback) {
  var result = {};
  if (collection && _typeof(collection) === 'object') {
    Object.keys(collection).forEach(function (key) {
      if (collection.hasOwnProperty(key) && callback(collection[key])) {
        result[key] = collection[key];
      }
    });
    return result;
  }
  return collection;
}
function updateGPUWorkerLayoutPosition(data, layoutData) {
  var nodes = data.nodes;
  var vertexEdgeData = layoutData.vertexEdgeData;
  var nodeLength = nodes.length;
  for (var i = 0; i < nodeLength; i++) {
    var node = nodes[i];
    var x = vertexEdgeData[4 * i];
    var y = vertexEdgeData[4 * i + 1];
    node.x = x;
    node.y = y;
  }
}
function addLayoutOrder(data, order) {
  var _a;
  if (!((_a = data === null || data === void 0 ? void 0 : data.nodes) === null || _a === void 0 ? void 0 : _a.length)) {
    return;
  }
  var nodes = data.nodes;
  nodes.forEach(function (node) {
    node.layoutOrder = order;
  });
}