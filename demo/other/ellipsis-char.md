```vue
<template>
  <div>
    <RePageCard>
      <div class="mb-4">
        <el-tag type="primary">char-count=48</el-tag>
        <ReEllipsis :line-height="20" :char-count="48" :content="content" />
      </div>
      <div class="mb-4">
        <el-tag type="primary">char-count=73</el-tag>
        <ReEllipsis :line-height="20" :char-count="73" :content="content" />
      </div>
      <div class="mb-4">
        <el-tag type="primary">char-count=120</el-tag>
        <ReEllipsis :line-height="20" :char-count="120" :content="content" />
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
