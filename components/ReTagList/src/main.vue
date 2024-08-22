<!-- eslint-disable prettier/prettier -->
<!-- eslint-disable prettier/prettier -->
<template>
  <div
    ref="wrapperRef"
    :class="[
      'ap-tag-list',
      `ap-tag-list--${size}`,
      `ap-tag-list--${tagType}`,
      checkable && 'is-checkable'
    ]"
    :style="{ gap: `${gap}px` }"
  >
    <template v-if="checkable">
      <template v-for="tag in tags">
        <slot
          name="tag"
          :tag="tag"
          :checked="isChecked(tag)"
          :handler="onClose"
          :check-handler="onCheck"
        >
          <el-tag
            :key="isString(tag) ? tag : tag[valueKey] || tag[labelKey]"
            class="ap-tag-list__tag"
            :size="size"
            :type="getTagType(tag)"
            :effect="tagEffect"
            :disable-transitions="false"
            :closable="editable"
            :class="{
              'is-checked': isChecked(tag),
              'is-checkable': checkable
            }"
            @close="onClose(tag)"
            @click="onCheck(tag)"
          >
            <span
              class="ap-tag-list__tag-content"
              @mouseenter="
                event => {
                  onMouseenter(event, tag);
                }
              "
              @mouseleave="
                event => {
                  onMouseleave(event, tag);
                }
              "
              >{{ isString(tag) ? tag : tag[labelKey] }}</span
            >
          </el-tag>
        </slot>
      </template>
    </template>
    <template v-else>
      <template v-for="tag in tags">
        <slot name="tag" :tag="tag" :handler="onClose">
          <el-tag
            :key="isString(tag) ? tag : tag[valueKey] || tag[labelKey]"
            class="ap-tag-list__tag"
            :size="size"
            :type="tagType"
            :effect="tagEffect"
            :disable-transitions="false"
            :closable="editable"
            :class="{ 'is-checkable': checkable }"
            @close="onClose(tag)"
          >
            <span
              class="ap-tag-list__tag-content"
              @mouseenter="
                event => {
                  onMouseenter(event, tag);
                }
              "
              @mouseleave="
                event => {
                  onMouseleave(event, tag);
                }
              "
              >{{ isString(tag) ? tag : tag[labelKey] }}</span
            >
          </el-tag>
        </slot>
      </template>
    </template>
    <template v-if="editable">
      <el-input
        v-show="inputVisible"
        ref="inputRef"
        v-model="inputValue"
        class="ap-tag-list__input"
        :style="{ width: inputResponsive ? `${inputWidth}px` : '100px' }"
        :size="size"
        @input="onInput"
        @keyup.enter="onEnter"
        @blur="onEnter"
      />
      <el-button
        v-show="!inputVisible"
        class="ap-tag-list__new"
        v-bind="localButtonProps"
        @click="onAdd"
      >
        <el-icon><Plus /></el-icon
        ><span v-if="!!buttonText" style="margin-left: 4px">{{
          buttonText
        }}</span>
      </el-button>
      <span
        v-show="inputVisible"
        v-if="inputResponsive"
        ref="shallowDom"
        class="ap-tag-list__shallow"
      />
    </template>
    <el-tooltip
      v-if="showOverflowTooltip"
      ref="tooltipRef"
      placement="bottom"
      popper-class="ap-tag-list__tooltip"
      virtual-triggering
      :visible="tooltipVisible"
      :popper-options="popperOptions"
      :virtual-ref="tagRef"
      :effect="tooltipEffect"
      :teleported="teleported"
    >
      <template #content>
        {{ tooltipContent }}
      </template>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElInput, ElTooltip } from "element-plus";
import { debounce, isObject, isString, isUndefined, noop } from "lodash-es";
import { ReTagListEmits, ReTagListProps } from "../types";
import { computed, nextTick, onMounted, ref } from "vue";

defineOptions({
  name: "ReTagList"
});

const props = withDefaults(defineProps<ReTagListProps>(), {
  valueKey: "value",
  labelKey: "label",
  size: "default",
  tagType: "primary",
  tagEffect: "light",
  gap: 8,
  checkable: false,
  editable: false,
  inputResponsive: false,
  autoAdd: true,
  addFailedMessage: "Tag不能重复!",
  debounce: 300,
  buttonText: "",
  uncheckTagType: "default",
  checkTagType: "primary",
  showOverflowTooltip: false,
  tooltipEffect: "dark",
  teleported: true
});

const emits = defineEmits<ReTagListEmits>();

let _hideTooltipTimeout: any;

const popperOptions = {
  modifiers: [
    {
      name: "computeStyles",
      options: {
        adaptive: false,
        enabled: false
      }
    }
  ]
};

const inputVisible = ref(false);
const inputValue = ref("");
const shallowDom = ref<HTMLSpanElement | null>(null);
const wrapperRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<InstanceType<typeof ElInput> | null>(null);
const wrapperWidth = ref(0);
const inputWidth = ref(100);

const tooltipVisible = ref(false);
const tooltipContent = ref("");
const tooltipRef = ref<InstanceType<typeof ElTooltip> | null>(null);
const tagRef = ref<HTMLSpanElement | null>(null);

const localButtonProps = computed(
  () =>
    ({
      type: "default",
      class: "ap-button--dashed",
      ...(props.buttonProps || {}),
      size: props.size
    }) as any
);

function defaultCreateNew(label: string): string | Record<string, any> {
  // 默认根据首个tag设置
  const tag = props.tags[0];
  if (isObject(tag))
    return { [props.valueKey]: label, [props.labelKey]: label };
  return label;
}

function defaultBeforeAdd(label: string): boolean {
  // 限制唯一
  return (
    props.tags.findIndex((tag: string | Record<string, any>) => {
      if (isObject(tag)) {
        return (tag[props.valueKey] ?? tag[props.labelKey]) === label;
      }
      return tag === label;
    }) === -1
  );
}

const isChecked = (tag: string | Record<string, any>): boolean => {
  if (!props.checkable) return false;
  return (
    props.modelValue.findIndex((item: string | number) => {
      if (isString(tag)) return tag === (item as string);
      return item === tag[props.valueKey];
    }) !== -1
  );
};

const getTagType = (
  tag: string | Record<string, any>
): ReTagListProps["tagType"] => {
  if (!props.checkable) return props.tagType;
  if (!isChecked(tag)) {
    return "info";
  }
  return props.tagType;
};

const inputResponsiveDebounce = debounce(() => {
  getInputTextWidth(inputValue.value);
}, props.debounce);

function getInputTextWidth(text: string) {
  if (inputWidth.value >= wrapperWidth.value) return;
  if (!shallowDom.value) return;
  // 创建一个隐藏的临时元素，用于计算文本宽度
  // tempElement.style.visibility = "hidden";
  // tempElement.style.whiteSpace = "pre"; // 保持空格和换行的格式
  // tempElement.style.display = "inline-block";
  shallowDom.value.textContent = text;

  // 获取文本的宽度
  inputWidth.value = shallowDom.value.offsetWidth;
}

function onCheck(tag: string | Record<string, any>, checked?: boolean) {
  if (!props.checkable) return;
  const value = isObject(tag) ? tag[props.valueKey] : tag;
  const hasChecked =
    props.modelValue.findIndex((item: string | number) => item === value) !==
    -1;

  const updateChecked = (flag: boolean) => {
    if (flag) {
      const newTags = props.modelValue.filter(item => item !== value) as
        | string[]
        | number[];
      emits("update:modelValue", newTags);
      emits("change", newTags);
    } else {
      const newTags = [...props.modelValue, value];
      emits("update:modelValue", newTags);
      emits("change", newTags);
    }

    emits("check", !flag, value, tag);
  };

  if (!isUndefined(checked)) {
    updateChecked(!checked);
  } else {
    updateChecked(hasChecked);
  }
}

function onClose(tag: string | Record<string, any>) {
  if (!props.editable) return;
  if (props.checkable) {
    onCheck(tag, false);
  }
  const newTags = props.tags.filter((item: string | Record<string, any>) => {
    if (isObject(tag))
      return (
        (item as Record<string, any>)[props.valueKey] !== tag[props.valueKey]
      );
    return (item as String) !== tag;
  });
  emits("close", isString(tag) ? tag : tag[props.valueKey], tag);
  emits("update:tags", newTags as string[] | Record<string, any>[]);
}

function onAdd() {
  if (!props.editable) return;
  inputWidth.value = 100;
  inputValue.value = "";
  inputVisible.value = true;
  nextTick(() => {
    inputRef.value!.input!.focus();
  });
}

function onInput() {
  emits("input", inputValue.value);
  if (props.inputResponsive) {
    inputResponsiveDebounce();
  }
}

function onEnter() {
  if (!props.editable || !inputVisible.value) return;
  inputVisible.value = false;
  if (!inputValue.value) return;
  emits("add", inputValue.value);
  if (props.autoAdd) {
    if (
      (isUndefined(props.beforeAdd) ? defaultBeforeAdd : props.beforeAdd)(
        inputValue.value
      )
    ) {
      const newTag: string | Record<string, any> = (
        isUndefined(props.createNew) ? defaultCreateNew : props.createNew
      )(inputValue.value);
      if (isObject(newTag)) {
        const newTags = [
          ...props.tags,
          newTag as Record<string, any>
        ] as Record<string, any>[];
        emits("update:tags", newTags);
      } else if (isString(newTag)) {
        const newTags = [...props.tags, newTag] as string[];
        emits("update:tags", newTags);
      }
    } else {
      !!props.addFailedMessage && ElMessage.warning(props.addFailedMessage);
    }
  }
}

function onMouseenter(event: MouseEvent, tag: string | Record<string, any>) {
  if (!props.showOverflowTooltip) return;
  if (_hideTooltipTimeout) {
    clearTimeout(_hideTooltipTimeout);
  }
  const target = event.target as HTMLSpanElement;
  const isOverflow = target.scrollWidth > target.offsetWidth;
  if (isOverflow) {
    tooltipContent.value = isString(tag) ? tag : tag[props.labelKey];
    tooltipVisible.value = true;
    tagRef.value = target;
  } else {
    tooltipVisible.value = false;
    tooltipContent.value = "";
    tagRef.value = null;
  }
}

function onMouseleave(event: MouseEvent, tag: string | Record<string, any>) {
  if (!props.showOverflowTooltip) return;
  if (_hideTooltipTimeout) {
    clearTimeout(_hideTooltipTimeout);
  }
  _hideTooltipTimeout = setTimeout(() => {
    tooltipVisible.value = false;
    tooltipContent.value = "";
    tagRef.value = null;
  }, props.debounce);
}

onMounted(() => {
  nextTick(() => {
    const rect = wrapperRef.value.getBoundingClientRect();
    wrapperWidth.value = rect.width;
  });
});
</script>

<style lang="scss" scoped>
.ap-tag-list {
  --ap-tag-input-height-small: 20px;
  --ap-tag-input-height-default: 24px;
  --ap-tag-input-height-large: 32px;
  --ap-tag-button-height-small: 20px;
  --ap-tag-button-height-default: 24px;
  --ap-tag-button-height-large: 32px;
  --ap-tag-input-height: calc(var(--ap-tag-input-height-default) - 2px);
  --ap-tag-button-height: var(--ap-tag-button-height-default);
  --ap-tag-input-padding: 0 11px;
  --ap-tag-button-padding: 5px 11px;

  @apply relative flex justify-start items-start flex-wrap;

  @include m(large) {
    --ap-tag-input-height: calc(var(--ap-tag-input-height-large) - 2px);
    --ap-tag-button-height: var(--ap-tag-button-height-large);
    --ap-tag-input-padding: 0 11px;
    --ap-tag-button-padding: 8px 11px;
  }

  @include m(small) {
    --ap-tag-input-height: calc(var(--ap-tag-input-height-small) - 2px);
    --ap-tag-button-height: var(--ap-tag-button-height-small);
    --ap-tag-input-padding: 0 11px;
    --ap-tag-button-padding: 3px 11px;
  }

  @each $type in info, primary, success, warning, danger {
    @include m($type) {
      :deep(.el-tag) {
        &.is-checkable {
          &.el-tag--dark {
            &:not(.is-checked) {
              &:hover {
                --el-tag-bg-color: var(--el-color-info-light-8);
                --el-tag-border-color: var(--el-color-info-light-8);
              }
            }
          }

          // &.el-tag--dark,
          &.el-tag--light,
          &.el-tag--plain {
            &:not(.is-checked) {
              &:hover {
                // prettier-ignore
                @if $type == info {
                  --el-tag-text-color: var(--el-text-color-regular);
                }
                // prettier-ignore
                @else {
                  --el-tag-text-color: var(--el-color-#{$type});
                }
              }
            }
          }
        }
      }
    }
  }

  :deep(.el-tag) {
    &.is-checkable {
      @apply cursor-pointer;

      &.el-tag--dark {
        &.el-tag--info {
          &:not(.is-checked) {
            --el-tag-text-color: var(--el-color-info);
            --el-tag-bg-color: var(--el-color-info-light-7);
            --el-tag-border-color: var(--el-color-info-light-7);
          }
        }
      }

      &.el-tag--light {
        &.el-tag--info {
          &.is-checked {
            --el-tag-bg-color: var(--el-color-info-light-8);
            --el-tag-border-color: var(--el-color-info-light-7);
          }
        }
      }

      &.el-tag--plain {
        &.el-tag--info {
          &.is-checked {
            --el-tag-border-color: var(--el-color-info-light-3);
            --el-tag-text-color: var(--el-text-color-regular);
          }
        }
      }
    }
  }

  &__tag {
    @apply max-w-full flex-nowrap items-center;

    &-content {
      @apply inline-block max-w-full whitespace-nowrap text-ellipsis overflow-hidden;
    }

    :deep(.el-tag__content) {
      @apply flex-1 overflow-hidden;
    }

    :deep(.el-tag__close) {
      @apply flex-shrink-0;
    }
  }

  &__shallow {
    @apply absolute -top-[40px] left-0 inline-block whitespace-pre opacity-0;

    padding: var(--ap-tag-input-padding);
    font-size: var(--el-font-size-base);
    visibility: hidden;
  }

  &__input {
    @apply flex-shrink-0 w-auto min-w-[100px] max-w-full;

    :deep(.el-input__inner) {
      height: var(--ap-tag-input-height);
      line-height: var(--ap-tag-input-height);
    }

    :deep(.el-input__wrapper) {
      padding: var(--ap-tag-input-padding);
    }
  }

  &__new {
    height: var(--ap-tag-button-height);
    padding: var(--ap-tag-button-padding);
  }
}
</style>

<style lang="scss">
.ap-tag-list__tooltip {
  max-width: 94vw;
  word-break: break-word;
}
</style>
