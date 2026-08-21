import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObjectConfig } from '../../types';

export class PhysicsObjectsRenderer {
  public group: THREE.Group;
  private heroMesh: THREE.Mesh | null = null;
  private secondaryMeshes: Map<string, THREE.Mesh> = new Map();

  constructor() {
    this.group = new THREE.Group();
  }

  // Create or Update Hero Mesh
  public updateHeroMesh(config: PhysicsObjectConfig): void {
    if (this.heroMesh) {
      this.group.remove(this.heroMesh);
      this.heroMesh.geometry.dispose();
      (this.heroMesh.material as THREE.Material).dispose();
      this.heroMesh = null;
    }

    const { type, radius = 0.22, dimensions = [0.4, 0.4, 0.4], color } = config;

    let geometry: THREE.BufferGeometry;
    if (type === 'box') {
      geometry = new THREE.BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);
    } else if (type === 'cylinder') {
      geometry = new THREE.CylinderGeometry(radius, radius, dimensions[1], 32);
    } else {
      geometry = new THREE.SphereGeometry(radius, 32, 32);
    }

    // Hero Object Material: Sleek Metallic with subtle rim glow
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color || '#38bdf8'),
      metalness: 0.7,
      roughness: 0.25,
      emissive: new THREE.Color(color || '#38bdf8'),
      emissiveIntensity: 0.15
    });

    this.heroMesh = new THREE.Mesh(geometry, material);
    this.heroMesh.castShadow = true;
    this.heroMesh.receiveShadow = true;

    // Add Wireframe Overlay Ring
    if (type === 'sphere') {
      const ringGeo = new THREE.RingGeometry(radius * 0.99, radius * 1.01, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      this.heroMesh.add(ring);
    }

    this.group.add(this.heroMesh);
  }

  // Synchronize 3D meshes with Cannon-es Rigid Bodies
  public syncWithPhysics(heroBody: CANNON.Body | null): void {
    if (this.heroMesh && heroBody) {
      this.heroMesh.position.set(
        heroBody.position.x,
        heroBody.position.y,
        heroBody.position.z
      );
      this.heroMesh.quaternion.set(
        heroBody.quaternion.x,
        heroBody.quaternion.y,
        heroBody.quaternion.z,
        heroBody.quaternion.w
      );
    }
  }
}
