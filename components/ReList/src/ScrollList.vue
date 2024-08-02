<template>
  <div
    ref="wrapperRef"
    v-loading="doDefaultLoading"
    :element-loading-text="loadingText"
    :class="listWrapperClassName"
  >
    <div v-if="$slots.title || title" class="ap-scroll-list__header">
      <div class="ap-scroll-list__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="ap-scroll-list__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="ap-scroll-list__body" :style="scrollWrapperStyle">
      <el-scrollbar height="100%">
        <ReList
          v-model="checks"
          :items="dataSource"
          :metas="metas"
          v-bind="$attrs"
          customClass="ap-scroll-list"
        />
        <div
          v-show="doFooterLoading"
          v-loading="doFooterLoading"
          :element-loading-text="loadingText"
          class="ap-scroll-list__loading"
        />
      </el-scrollbar>
    </div>
    <div
      v-if="$slots.footer || trigger === 'custom'"
      class="ap-scroll-list__footer"
    >
      <slot name="footer">
        <el-button
          v-if="trigger === 'custom'"
          class="ap-scroll-list__trigger"
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
import type { ReScrollListProps, ReScrollListEmits } from "../types";
import { ref, unref, computed, useAttrs, type ModelRef } from "vue";
import useScrollPagination from "@/hooks/useScrollPagination";
import { isNumber, isUndefined } from "lodash-es";

defineOptions({
  name: "ReScrollList",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReScrollListProps>(), {
  height: 400,
  pageSize: 50,
  remote: true,
  loadBtnText: "点击加载>>",
  loadingText: "加载中...",
  loadingPosition: "default",
  dataResponsive: true,
  autoRemote: true,
  firstRemote: true
});
const emits = defineEmits<ReScrollListEmits>();
const $attrs = useAttrs();

const checks = defineModel() as ModelRef<Array<string | number>>;

const wrapperRef = ref<HTMLDivElement | null>(null);
const normalizeProps = computed(() => ({
  ...unref(props),
  target: isUndefined(props.target) ? defaultTarget : props.target,
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
  normalizeProps,
  emits,
  "items",
  (rows: Record<string, any>[]) => emits("update:items", rows)
);

const buttonProps = computed<ReScrollListProps["loadBtnProps"]>(() => ({
  disabled: disabledLoad.value,
  ...(unref(props.loadBtnProps) || {
    text: true,
    type: "info"
  })
}));

const scrollWrapperStyle = computed(() => ({
  height: isNumber(props.height) ? `${props.height}px` : props.height
}));

const doDefaultLoading = computed(
  () => props.loadingPosition === "default" && unref(loading)
);

const doFooterLoading = computed(
  () => props.loadingPosition === "footer" && unref(loading)
);

const listWrapperClassName = computed<string[]>(() => {
  const className = ["ap-scroll-list-wrapper"];
  if ($attrs.type === "card") {
    className.push("ap-scroll-list--card");
  }
  if (Reflect.has($attrs, "border")) {
    className.push("ap-scroll-list--border");
  }
  if (Reflect.has($attrs, "ghost")) {
    className.push("ap-scroll-list--ghost");
  }
  return className;
});

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
  nextPage,
  refresh,
  toRemote
});
</script>
<style lang="scss">
.ap-scroll-list {
  @include m(border) {
    @apply border-[var(--el-border-color-light)] border-[1px] border-solid;

    border-radius: var(--el-border-radius-small);

    .ap-scroll-list__header {
      @apply border-b-[var(--el-border-color-light)] border-b-[1px] border-solid;
    }

    .ap-scroll-list__body {
      .ap-list--border {
        border-radius: 0 !important;
      }
    }

    .ap-scroll-list__footer {
      @apply border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
    }

    &.ap-scroll-list--ghost {
      .ap-scroll-list__header {
        @apply px-4 py-3;
      }

      .ap-scroll-list__body {
        @apply px-4 py-3;

        .ap-list--border {
          @apply border-0;
        }
      }

      .ap-scroll-list__footer {
        @apply px-4 py-3;
      }
    }
  }

  @include m(ghost) {
    .ap-scroll-list__header {
      @apply px-0;
    }

    .ap-scroll-list__body {
      @apply px-0;
    }

    .ap-scroll-list__footer {
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
}
</style>
