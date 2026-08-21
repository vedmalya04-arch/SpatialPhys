# SpatialPhys: Real-World 3D Spatial Physics Laboratory

> **"Turn the physical room around you into an interactive physics laboratory."**

[![Built With](https://img.shields.io/badge/Built%20With-React%20%7C%20Three.js%20%7C%20Cannon.js%20%7C%20TypeScript-38bdf8)](https://github.com/)
[![Physics Engine](https://img.shields.io/badge/Physics-Rigid%20Body%20Simulation-34d399)](https://github.com/pmndrs/cannon-es)
[![Computer Vision](https://img.shields.io/badge/Computer%20Vision-Real--Time%20Spatial%20Mapping-10b981)](https://github.com/)

---

## 🌌 Product Vision & Architecture

**SpatialPhys** bridges physical reality and scientific computing. Instead of rendering synthetic 3D rooms or isolated simulators, SpatialPhys captures the user's **ACTUAL PHYSICAL ROOM** through their camera and uses real-time computer vision to turn physical surfaces (such as a desk, table, or floor) into interactive rigid-body collision colliders.

```
USER'S REAL PHYSICAL DESK
           ↓
FULL-SCREEN LIVE CAMERA STREAM (WebRTC)
           ↓
REAL-TIME COMPUTER VISION PLANE ESTIMATION (SurfaceScanner)
           ↓
NEON SPATIAL GRID WIREFRAME & DEPTH CALIBRATION
           ↓
LOCKED RIGID-BODY COLLISION SURFACE (RigidBody type="fixed")
           ↓
VIRTUAL 3D RIGID BODIES (Sphere, Box, Cylinder)
           ↓
REAL-TIME 60 FPS DYNAMICS (Cannon-es Physics Engine)
           ↓
3D VECTORS & REAL-TIME SCIENTIFIC TELEMETRY HUD
```

---

## 🚀 Core Features

### 1. Primary Mode: Live WebRTC Camera AR Scanner
- **Zero Decorative CAD Meshes**: In Live AR mode, artificial 3D tables/walls/furniture models are completely hidden. The user's actual room is the visual world and physics canvas.
- **Computer Vision Plane Detection** (`src/services/vision/SurfaceScanner.ts`):
  - Analyzes video frames to estimate primary horizontal surfaces (desk / floor).
  - Projects a neon-green spatial grid wireframe overlay directly over the physical desk in the webcam feed.
  - Transparent shadow receiving plane (`ShadowMaterial`) casts realistic virtual shadows directly onto the real-world surface.
- **Surface Elevation & Depth Calibration**: Real-time slider to snap and align the physics collider to the physical table height.
- **Lock Surface & Attach Collider**: Freezes the detected plane into an active static rigid-body collider (`RigidBody type="fixed"`).

### 2. Full Rigid-Body Physics & Vector Engine
- **Cannon-es Simulation Engine**: Mass ($m$), Restitution/Bounciness ($e$), and Friction ($\mu$).
- **Planetary Gravity Presets**: Instant transitions between **Earth** ($9.81\text{ m/s}^2$), **Moon** ($1.62\text{ m/s}^2$), **Mars** ($3.71\text{ m/s}^2$), **Jupiter** ($24.79\text{ m/s}^2$), **Zero-G** ($0\text{ m/s}^2$), and custom slider values.
- **Dynamic 3D Vectors Attached to Objects**:
  - 🔵 **Velocity ($\vec{v}$)**: Cyan arrow scaled to speed magnitude.
  - 🟣 **Gravitational Force ($\vec{F}_g = m\vec{g}$)**: Purple downward vector.
  - 🟢 **Normal Reaction Force ($\vec{F}_N$)**: Green ground/table reaction vector.
  - 🔴 **Kinetic Friction Force ($\vec{F}_f$)**: Crimson resistive drag vector.
  - 🟡 **Net Resultant Force ($\vec{F}_{\text{net}} = m\vec{a}$)**: Yellow vector sum.
- **Slingshot Projectile Launcher**:
  - Variable Velocity ($v_0$), Angle ($\theta$), and Direction ($\phi$).
  - Real-time parabolic theoretical trajectory arc vs. actual historical breadcrumbs.

### 3. Guided Experiments & Interactive Challenges
- **5 Physics Experiments**:
  1. *Free Fall & Real Surface Collision*
  2. *Planetary Gravity Comparison (Moon vs Earth vs Jupiter)*
  3. *Projectile Motion & $45^\circ$ Optimal Range Theorem*
  4. *Vector Force Equilibrium ($\sum \vec{F} = m\vec{a}$)*
  5. *Kinetic Friction & Stopping Distance ($d = \frac{v^2}{2\mu g}$)*
- **5 Educational Challenges** with automated evaluative feedback (`SUCCESS`, `TRY AGAIN`, `TARGET MISSED`):
  - *Challenge 1*: Desk Restitution & Landing Target
  - *Challenge 2*: 3-Meter Projectile Range Target
  - *Challenge 3*: 1.5m Vertical Height Hurdle
  - *Challenge 4*: Lunar Low-G Soft Touchdown
  - *Challenge 5*: Kinetic Friction Stopping Zone

### 4. Demo Fallback & Reliability
- Explicitly labeled fallback mode: `"DEMO MODE: PRE-SCANNED ROOM FALLBACK"`.
- Dedicated **"RESET SIMULATION"** button to purge bodies and restore default state.

---

## ⚡ Quick Start & Run Instructions

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

*SpatialPhys — Engineered for the "Physics in the Real World" Hackathon Challenge.*
