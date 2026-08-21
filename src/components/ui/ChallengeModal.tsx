import React from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  X,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PHYSICS_CHALLENGES } from '../../services/physics/ChallengesData';
import { PhysicsChallenge } from '../../types';
import { soundEffects } from '../../services/audio/SoundEffects';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChallenge: PhysicsChallenge | null;
  onSelectChallenge: (challenge: PhysicsChallenge) => void;
  challengeStatus: {
    status: 'idle' | 'success' | 'failed';
    message: string;
    distanceError?: number;
  };
  onRetryChallenge: () => void;
}

export const ChallengeModal: React.FC<ChallengeModalProps> = ({
  isOpen,
  onClose,
  activeChallenge,
  onSelectChallenge,
  challengeStatus,
  onRetryChallenge
}) => {
  if (!isOpen) return null;

  const handleStart = (ch: PhysicsChallenge) => {
    soundEffects.playScanBeep();
    onSelectChallenge(ch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/70 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading tracking-wide flex items-center gap-2">
                PHYSICS CHALLENGES
              </h2>
              <p className="text-xs text-slate-400 font-mono-tech">
                Test your mastery of real-world kinematics, friction, and gravity.
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
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PHYSICS_CHALLENGES.map((ch) => {
            const isSelected = activeChallenge?.id === ch.id;

            return (
              <div
                key={ch.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-950/30 border-amber-500/70 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded ${
                        ch.difficulty === 'Easy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/40'
                          : ch.difficulty === 'Medium'
                          ? 'bg-sky-950 text-sky-300 border border-sky-700/40'
                          : ch.difficulty === 'Hard'
                          ? 'bg-amber-950 text-amber-300 border border-amber-700/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-700/40'
                      }`}
                    >
                      {ch.difficulty}
                    </span>
                    {ch.completed && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono-tech">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETED
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white font-heading">{ch.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ch.description}</p>

                  {/* Target Description */}
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-mono-tech text-amber-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{ch.targetDescription}</span>
                  </div>

                  {/* Hint */}
                  <p className="text-[10px] text-slate-500 italic">Hint: {ch.hint}</p>
                </div>

                <button
                  onClick={() => handleStart(ch)}
                  className={`w-full py-2 px-3 rounded-lg font-bold text-xs font-heading tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  {isSelected ? 'ACTIVE CHALLENGE - RETRY' : 'START CHALLENGE'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
