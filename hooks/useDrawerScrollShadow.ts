import { useScroll, useResizeObserver } from "@vueuse/core";
import { computed, ref, watch, nextTick } from "vue";
import type { Ref } from "vue";
import type { ElDrawer } from "element-plus";
import generateRandomString from "@/utils/randomString";
import { debounce } from "lodash-es";

export type ElDrawerInstance = InstanceType<typeof ElDrawer>;

const HEADER_CLASS = ".el-drawer__header";
const BODY_CLASS = ".el-drawer__body";
const FOOTER_CLASS = ".el-drawer__footer";
const SHADOW_STYLE = "var(--el-box-shadow-light)";

export default function useDrawerScrollShadow(
  visible: Ref<boolean>,
  prefix: string,
  append = "--"
) {
  const did = ref<string>(`${generateRandomString(6)}-${new Date().getTime()}`);
  const wrapperDOM = ref<HTMLDivElement | null>(null);
  const doms = ref<{
    header: HTMLDivElement | null;
    body: HTMLDivElement | null;
    footer: HTMLDivElement | null;
  }>({
    header: null,
    body: null,
    footer: null
  });
  const shadowFlag = ref<{
    header: boolean;
    footer: boolean;
  }>({ header: false, footer: false });
  const lastShadow = ref<{
    header: string;
    footer: string;
  }>({ header: "", footer: "" });
  const lastZIndex = ref<{
    header: string;
    footer: string;
  }>({ header: "", footer: "" });

  const listenerDOM = computed(() => doms.value.body);
  const drawerWrapperClass = computed(() => `${prefix}${append}${did.value}`);

  const { arrivedState, measure } = useScroll(listenerDOM, {
    onScroll: handleShadow,
    onStop: handleShadow,
    throttle: 0,
    offset: {
      top: 5,
      bottom: 5
    }
  });

  useResizeObserver(
    listenerDOM,
    debounce(() => {
      measure();
      handleShadow();
    }, 200),
    {
      box: "content-box"
    }
  );

  function handleShadow() {
    if (arrivedState.bottom) {
      if (shadowFlag.value.footer) {
        removeShadowStyle("footer");
      }
    } else {
      if (!shadowFlag.value.footer) {
        addShadowStyle("footer");
      }
    }
    if (arrivedState.top) {
      if (shadowFlag.value.header) {
        removeShadowStyle("header");
      }
    } else {
      if (!shadowFlag.value.header) {
        addShadowStyle("header");
      }
    }
  }

  function addShadowStyle(type: "header" | "footer") {
    if (!doms.value[type]) return;
    lastShadow.value[type] = doms.value[type]!.style.boxShadow || "";
    doms.value[type]!.style.boxShadow = SHADOW_STYLE;
    lastZIndex.value[type] = doms.value[type]!.style.zIndex || "";
    doms.value[type]!.style.zIndex = "1";
    shadowFlag.value[type] = true;
  }

  function removeShadowStyle(type: "header" | "footer") {
    if (!doms.value[type]) return;
    doms.value[type]!.style.boxShadow = lastShadow.value[type];
    lastShadow.value[type] = "";
    doms.value[type]!.style.zIndex = lastZIndex.value[type];
    lastZIndex.value[type] = "";
    shadowFlag.value[type] = false;
  }

  watch(visible, val => {
    if (val && !wrapperDOM.value) {
      nextTick(() => {
        wrapperDOM.value = document.querySelector(
          `.${drawerWrapperClass.value}`
        );
        if (wrapperDOM.value) {
          doms.value.header = wrapperDOM.value.querySelector(HEADER_CLASS);
          doms.value.body = wrapperDOM.value.querySelector(BODY_CLASS);
          doms.value.footer = wrapperDOM.value.querySelector(FOOTER_CLASS);
        }
      });
    }
  });

  return {
    drawerWrapperClass,
    did
  };
}
