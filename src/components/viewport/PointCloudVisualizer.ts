import * as THREE from 'three';
import { CVFeaturePoint } from '../../types';

export class PointCloudVisualizer {
  public group: THREE.Group;
  private pointsMesh: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true
    });

    this.pointsMesh = new THREE.Points(geometry, material);
    this.group.add(this.pointsMesh);
  }

  public updatePoints(points: CVFeaturePoint[], visible: boolean = true): void {
    this.pointsMesh.visible = visible && points.length > 0;
    if (!this.pointsMesh.visible || points.length === 0) return;

    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    points.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;

      // Color based on point property or rgb
      const color = new THREE.Color(pt.color || '#38bdf8');
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    });

    this.pointsMesh.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.pointsMesh.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    );
  }
}
