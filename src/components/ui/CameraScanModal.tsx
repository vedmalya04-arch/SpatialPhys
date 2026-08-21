import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Layers,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Maximize2
} from 'lucide-react';
import { cameraManager } from '../../services/vision/CameraManager';
import { featureDetector, CVFrameAnalysis } from '../../services/vision/FeatureDetector';
import { PRESET_ROOMS } from '../../services/vision/SampleRooms';
import { EnvironmentScanResult } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: EnvironmentScanResult) => void;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onScanComplete
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(true);
  const [analysis, setAnalysis] = useState<CVFrameAnalysis | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string>('study_desk');

  // Start Camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      cameraManager.stopCamera();
      setIsStreaming(false);
      return;
    }

    let isMounted = true;

    const initCamera = async () => {
      if (!videoRef.current) return;
      const res = await cameraManager.startCamera(videoRef.current, 'environment');
      if (isMounted) {
        if (res.success) {
          setIsStreaming(true);
          setCameraError(null);
        } else {
          setIsStreaming(false);
          setCameraError(res.error || 'Camera could not be accessed.');
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      cameraManager.stopCamera();
    };
  }, [isOpen]);

  // Live CV Analysis Loop
  useEffect(() => {
    if (!isOpen || !isStreaming || !videoRef.current || !canvasRef.current) return;

    let frameId: number;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const processLoop = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        // Run Feature Detector on current frame
        const result = featureDetector.analyzeFrame(video, 320, 240);
        setAnalysis(result);

        // Draw edge highlights on overlay canvas
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw detected 3D feature keypoints on canvas
        const scaleX = canvas.width / 320;
        const scaleY = canvas.height / 240;

        ctx.lineWidth = 1.5;
        result.pointCloud.forEach((pt) => {
          // Map back to 2D screen coordinate for visual feedback
          const sx = ((pt.x / Math.abs(pt.z) / 0.9 + 1) / 2) * canvas.width;
          const sy = (1 - pt.y / 1.8) * canvas.height;

          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw detected plane horizontal lines
        result.detectedPlanes.forEach((plane) => {
          const py = plane.yNorm * canvas.height;
          ctx.strokeStyle = plane.type === 'table' ? '#38bdf8' : '#34d399';
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.moveTo(0, py);
          ctx.lineTo(canvas.width, py);
          ctx.stroke();

          ctx.fillStyle = plane.type === 'table' ? '#38bdf8' : '#34d399';
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          ctx.fillText(
            `DETECTED ${plane.type.toUpperCase()} (Height: ${plane.estimatedHeight}m, Conf: ${plane.confidence}%)`,
            20,
            py - 8
          );
        });

        ctx.setLineDash([]);
      }

      frameId = requestAnimationFrame(processLoop);
    };

    frameId = requestAnimationFrame(processLoop);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isOpen, isStreaming]);

  // Handle Capture & Reconstruct
  const handleCaptureAndReconstruct = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    soundEffects.playScanBeep();

    // Take snapshot
    const snapshotUrl = cameraManager.captureSnapshot(videoRef.current);
    const frameAnalysis =
      analysis || featureDetector.analyzeFrame(videoRef.current, 320, 240);

    // Build 3D Reconstruction
    setTimeout(() => {
      const reconstructedRoom = featureDetector.reconstructFromAnalysis(
        frameAnalysis,
        'Live Reconstructed Room',
        'webcam',
        snapshotUrl || undefined
      );

      setIsProcessing(false);
      onScanComplete(reconstructedRoom);
      onClose();
    }, 600);
  };

  // Handle Image Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const frameAnalysis = featureDetector.analyzeFrame(img, 320, 240);
        const reconstructedRoom = featureDetector.reconstructFromAnalysis(
          frameAnalysis,
          `Uploaded Room (${file.name})`,
          'photo_upload',
          event.target?.result as string
        );
        setIsProcessing(false);
        onScanComplete(reconstructedRoom);
        onClose();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Fallback Demo Preset Selection
  const handleLoadDemoPreset = (presetKey: string) => {
    soundEffects.playScanBeep();
    const preset = PRESET_ROOMS[presetKey] || PRESET_ROOMS.study_desk;
    onScanComplete(preset);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading tracking-wide flex items-center gap-2">
                REAL-WORLD ENVIRONMENT CAPTURE
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-600/40">
                  CV SPATIAL MAPPING
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Point camera at your desk/floor. Computer vision detects surfaces & creates 3D colliders.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Viewport (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
              {/* Video Stream */}
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className={`w-full h-full object-cover ${isStreaming ? 'block' : 'hidden'}`}
              />

              {/* Real-time Feature Overlay Canvas */}
              <canvas
                ref={canvasRef}
                className={`absolute inset-0 w-full h-full pointer-events-none ${
                  isStreaming ? 'block' : 'hidden'
                }`}
              />

              {/* Laser Scan Sweep Animation */}
              {isStreaming && isScanningActive && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-1 bg-gradient-to-r from-sky-400/0 via-sky-400 to-sky-400/0 shadow-[0_0_15px_#38bdf8] animate-laser absolute" />
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-sky-500/40 text-[11px] font-mono-tech text-sky-300">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE CV SPATIAL SCAN
                  </div>
                </div>
              )}

              {/* Camera Error / No Camera Fallback State */}
              {!isStreaming && (
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-md">
                  <div className="p-3 rounded-full bg-amber-500/20 text-amber-400 mb-3 border border-amber-500/30">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 font-heading">
                    Live Camera Unavailable / Denied
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    {cameraError ||
                      'Camera permission was not granted or is unsupported. You can upload an image or use the preconfigured reconstructed Demo Room.'}
                  </p>
                  <button
                    onClick={() => handleLoadDemoPreset(selectedPresetKey)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono-tech shadow-lg"
                  >
                    Use Demo Reconstructed Room
                  </button>
                </div>
              )}
            </div>

            {/* Live CV Telemetry Bar */}
            {isStreaming && analysis && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono-tech">
                <div className="flex items-center gap-4">
                  <span className="text-slate-400">
                    Keypoints:{' '}
                    <strong className="text-sky-400">{analysis.pointCloud.length}</strong>
                  </span>
                  <span className="text-slate-400">
                    Edges: <strong className="text-emerald-400">{analysis.edgeCount}</strong>
                  </span>
                  <span className="text-slate-400">
                    Planes: <strong className="text-amber-400">{analysis.detectedPlanes.length}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Geometry Ready</span>
                </div>
              </div>
            )}

            {/* Capture Button */}
            {isStreaming && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCaptureAndReconstruct}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 border border-sky-400/40 transition-all font-heading tracking-wider"
                >
                  <Sparkles className="w-4 h-4" />
                  {isProcessing ? 'BUILDING 3D COLLIDERS...' : 'RECONSTRUCT & ENTER PHYSICS LAB'}
                </button>
                <button
                  onClick={() => cameraManager.toggleCamera(videoRef.current!)}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Switch Camera (Front/Back)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Sidebar / Upload & Preset Options (1 Col) */}
          <div className="flex flex-col gap-4">
            {/* Upload Section */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-tech flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                Upload Room Photo / Frame
              </h3>
              <p className="text-[11px] text-slate-400">
                Upload a photo of your desk or room. The CV detector will extract surfaces and physics geometry.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/80 flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                Select Image File
              </button>
            </div>

            {/* Clearly Labelled Fallback / Demo Environments */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono-tech flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Pre-Scanned Demo Rooms
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/30">
                  RELIABLE FALLBACK
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Pre-calibrated 3D environments ready for live physics demonstration:
              </p>

              <div className="flex flex-col gap-2">
                {Object.entries(PRESET_ROOMS).map(([key, room]) => (
                  <button
                    key={key}
                    onClick={() => handleLoadDemoPreset(key)}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-left transition-all hover:border-sky-500/50 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 font-heading">
                        {room.roomName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-tech">
                      <span>{room.surfaces.length} Surfaces</span>
                      <span>•</span>
                      <span>{room.pointCloud.length} Pts</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
