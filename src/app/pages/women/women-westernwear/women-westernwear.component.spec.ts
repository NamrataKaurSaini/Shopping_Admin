import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WomenWesternwearComponent } from './women-westernwear.component';

describe('WomenWesternwearComponent', () => {
  let component: WomenWesternwearComponent;
  let fixture: ComponentFixture<WomenWesternwearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WomenWesternwearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WomenWesternwearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
