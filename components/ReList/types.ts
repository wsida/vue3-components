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

export interface ReListProps {
  title?: string;
  modelValue?: Array<string | number>;
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
  avatarHideInExpanded?: boolean;
  itemLayout?: "vertical" | "horizontal";
  items?: Record<string, any>[];
  metas?: ReListItemMetas;
}

export interface ReCustomListProps
  extends Pick<
    ReListProps,
    "title" | "modelValue" | "loading" | "items" | "metas" | "loading"
  > {}
export interface RePageListProps
  extends Omit<CustomPaginationProps, "data">,
    ReCustomListProps {}

export interface ReScrollListProps
  extends Omit<CustomScrollPaginationProps, "data">,
    ReCustomListProps {
  height?: number | string;
  loadingText?: string;
  loadingPosition?: "default" | "footer";
  loadBtnText?: string;
  loadBtnProps?: Partial<ButtonProps>;
}

export interface ReScrollListEmits extends CustomScrollPaginationEmits {
  (e: "update:items", items: ReListProps["items"]): void;
}
export interface RePageListEmits extends CustomPaginationEmits {
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

export interface ReVirtualListProps {}
