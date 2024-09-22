import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ObjectDetectorComponent } from './object-detector/object-detector.component';
import { ImageClassificationComponent } from './image-classification/image-classification.component';
import { HandGestureDetectionComponent } from './hand-gesture-detection/hand-gesture-detection.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route
  { path: 'dashboard', component: DashboardComponent },     // Dashboard page
  { path: 'object-detection', component: ObjectDetectorComponent },
  { path: 'image-classification', component: ImageClassificationComponent },
  { path: 'hand-gesture', component: HandGestureDetectionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
