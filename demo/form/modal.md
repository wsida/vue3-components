```vue
<template>
  <div>
    <el-button @click="visible = true">打卡模态框</el-button>
    <ReModalForm
      v-model="visible"
      v-model:formData="formData"
      width="720px"
      title="这是标题"
      :items="formItems"
      :formProps="{ labelPosition: 'right', labelWidth: 140 }"
      @submit="handleSubmit"
    >
      <template #default-header>
        <el-alert
          style="margin-bottom: 16px"
          type="warning"
          :closable="false"
          title="这是表单输入提示"
        ></el-alert>
      </template>
      <template #header>
        <div>这是标题slot</div>
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
        <el-input-number v-model="formData.age" :min="1" :max="9999" />
        <div class="ml-2">custom age control</div>
      </template>
      <!-- <template #footer>
        <div>这是footer slot</div>
      </template> -->
    </ReModalForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const visible = ref(false);
const formData = ref({
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

function handleSubmit(formData) {
  console.log("submit form data", formData);
}
</script>
```
