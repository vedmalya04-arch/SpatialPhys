import * as CANNON from 'cannon-es';
import {
  PhysicsObjectConfig,
  ReconstructedSurface,
  PhysicsVectorState,
  SimulationTelemetry,
  TrajectoryTheoretical,
  TrajectoryPoint
} from '../../types';
import { soundEffects } from '../audio/SoundEffects';

export class PhysicsEngine {
  private world: CANNON.World;
  private heroBody: CANNON.Body | null = null;
  private secondaryBodies: Map<string, CANNON.Body> = new Map();
  private surfaceBodies: Map<string, CANNON.Body> = new Map();
  private defaultMaterial: CANNON.Material;

  // Active Simulation State
  private currentGravity: number = 9.81;
  private isRunning: boolean = true;
  private simTime: number = 0;
  private prevVelocity: CANNON.Vec3 = new CANNON.Vec3(0, 0, 0);
  private currentAcceleration: CANNON.Vec3 = new CANNON.Vec3(0, 0, 0);
  private activeContactSurface: string | null = null;
  private normalForceMag: number = 0;
  private normalForceVec: CANNON.Vec3 = new CANNON.Vec3(0, 0, 0);
  private frictionForceVec: CANNON.Vec3 = new CANNON.Vec3(0, 0, 0);

  // Initial Hero Object Config for Reset
  private initialHeroConfig: PhysicsObjectConfig = {
    id: 'hero-ball',
    name: 'Hero Physics Ball',
    type: 'sphere',
    mass: 1.0,
    radius: 0.22,
    position: [0, 2.2, -1.2],
    velocity: [0, 0, 0],
    restitution: 0.78,
    friction: 0.25,
    color: '#38bdf8',
    isHero: true
  };

  // Metrics tracking
  private maxHeightAchieved: number = 2.2;
  private maxSpeedAchieved: number = 0;
  private bounceCount: number = 0;
  private distanceTraveled: number = 0;
  private prevPosition: CANNON.Vec3 = new CANNON.Vec3(0, 2.2, -1.2);
  private trajectoryHistory: TrajectoryPoint[] = [];

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.81, 0)
    });
    this.world.broadphase = new CANNON.NaiveBroadphase();
    (this.world.solver as CANNON.GSSolver).iterations = 12;

    this.defaultMaterial = new CANNON.Material('default');
    const contactMat = new CANNON.ContactMaterial(this.defaultMaterial, this.defaultMaterial, {
      friction: 0.25,
      restitution: 0.75
    });
    this.world.addContactMaterial(contactMat);

    this.setupHeroObject(this.initialHeroConfig);
  }

  // Set Global Gravity (m/s^2)
  public setGravity(g: number): void {
    this.currentGravity = Math.max(0, g);
    this.world.gravity.set(0, -this.currentGravity, 0);
  }

  public getGravity(): number {
    return this.currentGravity;
  }

  // Load Reconstructed Surfaces into Physics World as Colliders
  public loadSurfaces(surfaces: ReconstructedSurface[]): void {
    // Remove existing surface bodies
    this.surfaceBodies.forEach((body) => {
      this.world.removeBody(body);
    });
    this.surfaceBodies.clear();

    surfaces.forEach((surface) => {
      if (!surface.isCollidable) return;

      const [sx, sy, sz] = surface.position;
      const [w, h, d] = surface.dimensions;

      // Create Box Collider for surface
      const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
      const mat = new CANNON.Material(surface.materialType);
      
      const body = new CANNON.Body({
        mass: 0, // Static rigid body
        position: new CANNON.Vec3(sx, sy, sz),
        shape,
        material: mat
      });

      if (surface.rotation) {
        body.quaternion.setFromEuler(
          surface.rotation[0],
          surface.rotation[1],
          surface.rotation[2],
          'XYZ'
        );
      }

      // Add Contact Material with Hero Ball
      const contactMat = new CANNON.ContactMaterial(this.defaultMaterial, mat, {
        friction: surface.friction,
        restitution: surface.restitution
      });
      this.world.addContactMaterial(contactMat);

      // Listen for collision impact
      body.addEventListener('collide', (e: { contact: { getImpactVelocityAlongNormal: () => number } }) => {
        const impactVel = Math.abs(e.contact.getImpactVelocityAlongNormal());
        if (impactVel > 0.3) {
          const mass = this.heroBody ? this.heroBody.mass : 1.0;
          soundEffects.playBounce(impactVel, mass, surface.materialType);
          this.bounceCount++;
        }
      });

      this.world.addBody(body);
      this.surfaceBodies.set(surface.id, body);
    });
  }

  // Setup / Spawn Hero Physics Object
  public setupHeroObject(config: Partial<PhysicsObjectConfig>): void {
    if (this.heroBody) {
      this.world.removeBody(this.heroBody);
      this.heroBody = null;
    }

    this.initialHeroConfig = { ...this.initialHeroConfig, ...config };
    const { type, mass, radius = 0.22, dimensions = [0.4, 0.4, 0.4], position, velocity, restitution, friction } = this.initialHeroConfig;

    let shape: CANNON.Shape;
    if (type === 'box') {
      shape = new CANNON.Box(new CANNON.Vec3(dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2));
    } else if (type === 'cylinder') {
      shape = new CANNON.Cylinder(radius, radius, dimensions[1], 16);
    } else {
      shape = new CANNON.Sphere(radius);
    }

    const mat = new CANNON.Material('heroMat');
    this.defaultMaterial = mat;

    this.heroBody = new CANNON.Body({
      mass: Math.max(0.01, mass),
      position: new CANNON.Vec3(position[0], position[1], position[2]),
      velocity: new CANNON.Vec3(velocity[0], velocity[1], velocity[2]),
      shape,
      material: mat,
      linearDamping: 0.02,
      angularDamping: 0.05
    });

    // Contact material with world surfaces
    const selfContact = new CANNON.ContactMaterial(mat, mat, {
      friction,
      restitution
    });
    this.world.addContactMaterial(selfContact);

    this.world.addBody(this.heroBody);

    // Reset Metrics
    this.simTime = 0;
    this.maxHeightAchieved = position[1];
    this.maxSpeedAchieved = new CANNON.Vec3(velocity[0], velocity[1], velocity[2]).length();
    this.bounceCount = 0;
    this.distanceTraveled = 0;
    this.prevPosition.set(position[0], position[1], position[2]);
    this.prevVelocity.set(velocity[0], velocity[1], velocity[2]);
    this.trajectoryHistory = [{ x: position[0], y: position[1], z: position[2], time: 0 }];
  }

  // Spawn Secondary Physics Objects (Cubes / Balls / Obstacles)
  public spawnAdditionalObject(config: PhysicsObjectConfig): void {
    const { id, type, mass, radius = 0.2, dimensions = [0.35, 0.35, 0.35], position, velocity, restitution, friction } = config;

    let shape: CANNON.Shape;
    if (type === 'box') {
      shape = new CANNON.Box(new CANNON.Vec3(dimensions[0] / 2, dimensions[1] / 2, dimensions[2] / 2));
    } else if (type === 'cylinder') {
      shape = new CANNON.Cylinder(radius, radius, dimensions[1], 16);
    } else {
      shape = new CANNON.Sphere(radius);
    }

    const mat = new CANNON.Material(`mat-${id}`);
    const body = new CANNON.Body({
      mass: Math.max(0.01, mass),
      position: new CANNON.Vec3(position[0], position[1], position[2]),
      velocity: new CANNON.Vec3(velocity[0], velocity[1], velocity[2]),
      shape,
      material: mat,
      linearDamping: 0.02,
      angularDamping: 0.05
    });

    const contactMat = new CANNON.ContactMaterial(this.defaultMaterial, mat, {
      friction,
      restitution
    });
    this.world.addContactMaterial(contactMat);

    this.world.addBody(body);
    this.secondaryBodies.set(id, body);
  }

  // Clear all secondary objects
  public clearSecondaryObjects(): void {
    this.secondaryBodies.forEach((body) => {
      this.world.removeBody(body);
    });
    this.secondaryBodies.clear();
  }

  // Launch Projectile / Apply Impulse
  public launchHero(
    speed: number,
    angleDeg: number,
    directionYawDeg: number = 0,
    originPos?: [number, number, number]
  ): void {
    if (!this.heroBody) return;

    if (originPos) {
      this.heroBody.position.set(originPos[0], originPos[1], originPos[2]);
    }

    const angleRad = (angleDeg * Math.PI) / 180;
    const yawRad = (directionYawDeg * Math.PI) / 180;

    const vx = speed * Math.cos(angleRad) * Math.sin(yawRad);
    const vy = speed * Math.sin(angleRad);
    const vz = -speed * Math.cos(angleRad) * Math.cos(yawRad);

    this.heroBody.velocity.set(vx, vy, vz);
    this.heroBody.angularVelocity.set(0, 0, 0);

    soundEffects.playLaunch(speed);

    // Reset trajectory breadcrumbs
    this.trajectoryHistory = [
      {
        x: this.heroBody.position.x,
        y: this.heroBody.position.y,
        z: this.heroBody.position.z,
        time: 0
      }
    ];
    this.bounceCount = 0;
    this.simTime = 0;
  }

  // Step Simulation Frame
  public step(dt: number = 1 / 60): void {
    if (!this.isRunning || !this.heroBody) return;

    const clampedDt = Math.min(dt, 0.05);
    this.world.step(1 / 60, clampedDt, 3);
    this.simTime += clampedDt;

    const curPos = this.heroBody.position;
    const curVel = this.heroBody.velocity;

    // Calculate acceleration: a = (v_cur - v_prev) / dt
    this.currentAcceleration.set(
      (curVel.x - this.prevVelocity.x) / clampedDt,
      (curVel.y - this.prevVelocity.y) / clampedDt,
      (curVel.z - this.prevVelocity.z) / clampedDt
    );

    // Distance tracking
    const dx = curPos.x - this.prevPosition.x;
    const dy = curPos.y - this.prevPosition.y;
    const dz = curPos.z - this.prevPosition.z;
    const stepDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    this.distanceTraveled += stepDist;

    // Max metrics
    const currentSpeed = curVel.length();
    if (curPos.y > this.maxHeightAchieved) this.maxHeightAchieved = curPos.y;
    if (currentSpeed > this.maxSpeedAchieved) this.maxSpeedAchieved = currentSpeed;

    // Update history breadcrumbs
    if (this.trajectoryHistory.length < 300) {
      const lastPoint = this.trajectoryHistory[this.trajectoryHistory.length - 1];
      if (
        !lastPoint ||
        Math.hypot(curPos.x - lastPoint.x, curPos.y - lastPoint.y, curPos.z - lastPoint.z) > 0.08
      ) {
        this.trajectoryHistory.push({
          x: curPos.x,
          y: curPos.y,
          z: curPos.z,
          time: this.simTime
        });
      }
    }

    // Contact surface & normal force estimation
    this.evaluateContacts();

    // Store previous
    this.prevVelocity.copy(curVel);
    this.prevPosition.copy(curPos);
  }

  private evaluateContacts(): void {
    if (!this.heroBody) return;

    let hasContact = false;
    let contactSurfaceName: string | null = null;
    let normalMag = 0;
    const normalDir = new CANNON.Vec3(0, 1, 0);

    // Check contact with floor or tables
    for (const [id, body] of this.surfaceBodies.entries()) {
      const distY = this.heroBody.position.y - body.position.y;
      const radius = (this.heroBody.shapes[0] as CANNON.Sphere).radius || 0.22;
      const halfHeight = (body.shapes[0] as CANNON.Box).halfExtents ? (body.shapes[0] as CANNON.Box).halfExtents.y : 0.05;

      const isOverlappingY = Math.abs(distY - (halfHeight + radius)) < 0.06;
      const isWithinBoundsXZ =
        Math.abs(this.heroBody.position.x - body.position.x) <=
          ((body.shapes[0] as CANNON.Box).halfExtents ? (body.shapes[0] as CANNON.Box).halfExtents.x + radius : 4) &&
        Math.abs(this.heroBody.position.z - body.position.z) <=
          ((body.shapes[0] as CANNON.Box).halfExtents ? (body.shapes[0] as CANNON.Box).halfExtents.z + radius : 4);

      if (isOverlappingY && isWithinBoundsXZ) {
        hasContact = true;
        contactSurfaceName = id.includes('table') ? 'Reconstructed Table' : 'Floor Plane';
        normalMag = this.heroBody.mass * this.currentGravity;
        break;
      }
    }

    this.activeContactSurface = contactSurfaceName;
    this.normalForceMag = hasContact ? normalMag : 0;
    this.normalForceVec.set(0, this.normalForceMag, 0);

    // Friction = mu * Normal * (-v_norm)
    if (hasContact && this.heroBody.velocity.length() > 0.02) {
      const v = this.heroBody.velocity;
      const horizSpeed = Math.hypot(v.x, v.z);
      if (horizSpeed > 0.01) {
        const mu = this.initialHeroConfig.friction;
        const fMag = mu * normalMag;
        this.frictionForceVec.set(
          -(v.x / horizSpeed) * fMag,
          0,
          -(v.z / horizSpeed) * fMag
        );
      } else {
        this.frictionForceVec.set(0, 0, 0);
      }
    } else {
      this.frictionForceVec.set(0, 0, 0);
    }
  }

  // Get dynamic 3D physics vectors
  public getVectorState(): PhysicsVectorState {
    if (!this.heroBody) {
      const zero = { x: 0, y: 0, z: 0, magnitude: 0 };
      return {
        position: zero,
        velocity: zero,
        acceleration: zero,
        gravityForce: zero,
        normalForce: zero,
        frictionForce: zero,
        resultantForce: zero,
        isOnGround: false,
        activeContactSurfaceName: null
      };
    }

    const pos = this.heroBody.position;
    const vel = this.heroBody.velocity;
    const m = this.heroBody.mass;
    const g = this.currentGravity;

    const gravityForceY = -m * g;

    // Resultant force F_net = m * a
    const resFx = m * this.currentAcceleration.x;
    const resFy = m * this.currentAcceleration.y;
    const resFz = m * this.currentAcceleration.z;

    return {
      position: {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        magnitude: pos.length()
      },
      velocity: {
        x: vel.x,
        y: vel.y,
        z: vel.z,
        magnitude: vel.length()
      },
      acceleration: {
        x: this.currentAcceleration.x,
        y: this.currentAcceleration.y,
        z: this.currentAcceleration.z,
        magnitude: this.currentAcceleration.length()
      },
      gravityForce: {
        x: 0,
        y: gravityForceY,
        z: 0,
        magnitude: Math.abs(gravityForceY)
      },
      normalForce: {
        x: this.normalForceVec.x,
        y: this.normalForceVec.y,
        z: this.normalForceVec.z,
        magnitude: this.normalForceMag
      },
      frictionForce: {
        x: this.frictionForceVec.x,
        y: this.frictionForceVec.y,
        z: this.frictionForceVec.z,
        magnitude: this.frictionForceVec.length()
      },
      resultantForce: {
        x: resFx,
        y: resFy,
        z: resFz,
        magnitude: Math.sqrt(resFx * resFx + resFy * resFy + resFz * resFz)
      },
      isOnGround: this.normalForceMag > 0,
      activeContactSurfaceName: this.activeContactSurface
    };
  }

  // Get real-time Energy & Telemetry
  public getTelemetry(): SimulationTelemetry {
    if (!this.heroBody) {
      return {
        time: 0,
        dt: 1 / 60,
        height: 0,
        speed: 0,
        kineticEnergy: 0,
        potentialEnergy: 0,
        totalEnergy: 0,
        maxHeightAchieved: 0,
        maxSpeedAchieved: 0,
        bounceCount: 0,
        distanceTraveled: 0,
        isSimulating: false
      };
    }

    const m = this.heroBody.mass;
    const speed = this.heroBody.velocity.length();
    const height = Math.max(0, this.heroBody.position.y);
    const g = this.currentGravity;

    const kineticEnergy = 0.5 * m * speed * speed;
    const potentialEnergy = m * g * height;
    const totalEnergy = kineticEnergy + potentialEnergy;

    return {
      time: Number(this.simTime.toFixed(2)),
      dt: 1 / 60,
      height: Number(height.toFixed(3)),
      speed: Number(speed.toFixed(2)),
      kineticEnergy: Number(kineticEnergy.toFixed(2)),
      potentialEnergy: Number(potentialEnergy.toFixed(2)),
      totalEnergy: Number(totalEnergy.toFixed(2)),
      maxHeightAchieved: Number(this.maxHeightAchieved.toFixed(3)),
      maxSpeedAchieved: Number(this.maxSpeedAchieved.toFixed(2)),
      bounceCount: this.bounceCount,
      distanceTraveled: Number(this.distanceTraveled.toFixed(2)),
      isSimulating: this.isRunning
    };
  }

  // Calculate Theoretical Projectile Trajectory Parabola
  public calculateTheoreticalTrajectory(
    speed: number,
    angleDeg: number,
    directionYawDeg: number = 0,
    startPos: [number, number, number] = [0, 1.0, 0]
  ): TrajectoryTheoretical {
    const angleRad = (angleDeg * Math.PI) / 180;
    const yawRad = (directionYawDeg * Math.PI) / 180;
    const g = this.currentGravity <= 0 ? 0.001 : this.currentGravity;

    const [x0, y0, z0] = startPos;
    const v0x = speed * Math.cos(angleRad) * Math.sin(yawRad);
    const v0y = speed * Math.sin(angleRad);
    const v0z = -speed * Math.cos(angleRad) * Math.cos(yawRad);

    // Maximum Height: H = y0 + (v0y^2) / (2g)
    const maxHeight = y0 + (v0y * v0y) / (2 * g);

    // Time of Flight to y = 0: y(t) = y0 + v0y*t - 0.5*g*t^2 = 0
    // t = (v0y + sqrt(v0y^2 + 2*g*y0)) / g
    const discriminant = v0y * v0y + 2 * g * y0;
    const timeOfFlight = discriminant >= 0 ? (v0y + Math.sqrt(discriminant)) / g : 0;

    // Horizontal Range: R = v0_horiz * timeOfFlight
    const horizSpeed = speed * Math.cos(angleRad);
    const range = horizSpeed * timeOfFlight;

    // Generate arc points
    const points: TrajectoryPoint[] = [];
    const stepCount = 60;
    const tStep = (timeOfFlight || 2.0) / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const t = i * tStep;
      const px = x0 + v0x * t;
      const py = Math.max(0, y0 + v0y * t - 0.5 * g * t * t);
      const pz = z0 + v0z * t;

      points.push({ x: px, y: py, z: pz, time: t });
    }

    const landingX = x0 + v0x * timeOfFlight;
    const landingZ = z0 + v0z * timeOfFlight;

    return {
      points,
      maxHeight: Number(maxHeight.toFixed(2)),
      range: Number(range.toFixed(2)),
      timeOfFlight: Number(timeOfFlight.toFixed(2)),
      landingPosition: [Number(landingX.toFixed(2)), 0, Number(landingZ.toFixed(2))]
    };
  }

  // Get active Hero Body & position for rendering
  public getHeroBody(): CANNON.Body | null {
    return this.heroBody;
  }

  public getHeroConfig(): PhysicsObjectConfig {
    return this.initialHeroConfig;
  }

  public getTrajectoryHistory(): TrajectoryPoint[] {
    return this.trajectoryHistory;
  }

  // Reset Simulation
  public reset(): void {
    this.setupHeroObject(this.initialHeroConfig);
  }

  public setHeroPosition(x: number, y: number, z: number): void {
    if (!this.heroBody) return;
    this.heroBody.position.set(x, y, z);
    this.heroBody.velocity.set(0, 0, 0);
    this.heroBody.angularVelocity.set(0, 0, 0);
    this.initialHeroConfig.position = [x, y, z];
    this.trajectoryHistory = [{ x, y, z, time: 0 }];
    this.simTime = 0;
  }

  public togglePlayPause(): boolean {
    this.isRunning = !this.isRunning;
    return this.isRunning;
  }

  public isPaused(): boolean {
    return !this.isRunning;
  }
}

export const physicsEngine = new PhysicsEngine();
