# wsd-draggable 可拖拽列表

## Props

| 属性 | 描述 | 类型 |是否必填 | 默认值 |
| :-- | :-- | :-- | :-- | :-- |
| dataSource(v-model) | 绑定数据集 | DragItem\[\] | true | - |
| keyField | 主键字段名 | string | - | 'id' |
| labelField | 显示标签字段名 | string | - | 'label' |
| grid | 网格数 | number | - | 1 |
| gap | 间距 | number | - | 0 |
| dragClass | 开启拖拽列表项样式类 | string | - | 'is-drag' |
| moveClass | 拖拽移动列表项样式类 | string | - | 'is-move' |
| dropClass | 拖拽放置列表项样式类 | string | - | 'is-drop' |
| customClass | 自定义列表样式类 | string | - | - |
| customItemClass | 自定义列表项样式类 | string | - | - |
| longpress | 是否长按开启拖拽 | boolean | - | true |
| debounce | 拖拽时延，s | number | - | 25 |
| viewport | 边界 | UniApp.NodeInfo | - | - |
| absolute | 列表项完全在边界内 | boolean | - | false |
| offset | 列表项拖拽距离边界间距 | number | - | 10 |
| dragMode | 显示标签字段名） |  "swap" \| "move" | - | "move" |
| moveScale | 长按列表项缩小比例 | number | - | 0.9 |

## Events

| 事件 | 描述 | 类型 |
| :-- | :-- | :-- |
| on-drag | 拖拽开始时触发 | `(source: DragItem, sourceIndex: number, touch: TouchEvent) => void` |
| on-move | 拖拽过程中触发 | `(touch: TouchEvent) => void` |
| on-drag | 拖拽结束时触发 | `(target: DragItem, source: DragItem, targetIndex: number, sourceIndex: number, touch: TouchEvent) => void` |
| on-change | 拖拽发生变化时触发 | `(target: DragItem, source: DragItem, targetIndex: number, sourceIndex: number, touch: TouchEvent) => void` |
| update:dataSource | 列表变化时触发 | `(dataSource: DragItem[]) => void` |

## Slots

| 名称 | 描述 | 类型 |
| :-- | :-- | :-- |
| default | 默认作用域插槽，用于自定义列表元素 | `{item: DragItem, index: number}` |
