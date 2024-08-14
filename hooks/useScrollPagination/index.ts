/**
 * 组装分页器统一hook
 */
import {
  ref,
  unref,
  computed,
  watch,
  onMounted,
  nextTick,
  onUpdated,
  onBeforeUnmount
} from "vue";
import { isFunction, debounce } from "lodash-es";
import type { MaybeRef } from "vue";
import type {
  CustomScrollPaginationProps,
  CustomScrollPaginationEmits
} from "./types";

export default function useScrollPagination(
  props: MaybeRef<CustomScrollPaginationProps>,
  emits: CustomScrollPaginationEmits,
  dataKey = "data",
  updateData?: (rows: Record<string, any>[]) => void
) {
  let initObserve = false;
  let scrollTarget: HTMLElement | null = null;
  const hasObserve = ref(false);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(unref(props).pageSize || 20);
  const total = ref(unref(props).total || 0);
  const dataSource = computed(() => unref(props)[dataKey]);

  const disabledLoad = computed(() => total.value <= dataSource.value.length);
  const shouldObserveScroll = computed(
    () => unref(props).remote && unref(props).trigger === "scroll"
  );

  watch(
    () => unref(props).pageSize,
    () => {
      pageSize.value = unref(props).pageSize;
      refresh();
    }
  );

  watch(
    () => unref(props).total,
    () => {
      total.value = unref(props).total;
    }
  );

  watch(shouldObserveScroll, val => {
    if (val) {
      observeScroll();
    } else {
      disobserveScroll();
    }
  });

  const handleScroll = debounce(event => {
    if (loading.value) return;
    const target = event.target;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const offsetHeight = target.offsetHeight;
    emits("scroll", scrollTop);
    const offset = unref(props).offsetBottom || 0;
    if (Math.abs(scrollTop + offsetHeight - scrollHeight) <= offset) {
      emits("scroll-bottom");
      if (unref(props).autoRemote) {
        nextPage();
      }
    }
  }, unref(props).debounce);

  function toRemote(callback?: (success: boolean) => void) {
    if (!unref(props).remote) return Promise.resolve(unref(props)[dataKey]);
    if (!unref(props).remoteMethod)
      return Promise.reject(new Error("Remote Request is null"));
    loading.value = true;
    return unref(props)
      .remoteMethod({
        pageSize: unref(pageSize),
        currentPage: unref(currentPage)
      })
      .then((params: { total: number; rows: Record<string, any>[] }) => {
        callback && callback(true);
        if (unref(props).dataResponsive) {
          // 自动响应更新
          total.value = params.total;
          let value: Record<string, any>[] = [];
          if (currentPage.value === 1) {
            value = [...params.rows];
          } else {
            value = [...unref(dataSource), ...params.rows];
          }
          emits("update:total", total.value);
          if (updateData) {
            updateData(value);
          } else {
            emits("update:modelValue", value);
          }
        }
      })
      .catch(() => {
        callback && callback(false);
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function nextPage() {
    if (!unref(props).remote) return;
    if (!loading.value && !disabledLoad.value) {
      currentPage.value += 1;
      toRemote();
    }
  }

  function refresh() {
    if (!unref(props).remote) return;
    currentPage.value = 1;
    toRemote((success: boolean) => {
      if (unref(props).revertAfterRefresh && success) {
        nextTick(() => {
          if (scrollTarget) {
            scrollTarget.scrollTop = 0;
          } else {
            const target = unref(props).scrollTarget;
            const targetDOM = isFunction(target) ? target() : target;
            if (targetDOM) {
              scrollTarget = targetDOM as HTMLElement;
              scrollTarget.scrollTop = 0;
            }
          }
        });
      }
    });
  }

  function observeScroll() {
    if (!initObserve && !hasObserve.value) {
      const target = unref(props).scrollTarget;
      const targetDOM = isFunction(target) ? target() : target;
      if (targetDOM) {
        scrollTarget = targetDOM as HTMLElement;
        targetDOM.addEventListener("scroll", handleScroll);
        hasObserve.value = true;
        initObserve = true;
      }
    }
  }

  function disobserveScroll() {
    if (hasObserve.value) {
      const target = unref(props).scrollTarget;
      const targetDOM = isFunction(target) ? target() : target;
      if (targetDOM) {
        targetDOM.removeEventListener("scroll", handleScroll);
        hasObserve.value = false;
        scrollTarget = null;
      }
    }
  }

  onMounted(() => {
    if (unref(props).firstRemote) {
      refresh();
    }
    if (shouldObserveScroll.value) {
      nextTick(() => {
        observeScroll();
      });
    }
  });

  onUpdated(() => {
    if (!initObserve) {
      if (shouldObserveScroll.value) {
        observeScroll();
      }
    }
  });

  onBeforeUnmount(() => {
    scrollTarget = null;
  });

  return {
    disabledLoad,
    loading,
    dataSource,
    currentPage,
    pageSize,
    total,
    nextPage,
    refresh,
    toRemote
  };
}
