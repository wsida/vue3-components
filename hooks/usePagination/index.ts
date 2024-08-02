/**
 * 组装分页器统一hook
 */
import { ref, unref, computed, watch, type MaybeRef, onMounted } from "vue";
import { cloneDeep } from "lodash-es";
import type { CustomPaginationProps, CustomPaginationEmits } from "./types";
import useGridResponsive, { matchResponsive } from "@/hooks/useGridResponsive";

export const DEFAULT_LAYOUT_TYPES = [
  "total, ->, jumper, prev, next",
  "total, ->, sizes, prev, pager, next"
];
export const DEFAULT_PAGINATION_PROPS = {
  background: true,
  pagerCount: 7,
  layout: DEFAULT_LAYOUT_TYPES[1],
  pageSizes: [10, 20, 30, 50]
};

export const DEFAULT_PAGER_COUNT_RESPONSIVE = {
  md: 5,
  lg: 7,
  xl: 9
};

export const DEFAULT_LAYOUT_RESPONSIVE = {
  xs: 0,
  sm: 1
};

export type { CustomPaginationProps, CustomPaginationEmits };

export default function usePagination(
  props: MaybeRef<CustomPaginationProps>,
  emits: CustomPaginationEmits,
  dataKey = "data",
  updateData?: (rows: Record<string, any>[]) => void
) {
  const loading = ref(false);
  const currentPage = ref(unref(props).currentPage || 1);
  const pageSize = ref(
    unref(props).pageSize || DEFAULT_PAGINATION_PROPS.pageSizes[0]
  );
  const total = computed<number>(() => {
    if (unref(props).remote) return unref(props).total;
    return unref(props)[dataKey].length;
  });
  const dataSource = computed(() => {
    if (unref(props).remote) return unref(props)[dataKey];
    const startIndex = (currentPage.value - 1) * pageSize.value;
    return unref(props)[dataKey].slice(startIndex, startIndex + pageSize.value);
  });

  const pagerCountResponsive = ref({ ...DEFAULT_PAGER_COUNT_RESPONSIVE });
  const { gridResponsive, responsiveWidth } = useGridResponsive(
    pagerCountResponsive,
    document.body,
    DEFAULT_PAGINATION_PROPS.pagerCount
  );

  watch(
    () => unref(props)[dataKey],
    () => {
      if (!unref(props).remote) {
        currentPage.value = 1;
        emits("update:currentPage", 1);
      }
    }
  );

  watch(
    () => unref(props).currentPage,
    () => {
      currentPage.value = unref(props).currentPage;
    }
  );

  watch(
    () => unref(props).pageSize,
    () => {
      pageSize.value = unref(props).pageSize;
    }
  );

  const paginationProps = computed(() => {
    const result: CustomPaginationProps["paginationProps"] = {
      ...cloneDeep(DEFAULT_PAGINATION_PROPS),
      ...(unref(props).paginationProps || {})
    };
    result.currentPage = currentPage.value;
    result.pageSize = pageSize.value;
    result.total = total.value;
    result.pagerCount = gridResponsive.value;
    const layoutIndex = matchResponsive(
      unref(responsiveWidth),
      DEFAULT_LAYOUT_RESPONSIVE
    );
    result.layout = DEFAULT_LAYOUT_TYPES[layoutIndex];
    return result;
  });

  function toRemote() {
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
        if (unref(props).dataResponsive) {
          // 自动响应更新
          emits("update:total", params.total);
          if (updateData) {
            updateData(params.rows);
          } else {
            emits("update:modelValue", params.rows);
          }
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }

  function handlePageSizeChange(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    emits("update:pageSize", size);
    emits("update:currentPage", 1);
    if (unref(props).autoRemote) {
      toRemote();
    }
  }

  function handleCurrentPageChange(page: number) {
    currentPage.value = page;
    emits("update:currentPage", page);
    if (unref(props).autoRemote) {
      toRemote();
    }
  }

  onMounted(() => {
    if (unref(props).firstRemote) {
      handleCurrentPageChange(1);
    }
  });

  return {
    loading,
    dataSource,
    currentPage,
    pageSize,
    total,
    paginationProps,
    handlePageSizeChange,
    handleCurrentPageChange,
    toRemote
  };
}
