import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenBottomwearComponent } from './men-bottomwear.component';

describe('MenBottomwearComponent', () => {
  let component: MenBottomwearComponent;
  let fixture: ComponentFixture<MenBottomwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenBottomwearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenBottomwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
