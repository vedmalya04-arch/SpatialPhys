import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsObjectConfig } from '../../types';
import { MinecraftTextureGenerator } from './MinecraftTextures';

export class PhysicsObjectsRenderer {
  public group: THREE.Group;
  private heroMesh: THREE.Mesh | null = null;
  private secondaryMeshes: Map<string, THREE.Mesh> = new Map();
  private currentSkin: string = 'slime';

  constructor() {
    this.group = new THREE.Group();
  }

  public setSkin(skin: string): void {
    this.currentSkin = skin;
  }

  // Create or Update Hero Mesh
  public updateHeroMesh(config: PhysicsObjectConfig): void {
    if (this.heroMesh) {
      this.group.remove(this.heroMesh);
      this.heroMesh.geometry.dispose();
      this.heroMesh = null;
    }

    const { type, radius = 0.22, dimensions = [0.38, 0.38, 0.38], color } = config;

    let geometry: THREE.BufferGeometry;
    let material: THREE.Material | THREE.Material[];

    if (this.currentSkin === 'slime' || type === 'box' && !this.currentSkin) {
      // Bouncy Minecraft Slime Cube
      geometry = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const slimeTex = MinecraftTextureGenerator.getSlimeTexture();
      material = new THREE.MeshStandardMaterial({
        map: slimeTex,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92,
        emissive: new THREE.Color('#3da327'),
        emissiveIntensity: 0.2
      });
    } else if (this.currentSkin === 'tnt') {
      // Iconic TNT Block
      geometry = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const tntTop = MinecraftTextureGenerator.getTntTop();
      const tntSide = MinecraftTextureGenerator.getTntSide();
      material = [
        new THREE.MeshStandardMaterial({ map: tntSide, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: tntSide, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: tntTop, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: tntTop, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: tntSide, roughness: 0.7 }),
        new THREE.MeshStandardMaterial({ map: tntSide, roughness: 0.7 })
      ];
    } else if (this.currentSkin === 'diamond') {
      // Radiant Diamond Block
      geometry = new THREE.BoxGeometry(0.38, 0.38, 0.38);
      const diamondTex = MinecraftTextureGenerator.getDiamondBlock();
      material = new THREE.MeshStandardMaterial({
        map: diamondTex,
        roughness: 0.25,
        metalness: 0.4,
        emissive: new THREE.Color('#06b6d4'),
        emissiveIntensity: 0.25
      });
    } else {
      // Classic Glowing Physics Sphere / Ender Ball
      geometry = new THREE.SphereGeometry(radius, 32, 32);
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color || '#38bdf8'),
        metalness: 0.8,
        roughness: 0.2,
        emissive: new THREE.Color(color || '#0284c7'),
        emissiveIntensity: 0.3
      });
    }

    this.heroMesh = new THREE.Mesh(geometry, material);
    this.heroMesh.castShadow = true;
    this.heroMesh.receiveShadow = true;

    this.group.add(this.heroMesh);
  }

  // Sync position & rotation from Cannon-es
  public syncWithPhysics(heroBody: CANNON.Body | null): void {
    if (!this.heroMesh || !heroBody) return;

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
