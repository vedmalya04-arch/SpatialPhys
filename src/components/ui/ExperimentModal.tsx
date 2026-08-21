import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  X,
  RotateCcw
} from 'lucide-react';
import { PHYSICS_EXPERIMENTS } from '../../services/physics/ExperimentsData';
import { PhysicsExperiment, GravityPresetName } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface ExperimentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyExperiment: (experiment: PhysicsExperiment) => void;
}

export const ExperimentModal: React.FC<ExperimentModalProps> = ({
  isOpen,
  onClose,
  onApplyExperiment
}) => {
  const [selectedExpId, setSelectedExpId] = useState<string>(PHYSICS_EXPERIMENTS[0].id);

  if (!isOpen) return null;

  const currentExp =
    PHYSICS_EXPERIMENTS.find((e) => e.id === selectedExpId) || PHYSICS_EXPERIMENTS[0];

  const handleRun = (exp: PhysicsExperiment) => {
    soundEffects.playScanBeep();
    onApplyExperiment(exp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading tracking-wide flex items-center gap-2">
                GUIDED PHYSICS EXPERIMENTS
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Select a scientific concept to automatically configure the real-world lab.
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

        {/* Modal Body: Left List, Right Details */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Experiment List (1 Col) */}
          <div className="flex flex-col gap-2">
            {PHYSICS_EXPERIMENTS.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExpId(exp.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedExpId === exp.id
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-md'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold font-heading mb-0.5">{exp.title}</div>
                <div className="text-[11px] text-slate-400 font-mono-tech line-clamp-2">
                  {exp.subtitle}
                </div>
              </button>
            ))}
          </div>

          {/* Experiment Detail (2 Cols) */}
          <div className="lg:col-span-2 flex flex-col justify-between gap-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[10px] px-2 py-0.5 font-mono-tech rounded bg-sky-950 text-sky-400 border border-sky-700/40 uppercase">
                  Experiment Setup
                </span>
                <h3 className="text-lg font-bold text-white font-heading mt-1">
                  {currentExp.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {currentExp.description}
                </p>
              </div>

              {/* Scientific Formulas Card */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono-tech uppercase">
                  <BookOpen className="w-3.5 h-3.5" />
                  Relevant Governing Equations
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentExp.formulas.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-950/70 border border-slate-800/80 flex flex-col"
                    >
                      <span className="text-[10px] text-slate-400 font-mono-tech">{f.label}</span>
                      <span className="text-xs font-bold font-mono-tech text-sky-300 my-0.5">
                        {f.formula}
                      </span>
                      <span className="text-[9px] text-slate-500">{f.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objective & Expected Outcome */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono-tech">
                    Objective
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{currentExp.objective}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 font-mono-tech">
                    Expected Outcome
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{currentExp.expectedOutcome}</p>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={() => handleRun(currentExp)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs font-heading tracking-wider shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              CONFIGURE & RUN EXPERIMENT IN 3D LAB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
