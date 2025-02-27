<template>
    <view class="wsd-scroll-tabs">
        <scroll-view
            v-if="normalizeDataSource.length"
            :class="[
                'wsd-scroll-tabs__scroll',
                virtual && 'wsd-scroll-tabs__scroll--virtual',
                virtual && `is-${cellSizeMode}`,
                customClass,
            ]"
            :style="{
                '--scroll-active-color': activeColor,
                '--scroll-tabs-gap': `${itemGap}px`,
                '--scroll-tabs-size': `${itemSize}px`,
            }"
            :scroll-x="scrollable"
            :scroll-left="scrollLeft"
            :scroll-with-animation="true"
            @scroll="onTabScroll"
        >
            <view class="wsd-scroll-tabs__scroll-inner">
                <block v-if="virtual">
                    <view
                        :style="{
                            position: 'relative',
                            width: `${virtualListWidth}px`,
                            height: '100%',
                        }"
                    ></view>
                    <view
                        :style="{
                            position: 'absolute',
                            opacity: opacity,
                            zIndex: 1,
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: 'auto',
                            transform: `translateX(${startPadding}px)`,
                        }"
                    >
                        <view
                            :class="['wsd-scroll-tabs__list', listCustomClass]"
                        >
                            <view
                                v-for="(item, index) in virtualList"
                                :key="item[CellKeyName]"
                                :id="item[CellIndexName]"
                                wx:key="_v_key"
                                :class="[
                                    'wsd-scroll-tabs__list-item',
                                    activeKey == item[keyField]
                                        ? 'wsd-scroll-tabs__list-item--active'
                                        : '',
                                    itemCustomClass,
                                ]"
                                @click="
                                    onItemClick(
                                        item,
                                        item[keyField],
                                        startIndex + index
                                    )
                                "
                            >
                                <view class="wsd-scroll-tabs__list-item-inner">
                                    <slot
                                        :item="item"
                                        :index="startIndex + index"
                                        :v-index="index"
                                    >
                                        <text
                                            class="wsd-scroll-tabs__list-item-text"
                                        >
                                            {{ item[labelField] }}
                                        </text>
                                    </slot>
                                </view>
                            </view>
                        </view>
                    </view>
                </block>
                <block v-else>
                    <view :class="['wsd-scroll-tabs__list', listCustomClass]">
                        <view
                            v-for="(item, index) in normalizeDataSource"
                            :key="`${item[keyField]}-${index}`"
                            :class="[
                                'wsd-scroll-tabs__list-item',
                                activeKey == item[keyField]
                                    ? 'wsd-scroll-tabs__list-item--active'
                                    : '',
                                itemCustomClass,
                            ]"
                            @click="onItemClick(item, item[keyField], index)"
                        >
                            <view class="wsd-scroll-tabs__list-item-inner">
                                <slot
                                    :item="item"
                                    :index="index"
                                >
                                    <text
                                        class="wsd-scroll-tabs__list-item-text"
                                    >
                                        {{ item[labelField] }}
                                    </text>
                                </slot>
                            </view>
                        </view>
                    </view>
                </block>
                <view
                    v-if="center"
                    class="wsd-scroll-tabs__space"
                    :style="{ '--scroll-tabs-space-width': `${spaceWidth}px` }"
                ></view>
                <view
                    v-if="showLine"
                    class="wsd-scroll-tabs__line"
                    :style="lineStyle"
                ></view>
            </view>
        </scroll-view>
    </view>
</template>

<script lang="ts" setup>
import useVirtualScroll, {
    CellKeyName,
    CellIndexName,
    CustomVirtualScrollProps,
} from "@/static/ts/hooks/useVirtualScroll";
import {
    computed,
    CSSProperties,
    getCurrentInstance,
    nextTick,
    onMounted,
    ref,
    unref,
    watch,
} from "vue";

defineOptions({
    name: "WptScrollTabsX",
});

type ItemType = Record<string, any>;

export interface WptScrollTabsProps
    extends Pick<
        CustomVirtualScrollProps,
        | "virtual"
        | "safeDynamicRender"
        | "viewCounts"
        | "previewCounts"
        | "cellSizeMode"
    > {
    modelValue: number;
    dataSource: ItemType[] | string[];
    keyField?: string;
    labelField?: string;
    customClass?: string;
    listCustomClass?: string;
    itemCustomClass?: string;
    itemSize?: number; // 开启虚拟列表时需要固定宽度
    center?: boolean; // 是否居中显示
    absoluteCenterX?: boolean; // 是否相对屏幕居中，false表示相对scroll-view居中
    spaceAlways?: boolean; // space空白一直是否一致显示，false表示小于一屏时不会添加空白
    itemGap?: number; // 间距
    activeColor?: string; // 默认选中高亮颜色
    offset?: number; // scroll-into-view时距离左右边界间距
    renderWhenMounted?: boolean;
    ignoreChange?: boolean;
    showLine?: boolean;
    lineColor?: string;
    lineWidth?: number;
    lineHeight?: number;
    lineRadius?: number;
    scrollable?: boolean;
}

const props = withDefaults(defineProps<WptScrollTabsProps>(), {
    keyField: "id",
    labelField: "label",
    center: false,
    absoluteCenterX: false,
    spaceAlways: false,
    itemGap: 12,
    itemSize: 120,
    virtual: false,
    cellSizeMode: "fixed",
    viewCounts: 10,
    previewCounts: 10,
    ignoreCountsChange: false,
    safeDynamicRender: false,
    activeColor: "#277EEF",
    renderWhenMounted: true,
    ignoreChange: false,
    showLine: false,
    lineWidth: 20,
    lineHeight: 2,
    lineRadius: 2,
    scrollable: true,
});

const emits = defineEmits<{
    (e: "update:modelValue", active: string | number): void;
    (e: "on-click", item: ItemType, key: string | number, index: number): void;
}>();

const _instance = getCurrentInstance();

const scrollLeft = ref(0);
const lastScrollLeft = ref(0);
const realWrapWidth = ref(0);
const spaceWidth = ref(0);
const lineOffset = ref(0);

const ignoreActiveChange = ref(false);

const finalOffset = computed<number>(() => props.offset ?? props.itemGap / 2);

const normalizeDataSource = computed<ItemType[]>(() => {
    return props.dataSource.map((item: ItemType | string) => {
        if (typeof item === "string")
            return {
                [props.keyField]: item,
                [props.labelField]: item,
            };
        return item;
    });
});

const virtualProps = computed<CustomVirtualScrollProps>(() => ({
    virtual: props.virtual,
    keyField: props.keyField,
    scrollDirection: "x",
    data: unref(normalizeDataSource),
    scrollDistance: unref(scrollLeft),
    cellSizeMode: props.cellSizeMode,
    prefixDistance: 0,
    useAffixDistance: props.center,
    affixDistance: props.center ? unref(spaceWidth) : 0,
    scrollOffset: 0,
    viewCounts: props.viewCounts,
    previewCounts: props.previewCounts,
    cellCols: 1,
    ignoreCountsChange: true,
    initRenderManual: true,
    spaceAlways: false,
}));

const {
    totalPadding,
    startPadding,
    startIndex,
    virtualList,
    opacity,
    virtualCellSize,
    scrollThrottle,
    scrollToIndex: _virtualScrollToIndex,
    initVirtualList,
    deleteCellItemByvIndex,
    deleteCellItemByIndex,
    updateCellItemByvIndex,
    updateCellItemByIndex,
    getCellItemSizeByIndex,
    getCellItemSizeByvIndex,
    getCellItemCacheTotalByIndex,
    addCellItemByvIndex,
    addCellItemByIndex,
} = useVirtualScroll(virtualProps);

const activeIndex = computed(() =>
    unref(normalizeDataSource).findIndex(
        (item: ItemType) => item[props.keyField] === props.modelValue
    )
);

const activeKey = computed({
    get: () => props.modelValue,
    set: (val: string | number) => {
        emits("update:modelValue", val);
    },
});

const virtualListWidth = computed(() =>
    Math.max(0, rectifySize(totalPadding.value))
);

const lineStyle = computed<CSSProperties>(() => {
    return {
        backgroundColor: props.lineColor ?? props.activeColor,
        width: `${props.lineWidth}px`,
        height: `${props.lineHeight}px`,
        borderRadius: `${props.lineRadius}px`,
        opacity:
            !!normalizeDataSource.value.length && unref(activeIndex) >= 0
                ? 1
                : 0,
        transform: `translateX(${lineOffset.value}px)`,
    };
});

watch(normalizeDataSource, (n, o) => {
    if (!props.ignoreChange) {
        initScroll();
    }
});

watch(activeKey, (n) => {
    if (ignoreActiveChange.value || !unref(normalizeDataSource).length) return;
    nextTick(() => {
        if (unref(activeIndex) != -1) {
            const activeItem = unref(normalizeDataSource)[unref(activeIndex)];
            onItemClick(activeItem, unref(activeKey), unref(activeIndex));
        }
    });
});

function getScreenWidth(): number {
    const windowInfo = uni.getWindowInfo();
    return windowInfo.windowWidth; // 屏幕宽度，单位px
}

function getAllItemRect(): Promise<UniApp.NodeInfo[]> {
    return new Promise((resolve) => {
        let view = uni
            .createSelectorQuery()
            .in(_instance)
            .selectAll(".wsd-scroll-tabs__list-item");
        view.boundingClientRect((data: UniApp.NodeInfo[]) => {
            resolve(data);
        }).exec();
    });
}

function getVirtualItemRect(index: number): Promise<UniApp.NodeInfo> {
    return new Promise((resolve) => {
        const vIndex = Math.max(0, index - startIndex.value);
        const vItemData = virtualList.value[vIndex];
        if (!vItemData) return;
        const id = vItemData[CellIndexName];
        let view = uni.createSelectorQuery().in(_instance).select(`#${id}`);
        view.boundingClientRect((data: UniApp.NodeInfo) => {
            resolve(data);
        }).exec();
    });
}

function getWrapRect(): Promise<UniApp.NodeInfo> {
    return new Promise((resolve) => {
        let view = uni
            .createSelectorQuery()
            .in(_instance)
            .select(".wsd-scroll-tabs__scroll");
        view.boundingClientRect((data: UniApp.NodeInfo) => {
            if (!data)
                return resolve({
                    width: 0,
                    height: 0,
                    left: 0,
                    right: 0,
                });
            realWrapWidth.value = data.width;
            if (props.center && props.absoluteCenterX) {
                data.width = getScreenWidth();
                // data.left = 0;
                // data.right = 0;
            }
            resolve(data);
        }).exec();
    });
}

function initScroll(callback?: Function) {
    spaceWidth.value = 0;
    lastScrollLeft.value = 0;
    scrollLeft.value = 0;

    if (props.virtual) {
        initVirtualList(0, () => {
            nextTick(() => {
                updateSpaceWidth();
                nextTick(() => {
                    scrollToIndex(unref(activeIndex), () => {
                        props.showLine && updateLinePosition();
                        callback && callback();
                    });
                });
            });
        });
    } else {
        updateSpaceWidth();
        nextTick(() => {
            scrollToIndex(unref(activeIndex), () => {
                props.showLine && updateLinePosition();
                callback && callback();
            });
        });
    }
}

function onItemClick(
    item: ItemType,
    key: string | number,
    index: number,
    trigger = false
) {
    activeKey.value = key;
    ignoreActiveChange.value = true;

    nextTick(() => {
        // 滚动到选中tab-item - 包含虚拟/非虚拟
        _scrollToTabMerge(index, () => {
            trigger && emits("on-click", item, key, index);
            props.showLine && updateLinePosition();
            ignoreActiveChange.value = false;
        });
    });
}

function _scrollToTabMerge(index: number, callback?: Function) {
    // 根据虚拟控制滚动策略
    if (props.virtual) {
        _scrollToTabVirtual(index, callback);
    } else {
        _scrollToTab(index, callback);
    }
}

// 非虚拟-滚动选中tab-item
async function _scrollToTab(index: number, callback?: Function) {
    if (props.center) {
        const wrapRect = await getWrapRect();
        const allItemRect: UniApp.NodeInfo[] = await getAllItemRect();
        const distance = allItemRect
            .slice(0, index)
            .reduce((accumulator, currentValue) => {
                return accumulator + currentValue.width;
            }, 0);
        const itemRect = allItemRect[index];
        const space = (wrapRect.width - rectifySize(itemRect.width)) / 2;
        const offset = props.absoluteCenterX ? wrapRect.left : 0;

        scrollTo(Math.max(0, distance - space + offset), callback);
    } else {
        // tab-item 需要scroll-into-view
        scrollIntoViewMerge(index, callback);
    }
}

// 虚拟-滚动到选中tab-item
function _scrollToTabVirtual(index: number, callback?: Function) {
    if (props.center) {
        _virtualScrollToIndex(index, (left: number, distance: number) => {
            nextTick(async () => {
                const wrapRect = await getWrapRect();
                const cellSize =
                    props.cellSizeMode === "fixed"
                        ? virtualCellSize.value
                        : getCellItemSizeByIndex(index);
                const space = (wrapRect.width - rectifySize(cellSize)) / 2;
                const offset = props.absoluteCenterX ? wrapRect.left : 0;
                scrollTo(Math.max(0, distance - space + offset), callback);
            });
        });
    } else {
        // tab-item 需要scroll-into-view
        scrollIntoViewMerge(index, callback);
    }
}

function onTabScroll(e) {
    const left = e.detail.scrollLeft;
    lastScrollLeft.value = e.detail.scrollLeft;
    props.virtual && scrollThrottle && scrollThrottle(left);
}

function scrollTo(left: number, callback?: Function) {
    const distance = Math.max(0, left);
    if (!distance || lastScrollLeft.value !== distance) {
        scrollLeft.value = distance;
        lastScrollLeft.value = distance;
    } else {
        scrollLeft.value = Math.max(0, lastScrollLeft.value - 10);
        nextTick(() => {
            scrollLeft.value = distance;
            lastScrollLeft.value = distance;
        });
    }
    props.virtual && scrollThrottle && scrollThrottle(distance);
    callback &&
        nextTick(() => {
            callback();
        });
}

function rectifySize(size: number): number {
    return size - props.itemGap;
}

function scrollToIndex(index: number, callback?: Function) {
    if (index < 0 || index >= unref(normalizeDataSource).length) return;
    _scrollToTabMerge(index, callback);
}

async function updateLinePosition() {
    const index = unref(activeIndex);
    if (index < 0 || index >= unref(normalizeDataSource).length) {
        lineOffset.value = -1 * props.lineWidth;
        return;
    }
    let distance = 0;
    let itemSize = 0;
    if (props.virtual) {
        itemSize = getCellItemSizeByIndex(index);
        distance = getCellItemCacheTotalByIndex(index);
    } else {
        const allItemRect: UniApp.NodeInfo[] = await getAllItemRect();
        const itemRect = allItemRect[index];
        itemSize = itemRect.width;
        distance = allItemRect
            .slice(0, index)
            .reduce((accumulator, currentValue) => {
                return accumulator + currentValue.width;
            }, 0);
    }

    const lineOffsetReference = (rectifySize(itemSize) - props.lineWidth) / 2;
    lineOffset.value = distance + lineOffsetReference;
}

async function scrollIntoViewMerge(index: number, callback?: Function) {
    const wrapRect = await getWrapRect();
    let itemRect: UniApp.NodeInfo;

    if (props.virtual) {
        itemRect = await getVirtualItemRect(index);
    } else {
        const allItemRect: UniApp.NodeInfo[] = await getAllItemRect();
        itemRect = allItemRect[index];
    }
    if (!itemRect) return;

    const oldScrollLeft = lastScrollLeft.value;
    let offset = 0;
    const left = itemRect.left - unref(finalOffset);
    const right = itemRect.right - props.itemGap + unref(finalOffset);

    if (wrapRect.left > left) {
        offset = left - wrapRect.left;
    } else if (wrapRect.right < right) {
        // 需要考虑 itemGap
        offset = right - wrapRect.right;
    }

    scrollTo(oldScrollLeft + offset, callback);
}

async function updateSpaceWidth() {
    if (props.center) {
        const len = unref(normalizeDataSource).length;
        const wrapRect = await getWrapRect();
        let totalSize = 0;
        let cellSize = 0;

        if (props.virtual) {
            cellSize =
                props.cellSizeMode === "fixed"
                    ? virtualCellSize.value
                    : getCellItemSizeByIndex(len - 1); // dynamic下，最后一项变更时，需要更新spaceWidth
            totalSize = totalPadding.value;
        } else {
            const allItemRect: UniApp.NodeInfo[] = await getAllItemRect();
            cellSize = allItemRect.slice(-1)[0].width;
            totalSize = allItemRect.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.width;
            }, 0);
        }
        if (
            !!len &&
            (props.spaceAlways || realWrapWidth.value < rectifySize(totalSize))
        ) {
            const offset = props.absoluteCenterX
                ? -1 * (wrapRect.width - wrapRect.right)
                : 0;
            spaceWidth.value =
                (wrapRect.width - rectifySize(cellSize)) / 2 + offset;
        } else {
            spaceWidth.value = 0;
        }
    } else {
        spaceWidth.value = 0;
    }
}

onMounted(() => {
    // 限制：虚拟列表下，如果是远程数据等数据返回后在挂载
    if (props.renderWhenMounted) {
        nextTick(() => {
            initScroll();
        });
    }
});

defineExpose({
    initScroll,
    updateSpaceWidth,
    updateLinePosition,
    scrollTo,
    scrollThrottle,
    scrollToIndex,
    deleteCellItemByvIndex,
    deleteCellItemByIndex,
    updateCellItemByvIndex,
    updateCellItemByIndex,
    getCellItemSizeByIndex,
    getCellItemSizeByvIndex,
    getCellItemCacheTotalByIndex,
    addCellItemByvIndex,
    addCellItemByIndex,
});
</script>

<style lang="scss" scoped>
.wsd-scroll-tabs {
    position: relative;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;

    &__scroll {
        position: relative;
        box-sizing: border-box;
        width: 100%;
        height: 100%;

        &-inner {
            position: relative;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: stretch;
            width: max-content;
            height: 100%;
        }

        &.wsd-scroll-tabs__scroll--virtual {
            &.is-fixed {
                .wsd-scroll-tabs__list-item-inner {
                    width: var(--scroll-tabs-size, 56px);
                }
            }
            &.is-dynamic {
                .wsd-scroll-tabs__list-item-inner {
                    width: "auto";
                }
            }
        }
    }

    &__list {
        position: relative;
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: flex-start;

        &-item {
            position: relative;
            box-sizing: border-box;
            display: block;
            padding-right: var(--scroll-tabs-gap, 0);
            &:last-child {
                margin-right: calc(-1 * var(--scroll-tabs-gap, 0));
            }

            &-inner {
                position: relative;
                box-sizing: border-box;
                width: auto;
                height: 100%;
                display: flex;
                align-items: stretch;
                justify-content: center;
                overflow: hidden;
            }

            &.wsd-scroll-tabs__list-item--active {
                .wsd-scroll-tabs__list-item-inner {
                    color: var(--scroll-active-color);
                }
            }
        }
    }

    &__space {
        position: relative;
        box-sizing: border-box;
        display: block;
        background: transparent;
        width: var(--scroll-tabs-space-width, 0);
        height: 100%;
    }

    &__line {
        position: absolute;
        box-sizing: border-box;
        display: block;
        z-index: 1;
        left: 0;
        bottom: 0;
        transition: all 0.25s linear;
    }
}
</style>
