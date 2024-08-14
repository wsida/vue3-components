/**
 * 虚拟滚动基础计算
 */
import {
  ref,
  computed,
  unref,
  onMounted,
  onScopeDispose,
  nextTick,
  watch,
  type MaybeRef
} from "vue";
import type {
  CustomVirtualScrollProps,
  CustomVirtualScrollReturn,
  CustomVirtualScrollIndex
} from "./types";
import { debounce, isFunction, isUndefined } from "lodash-es";

export type {
  CustomVirtualScrollProps,
  CustomVirtualScrollReturn,
  CustomVirtualScrollIndex
};

export default function useVirtualScroll(
  props: MaybeRef<CustomVirtualScrollProps>
): CustomVirtualScrollReturn {
  let _scrollTarget: HTMLElement | null = null;
  let _timeout;
  let startHeightCache: number[] = []; // 一次优化
  const scrollTop = ref<number>(0);
  const vStartIndex = ref<number>(0);
  const acols = computed(() => unref(unref(props).cols) || 1);
  const dataCount = computed(() => unref(unref(props).data).length);

  const vEndIndex = computed<number>(() =>
    Math.min(
      unref(dataCount),
      unref(vStartIndex) + unref(unref(props).pageSize)
    )
  );

  const aStartIndex = computed<number>(() => getStartIndex(unref(vStartIndex)));

  const aEndIndex = computed<number>(() => getEndIndex(unref(vEndIndex)));

  const startPadding = computed<number>(() => {
    let total = 0;
    for (let i = 0; i < unref(aStartIndex); i += unref(acols)) {
      total += startHeightCache[i];
    }
    return total;
  });
  const endPadding = computed<number>(() => {
    let total = 0;
    let count = unref(aEndIndex);
    for (let i = unref(aEndIndex); i < unref(dataCount); i += unref(acols)) {
      count = i;
      const rowHeight = isFunction(unref(props).rowHeight)
        ? (unref(props).rowHeight as Function)(i)
        : unref(props).rowHeight;
      total += rowHeight;
    }
    if (count + 1 < unref(dataCount)) {
      // 计算偏差
      const rowHeight = isFunction(unref(props).rowHeight)
        ? (unref(props).rowHeight as Function)(count + 1)
        : unref(props).rowHeight;
      total += rowHeight;
    }
    return total;
  });

  const calcScrollTop = () => {
    const top = unref(scrollTop);
    let total = 0;
    let sid = 0;
    for (let i = 0; i < unref(dataCount); i += unref(acols)) {
      const rowHeight = isFunction(unref(props).rowHeight)
        ? (unref(props).rowHeight as Function)(i)
        : unref(props).rowHeight;
      startHeightCache[i] = rowHeight;
      if (total + rowHeight <= top) {
        total += rowHeight;
        sid = i;
      } else {
        break;
      }
    }

    if (total && total === top) {
      sid += unref(acols);
    }

    vStartIndex.value = sid;
  };

  const onScroll = debounce(
    function (event: Event) {
      const target = event.target as HTMLElement;
      const _top = target.scrollTop;
      startHeightCache = [];
      scrollTo(_top);
    },
    unref(props).debounce || 300
  );

  function getStartIndex(startIndex: number) {
    let _index = Math.max(0, startIndex - unref(unref(props).previewRows));
    const diff = _index % unref(acols);
    if (!diff) {
      _index = Math.max(0, _index - diff);
    }
    return _index;
  }

  function getEndIndex(endIndex: number) {
    let _index = Math.min(
      unref(dataCount),
      endIndex + unref(unref(props).previewRows)
    );

    const diff = _index % unref(acols);
    if (!diff) {
      _index = Math.min(unref(dataCount), _index + diff);
    }

    return _index;
  }

  function scrollTo(top: number) {
    if (_scrollTarget) {
      if (_timeout) {
        clearTimeout(_timeout);
      }
      const maxScollTop = Math.max(
        0,
        _scrollTarget.scrollHeight - _scrollTarget.offsetHeight
      );
      const _top = Math.min(top, maxScollTop);
      scrollTop.value = _top;
      calcScrollTop();
      _timeout = setTimeout(() => {
        // 防抖
        _scrollTarget.scrollTop = _top;
      }, 10);
    }
  }

  function scrollToIndex(index: number, callback?: Function) {
    let top = 0;
    let startIndex = getStartIndex(unref(index));
    for (let i = 0; i < startIndex; i += unref(acols)) {
      if (isUndefined(startHeightCache[i])) {
        const rowHeight = isFunction(unref(props).rowHeight)
          ? (unref(props).rowHeight as Function)(i)
          : unref(props).rowHeight;
        top += rowHeight;
        startHeightCache[i] = rowHeight;
      } else {
        top += startHeightCache[i];
      }
    }

    _scrollTarget.scrollTop = top;

    nextTick(() => {
      callback && callback();
    });
  }

  watch(acols, () => {
    scrollToIndex(unref(aStartIndex));
  });

  onMounted(() => {
    nextTick(() => {
      _scrollTarget = isFunction(unref(props).scrollTarget)
        ? (unref(props).scrollTarget as Function)()
        : unref(props).scrollTarget;
      _scrollTarget.addEventListener("scroll", onScroll);
      // 首次计算
      scrollTo(0);
    });
  });

  onScopeDispose(() => {
    if (_scrollTarget) {
      _scrollTarget.removeEventListener("scroll", onScroll);
      _scrollTarget = null;
    }
  });

  return {
    scrollTop,
    startPadding,
    endPadding,
    startIndex: aStartIndex,
    endIndex: aEndIndex,
    calcScrollTop,
    scrollTo,
    scrollToIndex
  };
}
