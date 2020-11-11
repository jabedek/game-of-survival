import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObsticleComponent } from './obsticle.component';

describe('ObsticleComponent', () => {
  let component: ObsticleComponent;
  let fixture: ComponentFixture<ObsticleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObsticleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObsticleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
