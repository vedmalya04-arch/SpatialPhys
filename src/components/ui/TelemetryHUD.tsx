import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Gauge,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { SimulationTelemetry, PhysicsVectorState } from '../../types';

interface TelemetryHUDProps {
  telemetry: SimulationTelemetry | null;
  vectorState: PhysicsVectorState | null;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({ telemetry, vectorState }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!telemetry || !vectorState) return null;

  // Energy Percentages for stacked energy bar
  const totalE = Math.max(0.1, telemetry.totalEnergy);
  const ekPct = Math.min(100, Math.max(0, (telemetry.kineticEnergy / totalE) * 100));
  const epPct = Math.min(100, Math.max(0, (telemetry.potentialEnergy / totalE) * 100));

  return (
    <div className="absolute top-20 right-4 z-20 w-80 flex flex-col gap-2 p-3.5 glass-panel rounded-2xl border border-slate-700/60 shadow-2xl text-slate-100 font-mono-tech">
      {/* HUD Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sky-400 font-heading">
          <Activity className="w-4 h-4" />
          <span className="font-bold tracking-wider text-xs uppercase">REAL-TIME TELEMETRY</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-600/40">
            60 Hz
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Hero Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-1">
        {/* Speed */}
        <div className="flex flex-col p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Speed |v|</span>
          <span className="text-sm font-bold text-sky-400">{telemetry.speed.toFixed(2)}</span>
          <span className="text-[9px] text-slate-400">m/s</span>
        </div>

        {/* Height */}
        <div className="flex flex-col p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Altitude</span>
          <span className="text-sm font-bold text-emerald-400">{telemetry.height.toFixed(2)}</span>
          <span className="text-[9px] text-slate-400">meters</span>
        </div>

        {/* Accel */}
        <div className="flex flex-col p-2 rounded-lg bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase">Accel |a|</span>
          <span className="text-sm font-bold text-amber-400">
            {vectorState.acceleration.magnitude.toFixed(1)}
          </span>
          <span className="text-[9px] text-slate-400">m/s²</span>
        </div>
      </div>

      {/* Energy Conservation Stacked Bar */}
      <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
        <div className="flex justify-between text-[10px] text-slate-300">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Mechanical Energy (E)
          </span>
          <span className="font-bold text-sky-300">{telemetry.totalEnergy.toFixed(1)} J</span>
        </div>

        {/* Stacked Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
          <div
            style={{ width: `${ekPct}%` }}
            className="h-full bg-amber-400 transition-all duration-75"
            title={`Kinetic Energy: ${telemetry.kineticEnergy} J`}
          />
          <div
            style={{ width: `${epPct}%` }}
            className="h-full bg-emerald-400 transition-all duration-75"
            title={`Potential Energy: ${telemetry.potentialEnergy} J`}
          />
        </div>

        <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
          <span className="text-amber-300 font-medium">Ek: {telemetry.kineticEnergy.toFixed(1)} J</span>
          <span className="text-emerald-300 font-medium">Ep: {telemetry.potentialEnergy.toFixed(1)} J</span>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Surface Contact State */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Surface State:
            </span>
            <span
              className={`font-semibold ${
                vectorState.isOnGround ? 'text-emerald-300' : 'text-sky-300'
              }`}
            >
              {vectorState.isOnGround
                ? vectorState.activeContactSurfaceName || 'Surface Contact'
                : 'Free Flight (In Air)'}
            </span>
          </div>

          {/* 3D Vector Decomposition */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px]">
            <span className="text-slate-400 uppercase font-bold text-[9px]">
              Instantaneous Vector Coordinates
            </span>
            <div className="flex justify-between text-sky-300">
              <span>Velocity (v):</span>
              <span>
                [{vectorState.velocity.x.toFixed(2)}, {vectorState.velocity.y.toFixed(2)},{' '}
                {vectorState.velocity.z.toFixed(2)}]
              </span>
            </div>
            <div className="flex justify-between text-amber-300">
              <span>Accel (a):</span>
              <span>
                [{vectorState.acceleration.x.toFixed(1)}, {vectorState.acceleration.y.toFixed(1)},{' '}
                {vectorState.acceleration.z.toFixed(1)}]
              </span>
            </div>
            <div className="flex justify-between text-yellow-300">
              <span>Net Force (F):</span>
              <span>
                [{vectorState.resultantForce.x.toFixed(1)}, {vectorState.resultantForce.y.toFixed(1)},{' '}
                {vectorState.resultantForce.z.toFixed(1)}] N
              </span>
            </div>
          </div>

          {/* Cumulative Stats */}
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <div>
              <span>Peak Alt: </span>
              <strong className="text-slate-200">{telemetry.maxHeightAchieved.toFixed(2)}m</strong>
            </div>
            <div>
              <span>Max Speed: </span>
              <strong className="text-slate-200">{telemetry.maxSpeedAchieved.toFixed(2)}m/s</strong>
            </div>
            <div>
              <span>Bounces: </span>
              <strong className="text-slate-200">{telemetry.bounceCount}</strong>
            </div>
            <div>
              <span>Distance: </span>
              <strong className="text-slate-200">{telemetry.distanceTraveled.toFixed(1)}m</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
