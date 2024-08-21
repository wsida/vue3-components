```vue
<template>
  <RePage>
    <RePageCard :shadow="false" :border="false">
      <div><re-tag-list v-model:tags="tagList" editable size="default" /></div>
      <el-divider direction="horizontal" />
      <div style="margin-bottom: 12px">input-responsive</div>
      <div>
        <re-tag-list
          v-model:tags="tagList"
          editable
          input-responsive
          size="default"
        />
      </div>
    </RePageCard>
  </RePage>
</template>

<script setup lang="ts">
import { ref } from "vue";

const tagList = ref(["Tag1", "Tag2", "Tag3"]);

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
