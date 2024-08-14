```vue
<template>
  <RePageCard>
    <ReEditTable
      v-model:data="tableData"
      edit-trigger="cell"
      :render-action="false"
      :columns="columns"
    ></ReEditTable>
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
  {
    editable: true,
    required: true,
    label: "姓名",
    prop: "name",
    defaultValue: "",
    comp: "el-input",
    slot: "name-control",
    props: { placeholder: "please input" }
  },
  {
    editable: true,
    label: "性别",
    prop: "sex",
    labelKey: "name",
    valueKey: "value",
    options: [
      { name: "男", value: 1 },
      { name: "女", value: 2 }
    ],
    defaultValue: 1,
    rules: { required: true },
    comp: "el-radio-group",
    childComp: "el-radio"
  },
  {
    label: "年龄",
    prop: "age",
    defaultValue: 1,
    editable: true,
    comp: "el-input-number",
    props: { step: 1, controlsPosition: "right" },
    rules: [
      { required: true, message: "required!!" },
      { type: "number", min: 1, trigger: "change" }
    ]
  }
]);
</script>
```
