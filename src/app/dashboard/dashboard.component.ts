import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor(private router: Router) { }

  openObjectDetection() {
    this.router.navigate(['/object-detection']); // Navigate to object detection page
  }

  openImageClassification() {
    this.router.navigate(['/image-classification']); // Navigate to object detection page
  }

  openHandGesture() {
    this.router.navigate(['/hand-gesture']); // Navigate to object detection page
  }


}
