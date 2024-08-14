<template>
  <div
    ref="wrapperRef"
    v-loading="doDefaultLoading"
    :element-loading-text="loadingText"
    :class="listWrapperClassName"
  >
    <div v-if="$slots.title || title" class="ap-virtual-scroll-list__header">
      <div class="ap-virtual-scroll-list__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="ap-virtual-scroll-list__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="ap-virtual-scroll-list__body" :style="scrollWrapperStyle">
      <el-scrollbar height="100%">
        <div
          class="ap-virtual-scroll-list__skeleton ap-virtual-scroll-list__skeleton--prepend"
          :style="{ height: `${startPadding}px`, ...skeletonStyles }"
        />
        <ReList
          ref="listRef"
          v-model:checks="checks"
          :items="virtualDataSource"
          :item-height="rowHeight"
          :grid="grid"
          :type="type"
          :gutter="gutter"
          v-bind="$attrs"
          customClass="ap-virtual-scroll-list"
        >
          <template v-if="$slots.default" #default="scoped">
            <slot :item="scoped.item" :metas="scoped.metas" />
          </template>
        </ReList>
        <div
          class="ap-virtual-scroll-list__skeleton ap-virtual-scroll-list__skeleton--append"
          :style="{ height: `${endPadding}px`, ...skeletonStyles }"
        />
        <div
          v-show="doFooterLoading"
          v-loading="doFooterLoading"
          :element-loading-text="loadingText"
          class="ap-virtual-scroll-list__loading"
        />
      </el-scrollbar>
    </div>

    <div
      v-if="$slots.footer || trigger === 'custom'"
      class="ap-virtual-scroll-list__footer"
    >
      <slot name="footer">
        <el-button
          v-if="trigger === 'custom'"
          class="ap-virtual-scroll-list__trigger"
          v-bind="buttonProps"
          @click="nextPage"
          >{{ loadBtnText }}</el-button
        >
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// 要求1：基于List实现分页列表
import ReList from "./List.vue";
import type {
  ReVirtualScrollListProps,
  ReVirtualScrollListEmits
} from "../types";
import useGridResponsive, {
  DEFAULT_FORM_GRID_RESPONSIVE
} from "@/hooks/useGridResponsive";
import {
  unref,
  ref,
  computed,
  useAttrs,
  type ModelRef,
  CSSProperties
} from "vue";
import useScrollPagination from "@/hooks/useScrollPagination";
import useVirtualScroll from "@/hooks/useVirtualScroll";
import { isNumber, isUndefined } from "lodash-es";

defineOptions({
  name: "ReVirtualScrollList",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReVirtualScrollListProps>(), {
  type: "list",
  gutter: 16,
  height: 400,
  pageSize: 50,
  remote: true,
  loadBtnText: "点击加载>>",
  loadingText: "加载中...",
  loadingPosition: "default",
  dataResponsive: true,
  autoRemote: true,
  firstRemote: true,
  debounce: 300,
  offsetTop: 0,
  skeleton: true,
  revertAfterRefresh: true
});
const emits = defineEmits<ReVirtualScrollListEmits>();
const $attrs = useAttrs();

const checks = defineModel("checks") as ModelRef<Array<string | number>>;

const listRef = ref<InstanceType<typeof ReList> | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const scrollWrapperStyle = computed(() => ({
  height: isNumber(props.height) ? `${props.height}px` : props.height
}));

const doDefaultLoading = computed(
  () => props.loadingPosition === "default" && unref(loading)
);

const doFooterLoading = computed(
  () => props.loadingPosition === "footer" && unref(loading)
);

const buttonProps = computed<ReVirtualScrollListProps["loadBtnProps"]>(() => ({
  disabled: disabledLoad.value,
  ...(unref(props.loadBtnProps) || {
    text: true,
    type: "info"
  })
}));

const listWrapperClassName = computed<string[]>(() => {
  const className = ["ap-virtual-scroll-list-wrapper"];
  if ($attrs.type === "card") {
    className.push("ap-virtual-scroll-list--card");
  }
  if (Reflect.has($attrs, "border")) {
    className.push("ap-virtual-scroll-list--border");
  }
  if (Reflect.has($attrs, "ghost")) {
    className.push("ap-virtual-scroll-list--ghost");
  }
  return className;
});

const gridGutter = computed<[number, number]>(() => {
  const gutter = unref(props.gutter);
  if (isNumber(gutter))
    return [unref(props.gutter), unref(props.gutter)] as [number, number];
  return [gutter[0] || 16, gutter[1] || gutter[0] || 16] as [number, number];
});

const colsComputed = computed(
  () => unref(props.grid) || DEFAULT_FORM_GRID_RESPONSIVE
);

const normalizeScrollProps = computed(() => ({
  ...unref(props),
  scrollTarget: isUndefined(props.scrollTarget)
    ? defaultTarget
    : props.scrollTarget,
  data: props.items
}));

const {
  disabledLoad,
  loading,
  dataSource,
  currentPage,
  pageSize,
  total,
  nextPage,
  refresh,
  toRemote
} = useScrollPagination(
  normalizeScrollProps,
  emits,
  "items",
  (rows: Record<string, any>[]) => emits("update:items", rows)
);

const { gridResponsive } = useGridResponsive(colsComputed);

const skeletonStyles = computed<CSSProperties>(() => {
  const styles: CSSProperties = {};
  if (props.skeleton) {
    styles["background-position"] = "left top";
    styles["background-image"] = `repeating-linear-gradient(
      to bottom,
      var(--el-color-white),
      var(--el-color-white) 16px,
      var(--el-fill-color) 16px,
      var(--el-fill-color) ${props.rowHeight - 32}px,
      var(--el-color-white) ${props.rowHeight - 32}px
    )`;
  }
  return styles;
});

const normalizeVirtualProps = computed(() => {
  return {
    scrollTarget: defaultScrollTarget,
    offsetTop: props.offsetTop,
    pageSize: props.pageSize,
    cols: gridResponsive,
    rowHeight:
      props.type === "card"
        ? props.rowHeight + unref(gridGutter)[1]
        : props.rowHeight,
    previewRows: props.previewRows || props.pageSize,
    debounce: props.debounce,
    data: dataSource.value
  };
});

const {
  scrollTop,
  startPadding,
  endPadding,
  startIndex,
  endIndex,
  scrollTo,
  scrollToIndex
} = useVirtualScroll(normalizeVirtualProps);

const virtualDataSource = computed(() => {
  return unref(dataSource).slice(unref(startIndex), unref(endIndex));
});

function defaultScrollTarget(): HTMLElement {
  return wrapperRef.value.querySelector(".el-scrollbar__wrap") as HTMLElement;
}

function defaultTarget(): Element {
  return wrapperRef.value?.querySelector(".el-scrollbar__wrap");
}

defineExpose({
  checks,
  disabledLoad,
  loading,
  dataSource,
  currentPage,
  pageSize,
  total,
  scrollTop,
  startPadding,
  endPadding,
  startIndex,
  endIndex,
  nextPage,
  refresh,
  toRemote,
  scrollTo,
  scrollToIndex
});
</script>
<style lang="scss">
.ap-virtual-scroll-list {
  @include m(border) {
    @apply border-[var(--el-border-color-light)] border-[1px] border-solid;

    border-radius: var(--el-border-radius-small);

    .ap-virtual-scroll-list__header {
      @apply border-b-[var(--el-border-color-light)] border-b-[1px] border-solid;
    }

    .ap-virtual-scroll-list__body {
      .ap-list--border {
        border-radius: 0 !important;
      }
    }

    .ap-virtual-scroll-list__footer {
      @apply border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
    }

    &.ap-virtual-scroll-list--ghost {
      .ap-virtual-scroll-list__header {
        @apply px-4 py-3;
      }

      .ap-virtual-scroll-list__body {
        @apply px-4 py-3;

        .ap-list--border {
          @apply border-0;
        }
      }

      .ap-virtual-scroll-list__footer {
        @apply px-4 py-3;
      }
    }
  }

  @include m(ghost) {
    .ap-virtual-scroll-list__header {
      @apply px-0;
    }

    .ap-virtual-scroll-list__body {
      @apply px-0;
    }

    .ap-virtual-scroll-list__footer {
      @apply px-0;
    }
  }

  &-wrapper {
    @apply relative overflow-hidden;
  }

  &__header {
    @apply flex px-4 py-3 items-center justify-start;
  }

  &__body {
    @apply relative;
  }

  &__footer {
    @apply bg-transparent relative block min-h-[40px] w-full text-center px-4 py-3;
  }

  &__title {
    @apply flex-1 text-[16px] text-text_color_primary leading-6;
  }

  &__extra {
    @apply flex-shrink-0 ml-3;
  }

  &__trigger {
    @apply relative;
  }

  &__skeleton {
    @apply relative w-full;
  }
}
</style>
