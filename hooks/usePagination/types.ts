import type { MaybeRef } from "vue";
import type { PaginationProps } from "element-plus";

export interface CustomPaginationProps {
  pageSize?: number;
  currentPage?: number;
  total?: number;
  paginationProps?: Partial<Writable<PaginationProps>>;
  autoRemote?: boolean;
  firstRemote?: boolean;
  remote?: boolean;
  filters?: MaybeRef<Record<string, any>>;
  sorts?: MaybeRef<Record<string, any>>;
  dataResponsive?: boolean;
  remoteMethod?: (
    params: {
      currentPage: number;
      pageSize: number;
    },
    filters?: Record<string, any>,
    sorts?: Record<string, any>
  ) => Promise<any>;
  resetCurrentPage?: boolean;
  data: MaybeRef<Record<string, any>[]>;
}

export interface CustomPaginationEmits {
  (
    e: "update:pageSize" | "update:currentPage" | "update:total",
    value: number
  ): void;
  (e: "update:modelValue", value: Record<string, any>[]): void;
}
