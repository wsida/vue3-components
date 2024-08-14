```vue
<template>
  <div>
    <ReForm
      size="default"
      label-position="top"
      :formRef="val => (elFormRef = val)"
      :items="formItems"
      v-model="localFormData"
    >
      <template #btns>
        <el-button @click="handleSubmit">去提交</el-button>
        <el-button @click="handleCancel">返回</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button>其他操作</el-button>
      </template>
      <template #name-label>
        <span>Custom Name</span>
      </template>
      <template #birthday-label>
        <span>Custom Birthday</span>
      </template>
      <template #name-control="{ item }">
        <el-input v-bind="item.props" v-on="item.events" />
        <div class="ml-2">custom name control</div>
      </template>
      <template #age-control>
        <el-input-number v-model="localFormData.age" :min="1" :max="9999" />
        <div class="ml-2">custom age control</div>
      </template>
    </ReForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const elFormRef = ref(null);
const localFormData = ref({
  name: "",
  age: 1,
  date: undefined,
  subject: undefined,
  hobby: undefined,
  marry: "2"
});
const formItems = ref([
  {
    label: "Name",
    field: "name",
    defaultValue: "",
    comp: "el-input",
    // labelSlot: "name-label", 默认字段标签名插槽命名规则 [field]-label，也可以自定义
    slot: "name-control",
    tooltip: "这是tooltip",
    props: {
      clearable: true
    },
    rules: [{ required: true, message: "不能为空" }]
  },
  {
    label: "Age",
    field: "age",
    defaultValue: 3,
    slot: "age-control"
  },
  {
    label: "Birthday",
    field: "birthday",
    comp: "el-date-picker",
    tooltip: "这是tooltip",
    props: {
      type: "date",
      format: "YYYY/MM/DD"
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
    childComp: "el-radio-button",
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
function handleSubmit() {
  console.log("elFormRef", elFormRef.value);
  elFormRef.value &&
    elFormRef.value.validate(valid => {
      if (valid) {
        console.log("formData", elFormRef.value.formData);
      }
    });
}
function handleCancel() {
  console.log("cancel");
}
function handleReset() {
  if (elFormRef.value) {
    elFormRef.value.resetFields();
    console.log("formData", elFormRef.value.formData);
  }
}
</script>
```
