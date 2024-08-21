```vue
<template>
  <RePage>
    <RePageCard :shadow="false" :border="false">
      <div><re-tag-list v-model:tags="tagList" editable size="default" /></div>
      <el-divider direction="horizontal" />
      <div style="margin-bottom: 12px">限制不能输入纯数字</div>
      <div>
        <re-tag-list
          v-model:tags="tagList"
          editable
          size="default"
          :before-add="beforeAdd"
        />
      </div>
      <el-divider direction="horizontal" />
      <div style="margin-bottom: 12px">手动新增</div>
      <div>
        <re-tag-list
          v-model:tags="tagList"
          editable
          size="default"
          :auto-add="false"
          @add="onAdd"
        />
      </div>
    </RePageCard>
  </RePage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tagList = ref(["Tag1", "Tag2", "Tag3", "Tag4", "Tag5", "Tag6", "Tag7"]);

function beforeAdd(label: string): boolean {
  return !/^\d*$/.test(label);
}

function onAdd(label: string) {
  let value = label.trim();
  if (!value) return;
  tagList.value.push(value);
}
</script>
```
