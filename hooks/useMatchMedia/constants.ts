export const DEFAULT_MEDIA_RESPONSIVE_ITEMS = {
  xs: "<768px",
  sm: ">=768px",
  md: ">=992px",
  lg: ">=1200px",
  xl: ">=1920px"
};

export const CUSTOM_MEDIA_TYPE_REGEX = /^_(\d)+px$/;
export const MEDIA_RULE_REGEX = /^(>|>=|<|<=)(\d+)(px)?$/;
export const DEFAULT_CUSTOM_MEDIA_TYPE = ">=";
