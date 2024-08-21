```vue
<template>
  <RePage>
    <RePageCard :shadow="false" :border="false">
      <div><re-tag-list size="default" tag-type="info" :tags="tagList" /></div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list size="default" tag-type="primary" :tags="tagList" />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list size="default" tag-type="success" :tags="tagList" />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list size="default" tag-type="warning" :tags="tagList" />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list size="default" tag-type="danger" :tags="tagList" />
      </div>
    </RePageCard>
  </RePage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tagList = ref(["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]);
</script>
```
