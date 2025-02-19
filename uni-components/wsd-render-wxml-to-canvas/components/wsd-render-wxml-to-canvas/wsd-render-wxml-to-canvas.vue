<template>
  <!--注意只有展示的时候在显示，否则初始化计算画布尺寸失效，都为0，会导致导出图片失败。建议配合v-if使用-->
  <wxml-to-canvas
      v-if="showCanvas"
      ref="widgetRef"
      class="wsd-widget"
      :width="canvasWidth"
      :height="canvasHeight"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
      :class="{ 'is-hidden': renderHidden }"
  ></wxml-to-canvas>
</template>

<script setup>
import { computed, nextTick, ref, watch } from "vue";
import useWxmlToCanvas from "../../hooks/useWxmlToCanvas";

const props = defineProps({
  canvasWidth: {
      type: Number,
      default: 375,
  },

  canvasHeight: {
      type: Number,
      default: 300,
  },

  customWxml: {
      type: String,
      default: "",
  },

  customStyle: {
      type: Object,
      default: () => ({}),
  },

  defaultWxml: {
      type: String,
      default: "",
  },

  defaultStyle: {
      type: Object,
      default: () => ({}),
  },

  defaultTryCount: {
      type: Number,
      default: 0,
  },

  defaultTimeout: {
      type: Number,
      default: 3000,
  },

  allowNull: {
      type: Boolean,
      default: false,
  },

  quality: {
      type: Number,
      default: 1, // only jpg
  },

  imageType: {
      type: String,
      default: "jpg", // jpg / png
  },

  renderHidden: {
      type: Boolean,
      default: true,
  },
});

const showCanvas = ref(true);

const {
  tempFilePath,
  widgetRef,
  renderCanvas,
  generateImageAfterRender,
  generateImage,
} = useWxmlToCanvas(props.defaultWxml, props.defaultStyle, props.allowNull);

const generaterParams = computed(() => {
  const params = {
      fileType: props.imageType,
  };
  if (props.imageType === "jpg") {
      params.quality = props.quality;
  }
  return params;
});

// wx-wxml-to-canvas 在组件挂载后获取canvas对象，如果后续进行尺寸修改，canvas对象尺寸无法修改
// 这时候将会使用初始化的尺寸进行绘制，就会导致绘制内容存在像素偏差（如拉伸等问题）
// 因此需要这里进行组建重新挂载，保证canvas对象可以重新获取。
// 这里可能会造成渲染延时，调用时也需要延时一段时间在获取canvas对象进行绘图（至少一个setTimeout）。
// 所以如果是固定尺寸下请在初始时就指定canvas尺寸。
watch(
  () => [props.canvasWidth, props.canvasHeight],
  () => {
      showCanvas.value = false;
      nextTick(() => {
          showCanvas.value = true;
      });
  }
);

function toRenderToCanvas() {
  return renderCanvas(props.customWxml, props.customStyle, props.tryCount);
}

function toGenerateImageAfterRender() {
  return generateImageAfterRender(generaterParams.value);
}

function toGenerateImage(count, timeout) {
  return generateImage(
      props.customWxml,
      props.customStyle,
      generaterParams.value,
      count ?? props.defaultTryCount,
      timeout ?? props.defaultTimeout
  );
}

defineExpose({
  tempFilePath,
  toRenderToCanvas,
  toGenerateImageAfterRender,
  toGenerateImage,
});
</script>

<style lang="scss">
.wsd-widget {
  position: relative;
  box-sizing: border-box;

  &.is-hidden {
      position: absolute;
      z-index: -1;
      opacity: 0;
      left: -100vw;
      top: -100vh;
  }
}
</style>
