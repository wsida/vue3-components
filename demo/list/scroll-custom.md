```vue
<template>
  <RePageCard>
    <ReScrollList
      ref="scrollListRef"
      v-model:items="remoteItems"
      v-model:total="total"
      :metas="metas"
      :remote-method="remoteMethod"
      :grid="{ xl: 3, lg: 2 }"
      trigger="custom"
      type="card"
      ghost
      title="Scroll Card List"
    >
      <template #extra
        ><el-button link @click="refresh">刷新</el-button></template
      >
    </ReScrollList>
  </RePageCard>
</template>

<script setup lang="ts">
import ReScrollList from "@/components/ReList/src/ScrollList.vue";
import { ReListItemMetas } from "@/components/ReList";
import { UserFilled } from "@element-plus/icons-vue";
import { ref, shallowRef } from "vue";
import { RePageCard } from "@/components/RePage";

const scrollListRef = ref<InstanceType<typeof ReScrollList> | null>(null);

const metas = ref({
  avatar: {},
  title: {},
  subTitle: {},
  description: {},
  content: {}
});

const remoteItems = shallowRef([]);
const total = ref(0);
const totalRandom = Math.round(Math.random() * 500 + 50);

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
  scrollListRef.value && scrollListRef.value.refresh();
}
</script>
```
