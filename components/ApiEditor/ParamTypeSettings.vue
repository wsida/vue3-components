<template>
  <el-popover
    placement="right"
    :disabled="disabled"
    :width="width"
    trigger="click"
  >
    <template #default v-if="!!extraModel">
      <el-descriptions
        direction="vertical"
        :column="2"
        title="高级配置"
        size="small"
      >
        <template v-if="paramType === 'String'">
          <el-descriptions-item label="最小长度">
            <el-input-number size="small" v-model="extraModel.min" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="最大长度">
            <el-input-number size="small" v-model="extraModel.max" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="Pattern" :span="2">
            <el-input size="small" v-model="extraModel.regexp" placeholder="^[A-Za-z0-9]+$" />
          </el-descriptions-item>
        </template>
        <template v-if="isNumber(paramType)">
          <el-descriptions-item label="最小值">
            <el-input-number size="small" v-model="extraModel.min" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="最大值">
            <el-input-number size="small" v-model="extraModel.max" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
        </template>
        <template v-if="isFloat(paramType)">
          <el-descriptions-item label="最少小数位">
            <el-input-number size="small" v-model="extraModel.dmin" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="最多小数位">
            <el-input-number size="small" v-model="extraModel.dmax" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
        </template>
        <template v-if="paramType === 'Array'">
          <el-descriptions-item label="最少元素">
            <el-input-number size="small" v-model="extraModel.min" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="最多元素">
            <el-input-number size="small" v-model="extraModel.max" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
        </template>
        <template v-if="paramType === 'Date' || paramType === 'DateTime' || paramType === 'String'">
          <el-descriptions-item :span="2" label="Format">
            <el-input size="small" v-model="extraModel.format" placeholder="yyyy-MM-dd HH:mm:ss" />
          </el-descriptions-item>
        </template>
        <template v-if="paramType === 'Boolean'">
          <el-descriptions-item label="起始范围">
            <el-input-number size="small" v-model="extraModel.min" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
          <el-descriptions-item label="结束范围">
            <el-input-number size="small" v-model="extraModel.max" placeholder=">=0" controls-position="right" :min="0" step="1" />
          </el-descriptions-item>
        </template>
        <el-descriptions-item :span="2" label="枚举值">
          <el-input size="small" type="textarea" v-model="extraModel.enums" :rows="4" placeholder="多个值换行分隔" />
        </el-descriptions-item>
      </el-descriptions>
    </template>
    <template #reference>
      <el-button class="flex-shrink-0 ml-1" link type="primary" title="高级配置" :disabled="disabled">
        <el-icon><Operation /></el-icon>
      </el-button>
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { Operation } from '@element-plus/icons-vue';
import { computed, withDefaults, watch } from 'vue'
import { BodyTreeNodeExtra } from '../types';
import { cloneDeep } from 'lodash-es';
import { INIT_NODE_EXTRA } from '../children/treeNode';

const emits = defineEmits<{
  (e: 'update:modelValue', val: BodyTreeNodeExtra): void
}>()

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    width?: number | string
    modelValue: BodyTreeNodeExtra
    paramType: string
  }>(),
  {
    width: 300,
    disabled: false
  }
)

const extraModel = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  }
})

watch(extraModel, (val) => {
  if (!val) {
    extraModel.value = cloneDeep(INIT_NODE_EXTRA)
  }
}, {immediate: true})

function isInteger(type: string): boolean {
  return ['Integer', 'Long'].indexOf(type) !== -1
}

function isFloat(type: string): boolean {
  return ['Float', 'Double'].indexOf(type) !== -1
}

function isNumber(type: string): boolean {
  return isInteger(type) || isFloat(type)
}
</script>