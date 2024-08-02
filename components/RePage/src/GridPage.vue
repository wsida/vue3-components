<template>
  <Page key="grid-page" wFull :hFull="hFull" class="ap-grid-page">
    <template #header-extra>
      <slot name="header-extra" />
    </template>
    <div class="ap-grid-page-wrapper" :class="{ 'is-h-full': hFull }">
      <div class="ap-grid-page-inner" :style="gridStyle">
        <slot />
      </div>
      <div v-if="$slots.footer" class="ap-grid-page-footer">
        <slot name="footer" />
      </div>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { computed, CSSProperties, provide } from "vue";
import Page from "./Page.vue";
import useGridResponsive, {
  type ReGridResponsive
} from "@/hooks/useGridResponsive";

defineOptions({
  name: "ReGridPage"
});

const props = withDefaults(
  defineProps<{
    hFull?: boolean;
    columns?: number | ReGridResponsive;
    gap?: number | Array<number>;
    height?: number;
    minWidth?: number;
    maxWidth?: number;
    justifyItems?: string;
    alignItems?: string;
    dense?: boolean;
  }>(),
  {
    columns: 3,
    gap: 20,
    justifyItems: "stretch", // grid-item 格子内容水平对其方式，默认占满格子
    alignItems: "flex-start" // grid-item 格子内容垂直对齐方式，默认顶部对齐，若要占满格子-stretch（试同行格子高度一致）
  }
);

const localColumns = computed(() => props.columns);

const { gridResponsive, responsiveWidth } = useGridResponsive(localColumns);

const normalizeNumber = (num: number, min = 0) =>
  !num ? 0 : Math.max(min, Math.floor(num));

const hasMinWidth = computed(() => typeof props.minWidth === "number");
const hasMaxWidth = computed(() => typeof props.maxWidth === "number");

const autoFill = computed(() => hasMinWidth.value || hasMaxWidth.value);

const normalizeGap = computed(() => {
  const gapArr = Array.isArray(props.gap) ? props.gap : [props.gap];
  if (!gapArr[1]) {
    gapArr[1] = gapArr[0];
  }

  return gapArr.map(item => (parseInt(`${item}`) || 0) + "px");
});

const gridStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    gridGap: normalizeGap.value.join(" "),
    justifyItems: props.justifyItems,
    alignItems: props.alignItems
  };
  if (props.height) {
    style["grid-auto-rows"] = `${normalizeNumber(props.height)}px`;
  }
  if (props.dense) {
    style["grid-auto-flow"] = "row dense";
  }

  let templateColumns = `repeat(${gridResponsive.value}, 1fr)`;
  if (autoFill.value) {
    let width = "1fr";
    if (
      hasMinWidth.value &&
      hasMaxWidth.value &&
      props.minWidth! <= props.maxWidth!
    ) {
      width = `minmax(${normalizeNumber(props.minWidth!)}px, minmax(1fr, ${normalizeNumber(props.maxWidth!)}px))`;
    } else if (hasMinWidth.value) {
      width = `minmax(${normalizeNumber(props.minWidth!)}px, 1fr)`;
    } else if (hasMaxWidth.value) {
      width = `minmax(1fr, ${normalizeNumber(props.maxWidth!)}px)`;
    }
    templateColumns = `repeat(auto-fill, ${width})`;
  }
  style["grid-template-columns"] = templateColumns;

  return style;
});

provide("ap-gird-page-responsive-columns", gridResponsive);
provide("ap-gird-page-responsive-width", responsiveWidth);
</script>

<style lang="scss" scoped>
.ap-grid-page {
  &-wrapper {
    @apply relative flex flex-col;

    &.is-h-full {
      @apply h-full max-h-full overflow-hidden;

      .ap-grid-page-inner {
        @apply flex-1 overflow-hidden;
      }
    }
  }

  &-inner {
    @apply grid;
  }

  &-footer {
    @apply relative flex-shrink-0;
  }
}
</style>
