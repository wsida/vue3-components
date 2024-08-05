import { isUndefined, isEmpty, isArray } from "lodash-es";
import type {
  ReTableColumn,
  ReTableCustomFilter,
  ReTableFilterColumn,
  ReTableProps,
  ReTableRow,
  ReTableSortColumn
} from "../types";
import { customCompare } from "@/components/ReForm/utils";
import { unref } from "vue";

export function defaultSortTable(
  data: ReTableProps["data"],
  sortTarget: ReTableSortColumn
): ReTableProps["data"] {
  const newData = [...data];
  if (!sortTarget || !sortTarget.order) return newData;
  const column = sortTarget.column;
  let prop = sortTarget.prop;
  let order = sortTarget.order;
  if (!order) return newData;
  // 忽略sort-by
  // sort-method 默认按生序处理
  if (!isUndefined(column.sortMethod)) {
    newData.sort(column.sortMethod);
  } else {
    const defaultSortFunc = (a: ReTableRow, b: ReTableRow): number => {
      let av = a[prop];
      let bv = b[prop];
      if (isUndefined(av)) return -1;
      if (isUndefined(bv)) return 1;
      if (typeof av === "string" || typeof bv === "string") {
        // 将数字转换为字符串以便进行字符串比较
        av = String(av);
        bv = String(bv);
      }
      // 比较数值或字符串
      return av < bv ? -1 : av > bv ? 1 : 0;
    };
    newData.sort(defaultSortFunc);
  }
  return order === "ascending" ? newData : newData.reverse();
}

// 表头过滤比较方法
export function defaultFilterFunc(
  filterValue: any,
  row: any,
  prop: string
): boolean {
  const value = row[prop];
  if (!filterValue || !filterValue.length) return true;
  return isArray(filterValue)
    ? filterValue.includes(value)
    : filterValue === value;
}

/**
 * 表头自带过滤器过滤方法
 * @param filterTarget
 * @param row
 * @param columns
 * @returns
 */
export function defaultDoFilterFunc(
  filterTarget: ReTableFilterColumn,
  row: ReTableRow,
  columns: ReTableColumn[]
): boolean {
  const filterProps = Object.keys(filterTarget);
  if (!filterProps.length) return true;
  return filterProps.every((prop: string) => {
    const column = columns.find(
      (column: ReTableColumn) => column.columnKey === prop
    );
    if (!column) return true;
    if (!isUndefined(column.filterMethod))
      return column.filterMethod(filterTarget[prop], row, column);
    return defaultFilterFunc(filterTarget[prop], row, prop);
  });
}

/**
 * 自定义条件过滤方法
 * @param customFilters
 * @param row
 */
export function defaultDoCustomFilterFunc(
  customFilters: ReTableCustomFilter[],
  row: ReTableRow
) {
  return customFilters.every((filter: ReTableCustomFilter) => {
    const { prop, value, ignoreCase = false, type = "^=" } = filter;
    return customCompare(type, unref(row[prop]), unref(value), ignoreCase);
  });
}

export function defaultFilterTable(
  data: ReTableProps["data"],
  filterTarget: ReTableFilterColumn,
  customFilters: ReTableCustomFilter[],
  columns: ReTableColumn[]
): ReTableProps["data"] {
  const newData = [...data];
  const noFilters = !filterTarget || isEmpty(filterTarget);
  const noCustomFilters = !customFilters || isEmpty(customFilters);
  if (noFilters && noCustomFilters) return newData;

  return newData.filter((row: ReTableRow) => {
    const filterFlag = !noFilters
      ? defaultDoFilterFunc(filterTarget, row, columns)
      : true;

    const customFilterFlag = !noCustomFilters
      ? defaultDoCustomFilterFunc(customFilters, row)
      : true;

    return filterFlag && customFilterFlag;
  });
}
