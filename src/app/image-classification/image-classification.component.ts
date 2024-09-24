import { Component } from '@angular/core';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import { Router } from '@angular/router';  // Import the Router for navigation

@Component({
  selector: 'app-image-classification',
  templateUrl: './image-classification.component.html',
  styleUrls: ['./image-classification.component.css']
})
export class ImageClassificationComponent {
  model: any;
  imageSrc: string | ArrayBuffer | null = null;
  prediction: { className: string; probability: number } | null = null;

  constructor(private router: Router) {
    // Load the MobileNet model
    mobilenet.load().then(loadedModel => {
      this.model = loadedModel;
      console.log('MobileNet model loaded.');
    });
  }

  // Function to handle image upload
  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageSrc = reader.result;
        this.classifyImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Function to classify the uploaded image
  async classifyImage(imageSrc: string) {
    const image = new Image();
    image.src = imageSrc;
    image.onload = async () => {
      const tensor = tf.browser.fromPixels(image).resizeBilinear([224, 224]).expandDims(0).toFloat();
      const predictions = await this.model.classify(tensor);
      this.prediction = predictions[0];  // Get the top prediction
      console.log('Prediction:', this.prediction);
    };
  }

  // Method to navigate back to the dashboard
  goBack() {
    this.router.navigate(['/dashboard']);  // Navigate back to the dashboard route
  }
}
