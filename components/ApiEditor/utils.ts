import { BodyTreeNode } from "../types";
import { cloneDeep, isArray, isBoolean, isEmpty, isObject } from "lodash-es";
import { BodyFormData } from '../types';
import { UploadFile } from 'element-plus';
import { unref } from 'vue';
import { INIT_NODE } from "./treeNode";
import { isNumber } from "windicss/utils";
import { randomBoolean, randomDate, randomDateTime, randomString, randomFloat, randomInteger, generateRandomInteger, randomIntegerByMock } from "./random";

/**
 * 树结构数据转json字符串
 * @param treeData 
 * @returns string
 */
export function treeData2Json(treeData: BodyTreeNode[]): string {
  if (!treeData) return ''
  if (!Array.isArray(treeData)) throw new Error('格式有误，请重置配置！')
  const data = cloneDeep(treeData).filter((node: BodyTreeNode) => !!node.paramName)
  if (!data.length) return ''

  // 删除空字段名数据
  const travelTree = (nodes: BodyTreeNode[]): void => {
    for(const node of nodes) {
      delete node.paramId
      if (node.paramType !== 'Array' && node.paramType !== 'Object') {
        delete node.children
      }
      if (node.children && node.children.length) {
        node.children = node.children.filter((child: BodyTreeNode) => node.paramType === 'Array' || !!child.paramName)
        travelTree(node.children)
      }
    }
  }

  travelTree(data)
  return JSON.stringify(data, null, 2)
}

/**
 * json字符串转树结构数据
 * @param json 
 * @param insertId 
 * @returns 
 */
export function json2TreeData(json: string, insertId = true): BodyTreeNode[] {
  if (!json) return []
  let time: number = new Date().getTime()
  let treeData: BodyTreeNode[] = []
  try {
    treeData = JSON.parse(json)
  } catch(err) {
    treeData = []
  }

  if (insertId && treeData.length) {
    const travelTree = (nodes: BodyTreeNode[]) => {
      for(const node of nodes) {
        node.paramId = time++
        if (node.children && node.children.length) {
          travelTree(node.children)
        }
      }
    }
    travelTree(treeData)
  }

  return treeData
}

/**
 * 获取树结构数据主键
 * @param nodes 
 * @returns 
 */
export function getTreeNodeKeys(nodes: BodyTreeNode[]): Array<string|number> {
  const keys: Array<string|number> = []
  const travelTree = (nodes: BodyTreeNode[]): void => {
    for(const node of nodes) {
      keys.push(node.paramId)
      if (node.children && node.children.length) {
        travelTree(node.children)
      }
    }
  }

  travelTree(nodes)
  return keys
}

/**
 * formdata编辑数据转formdata提交数据
 * @param data 
 * @returns 
 */
export function buildFormData(data: BodyFormData[]): FormData {
  const formData = new FormData()
  for (let item of unref(data)) {
    if (item.type === 'File') {
      formData.append(item.key, (item.value[0] as UploadFile).raw as Blob) // blob 处理
    } else {
      formData.append(item.key, `${item.value}`) // blob 处理
    }
  }
  return formData
}

/* export async function buildFormData(data: BodyFormData[]): Promise<FormData> {
  const formData = new FormData()
  for (let item of data) {
    if (item.type === 'File') {
      await file2Blob((item.value[0] as UploadFile).raw).then(blob => {
        formData.append(item.key, blob) // blob 处理
      })
    } else {
      formData.append(item.key, `${item.value}`) // blob 处理
    }
  }
  return formData
}

export function file2Blob(file: File): Promise<Blob> {
  // 假设你有一个File对象
 // const file = document.getElementById('fileInput').files[0];
 return new Promise(resolve => {
    // 创建FileReader实例
    const reader = new FileReader()
      
    // 使用FileReader的readAsArrayBuffer方法读取文件内容
    reader.readAsArrayBuffer(file)
      
    // 监听load事件，当文件读取完毕后转换Blob
    reader.addEventListener('load', function (event) {
      // 读取结果是一个ArrayBuffer
      const buffer = event.target.result
      
      // 使用ArrayBuffer创建Blob对象
      const blob = new Blob([buffer])
      
      // 现在你有了一个Blob对象，可以根据需要使用它
      resolve(blob)
    })
  })
} */

export function isDateTime(str: string): boolean {
  if (!str) return false
  let date: Date
  try {
    let parseDate = Date.parse(str)
    if (isNaN(parseDate) || !parseDate) return false
    date = new Date(parseDate)
  } catch (err) {
    return false
  }

  return !!date && (date.toISOString() === str || date.toUTCString() === str)
}

export function isInteger(num: number): boolean {
  return num === Math.floor(num);
}

export function isFloat(num: number): boolean {
  return !isInteger(num) && Number.isFinite(num)
}

export function isDouble(num: number): boolean {
  return isFloat(num)
}

export function requestData2TreeData(data: Record<string, any>, insertId = true): BodyTreeNode[] {
  if (!data || !isObject(data) || isEmpty(data)) return []
  const treeData: BodyTreeNode[] = []
  let time = new Date().getTime()
  const travelObj = (obj: Record<string, any>, parent: BodyTreeNode[]): void => {
    const keys = Object.keys(obj)
    for (let key of keys) {
      const node = {
        ...cloneDeep(INIT_NODE),
        paramName: key
      }
      if (insertId) {
        node.paramId = time++
      }if (isArray(obj[key])) {
        node.paramType = 'Array'
        const item = obj[key][0]
        const itemNode = cloneDeep(INIT_NODE)
        if (insertId) {
          itemNode.paramId = time++
        }
        travelArr(item, itemNode)
        node.children = [itemNode]
      } else if (isObject(obj[key])) {
        node.paramType = 'Object'
        travelObj(obj[key], node.children = [])
      } else if (isBoolean(obj[key])) {
        node.defaultValue = `${obj[key]}`
        node.paramType = 'Boolean'
      } else if (isNumber(obj[key])) {
        node.defaultValue = `${obj[key]}`
        if (isInteger(obj[key])) {
          node.paramType = 'Integer'
        } else if (isFloat(obj[key])) {
          node.paramType = 'Float'
        } else {
          node.paramType = 'String'
        }
      } else {
        node.defaultValue = obj[key]
        if (isDateTime(obj[key])) {
          node.paramType = 'DateTime'
        } else {
          // String
          node.paramType = 'String'
        }
      }
      parent.push(node)
    }
  }

  const travelArr = (item: any, itemNode: BodyTreeNode): void => {
    if (item) {
      if (isArray(item)) {
        itemNode.paramType = 'Array'
        const itemNest = item[0]
        const itemNestNode = cloneDeep(INIT_NODE)
        if (insertId) {
          itemNestNode.paramId = time++
        }
        travelArr(itemNest, itemNestNode)
        itemNode.children = [itemNestNode]
      } else if (isObject(item)) {
        itemNode.paramType = 'Object'
        travelObj(item, itemNode.children = [])
      } else if (isBoolean(item)) {
        itemNode.defaultValue = `${item}`
        itemNode.paramType = 'Boolean'
      } else if (isNumber(item)) {
        itemNode.defaultValue = `${item}`
        if (isInteger(item)) {
          itemNode.paramType = 'Integer'
        } else if (isFloat(item)) {
          itemNode.paramType = 'Float'
        } else {
          itemNode.paramType = 'String'
        }
      } else {
        itemNode.defaultValue = item
        if (isDateTime(item)) {
          itemNode.paramType = 'DateTime'
        } else {
          // String
          itemNode.paramType = 'String'
        }
      }
    } else {
      itemNode.paramType = 'String'
    }
  }

  travelObj(data, treeData)
  return treeData
}

/**
 * 参数字段表示树结构数据 转 实际接口调用json数据
 * @param treeData 树结构数据
 * @param ignoreNullable 是否忽略nullable-是否必填配置，忽略则默认设置字段，不忽略根据配置值设置字段
 * @returns 
 */
export function treeData2RequestData(treeData: BodyTreeNode[], ignoreNullable = false): Record<string, any> { 
  if (!treeData || !treeData.length) return {}
  const jsonData: Record<string, any> = {}
  
  const travelObj = (treeData: BodyTreeNode[], traget: Record<string, any>): void => {
    for (let node of treeData) {
      if (!node.paramName) continue
      
      const isNonUndefined = ignoreNullable || !node.nullable || randomBoolean()

      if (isNonUndefined) {
        if (node.paramType === 'Array') {
          traget[node.paramName] = []
          travelArr(node, traget[node.paramName])
        } else if (node.paramType === 'Object') {
          traget[node.paramName] = {}
          travelObj(node.children, traget[node.paramName])
        } else if (node.paramType === 'Boolean') {
          traget[node.paramName] = randomBoolean(node.defaultValue as string, node.extra)
        } else if (node.paramType === 'Date') {
          traget[node.paramName] = randomDate(node.defaultValue as string, node.extra)
        } else if (node.paramType === 'DateTime') {
          traget[node.paramName] = randomDateTime(node.defaultValue as string, node.extra)
        } else if (node.paramType === 'String') {
          traget[node.paramName] = randomString(node.defaultValue as string, node.maxLength, node.extra)
        } else if (node.paramType === 'Integer' || node.paramType === 'Long') {
          traget[node.paramName] = randomInteger(node.defaultValue as string, node.extra)
        } else if (node.paramType === 'Float' || node.paramType === 'Double') {
          traget[node.paramName] = randomFloat(node.defaultValue as string, node.extra)
        } else {
          traget[node.paramName] = undefined
        }
      } else {
        traget[node.paramName] = undefined
      }
    }
  }

  const travelArr = (node: BodyTreeNode, traget: Array<any>): void => {
    if (!node || node.paramType !== 'Array' || !node.maxLength) return
    const itemNode = node.children[0]
    if (!itemNode) return
      
    const isNonUndefined = ignoreNullable || !node.nullable || randomBoolean()

    const min = Math.min(node.maxLength, node?.extra?.min ?? 0)
    const max = Math.max(node.maxLength, node?.extra?.max ?? 0)

    const count = isNonUndefined ? randomIntegerByMock('@integer', min, max) : 0
    for (let i = 0; i < count; i++) {
      if (itemNode.paramType === 'Array') {
        traget[i] = []
        travelArr(itemNode, traget[i])
      } else if (itemNode.paramType === 'Object') {
        traget[i] = {}
        travelObj(itemNode.children, traget[i])
      } else if (itemNode.paramType === 'Boolean') {
        traget[i] = randomBoolean(itemNode.defaultValue as string, itemNode.extra)
      } else if (itemNode.paramType === 'Date') {
        traget[i] = randomDate(itemNode.defaultValue as string, itemNode.extra)
      } else if (itemNode.paramType === 'DateTime') {
        traget[i] = randomDateTime(itemNode.defaultValue as string, itemNode.extra)
      } else if (itemNode.paramType === 'String') {
        traget[i] = randomString(itemNode.defaultValue as string, itemNode.maxLength, itemNode.extra)
      } else if (itemNode.paramType === 'Integer' || itemNode.paramType === 'Long') {
        traget[i] = randomInteger(itemNode.defaultValue as string, itemNode.extra)
      } else if (itemNode.paramType === 'Float' || itemNode.paramType === 'Double') {
        traget[i] = randomFloat(itemNode.defaultValue as string, itemNode.extra)
      } else {
        traget[i] = undefined
      }
    }
  }

  travelObj(treeData, jsonData)
  return jsonData
}
