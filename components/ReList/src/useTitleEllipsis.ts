/**
 * List item 公共逻辑
 */
import { ref, unref, nextTick, onMounted, watch, type Ref } from "vue";
import { useResizeObserver } from "@vueuse/core";
import type { ReListProvide } from "../types";

export default function useTitleEllipsis(
  renderTitle: Ref<any>,
  listProps: ReListProvide,
  className = "ap-list-item"
) {
  const stopTitleObserve = ref(null);
  const itemRef = ref<HTMLDivElement | null>(null);
  const disabledTitleTooltip = ref(false);

  function updateTitleEllipsis() {
    if (!itemRef.value) return;
    const titleDOM: HTMLDivElement = itemRef.value.querySelector(
      `.${className}__title`
    );
    disabledTitleTooltip.value =
      titleDOM && titleDOM.offsetWidth >= titleDOM.scrollWidth;
  }

  function observeTitle() {
    if (!unref(listProps).listRef) return;
    stopTitleObserve.value = useResizeObserver(unref(listProps).listRef, () => {
      updateTitleEllipsis();
    });
  }

  function disobserveTitle() {
    stopTitleObserve.value && stopTitleObserve.value();
    stopTitleObserve.value = null;
  }

  watch(
    () => [unref(listProps).itemLayout, renderTitle],
    () => {
      if (renderTitle.value) {
        if (!stopTitleObserve.value) {
          observeTitle();
        } else {
          nextTick(() => {
            updateTitleEllipsis();
          });
        }
      } else {
        disobserveTitle();
      }
    },
    {
      flush: "post"
    }
  );

  onMounted(() => {
    nextTick(() => {
      if (renderTitle.value) {
        observeTitle();
      }
    });
  });

  return {
    stopTitleObserve,
    disabledTitleTooltip,
    itemRef
  };
}
