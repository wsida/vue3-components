import {
  ref,
  computed,
  shallowRef,
  unref,
  triggerRef,
  watch,
  type Ref,
  type ShallowRef,
  type MaybeRef
} from "vue";
import {
  normalizeVisible,
  normalizeFormItems,
  normalizeFormValueAndRules,
  normalizeFormRules,
  normalizeCollapsed
} from "../utils";
import type {
  ReFormProps,
  ReFormEmits,
  ReFormItem,
  ReFormModelValue,
  ReFormRules,
  ReGridResponsive
} from "../types";
import type { ElForm } from "element-plus";
import { isUndefined } from "lodash-es";
import { cloneDeep } from "@pureadmin/utils";

export default function useForm(
  items: MaybeRef<ReFormItem[]>,
  defaultValue?: MaybeRef<ReFormModelValue>,
  span?: MaybeRef<number | ReGridResponsive>
) {
  const submiting = ref(false);
  const reFormRef = ref<InstanceType<typeof ElForm> | null>(null);
  const getFormRef = (form: MaybeRef<InstanceType<typeof ElForm> | null>) => {
    reFormRef.value = unref(form);
  };

  const formItems: ShallowRef<ReFormItem[]> = shallowRef(
    normalizeFormItems(unref(items), unref(span))
  );

  // 合并逻辑 - 利用相同递归
  const { modelValue, rules } = normalizeFormValueAndRules(
    formItems,
    defaultValue
  );
  const formData: ShallowRef<ReFormModelValue> = shallowRef(modelValue);
  const formRules: ShallowRef<Partial<ReFormRules>> = shallowRef(rules);

  const { collapsedStatus, groupDependency } = normalizeCollapsed(formItems);

  const formCollapsed: Ref<Record<string, boolean>> = ref(collapsedStatus);
  const formGroupDependency: Ref<Record<string, string[]>> =
    ref(groupDependency);

  const formVisible: Ref<Record<string, boolean>> = computed(() => {
    return normalizeVisible(formItems, unref(formData));
  });

  // formItems => shallwoRef
  // formRuels => shallwoRef
  const unwatchForm = watch(
    () => unref(items),
    () => {
      formItems.value = normalizeFormItems(unref(items), unref(span));
      formRules.value = normalizeFormRules(formItems.value);
      triggerRef(formItems);
      triggerRef(formRules);
    }
  );

  return {
    submiting,
    reFormRef,
    getFormRef,
    formData,
    formRules,
    formItems,
    formVisible,
    formCollapsed,
    formGroupDependency,
    unwatchForm
  };
}

export function useWatchForm(
  formItems: ShallowRef<ReFormItem[]>,
  formData: ShallowRef<ReFormModelValue>,
  props: ReFormProps,
  emits: ReFormEmits
) {
  const renderFormItemsCache = computed(() => unref(formItems));

  const renderFormItems = computed(() => {
    const travel = (originItems: ReFormItem[]): ReFormItem[] => {
      return originItems.map((formItem: ReFormItem) => {
        const item: ReFormItem = cloneDeep(formItem);
        if (item.type !== "group") {
          const field = item.field;
          const updateEvent = (value: any) => {
            formData.value[field] = value;
            emits("change", field, value, unref(formData));
            triggerRef(formData);
          };

          const wrapperEvent = (...rest: Function[]) => {
            const events = [...rest];
            return (value: any) => {
              for (const event of events) {
                event.apply(value);
              }
            };
          };

          if (isUndefined(item.props)) {
            item.props = {
              [item.modelProp]: unref(formData)[item.field]
            };
          } else {
            item.props[item.modelProp] = unref(formData)[item.field];
          }

          if (isUndefined(item.events)) {
            item.events = {
              [item.modelEvent]: updateEvent
            };
          } else {
            if (isUndefined(item.events[item.modelEvent])) {
              item.events[item.modelEvent] = updateEvent;
            } else {
              item.events[item.modelEvent] = wrapperEvent(
                updateEvent,
                item.events[item.modelEvent]
              );
            }
          }
        } else {
          item.children = travel(item.children);
        }
        return item;
      });
    };

    return travel(renderFormItemsCache.value);
  });

  const formDataProxy = computed(() => ({ ...unref(formData) }));

  // formData => shallwoRef
  const unwatchFormData = watch(formData, () => {
    if (!isUndefined(props.modelValue)) {
      emits("update:modelValue", unref(formData));
    }
  });

  // props.modelValue => shallwoRef
  const unwatchModelValue = watch(
    () => props.modelValue,
    () => {
      if (!isUndefined(props.modelValue)) {
        let changeFlag = false;
        for (const field of Object.keys(unref(props.modelValue))) {
          if (
            Reflect.has(formData.value, field) &&
            formData.value[field] !== props.modelValue[field]
          ) {
            formData.value[field] = props.modelValue[field];
            changeFlag = true;
          }
        }
        if (changeFlag) {
          triggerRef(formData);
        }
      }
    },
    {
      deep: true
    }
  );

  return {
    renderFormItems,
    renderFormItemsCache,
    formDataProxy,
    unwatchModelValue,
    unwatchFormData
  };
}
