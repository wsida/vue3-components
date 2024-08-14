<template>
  <div class="ap-form-wrapper">
    <el-form
      ref="reFormRef"
      class="ap-form"
      :class="{ 'ap-form--readonly': readonly }"
      v-bind="$attrs"
      :model="formDataProxy"
      :rules="formRules"
      :disabled="disabled"
      :size="size"
      :scrollToError="scrollToError"
    >
      <div class="ap-form-grid" :style="gridTemplateStyle">
        <ReFormRenderItems :items="renderFormItems">
          <template v-for="slotName in slotsNames[0]" #[slotName]="slotScoped">
            <slot :name="slotName" v-bind="slotScoped" />
          </template>
          <template v-for="slotName in slotsNames[1]" #[slotName]>
            <slot :name="slotName" />
          </template>
        </ReFormRenderItems>
        <div
          v-if="!hideBtns"
          class="ap-form-grid-item"
          :style="localBtnSpanStyle"
        >
          <el-form-item :label="btnLabelText" :label-width="btnLabelWidth">
            <template v-if="btnLabelText" #label>
              <div style="display: inline-block; width: 1px">
                {{ btnLabelText }}
              </div>
            </template>
            <slot name="btns">
              <el-button
                type="primary"
                :disabled="disabled"
                @click="handleSubmit"
                >{{ submitBtnText }}</el-button
              >
              <el-button @click="handleCancel">{{ cancelBtnText }}</el-button>
            </slot>
          </el-form-item>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, useAttrs } from "vue";
import { ReFormProps, ReFormEmits } from "../types";
import useForm, { useWatchForm } from "./useForm";
import { cloneDeep } from "lodash-es";
import { unwrapperShadowRef, getSlotsNames } from "../utils";
import { unref } from "vue";
import useGridCols from "./useGridCols";
import { nextTick } from "process";
import type { CSSProperties, Ref } from "vue";
import type { Arrayable } from "@vueuse/core";
import type { FormValidateCallback } from "element-plus";

defineOptions({
  name: "ReForm",
  inheritAttrs: false
});

const props = withDefaults(defineProps<ReFormProps>(), {
  // cols: 1,
  colGap: 16,
  size: "default",
  disabled: false,
  editable: true,
  emptyText: "-",
  ignoreBtnLabel: true,
  scrollToError: true,
  autoCollapseInValidate: true,
  submitBtnText: "确定",
  cancelBtnText: "取消"
});

const emits = defineEmits<ReFormEmits>();

const localItems = computed(() => props.items);

const {
  submiting,
  reFormRef,
  formData,
  formRules,
  formItems,
  formVisible,
  formCollapsed,
  formGroupDependency
} = useForm(localItems, props.modelValue, props.cols);

const { renderFormItems, formDataProxy } = useWatchForm(
  formItems,
  formData,
  props,
  emits
);

const $attrs = useAttrs();

// console.log($attrs);
// console.log(formItems);
// console.log(formData);
// console.log(formRules);
// console.log(formCollapsed);
// console.log(formGroupDependency);

const slotsNames = computed<[string[], string[]]>(() =>
  getSlotsNames(unref(renderFormItems))
);

const { gridResponsive, responsiveWidth, localBtnSpan } = useGridCols(
  props.cols,
  props.btnSpan
);

const labelWidth = computed(() =>
  parseInt(`${$attrs["label-width"] || $attrs["labelWidth"]}`)
);
const labelPosition = computed(
  () => $attrs["label-position"] || $attrs["labelPosition"]
);

const gridTemplateStyle = computed(() => {
  const style: CSSProperties = {};
  style["column-gap"] = `${props.colGap}px`;
  style["row-gap"] = 0;
  style["grid-template-columns"] = `repeat(${gridResponsive.value}, 1fr)`;
  return style;
});

const tooltipProps: Ref<ReFormProps["tooltipProps"]> = computed(() => {
  return {
    effect: "light",
    placement: "right",
    ...(props.tooltipProps || {})
  } as ReFormProps["tooltipProps"];
});

const localBtnSpanStyle = computed<string>(
  () => props.btnSpanStyle || `grid-column-start: span ${localBtnSpan.value}`
);

const readonly = computed<boolean>(() => !props.editable);
const emptyText = computed<string>(() => props.emptyText ?? "");
const btnLabelWidth = computed<number | undefined>(() =>
  props.ignoreBtnLabel ? 0 : undefined
);
const btnLabelText = computed<string>(() => {
  if (props.ignoreBtnLabel) return "";
  if (
    ($attrs["labelPosition"] as string) === "top" ||
    ($attrs["label-position"] as string) === "top"
  ) {
    return " ";
  }
  return "";
});

// 根据分组依赖自动展开分组-获取校验失败定位
function autoCollapseByErrors(errors?: Record<string, any>) {
  if (!props.autoCollapseInValidate || !errors) return;
  const childKeys = Object.keys(unref(formGroupDependency));
  const errorKeys = Object.keys(errors);
  const collapsedKeys = [] as string[];
  for (const key of errorKeys) {
    if (childKeys.includes(key)) {
      // 存在分组字段校验失败
      const path = unref(formGroupDependency)[key];
      for (const field of path) {
        if (formCollapsed.value[field]) {
          formCollapsed.value[field] = false; // 自动展开
          collapsedKeys.push(field);
        }
      }
    }
  }
  if (props.scrollToError && !!collapsedKeys.length) {
    // 存在展开变化，重新自动滚动到第一个校验错误字段
    nextTick(() => {
      const formFields = reFormRef.value.fields.map(field =>
        unref(field.prop)
      ) as string[];
      const field = formFields.find(field => errorKeys.includes(field));
      if (field) {
        reFormRef.value.scrollToField(field);
      }
    });
  }
}

function handleSubmit() {
  reFormRef.value &&
    reFormRef.value.validate((valid: boolean, errors: Record<string, any>) => {
      if (valid) {
        const submitData = cloneDeep(unwrapperShadowRef(formData));
        emits("submit", submitData);
        if (props.request) {
          submiting.value = true;
          props
            .request(submitData)
            .then(res => {
              emits("success", res);
            })
            .catch(err => {
              emits("error", err);
            })
            .finally(() => {
              submiting.value = false;
            });
        }
      } else {
        autoCollapseByErrors(errors);
      }
    });
}

function handleCancel() {
  reFormRef.value && reFormRef.value.clearValidate();
  emits("cancel");
}

function resetFields(props?: Arrayable<string> | undefined) {
  reFormRef.value && reFormRef.value.resetFields(props);
}

function validateField(
  props?: Arrayable<string> | undefined,
  callback?: FormValidateCallback | undefined
) {
  reFormRef.value &&
    reFormRef.value.validateField(
      props,
      (valid: boolean, errors?: Record<string, any>) => {
        callback && callback(valid, errors);
        if (!valid) {
          autoCollapseByErrors(errors);
        }
      }
    );
}

function clearValidate() {
  reFormRef.value && reFormRef.value.clearValidate();
}

function validate(callback: FormValidateCallback) {
  reFormRef.value && reFormRef.value.validate(callback);
}

function handleSwitchCollapsed(field: string) {
  formCollapsed.value[field] = !formCollapsed.value[field];
}

provide(Symbol.for("ap-re-form"), {
  gridTemplateStyle,
  gridResponsive,
  responsiveWidth,
  readonly,
  emptyText,
  formData,
  formCollapsed,
  formVisible,
  formRules,
  tooltipProps,
  labelWidth,
  labelPosition,
  handleSwitchCollapsed
});

onMounted(() => {
  if (props.formRef) {
    props.formRef(unref(reFormRef));
  }
  reFormRef.value && reFormRef.value.clearValidate(); // 默认清空校验 - 避免初始化就飘红色
});

defineExpose({
  submiting,
  reFormRef,
  formData,
  formRules,
  formItems,
  formVisible,
  formCollapsed,
  validate,
  clearValidate,
  validateField,
  resetFields,
  handleSwitchCollapsed,
  autoCollapseByErrors
});
</script>

<style lang="scss" scoped>
.ap-form-wrapper {
  @apply relative;

  .ap-form-grid {
    @apply grid;

    transition: grid-template-columns 0.2s ease; /* 过渡效果 */
  }
}
</style>
<style lang="scss">
.ap-form {
  --ap-form-readonly-height-small: 20px;
  --ap-form-readonly-height-default: 24px;
  --ap-form-readonly-height-large: 28px;

  @include m(readonly) {
    .el-form-item--small {
      .el-form-item__label {
        height: var(--ap-form-readonly-height-small);
        line-height: var(--ap-form-readonly-height-small);
      }

      .el-form-item__content {
        line-height: var(--ap-form-readonly-height-small);
      }
    }

    .el-form-item--default {
      .el-form-item__label {
        height: var(--ap-form-readonly-height-default);
        line-height: var(--ap-form-readonly-height-default);
      }

      .el-form-item__content {
        line-height: var(--ap-form-readonly-height-default);
      }
    }

    .el-form-item--large {
      .el-form-item__label {
        height: var(--ap-form-readonly-height-large);
        line-height: var(--ap-form-readonly-height-large);
      }

      .el-form-item__content {
        line-height: var(--ap-form-readonly-height-large);
      }
    }
  }
}
</style>
