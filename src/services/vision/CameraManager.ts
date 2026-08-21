// Camera Manager for WebRTC Stream & Keyframe Capture

export class CameraManager {
  private stream: MediaStream | null = null;
  private currentFacingMode: 'user' | 'environment' = 'environment';
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getFacingMode(): 'user' | 'environment' {
    return this.currentFacingMode;
  }

  // Start Camera Stream
  public async startCamera(
    videoElement: HTMLVideoElement,
    facingMode: 'user' | 'environment' = 'environment'
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported) {
      return {
        success: false,
        error: 'Camera access (getUserMedia) is not supported in this browser environment.'
      };
    }

    this.stopCamera();
    this.currentFacingMode = facingMode;

    try {
      // Constraints with graceful fallback
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to basic video constraint without facingMode if rejected
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      this.stream = mediaStream;
      videoElement.srcObject = mediaStream;
      await videoElement.play();

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown camera error';
      return {
        success: false,
        error: `Could not access camera: ${errorMsg}. You can still use uploaded photos or the Demo Reconstructed Room.`
      };
    }
  }

  // Toggle Front / Back Camera
  public async toggleCamera(
    videoElement: HTMLVideoElement
  ): Promise<{ success: boolean; error?: string }> {
    const nextFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
    return this.startCamera(videoElement, nextFacingMode);
  }

  // Capture Snapshot Data URL
  public captureSnapshot(videoElement: HTMLVideoElement): string | null {
    if (!videoElement || videoElement.videoWidth === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // Stop Camera & release all tracks
  public stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore track close error
        }
      });
      this.stream = null;
    }
  }
}

export const cameraManager = new CameraManager();
