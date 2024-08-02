import type { UploadUserFile } from 'element-plus'

export interface ApiItem {
  projectId: string
  apiId: string
  requestMethod?: string
  requestUri?: string
  apiName?: string
  description?: string
  favId?: string|number
  creator?: string
  // children?: ApiItem[]
}

export interface ApiLogContent {
  extInfo?: unknown
  headers: string
  logContent?: unknown
  params: string
  requestUid: string
  responseContent: string
}

export interface DemoInstance extends ApiDemo {
  _isLog?: boolean
}

export interface ApiDemo extends ApiLog {}

export interface ApiLog {
  apiId: string
  content: ApiLogContent
  createdAt: string
  demo: number
  demoDic?: unknown
  extInfo?: unknown
  projectId: string
  requestIp: string
  requestMethod: string
  requestUid: string
  requestUri: string
}

export interface ApiParam {
  apiId: string
  children?: unknown
  defaultValue?: unknown
  extInfo?: unknown
  level: number
  maxLength: number
  nullable: number
  nullableDic?: unknown
  paramId: string
  paramName: string
  paramType: string
  parentId: string
  remark: string
}

export interface ApiDetail {
  apiId: string
  apiName: string
  contentType: string
  creator: string
  demo: ApiDemo
  description: string
  extInfo?: unknown
  logs: ApiLog[]
  params: BodyTreeNode[]
  response?: BodyTreeNode[]
  projectId: string
  properties: string
  requestMethod: string
  requestUri: string
  lockedBy?: number
  favId?: number|string
}

export interface ApiEditModel extends Pick<ApiDetail, 'apiName' | 'requestUri' | 'requestMethod' | 'description'> {
  params: BodyTreeNode[]
  paramsJson?: string
  response: BodyTreeNode[]
  responseJson?: string
}

export type BodyFormDataValue = string|number|boolean|UploadUserFile[]|undefined

export interface BodyFormData {
  key: string
  type: string
  value: BodyFormDataValue
}

export interface BodyTreeNode {
  isRoot?: boolean
  // isItems?: boolean // 根据node.parent.data.paramType 判断
  children?: BodyTreeNode[]
  defaultValue?: unknown
  maxLength?: number
  nullable: number
  paramId: string|number
  paramName: string
  paramType: string
  remark: string
  extra?: BodyTreeNodeExtra
}

export interface BodyTreeNodeExtra {
  min?: number
  max?: number
  dmin?: number
  dmax?: number
  regexp?: string
  format?: string
  enums?: string
}

export interface EnvItem {
  baseUrl: string
  name: string
  id?: string | number
  defaultHeaders?: string
}

export interface DemoItem {
  apiId: string | number
  apiName: string
  content?: unknown
  createdAt?: string
  demo?: number
  demoDic?: unknown
  extInfo?: unknown
  projectId: string
  requestIp: string
  requestMethod: string
  requestUid: string
  requestUri: string
  userId?: string | number
}
