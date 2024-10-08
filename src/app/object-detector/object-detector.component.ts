import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-object-detector',
  templateUrl: './object-detector.component.html',
  styleUrls: ['./object-detector.component.css']
})
export class ObjectDetectorComponent implements OnInit, AfterViewInit {

  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;  // Reference to the canvas element
  detectedObject: string = '';
  model!: cocoSsd.ObjectDetection;
  detectedObjects: string[] = []; // List of all detected objects
  isSpeaking = false; // To track if the system is currently speaking

  // Timer properties
  countdown: number = 3;  // Set your desired countdown time (e.g., 3 seconds)
  isCameraStarted: boolean = false; // Flag to track when the camera feed is active

  async ngOnInit() {
    await tf.setBackend('webgl');
    await tf.ready();

    this.model = await cocoSsd.load();
    console.log('COCO SSD Model loaded.');
  }

  ngAfterViewInit() {
    // Now that the view has been initialized, we can safely access the @ViewChild elements
    this.startCountdown();  // Start the countdown before activating the camera
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
      }).catch(err => {
        console.error('Error accessing webcam: ', err);
      });
    } else {
      console.error('getUserMedia not supported in this browser.');
    }
  }

  async detectFrame() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match the displayed size of the video element
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    this.model.detect(video).then((predictions: cocoSsd.DetectedObject[]) => {
      this.renderPredictions(predictions, ctx, video);

      // Loop over the predictions to handle new detections
      predictions.forEach(prediction => {
        const detectedClass = prediction.class;

        // Set the detected object text and speak the object
        if (!this.detectedObjects.includes(detectedClass)) {
          this.detectedObjects.push(detectedClass);
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
renderPredictions(predictions: cocoSsd.DetectedObject[], ctx: CanvasRenderingContext2D | null, video: HTMLVideoElement) {
  if (!ctx) {
    console.error('Unable to get canvas context');
    return;
  }

  // Clear the previous drawings
  ctx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

  // Get the real video size and canvas size
  const videoWidth = video.videoWidth;
  const videoHeight = video.videoHeight;

  // Set canvas size to match video size
  this.canvasElement.nativeElement.width = videoWidth;
  this.canvasElement.nativeElement.height = videoHeight;

  // Calculate the ratio between video size and displayed size
  const xScale = this.canvasElement.nativeElement.width / videoWidth;
  const yScale = this.canvasElement.nativeElement.height / videoHeight;

  // Loop through each prediction and render the bounding box
  predictions.forEach(prediction => {
    const [x, y, width, height] = prediction.bbox;

    // Scale the bounding box coordinates to match the video
    const scaledX = x * xScale;
    const scaledY = y * yScale;
    const scaledWidth = width * xScale;
    const scaledHeight = height * yScale;

    // Draw the bounding box
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 4;
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

    // Draw the label and confidence score
    ctx.fillStyle = '#00FF00';
    ctx.font = '18px Arial';
    ctx.fillText(
      `${prediction.class} (${Math.round(prediction.score * 100)}%)`,
      scaledX,
      scaledY > 10 ? scaledY - 5 : 10
    );
  });
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

  // Function to start the countdown timer
  startCountdown() {
    const intervalId = setInterval(() => {
      this.countdown--;  // Decrease countdown value every second

      if (this.countdown <= 0) {
        clearInterval(intervalId);  // Stop the countdown when it reaches 0
        this.startWebcam();  // Start the webcam feed
        this.isCameraStarted = true;  // Set camera active flag
      }
    }, 1000);  // Update every 1 second (1000 ms)
  }
}
