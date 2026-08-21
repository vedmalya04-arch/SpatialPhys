import { CVFeaturePoint, ReconstructedSurface } from '../../types';

export interface LiveDetectedPlane {
  id: string;
  type: 'table' | 'floor' | 'wall' | 'ramp';
  position: [number, number, number]; // [x, y, z] in meters
  dimensions: [number, number, number]; // [width, height, depth] in meters
  confidence: number; // 0 to 100%
  pointCount: number;
  isTracking: boolean;
  color: string;
  label: string;
}

export class SurfaceScanner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentPlane: LiveDetectedPlane | null = null;
  private isScanning: boolean = true;
  private lastAnalysisTime: number = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    
    // Default initial tracking plane
    this.currentPlane = {
      id: 'live-detected-table',
      type: 'table',
      position: [0, 0.78, -1.2],
      dimensions: [2.2, 0.08, 1.2],
      confidence: 94,
      pointCount: 180,
      isTracking: true,
      color: '#38bdf8',
      label: 'DETECTED TABLE PLANE'
    };
  }

  public setScanning(scanning: boolean): void {
    this.isScanning = scanning;
  }

  public getIsScanning(): boolean {
    return this.isScanning;
  }

  public getCurrentDetectedPlane(): LiveDetectedPlane | null {
    return this.currentPlane;
  }

  // Analyze live camera frame
  public processVideoFrame(
    video: HTMLVideoElement,
    targetWidth: number = 240,
    targetHeight: number = 180
  ): {
    detectedPlane: LiveDetectedPlane | null;
    pointCloud: CVFeaturePoint[];
    edgeCount: number;
  } {
    if (!this.isScanning || !video || video.readyState < 2) {
      return {
        detectedPlane: this.currentPlane,
        pointCloud: [],
        edgeCount: 0
      };
    }

    const now = performance.now();
    // Throttle heavy analysis to ~20-30 FPS for smooth 60fps rendering
    if (now - this.lastAnalysisTime < 33) {
      return {
        detectedPlane: this.currentPlane,
        pointCloud: [],
        edgeCount: 0
      };
    }
    this.lastAnalysisTime = now;

    this.canvas.width = targetWidth;
    this.canvas.height = targetHeight;
    this.ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    const imgData = this.ctx.getImageData(0, 0, targetWidth, targetHeight);
    const { data, width, height } = imgData;

    // Luminance buffer
    const gray = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    }

    // Sobel Edge & Horizontal Gradient Analysis
    let edgeCount = 0;
    const horizontalRowEdges = new Float32Array(height);
    const pointCloud: CVFeaturePoint[] = [];

    const step = 8;
    for (let y = step; y < height - step; y += step) {
      for (let x = step; x < width - step; x += step) {
        const idx = y * width + x;

        const gx =
          -1 * gray[idx - width - 1] + 1 * gray[idx - width + 1] +
          -2 * gray[idx - 1] + 2 * gray[idx + 1] +
          -1 * gray[idx + width - 1] + 1 * gray[idx + width + 1];

        const gy =
          -1 * gray[idx - width - 1] - 2 * gray[idx - width] - 1 * gray[idx - width + 1] +
           1 * gray[idx + width - 1] + 2 * gray[idx + width] + 1 * gray[idx + width + 1];

        const mag = Math.sqrt(gx * gx + gy * gy);
        if (mag > 60) {
          edgeCount++;
          horizontalRowEdges[y] += Math.abs(gy);

          // Project 2D point to 3D room coordinates
          const ndcX = (x / width) * 2 - 1;
          const estimatedZ = -0.9 - (1 - y / height) * 2.5;
          const estimatedX = ndcX * Math.abs(estimatedZ) * 0.9;
          const estimatedY = Math.max(0, (1 - y / height) * 1.6);

          if (pointCloud.length < 200) {
            pointCloud.push({
              x: Number(estimatedX.toFixed(3)),
              y: Number(estimatedY.toFixed(3)),
              z: Number(estimatedZ.toFixed(3)),
              confidence: Math.min(99, Math.round(75 + (mag / 255) * 24)),
              color: '#38bdf8'
            });
          }
        }
      }
    }

    // Find peak horizontal edge row for table plane
    let maxEdgeVal = 0;
    let peakY = Math.floor(height * 0.52);

    for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.75); y++) {
      if (horizontalRowEdges[y] > maxEdgeVal) {
        maxEdgeVal = horizontalRowEdges[y];
        peakY = y;
      }
    }

    // Calculate dynamic estimated table height
    const estimatedHeight = Number((0.68 + (1 - peakY / height) * 0.32).toFixed(2));
    const confidence = Math.min(99, Math.round(82 + (maxEdgeVal / 1500) * 16));

    this.currentPlane = {
      id: 'live-detected-table',
      type: 'table',
      position: [0, estimatedHeight, -1.2],
      dimensions: [2.2, 0.08, 1.2],
      confidence,
      pointCount: pointCloud.length,
      isTracking: true,
      color: '#38bdf8',
      label: `DETECTED TABLE SURFACE (y = ${estimatedHeight.toFixed(2)}m)`
    };

    return {
      detectedPlane: this.currentPlane,
      pointCloud,
      edgeCount
    };
  }

  // Convert live detected plane into a locked physical surface collider
  public lockSurface(
    customHeight?: number,
    friction: number = 0.25,
    restitution: number = 0.75
  ): ReconstructedSurface {
    const plane = this.currentPlane || {
      position: [0, 0.78, -1.2] as [number, number, number],
      dimensions: [2.2, 0.08, 1.2] as [number, number, number],
      confidence: 95
    };

    const posY = customHeight !== undefined ? customHeight : plane.position[1];

    return {
      id: `locked-surface-${Date.now()}`,
      name: `Real Table Surface (y = ${posY.toFixed(2)}m)`,
      type: 'table',
      position: [plane.position[0], posY, plane.position[2]],
      dimensions: [plane.dimensions[0], plane.dimensions[1], plane.dimensions[2]],
      materialType: 'wood',
      friction,
      restitution,
      color: '#38bdf8',
      isCollidable: true,
      confidence: plane.confidence,
      realWorldHeight: posY,
      label: `LOCKED REAL TABLE: y = ${posY.toFixed(2)}m | μ = ${friction} | e = ${restitution}`
    };
  }
}

export const surfaceScanner = new SurfaceScanner();
