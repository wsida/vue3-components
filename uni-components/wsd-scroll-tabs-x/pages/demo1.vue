<template>
    <view class="demo-page">
        <view class="demo-page__divider"></view>
        <view class="demo-page__content">
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    ref="scrollRef1"
                    :dataSource="dataSource"
                    v-model="active"
                    labelField="name"
                    cellSizeMode="dynamic"
                    center
                    virtual
                    ignoreChange
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    ref="scrollRef2"
                    :dataSource="dataSource"
                    v-model="active"
                    labelField="name"
                    cellSizeMode="dynamic"
                    center
                    virtual
                    absoluteCenterX
                    ignoreChange
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <button @click="onAdd">add</button>
                <button @click="onUpdate">update</button>
                <button @click="onDelete">delete</button>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const paragraph = [
    chars.substring(0, 2),
    chars.substring(0, 3),
    chars.substring(0, 4),
    chars.substring(0, 5),
    chars.substring(2, 4),
    chars.substring(2, 5),
    chars.substring(2, 6),
    chars.substring(3, 6),
    chars.substring(3, 7),
    chars.substring(4, 8),
    chars.substring(6, -1),
    chars.substring(7, -1),
    chars.substring(1, 7),
];

const dataSource = ref([...paragraph]);

const active = ref();
const scrollRef1 = ref();
const scrollRef2 = ref();

function getSubString() {
    const len = dataSource.value.length;
    const sIndex = Math.ceil(Math.random() * (len - 1));
    const eIndex = Math.ceil(Math.random() * (len - sIndex)) + sIndex;
    return chars.substring(sIndex, eIndex);
}

function onAdd() {
    const len = dataSource.value.length;
    if (!len || len > 20) return;
    const nStr = getSubString();
    if (!dataSource.value.includes(nStr)) {
        const aIndex = Math.ceil(Math.random() * len);
        dataSource.value.splice(aIndex, 0, nStr);
        const index = dataSource.value.indexOf(active.value);
        scrollRef1.value?.addCellItemByIndex(aIndex, () => {
            setTimeout(() => {
                scrollRef1.value?.updateSpaceWidthVirtual();
                setTimeout(() => {
                    scrollRef1.value?.scrollToIndex(index);
                }, 150);
            }, 150);
        });
        scrollRef2.value?.addCellItemByIndex(aIndex, () => {
            setTimeout(() => {
                scrollRef2.value?.updateSpaceWidthVirtual();
                setTimeout(() => {
                    scrollRef2.value?.scrollToIndex(index);
                }, 150);
            }, 150);
        });
    }
}

function onUpdate() {
    const len = dataSource.value.length;
    if (!len) return;
    const uIndex = Math.ceil(Math.random() * (len - 1));
    const nStr = getSubString();
    if (!dataSource.value.includes(nStr)) {
        dataSource.value[uIndex] = nStr;
        const index = dataSource.value.indexOf(active.value);
        scrollRef1.value?.updateCellItemByIndex(uIndex, () => {
            setTimeout(() => {
                scrollRef1.value?.updateSpaceWidthVirtual();
                setTimeout(() => {
                    scrollRef1.value?.scrollToIndex(index);
                }, 150);
            }, 150);
        });
        scrollRef2.value?.updateCellItemByIndex(uIndex, () => {
            setTimeout(() => {
                scrollRef2.value?.updateSpaceWidthVirtual();
                setTimeout(() => {
                    scrollRef2.value?.scrollToIndex(index);
                }, 150);
            }, 150);
        });
    }
}

function onDelete() {
    const len = dataSource.value.length;
    if (!len) return;
    const dIndex = Math.ceil(Math.random() * (len - 1));
    dataSource.value.splice(dIndex, 1);
    const index = dataSource.value.indexOf(active.value);
    scrollRef1.value?.deleteCellItemByIndex(dIndex, () => {
        setTimeout(() => {
            scrollRef1.value?.updateSpaceWidthVirtual();
            setTimeout(() => {
                scrollRef1.value?.scrollToIndex(index);
            }, 150);
        }, 150);
    });
    scrollRef2.value?.deleteCellItemByIndex(dIndex, () => {
        setTimeout(() => {
            scrollRef2.value?.updateSpaceWidthVirtual();
            setTimeout(() => {
                scrollRef2.value?.scrollToIndex(index);
            }, 150);
        }, 150);
    });
}
</script>

<style lang="scss" scoped>
.demo-page {
    position: relative;
    background-color: #f1f1f2;
    min-height: 100vh;
    width: 100vw;

    &__content {
        position: relative;
        padding: 40px 20px 20px;
        box-sizing: border-box;
    }

    &__row {
        position: relative;
        box-sizing: border-box;
        padding: 20px;
        margin-bottom: 20px;
        background-color: #fff;
    }

    &__scroll1 {
        position: relative;
        display: block;
        width: 100%;
        height: 32px;
    }

    &__divider {
        position: fixed;
        z-index: 1;
        height: 100vh;
        width: 2px;
        left: calc(50vw - 1px);
        top: 0;
        background-color: red;
    }
}
</style>

<style lang="scss">
.demo-page {
    &__list-item {
        :deep(.wsd-scroll-tabs__list-item-inner) {
            width: 60px !important;
            background-color: #d1d1d2;
        }
    }

    &__row {
        &.has-divider {
            padding-left: 80px;

            .demo-page__scroll1,
            .demo-page__scroll2 {
                position: relative;

                &::before {
                    content: "";
                    position: absolute;
                    z-index: 1;
                    height: 100%;
                    width: 2px;
                    left: calc(50% - 1px);
                    top: 0;
                    background-color: green;
                }
            }
        }
    }
}
</style>
