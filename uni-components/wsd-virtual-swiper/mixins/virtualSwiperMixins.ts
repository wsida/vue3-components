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

export default {
  props: {
    // data: {
    //     type: Array,
    //     default: () => [],
    // },
    circular: {
      type: Boolean,
      default: false,
    },
    keyField: {
      type: String,
      default: 'id',
    },
    duration: {
      type: Number,
      default: 100,
    },
    ignoreChangeByManual: {
      type: Boolean,
      default: false,
    },
    triggerWhenMounted: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['swiper-change', 'current-change'],

  data() {
    let _durationTimeout: ReturnType<typeof setTimeout>;
    let _swiperTimeout: ReturnType<typeof setTimeout>;
    let _swiperEventTimeout: ReturnType<typeof setTimeout>;
    return {
      localPageData: [], // 数据集
      _durationTimeout,
      _swiperTimeout,
      _swiperEventTimeout,
      changeManualFlag: false,
      defaultCurrent: 0,
      defaultDuration: this.duration ?? 250,
      defaultCircular: this.circular ?? false,
      dataCurrent: 0,
      swiperCurrent: 0,
      swiperCurrentTemp: 0,
      currentKey: '',
      currentSwipers: [],
      finalyKeyField: this.keyField ?? 'id',
      finalyDuration: this.duration ?? 250,
      finalyCircular: this.circular ?? false,
      swiperChanging: false,
    };
  },

  computed: {
    normalizeData() {
      return this.localPageData.map((item) => {
        if (typeof item === 'object') {
          item['_id'] = item[this.finalyKeyField];
          return item;
        }
        return {
          _id: item,
          [this.finalyKeyField]: item,
        };
      });
    },

    swiperCounts() {
      return this.normalizeData.length;
    },

    swiperOffset() {
      return this.swiperCounts % 3;
    },

    swiperStartOffset() {
      return 0 + this.swiperOffset;
    },

    swiperEndOffset() {
      return this.swiperCounts - 1 - this.swiperOffset;
    },

    swiperMaxCounts() {
      return 3 + this.swiperOffset;
    },
  },

  watch: {
    dataCurrent: {
      handler(val) {
        this.$emit(
          'current-change',
          this.currentKey,
          val,
          this.getPrevIndex(val, this.swiperCounts),
          this.getNextIndex(val, this.swiperCounts)
        );
      },
      immediate: false,
    },
  },

  methods: {
    // swiper 绑定 change事件
    onSwiperChange(e: any) {
      if (
        this._swiperTimeout &&
        (!this.ignoreChangeByManual || !this.changeManualFlag)
      ) {
        clearTimeout(this._swiperTimeout);
      }

      if (this._durationTimeout) {
        this.finalyDuration = this.defaultDuration;
        clearTimeout(this._durationTimeout);
      }

      this.swiperCurrent = e.detail.current;

      if (this.changeManualFlag) {
        this.changeManualFlag = false;
      } else {
        this._swiperTimeout = setTimeout(() => {
          this.swiperChanging = true;
          this.finalyDuration = 0;
          this.updateCurrentSwiper();

          this._durationTimeout = setTimeout(() => {
            this.finalyDuration = this.defaultDuration;
            this.swiperChanging = false;
          }, this.defaultDuration);
        }, this.defaultDuration + 50);
      }
    },

    getCurrentIndex(index: number, len: number) {
      return !len ? 0 : (len + index) % len;
    },

    getNextIndex(index: number, len: number, step = 1) {
      return !len ? 0 : (index + step) % len;
    },

    getPrevIndex(index: number, len: number, step = 1) {
      return !len ? 0 : (len + (index - step)) % len;
    },

    shiftLeft(arr: Array<any>, step: number): Array<any> {
      const result: Array<any> = [];

      for (let i = 0; i < arr.length; i++) {
        result[i] = arr[this.getNextIndex(i, arr.length, step)];
      }

      return result;
    },

    shiftRight(arr: Array<any>, step: number): Array<any> {
      const result: Array<any> = [];

      for (let i = 0; i < arr.length; i++) {
        result[i] = arr[this.getPrevIndex(i, arr.length, step)];
      }

      return result;
    },

    // 偏移swiper-item数据
    shiftSwipers(swipers: SwiperItem[]): SwiperItem[] {
      const direction = 1 - this.swiperCurrent;

      if (direction === 1) {
        // 向左
        return this.shiftLeft(swipers, 1);
      } else if (direction === -1) {
        // 向右
        return this.shiftRight(swipers, 1);
      }
      return swipers;
    },

    // 更新渲染的swiper-item数据
    updateCurrentSwiper() {
      this.currentKey =
        this.currentSwipers[this.swiperCurrent][this.finalyKeyField];
      this.current = this.normalizeData.findIndex(
        (item: SwiperItem) => item[this.finalyKeyField] === this.currentKey
      );

      this.updateDataCurrent(this.current);
    },

    // 更新可循环swiper数据的计算方法
    updateCurrentSwiperByCircle() {
      let circular = this.defaultCircular;
      if (this.swiperCounts < 3) {
        this.swiperCurrent = this.dataCurrent;
        this.currentSwipers = this.normalizeData;
      } else {
        let cIndex = this.dataCurrent;
        let sIndex = this.getPrevIndex(cIndex, this.swiperCounts);
        let eIndex = this.getNextIndex(cIndex, this.swiperCounts);
        let newCurrentSwipers = [
          this.normalizeData[sIndex],
          this.normalizeData[cIndex],
          this.normalizeData[eIndex],
        ];
        this.currentSwipers = this.shiftSwipers(newCurrentSwipers);
      }
      this.finalyCircular = circular;
      this.$nextTick(() => {
        this.swiperCurrentTemp = this.swiperCurrent;
      });
      // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value);
    },

    // 更新不可循环swiper数据的计算方法
    updateCurrentSwiperByDefault() {
      let circular = this.defaultCircular;
      if (this.swiperCounts < 3) {
        this.swiperCurrent = this.dataCurrent;
        this.currentSwipers = this.normalizeData;
      } else {
        let cIndex = this.dataCurrent;

        if (cIndex > this.swiperStartOffset && cIndex < this.swiperEndOffset) {
          let sIndex = this.getPrevIndex(cIndex, this.swiperCounts);
          let eIndex = this.getNextIndex(cIndex, this.swiperCounts);
          let newCurrentSwipers = [
            this.normalizeData[sIndex],
            this.normalizeData[cIndex],
            this.normalizeData[eIndex],
          ];
          circular = true;
          this.swiperCurrent = this.swiperCurrent % 3;
          this.currentSwipers = this.shiftSwipers(newCurrentSwipers);
        } else if (cIndex <= this.swiperStartOffset) {
          this.currentSwipers = this.normalizeData.slice(
            0,
            this.swiperMaxCounts
          );
        } else if (cIndex >= this.swiperEndOffset) {
          this.currentSwipers = this.normalizeData.slice(-this.swiperMaxCounts);
        }
      }

      this.finalyCircular = circular;
      this.$nextTick(() => {
        this.swiperCurrentTemp = this.swiperCurrent;
      });
      // console.log('>>>swiper', dataCurrent.value, swiperCurrent.value, currentSwipers.value);
    },

    // 更新渲染的swiper-item数据集
    updateDataCurrent(index: number, trigger = true, init = false) {
      this.dataCurrent = this.getCurrentIndex(index, this.swiperCounts);
      this.currentKey =
        this.normalizeData[this.dataCurrent][this.finalyKeyField];

      if (this.defaultCircular) {
        this.updateCurrentSwiperByCircle();
      } else {
        this.updateCurrentSwiperByDefault();
      }

      if (this._swiperEventTimeout) {
        clearTimeout(this._swiperEventTimeout);
      }

      this._swiperEventTimeout = setTimeout(() => {
        trigger &&
          this._swiperCurrentChange &&
          this._swiperCurrentChange(
            this.currentKey,
            this.dataCurrent,
            this.swiperCurrent,
            init
          );
        trigger &&
          this.$emit(
            'swiper-change',
            this.currentKey,
            this.dataCurrent,
            this.swiperCurrent,
            init
          );
      }, this.defaultDuration + 50);
    },

    index2Current(index: number) {
      if (this.defaultCircular) {
        return index % 3;
      } else {
        return index && index > this.swiperEndOffset
          ? ((index - this.swiperOffset) % 3) + this.swiperOffset
          : index % 3;
      }
    },

    /**
     * @description滚动到指定索引的数据项
     * @param index 滚动到指定数据索引item
     * @param trigger 是否触发swiper-change事件
     * @param init 初始化渲染标识（mounted阶段），避免初始化swiper不会触发swiper-change事件导致 changeManualFlag 标识未重置。
     */
    scrollIntoSwiper(index: number, trigger = false, init = false) {
      let oldCurrent = this.swiperCurrent;
      let newCurrent = this.index2Current(index);
      if (oldCurrent !== newCurrent) {
        this.swiperCurrent = newCurrent; // 触发 swiper change 事件
        if (init || this.ignoreChangeByManual) {
          this.changeManualFlag = true;
        }
      }
      this.updateDataCurrent(index, trigger, init);
    },

    initVirtualSwiper() {
      this.scrollIntoSwiper(
        this.getCurrentIndex(this.defaultCurrent, this.swiperCounts),
        !!this.triggerWhenMounted,
        true
      );
    },
  },

  mounted() {
    // this.initVirtualSwiper()
  },

  expose: [
    'finalyKeyField',
    'finalyDuration',
    'finalyCircular',
    'currentKey',
    'dataCurrent',
    'swiperChanging',
    'swiperCurrent',
    'swiperCurrentTemp',
    'currentSwipers',
    'onSwiperChange',
    'scrollIntoSwiper',
    'index2Current',
  ],
};
