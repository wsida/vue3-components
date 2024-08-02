<template>
  <div class="es-form-data-value">
    <div class="es-form-data-value__left">
      <el-select class="w-32" key="type" v-model="localType" placeholder="请选择">
        <el-option v-for="item in valueTypes" :key="item" :value="item" :label="item">{{ item }}</el-option>
      </el-select>
    </div>
    <div class="es-form-data-value__right">
      <el-input v-if="localType === valueTypes[0]" key="text-file" type="text" v-model="localValue" />
      <el-input v-if="localType === valueTypes[1]" key="number-file" type="number" v-model="localValue" />
      <el-select v-if="localType === valueTypes[2]" v-model="localValue">
        <el-option v-for="item in [true, false]" :key="item" :value="item" :label="item">{{ item }}</el-option>
      </el-select>
      <el-upload
        v-if="localType === valueTypes[3]"
        ref="uploadRef"
        key="fileUpload"
        action=""
        :limit="2"
        :multiple="false"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
      >
        <template #trigger>
          <el-button>选择文件</el-button>
        </template>
        <template #tip><span class="ml-2">{{localValue && localValue[0] ? localValue[0].name : ''}}</span></template>
      </el-upload>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { ElInput } from 'element-plus'
import type { BodyFormDataValue } from '../types'

const inputFileRef = ref<InstanceType<typeof ElInput|null>>(null)

const emits = defineEmits<{
  (e: 'update:modelValue', modelValue: BodyFormDataValue): void
  (e: 'update:type', type: string)
}>()

const props = defineProps<{
  modelValue: BodyFormDataValue
  type: string
}>()

const valueTypes = ['String', 'Number', 'Boolean', 'File']

const localType = computed({
  get() {
    return props.type
  },
  set(val) {
    emits('update:type', val)
  }
})

const localValue = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emits('update:modelValue', val)
  }
})

watch(localType, (val) => {
  if (val === valueTypes[0]) {
    localValue.value = ''
  } else if (val === valueTypes[1]) {
    localValue.value = 0
  } else if (val === valueTypes[2]) {
    localValue.value = true
  } else if (val === valueTypes[3]) {
    localValue.value = []
  } else {
    localValue.value = undefined
  }
})

function handleFileChange(uploadFile: any) {
  localValue.value = [uploadFile]
}

</script>

<style lang="less" scoped>
.es-form-data-value {
  @apply relative flex flex-row flex-nowrap;

  &__left {
    @apply flex-shrink-0 -mr-1px relative;
    :deep(.el-select__wrapper) {
      @apply relative z-1 hover:z-4;
      &.is-focused {
        @apply z-4;
      }
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__right {
    @apply flex-1 relative z-3 hover:z-4;
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      @apply relative z-1 hover:z-4;
      &.is-focused {
        @apply z-4;
      }
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}
</style>