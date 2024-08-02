<template>
  <Page key="col-page" w-full h-full class="ap-col-page">
    <template #header-extra>
      <slot name="header-extra" />
    </template>
    <div class="ap-col-page-inner">
      <div class="ap-col-page__left" :style="leftPanelStyle">
        <el-scrollbar
          :wrap-style="{
            display: 'flex',
            'flex-wrap': 'wrap',
            'max-width': '100%',
            margin: '0 auto',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }"
          :view-style="{
            display: 'flex',
            flex: 'auto',
            overflow: 'hidden',
            'flex-direction': 'column',
            'max-height': lHFull ? '100%' : ''
          }"
        >
          <slot name="left" />
        </el-scrollbar>
      </div>
      <div class="ap-col-page__right" :style="rightPanelStyle">
        <el-scrollbar
          :wrap-style="{
            display: 'flex',
            'flex-wrap': 'wrap',
            'max-width': '100%',
            margin: '0 auto',
            transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }"
          :view-style="{
            display: 'flex',
            flex: 'auto',
            overflow: 'hidden',
            'flex-direction': 'column',
            'max-height': rHFull ? '100%' : ''
          }"
        >
          <slot name="right" />
        </el-scrollbar>
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { computed, CSSProperties } from "vue";
import Page from "./Page.vue";

defineOptions({
  name: "ReColPage"
});

const props = withDefaults(
  defineProps<{
    lSpan?: number;
    rSpan?: number;
    lWidth?: number | string;
    rWidth?: number | string;
    gutter?: number;
    lHFull?: boolean;
    rHFull?: boolean;
  }>(),
  {
    lSpan: 1,
    rSpan: 1,
    gutter: 20
  }
);

const normalizeGutter = computed(() => `${Math.max(props.gutter, 0)}px`);
const normalizeSpan = (span = 0) => Math.max(span, 0);
const normalizeWidth = (width?: number | string) =>
  typeof width === "number" ? `${Math.max(width, 0)}px` : width || "";

const leftPanelStyle = computed(() => {
  const style: CSSProperties = {};
  const span = normalizeSpan(props.lSpan);
  const width = normalizeWidth(props.lWidth);
  if (span) {
    style.flexGrow = span;
  }
  if (width) {
    style.width = width;
    style.maxWidth = width;
    style.flexShrink = 0;
  }
  return style;
});

const rightPanelStyle = computed(() => {
  const style: CSSProperties = {};
  const span = normalizeSpan(props.rSpan);
  const width = normalizeWidth(props.rWidth);
  if (span) {
    style.flexGrow = span;
  }
  if (width) {
    style.width = width;
    style.maxWidth = width;
    style.flexShrink = 0;
  }
  return style;
});
</script>

<style lang="scss" scoped>
.ap-col-page {
  &-inner {
    --ap-col-page-gutter: v-bind(normalizeGutter);
    @apply relative flex flex-row items-stretch justify-start overflow-hidden h-full;
    margin: 0 calc(var(--ap-col-page-gutter) / -2);
  }

  &__left,
  &__right {
    @apply relative overflow-hidden flex-1;
    padding: 0 calc(var(--ap-col-page-gutter) / 2);
  }
}
</style>
