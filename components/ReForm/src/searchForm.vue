<template>
  <div class="ap-search-form">
    <ReForm
      ref="innerFormRef"
      v-model="localFormData"
      v-bind="localFormProps"
      @change="handleFormFieldChange"
    >
      <template v-for="slotName in slotsNames[0]" #[slotName]="slotScoped">
        <slot :name="slotName" v-bind="slotScoped" />
      </template>
      <template v-for="slotName in slotsNames[1]" #[slotName]>
        <slot :name="slotName" />
      </template>
      <template #btns>
        <slot name="btns">
          <el-button
            v-bind="searchBtnProps"
            :disabled="localSubmiting || searchBtnProps?.disabled"
            :type="searchBtnProps?.type ?? 'primary'"
            @click="handleSearch"
            >{{ searchBtnText }}</el-button
          >
          <el-button v-bind="resetBtnProps" @click="handleReset">{{
            resetBtnText
          }}</el-button>
          <ReCollapsedBtn
            v-if="localShowCollapsedBtn"
            v-model="localCollapsed"
            :disabled="disabledCollapsedBtn"
            :collapsedText="localCollapsedText"
          />
        </slot>
      </template>
    </ReForm>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  unref,
  useAttrs,
  nextTick,
  watch
} from "vue";
import ReForm from "./index.vue";
import ReCollapsedBtn from "../../ReCollapsedBtn/index.vue";
import useForm from "./useForm";
import useGridCols from "./useGridCols";
import {
  getSlotsNames,
  unwrapperShadowRef,
  normalizeCollapsedText
} from "../utils";
import { matchResponsive } from "@/hooks/useGridResponsive";
import { isUndefined, cloneDeep } from "lodash-es";
import type { ReFormItem, ReFormProps, ReGridResponsive } from "../types";
import type { MaybeRef } from "vue";
import type { ButtonProps, FormProps } from "element-plus";

type FormModelValue = ReFormProps["modelValue"];
interface ExtendFormProps
  extends UnwrapperReadonly<
      Omit<FormProps, "model" | "rules" | "disabled" | "size" | "scrollToError">
    >,
    ReFormProps {}

defineOptions({
  name: "ReSearchForm",
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<{
    cols?: ReFormProps["cols"];
    colGap?: ReFormProps["colGap"];
    size?: ReFormProps["size"];
    items: ReFormProps["items"];
    modelValue?: ReFormProps["modelValue"]; // 绑定值
    disabled?: ReFormProps["disabled"];
    btnSpan?: ReFormProps["btnSpan"];
    btnAlign?: "left" | "right"; // left-左对齐，right-右对齐
    searchBtnText?: string;
    resetBtnText?: string;
    searchBtnProps?: ButtonProps;
    resetBtnProps?: ButtonProps;
    showCollapsedBtn?: boolean; // 展示折叠/收起按钮
    collapsedText?: ReFormItem["collapsedText"]; // 折叠按钮文字
    collapsedRows?: number; // 折叠收起展示行数
    defaultCollapsed?: boolean; // 初始化默认折叠状态
    showLabel?: boolean; // 隐藏表单字段标签
    showTips?: boolean; // 隐藏表单项tips字段
    autoSearchAfterEnter?: boolean; // 按下回车键粗发查询
    autoSearchAfterReset?: boolean; // 点击重置触发查询
    disabledFormWhenSearch?: boolean;
    autoSearchAfterMounted?: boolean; // 初始化后发起查询
    hideCollapsedBtnWhenNone?: boolean; // 没有字段隐藏时不显示折叠按钮
    loading?: boolean; // 【不推荐】外部加载状态
    request?: ReFormProps["request"];
  }>(),
  {
    cols: 3,
    btnSpan: 1,
    btnAlign: "left",
    searchBtnText: "搜索",
    resetBtnText: "重置",
    showCollapsedBtn: false,
    collapsedText: () => ["展开", "收起"],
    collapsedRows: 1,
    showLabel: false,
    showTips: false,
    defaultCollapsed: true,
    hideCollapsedBtnWhenNone: false,
    autoSearchAfterEnter: false,
    autoSearchAfterReset: true,
    disabledFormWhenSearch: true,
    autoSearchAfterMounted: false
  }
);

const emits = defineEmits<{
  (
    e: "change",
    field: string,
    value: any,
    model: MaybeRef<FormModelValue>
  ): void;
  (e: "update:modelValue", model: MaybeRef<FormModelValue>): void;
  (e: "search", formData: FormModelValue): void;
  (e: "reset"): void;
  (e: "collapsed", collapsed: boolean): void;
}>();

const $attrs = useAttrs();

const localFormData = defineModel("modelValue");

const localCollapsed = ref(props.defaultCollapsed); // 内置折叠状态 - true-折叠，false-展开

const hiddenFields = ref<string[]>([]);
const overflowFields = ref<string[]>([]);

const localCollapsedText = computed(() =>
  normalizeCollapsedText(props.collapsedText)
);

// 简单格式化-去掉‘text’/‘group’类型，以及自动注入span-默认1，不在同cols
const localFormItems = computed(() =>
  // 增加响应变化
  props.items
    .filter((item: ReFormItem) => item.type !== "text" && item.type !== "group")
    .map((item: ReFormItem) => {
      const formItem = cloneDeep(item);
      if (isUndefined(formItem.span)) {
        formItem.span = 1;
      }
      if (!props.showLabel) {
        formItem.label = "";
        formItem.tooltip = "";
      }
      if (!props.showTips) {
        formItem.tips = "";
      }
      if (hiddenFields.value.includes(formItem.field)) {
        formItem.visible = false;
      }
      return formItem;
    })
);

const { submiting, reFormRef, getFormRef, formData, formItems } = useForm(
  localFormItems,
  props.modelValue
);

const localSubmiting = computed(() => submiting.value || props.loading);

const { gridResponsive, responsiveWidth, localBtnSpan } = useGridCols(
  props.cols,
  props.btnSpan
);

const localBtnSpanStyle = computed(() => {
  if (props.btnAlign === "right")
    return `grid-column-start: ${gridResponsive.value - localBtnSpan.value + 1};grid-column-end: span ${localBtnSpan.value}`;
  return `grid-column-start: span ${localBtnSpan}`;
});

const innerFormRef = ref<InstanceType<typeof ReForm> | null>(null);

const localFormProps = computed<ReFormProps>(() => {
  const formProps: Partial<ExtendFormProps> = {
    ...$attrs,
    formRef: getFormRef,
    cols: props.cols,
    colGap: props.colGap,
    size: props.size,
    items: localFormItems.value,
    ignoreBtnLabel: false,
    disabled:
      props.disabled || (props.disabledFormWhenSearch && localSubmiting.value),
    btnSpan: props.btnSpan,
    btnSpanStyle: localBtnSpanStyle.value,
    hideBtns: false
  };
  if (!props.showLabel) {
    formProps.labelWidth = 0;
  }
  return formProps as ReFormProps;
});

const localCollapsedRows = computed(() => Math.max(1, props.collapsedRows));

const disabledCollapsedBtn = computed(
  () =>
    props.showCollapsedBtn &&
    ((localCollapsed.value && !hiddenFields.value.length) ||
      (!localCollapsed.value && !overflowFields.value.length))
);

const localShowCollapsedBtn = computed(
  () =>
    props.showCollapsedBtn &&
    (!props.hideCollapsedBtnWhenNone || !disabledCollapsedBtn.value)
);

const slotsNames = computed<[string[], string[]]>(() =>
  getSlotsNames(unref(formItems))
);

watch(
  () => [
    gridResponsive.value,
    localCollapsedRows.value,
    localBtnSpan.value,
    localCollapsed.value,
    props.showCollapsedBtn
  ], // 暂不考虑items变化-搜索条件配置一般不变
  () => {
    // 计算折叠
    const totalGridCounts = gridResponsive.value * localCollapsedRows.value; // 总盒子数
    const fieldGridCounts = totalGridCounts - localBtnSpan.value;
    let currentGridCounts = 0;
    const calcOverflowFields: string[] = [];
    for (const item of formItems.value) {
      const gridSpan = matchResponsive(
        unref(responsiveWidth),
        item.span as ReGridResponsive
      );
      if (currentGridCounts + gridSpan > fieldGridCounts) {
        calcOverflowFields.push(item.field);
      }
      currentGridCounts = currentGridCounts + gridSpan;
    }

    overflowFields.value = calcOverflowFields;

    if (!props.showCollapsedBtn || !localCollapsed.value) {
      hiddenFields.value = [];
      return;
    }

    hiddenFields.value = calcOverflowFields;
  },
  {
    immediate: true
  }
);

function resetForm() {
  localFormData.value = cloneDeep(formData.value);
}

function handleReset() {
  reFormRef.value && reFormRef.value.resetFields();
  resetForm();
  emits("reset");
  if (props.autoSearchAfterReset) {
    handleSearch();
  }
}

function handleSearch() {
  reFormRef.value &&
    reFormRef.value.validate((valid: boolean) => {
      if (valid) {
        const submitData = cloneDeep(unwrapperShadowRef(localFormData));
        emits("search", submitData);
        if (props.request) {
          submiting.value = true;
          props.request(submitData).finally(() => {
            submiting.value = false;
          });
        }
      }
    });
}

function handleFormFieldChange(
  field: string,
  value: any,
  model: FormModelValue
) {
  emits("change", field, value, model);
}

onMounted(() => {
  localFormData.value = cloneDeep(formData.value);
  nextTick(() => {
    if (props.autoSearchAfterMounted) {
      handleSearch();
    }
  });
});

defineExpose({
  reFormRef,
  innerFormRef,
  localFormData,
  localCollapsed,
  handleSearch,
  handleReset
});
</script>
