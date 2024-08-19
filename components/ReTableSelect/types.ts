import type { ElTooltipProps } from "element-plus";
import type {
  ReTableColumn,
  ReTableCustomFilter,
  ReTableProps,
  ReTableRow
} from "../ReTable/types";
import type { Ref, Component, CSSProperties, MaybeRef } from "vue";

type ExtendReTableProps = Pick<
  ReTableProps,
  | "gutter"
  | "pageSize"
  | "total"
  | "pagination"
  | "stripe"
  | "border"
  | "paginationProps"
  | "firstRemote"
>;

export interface ReTableSelectProps extends ExtendReTableProps {
  size?: "default" | "small" | "large";
  maxHeight?: number;
  data: ReTableRow[];
  columns: ReTableColumn[];
  labelKey?: string;
  valueKey?: ReTableProps["rowKey"];
  modelValue: string | number | string[] | number[];
  multiple?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  collapseTags?: boolean;
  collapseTagsTooltip?: boolean;
  maxCollapseTags?: number;
  showTags?: boolean;
  multipleLimit?: number;
  effect?: "light" | "dark";
  placeholder?: string;
  selectable?: (row: ReTableRow, $index: number) => boolean;
  filterPlaceholder?: string;
  filterable?: boolean;
  filterProps?:
    | string
    | string[]
    | Partial<Omit<ReTableCustomFilter, "value">>
    | Partial<Omit<ReTableCustomFilter, "value">>[];
  remote?: boolean;
  remoteMethod?: (
    params: {
      currentPage: number;
      pageSize: number;
    },
    keyword: string,
    filters?: Record<string, any>,
    sorts?: Record<string, any>
  ) => Promise<any>;
  loading?: boolean;
  loadingText?: string;
  noMatchText?: string;
  noDataText?: string;
  teleported?: boolean;
  clearIcon?: string | Component;
  suffixIcon?: string | Component;
  tagType?: "info" | "success" | "warning" | "danger";
  tagEffect?: "light" | "dark";
  popperOptions?: ElTooltipProps["popperOptions"];
  popperClass?: ElTooltipProps["popperClass"];
  placement?: ElTooltipProps["placement"];
  transition?: ElTooltipProps["transition"];
  showToolbox?: boolean; // 工具栏
  popperStyle?: string | CSSProperties;
  ignoreClass?: (MaybeRef<HTMLElement> | string)[];
  resetParamsAfterHide?: boolean;
  remoteSelected?: Record<string, any> | Record<string, any>[]; // 远程请求数据时初始化回填
  reverseAllAfterSwitch?: boolean;
  hideHeaderCheckAll?: boolean;
  allValue?: string | number;
  collapseTagClosable?: boolean;
}

export interface ReTableSelectEmits {
  (e: "update:modelValue", value: ReTableSelectProps["modelValue"]): void;
  (
    e: "change",
    value: ReTableSelectProps["modelValue"],
    selections: ReTableSelectProps["remoteSelected"]
  ): void;
  (e: "query", params: any, keyword: string, filters?: any, sorts?: any): void;
  (e: "focus" | "blur" | "clear"): void;
  (e: "visible-change", visible: boolean): void;
  (e: "remove-tag", value: number | string, tag: any): void;
}

export interface ReTableSelection
  extends Pick<
    ReTableSelectProps,
    | "size"
    | "multiple"
    | "data"
    | "labelKey"
    | "valueKey"
    | "disabled"
    | "collapseTags"
    | "collapseTagsTooltip"
    | "maxCollapseTags"
    | "effect"
    | "placeholder"
    | "tagType"
    | "tagEffect"
    | "total"
    | "remote"
    | "showTags"
    | "collapseTagClosable"
  > {
  selected: ReTableSelectProps["modelValue"];
  selections: ReTableSelectProps["remoteSelected"];
  selectedAll: boolean;
  hasSelected: boolean;
  selectedCount: number;
  popperClass: string;
}

export interface ReTableSelectPopoverProps
  extends Pick<
      ReTableSelectProps,
      | "gutter"
      | "size"
      | "multiple"
      | "data"
      | "columns"
      | "disabled"
      | "filterable"
      | "filterProps"
      | "remote"
      | "remoteMethod"
      | "loading"
      | "loadingText"
      | "noMatchText"
      | "noDataText"
      | "teleported"
      | "popperOptions"
      | "popperClass"
      | "placement"
      | "transition"
      | "showToolbox"
      | "popperStyle"
      | "maxHeight"
      | "resetParamsAfterHide"
      | "filterPlaceholder"
      | "labelKey"
      | "valueKey"
      | "selectable"
      | "multipleLimit"
      | "hideHeaderCheckAll"
    >,
    ExtendReTableProps {
  selected: ReTableSelectProps["modelValue"];
  selections: ReTableSelectProps["remoteSelected"];
  triggerRef: Ref<HTMLDivElement | null>;
  visible: boolean;
  slotsNames: string[];
  debounce?: number;
  selectedAll: boolean;
}
