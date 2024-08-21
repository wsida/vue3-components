import type { ButtonProps } from "element-plus";

export interface ReTagListProps {
  modelValue?: string[] | number[];
  valueKey?: string;
  labelKey?: string;
  tags: string[] | Record<string, any>[];
  size?: "default" | "small" | "large";
  tagType?: "primary" | "info" | "success" | "warning" | "danger";
  tagEffect?: "light" | "dark" | "plain";
  checkable?: boolean;
  editable?: boolean;
  inputResponsive?: boolean;
  autoAdd?: boolean;
  beforeAdd?: (label: string) => boolean;
  createNew?: (label: string) => string | Record<string, any>;
  debounce?: number;
  gap?: number;
  buttonText?: string;
  buttonProps?: Partial<ButtonProps>;
  // addable?: boolean;
  // clearable?: boolean;
}

export interface ReTagListEmits {
  (e: "add" | "input", label: string): void;
  (
    e: "check",
    checked: boolean,
    value: string | number,
    tag: string | Record<string, any>
  ): void;
  (e: "close", value: string | number, tag: string | Record<string, any>): void;
  (e: "update:modelValue" | "change", value: string[] | number[]): void;
  (e: "update:tags", value: string[] | Record<string, any>[]): void;
}
