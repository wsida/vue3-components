```vue
<template>
  <RePageCard>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">Border：</span>
      <el-switch v-model="border" />
    </div>
  </RePageCard>
  <RePageCard>
    <ReList title="List" :border="border" :items="items" :metas="metas">
      <template #extra><el-button link>刷新</el-button></template>
      <template #footer><div>This is footer</div></template>
    </ReList>
  </RePageCard>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
const border = ref(false);
const metas = ref({
  avatar: {},
  title: {},
  subTitle: {},
  description: {},
  content: {}
});

const items = ref([
  {
    id: 1,
    title: "Title1",
    subTitle: "Sub-title",
    description: "Description",
    content: "Content",
    avatar: UserFilled
  },
  {
    id: 2,
    title: "Title1",
    subTitle: "Sub-title1",
    description: "Description1",
    content: "Content1",
    avatar: UserFilled
  }
]);
</script>
```
