import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { Chart } from 'chart.js';  // Import Chart.js

@Component({
  selector: 'app-object-detector',
  templateUrl: './object-detector.component.html',
  styleUrls: ['./object-detector.component.css']
})
export class ObjectDetectorComponent implements OnInit {

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;  // Reference to the canvas element
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;  // Reference to Chart.js canvas
  detectedObject: string = '';
  model!: cocoSsd.ObjectDetection;
  detectedObjects: string[] = []; // List of all detected objects
  objectCount: { [key: string]: number } = {}; // Count of each object type
  totalObjectsDetected: number = 0; // Total number of objects detected
  chart: any;  // To hold the Chart.js instance
  isSpeaking = false; // To track if the system is currently speaking

  async ngOnInit() {
    await tf.setBackend('webgl');
    await tf.ready();

    this.model = await cocoSsd.load();
    console.log('COCO SSD Model loaded.');
    this.startWebcam();
    this.createChart();  // Create the chart on initialization
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

        // Update object count and statistics
        this.updateObjectStats(detectedClass);

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

    // Clear previous drawings
    ctx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    const displayedWidth = video.clientWidth;
    const displayedHeight = video.clientHeight;

    // Calculate scale factors for drawing on the resized canvas
    const xScale = displayedWidth / videoWidth;
    const yScale = displayedHeight / videoHeight;

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;

      // Scale the bounding box coordinates
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

  // Update object statistics (count and graph data)
  updateObjectStats(objectClass: string) {
    // Update the total object count
    this.totalObjectsDetected++;

    // Update the count for the specific object type
    if (this.objectCount[objectClass]) {
      this.objectCount[objectClass]++;
    } else {
      this.objectCount[objectClass] = 1;
    }

    // Update the chart
    this.updateChart(objectClass);
  }

  // Create the Chart.js graph
  createChart() {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    if (!ctx) {
      console.error('Unable to get 2D context for chart');
      return;  // Stop if we can't get the 2D context
    }

    this.chart = new Chart(ctx, {
      type: 'bar',  // Chart type
      data: {
        labels: [],  // Empty at first, will be updated dynamically
        datasets: [{
          label: 'Object Counts',
          data: [],  // Empty at first
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Update the Chart.js graph
  updateChart(objectClass: string) {
    const chartIndex = this.chart.data.labels.indexOf(objectClass);

    if (chartIndex === -1) {
      // New object class, add to chart
      this.chart.data.labels.push(objectClass);
      this.chart.data.datasets[0].data.push(1);
    } else {
      // Existing object class, update count
      this.chart.data.datasets[0].data[chartIndex]++;
    }

    this.chart.update();  // Update the chart to reflect changes
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
