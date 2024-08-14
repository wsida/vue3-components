import { isString } from "lodash-es";
import type { CSSProperties } from "vue";

const isServer = import.meta.env.SSR || false;
const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

/* istanbul ignore next */
const trim = function (str: string): string {
  return (str || "").replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, "");
};

/* istanbul ignore next */
const camelCase = function (name: string): string {
  return name
    .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
      return offset ? letter.toUpperCase() : letter;
    })
    .replace(MOZ_HACK_REGEXP, "Moz$1");
};

/* istanbul ignore next */
export const on = (function () {
  if (!isServer && document.addEventListener) {
    return function (
      element: HTMLElement,
      event: keyof HTMLElementEventMap,
      handler: Parameters<HTMLElement["addEventListener"]>[1]
    ) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: any, event: string, handler: Function) {
      if (element && event && handler) {
        element.attachEvent("on" + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
export const off = (function () {
  if (!isServer && document.removeEventListener) {
    return function (
      element: HTMLElement,
      event: keyof HTMLElementEventMap,
      handler: Parameters<HTMLElement["removeEventListener"]>[1]
    ) {
      if (element && event) {
        element.removeEventListener(event, handler, false);
      }
    };
  } else {
    return function (element: any, event: string, handler: Function) {
      if (element && event) {
        element.detachEvent("on" + event, handler);
      }
    };
  }
})();

/* istanbul ignore next */
export const once = function (
  el: HTMLElement,
  event: keyof HTMLElementEventMap,
  fn: Parameters<HTMLElement["removeEventListener"]>[1]
) {
  var listener = function () {
    if (fn) {
      (fn as Function).apply(this, arguments);
    }
    off(el, event, listener);
  };
  on(el, event, listener);
};

/* istanbul ignore next */
export function hasClass(el: HTMLElement, cls: string): boolean {
  if (!el || !cls) return false;
  if (cls.indexOf(" ") !== -1)
    throw new Error("className should not contain space.");
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (" " + el.className + " ").indexOf(" " + cls + " ") > -1;
  }
}

/* istanbul ignore next */
export function addClass(el: HTMLElement, cls: string) {
  if (!el) return;
  var curClass = el.className;
  var classes = (cls || "").split(" ");

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += " " + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

/* istanbul ignore next */
export function removeClass(el: HTMLElement, cls: string) {
  if (!el || !cls) return;
  var classes = cls.split(" ");
  var curClass = " " + el.className + " ";

  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;

    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(" " + clsName + " ", " ");
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

/* istanbul ignore next */
export const getStyle = function (
  element: HTMLElement,
  styleName: string
): any {
  if (isServer) return;
  if (!element || !styleName) return null;
  styleName = camelCase(styleName);
  if (styleName === "float") {
    styleName = "cssFloat";
  }
  try {
    var computed = document.defaultView.getComputedStyle(element, "");
    return element.style[styleName] || computed ? computed[styleName] : null;
  } catch (e) {
    return element.style[styleName];
  }
};

/* istanbul ignore next */
export function setStyle(
  element: HTMLElement,
  styleName: string | CSSProperties,
  value: any
) {
  if (!element || !styleName) return;

  if (typeof styleName === "object") {
    for (var prop in styleName) {
      if (Object.prototype.hasOwnProperty.call(styleName, prop)) {
        setStyle(element, prop, styleName[prop]);
      }
    }
  } else {
    styleName = camelCase(styleName);
    element.style[styleName] = value;
  }
}

export function normalizeStyle(style: string | CSSProperties) {
  if (!isString(style)) return style;
  const styleArr = style.split(";");
  const styleObj = {};
  styleArr.forEach(rule => {
    const ruleMap = rule.split(":").map(key => key.trim());
    if (ruleMap[0]) {
      styleObj[camelCase(ruleMap[0])] = ruleMap[1];
    }
  });

  return styleObj;
}

/* 合并样式 */
export function mergeStyle(
  target: string | CSSProperties,
  source: string | CSSProperties
) {
  const targetObj = isString(target) ? normalizeStyle(target) : target;
  const sourceObj = isString(source) ? normalizeStyle(source) : source;
  Object.keys(sourceObj).forEach(key => {
    targetObj[key] = sourceObj[key];
  });
  return targetObj;
}
