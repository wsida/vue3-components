import { isNumber, isUndefined } from "lodash-es"
import { BodyTreeNodeExtra } from "../types"
import Mock from 'mockjs'

/**
 * 随机生成
 */
export const RANDOM_MOCK = [
  '@boolean',
  '@natural',
  '@integer',
  '@float',
  '@character',
  '@string',
  '@date',
  '@time',
  '@datetime',
  '@now',
  '@image',
  '@dataImage',
  '@color',
  '@hex',
  '@rgb',
  '@rgba',
  '@hsl',
  '@paragraph',
  '@sentence',
  '@word',
  '@title',
  '@cparagraph',
  '@csentence',
  '@cword',
  '@ctitle',
  '@first',
  '@last',
  '@name',
  '@cfirst',
  '@clast',
  '@cname',
  '@url',
  '@domain',
  '@protocol',
  '@tld',
  '@email',
  '@ip',
  '@region',
  '@province',
  '@city',
  '@county',
  '@guid',
  '@id'
]

export const STRING_RANDOM_MOCK = [
  '@string',
  '@paragraph',
  '@sentence',
  '@word',
  '@title',
  '@cparagraph',
  '@csentence',
  '@cword',
  '@ctitle'
]

export const RANDOM_MOCK_MAP = {
  'String': RANDOM_MOCK.filter((str: string) => ['@boolean', '@natural', '@integer', '@float'].indexOf(str) === -1),
  'Integer': ['@natural', '@integer'],
  'Long': ['@natural', '@integer'],
  'Float': ['@float'],
  'Double': ['@float'],
  'Date': ['@date'],
  'DateTime': ['@dateTime'],
  'Boolean': ['@boolean']
}

export const RANDOM_FACTOR = 9999999

export function formatEnums(str?: string): Array<any> {
  if (!str) return []
  return str.split(/\r?\n/).filter(item => !!item && !!item.trim())
}

export function isMockRandomType(str: string): boolean {
  return !!str && str.charAt(0) === '@' && RANDOM_MOCK.indexOf(str) !== -1
}

export function randomIntegerByMock(temp: string, min?: number, max?: number): number {
  const suffix = isNumber(min) && isNumber(max) ? `(${min},${max})` : isNumber(min) ? `(${min})` : ''
  const mockTemp = `${temp}${suffix}`
  return Mock.mock(mockTemp)
}

export function randomFloatByMock(temp: string, min?: number, max?: number, dmin?: number, dmax?: number): number {
  const argsSuffix = isNumber(dmin) && isNumber(dmax) ? `,${dmin},${dmax})` : isNumber(dmin) ? `,${dmin})` : ')'
  const mockTemp = `${temp}${isNumber(min) ? '(' + min : ''}${isNumber(min) && isNumber(max) ? ',' + max + argsSuffix : ''}`
  return Mock.mock(mockTemp)
}

export function randomBooleanByMock(temp: string, min?: number, max?: number): boolean {
  const suffix = isNumber(min) && isNumber(max) ? `(${min},${max},true)` : ''
  const mockTemp = `${temp}${suffix}`
  return Mock.mock(mockTemp)
}

export function randomDateByMock(temp: string, format?: string): string {
  const suffix = !!format ? `(${format})` : ''
  const mockTemp = `${temp}${suffix}`
  return Mock.mock(mockTemp)
}

export function randomStringByMock(temp: string, min?: number, max?: number): string {
  let suffix = ''
  if (STRING_RANDOM_MOCK.indexOf(temp) !== -1) {
    suffix = isNumber(min) && isNumber(max) ? `(${min},${max})` : isNumber(min) ? `(${min})` : ''
  }
  const mockTemp = `${temp}${suffix}`
  console.log('mock', mockTemp)
  return Mock.mock(mockTemp)
}

export function generateRandomInteger(factor = RANDOM_FACTOR): number {
  return Math.floor(Math.random() * factor)
}

export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  let str = ''
  const count = generateRandomInteger(length)
  for (let j = 0; j < count; j++) {
    str += characters.charAt(generateRandomInteger(charactersLength))
  }
  return str
}

export function randomByEnum(enums: Array<any>): string {
  const length = enums.length
  const randomIndex = generateRandomInteger(length)
  return enums[randomIndex % length]
}

export function randomByRegexp(regexp: string, min?: number, max?: number): string {
  try {
    const suffix = isNumber(min) && isNumber(max) ? `|${min}-${max}` : isNumber(min) ? `|${min}` : ''
    const key =  'regexp'
    const result = Mock.mock({
      [`${key}${suffix}`]: new RegExp(regexp)
    })
    return result[key]
  } catch(err) {
    return regexp
  }
}

export function randomBoolean(defaultValue = '', extra?: BodyTreeNodeExtra): boolean {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return randomByEnum(enums) === 'true'
  }
  if (isMockRandomType(defaultValue)) {
    return randomBooleanByMock(defaultValue, extra?.min, extra?.max)
  }
  return defaultValue ? defaultValue === 'true' : randomBooleanByMock('@boolean', extra?.min, extra?.max)
}

export function randomDate(defaultValue = '', extra?: BodyTreeNodeExtra): string {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return randomByEnum(enums)
  }
  if (isMockRandomType(defaultValue)) {
    return randomDateByMock(defaultValue, extra?.format)
  }
  const currentDate = new Date()
  return defaultValue && Date.parse(defaultValue) ? defaultValue : randomDateByMock('@date', extra?.format)
}

export function randomDateTime(defaultValue = '', extra?: BodyTreeNodeExtra): string {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return randomByEnum(enums)
  }
  if (isMockRandomType(defaultValue)) {
    return randomDateByMock(defaultValue, extra?.format)
  }
  return defaultValue && Date.parse(defaultValue) ? defaultValue : randomDateByMock('@datetime', extra?.format)
}

export function randomString(defaultValue = '', maxLength: number, extra?: BodyTreeNodeExtra): string {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return randomByEnum(enums)
  }
  if (extra?.regexp?.trim()) {
    // 优先使用正则
    return randomByRegexp(extra.regexp, extra?.min, extra?.max)
  }
  if (isMockRandomType(defaultValue)) {
    if (['@date', '@datetime'].indexOf(defaultValue) !== -1) {
      return randomDateByMock(defaultValue, extra?.format)
    } else {
      return randomStringByMock(defaultValue, extra?.min, extra?.max)
    }
  }
  // if (!maxLength) return ''
  return !!defaultValue ? defaultValue : randomStringByMock('@string', extra?.min, extra?.max)
}

export function randomInteger (defaultValue = '', extra?: BodyTreeNodeExtra): number {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return parseInt(randomByEnum(enums))
  }
  if (isMockRandomType(defaultValue)) {
    return randomIntegerByMock(defaultValue, extra?.min, extra?.max)
  }
  return defaultValue && parseInt(defaultValue, 10) ? parseInt(defaultValue, 10) : randomIntegerByMock('@integer', extra?.min, extra?.max)
}

export function randomFloat (defaultValue = '', extra?: BodyTreeNodeExtra): number {
  let enums = formatEnums(extra?.enums)
  if (enums.length) {
    // 优先使用枚举值
    return parseFloat(randomByEnum(enums))
  }
  if (isMockRandomType(defaultValue)) {
    return randomFloatByMock(defaultValue, extra?.min, extra?.max, extra?.dmin, extra?.dmax)
  }
  return defaultValue && parseFloat(defaultValue) ? parseFloat(defaultValue) : randomFloatByMock('@float', extra?.min, extra?.max, extra?.dmin, extra?.dmax)
}
