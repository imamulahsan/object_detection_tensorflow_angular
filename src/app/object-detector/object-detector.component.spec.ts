import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectDetectorComponent } from './object-detector.component';

describe('ObjectDetectorComponent', () => {
  let component: ObjectDetectorComponent;
  let fixture: ComponentFixture<ObjectDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ObjectDetectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ObjectDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
