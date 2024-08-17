<template>
  <div
    class="ap-table-select__selection"
    :class="{
      'ap-table-select__selection--near':
        showTags && multiple && !selectedAll && hasSelected
    }"
  >
    <div v-if="!hasSelected" class="ap-table-select__placeholder">
      {{ placeholder }}
    </div>
    <template v-else>
      <template v-if="showTags && multiple && !selectedAll">
        <template v-for="tag in renderTags" :key="tag[valueKey]">
          <slot name="tag" :tag="tag">
            <el-tag
              closable
              :type="tagType"
              :effect="tagEffect"
              :disable-transitions="true"
              :size="size"
              @close="onClose(tag)"
              >{{ tag[labelKey] || tag[valueKey] }}</el-tag
            >
          </slot>
        </template>
        <!--折叠tag-->
        <el-tooltip
          ref="tooltipRef"
          :effect="effect"
          :disabled="!collapseTagsTooltip"
          :popper-class="popperClass"
        >
          <el-tag
            v-if="collapseTags && !!collapsedTagsCount"
            :type="tagType"
            :effect="tagEffect"
            :size="size"
            :disable-transitions="true"
            >+{{ collapsedTagsCount }}</el-tag
          >
          <template v-if="collapseTagsTooltip && !!collapsedTagsCount" #content>
            <div class="ap-table-select__collapsed-tags">
              <template v-for="tag in renderCollapsedTags" :key="tag[valueKey]">
                <slot name="tag" :tag="tag">
                  <el-tag
                    closable
                    :type="tagType"
                    :effect="tagEffect"
                    :disable-transitions="true"
                    :size="size"
                    @close="onClose(tag)"
                    >{{ tag[labelKey] || tag[valueKey] }}</el-tag
                  >
                </slot>
              </template>
            </div>
          </template>
        </el-tooltip>
      </template>
      <template v-else>
        <div class="ap-table-select__selected">
          <div v-if="!multiple" class="ap-table-select__selected-text">
            {{ selectedText }}
          </div>
          <div v-else-if="selectedAll" class="ap-table-select__selected-text">
            全选（{{ localTotal }}）
          </div>
          <div v-else class="ap-table-select__selected-text">
            已选<span class="is-strong">{{ selectedCount }}</span
            >/{{ localTotal }}
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { isUndefined } from "lodash-es";
import { ref, computed, watch } from "vue";
import { ReTableSelection } from "../types";
import { ReTableRow } from "@/components/ReTable/types";
import { ElTooltip } from "element-plus";

defineOptions({
  name: "ReTableSelectSelection"
});

const tooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null);
const props = defineProps<ReTableSelection>();

const selected = defineModel("selected");
const selections = defineModel("selections");

const localTotal = computed(() => {
  if (props.remote) return props.total;
  return props.data.length;
});

const selectedText = computed(() => {
  if (props.multiple) return "";
  return selections.value
    ? selections.value[props.labelKey] ?? selections.value[props.valueKey]
    : "";
});

const normalizedMaxCollapseTags = computed(() =>
  Math.max(1, props.maxCollapseTags)
);

const renderTags = computed<ReTableRow[]>(() => {
  if (!props.multiple || isUndefined(selections.value)) return [];
  if (!props.collapseTags) return selections.value as ReTableRow[];
  return (selections.value as ReTableRow[]).slice(
    0,
    normalizedMaxCollapseTags.value
  );
});

const collapsedTagsCount = computed<number>(() => {
  if (!props.multiple || isUndefined(selections.value) || !props.collapseTags)
    return 0;
  return Math.max(
    0,
    (selections.value as ReTableRow[]).length - normalizedMaxCollapseTags.value
  );
});

const renderCollapsedTags = computed<ReTableRow[]>(() => {
  if (!props.multiple || isUndefined(selections.value) || !props.collapseTags)
    return [];
  return (selections.value as ReTableRow[]).slice(
    normalizedMaxCollapseTags.value
  );
});

watch(collapsedTagsCount, () => {
  tooltipRef.value?.popperRef.popperInstanceRef?.update();
});

function onClose(tag: ReTableRow) {
  selected.value = (selected.value as string[] | number[]).filter(
    (val: number | string) => tag[props.valueKey] !== val
  );
  selections.value = (selections.value as ReTableRow[]).filter(
    (row: ReTableRow) => tag[props.valueKey] !== row[props.valueKey]
  );
}
</script>

<style lang="scss" scoped>
.ap-table-select {
  &__selection {
    @apply flex-1 flex flex-wrap overflow-hidden;

    @include m(near) {
      margin-left: calc(-1 * var(--ap-table-select-gap));
    }

    gap: var(--ap-table-select-gap);
  }

  &__placeholder {
    @apply whitespace-nowrap overflow-hidden overflow-ellipsis;

    font-size: var(--ap-table-select-icon-size);
    color: var(--ap-table-select-placeholder-color);
  }

  &__selected {
    @apply max-w-full;

    &-text {
      @apply whitespace-nowrap overflow-hidden overflow-ellipsis;

      color: var(--ap-table-select-text-color);

      .is-strong {
        @apply mx-1;

        color: var(--el-color-primary);
      }
    }
  }

  &__collapsed-tags {
    @apply flex items-center justify-start flex-wrap min-w-0 max-w-[50vw];

    @include m(small) {
      gap: 4px;
    }

    @include m(large) {
      gap: 6px;
    }

    gap: 6px;
  }
}
</style>
