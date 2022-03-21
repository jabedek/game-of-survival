import { Directive, ElementRef, forwardRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const MIN_MAX_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MinMaxDirective),
  multi: true,
};

@Directive({
  selector: '[minMax]', // tslint:disable-line
  providers: [MIN_MAX_ACCESSOR],
})
export class MinMaxDirective implements ControlValueAccessor, OnChanges, OnInit {
  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes);
  }

  ngOnInit(): void {
    console.log(this.input);
  }

  input: number | undefined;

  /**
   * Property set only by programmatic changes (patchValue() etc.)
   */
  // set value(v: any) {
  //   console.log(v);

  //   if (v !== this._value) {
  //     this._value = v;
  //     this.onChange(v);
  //   }
  // }

  @Input() minMax: [number, number] | undefined;

  public onChange = (_: number) => {};

  public onTouched: any = () => {};

  constructor(private el: ElementRef) {}

  /**
   * Function used by a formControl to update native input's value
   */
  writeValue(val: number): void {
    this.input = val;
    this.el.nativeElement.value = val;
    console.log(val);
  }

  /**
   * Register a cb that will be used by a formControl when native input is updated
   */
  registerOnChange(fn: (newValue: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
