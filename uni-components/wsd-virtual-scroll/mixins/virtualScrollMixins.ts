/**
 * 虚拟滚动基础计算
 */
import { throttle } from '../utils/common';

export interface CacheItemSize {
    _v_key: number | string
    cellItemSize: number
    cellItemTotal: number
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

export default {
    props: {
        virtual: { type: Boolean, default: false }, // 是否采用虚拟滚动
        fps: Number,
        prefixDistance: {
            type: Number,
            default: 0
        }, // 内容与滚动容器顶部（左边）的偏移
        affixDistance: {
            type: Number,
            default: 0
        }, // 内容与滚动容器底部（右边）的偏移
        scrollDistance: {
            type: Number,
            default: 0
        }, // 滚动容器的滚动距离 - scrollTop/scrollLeft
        scrollOffset: Number, // 滚动距离需要偏移的距离 - 存在affixDistance的时候
        useAffixDistance: Boolean, // scrollOffset = affixDistance
        data: {
            type: Array,
            default: () => ([])
        }, // 绑定数据 - 自动构建为 Array<object>
        keyField: {
            type: String,
            default: 'id'
        }, // 数据主键
        scrollDirection: {
            type: String,
            default: 'y'
        }, // y' | 'x';
        cellSizeMode: {
            type: String,
            default: 'fixed' // 'dynamic' | 'fixed'; // 
        },
        cellItemSize: Number,
        viewCounts: {
            type: Number,
            default: 10
        }, // 可视视图展示数量
        previewCounts: {
            type: Number,
            default: 0
        }, // 上下提前展示数量
        cellCols: {
            type: Number, // 多列计算
            default: 1
        },
        debounce: {
           type: Number,
            default: 300
        }, // 计算时延
        scrollTo: Function, // 滚动容器重置位置
        getInstanceId: Function, // 获取cell唯一值
        revertScroll: {
            type: Boolean,
            default: false
        }, // 是否在计算完后重置滚动位置 - 会有抖动
        // 安全动态高度计算 - 初始化不一次性渲染所有数据，而是默认使用 viewCounts + 2 * previewCounts 大小进行渲染。这种方式不适合初始化时就有滚动距离的场景-可能这个大小的高度还不满足滚动距离，同时无法撑开整个数据量；如果初始化渲染所有数据，数量过大可能直接卡死，需要适当取舍。建议viewCounts=previewCounts = pageSize * n ([1,])
        safeDynamicRender: {
            type: Boolean,
            default: false
        },
        renderDebounce: {
            type: Number,
            default: 50
        },
        updateFormStart: {
            type: Boolean,
            default: true
        },
        initRenderManual: {
          type: Boolean,
          default: false
        },
    },

    data() {
        return {
            _vtimeout: undefined,
            _vrenderTimeout: undefined,
            startHeightCache: [], // 缓存-每个cell的高度/宽度一次优化
            _vfirstRenderFlag: false, // 是否已经计算完 totalPadding
            _vgetFinalCellSizeFlag: false, // 是否已经通过query获取cell高度
            _vinitRenderFlag: false,
            _vinitRenderedFlag: false,
            virtualCellSize: 0, // 通过query获取cell高度
            vStartIndex: 0, // 滚动距离对应起始索引
            vEndIndex: 0, // 滚动距离对应结束索引
            aStartIndex: 0, // 实际渲染起始索引
            aEndIndex: 0, // 实际渲染结束索引
            totalPadding: 0,
            startPadding: 0,
            endPadding: 0,
            virtualList: [],
            lastStartIndex: -1,
            lastEndIndex: -1,
            innerScrollDistance: 0,
            opacity: 1
        }
    },
    
    computed: {
        finalFps() {
            return this.fps ?? 60;
        },
        defaultDynamicRenderSize() {
            return this.viewCounts + (2 * this.previewCounts);
        },
        finalCellSize() {
            return this.cellItemSize || 0;
        },
        finalCellCols() {
            return this.cellCols || 1;
        },
        normalizeData() {
            return (this.data || []).map(cellItem => {
                const keyField = this.keyField ?? '';
                const keyValue = keyField && cellItem[keyField]
                    ? cellItem[keyField]
                    :  this.getInstanceId
                        ? this.getInstanceId(cellItem)
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
        },
        listCounts() {
            return this.normalizeData.length;
        },
        finalDynamicRenderSize() {
            return this.safeDynamicRender ? this.defaultDynamicRenderSize : this.listCounts;
        }
    },
    
    created() {
        this.scrollThrottle = throttle(this._scrollTo.bind(this), 1000 / this.finalFps);
    },
    
    mounted() {
        if (this.virtual) {
            !this.initRenderManual && this.initVirtualList(0);
        }
    },

    methods: {
        getVIndex(index: number) {
            if (!this.virtual) return Math.min(Math.max(0, index), this.listCounts - 1);
            return Math.min(Math.max(0, index - this.aStartIndex), this.virtualList.length - 1);
        },
        getIndex(index: number) {
            if (!this.virtual) return Math.min(Math.max(0, index), this.listCounts - 1);
            return Math.min(Math.max(0, this.aStartIndex + index), this.listCounts - 1);
        },
        // const vEndIndex = computed<number>(() => Math.min(this.listCounts, unref(vStartIndex) + unref(this.viewCounts)));

        // const aStartIndex = computed<number>(() => getStartIndex(unref(vStartIndex)));

        // const aEndIndex = computed<number>(() => getEndIndex(unref(vEndIndex)));
        
        // 动态高度专属 - 更新虚拟列表索引item
        updateCellItemByvIndex(vIndex: number) {
            if (this.cellSizeMode === 'fixed') return;
            const aIndex = Math.max(0, this.aStartIndex + vIndex);
            this.updateCellItemByIndex(aIndex);
        },
        
        // 动态高度专属 - 更新虚拟列表索引item
        updateCellItemByIndex(aIndex: number) {
            if (this.cellSizeMode === 'fixed') return;
            const forceRender = (this.aStartIndex && aIndex < this.aStartIndex) || (this.aEndIndex && aIndex > this.aEndIndex);
            if (forceRender) {
                this.virtualList.push(this.normalizeData[aIndex]);
            }
            this.getDynamicVirtualListSize(() => {
                this.updateTotalPadding();
                if (forceRender) {
                    this.virtualList.pop();
                }
                this._updateVirtualList();
            }, aIndex);
        },
        
        // 动态高度专属 - 删除虚拟列表索引item
        deleteCellItemByvIndex(vIndex: number) {
            if (this.cellSizeMode === 'fixed') return;
            const aIndex = Math.max(0, this.aStartIndex + vIndex);
            this.deleteCellItemByIndex(aIndex);
        },

        // 动态高度专属 - 删除原始数据索引item
        deleteCellItemByIndex(aIndex: number) {
            if (this.cellSizeMode === 'fixed') return;
            const forceRender = this.aStartIndex && aIndex < this.aStartIndex;
            const id = this.normalizeData[aIndex][CellKeyName];
            const cIndex = this.startHeightCache.findIndex((cache: CacheItemSize) => cache[CellKeyName] === id);
            this.startHeightCache.splice(cIndex, 1);
            this.$nextTick(() => {
                this.updateTotalPadding();
                if (forceRender) {
                    this.vStartIndex -= 1
                    this.updateaStartIndex();
                    this.updateStartPadding();
                }
                this.updateaEndIndex();
                this._updateVirtualList();
            })
        },
        
        // 登记数据item缓存尺寸
        registerCellItemCacheSize(id: string | number, size: number, total = 0) {
            const cacheIndex = this.startHeightCache.findIndex((cache: CacheItemSize) => cache[CellKeyName] === id)
            
            const cellItemCache: CacheItemSize = {
                [CellKeyName]: id,
                cellItemSize: size,
                cellItemTotal: total
            }

            if (cacheIndex !== -1) {
                this.startHeightCache[cacheIndex] = cellItemCache;
            } else {
                this.startHeightCache.push(cellItemCache);
            }
        },
        
        // 获取数据item缓存-item尺寸
        getCellItemCacheSize(index: number) {
            if (!this.listCounts) return 0;
            const id = this.normalizeData[index][CellKeyName];
            let cellItemSize = 0;
            const cacheIndex = this.startHeightCache.findIndex((cache: CacheItemSize) => cache[CellKeyName] === id)
            if (cacheIndex !== -1) {
                cellItemSize = this.startHeightCache[cacheIndex].cellItemSize;
            } else {
                cellItemSize = this.finalCellSize || this.virtualCellSize;
            }
            
            return cellItemSize;
        },
        
        // 获取数据item缓存-展示item的滚动距离
        getCellItemCacheTotal(index: number) {
            if (!this.listCounts) return 0;
            const id = this.normalizeData[index][CellKeyName];
            let total = 0;
            const cacheIndex = this.startHeightCache.findIndex((cache: CacheItemSize) => cache[CellKeyName] === id)
            if (cacheIndex !== -1) {
                total = this.startHeightCache[cacheIndex].cellItemTotal;
            } else {
                if (this.cellSizeMode === 'fixed') {
                    total = Math.max(0, index - 1) * this.getCellItemCacheSize(index);
                } else if (this.cellSizeMode === 'dynamic') {
                    // 动态高度，每个元素的缓存都在初始化时拥有
                    total = this.normalizeData.slice(0, index).reduce((currentTotal: number, cell: any, cindex: number) => {
                        const cellSize = this.getCellItemCacheSize(cindex);
                        return currentTotal + cellSize;
                    }, 0);
                }
            }
            
            return total;
        },
        
        // 获取数据item尺寸，并进行缓存登记
        getAndRegisterCellItemSize(index: number, lastTotal: number) {
            if (!this.listCounts) return 0;
            
            const id = this.normalizeData[index][CellKeyName];
            const cellItemSize = this.getCellItemCacheSize(index);
            this.registerCellItemCacheSize(id, cellItemSize, lastTotal);
            
            return cellItemSize;
        },

        // 虚拟列表索引/尺寸计算
        updatevStartIndex(distance?: number) {
            const top = Math.max(0, (distance ?? this.scrollDistance) - this.prefixDistance);
            let total = 0;
            let sid = 0;
            let start = 0;
            
            for (let i = start; i < this.listCounts; i += this.finalCellCols) {
                let ctotal = total + this.getCellItemCacheSize(i);
                if (ctotal <= top) {
                    total = ctotal;
                    sid = i;
                } else {
                    break;
                }
            }
        
            if (total && total === top) {
                sid += this.finalCellCols;
            }
        
            this.vStartIndex = sid;
            this.updateaStartIndex();
        },
        
        updatevEndIndex() {
            this.vEndIndex = Math.min(this.listCounts, this.vStartIndex + this.viewCounts);
            this.updateaEndIndex();
        },
        
        updateaStartIndex() {
            this.aStartIndex = this.getStartIndex(this.vStartIndex);
        },
        
        updateaEndIndex() {
            this.aEndIndex = this.getEndIndex(this.vEndIndex);
        },

        updateTotalPadding(callback?: Function) {
            let total = 0;
            let count = 0;
            for (let i = 0; i < this.listCounts; i += this.finalCellCols) {
                count = i;
                let cellItemSize = this.getAndRegisterCellItemSize(i, total);
                total += cellItemSize;
            }
            if (count + 1 < this.listCounts) {
                // 计算偏差
                let ind = count + 1;
                let cellItemSize = this.getAndRegisterCellItemSize(ind, total);
                total += cellItemSize;
            }
            // return total;
            this.totalPadding = total;
            this._vfirstRenderFlag = true;
            callback && callback();
        },

        updateStartPadding() {
            let total = 0;
            let start = Math.floor(this.aStartIndex / this.finalCellCols);
            
            total = this.getCellItemCacheTotal(start) ?? 0;
            // return total;
            this.startPadding = total;
        },
        
        // const scrollToDebounce = debounce(scrollTo, this.debounce);
        // const scrollToThrottle = throttle(scrollTo, this.debounce);

        updateVirtualList(distance = 0) {
            this.innerScrollDistance = distance;
            this.updatevStartIndex(distance);
            this.updatevEndIndex();
            // 同步更新其他数据字段
            this.updateStartPadding();
            this._updateVirtualList();
        },
        
        forceUpdateVirtualList() {
            this.virtualList = this.normalizeData.slice(this.aStartIndex, this.aEndIndex);
        },
        
        _updateVirtualList(force = false) {
            const shouldUpdate = force || (this.lastStartIndex !== this.aStartIndex || this.lastEndIndex !== this.aEndIndex);
            if (shouldUpdate) {
                this.lastStartIndex = this.aStartIndex;
                this.lastEndIndex = this.aEndIndex;
                this.virtualList = this.normalizeData.slice(this.aStartIndex, this.aEndIndex);
                if (this.cellSizeMode === 'dynamic') {
                    this.getDynamicVirtualListSize(() => {
                        this.updateTotalPadding();
                    });
                }
            }
        },

        getStartIndex(startIndex: number) {
            let _index = Math.min(Math.max(0, startIndex - this.previewCounts), this.listCounts);
            const diff = _index % this.finalCellCols;
            if (!diff) {
                _index = Math.max(0, _index - diff);
            }
            return _index;
        },

        getEndIndex(endIndex: number) {
            let _index = Math.max(0, Math.min(this.listCounts, endIndex + this.previewCounts));

            const diff = _index % this.finalCellCols;
            if (!diff) {
                _index = Math.min(this.listCounts, _index + diff);
            }

            return _index;
        },

        resetVirtual() {
          this.vStartIndex = 0 // 滚动距离对应起始索引
          this.vEndIndex = 0 // 滚动距离对应结束索引
          this.aStartIndex = 0 // 实际渲染起始索引
          this.aEndIndex = 0 // 实际渲染结束索引
          this.totalPadding = 0
          this.startPadding = 0
          this.endPadding = 0
          this.virtualList = []
        },

        // 虚拟列表滚动
        _scrollTo(top: number) {
            if (!this.virtual) return;
            if (this._vtimeout) {
                clearTimeout(this._vtimeout);
            }
            if (!this._vfirstRenderFlag) {
                this.initVirtualList(top);
                return;
            } else {
                this.updateVirtualList(top);
                if (this.revertScroll) {
                    this._vtimeout = setTimeout(() => {
                        // 防抖
                        this.scrollTo?.(top);
                    }, this.debounce);
                }
            }
        },

        _scrollToIndex(index: number, callback?: Function) {
            if (!this.virtual) return;
            let startIndex = this.getStartIndex(index);
            let distance = this.getCellItemCacheTotal(startIndex) + (this.useAffixDistance ? (this.affixDistance ?? 0) : (this.scrollOffset ?? 0));

            this._scrollTo(distance)
            this.$nextTick(() => {
                callback && callback(distance);
            });
        },

        renderStartVirtualList(defaultSize = 0) {
          const size = defaultSize || this.finalDynamicRenderSize;
          // totalPadding = 0;
          this.startPadding = 0;
          this.aStartIndex = 0;
          this.aEndIndex = Math.min(size, this.listCounts);
          this.virtualList = this.normalizeData.slice(this.aStartIndex, this.aEndIndex);
        },
        
        // TODO：考虑数据增加/删除/修改 - 需要动态调整尺寸 dynamic 高度才需要考虑
        getDynamicVirtualListSize(callback?: Function, index = -1) {
            if (this._vrenderTimeout) {
                clearTimeout(this._vrenderTimeout);
            }
            this._vrenderTimeout = setTimeout(() => {
                const dynamicList  = index !== -1 ? [this.normalizeData[index]] : this.virtualList;
                const query = uni.createSelectorQuery().in(this);
                for (const cell of dynamicList) {
                    query.select(`#${cell[CellIndexName]}`).boundingClientRect();
                }
                query.exec((rects: UniApp.NodeInfo[]) => {
                    let i = 0;
                    let total = this.getCellItemCacheTotal(this.aStartIndex);
                    for (const rect of rects) {
                        const cell = this.virtualList[i];
                        const id = cell[CellKeyName];
                        const size = this.scrollDirection === 'x'
                            ? rect.width
                            : this.scrollDirection === 'y'
                                ? rect.height
                                : 0
            
                        this.registerCellItemCacheSize(id, size, total);
                        
                        total += size;
                    }
                    callback && callback();
                })
            }, this.renderDebounce);
        },

        renderDynamicVirtualList(callback?: Function) {
            this.renderStartVirtualList();
            this.getDynamicVirtualListSize(callback);
        },
        
        renderDefaultVirtualList(callback?: Function) {
            if (this._vrenderTimeout) {
                clearTimeout(this._vrenderTimeout);
            }
            this.renderStartVirtualList(this.defaultDynamicRenderSize);
            this._vrenderTimeout = setTimeout(() => {
                const cell = this.virtualList[0];
                if (!cell) return;
                const query = uni.createSelectorQuery().in(this);
                query.select(`#${cell[CellIndexName]}`).boundingClientRect((res: UniApp.NodeInfo) => {
                    if (res) {
                        if (this.scrollDirection === 'x') {
                            this.virtualCellSize = res.width;
                        } else if (this.scrollDirection === 'y') {
                            this.virtualCellSize = res.height;
                        }
                        callback && callback();
                    }
                }).exec();
            }, this.renderDebounce);
        },
        
        initVirtualList(distance?: number, callback?: Function) {
            if (!this.virtual || this._vinitRenderFlag) return;
            if (!this.listCounts) {
              this.resetVirtual()
              return
            }
            this._vfirstRenderFlag = false;
            this._vinitRenderedFlag = false;
            this._vinitRenderFlag = true;
            if (this.cellSizeMode === 'dynamic') {
                this.opacity = 0;
                // 动态高度 + 最好与分页请求一起，避免一次性渲染太多数据导致初始化就卡死
                this.renderDynamicVirtualList(() => {
                    this._vgetFinalCellSizeFlag = true;
                    this.updateTotalPadding(() => {
                        this.updateVirtualList(distance);
                        callback && callback();
                        this.opacity = 1;
                        this._vinitRenderFlag = false;
                        this._vinitRenderedFlag = true;
                    });
                });
            } else if (!this.finalCellSize) {
                if (!this._vgetFinalCellSizeFlag) {
                    this.opacity = 0;
                    this.renderDefaultVirtualList(() => {
                        this._vgetFinalCellSizeFlag = true;
                        this.updateTotalPadding(() => {
                            this.updateVirtualList(distance);
                            callback && callback();
                            this.opacity = 1;
                            this._vinitRenderFlag = false;
                            this._vinitRenderedFlag = true;
                        });
                    })
                } else {
                    this.updateTotalPadding(() => {
                        this.updateVirtualList(distance);
                        callback && callback();
                        this._vinitRenderFlag = false;
                        this._vinitRenderedFlag = true;
                    });
                }
            } else {
                // 使用startPadding + totalPadding
                this._vgetFinalCellSizeFlag = true;
                this.updateTotalPadding(() => {
                    this.updateVirtualList(distance);
                    callback && callback();
                    this._vinitRenderFlag = false;
                    this._vinitRenderedFlag = true;
                });
            }
        },
        
        _refreshCache() {
            this._vgetFinalCellSizeFlag = false;
            this._vfirstRenderFlag = false;
            this.startHeightCache = [] as CacheItemSize[];
        },
        
        _refresh(distance?: number, callback?: Function) {
            if (!this.virtual) return;
            this._refreshCache();
            this.initVirtualList(distance, callback);
        }
    },

    watch: {
        finalCellCols() {
            if (!this.virtual) return;
            this._refresh(0);
        },
        
        listCounts() {
            if (!this.virtual) return;
            if (this.cellSizeMode === 'fixed') {
                this.initVirtualList(this.updateFormStart ? 0 : this.innerScrollDistance);
                // this.$nextTick(() => {
                //     this.initVirtualList(this.updateFormStart ? 0 : this.innerScrollDistance);
                // })
            }
        }
    }
}
