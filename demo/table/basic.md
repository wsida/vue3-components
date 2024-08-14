```vue
<template>
  <RePageCard>
    <ReTable
      :data="tableData"
      :columns="columns"
      @cell-click="handleCellClick"
      @header-click="handleHeaderClick"
    />
  </RePageCard>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const tableData = ref([
  {
    date: "2016-05-03",
    name: "Tom1",
    age: 1,
    age1: 1,
    sex: 1,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-02",
    name: "Tom2",
    age: 2,
    age1: 12,
    sex: 1,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-04",
    name: "Tom3",
    age: undefined,
    age1: 2,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-01",
    name: "Tom4",
    age: 1,
    age1: 22,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-03",
    name: "Tom5",
    age: 10,
    sex: 1,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-02",
    name: "Tom6",
    age: 6,
    age1: 21,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-04",
    name: "Tom7",
    age: 7,
    age1: 12,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-01",
    name: "Tom8",
    age: 8,
    age1: 10,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-03",
    name: "Tom9",
    age: 9,
    age1: 3,
    sex: 1,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-02",
    name: "Tom10",
    age: 11,
    sex: 1,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-04",
    name: "Tom11",
    age: 1,
    age1: 2,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2016-05-01",
    name: "Tom12",
    age: 1,
    age1: 2,
    sex: 2,
    address: "No. 189, Grove St, Los Angeles"
  }
]);
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

function handleCellClick(row: any, column: any) {
  console.log("cell click", row, column);
}
function handleHeaderClick(column: any) {
  console.log("header click", column);
}
</script>
```
