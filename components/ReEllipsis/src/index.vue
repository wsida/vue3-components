<script lang="tsx">
import { isBoolean } from "lodash-es";
import { mergeStyle } from "@/utils/dom";
import { useResizeObserver } from "@vueuse/core";
import {
  ref,
  computed,
  watch,
  unref,
  CSSProperties,
  defineComponent,
  onMounted,
  onUpdated,
  nextTick,
  onBeforeUnmount
} from "vue";
import ReCollapsedBtn from "@/components/ReCollapsedBtn";

export default defineComponent({
  name: "ReEllipsis",
  components: { ReCollapsedBtn },
  props: {
    // text
    content: {
      type: String,
      default: ""
    },

    // text rows
    rows: {
      type: Number,
      default: 1,
      validator: (val: number) => val > 0
    },

    // character count of text
    charCount: {
      type: Number,
      validator: (val: number) => val > 0
    },

    // height of text
    height: {
      type: Number,
      validator: (val: number) => val > 0
    },

    // line-height of text
    lineHeight: {
      type: Number,
      default: 16
    },

    // word break
    wordBreak: {
      type: Boolean,
      default: false
    },

    // whether show tooltip
    tooltip: {
      type: [Boolean, Object],
      default: false
    },

    // custom style of ellipsis
    ellipsisStyle: [String, Object],

    // step of calcute ellipsis
    step: {
      type: Number,
      default: 5,
      validator: (val: number) => val > 1
    },

    showCollapsed: {
      type: Boolean,
      default: false
    },

    defaultCollapsed: {
      type: Boolean,
      default: true
    }
  },

  emits: ["ellipsis"],
  expose: ["update"],

  setup(props, { slots, emit }) {
    let unobserve;

    const wrapperRef = ref<HTMLDivElement | null>(null);
    const slotText = ref(""); // 插槽文本
    const localText = ref(""); // 省略文本
    const virtualDOM = ref<HTMLDivElement | null>(null);
    const containerHeight = ref(0);
    const beforeBreakText = ref(""); // 未拆分单词的文本
    const localRows = ref(0); // 显示行数
    const localChars = ref(0); // 显示字符数
    const localHeight = ref(0); // 显示文本高度
    const collapsed = ref(props.defaultCollapsed);

    // 实际文本
    const ellipsisText = computed<string>(() => {
      if (props.content) return props.content;
      return slotText.value || "";
    });

    // 是否显示省略号
    const showEllipsis = computed<boolean>(() => {
      return (
        localText.value.length &&
        localText.value.length < ellipsisText.value.length
      );
    });

    // ellipsis样式
    const localEllipsisStyle = computed<CSSProperties>(() => {
      const styleObj: CSSProperties = {};
      // 拆分单词
      if (!props.wordBreak) {
        // 默认按单词拆分
        styleObj.wordBreak = "break-word";
      } else {
        // 全部拆分
        styleObj.wordBreak = "break-all";
      }

      // 行高
      if (props.lineHeight) {
        styleObj.lineHeight = `${parseInt(props.lineHeight, 10)}px`;
      } else {
        styleObj.lineHeight = "16px";
      }

      // 高度
      if (props.height) {
        styleObj.height = `${parseInt(props.height, 10)}px`;
      }

      return mergeStyle(styleObj, props.ellipsisStyle || "");
    });

    // 限制高度
    const isLimitHeight = computed<boolean>(() => {
      return !!localEllipsisStyle.value.height;
    });

    // 省略策略
    const ellipsisMode = computed<string | number>(() => {
      // 优先级 h > c > r
      if (isLimitHeight.value) return "h";
      if (props.charCount) return "c";
      return "r";
    });

    // tooltip
    const localTooltip = computed<Record<string, any> | boolean>(() => {
      if (!props.tooltip) return false;
      const defaultTooltip = {
        placement: "bottom",
        trigger: "hover",
        effect: "dark",
        showArrow: true,
        popperClass: [
          "ap-ellipsis-tooltip",
          props.wordBreak ? "ap-ellipsis-tooltip--break" : ""
        ].join(" "),
        teleported: true
      };

      return {
        ...defaultTooltip,
        ...(isBoolean(props.tooltip) ? {} : props.tooltip),
        disabled:
          (props.showCollapsed && !unref(collapsed)) || !showEllipsis.value
      };
    });

    // 对外暴露刷新接口
    function update() {
      init();
    }

    //  元素尺寸改变
    function handleResize() {
      calculate(unref(ellipsisText));
    }

    function init() {
      containerHeight.value = wrapperRef.value.getBoundingClientRect().height;
      virtualDOM.value = wrapperRef.value
        .querySelector(".re-text-ellipsis__virtual")
        .querySelector(".re-text-ellipsis__text");

      calculate(unref(ellipsisText));
    }

    // 计算省略
    function calculate(text: string) {
      if (!text) {
        localText.value = "";
        beforeBreakText.value = "";
        localRows.value = 0;
        localHeight.value = 0;
        localChars.value = 0;
        return;
      }

      // 计算
      if (isNeed(text)) {
        if (virtualDOM.value) {
          virtualDOM.value.innerHTML = "";
          // 默认行高，不考虑行高出现的高度差
          const offset = 0;
          // 初始化字段
          let start = 0;
          let step = props.step;
          let end = false;
          let currentHeight = 0;
          let lastCurrentHeight = 0;
          let currentRows = 0;
          // 计算开始
          while (!end && start < text.length) {
            // 更新高度
            lastCurrentHeight = currentHeight;
            // 重新计算
            start += step;
            virtualDOM.value.innerHTML =
              text.substr(0, Math.min(start, text.length)) + "...";
            currentHeight =
              virtualDOM.value.parentElement.getBoundingClientRect().height;
            // 行数统计
            if (currentHeight - offset > lastCurrentHeight) {
              currentRows++;
            }
            // 根据省略策略处理
            switch (unref(ellipsisMode)) {
              case "h": {
                end = currentHeight > unref(containerHeight);
                break;
              }
              case "c": {
                end = start > parseInt(props.charCount, 10);
                break;
              }
              case "r": {
                end = currentRows > parseInt(props.rows, 10);
                break;
              }
            }
          }
          // 计算结束
          // 处理步长
          if (end) {
            const stepHeight = currentHeight;
            let stepEnd = false;
            let stepRows = currentRows;
            while (!stepEnd && step >= 0) {
              start--;
              virtualDOM.value.innerHTML =
                text.substr(0, Math.min(start, text.length)) + "...";
              const stepCurrentHeight =
                virtualDOM.value.parentElement.getBoundingClientRect().height;
              if (stepCurrentHeight + offset < stepHeight) {
                stepRows--;
              }
              // 根据省略策略处理
              switch (unref(ellipsisMode)) {
                case "h": {
                  stepEnd = stepCurrentHeight + offset < stepHeight;
                  break;
                }
                case "c": {
                  stepEnd = start <= parseInt(props.charCount, 10);
                  break;
                }
                case "r": {
                  stepEnd = stepRows <= parseInt(props.rows, 10);
                  break;
                }
              }
              // 继续循环
              step--;
            }
          }
          // 最终处理
          localRows.value = currentRows - 1;
          localHeight.value = lastCurrentHeight;
          localText.value = end ? text.substr(0, start) : text;
          localChars.value = localText.value.length;
          virtualDOM.value.innerHTML = "";
          // 单词拆分
          !props.wordBreak && toBreakWord();
        }
      } else {
        localText.value = text;
        beforeBreakText.value = text;
        virtualDOM.value.innerHTML = "";
      }

      emit("ellipsis", unref(showEllipsis));
    }

    // 是否需要省略
    function isNeed(text: string): boolean {
      let flag = true;
      virtualDOM.value.innerHTML = text;
      const currentHeight =
        virtualDOM.value.parentElement.getBoundingClientRect().height;
      switch (unref(ellipsisMode)) {
        case "h": {
          flag = currentHeight > unref(containerHeight);
          if (!flag) {
            localHeight.value = currentHeight;
          }
          break;
        }
        case "c": {
          flag = text.length > parseInt(props.charCount, 10);
          if (!flag) {
            localChars.value = text.length;
          }
          break;
        }
        case "r": {
          const lineHeight = parseInt(localEllipsisStyle.value.lineHeight, 10);
          if (lineHeight) {
            const rows = currentHeight / lineHeight;
            flag = rows > parseInt(props.rows, 10);
            if (!flag) {
              localRows.value = rows;
            }
          }
          break;
        }
      }
      return flag;
    }

    // 拆分单词
    function toBreakWord() {
      if (
        unref(showEllipsis) &&
        unref(ellipsisMode) !== "c" &&
        !props.wordBreak
      ) {
        let start = 0;
        let end = false;
        while (!end && start < unref(localText).length) {
          start++;
          const subMatch = unref(localText)
            .substr(-start)
            .match(/^(\s?)([a-zA-z]*)$/);
          if (!subMatch) {
            // 未找到
            end = true;
            start = 0;
          } else if (subMatch[1] !== "") {
            // 空格分割
            end = true;
          }
        }
        // 截取
        if (
          end &&
          start !== 0 &&
          new RegExp("[a-zA-Z]").test(
            unref(ellipsisText)[unref(localText).length] || ""
          )
        ) {
          localText.value = localText.value.substr(
            0,
            localText.value.length - start
          );
          localChars.value = localChars.value - start;
        }
      }
    }

    function getSlotText() {
      if (slots && slots.default) {
        const slotNode = slots.default();
        if (slotNode[0] && slotNode[0].children) {
          slotText.value = (slotNode[0].children as string).trim();
        }
      }
    }

    watch(
      () => [
        props.showCollapsed,
        unref(ellipsisText),
        props.charCount,
        props.rows,
        props.lineHeight,
        props.wordBreak
      ],
      () => {
        calculate(unref(ellipsisText));
      }
    );

    watch(
      () => [unref(isLimitHeight), props.ellipsisStyle],
      () => {
        init();
      }
    );

    onUpdated(() => {
      if (!props.content) {
        getSlotText();
      }
    });

    onMounted(() => {
      nextTick(() => {
        getSlotText();
        init();
        unobserve = useResizeObserver(unref(wrapperRef), handleResize);
      });
    });

    onBeforeUnmount(() => {
      unobserve && unobserve.stop();
    });

    return () => {
      const textVNode = (
        <span class="re-text-ellipsis__text">
          {!props.showCollapsed || unref(collapsed)
            ? unref(localText)
            : unref(ellipsisText)}
          {(!props.showCollapsed || unref(collapsed)) && unref(showEllipsis)
            ? "..."
            : ""}
        </span>
      );

      const contentVNode = localTooltip.value ? (
        <el-tooltip
          content={unref(ellipsisText)}
          {...(unref(localTooltip) as Object)}
        >
          {textVNode}
        </el-tooltip>
      ) : (
        textVNode
      );

      const ellipsisVNode = (
        <div class="re-text-ellipsis__content">
          {contentVNode}
          {props.showCollapsed && unref(showEllipsis) && (
            <ReCollapsedBtn
              hiddenText={true}
              modelValue={unref(collapsed)}
              onUpdate:modelValue={(val: boolean) => {
                collapsed.value = val;
              }}
            />
          )}
        </div>
      );
      const virtualVNode = (
        <div class="re-text-ellipsis__virtual">
          <span class="re-text-ellipsis__text">{slots?.default?.()}</span>
          {props.showCollapsed && (
            <ReCollapsedBtn hiddenText={true} modelValue={unref(collapsed)} />
          )}
        </div>
      );
      return (
        <div
          ref={wrapperRef}
          class="re-text-ellipsis"
          style={unref(localEllipsisStyle)}
        >
          {ellipsisVNode}
          {virtualVNode}
        </div>
      );
    };
  }
});
</script>

<style lang="scss">
.re-text-ellipsis {
  position: relative;
  overflow: hidden;

  .re-text-ellipsis__content {
    position: relative;
  }

  .re-text-ellipsis__virtual {
    position: absolute;
    bottom: -150%;
    width: 100%;
    opacity: 0;
  }
}

.ap-ellipsis-tooltip {
  max-width: 94vw;
  word-break: break-word;

  &.ap-ellipsis-tooltip--break {
    word-break: break-all;
  }
}
</style>
