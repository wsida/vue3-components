```vue
<template>
  <RePageCard>
    <ReTableSelect
      v-model="selected"
      style="width: 220px"
      labelKey="name"
      clearable
      remote
      show-toolbox
      :total="total"
      :remote-method="remoteMethod"
      :first-remote="true"
      :show-tags="true"
      :collapseTags="true"
      :data="tableData"
      :columns="columns"
      :max-height="400"
    ></ReTableSelect>
    <div>selected: {{ selected }}</div>
  </RePageCard>
  <RePageCard>
    <ReTableSelect
      v-model="selected2"
      style="width: 220px"
      labelKey="name"
      clearable
      remote
      show-toolbox
      all-value="CUSTOM-ALL"
      :total="total"
      :remote-method="remoteMethod"
      :first-remote="true"
      :show-tags="true"
      :collapseTags="true"
      :data="tableData"
      :columns="columns"
      :max-height="400"
    ></ReTableSelect>
    <div>selected: {{ selected2 }}</div>
  </RePageCard>
</template>

<script setup lang="ts">
import { ref, shallowRef } from "vue";

const total = ref(Math.floor(Math.random() * 100));
// const total = ref(0);
const tableData = ref([]);
const selected = ref();
const selected2 = ref();

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

function remoteMethod({ currentPage, pageSize }, keyword, filters, sorts) {
  console.log("query", keyword, filters, sorts);
  return new Promise(resolve => {
    setTimeout(() => {
      const data = [];
      const sid = (currentPage - 1) * pageSize;
      const eid = sid + pageSize;
      for (let i = sid; i < eid; i++) {
        data.push({
          id: i,
          date: "2016-05-03",
          name: `Tom${i}`,
          age: i,
          age1: 100 - i,
          sex: Math.round(Math.random() * 1) + 1,
          address: "No. 189, Grove St, Los Angeles"
        });
      }
      tableData.value = data;
      resolve({
        rows: data,
        total: total
      });
    }, 1500);
  });
}
</script>
```
