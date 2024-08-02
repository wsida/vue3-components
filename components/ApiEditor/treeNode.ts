import { BodyTreeNode, BodyTreeNodeExtra } from '../types'

let _id = 0;

export const INIT_NODE_EXTRA: BodyTreeNodeExtra = {
  min: undefined,
  max: undefined,
  dmin: undefined,
  dmax: undefined,
  regexp: undefined,
  format: undefined,
  enums: undefined
}

export const INIT_NODE: BodyTreeNode = {
  children: [],
  defaultValue: '',
  maxLength: 0,
  nullable: 1,
  paramId: '',
  paramName: '',
  paramType: 'String',
  remark: '',
  extra: {
    ...INIT_NODE_EXTRA
  }
}

export function getDefaultField(): string {
  return `field${_id++}`
}
