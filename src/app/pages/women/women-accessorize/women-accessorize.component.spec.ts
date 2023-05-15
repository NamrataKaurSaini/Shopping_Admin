import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WomenAccessorizeComponent } from './women-accessorize.component';

describe('WomenAccessorizeComponent', () => {
  let component: WomenAccessorizeComponent;
  let fixture: ComponentFixture<WomenAccessorizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WomenAccessorizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WomenAccessorizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
