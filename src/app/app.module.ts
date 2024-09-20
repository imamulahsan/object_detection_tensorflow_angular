import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgChartsModule } from 'ng2-charts';  // Ensure this import is correct

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ObjectDetectorComponent } from './object-detector/object-detector.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ObjectDetectorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgChartsModule // Ensure this is in the imports array
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
