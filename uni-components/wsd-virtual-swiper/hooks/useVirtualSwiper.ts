// swiper 数组渲染优化

import { unref, ref, watch, computed, onMounted } from 'vue';
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
}

export interface VirtualSwiperReturn {
  swiperCurrent: Ref<number>;
  dataCurrent: Ref<number>;
  currentKey: Ref<string | number | undefined>;
  currentSwipers: Ref<SwiperItem[]>;
  finalyKeyField: Ref<string>;
  finalyDuration: Ref<number>;
  finalyCircular: Ref<boolean>;
  onSwiperChange: (e: { current: number }) => void;
  scrollIntoSwiper: (index: number) => void;
}

export interface VirtualSwiperEmits {
  (
    event: 'swiper-change',
    key: string | number,
    dataCurrent: number,
    swiperCurrent: number
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

  const defaultCurrent = unref(props).defaultCurrent ?? 0;
  const defaultDuration = unref(props).duration ?? 250;
  const defaultCircular = unref(props).circular ?? false;
  const dataCurrent = ref(defaultCurrent);
  const swiperCurrent = ref(0);
  const currentKey = ref();
  const currentSwipers: Ref<SwiperItem[]> = ref([]);
  const finalyKeyField = ref(unref(props).keyField ?? 'id');
  const finalyDuration = ref(defaultDuration);
  const finalyCircular = ref(defaultCircular);

  const normalizeData = computed(() => {
    return unref(props).data.map((item: string | number | object) => {
      if (typeof item === 'object') return item;
      return {
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

  watch(dataCurrent, (val) => {
    emits &&
      emits(
        'current-change',
        currentKey.value,
        val,
        getPrevIndex(val, unref(swiperCounts)),
        getNextIndex(val, unref(swiperCounts))
      );
  });

  // swiper 绑定 change事件
  function onSwiperChange(e: any) {
    // console.log('>>>swiper change', e)
    if (_swiperTimeout) {
      clearTimeout(_swiperTimeout);
    }

    if (_durationTimeout) {
      finalyDuration.value = defaultDuration;
      clearTimeout(_durationTimeout);
    }

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
    // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value);
  }

  // 更新渲染的swiper-item数据集
  function updateDataCurrent(index: number) {
    dataCurrent.value = getCurrentIndex(index, unref(swiperCounts));

    if (defaultCircular) {
      updateCurrentSwiperByCircle();
    } else {
      updateCurrentSwiperByDefault();
    }

    emits &&
      emits(
        'swiper-change',
        unref(currentKey),
        unref(dataCurrent),
        unref(swiperCurrent)
      );
  }

  // 滚动到指定索引的数据项
  function scrollIntoSwiper(index: number) {
    if (unref(finalyCircular)) {
      swiperCurrent.value = index % 3;
    } else {
      swiperCurrent.value =
        index && index > unref(swiperEndOffset)
          ? ((index - unref(swiperOffset)) % 3) + unref(swiperOffset)
          : index % 3;
    }
    updateDataCurrent(index);
  }

  onMounted(() => {
    scrollIntoSwiper(getCurrentIndex(defaultCurrent, unref(swiperCounts)));
  });

  return {
    finalyKeyField,
    finalyDuration,
    finalyCircular,
    currentKey,
    dataCurrent,
    swiperCurrent,
    currentSwipers,
    onSwiperChange,
    scrollIntoSwiper,
  };
}
