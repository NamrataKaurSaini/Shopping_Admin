import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomedecorComponent } from './homedecor.component';

describe('HomedecorComponent', () => {
  let component: HomedecorComponent;
  let fixture: ComponentFixture<HomedecorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomedecorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomedecorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
