<script lang="tsx">
import { Picture } from "@element-plus/icons-vue";
import { defineComponent, inject, computed, ref, unref, PropType } from "vue";
import { DEFAULT_LIST_ITEM_METAS } from "../constants";
import useTitleEllipsis from "./useTitleEllipsis";
import { getRenderFunction, bindNormalProps } from "./utils";
import { cloneDeep, isString, isObject, isUndefined } from "lodash-es";
import type {
  ReListItemProps,
  ReListItemMetas,
  ReListProvide,
  ReListItemAction
} from "../types";

export default defineComponent({
  name: "ReListCardItem",
  props: {
    item: Object as PropType<ReListItemProps["item"]>,
    metas: Object as PropType<ReListItemMetas>
  },
  // emits: ["check"], // 需要在扩展

  setup(props, { emit }) {
    const prefixClassName = "ap-list-card-item";
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
      if (unref(listProps).actionPosition === "card-footer") {
        className.push(`${prefixClassName}--footer`);
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
            return <div class="ap-list-card-item__actions">{actionList}</div>;
          }
        : null
    );

    const renderAvatar = computed(() =>
      renderItemMetas.value.includes("avatar")
        ? isUndefined(normalizeItemMetas.value["avatar"]["render"])
          ? () => {
              const avatarProps: Record<string, any> = {
                size: unref(listProps).itemLayout === "horizontal" ? 48 : 72,
                fit: "fill",
                shape: "square",
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
                    "ap-list-card-item__avatar",
                    `ap-list-card-item__avatar--${unref(listProps).avatarPosition}`
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
            "content",
            prefixClassName
          )
        : null
    );
    const renderTitle = computed(() =>
      getRenderFunction(
        props.item,
        renderItemMetas,
        normalizeItemMetas,
        "title",
        prefixClassName
      )
    );
    const renderSubTitle = computed(() =>
      getRenderFunction(
        props.item,
        renderItemMetas,
        normalizeItemMetas,
        "subTitle",
        prefixClassName
      )
    );
    const renderDescription = computed(() =>
      !unref(listProps).expandable || expanded.value
        ? getRenderFunction(
            props.item,
            renderItemMetas,
            normalizeItemMetas,
            "description",
            prefixClassName
          )
        : null
    );

    const { itemRef, disabledTitleTooltip } = useTitleEllipsis(
      renderTitle,
      listProps,
      prefixClassName
    );

    // 最终返回
    return () => {
      // 返回渲染
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

      return unref(listProps).itemLayout === "horizontal" ? (
        unref(listProps).avatarPosition === "right" ? (
          <div ref={itemRef} class={itemClassName.value}>
            <div class="ap-list-card-item__group flex-col flex-1">
              <div
                class={[
                  "ap-list-card-item__group",
                  "flex-col",
                  "flex-1",
                  unref(listProps).actionPosition === "card-footer" && "px-4",
                  unref(listProps).actionPosition === "card-footer" && "pb-3"
                ]}
              >
                <div class="ap-list-card-item__group flex-row items-center">
                  <div class="ap-list-card-item__group flex-row flex-1">
                    {titleVnode}
                    {subTitleVnode}
                  </div>
                  {unref(listProps).actionPosition !== "card-footer" &&
                    actionsVnode}
                </div>
                <div class="ap-list-card-item__group flex-row items-center">
                  <div class="ap-list-card-item__group flex-col flex-1">
                    {contentVnode}
                    {descriptionVnode}
                  </div>
                  {avatarVnode}
                </div>
              </div>
              {unref(listProps).actionPosition === "card-footer" &&
                actionsVnode}
            </div>
          </div>
        ) : (
          <div ref={itemRef} class={itemClassName.value}>
            <div class="ap-list-card-item__group flex-col flex-1">
              <div
                class={[
                  "ap-list-card-item__group",
                  "flex-col",
                  "flex-1",
                  unref(listProps).actionPosition === "card-footer" && "px-4",
                  unref(listProps).actionPosition === "card-footer" && "pb-3"
                ]}
              >
                <div class="ap-list-card-item__group flex-row items-start">
                  {avatarVnode}
                  <div class="ap-list-card-item__group flex-col flex-1">
                    <div class="ap-list-card-item__group flex-row items-center">
                      <div class="ap-list-card-item__group flex-row flex-1">
                        {titleVnode}
                        {subTitleVnode}
                      </div>
                      {unref(listProps).actionPosition !== "card-footer" &&
                        actionsVnode}
                    </div>
                    <div class="ap-list-card-item__group flex-col flex-1">
                      {contentVnode}
                      {descriptionVnode}
                    </div>
                  </div>
                </div>
              </div>
              {unref(listProps).actionPosition === "card-footer" &&
                actionsVnode}
            </div>
          </div>
        )
      ) : (
        <div ref={itemRef} class={itemClassName.value}>
          <div class="ap-list-card-item__group flex-col flex-1">
            <div
              class={[
                "ap-list-card-item__group",
                "flex-col",
                "flex-1",
                unref(listProps).actionPosition === "card-footer" && "px-4",
                unref(listProps).actionPosition === "card-footer" && "pb-3"
              ]}
            >
              <div class="ap-list-card-item__group flex-row justify-center">
                {avatarVnode}
              </div>
              <div class="ap-list-card-item__group flex-row flex-1">
                {titleVnode}
                {subTitleVnode}
              </div>
              {contentVnode}
              {descriptionVnode}
              {unref(listProps).actionPosition !== "card-footer" &&
                actionsVnode}
            </div>
            {unref(listProps).actionPosition === "card-footer" && actionsVnode}
          </div>
        </div>
      );
    };
  }
});
</script>

<style lang="scss">
.ap-list-card-item {
  @apply relative flex py-3 px-4 overflow-hidden bg-white border-[var(--el-border-color-light)] border-[1px] border-solid;

  @include m(vertical) {
    .ap-list-card-item {
      &__avatar {
        @apply mb-3 min-w-full text-center;

        .el-avatar {
          @apply w-full;
        }
      }

      &__actions {
        @apply mt-3;
      }
    }
  }

  @include m(horizontal) {
    .ap-list-card-item {
      &__avatar {
        @include m(left) {
          @apply mr-4;
        }

        @include m(right) {
          @apply mr-4;
        }
      }

      &__actions {
        @apply ml-4;
      }
    }
  }

  @include m(hover) {
    &:hover {
      @apply border-[var(--el-color-primary-light-1)];
    }

    .ap-list-card-item {
      &__title {
        &:hover {
          @apply cursor-pointer text-[var(--el-color-primary)];
        }
      }
    }
  }

  @include m(footer) {
    @apply py-0 px-0 pt-3;

    .ap-list-card-item {
      &__actions {
        @apply m-0 px-4 flex flex-row items-center justify-around min-h-[var(--ap-list-footer-actions-min-height)] border-t-[var(--el-border-color-light)] border-t-[1px] border-solid;
      }
    }
  }

  border-radius: var(--el-border-radius-small);

  &__group {
    @apply relative flex flex-nowrap overflow-hidden;
  }

  &__actions {
    @apply flex-shrink-0;
  }

  &__avatar {
    @apply flex-shrink-0;
  }

  &__title {
    @apply text-[16px] text-[var(--el-text-color-primary)] overflow-hidden text-ellipsis whitespace-nowrap;

    line-height: var(--ap-list-title-height, 24px);
  }

  &__subTitle {
    @apply ml-3 text-[14px] text-[var(--el-text-color-regular)];

    line-height: var(--ap-list-title-height, 24px);
    word-break: break-word;
  }

  &__content {
    @apply p-4 text-[14px] text-[var(--el-text-color-regular)];

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
