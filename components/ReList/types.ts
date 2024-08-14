import type { VNode } from "vue";
import type { ButtonProps } from "../ReDialog";
import type { ReGridResponsive } from "@/hooks/useGridResponsive/types";
import type {
  CustomPaginationProps,
  CustomPaginationEmits
} from "@/hooks/usePagination";
import type {
  CustomScrollPaginationEmits,
  CustomScrollPaginationProps
} from "@/hooks/useScrollPagination/types";
import type { CustomVirtualScrollProps } from "@/hooks/useVirtualScroll";

export interface ReListProps {
  checks: Array<string | number>;
  title?: string;
  rowKey?: string;
  split?: boolean;
  loading?: boolean;
  border?: boolean;
  rowClassName?: string;
  customClass?: string;
  hover?: boolean;
  expandable?: boolean;
  checkable?: boolean;
  ghost?: boolean;
  grid?: number | ReGridResponsive;
  gutter?: number | [number] | [number, number];
  type?: "card" | "list";
  actionPosition?: "default" | "card-footer";
  avatarPosition?: "left" | "right";
  avatarHideInExpanded?: boolean;
  itemHeight?: number;
  itemLayout?: "vertical" | "horizontal";
  items?: Record<string, any>[];
  metas?: ReListItemMetas;
}

export interface ReCustomListProps
  extends Pick<
    ReListProps,
    "title" | "checks" | "loading" | "items" | "metas"
  > {}
export interface RePageListProps
  extends Omit<CustomPaginationProps, "data">,
    ReCustomListProps {}

export interface ReScrollListProps
  extends Omit<CustomScrollPaginationProps, "data"> {
  height?: string | number;
  loadingText?: string;
  loadingPosition?: "default" | "footer";
  loadBtnText?: string;
  loadBtnProps?: Partial<ButtonProps>;
  items: ReListProps["items"];
  title: ReListProps["title"];
  metas: ReListProps["metas"];
}

export interface ReVirtualScrollListProps
  extends Omit<ReScrollListProps, "height" | "pageSize">,
    Omit<ReVirtualListProps, "height" | "pageSize"> {
  height: string | number;
  pageSize?: number;
  type?: "card" | "list";
  gutter?: number | [number] | [number, number];
}

export interface ReScrollListEmits extends CustomScrollPaginationEmits {
  (e: "update:items", items: ReListProps["items"]): void;
}
export interface RePageListEmits extends CustomPaginationEmits {
  (e: "update:items", items: ReListProps["items"]): void;
}

export interface ReVirtualScrollListEmits extends CustomScrollPaginationEmits {
  (e: "update:items", items: ReListProps["items"]): void;
}

export interface ReListProvide extends Partial<ReListProps> {
  listRef?: HTMLDivElement | null;
}

export interface ReListItemProps {
  item: Record<string, any>;
  metas: ReListItemMetas;
}

export interface ReListItemMetas {
  avatar?: ReListItemMeta;
  title?: ReListItemMeta;
  subTitle?: ReListItemMeta;
  content?: ReListItemMeta;
  description?: ReListItemMeta;
  actions?: ReListItemAction[];
}

export interface ReListItemAction {
  text?: string;
  props?: Partial<ButtonProps>;
  render?: (item: ReListItemProps["item"], expanded?: boolean) => VNode;
  events?: ReListItemMeta["events"];
}

export interface ReListItemMeta {
  dataIndex?: string;
  customClass?: string;
  style?: string;
  render?: (item: ReListItemProps["item"], expanded?: boolean) => VNode;
  events?: Record<string, Function>;
}

export interface ReVirtualListProps
  extends Partial<Omit<CustomVirtualScrollProps, "data">> {
  height: string | number;
  skeleton?: boolean;
  rowHeight: number;
  title: ReListProps["title"];
  items: ReListProps["items"];
  grid?: ReListProps["grid"];
  type?: "card" | "list";
  gutter?: number | [number] | [number, number];
}
