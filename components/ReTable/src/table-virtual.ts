import useVirtualScroll from "@/hooks/useVirtualScroll";
import type { ReTableVirtualProps, ReTableVirtualReturn } from "../types";
import {
  computed,
  watch,
  unref,
  type MaybeRef,
  onScopeDispose,
  onMounted,
  nextTick,
  type CSSProperties
} from "vue";
import { isUndefined } from "lodash-es";

export default function useReTableVirtualScroll(
  props: MaybeRef<ReTableVirtualProps>,
  tableRef: any
): ReTableVirtualReturn {
  const viewDOMClass = ".el-scrollbar__view";
  let startPaddingDOM: HTMLDivElement | null = null;
  let endPaddingDOM: HTMLDivElement | null = null;
  const tableHeight = 40;
  const defaultSkeletonStyles: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "0px"
  };
  const defaultStartSkeletonBgStyles = {
    "background-position": "left top",
    "background-image": `repeating-linear-gradient(
      to bottom,
      var(--el-color-white),
      var(--el-color-white) 10px,
      var(--el-fill-color) 10px,
      var(--el-fill-color) 52px,
      var(--el-color-white) 52px
    )`
  };
  const defaultEndSkeletonBgStyles = {
    "background-position": "left top",
    "background-image": `repeating-linear-gradient(
      to bottom,
      var(--el-color-white),
      var(--el-color-white) 16px,
      var(--el-fill-color) 16px,
      var(--el-fill-color) 46px,
      var(--el-color-white) 46px
    )`
  };

  const maxHeight = computed(
    () =>
      !isUndefined(unref(props).maxHeight)
        ? unref(props).maxHeight
        : unref(props).pageSize * unref(props).defaultRowHeight + tableHeight // 40 表头高度
  );

  const virtualProps = computed(() => ({
    scrollTarget: () =>
      unref(tableRef).$el.querySelector(".el-scrollbar__wrap"),
    data: unref(props).data,
    pageSize: unref(props).pageSize,
    rowHeight: unref(props).rowHeight,
    previewRows: unref(props).previewRows || unref(props).pageSize,
    debounce: 300
  }));

  const { startPadding, endPadding, startIndex, endIndex, scrollToIndex } =
    useVirtualScroll(virtualProps.value);

  function addStyle(skeletonDOM: HTMLDivElement, styles: CSSProperties) {
    if (!skeletonDOM) return;
    for (const key of Object.keys(styles)) {
      skeletonDOM.style[key] = styles[key];
    }
  }

  function updateStartPadding() {
    if (startPaddingDOM) {
      addStyle(startPaddingDOM, { height: `${unref(startPadding)}px` });
    }
  }

  function updateEndPadding() {
    if (endPaddingDOM) {
      addStyle(endPaddingDOM, { height: `${unref(endPadding)}px` });
    }
  }

  watch(
    startPadding,
    () => {
      updateStartPadding();
    },
    {
      immediate: true
    }
  );

  watch(
    endPadding,
    () => {
      updateEndPadding();
    },
    {
      immediate: true
    }
  );

  onMounted(() => {
    nextTick(() => {
      startPaddingDOM = document.createElement("div");
      endPaddingDOM = document.createElement("div");
      addStyle(startPaddingDOM, defaultSkeletonStyles);
      addStyle(endPaddingDOM, defaultSkeletonStyles);
      if (unref(props).skeleton) {
        addStyle(startPaddingDOM, defaultStartSkeletonBgStyles);
        addStyle(endPaddingDOM, defaultEndSkeletonBgStyles);
      }
      const viewDOM = unref(tableRef).$el.querySelector(
        viewDOMClass
      ) as HTMLElement;
      if (viewDOM) {
        viewDOM.prepend(startPaddingDOM);
        viewDOM.append(endPaddingDOM);

        updateStartPadding();
        updateEndPadding();
      }
    });
  });

  onScopeDispose(() => {
    endPaddingDOM = null;
    startPaddingDOM = null;
  });

  return {
    maxHeight,
    startIndex,
    endIndex,
    scrollToIndex
  };
}
