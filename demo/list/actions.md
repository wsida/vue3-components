```vue
<template>
  <RePageCard>
    <ReList :items="items" :metas="metas"></ReList>
  </RePageCard>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import { ref, h } from "vue";
import { ElButton } from "element-plus";
const metas = ref({
  avatar: {},
  title: {},
  subTitle: {},
  description: {},
  content: {},
  actions: [
    // 操作按钮配置
    {
      text: "查看",
      events: {
        click: item => {
          console.log("click 查看", item);
        }
      }
    },
    {
      text: "删除",
      props: { type: "danger" },
      events: {
        click: item => {
          console.log("click 删除", item);
        }
      }
    },
    {
      text: "自定义",
      render: item =>
        h(
          ElButton,
          {
            text: true,
            bg: true,
            type: "primary",
            onClick: item => {
              console.log("click 自定义", item);
            }
          },
          () => "自定义"
        )
    }
  ]
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
  },
  {
    id: 3,
    title: "Title1",
    subTitle: "Sub-title1",
    description: "Description1",
    content: "Content1",
    avatar: UserFilled
  }
]);
</script>
```
