<template>
  <el-dialog
    v-model="visible"
    v-bind="$attrs"
    :class="customClass"
    @closed="handleClosed"
    @close="$emit('close')"
    @open="$emit('open')"
    @opened="$emit('opened')"
    @close-auto-focus="$emit('close-auto-focus')"
    @open-auto-focus="$emit('open-auto-focus')"
  >
    <template #header>
      <slot name="header" />
    </template>
    <template #default>
      <div class="ap-drawer-form__body">
        <slot name="default-header" />
        <slot name="default-content">
          <div class="ap-drawer-form__content">
            <ReForm
              ref="innerFormRef"
              v-model="localFormData"
              v-loading="submiting"
              v-bind="localFormProps"
              @change="handleFormFieldChange"
            >
              <template
                v-for="slotName in slotsNames[0]"
                #[slotName]="slotScoped"
              >
                <slot :name="slotName" v-bind="slotScoped" />
              </template>
              <template v-for="slotName in slotsNames[1]" #[slotName]>
                <slot :name="slotName" />
              </template>
            </ReForm>
          </div>
        </slot>
        <slot name="default-footer" />
      </div>
    </template>
    <!--页脚-->
    <template #footer>
      <slot name="footer">
        <el-button type="primary" :disabled="disabled" @click="handleSubmit"
          >确定</el-button
        >
        <el-button @click="handleCancel">取消</el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import ReForm from "./index.vue";
import useDialogForm, {
  FormModelValue,
  DialogFormProps,
  DialogFormPropsEmits
} from "./useDialogForm";

defineOptions({
  name: "ReModalForm"
});

const props = withDefaults(defineProps<DialogFormProps>(), {
  disabled: false
});

const emits = defineEmits<DialogFormPropsEmits>();
const $attrs = useAttrs();

const localFormData = defineModel("formData");

const customClass = computed<string>(() => {
  return `ap-modal-form-wrapper ${$attrs["custom-class"] || $attrs["customClass"] || ""}`;
});

const {
  submiting,
  reFormRef,
  slotsNames,
  innerFormRef,
  localFormProps,
  visible,
  handleSubmit,
  handleFormFieldChange,
  handleCancel,
  handleClosed,
  resetForm
} = useDialogForm(props, emits, localFormData);

defineExpose({
  reFormRef,
  innerFormRef,
  formData: localFormData,
  resetForm
});
</script>
