<template>
    <!--注意只有展示的时候在显示，否则初始化计算画布尺寸失效，都为0，会导致导出图片失败。建议配合v-if使用-->
	<wxml-to-canvas
        ref="widgetRef"
        class="wpt-widget"
        :width="canvasWidth"
        :height="canvasHeight"
        :style="{width: `${canvasWidth}px`, height: `${canvasHeight}px`}"
        :class="{'is-hidden': renderHidden}"
    ></wxml-to-canvas>
</template>

<script setup>
    import { computed } from 'vue';
    import useWxmlToCanvas from '../../static/ts/hooks/useWxmlToCanvas';
    
    const props = defineProps({
        canvasWidth: {
            type: Number,
            default: 375
        },
        
        canvasHeight: {
            type: Number,
            default: 300
        },

        customWxml:  {
            type: String,
            default: ''
        },
        
        customStyle: {
            type: Object,
            default: () => ({})
        },
        
        defaultWxml: {
            type: String,
            default: ''
        },
        
        defaultStyle: {
            type: Object,
            default: () => ({})
        },
        
        allowNull: {
            type: Boolean,
            default: false
        },
        
        quality: {
            type: Number,
            default: 1 // only jpg
        },
        
        imageType: {
            type: String,
            default: 'jpg' // jpg / png
        },
        
        renderHidden: {
            type: Boolean,
            default: true
        }
    })

    const {
        tempFilePath,
        widgetRef,
        renderCanvas,
        generateImageAfterRender,
        generateImage
    } = useWxmlToCanvas(props.defaultWxml, props.defaultStyle, props.allowNull);
    
    const generaterParams = computed(() => {
        const params = {
            fileType: props.imageType
        }
        if (props.imageType === 'jpg') {
            params.quality = props.quality;
        }
        return params;
    })

    function toRenderToCanvas() {
        return renderCanvas(props.customWxml, props.customStyle);
    }

    function toGenerateImageAfterRender() {
        return generateImageAfterRender(generaterParams.value);
    }
    
    function toGenerateImage() {
        return generateImage(props.customWxml, props.customStyle, generaterParams.value)
    }
    
    defineExpose({
        tempFilePath,
        toRenderToCanvas,
        toGenerateImageAfterRender,
        toGenerateImage
    })
</script>

<style lang="scss">
    .wpt-widget {
        position: relative;
        box-sizing: border-box;
        
        &.is-hidden {
            position: absolute;
            z-index: -1;
            opacity: 0;
            right: -100vw;
            bottom: -100vh;
        }
    }
</style>
