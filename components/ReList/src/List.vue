<template>
  <div ref="listRef" v-loading="loading" :class="listClassName">
    <div v-if="$slots.title || title" class="ap-list__header">
      <div class="ap-list__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="ap-list__extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="ap-list__body">
      <template v-if="type === 'list'">
        <template v-for="item in items" :key="item[rowKey]">
          <slot :item="item" :metas="metas"
            ><ReListItem :item="item" :metas="metas" @check="checkChange"
          /></slot>
        </template>
      </template>
      <template v-else-if="type === 'card'">
        <div class="ap-list-grid" :style="gridTemplateStyle">
          <template v-for="item in items" :key="item[rowKey]">
            <div class="ap-list-grid-item">
              <slot :item="item" :metas="metas"
                ><ReListCardItem
                  :item="item"
                  :metas="metas"
                  @check="checkChange"
              /></slot>
            </div>
          </template>
        </div>
      </template>
    </div>
    <div v-if="$slots.footer" class="ap-list__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, unref } from "vue";
import { ReListProps, ReListProvide } from "../types";
import ReListItem from "./Item.vue";
import ReListCardItem from "./CardItem.vue";
import useGridResponsive, {
  DEFAULT_FORM_GRID_RESPONSIVE
} from "@/hooks/useGridResponsive";
import { isNumber } from "lodash-es";
import type { CSSProperties } from "vue";

defineOptions({
  name: "ReList"
});

const props = withDefaults(defineProps<ReListProps>(), {
  rowKey: "id",
  itemLayout: "horizontal",
  expandable: false,
  avatarHideInExpanded: true,
  hover: true,
  split: true,
  type: "list",
  ghost: false,
  grid: 1,
  gutter: 16,
  actionPosition: "default",
  avatarPosition: "left"
});

const emits = defineEmits<{
  (
    e: "check",
    checked: boolean,
    id: string | number,
    item: Record<string, any>
  ): void;
}>();

const listRef = ref<HTMLDivElement | null>(null);

const checks = defineModel<Array<string | number>>("checks", {
  default: () => []
});

const listClassName = computed<string[]>(() => {
  const className = ["ap-list"];
  if (props.type === "card") {
    className.push("ap-list--card");
    if (props.checkable) {
      className.push("ap-list--checkable");
    }
  }
  if (props.border) {
    className.push("ap-list--border");
  }
  if (props.split) {
    className.push("ap-list--split");
  }
  if (props.ghost) {
    className.push("ap-list--ghost");
  }
  if (props.customClass) {
    className.push(props.customClass);
  }
  return className;
});

const colsComputed = computed(
  () => unref(props.grid) || DEFAULT_FORM_GRID_RESPONSIVE
);

const { gridResponsive } = useGridResponsive(colsComputed);

const gridGutter = computed<[number, number]>(() => {
  const gutter = unref(props.gutter);
  if (isNumber(gutter))
    return [unref(props.gutter), unref(props.gutter)] as [number, number];
  return [gutter[0] || 16, gutter[1] || gutter[0] || 16] as [number, number];
});

const gridTemplateStyle = computed(() => {
  const style: CSSProperties = {};
  style["column-gap"] = `${gridGutter.value[0]}px`;
  style["row-gap"] = `${gridGutter.value[1]}px`;
  style["grid-template-columns"] = `repeat(${gridResponsive.value}, 1fr)`;
  return style;
});

function checkChange(
  checked: boolean,
  id: string | number,
  item: Record<string, any>
) {
  emits("check", checked, id, item);
  if (checked) {
    const ind = checks.value.findIndex(check => check === id);
    if (ind === -1) {
      checks.value = [...checks.value, id];
    }
  } else {
    checks.value = checks.value.filter(check => check !== id);
  }
}

provide(
  Symbol.for("ap-list-props"),
  computed<ReListProvide>(() => ({
    listRef: listRef.value,
    rowClassName: props.rowClassName,
    checks: checks.value,
    itemHeight: props.itemHeight,
    avatarHideInExpanded: props.avatarHideInExpanded,
    rowKey: props.rowKey,
    hover: props.hover,
    expandable: props.expandable,
    checkable: props.checkable,
    itemLayout: props.itemLayout,
    actionPosition: props.actionPosition,
    avatarPosition: props.avatarPosition
  }))
);
</script>

<style lang="scss">
.ap-list {
  --ap-list-title-height: 24px;
  --ap-list-description-height: 20px;
  --ap-list-content-height: 20px;
  --ap-list-title-min-width: 20px;
  --ap-list-footer-actions-min-height: 40px;

  @apply relative;

  @include m(border) {
    @apply border-[var(--el-border-color-light)] border-[1px] border-solid;

    border-radius: var(--el-border-radius-small);

    .ap-list__header {
      @apply border-b-[var(--el-border-color-light)] border-b-[1px] border-solid;
    }

    .ap-list__footer {
      @apply border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
    }
  }

  @include m(split) {
    .ap-list__body {
      .ap-list-item + .ap-list-item {
        @apply border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
      }
    }
  }

  @include m(ghost) {
    .ap-list__header {
      @apply px-0;
    }

    .ap-list__body {
      @apply px-0;
    }

    .ap-list__footer {
      @apply px-0;
    }
  }

  @include m(checkable) {
    .ap-list-grid-item {
      cursor: pointer;

      .ap-list-card-item {
        &::before {
          @apply absolute z-10 left-0 top-0;

          width: 0;
          height: 0;
          clip-path: polygon(0 0, 16px 0, 0 16px);
          content: "";
          background-color: var(--el-color-primary);
          transition:
            width linear 0.2s,
            height linear 0.2s;
        }
      }
    }
  }

  &__body {
    @apply px-4;
  }

  &__footer {
    @apply text-center px-4 py-3;
  }

  &__header {
    @apply flex px-4 py-3 items-center justify-start;
  }

  &__title {
    @apply flex-1 text-[16px] text-text_color_primary leading-6;
  }

  &__extra {
    @apply flex-shrink-0 ml-3;
  }

  &-grid {
    @apply relative grid;

    transition: grid-template-columns 0.2s ease; /* 过渡效果 */

    &-item {
      grid-column-start: span 1;
    }
  }

  .px-4 {
    padding-right: 16px;
    padding-left: 16px;
  }

  .py-3 {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .pb-3 {
    padding-bottom: 16px;
  }

  .flex-1 {
    flex: 1;
  }

  .flex-row {
    flex-direction: row;
  }

  .flex-col {
    flex-direction: column;
  }

  .items-center {
    align-items: center;
  }

  .items-start {
    align-items: flex-start;
  }

  .items-end {
    align-items: flex-end;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-start {
    justify-content: flex-start;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .flex-nowrap {
    flex-wrap: nowrap;
  }

  .overflow-hidden {
    overflow: hidden;
  }
}
</style>
