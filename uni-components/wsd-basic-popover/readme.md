# 说明

`basic-popover` 组件提供一个基础弹出框，目前只考虑在小程序中使用，需要向下/向上弹出，同时自动根据屏幕进行弹出位置调整，涉及触发器和弹出框的定位计算。

> 层级问题：如果使用组件嵌套层级太深，建议配置 `<root-portal>` 组件

# 示例

## 基础用法

```vue
<template>
	<button id="tirgger" @click="onTrigger">trigger</button>
	<root-portal>
		<basic-popover
			v-model="visible"
			:target-rect="triggerRect"
			:z-index="101"
			:offset="12"
		>
			<scroll-view :scroll-x="false" :scroll-y="true" style="height: 400px">
				<view v-for="row in dataSource" class="flex justify-between">
					<text class="text-title">{{ row.name }}</text>
					<text class="text-description">{{ row.datetime }}</text>
				</view>
			</scroll-view>
		</basic-popover>
	</root-portal>
</template>
```

```js
const instance = getCurrentInstance();
const visible = ref(false);
const triggerRect = ref(null);
const dataSource = ref([]);

function onTrigger() {
	const query = uni.createSelectorQuery().in(instance);
	query.select('#tirgger').boundingClientRect(info => {
		triggerRect.value = info;
		visible.value = true;
	}).exec();
}
```

## 带遮罩

设置 `show-mask` 控制遮罩展示，`mask-color` 可定义遮罩颜色

```vue
<template>
	<root-portal>
		<basic-popover
			v-model="visible"
			:target-rect="triggerRect"
			:z-index="101"
			:offset="12"
			:full-mask="false"
		>
			<!--slot-->
		</basic-popover>
	</root-portal>
</template>
```

## 带挖空遮罩

`show-mask` 必须为 `true` 才生效，可通过 `full-mask` 控制是否展示满屏遮罩还是带挖空遮罩。挖空遮罩可通过 `mask-mode` 控制实现方式。只有 `shadow` 模式才可以绘制带圆角。

```vue
<template>
	<root-portal>
		<basic-popover
			v-model="visible"
			:target-rect="triggerRect"
			:z-index="101"
			:offset="12"
			:full-mask="false"
		>
			<!--slot-->
		</basic-popover>
	</root-portal>
</template>
```

# Props

| name | description | type | default | required |
| :-- | :-- | :-: | :-: | :-: |
| modelValue | 弹出框显示状态（v-model） | boolean | false | true |
| zIndex | 弹出框层级 | number | 3 | - |
| showMask | 是否展示遮罩 | boolean | true | - |
| targetRect | 触发器定位信息，不设置默认弹出框都居中展示 | UniApp.NodeInfo | - | - |
| offset | popover弹出框与触发器间距 - 不含箭头，默认px | number | 16 | - |
| showTriangle | 是否展示箭头 | boolean | true | - |
| placement | 默认展示方向，只考虑向上/向下 | top-start \| top-end \| top \| bottom-start \| bottom \| bottom-end \| center | 'top-start' | - |
| closeByClickMask | 是否可以点击遮罩关闭弹窗 | boolean | true | - |
| maskColor | 遮罩背景颜色 | string | 'rgba(0, 0, 0, .56)' | - |
| triangleColor | 箭头颜色 | string | '#fff' | - |
| triangleOffset | start / end 箭头水平方向偏移距离 | number | 24 | - |
| triangleSize | 箭头尺寸 | number | 12  | - |
| ignoreMenubar | 安全区域包括右上角胶囊按钮 | boolean | true | - |
| fullMask | 是否展示全屏遮罩 | boolean | true | - |
| maskMode | 挖空遮罩方式，default-普通遮罩，shadow-阴影遮罩，允许圆角，只在 fullMask = false 有效 | default \| shadow | 'default' | - |
| maskRadius | 挖空遮罩圆角，只在 fullMask = false & maskMode = 'shadow' 有效 | number | 6 | - |

# Slots

| name | description |
| :-- | :-- |
| default | 默认插槽，弹出框内容 |

# Exposes

| name | description | type |
| updatePosition | 更新弹出框位置 | () => void |
| _close | 关闭弹出框 | () => void |
| _open | 打开弹出框 | () => void |
| _destroy | 销毁弹出框 | () => void |
