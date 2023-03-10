import { AbstractLayout } from '@antv/g6-core';
import { IGraph } from '../../interface/graph';
export default class LayoutController extends AbstractLayout {
    graph: IGraph;
    destroyed: boolean;
    private worker;
    private workerData;
    private isGPU;
    constructor(graph: IGraph);
    protected initLayout(): void;
    private getWorker;
    private stopWorker;
    protected execLayoutMethod(layoutCfg: any, order: any): Promise<void>;
    private updateLayoutMethod;
    /**
     * @param {function} success callback
     * @return {boolean} 是否使用web worker布局
     */
    layout(success?: () => void): boolean;
    /**
     * 增量数据初始化位置
     */
    tweakInit(): void;
    initWithPreset(): boolean;
    /**
     * layout with web worker
     * @param {object} data graph data
     * @return {boolean} 是否支持web worker
     */
    private layoutWithWorker;
    private runWebworker;
    private handleWorkerMessage;
    updateLayoutCfg(cfg: any): void;
    protected adjustPipesBox(data: any, adjust: string): Promise<void>;
    hasGPUVersion(layoutName: string): boolean;
    destroy(): void;
}
