```vue
<template>
  <RePage>
    <RePageCard :shadow="false" :border="false">
      <el-radio-group v-model="tagType">
        <el-radio value="primary">primary</el-radio>
        <el-radio value="success">success</el-radio>
        <el-radio value="warning">warning</el-radio>
        <el-radio value="danger">danger</el-radio>
      </el-radio-group>
    </RePageCard>
    <RePageCard :shadow="false" :border="false">
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          tagType="info"
          tagEffect="dark"
          size="default"
        />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          :tagType="tagType"
          tagEffect="dark"
          size="default"
        />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          tagType="info"
          tagEffect="light"
          size="default"
        />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          :tagType="tagType"
          tagEffect="light"
          size="default"
        />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          tagType="info"
          tagEffect="plain"
          size="default"
        />
      </div>
      <el-divider direction="horizontal" />
      <div>
        <re-tag-list
          v-model:tags="tagList"
          v-model="checks"
          checkable
          :tagType="tagType"
          tagEffect="plain"
          size="default"
        />
      </div>
    </RePageCard>
  </RePage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tagList = ref(["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]);
const checks = ref<string[]>(["Tag1"]);
const tagType = ref("primary");
</script>
```
