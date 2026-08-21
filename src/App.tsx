import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  AppMode,
  EnvironmentScanResult,
  GravityPresetName,
  PhysicsObjectConfig,
  VectorOverlayOptions,
  TrajectoryTheoretical,
  PhysicsExperiment,
  PhysicsChallenge,
  PhysicsVectorState,
  SimulationTelemetry,
  ReconstructedSurface,
  PhysicsShapeType
} from './types';
import { DEFAULT_FALLBACK_SCAN } from './services/vision/SampleRooms';
import { physicsEngine } from './services/physics/PhysicsEngine';
import { soundEffects } from './services/audio/SoundEffects';
import { surfaceScanner, LiveDetectedPlane } from './services/vision/SurfaceScanner';
import { PHYSICS_CHALLENGES } from './services/physics/ChallengesData';
import { GRAVITY_PRESETS } from './services/physics/ExperimentsData';
import { ThreeCanvas } from './components/viewport/ThreeCanvas';
import { LiveCameraBackground } from './components/viewport/LiveCameraBackground';
import { CameraScanModal } from './components/ui/CameraScanModal';
import { ExperimentModal } from './components/ui/ExperimentModal';
import { ChallengeModal } from './components/ui/ChallengeModal';
import { SurfaceInspectorModal } from './components/ui/SurfaceInspectorModal';

export const App: React.FC = () => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'simulation' | 'environment' | 'rendering' | 'experiments' | 'challenges'>('simulation');
  const [isARLiveMode, setIsARLiveMode] = useState<boolean>(true);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isExperimentModalOpen, setIsExperimentModalOpen] = useState<boolean>(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState<boolean>(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [cameraViewPreset, setCameraViewPreset] = useState<'perspective' | 'top' | 'side' | 'follow'>('perspective');

  // Live Computer Vision Surface Tracking
  const [liveDetectedPlane, setLiveDetectedPlane] = useState<LiveDetectedPlane | null>(
    surfaceScanner.getCurrentDetectedPlane()
  );
  const [isSurfaceLocked, setIsSurfaceLocked] = useState<boolean>(true);
  const [deskElevation, setDeskElevation] = useState<number>(0.78);

  // Environment Scan / Surface Colliders State
  const [scanResult, setScanResult] = useState<EnvironmentScanResult>(DEFAULT_FALLBACK_SCAN);

  // Physics State
  const [currentGravity, setCurrentGravity] = useState<number>(9.81);
  const [selectedGravityPreset, setSelectedGravityPreset] = useState<GravityPresetName>('earth');
  const [heroConfig, setHeroConfig] = useState<PhysicsObjectConfig>(physicsEngine.getHeroConfig());

  // Projectile Parameters
  const [launchSpeed, setLaunchSpeed] = useState<number>(7.5);
  const [launchAngle, setLaunchAngle] = useState<number>(45);

  // Vector & Visual Overlays State
  const [vectorOptions, setVectorOptions] = useState<VectorOverlayOptions>({
    showVelocity: true,
    showAcceleration: true,
    showGravity: true,
    showNormalForce: true,
    showFrictionForce: true,
    showResultantForce: true,
    showTrajectory: true,
    showTrail: true,
    vectorScale: 1.0
  });

  // Projectile Trajectory State
  const [theoreticalTrajectory, setTheoreticalTrajectory] = useState<TrajectoryTheoretical | null>(null);

  // Real-time Telemetry State
  const [telemetry, setTelemetry] = useState<SimulationTelemetry | null>(null);
  const [vectorState, setVectorState] = useState<PhysicsVectorState | null>(null);

  // Real-time Log Stream
  const [logs, setLogs] = useState<string[]>([
    '> SYS_INIT: OK',
    '> MESH_COLLIDER: BUILT',
    '> TRACKING: SURFACE_FOUND',
    '> AWAITING_INTERACTION...'
  ]);

  // Challenges State
  const [activeChallenge, setActiveChallenge] = useState<PhysicsChallenge | null>(null);
  const [challengeStatus, setChallengeStatus] = useState<{
    status: 'idle' | 'success' | 'failed';
    message: string;
    distanceError?: number;
  }>({ status: 'idle', message: 'Challenge ready' });

  // Add Log Entry
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-15), `> ${msg}`]);
  }, []);

  // Update Theoretical Trajectory on launch parameter change
  const updateTheoreticalTrajectory = useCallback(
    (speed: number, angleDeg: number) => {
      const pos = physicsEngine.getHeroConfig().position;
      const trajectory = physicsEngine.calculateTheoreticalTrajectory(speed, angleDeg, 0, pos);
      setTheoreticalTrajectory(trajectory);
    },
    []
  );

  useEffect(() => {
    updateTheoreticalTrajectory(launchSpeed, launchAngle);
  }, [launchSpeed, launchAngle, updateTheoreticalTrajectory]);

  // Handle Live Surface Locking from AR Camera View
  const handleLockSurface = (elevation: number) => {
    const lockedSurface = surfaceScanner.lockSurface(
      elevation,
      heroConfig.friction,
      heroConfig.restitution
    );

    const surfaces: ReconstructedSurface[] = [
      lockedSurface,
      {
        id: 'real-floor-plane',
        name: 'Floor Surface Plane',
        type: 'floor',
        position: [0, 0, 0],
        dimensions: [8.0, 0.1, 8.0],
        materialType: 'wood',
        friction: 0.35,
        restitution: 0.65,
        color: '#1e293b',
        isCollidable: true,
        confidence: 98,
        realWorldHeight: 0.0,
        label: 'REAL FLOOR PLANE (y = 0.00m)'
      }
    ];

    physicsEngine.loadSurfaces(surfaces);
    setScanResult((prev) => ({
      ...prev,
      surfaces,
      roomName: `Live Camera Surface @ ${elevation.toFixed(2)}m`,
      isFallbackDemo: false
    }));

    setIsSurfaceLocked(true);
    soundEffects.playFanfare();
    addLog(`COLLIDER_LOCKED: DESK_ELEVATION = ${elevation.toFixed(2)}m`);

    // Drop hero ball directly above locked surface
    physicsEngine.setHeroPosition(0, elevation + 1.2, -1.2);
  };

  const handleToggleLock = () => {
    if (isSurfaceLocked) {
      setIsSurfaceLocked(false);
      addLog('SURFACE: UNLOCKED (RE-CALIBRATING)');
    } else {
      handleLockSurface(deskElevation);
    }
  };

  // Handle Gravity Change
  const handleGravityChange = (val: number) => {
    const absVal = Math.abs(val);
    setCurrentGravity(absVal);
    physicsEngine.setGravity(absVal);
    updateTheoreticalTrajectory(launchSpeed, launchAngle);
    addLog(`GRAVITY: UPDATED -> -${absVal.toFixed(2)} m/s²`);
  };

  // Handle Hero Object Update
  const handleUpdateHeroConfig = (updates: Partial<PhysicsObjectConfig>) => {
    const newConfig = { ...heroConfig, ...updates };
    setHeroConfig(newConfig);
    physicsEngine.setupHeroObject(newConfig);
    updateTheoreticalTrajectory(launchSpeed, launchAngle);
    if (updates.mass !== undefined) addLog(`MASS: ${updates.mass.toFixed(2)} kg`);
    if (updates.restitution !== undefined) addLog(`RESTITUTION: ${updates.restitution.toFixed(2)}`);
  };

  // Handle Launch
  const handleLaunchProjectile = () => {
    updateTheoreticalTrajectory(launchSpeed, launchAngle);
    physicsEngine.launchHero(launchSpeed, launchAngle, 0);
    setChallengeStatus({ status: 'idle', message: 'In flight...' });
    addLog(`LAUNCH_PROJECTILE: v0 = ${launchSpeed.toFixed(1)} m/s @ ${launchAngle}°`);
  };

  // Handle Drop Object
  const handleDropHeroBall = () => {
    soundEffects.playLaunch(4);
    physicsEngine.setHeroPosition(0, deskElevation + 1.2, -1.2);
    updateTheoreticalTrajectory(launchSpeed, launchAngle);
    addLog('SPAWN_OBJECT: HERO_BALL DROPPED ONTO REAL DESK');
  };

  // Handle Simulation Reset
  const handleResetSimulation = () => {
    physicsEngine.reset();
    setChallengeStatus({ status: 'idle', message: 'Reset complete.' });
    addLog('RESET_SIMULATION: BODIES PURGED');
  };

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleResetSimulation();
      } else if (e.key === ' ') {
        physicsEngine.togglePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Apply Experiment
  const handleApplyExperiment = (experiment: PhysicsExperiment) => {
    const { setup } = experiment;
    handleGravityChange(setup.gravity);

    if (setup.object) {
      handleUpdateHeroConfig(setup.object);
    }
    if (setup.vectors) {
      setVectorOptions((prev) => ({ ...prev, ...setup.vectors }));
    }
    if (setup.launchVelocity && setup.launchAngle) {
      setLaunchSpeed(setup.launchVelocity);
      setLaunchAngle(setup.launchAngle);
      setTimeout(() => {
        physicsEngine.launchHero(setup.launchVelocity!, setup.launchAngle!, 0);
      }, 300);
    } else {
      handleResetSimulation();
    }
    setActiveTab('simulation');
    addLog(`EXPERIMENT_LOADED: ${experiment.title}`);
  };

  // Handle Select Challenge
  const handleSelectChallenge = (challenge: PhysicsChallenge) => {
    setActiveChallenge(challenge);
    if (challenge.requiredGravity !== undefined) {
      handleGravityChange(challenge.requiredGravity);
    }
    handleUpdateHeroConfig(challenge.initialObject);
    handleResetSimulation();
    setActiveTab('simulation');
    setChallengeStatus({
      status: 'idle',
      message: `Challenge Active: ${challenge.instructions}`
    });
    addLog(`CHALLENGE_STARTED: ${challenge.title}`);
  };

  // Live Challenge Evaluation Engine
  const handleTelemetryUpdate = useCallback(
    (newTelemetry: SimulationTelemetry, newVectorState: PhysicsVectorState) => {
      setTelemetry(newTelemetry);
      setVectorState(newVectorState);

      if (!activeChallenge || challengeStatus.status === 'success') return;

      const pos = newVectorState.position;
      const speed = newTelemetry.speed;
      const [tx, ty, tz] = activeChallenge.targetPosition;
      const targetRadius = activeChallenge.targetRadius;
      const dist = Math.hypot(pos.x - tx, pos.y - ty, pos.z - tz);

      if (activeChallenge.targetType === 'land_on_table') {
        if (newVectorState.isOnGround && speed < 0.18 && dist <= targetRadius) {
          setChallengeStatus({
            status: 'success',
            message: 'SUCCESS! Ball landed and secured on target desk zone! ⭐⭐⭐',
            distanceError: 0
          });
          soundEffects.playFanfare();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addLog('CHALLENGE_EVALUATION: SUCCESS');
        }
      } else if (activeChallenge.targetType === 'distance') {
        const traveled = newTelemetry.distanceTraveled;
        const targetVal = activeChallenge.targetValue || 3.0;
        const err = Math.abs(traveled - targetVal);

        if (newVectorState.isOnGround && speed < 0.25 && err <= 0.35) {
          setChallengeStatus({
            status: 'success',
            message: `SUCCESS! Distance: ${traveled.toFixed(2)}m (Target: ${targetVal}m) ⭐⭐⭐`,
            distanceError: err
          });
          soundEffects.playFanfare();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addLog('CHALLENGE_EVALUATION: SUCCESS (3M RANGE HIT)');
        }
      } else if (activeChallenge.targetType === 'max_height') {
        const peak = newTelemetry.maxHeightAchieved;
        const targetVal = activeChallenge.targetValue || 1.5;

        if (peak >= targetVal) {
          setChallengeStatus({
            status: 'success',
            message: `SUCCESS! Max Altitude: ${peak.toFixed(2)}m reached (Target ≥ ${targetVal}m) ⭐⭐⭐`,
            distanceError: 0
          });
          soundEffects.playFanfare();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addLog('CHALLENGE_EVALUATION: SUCCESS (1.5M HURDLE CLEARED)');
        }
      } else if (activeChallenge.targetType === 'friction_stop') {
        if (newVectorState.isOnGround && speed < 0.05 && dist <= targetRadius) {
          setChallengeStatus({
            status: 'success',
            message: 'SUCCESS! Block brought to rest inside target zone! ⭐⭐⭐',
            distanceError: 0
          });
          soundEffects.playFanfare();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          addLog('CHALLENGE_EVALUATION: SUCCESS (FRICTION BRAKE)');
        }
      }
    },
    [activeChallenge, challengeStatus.status, addLog]
  );

  // Update Surface Properties from Inspector
  const handleUpdateSurface = (id: string, updates: Partial<ReconstructedSurface>) => {
    const updatedSurfaces = scanResult.surfaces.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    const updatedScan = { ...scanResult, surfaces: updatedSurfaces };
    setScanResult(updatedScan);
    physicsEngine.loadSurfaces(updatedSurfaces);
  };

  // Sparkline Bars for Velocity
  const sparklineHeights = [
    Math.min(100, (telemetry?.speed || 0) * 12 + 10),
    Math.min(100, (telemetry?.speed || 0) * 10 + 20),
    Math.min(100, (telemetry?.speed || 0) * 14 + 15),
    Math.min(100, (telemetry?.speed || 0) * 18 + 30),
    Math.min(100, (telemetry?.speed || 0) * 16 + 25),
    Math.min(100, (telemetry?.speed || 0) * 22 + 40),
    Math.min(100, (telemetry?.speed || 0) * 25 + 50)
  ];

  return (
    <div className="relative w-screen h-screen m-0 p-0 overflow-hidden bg-black text-[#dce1fb] select-none font-body-md text-body-md antialiased selection:bg-[#06b6d4] selection:text-[#00424f]">
      {/* 1. Full-Screen WebRTC Live Camera Stream (Z-Index 0) */}
      <LiveCameraBackground
        isLiveActive={isARLiveMode}
        onPlaneDetected={(plane, points) => {
          setLiveDetectedPlane(plane);
          if (plane) setDeskElevation(plane.position[1]);
          if (points.length > 0) {
            setScanResult((prev) => ({
              ...prev,
              pointCloud: points
            }));
          }
        }}
      />

      {/* 2. 3D WebGL Canvas Layer (Transparent AR Overlay - Z-Index 10) */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        <ThreeCanvas
          scanResult={scanResult}
          vectorOptions={vectorOptions}
          theoreticalTrajectory={theoreticalTrajectory}
          activeChallenge={activeChallenge}
          onTelemetryUpdate={handleTelemetryUpdate}
          cameraViewPreset={cameraViewPreset}
          isARLiveMode={isARLiveMode}
          liveDetectedPlane={liveDetectedPlane}
          isSurfaceLocked={isSurfaceLocked}
        />
      </div>

      {/* 3. Top Navigation Bar (Floating Glassmorphism Pill) */}
      <nav className="fixed top-4 left-6 right-6 rounded-full glass-panel z-50 flex justify-between items-center px-6 py-2.5 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-[#06b6d4]/10 border border-[#06b6d4]/20 text-[#4cd7f6]">
            <span className="material-symbols-outlined text-[20px]">science</span>
          </div>
          <span className="font-headline-md text-[20px] font-bold text-[#dce1fb] tracking-wide font-sans">
            SpatialPhysX
          </span>
          <div className="w-px h-5 bg-[#869397]/30 mx-2"></div>
          
          {/* Live AR Camera Indicator */}
          <button
            onClick={() => setIsARLiveMode(!isARLiveMode)}
            className="flex items-center gap-2 px-3 py-1 bg-[#4ae176]/5 rounded-full border border-[#4ae176]/20 hover:bg-[#4ae176]/10 transition-colors"
            title={isARLiveMode ? 'Click to toggle Pre-Scanned Room Fallback' : 'Click to enable Live Webcam AR'}
          >
            <div className={`w-2 h-2 rounded-full ${isARLiveMode ? 'bg-[#4ae176] animate-pulse-green' : 'bg-amber-400'}`}></div>
            <span className={`font-mono text-[10px] tracking-widest uppercase font-bold ${isARLiveMode ? 'text-[#4ae176]' : 'text-amber-300'}`}>
              {isARLiveMode ? 'LIVE AR CAMERA' : 'DEMO MODE: PRE-SCANNED ROOM FALLBACK'}
            </span>
          </button>
        </div>

        {/* Center Mode Tabs */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`font-mono text-[12px] tracking-widest uppercase transition-colors pb-0.5 ${
              activeTab === 'simulation'
                ? 'text-[#06b6d4] border-b border-[#06b6d4] font-bold'
                : 'text-[#bcc9cd] hover:text-[#dce1fb]'
            }`}
          >
            Simulation
          </button>
          <button
            onClick={() => {
              setActiveTab('environment');
              setIsScanModalOpen(true);
            }}
            className={`font-mono text-[12px] tracking-widest uppercase transition-colors pb-0.5 ${
              activeTab === 'environment'
                ? 'text-[#06b6d4] border-b border-[#06b6d4] font-bold'
                : 'text-[#bcc9cd] hover:text-[#dce1fb]'
            }`}
          >
            Environment
          </button>
          <button
            onClick={() => {
              setActiveTab('experiments');
              setIsExperimentModalOpen(true);
            }}
            className={`font-mono text-[12px] tracking-widest uppercase transition-colors pb-0.5 ${
              activeTab === 'experiments'
                ? 'text-[#06b6d4] border-b border-[#06b6d4] font-bold'
                : 'text-[#bcc9cd] hover:text-[#dce1fb]'
            }`}
          >
            Experiments
          </button>
          <button
            onClick={() => {
              setActiveTab('challenges');
              setIsChallengeModalOpen(true);
            }}
            className={`font-mono text-[12px] tracking-widest uppercase transition-colors pb-0.5 ${
              activeTab === 'challenges'
                ? 'text-[#4ae176] border-b border-[#4ae176] font-bold'
                : 'text-[#bcc9cd] hover:text-[#dce1fb]'
            }`}
          >
            Challenges
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSimulation}
            className="bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/40 hover:bg-[#06b6d4]/20 hover:border-[#06b6d4]/60 font-mono text-[11px] px-4 py-1.5 rounded-sm active:scale-95 duration-150 transition-all uppercase tracking-wider font-bold"
          >
            Reset Sim
          </button>
          <button
            onClick={() => {
              const muted = soundEffects.toggleMute();
              setIsMuted(muted);
            }}
            className="text-[#bcc9cd] hover:text-[#06b6d4] transition-colors rounded p-1 active:scale-95 duration-150"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>
          <button
            onClick={() => setIsInspectorModalOpen(true)}
            className="text-[#bcc9cd] hover:text-[#06b6d4] transition-colors rounded p-1 active:scale-95 duration-150"
            title="Inspect Surface Parameters"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
          </button>
        </div>
      </nav>

      {/* 4. Left Sidebar - Physics Controls Panel */}
      <aside className="fixed left-6 top-24 bottom-24 w-80 rounded-xl glass-panel z-40 flex flex-col p-5 hidden md:flex inner-glow-cyan shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[#869397]/10 pb-4 mb-4">
          <div className="w-8 h-8 rounded bg-[#06b6d4]/10 flex items-center justify-center border border-[#06b6d4]/20">
            <span className="material-symbols-outlined text-[#06b6d4] text-[18px]">science</span>
          </div>
          <div>
            <h2 className="font-mono text-[13px] font-bold text-[#dce1fb] tracking-wider uppercase">
              Physics Parameters
            </h2>
            <p className="font-mono text-[10px] text-[#bcc9cd]/60">Global Env Configuration</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Parameter Group: Gravity */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-end mb-1">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#06b6d4] flex items-center gap-1.5 tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px]">south</span> Gravity
                </span>
                <span className="font-mono text-[9px] text-[#bcc9cd]/50 mt-0.5 block">Y-Axis Acceleration</span>
              </div>
              <span className="font-mono text-[11px] text-[#dce1fb] bg-[#33394c]/50 px-2 py-0.5 rounded border border-[#869397]/10">
                -{currentGravity.toFixed(2)} <span className="text-[10px] text-[#bcc9cd]">m/s²</span>
              </span>
            </div>
            
            {/* Gravity Slider */}
            <input
              className="w-full h-1.5 bg-[#2e3447] rounded-full accent-[#06b6d4] cursor-pointer"
              max="30"
              min="0"
              step="0.1"
              type="range"
              value={currentGravity}
              onChange={(e) => handleGravityChange(parseFloat(e.target.value))}
            />

            {/* Quick Gravity Presets */}
            <div className="grid grid-cols-4 gap-1 pt-1 font-mono text-[9px]">
              {[
                { name: 'Earth', val: 9.81 },
                { name: 'Moon', val: 1.62 },
                { name: 'Mars', val: 3.71 },
                { name: 'Jupiter', val: 24.79 }
              ].map((p) => (
                <button
                  key={p.name}
                  onClick={() => handleGravityChange(p.val)}
                  className={`py-0.5 px-1 rounded border transition-colors ${
                    Math.abs(currentGravity - p.val) < 0.1
                      ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#4cd7f6] font-bold'
                      : 'bg-[#151b2d] border-[#869397]/20 text-[#bcc9cd] hover:border-[#06b6d4]/50'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Parameter Group: Mass */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-end mb-1">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#06b6d4] flex items-center gap-1.5 tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px]">weight</span> Base Mass
                </span>
                <span className="font-mono text-[9px] text-[#bcc9cd]/50 mt-0.5 block">Spawn Object Weight</span>
              </div>
              <span className="font-mono text-[11px] text-[#dce1fb] bg-[#33394c]/50 px-2 py-0.5 rounded border border-[#869397]/10">
                {heroConfig.mass.toFixed(2)} <span className="text-[10px] text-[#bcc9cd]">kg</span>
              </span>
            </div>
            <input
              className="w-full h-1.5 bg-[#2e3447] rounded-full accent-[#06b6d4] cursor-pointer"
              max="10"
              min="0.1"
              step="0.1"
              type="range"
              value={heroConfig.mass}
              onChange={(e) => handleUpdateHeroConfig({ mass: parseFloat(e.target.value) })}
            />
          </div>

          {/* Parameter Group: Restitution (Bounciness) */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-end mb-1">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#06b6d4] flex items-center gap-1.5 tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px]">moving</span> Restitution
                </span>
                <span className="font-mono text-[9px] text-[#bcc9cd]/50 mt-0.5 block">Collision Bounciness (e)</span>
              </div>
              <span className="font-mono text-[11px] text-[#dce1fb] bg-[#33394c]/50 px-2 py-0.5 rounded border border-[#869397]/10">
                {heroConfig.restitution.toFixed(2)}
              </span>
            </div>
            <input
              className="w-full h-1.5 bg-[#2e3447] rounded-full accent-[#06b6d4] cursor-pointer"
              max="1"
              min="0"
              step="0.01"
              type="range"
              value={heroConfig.restitution}
              onChange={(e) => handleUpdateHeroConfig({ restitution: parseFloat(e.target.value) })}
            />
          </div>

          {/* Parameter Group: Friction */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-end mb-1">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#06b6d4] flex items-center gap-1.5 tracking-wider uppercase">
                  <span className="material-symbols-outlined text-[14px]">drag_handle</span> Friction
                </span>
                <span className="font-mono text-[9px] text-[#bcc9cd]/50 mt-0.5 block">Surface Friction (μ)</span>
              </div>
              <span className="font-mono text-[11px] text-[#dce1fb] bg-[#33394c]/50 px-2 py-0.5 rounded border border-[#869397]/10">
                {heroConfig.friction.toFixed(2)}
              </span>
            </div>
            <input
              className="w-full h-1.5 bg-[#2e3447] rounded-full accent-[#06b6d4] cursor-pointer"
              max="1"
              min="0"
              step="0.02"
              type="range"
              value={heroConfig.friction}
              onChange={(e) => handleUpdateHeroConfig({ friction: parseFloat(e.target.value) })}
            />
          </div>

          {/* Object Shape Selector */}
          <div className="pt-2">
            <span className="font-mono text-[10px] text-[#bcc9cd] uppercase block mb-1.5">Spawn Geometry</span>
            <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
              {(['sphere', 'box', 'cylinder'] as PhysicsShapeType[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => handleUpdateHeroConfig({ type: shape })}
                  className={`py-1 rounded border capitalize transition-colors ${
                    heroConfig.type === shape
                      ? 'bg-[#06b6d4]/20 border-[#06b6d4] text-[#4cd7f6] font-bold'
                      : 'bg-[#151b2d] border-[#869397]/20 text-[#bcc9cd] hover:border-[#06b6d4]/50'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Vector Launcher Integration */}
          <div className="pt-4 border-t border-[#869397]/10">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-[11px] font-bold text-[#dce1fb] uppercase tracking-wider">
                Projectile Vector
              </span>
              <span className="font-mono text-[10px] text-[#06b6d4] border border-[#06b6d4]/30 px-1.5 rounded">
                ACTIVE
              </span>
            </div>

            <div className="flex gap-4 items-center">
              {/* Circular Dial Crosshair */}
              <div className="relative w-20 h-20 rounded-full border border-[#06b6d4]/20 bg-[#070d1f]/50 flex items-center justify-center shrink-0">
                <div className="absolute inset-2 rounded-full border border-dashed border-[#869397]/20"></div>
                <div className="absolute w-full h-px bg-[#869397]/20"></div>
                <div className="absolute w-px h-full bg-[#869397]/20"></div>
                {/* Rotating Vector Line */}
                <div
                  className="absolute w-1/2 h-0.5 bg-[#06b6d4] origin-left shadow-[0_0_8px_#06b6d4] transition-transform duration-100"
                  style={{ transform: `rotate(-${launchAngle}deg)` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_5px_#fff]"></div>
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="bg-[#33394c]/30 p-1.5 rounded flex justify-between items-center border border-[#869397]/5">
                  <span className="font-mono text-[10px] text-[#bcc9cd]">Angle</span>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={launchAngle}
                    onChange={(e) => setLaunchAngle(parseInt(e.target.value, 10))}
                    className="w-16 accent-[#06b6d4]"
                  />
                  <span className="font-mono text-[11px] text-[#dce1fb] font-bold">{launchAngle}°</span>
                </div>
                <div className="bg-[#33394c]/30 p-1.5 rounded flex justify-between items-center border border-[#869397]/5">
                  <span className="font-mono text-[10px] text-[#bcc9cd]">Speed</span>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="0.5"
                    value={launchSpeed}
                    onChange={(e) => setLaunchSpeed(parseFloat(e.target.value))}
                    className="w-16 accent-[#06b6d4]"
                  />
                  <span className="font-mono text-[11px] text-[#dce1fb] font-bold">{launchSpeed.toFixed(1)}m/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply & Fire Button */}
        <button
          onClick={handleLaunchProjectile}
          className="mt-4 w-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 text-[#4cd7f6] font-mono text-[13px] font-bold py-2.5 rounded-sm hover:bg-[#06b6d4] hover:text-[#00424f] transition-all uppercase tracking-wider scanline-btn shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] active:scale-95"
        >
          Fire Projectile / Apply
        </button>
      </aside>

      {/* 5. Right Sidebar - Telemetry HUD */}
      <aside className="fixed right-6 top-24 bottom-24 w-80 rounded-xl glass-panel z-40 flex flex-col p-0 hidden md:flex overflow-hidden shadow-2xl border-r-0 border-t-0 border-b-0 border-l border-[#06b6d4]/20">
        <div className="p-4 border-b border-[#869397]/10 bg-[#2e3447]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-[#4ae176] rounded-sm animate-pulse"></div>
            <h2 className="font-mono text-[13px] font-bold text-[#4ae176] tracking-widest uppercase">
              Telemetry Feed
            </h2>
          </div>
          <span className="font-mono text-[9px] text-[#bcc9cd] bg-[#0c1324]/50 px-1.5 rounded border border-[#869397]/10">
            60hz
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 terminal-block bg-[#070d1f]/80">
          {/* Live Velocity Absolute */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-[#bcc9cd]/70 uppercase">Velocity Absolute |v|</span>
              <span className="text-[#4cd7f6]">{(telemetry?.speed || 0).toFixed(2)} m/s</span>
            </div>
            <div className="flex items-end gap-px h-6">
              {sparklineHeights.map((h, i) => (
                <div
                  key={i}
                  className="spark-bar"
                  style={{ height: `${h}%` }}
                />
              ))}
              <div className="spark-bar h-full bg-white shadow-[0_0_5px_#fff]"></div>
              <div className="w-full h-px bg-[#06b6d4]/20 mb-0.5"></div>
            </div>
          </div>

          {/* Energy States */}
          <div className="space-y-2.5 font-mono text-[11px]">
            <div className="bg-[#0c1324]/60 p-2 rounded-sm border border-[#06b6d4]/10">
              <div className="flex justify-between mb-1.5">
                <span className="text-[#bcc9cd] uppercase">Kinetic Energy (Ek)</span>
                <span className="text-[#4cd7f6] font-bold">{(telemetry?.kineticEnergy || 0).toFixed(1)} J</span>
              </div>
              <div className="w-full h-1.5 bg-[#2e3447] overflow-hidden">
                <div
                  className="h-full bg-[#06b6d4] transition-all duration-75"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((telemetry?.kineticEnergy || 0) / Math.max(1, telemetry?.totalEnergy || 1)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-[#0c1324]/60 p-2 rounded-sm border border-[#4ae176]/10">
              <div className="flex justify-between mb-1.5">
                <span className="text-[#bcc9cd] uppercase">Potential Energy (Ep)</span>
                <span className="text-[#4ae176] font-bold">{(telemetry?.potentialEnergy || 0).toFixed(1)} J</span>
              </div>
              <div className="w-full h-1.5 bg-[#2e3447] overflow-hidden">
                <div
                  className="h-full bg-[#4ae176] transition-all duration-75"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((telemetry?.potentialEnergy || 0) / Math.max(1, telemetry?.totalEnergy || 1)) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Coordinates Matrix */}
          <div className="pt-1">
            <span className="text-[#bcc9cd]/70 text-[10px] font-mono font-bold uppercase block mb-1.5">
              Vector Coordinates [World Space]
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
              <div className="bg-black/60 p-1.5 border border-[#ffb4ab]/20 text-[#dce1fb]">
                <span className="text-[#ffb4ab]/70 block text-[9px] mb-0.5">X_AXIS</span>
                {(vectorState?.velocity.x || 0).toFixed(2)}
              </div>
              <div className="bg-black/60 p-1.5 border border-[#4ae176]/20 text-[#dce1fb]">
                <span className="text-[#4ae176]/70 block text-[9px] mb-0.5">Y_ALT</span>
                {(telemetry?.height || 0).toFixed(2)}m
              </div>
              <div className="bg-black/60 p-1.5 border border-[#adc6ff]/20 text-[#dce1fb]">
                <span className="text-[#adc6ff]/70 block text-[9px] mb-0.5">Z_AXIS</span>
                {(vectorState?.velocity.z || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Live System Log Stream */}
          <div className="pt-2 border-t border-[#869397]/10 font-mono text-[9px] text-[#bcc9cd]/60 leading-relaxed max-h-28 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className={log.includes('COLLIDER') || log.includes('SUCCESS') ? 'text-[#4ae176]' : ''}>
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Log Actions */}
        <div className="p-3 border-t border-[#869397]/10 bg-[#2e3447]/30 flex gap-2">
          <button
            onClick={() => addLog(`EXPORT: LOG_PACKET_AT_${Date.now()}`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[#0c1324]/50 border border-[#06b6d4]/20 hover:bg-[#06b6d4]/10 text-[#4cd7f6] font-mono text-[11px] uppercase tracking-wider rounded-sm transition-colors font-bold"
          >
            <span className="material-symbols-outlined text-[14px]">download</span> Export Log
          </button>
          <button
            onClick={() => setLogs(['> SYS_INIT: OK', '> LOGS_CLEARED'])}
            className="w-10 flex items-center justify-center bg-[#0c1324]/50 border border-[#869397]/20 hover:border-[#ffb4ab]/50 hover:bg-[#ffb4ab]/10 text-[#bcc9cd] hover:text-[#ffb4ab] rounded-sm transition-colors"
            title="Clear Logs"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </aside>

      {/* 6. Bottom Navigation Bar (Floating Surface Lock & Object Spawner) */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full glass-panel inner-glow-cyan p-1.5 z-50 flex items-center shadow-2xl border border-[#06b6d4]/30 pointer-events-auto">
        <button
          onClick={handleToggleLock}
          className={`rounded-full px-6 py-2.5 flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
            isSurfaceLocked
              ? 'bg-[#4ae176] text-[#003915] shadow-[0_0_20px_rgba(74,225,118,0.4)]'
              : 'bg-[#06b6d4] text-[#00424f] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-white hover:text-black'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSurfaceLocked ? 'lock' : 'view_in_ar'}
          </span>
          {isSurfaceLocked ? `Surface Locked (${deskElevation.toFixed(2)}m)` : 'Lock Surface'}
        </button>

        <div className="w-px h-6 bg-[#869397]/30 mx-2"></div>

        <button
          onClick={handleDropHeroBall}
          className="text-[#dce1fb] hover:text-[#4cd7f6] hover:bg-[#06b6d4]/10 rounded-full px-6 py-2.5 flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-wider transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Spawn Object
        </button>
      </nav>

      {/* 7. Active Challenge Evaluation Banner */}
      {activeChallenge && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-2 glass-panel rounded-full border border-amber-500/50 shadow-2xl font-mono text-xs pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-bold text-amber-300 uppercase">{activeChallenge.title}:</span>
          <span className={challengeStatus.status === 'success' ? 'text-[#4ae176] font-bold' : 'text-[#dce1fb]'}>
            {challengeStatus.message}
          </span>
          <button
            onClick={() => handleSelectChallenge(activeChallenge)}
            className="ml-2 px-2.5 py-0.5 text-[10px] font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm"
          >
            RETRY
          </button>
          <button
            onClick={() => setActiveChallenge(null)}
            className="text-[#bcc9cd] hover:text-white text-sm ml-1"
            title="Dismiss Challenge"
          >
            ✕
          </button>
        </div>
      )}

      {/* 8. Modals */}
      <CameraScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={(result) => {
          setScanResult(result);
          physicsEngine.loadSurfaces(result.surfaces);
          addLog(`ROOM_LOADED: ${result.roomName}`);
        }}
      />

      <ExperimentModal
        isOpen={isExperimentModalOpen}
        onClose={() => setIsExperimentModalOpen(false)}
        onApplyExperiment={handleApplyExperiment}
      />

      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        activeChallenge={activeChallenge}
        onSelectChallenge={handleSelectChallenge}
        challengeStatus={challengeStatus}
        onRetryChallenge={() => activeChallenge && handleSelectChallenge(activeChallenge)}
      />

      <SurfaceInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        surfaces={scanResult.surfaces}
        onUpdateSurface={handleUpdateSurface}
      />
    </div>
  );
};
