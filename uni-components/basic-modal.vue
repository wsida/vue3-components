<template>
    <uni-popup class="uniPopupToTop" ref="popup" type="center" :mask-background-color="maskBgColor" :is-mask-click="closeByClickMask" @mask-click="handleClickMask">
        <view class="wpt-basic-modal-wrapper" :class="{'wpt-basic-modal-wrapper--shadow': !showMask}">
            <view v-if="showClose" class="wpt-basic-modal-close" @click="close('clickClose')">
                <uv-icon name="close" color="rgba(119, 119, 119, 1)" :size="18"></uv-icon>
            </view>
            <slot></slot>
        </view>
    </uni-popup>
</template>

<script>
    export default {
        name: "basic-modal",
        model: {
            prop: 'modelValue',
            event: 'update:modelValue'
        },

        props: {
            modelValue: {
                type: Boolean,
                default: false
            },
            showClose: {
                type: Boolean,
                default: true
            },
            showMask: {
                type: Boolean,
                default: true
            },
            closeByClickMask: {
                type: Boolean,
                default: true
            },
            maskBackgroundColor: {
                type: String,
                default: 'rgba(8, 8, 8, 0.4)'
            }
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

            maskBgColor() {
                return this.showMask ? this.maskBackgroundColor : 'transparent'
            }
        },

        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        // TODO: 避免初始化渲染 $refs 还没准备好
                        this.$nextTick(() => {
                            this.$refs?.popup?.open();
                        })
                    } else {
                        this.$refs?.popup?.close();
                    }
                },
                immediate: true
            }
        },

        methods: {
            show() {
                this.visible = true
            },
            close(tag) {
                this.visible = false;
                if (tag == 'clickClose') {
                    this.$emit('clickClose');
                }
            },
            handleClickMask() {
                if (!this.closeByClickMask) return
                this.visible = false
            }
        }
    }
</script>

<style lang="scss">
    .wpt-basic-modal-wrapper {
        box-sizing: border-box;
        position: relative;
        min-width: 64vw;
        max-width: 94vw;
        padding: 40rpx;
        text-align: center;
        overflow: hidden;
        border-radius: 16rpx;
        background-color: #fff;

        &.wpt-basic-modal-wrapper--shadow {
            box-shadow: 0 6rpx 6rpx 2rpx rgba(0, 0, 0, 0.05);
        }
    }

    .wpt-basic-modal-close {
        position: absolute;
        width: 50rpx;
        height: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        right: 10rpx;
        top: 10rpx;
        z-index: 3;
    }
</style>
