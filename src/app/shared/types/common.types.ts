export type CallbackFn<T, A = never> = (args?: A) => T;

export type TriplexMode = boolean | 'unknown';

export type Option = {
  label: string;
  value: any;
};

export type MousePos = {
  x: number;
  y: number;
};
