/**
 * wxml节点转canvas绘制
 * 可以生成图片-用于预览/微信分享
 * 
 */
/**
 * template
 * <wxml-to-canvas ref="widgetRef" class="wpt-widget"></wxml-to-canvas>
 */ 
/**
 * style
 * .wpt-widget { position: absolute; z-index: -1; opacity: 0; right: -100vw; bottom: -100vh }
 */ 

// example: https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/extended/component-plus/wxml-to-canvas.html

// wxml 支持 view、text、image 三种标签
// wxml = `<view><view><text></text></view><view><image /></view></view>`

// style 支持absolute/relative、flex、borderRadius、fontSize等

import { onMounted, ref, unref } from 'vue';

export default function useWxmlToCanvas(wxml = '', style = {}, isNull = false) {
    let _timeout: ReturnType<typeof setTimeout> = -1;
    const defaultWxml = ref(wxml);
    const defaultStyle = ref(style);
    const renderWxml = ref('');
    const renderStyle = ref(null);
    const tempFilePath = ref(''); // 临时图片地址
    const widgetRef = ref(null); // wxml-to-canvas 节点ref
    const canvasContianer = ref(null); // canvas 容器
    const allowNull = ref(isNull);
    
    onMounted(() => {
      // do something... example as loadFont
    })
    
    function init(wxml = '', style = {}) {
        setDefaultWxml(wxml);
        setDefaultStyle(style);
        tempFilePath.value = '';
        widgetRef.value = null;
        canvasContianer.value = null;
    }
    
    function setDefaultWxml(wxml: string) {
        defaultWxml.value = wxml;
    }
    
    function setDefaultStyle(style = {}) {
        defaultStyle.value = style;
    }
    
    function setWxml(wxml: string) {
        renderWxml.value = wxml;
    }
    
    function setStyle(style = {}) {
        renderStyle.value = style;
    }
    
    function renderCanvas(wxml?: string, style?: any): Promise<any> {
        const rwxml = unref(wxml || defaultWxml.value);
        const rstyle = unref(style || defaultStyle.value);
        if (!widgetRef.value || !rwxml) return allowNull.value ? Promise.resolve('') : Promise.reject(false);

        setWxml(rwxml);
        setStyle(rstyle);
        return new Promise((resolve, reject) => {
            widgetRef.value.renderToCanvas({ wxml: rwxml, style: rstyle })
                .then((res: any) => {
                  canvasContianer.value = res;
                  resolve(canvasContianer.value);
                }).catch(() => {
                    reject(false);
                })
        })
    }
    
    function generateImageAfterRender(params?: any): Promise<string | boolean> {
        if (!widgetRef.value || !renderWxml.value) return allowNull.value ? Promise.resolve('') : Promise.reject(false);
        return new Promise((resolve, reject) => {
            // {fileType, quality} 支持 文件类型fileType: jpg/png; 图片质量quality，图片的质量目前仅对 jpg 有效
            widgetRef.value.canvasToTempFilePath(params)
                .then((res: any) => {
                    tempFilePath.value = res.tempFilePath;
                    resolve(tempFilePath.value);
                }).catch(() => {
                    reject(false);
                })
        })
    }
    
    // 二合一 - 获取分享概览图
    function generateImage(wxml?: string, style?: any, params?: any, limitTimeout = true): Promise<string | boolean> {
        return new Promise((resolve, reject) => {
            if (limitTimeout) {
                _timeout = setTimeout(() => {
                    resolve('');
                }, 3000);
            }
            renderCanvas(wxml, style)
                .then(() => {
                    generateImageAfterRender(params)
                        .then((imageUrl: unknown) => {
                            if (_timeout) {
                                clearTimeout(_timeout);
                            }
                            resolve(imageUrl as string);
                        })
                        .catch(() => {
                            if (_timeout) {
                                clearTimeout(_timeout);
                            }
                            reject(false);
                        })
                })
                .catch(() => {
                    if (_timeout) {
                        clearTimeout(_timeout);
                    }
                    reject(false);
                })
        })
    }
    
    return {
        tempFilePath,
        widgetRef,
        canvasContianer,
        init,
        setDefaultWxml,
        setDefaultStyle,
        renderCanvas,
        generateImageAfterRender,
        generateImage
    }
}
