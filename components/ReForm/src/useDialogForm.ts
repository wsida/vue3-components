import { ref, computed, unref, onMounted } from "vue";
import useForm from "./useForm";
import type ReForm from "./index.vue";
import { getSlotsNames, unwrapperShadowRef } from "../utils";
import { cloneDeep } from "lodash-es";
import type { ReFormProps } from "../types";
import type { MaybeRef } from "vue";
import type { FormProps } from "element-plus";

export interface ExtendFormProps
  extends Omit<
      FormProps,
      "model" | "rules" | "disabled" | "scrollToError" | "size"
    >,
    Omit<
      ReFormProps,
      "items" | "modelValue" | "formRef" | "disabled" | "request"
    > {}

export type FormModelValue = ReFormProps["modelValue"];
export interface DialogFormProps {
  formProps?: Partial<ExtendFormProps>;
  modelValue: boolean;
  items: ReFormProps["items"];
  formData?: ReFormProps["modelValue"]; // 绑定值
  disabled?: ReFormProps["disabled"];
  resetAfterClosed?: boolean;
  request?: ReFormProps["request"];
}
export interface DialogFormPropsEmits {
  (
    e:
      | "open"
      | "opened"
      | "close"
      | "closed"
      | "close-auto-focus"
      | "open-auto-focus"
      | "cancel"
  ): void;
  (e: "update:modelValue", visible: boolean): void;
  (e: "update:formData", model: MaybeRef<FormModelValue>): void;
  (
    e: "change",
    field: string,
    value: any,
    model: MaybeRef<FormModelValue>
  ): void;
  (e: "submit", model?: Record<string, any>): void;
  (e: "success" | "error", res: unknown): void;
}

export default function useDialogForm(
  props: DialogFormProps,
  emits: DialogFormPropsEmits,
  localFormData: MaybeRef<FormModelValue>
) {
  const { submiting, reFormRef, getFormRef, formData, formItems } = useForm(
    props.items,
    props.formData
  );

  const innerFormRef = ref<InstanceType<typeof ReForm> | null>(null);

  const localFormProps = computed<ReFormProps>(() => ({
    ...(props.formProps || {}),
    formRef: getFormRef,
    items: props.items,
    disabled: props.disabled,
    hideBtns: true
  }));

  const slotsNames = computed<[string[], string[]]>(() =>
    getSlotsNames(unref(formItems))
  );

  const visible = computed({
    get() {
      return props.modelValue;
    },
    set(val) {
      emits("update:modelValue", val);
    }
  });

  function handleSubmit() {
    reFormRef.value &&
      reFormRef.value.validate(
        (valid: boolean, errors?: Record<string, any>) => {
          if (valid) {
            const submitData = cloneDeep(unwrapperShadowRef(localFormData));
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
            innerFormRef.value &&
              innerFormRef.value.autoCollapseByErrors(errors);
          }
        }
      );
  }

  function handleFormFieldChange(
    field: string,
    value: any,
    model: FormModelValue
  ) {
    emits("change", field, value, model);
  }

  function handleCancel() {
    visible.value = false;
    emits("cancel");
  }

  function handleClosed() {
    reFormRef.value && reFormRef.value.resetFields();
    if (props.resetAfterClosed) {
      resetForm();
    }
    emits("closed");
  }

  function resetForm() {
    localFormData.value = cloneDeep(formData.value);
  }

  onMounted(() => {
    localFormData.value = cloneDeep(formData.value);
  });

  return {
    submiting,
    reFormRef,
    formData,
    formItems,
    slotsNames,
    innerFormRef,
    localFormProps,
    visible,
    getFormRef,
    handleSubmit,
    handleFormFieldChange,
    handleCancel,
    handleClosed,
    resetForm
  };
}
