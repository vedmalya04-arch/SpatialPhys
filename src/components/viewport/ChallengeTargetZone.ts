import * as THREE from 'three';
import { PhysicsChallenge } from '../../types';

export class ChallengeTargetZone {
  public group: THREE.Group;
  private ringMesh: THREE.Mesh;
  private innerDisk: THREE.Mesh;
  private verticalBeam: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // 1. Outer Holographic Ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = -Math.PI / 2;
    this.group.add(this.ringMesh);

    // 2. Inner Pulsing Disk
    const diskGeo = new THREE.CircleGeometry(0.32, 32);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3
    });
    this.innerDisk = new THREE.Mesh(diskGeo, diskMat);
    this.innerDisk.rotation.x = -Math.PI / 2;
    this.innerDisk.position.y = 0.002;
    this.group.add(this.innerDisk);

    // 3. Vertical Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 3.5, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.4
    });
    this.verticalBeam = new THREE.Mesh(beamGeo, beamMat);
    this.verticalBeam.position.y = 1.75;
    this.group.add(this.verticalBeam);
  }

  public update(challenge: PhysicsChallenge | null, time: number = 0): void {
    if (!challenge) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    const [tx, ty, tz] = challenge.targetPosition;
    this.group.position.set(tx, ty, tz);

    // Dynamic Pulsing Animation
    const pulse = 1 + Math.sin(time * 4) * 0.12;
    this.ringMesh.scale.set(pulse, pulse, 1);
    this.ringMesh.rotation.z = time * 0.8;
  }
}
