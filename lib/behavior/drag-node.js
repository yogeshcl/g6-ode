"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tslib = require("tslib");
var _util = require("@antv/util");
var _global = _interopRequireDefault(require("../global"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _default = {
  getDefaultCfg: function getDefaultCfg() {
    return {
      updateEdge: true,
      delegateStyle: {},
      // 是否开启delegate
      enableDelegate: false,
      // 拖动节点过程中是否只改变 Combo 的大小，而不改变其结构
      onlyChangeComboSize: false,
      // 拖动过程中目标 combo 状态样式
      comboActiveState: '',
      selectedState: 'selected',
      enableOptimize: false,
      enableDebounce: false,
      enableStack: true
    };
  },
  getEvents: function getEvents() {
    return {
      'node:mousedown': 'onMouseDown',
      'drag': 'onDragMove',
      'dragend': 'onDragEnd',
      'combo:dragenter': 'onDragEnter',
      'combo:dragleave': 'onDragLeave',
      'combo:drop': 'onDropCombo',
      'node:drop': 'onDropNode',
      'canvas:drop': 'onDropCanvas',
      'touchstart': 'onTouchStart',
      'touchmove': 'onTouchMove',
      'touchend': 'onDragEnd'
    };
  },
  validationCombo: function validationCombo(item) {
    if (!this.origin || !item || item.destroyed) {
      return false;
    }
    var type = item.getType();
    if (type !== 'combo') {
      return false;
    }
    return true;
  },
  onTouchStart: function onTouchStart(evt) {
    if (!evt.item) return;
    var self = this;
    try {
      var touches = evt.originalEvent.touches;
      var event1 = touches[0];
      var event2 = touches[1];
      if (event1 && event2) {
        return;
      }
      evt.preventDefault();
    } catch (e) {
      console.warn('Touch original event not exist!');
    }
    this.mousedown = {
      item: evt.item,
      target: evt.target
    };
    this.dragstart = true;
    self.onDragStart(evt);
  },
  onTouchMove: function onTouchMove(e) {
    var self = this;
    try {
      var touches = e.originalEvent.touches;
      var event1 = touches[0];
      var event2 = touches[1];
      if (event1 && event2) {
        self.onDragEnd(e);
        return;
      }
      e.preventDefault();
    } catch (e) {
      console.warn('Touch original event not exist!');
    }
    self.onDrag(e);
  },
  /**
   * cache the manipulated item and target, since drag and dragend are global events but not node:*
   * @param evt event param
   */
  onMouseDown: function onMouseDown(evt) {
    this.mousedown = {
      item: evt.item,
      target: evt.target
    };
  },
  /**
   * trigger dragstart/drag by mousedown and drag events
   * @param evt event param
   */
  onDragMove: function onDragMove(evt) {
    var _a, _b;
    if (((_b = (_a = evt.item) === null || _a === void 0 ? void 0 : _a.getType) === null || _b === void 0 ? void 0 : _b.call(_a)) !== 'node') {
      this.onDragEnd();
      return;
    }
    if (!this.mousedown) return;
    if (!this.dragstart) {
      // dragstart
      this.dragstart = true;
      this.onDragStart(evt);
    } else {
      // drag
      this.onDrag((0, _tslib.__assign)((0, _tslib.__assign)({}, evt), this.mousedown));
    }
  },
  /**
   * 开始拖动节点
   * @param evt
   */
  onDragStart: function onDragStart(evt) {
    var _this = this;
    this.currentShouldEnd = true;
    if (!this.shouldBegin((0, _tslib.__assign)((0, _tslib.__assign)({}, evt), this.mousedown), this)) {
      return;
    }
    var _a = this.mousedown,
      item = _a.item,
      target = _a.target;
    if (!item || item.destroyed || item.hasLocked()) {
      return;
    }
    // 拖动时，设置拖动元素的 capture 为false，则不拾取拖动的元素
    var group = item.getContainer();
    group.set('capture', false);
    if (!this.cachedCaptureItems) this.cachedCaptureItems = [];
    this.cachedCaptureItems.push(item);
    // 如果拖动的target 是linkPoints / anchorPoints 则不允许拖动
    if (target) {
      var isAnchorPoint = target.get('isAnchorPoint');
      if (isAnchorPoint) {
        return;
      }
    }
    var graph = this.graph;
    this.targets = [];
    // 将节点拖入到指定的 Combo
    this.targetCombo = null;
    // 获取所有选中的元素
    var nodes = graph.findAllByState('node', this.selectedState);
    var currentNodeId = item.get('id');
    // 当前拖动的节点是否是选中的节点
    var dragNodes = nodes.filter(function (node) {
      var nodeId = node.get('id');
      return currentNodeId === nodeId;
    });
    // 只拖动当前节点
    if (dragNodes.length === 0) {
      this.targets.push(item);
    } else if (nodes.length > 1) {
      // 拖动多个节点
      nodes.forEach(function (node) {
        var locked = node.hasLocked();
        if (!locked) {
          _this.targets.push(node);
        }
      });
    } else {
      this.targets.push(item);
    }
    if (this.graph.get('enabledStack') && this.enableStack) {
      var beforeDragNodes_1 = [];
      this.targets.forEach(function (t) {
        var _a = t.getModel(),
          x = _a.x,
          y = _a.y,
          id = _a.id;
        beforeDragNodes_1.push({
          x: x,
          y: y,
          id: id
        });
      });
      this.set('beforeDragNodes', beforeDragNodes_1);
    }
    this.hidenEdge = {};
    if (this.get('updateEdge') && this.enableOptimize && !this.enableDelegate) {
      this.targets.forEach(function (node) {
        var edges = node.getEdges();
        edges.forEach(function (edge) {
          if (!edge.isVisible()) return;
          _this.hidenEdge[edge.getID()] = true;
          edge.hide();
        });
      });
    }
    this.origin = {
      x: evt.x,
      y: evt.y
    };
    this.point = {};
    this.originPoint = {};
    // 绑定浏览器右键监听，触发拖拽结束，结束拖拽时移除
    if (typeof window !== 'undefined') {
      var self_1 = this;
      this.handleDOMContextMenu = function () {
        return self_1.onDragEnd();
      };
      document.body.addEventListener('contextmenu', this.handleDOMContextMenu);
    }
  },
  /**
   * 持续拖动节点
   * @param evt
   */
  onDrag: function onDrag(evt) {
    var _this = this;
    if (!this.mousedown || !this.origin) return;
    if (!this.shouldUpdate(evt, this)) return;
    if (this.get('enableDelegate')) {
      this.updateDelegate(evt);
    } else {
      if (this.enableDebounce) {
        this.debounceUpdate({
          targets: this.targets,
          graph: this.graph,
          point: this.point,
          origin: this.origin,
          evt: evt,
          updateEdge: this.get('updateEdge'),
          onlyChangeComboSize: this.onlyChangeComboSize,
          updateParentCombos: this.updateParentCombos
        });
      } else {
        var parentComboMap_1 = {};
        this.targets.map(function (target) {
          _this.update(target, evt);
          var parentComboId = target.getModel().comboId;
          if (parentComboId) parentComboMap_1[parentComboId] = _this.graph.findById(parentComboId);
        });
        if (this.onlyChangeComboSize) {
          // 拖动节点过程中，动态改变 Combo 的大小
          this.updateParentCombos();
        }
      }
    }
  },
  /**
   * 拖动结束，设置拖动元素capture为true，更新元素位置，如果是拖动涉及到 combo，则更新 combo 结构
   * @param evt
   */
  onDragEnd: function onDragEnd(evt) {
    var _this = this;
    var _a;
    this.mousedown = false;
    this.dragstart = false;
    if (!this.origin) {
      return;
    }
    // 拖动结束后，设置拖动元素 group 的 capture 为 true，允许拾取拖动元素
    (_a = this.cachedCaptureItems) === null || _a === void 0 ? void 0 : _a.forEach(function (item) {
      var group = item.getContainer();
      group.set('capture', true);
    });
    this.cachedCaptureItems = [];
    if (this.delegateRect) {
      this.delegateRect.remove();
      this.delegateRect = null;
    }
    if (this.get('updateEdge') && this.enableOptimize && !this.enableDelegate) {
      this.targets.forEach(function (node) {
        var edges = node.getEdges();
        edges.forEach(function (edge) {
          if (_this.hidenEdge[edge.getID()]) edge.show();
          edge.refresh();
        });
      });
    }
    this.hidenEdge = {};
    var graph = this.graph;
    // 拖动结束后，入栈
    if (graph.get('enabledStack') && this.enableStack) {
      var stackData_1 = {
        before: {
          nodes: [],
          edges: [],
          combos: []
        },
        after: {
          nodes: [],
          edges: [],
          combos: []
        }
      };
      this.get('beforeDragNodes').forEach(function (model) {
        stackData_1.before.nodes.push(model);
      });
      this.targets.forEach(function (target) {
        var _a = target.getModel(),
          x = _a.x,
          y = _a.y,
          id = _a.id;
        stackData_1.after.nodes.push({
          x: x,
          y: y,
          id: id
        });
      });
      graph.pushStack('update', (0, _util.clone)(stackData_1));
    }
    // 拖动结束后emit事件，将当前操作的节点抛出去，目标节点为null
    graph.emit('dragnodeend', {
      items: this.targets,
      targetItem: null
    });
    this.point = {};
    this.origin = null;
    this.originPoint = {};
    this.targets.length = 0;
    this.targetCombo = null;
    // 结束拖拽时移除浏览器右键监听
    if (typeof window !== 'undefined') {
      document.body.removeEventListener('contextmenu', this.handleDOMContextMenu);
    }
  },
  /**
   * 拖动过程中将节点放置到 combo 上
   * @param evt
   */
  onDropCombo: function onDropCombo(evt) {
    var item = evt.item;
    this.currentShouldEnd = this.shouldEnd(evt, item, this);
    // 若不允许结束，则将节点位置设置回初识位置。后面的逻辑仍需要执行
    this.updatePositions(evt, !this.currentShouldEnd);
    if (!this.currentShouldEnd || !this.validationCombo(item)) return;
    var graph = this.graph;
    if (this.comboActiveState) {
      graph.setItemState(item, this.comboActiveState, false);
    }
    this.targetCombo = item;
    // 拖动结束后是动态改变 Combo 大小还是将节点从 Combo 中删除
    if (this.onlyChangeComboSize) {
      // 拖动节点结束后，动态改变 Combo 的大小
      graph.updateCombos();
    } else {
      var targetComboModel_1 = item.getModel();
      this.targets.map(function (node) {
        var nodeModel = node.getModel();
        if (nodeModel.comboId !== targetComboModel_1.id) {
          graph.updateComboTree(node, targetComboModel_1.id);
        }
      });
      graph.updateCombo(item);
    }
    // 将节点拖动到 combo 上面，emit事件抛出当前操作的节点及目标 combo
    graph.emit('dragnodeend', {
      items: this.targets,
      targetItem: this.targetCombo
    });
  },
  onDropCanvas: function onDropCanvas(evt) {
    var graph = this.graph;
    this.currentShouldEnd = this.shouldEnd(evt, undefined, this);
    // 若不允许结束，则将节点位置设置回初识位置。后面的逻辑仍需要执行
    this.updatePositions(evt, !this.currentShouldEnd);
    if (!this.targets || this.targets.length === 0 || !this.currentShouldEnd) return;
    if (this.onlyChangeComboSize) {
      this.updateParentCombos();
    } else {
      this.targets.map(function (node) {
        // 拖动的节点有 comboId，即是从其他 combo 中拖出时才处理
        var model = node.getModel();
        if (model.comboId) {
          graph.updateComboTree(node);
        }
      });
    }
  },
  /**
   * 拖动放置到某个 combo 中的子 node 上
   * @param evt
   */
  onDropNode: function onDropNode(evt) {
    if (!this.targets || this.targets.length === 0) return;
    var self = this;
    var item = evt.item;
    var graph = self.graph;
    var comboId = item.getModel().comboId;
    var newParentCombo = comboId ? graph.findById(comboId) : undefined;
    this.currentShouldEnd = this.shouldEnd(evt, newParentCombo, this);
    // 若不允许结束，则将节点位置设置回初识位置。后面的逻辑仍需要执行
    this.updatePositions(evt, !this.currentShouldEnd);
    if (!this.currentShouldEnd) return;
    if (this.onlyChangeComboSize) {
      this.updateParentCombos();
    } else if (comboId) {
      var combo = graph.findById(comboId);
      if (self.comboActiveState) {
        graph.setItemState(combo, self.comboActiveState, false);
      }
      this.targets.map(function (node) {
        var nodeModel = node.getModel();
        if (comboId !== nodeModel.comboId) {
          graph.updateComboTree(node, comboId);
        }
      });
      graph.updateCombo(combo);
    } else {
      this.targets.map(function (node) {
        var model = node.getModel();
        if (model.comboId) {
          graph.updateComboTree(node);
        }
      });
    }
    // 将节点拖动到另外个节点上面，emit 事件抛出当前操作的节点及目标节点
    graph.emit('dragnodeend', {
      items: this.targets,
      targetItem: item
    });
  },
  /**
   * 将节点拖入到 Combo 中
   * @param evt
   */
  onDragEnter: function onDragEnter(evt) {
    var item = evt.item;
    if (!this.validationCombo(item)) return;
    var graph = this.graph;
    if (this.comboActiveState) {
      graph.setItemState(item, this.comboActiveState, true);
    }
  },
  /**
   * 将节点从 Combo 中拖出
   * @param evt
   */
  onDragLeave: function onDragLeave(evt) {
    var item = evt.item;
    if (!this.validationCombo(item)) return;
    var graph = this.graph;
    if (this.comboActiveState) {
      graph.setItemState(item, this.comboActiveState, false);
    }
  },
  updatePositions: function updatePositions(evt, restore) {
    var _this = this;
    if (!this.targets || this.targets.length === 0) return;
    // 当开启 delegate 时，拖动结束后需要更新所有已选中节点的位置
    if (this.get('enableDelegate')) {
      if (this.enableDebounce) this.debounceUpdate({
        targets: this.targets,
        graph: this.graph,
        point: this.point,
        origin: this.origin,
        evt: evt,
        updateEdge: this.get('updateEdge'),
        onlyChangeComboSize: this.onlyChangeComboSize,
        updateParentCombos: this.updateParentCombos
      });else if (!restore) this.targets.map(function (node) {
        return _this.update(node, evt);
      });
    } else this.targets.map(function (node) {
      return _this.update(node, evt, restore);
    });
  },
  /**
   * 更新节点
   * @param item 拖动的节点实例
   * @param evt
   */
  update: function update(item, evt, restore) {
    var origin = this.origin;
    var model = item.get('model');
    var nodeId = item.get('id');
    if (!this.point[nodeId]) {
      this.point[nodeId] = {
        x: model.x || 0,
        y: model.y || 0
      };
    }
    var x = evt.x - origin.x + this.point[nodeId].x;
    var y = evt.y - origin.y + this.point[nodeId].y;
    if (restore) {
      x += origin.x - evt.x;
      y += origin.y - evt.y;
    }
    var pos = {
      x: x,
      y: y
    };
    if (this.get('updateEdge')) {
      this.graph.updateItem(item, pos, false);
    } else {
      item.updatePosition(pos);
    }
  },
  /**
   * 限流更新节点
   * @param item 拖动的节点实例
   * @param evt
   */
  debounceUpdate: (0, _util.debounce)(function (event) {
    var targets = event.targets,
      graph = event.graph,
      point = event.point,
      origin = event.origin,
      evt = event.evt,
      updateEdge = event.updateEdge,
      onlyChangeComboSize = event.onlyChangeComboSize,
      updateParentCombos = event.updateParentCombos;
    targets.map(function (item) {
      var model = item.get('model');
      var nodeId = item.get('id');
      if (!point[nodeId]) {
        point[nodeId] = {
          x: model.x || 0,
          y: model.y || 0
        };
      }
      var x = evt.x - origin.x + point[nodeId].x;
      var y = evt.y - origin.y + point[nodeId].y;
      var pos = {
        x: x,
        y: y
      };
      if (updateEdge) {
        graph.updateItem(item, pos, false);
      } else {
        item.updatePosition(pos);
      }
    });
    if (onlyChangeComboSize) {
      updateParentCombos(graph, targets);
    }
  }, 50, true),
  /**
   * 更新拖动元素时的delegate
   * @param {Event} evt 事件句柄
   * @param {number} x 拖动单个元素时候的x坐标
   * @param {number} y 拖动单个元素时候的y坐标
   */
  updateDelegate: function updateDelegate(evt) {
    var graph = this.graph;
    if (!this.delegateRect) {
      // 拖动多个
      var parent_1 = graph.get('group');
      var attrs = (0, _util.deepMix)({}, _global.default.delegateStyle, this.delegateStyle);
      var _a = this.calculationGroupPosition(evt),
        cx = _a.x,
        cy = _a.y,
        width = _a.width,
        height = _a.height,
        minX = _a.minX,
        minY = _a.minY;
      this.originPoint = {
        x: cx,
        y: cy,
        width: width,
        height: height,
        minX: minX,
        minY: minY
      };
      // model上的x, y是相对于图形中心的，delegateShape是g实例，x,y是绝对坐标
      this.delegateRect = parent_1.addShape('rect', {
        attrs: (0, _tslib.__assign)({
          width: width,
          height: height,
          x: cx,
          y: cy
        }, attrs),
        name: 'rect-delegate-shape'
      });
      this.delegate = this.delegateRect;
      this.delegateRect.set('capture', false);
    } else {
      var clientX = evt.x - this.origin.x + this.originPoint.minX;
      var clientY = evt.y - this.origin.y + this.originPoint.minY;
      this.delegateRect.attr({
        x: clientX,
        y: clientY
      });
    }
  },
  /**
   * 计算delegate位置，包括左上角左边及宽度和高度
   * @memberof ItemGroup
   * @return {object} 计算出来的delegate坐标信息及宽高
   */
  calculationGroupPosition: function calculationGroupPosition(evt) {
    var nodes = this.targets;
    if (nodes.length === 0) {
      nodes.push(evt.item);
    }
    var minx = Infinity;
    var maxx = -Infinity;
    var miny = Infinity;
    var maxy = -Infinity;
    // 获取已节点的所有最大最小x y值
    for (var i = 0; i < nodes.length; i++) {
      var element = nodes[i];
      var bbox = element.getBBox();
      var minX = bbox.minX,
        minY = bbox.minY,
        maxX = bbox.maxX,
        maxY = bbox.maxY;
      if (minX < minx) {
        minx = minX;
      }
      if (minY < miny) {
        miny = minY;
      }
      if (maxX > maxx) {
        maxx = maxX;
      }
      if (maxY > maxy) {
        maxy = maxY;
      }
    }
    var x = Math.floor(minx);
    var y = Math.floor(miny);
    var width = Math.ceil(maxx) - Math.floor(minx);
    var height = Math.ceil(maxy) - Math.floor(miny);
    return {
      x: x,
      y: y,
      width: width,
      height: height,
      minX: minx,
      minY: miny
    };
  },
  /**
   * updates the parent combos' size and position
   * @param paramGraph param for debounce function, where 'this' is not available
   * @param paramTargets param for debounce function, where 'this' is not available
   */
  updateParentCombos: function updateParentCombos(paramGraph, paramTargets) {
    var graph = paramGraph || this.graph;
    var targets = paramTargets || this.targets;
    var comboParentMap = {};
    targets === null || targets === void 0 ? void 0 : targets.forEach(function (target) {
      var comboId = target.getModel().comboId;
      if (comboId) comboParentMap[comboId] = graph.findById(comboId);
    });
    Object.values(comboParentMap).forEach(function (combo) {
      if (combo) graph.updateCombo(combo);
    });
  }
};
exports.default = _default;