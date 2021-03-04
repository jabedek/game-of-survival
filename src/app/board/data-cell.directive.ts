import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appDataCell]',
})
export class DataCellDirective {
  constructor(private el: ElementRef) {}
}
