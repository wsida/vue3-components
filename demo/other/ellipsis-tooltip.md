```vue
<template>
  <div>
    <RePageCard>
      <div class="mb-4">
        <el-tag type="primary">tooltip=false</el-tag>
        <ReEllipsis :line-height="20" :content="content" />
      </div>
      <div class="mb-4">
        <el-tag type="primary">tooltip=true</el-tag>
        <ReEllipsis :line-height="20" tooltip :content="content" />
      </div>
      <div class="mb-4">
        <el-tag type="primary">tooltip=custom</el-tag>
        <ReEllipsis
          :line-height="20"
          :tooltip="{ effect: 'light' }"
          :content="content"
        />
      </div>
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const content = ref(generateRandomString(100));

function generateRandomString(length = 8) {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const characters = charset.split("");
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters[Math.floor(Math.random() * charactersLength)];
  }
  return result;
}
</script>
```
