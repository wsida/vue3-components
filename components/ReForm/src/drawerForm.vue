<template>
  <el-drawer
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
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, useAttrs, ref } from "vue";
import ReForm from "./index.vue";
import useDialogForm, {
  FormModelValue,
  DialogFormProps,
  DialogFormPropsEmits
} from "./useDialogForm";
import useDrawerScrollShadow from "@/hooks/useDrawerScrollShadow";

defineOptions({
  name: "ReDrawerForm"
});

const prefix = "ap-drawer";

const props = withDefaults(defineProps<DialogFormProps>(), {
  disabled: false
});

const emits = defineEmits<DialogFormPropsEmits>();
const $attrs = useAttrs();

const localFormData = defineModel("formData");

const customClass = computed<string>(() => {
  return `${drawerWrapperClass.value} ap-drawer-form-wrapper ${$attrs["custom-class"] || $attrs["customClass"] || ""}`;
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

const { drawerWrapperClass } = useDrawerScrollShadow(visible, prefix);

defineExpose({
  reFormRef,
  innerFormRef,
  formData: localFormData,
  resetForm
});
</script>

<style lang="scss">
.ap-drawer-form-wrapper {
  .el-drawer__header {
    padding-bottom: var(--el-drawer-padding-primary) !important;
    margin-bottom: 0 !important;
  }
}
</style>
