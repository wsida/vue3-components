declare type LayoutData = {
    left: number;
    top: number;
    width: number;
    height: number;
};
declare type LayoutNode = {
    id: number;
    style: Object;
    children: LayoutNode[];
    layout?: LayoutData;
};
declare class Element {
    static uuid(): number;
    parent: Element | null;
    id: number;
    style: {
        [key: string]: any;
    };
    computedStyle: {
        [key: string]: any;
    };
    lastComputedStyle: {
        [key: string]: any;
    };
    children: {
        [key: string]: Element;
    };
    layoutBox: LayoutData;
    constructor(style?: {
        [key: string]: any;
    });
    getAbsolutePosition(element: Element): any;
    add(element: Element): void;
    remove(element?: Element): void;
    getNodeTree(): LayoutNode;
    applyLayout(layoutNode: LayoutNode): void;
    layout(): void;
}
export default Element;
