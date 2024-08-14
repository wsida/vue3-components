```vue
<template>
  <div>
    <ReForm
      size="default"
      label-position="right"
      :label-width="100"
      :items="formItems"
      @submit="handleSubmit"
    >
      <template #age-control="{ item }">
        <el-input-number v-bind="item.props" v-on="item.events" />
        <div class="ml-2">custom age control</div>
      </template>
      <template #age3-control="{ item }">
        <el-input-number v-bind="item.props" v-on="item.events" />
        <div class="ml-2">custom age3 control</div>
      </template>
    </ReForm>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
const formItems = ref([
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
    defaultValue: 3,
    slot: "age-control"
  },
  {
    type: "group",
    field: "extra", // 单纯为了一个唯一值，所以一定要配置，不记录表单数据
    defaultCollapsed: true, // 默认展开/收起
    collapsedText: "更多配置", // ['展开更多配置', '收起更多配置']
    collapsedTriggerIndex: true, // 触发器缩进 - label-position === 'left' / 'right' 需要控制
    // groupSlot: "extra-group", // 自定义触发器插槽，默认[field]-group
    children: [
      {
        label: "Age3",
        field: "age3",
        defaultValue: 3,
        slot: "age3-control"
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
    ]
  },
  {
    label: "随意发挥",
    field: "easygoing",
    defaultValue: "",
    comp: "el-textarea",
    tooltip: "这是tooltip",
    props: {
      rows: 4
    },
    rules: [{ required: true, message: "不能为空" }]
  }
]);

function handleSubmit(formData) {
  console.log("submit form data", formData);
}
</script>
```
