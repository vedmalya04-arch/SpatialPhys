import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Copy,
  Sliders,
  Maximize2,
  Terminal,
  Activity,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Box,
  Compass,
  FileText,
  RotateCcw
} from 'lucide-react';
import { soundEffects } from '../../services/audio/SoundEffects';

interface LandingPageProps {
  onLaunchStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchStudio }) => {
  // --- Lab Controller State ---
  const [gravity, setGravity] = useState<number>(9.81);
  const [restitution, setRestitution] = useState<number>(0.78);
  const [velocity, setVelocity] = useState<number>(12.5);
  const [angle, setAngle] = useState<number>(45);
  const [selectedSurface, setSelectedSurface] = useState<'oak' | 'concrete' | 'teflon'>('oak');

  // Surface presets
  const surfaceProperties = {
    oak: { name: 'Polished Oak', friction: 0.32, restitutionBonus: 0.0 },
    concrete: { name: 'Rough Concrete', friction: 0.65, restitutionBonus: -0.15 },
    teflon: { name: 'Teflon Pad', friction: 0.05, restitutionBonus: 0.1 }
  };

  const effectiveRestitution = Math.max(
    0.05,
    Math.min(0.98, restitution + surfaceProperties[selectedSurface].restitutionBonus)
  );

  // Calculations for Kinematic Flight Trajectory
  const angleRad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(angleRad);
  const vy = velocity * Math.sin(angleRad);
  const flightTime = (2 * vy) / gravity;
  const maxHeight = (vy * vy) / (2 * gravity);
  const range = vx * flightTime;
  const mass = 1.4; // kg
  const impactEnergy = 0.5 * mass * velocity * velocity;

  // Trajectory Canvas Ref
  const trajectoryCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animate Kinematic Flight Trajectory in Lab Controller
  useEffect(() => {
    const canvas = trajectoryCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let timeProgress = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.08)';
      ctx.lineWidth = 1;
      const gridSpacing = 24;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Ground plane
      const groundY = h - 26;
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(15, groundY);
      ctx.lineTo(w - 15, groundY);
      ctx.stroke();

      // Draw primary parabolic trajectory in Purple
      const startX = 35;
      const scaleX = Math.min(26, (w - 70) / Math.max(1, range));
      const scaleY = Math.min(22, (groundY - 30) / Math.max(1, maxHeight));

      ctx.beginPath();
      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2.5;

      const segments = 60;
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * flightTime;
        const px = startX + vx * t * scaleX;
        const py = groundY - (vy * t - 0.5 * gravity * t * t) * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Draw secondary bounce arc
      const bounceVx = vx * effectiveRestitution;
      const bounceVy = vy * effectiveRestitution;
      const bounceT = (2 * bounceVy) / gravity;
      const bounceStartX = startX + vx * flightTime * scaleX;

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);

      for (let i = 0; i <= 30; i++) {
        const t = (i / 30) * bounceT;
        const px = bounceStartX + bounceVx * t * scaleX;
        const py = groundY - (bounceVy * t - 0.5 * gravity * t * t) * scaleY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Animated projectile bead
      timeProgress = (timeProgress + 0.016) % (flightTime + 0.3);
      if (timeProgress <= flightTime) {
        const ballX = startX + vx * timeProgress * scaleX;
        const ballY = groundY - (vy * timeProgress - 0.5 * gravity * timeProgress * timeProgress) * scaleY;

        // Glow ring
        ctx.fillStyle = 'rgba(147, 51, 234, 0.25)';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 11, 0, Math.PI * 2);
        ctx.fill();

        // Solid core
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Apex marker if near peak
        if (Math.abs(timeProgress - flightTime / 2) < 0.08) {
          ctx.strokeStyle = '#7e22ce';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [gravity, velocity, angle, effectiveRestitution, vx, vy, flightTime, maxHeight, range]);

  // Code Tab state
  const [activeCodeTab, setActiveCodeTab] = useState<'ts' | 'react' | 'webgl'>('ts');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    ts: `import { ARSpatialPhysics, CameraMeshDetector, RigidBody } from '@spatialphys/core';

// 1. Initialize WebAR Spatial Physics Context
const physics = await ARSpatialPhysics.init({
  precision: 'sub-mm',
  tickRate: 128,
  gravity: [0, -9.81, 0]
});

// 2. Connect camera stream -> auto-reconstruct surfaces & colliders
const surfaceMesh = new CameraMeshDetector({ deviceCam: 'default_rear' });
surfaceMesh.on('surfaceDetected', (plane) => {
  physics.addStaticMesh({ mesh: plane, friction: 0.35, restitution: 0.78 });
});

// 3. Spawn a physics projectile aligned with user perspective
const ball = new RigidBody({ mass: 1.2, shape: 'sphere', radius: 0.08 });
ball.applyImpulse([0, 1.2, -4.5]); // launch forward
physics.step();`,
    react: `import React, { useEffect } from 'react';
import { useSpatialPhysics, ARViewport } from '@spatialphys/react';

export const PhysicsLab = () => {
  const { isTracking, surfaces, spawnRigidBody } = useSpatialPhysics({
    gravity: -9.81,
    tickRate: 128
  });

  return (
    <ARViewport onPlaneLock={(plane) => console.log('Desk locked:', plane)}>
      <button onClick={() => spawnRigidBody({ type: 'sphere', restitution: 0.8 })}>
        Launch Ball
      </button>
    </ARViewport>
  );
};`,
    webgl: `// Vanilla WebGL2 / WebGPU Integration
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
const engine = new SpatialPhysEngine({ renderer, camera });

await engine.bindWebRTCCamera();
engine.enableRayPlaneManifoldDetection();
engine.startLoop(128); // 128Hz Deterministic Physics Loop`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#1e1035] font-sans selection:bg-purple-600 selection:text-white">
      {/* 1. TOP NAVBAR (White & Purple) */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-3.5 glass-panel border-b border-purple-200/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600/10 border border-purple-500/30 text-purple-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-mono font-bold text-base tracking-wider text-purple-950 flex items-center gap-1.5">
                SpatialPhys<span className="text-purple-600">X</span>
              </div>
              <div className="font-mono text-[9px] text-purple-600/70 uppercase tracking-widest hidden sm:block">
                Engineered For Spatial Dynamics
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 font-mono text-[11px] uppercase tracking-wider text-purple-900/80">
            <a href="#features" className="hover:text-purple-600 transition-colors">
              Features
            </a>
            <a href="#technology" className="hover:text-purple-600 transition-colors">
              Technology
            </a>
            <a href="#benchmarks" className="hover:text-purple-600 transition-colors">
              Benchmarks
            </a>
            <a href="#docs" className="hover:text-purple-600 transition-colors">
              Documentation
            </a>
            <a href="#pricing" className="hover:text-purple-600 transition-colors">
              Pricing
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.playScanBeep();
                onLaunchStudio();
              }}
              className="font-mono text-xs text-purple-800 hover:text-purple-950 px-3 py-1.5 transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                soundEffects.playScanBeep();
                onLaunchStudio();
              }}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-500/25 active:scale-95 transition-all"
            >
              <span>Launch WebAR Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (White & Purple) */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-radial-purple">
        {/* Ambient purple aura */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-400/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/90 border border-purple-300 text-purple-900 font-mono text-xs mb-8 shadow-sm hover:border-purple-400 transition-colors cursor-pointer">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">
              Announcing Engine V1.4 - Real-Time Mesh Parser
            </span>
            <span className="text-purple-300">|</span>
            <span className="text-purple-700 flex items-center gap-1 hover:underline font-bold">
              Read Release Notes <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-purple-950 leading-[1.1]">
            Physics Simulation in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-600">
              Real Physical Space
            </span>
            ,<br />
            Directly in the Browser.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-3xl mx-auto text-base sm:text-lg text-purple-900/75 leading-relaxed font-sans">
            Turn any standard camera feed into an accurate 3D collision mesh. Simulate rigid body dynamics, projectile vectors, fluid restitution, and particle physics at 128Hz with zero native plugins.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                soundEffects.playScanBeep();
                onLaunchStudio();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(147,51,234,0.35)] active:scale-95 transition-all duration-200"
            >
              <Zap className="w-4 h-4 fill-current text-purple-200" />
              <span>Launch WebAR Lab Now</span>
            </button>

            <a
              href="#docs"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-purple-50 text-purple-900 font-mono text-xs sm:text-sm uppercase tracking-wider border border-purple-200 shadow-sm transition-all"
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Read The Docs</span>
            </a>

            {/* Stack Badge */}
            <div className="flex items-center gap-2 text-xs font-mono text-purple-800 bg-purple-100/80 px-4 py-2 rounded-full border border-purple-300/80">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>WebRTC • WebAssembly • WebGPU</span>
            </div>
          </div>
        </div>

        {/* 3. HERO SHOWCASE MOCKUP CARD (White & Purple) */}
        <div className="max-w-6xl mx-auto mt-14 relative z-20">
          <div className="relative rounded-2xl glass-panel-card border border-purple-300 p-2 sm:p-4 shadow-2xl overflow-hidden inner-glow-purple bg-white">
            {/* Top Bar inside Mockup */}
            <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b border-purple-100 font-mono text-[11px] text-purple-700 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-purple-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  [X] AR CAM 01 [60 FPS]
                </span>
                <span className="text-purple-300">|</span>
                <span className="text-emerald-600 font-semibold">
                  SURFACE DETECT: ACTIVE (CONF: 99.4%)
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span>LATENCY: <strong className="text-purple-700">&lt; 8.2ms</strong></span>
                <span>PHYSICS TICK: <strong className="text-emerald-600">128 Hz</strong></span>
                <span>BUFFERS: <strong className="text-purple-700">OK</strong></span>
              </div>
            </div>

            {/* Mockup Canvas Scene Area */}
            <div className="relative w-full h-[400px] sm:h-[500px] bg-gradient-to-b from-[#fbf9ff] to-[#f3ebff] rounded-xl overflow-hidden border border-purple-100 my-2 flex items-center justify-center">
              {/* 3D Wireframe Perspective Floor & Desk */}
              <div className="absolute inset-x-0 bottom-0 h-3/4 opacity-35">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 400">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line
                      key={i}
                      x1={i * 70}
                      y1="400"
                      x2={500 + (i - 7) * 20}
                      y2="120"
                      stroke="#9333ea"
                      strokeWidth="0.8"
                      strokeOpacity="0.3"
                    />
                  ))}
                  {[120, 150, 190, 240, 310, 400].map((y, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={y}
                      x2="1000"
                      y2={y}
                      stroke="#9333ea"
                      strokeWidth="0.8"
                      strokeOpacity="0.3"
                    />
                  ))}
                  <polygon
                    points="220,260 780,260 880,350 120,350"
                    fill="rgba(147, 51, 234, 0.08)"
                    stroke="#9333ea"
                    strokeWidth="1.5"
                  />
                  <line x1="120" y1="350" x2="120" y2="400" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="4 4" />
                  <line x1="880" y1="350" x2="880" y2="400" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="4 4" />
                </svg>
              </div>

              {/* Parabolic trajectory line spanning the 3D room */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 500">
                <path
                  d="M 180 340 Q 480 80 820 300"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  className="animate-pulse"
                />
                <circle cx="180" cy="340" r="6" fill="#7e22ce" />
                <circle cx="820" cy="300" r="6" fill="#a855f7" />

                {/* Animated traveling projectile along arc */}
                <circle cx="500" cy="180" r="7" fill="#7e22ce" filter="drop-shadow(0 0 8px #a855f7)">
                  <animate
                    attributeName="cx"
                    values="180;500;820;880"
                    keyTimes="0;0.5;0.9;1"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values="340;160;300;340"
                    keyTimes="0;0.5;0.9;1"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>

              {/* Left Floating Parameter Overlay Card */}
              <div className="absolute top-4 left-4 w-64 glass-panel p-3.5 rounded-xl border border-purple-200 text-left font-mono text-[11px] shadow-xl hidden md:block">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 text-purple-900 font-bold">
                  <span>WHITE ROOM LAB COLLIDER SETUP</span>
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="mt-2.5 space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-purple-700">Desk Elevation (y)</span>
                    <span className="text-purple-950 font-bold">0.78m</span>
                  </div>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-3/4" />
                  </div>

                  <div className="flex justify-between text-[10px]">
                    <span className="text-purple-700">Restitution Coefficient (e)</span>
                    <span className="text-purple-950 font-bold">0.82</span>
                  </div>
                  <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full w-4/5" />
                  </div>

                  <div className="pt-2 border-t border-purple-100 space-y-1.5 text-[10px] text-purple-800">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-purple-600" />
                      <span>Trajectory Projection Arc</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-purple-600" />
                      <span>Compute Real-time Normal (N)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-purple-600" />
                      <span>Real-Time Contact Manifold</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Floating Spatial Vector Badge */}
              <div className="absolute top-28 left-1/2 -translate-x-1/2 glass-panel px-4 py-1.5 rounded-full border border-purple-300 text-center font-mono text-xs shadow-lg flex items-center gap-3">
                <span className="text-purple-950 font-bold">VELOCITY: 4.72 m/s</span>
                <span className="text-purple-300">•</span>
                <span className="text-purple-700 font-bold">ANGLE: 38.4°</span>
                <span className="text-purple-300">•</span>
                <span className="text-fuchsia-700 font-bold">KINETIC ENERGY: 48.2 J</span>
              </div>

              {/* Right Floating Telemetry Metrics Card */}
              <div className="absolute top-4 right-4 w-72 glass-panel p-3.5 rounded-xl border border-purple-200 text-left font-mono text-[11px] shadow-xl hidden md:block">
                <div className="flex items-center justify-between pb-2 border-b border-purple-100 text-purple-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-600" />
                    METRICS TELEMETRY
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300 font-bold">
                    60 Hz
                  </span>
                </div>

                <div className="mt-2.5 space-y-2">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-purple-50 p-1.5 rounded border border-purple-100">
                      <span className="text-purple-500 block">VELOCITY</span>
                      <strong className="text-purple-950 font-bold">4.72 m/s</strong>
                    </div>
                    <div className="bg-purple-50 p-1.5 rounded border border-purple-100">
                      <span className="text-purple-500 block">ALTITUDE</span>
                      <strong className="text-purple-950 font-bold">1.28 m</strong>
                    </div>
                    <div className="bg-purple-50 p-1.5 rounded border border-purple-100">
                      <span className="text-purple-500 block">NET FORCE</span>
                      <strong className="text-purple-950 font-bold">14.6 N</strong>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-purple-50/70 border border-purple-100 text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Total Energy</span>
                      <strong className="text-purple-950">48.2 J</strong>
                    </div>
                    <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden flex">
                      <div className="bg-purple-600 h-full w-[71%]" />
                      <div className="bg-fuchsia-500 h-full w-[29%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Control Bar inside Mockup */}
              <div className="absolute bottom-3 inset-x-4 flex items-center justify-between glass-panel px-4 py-2 rounded-xl border border-purple-200 font-mono text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-green" />
                  <span className="text-purple-950 font-bold">PLANE TRACKING: ACTIVE</span>
                  <span className="text-purple-300 hidden sm:inline">|</span>
                  <span className="text-purple-700 hidden sm:inline">
                    TARGET 1: 3.44m @ 42 deg | dZ 0.0m
                  </span>
                </div>

                <button
                  onClick={() => {
                    soundEffects.playScanBeep();
                    onLaunchStudio();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-[11px] shadow-sm active:scale-95 transition-all"
                >
                  Apply Impulse &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. METRICS / STAT COUNTERS (White & Purple) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-purple-200/80 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2 p-5 rounded-xl border border-purple-100 bg-[#fbf9ff] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-700 font-bold">
                EVAL LATENCY
              </span>
              <Activity className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-4xl font-extrabold text-purple-950 font-mono tracking-tight">
              &lt; 8.2ms
            </div>
            <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
              Sub-frame camera-to-rigid-body collider generation via SIMD ray-plane intersection.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl border border-purple-100 bg-[#fbf9ff] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-700 font-bold">
                TICK RATE
              </span>
              <Cpu className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-4xl font-extrabold text-purple-950 font-mono tracking-tight">
              128 Hz
            </div>
            <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
              Deterministic rigid body simulation ticks running decoupled from display refresh rates.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl border border-purple-100 bg-[#fbf9ff] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-700 font-bold">
                INSTALLATION
              </span>
              <Box className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-4xl font-extrabold text-purple-950 font-mono tracking-tight">
              0 Native
            </div>
            <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
              Zero extensions, no native SDKs, zero installs. Pure standard WebGL/WebGPU in your browser.
            </p>
          </div>

          <div className="space-y-2 p-5 rounded-xl border border-purple-100 bg-[#fbf9ff] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-700 font-bold">
                FIXTURE ACCURACY
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-4xl font-extrabold text-purple-950 font-mono tracking-tight">
              99.4%
            </div>
            <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
              Real-to-sim plane alignment precision across standard RGB laptop and mobile webcams.
            </p>
          </div>
        </div>
      </section>

      {/* 5. ARCHITECTURE OVERVIEW: Bento Grid (White & Purple) */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-[#faf8ff]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-purple-600 font-bold mb-2">
                ARCHITECTURE OVERVIEW
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-purple-950 font-sans">
                Engineered for Extreme Spatial Precision
              </h2>
            </div>
            <p className="max-w-md text-sm text-purple-900/75 font-sans leading-relaxed">
              SpatialPhysX replaces heavy cloud compute with client-side WebGPU compute shaders and WebAssembly SIMD math.
            </p>
          </div>

          {/* 3 Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel-card p-6 rounded-2xl flex flex-col justify-between border border-purple-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] text-purple-500 uppercase tracking-wider font-bold">
                    01 / MONOCULAR CV
                  </span>
                </div>
                <h3 className="text-xl font-bold text-purple-950 mb-2.5 font-sans">
                  Camera-to-Mesh Re-projection
                </h3>
                <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
                  Monocular depth estimation continuously synthesizes dense 3D triangulated surfaces. Desks, walls, and chairs effortlessly become dynamic colliders that require zero set room calibration.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-purple-100">
                <div className="h-32 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-center p-3 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 240 100">
                    <polygon
                      points="30,80 90,30 160,50 210,20 180,80 100,70"
                      fill="rgba(147, 51, 234, 0.08)"
                      stroke="#9333ea"
                      strokeWidth="1.5"
                    />
                    <circle cx="30" cy="80" r="3" fill="#7e22ce" />
                    <circle cx="90" cy="30" r="3" fill="#7e22ce" />
                    <circle cx="160" cy="50" r="3" fill="#7e22ce" />
                    <circle cx="210" cy="20" r="3" fill="#7e22ce" />
                    <circle cx="180" cy="80" r="3" fill="#7e22ce" />
                    <circle cx="100" cy="70" r="3" fill="#7e22ce" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-panel-card p-6 rounded-2xl flex flex-col justify-between border border-purple-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] text-purple-500 uppercase tracking-wider font-bold">
                    02 / RIGID-BODY KINEMATICS
                  </span>
                </div>
                <h3 className="text-xl font-bold text-purple-950 mb-2.5 font-sans">
                  Sub-Millimeter Vector Physics
                </h3>
                <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
                  Calculate restitution coefficients, rolling and static friction, Magnus force effects on spinning projectiles, and multi-body momentum transfer with sub-millimeter precision.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-purple-100">
                <div className="h-32 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-center p-3 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 240 100">
                    <line x1="20" y1="80" x2="220" y2="80" stroke="#7e22ce" strokeWidth="2" />
                    <line x1="120" y1="80" x2="120" y2="25" stroke="#9333ea" strokeWidth="2" />
                    <line x1="40" y1="30" x2="120" y2="80" stroke="#a855f7" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="glass-panel-card p-6 rounded-2xl flex flex-col justify-between border border-purple-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10px] text-purple-500 uppercase tracking-wider font-bold">
                    03 / SILICON ACCELERATION
                  </span>
                </div>
                <h3 className="text-xl font-bold text-purple-950 mb-2.5 font-sans">
                  WebGPU Pipeline Acceleration
                </h3>
                <p className="text-xs text-purple-800/75 leading-relaxed font-sans">
                  Offload parallel broad-phase collision detection and soft body particle meshes directly to the GPU, executing pipeline ticks at 128Hz with no main-thread stalls.
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-purple-100">
                <div className="h-32 bg-purple-50/60 rounded-xl border border-purple-200 p-3.5 font-mono text-[10px] flex flex-col justify-between">
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">GPU Threads:</span>
                    <strong className="text-purple-950">64</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-bold">Throughput:</span>
                    <strong className="text-purple-950">124 Mflops/frame</strong>
                  </div>
                  <div className="flex gap-1 pt-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 flex-1 rounded-sm ${i < 10 ? 'bg-purple-600' : 'bg-purple-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE LAB CONTROLLER (White & Purple) */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-purple-200/80 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-purple-200 gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-purple-600 font-bold mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                INTERACTIVE BENCHMARK LAB
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-purple-950 font-sans">
                SpatialPhysX WebAR Lab Controller
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  soundEffects.playScanBeep();
                  onLaunchStudio();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-500/20 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Fire Test Projectile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 glass-panel-card p-6 rounded-2xl space-y-6 border border-purple-200">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-purple-700 uppercase font-bold">Gravitational Constant (g)</span>
                  <span className="text-purple-950 font-bold">{gravity.toFixed(2)} m/s²</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="26"
                  step="0.1"
                  value={gravity}
                  onChange={(e) => setGravity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-purple-700 uppercase font-bold">Restitution Coefficient (e)</span>
                  <span className="text-purple-950 font-bold">{restitution.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={restitution}
                  onChange={(e) => setRestitution(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-purple-700 uppercase font-bold">Initial Velocity (Vo)</span>
                  <span className="text-purple-950 font-bold">{velocity.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="0.5"
                  value={velocity}
                  onChange={(e) => setVelocity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel-card p-5 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-purple-600" />
                    <span>Kinematic Flight Trajectory</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-300 font-bold">
                    60 FPS DYNAMIC
                  </span>
                </div>

                <div className="my-3 rounded-xl bg-[#faf8ff] border border-purple-200 overflow-hidden">
                  <canvas ref={trajectoryCanvasRef} width={560} height={180} className="w-full h-44 block" />
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-center pt-1">
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-600 uppercase block font-bold">Flight Time</span>
                    <strong className="text-purple-950 text-sm">{flightTime.toFixed(2)} s</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-600 uppercase block font-bold">Max Height</span>
                    <strong className="text-purple-950 text-sm">{maxHeight.toFixed(2)} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                    <span className="text-[10px] text-purple-600 uppercase block font-bold">Impact Energy</span>
                    <strong className="text-purple-950 text-sm">{impactEnergy.toFixed(1)} J</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER (White & Purple) */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#faf8ff]">
        <div className="max-w-5xl mx-auto rounded-3xl glass-panel-card p-8 sm:p-12 border border-purple-300 relative overflow-hidden inner-glow-purple shadow-xl bg-white">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="font-mono text-xs uppercase tracking-widest text-purple-600 font-bold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                INSTANT BROWSER ACCESS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-purple-950 font-sans tracking-tight leading-tight">
                Ready to bring physical reality to the web?
              </h2>
              <p className="mt-4 text-sm text-purple-900/75 leading-relaxed font-sans">
                Start building zero-latency WebAR applications today. Deploy with pure WebAssembly or integrate seamlessly with Three.js, Babylon.js, and PlayCanvas.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <button
                onClick={() => {
                  soundEffects.playScanBeep();
                  onLaunchStudio();
                }}
                className="px-8 py-3.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/25 active:scale-95 transition-all text-center"
              >
                Get Free API Key
              </button>
              <button
                onClick={() => {
                  soundEffects.playScanBeep();
                  onLaunchStudio();
                }}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-purple-50 text-purple-900 font-mono text-xs font-bold uppercase tracking-wider border border-purple-200 transition-all text-center"
              >
                Launch AR Playground
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER (White & Purple) */}
      <footer className="border-t border-purple-200 bg-white text-purple-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-6 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-lg tracking-wider text-purple-950">
                SpatialPhys<span className="text-purple-600">X</span>
              </span>
            </div>
            <p className="text-xs text-purple-800/75 leading-relaxed font-sans max-w-sm">
              Next-generation WebAR simulation framework transforming standard cameras into deterministic 3D physics engines for web applications.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-purple-950 font-bold mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-purple-700">
              <li><a href="#features" className="hover:text-purple-950">Mesh Scanner</a></li>
              <li><a href="#technology" className="hover:text-purple-950">Rigid-Body Engine</a></li>
              <li><a href="#features" className="hover:text-purple-950">Kinematics Pipeline</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-purple-950 font-bold mb-4">
              Developers
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-purple-700">
              <li><a href="#docs" className="hover:text-purple-950">API Reference</a></li>
              <li><a href="#features" className="hover:text-purple-950">WebGPU Shaders</a></li>
              <li><a href="#benchmarks" className="hover:text-purple-950">SIMD Benchmarks</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};
