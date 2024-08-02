<template>
  <div class="es-body-form-data">
    <div class="mb-12px">
      <el-button type="primary" @click="handleAdd()">
        <el-icon><Plus /></el-icon>添加参数
      </el-button>
      <el-button @click="handleClear()">
        <el-icon><RefreshLeft /></el-icon>清空
      </el-button>
    </div>
    <page-table border :data="formData" :pageSize="10">
      <el-table-column prop="key" label="参数名" minWidth="140">
        <template #default="scope">
          <el-input type="text" v-model="scope.row.key" @change="handleChange(scope.$index, 'key', scope.row.key)" />
        </template>
      </el-table-column>
      <el-table-column prop="value" label="参数值" minWidth="220">
        <template #default="scope">
          <FormDataValue
            v-model="scope.row.value"
            v-model:type="scope.row.type"
            @update:modelValue="handleChange(scope.$index, 'value', scope.row.value)"
            @update:type="handleChange(scope.$index, 'type', scope.row.type)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="action" label="操作" align="center" width="180">
        <template #default="scope">
          <el-button link type="primary" title="添加参数" @click="handleAdd(scope.$index)">
            <el-icon><Plus /></el-icon>
          </el-button>
          <el-button link type="danger" title="删除参数" @click="handleDelete(scope.$index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </template>
      </el-table-column>
    </page-table>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus, RefreshLeft } from '@element-plus/icons-vue'
import PageTable from '@/components/PageTable.vue'
import { BodyFormData } from '../types'
import { computed, defineEmits } from 'vue'
import FormDataValue from './FormDataValue.vue'

const INIT_ROW: BodyFormData = {
  key: '',
  type: 'String', // String / File / Boolean / Number
  value: undefined
}

const emits = defineEmits<{
  (e: 'update:modelValue', val: BodyFormData[]): void
}>()

const props = defineProps<{
  modelValue: BodyFormData[]
}>()

const formData = computed<BodyFormData[]>({
  get() {
    return props.modelValue || []
  },

  set(val) {
    emits('update:modelValue', val)
  }
})

function handleClear() {
  formData.value = []
}

function handleAdd(index = -1) {
  const newVal = [...formData.value]
  if (index === -1) {
    newVal.push({...INIT_ROW})
  } else {
    newVal.splice(index + 1, 0, {...INIT_ROW})
  }
  formData.value = newVal
}

function handleDelete(index) {
  const newVal = [...formData.value]
  newVal.splice(index, 1)
  formData.value = newVal
}

function handleChange(index, field, val) {
  // console.log(index, field, val)
  const newVal = [...formData.value]
  newVal[index][field] = val
  formData.value = newVal
}
</script>
