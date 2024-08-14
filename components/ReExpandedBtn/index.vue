<template>
  <el-button
    :disabled="disabled"
    v-bind="$attrs"
    link
    type="primary"
    :class="['ap-expanded-btn', `ap-expanded-btn--${direction}`]"
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
    direction?: "top" | "bottom";
  }>(),
  {
    disabled: false,
    direction: "bottom"
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

  @include m("bottom") {
    :deep(.el-icon) {
      &.is-expanded {
        transform: rotate(90deg);
      }
    }
  }

  @include m("top") {
    :deep(.el-icon) {
      &.is-expanded {
        transform: rotate(-90deg);
      }
    }
  }

  :deep(.el-icon) {
    @apply ml-1;

    transition: all 0.2s linear;
    transform: rotate(0);
    transform-origin: center center;
  }
}
</style>
