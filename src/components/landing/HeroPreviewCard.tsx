import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  Sliders,
  Send,
  Zap,
  Activity,
  ArrowUpRight,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface HeroPreviewCardProps {
  onLaunchStudio: () => void;
}

export const HeroPreviewCard: React.FC<HeroPreviewCardProps> = ({ onLaunchStudio }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<'earth' | 'moon' | 'mars' | 'jupiter' | 'zerog'>('earth');
  const [speed, setSpeed] = useState<number>(8.5);
  const [angle, setAngle] = useState<number>(45);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const planetConfigs = {
    earth: { name: 'Earth', g: 9.81, color: '#06b6d4', desc: 'Standard 1.0G' },
    moon: { name: 'Moon', g: 1.62, color: '#94a3b8', desc: 'Low 0.165G' },
    mars: { name: 'Mars', g: 3.71, color: '#f97316', desc: '0.38G Desert' },
    jupiter: { name: 'Jupiter', g: 24.79, color: '#eab308', desc: 'Crushing 2.53G' },
    zerog: { name: 'Zero-G', g: 0.1, color: '#c084fc', desc: 'Microgravity' }
  };

  const currentG = planetConfigs[selectedPlanet].g;
  const angleRad = (angle * Math.PI) / 180;
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);
  const timeOfFlight = (2 * vy) / currentG;
  const maxHeight = (vy * vy) / (2 * currentG);
  const range = vx * timeOfFlight;
  const kineticEnergy = 0.5 * 1.2 * speed * speed;

  // Render animated 2D parabolic arc canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let t = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Ground plane
      const groundY = height - 28;
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, groundY);
      ctx.lineTo(width - 10, groundY);
      ctx.stroke();

      // Parabolic trajectory line
      const scaleX = Math.min(28, (width - 60) / Math.max(1, range));
      const scaleY = Math.min(28, (groundY - 30) / Math.max(1, maxHeight));
      const startX = 35;

      ctx.beginPath();
      ctx.strokeStyle = planetConfigs[selectedPlanet].color;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);

      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const simT = (i / steps) * timeOfFlight;
        const px = startX + vx * simT * scaleX;
        const py = groundY - (vy * simT - 0.5 * currentG * simT * simT) * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated projectile particle along trajectory
      t += 0.016;
      const currentSimT = (t * 1.2) % timeOfFlight;
      const ballX = startX + vx * currentSimT * scaleX;
      const ballY = groundY - (vy * currentSimT - 0.5 * currentG * currentSimT * currentSimT) * scaleY;

      // Glow halo
      const grad = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 14);
      grad.addColorStop(0, planetConfigs[selectedPlanet].color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 14, 0, Math.PI * 2);
      ctx.fill();

      // Core ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector arrow from ball
      const curVy = vy - currentG * currentSimT;
      const arrowLength = 25;
      const curSpeed = Math.sqrt(vx * vx + curVy * curVy);
      const dirX = vx / curSpeed;
      const dirY = -curVy / curSpeed;

      ctx.strokeStyle = '#4ae176';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ballX, ballY);
      ctx.lineTo(ballX + dirX * arrowLength, ballY + dirY * arrowLength);
      ctx.stroke();

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrame);
  }, [selectedPlanet, speed, angle, currentG, vx, vy, timeOfFlight, maxHeight, range]);

  return (
    <div className="relative w-full max-w-xl mx-auto glass-panel-card rounded-2xl p-5 shadow-2xl border border-cyan-500/30 overflow-hidden inner-glow-cyan">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-cyan-500/15">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse-green" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-300">
            Real-Time Kinematics Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 font-mono text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/80 rounded border border-cyan-800/40">
            Cannon-es 60FPS
          </span>
          <button
            onClick={onLaunchStudio}
            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Open in Fullscreen 3D Lab"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Planetary Gravity Switcher */}
      <div className="pt-3 pb-2">
        <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] text-slate-400 uppercase">
          <span>Celestial Gravity Field</span>
          <span className="text-cyan-300 font-bold">{currentG.toFixed(2)} m/s²</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
          {(Object.keys(planetConfigs) as Array<keyof typeof planetConfigs>).map((key) => {
            const planet = planetConfigs[key];
            const isSelected = selectedPlanet === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedPlanet(key)}
                className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-sm shadow-cyan-500/30 scale-[1.02]'
                    : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-cyan-500/40 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-bold">{planet.name}</div>
                <div className="text-[9px] text-slate-400">{planet.g}g</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trajectory Canvas Preview */}
      <div className="relative my-2 rounded-xl bg-slate-950/80 border border-cyan-900/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={500}
          height={180}
          className="w-full h-44 block"
        />
        <div className="absolute top-2.5 left-3 font-mono text-[10px] text-cyan-400/80 bg-slate-950/70 px-2 py-0.5 rounded border border-cyan-800/30">
          PARABOLIC PROJECTION ARC
        </div>
        <div className="absolute bottom-2.5 right-3 font-mono text-[10px] text-emerald-400/90 bg-slate-950/70 px-2 py-0.5 rounded border border-emerald-800/30 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          VELOCITY VECTOR (v)
        </div>
      </div>

      {/* Sliders for Speed & Angle */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex justify-between font-mono text-[10px] mb-1">
            <span className="text-slate-400 uppercase">Velocity</span>
            <span className="text-cyan-400 font-bold">{speed.toFixed(1)} m/s</span>
          </div>
          <input
            type="range"
            min="2"
            max="18"
            step="0.5"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
          <div className="flex justify-between font-mono text-[10px] mb-1">
            <span className="text-slate-400 uppercase">Launch Angle</span>
            <span className="text-cyan-400 font-bold">{angle}°</span>
          </div>
          <input
            type="range"
            min="10"
            max="85"
            step="5"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value, 10))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Real-time Computed Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-2.5 font-mono text-center">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">Apex Height (H)</span>
          <span className="text-xs font-bold text-white">{maxHeight.toFixed(2)}m</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">Total Range (R)</span>
          <span className="text-xs font-bold text-cyan-300">{range.toFixed(2)}m</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <span className="text-[9px] text-slate-400 uppercase block">Flight Time (T)</span>
          <span className="text-xs font-bold text-emerald-400">{timeOfFlight.toFixed(2)}s</span>
        </div>
      </div>

      {/* Action Footer */}
      <button
        onClick={onLaunchStudio}
        className="mt-3.5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-emerald-500/20 hover:from-cyan-500 hover:to-emerald-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Simulate In 3D AR Studio</span>
      </button>
    </div>
  );
};
