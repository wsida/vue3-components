import type { MaybeRef, Ref } from "vue";
export type CustomVirtualScrollIndex = (
  index: number,
  callback?: Function
) => void;

export interface CustomVirtualScrollProps {
  scrollTarget: Element | (() => Element);
  offsetTop?: number;
  data: MaybeRef<any[]>;
  pageSize: MaybeRef<number>;
  rowHeight: number | ((index: number) => number);
  previewRows: MaybeRef<number>;
  cols?: MaybeRef<number>; // 多列计算
  debounce?: number;
}

export interface CustomVirtualScrollReturn {
  scrollTop: Ref<number>;
  startIndex: Ref<number>;
  endIndex: Ref<number>;
  startPadding: Ref<number>;
  endPadding: Ref<number>;
  calcScrollTop: () => void;
  scrollTo: (top: number) => void;
  scrollToIndex: CustomVirtualScrollIndex;
}
