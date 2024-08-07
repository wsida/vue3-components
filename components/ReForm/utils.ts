import { type MaybeRef, unref } from "vue";
import type {
  ReFormItem,
  ReFormModelValue,
  ReFormItemVisibleRule,
  ReFormItemVisibleRuleCondition,
  ReFormRules,
  ReGridResponsive
} from "./types";
import { cloneDeep, isUndefined, isString, isArray } from "lodash-es";
import {
  DEFAULT_FORM_ITEM_CFG,
  HAS_CHILD_COMPONENT_MAP,
  DEFAULT_COLLAPSED_TEXT,
  DEFAULT_TEXTAREA_ROWS
} from "./constants";
import { normalizeGridResponsive } from "@/hooks/useGridResponsive";

export function unwrapperShadowRef(data: MaybeRef<ReFormModelValue>) {
  const model = unref(data);
  const keys = Object.keys(model);
  for (const key of keys) {
    model[key] = unref(model[key]);
  }
  return cloneDeep(model);
}

export function getSlotsNames(items: ReFormItem[]): [string[], string[]] {
  const slotNames: string[] = []; // 命名插槽
  const slotScopedNames: string[] = []; // 作用域插槽
  const travelSlots = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      if (item.type === "group") {
        if (item.groupSlot) {
          slotNames.push(item.groupSlot);
        }
        if (isArray(item.children)) {
          travelSlots(item.children);
        }
      } else {
        if (item.slot) {
          slotScopedNames.push(item.slot);
        }
        if (item.labelSlot) {
          slotNames.push(item.labelSlot);
        }
      }
    }
  };

  travelSlots(items);

  return [slotScopedNames, slotNames];
}

/**
 * 规范化表单配置
 * @param items 表单配置
 * @returns 表单配置
 */
export function normalizeFormItems(
  items: ReFormItem[],
  span?: number | ReGridResponsive
): ReFormItem[] {
  // defaultKeys: type labelKey valueKey modelProp modelEvent events{[modelEvent]}
  const travel = (nodes: ReFormItem[]) => {
    return nodes.map((item: ReFormItem) => {
      const formItem = cloneDeep({
        ...DEFAULT_FORM_ITEM_CFG,
        ...item
      }) as ReFormItem;

      if (!isUndefined(span) && isUndefined(item.span)) {
        formItem.span = span;
      }

      // 格式化响应栅格
      formItem.span = normalizeGridResponsive(formItem.span);

      if (formItem.type === "group") {
        formItem.collapsedTriggerProps = {
          link: true,
          type: "primary",
          ...(unref(formItem.collapsedTriggerProps) || {})
        };
        formItem.collapsedText = normalizeCollapsedText(formItem.collapsedText);
        formItem.children = travel(
          isUndefined(formItem.children) ? [] : unref(formItem.children)
        );
        if (isUndefined(formItem.collapsedTriggerIndex)) {
          formItem.collapsedTriggerIndex = true;
        }
        // 自动注入插槽
        if (isUndefined(formItem.groupSlot)) {
          formItem.groupSlot = `${formItem.field}-group`;
        }
        formItem.groupSlots = getSlotsNames(formItem.children);
      } else {
        if (isUndefined(formItem.labelSlot)) {
          formItem.labelSlot = `${formItem.field}-label`;
        }
      }

      if (formItem.type === "comp") {
        if (!isUndefined(HAS_CHILD_COMPONENT_MAP[formItem.comp])) {
          if (isUndefined(formItem.childComp)) {
            formItem.childComp = HAS_CHILD_COMPONENT_MAP[formItem.comp];
          }
        }
        if (formItem.comp === "el-textarea" || formItem.comp === "textarea") {
          if (isUndefined(formItem.props)) {
            formItem.props = { rows: DEFAULT_TEXTAREA_ROWS };
          } else if (
            isUndefined(formItem.props.rows) &&
            isUndefined(formItem.props.autosize)
          ) {
            formItem.props.rows = DEFAULT_TEXTAREA_ROWS;
          }
        }
      }

      return formItem;
    });
  };
  return travel(unref(items));
}

/**
 * 初始化表单数据
 * @param items 表单配置
 * @param defaultValue 默认值
 * @returns 表单数据
 */
export function normalizeFormModelValue(
  items: MaybeRef<ReFormItem[]>,
  defaultValue?: MaybeRef<ReFormModelValue>
): ReFormModelValue {
  const modelValue: ReFormModelValue = {};

  const travel = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      if (item.type !== "group") {
        modelValue[item.field] = isUndefined(defaultValue)
          ? cloneDeep(unref(item.defaultValue))
          : cloneDeep(unref(defaultValue)[item.field]);
      } else if (Array.isArray(item.children)) {
        travel(unref(item.children));
      }
    }
  };
  travel(unref(items));
  return modelValue;
}

export function normalizeFormRules(items: MaybeRef<ReFormItem[]>): ReFormRules {
  const rules: ReFormRules = {};

  const travel = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      if (item.type !== "group") {
        if (!isUndefined(item.rules)) {
          rules[item.field] = unref(item.rules);
        }
      } else if (Array.isArray(item.children)) {
        travel(unref(item.children));
      }
    }
  };
  travel(unref(items));
  return rules;
}

/**
 * 初始化表单数据
 * @param items 表单配置
 * @param defaultValue 默认值
 * @returns 表单数据 / 表单校验规则
 */
export function normalizeFormValueAndRules(
  items: MaybeRef<ReFormItem[]>,
  defaultValue?: MaybeRef<ReFormModelValue>
) {
  const modelValue: ReFormModelValue = {};
  const rules: ReFormRules = {};

  const travel = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      if (item.type !== "group") {
        modelValue[item.field] = isUndefined(defaultValue)
          ? cloneDeep(unref(item.defaultValue))
          : cloneDeep(unref(defaultValue)[item.field]);
        if (!isUndefined(item.rules)) {
          rules[item.field] = unref(item.rules);
        }
      } else if (Array.isArray(item.children)) {
        travel(unref(item.children));
      }
    }
  };
  travel(unref(items));

  return { modelValue, rules };
}

/**
 * 获取表单字段组默认展开状态
 * @param items 表单配置
 * @returns 表单折叠状态 / 分组依赖反转字段路径-用于校验失败自动展开定位
 */
export function normalizeCollapsed(items: MaybeRef<ReFormItem[]>) {
  const collapsedStatus: Record<string, boolean> = {};
  const groupDependency: Record<string, string[]> = {};
  const travel = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      if (item.type === "group") {
        collapsedStatus[item.field] = !!item.defaultCollapsed || false;
        if (Array.isArray(item.children)) {
          for (const child of item.children) {
            if (isUndefined(groupDependency[item.field])) {
              groupDependency[child.field] = [item.field] as string[];
            } else {
              groupDependency[child.field] = [
                item.field,
                ...groupDependency[item.field]
              ] as string[];
            }
          }
          travel(unref(item.children));
        }
      }
    }
  };

  travel(unref(items));

  return { collapsedStatus, groupDependency };
}

export function normalizeCollapsedText(
  collpasedText?: ReFormItem["collapsedText"]
): [string, string] {
  const text: [string, string] = ["", ""];
  if (isUndefined(collpasedText)) {
    text[0] = DEFAULT_COLLAPSED_TEXT[0];
    text[1] = DEFAULT_COLLAPSED_TEXT[1];
  } else if (isString(collpasedText)) {
    text[0] = text[1] = collpasedText;
  } else if (isArray(collpasedText)) {
    text[0] = collpasedText[0] || DEFAULT_COLLAPSED_TEXT[0];
    text[1] = collpasedText[1] || text[0];
  }
  return text;
}

/**
 * 表单元素可视控制
 * @param item 表单元素
 * @param formData 表单数据
 * @returns
 */
export function normalizeVisible(
  items: MaybeRef<ReFormItem[]>,
  formData: MaybeRef<ReFormModelValue>
): Record<string, boolean> {
  const visible: Record<string, boolean> = {};
  const travel = (nodes: ReFormItem[]) => {
    for (const item of nodes) {
      visible[item.field] = normalizeItemVisible(item, formData);
      if (item.type === "group" && Array.isArray(item.children)) {
        travel(item.children);
      }
    }
  };
  travel(unref(items));
  return visible;
}

export function normalizeItemVisible(
  item: ReFormItem,
  formData: MaybeRef<ReFormModelValue>
): boolean {
  if (isUndefined(item.visible)) return true;
  if (typeof item.visible === "boolean") return item.visible;
  const visibleRule = normalizeVisibleRule(item.visible);
  return validateVisible(visibleRule, formData);
}

export function normalizeVisibleRule(
  rule: ReFormItemVisibleRule | ReFormItemVisibleRuleCondition
): ReFormItemVisibleRule {
  if (isUndefined((rule as ReFormItemVisibleRule).conditions)) {
    return {
      type: "|",
      conditions: [
        { ...rule, type: rule.type || "=" } as ReFormItemVisibleRuleCondition
      ]
    };
  }
  return rule as ReFormItemVisibleRule;
}

export function validateVisible(
  rule: ReFormItemVisibleRule,
  formData: MaybeRef<ReFormModelValue>
): boolean {
  const method = rule.type === "&" ? "every" : "some";
  return rule.conditions[method](
    (condition: ReFormItemVisibleRuleCondition): boolean => {
      const { field, value, type, ignoreCase = false } = condition;
      return customCompare(
        type,
        unref(formData[field]),
        unref(value),
        ignoreCase
      );
    }
  );
}

export function ignoreCaseFunc(value: any): any {
  return isArray(value)
    ? value.map(val => (isString(val) ? val.toLowerCase() : val))
    : isString(value)
      ? value.toLowerCase()
      : value;
}

export function customCompare(
  type: ReFormItemVisibleRuleCondition["type"],
  value: any,
  filterValue: any,
  ignoreCase = false
): boolean {
  let flag = true;
  if (ignoreCase) {
    value = ignoreCaseFunc(value);
    filterValue = ignoreCaseFunc(filterValue);
  }
  switch (type) {
    case "=": // 等于
      flag = value === filterValue;
      break;
    case "!=": // 不等
      flag = value !== filterValue;
      break;
    case ".": // 在集合
      flag = filterValue.includes?.(value);
      break;
    case "!.": // 不在集合
      flag = !filterValue.includes?.(value);
      break;
    case "&.": // 包含 - 两个数组
      flag = value.every((val: any) => filterValue.includes(val));
      break;
    case "!&.": // 没有交集 - 两个数组
      flag = !value.every((val: any) => filterValue.includes(val));
      break;
    case "|.": // 交集 - 两个数组
      flag = value.some((val: any) => filterValue.includes(val));
      break;
    case "^=": // 开头
      flag = value.startsWith?.(filterValue);
      break;
    case "!^=": // 不以...开头
      flag = !value.startsWith?.(filterValue);
      break;
    case "=$": // 结尾
      flag = value.endsWith?.(filterValue);
      break;
    case "!=$": // 不以...结尾
      flag = !value.endsWith?.(filterValue);
      break;
    default:
  }

  return flag;
}
