```vue
<template>
  <RePageCard>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">折叠Tag：</span>
      <el-switch v-model="collapseTags" />
    </div>
  </RePageCard>
  <RePageCard>
    <ReTableSelect
      v-model="selected"
      style="width: 220px"
      labelKey="name"
      :show-tags="true"
      :collapseTags="collapseTags"
      :data="tableData"
      :columns="columns"
      :max-height="400"
    ></ReTableSelect>
    <div>selected: {{ selected }}</div>
  </RePageCard>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, shallowRef } from "vue";

const collapseTags = ref(false);
const tableData = ref([]);
const selected = ref();

const columns = shallowRef([
  { label: "日期", minWidth: 80, prop: "date", slot: "date-slot" },
  { label: "姓名", minWidth: 80, prop: "name" },
  {
    label: "性别",
    prop: "sex",
    minWidth: 80,
    filterable: true,
    labelKey: "name",
    valueKey: "value",
    options: [
      { name: "男", value: 1 },
      { name: "女", value: 2 }
    ]
  },
  { label: "年龄", minWidth: 80, prop: "age", sortable: true },
  { label: "年龄1", minWidth: 100, prop: "age1", sortable: true },
  { label: "地址", minWidth: 80, prop: "address", showOverflowTooltip: true }
]);

onBeforeMount(() => {
  const data = [];
  for (let i = 0; i < Math.floor(Math.random() * 200); i++) {
    data.push({
      id: i,
      date: "2016-05-03",
      name: `Tom${i}`,
      age: i,
      age1: 100 - i,
      sex: Math.floor(Math.random() * 1) + 1,
      address: "No. 189, Grove St, Los Angeles"
    });
  }
  tableData.value = data;
});
</script>
```