import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class HandTracker {
  constructor() {
    this.video = null;
    this.handLandmarker = null;
    this.lastVideoTime = -1;
    this.results = null;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      },
      runningMode: 'VIDEO',
      numHands: 1,
    });

    this.video = document.createElement('video');
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.style.position = 'fixed';
    this.video.style.right = '16px';
    this.video.style.bottom = '16px';
    this.video.style.width = '240px';
    this.video.style.border = '2px solid white';
    this.video.style.borderRadius = '12px';
    this.video.style.zIndex = '10';
    this.video.style.transform = 'scaleX(-1)';
    document.body.appendChild(this.video);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => resolve();
    });
  }

  detect() {
    if (!this.video || !this.handLandmarker) return null;

    if (this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      this.results = this.handLandmarker.detectForVideo(
        this.video,
        performance.now()
      );
    }

    return this.results;
  }

  getIndexFingerTip() {
    if (!this.results || !this.results.landmarks || this.results.landmarks.length === 0) {
      return null;
    }

    const landmarks = this.results.landmarks[0];
    return landmarks[8];
  }
}