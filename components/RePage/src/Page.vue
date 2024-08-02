<template>
  <div
    ref="pageRef"
    class="ap-page-content"
    :class="{ 'is-w-full': wFull, 'is-h-full': hFull }"
  >
    <div
      v-if="showHeader"
      class="ap-page-content__header"
      :class="{ 'ap-page-content__header--background': headerBackground }"
    >
      <h1 v-if="title" class="ap-page-content__title">{{ title }}</h1>
      <p v-if="description" class="ap-page-content__description">
        {{ description }}
      </p>
      <slot name="header-extra" />
    </div>
    <div v-loading="loading" class="ap-page-content__body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, ref, watch, nextTick } from "vue";

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    showHeader?: boolean;
    title?: string;
    description?: string;
    headerBackground?: boolean;
    hFull?: boolean;
    wFull?: boolean;
  }>(),
  {
    showHeader: false,
    headerBackground: false,
    hFull: false,
    wFull: true
  }
);

const pageRef = ref<HTMLDivElement>();

defineOptions({
  name: "RePage"
});

watch(
  () => props.hFull,
  (val: boolean) => {
    setTimeout(() => {
      const parentDOM = pageRef.value?.parentElement;
      if (!parentDOM) return;
      if (val) {
        if (!parentDOM.classList.contains("is-h-full")) {
          parentDOM.classList.add("is-h-full");
          parentDOM.parentElement.style["max-height"] = "100%";
        }
      } else {
        if (parentDOM.classList.contains("is-h-full")) {
          parentDOM.classList.remove("is-h-full");
          parentDOM.parentElement.style["max-height"] = "";
        }
      }
    }, 1);
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.ap-page-content {
  --ap-container-padding: 20px;
  @apply relative flex flex-col;

  &.is-w-full {
    width: 100%;
    overflow-x: hidden;
  }

  &.is-h-full {
    height: 100%;
    overflow-y: hidden;
    .ap-page-content__body {
      @apply overflow-hidden;
    }
  }

  &__header {
    @apply relative flex-shrink-0 px-[var(--ap-container-padding)] pt-[var(--ap-container-padding)];
    $selector: &;
    @at-root &--background {
      background-color: var(--el-bg-color);
      box-shadow: var(--el-box-shadow-lighter);
    }
  }

  &__title {
    @apply text-[20px] font-normal leading-8;
    color: var(--el-text-color-primary);
    line-height: 32px;
  }

  &__description {
    @apply text-[14px] font-normal leading-5 mt-4;
    color: var(--el-text-color-regular);
  }

  &__body {
    @apply relative flex-1 p-[var(--ap-container-padding)];
  }
}
</style>
