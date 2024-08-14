```vue
<template>
  <RePageCard>
    <ReList :items="items" :metas="metas"></ReList>
  </RePageCard>

  <RePageCard>
    <ReList :items="items" :metas="metas1"></ReList>
  </RePageCard>

  <RePageCard>
    <ReList :items="items" :metas="metas2"></ReList>
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
const metas1 = ref({
  title: {
    dataIndex: "title2"
  },
  description: {},
  content: {}
});
const metas2 = ref({
  avatar: {},
  title: {},
  content: {}
});

const items = ref([
  {
    id: 1,
    title: "Title1",
    title2: "Title2",
    subTitle: "Sub-title",
    description: "Description",
    content: "Content",
    avatar: UserFilled
  },
  {
    id: 2,
    title: "Title1",
    title2: "Title2",
    subTitle: "Sub-title1",
    description: "Description1",
    content: "Content1",
    avatar: UserFilled
  }
]);
</script>
```
