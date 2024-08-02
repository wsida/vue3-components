<template>
  <div class="es-body-tree-editor" :class="{'is-disabled': disabled}">
    <div class="es-body-tree-editor__header">
      <div class="es-body-tree-editor__row">
        <div class="es-body-tree-editor__th cell-paramName"><span class="cell">字段名</span></div>
        <div class="es-body-tree-editor__th cell-nullable"><span class="cell">是否必填</span></div>
        <div class="es-body-tree-editor__th cell-paramType"><span class="cell">字段类型</span></div>
        <div class="es-body-tree-editor__th cell-maxLength"><span class="cell">长度</span></div>
        <div class="es-body-tree-editor__th cell-defaultValue"><span class="cell">默认值</span></div>
        <div class="es-body-tree-editor__th cell-remark"><span class="cell">说明</span></div>
        <div v-if="!disabled" class="es-body-tree-editor__th cell-actions"><span class="cell">操作</span></div>
      </div>
    </div>
    <div class="es-body-tree-editor__body">
      <el-tree-v2
        ref="bodyTreeRef"
        :data="treeData"
        :props="treeProps"
        :height="height - 48"
        :expand-on-click-node="false"
        :highlight-current="false"
        :item-size="40"
      >
        <template #default="{ node }">
          <div class="es-body-tree-editor__row">
            <div class="es-body-tree-editor__td cell-paramName">
              <el-tag v-if="node.data.isRoot" size="large" type="primary">根节点</el-tag>
              <el-tag v-else-if="isItems(node)" size="large" type="success">Items</el-tag>
              <el-input
                v-else-if="!disabled"
                type="text"
                clearable
                :readonly="disabled"
                v-model="node.data.paramName"
                @change="handleChangeField('paramName', node.data.paramName, node.data, node)"
              />
              <div
                v-else
                class="cell"
                @mouseover="(e) => { handleMouseover(e, node.data.paramName) }"
                @mouseenter="(e) => { handleMouseenter(e, node.data.paramName) }"
                @mouseleave="(e) => { handleMouseleave(e) }"
              >{{node.data.paramName}}</div>
            </div>
            <div class="es-body-tree-editor__td cell-nullable">
              <el-checkbox
                v-if="!node.data.isRoot"
                :true-value="0"
                :false-value="1"
                :disabled="disabled"
                v-model="node.data.nullable"
                @change="handleChangeField('nullable', node.data.nullable, node.data, node)"
              />
            </div>
            <div class="es-body-tree-editor__td cell-paramType">
              <div v-if="!node.data.isRoot && !disabled" class="flex items-center">
                <el-select
                  class="flex-1"
                  :disabled="disabled"
                  v-model="node.data.paramType"
                  @change="handleChangeField('paramType', node.data.paramType, node.data, node)"
                >
                  <el-option
                    v-for="item in paramTypes"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
                <ParamTypeSettings
                  v-model="node.data.extra"
                  :paramType="node.data.paramType"
                  :disabled="node.data.paramType === 'Object' || paramTypes.indexOf(node.data.paramType) === -1"
                />
              </div>
              <div
                v-else-if="!node.data.isRoot && disabled"
                class="cell"
              >{{node.data.paramType}}</div>
            </div>
            <div class="es-body-tree-editor__td cell-maxLength">
              <el-input
                v-if="!node.data.isRoot && !disabled"
                :readonly="disabled"
                :disabled="!disabled && (node.data.paramType !== 'String' && node.data.paramType !== 'Array')"
                type="number"
                :min="0"
                v-model="node.data.maxLength"
                @change="handleChangeField('maxLength', node.data.paramName, node.data, node)"
              />
              <div
                v-else-if="!node.data.isRoot && disabled && !(node.data.paramType !== 'String' && node.data.paramType !== 'Array')"
                class="cell"
              >{{node.data.maxLength}}</div>
            </div>
            <div class="es-body-tree-editor__td cell-defaultValue">
              <el-autocomplete
                v-if="!node.data.isRoot && !disabled"
                clearable
                :readonly="disabled"
                :disabled="!disabled && (node.data.paramType === 'Array' || node.data.paramType === 'Object')"
                v-model="node.data.defaultValue"
                popper-append-to-body
                @change="handleChangeField('defaultValue', node.data.defaultValue, node.data, node)"
                :fetch-suggestions="(queryString, callback) => { queryMockSearch(node.data, queryString, callback) }"
              />
              <!-- <el-input
                v-if="!node.data.isRoot && !disabled"
                type="text"
                clearable
                :readonly="disabled"
                :disabled="!disabled && (node.data.paramType === 'Array' || node.data.paramType === 'Object')"
                v-model="node.data.defaultValue"
                @change="handleChangeField('defaultValue', node.data.defaultValue, node.data, node)"
              /> -->
              <div
                v-else-if="!node.data.isRoot && disabled"
                class="cell"
                @mouseover="(e) => { handleMouseover(e, node.data.defaultValue) }"
                @mouseenter="(e) => { handleMouseenter(e, node.data.defaultValue) }"
                @mouseleave="(e) => { handleMouseleave(e) }"
              >{{node.data.defaultValue}}</div>
            </div>
            <div class="es-body-tree-editor__td cell-remark">
              <el-input
                v-if="!node.data.isRoot && !disabled"
                type="text"
                clearable
                :readonly="disabled"
                v-model="node.data.remark"
                @change="handleChangeField('remark', node.data.remark, node.data, node)"
              />
              <div
                v-else-if="!node.data.isRoot && disabled"
                class="cell"
                @mouseover="(e) => { handleMouseover(e, node.data.remark) }"
                @mouseenter="(e) => { handleMouseenter(e, node.data.remark) }"
                @mouseleave="(e) => { handleMouseleave(e) }"
              >{{node.data.remark}}</div>
            </div>
            <div v-if="!disabled" class="es-body-tree-editor__td cell-actions">
              <el-dropdown @command="(command: string) => { handleAddChild(command, node.data, node) }">
                <el-button
                  link
                  type="primary"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="child" v-if="node.data.isRoot || isItems(node) || node.data.paramType === 'Object'">添加子节点</el-dropdown-item>
                    <el-dropdown-item command="brother" v-if="!isItems(node) && !node.data.isRoot">添加兄弟节点</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button
                v-if="!isItems(node) && !node.data.isRoot"
                class="ml-2"
                link
                type="danger"
                @click="handleDeleteChild(node.data, node)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </template>
      </el-tree-v2>
    </div>
    <el-tooltip
      v-if="tooltip && disabled"
      ref="tooltipRef"
      :visible="tooltipVisible"
      :popper-options="popperOptions"
      :virtual-ref="triggerTooltipRef"
      virtual-triggering
    >
      <template #content>
        <div>{{tooltipContent}}</div>
      </template>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Delete, Plus } from '@element-plus/icons-vue';
import { withDefaults, defineEmits, computed, ref, nextTick, watch } from 'vue';
import { BodyTreeNode } from '../types';
import { paramTypes } from '../children/config';
import { cloneDeep, debounce, template } from 'lodash-es';
import { ElTooltip, ElTreeV2, TreeNode } from 'element-plus';
import { getTreeNodeKeys } from '../children/utils';
import { INIT_NODE, INIT_NODE_EXTRA, getDefaultField } from '../children/treeNode';
import { RANDOM_MOCK_MAP } from '../children/random';
import ParamTypeSettings from './ParamTypeSettings.vue'

const emits = defineEmits<{
  (e: 'update:modelValue', val: BodyTreeNode[]): void
}>()

const rootNode = ref<BodyTreeNode>(createTreeNode(true))

const props = withDefaults(
  defineProps<{
    modelValue: BodyTreeNode[]
    height: number
    expandTree?: boolean
    disabled?: boolean
    tooltip?: boolean
  }>(),
  {
    height: 400,
    disabled: false,
    tooltip: true
  }
)

const treeProps = {
  value: 'paramId',
  label: 'paramName',
  children: 'children',
}

const bodyTreeRef = ref<InstanceType<typeof ElTreeV2>|null>(null)

const tooltipRef = ref<InstanceType<typeof ElTooltip>|null>(null)
const triggerTooltipRef = ref<EventTarget|null>(null)
const tooltipContent = ref('')
const tooltipVisible = ref(false)
const popperOptions = {
  modifiers: [
    {
      name: 'computeStyles',
      options: {
        adaptive: false,
        enabled: false
      }
    }
  ]
}

const treeData = computed<BodyTreeNode[]>({
  get() {
    rootNode.value.children = props.modelValue
    return [rootNode.value]
  },

  set(val: BodyTreeNode[]) {
    rootNode.value = val[0]
    const newVal =  [...rootNode.value.children]
    emits('update:modelValue', newVal)
  }
})

const lazyChangeTooltip = debounce((visible: boolean) => {
  tooltipVisible.value = visible
}, 500)

function isItems(node: TreeNode): boolean {
  return !!node.parent && node.parent.data.paramType === 'Array'
}

function isOverflow(e: MouseEvent): boolean {
  const target = e.target as HTMLElement
  return target.scrollWidth > target.offsetWidth
}

function createTreeNode(isRoot = false, isItems = false) {
  const node = cloneDeep(INIT_NODE)
  if (isRoot) {
    node.isRoot = true
  }
  if (!isRoot && !isItems) {
    node.paramName = getDefaultField()
  }
  node.paramId = new Date().getTime()
  return node
}

function expandNode(node: TreeNode) {
  nextTick(() => {
    bodyTreeRef.value && bodyTreeRef.value.expandNode(node as any)
  })
}

function expandNodeByKeys(keys: Array<string|number>) {
  nextTick(() => {
    bodyTreeRef.value && bodyTreeRef.value.setExpandedKeys(keys)
  })
}

function getTreeNode(id: string|number): TreeNode {
  return bodyTreeRef.value.getNode(id)
}

function queryMockSearch(data: BodyTreeNode, query: string, callback: Function): void {
  const randoms = data.paramType ? RANDOM_MOCK_MAP[data.paramType] || [] : []
  if (!randoms.length) {
    callback(randoms)
  } else if (query.startsWith('@')) {
    callback(randoms.filter((item: string) => item.startsWith(query)).map((item: string) => ({value: item})))
  } else {
    callback([])
  }
}

function handleMouseover(e: MouseEvent, content: string) {
  if (!props.tooltip || !props.disabled || !content) return
  if (!isOverflow(e)) return
  triggerTooltipRef.value = e.target
  tooltipContent.value = content
  /* if (!tooltipVisible.value) {
    lazyChangeTooltip(true)
  } */
}

function handleMouseenter(e: MouseEvent, content: string) {
  if (!props.tooltip || !props.disabled || !content) return
  if (isOverflow(e)) {
    lazyChangeTooltip(true)
  }
}

function handleMouseleave(e: MouseEvent) {
  lazyChangeTooltip(false)
}

function handleAddChild(command: string, data: BodyTreeNode, node: TreeNode) {
  if (props.disabled) return
  const newNode = createTreeNode()
  if (command === 'child') {
    if (data.children) {
      data.children.push(newNode)
    } else {
      data.children = [newNode]
    }
    expandNode(node)
  } else if (command === 'brother') {
    if (node.parent.data.children) {
      const index = node.parent.data.children.findIndex((child: BodyTreeNode): boolean => child.paramId === data.paramId)
      node.parent.data.children.splice(index + 1, 0, newNode)
    } else {
      node.parent.data.children = [newNode]
    }
    expandNode(node.parent)
  }
  treeData.value = [...treeData.value]
}

function handleDeleteChild(data: BodyTreeNode, node: TreeNode) {
  if (props.disabled) return
  node.parent.data.children = node.parent.data.children.filter((child: BodyTreeNode): boolean => child.paramId !== data.paramId)
  treeData.value = [...treeData.value]
}

function handleChangeField(field: string, val: any, data: BodyTreeNode, node: TreeNode) {
  if (props.disabled) return
  if (field === 'paramType') {
    data.children = []
    data.defaultValue = INIT_NODE.defaultValue // 重置默认值
    data.extra = cloneDeep(INIT_NODE_EXTRA)
    if (val === 'Array') {
      // TODO: 不保留子节点编辑
      data.children = [createTreeNode(false, true)]
      expandNode(node)
    }

    /* if (['Array', 'Object'].indexOf(val) !== -1) {
      data.defaultValue = INIT_NODE.defaultValue
    } */

    if (['String', 'Array'].indexOf(val) === -1) {
      data.maxLength = INIT_NODE.maxLength
    }
  }
  treeData.value = [...treeData.value]
}

watch(
  () => props.expandTree,
  (val) => {
    if (val) {
      if (props.modelValue.length) {
        nextTick(() => {
          const expandKeys = getTreeNodeKeys(props.modelValue)
          expandKeys.push(rootNode.value.paramId)
          expandNodeByKeys(expandKeys)
        })
      }
    }
  },
  {
    immediate: true
  }
)

defineExpose({
  getTreeNode,
  expandNodeByKeys,
  expandNode,
  bodyTreeRef
})

</script>

<style lang="less" scoped>
.es-body-tree-editor {
  @apply relative w-full overflow-x-hidden overflow-y-hidden;
  max-width: 1536px;
  min-width: 1000px;

  &.is-disabled {
    min-width: 900px !important;
    /* .es-body-tree-editor__td {
      :deep(.el-input__wrapper), 
      :deep(.el-select__wrapper) {
        box-shadow: none !important;
      }
    } */
  }

  &__header {
    @apply relative;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__body {
    @apply relative;
  }
  &__row {
    @apply relative flex flex-nowrap items-center justify-start overflow-hidden;
  }
  &__th,
  &__td {
    @apply px-2 py-1;
  }
  &__th {
    .cell {
      font-size: 14px;
      line-height: 22px;
      display: inline-block;
      color: var(--el-text-color-secondary);
      font-weight: 600;
    }
    .cell-paramName {
      .cell {
        @apply pl-6;
      }
    }
  }
  &__td {
    .cell {
      @apply relative w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
      line-height: 32px;
    }
  }

  .cell-paramName {
    flex: 3;
    min-width: 140px;
  }

  .cell-remark {
    @apply flex-shrink-0;
    width: 220px;
  }

  .cell-defaultValue {
    @apply flex-shrink-0;
    width: 160px;
  }

  .cell-paramType {
    @apply flex-shrink-0;
    width: 140px;
  }

  .cell-maxLength {
    @apply flex-shrink-0;
    width: 100px;
  }

  .cell-nullable {
    @apply flex-shrink-0;
    width: 100px;
  }

  .cell-actions {
    @apply flex-shrink-0 flex items-center justify-start;
    width: 100px;
  }

  :deep(.el-tree-node__content) {
    border-bottom: 1px solid var(--el-border-color-lighter);
    .es-body-tree-editor__row {
      flex: 1;
    }
  }
}

// @media screen and (min-width: 1536px) {
//   .es-body-tree-editor {
//     .cell-remark {
//       width: 320px !important;
//     }
//   }
// }
</style>
