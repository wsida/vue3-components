import { DEFAULT_FORM_GRID_RESPONSIVE } from "@/hooks/useGridResponsive";

export const DEFAULT_FORM_ITEM_CFG = {
  type: "comp",
  span: DEFAULT_FORM_GRID_RESPONSIVE, // 应该同Form的cols，默认占满一行
  labelKey: "label",
  valueKey: "value",
  modelProp: "modelValue",
  modelEvent: "update:modelValue"
};

export const DEFAULT_COLLAPSED_TEXT = ["展开", "收起"];
export const DEFAULT_TEXTAREA_ROWS = 3;
export const HAS_CHILD_COMPONENT_MAP = {
  "el-select": "el-option",
  "el-radio-group": "el-radio",
  "el-checkbox-group": "el-checkbox"
};
