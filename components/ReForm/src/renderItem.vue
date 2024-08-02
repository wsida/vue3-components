<template>
  <div class="ap-form-item ap-form-control">
    <el-form-item
      :class="[item.customClass || '']"
      :prop="item.field"
      :label="item.label"
      :labelWidth="item.labelWidth"
      :labelPosition="item.labelPosition"
    >
      <!--标签-->
      <template v-if="item.label" #label>
        <slot :name="item.labelSlot">
          <span class="inline-flex items-center">
            <span>{{ item.label }}</span>
            <el-tooltip
              v-if="item.tooltip"
              v-bind="tooltipProps"
              :content="item.tooltip"
            >
              <el-icon class="ml-1"><QuestionFilled /></el-icon>
            </el-tooltip>
          </span>
        </slot>
      </template>
      <!--控件-->
      <template #default>
        <template v-if="item.type === 'text'">
          <div class="ap-form-control--text">
            {{ formData[item.field] || emptyText }}
          </div>
        </template>
        <template v-else>
          <template v-if="item.slot">
            <slot :name="item.slot" :item="item" :readonly="readonly" />
          </template>
          <template v-else>
            <!--带子组件-->
            <template v-if="childComps.includes(item.comp!)">
              <component
                :is="item.comp"
                v-if="!readonly"
                :class="[item.controlClass || '']"
                v-bind="item.props"
                v-on="item.events"
              >
                <template v-for="opt in item.options" :key="opt[item.valueKey]">
                  <component
                    :is="item.childComp"
                    :item="opt"
                    :value="opt[item.valueKey!]"
                    :label="opt[item.labelKey!]"
                    >{{ opt[item.labelKey!] }}</component
                  >
                </template>
              </component>
              <div v-else class="ap-form-control--text">
                {{ getOptionLabel(item.props.modelValue, item) || emptyText }}
              </div>
            </template>
            <!--多行文本框-->
            <template
              v-else-if="
                item.comp === 'el-textarea' || item.comp === 'textarea'
              "
            >
              <el-input
                v-if="!readonly"
                type="textarea"
                :class="[item.controlClass || '']"
                v-bind="item.props"
                v-on="item.events"
              />
              <div v-else class="ap-form-control--text">
                {{ item.props.modelValue || emptyText }}
              </div>
            </template>
            <!--一般表单控件/全局控件-->
            <template v-else>
              <component
                :is="item.comp"
                v-if="!readonly"
                :class="[item.controlClass || '']"
                v-bind="item.props"
                v-on="item.events"
              />
              <div v-else class="ap-form-control--text">
                {{ item.props.modelValue || emptyText }}
              </div>
            </template>
          </template>
        </template>
        <div
          v-if="item.tips"
          :class="['ap-form-control--tip', item.tipsClass || '']"
        >
          {{ item.tips || "" }}
        </div>
      </template>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from "@element-plus/icons-vue";
import { inject, ref } from "vue";
import { isArray, isUndefined } from "lodash-es";
import { HAS_CHILD_COMPONENT_MAP } from "../constants";
import type { ReFormItem } from "../types";

defineOptions({
  name: "ReFormRenderItem"
});

const props = defineProps<{
  item: ReFormItem;
}>();

const childComps = ref(Object.keys(HAS_CHILD_COMPONENT_MAP));

const { formData, tooltipProps, readonly, emptyText } = inject(
  Symbol.for("ap-re-form")
) as any;

function getOptionLabel(
  modelValue: Array<unknown>,
  item: ReFormItem,
  joinChar = ","
): string {
  let beforeFormat = [];
  let labelArr = [];
  if (isArray(modelValue)) {
    beforeFormat = [...modelValue];
  } else if (!isUndefined(modelValue)) {
    beforeFormat = [modelValue];
  }

  labelArr = beforeFormat.map((val: unknown) => {
    const opt = item.options?.find(opt => opt[item.valueKey] === val);
    return opt?.[item.labelKey] ?? val;
  });
  return labelArr.join(joinChar);
}
</script>

<style lang="scss" scoped>
.ap-form-control {
  @apply relative w-full;

  .ap-form-control--text {
    @apply w-full;

    color: var(--el-text-color-regular);
    word-break: break-word;
  }

  .ap-form-control--tip {
    @apply mt-1;

    line-height: 1.2;
    color: var(--el-text-color-placeholder);
    word-break: break-word;
  }
}
</style>
