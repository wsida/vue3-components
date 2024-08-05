<template>
  <div ref="pageTableWrapperRef" class="ap-page-table">
    <div class="ap-page-table__toolbox">
      <div class="ap-page-table__toolbox-left">
        <slot name="toolbox-left" />
      </div>
      <div class="ap-page-table__toolbox-right">
        <slot name="toolbox-right" />
        <el-tooltip
          v-if="showStripeIcon"
          class="box-item"
          effect="dark"
          content="表格斑马纹"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-switch
            v-model="stripe"
            inline-prompt
            active-text="开"
            inactive-text="关"
            class="mx-2"
          />
        </el-tooltip>
        <el-tooltip
          v-if="showBorderIcon"
          effect="dark"
          content="表格边框"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-switch
            v-model="border"
            :disabled="resizable"
            inline-prompt
            active-text="开"
            inactive-text="关"
            class="mx-2"
          />
        </el-tooltip>
        <el-tooltip
          v-if="showResizeIcon"
          effect="dark"
          content="表格列宽调整"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-switch
            v-model="resizable"
            inline-prompt
            active-text="开"
            inactive-text="关"
            class="mx-2"
          />
        </el-tooltip>
        <el-divider
          v-if="showStripeIcon || showBorderIcon || showResizeIcon"
          direction="vertical"
        />
        <el-tooltip
          v-if="showRefreshIcon"
          effect="dark"
          content="刷新数据"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-button link class="!mx-2" @click="onRefresh"
            ><IconifyIconOffline class="text-[16px]" :icon="Refresh"
          /></el-button>
        </el-tooltip>
        <el-tooltip
          v-if="showGutterIcon"
          effect="dark"
          content="紧密程度"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-dropdown popper-class="ap-page-table__drowdown" trigger="click">
            <el-button link class="!mx-2"
              ><IconifyIconOnline
                class="text-[16px]"
                icon="ri:expand-height-line"
              />
              <!-- <IconifyIconOffline class="text-[16px]" :icon="ExpandLine" /> -->
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :class="{ 'is-active': tableGutter === 'default' }"
                  @click="tableGutter = 'default'"
                  >默认</el-dropdown-item
                >
                <el-dropdown-item
                  :class="{ 'is-active': tableGutter === 'medium' }"
                  @click="tableGutter = 'medium'"
                  >中等</el-dropdown-item
                >
                <el-dropdown-item
                  :class="{ 'is-active': tableGutter === 'small' }"
                  @click="tableGutter = 'small'"
                  >紧凑</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip
          v-if="showSizeIcon"
          effect="dark"
          content="字体大小"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-dropdown popper-class="ap-page-table__drowdown" trigger="click">
            <el-button link class="!mx-2"
              ><IconifyIconOffline class="text-[16px]" :icon="FontSize" />
              <!-- <IconifyIconOffline class="text-[16px]" :icon="ExpandLine" /> -->
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :class="{ 'is-active': tableSize === 'default' }"
                  @click="tableSize = 'default'"
                  >默认</el-dropdown-item
                >
                <el-dropdown-item
                  :class="{ 'is-active': tableSize === 'large' }"
                  @click="tableSize = 'large'"
                  >大号</el-dropdown-item
                >
                <el-dropdown-item
                  :class="{ 'is-active': tableSize === 'small' }"
                  @click="tableSize = 'small'"
                  >小号</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>
        <el-tooltip
          v-if="showFullscreenIcon"
          effect="dark"
          content="全屏"
          placement="top"
          :teleported="!isFullscreen"
          ><el-button link class="!mx-2" @click="toggleFullScreen">
            <IconifyIconOffline
              class="text-[16px]"
              :icon="isFullscreen ? ExitFullscreen : Fullscreen"
            />
          </el-button>
        </el-tooltip>
        <el-tooltip
          v-if="showSettingIcon"
          effect="dark"
          content="设置"
          placement="top"
          :teleported="!isFullscreen"
        >
          <el-button
            ref="settingButtonRef"
            v-click-outside="onClickOutside"
            link
            class="!mx-2"
            ><IconifyIconOffline class="text-[16px]" :icon="Setting"
          /></el-button>
        </el-tooltip>
        <!--列配置-->
        <RePageTableSettingPopover
          v-model:columns="settingColumns"
          v-model:checks="showColumns"
          v-model:visible="popoverVisible"
          :fixed-columns="fixedColumns"
          :buttonRef="settingButtonRef"
          :teleported="!isFullscreen"
          @reset="onReset"
        />
      </div>
    </div>
    <ReTable
      ref="reTableRef"
      :data="data"
      :border="resizable || border"
      :stripe="stripe"
      :columns="localColumns"
      :gutter="tableGutter"
      :size="tableSize"
      v-bind="$attrs"
    />
  </div>
</template>
<script setup lang="ts">
import ReTable from "./main.vue";
import RePageTableSettingPopover from "./children/setting-popover.vue";
import { unref, ref, computed, useAttrs } from "vue";
import { ReTableColumn } from "../types";
import { isUndefined } from "lodash-es";
import type {
  RePageTableProps,
  RePageTableColumn,
  RePageTableEmits
} from "../types";
import { ElButton, ClickOutside as vClickOutside } from "element-plus";
import { isFunction } from "lodash-es";
import { useFullscreen } from "@vueuse/core";
import Refresh from "@iconify-icons/ri/refresh-line";
import FontSize from "@iconify-icons/ri/font-size";
import Setting from "@iconify-icons/ri/settings-2-line";
import Fullscreen from "@iconify-icons/ri/fullscreen-fill";
import ExitFullscreen from "@iconify-icons/ri/fullscreen-exit-fill";

defineOptions({
  name: "RePageTable",
  inheritAttrs: false
});

const props = withDefaults(defineProps<RePageTableProps>(), {
  defaultGutter: "default",
  defaultSize: "default",
  defaultBorder: false,
  defaultStripe: true,
  defaultResizable: false,
  showResizeIcon: false,
  showSizeIcon: false,
  showGutterIcon: true,
  showBorderIcon: true,
  showStripeIcon: true,
  showFullscreenIcon: true,
  showSettingIcon: true,
  showRefreshIcon: true,
  defaultMinWidth: 56
});

const $attrs = useAttrs();

const defaultShowColumns: string[] = props.columns
  .filter(
    (column: RePageTableColumn) =>
      column.fixedShow || isUndefined(column.defaultShow) || column.defaultShow
  )
  .map((column: RePageTableColumn) => column.prop);

const defaultSettingColumns: Array<{ label: string; prop: string }> =
  props.columns.map((column: RePageTableColumn) => ({
    label: column.label,
    prop: column.prop
  }));

const emits = defineEmits<RePageTableEmits>();

const reTableRef = ref<InstanceType<typeof ReTable> | null>(null);
const pageTableWrapperRef = ref<HTMLDivElement | null>(null);
const settingButtonRef = ref<InstanceType<typeof ElButton> | null>(null);

const border = ref(props.defaultBorder);
const stripe = ref(props.defaultStripe);
const tableSize = ref(props.defaultSize);
const tableGutter = ref(props.defaultGutter);
const resizable = ref(props.defaultResizable);

const popoverVisible = ref(false);
// 固定展示的列
const fixedColumns = computed<string[]>(() =>
  props.columns
    .filter((column: RePageTableColumn) => !!column.fixedShow)
    .map((column: RePageTableColumn) => column.prop)
);

console.log($attrs);

// 当前展示的列
const showColumns = ref<string[]>([...defaultShowColumns]);
const settingColumns = ref<Array<{ label: string; prop: string }>>([
  ...defaultSettingColumns
]);

const fullscreenTarget = computed(() =>
  props.fullscreenTarget
    ? isFunction(props.fullscreenTarget)
      ? props.fullscreenTarget()
      : props.fullscreenTarget
    : (pageTableWrapperRef.value as any)?.parentElement
);
const { isFullscreen, enter, exit } = useFullscreen(fullscreenTarget);

const localColumns = computed<ReTableColumn[]>(() => {
  let columns = settingColumns.value.filter((column: RePageTableColumn) =>
    showColumns.value.includes(column.prop)
  );

  if (resizable.value) {
    columns = columns.map((column: RePageTableColumn) => {
      if (isUndefined(column.resizable) && !column.ignoreResizable) {
        column.resizable = true;
        if (isUndefined(column.minWidth)) {
          column.minWidth = props.defaultMinWidth;
        }
      }
      return column;
    });
  }

  return columns;
});

// 全屏
function toggleFullScreen() {
  if (unref(isFullscreen)) {
    exit();
  } else {
    enter();
  }
}

function onClickOutside() {
  popoverVisible.value = false;
}

function onRefresh() {
  emits("refresh");
  reTableRef.value && reTableRef.value.toRemote();
}

function onReset() {
  emits("reset");
  showColumns.value = [...defaultShowColumns];
  settingColumns.value = [...defaultSettingColumns];
}
</script>

<style lang="scss" scoped>
.ap-page-table {
  @apply relative w-full;

  &__toolbox {
    @apply flex items-center justify-between mb-3;
  }

  &__toolbox-right {
    @apply flex items-center justify-end ml-4;
  }
}
</style>
<style lang="scss">
.ap-page-table__drowdown {
  .el-dropdown-menu__item {
    &.is-active {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);

      &:hover {
        background-color: var(--el-color-primary-light-8);
      }
    }

    &:not(.is-active):hover {
      color: var(--el-color-primary);
      background-color: transparent !important;
    }
  }
}
</style>
