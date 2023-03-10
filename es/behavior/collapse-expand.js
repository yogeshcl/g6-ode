var DEFAULT_TRIGGER = 'click';
var ALLOW_EVENTS = ['click', 'dblclick'];
export default {
  getDefaultCfg: function getDefaultCfg() {
    return {
      /**
       * 发生收缩/扩展变化时的回调
       */
      trigger: DEFAULT_TRIGGER,
      onChange: function onChange() {}
    };
  },
  getEvents: function getEvents() {
    var _a;
    var trigger;
    // 检测输入是否合法
    if (ALLOW_EVENTS.includes(this.trigger)) {
      trigger = this.trigger;
    } else {
      trigger = DEFAULT_TRIGGER;
      // eslint-disable-next-line no-console
      console.warn("Behavior collapse-expand 的 trigger 参数不合法，请输入 'click' 或 'dblclick'");
    }
    return _a = {}, _a["node:".concat(trigger)] = 'onNodeClick',
    // 支持移动端事件
    _a.touchstart = 'onNodeClick', _a;
  },
  onNodeClick: function onNodeClick(e) {
    var item = e.item;
    if (!item) return;
    // 如果节点进行过更新，model 会进行 merge，直接改 model 就不能改布局，所以需要去改源数据
    var sourceData = this.graph.findDataById(item.get('id'));
    if (!sourceData) {
      return;
    }
    var children = sourceData.children;
    // 叶子节点的收缩和展开没有意义
    if (!children || children.length === 0) {
      return;
    }
    var collapsed = !sourceData.collapsed;
    if (!this.shouldBegin(e, collapsed, this)) {
      return;
    }
    sourceData.collapsed = collapsed;
    item.getModel().collapsed = collapsed;
    this.graph.emit('itemcollapsed', {
      item: e.item,
      collapsed: collapsed
    });
    if (!this.shouldUpdate(e, collapsed, this)) {
      return;
    }
    this.onChange(item, collapsed, this);
    this.graph.layout();
  }
};