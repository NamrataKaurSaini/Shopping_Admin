import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnqueriesComponent } from './enqueries.component';

describe('EnqueriesComponent', () => {
  let component: EnqueriesComponent;
  let fixture: ComponentFixture<EnqueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnqueriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnqueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
