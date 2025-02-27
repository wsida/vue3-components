# 语音输入组件

> 提供水平滚动tabs组件，支持简单滚动展示，选中居中展示。同时，带有虚拟列表功能，允许直接指定选中对于索引的tab。
> 居中定位包括相对tabs容器，也支持相对屏幕居中。
> 非虚拟列表允许不指定宽度，组件根据内容自适应计算。
> 虚拟列表支持固定宽度，也支持内容自适应宽度。**但是，非固定宽度渲染相对较差，同时需要使用一些特定api进行操作。**。*建议数量不是非常多的情况下可全量渲染*。

## Props

| 属性 | 描述 | 类型 |是否必填 | 默认值 |
| :-- | :-- | :-- | :-- | :-- |
| modelValue | 绑定选中值（v-model） | string\|number | true | - |
| dataSource | 绑定数据集 | ItemType\[\] \| string\[\] | true | - |
| keyField | 主键字段名 | string | - | 'id' |
| labelField | 显示标签字段名） | string | - | 'label' |
| customClass | 滚动容器scroll-view自定义样式类 | string | - | - |
| listCustomClass | 标签列表节点自定义样式类 | string | - | - |
| itemCustomClass | 标签项节点自定义样式类 | string | - | - |
| itemSize | 标签项宽度，默认px单位。只在virtual=true时生效，开启虚拟列表建议设置。如果未设置则需要设置`cellSizeMode='dynamic'`。 | number | - | 120 |
| itemGap | 标签项间距，默认px单位。 | number | - | 12 |
| center | 选中标签是否居中 | boolean | - | false |
| absoluteCenterX | 选中标签是否相对屏幕居中，只在center开启时有效 | boolean | - | false |
| spaceAlways | 是否保存列表右空白，保证居中效果。如果未设置，当实际内容未溢出时，右侧标签项（超过居中位置）选中也不会居中 | boolean | - | false |
| activeColor | 选中标签项的字体颜色 | string | - | '#277EEF' |
| offset | 用于指定标签项与滚动容器的间距，默认px单位，取itemGap/2。只在未设置center时有效。默认选中标签页会自动滚动到容器可见视图内，用于指定标签页滚动后与容器的间隙 | number | - | - |
| renderWhenMounted | 是否在mounted时渲染标签列表。如果使用远程请求数据，建议设置false，等待数据返回后手动调用`initScroll`初始化，减少无用的初始化。 | boolean | - | true |
| scrollable | 标签列表是否允许滚动 | boolean | - | true |
| ignoreChange | 是否忽略数据集变更响应 | boolean | - | false |
| showLine | 是否展示滑块线条 | boolean | - | false |
| lineColor | 滑块线条颜色，默认取activeColor | string | - | '#277EEF' |
| lineWidth | 滑块线条的宽度，默认px单位 | number | - | 20 |
| lineHeight | 滑块线条的高度，默认px单位 | number | - | 2 |
| lineRadius | 滑块线条的圆角大小，默认px单位 | number | - | 2 |
| virtual | 是否开启虚拟列表 | boolean | - | false |
| viewCounts | 默认展示数据 | number | - | 10 |
| previewCounts | 预加载数量 | number | - | 10 |
| cellSizeMode | 虚拟列表计算方式 | 'fixed'\|'dynamic' | - | 'fixed' |

## Events

| 事件 | 描述 | 类型 |
| :-- | :-- | :-- |
| update:modelValue | 绑定值更新 | `(active: string \| number) => void` |
| on-click | tab项点击触发 | `(item: ItemType, key: string \| number, index: number) => void` |

```ts
type ItemType = Record<string, any>;
```

## Exposes

| 属性 | 描述 | 类型 |
| :-- | :-- | :-- |
| initScroll | 初始化tabs。配合 `renderWhenMounted=false` 使用 | `(callback?: Function) => void` |
| scrollTo | 滚动指定距离 | `(distance: number, callback?: Function) => void` |
| scrollThrottle | 更新虚拟列表 | `(distance: number, callback?: Function) => void` |
| scrollToIndex | 滚动指定索引 | `(index: number, callback?: Function) => void` |
| updateLinePosition | 更新line定位 | `() => void` |
| updateSpaceWidth | 更新列表右侧间距（为了居中） | `() => void` |
| deleteCellItemByvIndex | 虚拟列表，删除指定**虚拟索引**的数据项 | `(vIndex: number, callback?: Function) => void` |
| deleteCellItemByIndex | 虚拟列表，删除指定**数据索引**的数据项 | `(index: number, callback?: Function) => void` |
| updateCellItemByvIndex | 虚拟列表，更新指定**虚拟索引**的数据项 | `(vIndex: number, callback?: Function) => void` |
| updateCellItemByIndex | 虚拟列表，更新指定**数据索引**的数据项 | `(index: number, callback?: Function) => void` |
| addCellItemByvIndex | 虚拟列表，在指定**虚拟索引**位置添加新的的数据项 | `(vIndex: number, callback?: Function) => void` |
| addCellItemByIndex | 虚拟列表，在指定**数据索引**位置添加新的的数据项 | `(index: number, callback?: Function) => void` |
| getCellItemSizeByvIndex | 虚拟列表，获取指定**虚拟索引**的节点尺寸 | `(vIndex: numbe) => number` |
| getCellItemSizeByIndex | 虚拟列表，获取指定**数据索引**的节点尺寸 | `(index: number) => number` |
| getCellItemCacheTotalByIndex | 虚拟列表，获取指定**数据索引**之前的节点尺寸总和 | `(index: number) => number` |
