<template>
  <el-popover
    ref="popoverRef"
    trigger="click"
    virtual-triggering
    popper-class="ap-page-table__popover"
    placement="bottom-end"
    :virtual-ref="buttonRef"
    :teleported="false"
    :width="220"
    @show="onShow"
  >
    <div class="ap-page-table__popover-content">
      <div class="ap-page-table__popover-header">
        <div class="ap-page-table__popover-title">
          <el-checkbox
            style="margin-right: 8px !important"
            :indeterminate="indeterminate"
            :model-value="checkAll"
            @change="onCheckChange"
          />列展示/排序
        </div>
        <div class="ap-page-table__popover-extra">
          <el-button link type="primary" @click="onReset">重置</el-button>
        </div>
      </div>
      <div class="ap-page-table__popover-body">
        <div class="ap-page-table-column__drop">
          <draggable
            v-model="columns"
            force-fallback
            itemKey="prop"
            drag-class="ap-page-table-column__dragging-item"
            chosen-class="ap-page-table-column__drag-item--chosen"
            handle=".ap-page-table-column__drag-trigger"
            animation="300"
            delay="50"
          >
            <template #item="{ element }">
              <div :key="element.prop" class="ap-page-table-column__drag-item">
                <el-button link class="ap-page-table-column__drag-trigger mr-1"
                  ><IconifyIconOffline
                    class="text-[16px]"
                    :icon="DraggableIcon"
                /></el-button>
                <el-checkbox
                  style="margin-right: 8px !important"
                  :model-value="checks.includes(element.prop)"
                  :disabled="fixedColumns?.includes(element.prop)"
                  @change="
                    (val: boolean) => {
                      onColumnCheckChange(element.prop, val);
                    }
                  "
                />
                <span class="ap-page-table-column__label">{{
                  element.label
                }}</span>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import draggable from "vuedraggable";
import { ModelRef, ref, unref, watch, computed } from "vue";
import DraggableIcon from "@iconify-icons/ri/draggable";

defineOptions({
  name: "RePageTableSettingPopover"
});

const firstShow = ref(false);
const popoverRef = ref();
const props = defineProps<{
  fixedColumns?: string[];
  buttonRef: any;
}>();

const emits = defineEmits<{
  (e: "reset"): void;
}>();

const columns = defineModel("columns") as ModelRef<
  Array<{ label: string; prop: string }>
>;
const checks = defineModel("checks") as ModelRef<string[]>;
const visible = defineModel("visible") as ModelRef<boolean>;

/* const actualChecks = computed<string[]>(() =>
  checks.value.filter(
    (item: string) => !props.fixedColumns || !props.fixedColumns.includes(item)
  )
); */

const indeterminate = computed<boolean>(
  () => !!checks.value.length && checks.value.length < columns.value.length
);
const checkAll = computed<boolean>(
  () => !!checks.value.length && checks.value.length === columns.value.length
);

watch(visible, val => {
  if (!val) {
    unref(popoverRef).popperRef?.delayHide?.();
  }
});

function onShow() {
  if (!firstShow.value) {
    firstShow.value = true;
  }
  visible.value = true;
}

function onReset() {
  emits("reset");
}

function onCheckChange(val: boolean) {
  if (val) {
    // 全不选 - 忽略 fixedColumns
    checks.value = columns.value.map(item => item.prop);
  } else {
    // 全选 - fixedColumns默认选中
    checks.value = [...(props.fixedColumns || [])];
  }
}

function onColumnCheckChange(prop: string, val: boolean) {
  if (val && !checks.value.includes(prop)) {
    checks.value = [...checks.value, prop];
  } else if (!val && checks.value.includes(prop)) {
    checks.value = checks.value.filter((item: string) => item !== prop);
  }
}
</script>

<style lang="scss">
.ap-page-table__popover {
  &-content {
    @apply relative;
  }

  &-header {
    @apply flex items-center justify-between pl-[26px];
  }

  &-extra {
    @apply flex-shrink-0 ml-2;
  }

  &-title {
    @apply flex-1 flex items-center justify-start font-bold text-[14px] text-[var(--el-text-color-primary)];
  }
}

.ap-page-table-column__drop {
  @apply relative select-none;

  .ap-page-table-column__drag-item {
    @apply flex items-center flex-nowrap justify-start overflow-hidden text-ellipsis whitespace-nowrap;

    .ap-page-table-column__label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.ap-page-table-column__drag-item--chosen {
  background-color: var(--el-color-primary-light-9) !important;
}

.ap-page-table-column__dragging-item {
  // background-color: var(--el-color-white) !important;
  background-color: var(--el-color-primary-light-9) !important;
  box-shadow: var(--el-box-shadow-light) !important;
}
</style>
