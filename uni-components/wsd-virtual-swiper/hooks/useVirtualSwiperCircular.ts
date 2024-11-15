// swiper 数组渲染优化

/**
 * @description 大量swiper数据渲染导致dom节点过多问题优化-动态控制渲染的swiper渲染
 * 目前默认按 3 个swiper-item进行轮播渲染
 * 根据当前data-current对应的数据项，动态维护数据项前一项和后一项内容
 * 然后对swiper-current进行重置保证保证swiper可以一直滑动，由于手动调整swiper-current会产生渲染抖动
 * 
 * @warning acceleration 属性必须关闭否则容易存在渲染结果偏差
 * 
 * 本hook实现思想相对简单，能够简单掌握原理。
 */

import { unref, ref, watch, computed, onMounted } from "vue";
import type { Ref } from "vue";

export type SwiperItem = Record<string, any>

export interface VirtualSwiperProps {
    defaultCurrent?: number
    data: Array<string | number | object>
    circular?: boolean
    keyField?: string
    duration?: number
}

export interface VirtualSwiperReturn {
    swiperCurrent: Ref<number>
    dataCurrent: Ref<number>
    currentKey: Ref<string | number | undefined>
    currentSwipers: Ref<SwiperItem[]>
    finalyKeyField: Ref<string>
    finalyDuration: Ref<number>
    finalyCircular: Ref<boolean>
    onSwiperChange: (e: {current: number}) => void
    scrollIntoSwiper: (index: number) => void
}

export interface VirtualSwiperEmits {
    (event: 'swiper-change', key: string | number, dataCurrent: number, swiperCurrent: number): void
    (event: 'current-change', key: string | number, dataCurrent: number, prevCurrent: number, nextCurrent: number): void
}

export default function useVirtualSwiperCircular(props: Ref<VirtualSwiperProps>, emits?: VirtualSwiperEmits): VirtualSwiperReturn {
    let _durationTimeout: ReturnType<typeof setTimeout>;
    let _swiperTimeout: ReturnType<typeof setTimeout>;
    const defaultCurrent = unref(props).defaultCurrent ?? 0;
    const defaultDuration = unref(props).duration ?? 300;
    const defaultCircular = unref(props).circular ?? false;
    const dataCurrent = ref(defaultCurrent);
    const swiperCurrentLast = ref(0);
    const swiperCurrent = ref(0);
    const currentKey = ref();
    const currentSwipers: Ref<SwiperItem[]> = ref([]);
    const finalyKeyField = ref(unref(props).keyField ?? 'id');
    const finalyDuration = ref(defaultDuration);
    const finalyCircular = ref(defaultCircular);
    
    const normalizeData = computed(() => {
        return unref(props).data.map((item: string | number | object) => {
            if (typeof item === 'object') return item;
            return ({
                [unref(finalyKeyField)]: item
            })
        })
    });

    const swiperCounts = computed(() => unref(normalizeData).length);
    
    watch(dataCurrent, (val) => {
        emits && emits('current-change', currentKey.value, val, getPrevIndex(val, unref(swiperCounts)), getNextIndex(val, unref(swiperCounts)));
    })
    
    function onSwiperChange(e: any) {
        // console.log('>>>swiper change', e)
        if (_swiperTimeout) {
            clearTimeout(_swiperTimeout);
        }

        if (_durationTimeout) {
            finalyDuration.value = defaultDuration;
            clearTimeout(_durationTimeout);
        }

        swiperCurrentLast.value = swiperCurrent.value;
        swiperCurrent.value = e.detail.current;
        
        _swiperTimeout = setTimeout(() => {
            finalyDuration.value = 0;

            updateCurrentSwiper();

            _durationTimeout = setTimeout(() => {
                finalyDuration.value = defaultDuration;
            }, defaultDuration);
        }, defaultDuration + 1);
    }

    function getCurrentIndex(index: number, len: number) {
        return !len ? 0 : (len + index) % len;
    }
    
    function getNextIndex(index: number, len: number, step = 1) {
        return !len ? 0 : (index + step) % len;
    }
    
    function getPrevIndex(index: number, len: number, step = 1) {
        return !len ? 0 : (len + (index - step)) % len;
    }
    
    function updateCurrentSwiper() {
        const direction = swiperCurrent.value - swiperCurrentLast.value;
        let current = unref(dataCurrent);
        if (direction === 1 || direction === -2) {
            // 向后
            current = getNextIndex(unref(dataCurrent), unref(swiperCounts));
        } else if (direction === -1 || direction === 2) {
            // 向前
            current = getPrevIndex(unref(dataCurrent), unref(swiperCounts));
        }

        updateDataCurrent(current);
    }
    
    function updateCurrentSwiperByCircle() {
       if (unref(swiperCounts) < 3) {
           swiperCurrent.value = unref(dataCurrent);
           currentSwipers.value = unref(normalizeData);
       } else {
           const cIndex = unref(dataCurrent);
           const sIndex = getPrevIndex(cIndex, unref(swiperCounts));
           const eIndex = getNextIndex(cIndex, unref(swiperCounts));
           const newCurrentSwipers = [
               unref(normalizeData)[sIndex],
               unref(normalizeData)[cIndex],
               unref(normalizeData)[eIndex]
           ]
           swiperCurrent.value = 1; // 每次都重置到 1
           currentSwipers.value = newCurrentSwipers;
       }
    }
    
    function updateCurrentSwiperByDefault() {
        if (unref(swiperCounts) < 3) {
            swiperCurrent.value = unref(dataCurrent);
            currentSwipers.value = unref(normalizeData);
        } else {
            const cIndex = unref(dataCurrent);
            
            if (cIndex > 0 && cIndex < (unref(swiperCounts) - 1)) {
                const sIndex = getPrevIndex(cIndex, unref(swiperCounts));
                const eIndex = getNextIndex(cIndex, unref(swiperCounts));
                const newCurrentSwipers = [
                    unref(normalizeData)[sIndex],
                    unref(normalizeData)[cIndex],
                    unref(normalizeData)[eIndex]
                ]
                swiperCurrent.value = 1; // 每次都重置到 1
                currentSwipers.value = newCurrentSwipers;
            } else if (cIndex === 0) {
                swiperCurrent.value = unref(dataCurrent);
                currentSwipers.value = unref(normalizeData).slice(0, 3);
            } else if (cIndex === (unref(swiperCounts) - 1)) {
                swiperCurrent.value = unref(dataCurrent);
                currentSwipers.value = unref(normalizeData).slice(-3);
            }
        }
        
        // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value)
    }
    
    function updateDataCurrent(index: number) {
        dataCurrent.value = getCurrentIndex(index, unref(swiperCounts));
        currentKey.value = unref(normalizeData)[unref(dataCurrent)][unref(finalyKeyField)];
        if (unref(finalyCircular)) {
            updateCurrentSwiperByCircle();
        } else {
            updateCurrentSwiperByDefault();
        }

        emits && emits('swiper-change', unref(currentKey), unref(dataCurrent), unref(swiperCurrent));
    }
    
    function scrollIntoSwiper(index: number) {
        updateDataCurrent(index);
    }
    
    onMounted(() => {
        scrollIntoSwiper(defaultCurrent);
    })
    
    return {
        finalyKeyField,
        finalyDuration,
        finalyCircular,
        currentKey,
        dataCurrent,
        swiperCurrent,
        currentSwipers,
        onSwiperChange,
        scrollIntoSwiper
    }
}
