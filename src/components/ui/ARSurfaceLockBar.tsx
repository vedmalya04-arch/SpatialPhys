import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Layers,
  Sparkles,
  CheckCircle2,
  Sliders,
  Zap,
  RotateCcw
} from 'lucide-react';
import { LiveDetectedPlane } from '../../services/vision/SurfaceScanner';
import { soundEffects } from '../../services/audio/SoundEffects';

interface ARSurfaceLockBarProps {
  detectedPlane: LiveDetectedPlane | null;
  isLocked: boolean;
  onLockSurface: (height: number) => void;
  onUnlockSurface: () => void;
  onDropHeroBall: () => void;
}

export const ARSurfaceLockBar: React.FC<ARSurfaceLockBarProps> = ({
  detectedPlane,
  isLocked,
  onLockSurface,
  onUnlockSurface,
  onDropHeroBall
}) => {
  const [manualHeight, setManualHeight] = useState<number>(
    detectedPlane ? detectedPlane.position[1] : 0.78
  );

  const handleLock = () => {
    soundEffects.playScanBeep();
    onLockSurface(manualHeight);
  };

  const handleUnlock = () => {
    soundEffects.playScanBeep();
    onUnlockSurface();
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center gap-3 px-5 py-3 glass-panel-glow rounded-2xl border border-emerald-500/40 shadow-2xl font-mono-tech text-xs pointer-events-auto">
      {/* Tracking State Indicator */}
      <div className="flex items-center gap-2 pr-3 border-r border-slate-700/80">
        <span
          className={`w-3 h-3 rounded-full ${
            isLocked
              ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
              : 'bg-sky-400 animate-ping shadow-[0_0_10px_#38bdf8]'
          }`}
        />
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            {isLocked ? 'RIGID-BODY COLLIDER LOCKED' : 'LIVE CV SURFACE ESTIMATION'}
          </span>
          <span className="text-xs font-bold text-white">
            {isLocked ? (
              <span className="text-emerald-300">
                REAL DESK COLLIDER (Y = {manualHeight.toFixed(2)}m)
              </span>
            ) : (
              <span className="text-sky-300">
                TRACKING REAL DESK ({detectedPlane?.confidence || 95}% CONF)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Surface Elevation / Depth Calibration Slider */}
      <div className="flex items-center gap-2 px-2 bg-slate-950/60 py-1.5 px-3 rounded-xl border border-slate-800">
        <Sliders className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] text-slate-300">Desk Height:</span>
        <input
          type="range"
          min="0.1"
          max="1.8"
          step="0.02"
          value={manualHeight}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setManualHeight(val);
            if (isLocked) {
              onLockSurface(val);
            }
          }}
          className="w-28 accent-emerald-400"
          title="Surface Elevation / Depth Calibration"
        />
        <span className="text-xs font-bold text-emerald-400 font-mono-tech min-w-[42px]">
          {manualHeight.toFixed(2)}m
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {!isLocked ? (
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs font-heading tracking-wider shadow-lg shadow-emerald-500/25 border border-emerald-400/40 transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            LOCK SURFACE & ATTACH COLLIDER
          </button>
        ) : (
          <>
            <button
              onClick={handleUnlock}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-heading text-xs"
              title="Unlock to recalibrate surface"
            >
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              RE-CALIBRATE
            </button>

            <button
              onClick={() => {
                soundEffects.playLaunch(5);
                onDropHeroBall();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs font-heading tracking-wider shadow-lg shadow-sky-500/25 border border-sky-400/40"
            >
              <Zap className="w-3.5 h-3.5" />
              DROP BALL ONTO REAL DESK
            </button>
          </>
        )}
      </div>
    </div>
  );
};
