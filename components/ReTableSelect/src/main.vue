<template>
  <div :class="['ap-table-select', `ap-table-select--${size}`]">
    <div
      ref="tableSelectTriggerRef"
      class="ap-table-select__wrapper"
      :class="{ 'is-focused': focused || visible, 'is-visible': visible }"
      @click="onClick"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    >
      <Selection
        v-model:selected="selected"
        v-model:selections="selections"
        v-bind="selectionProps"
      >
        <template v-if="$slots.tag" #tag="slotScoped">
          <slot name="tag" v-bind="slotScoped" />
        </template>
      </Selection>
      <div class="ap-table-select__suffix">
        <el-icon
          v-if="showSuffixIcon"
          class="ap-table-select__icon ap-table-select__icon--caret"
          ><component :is="suffixIcon"
        /></el-icon>
        <el-icon
          v-if="showClearIcon"
          class="ap-table-select__icon ap-table-select__icon--clear"
          @click.stop="onClear"
          ><component :is="clearIcon"
        /></el-icon>
      </div>
    </div>
    <Popper
      ref="selectPopperRef"
      v-model:selected="selected"
      v-model:selections="selections"
      v-model:selected-all="selectedAll"
      v-bind="popoverProps"
      @select="onSelect"
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
      <!--插槽传递-->
      <template v-if="$slots.empty" #empty="slotScoped">
        <slot name="empty" v-bind="slotScoped" />
      </template>
      <template v-for="slotName in slotsNames" #[slotName]="slotScoped">
        <slot v-if="$slots[slotName]" :name="slotName" v-bind="slotScoped" />
      </template>
    </Popper>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { CircleClose, ArrowDown } from "@element-plus/icons-vue";
import Selection from "./selection.vue";
import Popper from "./popper.vue";
import { onClickOutside, useResizeObserver } from "@vueuse/core";
import { isString, isUndefined } from "lodash-es";
import type {
  ReTableSelectProps,
  ReTableSelectEmits,
  ReTableSelection,
  ReTableSelectPopoverProps
} from "../types";
import type { ReTableColumn, ReTableRow } from "@/components/ReTable/types";

defineOptions({
  name: "ReTableSelect"
});

let _timestamp = new Date().getTime();
let stopClickOutside: () => void;
let ignoreClassnames: string[] = [];
let popperClassname: string = `ap-table-select__popover--${_timestamp}`;
let tablePageSizePopperClassname: string = `ap-table-select__pager-popover--${_timestamp}`;
let collapseTagsPopperClassname: string = `ap-table-select__collapse-tabs-popover--${_timestamp}`;

const props = withDefaults(defineProps<ReTableSelectProps>(), {
  size: "default",
  multiple: true,
  valueKey: "id",
  labelKey: "label",
  disabled: false,
  clearable: false,
  showTags: false,
  collapseTags: false,
  collapseTagsTooltip: true,
  maxCollapseTags: 1,
  multipleLimit: 0,
  effect: "light",
  placeholder: "请选择",
  filterable: false,
  remote: false,
  loading: false,
  loadingText: "数据加载中...",
  noMatchText: "无匹配数据",
  noDataText: "暂无数据",
  teleported: true,
  clearIcon: CircleClose,
  suffixIcon: ArrowDown,
  tagType: "info",
  tagEffect: "light",
  placement: "bottom",
  showToolbox: false,
  filterPlaceholder: "输入关键字匹配",
  pagination: true,
  pageSize: 10,
  resetParamsAfterHide: true,
  reverseAllAfterSwitch: true
});

const emits = defineEmits<ReTableSelectEmits>();

let initSelections: ReTableSelectProps["remoteSelected"] = props.remoteSelected;

if (props.modelValue) {
  if (props.multiple) {
    if (!initSelections) {
      initSelections = [] as Record<string, any>[];
    }
    const selectedItems: string[] | number[] = initSelections.map(
      (item: Record<string, any>) => item[props.valueKey]
    );
    for (const val of selectedItems) {
      if (!(props.modelValue as string[] | number[]).includes(val as never)) {
        const index = initSelections.findIndex(
          (item: Record<string, any>) => item[props.valueKey] === val
        );
        initSelections.splice(index, 1);
      }
    }
    for (const val of props.modelValue as string[] | number[]) {
      const selectedItem = (initSelections as Record<string, any>[]).find(
        item => item[props.valueKey] === val
      );
      if (!selectedItem) {
        initSelections.push({ [props.valueKey]: val });
      }
    }
  } else {
    if (
      isUndefined(initSelections[props.valueKey]) ||
      initSelections[props.valueKey] !== (props.modelValue as string | number)
    ) {
      initSelections = { [props.valueKey]: props.modelValue };
    }
  }
}

const selectPopperRef = ref<InstanceType<typeof Popper> | null>(null);
const tableSelectTriggerRef = ref<HTMLDivElement | null>(null);
const hovering = ref(false);
const focused = ref(false);
const visible = ref(false);

const selected = defineModel<ReTableSelectProps["modelValue"]>();
const selections = ref(initSelections);
const selectedAll = computed({
  get() {
    return (
      props.remote &&
      props.pagination &&
      isString(selected.value) &&
      selected.value === "ALL"
    );
  },

  set(val) {
    if (val) {
      selected.value = "ALL";
      // selections 数据有缓存，可以还原数据
    } else {
      if (props.reverseAllAfterSwitch) {
        if (props.multiple) {
          if (Array.isArray(selections.value)) {
            selected.value = selections.value.map(
              (item: ReTableRow) => item[props.valueKey]
            );
          } else {
            selected.value = [];
            selections.value = [];
          }
        } else {
          if (!isUndefined(selections.value)) {
            selected.value = selections.value[props.valueKey];
          } else {
            selected.value = undefined;
          }
        }
      } else {
        if (props.multiple) {
          selected.value = [];
          selections.value = [];
        } else {
          selected.value = undefined;
          selections.value = undefined;
        }
      }
    }
  }
});

const selectedCount = computed<number>(() => {
  if (props.remote && props.pagination && selectedAll.value) return props.total;
  if (isUndefined(selected.value)) return 0;
  if (!props.multiple)
    return isString(selected.value) && selected.value === "" ? 0 : 1;
  return (selected.value as string[] | number[]).length;
});

const hasSelected = computed<boolean>(() => selectedCount.value > 0);

const showSuffixIcon = computed(() => {
  if (!props.clearable) return true;
  return !hasSelected.value || !hovering.value;
});

const showClearIcon = computed(
  () => hasSelected.value && hovering.value && props.clearable
);

const slotsNames = computed(() => {
  const slotsNames = [];
  for (const column of localColumns.value) {
    if (!isUndefined(column.slot)) {
      slotsNames.push(column.slot);
    }
    if (!isUndefined(column.filterIconSlot)) {
      slotsNames.push(column.filterIconSlot);
    }
    if (!isUndefined(column.headerSlot)) {
      slotsNames.push(column.headerSlot);
    }
  }
  return slotsNames;
});

const localColumns = computed(() => {
  ignoreClassnames = [];
  return props.columns.map((column: ReTableColumn) => {
    if (!isUndefined(column.options) || !isUndefined(column.filters)) {
      const customFilterPopperClass = `ap-table-select__filter-popper--${column.prop}`;
      ignoreClassnames.push(`.${customFilterPopperClass}`);
      if (column.filterClassName) {
        if (!column.filterClassName.includes(customFilterPopperClass)) {
          column.filterClassName = `${column.filterClassName} ${customFilterPopperClass}`;
        }
      } else {
        column.filterClassName = customFilterPopperClass;
      }
    }
    return column;
  });
});

const selectionProps = computed<ReTableSelection>(() => ({
  selected: selected.value,
  selections: selections.value,
  selectedAll: selectedAll.value,
  size: props.size,
  multiple: props.multiple,
  data: props.data,
  labelKey: props.labelKey,
  valueKey: props.valueKey,
  disabled: props.disabled,
  showTags: props.showTags,
  collapseTags: props.collapseTags,
  collapseTagsTooltip: props.collapseTagsTooltip,
  maxCollapseTags: props.maxCollapseTags,
  multipleLimit: props.multipleLimit,
  effect: props.effect,
  placeholder: props.placeholder,
  tagType: props.tagType,
  tagEffect: props.tagEffect,
  total: props.total,
  remote: props.remote,
  selectedCount: selectedCount.value,
  hasSelected: hasSelected.value,
  popperClass: collapseTagsPopperClassname
}));

const popoverProps = computed<ReTableSelectPopoverProps>(() => ({
  selected: selected.value,
  selections: selections.value,
  selectedAll: selectedAll.value,
  size: props.size,
  gutter: props.gutter,
  multiple: props.multiple,
  data: props.data,
  columns: localColumns.value,
  valueKey: props.valueKey,
  labelKey: props.labelKey,
  disabled: props.disabled,
  filterable: props.filterable,
  filterPlaceholder: props.filterPlaceholder,
  filterProps: props.filterProps,
  remote: props.remote,
  remoteMethod: props.remoteMethod,
  loading: props.loading,
  loadingText: props.loadingText,
  noMatchText: props.noMatchText,
  noDataText: props.noDataText,
  teleported: props.teleported,
  popperOptions: props.popperOptions,
  popperClass: `ap-table-select__popover ${popperClassname} ${props.popperClass || ""}`,
  popperStyle: props.popperStyle,
  placement: props.placement,
  transition: props.transition,
  showToolbox: props.showToolbox,
  triggerRef: tableSelectTriggerRef,
  pagination: props.pagination ?? true,
  stripe: props.stripe ?? true,
  border: props.border,
  paginationProps: {
    ...(props.paginationProps || {}),
    size: props.size,
    popperClass: `${tablePageSizePopperClassname} ${props.paginationProps?.popperClass ?? ""}`
  },
  total: props.total,
  pageSize: props.pageSize,
  visible: visible.value,
  maxHeight: props.maxHeight,
  resetParamsAfterHide: props.resetParamsAfterHide,
  slotsNames: slotsNames.value,
  firstRemote: props.firstRemote,
  selectable: props.selectable
}));

watch(visible, (val: boolean) => {
  emits("visible-change", val);
});

watch(selected, () => {
  emits(
    "change",
    selected.value,
    selected.value === "ALL" ? [] : selections.value
  );
});

onMounted(() => {
  nextTick(() => {
    listenerClickOutside();
    listenerResizeObserver();
  });
});

function listenerClickOutside() {
  stopListenerClickOutside();
  const ignore = [
    `.${popperClassname}`,
    `.${tablePageSizePopperClassname}`,
    `.${collapseTagsPopperClassname}`,
    ...ignoreClassnames,
    ...(props.ignoreClass || [])
  ];
  stopClickOutside = onClickOutside(
    tableSelectTriggerRef.value,
    () => {
      onBlur();
      visible.value = false;
    },
    {
      ignore
    }
  );
}

function listenerResizeObserver() {
  useResizeObserver(tableSelectTriggerRef.value, () => {
    // console.log(selectPopperRef.value?.popoverRef);
    selectPopperRef.value?.popoverRef.popperRef.popperInstanceRef?.update();
  });
}

function stopListenerClickOutside() {
  stopClickOutside && stopClickOutside();
}

function onMouseenter() {
  hovering.value = true;
}

function onMouseleave() {
  hovering.value = false;
}

function onClick() {
  if (!focused.value) {
    onFocus();
  }
  visible.value = !visible.value;
}

function onFocus() {
  focused.value = true;
  emits("focus");
}

function onBlur() {
  focused.value = false;
  emits("blur");
}

function onSelect() {
  if (!props.multiple) {
    visible.value = false;
  }
}

function onClear() {
  if (!props.multiple) {
    selected.value = undefined;
    selections.value = undefined;
  } else {
    selected.value = [];
    selections.value = [];
  }
  if (props.remote && props.pagination && selectedAll.value) {
    selectedAll.value = false;
  }
  emits("clear");
}

function focus() {
  onFocus();
  visible.value = true;
}

function blur() {
  onBlur();
  visible.value = false;
}

defineExpose({
  selected,
  selections,
  focus,
  blur
});
</script>

<style lang="scss" scoped>
.ap-table-select {
  --ap-table-select-min-width: 140px;
  --ap-table-select-height: var(--el-component-size);
  --ap-table-select-gap: 6px;
  --ap-table-select-padding: 4px 12px;
  --ap-table-select-line-height: 24px;
  --ap-table-select-text-color: var(--el-text-color-regular);
  --ap-table-select-hover-border: var(--el-border-color-hover);
  --ap-table-select-focus-border: var(--el-color-primary);
  --ap-table-select-border-radius: var(--el-border-radius-base);
  --ap-table-select-bg-color: var(--el-fill-color-blank);
  --ap-table-select-icon-size: 14px;
  --ap-table-select-icon-color: var(--el-text-color-placeholder);
  --ap-table-select-placeholder-color: var(--el-text-color-placeholder);
  --ap-table-select-clear-hover-color: var(--el-text-color-secondary);

  @apply relative inline-flex box-border align-middle;

  @include m(small) {
    --ap-table-select-height: var(--el-component-size-small);
    --ap-table-select-gap: 4px;
    --ap-table-select-padding: 2px 8px;
    --ap-table-select-line-height: 20px;

    .ap-table-select__wrapper {
      font-size: var(--el-font-size-extra-small);
    }
  }

  @include m(large) {
    --ap-table-select-height: var(--el-component-size-large);
    --ap-table-select-gap: 6px;
    --ap-table-select-padding: 8px 16px;
    --ap-table-select-line-height: 24px;

    .ap-table-select__wrapper {
      font-size: var(--el-font-size-extra-small);
    }
  }

  min-width: var(--ap-table-select-min-width);

  &__wrapper {
    @apply flex flex-1 items-center cursor-pointer box-border text-left max-w-full w-full;

    @include when(focused) {
      box-shadow: 0 0 0 1px var(--ap-table-select-focus-border) inset;

      &:hover {
        box-shadow: 0 0 0 1px var(--ap-table-select-focus-border) inset;
      }
    }

    @include when(visible) {
      .ap-table-select__icon--caret {
        transform: rotate(-180deg);
      }
    }

    gap: var(--ap-table-select-gap);
    min-height: var(--ap-table-select-height);
    padding: var(--ap-table-select-padding);
    font-size: var(--el-font-size-base);
    line-height: var(--ap-table-select-line-height);
    background-color: var(
      --ap-table-select-bg-color,
      var(--el-fill-color-blank)
    );
    background-image: none;
    border-radius: var(--ap-table-select-border-radius);
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: var(--el-transition-duration);

    &:hover {
      box-shadow: 0 0 0 1px var(--ap-table-select-hover-border) inset;
    }
  }

  &__suffix {
    @apply flex items-center flex-shrink-0;

    gap: var(--ap-table-select-gap);
  }

  &__icon {
    @apply cursor-pointer;

    @include m(clear) {
      &:hover {
        color: var(--ap-table-select-clear-hover-color);
      }
    }

    font-size: var(--ap-table-select-icon-size);
    color: var(--ap-table-select-icon-color);
    transition: var(--el-transition-duration);
    transform: rotate(0);
  }
}
</style>
