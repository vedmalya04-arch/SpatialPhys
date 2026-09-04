import React from 'react';
import {
  ArrowLeft,
  Video,
  Box,
  FlaskConical,
  Trophy,
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { AppMode } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface StudioHeaderProps {
  onBackToOverview: () => void;
  isARLiveMode: boolean;
  onToggleARLiveMode: (active: boolean) => void;
  onOpenExperiments: () => void;
  onOpenChallenges: () => void;
  onOpenInspector: () => void;
  onResetSimulation: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showOverlays: boolean;
  onToggleOverlays: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  onBackToOverview,
  isARLiveMode,
  onToggleARLiveMode,
  onOpenExperiments,
  onOpenChallenges,
  onOpenInspector,
  onResetSimulation,
  isMuted,
  onToggleMute,
  showOverlays,
  onToggleOverlays
}) => {
  return (
    <header className="fixed top-3 left-4 right-4 z-50 rounded-2xl glass-panel px-4 py-2.5 flex items-center justify-between shadow-2xl border border-cyan-500/25 pointer-events-auto">
      {/* Left: Back to Home + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onBackToOverview();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400/40 font-mono text-xs uppercase tracking-wider transition-all duration-200 active:scale-95"
          title="Return to Customer Landing Page"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline font-bold">Overview</span>
        </button>

        <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono font-bold text-sm text-white tracking-wider hidden sm:inline">
            SpatialPhys<span className="text-cyan-400">X</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            STUDIO
          </span>
        </div>
      </div>

      {/* Center: Live Camera vs Pre-Scanned Fallback */}
      <div className="flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono">
        <button
          onClick={() => onToggleARLiveMode(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            isARLiveMode
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Use live webcam feed with real-time AR plane detection"
        >
          <Video className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Live Camera AR</span>
        </button>

        <button
          onClick={() => onToggleARLiveMode(false)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
            !isARLiveMode
              ? 'bg-slate-800 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Use pre-scanned 3D room mesh demo"
        >
          <Box className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Demo Room Fallback</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Overlays */}
        <button
          onClick={onToggleOverlays}
          className={`p-2 rounded-xl border text-xs font-mono transition-colors ${
            showOverlays
              ? 'bg-slate-900 border-slate-700 text-cyan-400'
              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={showOverlays ? 'Hide UI HUD Panels' : 'Show UI HUD Panels'}
        >
          {showOverlays ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Experiments */}
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onOpenExperiments();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-xs transition-colors"
          title="Experiments & Gravity Presets"
        >
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Experiments</span>
        </button>

        {/* Challenges */}
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onOpenChallenges();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-mono text-xs transition-colors"
          title="Physics Challenges & Quests"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Challenges</span>
        </button>

        {/* Inspector */}
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onOpenInspector();
          }}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title="Inspect Mesh Surfaces & Colliders"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          title={isMuted ? 'Unmute Physics Audio' : 'Mute Physics Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Reset Sim */}
        <button
          onClick={() => {
            soundEffects.playScanBeep();
            onResetSimulation();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold transition-all active:scale-95"
          title="Reset Simulation (Clear bodies)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
