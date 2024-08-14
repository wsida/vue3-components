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
    cSpan?: number | ReGridResponsive;
    rSpan?: number | ReGridResponsive;
    height?: number;
  }>(),
  {
    cSpan: 1,
    rSpan: 1
  }
);

const columns: Ref<number> = inject("ap-gird-page-responsive-columns");
const gridWidth: Ref<number> = inject("ap-gird-page-responsive-width");

const normalizeColumn = computed(() => normalizeGridResponsive(props.cSpan));
const matchColumn = computed(() => {
  const span = matchResponsive(unref(gridWidth), unref(normalizeColumn));
  return Math.min(span, unref(columns));
});

const normalizeRow = computed(() => normalizeGridResponsive(props.rSpan));
const matchRow = computed(() => {
  const span = matchResponsive(unref(gridWidth), unref(normalizeRow));
  return Math.min(span, Infinity);
});

const normalizeNumber = (num: number, min = 0, max = Infinity) =>
  !num ? 0 : Math.min(Math.max(min, Math.floor(num)), max);

const gridItemStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {};
  if (typeof props.height === "number") {
    style.height = `${normalizeNumber(props.height)}px`;
  } else {
    style.height = "auto";
  }
  style["grid-column-start"] = `span ${unref(matchColumn)}`;
  style["grid-row-start"] = `span ${unref(matchRow)}`;
  style["align-self"] = "stretch";
  style["justify-self"] = "stretch";
  return style;
});
</script>

<style lang="scss" scoped>
.ap-grid-page-item {
  @apply relative overflow-hidden;
}
</style>
