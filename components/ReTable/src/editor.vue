<template>
  <div ref="editTableWrapperRef" class="ap-edit-table">
    <div
      v-if="showTopAddBtn || $slots['toolbox-left'] || $slots['toolbox-right']"
      class="ap-edit-table__toolbox"
    >
      <div class="ap-edit-table__toolbox-left">
        <slot name="toolbox-left">
          <el-button v-if="showTopAddBtn" v-bind="topAddBtnProps" @click="onAdd"
            ><el-icon class="mr-1"><Plus /></el-icon>新增</el-button
          >
        </slot>
      </div>
      <div class="ap-edit-table__toolbox-right">
        <slot name="toolbox-right" />
      </div>
    </div>
    <ReTable
      ref="reTableRef"
      v-model:pageSize="currentPageSize"
      v-model:currentPage="currentPage"
      :resetCurrentPage="false"
      :size="size"
      :rowKey="rowKey"
      :stripe="stripe"
      :pagination="pagination"
      :data="tableData"
      :columns="localColumns"
      :maxHeight="maxHeight"
      v-bind="$attrs"
      @cell-dblclick="onCellDblclick"
      @cell-contextmenu="onCellConotextMenu"
      @row-dblclick="onRowDblclick"
      @row-contextmenu="onRowConotextMenu"
    >
      <!--插槽传递-->
      <template v-if="$slots.empty" #empty>
        <slot name="empty" />
      </template>
      <template v-for="slotName in slotsNames" #[slotName]="slotScoped">
        <slot v-if="$slots[slotName]" :name="slotName" v-bind="slotScoped" />
      </template>
    </ReTable>
    <div v-if="showBottomAddBtn" class="ap-edit-table__footer">
      <slot name="add-bottom-button">
        <el-button v-bind="bottomAddBtnProps" @click="onAdd"
          ><el-icon class="mr-1"><Plus /></el-icon>新增</el-button
        >
      </slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import ReTable from "./main.vue";
import {
  unref,
  ref,
  watch,
  computed,
  useAttrs,
  h,
  resolveComponent,
  useSlots,
  nextTick
} from "vue";
import { isUndefined, isArray, cloneDeep, isError, noop } from "lodash-es";
import { ElMessageBox, ElButton } from "element-plus";
import { withEventsDirective } from "@/utils/vnodes";
import { validateRules, type AsyncRules } from "@/utils/async-validate";
import { HAS_CHILD_COMPONENT_MAP } from "../../ReForm/constants";
import type {
  ReTableProps,
  ReTableRow,
  ReTableColumn,
  ReEditTableProps,
  ReEditTableColumn,
  ReEditTableEmits,
  ReEditTableValidateCallback
} from "../types";
import type { ModelRef, VNode, MaybeRef } from "vue";

defineOptions({
  name: "ReEditTable",
  inheritAttrs: false
});

// 数据转换规则：父组件数据 =》editTable =》根据分页/虚拟渲染拆分 tableData =》根据渲染索引 $index =》通过normalizeIndex转换索引得到index =》通过index更新editData =》同步父组件

const props = withDefaults(defineProps<ReEditTableProps>(), {
  rowKey: "id",
  pageSize: 10,
  stripe: false,
  showAddBtn: true,
  addBtnPosition: "bottom",
  addBtnDisabled: false,
  editable: false,
  editTrigger: "custom",
  confirmBeforeDelete: true,
  confirmMessage: "是否确认删除该条记录？",
  pagination: false,
  renderAction: true,
  ignoreCellValid: true,
  according: false,
  scrollToError: true,
  scrollIntoViewOptions: true,
  virtual: false,
  virtualStartIndex: 0,
  virtualEndIndex: 0
});

const $attrs = useAttrs();
const $slots = useSlots(); // 获取所有插槽方法 - 用于提取列字段作用域插槽

const emits = defineEmits<ReEditTableEmits>();

let _scrollTimeout;
// 编辑数据缓存
let editCellCache: [number, string, any][] = []; // 行数据缓存-用于取消重置
let editRowCache: [number, Record<string, any>][] = []; // 行数据缓存-用于取消重置
const cellMsgCache = ref<[number, string, string][]>([]); // 校验信息缓存
// 编辑数据
const editData = defineModel("data") as ModelRef<ReTableProps["data"]>; // 当前编辑表格数据 - 同步父组件 - 建议用shallowRef

const reTableRef = ref<InstanceType<typeof ReTable> | null>(null);
const editTableWrapperRef = ref<HTMLDivElement | null>(null);
const currentPage = ref(1);
const currentPageSize = ref(props.pageSize);

// 编辑行集合
const editRows = ref<number[]>([]);
// 编辑单元格集合
const editCells = ref<[number, string][]>([]);
const childComps = ref<string[]>(Object.keys(HAS_CHILD_COMPONENT_MAP));

// 绑定 ReTable 的实际数据
const tableData = computed(() => {
  return props.virtual
    ? editData.value.slice(props.virtualStartIndex, props.virtualEndIndex)
    : editData.value;
});
// 渲染配置
const showTopAddBtn = computed(
  () => props.showAddBtn && props.addBtnPosition === "top"
);
const showBottomAddBtn = computed(
  () => props.showAddBtn && props.addBtnPosition === "bottom"
);
const topAddBtnProps = computed<Record<string, any>>(() => {
  const btnProps: Record<string, any> = {
    type: "primary",
    disabled: props.addBtnDisabled || props.disabled,
    ...(props.addBtnProps || {})
  };
  return btnProps;
});
const bottomAddBtnProps = computed<Record<string, any>>(() => {
  const btnProps: Record<string, any> = {
    type: "default",
    class: "ap-edit-table__footer-btn",
    disabled: props.addBtnDisabled || props.disabled,
    ...(props.addBtnProps || {})
  };
  return btnProps;
});

// 构造ReTable的columns配置
const localColumns = computed<ReTableColumn[]>(() => {
  const columns: ReEditTableColumn[] = cloneDeep(unref(props.columns));
  for (const column of columns) {
    delete column.sortable;
    delete column.filterable;

    if (props.virtual) {
      column["show-overflow-tooltip"] = true;
    }

    const rawFormatter = column.formatter;
    column.formatter = (
      row: any,
      _column: any,
      cellValue: any,
      $index: number
    ) => {
      const columnTemp = props.columns.find(
        (temp: ReEditTableColumn) => temp.prop === _column.property
      );

      // 简单渲染
      if (
        !columnTemp ||
        !columnTemp.editable ||
        (!props.editable &&
          findIndexEditRows($index) === -1 &&
          findIndexEditCells($index, columnTemp.prop) === -1)
      ) {
        return rawFormatter
          ? rawFormatter(row, _column, cellValue, $index)
          : defaultCellRender(row, _column, cellValue, $index);
      }

      // 渲染表单控件
      return defaultCellControlRender(row, _column, cellValue, $index);
    };

    if (
      column.required ||
      (!!cellRuleMap.value[column.prop] &&
        !!cellRuleMap.value[column.prop].find((rule: any) => !!rule.required))
    ) {
      column["label-class-name"] =
        `is-required ${column["label-class-name"] || ""}`;
    }
  }
  if (
    (props.editTrigger === "custom" || props.editTrigger === "row") &&
    props.renderAction
  ) {
    columns.push(getActionColumn());
  }
  return columns as ReTableColumn[];
});

// 所有插槽名
const slotsNames = computed(() => {
  const slotsNames = [];
  for (const column of localColumns.value) {
    // 不收集单元格作用域插槽 - 交给formatter渲染
    // if (!isUndefined(column.slot)) {
    //   slotsNames.push(column.slot);
    // }
    if (!isUndefined(column.filterIconSlot)) {
      slotsNames.push(column.filterIconSlot);
    }
    if (!isUndefined(column.headerSlot)) {
      slotsNames.push(column.headerSlot);
    }
  }
  return slotsNames;
});

// 需要校验的列字段集合
const validCells = computed<string[]>(() => {
  const cells: string[] = [];
  for (const column of props.columns) {
    if (
      (!isUndefined(column.rules) &&
        (!isArray(column.rules) || column.rules.length)) ||
      column.required
    ) {
      cells.push(column.prop);
    }
  }
  return cells;
});

// 用于注入change事件，默认注入blur事件
const validCellsByChange = computed<string[]>(() => {
  const cells: string[] = [];
  for (const column of props.columns) {
    if (
      !isUndefined(column.rules) &&
      ((!isArray(column.rules) && column.rules.trigger === "change") ||
        (isArray(column.rules) &&
          !!column.rules.find((rule: any) => rule.trigger === "change")))
    ) {
      cells.push(column.prop);
    }
  }
  return cells;
});

// 列字段的校验规则映射
const cellRuleMap = computed<Record<string, AsyncRules>>(() => {
  const ruleMap: Record<string, AsyncRules> = {};
  for (const cell of validCells.value) {
    const column = props.columns.find(
      (column: ReEditTableColumn) => column.prop === cell
    );
    ruleMap[cell] = [];
    if (!isUndefined(column.rules)) {
      ruleMap[cell] = isArray(column.rules) ? column.rules : [column.rules];
    }
    if (column.required) {
      ruleMap[cell].unshift({ required: true });
    }
  }
  return ruleMap;
});

// 默认数据
const defaultRowValue = computed(() => {
  const defaultRow: Record<string, any> = {};
  for (const column of props.columns) {
    if (column.editable) {
      defaultRow[column.prop] = isUndefined(column.defaultValue)
        ? undefined
        : cloneDeep(column.defaultValue);
    }
  }
  return defaultRow;
});

// 【不推荐】避免一次组件使用切换不同的编辑方式
watch(
  () => [props.editable, props.editTrigger],
  () => {
    reset();
  }
);

// 【说明】$index - 渲染数据索引，index - 实际数据索引，$index 需要经过 normalizeIndex 转换成 index
// 重置编辑相关状态
function reset() {
  if (_scrollTimeout) {
    clearTimeout(_scrollTimeout);
    _scrollTimeout = undefined;
  }
  currentPage.value = 1;
  editCellCache = [];
  editRowCache = [];
  cellMsgCache.value = [];
  editRows.value = [];
  editCells.value = [];
}

// 默认单元格渲染
function defaultCellRender(
  row: any,
  column: any,
  cellValue: any,
  $index: number
): VNode {
  const columnTemp = props.columns.find(
    (temp: ReEditTableColumn) => temp.prop === column.property
  );
  if (columnTemp.slot && $slots[columnTemp.slot]) {
    const slotVNode = () =>
      $slots[columnTemp.slot]({
        row,
        column,
        $index,
        editable: false,
        cellValue: cellValue,
        value: cellValue,
        handler: noop
      });
    return h("div", { class: "ap-edit-table__control-wrapper" }, slotVNode());
  }
  const defaultText = columnTemp.defaultText || "-";
  if (columnTemp && !isUndefined(columnTemp.options)) {
    const labelKey = columnTemp.labelKey || "label";
    const valueKey = columnTemp.valueKey || "value";
    const opt = columnTemp.options.find(
      (opt: Record<string, any>) => opt[valueKey] === cellValue
    );
    return h(
      "div",
      { class: "ap-edit-table__control-wrapper" },
      h("span", null, opt ? opt[labelKey] : cellValue ?? defaultText)
    );
  }
  return h(
    "div",
    { class: "ap-edit-table__control-wrapper" },
    h("span", null, cellValue ?? defaultText)
  );
}

// 默认单元格编辑渲染
function defaultCellControlRender(
  row: any,
  column: any,
  cellValue: any,
  $index: number
): VNode {
  const columnTemp = props.columns.find(
    (temp: ReEditTableColumn) => temp.prop === column.property
  );

  const comp = columnTemp?.comp;
  const prop = column.property;
  const modelProp = columnTemp.modelProp || "modelValue";
  const modelEvent = columnTemp.modelEvent || "update:modelValue";
  const controlProps = { ...(columnTemp.props || {}), [modelProp]: cellValue };
  const controlEvents = { ...(columnTemp.events || {}) };
  const rawModelEvent = controlEvents[modelEvent];
  controlEvents[modelEvent] = (...rest: any[]) => {
    onCellChange(rest[0], $index, prop, column);
    rawModelEvent && rawModelEvent(...rest);
  };

  // 注入校验事件
  if (!props.ignoreCellValid) {
    const rawBlurEvent = controlEvents["blur"];
    controlEvents["blur"] = (...rest: any[]) => {
      validateCell(normalizeIndex($index), prop);
      rawBlurEvent && rawBlurEvent(...rest);
    };

    if (validCellsByChange.value.includes(prop)) {
      const rawChangeEvent = controlEvents["change"];
      controlEvents["change"] = (...rest: any[]) => {
        validateCell(normalizeIndex($index), prop);
        rawChangeEvent && rawChangeEvent(...rest);
      };
    }
  }

  // 带有校验错误信息
  const errorMsg = getMsgCache(normalizeIndex($index), prop);

  const renderSubComp = (columnTemp: ReEditTableColumn) => {
    const labelKey = columnTemp.labelKey || "label";
    const valueKey = columnTemp.valueKey || "value";
    return columnTemp && !isUndefined(columnTemp.options)
      ? columnTemp.options.map((opt: any) =>
          h(
            resolveComponent(
              columnTemp.childComp || HAS_CHILD_COMPONENT_MAP[columnTemp.comp]
            ),
            {
              item: opt,
              label: opt[labelKey],
              value: opt[valueKey]
            },
            () => opt[labelKey]
          )
        )
      : null;
  };

  const msgVNode = () =>
    !!errorMsg ? h("div", { class: "ap-edit-table__error" }, errorMsg) : null;
  const controlVNode = () =>
    comp
      ? comp === "el-textarea" || comp === "textarea"
        ? h(
            resolveComponent("el-input"),
            {
              type: "textarea",
              size: props.size,
              autofocus: true,
              ...controlProps,
              ...withEventsDirective(controlEvents)
            },
            () => null
          )
        : childComps.value.includes(comp)
          ? h(
              resolveComponent(comp),
              {
                autofocus: true,
                size: props.size,
                ...controlProps,
                ...withEventsDirective(controlEvents)
              },
              () => renderSubComp(columnTemp)
            )
          : h(
              resolveComponent(comp),
              {
                size: props.size,
                autofocus: true,
                ...controlProps,
                ...withEventsDirective(controlEvents)
              },
              () => null
            )
      : null;

  const slotVNode = () =>
    $slots[columnTemp.slot]({
      row,
      column,
      $index,
      editable: true,
      cellValue: cellValue,
      value: cellValue,
      handler: controlEvents[modelEvent]
    });

  return h(
    "div",
    { class: `ap-edit-table__control-wrapper ${!!errorMsg ? "is-error" : ""}` },
    [
      columnTemp.slot && $slots[columnTemp.slot] ? slotVNode() : controlVNode(),
      msgVNode()
    ]
  );
}

// 获取内置操作列配置
function getActionColumn(): ReTableColumn {
  const actionColumn = {
    editable: false,
    label: "操作",
    prop: "_action",
    width: 180,
    align: "center",
    formatter: (row: any, column: any, cellValue: any, $index: number) => {
      const actions: VNode[] = [
        h(
          ElButton,
          {
            link: true,
            type: "primary",
            onClick: () => {
              onDelete(row, $index);
            }
          },
          () => "删除"
        )
      ];

      if (!props.editable) {
        const isEditing = findIndexEditRows($index);
        if (isEditing === -1) {
          actions.unshift(
            h(
              ElButton,
              {
                link: true,
                type: "primary",
                onClick: () => {
                  onEditRow(row, $index);
                }
              },
              () => "编辑"
            )
          );
        } else {
          actions.unshift(
            h(
              ElButton,
              {
                link: true,
                type: "primary",
                onClick: () => {
                  onCloseRows($index);
                }
              },
              () => "取消"
            )
          );
          actions.unshift(
            h(
              ElButton,
              {
                link: true,
                type: "primary",
                onClick: () => {
                  onSaveRow(row, $index);
                }
              },
              () => "保存"
            )
          );
        }
      }

      return h("div", null, actions);
    }
  };
  return actionColumn as any;
}

// DOM操作
function getClickRowIndex(row: any, event: Event): number {
  let $index = -1;
  if (isUndefined(row[props.rowKey])) {
    $index = getRowIndexByCell(event.target as HTMLElement);
  } else {
    // 【推荐】设置rowKey
    $index =
      editData.value.findIndex(
        (item: ReTableRow) => item[props.rowKey] === row[props.rowKey]
      ) % currentPageSize.value;
  }

  return $index;
}
function getRowIndexByCell(cell: HTMLElement): number {
  if (!cell) return -1;
  const table = cell.closest("table"); // 获取td所在的table
  let rowIndex = -1;

  Array.from(table.rows).forEach((tr, index) => {
    if (tr.contains(cell)) {
      rowIndex = index;
    }
  });

  return rowIndex;
}

// 校验相关 -start
// 校验所有输入框
function validate(callback?: ReEditTableValidateCallback) {
  let valid = true;
  // 优化校验
  if (props.editable) {
    // 全量校验
    for (let i = 0; i < editData.value.length; i++) {
      validateRow(i, (_valid: boolean) => {
        valid = valid && _valid;
      });
    }
  } else if (props.editTrigger === "cell") {
    // 只校验编辑状态单元格
    for (const item of editCells.value) {
      validateCell(item[0], item[1], (_valid: boolean) => {
        valid = valid && _valid;
      });
    }
  } else {
    // 只校验编辑状态行
    for (const i of editRows.value) {
      validateRow(i, (_valid: boolean) => {
        valid = valid && _valid;
      });
    }
  }

  if (!valid && props.scrollToError) {
    scrollToError();
  }
  callback && callback(valid);
}

// 校验单元格 - 记录错误信息
function validateCell(
  index: number,
  prop: string,
  callback?: ReEditTableValidateCallback
) {
  let valid = true;
  const rules: AsyncRules = cellRuleMap.value[prop];
  if (rules) {
    const row = editData.value[index];
    const value = row[prop];
    validateRules(rules, value, (error: string | Error) => {
      if (!!error) {
        const _msg = isError(error) ? error.message : error;
        addMsgCache(index, prop, _msg);
        valid = false;
      } else {
        removeMsgCache(index, prop);
      }
    });
  }
  callback && callback(valid);
}

// 校验行数据 - 校验需要校验的单元格
function validateRow(index: number, callback?: ReEditTableValidateCallback) {
  let valid = true;
  for (const cell of validCells.value) {
    validateCell(index, cell, (_valid: boolean) => {
      valid = valid && _valid;
    });
  }
  callback && callback(valid);
}
// 校验相关 -end

// 滚动到第一行错误行
function scrollToError() {
  const toScrollToError = () => {
    if (_scrollTimeout) {
      clearTimeout(_scrollTimeout);
    }
    _scrollTimeout = setTimeout(() => {
      if (reTableRef.value) {
        const errorDOM = reTableRef.value.$el.querySelector(
          ".ap-edit-table__control-wrapper.is-error"
        ) as HTMLElement;
        if (errorDOM) {
          errorDOM.scrollIntoView(props.scrollIntoViewOptions);
        }
      }
    }, 300);
  };
  if (props.virtual) {
    const mIndex = cellMsgCache.value.reduce(
      (mIndex: number, item: [number, string, string]) => {
        if (item[0] < mIndex) {
          return item[0];
        } else return mIndex;
      },
      0
    );
    emits("scroll-to", mIndex, toScrollToError);
  } else if (props.pagination) {
    // 分页 - 自动切换分页
    const startIndex = (currentPage.value - 1) * currentPageSize.value;
    const mIndex = cellMsgCache.value.reduce(
      (mIndex: number, item: [number, string, string]) => {
        if (item[0] < mIndex) {
          return item[0];
        } else return mIndex;
      },
      startIndex
    );
    const page = Math.max(0, parseInt(mIndex / currentPageSize.value));
    currentPage.value = page;
    nextTick(() => {
      toScrollToError();
    });
  } else {
    // 获取第一个error control
    toScrollToError();
  }
}

// 行/单元格编辑数据缓存相关 -start
// 行编辑数据缓存维护
function addRowCache($index: number, row: MaybeRef<any>) {
  editRowCache.push([normalizeIndex($index), cloneDeep(unref(row))]);
}
function getRowCache($index: number): any {
  const index = normalizeIndex($index);
  const cache = editRowCache.find(
    (cache: [number, Record<string, any>]) => cache[0] === index
  );
  return cache ? cache[1] : null;
}
function removeRowCache($index: number) {
  const index = normalizeIndex($index);
  editRowCache = editRowCache.filter(
    (cache: [number, Record<string, any>]) => cache[0] !== index
  );
}
function updateRowCache($index: number) {
  const index = normalizeIndex($index);
  editRowCache = editRowCache.map((cache: [number, Record<string, any>]) => {
    if (cache[0] > index) {
      cache[0] -= 1;
    }
    return cache;
  });
}
function restoreRowCache($index: number) {
  const index = normalizeIndex($index);
  const cache = getRowCache($index);
  if (!cache) return;
  const row = { ...cache };
  updateEditData(row, index);
}

// 单元格编辑数据缓存维护
function addCellCache($index: number, prop: string, cellValue: MaybeRef<any>) {
  editCellCache.push([
    normalizeIndex($index),
    prop,
    cloneDeep(unref(cellValue))
  ]);
}
function getCellCache($index: number, prop: string): any {
  const index = normalizeIndex($index);
  const cache = editCellCache.find(
    (cache: [number, string, any]) => cache[0] === index && cache[1] === prop
  );
  return cache ? cache[2] : undefined;
}
function removeCellCache($index: number, prop?: string) {
  const index = normalizeIndex($index);
  editCellCache = editCellCache.filter(
    (cache: [number, string, any]) =>
      !(cache[0] === index && (!prop || cache[1] === prop))
  );
}
function updateCellCache($index: number) {
  const index = normalizeIndex($index);
  editCellCache = editCellCache.map((cache: [number, string, any]) => {
    if (cache[0] > index) {
      cache[0] -= 1;
    }
    return cache;
  });
}
function restoreCellCache($index: number, prop: string) {
  const index = normalizeIndex($index);
  const cache = getCellCache($index, prop);
  const row = { ...editData.value[index] };
  row[prop] = cache;
  updateEditData(row, index);
}

// 缓存校验信息 -start
function addMsgCache(index: number, prop: string, msg: string) {
  if (!msg) return;
  cellMsgCache.value.push([index, prop, msg]);
}
function getMsgCache(index: number, prop: string) {
  const item = cellMsgCache.value.find(
    (item: [number, string, string]) => item[0] === index && item[1] === prop
  );
  return item ? item[2] : "";
}
function removeMsgCache(index: number, prop?: string) {
  cellMsgCache.value = cellMsgCache.value.filter(
    (item: [number, string, string]) =>
      !(item[0] === index && (!prop || item[1] === prop))
  );
}
function updateMsgCache(index: number) {
  cellMsgCache.value = cellMsgCache.value.map(
    (item: [number, string, string]) => {
      if (item[0] > index) {
        item[0] -= 1;
      }
      return item;
    }
  );
}
// 缓存校验信息 -end
// 行/单元格编辑数据缓存相关 -end

// 格式化索引-区分分页/未分页
function normalizeIndex($index: number) {
  if (props.virtual) return props.virtualStartIndex + $index;
  if (!props.pagination) return $index;
  const startIndex = Math.max(
    0,
    (currentPage.value - 1) * currentPageSize.value
  );
  return startIndex + $index;
}

// 真实新增
function toAdd() {
  const row = !isUndefined(props.createNew)
    ? props.createNew()
    : unref(defaultRowValue);
  const newRow: ReTableRow = cloneDeep(unref(row));
  updateEditData(newRow);
}

// 真实删除
function toDelete($index: number) {
  const index = normalizeIndex($index);
  updateEditData(null, index);

  if (props.editable) return; // 全局可编辑-不需要记录编辑行/单元格
  // 编辑状态集合调整
  removeRowCache($index);
  updateRowCache($index);
  removeCellCache($index);
  updateCellCache($index);
  removeMsgCache(index);
  updateMsgCache(index);

  removeEditRows($index);
  removeEditCells($index);

  updateEditRows($index);
  updateEditCells($index);
}

function toEdit($index: number) {
  if (props.disabled) return;
  const index = normalizeIndex($index);
  onEditRow(props.data[index], $index);
}

function toEditCell($index: number, prop: string) {
  if (
    props.disabled ||
    !reTableRef.value ||
    !reTableRef.value.tableRef ||
    !(reTableRef.value.tableRef as any).value
  )
    return;
  const index = normalizeIndex($index);
  const column = (reTableRef.value.tableRef as any).value.columns.find(
    (column: any) => column.property === prop
  );
  if (!column) return;
  onEditCell(props.data[index], column, $index);
}

// 行/列编辑状态控制 - start
// 行编辑状态维护
function existIndexEditRows($index: number): boolean {
  return editRows.value.indexOf(normalizeIndex($index)) !== -1;
}
function findIndexEditRows($index: number): number {
  return editRows.value.indexOf(normalizeIndex($index));
}
function addEditRows($index: number) {
  const index = findIndexEditRows($index);
  if (index === -1) {
    editRows.value.push(normalizeIndex($index));
  }
}
function removeEditRows($index: number) {
  const index = findIndexEditRows($index); // 行编辑状态索引
  if (index !== -1) {
    editRows.value.splice(index, 1);
  }
}
function updateEditRows($index: number) {
  const index = normalizeIndex($index); // 数据索引
  editRows.value = editRows.value.map((item: number) => {
    if (item > index) return item - 1;
    return item;
  });
  editRowCache = editRowCache.map((item: [number, Record<string, any>]) => {
    if (item[0] > index) {
      item[0] -= 1;
    }
    return item;
  });
}

// 单元格编辑状态维护
function existIndexEditCells($index: number): boolean {
  return (
    editCells.value.findIndex((item: [number, string]) => {
      const ind = normalizeIndex($index);
      return item[0] === ind;
    }) !== -1
  );
}
function findIndexEditCells($index: number, prop: string): number {
  return editCells.value.findIndex((item: [number, string]) => {
    const ind = normalizeIndex($index);
    return item[0] === ind && item[1] === prop;
  });
}
function addEditCells($index: number, prop: string) {
  const index = findIndexEditCells($index, prop);
  if (index === -1) {
    editCells.value.push([normalizeIndex($index), prop]);
  }
}
function removeEditCells($index: number, prop?: string) {
  const index = normalizeIndex($index); // 数据索引
  editCells.value = editCells.value.filter(
    (item: [number, string]) =>
      !(item[0] === index && (!prop || item[1] === prop))
  );
}
function updateEditCells($index: number) {
  const index = normalizeIndex($index);
  editCells.value = editCells.value.map((item: [number, string]) => {
    if (item[0] > index) {
      item[0] -= 1;
    }
    return item;
  });
  editCellCache = editCellCache.map((item: [number, string, any]) => {
    if (item[0] > index) {
      item[0] -= 1;
    }
    return item;
  });
}
// 行/列编辑状态控制 - end

// 更新编辑数据 - 关闭数据变更自动重置分页
function updateEditData(row: any, index = -1) {
  let newData = [...editData.value];
  if (row) {
    const newRow = { ...row };
    if (index === -1) {
      newData = [...newData, newRow];
    } else {
      newData.splice(index, 1, newRow);
    }
  } else if (index !== -1) {
    newData.splice(index, 1);
  }
  editData.value = newData;
}

function onCellChange(val: any, $index: number, prop: string, column: any) {
  const index = normalizeIndex($index);
  const row = { ...editData.value[index] };
  row[prop] = val;
  updateEditData(row, index);
  emits("cell-change", row, column, val, index);
}

function onAdd() {
  if (props.disabled) return;
  if (props.according) {
    // 一次只能编辑一行或者一个单元格
    // TODO: validate
    validate((valid: boolean) => {
      if (valid) {
        toAdd();
      }
    });
  } else {
    toAdd();
  }
}

function onDelete(row: any, $index: number) {
  if (props.disabled) return;
  if (props.confirmBeforeDelete) {
    ElMessageBox.confirm(props.confirmMessage, "删除", {
      type: "warning"
    })
      .then(() => {
        toDelete($index);
      })
      .catch(() => {});
  } else {
    toDelete($index);
  }
}

function onEditCell(row: any, column: any, $index: number) {
  if (props.disabled) return;
  const columnTemp = props.columns.find(
    (temp: ReEditTableColumn) => temp.prop === column.property
  );
  if (!columnTemp || !columnTemp.editable) return;
  const prop = columnTemp.prop;
  const index = findIndexEditCells($index, prop);
  if (index === -1) {
    addEditCells($index, prop);
    addCellCache($index, prop, editData.value[normalizeIndex($index)][prop]);
  }
}

function onEditRow(row: any, $index: number) {
  const index = findIndexEditRows($index);
  if (index === -1) {
    addEditRows($index);
    addRowCache($index, editData.value[normalizeIndex($index)]);
  }
}

function onSaveCell(row: any, column: any, $index: number) {
  if (props.disabled) return;
  // 校验单元格
  const prop = column.property;
  const index = normalizeIndex($index);
  validateCell(index, prop, (valid: boolean) => {
    if (valid) {
      removeEditCells($index, prop);
      removeCellCache($index, prop);
    }
  });
}

function onSaveRow(row: any, $index: number) {
  if (props.disabled) return;
  // 校验行
  const index = normalizeIndex($index);
  validateRow(index, (valid: boolean) => {
    if (valid) {
      removeEditRows($index);
      removeRowCache($index);
    }
  });
}

function onCloseCells($index: number, prop: string) {
  if (props.disabled) return;
  const index = findIndexEditCells($index, prop);
  if (index !== -1) {
    removeEditCells($index, prop);
    restoreCellCache($index, prop);
    removeCellCache($index, prop);
    removeMsgCache(normalizeIndex($index), prop);
  }
}

function onCloseRows($index: number) {
  if (props.disabled) return;
  const index = findIndexEditRows($index);
  if (index !== -1) {
    removeEditRows($index);
    restoreRowCache($index);
    removeRowCache($index);
    removeMsgCache(normalizeIndex($index));
  }
}

function onCellDblclick(
  row: any,
  column: any,
  cell: HTMLTableCellElement,
  event: Event
) {
  emits("cell-dblclick", row, column, cell, event);
  if (props.disabled || props.editable || props.editTrigger !== "cell") return;
  // 支持单元格双击编辑
  // 双击-编辑态切换 / 保存
  let $index = getClickRowIndex(row, event);
  if ($index === -1) return;
  const prop = column.property;
  const index = findIndexEditCells($index, prop);
  // console.log(row, column, cell, event, $index);
  if (index === -1) {
    // 开启编辑
    onEditCell(row, column, $index);
  } else {
    // 校验保存
    onSaveCell(row, column, $index);
  }
}

function onCellConotextMenu(
  row: any,
  column: any,
  cell: HTMLTableCellElement,
  event: Event
) {
  event.preventDefault();
  emits("cell-contextmenu", row, column, cell, event);
  if (props.disabled || props.editable || props.editTrigger !== "cell") return;
  // 取消编辑
  let $index = getClickRowIndex(row, event);
  const prop = column.property;
  if ($index === -1) return;
  onCloseCells($index, prop);
}

function onRowDblclick(row: any, column: any, event: Event) {
  emits("row-dblclick", row, column, event);
  if (props.disabled || props.editable || props.editTrigger !== "row") return;
  let $index = getClickRowIndex(row, event);
  if ($index === -1) return;
  const index = findIndexEditRows($index);
  if (index === -1) {
    // 开启编辑
    onEditRow(row, $index);
  } else {
    // 校验保存
    onSaveRow(row, $index);
  }
}

function onRowConotextMenu(row: any, column: any, event: Event) {
  event.preventDefault();
  emits("row-contextmenu", row, column, event);
  if (props.disabled || props.editable || props.editTrigger !== "row") return;
  // 取消编辑
  let $index = getClickRowIndex(row, event);
  if ($index === -1) return;
  onCloseRows($index);
}

defineExpose({
  reTableRef,
  editData,
  normalizeIndex,
  existIndexEditCells,
  existIndexEditRows,
  reset,
  toAdd,
  toDelete,
  toEdit,
  toEditCell,
  cancelEditRow: onCloseRows,
  cancelEditCell: onCloseCells,
  editRow: onEditRow,
  editCell: onEditCell,
  deleteRow: onDelete,
  validate,
  validateRow,
  validateCell,
  removeEditRows,
  removeRowCache
});
</script>

<style lang="scss">
.ap-edit-table {
  @apply relative w-full;

  &__toolbox {
    @apply flex items-center justify-between mb-3;
  }

  &__toolbox-right {
    @apply flex items-center justify-end ml-4;
  }

  &__footer {
    @apply flex items-center justify-between mt-3;
  }

  &__control-wrapper {
    @apply relative select-none py-5 overflow-hidden text-ellipsis whitespace-nowrap;

    line-height: 22px;

    &.is-error {
      .el-textarea__inner,
      .el-input__wrapper,
      .el-select__wrapper {
        box-shadow: 0 0 0 1px var(--el-color-danger) inset;

        &:hover {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }

        &.is-focus {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
      }
    }
  }

  &__error {
    @apply absolute bottom-0 w-full text-[12px] text-[var(--el-color-danger)];

    line-height: 20px;
    word-break: break-word;
  }

  .el-table {
    .el-table__header {
      .el-table__cell.is-required {
        .cell {
          &::before {
            margin-right: 4px;
            color: var(--el-color-danger);
            content: "*";
          }
        }
      }
    }

    .el-table__body {
      .el-table__cell {
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
    }

    &.el-table--small {
      .ap-edit-table {
        &__control-wrapper {
          line-height: 20px;
        }
      }
    }
  }

  .ap-edit-table__footer-btn {
    @apply relative block w-full border-dashed;
  }
}
</style>
