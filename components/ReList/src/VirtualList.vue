<template>
  <div ref="wrapperRef" class="ap-virtual-list-wrapper">
    <div v-if="$slots.title || title" class="ap-virtual-list__header">
      <div class="ap-virtual-list__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="ap-virtual-list__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="ap-virtual-list__body" :style="scrollWrapperStyle">
      <el-scrollbar height="100%">
        <div
          class="ap-virtual-list__skeleton ap-virtual-list__skeleton--prepend"
          :style="{ height: `${startPadding}px`, ...skeletonStyles }"
        />
        <ReList
          ref="listRef"
          v-model="checks"
          :items="dataSource"
          :item-height="rowHeight"
          :grid="grid"
          v-bind="$attrs"
          customClass="ap-virtual-list"
        />
        <div
          class="ap-virtual-list__skeleton ap-virtual-list__skeleton--append"
          :style="{ height: `${endPadding}px`, ...skeletonStyles }"
        />
      </el-scrollbar>
    </div>
    <div v-if="$slots.footer" class="ap-virtual-list__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 要求1：基于List实现分页列表
import ReList from "./List.vue";
import type { ReVirtualListProps } from "../types";
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
import useVirtualScroll from "@/hooks/useVirtualScroll";
import { isNumber } from "lodash-es";

defineOptions({
  name: "ReVirtualList",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReVirtualListProps>(), {
  pageSize: 20,
  debounce: 300,
  offsetTop: 0,
  skeleton: true
});
const $attrs = useAttrs();

const checks = defineModel() as ModelRef<Array<string | number>>;

const listRef = ref<InstanceType<typeof ReList> | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const scrollWrapperStyle = computed(() => ({
  height: isNumber(props.height) ? `${props.height}px` : props.height
}));

const colsComputed = computed(
  () => unref(props.grid) || DEFAULT_FORM_GRID_RESPONSIVE
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

const normalizeProps = computed(() => {
  const { offsetTop, pageSize, rowHeight, previewRows, debounce } = props;
  return {
    scrollTarget: defaultScrollTarget,
    offsetTop,
    pageSize: pageSize,
    cols: gridResponsive,
    rowHeight,
    previewRows: previewRows || pageSize,
    debounce,
    data: props.items
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
} = useVirtualScroll(normalizeProps.value);

const dataSource = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value);
});

function defaultScrollTarget(): HTMLElement {
  return wrapperRef.value.querySelector(".el-scrollbar__wrap") as HTMLElement;
}

defineExpose({
  scrollTop,
  startPadding,
  endPadding,
  startIndex,
  endIndex,
  scrollTo,
  scrollToIndex
});
</script>
<style lang="scss">
.ap-virtual-list {
  @include m(border) {
    @apply border-[var(--el-border-color-light)] border-[1px] border-solid;

    border-radius: var(--el-border-radius-small);

    .ap-virtual-list__header {
      @apply border-b-[var(--el-border-color-light)] border-b-[1px] border-solid;
    }

    .ap-virtual-list__body {
      .ap-list--border {
        border-radius: 0 !important;
      }
    }

    .ap-virtual-list__footer {
      @apply border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
    }

    &.ap-virtual-list--ghost {
      .ap-virtual-list__header {
        @apply px-4 py-3;
      }

      .ap-virtual-list__body {
        @apply px-4 py-3;

        .ap-list--border {
          @apply border-0;
        }
      }

      .ap-virtual-list__footer {
        @apply px-4 py-3;
      }
    }
  }

  @include m(ghost) {
    .ap-virtual-list__header {
      @apply px-0;
    }

    .ap-virtual-list__body {
      @apply px-0;
    }

    .ap-virtual-list__footer {
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
