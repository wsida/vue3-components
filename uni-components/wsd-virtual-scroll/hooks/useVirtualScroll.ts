/**
 * 虚拟滚动基础计算
 */
import { ref, computed, unref, nextTick, watch, type Ref, type MaybeRef, onMounted, getCurrentInstance } from 'vue';
import { throttle } from '../utils/common';
// import { debounce, throttle } from '../utils/common';

export interface CacheItemSize {
    _v_index: number
    _v_key: number | string
    cellItemSize: number
    cellItemTotal: number
}

export type CustomVirtualScrollIndex = (index: number, callback?: Function) => void;

export interface CustomVirtualScrollProps {
    virtual?: boolean;
    frp?: number;
    prefixDistance?: number; // 内容与滚动容器顶部（左边）的偏移
    affixDistance?: number; // 内容与滚动容器底部（右边）的偏移
    scrollDistance: number; // 滚动容器的滚动距离 - scrollTop/scrollLeft
    scrollOffset?: number; // 滚动距离需要偏移的距离 - 存在affixDistance的时候
    usePrefixDistance?: boolean; // scrollOffset = affixDistance
    data: MaybeRef<any[]>; // 绑定数据 - 自动构建为 Array<object>
    keyField?: string; // 数据主键
    scrollDirection?: 'y' | 'x';
    cellSizeMode: 'dynamic' | 'fixed'; // 
    cellItemSize?: number;
    viewCounts: number; // 可视视图展示数量
    previewCounts: number; // 上下提前展示数量
    cellCols?: number; // 多列计算
    debounce?: number; // 计算时延
    scrollTo?: (distance: number) => void; // 滚动容器重置位置
    getInstanceId?: (cell: any) => number | string; // 获取cell唯一值
    revertScroll?: boolean; // 是否在计算完后重置滚动位置 - 会有抖动
    // 安全动态高度计算 - 初始化不一次性渲染所有数据，而是默认使用 viewCounts + 2 * previewCounts 大小进行渲染。这种方式不适合初始化时就有滚动距离的场景-可能这个大小的高度还不满足滚动距离，同时无法撑开整个数据量；如果初始化渲染所有数据，数量过大可能直接卡死，需要适当取舍。建议viewCounts=previewCounts = pageSize * n ([1,])
    safeDynamicRender?: boolean;
    renderDebounce?: number;
    updateFormStart?: boolean;
    ignoreCountsChange?: boolean;
    initRenderManual?: boolean;
}

export interface CustomVirtualScrollReturn {
    virtualList: Ref<Array<any>>;
    firstRenderFlag: Ref<boolean>;
    firstRenderedFlag: Ref<boolean>;
    getFinalCellSizeFlag: Ref<boolean>;
    totalPadding: Ref<number>;
    startIndex: Ref<number>;
    endIndex: Ref<number>;
    startPadding: Ref<number>;
    endPadding: Ref<number>;
    opacity: Ref<number>;
    refresh: (distance?: number) => void;
    refreshCache: () => void;
    clearVirtualList: () => void;
    forceUpdateVirtualList: () => void;
    updateVirtualList: (distance: number, force: boolean) => void;
    updateTotalPadding: (callback?: Function) => void;
    deleteCellItemByvIndex: (index: number) => void;
    deleteCellItemByIndex: (index: number) => void;
    updateCellItemByvIndex: (index: number) => void;
    updateCellItemByIndex: (index: number) => void;
    scrollTo:  (distance: number) => void;
    scrollToIndex: CustomVirtualScrollIndex;
    scrollThrottle:  (distance: number) => void;
    initVirtualList: (distance: number) => void;
}

// 获取当前时间
function getTime() {
	return (new Date()).getTime();
}

// 获取z-paging实例id，随机生成10位数字+字母
function defaultGetInstanceId() {
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 10; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    return s.join('') + getTime();
}

export const CellIndexValuePrefix = 'v-cell-id-';
export const CellKeyValuePrefix = 'v-';
export const CellIndexName = '_v_index';
export const CellKeyName = '_v_key';
export const CellDataName = '_v_data';

export const isType = (val: unknown, type: string) => Object.prototype.toString.call(val).toLowerCase() === `[object ${type}]`
export const isObject = (val: unknown) => isType(val, 'object')
export const isFunction = (val: unknown) => isType(val, 'function')
export const isUndefined = (val: unknown) => isType(val, 'undefined')

export default function useVirtualScroll(props: MaybeRef<CustomVirtualScrollProps>): CustomVirtualScrollReturn {
    let _timeout: ReturnType<typeof setTimeout>;
    let _renderTimeout: ReturnType<typeof setTimeout>;
    let startHeightCache: CacheItemSize[] = []; // 缓存-每个cell的高度/宽度一次优化
    
    const _instance = getCurrentInstance(); // 当前组件实例
    const frp = ref(unref(props).frp ?? 60);
    const firstRenderFlag = ref(false); // 是否已经计算完 totalPadding
    const firstRenderedFlag = ref(false); // 是否已经初始化渲染完
    const getFinalCellSizeFlag = ref(false); // 是否已经通过query获取cell高度
    const initRenderFlag = ref(false);
    const virtualCellSize = ref(0); // 通过query获取cell高度
    const vStartIndex = ref<number>(0); // 滚动距离对应起始索引
    const vEndIndex = ref<number>(0); // 滚动距离对应结束索引
    const aStartIndex  = ref<number>(0); // 实际渲染起始索引
    const aEndIndex  = ref<number>(0); // 实际渲染结束索引
    const totalPadding = ref<number>(0);
    const startPadding = ref<number>(0);
    const endPadding = ref<number>(0);
    const virtualList = ref<Array<any>>([]);
    const lastStartIndex = ref(-1);
    const lastEndIndex = ref(-1);
    const innerScrollDistance = ref(0);
    const opacity = ref(1);
    const oldListCounts = ref(0);

    const finalViewCount = computed(() => {
        const defaultViewCount = unref(unref(props).viewCounts);
        const diff = defaultViewCount % unref(finalCellCols);
        if (diff  === 0) return defaultViewCount;
        return defaultViewCount + (unref(finalCellCols) - diff);
    })
    const finalPreviewCount = computed(() => {
      const defaultViewCount = unref(unref(props).previewCounts);
      const diff = defaultViewCount % unref(finalCellCols);
      if (diff  === 0) return defaultViewCount;
      return defaultViewCount + (unref(finalCellCols) - diff);
    })
    const finalScrollDirection = computed(() => unref(unref(props).scrollDirection) ?? 'y');
    const finalCellCols = computed(() => unref(props).cellCols || 1);
    const finalCellSize = computed(() => unref(props).cellItemSize || 0);
    const defaultDynamicRenderSize = computed(() => unref(finalViewCount) + 2 * unref(finalPreviewCount));
    const normalizeData = computed(() => {
        return unref(unref(props).data).map(cellItem => {
            const keyField = unref(props).keyField ?? '';
            const keyValue = keyField && cellItem[keyField]
                ? cellItem[keyField]
                :  unref(props).getInstanceId
                    ? unref(props).getInstanceId(cellItem)
                    : defaultGetInstanceId()

            const _key = `${CellKeyValuePrefix}${keyValue}`
            const _index = `${CellIndexValuePrefix}-${_key}`

            if (isObject(cellItem)) {
                return {
                    ...cellItem,
                    // [CellDataName]: cellItem,
                    [CellIndexName]: _index,
                    [CellKeyName]: _key
                }
            } else {
                return {
                    [CellIndexName]: _index,
                    [CellKeyName]: _key,
                    [CellDataName]: cellItem
                }
            }
        });
    })
    const listCounts = computed(() => unref(normalizeData).length);
    const finalDynamicRenderSize = computed(() => unref(props).safeDynamicRender ? unref(defaultDynamicRenderSize) : unref(listCounts));
    
    const scrollThrottle = throttle(scrollTo, 1000 / frp.value);

    // const vEndIndex = computed<number>(() => Math.min(unref(listCounts), unref(vStartIndex) + unref(finalViewCount)));

    // const aStartIndex = computed<number>(() => getStartIndex(unref(vStartIndex)));

    // const aEndIndex = computed<number>(() => getEndIndex(unref(vEndIndex)));
    
    // 动态高度专属 - 更新虚拟列表索引item
    function updateCellItemByvIndex(vIndex: number) {
        if (unref(props).cellSizeMode === 'fixed') return;
        const aIndex = Math.max(0, aStartIndex.value + vIndex);
        updateCellItemByIndex(aIndex);
    }
    
    // 动态高度专属 - 更新虚拟列表索引item
    function updateCellItemByIndex(aIndex: number) {
        if (unref(props).cellSizeMode === 'fixed') return;
        const forceRender = (aStartIndex.value && aIndex < aStartIndex.value) || (aEndIndex.value && aIndex > aEndIndex.value);
        if (forceRender) {
            virtualList.value.push(normalizeData.value[aIndex]);
        }
        getDynamicVirtualListSize(() => {
            updateTotalPadding();
            if (forceRender) {
                virtualList.value.pop();
            }
            _updateVirtualList();
        }, aIndex);
    }
    
    // 动态高度专属 - 删除虚拟列表索引item
    function deleteCellItemByvIndex(vIndex: number) {
        if (unref(props).cellSizeMode === 'fixed') return;
        const aIndex = Math.max(0, aStartIndex.value + vIndex);
        deleteCellItemByIndex(aIndex);
    }

    // 动态高度专属 - 删除原始数据索引item
    function deleteCellItemByIndex(aIndex: number) {
        if (unref(props).cellSizeMode === 'fixed') return;
        const forceRender = aStartIndex.value && aIndex < aStartIndex.value;
        const cIndex = Math.floor(aIndex / unref(finalCellCols));
        startHeightCache.splice(cIndex, 1);
        nextTick(() => {
            updateTotalPadding();
            if (forceRender) {
                vStartIndex.value -= 1
                updateaStartIndex();
                updateStartPadding();
            }
            updateaEndIndex();
            _updateVirtualList();
        })
    }
    
    // 登记数据item缓存尺寸 - 对应虚拟行索引
    function registerCellItemCacheSize(index: number, size: number, total = 0) {
        const rowData = unref(normalizeData)[index];
        const rowIndex = Math.floor(index / unref(finalCellCols));
        
        const cellItemCache: CacheItemSize = {
            [CellIndexName]: index,
            [CellKeyName]: rowData[CellKeyName],
            cellItemSize: size,
            cellItemTotal: total
        }

        startHeightCache[rowIndex] = cellItemCache;
    }
    
    // 获取数据item缓存-item尺寸-实际数据索引
    function getCellItemCacheSize(index: number) {
        if (!unref(listCounts)) return 0;
        const rowIndex = Math.floor(index / unref(finalCellCols));
        let cellItemSize = 0;
        const cache = startHeightCache[rowIndex]
        if (!!cache) {
            cellItemSize = cache.cellItemSize;
        } else {
            cellItemSize = finalCellSize.value || virtualCellSize.value;
        }
        
        return cellItemSize;
    }
    
    // 获取数据item缓存-展示item的滚动距离 index-实际数索索引
    function getCellItemCacheTotal(index: number) {
        if (!unref(listCounts)) return 0;
        const rowIndex = Math.floor(index / unref(finalCellCols));
        let total = 0;
        const cache = startHeightCache[rowIndex]
        if (!!cache) {
            total = cache.cellItemTotal;
        } else {
            if (unref(props).cellSizeMode === 'fixed') {
                total = Math.max(0, rowIndex - 1) * getCellItemCacheSize(0);
            } else if (unref(props).cellSizeMode === 'dynamic') {
                // 动态高度，每个元素的缓存都在初始化时拥有
                let cTotal = 0;
                for (let i = 0; i <= index; i+=unref(finalCellCols)) {
                  cTotal += getCellItemCacheSize(i);
                }
                total = cTotal;
            }
        }
        
        return total;
    }
    
    // 获取数据item尺寸，并进行缓存登记 - index实际数索索引
    function getAndRegisterCellItemSize(index: number, lastTotal: number) {
        if (!unref(listCounts)) return 0;

        const cellItemSize = getCellItemCacheSize(index);
        registerCellItemCacheSize(index, cellItemSize, lastTotal);
        
        return cellItemSize;
    }

    function clearVirtualList() {
      totalPadding.value = 0;
      startPadding.value = 0;
      endPadding.value = 0;
      virtualList.value = [];
    }

    // 虚拟列表索引/尺寸计算
    function updatevStartIndex(distance?: number) {
        const top = Math.max(0, (distance ?? unref(props).scrollDistance) - unref(props).prefixDistance);
        let total = 0;
        let sid = 0;
        let start = 0;
        
        for (let i = start; i < unref(listCounts); i += unref(finalCellCols)) {
            sid = i;
            let ctotal = total + getCellItemCacheSize(i);
            if (ctotal <= top) {
              total = ctotal;
            } else {
              break;
            }
        }
    
        vStartIndex.value = sid;
        updateaStartIndex();
    }
    
    function updatevEndIndex() {
        vEndIndex.value = Math.min(unref(listCounts), unref(vStartIndex) + unref(finalViewCount));
        updateaEndIndex();
    }
    
    function updateaStartIndex() {
        aStartIndex.value = getStartIndex(unref(vStartIndex));
    }
    
    function updateaEndIndex() {
        aEndIndex.value = getEndIndex(unref(vEndIndex));
    }

    function updateTotalPadding(callback?: Function) {
        let total = 0;
        let count = 0;
        for (let i = 0; i < unref(listCounts); i += unref(finalCellCols)) {
            count = i;
            let cellItemSize = getAndRegisterCellItemSize(i, total);
            total += cellItemSize;
        }

        totalPadding.value = total;
        firstRenderFlag.value = true;
        callback && callback();
    }

    function updateStartPadding() {
        let total = 0;
        let start = Math.max(0, unref(aStartIndex));
        
        // cache 缓存的total是对应索引的前置内容总高度（不包含当前索引内容高度）
        total = getCellItemCacheTotal(start) ?? 0;
        // return total;
        startPadding.value = total; 
    }
    
    // const scrollToDebounce = debounce(scrollTo, unref(props).debounce);
    // const scrollToThrottle = throttle(scrollTo, unref(props).debounce);

    function updateVirtualList(distance = 0, forceUpdateList = false) {
        innerScrollDistance.value = distance;
        updatevStartIndex(distance);
        updatevEndIndex();
        // 同步更新其他数据字段
        updateStartPadding();
        _updateVirtualList(forceUpdateList);
    }
        
    function forceUpdateVirtualList() {
        virtualList.value = unref(normalizeData).slice(aStartIndex.value, aEndIndex.value);
    }
    
    function _updateVirtualList(force = false) {
        const shouldUpdate = force || (!virtualList.value.length && !!listCounts.value) || (oldListCounts.value !== listCounts.value)  || (lastStartIndex.value !== aStartIndex.value || lastEndIndex.value !== aEndIndex.value);
        oldListCounts.value = listCounts.value
        if (shouldUpdate) {
            lastStartIndex.value = aStartIndex.value;
            lastEndIndex.value = aEndIndex.value;
            virtualList.value = unref(normalizeData).slice(aStartIndex.value, aEndIndex.value);
            
            if (unref(props).cellSizeMode === 'dynamic') {
                getDynamicVirtualListSize(() => {
                    updateTotalPadding();
                });
            }
        }
    }

    function getStartIndex(startIndex: number) {
        // startIndex - 数据索引
        let _index = Math.min(Math.max(0, startIndex - unref(finalPreviewCount)), unref(listCounts));
        const diff = _index % unref(finalCellCols);
        if (!diff) {
            _index = Math.max(0, _index - diff);
        }
        return _index;
    }

    function getEndIndex(endIndex: number) {
        // endIndex - 数据索引
        let _index = Math.max(0, Math.min(unref(listCounts), endIndex + unref(finalPreviewCount)));

        const diff = _index % unref(finalCellCols);
        if (!diff) {
            _index = Math.min(unref(listCounts), _index + diff);
        }

        return _index;
    }

    // 虚拟列表滚动
    function scrollTo(top: number) {
        if (_timeout) {
            clearTimeout(_timeout);
        }
        if (!firstRenderFlag.value) {
            initVirtualList(top);
            return;
        } else {
            updateVirtualList(top);
            if (unref(props).revertScroll) {
                _timeout = setTimeout(() => {
                    // 防抖
                    unref(props).scrollTo?.(top);
                }, unref(props).debounce);
            }
        }
    }

    // 滚动到指定索引-index实际数据索引
    function scrollToIndex(index: number, callback?: Function) {
        let startIndex = getStartIndex(unref(index));
        let distance = getCellItemCacheTotal(startIndex) + (unref(props).usePrefixDistance ? (unref(props).prefixDistance ?? 0) : (unref(props).scrollOffset ?? 0));

        scrollTo(distance);

        nextTick(() => {
            callback && callback(distance);
        });
    }

    function renderStartVirtualList(defaultSize = 0) {
      const size = defaultSize || unref(finalDynamicRenderSize);
      // totalPadding.value = 0;
      startPadding.value = 0;
      aStartIndex.value = 0;
      aEndIndex.value = Math.min(size, unref(listCounts));
      virtualList.value = unref(normalizeData).slice(aStartIndex.value, aEndIndex.value);
    }
    
    // TODO：考虑数据增加/删除/修改 - 需要动态调整尺寸 dynamic 高度才需要考虑
    function getDynamicVirtualListSize(callback?: Function, index = -1) {
        if (_renderTimeout) {
            clearTimeout(_renderTimeout);
        }
        _renderTimeout = setTimeout(() => {
            const dynamicList  = index !== -1 ? [normalizeData.value[index]] : virtualList.value;
            const query = uni.createSelectorQuery().in(_instance);
            for (const cell of dynamicList) {
                query.select(`#${cell[CellIndexName]}`).boundingClientRect();
            }
            query.exec((rects: UniApp.NodeInfo[]) => {
                if (!rects) {
                    initRenderFlag.value = false;
                    return
                }
                let i = 0;
                let total = getCellItemCacheTotal(aStartIndex.value);
                for (const rect of rects) {
                    const cell = virtualList.value[i];
                    const id = cell[CellKeyName];
                    const size = unref(finalScrollDirection) === 'x'
                        ? rect.width
                        : unref(finalScrollDirection) === 'y'
                            ? rect.height
                            : 0
        
                    registerCellItemCacheSize(id, size, total);
                    
                    total += size;
                }
                callback && callback();
            })
        }, unref(props).renderDebounce ?? 50);
    }

    function renderDynamicVirtualList(callback?: Function) {
        renderStartVirtualList();
        getDynamicVirtualListSize(callback);
    }

    function resetVirtual() {
      vStartIndex.value = 0 // 滚动距离对应起始索引
      vEndIndex.value = 0 // 滚动距离对应结束索引
      aStartIndex.value = 0 // 实际渲染起始索引
      aEndIndex.value = 0 // 实际渲染结束索引
      totalPadding.value = 0
      startPadding.value = 0
      endPadding.value = 0
      virtualList.value = []
    }
    
    function renderDefaultVirtualList(callback?: Function) {
        if (_renderTimeout) {
            clearTimeout(_renderTimeout);
        }
        renderStartVirtualList(unref(defaultDynamicRenderSize));
        // updateVirtualList(0);
        _renderTimeout = setTimeout(() => {
            const cell = virtualList.value[0];
            if (!cell) {
                initRenderFlag.value = false;
                return
            };
            const query = uni.createSelectorQuery().in(_instance);
            query.select(`#${cell[CellIndexName]}`).boundingClientRect((res: UniApp.NodeInfo) => {
                if (res) {
                    if (unref(finalScrollDirection) === 'x') {
                        virtualCellSize.value = res.width;
                    } else if (unref(finalScrollDirection) === 'y') {
                        virtualCellSize.value = res.height;
                    }
                    callback && callback();
                } else {
                    initRenderFlag.value = false;
                }
            }).exec();
        }, unref(props).renderDebounce ?? 50);
    }
    
    function initVirtualList(distance?: number, callback?: Function) {
        if (!unref(props).virtual || initRenderFlag.value) return;

        if (!unref(listCounts)) {
          resetVirtual()
          return
        }
        firstRenderedFlag.value = false;
        firstRenderFlag.value = false;
        initRenderFlag.value = true;
        if (unref(props).cellSizeMode === 'dynamic') {
            opacity.value = 0;
            // 动态高度 + 最好与分页请求一起，避免一次性渲染太多数据导致初始化就卡死
            renderDynamicVirtualList(() => {
                getFinalCellSizeFlag.value = true;
                updateTotalPadding(() => {
                    updateVirtualList(distance, true);
                    callback && callback();
                    opacity.value = 1;
                    initRenderFlag.value = false;
                    firstRenderedFlag.value = true;
                });
            });
        } else if (!finalCellSize.value) {
            if (!getFinalCellSizeFlag.value) {
                opacity.value = 0;
                renderDefaultVirtualList(() => {
                    getFinalCellSizeFlag.value = true;
                    updateTotalPadding(() => {
                        updateVirtualList(distance, true);
                        callback && callback();
                        opacity.value = 1;
                        initRenderFlag.value = false;
                        firstRenderedFlag.value = true;
                    });
                })
            } else {
                updateTotalPadding(() => {
                    updateVirtualList(distance, true);
                    callback && callback();
                    initRenderFlag.value = false;
                    firstRenderedFlag.value = true;
                });
            }
        } else {
            // 使用startPadding + totalPadding
            getFinalCellSizeFlag.value = true;
            updateTotalPadding(() => {
                updateVirtualList(distance, true);
                callback && callback();
                initRenderFlag.value = false;
                firstRenderedFlag.value = true;
            });
        }
    }
    
    function refreshCache() {
        getFinalCellSizeFlag.value = false;
        firstRenderFlag.value = false;
        startHeightCache = [] as CacheItemSize[];
    }
    
    function refresh(distance?: number, callback?: Function) {
        refreshCache();
        initVirtualList(distance, callback);
    }

    watch(finalCellCols, () => {
        if (!unref(props).virtual)  return;
        refresh(0);
    });
    
    watch(listCounts, () => {
        if (!unref(props).virtual)  return;
        if (!unref(props).ignoreCountsChange && unref(props).cellSizeMode === 'fixed') {
            initVirtualList(unref(props).updateFormStart ? 0 : unref(innerScrollDistance));
        }
    });
    
    onMounted(() => {
        if (unref(props).virtual) {
          !unref(props).initRenderManual && initVirtualList(0);
        }
    })

    return {
        firstRenderedFlag,
        firstRenderFlag,
        getFinalCellSizeFlag,
        refresh,
        refreshCache,
        virtualList,
        totalPadding,
        startPadding,
        endPadding,
        startIndex: aStartIndex,
        endIndex: aEndIndex,
        opacity,
        forceUpdateVirtualList,
        clearVirtualList,
        updateVirtualList,
        updateTotalPadding,
        deleteCellItemByvIndex,
        deleteCellItemByIndex,
        updateCellItemByvIndex,
        updateCellItemByIndex,
        scrollTo,
        scrollToIndex,
        scrollThrottle,
        initVirtualList
    };
}
