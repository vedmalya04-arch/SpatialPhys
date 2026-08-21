import React from 'react';
import {
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  Compass,
  Layers,
  FlaskConical,
  Trophy,
  Sparkles,
  Video,
  Box
} from 'lucide-react';
import { AppMode, EnvironmentScanResult } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  onOpenScan: () => void;
  onOpenInspector: () => void;
  onResetSimulation: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  scanResult: EnvironmentScanResult;
  cameraViewPreset: 'perspective' | 'top' | 'side' | 'follow';
  onChangeCameraView: (view: 'perspective' | 'top' | 'side' | 'follow') => void;
  isARLiveMode: boolean;
  onToggleARLiveMode: (active: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  onOpenScan,
  onOpenInspector,
  onResetSimulation,
  isMuted,
  onToggleMute,
  scanResult,
  cameraViewPreset,
  onChangeCameraView,
  isARLiveMode,
  onToggleARLiveMode
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-3 glass-panel border-b border-slate-800/80">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-sky-600 to-indigo-600 shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-wider text-white font-heading">
              SPATIAL<span className="text-emerald-400">PHYS</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-mono-tech uppercase font-bold tracking-widest rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              AR SPATIAL LAB
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-tech hidden sm:block">
            Real-World Camera-to-Mesh Physics in Real Time
          </p>
        </div>
      </div>

      {/* Primary Mode Switcher (Live Webcam AR vs Pre-Scanned Fallback) */}
      <div className="flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-700/80 shadow-inner font-mono-tech text-xs">
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onToggleARLiveMode(true);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            isARLiveMode
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Live Camera Stream + AR Real Desk Physics (Primary)"
        >
          <Video className="w-3.5 h-3.5" />
          <span>LIVE CAMERA AR</span>
        </button>

        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onToggleARLiveMode(false);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
            !isARLiveMode
              ? 'bg-slate-800 text-amber-300 border border-amber-500/40 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Pre-Scanned 3D Room Demo (Fallback)"
        >
          <Box className="w-3.5 h-3.5 text-amber-400" />
          <span>DEMO MODE: PRE-SCANNED ROOM FALLBACK</span>
        </button>
      </div>

      {/* Environment Status Badge */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs font-mono-tech">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            isARLiveMode
              ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400'
              : 'bg-amber-400 shadow-sm shadow-amber-400'
          }`}
        />
        <span className="text-slate-300">
          {isARLiveMode ? (
            <strong className="text-emerald-300">REAL ROOM CAMERA ACTIVE</strong>
          ) : (
            <strong className="text-amber-300">DEMO ROOM FALLBACK ACTIVE</strong>
          )}
        </span>
      </div>

      {/* Navigation & Mode Controls */}
      <div className="flex items-center gap-2">
        {/* Mode Tabs */}
        <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => onSelectMode('experiments')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              currentMode === 'experiments'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Experiments</span>
          </button>

          <button
            onClick={() => onSelectMode('challenges')}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              currentMode === 'challenges'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Challenges</span>
          </button>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/60 border border-slate-800"
          title={isMuted ? 'Unmute Physics Audio' : 'Mute Physics Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* RESET SIMULATION Button */}
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onResetSimulation();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm transition-all"
          title="Purge bodies & Reset Simulation (R)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET SIMULATION</span>
        </button>
      </div>
    </header>
  );
};
