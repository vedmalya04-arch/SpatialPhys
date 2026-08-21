import * as THREE from 'three';
import { LiveDetectedPlane } from '../../services/vision/SurfaceScanner';

export class LiveSurfaceTrackerMesh {
  public group: THREE.Group;
  private wireframeBox: THREE.LineSegments;
  private trackingGrid: THREE.LineSegments;
  private shadowReceiver: THREE.Mesh;
  private statusLabel: THREE.Sprite;

  constructor() {
    this.group = new THREE.Group();

    // 1. Live 3D Wireframe Bounding Box
    const boxGeo = new THREE.BoxGeometry(2.2, 0.06, 1.2);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x10b981, // Neon Emerald Green
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    this.wireframeBox = new THREE.LineSegments(edges, lineMat);
    this.group.add(this.wireframeBox);

    // 2. Holographic Top Spatial Grid (Aligned to tabletop surface)
    const gridHelper = new THREE.GridHelper(2.2, 11, 0x10b981, 0x059669);
    gridHelper.position.y = 0.031;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.65;
    this.trackingGrid = gridHelper as unknown as THREE.LineSegments;
    this.group.add(this.trackingGrid);

    // 3. Shadow Receiver Plane for AR (Transparent shadow onto live webcam feed)
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowMat = new THREE.ShadowMaterial({
      opacity: 0.5
    });
    this.shadowReceiver = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowReceiver.rotation.x = -Math.PI / 2;
    this.shadowReceiver.position.y = 0.032;
    this.shadowReceiver.receiveShadow = true;
    this.group.add(this.shadowReceiver);

    // 4. Floating 3D Tracking Label Sprite
    this.statusLabel = this.createStatusLabel('REAL DESK SURFACE (y = 0.78m)');
    this.statusLabel.position.set(0, 0.35, 0);
    this.group.add(this.statusLabel);
  }

  private createStatusLabel(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(13, 18, 31, 0.88)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px "Chakra Petch", sans-serif';
    ctx.fillText('REAL-WORLD SURFACE COLLIDER', 24, 45);

    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(text, 24, 85);

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

  public update(plane: LiveDetectedPlane | null, isLocked: boolean, time: number = 0): void {
    if (!plane) {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;
    const [px, py, pz] = plane.position;
    this.group.position.set(px, py, pz);

    if (!isLocked) {
      // Pulsing effect while tracking
      const pulse = 1 + Math.sin(time * 5) * 0.03;
      this.wireframeBox.scale.set(pulse, 1, pulse);
      (this.wireframeBox.material as THREE.LineBasicMaterial).color.setHex(0x38bdf8); // Cyan while scanning
      (this.wireframeBox.material as THREE.LineBasicMaterial).opacity = 0.85;
      this.statusLabel.visible = true;
    } else {
      // Locked solid state (neon emerald green)
      this.wireframeBox.scale.set(1, 1, 1);
      (this.wireframeBox.material as THREE.LineBasicMaterial).color.setHex(0x10b981);
      (this.wireframeBox.material as THREE.LineBasicMaterial).opacity = 0.85;
      this.statusLabel.visible = false;
    }
  }
}
