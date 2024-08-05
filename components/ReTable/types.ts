import type {
  CustomPaginationProps,
  CustomPaginationEmits
} from "@/hooks/usePagination";
import type { VNode } from "vue";

export interface ReTableSortColumn {
  column: any;
  prop: string;
  order: any;
}
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

export interface RePageTableProps extends ReTableProps {
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
