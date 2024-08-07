import type { Arrayable } from "@vueuse/core";
import type { ButtonProps, ElTooltipProps, FormItemRule } from "element-plus";
import type { MaybeRef } from "vue";
import type { ElForm } from "element-plus";

import type { ReGridResponsive } from "@/hooks/useGridResponsive";

export { ReGridResponsive };
export interface ReFormProps {
  /**获取ElForm的ref方法 */
  formRef?: (form: InstanceType<typeof ElForm> | null) => void;
  /**表单项配置内容 */
  items: ReFormItem[];
  /**绑定表单数据-用于数据同步 */
  modelValue?: ReFormModelValue;
  /**表单栅格列数 */
  cols?: number | ReGridResponsive;
  /**表单栅格列间距 */
  colGap?: number;
  /**表单尺寸 */
  size?: "large" | "default" | "small";
  /**表单是否禁用 */
  disabled?: boolean;
  /**表单是否可编辑/只读 */
  editable?: boolean;
  /**表单校验失败是否自动滚动到第一个error字段位置 */
  scrollToError?: boolean;
  /**是否忽略表单按钮组标签宽度 */
  ignoreBtnLabel?: boolean;
  /**表单按钮组栅格占比 */
  btnSpan?: number | ReGridResponsive;
  /**表单按钮组内联样式 */
  btnSpanStyle?: string;
  /**表单按钮组-提交按钮文字 */
  submitBtnText?: string;
  /**表单按钮组-取消按钮文字 */
  cancelBtnText?: string;
  /**表单按钮组-提交按钮自定义属性 */
  submitBtnProps?: ButtonProps;
  /**表单按钮组-取消按钮自定义属性 */
  cancelBtnProps?: ButtonProps;
  /**表单默认提示语自定义样式 */
  tooltipProps?: ElTooltipProps;
  /**分组表单校验失败是否自动展开分组 */
  autoCollapseInValidate?: boolean;
  /**隐藏表单按钮组 */
  hideBtns?: boolean;
  /**只读情况下空内容展示占位 */
  emptyText?: string;
  /**表单提交远程请求方法 */
  request?: (model: Record<string, any>) => Promise<any>;
}

export interface ReFormEmits {
  (
    e: "change",
    field: string,
    value: any,
    model: MaybeRef<ReFormModelValue>
  ): void;
  (e: "update:modelValue", model: MaybeRef<ReFormModelValue>): void;
  (e: "submit", model?: Record<string, any>): void;
  (e: "cancel"): void;
  (e: "success" | "error", res: unknown): void;
}

export interface ReFormItem extends ReFormGroupItem {
  type?: "text" | "comp" | "group"; // 字段类型 text-纯文本字段; comp-表单控件字段; group-表单字段组合，默认 comp
  label?: string; // 表单字段标签名
  field: string; // 表单字段名
  labelWidth?: number; // 表单字段标签名宽度，默认继承el-form配置
  labelPosition?: string; // 表单字段标签名位置，默认继承el-form配置
  customClass?: string; // form-item样式类
  controlClass?: string; // 控件样式
  span?: number | ReGridResponsive; // 表单字段栅格占比
  defaultValue?: any; // 表单字段默认值
  tooltip?: string; // 问号提示语
  tips?: string; // 表单控件下方提示
  tipsClass?: string; // 表单控件下方提示样式类 - 颜色
  comp?: string; // type = "comp" 生效，表单字段控件名（必须是全局组件，非全局组件请使用插槽渲染）
  childComp?: string; // type = "comp" 生效，表单字段控件需要选项组，子组件所使用组件
  options?: ReFormItemOption[]; // 表单字段控件需要选项组，如 select -》 option，checkbox-group -》 checkbox 等需要指定
  labelKey?: string; // 选项组选项标签名字段
  valueKey?: string; // 选项组选项主键字段
  rules?: Arrayable<FormItemRule>; // 表单字段校验规则
  modelProp?: string; // 表单字段控件v-model关联属性： modelValue
  modelEvent?: string; // 表单字段控件v-model关联事件：update:modelValue
  props?: Record<string, any>; // 表单控件属性配置
  events?: Record<string, Function>; // 表单控件事件监听
  children?: ReFormItem[]; // 表单字段组
  slot?: string; // 自定义插槽
  labelSlot?: string; // 字段名插槽
  visible?: boolean | ReFormItemVisibleRule | ReFormItemVisibleRuleCondition; // 表单字段是否可见
}

export interface ReFormGroupItem {
  groupSlots?: [string[], string[]]; // 组内所有插槽名
  groupSlot?: string; // 折叠面板插槽
  defaultCollapsed?: boolean; // type = group 有效，默认是否展开
  collapsedText?: string | [string] | [string, string];
  collapsedTriggerProps?: Partial<ButtonProps>;
  collapsedTriggerIndex?: boolean;
}

export interface ReFormItemOption {
  [key: string]: any;
}

export interface ReFormItemVisibleRule {
  type: "&" | "|"; // 多个匹配条件逻辑关系
  conditions: ReFormItemVisibleRuleCondition[]; // 多个匹配条件
}

export interface ReFormItemVisibleRuleCondition {
  field: string; // 关联字段名
  value: any; // 关联字段值 formData[field] 与 value的比较 formData[field].includes(value)
  ignoreCase?: boolean;
  type?: // 关联字段判断方式 =(等于)，!(非)，.(包含)，^(开头)，$(结尾)，&(全部匹配)，｜(部分匹配)
  "=" | "!=" | "." | "!." | "^=" | "=$" | "!^=" | "!=$" | "&." | "!&." | "|.";
}

export type ReFormModelValue = Record<string, any>;
export type ReFormRules = Record<string, Arrayable<FormItemRule>>;
