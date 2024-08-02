<template>
  <div class="ap-tabs">
    <el-tabs v-model="activeTab" v-bind="$attrs">
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :disabled="!!tab.disabled"
        :label="tab.label"
        :name="tab.name"
      />
    </el-tabs>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, withDefaults } from "vue";
import type { Tab } from "./types";

defineOptions({
  name: "ReTabs",
  inheritAttrs: false
});

const props = withDefaults(
  defineProps<{
    tabs?: Array<Tab>;
    defaultTab?: string;
  }>(),
  {}
);

const activeTab = defineModel<Tab["name"]>();

onMounted(() => {
  let defaultTab = activeTab.value || props.defaultTab || "";
  const filterTabs = props.tabs!.filter(
    (tab: Tab) =>
      (!defaultTab && !tab.disabled) ||
      (!!defaultTab && tab.name === defaultTab)
  );
  if (!!filterTabs.length) {
    activeTab.value = filterTabs[0].name;
  }
});
</script>

<style lang="scss" scoped>
.ap-tabs {
  @apply relative;

  :deep(.el-tabs__header) {
    @apply mb-0;
  }
}
</style>
