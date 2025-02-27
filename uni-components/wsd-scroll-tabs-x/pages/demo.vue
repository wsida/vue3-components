<template>
    <view class="demo-page">
        <view class="demo-page__divider"></view>
        <view class="demo-page__content">
            <view><text>normal-scroll into view</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource2"
                    v-model="active2"
                    labelField="name"
                    class="demo-page__scroll2"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    labelField="name"
                    class="demo-page__scroll2"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>center</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    center
                    class="demo-page__scroll1"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    center
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>spaceAlways</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    center
                    class="demo-page__scroll2"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    spaceAlways
                    center
                    class="demo-page__scroll2"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>absoluteCenterX</text></view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    center
                    class="demo-page__scroll2"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    absoluteCenterX
                    center
                    class="demo-page__scroll2"
                    itemCustomClass="demo-page__list-item"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>[virtual]normal-scroll into view</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    :itemSize="40"
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource2"
                    v-model="active2"
                    :itemSize="40"
                    virtual
                    labelField="name"
                    class="demo-page__scroll2"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>[virtual]center</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    :itemSize="60"
                    center
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    :itemSize="60"
                    center
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource3"
                    v-model="active3"
                    labelField="name"
                    :itemSize="60"
                    center
                    virtual
                    absoluteCenterX
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>[virtual][dynamic]</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource4"
                    v-model="active4"
                    cellSizeMode="dynamic"
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource4"
                    v-model="active4"
                    cellSizeMode="dynamic"
                    center
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource4"
                    v-model="active4"
                    labelField="name"
                    cellSizeMode="dynamic"
                    center
                    virtual
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row has-divider">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource4"
                    v-model="active4"
                    labelField="name"
                    cellSizeMode="dynamic"
                    center
                    virtual
                    absoluteCenterX
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view><text>showLine</text></view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    show-line
                    :line-width="8"
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    center
                    show-line
                    :line-width="8"
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    :itemSize="40"
                    virtual
                    show-line
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
            <view class="demo-page__row">
                <wsd-scroll-tabs-x
                    :dataSource="dataSource1"
                    v-model="active1"
                    :itemSize="40"
                    virtual
                    center
                    show-line
                    class="demo-page__scroll1"
                ></wsd-scroll-tabs-x>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

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

const dataSource1 = ref(chars.split(""));
const dataSource2 = ref(
    chars
        .split("")
        .map((char: string, index: number) => ({ id: index, name: char }))
);
const dataSource3 = ref(
    chars
        .split("")
        .map((char: string, index: number) => ({ id: index, name: char }))
        .slice(0, 4)
);

const dataSource4 = ref([...paragraph]);

const active1 = ref("");
const active2 = ref("");
const active3 = ref();
const active4 = ref();
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

    &__scroll2 {
        position: relative;
        display: block;
        width: 100%;
        height: 40px;
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
