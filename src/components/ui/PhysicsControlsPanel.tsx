import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  Send,
  Eye,
  Layers,
  CircleDot,
  Box,
  Cylinder,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  GravityPresetName,
  PhysicsObjectConfig,
  VectorOverlayOptions,
  TrajectoryTheoretical,
  PhysicsShapeType
} from '../../types';
import { GRAVITY_PRESETS } from '../../services/physics/ExperimentsData';
import { soundEffects } from '../../services/audio/SoundEffects';

interface PhysicsControlsPanelProps {
  currentGravity: number;
  selectedGravityPreset: GravityPresetName;
  onSelectGravityPreset: (preset: GravityPresetName, value: number) => void;
  heroConfig: PhysicsObjectConfig;
  onUpdateHeroConfig: (config: Partial<PhysicsObjectConfig>) => void;
  vectorOptions: VectorOverlayOptions;
  onUpdateVectorOptions: (options: Partial<VectorOverlayOptions>) => void;
  onLaunchProjectile: (velocity: number, angleDeg: number, yawDeg: number) => void;
  onDropObject: (position: [number, number, number]) => void;
  theoreticalTrajectory: TrajectoryTheoretical | null;
  onReset: () => void;
}

export const PhysicsControlsPanel: React.FC<PhysicsControlsPanelProps> = ({
  currentGravity,
  selectedGravityPreset,
  onSelectGravityPreset,
  heroConfig,
  onUpdateHeroConfig,
  vectorOptions,
  onUpdateVectorOptions,
  onLaunchProjectile,
  onDropObject,
  theoreticalTrajectory,
  onReset
}) => {
  // Projectile state
  const [launchSpeed, setLaunchSpeed] = useState<number>(7.5);
  const [launchAngle, setLaunchAngle] = useState<number>(45);
  const [launchYaw, setLaunchYaw] = useState<number>(0);

  // Accordion Sections
  const [openSection, setOpenSection] = useState<'gravity' | 'object' | 'projectile' | 'vectors'>('gravity');

  return (
    <div className="absolute top-20 left-4 z-20 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col gap-3 p-3.5 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl text-slate-100">
      {/* 1. GRAVITY PRESETS & CONTROLS */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'gravity' ? 'gravity' : 'gravity')}
          className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 border-b border-slate-800/80 text-xs font-bold font-mono-tech tracking-wider uppercase"
        >
          <div className="flex items-center gap-2 text-sky-400">
            <Globe className="w-4 h-4" />
            <span>GRAVITATIONAL FIELD (g)</span>
          </div>
          <span className="text-sky-300 font-mono-tech">{currentGravity.toFixed(2)} m/s²</span>
        </button>

        <div className="p-3 flex flex-col gap-2.5">
          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {GRAVITY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  soundEffects.playScanBeep();
                  onSelectGravityPreset(preset.id, preset.value);
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono-tech flex flex-col items-center justify-center border transition-all ${
                  selectedGravityPreset === preset.id
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="font-bold">{preset.name}</span>
                <span className="text-[10px] text-slate-400">{preset.value}</span>
              </button>
            ))}
          </div>

          {/* Slider for exact gravity */}
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Gravity Acceleration</span>
              <span>{currentGravity.toFixed(2)} m/s²</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="0.1"
              value={currentGravity}
              onChange={(e) => onSelectGravityPreset('custom', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 2. HERO OBJECT PROPERTIES & SHAPE */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'object' ? 'gravity' : 'object')}
          className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 border-b border-slate-800/80 text-xs font-bold font-mono-tech tracking-wider uppercase"
        >
          <div className="flex items-center gap-2 text-emerald-400">
            <Layers className="w-4 h-4" />
            <span>PHYSICS OBJECT</span>
          </div>
          <span className="text-emerald-300 font-mono-tech uppercase">{heroConfig.type}</span>
        </button>

        <div className="p-3 flex flex-col gap-3">
          {/* Object Shape Selector */}
          <div className="grid grid-cols-3 gap-1.5">
            {(['sphere', 'box', 'cylinder'] as PhysicsShapeType[]).map((shape) => (
              <button
                key={shape}
                onClick={() => {
                  soundEffects.playScanBeep();
                  onUpdateHeroConfig({ type: shape });
                }}
                className={`px-2 py-1.5 rounded-lg text-xs font-mono-tech flex items-center justify-center gap-1.5 border capitalize transition-all ${
                  heroConfig.type === shape
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {shape === 'sphere' && <CircleDot className="w-3.5 h-3.5" />}
                {shape === 'box' && <Box className="w-3.5 h-3.5" />}
                {shape === 'cylinder' && <Cylinder className="w-3.5 h-3.5" />}
                <span>{shape}</span>
              </button>
            ))}
          </div>

          {/* Mass Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Mass (m)</span>
              <span className="text-emerald-300">{heroConfig.mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="15.0"
              step="0.1"
              value={heroConfig.mass}
              onChange={(e) => onUpdateHeroConfig({ mass: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Restitution (Bounciness) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Restitution / Bounciness (e)</span>
              <span className="text-emerald-300">{heroConfig.restitution.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.95"
              step="0.05"
              value={heroConfig.restitution}
              onChange={(e) => onUpdateHeroConfig({ restitution: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Friction */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Friction Coefficient (μ)</span>
              <span className="text-emerald-300">{heroConfig.friction.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.9"
              step="0.02"
              value={heroConfig.friction}
              onChange={(e) => onUpdateHeroConfig({ friction: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Quick Drop Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
            <button
              onClick={() => onDropObject([0, 2.2, -1.2])}
              className="py-1.5 px-2 text-xs font-mono-tech rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300"
            >
              Drop Above Table
            </button>
            <button
              onClick={() => onDropObject([0, 2.2, 0.5])}
              className="py-1.5 px-2 text-xs font-mono-tech rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300"
            >
              Drop on Floor
            </button>
          </div>
        </div>
      </div>

      {/* 3. PROJECTILE LAUNCHER & KINEMATICS */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'projectile' ? 'gravity' : 'projectile')}
          className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 border-b border-slate-800/80 text-xs font-bold font-mono-tech tracking-wider uppercase"
        >
          <div className="flex items-center gap-2 text-amber-400">
            <Send className="w-4 h-4" />
            <span>PROJECTILE LAUNCHER</span>
          </div>
          <span className="text-amber-300 font-mono-tech">{launchSpeed} m/s @ {launchAngle}°</span>
        </button>

        <div className="p-3 flex flex-col gap-3">
          {/* Launch Velocity Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Launch Velocity (v₀)</span>
              <span className="text-amber-300">{launchSpeed.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={launchSpeed}
              onChange={(e) => setLaunchSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Launch Angle Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
              <span>Launch Pitch Angle (θ)</span>
              <span className="text-amber-300">{launchAngle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={launchAngle}
              onChange={(e) => setLaunchAngle(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          {/* Theoretical Trajectory Summary Badge */}
          {theoreticalTrajectory && (
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] font-mono-tech text-amber-200 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Max Altitude (H):</span>
                <strong>{theoreticalTrajectory.maxHeight} m</strong>
              </div>
              <div className="flex justify-between">
                <span>Predicted Range (R):</span>
                <strong>{theoreticalTrajectory.range} m</strong>
              </div>
              <div className="flex justify-between">
                <span>Flight Time (T):</span>
                <strong>{theoreticalTrajectory.timeOfFlight} s</strong>
              </div>
            </div>
          )}

          {/* Launch Button */}
          <button
            onClick={() => onLaunchProjectile(launchSpeed, launchAngle, launchYaw)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs font-heading tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            FIRE PROJECTILE
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC 3D VECTORS & OVERLAYS */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setOpenSection(openSection === 'vectors' ? 'gravity' : 'vectors')}
          className="w-full flex items-center justify-between p-3 bg-slate-900/60 hover:bg-slate-900 border-b border-slate-800/80 text-xs font-bold font-mono-tech tracking-wider uppercase"
        >
          <div className="flex items-center gap-2 text-purple-400">
            <Eye className="w-4 h-4" />
            <span>3D VECTOR OVERLAYS</span>
          </div>
        </button>

        <div className="p-3 grid grid-cols-2 gap-2 text-xs font-mono-tech">
          {/* Velocity Vector (Cyan) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showVelocity}
              onChange={(e) => onUpdateVectorOptions({ showVelocity: e.target.checked })}
              className="accent-sky-400"
            />
            <span className="text-sky-400 font-bold">Velocity (v)</span>
          </label>

          {/* Acceleration Vector (Amber) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showAcceleration}
              onChange={(e) => onUpdateVectorOptions({ showAcceleration: e.target.checked })}
              className="accent-amber-400"
            />
            <span className="text-amber-400 font-bold">Accel (a)</span>
          </label>

          {/* Gravity Vector (Purple) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showGravity}
              onChange={(e) => onUpdateVectorOptions({ showGravity: e.target.checked })}
              className="accent-purple-400"
            />
            <span className="text-purple-400 font-bold">Gravity (Fg)</span>
          </label>

          {/* Normal Force (Emerald) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showNormalForce}
              onChange={(e) => onUpdateVectorOptions({ showNormalForce: e.target.checked })}
              className="accent-emerald-400"
            />
            <span className="text-emerald-400 font-bold">Normal (FN)</span>
          </label>

          {/* Friction Force (Crimson) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showFrictionForce}
              onChange={(e) => onUpdateVectorOptions({ showFrictionForce: e.target.checked })}
              className="accent-rose-400"
            />
            <span className="text-rose-400 font-bold">Friction (Ff)</span>
          </label>

          {/* Resultant Net Force (Yellow) */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={vectorOptions.showResultantForce}
              onChange={(e) => onUpdateVectorOptions({ showResultantForce: e.target.checked })}
              className="accent-yellow-400"
            />
            <span className="text-yellow-400 font-bold">Net (F_net)</span>
          </label>

          {/* Trajectory Arc */}
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer col-span-2 pt-1 border-t border-slate-800">
            <input
              type="checkbox"
              checked={vectorOptions.showTrajectory}
              onChange={(e) => onUpdateVectorOptions({ showTrajectory: e.target.checked })}
              className="accent-sky-400"
            />
            <span className="text-slate-200">Parabolic Arc</span>
          </label>
        </div>
      </div>
    </div>
  );
};
