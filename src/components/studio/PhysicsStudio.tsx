import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Sliders,
  Download,
  Trash2,
  Lock,
  PlusCircle,
  Eye,
  Activity,
  Layers,
  Check,
  MousePointer,
  Crosshair,
  Box,
  CircleDot,
  Rocket,
  Compass,
  Target,
  Send,
  Zap
} from 'lucide-react';
import {
  EnvironmentScanResult,
  GravityPresetName,
  PhysicsObjectConfig,
  VectorOverlayOptions,
  TrajectoryTheoretical,
  PhysicsVectorState,
  SimulationTelemetry,
  ReconstructedSurface
} from '../../types';
import { DEFAULT_FALLBACK_SCAN } from '../../services/vision/SampleRooms';
import { physicsEngine } from '../../services/physics/PhysicsEngine';
import { soundEffects } from '../../services/audio/SoundEffects';
import { ThreeCanvas } from '../viewport/ThreeCanvas';

interface PhysicsStudioProps {
  onBackToOverview: () => void;
}

export const PhysicsStudio: React.FC<PhysicsStudioProps> = ({ onBackToOverview }) => {
  // Top Navigation Tabs
  const [activeTab, setActiveTab] = useState<'simulation' | 'environment' | 'rendering'>('simulation');
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  // Surface & Table Setup (Dedicated Minecraft Physics Table in center)
  const [scanResult, setScanResult] = useState<EnvironmentScanResult>(DEFAULT_FALLBACK_SCAN);

  // Physics State
  const [currentGravity, setCurrentGravity] = useState<number>(9.81);
  const [selectedPreset, setSelectedPreset] = useState<'earth' | 'moon' | 'mars' | 'zerog'>('earth');
  const [mass, setMass] = useState<number>(1.0);
  const [restitution, setRestitution] = useState<number>(0.75);
  const [friction, setFriction] = useState<number>(0.42);
  const [dropAltitude, setDropAltitude] = useState<number>(1.4);

  // Ballistic Launcher State
  const [actionMode, setActionMode] = useState<'launch' | 'drop'>('launch');
  const [launchSpeed, setLaunchSpeed] = useState<number>(11.5);
  const [launchAngle, setLaunchAngle] = useState<number>(45);
  const [launchYaw, setLaunchYaw] = useState<number>(0);
  const [lastLaunchOrigin, setLastLaunchOrigin] = useState<[number, number, number]>([0, 0.86, -1.2]);

  // Voxel Object Skin: 'slime' | 'tnt' | 'diamond' | 'sphere'
  const [objectSkin, setObjectSkin] = useState<'slime' | 'tnt' | 'diamond' | 'sphere'>('slime');

  // Simulation Overlays State
  const [showTrajectoryArc, setShowTrajectoryArc] = useState<boolean>(true);
  const [showMeshNormals, setShowMeshNormals] = useState<boolean>(false);
  const [showContactManifold, setShowContactManifold] = useState<boolean>(true);

  // Real-time Telemetry State
  const [telemetry, setTelemetry] = useState<SimulationTelemetry | null>(null);
  const [vectorState, setVectorState] = useState<PhysicsVectorState | null>(null);

  // Last action feedback
  const [lastDropLocation, setLastDropLocation] = useState<string>('Ready to Launch');

  // Theoretical Trajectory Parabola
  const [theoreticalTrajectory, setTheoreticalTrajectory] = useState<TrajectoryTheoretical | null>(null);

  // Vector Overlay Options for 3D Viewport
  const vectorOptions: VectorOverlayOptions = {
    showVelocity: true,
    showAcceleration: showMeshNormals,
    showGravity: true,
    showNormalForce: showContactManifold,
    showFrictionForce: showContactManifold,
    showResultantForce: false,
    showTrajectory: showTrajectoryArc,
    showTrail: showTrajectoryArc,
    vectorScale: 1.0
  };

  // Update Theoretical Trajectory
  const updateTheoretical = useCallback(
    (g: number, speed: number, angle: number, yaw: number, origin: [number, number, number]) => {
      const trajectory = physicsEngine.calculateTheoreticalTrajectory(speed, angle, yaw, origin);
      setTheoreticalTrajectory(trajectory);
    },
    []
  );

  useEffect(() => {
    updateTheoretical(currentGravity, launchSpeed, launchAngle, launchYaw, lastLaunchOrigin);
  }, [currentGravity, launchSpeed, launchAngle, launchYaw, lastLaunchOrigin, updateTheoretical]);

  // Handle Gravity Preset Select
  const handleSelectPreset = (preset: 'earth' | 'moon' | 'mars' | 'zerog') => {
    setSelectedPreset(preset);
    soundEffects.playScanBeep();

    let g = 9.81;
    if (preset === 'moon') g = 1.62;
    else if (preset === 'mars') g = 3.71;
    else if (preset === 'zerog') g = 0.05;

    setCurrentGravity(g);
    physicsEngine.setGravity(g);
    updateTheoretical(g, launchSpeed, launchAngle, launchYaw, lastLaunchOrigin);
  };

  // Launch Object along Ballistic Trajectory
  const handleLaunchHero = (customOrigin?: [number, number, number]) => {
    const origin = customOrigin || lastLaunchOrigin;
    setLastLaunchOrigin(origin);
    physicsEngine.launchHero(launchSpeed, launchAngle, launchYaw, origin);
    soundEffects.playLaunch(launchSpeed);
    setLastDropLocation(`Launched (${launchSpeed.toFixed(1)}m/s @ ${launchAngle}°)`);
    updateTheoretical(currentGravity, launchSpeed, launchAngle, launchYaw, origin);
  };

  // Drop Object Vertically from Altitude
  const handleDropHero = (customPos?: [number, number, number]) => {
    soundEffects.playLaunch(4);
    if (customPos) {
      physicsEngine.setHeroPosition(customPos[0], customPos[1], customPos[2]);
      const groundPos: [number, number, number] = [customPos[0], 0.86, customPos[2]];
      setLastLaunchOrigin(groundPos);
      setLastDropLocation(`Dropped at [${customPos[0].toFixed(2)}, ${customPos[2].toFixed(2)}]`);
      updateTheoretical(currentGravity, launchSpeed, launchAngle, launchYaw, groundPos);
    } else {
      const targetX = (Math.random() - 0.5) * 0.6;
      const targetY = 0.86 + dropAltitude;
      const targetZ = -1.2 + (Math.random() - 0.5) * 0.4;
      physicsEngine.setHeroPosition(targetX, targetY, targetZ);
      const groundPos: [number, number, number] = [targetX, 0.86, targetZ];
      setLastLaunchOrigin(groundPos);
      setLastDropLocation('Crafting Table');
      updateTheoretical(currentGravity, launchSpeed, launchAngle, launchYaw, groundPos);
    }
  };

  // Handle click on 3D table: launch or drop depending on actionMode
  const handleTableInteraction = (position: [number, number, number], mode: 'launch' | 'drop') => {
    if (mode === 'launch') {
      handleLaunchHero(position);
    } else {
      handleDropHero(position);
    }
  };

  // Spacebar to Launch Object
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleLaunchHero();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [launchSpeed, launchAngle, launchYaw, lastLaunchOrigin, currentGravity]);

  // Apply Parameters to Hero Object & Physics Table
  const handleApplyParameters = () => {
    soundEffects.playLaunch(5);

    // Update Hero Object Config
    const heroCfg = physicsEngine.getHeroConfig();
    const updatedHero: Partial<PhysicsObjectConfig> = {
      ...heroCfg,
      mass,
      restitution,
      friction,
      type: objectSkin === 'sphere' ? 'sphere' : 'box'
    };
    physicsEngine.setupHeroObject(updatedHero);

    // Update Table Surface Restitution & Friction
    const updatedSurfaces: ReconstructedSurface[] = scanResult.surfaces.map((surf) => {
      if (surf.type === 'table') {
        return { ...surf, friction, restitution };
      }
      return surf;
    });

    setScanResult((prev) => ({ ...prev, surfaces: updatedSurfaces }));
    physicsEngine.loadSurfaces(updatedSurfaces);

    // Position hero block on crafting table launch pad
    const launchPadPos: [number, number, number] = [0, 0.86 + 0.18, -1.2];
    physicsEngine.setHeroPosition(launchPadPos[0], launchPadPos[1], launchPadPos[2]);
    setLastLaunchOrigin([0, 0.86, -1.2]);
    setLastDropLocation('Launchpad Ready');
    updateTheoretical(currentGravity, launchSpeed, launchAngle, launchYaw, [0, 0.86, -1.2]);
  };

  // Spawn additional secondary sphere/cube
  const handleSpawnObject = () => {
    soundEffects.playLaunch(6);
    const spawnX = (Math.random() - 0.5) * 0.8;
    const spawnY = 0.86 + dropAltitude + 0.4;
    const spawnZ = -1.2 + (Math.random() - 0.5) * 0.5;

    physicsEngine.spawnAdditionalObject({
      id: `block-${Date.now()}`,
      name: 'Dynamic Voxel Block',
      type: 'box',
      mass: mass * (0.8 + Math.random() * 0.4),
      radius: 0.18,
      dimensions: [0.36, 0.36, 0.36],
      position: [spawnX, spawnY, spawnZ],
      velocity: [(Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2],
      restitution,
      friction,
      color: objectSkin === 'slime' ? '#73c854' : objectSkin === 'tnt' ? '#dc2626' : '#64e6d9',
      isHero: false
    });
    setLastDropLocation(`Voxel Block [${spawnX.toFixed(2)}, ${spawnZ.toFixed(2)}]`);
  };

  // Reset Simulation
  const handleResetSim = () => {
    soundEffects.playScanBeep();
    physicsEngine.clearSecondaryObjects();
    physicsEngine.reset();
    physicsEngine.setHeroPosition(0, 0.86 + dropAltitude, -1.2);
    setLastDropLocation('Origin (0, -1.2)');
  };

  // Telemetry Callback from Three.js Render Loop
  const handleTelemetryUpdate = useCallback(
    (newTelemetry: SimulationTelemetry, newVectorState: PhysicsVectorState) => {
      setTelemetry(newTelemetry);
      setVectorState(newVectorState);
    },
    []
  );

  // Compute energy and acceleration
  const totalE = telemetry ? telemetry.totalEnergy : 571.8;
  const kineticE = telemetry ? telemetry.kineticEnergy : 450.2;
  const potentialE = telemetry ? telemetry.potentialEnergy : 120.8;
  const kineticPct = Math.min(100, Math.max(0, (kineticE / Math.max(0.1, totalE)) * 100));
  const potentialPct = Math.min(100, Math.max(0, (potentialE / Math.max(0.1, totalE)) * 100));

  const accelG = vectorState ? (vectorState.acceleration.magnitude / 9.81).toFixed(2) : '1.42';
  const posX = vectorState ? (vectorState.position.x >= 0 ? `+${vectorState.position.x.toFixed(2)}` : vectorState.position.x.toFixed(2)) : '+12.40';
  const posY = vectorState ? (vectorState.position.y >= 0 ? `+${vectorState.position.y.toFixed(2)}` : vectorState.position.y.toFixed(2)) : '+08.91';
  const posZ = vectorState ? (vectorState.position.z >= 0 ? `+${vectorState.position.z.toFixed(2)}` : vectorState.position.z.toFixed(2)) : '-04.25';

  // Ballistic kinematics predictions for UI
  const angleRad = (launchAngle * Math.PI) / 180;
  const v0y = launchSpeed * Math.sin(angleRad);
  const v0x = launchSpeed * Math.cos(angleRad);
  const gClamped = Math.max(0.01, currentGravity);
  const calcMaxH = 0.86 + (v0y * v0y) / (2 * gClamped);
  const calcDisc = v0y * v0y + 2 * gClamped * 0.86;
  const calcFlightTime = calcDisc >= 0 ? (v0y + Math.sqrt(calcDisc)) / gClamped : 0;
  const calcRange = v0x * calcFlightTime;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#faf8ff] text-[#1e1035] select-none font-sans flex flex-col p-2 sm:p-3">
      {/* Outer Glow Purple Frame */}
      <div className="relative w-full h-full rounded-2xl border border-purple-200/80 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col bg-[#faf8ff]">

        {/* 1. TOP NAVIGATION BAR (White & Purple) */}
        <header className="h-14 px-5 flex items-center justify-between border-b border-purple-100 bg-white/90 backdrop-blur-md z-30 shrink-0">
          {/* Left: Brand + Minecraft Voxel Badge + Back to Overview */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToOverview}
              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
              title="Return to Customer Landing Page"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-600">
                <Box className="w-4 h-4" />
              </div>
              <span className="font-mono font-bold text-base text-purple-950 tracking-wider">
                SpatialPhys<span className="text-purple-600">X</span>
              </span>
            </div>

            {/* Minecraft Voxel Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 border border-purple-300/80 text-purple-800 font-mono text-[10px] font-bold uppercase tracking-wider ml-1">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>MINECRAFT VOXEL LAB</span>
            </div>
          </div>

          {/* Center: Mode Tabs */}
          <nav className="flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`pb-1 transition-colors ${
                activeTab === 'simulation'
                  ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
                  : 'text-purple-900/60 hover:text-purple-900 font-medium'
              }`}
            >
              Simulation
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`pb-1 transition-colors ${
                activeTab === 'environment'
                  ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
                  : 'text-purple-900/60 hover:text-purple-900 font-medium'
              }`}
            >
              Environment
            </button>
            <button
              onClick={() => setActiveTab('rendering')}
              className={`pb-1 transition-colors ${
                activeTab === 'rendering'
                  ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
                  : 'text-purple-900/60 hover:text-purple-900 font-medium'
              }`}
            >
              Rendering
            </button>
          </nav>

          {/* Right: Reset Sim & Settings */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetSim}
              className="px-4 py-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              Reset Sim
            </button>
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors"
              title="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. MAIN WORKSPACE CONTAINER */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          {/* Interactive Help Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 border border-purple-300 text-purple-900 font-mono text-[11px] font-medium shadow-md backdrop-blur-md">
            <Rocket className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>🚀 Click Crafting Table to Launch • Press Space to fire • Drag to orbit room</span>
          </div>

          {/* 3D WebGL Three.js Canvas Layer (Renders Minecraft Voxel Room) */}
          <div className="absolute inset-0 w-full h-full z-0">
            <ThreeCanvas
              scanResult={scanResult}
              vectorOptions={vectorOptions}
              theoreticalTrajectory={theoreticalTrajectory}
              activeChallenge={null}
              onTelemetryUpdate={handleTelemetryUpdate}
              onTableClick={handleTableInteraction}
              dropAltitude={dropAltitude}
              objectSkin={objectSkin}
              actionMode={actionMode}
              launchSpeed={launchSpeed}
              launchAngle={launchAngle}
              launchYaw={launchYaw}
            />
          </div>

          {/* 3. LEFT PANEL: PHYSICS SYSTEM */}
          <aside className="absolute left-5 top-5 w-80 rounded-xl bg-white/95 border border-purple-200 backdrop-blur-xl p-5 shadow-xl z-20 flex flex-col font-mono text-xs max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-purple-950 uppercase tracking-wider text-xs">
                    Physics System
                  </h2>
                  <p className="text-[10px] text-purple-700/70 font-normal">Ballistic & Surface Controls</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-purple-700 bg-purple-100 border border-purple-200">
                SYNCED
              </span>
            </div>

            <div className="space-y-4 pt-4">
              {/* ACTION MODE SELECTOR: LAUNCH vs DROP */}
              <div className="space-y-1.5">
                <span className="text-purple-900/70 text-[11px] uppercase block font-bold">Action Mode</span>
                <div className="grid grid-cols-2 gap-1.5 bg-purple-50/80 p-1 rounded-lg border border-purple-200/80">
                  <button
                    onClick={() => setActionMode('launch')}
                    className={`py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all ${
                      actionMode === 'launch'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-800 hover:bg-purple-100/60'
                    }`}
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Launch</span>
                  </button>
                  <button
                    onClick={() => setActionMode('drop')}
                    className={`py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-md uppercase tracking-wider transition-all ${
                      actionMode === 'drop'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-purple-800 hover:bg-purple-100/60'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Drop</span>
                  </button>
                </div>
              </div>

              {/* BALLISTIC LAUNCHER CONTROLS (Active in Launch Mode) */}
              {actionMode === 'launch' && (
                <div className="space-y-3.5 p-3 rounded-lg bg-purple-50/70 border border-purple-200/90 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Rocket className="w-3 h-3 text-purple-600" />
                      Ballistic Cannon
                    </span>
                    <span className="text-[10px] text-purple-600 font-bold">
                      {(launchSpeed * 3.6).toFixed(0)} km/h
                    </span>
                  </div>

                  {/* Launch Speed Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-purple-900/80">Launch Velocity (v₀)</span>
                      <span className="text-purple-950 font-bold">{launchSpeed.toFixed(1)} m/s</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="25.0"
                      step="0.5"
                      value={launchSpeed}
                      onChange={(e) => setLaunchSpeed(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Elevation Angle Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-purple-900/80">Elevation Pitch (θ)</span>
                      <span className="text-purple-950 font-bold">{launchAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="85"
                      step="1"
                      value={launchAngle}
                      onChange={(e) => setLaunchAngle(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Direction Heading Yaw Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-purple-900/80">Azimuth Direction (φ)</span>
                      <span className="text-purple-950 font-bold">{launchYaw}°</span>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      step="5"
                      value={launchYaw}
                      onChange={(e) => setLaunchYaw(parseInt(e.target.value, 10))}
                      className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />

                    {/* Quick Compass Pills */}
                    <div className="grid grid-cols-4 gap-1 pt-1">
                      {[
                        { label: 'Fwd (0°)', yaw: 0 },
                        { label: 'Right (90°)', yaw: 90 },
                        { label: 'Back (180°)', yaw: 180 },
                        { label: 'Left (-90°)', yaw: -90 }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setLaunchYaw(item.yaw)}
                          className={`py-1 text-[9px] font-bold rounded uppercase transition-colors ${
                            launchYaw === item.yaw
                              ? 'bg-purple-600 text-white'
                              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Real-time Predicted Kinematics Pill */}
                  <div className="p-2 rounded bg-white border border-purple-200 text-[10px] space-y-0.5 text-purple-900">
                    <div className="flex justify-between">
                      <span className="text-purple-700/80">Peak Height (Hmax):</span>
                      <span className="font-bold text-purple-950">{calcMaxH.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700/80">Estimated Range:</span>
                      <span className="font-bold text-purple-950">{calcRange.toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700/80">Flight Duration:</span>
                      <span className="font-bold text-purple-950">{calcFlightTime.toFixed(2)} s</span>
                    </div>
                  </div>

                  {/* Big Launch Button */}
                  <button
                    onClick={() => handleLaunchHero()}
                    className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95 shadow-[0_4px_16px_rgba(147,51,234,0.35)] flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-4 h-4 fill-current" />
                    <span>Launch Object (Space)</span>
                  </button>
                </div>
              )}

              {/* DROP ALTITUDE SLIDER (Active in Drop Mode) */}
              {actionMode === 'drop' && (
                <div className="space-y-3 p-3 rounded-lg bg-purple-50/70 border border-purple-200/90 shadow-sm">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-purple-900/80 font-bold">Release Altitude (Drop Height)</span>
                    <span className="text-purple-700 font-bold">{dropAltitude.toFixed(2)} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="3.0"
                    step="0.1"
                    value={dropAltitude}
                    onChange={(e) => setDropAltitude(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <button
                    onClick={() => handleDropHero()}
                    className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>Drop From Height</span>
                  </button>
                </div>
              )}

              {/* Gravitational Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-purple-900/70 uppercase">Gravitational Field</span>
                  <span className="text-purple-700 font-bold">-{currentGravity.toFixed(2)} m/s²</span>
                </div>
                {/* 4 Preset Pills: EARTH, MOON, MARS, 0-G */}
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {(
                    [
                      { id: 'earth', label: 'EARTH' },
                      { id: 'moon', label: 'MOON' },
                      { id: 'mars', label: 'MARS' },
                      { id: 'zerog', label: '0-G' }
                    ] as const
                  ).map((p) => {
                    const isSelected = selectedPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPreset(p.id)}
                        className={`py-1.5 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.35)]'
                            : 'bg-purple-50 hover:bg-purple-100/80 text-purple-800 border border-purple-200/80'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minecraft Voxel Skin Selector */}
              <div className="space-y-1.5 pt-1">
                <span className="text-purple-900/70 text-[11px] uppercase block">Minecraft Entity Skin</span>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'slime', label: 'Slime' },
                    { id: 'tnt', label: 'TNT' },
                    { id: 'diamond', label: 'Diamond' },
                    { id: 'sphere', label: 'Ender' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setObjectSkin(s.id as any);
                        soundEffects.playScanBeep();
                      }}
                      className={`py-1 text-[10px] font-bold rounded border uppercase transition-all ${
                        objectSkin === s.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-purple-50/70 border-purple-200 text-purple-800 hover:border-purple-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mass Scale */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-900/70">Mass Scale</span>
                  <span className="text-purple-950 font-bold">{mass.toFixed(2)} kg</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.05"
                  value={mass}
                  onChange={(e) => setMass(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Restitution / Bounce */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-900/70">Restitution / Bounce</span>
                  <span className="text-purple-950 font-bold">{restitution.toFixed(2)} e</span>
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

              {/* Surface Friction */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-900/70">Surface Friction</span>
                  <span className="text-purple-950 font-bold">{friction.toFixed(2)} μ</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={friction}
                  onChange={(e) => setFriction(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Drop Altitude Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-purple-900/70">Release Altitude (Drop Height)</span>
                  <span className="text-purple-700 font-bold">{dropAltitude.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="3.0"
                  step="0.1"
                  value={dropAltitude}
                  onChange={(e) => setDropAltitude(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Simulation Overlays */}
              <div className="pt-3 border-t border-purple-100 space-y-2.5">
                <span className="text-[10px] text-purple-900/50 uppercase font-bold tracking-wider block">
                  Simulation Overlays
                </span>

                {/* Toggle 1: Trajectory Arc */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-purple-900">Trajectory Arc</span>
                  <button
                    onClick={() => setShowTrajectoryArc(!showTrajectoryArc)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      showTrajectoryArc ? 'bg-purple-600' : 'bg-purple-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        showTrajectoryArc ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Dynamic Mesh Normals */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-purple-900">Dynamic Mesh Normals</span>
                  <button
                    onClick={() => setShowMeshNormals(!showMeshNormals)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      showMeshNormals ? 'bg-purple-600' : 'bg-purple-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        showMeshNormals ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Contact Manifold */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-purple-900">Contact Manifold</span>
                  <button
                    onClick={() => setShowContactManifold(!showContactManifold)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                      showContactManifold ? 'bg-purple-600' : 'bg-purple-200'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        showContactManifold ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Apply Parameters Button */}
              <button
                onClick={handleApplyParameters}
                className="w-full mt-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95 shadow-[0_4px_16px_rgba(147,51,234,0.3)]"
              >
                Apply Parameters
              </button>
            </div>
          </aside>

          {/* 4. RIGHT PANEL: TELEMETRY FEED */}
          <aside className="absolute right-5 top-5 w-80 rounded-xl bg-white/95 border border-purple-200 backdrop-blur-xl p-5 shadow-xl z-20 flex flex-col font-mono text-xs max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 font-bold uppercase tracking-wider text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span>Telemetry Feed</span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-purple-600 font-semibold">
                <span className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">60 FPS</span>
                <span className="px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200">128Hz</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {/* Primary Kinematics */}
              <div>
                <span className="text-[10px] text-purple-900/50 uppercase font-bold tracking-wider block mb-2">
                  Primary Kinematics
                </span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/80">
                    <span className="text-[9px] text-purple-800/70 uppercase block">Velocity</span>
                    <strong className="text-purple-950 text-sm block">
                      {telemetry ? telemetry.speed.toFixed(1) : '24.5'}
                    </strong>
                    <span className="text-[8px] text-purple-600">m/s</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/80">
                    <span className="text-[9px] text-purple-800/70 uppercase block">Altitude</span>
                    <strong className="text-purple-950 text-sm block">
                      {telemetry ? telemetry.height.toFixed(2) : '8.91'}
                    </strong>
                    <span className="text-[8px] text-purple-600">m</span>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200/80">
                    <span className="text-[9px] text-purple-800/70 uppercase block">Accel</span>
                    <strong className="text-purple-950 text-sm block">{accelG}</strong>
                    <span className="text-[8px] text-purple-600">G</span>
                  </div>
                </div>
              </div>

              {/* Energy Barometer */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-purple-900/70 uppercase">Energy Barometer</span>
                  <span className="text-purple-950 font-bold">{totalE.toFixed(1)} J</span>
                </div>

                {/* Kinetic Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-purple-700">Kinetic</span>
                    <span className="text-purple-700 font-bold">{kineticE.toFixed(1)} J</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-75"
                      style={{ width: `${kineticPct}%` }}
                    />
                  </div>
                </div>

                {/* Potential Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-fuchsia-700">Potential</span>
                    <span className="text-fuchsia-700 font-bold">{potentialE.toFixed(1)} J</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-fuchsia-500 transition-all duration-75"
                      style={{ width: `${potentialPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Vector & State Matrix */}
              <div className="space-y-2 pt-2 border-t border-purple-100">
                <span className="text-[10px] text-purple-900/50 uppercase font-bold tracking-wider block">
                  Vector & State Matrix
                </span>
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-purple-800/70">POS [V]</span>
                    <span className="text-purple-950 font-medium">
                      {posX}, {posY}, {posZ}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800/70">ROT [Q]</span>
                    <span className="text-purple-950 font-medium">0.00, 0.707, 0.00, 0.707</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-800/70">SOLVER</span>
                    <span className="text-purple-700 font-bold">SUBSTEP_4 (0.8ms)</span>
                  </div>
                  <div className="flex justify-between pt-1 text-[9px] text-purple-700 border-t border-purple-100">
                    <span>Target Point:</span>
                    <span className="font-semibold">{lastDropLocation}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions: Export Telemetry & Clear */}
              <div className="flex items-center gap-2 pt-3 border-t border-purple-100">
                <button
                  onClick={() => {
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
                      JSON.stringify({ telemetry, vectorState, timestamp: Date.now() }, null, 2)
                    )}`;
                    const downloadAnchor = document.createElement('a');
                    downloadAnchor.setAttribute('href', dataStr);
                    downloadAnchor.setAttribute('download', `spatialphys-telemetry-${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 hover:text-purple-950 border border-purple-200 font-mono text-[11px] uppercase tracking-wider transition-colors font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Telemetry</span>
                </button>
                <button
                  onClick={handleResetSim}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-rose-50 text-purple-700 hover:text-rose-600 border border-purple-200 transition-colors"
                  title="Clear Telemetry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </aside>

          {/* 5. BOTTOM FLOATING CONTROLLER DOCK */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center p-1.5 rounded-full bg-white/95 border border-purple-300 shadow-xl backdrop-blur-xl gap-1.5">
            <button
              onClick={() => handleLaunchHero()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 transition-all"
              title="Launch object with ballistic trajectory (Spacebar)"
            >
              <Rocket className="w-4 h-4 fill-current" />
              <span>Launch Object</span>
            </button>

            <button
              onClick={() => handleDropHero()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-mono text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
              title="Drop object vertically onto table"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Drop Ball</span>
            </button>

            <button
              onClick={handleSpawnObject}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-purple-800 hover:text-purple-950 font-mono text-xs font-bold uppercase tracking-wider hover:bg-purple-50 transition-colors active:scale-95"
              title="Spawn additional dynamic block"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Spawn Block</span>
            </button>

            <div className="hidden sm:flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-semibold border border-purple-200/80">
              <span>Space = Fire 🚀</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
