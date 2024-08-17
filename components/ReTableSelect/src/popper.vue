<template>
  <el-popover
    ref="popoverRef"
    :virtual-ref="triggerRef"
    trigger="click"
    virtual-triggering
    :placement="placement"
    :visible="visible"
    :popper-options="popperOptions"
    :popper-class="popperClass"
    :popper-style="poperStyle"
    :teleported="teleported"
    :transition="transition"
  >
    <div v-loading="showLoading" class="ap-table-select__popover-wrapper">
      <div v-if="$slots.header" class="ap-table-select__popover-header">
        <slot name="header" />
      </div>
      <div v-if="filterable" class="ap-table-select__popover-filters">
        <el-input
          v-model="keyword"
          clearable
          :size="size"
          :placeholder="filterPlaceholder"
          :prefix-icon="Search"
          @update:model-value="onChangeKeywordDebounce"
        />
      </div>
      <div
        v-if="multiple && showToolbox"
        class="ap-table-select__popover-toolbox"
      >
        <div class="ap-table-select__popover-toolbox-left">
          <template v-if="remote && pagination">
            <el-button
              link
              type="primary"
              :disabled="!total || selectedAll"
              @click="selectedAll = true"
              >全选</el-button
            >
            <el-button
              link
              type="primary"
              :disabled="!total || !selectedAll"
              @click="selectedAll = false"
              >取消全选</el-button
            >
          </template>
          <template v-else>
            <el-button link type="primary" @click="onSelectAll">全选</el-button>
            <el-button link type="primary" @click="onRevert">反选</el-button>
          </template>
          <el-button
            :disabled="selectedAll"
            link
            type="primary"
            @click="onClear"
            >清空已选</el-button
          >
          <template v-if="pagination">
            <el-button
              :disabled="selectedAll"
              link
              type="primary"
              @click="onPageSelectAll"
              >全选当前页</el-button
            >
            <el-button
              :disabled="selectedAll"
              link
              type="primary"
              @click="onPageRevert"
              >反选当前页</el-button
            >
            <el-button
              :disabled="selectedAll"
              link
              type="primary"
              @click="onPageClear"
              >清空当前页已选</el-button
            >
          </template>
        </div>
        <div v-if="remote" class="ap-table-select__popover-toolbox-right">
          <el-button link type="primary">刷新</el-button>
        </div>
      </div>
      <div class="ap-table-select__popover-body">
        <ReTable
          ref="tableRef"
          v-model:current-page="localCurrentPage"
          v-model:page-size="localPageSize"
          :highlight-current-row="!multiple"
          :rowKey="valueKey"
          :size="size"
          :gutter="gutter"
          :data="data"
          :columns="localColumns"
          :stripe="stripe"
          :border="border"
          :total="total"
          :remote="remote"
          :pagination="pagination"
          :paginationProps="paginationProps"
          :max-height="maxHeight"
          :empty-text="localEmptyText"
          :custom-filters="localCustomFilters"
          :autoRemote="false"
          :row-class-name="rowClassName"
          @current-change="onCurrentChange"
          @filter-change="onFilterChange"
          @sort-change="onSortChange"
          @select="onSelectChange"
          @select-all="onSelectChange"
          @update:current-page="onCurrentPageChange"
          @update:page-size="onPageSizeChange"
        >
          <!--插槽传递-->
          <template v-if="$slots.empty" #empty>
            <slot name="empty" :match="hasFilters" />
          </template>
          <template v-for="slotName in slotsNames" #[slotName]="slotScoped">
            <slot
              v-if="$slots[slotName]"
              :name="slotName"
              v-bind="slotScoped"
            />
          </template>
        </ReTable>
      </div>
      <div v-if="$slots.footer" class="ap-table-select__popover-footer">
        <slot name="footer" />
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import {
  ref,
  computed,
  CSSProperties,
  watch,
  shallowRef,
  nextTick,
  onMounted,
  h
} from "vue";
import ReTable from "../../ReTable/src/main.vue";
import { ElCheckbox, ElPopover } from "element-plus";
import { mergeStyle } from "@/utils/dom";
import type { ReTableSelectPopoverProps } from "../types";
import type {
  ReTableColumn,
  ReTableCustomFilter,
  ReTableRow,
  ReTableSortColumn,
  ReTableFilterColumn
} from "@/components/ReTable/types";
import { debounce, isEmpty, isString, isUndefined } from "lodash-es";

// TODO: 工具栏操作忽略不可选中行

type CustomFilter = Partial<Omit<ReTableCustomFilter, "value">>;

defineOptions({
  name: "ReTableSelectPopper",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReTableSelectPopoverProps>(), {
  debounce: 300
});
const emits = defineEmits<{
  (e: "select-change", value: any, rows: ReTableRow[]): void;
  (e: "select", value: any, row: ReTableRow): void;
  (
    e: "request",
    params: any,
    keyword: string,
    filters?: any,
    sorts?: any
  ): void;
}>();

const tableRef = ref<InstanceType<typeof ReTable> | null>(null);
const popoverRef = ref<InstanceType<typeof ElPopover> | null>(null);
const localCurrentPage = ref(1);
const localPageSize = ref(props.pageSize || 10);
const keyword = ref("");
const localLoading = ref(false);
const showLoading = computed(() => props.loading || localLoading.value);

const filterTarget = shallowRef<ReTableFilterColumn | null>(null);
const sortTarget = shallowRef<ReTableSortColumn | null>(null);

const selectedAll = defineModel<boolean>("selectedAll");
const selected = defineModel("selected");
const selections = defineModel("selections");

const checkColumn = computed<ReTableColumn>(() => ({
  label: "",
  prop: "selection",
  type: "selection",
  width: "50",
  selectable: (row: ReTableRow, $index: number) => {
    if (props.remote && props.pagination && selectedAll.value) return false;
    if (props.selectable) return props.selectable(row, $index);
    return true;
  }
}));

const disabledCheckColumn = computed<ReTableColumn>(() => ({
  label: "",
  prop: "disabled-selection",
  width: "50",
  renderHeader: () => h(ElCheckbox, { disabled: true, modelValue: true }),
  formatter: () => h(ElCheckbox, { disabled: true, modelValue: true })
}));

const rowClassName = computed<(data: { row: any; rowIndex: number }) => string>(
  () => {
    if (!props.selectable) return () => "";
    return (data: { row: any; rowIndex: number }) => {
      if (props.selectable(data.row, data.rowIndex)) return "";

      return "ap-table-select__row--disabled";
    };
  }
);

const hasFilters = computed(
  () =>
    (props.filterable && !!keyword.value) || filterIsNoEmpty(filterTarget.value)
);

const localColumns = computed(() => {
  if (props.multiple) {
    if (props.remote && props.pagination && selectedAll.value)
      return [disabledCheckColumn.value, ...props.columns];
    return [checkColumn.value, ...props.columns];
  }
  return [...props.columns];
});

const localEmptyText = computed(() => {
  if (hasFilters.value) return props.noMatchText;
  return props.noDataText;
});

const normalizeCustomFilters = computed<CustomFilter[]>(() => {
  if (!props.filterProps) return [buildCustomFilter(props.labelKey)];
  if (isString(props.filterProps))
    return [buildCustomFilter(props.filterProps)];

  return props.filterProps.map((item: string | CustomFilter) => {
    if (isString(item)) return buildCustomFilter(item);
    return normalizeCustomFilter(item);
  });
});

const localCustomFilters = computed<ReTableCustomFilter[]>(() => {
  const props: string[] = normalizeCustomFilters.value.map(
    (item: CustomFilter) => item.prop!
  );
  const propsSet = [...new Set(props)];
  return propsSet.map((prop: string) => {
    const item: CustomFilter = normalizeCustomFilters.value.find(
      (item: CustomFilter) => (item.prop = prop)
    );
    return {
      ...item,
      value: keyword.value
    } as ReTableCustomFilter;
  });
});

const poperStyle = computed<CSSProperties>(() =>
  mergeStyle(
    {
      minWidth: "200px",
      width: "auto",
      maxWidth: "90vw"
    },
    props.popperStyle || ""
  )
);

const onChangeKeywordDebounce = debounce(onChangeKeyword, 300);

watch(
  () => props.visible,
  val => {
    if (!val && props.resetParamsAfterHide) {
      nextTick(() => {
        clearFilters();
      });
    } else if (val) {
      if (props.remote) {
        toRemote();
      } else {
        nextTick(() => {
          syncTableSelected();
        });
      }
    }
  }
);

watch(
  () => [selectedAll.value, selected.value, props.data],
  () => {
    nextTick(() => {
      syncTableSelected();
    });
  }
);

onMounted(() => {
  if (props.remote && props.firstRemote) {
    toRemote();
  }
});

function clearFilters() {
  keyword.value = "";
  localCurrentPage.value = 1;
  sortTarget.value = null;
  filterTarget.value = null;
  tableRef.value.sortTarget = null;
  tableRef.value.filterTarget = null;
  tableRef.value.tableRef.clearFilter();
  tableRef.value.tableRef.clearSort();
}

function normalizeCustomFilter(item: CustomFilter): CustomFilter {
  const defaultFilter = buildCustomFilter(item.prop || props.labelKey);
  return {
    ...defaultFilter,
    ...item
  } as CustomFilter;
}

function buildCustomFilter(prop: string): CustomFilter {
  return {
    prop,
    ignoreCase: false,
    type: "^="
    // type: // 关联字段判断方式 =(等于)，!(非)，.(包含)，^(开头)，$(结尾)，&(全部匹配)，｜(部分匹配)
    // "=" | "!=" | "." | "!." | "^=" | "=$" | "!^=" | "!=$" | "&." | "!&." | "|.";
  };
}

function filterIsNoEmpty(filters: any) {
  if (!filters) return false;
  const keys = Object.keys(filters);
  return keys.some((key: string) => !isEmpty(filters[key]));
}

/**
 * 同步表格选中效果
 */
function syncTableSelected() {
  if (!tableRef.value) return;
  if (props.remote && props.pagination && selectedAll.value) return;
  if (isUndefined(selected.value)) {
    if (!props.multiple) {
      tableRef.value?.tableRef.setCurrentRow(undefined);
    } else {
      tableRef.value?.tableRef.clearSelection();
    }
  } else {
    if (!props.multiple) {
      const selectedRow = props.data.find(
        (row: ReTableRow) => row[props.valueKey] === selected.value
      );
      tableRef.value?.tableRef.setCurrentRow(selectedRow);
    } else {
      tableRef.value?.tableRef.clearSelection();
      for (const item of selected.value as string[] | number[]) {
        const selectedRow = props.data.find(
          (row: ReTableRow) => row[props.valueKey] === item
        );
        if (selectedRow) {
          tableRef.value?.tableRef.toggleRowSelection(selectedRow, true);
        }
      }
    }
  }
}

function toRemote() {
  if (props.remote) {
    if (props.remoteMethod) {
      localLoading.value = true;
      props
        .remoteMethod(
          {
            currentPage: localCurrentPage.value,
            pageSize: localPageSize.value
          },
          keyword.value,
          filterTarget.value,
          sortTarget.value
        )
        .finally(() => {
          localLoading.value = false;
        });
    } else {
      emits(
        "request",
        { currentPage: localCurrentPage.value, pageSize: localPageSize.value },
        keyword.value,
        filterTarget.value,
        sortTarget.value
      );
    }
  }
}

/**
 * 单选选中改变-更新数据
 * @param currentRow 选中行数据
 */
function onCurrentChange(currentRow: ReTableRow, oldRow: ReTableRow) {
  if (props.multiple) return;
  if (!currentRow) return;
  const value = currentRow[props.valueKey];
  const $index = tableRef.value.tableData.findIndex(
    (row: ReTableRow) => row[props.valueKey] === value
  );

  if (!props.selectable || props.selectable(currentRow, $index)) {
    // 可选
    if (selected.value !== value) {
      selected.value = value;
      selections.value = { ...currentRow };
      emits("select", selected.value, selections.value);
    }
  } else {
    tableRef.value.tableRef.setCurrentRow(oldRow);
  }
}

/**
 * 触发表格过滤-表格重新渲染-需要同步表格选中
 */
function onFilterChange(filters: any) {
  filters.filterTarget = filters;
  if (props.remote) {
    toRemote();
  } else {
    nextTick(() => {
      syncTableSelected();
    });
  }
}

/**
 * 触发排序-表格重新渲染-需要同步表格选中
 */
function onSortChange(data: any) {
  sortTarget.value = data;
  if (props.remote) {
    toRemote();
  } else {
    nextTick(() => {
      syncTableSelected();
    });
  }
}

/**
 * 过滤关键字输入-表格自定义过滤-表格重新渲染-需要同步表格选中
 */
function onChangeKeyword() {
  if (props.remote) {
    toRemote();
  } else {
    nextTick(() => {
      syncTableSelected();
    });
  }
}

function onCurrentPageChange() {
  if (props.remote) {
    toRemote();
  } else {
    nextTick(() => {
      syncTableSelected();
    });
  }
}

function onPageSizeChange() {
  if (props.remote) {
    toRemote();
  } else {
    nextTick(() => {
      syncTableSelected();
    });
  }
}

/**
 * 多选改变-更新数据
 * @param newSelections 当前页选中数据 - 需要区分分页和不分页
 */
function onSelectChange(newSelections: ReTableRow[]) {
  if (props.remote && props.pagination && selectedAll.value) return;
  if (!props.pagination) {
    // 不分页
    selected.value = newSelections.map(
      (row: ReTableRow) => row[props.valueKey]
    );
    selections.value = [...newSelections] as ReTableRow[];
  } else {
    // 分页 - 当前页做限制
    const oldSelected = [...((selected.value as string[] | number[]) || [])];
    const oldSelections = [...((selections.value as ReTableRow[]) || [])];
    const tableData = tableRef.value.tableData;
    const uncheckedRows = tableData.filter((row: ReTableRow) => {
      return (
        newSelections.findIndex(
          (item: ReTableRow) => item[props.valueKey] === row[props.valueKey]
        ) === -1
      );
    });
    for (const row of newSelections) {
      if (!oldSelected.includes(row[props.valueKey])) {
        oldSelected.push(row[props.valueKey]);
        oldSelections.push({ ...row });
      }
    }
    for (const row of uncheckedRows) {
      const ind = oldSelected.findIndex(
        (key: string | number) => row[props.valueKey] === key
      );
      const ind2 = oldSelections.findIndex(
        (item: ReTableRow) => item[props.valueKey] === row[props.valueKey]
      );
      if (ind !== -1) {
        oldSelected.splice(ind, 1);
      }
      if (ind2 !== -1) {
        oldSelections.splice(ind2, 1);
      }
    }
    selected.value = oldSelected;
    selections.value = oldSelections;
  }
  emits("select-change", selected.value, selections.value as ReTableRow[]);
}

function onSelectAll() {
  const tableData = (props.data || []) as ReTableRow[];
  selected.value = tableData.map(item => item[props.valueKey]);
  selections.value = [...tableData];
}

function onRevert() {
  const selectedRows = (selections.value || []) as ReTableRow[];
  const tableData = (props.data || []) as ReTableRow[];
  const uncheckedRows = tableData.filter((row: ReTableRow) => {
    return (
      selectedRows.findIndex(
        (item: ReTableRow) => item[props.valueKey] === row[props.valueKey]
      ) === -1
    );
  });
  selected.value = uncheckedRows.map(item => item[props.valueKey]);
  selections.value = [...uncheckedRows];
}

function onClear() {
  selected.value = [];
  selections.value = [];
}

function onPageClear() {
  onSelectChange([]);
}

function onPageSelectAll() {
  const tableData = tableRef.value?.tableData || [];
  onSelectChange(tableData);
}

function onPageRevert() {
  const selectedRows = tableRef.value?.tableRef.getSelectionRows();
  const tableData = tableRef.value?.tableData || [];
  const uncheckedRows = tableData.filter((row: ReTableRow) => {
    return (
      selectedRows.findIndex(
        (item: ReTableRow) => item[props.valueKey] === row[props.valueKey]
      ) === -1
    );
  });
  onSelectChange(uncheckedRows);
}

defineExpose({
  popoverRef,
  tableRef,
  toRemote
});
</script>

<style lang="scss">
.ap-table-select {
  &__popover-header {
    @apply relative -mx-3 px-3 pb-3 border-0;

    border-bottom: 1px solid var(--el-border-color);
  }

  &__popover-toolbox {
    @apply relative -mx-3 px-3 pb-3 border-0 flex items-center justify-between;

    border-bottom: 1px solid var(--el-border-color);

    &-right {
      @apply flex items-center flex-shrink-0 ml-3;
    }

    &-left {
      @apply flex items-center;
    }
  }

  &__popover-filters {
    @apply relative -mx-3 px-3 pb-3 border-0 flex items-center justify-start;

    border-bottom: 1px solid var(--el-border-color);
  }

  &__popover-footer {
    @apply relative -mx-3 px-3 pt-3 mt-3 border-0;

    border-top: 1px solid var(--el-border-color);
  }

  &__popover-header + &__popover-filters,
  &__popover-header + &__popover-toolbox,
  &__popover-filters + &__popover-toolbox {
    @apply pt-3;
  }

  &__popover-header + &__popover-body,
  &__popover-toolbox + &__popover-body,
  &__popover-filters + &__popover-body {
    .el-table--border {
      @apply mt-3;
    }
  }
}
</style>
