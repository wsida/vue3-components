<template>
    <view class="wsd-demo-page">
        <scroll-view
            :scroll-y="!disableScroll"
            id="demo-scroll-view"
            class="wsd-demo-page__scroll"
        >
            <wsd-draggable
                :grid="3"
                :gap="10"
                :viewport="viewport"
                :longpress="false"
                v-model:dataSource="dataSource"
                customItemClass="demo-draggable-item"
                @onDrag="disableScroll = true"
                @onDrop="disableScroll = false"
            ></wsd-draggable>
        </scroll-view>
    </view>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, ref } from "vue";
import { getNodeRect } from "../utils";

const data = [];
for (let i = 0; i <= 42; i++) {
    data.push({
        id: i,
        label: `label-${i}`,
    });
}

const _instance = getCurrentInstance();
const dataSource = ref(data);
const viewport = ref(null);
const disableScroll = ref(false);

onMounted(() => {
    nextTick(async () => {
        viewport.value = await getNodeRect("#demo-scroll-view", _instance);
    });
});
</script>

<style lang="scss" scoped>
.wsd-demo-page {
    position: relative;
    box-sizing: border-box;
    padding: 15vh 20px 5vh;
    height: 100vh;
    width: 100vw;

    &__scroll {
        position: relative;
        height: 100%;
        width: 100%;
    }

    :deep(.demo-draggable-item) {
        border: 1px solid #d8d8d8;
        border-radius: 4px;
        height: 60px;
    }
}
</style>
