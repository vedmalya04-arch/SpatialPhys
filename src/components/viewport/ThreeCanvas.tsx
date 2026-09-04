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
import { MinecraftRoomMesh } from './MinecraftRoomMesh';
import { PhysicsObjectsRenderer } from './PhysicsObjectsRenderer';
import { VectorArrowsOverlay } from './VectorArrowsOverlay';
import { TrajectoryArc } from './TrajectoryArc';

interface ThreeCanvasProps {
  scanResult: EnvironmentScanResult;
  vectorOptions: VectorOverlayOptions;
  theoreticalTrajectory: TrajectoryTheoretical | null;
  activeChallenge: PhysicsChallenge | null;
  onTelemetryUpdate: (telemetry: SimulationTelemetry, vectorState: PhysicsVectorState) => void;
  cameraViewPreset?: 'perspective' | 'top' | 'side' | 'follow';
  onTableClick?: (position: [number, number, number], mode: 'launch' | 'drop') => void;
  dropAltitude?: number;
  objectSkin?: string;
  actionMode?: 'launch' | 'drop';
  launchSpeed?: number;
  launchAngle?: number;
  launchYaw?: number;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  scanResult,
  vectorOptions,
  theoreticalTrajectory,
  activeChallenge,
  onTelemetryUpdate,
  cameraViewPreset = 'perspective',
  onTableClick,
  dropAltitude = 1.4,
  objectSkin = 'slime',
  actionMode = 'launch',
  launchSpeed = 10.5,
  launchAngle = 45,
  launchYaw = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to persistent Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Submodules
  const mcRoomRef = useRef<MinecraftRoomMesh | null>(null);
  const objectsRendererRef = useRef<PhysicsObjectsRenderer | null>(null);
  const vectorArrowsRef = useRef<VectorArrowsOverlay | null>(null);
  const trajectoryArcRef = useRef<TrajectoryArc | null>(null);

  // Drop Target Reticle & Indicator
  const dropIndicatorGroupRef = useRef<THREE.Group | null>(null);
  const ghostBallMeshRef = useRef<THREE.Mesh | null>(null);
  const dropLineRef = useRef<THREE.Line | null>(null);
  const aimArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseScreenPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hoveredTablePosRef = useRef<THREE.Vector3 | null>(null);

  // Orbit / Interaction State
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 4.8, theta: Math.PI / 4.2, phi: Math.PI / 3.2 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0.78, -1.2));

  // Initialize Scene & Renderer
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene with ambient purple twilight Minecraft atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#201138');
    scene.fog = new THREE.FogExp2('#201138', 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2.7, 3.2);
    camera.lookAt(0, 0.78, -1.2);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Vibrant Minecraft Lighting System
    // Cozy warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.1);
    scene.add(ambientLight);

    // Warm directional sunlight streaming in
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    sunLight.position.set(3.5, 6.0, 2.5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Purple atmospheric bounce fill light
    const purpleLight = new THREE.PointLight(0xa855f7, 1.4, 8);
    purpleLight.position.set(-2.8, 2.0, -1.2);
    scene.add(purpleLight);

    // 5. Build Sub-Components: Minecraft Voxel Room
    const mcRoom = new MinecraftRoomMesh();
    scene.add(mcRoom.group);
    mcRoomRef.current = mcRoom;

    const objectsRenderer = new PhysicsObjectsRenderer();
    objectsRenderer.setSkin(objectSkin);
    scene.add(objectsRenderer.group);
    objectsRendererRef.current = objectsRenderer;

    const vectorArrows = new VectorArrowsOverlay();
    scene.add(vectorArrows.group);
    vectorArrowsRef.current = vectorArrows;

    const trajectoryArc = new TrajectoryArc();
    scene.add(trajectoryArc.group);
    trajectoryArcRef.current = trajectoryArc;

    // 6. Interactive Drop Target Reticle (Purple Theme)
    const dropGroup = new THREE.Group();
    dropGroup.visible = false;

    // Target Voxel Disc on Table
    const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    dropGroup.add(ringMesh);

    const innerDiscGeo = new THREE.CircleGeometry(0.16, 32);
    const innerDiscMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const innerDiscMesh = new THREE.Mesh(innerDiscGeo, innerDiscMat);
    innerDiscMesh.rotation.x = -Math.PI / 2;
    dropGroup.add(innerDiscMesh);

    // Altitude Vertical Drop Guide Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1.4, 0)
    ]);
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xd946ef,
      dashSize: 0.08,
      gapSize: 0.04,
      linewidth: 2
    });
    const dropLine = new THREE.Line(lineGeo, lineMat);
    dropLine.computeLineDistances();
    dropGroup.add(dropLine);
    dropLineRef.current = dropLine;

    // Directional Aim Vector Arrow for Launch Mode
    const initAngleRad = ((launchAngle ?? 45) * Math.PI) / 180;
    const initYawRad = ((launchYaw ?? 0) * Math.PI) / 180;
    const initArrowDir = new THREE.Vector3(
      Math.cos(initAngleRad) * Math.sin(initYawRad),
      Math.sin(initAngleRad),
      -Math.cos(initAngleRad) * Math.cos(initYawRad)
    ).normalize();
    const aimArrow = new THREE.ArrowHelper(initArrowDir, new THREE.Vector3(0, 0.18, 0), 1.2, 0xd946ef, 0.28, 0.16);
    aimArrow.visible = actionMode === 'launch';
    dropGroup.add(aimArrow);
    aimArrowRef.current = aimArrow;

    // Ghost Preview Voxel Cube
    const ghostGeo = new THREE.BoxGeometry(0.36, 0.36, 0.36);
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.6,
      wireframe: true
    });
    const ghostBall = new THREE.Mesh(ghostGeo, ghostMat);
    ghostBall.position.set(0, actionMode === 'launch' ? 0.18 : 1.4, 0);
    dropGroup.add(ghostBall);
    ghostBallMeshRef.current = ghostBall;

    scene.add(dropGroup);
    dropIndicatorGroupRef.current = dropGroup;

    // Initial Physics Setup
    physicsEngine.loadSurfaces(scanResult.surfaces);
    objectsRenderer.updateHeroMesh(physicsEngine.getHeroConfig());

    // 7. Animation Render Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      physicsEngine.step(dt);

      const heroBody = physicsEngine.getHeroBody();
      objectsRenderer.syncWithPhysics(heroBody);

      // Animate Minecraft torches
      if (mcRoomRef.current) {
        mcRoomRef.current.update(currentTime / 1000);
      }

      const vectorState = physicsEngine.getVectorState();
      const telemetry = physicsEngine.getTelemetry();

      vectorArrows.update(vectorState, vectorOptions);
      trajectoryArc.updateTrail(physicsEngine.getTrajectoryHistory(), vectorOptions.showTrail);

      // Pulse the drop indicator ring
      if (dropIndicatorGroupRef.current && dropIndicatorGroupRef.current.visible) {
        const pulse = 1.0 + Math.sin(currentTime * 0.008) * 0.08;
        ringMesh.scale.set(pulse, pulse, 1);
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

  // Update object skin when changed
  useEffect(() => {
    if (objectsRendererRef.current) {
      objectsRendererRef.current.setSkin(objectSkin);
      objectsRendererRef.current.updateHeroMesh(physicsEngine.getHeroConfig());
    }
  }, [objectSkin]);

  // Update reticle appearance, altitude line, and aim vector when parameters change
  useEffect(() => {
    if (!ghostBallMeshRef.current || !dropLineRef.current) return;

    const isLaunch = actionMode === 'launch';
    if (aimArrowRef.current) {
      aimArrowRef.current.visible = isLaunch;

      if (isLaunch) {
        const angleRad = ((launchAngle ?? 45) * Math.PI) / 180;
        const yawRad = ((launchYaw ?? 0) * Math.PI) / 180;
        const dir = new THREE.Vector3(
          Math.cos(angleRad) * Math.sin(yawRad),
          Math.sin(angleRad),
          -Math.cos(angleRad) * Math.cos(yawRad)
        ).normalize();

        const arrowLen = Math.max(0.6, Math.min(2.2, (launchSpeed ?? 10) * 0.12));
        aimArrowRef.current.setDirection(dir);
        aimArrowRef.current.setLength(arrowLen, arrowLen * 0.28, arrowLen * 0.16);
      }
    }

    dropLineRef.current.visible = !isLaunch;

    if (isLaunch) {
      ghostBallMeshRef.current.position.y = 0.18;
    } else {
      ghostBallMeshRef.current.position.y = dropAltitude;
      dropLineRef.current.geometry.setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, dropAltitude, 0)
      ]);
      dropLineRef.current.computeLineDistances();
    }
  }, [actionMode, launchSpeed, launchAngle, launchYaw, dropAltitude]);

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
      camera.position.set(0, 6.0, -1.2);
      camera.lookAt(0, 0.78, -1.2);
    } else if (cameraViewPreset === 'side') {
      camera.position.set(4.2, 1.4, -1.2);
      camera.lookAt(0, 0.78, -1.2);
    } else if (cameraViewPreset === 'perspective') {
      camera.position.set(0, 2.7, 3.2);
      camera.lookAt(0, 0.78, -1.2);
    }
  }, [cameraViewPreset]);

  // Raycast helper to project mouse cursor onto Minecraft crafting table (y = 0.86m)
  const updateRaycastReticle = (clientX: number, clientY: number) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = raycasterRef.current;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cameraRef.current);

    // Crafting table top plane is at y = 0.78 + 0.08 = 0.86m
    const tablePlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.86);
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const hitPoint = new THREE.Vector3();
    let isHit = false;

    // Check intersection with crafting table surface
    if (raycaster.ray.intersectPlane(tablePlane, hitPoint)) {
      const withinTableX = Math.abs(hitPoint.x) <= 1.4;
      const withinTableZ = Math.abs(hitPoint.z - (-1.2)) <= 0.85;

      if (withinTableX && withinTableZ) {
        isHit = true;
      }
    }

    // Check floor plane if not directly over table
    if (!isHit && raycaster.ray.intersectPlane(floorPlane, hitPoint)) {
      if (Math.hypot(hitPoint.x, hitPoint.z - (-1.2)) < 3.8) {
        isHit = true;
      }
    }

    if (isHit && dropIndicatorGroupRef.current) {
      dropIndicatorGroupRef.current.visible = true;
      dropIndicatorGroupRef.current.position.copy(hitPoint);
      hoveredTablePosRef.current = hitPoint.clone();
    } else if (dropIndicatorGroupRef.current) {
      dropIndicatorGroupRef.current.visible = false;
      hoveredTablePosRef.current = null;
    }
  };

  // Mouse Orbit & Drop Interaction Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    mouseScreenPosRef.current = { x: e.clientX, y: e.clientY };
    updateRaycastReticle(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updateRaycastReticle(e.clientX, e.clientY);

    if (!isDraggingRef.current || !cameraRef.current) return;

    const dx = e.clientX - prevMousePosRef.current.x;
    const dy = e.clientY - prevMousePosRef.current.y;
    dragDistanceRef.current += Math.abs(dx) + Math.abs(dy);
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };

    // Orbit Camera around Crafting Table
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

  const handleMouseUp = (e: React.MouseEvent) => {
    isDraggingRef.current = false;

    // If quick click on table, launch or drop ball at exact 3D spot!
    if (dragDistanceRef.current < 6 && onTableClick && hoveredTablePosRef.current) {
      if (actionMode === 'launch') {
        const launchPos: [number, number, number] = [
          Number(hoveredTablePosRef.current.x.toFixed(2)),
          Number((hoveredTablePosRef.current.y + 0.18).toFixed(2)),
          Number(hoveredTablePosRef.current.z.toFixed(2))
        ];
        onTableClick(launchPos, 'launch');
      } else {
        const dropPos: [number, number, number] = [
          Number(hoveredTablePosRef.current.x.toFixed(2)),
          Number((hoveredTablePosRef.current.y + dropAltitude).toFixed(2)),
          Number(hoveredTablePosRef.current.z.toFixed(2))
        ];
        onTableClick(dropPos, 'drop');
      }
    }
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    if (dropIndicatorGroupRef.current) {
      dropIndicatorGroupRef.current.visible = false;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    const sph = cameraSphericalRef.current;
    sph.radius = Math.max(2.0, Math.min(10.0, sph.radius + e.deltaY * 0.004));

    const x = sph.radius * Math.sin(sph.phi) * Math.sin(sph.theta);
    const y = sph.radius * Math.cos(sph.phi);
    const z = sph.radius * Math.sin(sph.phi) * Math.cos(sph.theta);

    cameraRef.current.position.set(
      cameraTargetRef.current.x + x,
      cameraTargetRef.current.y + y,
      cameraTargetRef.current.z + z
    );
    cameraRef.current.lookAt(cameraTargetRef.current);
    updateRaycastReticle(e.clientX, e.clientY);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair active:cursor-grabbing overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    />
  );
};
