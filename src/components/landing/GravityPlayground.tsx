import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface GravityPlaygroundProps {
  onLaunchStudio: () => void;
}

export const GravityPlayground: React.FC<GravityPlaygroundProps> = ({ onLaunchStudio }) => {
  const [gravity, setGravity] = useState<number>(9.81);
  const [mass, setMass] = useState<number>(1.5);
  const [restitution, setRestitution] = useState<number>(0.75);
  const [dropHeight, setDropHeight] = useState<number>(2.0);

  // Physics calculations for drop & bounce
  const impactVelocity = Math.sqrt(2 * gravity * dropHeight);
  const potentialEnergy = mass * gravity * dropHeight;
  const bounceHeight = dropHeight * Math.pow(restitution, 2);
  const reboundVelocity = impactVelocity * restitution;
  const energyLossPerBounce = (1 - Math.pow(restitution, 2)) * 100;

  // Preset selector
  const presets = [
    { name: 'Earth', g: 9.81, desc: '1.0G standard environment' },
    { name: 'Moon', g: 1.62, desc: 'High float, low damping' },
    { name: 'Mars', g: 3.71, desc: '38% Earth gravity' },
    { name: 'Jupiter', g: 24.79, desc: 'Extreme acceleration' },
    { name: 'Zero-G Lab', g: 0.2, desc: 'Orbital microgravity' }
  ];

  return (
    <section id="playground" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-cyan-500/10 bg-slate-950/60">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Simulator Core</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Test The <span className="text-gradient-cyan">Celestial Dynamics</span> Engine
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
            Experiment with gravity presets, coefficient of restitution (e), and object mass. Compare theoretical mechanics against our rigid-body integration model before entering the live 3D space.
          </p>
        </div>

        {/* Playground Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 glass-panel-card p-6 rounded-2xl space-y-6">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Dynamics Configuration</span>
            </h3>

            {/* Presets */}
            <div className="space-y-2">
              <label className="block font-mono text-xs text-slate-400 uppercase">
                Planetary Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setGravity(p.g)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      Math.abs(gravity - p.g) < 0.1
                        ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="font-mono text-xs">{p.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{p.g} m/s²</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Gravity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400 uppercase">Gravity (g)</span>
                <span className="text-cyan-400 font-bold">{gravity.toFixed(2)} m/s²</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="30"
                step="0.1"
                value={gravity}
                onChange={(e) => setGravity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Drop Height */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400 uppercase">Release Altitude (h)</span>
                <span className="text-cyan-400 font-bold">{dropHeight.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={dropHeight}
                onChange={(e) => setDropHeight(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Restitution (Bounciness) */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400 uppercase">Restitution Coefficient (e)</span>
                <span className="text-emerald-400 font-bold">{restitution.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.95"
                step="0.05"
                value={restitution}
                onChange={(e) => setRestitution(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="font-mono text-[10px] text-slate-500">
                0.0 = completely inelastic clay, 0.95 = superball rubber
              </p>
            </div>

            {/* Mass */}
            <div className="space-y-2">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400 uppercase">Object Mass (m)</span>
                <span className="text-cyan-400 font-bold">{mass.toFixed(1)} kg</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="10"
                step="0.2"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Results & Simulation Visualizer Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visualizer Simulation Card */}
            <div className="glass-panel-card p-6 rounded-2xl border border-cyan-500/25">
              <div className="flex items-center justify-between pb-4 border-b border-cyan-500/15">
                <div className="font-mono text-xs font-bold uppercase text-cyan-300">
                  Calculated Collision Dynamics
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  CONSERVATION OF MOMENTUM
                </span>
              </div>

              {/* Graphical Bounce Heights Bar Diagram */}
              <div className="py-6">
                <div className="flex items-end justify-around h-44 px-4 bg-slate-950/80 rounded-xl border border-slate-800/80 pt-6">
                  {/* Release */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-mono text-[10px] text-slate-400">{dropHeight.toFixed(1)}m</span>
                    <div
                      className="w-10 rounded-t bg-cyan-500/80 transition-all duration-300 shadow-[0_0_12px_#06b6d4]"
                      style={{ height: `${Math.min(100, (dropHeight / 5.0) * 100)}%` }}
                    />
                    <span className="font-mono text-[10px] text-cyan-300">Release</span>
                  </div>

                  {/* Bounce 1 */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-mono text-[10px] text-slate-400">{bounceHeight.toFixed(2)}m</span>
                    <div
                      className="w-10 rounded-t bg-teal-400/80 transition-all duration-300 shadow-[0_0_10px_#2dd4bf]"
                      style={{ height: `${Math.min(100, (bounceHeight / 5.0) * 100)}%` }}
                    />
                    <span className="font-mono text-[10px] text-teal-300">1st Bounce</span>
                  </div>

                  {/* Bounce 2 */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-mono text-[10px] text-slate-400">
                      {(bounceHeight * Math.pow(restitution, 2)).toFixed(2)}m
                    </span>
                    <div
                      className="w-10 rounded-t bg-emerald-400/80 transition-all duration-300"
                      style={{ height: `${Math.min(100, ((bounceHeight * Math.pow(restitution, 2)) / 5.0) * 100)}%` }}
                    />
                    <span className="font-mono text-[10px] text-emerald-300">2nd Bounce</span>
                  </div>

                  {/* Bounce 3 */}
                  <div className="flex flex-col items-center gap-2 h-full justify-end">
                    <span className="font-mono text-[10px] text-slate-400">
                      {(bounceHeight * Math.pow(restitution, 4)).toFixed(2)}m
                    </span>
                    <div
                      className="w-10 rounded-t bg-slate-600 transition-all duration-300"
                      style={{ height: `${Math.min(100, ((bounceHeight * Math.pow(restitution, 4)) / 5.0) * 100)}%` }}
                    />
                    <span className="font-mono text-[10px] text-slate-400">3rd Bounce</span>
                  </div>
                </div>
              </div>

              {/* Data Readout Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Impact Velocity</span>
                  <span className="text-sm font-bold text-cyan-300">{impactVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Rebound Velocity</span>
                  <span className="text-sm font-bold text-emerald-400">{reboundVelocity.toFixed(2)} m/s</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Potential Energy</span>
                  <span className="text-sm font-bold text-amber-300">{potentialEnergy.toFixed(1)} J</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Energy Dissipated</span>
                  <span className="text-sm font-bold text-rose-400">{energyLossPerBounce.toFixed(0)}%</span>
                </div>
              </div>

              {/* Direct Studio Transition */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-300 font-mono">
                  Experience this with your physical desk in live AR.
                </div>
                <button
                  onClick={onLaunchStudio}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Launch In 3D AR Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
