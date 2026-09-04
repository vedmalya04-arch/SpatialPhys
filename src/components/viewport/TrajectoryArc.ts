import * as THREE from 'three';
import { TrajectoryTheoretical, TrajectoryPoint } from '../../types';

export class TrajectoryArc {
  public group: THREE.Group;
  private theoreticalLine: THREE.Line;
  private trailLine: THREE.Line;
  private landingMarker: THREE.Mesh;
  private apexMarker: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // 1. Theoretical Parabolic Arc (Dashed Neon Purple Line)
    const lineGeo = new THREE.BufferGeometry();
    const lineMat = new THREE.LineDashedMaterial({
      color: 0xa855f7,
      dashSize: 0.15,
      gapSize: 0.08,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    this.theoreticalLine = new THREE.Line(lineGeo, lineMat);
    this.group.add(this.theoreticalLine);

    // 2. Real-Time Breadcrumb Trail Line (Fuchsia/Violet Glow)
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({
      color: 0xd946ef,
      linewidth: 3,
      transparent: true,
      opacity: 0.95
    });
    this.trailLine = new THREE.Line(trailGeo, trailMat);
    this.group.add(this.trailLine);

    // 3. Predicted Landing Ground Ring (Purple)
    const ringGeo = new THREE.RingGeometry(0.15, 0.22, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75
    });
    this.landingMarker = new THREE.Mesh(ringGeo, ringMat);
    this.landingMarker.rotation.x = -Math.PI / 2;
    this.landingMarker.position.set(0, 0.02, 0);
    this.group.add(this.landingMarker);

    // 4. Apex Peak Altitude Marker
    const apexGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const apexMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true
    });
    this.apexMarker = new THREE.Mesh(apexGeo, apexMat);
    this.group.add(this.apexMarker);
  }

  public updateTheoretical(trajectory: TrajectoryTheoretical | null, visible: boolean): void {
    if (!trajectory || !visible || trajectory.points.length < 2) {
      this.theoreticalLine.visible = false;
      this.landingMarker.visible = false;
      this.apexMarker.visible = false;
      return;
    }

    this.theoreticalLine.visible = true;
    this.landingMarker.visible = true;
    this.apexMarker.visible = true;

    const positions = new Float32Array(trajectory.points.length * 3);
    let maxPosY = -Infinity;
    let apexPos = new THREE.Vector3(0, 0, 0);

    trajectory.points.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;

      if (pt.y > maxPosY) {
        maxPosY = pt.y;
        apexPos.set(pt.x, pt.y, pt.z);
      }
    });

    this.theoreticalLine.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
    this.theoreticalLine.computeLineDistances();

    // Position Landing Ring
    this.landingMarker.position.set(
      trajectory.landingPosition[0],
      0.02,
      trajectory.landingPosition[2]
    );

    // Position Apex marker
    this.apexMarker.position.copy(apexPos);
  }

  public updateTrail(history: TrajectoryPoint[], visible: boolean): void {
    if (!visible || history.length < 2) {
      this.trailLine.visible = false;
      return;
    }

    this.trailLine.visible = true;
    const positions = new Float32Array(history.length * 3);

    history.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    });

    this.trailLine.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  }
}
