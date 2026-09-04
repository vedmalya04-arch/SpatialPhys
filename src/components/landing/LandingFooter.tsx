import React from 'react';
import { Sparkles, ArrowRight, ExternalLink, Activity, Box, ShieldCheck, Terminal } from 'lucide-react';

interface LandingFooterProps {
  onLaunchStudio: () => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({ onLaunchStudio }) => {
  return (
    <footer className="border-t border-cyan-500/15 bg-[#050814] text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Col 1: Brand */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider text-white font-mono">
              SPATIAL<span className="text-cyan-400">PHYS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Next-generation browser-native spatial physics simulation engine. Combining WebRTC computer vision, WebGL 3D rendering, and Cannon-es rigid-body dynamics for real-world augmented mechanics.
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>WebGL 2.0 + WebRTC Active</span>
          </div>
        </div>

        {/* Col 2: Capabilities */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-4">
            Capabilities
          </h4>
          <ul className="space-y-2.5 text-xs font-mono">
            <li>
              <a href="#ar-tech" className="hover:text-cyan-400 transition-colors">
                Computer Vision Plane Fitting
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-cyan-400 transition-colors">
                Multi-Body Rigid Dynamics
              </a>
            </li>
            <li>
              <a href="#playground" className="hover:text-cyan-400 transition-colors">
                Celestial Gravity Presets
              </a>
            </li>
            <li>
              <a href="#challenges" className="hover:text-cyan-400 transition-colors">
                Interactive Target Challenges
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-cyan-400 transition-colors">
                Real-Time Energy Telemetry
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Technology Stack */}
        <div>
          <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-4">
            Under The Hood
          </h4>
          <ul className="space-y-2 text-xs font-mono">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Three.js (0.170 WebGL)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Cannon-es Physics Engine</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>WebRTC Video Stream CV</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>React 18 + TypeScript</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>TailwindCSS Design System</span>
            </li>
          </ul>
        </div>

        {/* Col 4: Quick Launch */}
        <div className="space-y-4">
          <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold">
            Interactive Lab
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Ready to test Newtonian mechanics in your physical room? Launch the workspace directly.
          </p>
          <button
            onClick={onLaunchStudio}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500">
        <div>
          © {new Date().getFullYear()} SpatialPhys AR. All rights reserved.
        </div>
        <div className="mt-4 sm:mt-0 flex gap-6">
          <span>Browser-Native AR Simulation</span>
          <span>Zero Server Dependencies</span>
        </div>
      </div>
    </footer>
  );
};
