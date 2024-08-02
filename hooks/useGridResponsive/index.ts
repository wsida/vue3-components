import { computed, onScopeDispose, ref, unref, watch } from "vue";
import { isNumber, isUndefined, isObject } from "lodash-es";
import { useResizeObserver } from "@vueuse/core";
import type { Ref } from "vue";

import type { ReGridResponsive } from "./types";

import {
  DEFAULT_FORM_GRID_RESPONSIVE,
  DEFAULT_FORM_GRID_RESPONSIVE_ITEMS,
  CUSTOM_MEDIA_TYPE_REGEX,
  MEDIA_RULE_REGEX,
  DEFAULT_CUSTOM_MEDIA_TYPE
} from "./constants";

export {
  DEFAULT_FORM_GRID_RESPONSIVE,
  DEFAULT_FORM_GRID_RESPONSIVE_ITEMS,
  CUSTOM_MEDIA_TYPE_REGEX,
  MEDIA_RULE_REGEX,
  DEFAULT_CUSTOM_MEDIA_TYPE
};

export type { ReGridResponsive };

export function getMedia(key: string) {
  return Reflect.has(DEFAULT_FORM_GRID_RESPONSIVE_ITEMS, key)
    ? DEFAULT_FORM_GRID_RESPONSIVE_ITEMS[key]
    : key.replace("_", DEFAULT_CUSTOM_MEDIA_TYPE);
}

export function sortResponsive(responsive: ReGridResponsive): string[] {
  const allKeys = Object.keys(responsive);
  return allKeys.sort(function (a: string, b: string) {
    const aMedia = getMedia(a);
    const bMedia = getMedia(b);

    const aMatch = aMedia.match(MEDIA_RULE_REGEX);
    const bMatch = bMedia.match(MEDIA_RULE_REGEX);
    const diff = parseInt(aMatch[2]) - parseInt(bMatch[2]);
    if (diff === 0) {
      // 如果媒体查询值相同，判断符号优先级 < <= >= >
      if (aMatch[1] === bMatch[1]) return 0;
      if (aMatch[1] === "<") return -1;
      if (aMatch[1] === "<=" && bMatch[1] !== "<") return -1;
      if (aMatch[1] === ">=" && bMatch[1] === ">") return -1;
      return 1;
    }
    return diff;
  });
}

export function matchResponsive(
  width: number,
  responsive: ReGridResponsive
): number {
  let match = DEFAULT_FORM_GRID_RESPONSIVE;
  const medias = sortResponsive(responsive).reverse();
  let isMatch = false;
  for (const item of medias) {
    const media = getMedia(item);
    const itemMatchs = media.match(MEDIA_RULE_REGEX);
    // if (!itemMatchs || !itemMatchs[0]) continue;
    if (itemMatchs[1] && itemMatchs[2]) {
      const size = parseInt(itemMatchs[2]);
      switch (itemMatchs[1]) {
        case ">":
          if (width > size) {
            match = responsive[item] ?? DEFAULT_FORM_GRID_RESPONSIVE;
            isMatch = true;
          }
          break;
        case ">=":
          if (width >= size) {
            match = responsive[item] ?? DEFAULT_FORM_GRID_RESPONSIVE;
            isMatch = true;
          }
          break;
        case "<":
          if (width < size) {
            match = responsive[item] ?? DEFAULT_FORM_GRID_RESPONSIVE;
            isMatch = true;
          }
          break;
        case "<=":
          if (width <= size) {
            match = responsive[item] ?? DEFAULT_FORM_GRID_RESPONSIVE;
            isMatch = true;
          }
          break;
      }
      if (isMatch) break;
    }
  }
  return match;
}

export function normalizeGridResponsive(
  span: number | ReGridResponsive
): ReGridResponsive {
  const responsive: ReGridResponsive = {};
  const responsiveItems = Object.keys(DEFAULT_FORM_GRID_RESPONSIVE_ITEMS);
  for (const item of responsiveItems) {
    responsive[item] = isUndefined(span)
      ? DEFAULT_FORM_GRID_RESPONSIVE
      : isNumber(span)
        ? span
        : span[item];
  }

  // 自动补充缺少的响应字段
  // 优先向上寻找
  for (const item of responsiveItems) {
    if (!isUndefined(responsive[item])) continue;
    const index = responsiveItems.indexOf(item);
    // 向上查找
    let target = responsiveItems
      .slice(index, -1)
      .find(target => !isUndefined(responsive[target]));
    if (isUndefined(target)) {
      // 向下查找
      target = responsiveItems
        .slice(0, index)
        .reverse()
        .find(target => !isUndefined(responsive[target]));
    }
    responsive[item] = isUndefined(target)
      ? DEFAULT_FORM_GRID_RESPONSIVE
      : responsive[target];
  }

  // 匹配自定义size响应，默认都按 >= 处理
  if (isObject(span)) {
    const keys = Object.keys(span);
    const customKeys = keys.filter(
      (key: string) =>
        !responsiveItems.includes(key) && CUSTOM_MEDIA_TYPE_REGEX.test(key)
    );
    for (const key of customKeys) {
      responsive[key] = span[key];
    }
  }

  return responsive;
}

export default function useGridResponsive(
  cols: Ref<number | ReGridResponsive>,
  targetDOM = document.body,
  defaultGrid = 0
) {
  const responsive = computed<ReGridResponsive>(() =>
    normalizeGridResponsive(unref(cols))
  );

  const gridResponsive = ref(defaultGrid);

  const responsiveWidth = ref(0);
  const responsiveHeight = ref(0);

  watch(responsive, () => {
    gridResponsive.value = matchResponsive(
      responsiveWidth.value,
      responsive.value
    );
  });

  // 响应监听
  const { stop } = useResizeObserver(targetDOM, entries => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    responsiveWidth.value = width;
    responsiveHeight.value = height;
    gridResponsive.value = matchResponsive(width, responsive.value);
  });

  onScopeDispose(() => {
    stop();
  });

  return {
    responsive,
    gridResponsive,
    responsiveWidth,
    responsiveHeight
  };
}
