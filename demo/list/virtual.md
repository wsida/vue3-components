```vue
<template>
  <RePageCard>
    <ReVirtualList
      :height="400"
      :rowHeight="100"
      :items="items"
      :metas="metas"
      title="List"
    >
      <template #extra><el-button link>刷新</el-button></template>
    </ReVirtualList>
  </RePageCard>
</template>

<script setup lang="ts">
import { ReListItemMetas } from "@/components/ReList";
import { UserFilled } from "@element-plus/icons-vue";
import { computed, onBeforeMount, shallowRef } from "vue";
import { ElButton } from "element-plus";
const metas = computed(() => {
  const metas: ReListItemMetas = {
    avatar: {},
    title: {},
    subTitle: {},
    description: {},
    content: {}
  };
  return metas;
});

const items = shallowRef();

onBeforeMount(() => {
  const list = [];
  for (let i = 0; i < 1000; i++) {
    list.push({
      id: 1,
      title: "Title",
      subTitle: "Sub-title",
      description: "Description",
      content: "Content",
      avatar: UserFilled
    });
  }
  items.value = list;
});
</script>
```
