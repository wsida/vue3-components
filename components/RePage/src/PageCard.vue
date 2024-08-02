<template>
  <div
    class="ap-page-card-wrapper"
    :class="{
      'is-shadow': shadow,
      'is-border': border,
      'is-h-full': hFull,
      'with-outer-tabs': showOuterTabs,
      'with-inner-tabs': showInnerTabs,
      'with-none-padding-top': ignorePaddingTop,
      'with-none-padding-bottom': ignorePaddingBottom,
      'with-none-padding-left': ignorePaddingLeft,
      'with-none-padding-right': ignorePaddingRight,
      'with-none-padding-x': ignorePaddingX,
      'with-none-padding-y': ignorePaddingY
    }"
  >
    <div v-if="showOuterTabs" class="ap-page-card__outer-tabs">
      <ReTabs
        v-model="activeTab"
        :tabs="tabs"
        :defaultTab="defaultTab"
        type="card"
        @update:modelValue="handleTabChange"
      />
    </div>
    <el-card shadow="never" class="ap-page-card" :style="cardStyle">
      <template v-if="title || $slots.header" #header>
        <slot name="header"
          ><div>{{ title || "" }}</div></slot
        >
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
      <div v-if="showInnerTabs" class="ap-page-card__inner-tabs">
        <ReTabs
          v-model="activeTab"
          :tabs="tabs"
          :defaultTab="defaultTab"
          @update:modelValue="handleTabChange"
        />
      </div>
      <div class="ap-page-card__content">
        <slot />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import ReTabs from "@/components/ReTabs/ReTabs.vue";
import { computed, watch, ref, withDefaults } from "vue";
import type { Tab } from "@/components/ReTabs/types";

defineOptions({
  name: "RePageCard"
});

const props = withDefaults(
  defineProps<{
    title?: string;
    shadow?: boolean;
    border?: boolean;
    radius?: number;
    tab?: string;
    tabs?: Array<Tab>;
    tabsInner?: boolean;
    defaultTab?: string;
    cardStyle?: string;
    hFull?: boolean;
    ignorePaddingTop?: boolean;
    ignorePaddingBottom?: boolean;
    ignorePaddingLeft?: boolean;
    ignorePaddingRight?: boolean;
    ignorePaddingX?: boolean;
    ignorePaddingY?: boolean;
  }>(),
  {
    shadow: true,
    border: false,
    radius: 8,
    tabsInner: true,
    ignorePaddingTop: false,
    ignorePaddingBottom: false,
    ignorePaddingX: false,
    ignorePaddingY: false
  }
);

const emits = defineEmits<{
  (e: "change-tab", tab: Tab["name"]): void;
}>();

const activeTab = defineModel<Tab["name"]>("tab");

const normalizeRadius = computed(() => `${Math.max(props.radius, 0)}px`);

const hasTabs = computed(() => !!props.tabs && !!props.tabs.length);
const showOuterTabs = computed(() => hasTabs.value && !props.tabsInner);
const showInnerTabs = computed(() => hasTabs.value && props.tabsInner);

function handleTabChange(tab: Tab["name"]) {
  emits("change-tab", tab);
}
</script>

<style lang="scss" scoped>
.ap-page-card-wrapper {
  --ap-page-card-padding-y: 18px;
  --ap-page-card-padding-x: 20px;

  position: relative;

  &.is-h-full {
    @apply h-full max-h-full flex flex-col;

    .ap-page-card {
      @apply flex flex-col flex-1 overflow-hidden;

      :deep(.el-card__header) {
        @apply flex-shrink-0;
      }

      :deep(.el-card__footer) {
        @apply flex-shrink-0;
      }

      :deep(.el-card__body) {
        @apply flex-1 overflow-hidden;
      }

      &__content {
        @apply h-full overflow-hidden;
      }

      &__outer-tabs {
        @apply flex-shrink-0;
      }
    }
  }

  &.is-shadow {
    .ap-page-card {
      box-shadow: var(--el-box-shadow-lighter);
    }
  }

  &.is-border {
    .ap-page-card {
      border-width: 1px;

      &__outer-tabs {
        :deep(.el-tabs__header) {
          @apply ml-0;

          .el-tabs__nav-wrap {
            @apply top-0;
          }
        }
      }
    }
  }

  &.with-none-padding-top {
    .ap-page-card {
      &__content {
        @apply pt-0;
      }
    }
  }

  &.with-none-padding-bottom {
    .ap-page-card {
      &__content {
        @apply pb-0;
      }
    }
  }

  &.with-none-padding-left {
    .ap-page-card {
      &__content {
        @apply pl-0;
      }
    }
  }

  &.with-none-padding-right {
    .ap-page-card {
      &__content {
        @apply pr-0;
      }
    }
  }

  &.with-none-padding-x {
    .ap-page-card {
      &__content {
        @apply px-0;
      }
    }
  }

  &.with-none-padding-y {
    .ap-page-card {
      &__content {
        @apply py-0;
      }
    }
  }

  &.with-outer-tabs {
    .ap-page-card {
      border-top-left-radius: 0 !important;
      border-top-right-radius: 0 !important;
    }
  }

  .ap-page-card {
    --el-card-border-radius: v-bind("normalizeRadius") !important;

    border-width: 0;

    :deep(.el-card__body) {
      @apply p-0;
    }

    :deep(.el-card__header) {
      @apply px-[var(--ap-page-card-padding-x)] py-[var(--ap-page-card-padding-y)];
    }

    :deep(.el-card__footer) {
      @apply px-[var(--ap-page-card-padding-x)] py-[var(--ap-page-card-padding-y)];
    }

    &__content {
      @apply px-[var(--ap-page-card-padding-x)] py-[var(--ap-page-card-padding-y)];
    }

    &__outer-tabs {
      --ap-page-card-tabs-radius: v-bind("normalizeRadius") !important;

      position: relative;
      z-index: 1;

      :deep(.el-tabs__header) {
        @apply -ml-[1px];

        .el-tabs__nav-wrap {
          @apply mb-0 -top-[1px];
        }

        .el-tabs__nav {
          background-color: var(--el-fill-color-blank);
          border-radius: var(--ap-page-card-tabs-radius)
            var(--ap-page-card-tabs-radius) 0 0;
        }

        .el-tabs__item {
          border-bottom-color: var(--el-border-color-light);

          &.is-active {
            border-bottom-color: transparent;
          }
        }
      }
    }

    &__inner-tabs {
      :deep(.el-tabs__header) {
        .el-tabs__nav-scroll {
          @apply px-[16px];
        }
      }
    }
  }
}
</style>
<style lang="scss">
.ap-page-card-wrapper + .ap-page-card-wrapper {
  @apply mt-[var(--ap-box-margin)];
}
</style>
