import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ObjectDetectorComponent } from './object-detector/object-detector.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route
  { path: 'dashboard', component: DashboardComponent },     // Dashboard page
  { path: 'object-detection', component: ObjectDetectorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
