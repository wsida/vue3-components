```vue
<template>
  <RePage>
    <RePageCard :shadow="false" :border="false">
      <div><re-tag-list size="large" :tags="tagList" /></div>
      <el-divider direction="horizontal" />
      <div><re-tag-list size="default" :tags="tagList" /></div>
      <el-divider direction="horizontal" />
      <div><re-tag-list size="small" :tags="tagList" /></div>
    </RePageCard>
  </RePage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tagList = ref(["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]);
</script>
```
