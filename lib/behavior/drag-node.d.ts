import { G6Event, IG6GraphEvent, Item, ICombo } from '@antv/g6-core';
declare const _default: {
    getDefaultCfg(): object;
    getEvents(): {
        [x: string & {}]: string;
        click?: string;
        dblclick?: string;
        dragstart?: string;
        drag?: string;
        dragend?: string;
        dragenter?: string;
        dragleave?: string;
        dragover?: string;
        drop?: string;
        mousedown?: string;
        mouseenter?: string;
        mouseup?: string;
        mousemove?: string;
        mouseout?: string;
        mouseover?: string;
        mouseleave?: string;
        panmove?: string;
        panend?: string;
        touchstart?: string;
        touchmove?: string;
        touchend?: string;
        contextmenu?: string;
        "node:click"?: string;
        "node:dblclick"?: string;
        "node:dragstart"?: string;
        "node:drag"?: string;
        "node:dragend"?: string;
        "node:dragenter"?: string;
        "node:dragleave"?: string;
        "node:dragover"?: string;
        "node:drop"?: string;
        "node:mousedown"?: string;
        "node:mouseenter"?: string;
        "node:mouseup"?: string;
        "node:mousemove"?: string;
        "node:mouseout"?: string;
        "node:mouseover"?: string;
        "node:mouseleave"?: string;
        "node:panestart"?: string;
        "node:panmove"?: string;
        "node:panend"?: string;
        "node:touchstart"?: string;
        "node:touchmove"?: string;
        "node:touchend"?: string;
        "node:contextmenu"?: string;
        "edge:click"?: string;
        "edge:dblclick"?: string;
        "edge:dragstart"?: string;
        "edge:drag"?: string;
        "edge:dragend"?: string;
        "edge:dragenter"?: string;
        "edge:dragleave"?: string;
        "edge:dragover"?: string;
        "edge:mousedown"?: string;
        "edge:mouseenter"?: string;
        "edge:mouseup"?: string;
        "edge:mousemove"?: string;
        "edge:mouseout"?: string;
        "edge:mouseover"?: string;
        "edge:mouseleave"?: string;
        "edge:touchstart"?: string;
        "edge:touchmove"?: string;
        "edge:touchend"?: string;
        "edge:contextmenu"?: string;
        "combo:click"?: string;
        "combo:dblclick"?: string;
        "combo:dragstart"?: string;
        "combo:drag"?: string;
        "combo:dragend"?: string;
        "combo:dragenter"?: string;
        "combo:dragleave"?: string;
        "combo:dragover"?: string;
        "combo:drop"?: string;
        "combo:mousedown"?: string;
        "combo:mouseenter"?: string;
        "combo:mouseup"?: string;
        "combo:mousemove"?: string;
        "combo:mouseout"?: string;
        "combo:mouseover"?: string;
        "combo:mouseleave"?: string;
        "combo:panestart"?: string;
        "combo:panmove"?: string;
        "combo:panend"?: string;
        "combo:touchstart"?: string;
        "combo:touchmove"?: string;
        "combo:touchend"?: string;
        "combo:contextmenu"?: string;
        keydown?: string;
        keyup?: string;
        wheel?: string;
        "canvas:click"?: string;
        "canvas:dblclick"?: string;
        "canvas:dragstart"?: string;
        "canvas:drag"?: string;
        "canvas:dragend"?: string;
        "canvas:dragenter"?: string;
        "canvas:dragleave"?: string;
        "canvas:drop"?: string;
        "canvas:mousedown"?: string;
        "canvas:mouseenter"?: string;
        "canvas:mouseup"?: string;
        "canvas:mousemove"?: string;
        "canvas:mouseout"?: string;
        "canvas:mouseover"?: string;
        "canvas:mouseleave"?: string;
        "canvas:touchstart"?: string;
        "canvas:touchmove"?: string;
        "canvas:touchend"?: string;
        "canvas:contextmenu"?: string;
        "canvas:keydown"?: string;
        "canvas:keyup"?: string;
        "canvas:wheel"?: string;
        beforerender?: string;
        afterrender?: string;
        beforeadditem?: string;
        afteradditem?: string;
        beforeremoveitem?: string;
        afterremoveitem?: string;
        beforeupdateitem?: string;
        afterupdateitem?: string;
        beforeitemvisibilitychange?: string;
        afteritemvisibilitychange?: string;
        beforeitemstatechange?: string;
        afteritemstatechange?: string;
        beforeitemrefresh?: string;
        afteritemrefresh?: string;
        beforeitemstatesclear?: string;
        afteritemstatesclear?: string;
        beforemodechange?: string;
        aftermodechange?: string;
        beforelayout?: string;
        afterlayout?: string;
        beforegraphrefreshposition?: string;
        aftergraphrefreshposition?: string;
        beforegraphrefresh?: string;
        aftergraphrefresh?: string;
        beforeanimate?: string;
        afteranimate?: string;
        beforecreateedge?: string;
        aftercreateedge?: string;
        beforecollapseexpandcombo?: string;
        aftercollapseexpandcombo?: string;
        graphstatechange?: string;
        afteractivaterelations?: string;
        nodeselectchange?: string;
        itemcollapsed?: string;
        tooltipchange?: string;
        wheelzoom?: string;
        viewportchange?: string;
        dragnodeend?: string;
        stackchange?: string;
        beforepaint?: string;
        afterpaint?: string;
        tap?: string;
        pinchstart?: string;
        pinmove?: string;
        panstart?: string;
        dragout?: string;
        focus?: string;
        blur?: string;
    };
    validationCombo(item: ICombo): boolean;
    onTouchStart(evt: IG6GraphEvent): void;
    onTouchMove(e: IG6GraphEvent): void;
    /**
     * cache the manipulated item and target, since drag and dragend are global events but not node:*
     * @param evt event param
     */
    onMouseDown(evt: IG6GraphEvent): void;
    /**
     * trigger dragstart/drag by mousedown and drag events
     * @param evt event param
     */
    onDragMove(evt: IG6GraphEvent): void;
    /**
     * ??????????????????
     * @param evt
     */
    onDragStart(evt: IG6GraphEvent): void;
    /**
     * ??????????????????
     * @param evt
     */
    onDrag(evt: IG6GraphEvent): void;
    /**
     * ?????????????????????????????????capture???true???????????????????????????????????????????????? combo???????????? combo ??????
     * @param evt
     */
    onDragEnd(evt: IG6GraphEvent): void;
    /**
     * ????????????????????????????????? combo ???
     * @param evt
     */
    onDropCombo(evt: IG6GraphEvent): void;
    onDropCanvas(evt: IG6GraphEvent): void;
    /**
     * ????????????????????? combo ????????? node ???
     * @param evt
     */
    onDropNode(evt: IG6GraphEvent): void;
    /**
     * ?????????????????? Combo ???
     * @param evt
     */
    onDragEnter(evt: IG6GraphEvent): void;
    /**
     * ???????????? Combo ?????????
     * @param evt
     */
    onDragLeave(evt: IG6GraphEvent): void;
    updatePositions(evt: IG6GraphEvent, restore: boolean): void;
    /**
     * ????????????
     * @param item ?????????????????????
     * @param evt
     */
    update(item: Item, evt: IG6GraphEvent, restore: boolean): void;
    /**
     * ??????????????????
     * @param item ?????????????????????
     * @param evt
     */
    debounceUpdate: () => void;
    /**
     * ????????????????????????delegate
     * @param {Event} evt ????????????
     * @param {number} x ???????????????????????????x??????
     * @param {number} y ???????????????????????????y??????
     */
    updateDelegate(evt: any): void;
    /**
     * ??????delegate????????????????????????????????????????????????
     * @memberof ItemGroup
     * @return {object} ???????????????delegate?????????????????????
     */
    calculationGroupPosition(evt: IG6GraphEvent): {
        x: number;
        y: number;
        width: number;
        height: number;
        minX: number;
        minY: number;
    };
    /**
     * updates the parent combos' size and position
     * @param paramGraph param for debounce function, where 'this' is not available
     * @param paramTargets param for debounce function, where 'this' is not available
     */
    updateParentCombos(paramGraph: any, paramTargets: any): void;
};
export default _default;
