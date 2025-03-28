import { ComponentInternalInstance } from "vue";

/**
 * 获取节点信息
 * @param selector
 * @param instance
 * @returns
 */
export function getNodeRect(
    selector: string,
    instance: ComponentInternalInstance
): Promise<UniApp.NodeInfo> {
    return new Promise((resolve) => {
        uni.createSelectorQuery()
            .in(instance)
            .select(selector)
            .boundingClientRect((rect: UniApp.NodeInfo) => {
                resolve(rect);
            })
            .exec();
    });
}

/**
 * 获取所有节点信息
 * @param selector
 * @param instance
 * @returns
 */
export function getNodeRects(
    selector: string,
    instance: ComponentInternalInstance
): Promise<UniApp.NodeInfo[]> {
    return new Promise((resolve) => {
        uni.createSelectorQuery()
            .in(instance)
            .selectAll(selector)
            .boundingClientRect((rect: UniApp.NodeInfo[]) => {
                resolve(rect);
            })
            .exec();
    });
}

/**
 * 计算两个矩形的相交面积
 * @param rect1
 * @param rect2
 * @returns
 */
export function getIntersectionArea(
    rect1: UniApp.NodeInfo,
    rect2: UniApp.NodeInfo
): number {
    const xOverlap = Math.max(
        0,
        Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)
    );
    const yOverlap = Math.max(
        0,
        Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)
    );
    return xOverlap * yOverlap;
}

/**
 * 数组交换索引数据
 */
export function swapArrayElements(
    arr: Array<unknown>,
    index1: number,
    index2: number
): Array<unknown> {
    const temp = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = temp;
    return arr;
}

/**
 * 数组索引元素移动指定距离
 * @param arr
 * @param index 指定索引
 * @param n 移动距离
 * @param direction 方向；r-right；l-left
 * @param isCircular 循环
 * @returns
 */
export function moveElementInArray(
    arr: Array<unknown>,
    index: number,
    n = 1,
    direction = 'r',
    isCircular = true
) {
    const length = arr.length;
    if (index < 0 || index >= length) {
        return arr;
    }

    let newIndex: number;
    if (direction === 'r') {
        if (isCircular) {
            newIndex = (index + n) % length;
        } else {
            newIndex = Math.min(index + n, length - 1);
        }
    } else if (direction === 'l') {
        if (isCircular) {
            newIndex = (index - n + length) % length;
        } else {
            newIndex = Math.max(index - n, 0);
        }
    } else {
        return arr;
    }

    const element = arr.splice(index, 1)[0];
    arr.splice(newIndex, 0, element);
    return arr;
}
