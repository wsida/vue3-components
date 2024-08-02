<template>
  <template v-for="item in items" :key="item.field">
    <div
      v-if="formVisible[item.field]"
      class="ap-form-grid-item"
      :style="`grid-column-start: span ${normalizeSpan(item.span as ReGridResponsive)}`"
    >
      <template v-if="item.type === 'group'">
        <div class="ap-form-group">
          <div class="ap-form-group__trigger">
            <slot :name="item.slot" :collpased="formCollapsed[item.field]">
              <ReCollapsedBtn
                v-bind="item.collapsedTriggerProps"
                :style="{
                  marginLeft: item.collapsedTriggerIndex
                    ? `${collapsedTriggerMargin}px`
                    : 0
                }"
                :modelValue="formCollapsed[item.field]"
                @click="handleSwitchCollapsed(item.field)"
              />
            </slot>
          </div>
          <el-collapse-transition
            v-if="!!item.children && item.children.length"
          >
            <div
              v-show="!formCollapsed[item.field]"
              class="ap-form-group__content"
              :style="gridTemplateStyle"
            >
              <ReFormRenderItems :items="item.children">
                <template
                  v-for="slotName in item.groupSlots[0]"
                  #[slotName]="slotScoped"
                >
                  <slot :name="slotName" v-bind="slotScoped" />
                </template>
                <template v-for="slotName in item.groupSlots[1]" #[slotName]>
                  <slot :name="slotName" />
                </template>
              </ReFormRenderItems>
            </div>
          </el-collapse-transition>
        </div>
      </template>
      <template v-else>
        <ReFormRenderItem :item="item">
          <template v-if="item.labelSlot" #[item.labelSlot]>
            <slot :name="item.labelSlot" />
          </template>
          <template v-if="item.slot" #[item.slot]="slotScoped">
            <slot :name="item.slot" v-bind="slotScoped" />
          </template>
        </ReFormRenderItem>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
import ReCollapsedBtn from "../../ReCollapsedBtn/index.vue";
import { computed, inject, unref, type MaybeRef } from "vue";
import type { ReFormItem, ReGridResponsive } from "../types";
import ReFormRenderItem from "./renderItem.vue";
import { matchResponsive } from "@/hooks/useGridResponsive";

defineOptions({
  name: "ReFormRenderItems"
});

const props = defineProps<{
  items: ReFormItem[];
}>();

const {
  gridTemplateStyle,
  gridResponsive,
  responsiveWidth,
  formCollapsed,
  formVisible,
  labelWidth,
  labelPosition,
  handleSwitchCollapsed
} = inject(Symbol.for("ap-re-form")) as any;

const collapsedTriggerMargin = computed(() => {
  if (unref(labelPosition) === "left" || unref(labelPosition) === "right") {
    return unref(labelWidth);
  }
  return 0;
});

function normalizeSpan(span: MaybeRef<ReGridResponsive>): number {
  return Math.min(
    matchResponsive(unref(responsiveWidth), unref(span)),
    unref(gridResponsive)
  );
}
</script>

<style lang="scss" scoped>
.ap-form-group {
  @apply relative w-full;

  &__trigger {
    @apply relative w-full mb-4;
  }

  &__content {
    @apply grid;

    transition: grid-template-columns 0.2s ease; /* 过渡效果 */
  }
}
</style>
