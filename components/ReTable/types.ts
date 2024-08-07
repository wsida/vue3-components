import type {
  CustomPaginationProps,
  CustomPaginationEmits
} from "@/hooks/usePagination";
import type { CustomVirtualScrollIndex } from "@/hooks/useVirtualScroll";
import type { Arrayable } from "@vueuse/core";
import type { ButtonProps, FormItemRule } from "element-plus";
import type { Ref, VNode } from "vue";

export interface ReTableSortColumn {
  column: any;
  prop: string;
  order: any;
}
export type ReEditTableValidateCallback = (valid: boolean) => void;
export type ReTableFilterColumn = Record<string, any>;
export type ReTableRow = Record<string, any>;
export type ReTableColumnFilters = Array<{ text: string; value: string }>;
export type ReTableColumnFilterPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

export interface ReTableCustomFilter {
  prop: string;
  value: string;
  ignoreCase?: boolean;
  type?: // 关联字段判断方式 =(等于)，!(非)，.(包含)，^(开头)，$(结尾)，&(全部匹配)，｜(部分匹配)
  "=" | "!=" | "." | "!." | "^=" | "=$" | "!^=" | "!=$" | "&." | "!&." | "|.";
}

export interface ReTableColumn {
  type?: "default" | "selection" | "index" | "expand";
  index?: number;
  label: string;
  columnKey?: string;
  options?: Record<string, any>;
  labelKey?: string;
  valueKey?: string;
  defaultText?: string;
  filterable?: boolean;
  slot?: string;
  filterIconSlot?: string;
  headerSlot?: string;
  prop: string;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  headerAlign?: "left" | "center" | "right";
  fixed?: "left" | "right";
  renderHeader?: (data: { column: any; $index: number }) => VNode;
  renderCell?: (data: { row: any; column: any; $index: number }) => VNode;
  sortable?: boolean | "custom";
  sortMethod?: (a: ReTableRow, b: ReTableRow) => number;
  sortBy?: ((row: any, index: number) => string) | string[] | string;
  sortOrders?: Array<"ascending" | "descending" | null>;
  resizable?: boolean;
  formatter?: (
    row: any,
    column: any,
    cellValue: any,
    index: number
  ) => VNode | string;
  showOverflowTooltip?: boolean;
  className?: string;
  labelClassName?: string;
  selectable?: (row: any, index: number) => boolean;
  reserveSelection?: boolean;
  filters?: ReTableColumnFilters;
  filterPlacement?: ReTableColumnFilterPlacement;
  filterClassName?: string;
  filterMultiple?: boolean;
  filterMethod?: (value: any, row: any, column: any) => boolean;
  filteredValue?: string[];
}

export interface ReTableProps extends CustomPaginationProps {
  pagination?: boolean;
  rowKey?: string;
  emptyText?: string;
  columns?: ReTableColumn[];
  data: ReTableRow[];
  stripe?: boolean;
  border?: boolean;
  reversePageAfterSort?: boolean;
  customFilters?: ReTableCustomFilter[];
  gutter?: "default" | "small" | "medium";
}

export interface ReTableEmits extends CustomPaginationEmits {
  (e: "sort-change", data: ReTableSortColumn): void;
  (e: "filter-change", newFilters: ReTableFilterColumn): void;
}

export interface RePageTableProps {
  // extends ReTableProps
  fullscreenTarget?: any;
  defaultGutter?: "medium" | "default" | "small";
  defaultSize?: "large" | "default" | "small";
  defaultBorder?: boolean;
  defaultStripe?: boolean;
  defaultResizable?: boolean;
  showResizeIcon?: boolean;
  showGutterIcon?: boolean;
  showSizeIcon?: boolean;
  showBorderIcon?: boolean;
  showStripeIcon?: boolean;
  showFullscreenIcon?: boolean;
  showSettingIcon?: boolean;
  showRefreshIcon?: boolean;
  defaultMinWidth?: string | number;
  data: ReTableProps["data"];
  columns: RePageTableColumn[];
}

export interface RePageTableColumn extends ReTableColumn {
  fixedShow?: boolean;
  defaultShow?: boolean;
  ignoreResizable?: boolean;
}

export interface RePageTableEmits {
  // extends ReTableEmits
  (e: "refresh" | "reset"): void;
}

export interface ReEditTableProps {
  // extends ReTableProps
  size?: "large" | "default" | "small";
  createNew?: () => ReTableRow;
  showAddBtn?: boolean;
  addBtnPosition?: "top" | "bottom";
  addBtnProps?: Partial<ButtonProps>;
  addBtnDisabled?: boolean;
  according?: boolean;
  pageSize?: CustomPaginationProps["pageSize"];
  disabled?: boolean;
  editable?: boolean;
  confirmBeforeDelete?: boolean;
  confirmMessage?: string;
  editTrigger?: "cell" | "row" | "custom";
  renderAction?: boolean;
  pagination?: boolean;
  data: ReTableProps["data"];
  columns: ReEditTableColumn[];
  rowKey?: string;
  stripe?: boolean;
  ignoreCellValid?: boolean; // 忽略单元格自己校验
  scrollToError?: boolean;
  scrollIntoViewOptions?: boolean | Record<string, any>;
  maxHeight?: number; // 表格高度，开启虚拟滚动指定，未制定按行高和默认页大小计算
  virtual?: boolean; //开启虚拟滚动 - 自动不换行
  virtualStartIndex?: number; // 虚拟滚动起始索引
  virtualEndIndex?: number; // 虚拟滚动起始索引
}

export interface ReEditTableColumn extends ReTableColumn {
  required?: boolean; // 必填头部提示
  editable?: boolean; // 字段是否可编辑 - 若可编辑-comp需要配置全局
  defaultValue?: any;
  defaultText?: string;
  comp?: string; // 表单控件
  childComp?: string; // type = "comp" 生效，表单字段控件需要选项组，子组件所使用组件
  props?: Record<string, any>; // 表单控件属性配置
  events?: Record<string, Function>; // 表单控件事件监听
  rules?: Arrayable<FormItemRule>; // 表单字段校验规则
  modelProp?: string; // 表单字段控件v-model关联属性： modelValue
  modelEvent?: string; // 表单字段控件v-model关联事件：update:modelValue
}

export interface ReEditTableEmits {
  // extends ReTableEmits
  (
    e: "cell-dblclick" | "cell-contextmenu",
    row: any,
    column: any,
    cell: HTMLTableCellElement,
    event: Event
  ): void;
  (
    e: "row-dblclick" | "row-contextmenu",
    row: any,
    column: any,
    event: Event
  ): void;
  (e: "cell-change", row: any, column: any, value: any, index: number): void;
  (e: "scroll-to", index: number, callback?: Function);
}

export interface ReVirtualEditTableProps extends Partial<ReTableVirtualProps> {
  data: ReTableProps["data"];
  columns: ReEditTableColumn[];
  size?: ReEditTableProps["size"];
  editable?: ReEditTableProps["editable"];
  editTrigger?: ReEditTableProps["editTrigger"];
  maxHeight?: number; // 表格高度，开启虚拟滚动指定，未制定按行高和默认页大小计算
  previewRows?: number; // 开启虚拟滚动，前后预加载数量
  skeleton?: boolean; // 开启虚拟滚动，开启css骨架屏
}

export interface ReTableVirtualProps {
  data: any[];
  pageSize: CustomPaginationProps["pageSize"];
  defaultRowHeight: number;
  rowHeight: number | ((index: number) => number);
  maxHeight?: number; // 表格高度，开启虚拟滚动指定，未制定按行高和默认页大小计算
  previewRows?: number; // 开启虚拟滚动，前后预加载数量
  skeleton?: boolean; // 开启虚拟滚动，开启css骨架屏
}

export interface ReTableVirtualReturn {
  startIndex: Ref<number>;
  endIndex: Ref<number>;
  maxHeight: Ref<number>;
  scrollToIndex: CustomVirtualScrollIndex;
}
