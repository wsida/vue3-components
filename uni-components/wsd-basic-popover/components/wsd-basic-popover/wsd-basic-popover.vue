<template>
	<view v-if="renderFlag" v-show="!isHidden" class="wsd-basic-popover" @click.stop="noop">
		<view v-if="showMask && activeFullMask" :style="maskStyle" class="wsd-basic-popover__mask" @click="onClickMask">
		</view>
		<view v-if="showMask && !activeFullMask" :style="maskGroupStyle" class="wsd-basic-popover__mask-group"
			@click="onClickMask">
			<view class="wsd-basic-popover__mask-item is-box" :style="maskBoxStyle"></view>
			<template v-if="maskMode === 'default'">
				<view class="wsd-basic-popover__mask-item is-top" :style="maskTopStyle"></view>
				<view class="wsd-basic-popover__mask-item is-bottom" :style="maskBottomStyle"></view>
				<view class="wsd-basic-popover__mask-item is-left" :style="maskLeftStyle"></view>
				<view class="wsd-basic-popover__mask-item is-right" :style="maskRightStyle"></view>
			</template>
		</view>
		<view :style="popoverStyle" class="wsd-basic-popover__wrapper">
			<view v-if="activeShowTriangle" :style="triangleStyle" class="wsd-basic-popover__triangle"></view>
			<view class="wsd-basic-popover__content">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "wsd-basic-popover",
		model: {
			prop: 'modelValue',
			event: 'update:modelValue'
		},
		props: {
			modelValue: {
				type: Boolean,
				default: false
			},

			zIndex: {
				type: Number,
				default: 3
			},

			showMask: {
				type: Boolean,
				default: true
			},

			targetRect: {
				type: Object // left / top / right / bottom / width / height
			},

			offset: { // popover弹窗与触发器间距 - 不算三角形
				type: Number,
				default: 16 // px
			},

			showTriangle: {
				type: Boolean,
				default: true
			},

			placement: { // 默认展示方向，只考虑上下
				type: String,
				default: 'top-start' // top-start // top-end // top // bottom-start // bottom // bottom-end // 'center'
			},

			closeByClickMask: {
				type: Boolean,
				default: true
			},

			maskColor: {
				type: String,
				default: 'rgba(0, 0, 0, 0.56)'
			},

			triangleColor: {
				type: String,
				default: '#fff'
			},

			triangleOffset: { // start / end 三角形水平便宜距离
				type: Number,
				default: 24
			},

			triangleSize: {
				type: Number,
				default: 12
			},

			ignoreMenubar: { // 安全区域包括右上角胶囊按钮
				type: Boolean,
				default: true
			},

			fullMask: {
				type: Boolean,
				default: true
			},

			maskMode: { // 只在 fullMask = false 有效
				type: String,
				default: 'default' // 'shadow'
			},

			maskRadius: { // 只在 fullMask = false & maskMode = 'shadow' 有效
				type: Number,
				default: 6
			}
		},

		data() {
			return {
				renderFlag: false,
				isHidden: false,
				screenSize: {
					width: 0,
					height: 0,
					safeTop: 0,
					safeBottom: 0
				},
				contentRect: null,
				maskPosition: {
					box: {
						top: 0,
						left: 0,
						width: 0,
						height: 0
					},
					top: {
						top: 0,
						left: 0,
						width: 0,
						height: 0
					},
					right: {
						top: 0,
						left: 0,
						width: 0,
						height: 0
					},
					bottom: {
						top: 0,
						left: 0,
						width: 0,
						height: 0
					},
					left: {
						top: 0,
						left: 0,
						width: 0,
						height: 0
					},
				},
				opacity: 0,
				activeFullMask: this.fullMask,
				activeShowTriangle: this.showTriangle,
				activePlacement: this.placement
			};
		},

		computed: {
			visible: {
				get() {
					return this.modelValue
				},
				set(val) {
					this.$emit('update:modelValue', val)
				}
			},

			maskStyle() {
				return {
					'--mask-color': this.maskColor,
					'--mask-z-index': Math.max(1, this.zIndex - 1)
				}
			},

			maskGroupStyle() {
				return {
					...this.maskStyle,
					'--mask-opacity': this.opacity
				}
			},

			maskBoxStyle() {
				if (this.activeFullMask) return {};
				const styles = {
					left: `${this.maskPosition.box.left}px`,
					top: `${this.maskPosition.box.top}px`,
					width: `${this.maskPosition.box.width}px`,
					height: `${this.maskPosition.box.height}px`
				}

				if (this.maskMode === 'shadow') {
					styles.boxShadow =
						`0 0 1px ${Math.max(this.screenSize.width, this.screenSize.height)}px ${this.maskColor}`;
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
					height: `${this.maskPosition.top.height}px`
				}
			},

			maskBottomStyle() {
				if (this.activeFullMask) return {};
				return {
					left: `${this.maskPosition.bottom.left}px`,
					top: `${this.maskPosition.bottom.top}px`,
					width: `${this.maskPosition.bottom.width}px`,
					height: `${this.maskPosition.bottom.height}px`
				}
			},

			maskLeftStyle() {
				if (this.activeFullMask) return {};
				return {
					left: `${this.maskPosition.left.left}px`,
					top: `${this.maskPosition.left.top}px`,
					width: `${this.maskPosition.left.width}px`,
					height: `${this.maskPosition.left.height}px`
				}
			},

			maskRightStyle() {
				if (this.activeFullMask) return {};
				return {
					left: `${this.maskPosition.right.left}px`,
					top: `${this.maskPosition.right.top}px`,
					width: `${this.maskPosition.right.width}px`,
					height: `${this.maskPosition.right.height}px`
				}
			},

			popoverStyle() {
				return {
					'--popover-z-index': Math.max(1, this.zIndex),
					'--popover-left': `${this.contentRect?.left || 0}px`,
					'--popover-top': `${this.contentRect?.top || 0}px`,
					'--popover-opacity': this.opacity
				}
			},

			triangleY() {
				return this.activePlacement.split('-')[0] || 'top';
			},

			triangleX() {
				return this.activePlacement.split('-')[1] || '';
			},

			triangleStyle() {
				const styles = {
					'--triangle-color': this.triangleColor,
					'--triangle-z-index': 1,
					'--triangle-size': `${this.triangleSize}px`
				}

				if (this.triangleX === 'start') {
					styles.left = `${this.triangleOffset}px`
				} else if (this.triangleX === 'end') {
					styles.right = `${this.triangleOffset}px`
				} else {
					styles.left = `${Math.max(0, ((this.contentRect?.width || 0) - this.triangleSize) / 2)}px`
				}

				if (this.triangleY === 'top') {
					styles.bottom = `-${(this.triangleSize / 2) - 1}px`
				} else if (this.triangleY === 'bottom') {
					styles.top = `-${(this.triangleSize / 2) - 1}px`
				}

				return styles;
			}
		},

		watch: {
			visible(val) {
				if (val) {
					// 显示
					if (this.renderFlag) {
						// 已经渲染过
						this.isHidden = false;
						this.$nextTick(() => {
							this.getPopoverRect();
						})
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
				this.$emit('update:placement', val);
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

			onClickMask() {
				if (!this.closeByClickMask) return;
				this._close();
			},

			updatePosition() {
				// 计算偏移 - activePlacement
				if (!this.contentRect) return;
				if (!this.targetRect) {
					this.activeFullMask = true;
					this.activeShowTriangle = false;

					const screenRect = {
						...this.screenSize
					};
					const contentRect = {
						...this.contentRect
					};
					let left = (screenRect.width - contentRect.width) / 2;
					let top = (screenRect.height - contentRect.height) / 2;

					// 居中不考虑安全区域
					this.activePlacement = 'center'
					this.contentRect.top = top;
					this.contentRect.left = left;
				} else {
					this.activeFullMask = this.fullMask;
					this.activeShowTriangle = this.showTriangle;

					const screenRect = {
						...this.screenSize
					};
					const targetRect = {
						...this.targetRect
					};
					const contentRect = {
						...this.contentRect
					};

					const offset = this.offset;
					const offsetT = offset + screenRect.safeTop;
					const offsetB = offset + screenRect.safeBottom;
					let y = this.triangleY;
					let x = this.triangleX;
					let left = targetRect.left;
					let top = targetRect.right;


					// 遮罩
					if (!this.activeFullMask) {
						// TODO：默认挖空遮罩间距为三角形与触发器间距的一半，后续需要可拓展成自定义；
						const maskOffset = Math.max(0, (offset - (this.activeShowTriangle ? this.triangleSize / 2 : 0)) /
							2);
						// top
						this.maskPosition.top.top = 0;
						this.maskPosition.top.left = 0;
						this.maskPosition.top.width = screenRect.width;
						this.maskPosition.top.height = targetRect.top - maskOffset;
						// bottom
						this.maskPosition.bottom.top = targetRect.bottom + maskOffset;
						this.maskPosition.bottom.left = 0;
						this.maskPosition.bottom.width = screenRect.width;
						this.maskPosition.bottom.height = screenRect.height - (targetRect.bottom + maskOffset);
						// left
						this.maskPosition.left.top = targetRect.top - maskOffset;
						this.maskPosition.left.left = 0;
						this.maskPosition.left.width = targetRect.left - maskOffset;
						this.maskPosition.left.height = targetRect.height + 2 * maskOffset;
						// right
						this.maskPosition.right.top = targetRect.top - maskOffset;
						this.maskPosition.right.left = targetRect.right + maskOffset;
						this.maskPosition.right.width = screenRect.width - (targetRect.right + maskOffset);
						this.maskPosition.right.height = targetRect.height + 2 * maskOffset;
						// box
						this.maskPosition.box.top = targetRect.top - maskOffset;
						this.maskPosition.box.left = targetRect.left - maskOffset;
						this.maskPosition.box.width = targetRect.width + 2 * maskOffset;
						this.maskPosition.box.height = targetRect.height + 2 * maskOffset;

						// targetRect 调整为遮罩尺寸为mask.box，相比原targetRect 增加间距 maskOffset
						targetRect.left -= maskOffset;
						targetRect.right += maskOffset;
						targetRect.width += (2 * maskOffset);
						// targetRect.top -= maskOffset; // 考虑是否保持箭头与触发器的offset间距，就要加上。加上的话容器最好有上边距，否则可能溢出maskOffset
						// targetRect.bottom += maskOffset; // 考虑是否保持箭头与触发器的offset间距，就要加上。加上的话容器最好有上边距，否则可能溢出maskOffset
						// targetRect.height += (2 * maskOffset);
					}

					// 垂直位置
					if (y === 'top') {
						if (targetRect.top > contentRect.height + offsetT) {
							// 允许放置
							top = targetRect.top - (contentRect.height + offsetT)
						} else {
							y = 'bottom';
							top = targetRect.bottom + offset
						}
					} else if (y === 'bottom') {
						if (screenRect.height - targetRect.bottom > contentRect.height + offsetB) {
							// 允许放置
							top = targetRect.bottom + offset
						} else {
							y = 'top';
							top = targetRect.top - (contentRect.height + offset)
						}
					}

					// 水平位置
					const widthOffset = (contentRect.width - targetRect.width) / 2;
					if (x === 'start') {
						if (screenRect.width - targetRect.left >= contentRect.width) {
							// 允许放置
							left = targetRect.left;
						} else if (targetRect.left >= widthOffset && screenRect.width - targetRect.right >= widthOffset) {
							// 居中放置
							x = '';
							left = targetRect.left - (contentRect.width - targetRect.width) / 2;
						} else {
							// 右对齐
							x = 'end';
							left = targetRect.right - contentRect.width;
						}
					} else if (x === 'end') {
						if (targetRect.right >= contentRect.width) {
							// 允许放置
							left = targetRect.right - contentRect.width;
						} else if (targetRect.left >= widthOffset && screenRect.width - targetRect.right >= widthOffset) {
							// 居中放置
							x = '';
							left = targetRect.left - (contentRect.width - targetRect.width) / 2;
						} else {
							// 右对齐
							x = 'start';
							left = targetRect.left;
						}
					} else {
						x = ''
						if (targetRect.left >= widthOffset && screenRect.width - targetRect.right >= widthOffset) {
							// 居中放置
							x = '';
							left = targetRect.left - (contentRect.width - targetRect.width) / 2;
						} else if (targetRect.right >= contentRect.width) {
							// 允许放置
							x = 'end';
							left = targetRect.right - contentRect.width;
						} else {
							// 右对齐
							x = 'start';
							left = targetRect.left;
						}
					}

					// 最终popover位置更新
					this.activePlacement = `${y}${x ? '-' + x : ''}`
					this.contentRect.top = top;
					this.contentRect.left = left;
				}

				this.opacity = 1;
				// console.log('>>> rect', this.activePlacement, top, left);
			},

			getPopoverRect() {
				const contentView = uni.createSelectorQuery().in(this).select('.wsd-basic-popover__wrapper');
				if (contentView) {
					contentView.boundingClientRect(info => {
						this.contentRect = info;
						this.updatePosition();
					}).exec()
				}
			},

			initRender() {
				this.renderFlag = true;
				this.isHidden = false;
				setTimeout(() => {
					this.getPopoverRect();
				}, 10);
			}
		}
	}
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
		background-color: rgba(255, 255, 255, .01);
	}

	.wsd-basic-popover__wrapper {
		position: fixed;
		left: var(--popover-left);
		top: var(--popover-top);
		background-color: #fff;
		z-index: var(--popover-z-index);
		box-sizing: border-box;
		border-radius: 16rpx;
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