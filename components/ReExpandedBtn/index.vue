<template>
  <el-button
    :disabled="disabled"
    v-bind="$attrs"
    link
    type="primary"
    class="ap-expanded-btn"
    @click="handleSwitchCollapsed"
  >
    <el-icon :class="{ 'is-expanded': modelValue }"><ArrowRight /></el-icon
  ></el-button>
</template>

<script setup lang="ts">
import { ArrowRight } from "@element-plus/icons-vue";

defineOptions({
  name: "ReExpandedBtn"
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    disabled?: boolean;
  }>(),
  {
    disabled: false
  }
);

const emits = defineEmits<{
  (e: "click"): void;
  (e: "update:modelValue", expanded: boolean): void;
}>();

function handleSwitchCollapsed() {
  emits("click");
  emits("update:modelValue", !props.modelValue);
}
</script>

<style lang="scss" scoped>
.ap-expanded-btn {
  @apply relative;

  :deep(.el-icon) {
    @apply ml-1;

    transition: all 0.2s linear;
    transform: rotate(0);
    transform-origin: center center;

    &.is-expanded {
      transform: rotate(90deg);
    }
  }
}
</style>
