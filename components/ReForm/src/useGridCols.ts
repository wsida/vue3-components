import { computed, unref } from "vue";
import useGridResponsive, {
  matchResponsive,
  normalizeGridResponsive,
  DEFAULT_FORM_GRID_RESPONSIVE
} from "@/hooks/useGridResponsive";
import { isUndefined } from "lodash-es";
import type { MaybeRef } from "vue";
import type { ReFormProps } from "../types";

export default function useGridCols(
  cols: MaybeRef<ReFormProps["cols"]>,
  btnSpan: MaybeRef<ReFormProps["btnSpan"]>
) {
  const colsComputed = computed(
    () => unref(cols) || DEFAULT_FORM_GRID_RESPONSIVE
  );
  const { gridResponsive, responsiveWidth } = useGridResponsive(colsComputed);

  const localBtnSpan = computed(() => {
    if (isUndefined(unref(btnSpan))) return gridResponsive.value;
    const responsiveBtnSpan = normalizeGridResponsive(unref(btnSpan));
    const span = matchResponsive(unref(responsiveWidth), responsiveBtnSpan);
    return Math.min(span, gridResponsive.value);
  });

  return {
    colsComputed,
    gridResponsive,
    responsiveWidth,
    localBtnSpan
  };
}
