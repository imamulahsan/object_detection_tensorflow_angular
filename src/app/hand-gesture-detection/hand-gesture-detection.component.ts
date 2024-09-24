import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as handpose from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hand-gesture-detection',
  templateUrl: './hand-gesture-detection.component.html',
  styleUrls: ['./hand-gesture-detection.component.css']
})
export class HandGestureDetectionComponent implements OnInit, OnDestroy {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  model: handpose.HandDetector | null = null;
  isModelLoaded: boolean = false;
  stream: MediaStream | null = null;  // To store the media stream

  constructor(private router: Router) { }

  async ngOnInit() {
    // Load the MediaPipe Hands model with the correct runtime
    await this.loadModel();
    this.startVideoStream();
  }

  ngOnDestroy() {
    this.stopVideoStream();  // Stop the video stream when the component is destroyed
  }

  // Load the MediaPipe Hands model with TensorFlow.js runtime
  async loadModel() {
    const modelConfig: handpose.MediaPipeHandsTfjsModelConfig = {
      runtime: 'tfjs'  // Explicitly typing as 'tfjs'
    };

    this.model = await handpose.createDetector(handpose.SupportedModels.MediaPipeHands, modelConfig);
    this.isModelLoaded = true;
    console.log("Hand Gesture model loaded.");
  }

  // Start the video stream
  // Start the video stream
startVideoStream() {
  const video = this.videoElement.nativeElement;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.stream = stream;  // Store the stream reference
      video.srcObject = stream;
      video.play();
      video.onloadeddata = () => {
        this.detectHands();
      };
    });
  }
}

stopVideoStream() {
  if (this.stream) {
    const tracks = this.stream.getTracks();  // Get all tracks
    tracks.forEach(track => track.stop());   // Stop each track
    this.stream = null;  // Clear the stream reference
  }
}

  // Detect hands and draw keypoints on the canvas
  async detectHands() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    setInterval(async () => {
      if (this.isModelLoaded && this.model) {
        const predictions = await this.model.estimateHands(video);

        // Clear the canvas before drawing new detections
        ctx?.clearRect(0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
          predictions.forEach(prediction => {
            this.drawKeypoints(prediction.keypoints, ctx);
          });
        }
      }
    }, 100);
  }

  // Draw keypoints of the hand on the canvas
  drawKeypoints(keypoints: handpose.Keypoint[], ctx: CanvasRenderingContext2D | null) {
    if (!ctx) return;

    // Draw keypoints
    keypoints.forEach(keypoint => {
      const { x, y } = keypoint;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    });
  }

  // Navigate back to dashboard and stop the video stream
  goBack() {
    this.stopVideoStream();  // Stop camera stream
    this.router.navigate(['/dashboard']);  // Navigate to dashboard
  }
}
