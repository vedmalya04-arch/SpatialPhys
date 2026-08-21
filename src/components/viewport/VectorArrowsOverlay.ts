import * as THREE from 'three';
import { PhysicsVectorState, VectorOverlayOptions } from '../../types';

export class VectorArrowsOverlay {
  public group: THREE.Group;
  private velArrow: THREE.ArrowHelper;
  private accArrow: THREE.ArrowHelper;
  private gravArrow: THREE.ArrowHelper;
  private normArrow: THREE.ArrowHelper;
  private frictArrow: THREE.ArrowHelper;
  private resArrow: THREE.ArrowHelper;

  constructor() {
    this.group = new THREE.Group();

    // Initialize 3D Arrow Helpers
    // 1. Velocity (Cyan)
    this.velArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0x38bdf8,
      0.2,
      0.12
    );

    // 2. Acceleration (Amber)
    this.accArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0xfbbf24,
      0.2,
      0.12
    );

    // 3. Gravity (Purple)
    this.gravArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0xc084fc,
      0.2,
      0.12
    );

    // 4. Normal Force (Emerald)
    this.normArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0x34d399,
      0.2,
      0.12
    );

    // 5. Friction Force (Crimson)
    this.frictArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0xfb7185,
      0.2,
      0.12
    );

    // 6. Resultant Force (Yellow)
    this.resArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1,
      0xfacc15,
      0.24,
      0.14
    );

    this.group.add(this.velArrow);
    this.group.add(this.accArrow);
    this.group.add(this.gravArrow);
    this.group.add(this.normArrow);
    this.group.add(this.frictArrow);
    this.group.add(this.resArrow);
  }

  public update(vectorState: PhysicsVectorState, options: VectorOverlayOptions): void {
    const origin = new THREE.Vector3(
      vectorState.position.x,
      vectorState.position.y,
      vectorState.position.z
    );

    const scale = options.vectorScale || 1.0;

    // Helper to safely set arrow
    const setArrow = (
      arrow: THREE.ArrowHelper,
      x: number,
      y: number,
      z: number,
      visible: boolean,
      lengthScale: number = 0.25,
      minLen: number = 0.15
    ) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      if (!visible || len < 0.05) {
        arrow.visible = false;
        return;
      }
      arrow.visible = true;
      arrow.position.copy(origin);
      const dir = new THREE.Vector3(x, y, z).normalize();
      arrow.setDirection(dir);
      const visualLength = Math.max(minLen, Math.min(2.5, len * lengthScale * scale));
      arrow.setLength(visualLength, visualLength * 0.25, visualLength * 0.15);
    };

    // Update individual vectors
    // Velocity (0.25 length scale)
    setArrow(
      this.velArrow,
      vectorState.velocity.x,
      vectorState.velocity.y,
      vectorState.velocity.z,
      options.showVelocity,
      0.22
    );

    // Acceleration (0.08 length scale)
    setArrow(
      this.accArrow,
      vectorState.acceleration.x,
      vectorState.acceleration.y,
      vectorState.acceleration.z,
      options.showAcceleration,
      0.08
    );

    // Gravity Force
    setArrow(
      this.gravArrow,
      vectorState.gravityForce.x,
      vectorState.gravityForce.y,
      vectorState.gravityForce.z,
      options.showGravity,
      0.09
    );

    // Normal Force
    setArrow(
      this.normArrow,
      vectorState.normalForce.x,
      vectorState.normalForce.y,
      vectorState.normalForce.z,
      options.showNormalForce,
      0.09
    );

    // Friction Force
    setArrow(
      this.frictArrow,
      vectorState.frictionForce.x,
      vectorState.frictionForce.y,
      vectorState.frictionForce.z,
      options.showFrictionForce,
      0.15
    );

    // Resultant Net Force
    setArrow(
      this.resArrow,
      vectorState.resultantForce.x,
      vectorState.resultantForce.y,
      vectorState.resultantForce.z,
      options.showResultantForce,
      0.1
    );
  }
}
