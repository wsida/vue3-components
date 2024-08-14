```vue
<template>
  <div>
    <RePageCard>
      <div class="mb-4">
        <el-tag type="primary">height=50</el-tag>
        <ReEllipsis :line-height="20" :height="50" :content="content" />
      </div>
      <div class="mb-4">
        <el-tag type="primary">height=100</el-tag>
        <ReEllipsis :line-height="20" :height="100" :content="content" />
      </div>
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const content = ref(generateRandomString(400));

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
