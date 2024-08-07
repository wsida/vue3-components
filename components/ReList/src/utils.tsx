import { type MaybeRef, unref } from "vue";
import { isUndefined } from "lodash-es";
import { getEventName } from "@/utils/vnodes";
import type {
  ReListItemMeta,
  ReListItemAction,
  ReListItemMetas
} from "../types";

export function bindNormalProps(
  bindProps: Record<string, any>,
  meta: ReListItemMeta | ReListItemAction
): void {
  if (!isUndefined(meta["customClass"])) {
    bindProps.class = meta["customClass"];
  }
  if (!isUndefined(meta["style"])) {
    bindProps.style = meta["style"];
  }
  if (!isUndefined(meta["props"])) {
    for (const prop of Object.keys(meta["props"])) {
      bindProps[prop] = meta["props"][prop];
    }
  }
  if (!isUndefined(meta["events"])) {
    for (const event of Object.keys(meta["events"])) {
      bindProps[getEventName(event)] = meta["events"][event];
    }
  }
}

export function getRenderFunction(
  item: MaybeRef<Record<string, any>>,
  renderItemMetas: MaybeRef<string[]>,
  normalizeItemMetas: MaybeRef<ReListItemMetas>,
  dataIndex: string,
  className = "ap-list-item"
) {
  return unref(renderItemMetas).includes(dataIndex)
    ? isUndefined(unref(normalizeItemMetas)[dataIndex]["render"])
      ? () => {
          const bindProps: Record<string, any> = {};
          const contentVal =
            unref(item)[unref(normalizeItemMetas)[dataIndex]["dataIndex"]];
          bindNormalProps(bindProps, unref(normalizeItemMetas)[dataIndex]);
          return (
            <div class={`${className}__${dataIndex}`} {...bindProps}>
              {contentVal}
            </div>
          );
        }
      : () => unref(normalizeItemMetas)[dataIndex]["render"](unref(item))
    : null;
}
