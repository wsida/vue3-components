```vue
<template>
  <RePageCard>
    <RePageList
      ref="pageListRef"
      v-model:items="remoteItems"
      v-model:total="total"
      title="Remote List"
      remote
      :metas="metas"
      :remote-method="remoteMethod"
    >
      <template #extra
        ><el-button link @click="refresh">刷新</el-button></template
      >
    </RePageList>
  </RePageCard>
</template>

<script setup lang="ts">
import { ReListItemMetas } from "@/components/ReList";
import { UserFilled } from "@element-plus/icons-vue";
import { ref, shallowRef } from "vue";

const pageListRef = ref(null);
const metas = ref({
  avatar: {},
  title: {},
  subTitle: {},
  description: {},
  content: {}
});

const remoteItems = shallowRef([]);
const total = ref(0);
const totalRandom = Math.round(Math.random() * 100);

function remoteMethod(params: { currentPage: number; pageSize: number }) {
  return new Promise(resolve => {
    const startIndex = (params.currentPage - 1) * params.pageSize;
    const isEnd = totalRandom < params.currentPage * params.pageSize;
    const size = isEnd ? totalRandom % params.pageSize : params.pageSize;
    const items = [];
    for (let i = 0; i < size; i++) {
      items.push({
        id: startIndex + i,
        title: `Title${startIndex + i}`,
        subTitle: "Sub-title",
        description: "Description",
        content: "Content",
        avatar: UserFilled
      });
    }
    setTimeout(() => {
      // total.value = totalRandom;
      // remoteItems.value = items;
      resolve({
        rows: items,
        total: totalRandom,
        currentPage: params.currentPage,
        pageSize: params.pageSize
      });
    }, Math.random() * 2000);
  });
}

function refresh() {
  // 当前页刷新
  pageListRef.value && pageListRef.value.toRemote();
}
</script>
```
