<template>
    <view
        class="wsd-draggable"
        :style="wrapperStyle"
        :class="customClass"
        @touchend="onDrop"
        @touchmove="onDragging"
    >
        <view
            v-for="(item, index) in dataSource"
            :key="`${item[keyField]}-${index}`"
            :data-key="item[keyField]"
            :id="getDragItemId(item[keyField])"
            class="wsd-draggable-item"
            :class="[
                isDrag && dragSource === index && dragClass,
                isDrag &&
                    dropTarget === index &&
                    dragSource !== dropTarget &&
                    dropClass,
                customItemClass,
            ]"
            @touchstart="onDrag(index, $event)"
            @longpress="onPress(index, $event)"
        >
            <view
                class="wsd-draggable-item__content"
                :class="[isDrag && dragSource === index && moveClass]"
                :style="isDrag && dragSource === index ? dragItemStyle : {}"
            >
                <slot
                    :item="item"
                    :index="index"
                >
                    <text>{{ item[labelField] }}</text>
                </slot>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import {
    computed,
    CSSProperties,
    getCurrentInstance,
    reactive,
    ref,
} from "vue";
import { throttleControl } from "../../utils/throttle";
import {
    getIntersectionArea,
    getNodeRect,
    getNodeRects,
    swapArrayElements,
} from "../../utils/index";

export type DragItem = Record<string, any>;
export interface WptDraggableProps {
    dataSource: DragItem[];
    keyField?: string;
    labelField?: string;
    grid?: number;
    gap?: number | string;
    dragClass?: string;
    moveClass?: string;
    dropClass?: string;
    customClass?: string;
    customItemClass?: string;
    longpress?: boolean;
    debounce?: number;
    viewport?: UniApp.NodeInfo;
    absolute?: boolean;
    offset?: number;
}

const _instance = getCurrentInstance();

const props = withDefaults(defineProps<WptDraggableProps>(), {
    keyField: "id",
    labelField: "label",
    grid: 1,
    gap: 0,
    dragClass: "is-drag",
    moveClass: "is-move",
    dropClass: "is-drop",
    longpress: false,
    debounce: 25,
    absolute: false,
    offset: 10,
});
const emits = defineEmits<{
    (
        e: "onDrag",
        source: DragItem,
        sourceIndex: number,
        touch: TouchEvent
    ): void;
    (e: "onMove", touch: TouchEvent): void;
    (
        e: "onDrop",
        target: DragItem,
        targetIndex: number,
        touch: TouchEvent
    ): void;
    (
        e: "onChange",
        target: DragItem,
        source: DragItem,
        targetIndex: number,
        sourceIndex: number
    ): void;
    (e: "update:dataSource", dataSource: DragItem[]): void;
}>();

const isDrag = ref(false);
const dragRect = ref<UniApp.NodeInfo>(null);
const dragOffset = reactive({
    left: 0,
    top: 0,
});

const dragSource = ref(-1);
const dropTarget = ref(-1);

const dragTouch = ref<Touch>(null);
const lastTouch = ref<Touch>(null);

const cacheNodeRects = ref<UniApp.NodeInfo[]>(null);

const wrapperStyle = computed<CSSProperties>(() => {
    return {
        "--draggable-grid": Math.max(1, props.grid),
        "--draggable-gap":
            typeof props.gap === "number" ? `${props.gap}px` : props.gap,
    };
});

const dragItemStyle = computed<CSSProperties>(() => {
    return {
        transform: `translate(${dragOffset.left}px, ${dragOffset.top}px)`,
    };
});

const throttle = throttleControl(updateDragPosition, props.debounce);

// function noop() {}

function onDrag(index: number, $event: TouchEvent) {
    // console.log(">>>drag", $event);
    if ($event.touches.length > 1) return;
    dragTouch.value = $event.touches[0];

    if (!props.longpress) {
        setDragSource(index, $event);
    }
}

function onPress(index: number, $event: TouchEvent) {
    // console.log(">>>press", $event);
    if (props.longpress) {
        setDragSource(index, $event);
    }
}

function onDragging($event: TouchEvent) {
    if (!$event.changedTouches.length || !isDrag.value) return;

    const touch = Array.from($event.changedTouches).find(
        (touch: Touch) => touch.identifier === dragTouch.value.identifier
    );

    if (touch) {
        lastTouch.value = touch;
        throttle?.handler();

        emits("onMove", $event);
    }
}

function onDrop($event: TouchEvent) {
    if (!$event.changedTouches.length || !isDrag.value) return;

    const touch = Array.from($event.changedTouches).find(
        (touch: Touch) => touch.identifier === dragTouch.value.identifier
    );

    if (touch) {
        lastTouch.value = touch;
        throttle?.stop();
        updateDragPosition(); // 立即执行最后一次
    }

    const target = dropTarget.value;
    const source = dragSource.value;
    resetTouch();

    emits("onDrop", props.dataSource[target], target, $event);
    if (target !== -1 && source !== -1 && target !== source) {
        emits(
            "onChange",
            props.dataSource[target],
            props.dataSource[source],
            target,
            source
        );
        emits(
            "update:dataSource",
            swapArrayElements(props.dataSource, target, source)
        );
    }
}

function getDragItemId(key: string): string {
    return `v-drag-${key}`;
}

async function setDragSource(index: number, $event: TouchEvent) {
    const key = ($event.currentTarget as HTMLElement).dataset?.key;
    if (typeof key === "undefined") return;
    const id = getDragItemId(key);
    dragRect.value = await getNodeRect(`#${id}`, _instance);
    isDrag.value = true;
    dragSource.value = index;
    emits("onDrag", props.dataSource[index], index, $event);
}

function getOffsetRect(
    rect: UniApp.NodeInfo,
    offset: { left: number; top: number }
): UniApp.NodeInfo {
    if (!rect) return null;
    return {
        ...rect,
        left: rect.left + offset.left,
        right: rect.right + offset.left,
        top: rect.top + offset.top,
        bottom: rect.bottom + offset.top,
    };
}

function resetTouch() {
    cacheNodeRects.value = null;
    dragTouch.value = null;
    lastTouch.value = null;
    dragRect.value = null;
    dragSource.value = -1;
    dropTarget.value = -1;
    dragOffset.left = 0;
    dragOffset.top = 0;
    isDrag.value = false;
}

async function updateDragPosition() {
    if (!isDrag.value || !lastTouch.value || !dragTouch.value) return;

    let offsetX = lastTouch.value.clientX - dragTouch.value.clientX;
    let offsetY = lastTouch.value.clientY - dragTouch.value.clientY;

    if (props.viewport) {
        if (props.absolute) {
            // 限制在视图内-完整item在视图内
            offsetX = Math.min(
                Math.max(
                    props.viewport.left - dragRect.value.left + props.offset,
                    offsetX
                ),
                props.viewport.right - dragRect.value.right - props.offset
            );

            offsetY = Math.min(
                Math.max(
                    props.viewport.top - dragRect.value.top + props.offset,
                    offsetY
                ),
                props.viewport.bottom - dragRect.value.bottom - props.offset
            );
        } else {
            // 限制在视图内
            offsetX = Math.min(
                Math.max(
                    props.viewport.left - dragRect.value.right + props.offset,
                    offsetX
                ),
                props.viewport.right - dragRect.value.left - props.offset
            );

            offsetY = Math.min(
                Math.max(
                    props.viewport.top - dragRect.value.bottom + props.offset,
                    offsetY
                ),
                props.viewport.bottom - dragRect.value.top - props.offset
            );
        }
    }

    // drag-item 位置偏移
    dragOffset.left = offsetX;
    dragOffset.top = offsetY;

    // drag-item 重叠判断，获取target
    const dragOffsetRect = getOffsetRect(dragRect.value, dragOffset);
    if (!cacheNodeRects.value) {
        cacheNodeRects.value = await getNodeRects(
            ".wsd-draggable-item",
            _instance
        );
    }
    let maxArea = 0;
    let maxAreaIndex = -1;
    if (!!cacheNodeRects.value) {
        for (let i = 0; i < cacheNodeRects.value.length; i++) {
            const area = getIntersectionArea(
                dragOffsetRect,
                cacheNodeRects.value[i]
            );
            if (area > maxArea) {
                maxArea = area;
                maxAreaIndex = i;
            }
        }
        dropTarget.value = maxAreaIndex;
    } else {
        dropTarget.value = -1;
    }
}
</script>

<style lang="scss" scoped>
.wsd-draggable {
    position: relative;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(var(--draggable-grid), 1fr);
    grid-template-rows: auto;
    justify-items: stretch;
    align-items: stretch;
    gap: var(--draggable-gap);

    &-item {
        position: relative;
        height: 100%;
        width: 100%;
        box-sizing: border-box;

        &__content {
            position: relative;
            box-sizing: border-box;
            height: 100%;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.15s linear;
            transform: translate(0, 0);
            overflow: hidden;

            &.is-move {
                transition: none;
                z-index: 3;
                &::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    box-sizing: border-box;
                    height: 100%;
                    width: 100%;
                    z-index: 1;
                    border: 1px solid #277eef;
                }
            }
        }

        &.is-drag {
            background-color: #f1f1f2;

            .wsd-draggable-item__content {
                z-index: 2;
            }

            &::after {
                content: "";
                position: absolute;
                box-sizing: border-box;
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                z-index: 1;
                border: 1px solid #d8d8d8;
            }
        }

        &.is-drop {
            &::after {
                content: "";
                position: absolute;
                box-sizing: border-box;
                left: 0;
                top: 0;
                height: 100%;
                width: 100%;
                z-index: 3;
                border: 1px solid #277eef;
            }
        }
    }
}
</style>
