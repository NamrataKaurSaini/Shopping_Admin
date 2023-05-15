import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenTopwearComponent } from './men-topwear.component';

describe('MenTopwearComponent', () => {
  let component: MenTopwearComponent;
  let fixture: ComponentFixture<MenTopwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenTopwearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenTopwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
