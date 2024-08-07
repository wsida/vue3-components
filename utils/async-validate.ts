import type { FormItemRule } from "element-plus";
import {
  isArray,
  isBoolean,
  isEmpty,
  isString,
  isNumber,
  isObject,
  isUndefined,
  isRegExp,
  isError
} from "lodash-es";
/**
 * 手动实现async-rules校验
 */

export type AsyncRules = FormItemRule[];

export const DEFAULT_INVALIDATE_MSG: Record<string, string> = {
  TYPE: "类型错误！",
  PATTERN: "格式有误！",
  REQUIRED: "不能为空！",
  LENGTH: "长度有误！",
  RANGE: "范围有误！"
};

// 校验一组规则
export function validateRules(
  rules: AsyncRules,
  value: any,
  callback: (msg: string | Error) => void
) {
  let valid = true;
  let msg = "";
  for (const rule of rules) {
    validateRule(rule, value, (error?: string | Error) => {
      if (error) {
        valid = false;
        msg = isError(error) ? error.message : error;
      }
    });

    if (!valid) break;
  }
  callback && callback(msg);
}

// 单个规则校验
export function validateRule(
  rule: FormItemRule,
  value: any,
  callback: (err?: string | Error) => void
) {
  let msg = "";
  if (!msg && !isUndefined(rule.required)) {
    if (
      rule.required &&
      !isBoolean(value) &&
      !isNumber(value) &&
      (!value || isEmpty(value))
    ) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.REQUIRED;
    }
  }
  if (!msg && !isUndefined(rule.type)) {
    switch (rule.type) {
      case "array":
        if (!isArray(value)) {
          msg = rule.message
            ? isString(rule.message)
              ? rule.message
              : rule.message()
            : DEFAULT_INVALIDATE_MSG.TYPE;
        }
        break;
      case "boolean":
        if (!isBoolean(value)) {
          msg = rule.message
            ? isString(rule.message)
              ? rule.message
              : rule.message()
            : DEFAULT_INVALIDATE_MSG.TYPE;
        }
        break;
      case "number":
        if (!isNumber(value)) {
          msg = rule.message
            ? isString(rule.message)
              ? rule.message
              : rule.message()
            : DEFAULT_INVALIDATE_MSG.TYPE;
        }
        break;
      case "object":
        if (!isObject(value)) {
          msg = rule.message
            ? isString(rule.message)
              ? rule.message
              : rule.message()
            : DEFAULT_INVALIDATE_MSG.TYPE;
        }
        break;
      case "string":
        if (!isString(value)) {
          msg = rule.message
            ? isString(rule.message)
              ? rule.message
              : rule.message()
            : DEFAULT_INVALIDATE_MSG.TYPE;
        }
        break;
      default:
        break;
    }
  }
  if (!msg && !isUndefined(rule.min)) {
    if ((isString(value) || isArray(value)) && value.length < rule.min) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.LENGTH;
    }
    if (isNumber(value) && value < rule.min) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.RANGE;
    }
  }
  if (!msg && !isUndefined(rule.max)) {
    if ((isString(value) || isArray(value)) && value.length > rule.max) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.LENGTH;
    }
    if (isNumber(value) && value > rule.max) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.RANGE;
    }
  }
  if (!msg && !isUndefined(rule.len)) {
    if ((isString(value) || isArray(value)) && value.length !== rule.len) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.LENGTH;
    }
  }
  if (!msg && !isUndefined(rule.pattern)) {
    if (
      isString(value) &&
      ((isString(rule.pattern) && !new RegExp(rule.pattern).test(value)) ||
        (isRegExp(rule.pattern) && !rule.pattern.test(value)))
    ) {
      msg = rule.message
        ? isString(rule.message)
          ? rule.message
          : rule.message()
        : DEFAULT_INVALIDATE_MSG.LENGTH;
    }
  }
  if (!msg && !isUndefined(rule.validator)) {
    // @ts-ignore
    rule.validator(rule, value, (error: string | Error) => {
      if (error) {
        msg = isError(error) ? error.message : error;
      }
    });
  }

  msg ? callback(new Error(msg)) : callback();
}
