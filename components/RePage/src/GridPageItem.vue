<template>
  <div class="ap-grid-page-item" :style="gridItemStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, inject, Ref, unref } from "vue";
import {
  normalizeGridResponsive,
  matchResponsive,
  type ReGridResponsive
} from "@/hooks/useGridResponsive";

defineOptions({
  name: "ReGridPageItem"
});

const props = withDefaults(
  defineProps<{
    span?: number | ReGridResponsive;
    height?: number;
  }>(),
  {
    span: 1
  }
);

const columns: Ref<number> = inject("ap-gird-page-responsive-columns");
const gridWidth: Ref<number> = inject("ap-gird-page-responsive-width");

const normalizeSpan = computed(() => normalizeGridResponsive(props.span));
const matchSpan = computed(() => {
  const span = matchResponsive(unref(gridWidth), unref(normalizeSpan));
  return Math.min(span, unref(columns));
});

const normalizeNumber = (num: number, min = 0, max = Infinity) =>
  !num ? 0 : Math.min(Math.max(min, Math.floor(num)), max);

const gridItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};
  if (typeof props.height === "number") {
    style.height = `${normalizeNumber(props.height)}px`;
  }
  if (typeof props.span === "number") {
    style["grid-column-start"] = `span ${unref(matchSpan)}`;
  }
  return style;
});
</script>

<style lang="scss" scoped>
.ap-grid-page-item {
  position: relative;
}
</style>
