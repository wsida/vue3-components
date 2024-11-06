```vue3
<template>
	<view>
        <render-wxml-to-canvas ref="renderWxmlRef" :custom-wxml="wxml" :custom-style="style"></render-wxml-to-canvas>
        <button open-type="share">分享</button>
	</view>
</template>

<script setup>
    import { onShareAppMessage } from '@dcloudio/uni-app';
    import { ref } from 'vue';
    const wxml = ref(`
    <view class="container" >
      <view class="item-box red">
      </view>
      <view class="item-box green" >
        <text class="text">yeah!</text>
      </view>
      <view class="item-box blue">
          <image class="img" src="https://expo.obs.cn-gdgz1.ctyun.cn/mini-app/v3/arrow1.png?v=5"></image>
      </view>
    </view>
    `)

    const style = ref({
      container: {
        width: 300,
        height: 200,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ccc',
        alignItems: 'center',
      },
      itemBox: {
        width: 80,
        height: 60,
      },
      red: {
        backgroundColor: '#ff0000'
      },
      green: {
        backgroundColor: '#00ff00'
      },
      blue: {
        backgroundColor: '#0000ff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      text: {
        width: 80,
        height: 60,
        textAlign: 'center',
        verticalAlign: 'middle',
      },
      img: {
        width: 40,
        height: 40,
        borderRadius: 20,
      }
    })

    const renderWxmlRef = ref(null);
    
    onShareAppMessage((res) => {
        return {
            title: '分享',
            path: 'pages/wxml-to-canvas/wxml-to-canvas',
            promise: new Promise((resolve, reject) => {
                console.log('111')
                if (renderWxmlRef.value) {
                    renderWxmlRef.value.toGenerateImage()
                        .then(imageUrl => {
                            console.log('>>>imageUrl', imageUrl)
                            resolve({
                                title: '分享',
                                path: 'pages/wxml-to-canvas/wxml-to-canvas',
                                imageUrl,
                            })
                        }).catch(err => {
                            reject(false)
                        })
                } else {
                    reject(false);
                }
            })
        }
    })
</script>
```
