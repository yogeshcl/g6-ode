import { __assign } from "tslib";
import * as ColorUtil from './color';
import * as LayoutUtil from './layout';
import * as GpuUtil from './gpu';
import { Util } from '@antv/g6-core';
var G6Util = __assign(__assign(__assign(__assign({}, Util), ColorUtil), LayoutUtil), GpuUtil);
export default G6Util;