```vue
<template>
  <RePageCard>
    <ReTable
      remote
      :auto-remote="true"
      :first-remote="true"
      :remote-method="remoteMethod"
      :total="total"
      :data="tableData"
      :columns="columns"
    />
  </RePageCard>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const total = ref(Math.floor(Math.random() * 100));
const tableData = ref([]);

const columns = ref([
  { label: "日期", prop: "date" },
  { label: "姓名", prop: "name" },
  {
    label: "性别",
    prop: "sex",
    filterable: true,
    labelKey: "name",
    valueKey: "value",
    options: [
      { name: "男", value: 1 },
      { name: "女", value: 2 }
    ]
  },
  { label: "年龄", prop: "age", sortable: true },
  { label: "地址", prop: "address" }
]);

function remoteMethod({ currentPage, pageSize }, filters, sorts) {
  console.log("params", currentPage, pageSize, filters, sorts);
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
          sex: Math.floor(Math.random() * 1) + 1,
          address: "No. 189, Grove St, Los Angeles"
        });
      }
      tableData.value = data;
      resolve({
        rows: data,
        total: Math.random
      });
    }, 1500);
  });
}
</script>
```
