import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandGestureDetectionComponent } from './hand-gesture-detection.component';

describe('HandGestureDetectionComponent', () => {
  let component: HandGestureDetectionComponent;
  let fixture: ComponentFixture<HandGestureDetectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HandGestureDetectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HandGestureDetectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
