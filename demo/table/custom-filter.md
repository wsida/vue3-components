```vue
<template>
  <RePageCard ignorePaddingBottom>
    <ReSearchForm
      :cols="4"
      :showLabel="false"
      :items="formItems"
      @search="handleSearch"
    />
  </RePageCard>
  <RePageCard>
    <ReTable
      :customFilters="customFilters"
      :data="tableData"
      :columns="columns"
    />
  </RePageCard>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const customFilters = ref([]);
const formItems = ref([
  {
    label: "Name",
    field: "name",
    defaultValue: "",
    comp: "el-input",
    props: {
      placeholder: "输入 tom1 观察"
    }
  },
  {
    label: "忽略大小写",
    field: "ignoreCase",
    defaultValue: false,
    comp: "el-radio-group",
    options: [
      { label: "是", value: true },
      { label: "否", value: false }
    ]
  }
]);
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
function handleSearch(formData) {
  if (!formData.name) {
    customFilters.value = [];
  } else {
    customFilters.value = [
      {
        prop: "name",
        ignoreCase: formData.ignoreCase,
        value: formData.name,
        type: "^=" // = ; .
      }
    ];
  }
}
</script>
```