import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroodComponent } from './brood.component';

describe('BroodComponent', () => {
  let component: BroodComponent;
  let fixture: ComponentFixture<BroodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BroodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
