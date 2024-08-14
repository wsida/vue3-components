```vue
<template>
  <RePageCard>
    <ReList :items="items" :metas="metas" title="Custom Render Item">
      <template #default="{ item }">
        <el-alert
          class="mb-2"
          show-icon
          :title="item.title"
          :description="item.description"
          :closable="false"
        />
      </template>
    </ReList>
  </RePageCard>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
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
