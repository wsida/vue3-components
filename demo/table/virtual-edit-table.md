```vue
<template>
  <RePageCard>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">Virtual Edit：</span>
      <el-switch v-model="virtual" />
    </div>
  </RePageCard>
  <RePageCard v-if="virtual">
    <ReVirtualEditTable
      v-model:data="tableData"
      :editable="true"
      :columns="columns"
      :pageSize="10"
      :max-height="600"
    />
  </RePageCard>
  <RePageCard v-if="!virtual">
    <ReEditTable
      v-model:data="tableData"
      :editable="true"
      :columns="columns"
      :max-height="600"
    />
  </RePageCard>
</template>

<script lang="ts" setup>
import { ref, onBeforeMount } from "vue";

const virtual = ref(true);
const tableData = ref([]);

const columns = ref([
  {
    editable: true,
    required: true,
    label: "姓名",
    prop: "name",
    minWidth: 100,
    defaultValue: "",
    comp: "el-input",
    props: { placeholder: "please input" }
  },
  {
    editable: true,
    label: "性别",
    prop: "sex",
    minWidth: 80,
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
    minWidth: 140,
    comp: "el-input-number",
    props: { step: 1, controlsPosition: "right" },
    rules: [
      { required: true, message: "required!!" },
      { type: "number", min: 1, trigger: "change" }
    ]
  }
]);

onBeforeMount(() => {
  const data = [];
  for (let i = 1; i < 500; i++) {
    data.push({
      date: "2016-05-03",
      name: `Tom${i}`,
      age: i,
      age1: i,
      sex: (i % 2) + 1
    });
  }

  tableData.value = data;
});
</script>
```
