import * as THREE from 'three';
import { ReconstructedSurface } from '../../types';

export class ReconstructedRoomMesh {
  public group: THREE.Group;
  private surfaceMeshes: Map<string, THREE.Group> = new Map();
  private gridHelper: THREE.GridHelper | null = null;

  constructor() {
    this.group = new THREE.Group();
  }

  // Create 3D Text/Badge Sprite for surface
  private createSurfaceLabelSprite(surface: ReconstructedSurface): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Background pill
    ctx.fillStyle = 'rgba(13, 18, 31, 0.85)';
    ctx.strokeStyle = surface.type === 'table' ? '#38bdf8' : surface.type === 'floor' ? '#34d399' : '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 16);
    ctx.fill();
    ctx.stroke();

    // Type Tag
    ctx.fillStyle = surface.type === 'table' ? '#38bdf8' : surface.type === 'floor' ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 24px "Chakra Petch", sans-serif';
    ctx.fillText(surface.name.toUpperCase(), 24, 45);

    // Physics parameters
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px "JetBrains Mono", monospace';
    ctx.fillText(
      `Height: ${surface.realWorldHeight.toFixed(2)}m | μ = ${surface.friction} | e = ${surface.restitution}`,
      24,
      85
    );

    // Confidence badge
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(`${surface.confidence}% CONF`, 360, 45);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);

    return sprite;
  }

  public rebuildSurfaces(surfaces: ReconstructedSurface[], isARMode: boolean = false): void {
    // Clear old meshes
    this.surfaceMeshes.forEach((meshGroup) => {
      this.group.remove(meshGroup);
    });
    this.surfaceMeshes.clear();

    if (this.gridHelper) {
      this.group.remove(this.gridHelper);
      this.gridHelper = null;
    }

    // In LIVE AR Mode: DO NOT render fake solid 3D rooms/tables.
    // The webcam video is the visual reality.
    if (isARMode) {
      return;
    }

    // In Fallback 3D Room Mode: Build full 3D CAD environment
    surfaces.forEach((surface) => {
      const surfaceGroup = new THREE.Group();
      const [w, h, d] = surface.dimensions;
      const [px, py, pz] = surface.position;

      surfaceGroup.position.set(px, py, pz);
      if (surface.rotation) {
        surfaceGroup.rotation.set(surface.rotation[0], surface.rotation[1], surface.rotation[2]);
      }

      // 1. Solid Mesh Geometry
      let mainMat: THREE.Material;
      if (surface.type === 'floor') {
        mainMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0c1322'),
          roughness: 0.8,
          metalness: 0.2
        });
      } else if (surface.type === 'table') {
        mainMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(surface.materialType === 'glass' ? '#0284c7' : '#0369a1'),
          roughness: 0.35,
          metalness: 0.3,
          transparent: surface.materialType === 'glass',
          opacity: surface.materialType === 'glass' ? 0.75 : 0.95
        });
      } else {
        mainMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0f172a'),
          roughness: 0.9,
          metalness: 0.1
        });
      }

      const boxGeo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(boxGeo, mainMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      surfaceGroup.add(mesh);

      // 2. Table Legs (if table surface in 3D fallback mode)
      if (surface.type === 'table' && py > 0.3) {
        const legHeight = py - h / 2;
        const legRadius = 0.035;
        const legMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          metalness: 0.8,
          roughness: 0.3
        });

        const legOffsets = [
          [-w / 2 + 0.1, -h / 2 - legHeight / 2, -d / 2 + 0.1],
          [w / 2 - 0.1, -h / 2 - legHeight / 2, -d / 2 + 0.1],
          [-w / 2 + 0.1, -h / 2 - legHeight / 2, d / 2 - 0.1],
          [w / 2 - 0.1, -h / 2 - legHeight / 2, d / 2 - 0.1]
        ];

        legOffsets.forEach(([lx, ly, lz]) => {
          const legGeo = new THREE.CylinderGeometry(legRadius, legRadius, legHeight, 16);
          const legMesh = new THREE.Mesh(legGeo, legMat);
          legMesh.position.set(lx, ly, lz);
          legMesh.castShadow = true;
          legMesh.receiveShadow = true;
          surfaceGroup.add(legMesh);
        });
      }

      // 3. Glowing Edge Outlines
      const edges = new THREE.EdgesGeometry(boxGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: surface.type === 'table' ? 0x38bdf8 : surface.type === 'floor' ? 0x34d399 : 0x64748b,
        linewidth: 2,
        transparent: true,
        opacity: 0.4
      });
      const edgeLines = new THREE.LineSegments(edges, lineMat);
      surfaceGroup.add(edgeLines);

      // 4. 3D Floating Spatial Label
      if (surface.type === 'table' || surface.type === 'ramp') {
        const label = this.createSurfaceLabelSprite(surface);
        label.position.set(0, h / 2 + 0.35, 0);
        surfaceGroup.add(label);
      }

      this.surfaceMeshes.set(surface.id, surfaceGroup);
      this.group.add(surfaceGroup);
    });

    // 5. Ambient Floor Grid in 3D Mode
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.005;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.45;
    this.gridHelper = grid;
    this.group.add(grid);
  }
}
