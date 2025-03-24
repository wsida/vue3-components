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

export const IMAGE_DOWNLOAD_FAIL_TEMP = /^downloadFile:fail (.*)$/;
export const IMAGE_FORMAT_FAIL_TEMP = /^image format error: (.*)$/;

export const IMAGE_DOWNLOAD_DEFAULT_URL = ''; // 默认替换图片

export default function useWxmlToCanvas(wxml = '', style = {}, isNull = false) {
  let _timeout: ReturnType<typeof setTimeout>;
  const defaultWxml = ref(wxml);
  const defaultStyle = ref(style);
  const renderWxml = ref('');
  const renderStyle = ref(null);
  const tempFilePath = ref(''); // 临时图片地址
  const widgetRef = ref(null); // wxml-to-canvas 节点ref
  const canvasContianer = ref(null); // canvas 容器
  const allowNull = ref(isNull);

  onMounted(() => {
    // 加载字体
    /* wx.loadFontFace({
            global: true,
            scopes: ["webview", "native"],
            family: "",
            source: '',
        }); */
  });

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

  /**
   * wxml模版转canvas
   * @param wxml 模版
   * @param style 样式集
   * @param tryCount 图片下载失败尝试次数
   * @returns
   */
  function renderCanvas(
    wxml?: string,
    style?: AnyObject,
    tryCount = 0
  ): Promise<any> {
    let rwxml = unref(wxml ?? defaultWxml.value);
    const rstyle = unref(style ?? defaultStyle.value);
    if (!widgetRef.value || !rwxml)
      return allowNull.value ? Promise.resolve('') : Promise.reject(false);

    setWxml(rwxml);
    setStyle(rstyle);
    let hasTry = 0;
    const tryRenderToCanvas = (resolve, reject) => {
      widgetRef.value?.ctx?.restore();
      // widgetRef.value?.ctx?.clearRect(
      //     0,
      //     0,
      //     widgetRef.value?.canvas.width,
      //     widgetRef.value?.canvas.height
      // );
      widgetRef.value
        .renderToCanvas({ wxml: rwxml, style: rstyle })
        .then((res: AnyObject) => {
          canvasContianer.value = res;
          resolve(canvasContianer.value);
        })
        .catch((err: Error) => {
          console.error('[render canvas error]: ', err);
          // 尝试使用默认图片url
          if (
            tryCount > 0 &&
            hasTry < tryCount &&
            err?.message &&
            IMAGE_DOWNLOAD_FAIL_TEMP.test(err.message)
          ) {
            // @ts-ignore
            const url = err.message.match(IMAGE_DOWNLOAD_FAIL_TEMP)[1];
            if (!url) {
              reject(false);
            }
            rwxml = rwxml.replaceAll(url, IMAGE_DOWNLOAD_DEFAULT_URL);
            hasTry += 1;
            tryRenderToCanvas(resolve, reject);
          } else if (IMAGE_FORMAT_FAIL_TEMP.test(err.message)) {
            // @ts-ignore
            const url = err.message.match(IMAGE_FORMAT_FAIL_TEMP)[1];
            if (!url) {
              reject(false);
            }
            rwxml = rwxml.replaceAll(
              `src="${url}"`,
              IMAGE_DOWNLOAD_DEFAULT_URL
            );
            tryRenderToCanvas(resolve, reject);
          } else {
            reject(false);
          }
        });
    };
    return new Promise((resolve, reject) => {
      tryRenderToCanvas(resolve, reject);
    });
  }

  /**
   * canvas内容转图片
   * @param params canvas转图片参数
   * @returns
   */
  function generateImageAfterRender(
    params?: AnyObject
  ): Promise<string> {
    if (!widgetRef.value || !renderWxml.value)
      return allowNull.value ? Promise.resolve('') : Promise.reject(false);
    return new Promise((resolve, reject) => {
      // {fileType, quality} 支持 文件类型fileType: jpg/png; 图片质量quality，图片的质量目前仅对 jpg 有效
      widgetRef.value
        .canvasToTempFilePath(params)
        .then((res: AnyObject) => {
          tempFilePath.value = res.tempFilePath;
          resolve(tempFilePath.value);
        })
        .catch(() => {
          reject('');
        });
    });
  }

  /**
   * 二合一 - 获取分享概览图
   * @param wxml {string} 模版
   * @param style {object} 样式集
   * @param params {object} canvas导出图片参数
   * @param tryCount {number} 图片下载尝试次数
   * @param limitTimeout {number} 模版转图片时间限制，ms单位
   * @returns 图片地址
   */
  function generateImage(
    wxml?: string,
    style?: AnyObject,
    params?: AnyObject,
    tryCount = 0,
    limitTimeout = 3000
  ): Promise<string | boolean> {
    return new Promise((resolve, reject) => {
      if (!!limitTimeout) {
        _timeout = setTimeout(() => {
          resolve('');
        }, limitTimeout);
      }
      renderCanvas(wxml, style, tryCount)
        .then(() => {
          generateImageAfterRender(params)
            .then((imageUrl: string) => {
              if (_timeout) {
                clearTimeout(_timeout);
              }
              resolve(imageUrl);
            })
            .catch(() => {
              if (_timeout) {
                clearTimeout(_timeout);
              }
              reject(false);
            });
        })
        .catch(() => {
          if (_timeout) {
            clearTimeout(_timeout);
          }
          reject(false);
        });
    });
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
    generateImage,
  };
}
