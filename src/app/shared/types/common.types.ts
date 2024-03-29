import { ElementRef } from '@angular/core';

export type CallbackFn<T, A = never> = (args?: A) => T;
export type TemplatesArray<T> = ElementRef<T>[];

export type TriplexMode = boolean | 'unknown';

export type Option = {
  label: string;
  value: any;
};

export type Pos = {
  x: number;
  y: number;
};
