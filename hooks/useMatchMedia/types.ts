export interface MediaResponsive<T> {
  [key: string]: T | undefined;
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}
