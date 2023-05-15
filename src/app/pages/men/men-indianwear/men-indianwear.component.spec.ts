import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenIndianwearComponent } from './men-indianwear.component';

describe('MenIndianwearComponent', () => {
  let component: MenIndianwearComponent;
  let fixture: ComponentFixture<MenIndianwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenIndianwearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenIndianwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
