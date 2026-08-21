import { EnvironmentScanResult, ReconstructedSurface, CVFeaturePoint } from '../../types';

// Helper to generate realistic point cloud for room
function generateRoomPointCloud(surfaces: ReconstructedSurface[], pointCount: number = 250): CVFeaturePoint[] {
  const points: CVFeaturePoint[] = [];
  
  surfaces.forEach((surface) => {
    const pointsPerSurface = Math.floor(pointCount / surfaces.length);
    const [sx, sy, sz] = surface.position;
    const [w, h, d] = surface.dimensions;

    for (let i = 0; i < pointsPerSurface; i++) {
      const px = sx + (Math.random() - 0.5) * w;
      const py = sy + (surface.type === 'floor' || surface.type === 'table' ? (Math.random() - 0.5) * 0.05 : (Math.random() - 0.5) * h);
      const pz = sz + (Math.random() - 0.5) * d;

      points.push({
        x: Number(px.toFixed(3)),
        y: Number(py.toFixed(3)),
        z: Number(pz.toFixed(3)),
        confidence: Math.round(85 + Math.random() * 14),
        color: surface.type === 'table' ? '#38bdf8' : surface.type === 'floor' ? '#34d399' : '#fbbf24'
      });
    }
  });

  return points;
}

// 1. Study Room with Work Desk (Default hero room)
const studyDeskSurfaces: ReconstructedSurface[] = [
  {
    id: 'floor-main',
    name: 'Hardwood Floor Plane',
    type: 'floor',
    position: [0, 0, 0],
    dimensions: [7.0, 0.1, 7.0],
    materialType: 'wood',
    friction: 0.35,
    restitution: 0.65,
    color: '#1e293b',
    isCollidable: true,
    confidence: 98,
    realWorldHeight: 0.0,
    label: 'FLOOR: Hardwood Parquet (y = 0.00m)'
  },
  {
    id: 'table-study-desk',
    name: 'Study Desk Tabletop',
    type: 'table',
    position: [0, 0.78, -1.2],
    dimensions: [2.2, 0.08, 1.1],
    materialType: 'wood',
    friction: 0.22,
    restitution: 0.75,
    color: '#0284c7',
    isCollidable: true,
    confidence: 96,
    realWorldHeight: 0.78,
    label: 'RECONSTRUCTED TABLE: Oak Work Desk (y = 0.78m)'
  },
  {
    id: 'table-side-bench',
    name: 'Side Coffee Stand',
    type: 'table',
    position: [2.1, 0.52, -0.4],
    dimensions: [0.9, 0.06, 0.9],
    materialType: 'metal',
    friction: 0.18,
    restitution: 0.82,
    color: '#0d9488',
    isCollidable: true,
    confidence: 91,
    realWorldHeight: 0.52,
    label: 'RECONSTRUCTED STAND: Low Side Stand (y = 0.52m)'
  },
  {
    id: 'wall-back',
    name: 'Back Wall Surface',
    type: 'wall',
    position: [0, 1.75, -3.2],
    dimensions: [7.0, 3.5, 0.1],
    materialType: 'concrete',
    friction: 0.5,
    restitution: 0.45,
    color: '#0f172a',
    isCollidable: true,
    confidence: 95,
    realWorldHeight: 1.75,
    label: 'WALL: Back Studio Wall (z = -3.20m)'
  },
  {
    id: 'wall-left',
    name: 'Left Wall Surface',
    type: 'wall',
    position: [-3.5, 1.75, 0],
    dimensions: [0.1, 3.5, 7.0],
    materialType: 'concrete',
    friction: 0.5,
    restitution: 0.45,
    color: '#0f172a',
    isCollidable: true,
    confidence: 93,
    realWorldHeight: 1.75,
    label: 'WALL: Left Partition Wall (x = -3.50m)'
  }
];

// 2. Physics Laboratory Bench with Incline Wedge
const physicsLabSurfaces: ReconstructedSurface[] = [
  {
    id: 'floor-lab',
    name: 'Vinyl Lab Floor',
    type: 'floor',
    position: [0, 0, 0],
    dimensions: [8.0, 0.1, 8.0],
    materialType: 'tile',
    friction: 0.28,
    restitution: 0.7,
    color: '#111827',
    isCollidable: true,
    confidence: 99,
    realWorldHeight: 0.0,
    label: 'FLOOR: Anti-Static Lab Vinyl (y = 0.00m)'
  },
  {
    id: 'table-lab-bench',
    name: 'Heavy Lab Workstation',
    type: 'table',
    position: [0, 0.88, -1.0],
    dimensions: [2.6, 0.1, 1.2],
    materialType: 'wood',
    friction: 0.2,
    restitution: 0.8,
    color: '#2563eb',
    isCollidable: true,
    confidence: 97,
    realWorldHeight: 0.88,
    label: 'LAB BENCH: Granite-Reinforced Table (y = 0.88m)'
  },
  {
    id: 'obstacle-ramp',
    name: 'Incline Launch Ramp',
    type: 'ramp',
    position: [-0.9, 1.05, -1.0],
    dimensions: [0.7, 0.04, 0.5],
    rotation: [0, 0, -0.28], // ~16 deg slope
    materialType: 'metal',
    friction: 0.1,
    restitution: 0.85,
    color: '#f59e0b',
    isCollidable: true,
    confidence: 92,
    realWorldHeight: 1.05,
    label: 'RAMP: Incline Plane (16° Angle)'
  },
  {
    id: 'wall-blackboard',
    name: 'Lab Blackboard Wall',
    type: 'wall',
    position: [0, 2.0, -3.5],
    dimensions: [8.0, 4.0, 0.1],
    materialType: 'concrete',
    friction: 0.45,
    restitution: 0.5,
    color: '#064e3b',
    isCollidable: true,
    confidence: 96,
    realWorldHeight: 2.0,
    label: 'WALL: Blackboard Analysis Wall (z = -3.50m)'
  }
];

// 3. Living Room with Low Coffee Table & Carpet
const livingRoomSurfaces: ReconstructedSurface[] = [
  {
    id: 'floor-rug',
    name: 'Living Room Wool Rug',
    type: 'floor',
    position: [0, 0, 0],
    dimensions: [6.5, 0.1, 6.5],
    materialType: 'carpet',
    friction: 0.72,
    restitution: 0.4,
    color: '#1e1b4b',
    isCollidable: true,
    confidence: 97,
    realWorldHeight: 0.0,
    label: 'FLOOR: High-Friction Carpet (y = 0.00m, μ = 0.72)'
  },
  {
    id: 'table-coffee',
    name: 'Glass Coffee Table',
    type: 'table',
    position: [0, 0.45, -0.9],
    dimensions: [1.8, 0.05, 1.0],
    materialType: 'glass',
    friction: 0.12,
    restitution: 0.88,
    color: '#06b6d4',
    isCollidable: true,
    confidence: 94,
    realWorldHeight: 0.45,
    label: 'TABLE: Low Glass Coffee Table (y = 0.45m, e = 0.88)'
  },
  {
    id: 'obstacle-ottoman',
    name: 'Padded Ottoman',
    type: 'obstacle',
    position: [-1.6, 0.42, -0.8],
    dimensions: [0.8, 0.4, 0.8],
    materialType: 'rubber',
    friction: 0.85,
    restitution: 0.25,
    color: '#9333ea',
    isCollidable: true,
    confidence: 90,
    realWorldHeight: 0.42,
    label: 'OBSTACLE: Cushion Ottoman (y = 0.42m)'
  },
  {
    id: 'wall-living-back',
    name: 'Media Console Wall',
    type: 'wall',
    position: [0, 1.75, -2.8],
    dimensions: [6.5, 3.5, 0.1],
    materialType: 'concrete',
    friction: 0.4,
    restitution: 0.5,
    color: '#0f172a',
    isCollidable: true,
    confidence: 96,
    realWorldHeight: 1.75,
    label: 'WALL: Living Room Boundary (z = -2.80m)'
  }
];

// Pre-built Scan Demos
export const PRESET_ROOMS: Record<string, EnvironmentScanResult> = {
  study_desk: {
    scanId: 'scan-preset-study',
    roomName: 'Modern Study Desk & Workspace',
    isFallbackDemo: true,
    source: 'preset_demo',
    surfaces: studyDeskSurfaces,
    pointCloud: generateRoomPointCloud(studyDeskSurfaces, 300),
    timestamp: Date.now()
  },
  physics_lab: {
    scanId: 'scan-preset-lab',
    roomName: 'Physics Lab Workstation & Ramp',
    isFallbackDemo: true,
    source: 'preset_demo',
    surfaces: physicsLabSurfaces,
    pointCloud: generateRoomPointCloud(physicsLabSurfaces, 320),
    timestamp: Date.now()
  },
  living_room: {
    scanId: 'scan-preset-living',
    roomName: 'Living Room with Low Coffee Table & Rug',
    isFallbackDemo: true,
    source: 'preset_demo',
    surfaces: livingRoomSurfaces,
    pointCloud: generateRoomPointCloud(livingRoomSurfaces, 280),
    timestamp: Date.now()
  }
};

export const DEFAULT_FALLBACK_SCAN = PRESET_ROOMS.study_desk;
