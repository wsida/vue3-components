```vue
<template>
  <div>
    <RePageCard>
      <div class="flex items-center mb-4">
        <span class="text-gray-700 text-[14px]">展示标签：</span>
        <el-radio-group v-model="showLabel">
          <el-radio :value="true" label="true" />
          <el-radio :value="false" label="false" />
        </el-radio-group>
      </div>
      <div v-if="showLabel" class="flex items-center mb-4">
        <span class="text-gray-700 text-[14px]">标签宽度：</span>
        <el-radio-group v-model="labelWidth">
          <el-radio value="auto" label="auto" />
          <el-radio value="custom" label="custom" />
        </el-radio-group>
      </div>
      <div v-if="showLabel" class="flex items-center mb-4">
        <span class="text-gray-700 text-[14px]">标签位置：</span>
        <el-radio-group v-model="labelPosition">
          <el-radio value="left" label="left" />
          <el-radio value="right" label="right" />
          <el-radio value="top" label="top" />
        </el-radio-group>
      </div>
    </RePageCard>
    <RePageCard ignorePaddingBottom>
      <ReSearchForm
        :cols="{ xl: 4, lg: 3, sm: 2, _960px: 3 }"
        :items="formItems"
        :showLabel="showLabel"
        :labelWidth="labelWidth === 'auto' ? '' : '100px'"
        :labelPosition="labelPosition"
        @reset="handleReset"
        @search="handleSearch"
      />
    </RePageCard>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const showLabel = ref(false);
const labelPosition = ref("left");
const labelWidth = ref("auto");

const formItems = ref([
  {
    label: "Name",
    field: "name",
    defaultValue: "",
    comp: "el-input",
    // labelSlot: "name-label", 默认字段标签名插槽命名规则 [field]-label，也可以自定义
    tooltip: "这是tooltip",
    props: {
      clearable: true,
      placeholder: "Name"
    }
  },
  {
    label: "Age",
    field: "age",
    comp: "el-input",
    props: {
      type: "number",
      placeholder: "Age",
      min: 1,
      max: 9999
    }
  },
  {
    label: "Birthday",
    field: "birthday",
    comp: "el-date-picker",
    tooltip: "这是tooltip",
    props: {
      placeholder: "Birthday",
      type: "date",
      format: "YYYY/MM/DD",
      class: "w-full"
    }
  },
  {
    label: "Subject",
    field: "subject",
    comp: "el-select",
    options: [
      {
        label: "Subject1",
        value: "1"
      },
      {
        label: "Subject2",
        value: "2"
      },
      {
        label: "Subject3",
        value: "3"
      }
    ],
    props: {
      placeholder: "Subject",
      clearable: true
    }
  }
]);

function handleReset() {
  console.log("reset");
}

function handleSearch(formData) {
  console.log("search", formData);
}
</script>
```
