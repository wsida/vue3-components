export interface CustomScrollPaginationProps {
  scrollTarget?: Element | (() => Element);
  pageSize?: number;
  total?: number;
  autoRemote?: boolean;
  firstRemote?: boolean;
  remote?: boolean;
  remoteMethod?: (params: {
    currentPage: number;
    pageSize: number;
  }) => Promise<any>;
  data: Record<string, any>[];
  offsetBottom?: number;
  dataResponsive?: boolean;
  debounce?: number;
  revertAfterRefresh?: boolean;
  trigger?: "scroll" | "custom";
}

export interface CustomScrollPaginationEmits {
  (e: "scroll" | "update:total", val: number): void;
  (e: "scroll-bottom"): void;
  (e: "update:modelValue", value: Record<string, any>[]): void;
}
