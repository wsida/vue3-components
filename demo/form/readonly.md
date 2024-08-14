```vue
<template>
  <div>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">只读：</span>
      <el-switch v-model="readonly" />
    </div>
    <div class="flex items-center mb-4">
      <span class="text-gray-700 text-[14px]">禁用：</span>
      <el-switch v-model="disabled" />
    </div>
    <ReForm
      size="default"
      label-position="right"
      :editable="!readonly"
      :disabled="disabled"
      :label-width="100"
      :items="formItems"
      @submit="handleSubmit"
    ></ReForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const readonly = ref(false);
const disabled = ref(false);
const formItems = ref([
  {
    label: "ID",
    field: "id",
    defaultValue: "just text content",
    type: "text",
    customClass: "is-required" // 通过样式类展示必填ico，不直接绑定required属性，会有校验问题
  },
  {
    label: "Name",
    field: "name",
    defaultValue: "",
    comp: "el-input",
    // labelSlot: "name-label", 默认字段标签名插槽命名规则 [field]-label，也可以自定义
    tooltip: "这是tooltip",
    props: {
      clearable: true
    },
    rules: [{ required: true, message: "不能为空" }]
  },
  {
    label: "Age",
    field: "age",
    comp: "el-input",
    props: {
      type: "number",
      min: 1,
      max: 9999
    },
    events: {
      focus: handleNumberFocus,
      blur: handleNumberBlur
    }
  },
  {
    label: "Remark",
    field: "remark",
    comp: "el-textarea",
    props: {
      rows: 4
    }
  },
  {
    label: "Birthday",
    field: "birthday",
    comp: "el-date-picker",
    tooltip: "这是tooltip",
    props: {
      type: "date",
      format: "YYYY/MM/DD",
      class: "w-full"
    }
  },
  {
    label: "Subject",
    field: "subject",
    comp: "el-select",
    tooltip: "这是tooltip",
    tips: "这是显眼的tips",
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
    rules: [{ required: true, message: "不能为空" }],
    props: {
      clearable: true
    }
  },
  {
    label: "Hobby",
    field: "hobby",
    comp: "el-checkbox-group",
    labelKey: "name",
    valueKey: "id",
    options: [
      {
        name: "hobby1",
        id: "1"
      },
      {
        name: "hobby2",
        id: "2"
      },
      {
        name: "hobby3",
        id: "3"
      }
    ],
    defaultValue: ["1"],
    props: {
      clearable: true
    }
  },
  {
    label: "Marry",
    field: "marry",
    comp: "el-radio-group",
    options: [
      {
        label: "married",
        value: "1"
      },
      {
        label: "none",
        value: "2"
      }
    ],
    defaultValue: "2",
    props: {
      clearable: true
    }
  }
]);

function handleNumberFocus() {
  console.log("number focus");
}

function handleNumberBlur() {
  console.log("number blur");
}

function handleSubmit(formData) {
  console.log("submit form data", formData);
}
</script>
```
