# useVirtualSwiper Hook

> 当在微信小程序中，遇到一个页面下需要一次性渲染 swiper-item 导致页面卡顿，DOM 节点爆炸的情况，可以使用此 hook 优化 swiper-item 的渲染。

# 思路

一次性只渲染 3 个 swiper-item，分别是当前项、前一项、后一项。在 swiper-view `change` 事件后，根据滑动方向确定当前渲染的数据项，然后获取对应的渲染数据集，并根据 swiper-view 当前的 `current` 对数据集进行偏移，从而达到数据集与 current 可以对应，避免 swiper-view 发生渲染抖动。

# 使用

## 使用 VirtualSwiper 组件

只需要通过作用域插槽 `swiper-item` 渲染 swiper-item 的内容。

```vue
<template>
  <virtual-swiper
    v-if="initFlag"
    :circular="circular"
    :duration="100"
    :data="dataSource"
    class="swiper"
  >
    <template #swiper-item="{ item }">
      <view
        class="swiper-item uni-bg-red"
        :style="{ color: `rgba(${2 * item.id}, 123, ${1 * item.id})` }"
      >
        <text>{{ item.id }}</text>
        <view
          :style="{
            display: 'inline-block',
            width: '100rpx',
            height: '100rpx',
            backgroundColor: `rgba(${2 * item.id}, 123, ${1 * item.id})`,
          }"
        ></view>
      </view>
    </template>
  </virtual-swiper>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const circular = ref(false);
const initFlag = ref(false);
const dataSource = ref([]);

onMounted(() => {
  for (let i = 0; i < 111; i++) {
    dataSource.value.push(i);
  }
  console.log('>>>data', dataSource.value);
  initFlag.value = true;
});
</script>

<style lang="scss">
.swiper {
  position: relative;
  box-sizing: border-box;
  display: block;
  height: 300px;
}

.swiper .swiper-item {
  display: block;
  height: 300px;
  line-height: 300px;
  text-align: center;
  background: #f8f8f9;
}
</style>
```

> 如果swiper绑定数据是异步数据，建议通过v-if进行控制在首次请求完后才渲染swiper；或者在异步结束后手动通过组件实例引用手动调用 `scrollIntoSwiper` 进行首次定位swiper-item。

## 使用内置 hook 方法

使用 `useVirtualSwiper` 方法返回的 `swiperCurrent`、`finalyCircular`、`finalyDuration`、`onSwiperChange` 都进行 swiper-view 绑定。

```vue
<template>
  <swiper
    class="swiper"
    :circular="finalyCircular"
    :current="swiperCurrent"
    :indicator-dots="false"
    :autoplay="false"
    :duration="finalyDuration"
    @change="onSwiperChange"
  >
    <swiper-item v-for="item in currentSwipers" wx:key="id" :key="item.id">
      <view
        class="swiper-item"
        :style="{ color: `rgba(${2 * item.id}, 123, ${1 * item.id})` }"
      >
        <text>{{ item.id }}</text>
        <view
          :style="{
            display: 'inline-block',
            width: '100rpx',
            height: '100rpx',
            backgroundColor: `rgba(${2 * item.id}, 123, ${1 * item.id})`,
          }"
        ></view>
      </view>
    </swiper-item>
  </swiper>
</template>

<script>
import { ref } from 'vue';
import useVirtualSwiper from './useVirtualSwiper';
export default {
  setup(props, { emits }) {
    const circular = ref(false);
    const dataSource = ref([]);

    for (let i = 0; i < 1000; i++) {
      dataSource.value.push(i);
    }

    const {
      finalyCircular,
      currentKey,
      finalyDuration,
      dataCurrent,
      swiperCurrent,
      currentSwipers,
      onSwiperChange,
    } = useVirtualSwiperCircular(
      {
        // defaultCurrent: 6,
        dataSource: dataSource.value,
        circular: circular.value,
      },
      emits
    );

    return {
      finalyDuration,
      finalyCircular,
      dataSource,
      currentKey,
      dataCurrent,
      swiperCurrent,
      currentSwipers,
      onSwiperChange,
    };
  },
};
</script>

<style lang="scss">
.swiper {
  height: 300rpx;
}
.swiper-item {
  display: block;
  height: 300rpx;
  line-height: 300rpx;
  text-align: center;
  background: #f8f8f9;
}
</style>
```

# Component Props

| Field          | Description                                                                                                                         |     Type      | Default |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :-----: | -------- | --- |
| defaultCurrent | 初始化默认展示 swiper 的数据索引                                                                                                    |    number     |    0    |
| data     | swiper 数据集                                                                                                                       | Array\<string \| number  \| object\> | -   |
| circular       | swiper 是否可循环                                                                                                                   |    boolean    |  false  |
| keyField       | 数据集主键字段名                                                                                                                    |    string     |  'id'   |
| duration       | swiper 过渡时长。过渡时长过大可能对 swiper 渲染异步数据存在影响，可根据实际场景进行调整，或者对于异步请求可以通过遮罩限制快速滑动。 |    number     |   250   |

还有一些 Swiper 组件支持的属性。

| Field          | Default |
| :------------- | :-: |
| indicatorColor | false |
| indicatorActiveColor | - |
| activeClass | - |
| changingClass | - |
| autoplay | false |
| interval | 5000 |
| vertical | false |

# Emits

| EventName      | Description                                         |                                              Type                                              |
| :------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------: |
| current-change | 数据集索引发生变化时触发（不是 swiper-view 的索引） | (key: string \| number, dataCurrent: number, prevCurrent: number, nextCurrent: number) => void |
| swiper-change  | swiper-view 切换时触发                              |          (key: string \| number, dataCurrent: number, swiperCurrent: number) => void           |

# Hook Params

| Field          | Description                                                                                                                         |     Type      | Default |
| :------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-----------: | :-----: | -------- | --- |
| defaultCurrent | 初始化默认展示 swiper 的数据索引                                                                                                    |    number     |    0    |
| data     | swiper 数据集                                                                                                                       | Array\<string \| number  \| object\> | -   |
| circular       | swiper 是否可循环                                                                                                                   |    boolean    |  false  |
| keyField       | 数据集主键字段名                                                                                                                    |    string     |  'id'   |
| duration       | swiper 过渡时长。过渡时长过大可能对 swiper 渲染异步数据存在影响，可根据实际场景进行调整，或者对于异步请求可以通过遮罩限制快速滑动。 |    number     |   250   |

# Hook Returns

| Field            | Description                      |                Type                |
| :--------------- | :------------------------------- | :--------------------------------: |
| swiperCurrent    | swiper-view 当前展示的索引       |            Ref<number>             |
| dataCurrent      | 当前展示的数据索引               |            Ref<number>             |
| currentKey       | 当前展示的数据主键               | Ref<string \| number \| undefined> |
| currentSwipers   | 当前展示的数据集                 |         Ref<SwiperItem[]>          |
| finalyKeyField   | 数据集的主键名                   |            Ref<string>             |
| finalyDuration   | swiper 过渡时长                  |            Ref<number>             |
| finalyCircular   | swiper 是否循环                  |            Ref<boolean>            |
| onSwiperChange   | swiepr-view 的 change 事件处理器 |   (e: {current: number}) => void   |
| scrollIntoSwiper | swiper 滑动到指定的数据索引      |      (index: number) => void       |
