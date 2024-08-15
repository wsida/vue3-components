import { computed, onScopeDispose, ref, unref, watch } from "vue";
import { isUndefined, isObject } from "lodash-es";
import { useResizeObserver } from "@vueuse/core";
import type { MaybeRef } from "vue";

import type { MediaResponsive } from "./types";

import {
  DEFAULT_MEDIA_RESPONSIVE_ITEMS,
  CUSTOM_MEDIA_TYPE_REGEX,
  MEDIA_RULE_REGEX,
  DEFAULT_CUSTOM_MEDIA_TYPE
} from "./constants";

export {
  DEFAULT_MEDIA_RESPONSIVE_ITEMS,
  CUSTOM_MEDIA_TYPE_REGEX,
  MEDIA_RULE_REGEX,
  DEFAULT_CUSTOM_MEDIA_TYPE
};

export type { MediaResponsive };

export function getMedia(key: string) {
  return Reflect.has(DEFAULT_MEDIA_RESPONSIVE_ITEMS, key)
    ? DEFAULT_MEDIA_RESPONSIVE_ITEMS[key]
    : key.replace("_", DEFAULT_CUSTOM_MEDIA_TYPE);
}

/**
 * 对媒体查询尺寸进行排序（升序）
 * @param medias 媒体查询配置
 * @returns 返回媒体查询尺寸升序序列
 */
export function sortMediaResponsive<T>(medias: MediaResponsive<T>): string[] {
  const allKeys = Object.keys(medias);
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

/**
 * 根据尺寸命中媒体查询配置
 * @param width 尺寸
 * @param medias 媒体查询配置 
 * @returns 对应尺寸配置内容
 */
export function matchMedia<T>(
  width: number,
  medias: MediaResponsive<T>,
  defaultMedia?: any
): T | undefined {
  let match: T | undefined = undefined;
  const medias = sortMediaResponsive(medias).reverse();
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
            match = medias[item];
            isMatch = true;
          }
          break;
        case ">=":
          if (width >= size) {
            match = medias[item];
            isMatch = true;
          }
          break;
        case "<":
          if (width < size) {
            match = medias[item];
            isMatch = true;
          }
          break;
        case "<=":
          if (width <= size) {
            match = medias[item];
            isMatch = true;
          }
          break;
      }
      if (isMatch) break;
    }
  }
  return match ?? defaultMedia;
}

/**
 * 规范化媒体查询配置
 * @param media 命中配置 / 媒体查询配置
 * @returns 媒体查询配置
 */
export function normalizeMediaResponsive<T>(
  media: T | MediaResponsive<T>,
  defaultMedia?: any
): MediaResponsive<T> {
  const medias: MediaResponsive<T> = {};
  const mediaItems = Object.keys(DEFAULT_MEDIA_RESPONSIVE_ITEMS);
  for (const item of mediaItems) {
    medias[item] = isObject(media) ? media[item] : media;
  }

  // 自动补充缺少的响应字段
  // 优先向上寻找
  for (const item of mediaItems) {
    if (!isUndefined(medias[item])) continue;
    const index = mediaItems.indexOf(item);
    // 向上查找
    let target = mediaItems
      .slice(index, -1)
      .find(target => !isUndefined(medias[target]));
    if (isUndefined(target)) {
      // 向下查找
      target = mediaItems
        .slice(0, index)
        .reverse()
        .find(target => !isUndefined(medias[target]));
    }
    medias[item] = isUndefined(target)
      ? defaultMedia
      : medias[target!];
  }

  // 匹配自定义size响应，默认都按 >= 处理
  if (isObject(media)) {
    const keys = Object.keys(media!);
    const customKeys = keys.filter(
      (key: string) =>
        !mediaItems.includes(key) && CUSTOM_MEDIA_TYPE_REGEX.test(key)
    );
    for (const key of customKeys) {
      medias[key] = media[key];
    }
  }

  return medias;
}

export default function useMatchMedia<T>(
  media: MaybeRef<T | MediaResponsive<T>>,
  targetDOM = document.body,
  defaultMedia: any
) {
  // 媒体查询配置
  const medias = computed<MediaResponsive<T>>(() =>
    normalizeMediaResponsive(unref(media), defaultMedia)
  );

  const matchMedia = ref<T>(defaultMedia);

  const responsiveWidth = ref(0);
  const responsiveHeight = ref(0);

  watch(medias, () => {
    matchMedia.value = matchMedia(
      responsiveWidth.value,
      medias.value,
      defaultMedia
    );
  });

  // 响应监听
  const { stop } = useResizeObserver(targetDOM, entries => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    responsiveWidth.value = width;
    responsiveHeight.value = height;
    matchMedia.value = matchMedia(width, medias.value);
  });

  onScopeDispose(() => {
    stop();
  });

  return {
    medias,
    matchMedia,
    responsiveWidth,
    responsiveHeight
  };
}
