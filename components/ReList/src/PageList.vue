<template>
  <ReList
    v-model="checks"
    :title="title"
    :loading="loading"
    :items="dataSource"
    :metas="metas"
    v-bind="$attrs"
    customClass="ap-page-list"
  >
    <template v-if="$slots.title || title" #title>
      <slot name="title" />
    </template>
    <template v-if="$slots.extra" #extra>
      <slot name="extra" />
    </template>
    <template #footer>
      <slot name="footer" />
      <div class="ap-page-list__pagination">
        <el-pagination
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          v-bind="paginationProps"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentPageChange"
        />
      </div>
    </template>
  </ReList>
</template>

<script setup lang="ts">
// 要求1：基于List实现分页列表
import ReList from "./List.vue";
import type { RePageListProps, RePageListEmits } from "../types";
import { unref, computed, useAttrs, type ModelRef } from "vue";
import usePagination from "@/hooks/usePagination";

defineOptions({
  name: "RePageList"
});

const props = withDefaults(defineProps<RePageListProps>(), {
  currentPage: 1,
  pageSize: 10,
  remote: false,
  dataResponsive: true,
  autoRemote: true,
  firstRemote: true
});
const emits = defineEmits<RePageListEmits>();
const $attrs = useAttrs();

const checks = defineModel() as ModelRef<Array<string | number>>;
const normalizeProps = computed(() => ({
  ...unref(props),
  data: props.items
}));

const {
  loading,
  dataSource,
  currentPage,
  pageSize,
  total,
  paginationProps,
  handlePageSizeChange,
  handleCurrentPageChange,
  toRemote
} = usePagination(
  normalizeProps,
  emits,
  "items",
  (rows: Record<string, any>[]) => emits("update:items", rows)
);

defineExpose({
  checks,
  loading,
  dataSource,
  currentPage,
  pageSize,
  total,
  toRemote
});
</script>
