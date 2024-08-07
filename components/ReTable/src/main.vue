<template>
  <div v-loading="loading" :class="['ap-table', `ap-table--${gutter}`]">
    <el-table
      ref="tableRef"
      class="ap-table__instance"
      :data="tableData"
      :rowKey="rowKey"
      :stripe="stripe"
      :border="border"
      v-bind="$attrs"
      @sort-change="onSortChange"
      @filter-change="onFilterChange"
    >
      <template v-if="$slots.empty || emptyText">
        <slot name="empty"
          ><div>{{ emptyText }}</div></slot
        >
      </template>
      <template v-if="$slots.append"> <slot name="append" /></template>
      <!--表格列配置-->
      <el-table-column
        v-for="column in localColumns"
        :key="column.columnKey || column.prop"
        v-bind="column"
      >
        <template v-if="column.slot" #default="scope">
          <slot v-if="$slots[column.slot]" :name="column.slot" v-bind="scope" />
        </template>
        <template v-if="column.filterIconSlot" #filter-icon="scope">
          <slot
            v-if="$slots[column.filterIconSlot]"
            :name="column.filterIconSlot"
            v-bind="scope"
          />
        </template>
        <template v-if="column.headerSlot" #header="scope">
          <slot
            v-if="$slots[column.headerSlot]"
            :name="column.headerSlot"
            v-bind="scope"
          />
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="pagination"
      ref="pagerRef"
      class="ap-table__pagination"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      v-bind="paginationProps"
      @size-change="handlePageSizeChange"
      @current-change="handleCurrentPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, unref, useAttrs } from "vue";
import usePagination from "@/hooks/usePagination/index";
import { ElPagination, ElTable } from "element-plus";
import type {
  ReTableRow,
  ReTableEmits,
  ReTableProps,
  ReTableSortColumn,
  ReTableFilterColumn,
  ReTableColumn
} from "../types";
import { defaultSortTable, defaultFilterTable } from "./utils";
import { isUndefined } from "lodash-es";

defineOptions({
  name: "ReTable",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReTableProps>(), {
  pagination: true,
  remote: false,
  gutter: "default",
  rowKey: "id",
  stripe: true,
  border: false,
  reversePageAfterSort: true,
  resetCurrentPage: true
});

const emits = defineEmits<ReTableEmits>();

const $attrs = useAttrs();

const localColumns = computed(() => {
  return props.columns.map((item: ReTableColumn) => {
    const defaultColumn: Partial<ReTableColumn> = {
      columnKey: item.prop
    };
    const defaultText = item.defaultText || "-";
    if (!isUndefined(item.options)) {
      const labelKey = item.labelKey || "label";
      const valueKey = item.valueKey || "value";

      if (!item.formatter) {
        defaultColumn.formatter = (
          row: any,
          column: any,
          cellValue: any,
          index: number
        ): string => {
          const opt = item.options.find(
            (opt: Record<string, any>) => opt[valueKey] === cellValue
          );
          return opt ? opt[labelKey] : cellValue ?? defaultText;
        };
      }

      if (item.filterable) {
        item.filters = item.options.map((opt: Record<string, any>) => ({
          text: opt[labelKey],
          value: opt[valueKey]
        }));
      }
    } else {
      if (!item.formatter) {
        defaultColumn.formatter = (
          row: any,
          column: any,
          cellValue: any,
          index: number
        ): string => {
          return cellValue ?? defaultText;
        };
      }
    }
    if (!props.remote && item.sortable) {
      defaultColumn.sortable = "custom";
    }
    return {
      ...item,
      ...defaultColumn
    };
  });
});

const sortTarget = shallowRef<ReTableSortColumn | null>(null);
const filterTarget = shallowRef<ReTableFilterColumn | null>(null);

const filterData = computed(() => {
  if (props.remote) return props.data;
  return defaultFilterTable(
    unref(props.data),
    unref(filterTarget),
    unref(props.customFilters),
    unref(localColumns)
  );
});

const sortData = computed(() => {
  if (props.remote) return unref(filterData);
  return defaultSortTable(unref(filterData), unref(sortTarget));
});

const normalizeProps = computed(() => ({
  ...unref(props),
  data: unref(sortData)
}));

const {
  loading,
  dataSource,
  currentPage,
  pageSize,
  total,
  paginationProps,
  handlePageSizeChange,
  handleCurrentPageChange,
  toRemote
} = usePagination(normalizeProps, emits);

const tableData = computed(() => {
  if (props.pagination) return dataSource.value;
  return normalizeProps.value.data;
});

const tableRef = ref<InstanceType<typeof ElTable> | null>(null);
const pagerRef = ref<InstanceType<typeof ElPagination> | null>(null);

/**事件冒泡 */
function onSortChange(data: { column: any; prop: string; order: any }) {
  emits("sort-change", data);
  if (!props.remote) {
    sortTarget.value = data;
    if (props.reversePageAfterSort) {
      const pager = currentPage.value;
      nextTick(() => {
        currentPage.value = pager;
      });
    }
  }
}
function onFilterChange(newFilters: any) {
  emits("filter-change", newFilters);
  if (!props.remote) {
    filterTarget.value = newFilters;
  }
}

defineExpose({
  tableRef,
  pagerRef,
  toRemote,
  loading,
  currentPage,
  pageSize,
  total,
  tableData,
  dataSource,
  sortData,
  filterData
});
</script>

<style lang="scss">
.ap-table {
  @apply relative w-full;

  &__instance {
    @apply relative w-full;
  }

  &__pagination {
    @apply relative w-full mt-3;
  }

  &--default {
    .el-table--large {
      .el-table__cell {
        padding: 12px 0 !important;

        .cell {
          line-height: 22px;
        }
      }
    }

    .el-table__cell {
      padding: 8px 0 !important;

      .cell {
        padding: 0 12px !important;
      }
    }
  }

  &--medium {
    .el-table--large {
      .el-table__cell {
        padding: 8px 0 !important;

        .cell {
          line-height: 21px;
        }
      }
    }

    .el-table__cell {
      padding: 4px 0 !important;

      .cell {
        padding: 0 8px !important;
        line-height: 20px;
      }
    }
  }

  &--small {
    .el-table--large {
      .el-table__cell {
        padding: 4px 0 !important;
      }
    }

    .el-table__cell {
      padding: 0 !important;

      .cell {
        padding: 0 4px !important;
        line-height: 20px;
      }
    }
  }
}
</style>
