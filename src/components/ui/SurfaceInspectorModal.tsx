import React from 'react';
import {
  Layers,
  Sliders,
  CheckCircle2,
  X,
  Info
} from 'lucide-react';
import { ReconstructedSurface } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface SurfaceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  surfaces: ReconstructedSurface[];
  onUpdateSurface: (id: string, updates: Partial<ReconstructedSurface>) => void;
}

export const SurfaceInspectorModal: React.FC<SurfaceInspectorModalProps> = ({
  isOpen,
  onClose,
  surfaces,
  onUpdateSurface
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading tracking-wide flex items-center gap-2">
                RECONSTRUCTED SURFACES INSPECTOR
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Review and customize physical properties (μ friction, e restitution) of detected room geometry.
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-600/30 flex items-center gap-2 text-xs text-sky-200">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              These surfaces were extracted from the 3D computer vision spatial mesh. Physics colliders are dynamically generated from their bounding boxes.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surfaces.map((surface) => (
              <div
                key={surface.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        surface.type === 'table'
                          ? 'bg-sky-400'
                          : surface.type === 'floor'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-white font-heading">{surface.name}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono-tech">
                    {surface.confidence}% CONF
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono-tech grid grid-cols-2 gap-1.5">
                  <div>
                    Height: <strong className="text-slate-200">{surface.realWorldHeight.toFixed(2)}m</strong>
                  </div>
                  <div>
                    Type: <strong className="text-slate-200 uppercase">{surface.type}</strong>
                  </div>
                  <div className="col-span-2">
                    Dimensions: [{surface.dimensions.join(' × ')}m]
                  </div>
                </div>

                {/* Friction Slider */}
                <div className="flex flex-col gap-1 pt-2 border-t border-slate-800/80">
                  <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
                    <span>Friction (μ)</span>
                    <span className="text-sky-300">{surface.friction.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={surface.friction}
                    onChange={(e) => {
                      onUpdateSurface(surface.id, { friction: parseFloat(e.target.value) });
                    }}
                  />
                </div>

                {/* Restitution Slider */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px] font-mono-tech text-slate-400">
                    <span>Restitution (e)</span>
                    <span className="text-emerald-300">{surface.restitution.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.95"
                    step="0.05"
                    value={surface.restitution}
                    onChange={(e) => {
                      onUpdateSurface(surface.id, { restitution: parseFloat(e.target.value) });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
