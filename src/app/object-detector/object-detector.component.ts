import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-object-detector',
  templateUrl: './object-detector.component.html',
  styleUrls: ['./object-detector.component.css']
})
export class ObjectDetectorComponent implements OnInit {

  @ViewChild('videoElement') videoElement!: ElementRef;
  detectedObject: string = '';
  model!: cocoSsd.ObjectDetection;
  detectedObjects: string[] = []; // List of all detected objects
  lastSpokenObject: string = ''; // To track the last spoken object to avoid repetition
  isSpeaking = false; // To track if the system is currently speaking

  constructor() { }

  async ngOnInit() {
    await tf.setBackend('webgl');
    await tf.ready();

    this.model = await cocoSsd.load();
    console.log('COCO SSD Model loaded.');
    this.startWebcam();
  }

  startWebcam() {
    const video = this.videoElement.nativeElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        video.srcObject = stream;
        video.play();
        video.onloadeddata = () => {
          this.detectFrame();
        };
      });
    }
  }

  async detectFrame() {
    const video = this.videoElement.nativeElement;

    this.model.detect(video).then((predictions: cocoSsd.DetectedObject[]) => {
      this.renderPredictions(predictions);

      // Loop over the predictions to handle new detections
      predictions.forEach(prediction => {
        const detectedClass = prediction.class;

        // Check if the object is already detected and stored in the list
        if (!this.detectedObjects.includes(detectedClass)) {
          // Add the new object to the list
          this.detectedObjects.push(detectedClass);
          // Set the detected object text
          this.detectedObject = `This is a ${detectedClass}`;
          
          // Speak the detected object only if not currently speaking
          if (!this.isSpeaking) {
            this.speakDetectedObject(detectedClass);
          }
        }
      });

      requestAnimationFrame(() => {
        this.detectFrame(); // Continuously detect objects in real-time
      });
    });
  }

  // Render predictions and bounding boxes on the canvas
  renderPredictions(predictions: cocoSsd.DetectedObject[]) {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      canvas.width = this.videoElement.nativeElement.width;
      canvas.height = this.videoElement.nativeElement.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      predictions.forEach(prediction => {
        const [x, y, width, height] = prediction.bbox;

        // Draw the bounding box
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Draw the label and confidence score
        ctx.fillStyle = '#00FF00';
        ctx.font = '18px Arial';
        ctx.fillText(
          `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
          x,
          y > 10 ? y - 5 : 10
        );
      });
    }
  }

  // Text-to-Speech function to speak the detected object
  speakDetectedObject(object: string) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(`This is a ${object}`);

    this.isSpeaking = true; // Set the speaking flag to true

    // When speaking ends, reset the flag
    utterance.onend = () => {
      this.isSpeaking = false;
    };

    synth.speak(utterance);
  }
}
