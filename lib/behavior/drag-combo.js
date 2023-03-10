"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _tslib = require("tslib");
var _util = require("@antv/util");
var _util2 = _interopRequireDefault(require("../util"));
var _global = _interopRequireDefault(require("../global"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
 * @Author: moyee
 * @LastEditors: moyee
 * @Description: 拖动 Combo
 */

var calculationItemsBBox = _util2.default.calculationItemsBBox;
/**
 * 遍历拖动的 Combo 下的所有 Combo
 * @param data 拖动的 Combo
 * @param fn
 */
var traverseCombo = function traverseCombo(data, fn) {
  if (fn(data) === false) {
    return;
  }
  if (data) {
    var combos = data.get('combos');
    if (combos.length === 0) {
      return false;
    }
    (0, _util.each)(combos, function (child) {
      traverseCombo(child, fn);
    });
  }
};
var _default = {
  getDefaultCfg: function getDefaultCfg() {
    return {
      enableDelegate: false,
      delegateStyle: {},
      // 拖动节点过程中是否只改变 Combo 的大小，而不改变其结构
      onlyChangeComboSize: false,
      // 拖动过程中目标 combo 状态样式
      activeState: '',
      selectedState: 'selected',
      enableStack: true
    };
  },
  getEvents: function getEvents() {
    return {
      'combo:dragstart': 'onDragStart',
      'combo:drag': 'onDrag',
      'combo:dragend': 'onDragEnd',
      'combo:drop': 'onDrop',
      'node:drop': 'onNodeDrop',
      'combo:dragenter': 'onDragEnter',
      'combo:dragleave': 'onDragLeave'
    };
  },
  validationCombo: function validationCombo(evt) {
    var item = evt.item;
    if (!item || item.destroyed) {
      return false;
    }
    if (!this.shouldUpdate(evt, this)) {
      return false;
    }
    var type = item.getType();
    if (type !== 'combo') {
      return false;
    }
    return true;
  },
  onDragStart: function onDragStart(evt) {
    var _this = this;
    var graph = this.graph;
    var item = evt.item;
    this.currentShouldEnd = true;
    if (!this.validationCombo(evt)) return;
    this.targets = [];
    // 获取所有选中的 Combo
    var combos = graph.findAllByState('combo', this.selectedState);
    var currentCombo = item.get('id');
    var dragCombos = combos.filter(function (combo) {
      var comboId = combo.get('id');
      return currentCombo === comboId;
    });
    if (dragCombos.length === 0) {
      this.targets.push(item);
    } else {
      this.targets = combos;
    }
    var beforeDragItems = [];
    this.targets.forEach(function (t) {
      var _a = t.getModel(),
        x = _a.x,
        y = _a.y,
        id = _a.id;
      beforeDragItems.push({
        x: x,
        y: y,
        id: id
      });
    });
    this.set('beforeDragItems', beforeDragItems);
    if (this.activeState) {
      this.targets.map(function (combo) {
        var model = combo.getModel();
        if (model.parentId) {
          var parentCombo = graph.findById(model.parentId);
          if (parentCombo) {
            graph.setItemState(parentCombo, _this.activeState, true);
          }
        }
      });
    }
    this.point = {};
    this.originPoint = {};
    this.origin = {
      x: evt.x,
      y: evt.y
    };
    this.currentItemChildCombos = [];
    traverseCombo(item, function (param) {
      if (param.destroyed) {
        return false;
      }
      var model = param.getModel();
      _this.currentItemChildCombos.push(model.id);
      return true;
    });
  },
  onDrag: function onDrag(evt) {
    var _this = this;
    if (!this.origin) {
      return;
    }
    if (!this.validationCombo(evt)) return;
    if (this.enableDelegate) {
      this.updateDelegate(evt);
    } else {
      if (this.activeState) {
        var graph_1 = this.graph;
        var item = evt.item;
        var model_1 = item.getModel();
        // 拖动过程中实时计算距离
        var combos = graph_1.getCombos();
        var sourceBBox = item.getBBox();
        var centerX_1 = sourceBBox.centerX,
          centerY_1 = sourceBBox.centerY,
          width_1 = sourceBBox.width;
        // 参与计算的 Combo，需要排除掉：
        // 1、拖动 combo 自己
        // 2、拖动 combo 的 parent
        // 3、拖动 Combo 的 children
        var calcCombos = combos.filter(function (combo) {
          var cmodel = combo.getModel();
          // 被拖动的是最外层的 Combo，无 parent，排除自身和子元素
          if (!model_1.parentId) {
            return cmodel.id !== model_1.id && !_this.currentItemChildCombos.includes(cmodel.id);
          }
          return cmodel.id !== model_1.id && !_this.currentItemChildCombos.includes(cmodel.id);
        });
        calcCombos.map(function (combo) {
          var _a = combo.getBBox(),
            cx = _a.centerX,
            cy = _a.centerY,
            w = _a.width;
          // 拖动的 combo 和要进入的 combo 之间的距离
          var disX = centerX_1 - cx;
          var disY = centerY_1 - cy;
          // 圆心距离
          var distance = 2 * Math.sqrt(disX * disX + disY * disY);
          if (width_1 + w - distance > 0.8 * width_1) {
            graph_1.setItemState(combo, _this.activeState, true);
          } else {
            graph_1.setItemState(combo, _this.activeState, false);
          }
        });
      }
      (0, _util.each)(this.targets, function (item) {
        _this.updateCombo(item, evt);
      });
      if (this.onlyChangeComboSize) {
        // 拖动节点过程中，动态改变 Combo 的大小
        this.updateParentCombos();
      }
    }
  },
  updatePositions: function updatePositions(evt, restore) {
    var _this = this;
    // 当启用 delegate 时，拖动结束时需要更新 combo
    if (this.enableDelegate || restore) {
      (0, _util.each)(this.targets, function (item) {
        _this.updateCombo(item, evt, restore);
      });
    }
  },
  onDrop: function onDrop(evt) {
    var _this = this;
    // 被放下的目标 combo
    var item = evt.item;
    this.currentShouldEnd = this.shouldEnd(evt, item, this);
    this.updatePositions(evt, !this.currentShouldEnd);
    if (!this.currentShouldEnd || !item || !this.targets || item.destroyed) return;
    var graph = this.graph;
    var targetModel = item.getModel();
    this.targets.map(function (combo) {
      var model = combo.getModel();
      if (model.parentId !== targetModel.id) {
        if (_this.activeState) {
          graph.setItemState(item, _this.activeState, false);
        }
        // 将 Combo 放置到某个 Combo 上面时，只有当 onlyChangeComboSize 为 false 时候才更新 Combo 结构
        if (!_this.onlyChangeComboSize) {
          graph.updateComboTree(combo, targetModel.id, false);
        } else {
          graph.updateCombo(combo);
        }
      } else {
        graph.updateCombo(item);
      }
    });
    this.end(item, evt);
    // 如果已经拖放下了，则不需要再通过距离判断了
    this.endComparison = true;
  },
  onNodeDrop: function onNodeDrop(evt) {
    var _this = this;
    if (!this.targets || this.targets.length === 0) return;
    var graph = this.graph;
    var item = evt.item;
    var comboId = item.getModel().comboId;
    var newParentCombo = comboId ? graph.findById(comboId) : undefined;
    this.currentShouldEnd = this.shouldEnd(evt, newParentCombo, this);
    this.updatePositions(evt, !this.currentShouldEnd);
    if (!this.currentShouldEnd) return;
    var droppedCombo;
    // 如果被放置的的节点有 comboId，且这个 comboId 与正在被拖拽的 combo 的父 id 不相同，则更新父亲为 comboId
    if (comboId) {
      if (this.activeState) {
        var combo = graph.findById(comboId);
        graph.setItemState(combo, this.activeState, false);
      }
      this.targets.map(function (combo) {
        if (!_this.onlyChangeComboSize) {
          if (comboId !== combo.getID()) {
            droppedCombo = graph.findById(comboId);
            if (comboId !== combo.getModel().parentId) graph.updateComboTree(combo, comboId, false);
          }
        } else {
          graph.updateCombo(combo);
        }
      });
    } else {
      // 如果被放置的节点没有 comboId，且正在被拖拽的 combo 有父 id，则更新父亲为 undefined
      this.targets.map(function (combo) {
        if (!_this.onlyChangeComboSize) {
          var model = combo.getModel();
          if (model.comboId) {
            graph.updateComboTree(combo, undefined, false);
          }
        } else {
          graph.updateCombo(combo);
        }
      });
    }
    // 如果已经拖放下了，则不需要再通过距离判断了
    this.endComparison = true;
    this.end(droppedCombo, evt);
  },
  onDragEnter: function onDragEnter(evt) {
    if (!this.origin) {
      return;
    }
    if (!this.validationCombo(evt)) return;
    var item = evt.item;
    var graph = this.graph;
    if (this.activeState) {
      graph.setItemState(item, this.activeState, true);
    }
  },
  onDragLeave: function onDragLeave(evt) {
    if (!this.origin) {
      return;
    }
    if (!this.validationCombo(evt)) return;
    var item = evt.item;
    var graph = this.graph;
    if (this.activeState) {
      graph.setItemState(item, this.activeState, false);
    }
  },
  onDragEnd: function onDragEnd(evt) {
    if (!this.targets || this.targets.length === 0) return;
    var item = evt.item;
    if (this.currentShouldEnd) {
      this.updatePositions(evt);
    }
    var parentCombo = this.getParentCombo(item.getModel().parentId);
    var graph = this.graph;
    if (parentCombo && this.activeState) {
      graph.setItemState(parentCombo, this.activeState, false);
    }
    this.end(undefined, evt);
  },
  end: function end(comboDropedOn, evt) {
    var _this = this;
    if (!this.origin) return;
    var graph = this.graph;
    // 删除delegate shape
    if (this.delegateShape) {
      var delegateGroup = graph.get('delegateGroup');
      delegateGroup.clear();
      this.delegateShape = null;
    }
    if (comboDropedOn && this.activeState) {
      graph.setItemState(comboDropedOn, this.activeState, false);
    }
    // 若没有被放置的 combo，则是被放置在画布上
    if (!comboDropedOn) {
      var stack_1 = graph.get('enabledStack') && this.enableStack;
      var stackData_1 = {
        before: {
          nodes: [],
          edges: [],
          combos: [].concat(this.get('beforeDragItems'))
        },
        after: {
          nodes: [],
          edges: [],
          combos: []
        }
      };
      this.targets.map(function (combo) {
        // 将 Combo 放置到某个 Combo 上面时，只有当 onlyChangeComboSize 为 false 时候才更新 Combo 结构
        if (!_this.onlyChangeComboSize) {
          graph.updateComboTree(combo, undefined, stack_1);
        } else {
          graph.updateCombo(combo);
          var _a = combo.getModel(),
            x = _a.x,
            y = _a.y,
            id = _a.id;
          stackData_1.after.combos.push({
            x: x,
            y: y,
            id: id
          });
          graph.pushStack('update', stackData_1);
        }
      });
    }
    this.point = [];
    this.origin = null;
    this.originPoint = null;
    this.targets.length = 0;
  },
  /**
   * 遍历 comboTree，分别更新 node 和 combo
   * @param data
   * @param fn
   */
  traverse: function traverse(data, fn, edgesToBeUpdate) {
    var _this = this;
    if (edgesToBeUpdate === void 0) {
      edgesToBeUpdate = {};
    }
    if (fn(data, edgesToBeUpdate) === false) {
      return;
    }
    if (data) {
      var combos = data.get('combos');
      (0, _util.each)(combos, function (child) {
        _this.traverse(child, fn, edgesToBeUpdate);
      });
      var nodes = data.get('nodes');
      (0, _util.each)(nodes, function (child) {
        _this.traverse(child, fn, edgesToBeUpdate);
      });
    }
  },
  updateCombo: function updateCombo(item, evt, restore) {
    this.updateSingleItem(item, evt, restore);
    var edgesToBeUpdate = {};
    this.traverse(item, function (paramItem, paramEdgesMap) {
      if (paramItem.destroyed) {
        return false;
      }
      paramItem.getEdges().forEach(function (edge) {
        return paramEdgesMap[edge.getID()] = edge;
      });
      return true;
    }, edgesToBeUpdate);
    Object.values(edgesToBeUpdate).forEach(function (edge) {
      return edge.refresh();
    });
  },
  /**
   *
   * @param item 当前正在拖动的元素
   * @param evt
   */
  updateSingleItem: function updateSingleItem(item, evt, restore) {
    var origin = this.origin;
    var graph = this.graph;
    var model = item.getModel();
    var itemId = item.get('id');
    if (!this.point[itemId]) {
      this.point[itemId] = {
        x: model.x,
        y: model.y
      };
    }
    var x = evt.x - origin.x + this.point[itemId].x;
    var y = evt.y - origin.y + this.point[itemId].y;
    if (restore) {
      x += origin.x - evt.x;
      y += origin.y - evt.y;
    }
    graph.updateItem(item, {
      x: x,
      y: y
    }, false);
    // item.getEdges()?.forEach(edge => edge.refresh());
  },

  /**
   * 根据 ID 获取父 Combo
   * @param parentId 父 Combo ID
   */
  getParentCombo: function getParentCombo(parentId) {
    var graph = this.graph;
    if (!parentId) {
      return undefined;
    }
    var parentCombo = graph.findById(parentId);
    if (!parentCombo) {
      return undefined;
    }
    return parentCombo;
  },
  updateDelegate: function updateDelegate(evt) {
    var graph = this.graph;
    // 当没有 delegate shape 时创建
    if (!this.delegateShape) {
      var delegateGroup = graph.get('delegateGroup');
      var bbox = null;
      if (this.targets.length > 1) {
        bbox = calculationItemsBBox(this.targets);
      } else {
        bbox = this.targets[0].getBBox();
      }
      var x = bbox.x,
        y = bbox.y,
        width = bbox.width,
        height = bbox.height,
        minX = bbox.minX,
        minY = bbox.minY;
      this.originPoint = {
        x: x,
        y: y,
        width: width,
        height: height,
        minX: minX,
        minY: minY
      };
      var attrs = (0, _tslib.__assign)((0, _tslib.__assign)({}, _global.default.delegateStyle), this.delegateStyle);
      this.delegateShape = delegateGroup.addShape('rect', {
        attrs: (0, _tslib.__assign)({
          width: bbox.width,
          height: bbox.height,
          x: bbox.x,
          y: bbox.y
        }, attrs),
        name: 'combo-delegate-shape'
      });
      this.delegateShape.set('capture', false);
      this.delegate = this.delegateShape;
    } else {
      var clientX = evt.x - this.origin.x + this.originPoint.minX;
      var clientY = evt.y - this.origin.y + this.originPoint.minY;
      this.delegateShape.attr({
        x: clientX,
        y: clientY
      });
    }
  },
  /**
   * updates the parent combos' size and position
   */
  updateParentCombos: function updateParentCombos() {
    var _a = this,
      graph = _a.graph,
      targets = _a.targets;
    var comboParentMap = {};
    targets === null || targets === void 0 ? void 0 : targets.forEach(function (target) {
      var comboId = target.getModel().parentId;
      if (comboId) comboParentMap[comboId] = graph.findById(comboId);
    });
    Object.values(comboParentMap).forEach(function (combo) {
      if (combo) graph.updateCombo(combo);
    });
  }
};
exports.default = _default;