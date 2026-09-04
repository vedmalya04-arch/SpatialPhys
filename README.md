# SpatialPhysX: 3D Ballistic Physics Studio & Minecraft Voxel Lab

> **A high-performance web-native physics simulation laboratory featuring procedural Minecraft voxel graphics, real-time ballistic projectile mechanics, interactive crafting table dynamics, and a sleek White & Purple design system.**

[![Built With](https://img.shields.io/badge/Built%20With-React%2018%20%7C%20Three.js%20%7C%20Cannon--es%20%7C%20TypeScript-9333ea)](https://github.com/)
[![Physics Engine](https://img.shields.io/badge/Physics-128Hz%20Deterministic%20Rigid%20Body-7e22ce)](https://github.com/pmndrs/cannon-es)
[![Theme](https://img.shields.io/badge/Theme-White%20%26%20Purple%20Glassmorphism-a855f7)](https://github.com/)
[![Graphics](https://img.shields.io/badge/Graphics-Procedural%20Minecraft%20Pixel%20Art-22c55e)](https://github.com/)

---

## 🌟 Table of Contents
1. [Overview](#-overview)
2. [Key Capabilities & Architecture](#-key-capabilities--architecture)
3. [Customer Landing Page](#-customer-landing-page)
4. [Minecraft Voxel Laboratory](#-minecraft-voxel-laboratory)
5. [Ballistic Launcher & Projectile Dynamics](#-ballistic-launcher--projectile-dynamics)
6. [Mathematical & Physics Modeling](#-mathematical--physics-modeling)
7. [White & Purple Design System](#-white--purple-design-system)
8. [Controls & Interaction Guide](#-controls--interaction-guide)
9. [Project Structure](#-project-structure)
10. [Quick Start & Setup](#-quick-start--setup)

---

## 🌌 Overview

**SpatialPhysX** is a web-native 3D interactive physics engine designed for students, educators, and engineers. It combines deterministic rigid-body simulation with an inviting Minecraft voxel room environment, eliminating annoying webcam/AR permission dialogs in favor of an instant, distraction-free spatial experience.

- **Instant Access**: Zero camera prompts or hardware dependencies.
- **Dedicated Physics Table**: Drop or launch objects anywhere across a 3D Minecraft Crafting Bench using precision raycasting.
- **Ballistic Launcher**: Real-time launch velocity, pitch elevation angle, and azimuth yaw heading controls with predictive trajectory arcs.
- **White & Purple Glassmorphism**: Clean, modern aesthetics with frosted cards, glowing purple borders, and high-contrast typography.

---

## 🚀 Key Capabilities & Architecture

```
                       SPATIALPHYS ARCHITECTURE
                      
    [ Customer Landing Page ]  <------ Hash Router ------>  [ 3D Physics Studio ]
     • 2D Kinematic Canvas                                    • Three.js WebGL Scene
     • Interactive Sliders                                    • Cannon-es Physics Loop
     • Feature Sandboxes                                      • Minecraft Voxel Lab
     • Code Snippets                                          • Ballistic Cannon
                                                              • Live Telemetry Feed
                                         │
                                         ▼
                             [ Physics & 3D Layer ]
                     ┌───────────────────┬───────────────────┐
                     ▼                   ▼                   ▼
             [ ThreeCanvas ]     [ PhysicsEngine ]   [ MinecraftRoom ]
             • Raycaster         • Rigid Bodies      • Procedural 16x16
             • Aim Vector        • 128Hz Loop        • Crafting Bench
             • Trajectory Arc    • Collision Solvers • Animated Torches
```

---

## 💻 Customer Landing Page

Located at `/` (default visit), the landing page introduces users to the platform before entering the spatial workspace:

- **Interactive 2D Trajectory Hero**:
  - Live HTML5 Canvas simulator showing primary parabolic flight curves, bounce arcs, and glowing projectile beads.
  - Interactive sliders for Initial Velocity ($v_0$), Launch Angle ($\theta$), and Gravity ($g$).
  - Surface preset selector (Polished Oak, Rough Concrete, Teflon Pad) with dynamic restitution offsets.
- **Core Technology Showcase**:
  - Breakdown of the deterministic physics pipeline, collision detection, and spatial math.
  - Interactive code preview tabs (JavaScript, React Hooks, WebGL).
- **Smooth Hash Navigation**:
  - Clicking **"Enter 3D Physics Studio"** transitions seamlessly to `#studio` without page reloads.

---

## ⛏️ Minecraft Voxel Laboratory

The physics simulation takes place in a warm, vibrant Minecraft room built with zero external texture dependencies:

### 1. Procedural Pixel-Art Textures (`MinecraftTextures.ts`)
Generated programmatically at runtime using HTML5 16x16 canvas with nearest-neighbor filtering (`THREE.NearestFilter`):
- **Oak Wood Planks**: Flooring and table legs with wood grain and iron nail accents.
- **Crafting Table**: 3x3 crafting grid top with dark oak borders and tool motifs on the sides.
- **Stone Bricks**: Mortared castle/dungeon wall masonry.
- **Bookshelves**: Multi-tier library shelves with colorful book spines (crimson, lapis, emerald, gold).
- **Furnace**: Stone masonry with animated burning ember firebox.
- **Chest**: Oak storage chest with iron latch.
- **Wall Torches**: Wooden sticks with flickering voxel flame tips and dynamic amber point lights.
- **Sunset Painting**: Framed 32x16 pixel-art mountain sunset landscape.

### 2. Voxel Entity Skins
Toggle the hero physics object between four block skins in the left panel:
1. **Slime Block**: Bouncy emerald green cube with pixel-art slime face.
2. **TNT Block**: Iconic red and white explosive cube with black TNT typography.
3. **Diamond Block**: Radiant cyan gemstone block with beveled facets.
4. **Ender Sphere**: Mystic turquoise physics sphere.

---

## 🚀 Ballistic Launcher & Projectile Dynamics

SpatialPhysX features a **Ballistic Cannon & Projectile System**:

### Configurable Ballistic Parameters
- **Launch Velocity ($v_0$)**: $1.0\text{ m/s}$ to $25.0\text{ m/s}$ (with live $\text{m/s}$ and $\text{km/h}$ readouts).
- **Elevation Pitch Angle ($\theta$)**: $10^\circ$ to $85^\circ$ (default $45^\circ$ for maximum horizontal range).
- **Azimuth Direction Yaw ($\phi$)**: Full $360^\circ$ heading control ($-180^\circ$ to $+180^\circ$) with quick-aim buttons:
  - `Fwd (0°)`: Launches forward into the room towards the window.
  - `Right (90°)`: Launches right towards the furnace and chest.
  - `Back (180°)`: Launches backward towards the user camera.
  - `Left (-90°)`: Launches left towards the bookshelf library.

### Visual Aiming & Trajectory Guides
- **3D Aim Vector Arrow**: An interactive direction arrow (`THREE.ArrowHelper`) emerges from the reticle on the table, dynamically adjusting its pitch, azimuth, and magnitude in real time.
- **Launchpad Ghost Block**: A translucent preview block rests on the table surface at $y = 0.86\text{m}$ to confirm launch origin.
- **Parabolic Trajectory Arc**: Neon purple dashed curve displaying the theoretical flight path before firing.
- **Dynamic Breadcrumbs Trail**: Fuchsia glow trail tracing the actual path taken as the object tumbles and bounces off room boundaries.

### Multiple Launch Triggers
- **Click to Launch**: In Launch Mode, clicking anywhere on the Crafting Table fires the projectile from that exact spot.
- **Keyboard Shortcut**: Press **`Spacebar`** at any moment to launch immediately!
- **Studio Launch Button**: Click **`🚀 Launch Object (Space)`** in the left panel.
- **Bottom Dock Button**: Click **`🚀 Launch Object`** in the floating controller dock.

---

## 📐 Mathematical & Physics Modeling

The simulation integrates classical Newtonian mechanics via Cannon-es and theoretical kinematics:

### 1. Velocity Decomposition
Given launch velocity $v_0$, elevation angle $\theta$, and azimuth heading $\phi$:
$$v_x = v_0 \cos(\theta) \sin(\phi)$$
$$v_y = v_0 \sin(\theta)$$
$$v_z = -v_0 \cos(\theta) \cos(\phi)$$

### 2. Maximum Flight Altitude
With initial launch height $y_0$ (table elevation $0.86\text{m}$):
$$H_{\text{max}} = y_0 + \frac{v_y^2}{2g}$$

### 3. Flight Duration & Range
Solving for impact with the floor ($y = 0$):
$$T_{\text{flight}} = \frac{v_y + \sqrt{v_y^2 + 2gy_0}}{g}$$
$$R = \sqrt{v_x^2 + v_z^2} \times T_{\text{flight}} = v_0 \cos(\theta) \times T_{\text{flight}}$$

### 4. Planetary Gravity Presets
- **Earth**: $9.81\text{ m/s}^2$
- **Moon**: $1.62\text{ m/s}^2$
- **Mars**: $3.71\text{ m/s}^2$
- **Zero-G**: $0.05\text{ m/s}^2$

---

## 🎨 White & Purple Design System

The application uses a custom **White & Purple Glassmorphic** theme configured via Tailwind CSS and custom tokens (`src/index.css`):

| Token / Element | Color / Value | Usage |
|---|---|---|
| **Canvas Background** | `#faf8ff` | Main application backdrop |
| **Primary Typography** | `#1e1035` | High-contrast deep purple text |
| **Glass Panel Cards** | `rgba(255, 255, 255, 0.92)` | Frosted HUD panels with blur |
| **Borders** | `rgba(168, 85, 247, 0.25)` | Translucent purple card borders |
| **Accent Sliders** | `#9333ea` (`accent-purple-600`) | Parameter inputs |
| **Primary Buttons** | `#9333ea` hover `#7e22ce` | Launch, Reset, and Action triggers |
| **Aim Vector & Trails** | `#d946ef` / `#a855f7` | 3D aiming vector and trajectory curves |
| **Twilight Sky** | `#201138` | Atmospheric 3D void outside room |

---

## 🎮 Controls & Interaction Guide

| Action | Control |
|---|---|
| **Fire / Launch Object** | Press **`Spacebar`** OR click **`Launch Object`** |
| **Click-to-Launch** | In Launch Mode, **Click** anywhere on Crafting Table |
| **Click-to-Drop** | In Drop Mode, **Click** anywhere on Crafting Table |
| **Orbit Camera** | **Click and Drag** mouse in 3D viewport |
| **Zoom View** | **Mouse Wheel** (Scroll in/out) |
| **Switch Entity Skin** | Click `Slime`, `TNT`, `Diamond`, or `Ender` |
| **Adjust Gravity** | Click `Earth`, `Moon`, `Mars`, or `0-G` |
| **Toggle Mode** | Click `Launch` 🚀 or `Drop` 🎯 in left panel |
| **Spawn Extra Blocks** | Click **`+ Spawn Block`** in bottom dock |
| **Reset Simulation** | Click **`Reset Sim`** in top header |

---

## 📁 Project Structure

```
spatialphys/
├── src/
│   ├── components/
│   │   ├── landing/
│   │   │   ├── LandingPage.tsx        # Customer landing page with 2D kinematic canvas
│   │   │   ├── HeroPreviewCard.tsx    # Interactive physics demonstration card
│   │   │   └── GravityPlayground.tsx  # Parameter sandboxes
│   │   ├── studio/
│   │   │   ├── PhysicsStudio.tsx      # Main 3D laboratory with launcher & telemetry
│   │   │   └── StudioHeader.tsx       # Studio navigation bar
│   │   └── viewport/
│   │       ├── ThreeCanvas.tsx        # Three.js WebGL canvas, raycasting & reticle
│   │       ├── MinecraftRoomMesh.ts   # 3D voxel room, table, shelves, window, torches
│   │       ├── MinecraftTextures.ts   # Procedural 16x16 pixel-art canvas generator
│   │       ├── PhysicsObjectsRenderer.ts # Minecraft block skins (Slime, TNT, Diamond)
│   │       ├── TrajectoryArc.ts       # Theoretical & breadcrumb flight arcs
│   │       └── VectorArrowsOverlay.ts # Dynamic 3D velocity/force arrows
│   ├── services/
│   │   ├── physics/
│   │   │   └── PhysicsEngine.ts       # Cannon-es 128Hz rigid body simulation
│   │   └── audio/
│   │       └── SoundEffects.ts        # Synthesized Web Audio sound effects
│   ├── App.tsx                        # Lightweight hash router (landing vs studio)
│   ├── index.css                      # White & Purple glassmorphism styles
│   └── main.tsx                       # React application entry point
├── package.json
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/vedmalya04-arch/SpatialPhys.git
cd SpatialPhys

# 2. Install dependencies
npm install

# 3. Launch development server
npm run dev
```

The app will be available locally at:
- **Landing Page**: `http://localhost:5173/`
- **3D Physics Studio**: `http://localhost:5173/#studio`

### Production Build

```bash
# Build production bundle with TypeScript check
npm run build

# Preview production build locally
npm run preview
```

---

*SpatialPhysX — Engineered for Spatial Dynamics, Interactive Physics, and Creative Learning.*
