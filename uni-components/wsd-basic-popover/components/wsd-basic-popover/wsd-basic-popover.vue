<template>
  <view
      v-if="renderFlag"
      v-show="!isHidden"
      class="wsd-basic-popover"
      @touchmove.stop="noop"
      @click.stop="noop"
  >
      <view
          v-if="showMask && activeFullMask"
          :style="maskStyle"
          class="wsd-basic-popover__mask"
          @click="onClickMask"
      ></view>
      <view
          v-if="showMask && !activeFullMask"
          :style="maskGroupStyle"
          class="wsd-basic-popover__mask-group"
          @click="onClickMask"
      >
          <view
              class="wsd-basic-popover__mask-item is-box"
              :style="maskBoxStyle"
          ></view>
          <template v-if="maskMode === 'default'">
              <view
                  class="wsd-basic-popover__mask-item is-top"
                  :style="maskTopStyle"
              ></view>
              <view
                  class="wsd-basic-popover__mask-item is-bottom"
                  :style="maskBottomStyle"
              ></view>
              <view
                  class="wsd-basic-popover__mask-item is-left"
                  :style="maskLeftStyle"
              ></view>
              <view
                  class="wsd-basic-popover__mask-item is-right"
                  :style="maskRightStyle"
              ></view>
          </template>
      </view>
      <view
          :style="popoverStyle"
          class="wsd-basic-popover__wrapper"
      >
          <view
              v-if="activeShowTriangle"
              :style="triangleStyle"
              class="wsd-basic-popover__triangle"
          ></view>
          <view class="wsd-basic-popover__content">
              <slot></slot>
          </view>
      </view>
  </view>
</template>

<script>
const DefaultPlacementY = ["top", "bottom", "left", "right"];
const DefaultPlacementX = ["start", "", "end"];
export default {
  name: "basic-popover",
  model: {
      prop: "modelValue",
      event: "update:modelValue",
  },
  props: {
      modelValue: {
          type: Boolean,
          default: false,
      },

      zIndex: {
          type: Number,
          default: 3,
      },

      showMask: {
          type: Boolean,
          default: true,
      },

      targetRect: {
          type: Object, // left / top / right / bottom / width / height
      },

      radius: {
          type: [String, Number],
          default: "16rpx",
      },

      offset: {
          // popover弹窗与触发器间距 - 不算三角形
          type: Number,
          default: 16, // px
      },

      showTriangle: {
          type: Boolean,
          default: true,
      },

      placement: {
          // 默认展示方向
          type: String,
          default: "top-start",
          // left-start // left-end // left
          // right-start // right-end // right
          // top-start // top-end // top
          // bottom-start // bottom // bottom-end
          // 'center'
      },

      placementWeight: {
          type: Array,
      },

      closeByClickMask: {
          type: Boolean,
          default: true,
      },

      maskColor: {
          type: String,
          default: "rgba(0, 0, 0, 0.56)",
      },

      popoverColor: {
          type: String,
          default: "#fff",
      },

      triangleColor: {
          type: String,
          default: "#fff",
      },

      triangleOffset: {
          // start / end 三角形水平偏移距离
          type: Number,
          default: 24,
      },

      triangleSize: {
          type: Number,
          default: 12,
      },

      ignoreMenubar: {
          // 安全区域包括右上角胶囊按钮
          type: Boolean,
          default: true,
      },

      fullMask: {
          type: Boolean,
          default: true,
      },

      maskMode: {
          // 只在 fullMask = false 有效
          type: String,
          default: "default", // 'shadow'
      },

      maskRadius: {
          // 只在 fullMask = false & maskMode = 'shadow' 有效
          type: Number,
          default: 6,
      },
  },

  data() {
      return {
          renderFlag: false,
          isHidden: false,
          screenSize: { width: 0, height: 0, safeTop: 0, safeBottom: 0 },
          contentRect: null,
          maskPosition: {
              box: { top: 0, left: 0, width: 0, height: 0 },
              top: { top: 0, left: 0, width: 0, height: 0 },
              right: { top: 0, left: 0, width: 0, height: 0 },
              bottom: { top: 0, left: 0, width: 0, height: 0 },
              left: { top: 0, left: 0, width: 0, height: 0 },
          },
          opacity: 0,
          activeFullMask: this.fullMask,
          activeShowTriangle: this.showTriangle,
          activePlacement: this.placement,
      };
  },

  computed: {
      visible: {
          get() {
              return this.modelValue;
          },
          set(val) {
              this.$emit("update:modelValue", val);
          },
      },

      maskStyle() {
          return {
              "--mask-color": this.maskColor,
              "--mask-z-index": Math.max(1, this.zIndex - 1),
          };
      },

      maskGroupStyle() {
          return {
              ...this.maskStyle,
              "--mask-opacity": this.opacity,
          };
      },

      maskBoxStyle() {
          if (this.activeFullMask) return {};
          const styles = {
              left: `${this.maskPosition.box.left}px`,
              top: `${this.maskPosition.box.top}px`,
              width: `${this.maskPosition.box.width}px`,
              height: `${this.maskPosition.box.height}px`,
          };

          if (this.maskMode === "shadow") {
              styles.boxShadow = `0 0 1px ${Math.max(
                  this.screenSize.width,
                  this.screenSize.height
              )}px ${this.maskColor}`;
              styles.borderRadius = `${this.maskRadius}px`;
          }

          return styles;
      },

      maskTopStyle() {
          if (this.activeFullMask) return {};
          return {
              left: `${this.maskPosition.top.left}px`,
              top: `${this.maskPosition.top.top}px`,
              width: `${this.maskPosition.top.width}px`,
              height: `${this.maskPosition.top.height}px`,
          };
      },

      maskBottomStyle() {
          if (this.activeFullMask) return {};
          return {
              left: `${this.maskPosition.bottom.left}px`,
              top: `${this.maskPosition.bottom.top}px`,
              width: `${this.maskPosition.bottom.width}px`,
              height: `${this.maskPosition.bottom.height}px`,
          };
      },

      maskLeftStyle() {
          if (this.activeFullMask) return {};
          return {
              left: `${this.maskPosition.left.left}px`,
              top: `${this.maskPosition.left.top}px`,
              width: `${this.maskPosition.left.width}px`,
              height: `${this.maskPosition.left.height}px`,
          };
      },

      maskRightStyle() {
          if (this.activeFullMask) return {};
          return {
              left: `${this.maskPosition.right.left}px`,
              top: `${this.maskPosition.right.top}px`,
              width: `${this.maskPosition.right.width}px`,
              height: `${this.maskPosition.right.height}px`,
          };
      },

      popoverStyle() {
          return {
              "--popover-color": this.popoverColor,
              "--popover-z-index": Math.max(1, this.zIndex),
              "--popover-left": `${this.contentRect?.left || 0}px`,
              "--popover-top": `${this.contentRect?.top || 0}px`,
              "--popover-opacity": this.opacity,
              "--popover-radius":
                  typeof this.radius === "string"
                      ? this.radius
                      : `${this.radius}px`,
          };
      },

      triangleY() {
          return this.getPlacementY(this.activePlacement);
      },

      triangleX() {
          return this.getPlacementX(this.activePlacement);
      },

      triangleStyle() {
          const styles = {
              "--triangle-color": this.triangleColor,
              "--triangle-z-index": 1,
              "--triangle-size": `${this.triangleSize}px`,
          };

          if (this.isVertical(this.triangleY)) {
              if (this.triangleX === "start") {
                  styles.left = `${this.triangleOffset}px`;
              } else if (this.triangleX === "end") {
                  styles.right = `${this.triangleOffset}px`;
              } else {
                  styles.left = `${Math.max(
                      0,
                      ((this.contentRect?.width || 0) - this.triangleSize) / 2
                  )}px`;
              }

              if (this.triangleY === "top") {
                  styles.bottom = `-${this.triangleSize / 2 - 1}px`;
              } else if (this.triangleY === "bottom") {
                  styles.top = `-${this.triangleSize / 2 - 1}px`;
              }
          } else if (this.isHorizontal(this.triangleY)) {
              if (this.triangleX === "start") {
                  styles.top = `${this.triangleOffset}px`;
              } else if (this.triangleX === "end") {
                  styles.bottom = `${this.triangleOffset}px`;
              } else {
                  styles.top = `${Math.max(
                      0,
                      ((this.contentRect?.height || 0) - this.triangleSize) /
                          2
                  )}px`;
              }

              if (this.triangleY === "left") {
                  styles.right = `-${this.triangleSize / 2 - 1}px`;
              } else if (this.triangleY === "right") {
                  styles.left = `-${this.triangleSize / 2 - 1}px`;
              }
          }

          return styles;
      },
  },

  watch: {
      visible(val) {
          // 双向绑定在特定的情况下会异常触发，将其它类型的值传入导致弹窗异常显示
          if (typeof val != "boolean") return;
          if (val) {
              // 显示
              if (this.renderFlag) {
                  // 已经渲染过
                  this.isHidden = false;
                  this.$nextTick(() => {
                      this.getPopoverRect();
                  });
              } else {
                  // 首次渲染
                  this.initRender();
              }
          } else {
              this.isHidden = true;
              this.opacity = 0;
          }
      },

      activePlacement(val) {
          this.$emit("update:placement", val);
      },

      // targetRect(val) {
      //     if (this.renderFlag && !this.isHidden) {
      //         this.updatePosition();
      //     }
      // }
  },

  created() {
      const systemInfo = uni.getWindowInfo();
      let offsetTop = 0;
      if (!this.ignoreMenubar) {
          const menuButton = uni.getMenuButtonBoundingClientRect();
          offsetTop = menuButton.bottom;
      }
      this.screenSize.width = systemInfo.windowWidth;
      this.screenSize.height = systemInfo.windowHeight;
      this.screenSize.safeTop = systemInfo.windowTop + offsetTop;
      this.screenSize.safeBottom = systemInfo.windowBottom;
  },

  methods: {
      noop() {},
      _destroy() {
          this.renderFlag = false;
          this.isHidden = false;
          this.opacity = 0;
      },

      _close() {
          this.visible = false;
      },

      _open() {
          this.visible = true;
      },

      getPlacementY(placement) {
          return placement.split("-")[0] || "top";
      },

      getPlacementX(placement) {
          return placement.split("-")[1] || "";
      },

      onClickMask() {
          if (!this.closeByClickMask) return;
          this._close();
      },

      isVertical(y) {
          return ["top", "bottom"].includes(y);
      },

      isHorizontal(y) {
          return ["left", "right"].includes(y);
      },

      // 自动调整定位-Y
      adjustPositionY(placementY = "", targetRect) {
          let resultY = placementY;
          let resultTop = 0;
          let tempTop = 0;

          const screenRect = { ...this.screenSize };
          // const targetRect = { ...this.targetRect }; // mask会调整targetRect
          const contentRect = { ...this.contentRect };

          const offset = this.offset;
          const offsetT = offset + screenRect.safeTop;
          const offsetB = offset + screenRect.safeBottom;

          const placementWeight = this.placementWeight ?? DefaultPlacementY; // 方向权重

          let hasFind = false;

          if (placementY === "top") {
              tempTop = targetRect.top - (contentRect.height + offset);
              if (targetRect.top >= contentRect.height + offsetT) {
                  resultTop = tempTop;
                  hasFind = true;
              }
          } else if (placementY === "bottom") {
              tempTop = targetRect.bottom + offset;
              if (
                  screenRect.height - targetRect.bottom >
                  contentRect.height + offsetB
              ) {
                  resultTop = tempTop;
                  hasFind = true;
              }
          } else if (placementY === "left") {
              tempTop = targetRect.left - (contentRect.width + offset);
              if (targetRect.left >= contentRect.width + offset) {
                  resultTop = tempTop;
                  hasFind = true;
              }
          } else if (placementY === "right") {
              tempTop = targetRect.right + offset;
              if (
                  screenRect.width - targetRect.right >
                  contentRect.width + offset
              ) {
                  // 允许放置
                  resultTop = tempTop;
                  hasFind = true;
              }
          }

          if (!hasFind) {
              for (const tempPlacement of placementWeight) {
                  if (placementY === tempPlacement) continue;

                  if (tempPlacement === "top") {
                      if (targetRect.top > contentRect.height + offsetT) {
                          // 允许放置
                          resultTop =
                              targetRect.top - (contentRect.height + offset);
                          resultY = "top";
                          hasFind = true;
                      }
                  } else if (tempPlacement === "bottom") {
                      if (
                          screenRect.height - targetRect.bottom >
                          contentRect.height + offsetB
                      ) {
                          // 允许放置
                          resultTop = targetRect.bottom + offset;
                          resultY = "bottom";
                          hasFind = true;
                      }
                  } else if (tempPlacement === "left") {
                      if (targetRect.left >= contentRect.width + offset) {
                          resultTop =
                              targetRect.left - (contentRect.width + offset);
                          resultY = "left";
                          hasFind = true;
                      }
                  } else if (tempPlacement === "right") {
                      if (
                          screenRect.width - targetRect.right >
                          contentRect.width + offset
                      ) {
                          // 允许放置
                          resultTop = targetRect.right + offset;
                          resultY = "right";
                          hasFind = true;
                      }
                  }

                  if (hasFind) break;
              }
          }

          if (!hasFind) {
              resultY = placementY;
              resultTop = tempTop;
          }

          return [resultY, resultTop];
      },

      // 自动调整定位-X
      adjustPositionX(placementX = "", placementY = "", targetRect) {
          let resultX = placementX;
          let resultLeft = 0;
          let tempLeft = 0;

          const screenRect = { ...this.screenSize };
          // const targetRect = { ...this.targetRect };
          const contentRect = { ...this.contentRect };

          // const offset = this.offset;
          const placementWeight = DefaultPlacementX; // 方向权重

          // 相对targetRect居中距离
          const widthOffset = (contentRect.width - targetRect.width) / 2;
          const heightOffset = (contentRect.height - targetRect.height) / 2;
          let hasFind = false;

          // 水平位置
          if (this.isVertical(placementY)) {
              if (placementX === "start") {
                  tempLeft = targetRect.left;
                  if (
                      screenRect.width - targetRect.left >=
                      contentRect.width
                  ) {
                      resultLeft = tempLeft;
                      hasFind = true;
                  }
              } else if (placementX === "end") {
                  tempLeft = targetRect.right - contentRect.width;
                  if (targetRect.right >= contentRect.width) {
                      resultLeft = tempLeft;
                      hasFind = true;
                  }
              } else {
                  tempLeft = targetRect.left - widthOffset;
                  if (
                      targetRect.left >= widthOffset &&
                      screenRect.width - targetRect.right >= widthOffset
                  ) {
                      resultLeft = tempLeft;
                      resultX = "";
                      hasFind = true;
                  }
              }
          } else if (this.isHorizontal(placementY)) {
              if (placementX === "start") {
                  tempLeft = targetRect.top;
                  if (
                      screenRect.height - targetRect.top >=
                      contentRect.height
                  ) {
                      resultLeft = tempLeft;
                      hasFind = true;
                  }
              } else if (placementX === "end") {
                  tempLeft = targetRect.bottom - contentRect.height;
                  if (targetRect.bottom >= contentRect.height) {
                      resultLeft = tempLeft;
                      hasFind = true;
                  }
              } else {
                  tempLeft = targetRect.top - heightOffset;
                  if (
                      targetRect.top >= heightOffset &&
                      screenRect.height - targetRect.bottom >= heightOffset
                  ) {
                      resultLeft = tempLeft;
                      resultX = "";
                      hasFind = true;
                  }
              }
          }

          if (!hasFind) {
              for (const tempPlacement of placementWeight) {
                  if (placementX === tempPlacement) continue;
                  if (this.isVertical(placementY)) {
                      if (tempPlacement === "start") {
                          if (
                              screenRect.width - targetRect.left >=
                              contentRect.width
                          ) {
                              resultLeft = targetRect.left;
                              resultX = "start";
                              hasFind = true;
                          }
                      } else if (tempPlacement === "end") {
                          if (targetRect.right >= contentRect.width) {
                              // 允许放置
                              resultLeft =
                                  targetRect.right - contentRect.width;
                              resultX = "end";
                              hasFind = true;
                          }
                      } else {
                          x = "";
                          if (
                              targetRect.left >= widthOffset &&
                              screenRect.width - targetRect.right >=
                                  widthOffset
                          ) {
                              // 居中放置
                              resultLeft = targetRect.left - widthOffset;
                              resultX = "";
                              hasFind = true;
                          }
                      }
                  } else if (this.isHorizontal(placementY)) {
                      if (tempPlacement === "start") {
                          if (
                              screenRect.height - targetRect.top >=
                              contentRect.height
                          ) {
                              resultLeft = targetRect.top;
                              resultX = "start";
                              hasFind = true;
                          }
                      } else if (tempPlacement === "end") {
                          if (targetRect.bottom >= contentRect.height) {
                              // 允许放置
                              resultLeft =
                                  targetRect.bottom - contentRect.height;
                              resultX = "end";
                              hasFind = true;
                          }
                      } else {
                          x = "";
                          if (
                              targetRect.top >= heightOffset &&
                              screenRect.height - targetRect.bottom >=
                                  heightOffset
                          ) {
                              // 居中放置
                              resultLeft = targetRect.top - heightOffset;
                              resultX = "";
                              hasFind = true;
                          }
                      }
                  }
                  if (hasFind) break;
              }
          }

          if (!hasFind) {
              resultX = placementX;
              resultLeft = tempLeft;
          }

          return [resultX, resultLeft];
      },

      updatePosition(placement) {
          // 计算偏移 - activePlacement
          if (!this.contentRect) return;
          if (!this.targetRect) {
              this.activeFullMask = true;
              this.activeShowTriangle = false;

              const screenRect = { ...this.screenSize };
              const contentRect = { ...this.contentRect };
              let left = (screenRect.width - contentRect.width) / 2;
              let top = (screenRect.height - contentRect.height) / 2;

              // 居中不考虑安全区域
              this.activePlacement = "center";
              this.contentRect.top = top;
              this.contentRect.left = left;
          } else {
              this.activeFullMask = this.fullMask;
              this.activeShowTriangle = this.showTriangle;

              const screenRect = { ...this.screenSize };
              const targetRect = { ...this.targetRect };
              const contentRect = { ...this.contentRect };

              const offset = this.offset;
              // const offsetT = offset + screenRect.safeTop;
              // const offsetB = offset + screenRect.safeBottom;

              let y = this.getPlacementY(
                  placement ?? this.placement ?? this.activePlacement
              );
              let x = this.getPlacementX(
                  placement ?? this.placement ?? this.activePlacement
              );
              let left = targetRect.left;
              let top = targetRect.top;

              // console.log('>>> rect', screenRect, targetRect, contentRect);

              // 遮罩
              if (!this.activeFullMask) {
                  // TODO：默认挖空遮罩间距为三角形与触发器间距的一半，后续需要可拓展成自定义；
                  const maskOffset = Math.max(
                      0,
                      (offset -
                          (this.activeShowTriangle
                              ? this.triangleSize / 2
                              : 0)) /
                          2
                  );
                  // top
                  this.maskPosition.top.top = 0;
                  this.maskPosition.top.left = 0;
                  this.maskPosition.top.width = screenRect.width;
                  this.maskPosition.top.height = targetRect.top - maskOffset;
                  // bottom
                  this.maskPosition.bottom.top =
                      targetRect.bottom + maskOffset;
                  this.maskPosition.bottom.left = 0;
                  this.maskPosition.bottom.width = screenRect.width;
                  this.maskPosition.bottom.height =
                      screenRect.height - (targetRect.bottom + maskOffset);
                  // left
                  this.maskPosition.left.top = targetRect.top - maskOffset;
                  this.maskPosition.left.left = 0;
                  this.maskPosition.left.width = targetRect.left - maskOffset;
                  this.maskPosition.left.height =
                      targetRect.height + 2 * maskOffset;
                  // right
                  this.maskPosition.right.top = targetRect.top - maskOffset;
                  this.maskPosition.right.left =
                      targetRect.right + maskOffset;
                  this.maskPosition.right.width =
                      screenRect.width - (targetRect.right + maskOffset);
                  this.maskPosition.right.height =
                      targetRect.height + 2 * maskOffset;
                  // box
                  this.maskPosition.box.top = targetRect.top - maskOffset;
                  this.maskPosition.box.left = targetRect.left - maskOffset;
                  this.maskPosition.box.width =
                      targetRect.width + 2 * maskOffset;
                  this.maskPosition.box.height =
                      targetRect.height + 2 * maskOffset;

                  // targetRect 调整为遮罩尺寸为mask.box，相比原targetRect 增加间距 maskOffset
                  targetRect.left -= maskOffset;
                  targetRect.right += maskOffset;
                  targetRect.width += 2 * maskOffset;
                  // targetRect.top -= maskOffset; // 考虑是否保持箭头与触发器的offset间距，就要加上。加上的话容器最好有上边距，否则可能溢出maskOffset
                  // targetRect.bottom += maskOffset; // 考虑是否保持箭头与触发器的offset间距，就要加上。加上的话容器最好有上边距，否则可能溢出maskOffset
                  // targetRect.height += (2 * maskOffset);
              }

              // 更新content定位
              if (DefaultPlacementY.includes(y)) {
                  // 垂直位置
                  [y, top] = this.adjustPositionY(y, targetRect);
                  // 水平位置
                  [x, left] = this.adjustPositionX(x, y, targetRect);

                  if (this.isHorizontal(y)) {
                      // 交换数值
                      [top, left] = [left, top];
                  }
              } else {
                  x = "";
                  left = (screenRect.width - contentRect.width) / 2;
                  top = (screenRect.height - contentRect.height) / 2;
              }

              // 最终popover位置更新
              this.activePlacement = `${y}${x ? "-" + x : ""}`;
              this.contentRect.top = top;
              this.contentRect.left = left;
          }

          this.opacity = 1;
          // console.log('>>> rect', this.activePlacement, top, left);
      },

      getPopoverRect() {
          const contentView = uni
              .createSelectorQuery()
              .in(this)
              .select(".wsd-basic-popover__wrapper");
          if (contentView) {
              contentView
                  .boundingClientRect((info) => {
                      // console.log('>>>popover info', info)
                      this.contentRect = info;
                      this.updatePosition();
                  })
                  .exec();
          }
      },

      initRender() {
          this.renderFlag = true;
          this.isHidden = false;
          setTimeout(() => {
              this.getPopoverRect();
          }, 10);
      },
  },
};
</script>

<style lang="scss">
.wsd-basic-popover {
  position: relative;
}

.wsd-basic-popover__mask {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: var(--mask-color);
  z-index: var(--mask-z-index);
}

.wsd-basic-popover__mask-group {
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  // background-color: rgba(255, 255, 255, .01);
  z-index: var(--mask-z-index);
}

.wsd-basic-popover__mask-item {
  position: fixed;
  width: 0;
  height: 0;
  left: 0;
  top: 0;
  background-color: var(--mask-color);
  z-index: var(--mask-z-index);
  opacity: var(--mask-opacity);
  transition: opacity 0.1s linear;
}

.wsd-basic-popover__mask-item.is-box {
  background-color: rgba(255, 255, 255, 0.01);
}

.wsd-basic-popover__wrapper {
  position: fixed;
  left: var(--popover-left);
  top: var(--popover-top);
  background-color: var(--popover-color);
  z-index: var(--popover-z-index);
  box-sizing: border-box;
  border-radius: var(--popover-radius);
  opacity: var(--popover-opacity);
  transition: opacity 0.15s linear;
}

.wsd-basic-popover__content {
  z-index: 2;
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
}

.wsd-basic-popover__triangle {
  position: absolute;
  z-index: var(--triangle-z-index);
  background-color: var(--triangle-color);
  width: var(--triangle-size);
  height: var(--triangle-size);
  border-radius: 2px;
  transform: rotate(45deg);
  transform-origin: center;
}
</style>
