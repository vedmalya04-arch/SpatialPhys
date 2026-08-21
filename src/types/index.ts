// Core TypeScript Types for SpatialPhys

export type SurfaceType = 'table' | 'floor' | 'wall' | 'obstacle' | 'ramp';

export interface ReconstructedSurface {
  id: string;
  name: string;
  type: SurfaceType;
  position: [number, number, number]; // x, y, z center in meters
  dimensions: [number, number, number]; // width (x), height (y), depth (z)
  rotation?: [number, number, number]; // euler rotation in radians
  materialType: 'wood' | 'glass' | 'metal' | 'carpet' | 'tile' | 'concrete' | 'ice' | 'rubber';
  friction: number; // coefficient of friction (0.05 to 1.0)
  restitution: number; // bounciness (0.0 to 0.98)
  color: string;
  isCollidable: boolean;
  confidence: number; // 0 to 100%
  realWorldHeight: number; // in meters from ground
  label: string;
}

export type PhysicsShapeType = 'sphere' | 'box' | 'cylinder';

export interface PhysicsObjectConfig {
  id: string;
  name: string;
  type: PhysicsShapeType;
  mass: number; // in kg (0.1kg to 50kg)
  radius?: number; // for sphere/cylinder
  dimensions?: [number, number, number]; // for box/cylinder [w, h, d]
  position: [number, number, number]; // initial or current pos
  velocity: [number, number, number]; // initial or current linear velocity
  restitution: number; // bounciness (0.0 - 0.98)
  friction: number; // friction coefficient (0.0 - 1.0)
  color: string;
  isHero: boolean; // is this the main hero ball?
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
  magnitude: number;
}

export interface PhysicsVectorState {
  position: Vector3D;
  velocity: Vector3D;
  acceleration: Vector3D;
  gravityForce: Vector3D;
  normalForce: Vector3D;
  frictionForce: Vector3D;
  resultantForce: Vector3D;
  isOnGround: boolean;
  activeContactSurfaceName: string | null;
}

export interface TrajectoryPoint {
  x: number;
  y: number;
  z: number;
  time: number;
}

export interface TrajectoryTheoretical {
  points: TrajectoryPoint[];
  maxHeight: number;
  range: number;
  timeOfFlight: number;
  landingPosition: [number, number, number];
}

export type GravityPresetName = 'earth' | 'moon' | 'mars' | 'jupiter' | 'zero_g' | 'custom';

export interface GravityPreset {
  id: GravityPresetName;
  name: string;
  value: number; // m/s^2
  description: string;
  icon?: string;
}

export interface VectorOverlayOptions {
  showVelocity: boolean;
  showAcceleration: boolean;
  showGravity: boolean;
  showNormalForce: boolean;
  showFrictionForce: boolean;
  showResultantForce: boolean;
  showTrajectory: boolean;
  showTrail: boolean;
  vectorScale: number;
}

export interface SimulationTelemetry {
  time: number;
  dt: number;
  height: number;
  speed: number;
  kineticEnergy: number; // 0.5 * m * v^2
  potentialEnergy: number; // m * g * h
  totalEnergy: number;
  maxHeightAchieved: number;
  maxSpeedAchieved: number;
  bounceCount: number;
  distanceTraveled: number;
  isSimulating: boolean;
}

export interface CVFeaturePoint {
  x: number;
  y: number;
  z: number;
  confidence: number;
  color: string;
}

export interface EnvironmentScanResult {
  scanId: string;
  roomName: string;
  isFallbackDemo: boolean;
  source: 'webcam' | 'photo_upload' | 'preset_demo';
  surfaces: ReconstructedSurface[];
  pointCloud: CVFeaturePoint[];
  previewImageUrl?: string;
  timestamp: number;
}

export type AppMode = 'scan' | 'inspect' | 'lab' | 'experiments' | 'challenges';

export interface PhysicsExperiment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  objective: string;
  expectedOutcome: string;
  formulas: { label: string; formula: string; explanation: string }[];
  setup: {
    gravity: number;
    gravityPreset: GravityPresetName;
    object: Partial<PhysicsObjectConfig>;
    launchVelocity?: number;
    launchAngle?: number;
    vectors: Partial<VectorOverlayOptions>;
  };
}

export interface PhysicsChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  description: string;
  instructions: string;
  targetDescription: string;
  targetPosition: [number, number, number];
  targetRadius: number; // tolerance sphere in meters
  targetType: 'land_on_table' | 'distance' | 'max_height' | 'friction_stop';
  targetValue?: number; // e.g. 3.0 meters
  requiredGravity?: number;
  initialObject: Partial<PhysicsObjectConfig>;
  hint: string;
  completed: boolean;
  highScore?: number;
}
