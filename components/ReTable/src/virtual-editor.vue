<template>
  <div class="ap-virtual-edit-table__wrapper">
    <EditorTable
      ref="editTableRef"
      v-model:data="editData"
      :size="size"
      :pageSize="pageSize"
      :columns="columns"
      :editable="editable"
      :editTrigger="editTrigger"
      :maxHeight="maxHeight"
      :pagination="false"
      :virtual="true"
      :virtualStartIndex="startIndex"
      :virtualEndIndex="endIndex"
      v-bind="$attrs"
      @scroll-to="scrollToIndex"
    >
      <!--插槽传递-->
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-for="slotName in slotsNames" #[slotName]="slotScoped">
        <slot v-if="$slots[slotName]" :name="slotName" v-bind="slotScoped" />
      </template>
      <template v-if="$slots['add-bottom-button']" #add-bottom-button>
        <slot name="add-bottom-button" />
      </template>
      <template v-if="$slots['toolbox-left']" #toolbox-left>
        <slot name="toolbox-left" />
      </template>
      <template v-if="$slots['toolbox-right']" #toolbox-right>
        <slot name="toolbox-right" />
      </template>
    </EditorTable>
  </div>
</template>

<script setup lang="ts">
import EditorTable from "./editor.vue";
import { computed, ref, unref, useAttrs } from "vue";
import { isUndefined } from "lodash-es";
import type {
  ReVirtualEditTableProps,
  ReTableRow,
  ReEditTableValidateCallback
} from "../types";
import useReTableVirtualScroll from "./table-virtual";

defineOptions({
  name: "ReVirtualEditTable",
  inheritAttrs: false
});

const TEXT_ROW_HEIGHT = {
  default: 72,
  small: 64,
  large: 80
};

const CONTROL_ROW_HEIGHT = {
  default: 62,
  small: 60,
  large: 62
};

const props = withDefaults(defineProps<ReVirtualEditTableProps>(), {
  size: "default",
  editable: false,
  editTrigger: "custom",
  pageSize: 20,
  skeleton: true
});

const emits = defineEmits<{
  (e: "update:data", data: ReTableRow[]);
}>();

const $attrs = useAttrs();

const editData = defineModel("data");

const editTableRef = ref<InstanceType<typeof EditorTable> | null>(null);

const virtualProps = computed(() => ({
  ...unref(props),
  data: editData,
  defaultRowHeight: props.defaultRowHeight || CONTROL_ROW_HEIGHT[props.size],
  rowHeight: (index: number) => {
    if (
      editTableRef.value &&
      (props.editable ||
        (props.editTrigger === "cell" &&
          editTableRef.value.existIndexEditCells(index)) ||
        editTableRef.value.existIndexEditRows(index))
    )
      return CONTROL_ROW_HEIGHT[props.size];

    return TEXT_ROW_HEIGHT[props.size];
  }
}));

// 所有插槽名
const slotsNames = computed(() => {
  const slotsNames = [];
  for (const column of props.columns) {
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

const { maxHeight, startIndex, endIndex, scrollToIndex } =
  useReTableVirtualScroll(virtualProps, editTableRef);

function toAdd() {
  editTableRef.value && editTableRef.value.toAdd();
}

function toDelete($index: number) {
  editTableRef.value && editTableRef.value.toDelete($index);
}

function toEdit($index: number) {
  editTableRef.value && editTableRef.value.toEdit($index);
}

function toEditCell($index: number, prop: string) {
  editTableRef.value && editTableRef.value.toEditCell($index, prop);
}

function cancelEditRow($index: number) {
  editTableRef.value && editTableRef.value.cancelEditRow($index);
}

function cancelEditCell($index: number, prop: string) {
  editTableRef.value && editTableRef.value.cancelEditCell($index, prop);
}

function validate(callback?: ReEditTableValidateCallback) {
  editTableRef.value && editTableRef.value.validate(callback);
}

function validateRow(index: number, callback?: ReEditTableValidateCallback) {
  editTableRef.value && editTableRef.value.validateRow(index, callback);
}

function validateCell(
  index: number,
  prop: string,
  callback?: ReEditTableValidateCallback
) {
  editTableRef.value && editTableRef.value.validateCell(index, prop, callback);
}

defineExpose({
  editTableRef,
  maxHeight,
  startIndex,
  endIndex,
  toAdd,
  toDelete,
  toEdit,
  toEditCell,
  cancelEditRow,
  cancelEditCell,
  validate,
  validateRow,
  validateCell
});
</script>
