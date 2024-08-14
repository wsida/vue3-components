```vue
<template>
  <RePageCard>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">ItemLayout：</span>
      <el-radio-group v-model="itemLayout">
        <el-radio value="horizontal" label="horizontal" />
        <el-radio value="vertical" label="vertical" />
      </el-radio-group>
    </div>
    <div class="flex items-center mb-4" v-show="itemLayout === 'horizontal'">
      <span class="text-gray-700 text-[14px]">AvatarPosition：</span>
      <el-radio-group v-model="avatarPosition">
        <el-radio value="left" label="left" />
        <el-radio value="right" label="right" />
      </el-radio-group>
    </div>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">Checkable：</span>
      <el-switch v-model="checkable" />
    </div>
  </RePageCard>
  <RePageCard>
    <ReList
      type="card"
      :checkable="checkable"
      :itemLayout="itemLayout"
      :avatarPosition="avatarPosition"
      :items="items"
      :metas="metas"
    ></ReList>
  </RePageCard>
</template>

<script setup lang="ts">
import { UserFilled } from "@element-plus/icons-vue";
import { ref } from "vue";
const itemLayout = ref("horizontal");
const avatarPosition = ref("right");
const checkable = ref(false);
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
