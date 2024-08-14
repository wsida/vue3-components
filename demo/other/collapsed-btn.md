```vue
<template>
  <div>
    <RePageCard>
      <ReCollapsedBtn v-model="collapsed1" @click="handleClick" />
      <ReCollapsedBtn
        v-model="collapsed2"
        collapsedText="切换"
        @click="handleClick"
      />
      <ReCollapsedBtn v-model="collapsed3" hidden-text @click="handleClick" />
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const collapsed1 = ref(true);
const collapsed2 = ref(true);
const collapsed3 = ref(true);

function handleClick() {
  console.log("click");
}
</script>
```
