// swiper 数组渲染优化
/**
 * @description 大量swiper数据渲染导致dom节点过多问题优化-动态控制渲染的swiper渲染
 * 目前默认按 3 个swiper-item进行轮播渲染
 * 根据当前data-current对应的数据项，动态维护数据项前一项和后一项内容
 * 然后数据子集根据swiper当前current值进行偏移对齐，保证swiper展示item与数据项对齐。
 *
 * @warning acceleration 属性必须关闭否则容易存在渲染结果偏差
 * 由于这种对数据子集进行偏移的操作，对于数据项总数有要求，否则在首尾位置时可能偏移后与实际数据顺序又不一致，
 * 因此对于首尾位置需要进行特殊处理，子集数量可以大于3，但不超过5.
 */

import { unref, ref, watch, computed, onMounted, nextTick } from 'vue';
import type { Ref } from 'vue';

/**
 * acceleration
 */

export type SwiperItem = Record<string, any>;

export interface VirtualSwiperProps {
  defaultCurrent?: number;
  data: Array<string | number | object>;
  circular?: boolean;
  keyField?: string;
  duration?: number;
  ignoreChangeByManual?: boolean;
  triggerWhenMounted?: boolean;
}

export interface VirtualSwiperReturn {
  swiperCurrent: Ref<number>;
  swiperCurrentTemp: Ref<number>;
  dataCurrent: Ref<number>;
  currentKey: Ref<string | number | undefined>;
  currentSwipers: Ref<SwiperItem[]>;
  finalyKeyField: Ref<string>;
  finalyDuration: Ref<number>;
  finalyCircular: Ref<boolean>;
  swiperChanging: Ref<boolean>;
  onSwiperChange: (e: { current: number }) => void;
  scrollIntoSwiper: (index: number) => void;
  index2Current: (index: number) => number;
}

export interface VirtualSwiperEmits {
  (
    event: 'swiper-change',
    key: string | number,
    dataCurrent: number,
    swiperCurrent: number,
    init: boolean
  ): void;
  (
    event: 'current-change',
    key: string | number,
    dataCurrent: number,
    prevCurrent: number,
    nextCurrent: number
  ): void;
}

export default function useVirtualSwiper(
  props: Ref<VirtualSwiperProps>,
  emits?: VirtualSwiperEmits
): VirtualSwiperReturn {
  let _durationTimeout: ReturnType<typeof setTimeout>;
  let _swiperTimeout: ReturnType<typeof setTimeout>;
  let _swiperEventTimeout: ReturnType<typeof setTimeout>;

  const changeManualFlag = ref(false);
  const defaultCurrent = unref(props).defaultCurrent ?? 0;
  const defaultDuration = unref(props).duration ?? 250;
  const defaultCircular = unref(props).circular ?? false;
  const dataCurrent = ref(defaultCurrent);
  const swiperCurrent = ref(0);
  const swiperCurrentTemp = ref(0);
  const currentKey = ref();
  const currentSwipers: Ref<SwiperItem[]> = ref([]);
  const finalyKeyField = ref(unref(props).keyField ?? 'id');
  const finalyDuration = ref(defaultDuration);
  const finalyCircular = ref(defaultCircular);
  const swiperChanging = ref(false);

  const normalizeData = computed(() => {
    return unref(props).data.map((item: string | number | object) => {
      if (typeof item === 'object') {
        item['_id'] = item[unref(finalyKeyField)];
        return item;
      }
      return {
        _id: item,
        [unref(finalyKeyField)]: item,
      };
    });
  });

  const swiperCounts = computed(() => unref(normalizeData).length);
  const swiperOffset = computed(() => unref(swiperCounts) % 3);
  const swiperStartOffset = computed(() => 0 + unref(swiperOffset));
  const swiperEndOffset = computed(
    () => unref(swiperCounts) - 1 - unref(swiperOffset)
  );
  const swiperMaxCounts = computed(() => 3 + unref(swiperOffset));

  watch(
    dataCurrent,
    (val) => {
      emits &&
        emits(
          'current-change',
          currentKey.value,
          val,
          getPrevIndex(val, unref(swiperCounts)),
          getNextIndex(val, unref(swiperCounts))
        );
    },
    { immediate: false }
  );

  // swiper 绑定 change事件
  function onSwiperChange(e: any) {
    if (
      _swiperTimeout &&
      (!unref(props).ignoreChangeByManual || !changeManualFlag.value)
    ) {
      clearTimeout(_swiperTimeout);
    }

    if (_durationTimeout) {
      finalyDuration.value = defaultDuration;
      clearTimeout(_durationTimeout);
    }

    swiperCurrent.value = e.detail.current;

    if (changeManualFlag.value) {
      changeManualFlag.value = false;
    } else {
      swiperChanging.value = true;
      _swiperTimeout = setTimeout(() => {
        finalyDuration.value = 0;
        updateCurrentSwiper();

        _durationTimeout = setTimeout(() => {
          finalyDuration.value = defaultDuration;
          swiperChanging.value = false;
        }, defaultDuration);
      }, defaultDuration + 50);
    }
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

  function shiftLeft(arr: Array<any>, step: number): Array<any> {
    const result: Array<any> = [];

    for (let i = 0; i < arr.length; i++) {
      result[i] = arr[getNextIndex(i, arr.length, step)];
    }

    return result;
  }

  function shiftRight(arr: Array<any>, step: number): Array<any> {
    const result: Array<any> = [];

    for (let i = 0; i < arr.length; i++) {
      result[i] = arr[getPrevIndex(i, arr.length, step)];
    }

    return result;
  }

  // 偏移swiper-item数据
  function shiftSwipers(swipers: SwiperItem[]): SwiperItem[] {
    const direction = 1 - unref(swiperCurrent);

    if (direction === 1) {
      // 向左
      return shiftLeft(swipers, 1);
    } else if (direction === -1) {
      // 向右
      return shiftRight(swipers, 1);
    }
    return swipers;
  }

  // 更新渲染的swiper-item数据
  function updateCurrentSwiper() {
    const currentKey =
      unref(currentSwipers)[unref(swiperCurrent)][unref(finalyKeyField)];
    const current = unref(normalizeData).findIndex(
      (item: SwiperItem) => item[unref(finalyKeyField)] === currentKey
    );

    updateDataCurrent(current);
  }

  // 更新可循环swiper数据的计算方法
  function updateCurrentSwiperByCircle() {
    let circular = defaultCircular;
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
        unref(normalizeData)[eIndex],
      ];
      currentSwipers.value = shiftSwipers(newCurrentSwipers);
    }
    finalyCircular.value = circular;
    nextTick(() => {
      swiperCurrentTemp.value = swiperCurrent.value;
    });
    // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value);
  }

  // 更新不可循环swiper数据的计算方法
  function updateCurrentSwiperByDefault() {
    let circular = defaultCircular;
    if (unref(swiperCounts) < 3) {
      swiperCurrent.value = unref(dataCurrent);
      currentSwipers.value = unref(normalizeData);
    } else {
      const cIndex = unref(dataCurrent);

      if (
        cIndex > unref(swiperStartOffset) &&
        cIndex < unref(swiperEndOffset)
      ) {
        const sIndex = getPrevIndex(cIndex, unref(swiperCounts));
        const eIndex = getNextIndex(cIndex, unref(swiperCounts));
        const newCurrentSwipers = [
          unref(normalizeData)[sIndex],
          unref(normalizeData)[cIndex],
          unref(normalizeData)[eIndex],
        ];
        circular = true;
        swiperCurrent.value = swiperCurrent.value % 3;
        currentSwipers.value = shiftSwipers(newCurrentSwipers);
      } else if (cIndex <= unref(swiperStartOffset)) {
        currentSwipers.value = unref(normalizeData).slice(
          0,
          unref(swiperMaxCounts)
        );
      } else if (cIndex >= unref(swiperEndOffset)) {
        currentSwipers.value = unref(normalizeData).slice(
          -unref(swiperMaxCounts)
        );
      }
    }

    finalyCircular.value = circular;
    nextTick(() => {
      swiperCurrentTemp.value = swiperCurrent.value;
    });
    // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value);
  }

  // 更新渲染的swiper-item数据集
  function updateDataCurrent(index: number, trigger = true, init = false) {
    dataCurrent.value = getCurrentIndex(index, unref(swiperCounts));
    currentKey.value =
      unref(normalizeData)[unref(dataCurrent)][unref(finalyKeyField)];

    if (defaultCircular) {
      updateCurrentSwiperByCircle();
    } else {
      updateCurrentSwiperByDefault();
    }

    if (_swiperEventTimeout) {
      clearTimeout(_swiperEventTimeout);
    }

    _swiperEventTimeout = setTimeout(() => {
      trigger &&
        emits &&
        emits(
          'swiper-change',
          unref(currentKey),
          unref(dataCurrent),
          unref(swiperCurrent),
          init
        );
    }, defaultDuration + 50);
  }

  function index2Current(index: number) {
    if (defaultCircular) {
      return index % 3;
    } else {
      return index && index > unref(swiperEndOffset)
        ? ((index - unref(swiperOffset)) % 3) + unref(swiperOffset)
        : index % 3;
    }
  }

  /**
   * @description滚动到指定索引的数据项
   * @param index 滚动到指定数据索引item
   * @param trigger 是否触发swiper-change事件
   * @param init 初始化渲染标识（mounted阶段），避免初始化swiper不会触发swiper-change事件导致 changeManualFlag 标识未重置。
   */
  function scrollIntoSwiper(index: number, trigger = false, init = false) {
    const oldCurrent = swiperCurrent.value;
    const newCurrent = index2Current(index);
    if (oldCurrent !== newCurrent) {
      swiperCurrent.value = newCurrent; // 触发 swiper change 事件
      if (init || unref(props).ignoreChangeByManual) {
        changeManualFlag.value = true;
      }
    }
    updateDataCurrent(index, trigger, init);
  }

  onMounted(() => {
    scrollIntoSwiper(
      getCurrentIndex(defaultCurrent, unref(swiperCounts)),
      !!unref(props).triggerWhenMounted,
      true
    );
  });

  return {
    finalyKeyField,
    finalyDuration,
    finalyCircular,
    currentKey,
    dataCurrent,
    swiperCurrent,
    swiperCurrentTemp,
    currentSwipers,
    swiperChanging,
    onSwiperChange,
    scrollIntoSwiper,
    index2Current,
  };
}
