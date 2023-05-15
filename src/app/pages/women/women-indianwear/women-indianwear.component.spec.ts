import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WomenIndianwearComponent } from './women-indianwear.component';

describe('WomenIndianwearComponent', () => {
  let component: WomenIndianwearComponent;
  let fixture: ComponentFixture<WomenIndianwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WomenIndianwearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WomenIndianwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
