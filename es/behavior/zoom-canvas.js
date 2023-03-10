import { ext } from '@antv/matrix-util';
import { clone } from '@antv/util';
var transform = ext.transform;
var DELTA = 0.05;
export default {
  getDefaultCfg: function getDefaultCfg() {
    return {
      sensitivity: 2,
      minZoom: undefined,
      maxZoom: undefined,
      enableOptimize: false,
      optimizeZoom: 0.1,
      fixSelectedItems: {
        fixAll: false,
        fixLineWidth: false,
        fixLabel: false,
        fixState: 'selected'
      },
      animate: false,
      animateCfg: {
        duration: 500
      }
    };
  },
  getEvents: function getEvents() {
    var fixSelectedItems = this.fixSelectedItems;
    if (!fixSelectedItems.fixState) fixSelectedItems.fixState = 'selected';
    if (fixSelectedItems.fixAll) {
      fixSelectedItems.fixLineWidth = true;
      fixSelectedItems.fixLabel = true;
    }
    return {
      wheel: 'onWheel',
      touchstart: 'onTouchStart',
      touchmove: 'onTouchMove',
      touchend: 'onTouchEnd'
    };
  },
  onTouchStart: function onTouchStart(evt) {
    var touches = evt.originalEvent.touches;
    var event1 = touches[0];
    var event2 = touches[1];
    evt.preventDefault();
    // 如果不是缩放事件则禁止继续执行
    if (!event2) {
      return;
    }
    if (this.shouldBegin && !this.shouldBegin(evt, this)) {
      return;
    }
    // 第一个触摸点位置
    this.startPoint = {
      pageX: event1.pageX,
      pageY: event1.pageY
    };
    this.moveable = true;
    if (event2) {
      this.endPoint = {
        pageX: event2.pageX,
        pageY: event2.pageY
      };
    }
    this.originScale = this.graph.getZoom() || this.currentScale || 1;
  },
  onTouchMove: function onTouchMove(evt) {
    if (!this.moveable) {
      return;
    }
    evt.preventDefault();
    var touches = evt.originalEvent.touches;
    var event1 = touches[0];
    var event2 = touches[1];
    if (!event2) {
      return;
    }
    if (!this.endPoint) {
      this.endPoint = {
        pageX: event2.pageX,
        pageY: event2.pageY
      };
    }
    // 获取坐标之间的距离
    var getDistance = function getDistance(start, end) {
      return Math.hypot(end.x - start.x, end.y - start.y);
    };
    // 双指缩放比例
    var scale = getDistance({
      x: event1.pageX,
      y: event1.pageY
    }, {
      x: event2.pageX,
      y: event2.pageY
    }) / getDistance({
      x: this.startPoint.pageX,
      y: this.startPoint.pageY
    }, {
      x: this.endPoint.pageX,
      y: this.endPoint.pageY
    });
    // 应用到画布上的缩放比例
    var zoom = this.originScale * scale;
    // 缓存当前的缩放比例
    this.currentScale = zoom;
    var minZoom = this.get('minZoom') || this.graph.get('minZoom');
    var maxZoom = this.get('maxZoom') || this.graph.get('maxZoom');
    if (zoom > maxZoom || zoom < minZoom) {
      return;
    }
    var animate = this.get('animate');
    var animateCfg = this.get('animateCfg');
    var canvas = this.graph.get('canvas');
    var point = canvas.getPointByClient(evt.clientX, evt.clientY);
    this.graph.zoomTo(zoom, {
      x: point.x,
      y: point.y
    }, animate, animateCfg);
    this.graph.emit('wheelzoom', evt);
  },
  onTouchEnd: function onTouchEnd() {
    this.moveable = false;
    this.endPoint = null;
  },
  onWheel: function onWheel(e) {
    var _this = this;
    var _a = this,
      graph = _a.graph,
      fixSelectedItems = _a.fixSelectedItems;
    if (this.shouldBegin && !this.shouldBegin(e, this)) {
      return;
    }
    if (!this.shouldUpdate(e, this)) {
      return;
    }
    e.preventDefault();
    var canvas = graph.get('canvas');
    var point = canvas.getPointByClient(e.clientX, e.clientY);
    var sensitivity = this.get('sensitivity');
    var graphZoom = graph.getZoom();
    var ratio = graphZoom;
    var zoom = graphZoom;
    // 兼容IE、Firefox及Chrome
    if (e.wheelDelta < 0) {
      ratio = 1 - DELTA * sensitivity;
    } else {
      ratio = 1 / (1 - DELTA * sensitivity);
    }
    zoom = graphZoom * ratio;
    var minZoom = this.get('minZoom') || graph.get('minZoom');
    var maxZoom = this.get('maxZoom') || graph.get('maxZoom');
    if (zoom > maxZoom) {
      zoom = maxZoom;
    } else if (zoom < minZoom) {
      zoom = minZoom;
    }
    // hide the shapes when the zoom ratio is smaller than optimizeZoom
    // hide the shapes when zoomming
    var enableOptimize = this.get('enableOptimize');
    if (enableOptimize) {
      var optimizeZoom_1 = this.get('optimizeZoom');
      var optimized = this.get('optimized');
      var nodes_1 = graph.getNodes();
      var edges_1 = graph.getEdges();
      var nodesLength_1 = nodes_1.length;
      var edgesLength_1 = edges_1.length;
      // hiding
      if (!optimized) {
        for (var n = 0; n < nodesLength_1; n++) {
          var node = nodes_1[n];
          if (!node.destroyed) {
            var children = node.get('group').get('children');
            var childrenLength = children.length;
            for (var c = 0; c < childrenLength; c++) {
              var shape = children[c];
              if (!shape.destoryed && !shape.get('isKeyShape')) {
                shape.set('ori-visibility', shape.get('ori-visibility') || shape.get('visible'));
                shape.hide();
              }
            }
          }
        }
        for (var edgeIndex = 0; edgeIndex < edgesLength_1; edgeIndex++) {
          var edge = edges_1[edgeIndex];
          var children = edge.get('group').get('children');
          var childrenLength = children.length;
          for (var c = 0; c < childrenLength; c++) {
            var shape = children[c];
            shape.set('ori-visibility', shape.get('ori-visibility') || shape.get('visible'));
            shape.hide();
          }
        }
        this.set('optimized', true);
      }
      // showing after 100ms
      clearTimeout(this.get('timeout'));
      var timeout = setTimeout(function () {
        var currentZoom = graph.getZoom();
        var curOptimized = _this.get('optimized');
        if (curOptimized) {
          _this.set('optimized', false);
          for (var n = 0; n < nodesLength_1; n++) {
            var node = nodes_1[n];
            var children = node.get('group').get('children');
            var childrenLength = children.length;
            if (currentZoom < optimizeZoom_1) {
              var keyShape = node.getKeyShape();
              var oriVis = keyShape.get('ori-visibility');
              keyShape.set('ori-visibility', undefined);
              if (oriVis) keyShape.show();
            } else {
              for (var c = 0; c < childrenLength; c++) {
                var shape = children[c];
                var oriVis = shape.get('ori-visibility');
                shape.set('ori-visibility', undefined);
                if (!shape.get('visible') && oriVis) {
                  if (oriVis) shape.show();
                }
              }
            }
          }
          for (var edgeIndex = 0; edgeIndex < edgesLength_1; edgeIndex++) {
            var edge = edges_1[edgeIndex];
            var children = edge.get('group').get('children');
            var childrenLength = children.length;
            if (currentZoom < optimizeZoom_1) {
              var keyShape = edge.getKeyShape();
              var oriVis = keyShape.get('ori-visibility');
              keyShape.set('ori-visibility', undefined);
              if (oriVis) keyShape.show();
            } else {
              for (var c = 0; c < childrenLength; c++) {
                var shape = children[c];
                if (!shape.get('visible')) {
                  var oriVis = shape.get('ori-visibility');
                  shape.set('ori-visibility', undefined);
                  if (oriVis) shape.show();
                }
              }
            }
          }
        }
      }, 100);
      this.set('timeout', timeout);
    }
    // fix the items when zooming
    if (graphZoom <= 1) {
      var fixNodes = void 0,
        fixEdges = void 0;
      if (fixSelectedItems.fixAll || fixSelectedItems.fixLineWidth || fixSelectedItems.fixLabel) {
        fixNodes = graph.findAllByState('node', fixSelectedItems.fixState);
        fixEdges = graph.findAllByState('edge', fixSelectedItems.fixState);
        var scale = graphZoom / zoom;
        var fixNodesLength = fixNodes.length;
        for (var fn = 0; fn < fixNodesLength; fn++) {
          var node = fixNodes[fn];
          var group = node.getContainer();
          var nodeModel = node.getModel();
          var originStyle = node.getOriginStyle();
          var itemStateStyle = node.getStateStyle(fixSelectedItems.fixState);
          var shapeStateStyle = node.get('shapeFactory').getShape(nodeModel.type).getStateStyle(fixSelectedItems.fixState, node)[fixSelectedItems.fixState];
          if (fixSelectedItems.fixAll) {
            if (zoom <= 1) {
              var groupMatrix = clone(group.getMatrix());
              if (!groupMatrix) groupMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
              var _b = node.getModel(),
                x = _b.x,
                y = _b.y;
              groupMatrix = transform(groupMatrix, [['t', -x, -y], ['s', scale, scale], ['t', x, y]]);
              group.setMatrix(groupMatrix);
            }
          } else {
            var children = group.get('children');
            var childrenLength = children.length;
            for (var c = 0; c < childrenLength; c++) {
              var shape = children[c];
              var fontSize = void 0,
                lineWidth = void 0;
              if (fixSelectedItems.fixLabel) {
                var shapeType = shape.get('type');
                if (shapeType === 'text') {
                  fontSize = shape.attr('fontSize') || 12;
                  var itemStyle = itemStateStyle[shape.get('name')];
                  var shapeStyle = shapeStateStyle[shape.get('name')];
                  var itemFontSize = itemStyle ? itemStyle.fontSize : 12;
                  var shapeFontSize = shapeStyle ? shapeStyle.fontSize : 12;
                  var oriFontSize = itemFontSize || shapeFontSize || 12;
                  if (zoom <= 1) shape.attr('fontSize', oriFontSize / zoom); // * graphZoom / zoom
                  if (lineWidth) break;
                }
              }
              if (fixSelectedItems.fixLineWidth) {
                if (shape.get('isKeyShape')) {
                  lineWidth = shape.attr('lineWidth') || 0;
                  var oriLineWidth = itemStateStyle.lineWidth || shapeStateStyle.lineWidth || originStyle.lineWidth || 0;
                  if (zoom <= 1) shape.attr('lineWidth', oriLineWidth / zoom); // * graphZoom / zoom
                  if (fontSize) break;
                }
              }
            }
          }
        }
        var fixEdgesLength = fixEdges.length;
        for (var fe = 0; fe < fixEdgesLength; fe++) {
          var edge = fixEdges[fe];
          var group = edge.getContainer();
          var children = group.get('children');
          var nodeModel = edge.getModel();
          var itemStateStyle = edge.getStateStyle(fixSelectedItems.fixState);
          var shapeStateStyle = edge.get('shapeFactory').getShape(nodeModel.type).getStateStyle(fixSelectedItems.fixState, edge)[fixSelectedItems.fixState];
          var childrenLength = children.length;
          for (var c = 0; c < childrenLength; c++) {
            var shape = children[c];
            var fontSize = void 0,
              lineWidth = void 0;
            if (fixSelectedItems.fixLabel || fixSelectedItems.fixAll) {
              var shapeType = shape.get('type');
              if (shapeType === 'text') {
                fontSize = shape.attr('fontSize') || 12;
                var itemStyle = itemStateStyle[shape.get('name')];
                var shapeStyle = shapeStateStyle[shape.get('name')];
                var itemFontSize = itemStyle ? itemStyle.fontSize : 12;
                var shapeFontSize = shapeStyle ? shapeStyle.fontSize : 12;
                var oriFontSize = itemFontSize || shapeFontSize || 12;
                if (zoom <= 1) shape.attr('fontSize', oriFontSize / zoom);
                if (lineWidth) break;
              }
            }
            if (fixSelectedItems.fixLineWidth || fixSelectedItems.fixAll) {
              if (shape.get('isKeyShape')) {
                lineWidth = shape.attr('lineWidth') || 0;
                var oriLineWidth = itemStateStyle.lineWidth || shapeStateStyle.lineWidth || 1;
                if (zoom <= 1) shape.attr('lineWidth', oriLineWidth / zoom);
                if (fontSize) break;
              }
            }
          }
        }
      }
    }
    var animate = this.get('animate');
    var animateCfg = this.get('animateCfg');
    graph.zoomTo(zoom, {
      x: point.x,
      y: point.y
    }, animate, animateCfg);
    graph.emit('wheelzoom', e);
  }
};