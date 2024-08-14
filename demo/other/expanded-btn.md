```vue
<template>
  <div>
    <RePageCard>
      <ReExpandedBtn v-model="expanded1" @click="handleClick" />
      <ReExpandedBtn v-model="expanded2" direction="top" @click="handleClick" />
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const expanded1 = ref(false);
const expanded2 = ref(false);

function handleClick() {
  console.log("click");
}
</script>
```
