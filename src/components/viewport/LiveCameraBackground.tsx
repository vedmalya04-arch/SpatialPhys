import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { surfaceScanner, LiveDetectedPlane } from '../../services/vision/SurfaceScanner';
import { CVFeaturePoint } from '../../types';

interface LiveCameraBackgroundProps {
  isLiveActive: boolean;
  onPlaneDetected: (
    plane: LiveDetectedPlane | null,
    points: CVFeaturePoint[],
    edgeCount: number
  ) => void;
  onCameraStatusChange?: (isStreaming: boolean, error: string | null) => void;
}

export const LiveCameraBackground: React.FC<LiveCameraBackgroundProps> = ({
  isLiveActive,
  onPlaneDetected,
  onCameraStatusChange
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Start / Stop Camera stream
  useEffect(() => {
    if (!isLiveActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setIsStreaming(false);
      onCameraStatusChange?.(false, null);
      return;
    }

    let isMounted = true;

    const startStream = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920, max: 1920 },
            height: { ideal: 1080, max: 1080 }
          },
          audio: false
        };

        let mediaStream: MediaStream;
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!isMounted) return;

        streamRef.current = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }

        setIsStreaming(true);
        setCameraError(null);
        onCameraStatusChange?.(true, null);
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Webcam permission denied';
        setIsStreaming(false);
        setCameraError(msg);
        onCameraStatusChange?.(false, msg);
      }
    };

    startStream();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isLiveActive, facingMode]);

  // Frame Processing Loop for Real-time Surface Detection
  useEffect(() => {
    if (!isLiveActive || !isStreaming || !videoRef.current) return;

    let frameId: number;
    const video = videoRef.current;

    const loop = () => {
      if (video.readyState >= 2) {
        const result = surfaceScanner.processVideoFrame(video, 240, 180);
        onPlaneDetected(result.detectedPlane, result.pointCloud, result.edgeCount);
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isLiveActive, isStreaming, onPlaneDetected]);

  if (!isLiveActive) return null;

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {/* Live Video Element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover brightness-90 contrast-105 ${
          isStreaming ? 'block' : 'hidden'
        }`}
      />

      {/* Cyberpunk Grid / Dark Fallback when camera is denied or loading */}
      {!isStreaming && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#090d16] via-[#07090e] to-[#040609] p-6 text-center">
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-3 shadow-lg shadow-sky-500/10 animate-pulse">
            <Camera className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-white font-heading tracking-wide mb-1">
            {cameraError ? 'Live Camera Denied / Unavailable' : 'Initializing Spatial Camera Stream...'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md font-mono-tech mb-4">
            {cameraError
              ? `${cameraError}. You can test physics in the 3D Reconstructed Demo Workspace or retry camera access.`
              : 'Streaming live real-world feed and computing spatial plane normals...'}
          </p>
        </div>
      )}

      {/* Sci-fi Scanline Overlay */}
      {isStreaming && (
        <div className="absolute inset-0 pointer-events-none opacity-25 scanline" />
      )}
    </div>
  );
};
