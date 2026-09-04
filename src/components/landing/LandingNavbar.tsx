import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Play, Compass, Cpu, Layers } from 'lucide-react';

interface LandingNavbarProps {
  onLaunchStudio: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ onLaunchStudio }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 glass-panel border-b border-cyan-500/20 shadow-2xl backdrop-blur-xl'
          : 'py-5 bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-wider text-white font-mono">
                SPATIAL<span className="text-cyan-400">PHYS</span>
              </span>
              <span className="px-2 py-0.5 text-[9px] font-mono tracking-widest uppercase font-bold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                AR V2.0
              </span>
            </div>
            <span className="text-[10px] text-cyan-200/60 font-mono tracking-wide hidden sm:block">
              Web-Native Spatial Physics Laboratory
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-slate-300">
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Capabilities
          </a>
          <a href="#ar-tech" className="hover:text-cyan-400 transition-colors">
            AR Pipeline
          </a>
          <a href="#playground" className="hover:text-cyan-400 transition-colors">
            Gravity Playground
          </a>
          <a href="#challenges" className="hover:text-cyan-400 transition-colors">
            STEM Labs
          </a>
          <a href="#use-cases" className="hover:text-cyan-400 transition-colors">
            Applications
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <a
            href="#playground"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60 transition-all"
          >
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            Quick Demo
          </a>

          <button
            onClick={onLaunchStudio}
            className="relative group flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 scanline-btn"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
