import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenAccessorizeComponent } from './men-accessorize.component';

describe('MenAccessorizeComponent', () => {
  let component: MenAccessorizeComponent;
  let fixture: ComponentFixture<MenAccessorizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenAccessorizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenAccessorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
