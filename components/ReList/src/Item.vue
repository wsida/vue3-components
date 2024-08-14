<script lang="tsx">
import { Picture } from "@element-plus/icons-vue";
import { defineComponent, inject, computed, ref, unref, PropType } from "vue";
import { DEFAULT_LIST_ITEM_METAS } from "../constants";
import ReExpandedBtn from "../../ReExpandedBtn";
import {
  cloneDeep,
  isString,
  isObject,
  isUndefined,
  isNumber
} from "lodash-es";
import useTitleEllipsis from "./useTitleEllipsis";
import { getRenderFunction, bindNormalProps } from "./utils";
import type {
  ReListItemProps,
  ReListItemMetas,
  ReListProvide,
  ReListItemAction
} from "../types";

export default defineComponent({
  name: "ReListItem",

  components: {
    ReExpandedBtn
  },
  props: {
    item: Object as PropType<ReListItemProps["item"]>,
    metas: Object as PropType<ReListItemMetas>
  },
  emits: ["check"],

  setup(props, { emit }) {
    const prefixClassName = "ap-list-item";
    const listProps = inject(Symbol.for("ap-list-props")) as ReListProvide;

    const itemClassName = computed<string[]>(() => {
      const className = [
        prefixClassName,
        `${prefixClassName}--${unref(listProps).itemLayout}`
      ];
      if (unref(listProps).rowClassName) {
        className.push(unref(listProps).rowClassName);
      }
      if (unref(listProps).hover) {
        className.push(`${prefixClassName}--hover`);
      }
      return className;
    });

    const expanded = ref(false);
    const normalizeItemMetas = computed<ReListItemMetas>(() => {
      const metas = props.metas
        ? cloneDeep(props.metas)
        : cloneDeep(DEFAULT_LIST_ITEM_METAS);

      for (const key of Object.keys(metas)) {
        if (key !== "extra" && !metas[key].dataIndex) {
          metas[key].dataIndex = key;
        }
      }

      return metas;
    });
    const renderItemMetas = computed(() =>
      Object.keys(normalizeItemMetas.value)
    );

    // 构造渲染函数
    const renderCheckbox = computed(() =>
      unref(listProps).checkable
        ? () => {
            const id = props.item[unref(listProps).rowKey];
            return (
              <span class="ap-list-item__checkbox">
                <el-checkbox
                  modelValue={unref(listProps).checks.includes(id)}
                  onChange={(val: boolean) => {
                    emit("check", val, id, props.item);
                  }}
                />
              </span>
            );
          }
        : null
    );

    const renderExpanded = computed(() =>
      unref(listProps).expandable
        ? () => (
            <ReExpandedBtn
              class="ap-list-item__expanded"
              type="info"
              modelValue={expanded.value}
              onUpdate:modelValue={(val: boolean) => {
                expanded.value = val;
              }}
            />
          )
        : null
    );

    const renderActions = computed(() =>
      renderItemMetas.value.includes("actions")
        ? () => {
            const actionList = normalizeItemMetas.value.actions!.map(
              (btn: ReListItemAction) => {
                if (!isUndefined(btn.render)) return btn.render(props.item);
                const btnProps = {
                  link: true
                };
                bindNormalProps(btnProps, btn);
                return <el-button {...btnProps}>{() => btn.text}</el-button>;
              }
            );
            return <div class="ap-list-item__actions">{actionList}</div>;
          }
        : null
    );

    const renderAvatar = computed(() =>
      (!listProps.avatarHideInExpanded ||
        !unref(listProps).expandable ||
        expanded.value) &&
      renderItemMetas.value.includes("avatar")
        ? isUndefined(normalizeItemMetas.value["avatar"]["render"])
          ? () => {
              const avatarProps: Record<string, any> = {
                size:
                  unref(listProps).itemLayout === "horizontal" ||
                  unref(listProps).avatarPosition === "left"
                    ? 24
                    : 92,
                fit: "fill",
                shape:
                  unref(listProps).itemLayout === "horizontal" ||
                  unref(listProps).avatarPosition === "left"
                    ? "circle"
                    : "square",
                alt: "图片"
              };
              const avatarVal =
                props.item[normalizeItemMetas.value["avatar"]["dataIndex"]];
              if (isString(avatarVal)) {
                avatarProps.src = avatarVal;
              } else if (isObject(avatarVal)) {
                avatarProps.icon = avatarVal;
              } else {
                avatarProps.icon = Picture;
              }
              bindNormalProps(avatarProps, normalizeItemMetas.value["avatar"]);
              return (
                <div
                  class={[
                    "ap-list-item__avatar",
                    `ap-list-item__avatar--${unref(listProps).avatarPosition}`
                  ]}
                >
                  <el-avatar {...avatarProps} />
                </div>
              );
            }
          : () =>
              normalizeItemMetas.value["avatar"]["render"](
                props.item,
                expanded.value
              )
        : null
    );

    const renderContent = computed(() =>
      !unref(listProps).expandable || expanded.value
        ? getRenderFunction(
            props.item,
            renderItemMetas,
            normalizeItemMetas,
            "content"
          )
        : null
    );
    const renderTitle = computed(() =>
      getRenderFunction(
        props.item,
        renderItemMetas,
        normalizeItemMetas,
        "title"
      )
    );
    const renderSubTitle = computed(() =>
      getRenderFunction(
        props.item,
        renderItemMetas,
        normalizeItemMetas,
        "subTitle"
      )
    );
    const renderDescription = computed(() =>
      !unref(listProps).expandable || expanded.value
        ? getRenderFunction(
            props.item,
            renderItemMetas,
            normalizeItemMetas,
            "description"
          )
        : null
    );

    const { itemRef, disabledTitleTooltip } = useTitleEllipsis(
      renderTitle,
      listProps
    );

    // 最终返回
    return () => {
      // 返回渲染
      const checkboxVnode = renderCheckbox.value
        ? renderCheckbox.value()
        : null;
      const expandedVnode = renderExpanded.value
        ? renderExpanded.value()
        : null;
      const avatarVnode = renderAvatar.value ? renderAvatar.value() : null;
      const titleVnode = renderTitle.value ? (
        <el-tooltip
          disabled={disabledTitleTooltip.value}
          content={props.item[normalizeItemMetas.value["title"]["dataIndex"]]}
          placement="top"
        >
          {() => renderTitle.value()}
        </el-tooltip>
      ) : null;
      const subTitleVnode = renderSubTitle.value
        ? renderSubTitle.value()
        : null;
      const descriptionVnode = renderDescription.value
        ? renderDescription.value()
        : null;
      const contentVnode = renderContent.value ? renderContent.value() : null;
      const actionsVnode = renderActions.value ? renderActions.value() : null;
      const itemHeight = unref(listProps).itemHeight;
      const itemStyles = itemHeight
        ? { height: isNumber(itemHeight) ? `${itemHeight}px` : itemHeight }
        : {};

      return unref(listProps).itemLayout === "horizontal" ? (
        <div ref={itemRef} class={itemClassName.value} style={itemStyles}>
          <div class="ap-list-item__group flex-1 flex-row items-start">
            {checkboxVnode}
            {expandedVnode}
            {avatarVnode}
            <div class="ap-list-item__group flex-col flex-1">
              <div class="ap-list-item__group flex-row flex-nowrap overflow-hidden">
                {titleVnode}
                {subTitleVnode}
              </div>
              {descriptionVnode}
            </div>
          </div>
          {contentVnode}
          {actionsVnode}
        </div>
      ) : unref(listProps).avatarPosition === "right" ? (
        <div ref={itemRef} class={itemClassName.value} style={itemStyles}>
          <div class="ap-list-item__group flex-row flex-1">
            {checkboxVnode}
            {expandedVnode}
            <div class="ap-list-item__group flex-col flex-1">
              {titleVnode}
              {subTitleVnode}
              {contentVnode}
              {descriptionVnode}
              {actionsVnode}
            </div>
          </div>
          {avatarVnode}
        </div>
      ) : (
        <div ref={itemRef} class={itemClassName.value} style={itemStyles}>
          <div class="ap-list-item__group flex-row flex-1">
            {checkboxVnode}
            {expandedVnode}
            {avatarVnode}
            <div class="ap-list-item__group flex-col flex-1">
              {titleVnode}
              {subTitleVnode}
              {contentVnode}
              {descriptionVnode}
              {actionsVnode}
            </div>
          </div>
        </div>
      );
    };
  }
});
</script>

<style lang="scss">
.ap-list-item {
  @apply relative flex py-3 overflow-hidden bg-white border-0;

  @include m(hover) {
    &:hover {
      @apply bg-[var(--el-fill-color-lighter)];
    }

    &.ap-list-item--horizontal {
      .ap-list-item {
        &__actions {
          @apply mr-4;
        }
      }
    }

    &.ap-list-item--vertical {
      .ap-list-item {
        &__avatar {
          @apply mr-4;
        }
      }
    }

    .ap-list-item {
      &__checkbox {
        @apply ml-2;
      }

      &__title {
        &:hover {
          @apply cursor-pointer text-[var(--el-color-primary)];
        }
      }
    }
  }

  @include m(horizontal) {
    @apply items-center;

    .ap-list-item {
      &__avatar {
        @apply mr-2 flex-shrink-0;
      }

      &__title {
        @apply min-w-[var(--ap-list-title-min-width)];
      }

      &__subTitle {
        @apply ml-3 flex-shrink-0;

        max-width: calc(100% - var(--ap-list-title-min-width) - 12px);
      }

      &__content {
        @apply flex-1 flex flex-col mx-6;
      }

      &__actions {
        @apply ml-4;
      }
    }
  }

  @include m(vertical) {
    @apply items-center;

    .ap-list-item {
      &__avatar {
        @apply ml-4 flex-shrink-0;

        @include m("left") {
          @apply ml-0;
        }
      }

      &__content {
        @apply p-4;
      }

      &__subTitle {
        @apply mt-1;
      }

      &__actions {
        @apply mt-2;
      }
    }
  }

  &__group {
    @apply relative flex flex-nowrap overflow-hidden;
  }

  &__actions {
    @apply flex-shrink-0;
  }

  &__checkbox {
    .el-checkbox {
      height: var(--ap-list-title-height, 24px);
    }
  }

  &__expanded {
    height: var(--ap-list-title-height, 24px) !important;
  }

  &__checkbox,
  &__expanded {
    @apply mr-2 flex-shrink-0;
  }

  &__title {
    @apply text-[16px] text-[var(--el-text-color-primary)] overflow-hidden text-ellipsis whitespace-nowrap;

    line-height: var(--ap-list-title-height, 24px);
  }

  &__subTitle {
    @apply text-[14px] text-[var(--el-text-color-regular)];

    line-height: var(--ap-list-title-height, 24px);
    word-break: break-word;
  }

  &__content {
    @apply text-[14px] text-[var(--el-text-color-regular)];

    line-height: var(--ap-list-content-height, 20px);
    word-break: break-word;
  }

  &__description {
    @apply mt-2 text-[14px] text-[var(--el-text-color-placeholder)];

    line-height: var(--ap-list-description-height, 20px);
    word-break: break-word;
  }
}
</style>
