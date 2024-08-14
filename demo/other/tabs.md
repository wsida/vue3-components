```vue
<template>
  <div>
    <RePageCard>
      <ReTabs v-model="activeTab" :tabs="tabs" />
      <el-alert :closable="false">
        公共模版，当前选中Tab：{{ activeTab }}
      </el-alert>
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const activeTab = ref("tab1");
const tabs = ref([
  {
    label: "Tab1",
    name: "tab1"
  },
  {
    label: "Tab2",
    name: "tab2"
  },
  {
    label: "Tab3",
    name: "tab3"
  }
]);

function handleClick() {
  console.log("click");
}
</script>
```
