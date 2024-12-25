<template>
  <swiper
    class="wsd-virtual-swiper"
    :circular="finalyCircular"
    :current="swiperCurrentTemp"
    :duration="finalyDuration"
    :indicator-dots="indicatorDots"
    :indicator-color="indicatorColor"
    :indicator-active-color="indicatorActiveColor"
    :active-class="activeClass"
    :changing-class="changingClass"
    :autoplay="autoplay"
    :interval="interval"
    :vertical="vertical"
    :acceleration="false"
    :disable-programmatic-animation="true"
    @change="onSwiperChange"
  >
    <swiper-item
      class="wsd-virtual-swiper-item"
      v-for="(item, index) in currentSwipers"
      :key="`${item[finalyKeyField]}-${index}`"
      wx:key="_id"
    >
      <slot
        name="swiper-item"
        :item="item"
        :index="index"
        :id="item[finalyKeyField]"
      ></slot>
    </swiper-item>
  </swiper>
</template>

<script setup>
import useVirtualSwiper from '../../hooks/useVirtualSwiper';

defineOptions({
  name: 'wsd-virtual-swiper',
});

const props = defineProps({
  defaultCurrent: {
    type: Number,
    default: 0,
  },
  ignoreChangeByManual: {
    type: Boolean,
    default: false,
  },
  triggerWhenMounted: {
    type: Boolean,
    default: true,
  },
  data: {
    type: Array,
    default: () => [],
  },
  circular: {
    type: Boolean,
    default: false,
  },
  keyField: {
    type: String,
    default: 'id',
  },
  duration: {
    type: Number,
    default: 250,
  },
  indicatorDots: {
    type: Boolean,
    default: false,
  },
  indicatorColor: String,
  indicatorActiveColor: String,
  activeClass: String,
  changingClass: String,
  autoplay: {
    type: Boolean,
    default: false,
  },
  interval: {
    type: Number,
    default: 5000,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['current-change', 'swiper-change']);

const {
  swiperCurrentTemp,
  swiperCurrent,
  dataCurrent,
  currentKey,
  currentSwipers,
  finalyKeyField,
  finalyDuration,
  finalyCircular,
  onSwiperChange,
  scrollIntoSwiper,
  index2Current,
} = useVirtualSwiper(props, emits);

defineExpose({
  swiperCurrentTemp,
  swiperCurrent,
  dataCurrent,
  currentKey,
  currentSwipers,
  finalyKeyField,
  finalyDuration,
  finalyCircular,
  onSwiperChange,
  scrollIntoSwiper,
  index2Current,
});
</script>

<style lang="scss">
.wsd-virtual-swiper {
  position: relative;
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 100%;

  &-item {
    position: relative;
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;

    & > view {
      // template slot
      position: relative;
      box-sizing: border-box;
      display: block;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
