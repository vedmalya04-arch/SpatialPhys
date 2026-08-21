import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  EnvironmentScanResult,
  VectorOverlayOptions,
  TrajectoryTheoretical,
  PhysicsChallenge,
  PhysicsVectorState,
  SimulationTelemetry
} from '../../types';
import { physicsEngine } from '../../services/physics/PhysicsEngine';
import { VectorArrowsOverlay } from './VectorArrowsOverlay';
import { TrajectoryArc } from './TrajectoryArc';
import { ReconstructedRoomMesh } from './ReconstructedRoomMesh';
import { PhysicsObjectsRenderer } from './PhysicsObjectsRenderer';
import { PointCloudVisualizer } from './PointCloudVisualizer';
import { ChallengeTargetZone } from './ChallengeTargetZone';
import { LiveSurfaceTrackerMesh } from './LiveSurfaceTrackerMesh';
import { LiveDetectedPlane } from '../../services/vision/SurfaceScanner';

interface ThreeCanvasProps {
  scanResult: EnvironmentScanResult;
  vectorOptions: VectorOverlayOptions;
  theoreticalTrajectory: TrajectoryTheoretical | null;
  activeChallenge: PhysicsChallenge | null;
  onTelemetryUpdate: (telemetry: SimulationTelemetry, vectorState: PhysicsVectorState) => void;
  cameraViewPreset?: 'perspective' | 'top' | 'side' | 'follow';
  isARLiveMode?: boolean;
  liveDetectedPlane?: LiveDetectedPlane | null;
  isSurfaceLocked?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  scanResult,
  vectorOptions,
  theoreticalTrajectory,
  activeChallenge,
  onTelemetryUpdate,
  cameraViewPreset = 'perspective',
  isARLiveMode = true,
  liveDetectedPlane = null,
  isSurfaceLocked = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to persistent Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Submodules
  const roomMeshRef = useRef<ReconstructedRoomMesh | null>(null);
  const objectsRendererRef = useRef<PhysicsObjectsRenderer | null>(null);
  const vectorArrowsRef = useRef<VectorArrowsOverlay | null>(null);
  const trajectoryArcRef = useRef<TrajectoryArc | null>(null);
  const pointCloudRef = useRef<PointCloudVisualizer | null>(null);
  const targetZoneRef = useRef<ChallengeTargetZone | null>(null);
  const liveTrackerRef = useRef<LiveSurfaceTrackerMesh | null>(null);

  // Orbit / Interaction State
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 5.5, theta: Math.PI / 4, phi: Math.PI / 3 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.8, -1.0));

  // Initialize Scene & Renderer
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with transparent support for AR Camera background
    const scene = new THREE.Scene();
    if (!isARLiveMode) {
      scene.background = new THREE.Color('#07090e');
      scene.fog = new THREE.FogExp2('#07090e', 0.05);
    } else {
      scene.background = null;
    }
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3.0, 4.2);
    camera.lookAt(0, 0.8, -1.0);
    cameraRef.current = camera;

    // 3. WebGL Renderer (alpha: true for transparent AR background)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(3.5, 6.5, 3.0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const bluePoint = new THREE.PointLight(0x38bdf8, 2.0, 8);
    bluePoint.position.set(-2.0, 2.8, -0.8);
    scene.add(bluePoint);

    // 5. Build Sub-Components
    const liveTracker = new LiveSurfaceTrackerMesh();
    scene.add(liveTracker.group);
    liveTrackerRef.current = liveTracker;

    const roomMesh = new ReconstructedRoomMesh();
    scene.add(roomMesh.group);
    roomMeshRef.current = roomMesh;

    const objectsRenderer = new PhysicsObjectsRenderer();
    scene.add(objectsRenderer.group);
    objectsRendererRef.current = objectsRenderer;

    const vectorArrows = new VectorArrowsOverlay();
    scene.add(vectorArrows.group);
    vectorArrowsRef.current = vectorArrows;

    const trajectoryArc = new TrajectoryArc();
    scene.add(trajectoryArc.group);
    trajectoryArcRef.current = trajectoryArc;

    const pointCloud = new PointCloudVisualizer();
    scene.add(pointCloud.group);
    pointCloudRef.current = pointCloud;

    const targetZone = new ChallengeTargetZone();
    scene.add(targetZone.group);
    targetZoneRef.current = targetZone;

    // Initial Physics Setup
    physicsEngine.loadSurfaces(scanResult.surfaces);
    roomMesh.rebuildSurfaces(scanResult.surfaces, isARLiveMode);
    objectsRenderer.updateHeroMesh(physicsEngine.getHeroConfig());
    pointCloud.updatePoints(scanResult.pointCloud);

    // 6. Animation Render Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      physicsEngine.step(dt);

      const heroBody = physicsEngine.getHeroBody();
      objectsRenderer.syncWithPhysics(heroBody);

      const vectorState = physicsEngine.getVectorState();
      const telemetry = physicsEngine.getTelemetry();

      vectorArrows.update(vectorState, vectorOptions);
      trajectoryArc.updateTrail(physicsEngine.getTrajectoryHistory(), vectorOptions.showTrail);
      targetZone.update(activeChallenge, currentTime / 1000);

      if (liveTrackerRef.current) {
        liveTrackerRef.current.update(liveDetectedPlane, isSurfaceLocked, currentTime / 1000);
      }

      if (cameraViewPreset === 'follow' && heroBody && camera) {
        camera.lookAt(heroBody.position.x, heroBody.position.y, heroBody.position.z);
      }

      onTelemetryUpdate(telemetry, vectorState);

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update background and room mode on AR toggle
  useEffect(() => {
    if (sceneRef.current && roomMeshRef.current) {
      if (isARLiveMode) {
        sceneRef.current.background = null;
        sceneRef.current.fog = null;
        roomMeshRef.current.rebuildSurfaces(scanResult.surfaces, true);
      } else {
        sceneRef.current.background = new THREE.Color('#07090e');
        sceneRef.current.fog = new THREE.FogExp2('#07090e', 0.05);
        roomMeshRef.current.rebuildSurfaces(scanResult.surfaces, false);
      }
    }
  }, [isARLiveMode]);

  // Update room when scanResult changes
  useEffect(() => {
    if (roomMeshRef.current && pointCloudRef.current) {
      physicsEngine.loadSurfaces(scanResult.surfaces);
      roomMeshRef.current.rebuildSurfaces(scanResult.surfaces, isARLiveMode);
      pointCloudRef.current.updatePoints(scanResult.pointCloud);
    }
  }, [scanResult, isARLiveMode]);

  // Update live tracker
  useEffect(() => {
    if (liveTrackerRef.current) {
      liveTrackerRef.current.update(liveDetectedPlane, isSurfaceLocked);
    }
  }, [liveDetectedPlane, isSurfaceLocked]);

  // Update trajectory display
  useEffect(() => {
    if (trajectoryArcRef.current) {
      trajectoryArcRef.current.updateTheoretical(
        theoreticalTrajectory,
        vectorOptions.showTrajectory
      );
    }
  }, [theoreticalTrajectory, vectorOptions.showTrajectory]);

  // Camera preset position changes
  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    if (cameraViewPreset === 'top') {
      camera.position.set(0, 7.0, -1.0);
      camera.lookAt(0, 0, -1.0);
    } else if (cameraViewPreset === 'side') {
      camera.position.set(5.0, 1.2, -1.2);
      camera.lookAt(0, 0.8, -1.2);
    } else if (cameraViewPreset === 'perspective') {
      camera.position.set(0, 3.0, 4.2);
      camera.lookAt(0, 0.8, -1.0);
    }
  }, [cameraViewPreset]);

  // Mouse Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !cameraRef.current) return;

    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sph = cameraSphericalRef.current;
    sph.theta -= dx * 0.008;
    sph.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, sph.phi - dy * 0.008));

    const x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
    const y = sph.radius * Math.cos(sph.phi);
    const z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);

    cameraRef.current.position.set(
      cameraTargetRef.current.x + x,
      cameraTargetRef.current.y + y,
      cameraTargetRef.current.z + z
    );
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const sph = cameraSphericalRef.current;
    sph.radius = Math.max(1.8, Math.min(15.0, sph.radius + e.deltaY * 0.004));

    const x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
    const y = sph.radius * Math.cos(sph.phi);
    const z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);

    cameraRef.current.position.set(
      cameraTargetRef.current.x + x,
      cameraTargetRef.current.y + y,
      cameraTargetRef.current.z + z
    );
    cameraRef.current.lookAt(cameraTargetRef.current);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};
