```vue
<template>
  <RePageCard>
    <RePageList expandable checkable :items="items" :metas="metas" title="List">
      <template #extra><el-button link>刷新</el-button></template>
    </RePageList>
  </RePageCard>
  <RePageCard>
    <RePageList
      :items="items"
      :metas="metas"
      type="card"
      ghost
      :grid="{ xl: 3, lg: 2 }"
      title="Card List"
    >
      <template #extra><el-button link>刷新</el-button></template>
    </RePageList>
  </RePageCard>
</template>

<script setup lang="ts">
import { ReListItemMetas } from "@/components/ReList";
import { UserFilled } from "@element-plus/icons-vue";
import { ref, shallowRef, onBeforeMount } from "vue";

const metas = ref({
  avatar: {},
  title: {},
  subTitle: {},
  description: {},
  content: {}
});

const items = shallowRef([]);
const totalRandom = Math.round(Math.random() * 100);

onBeforeMount(() => {
  const value = [];
  for (let i = 0; i < totalRandom; i++) {
    value.push({
      id: i,
      title: "Title" + i,
      subTitle: "Sub-title",
      description: "Description",
      content: "Content",
      avatar: UserFilled
    });
  }
  items.value = value;
});
</script>
```
