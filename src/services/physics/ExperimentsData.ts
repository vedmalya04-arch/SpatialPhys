import { PhysicsExperiment, GravityPreset } from '../../types';

export const GRAVITY_PRESETS: GravityPreset[] = [
  {
    id: 'earth',
    name: 'Earth',
    value: 9.81,
    description: 'Standard terrestrial gravity (1.00g)'
  },
  {
    id: 'moon',
    name: 'Moon',
    value: 1.62,
    description: 'Lunar low gravity (0.165g) - floaty high bounces'
  },
  {
    id: 'mars',
    name: 'Mars',
    value: 3.71,
    description: 'Martian gravity (0.378g) - intermediate trajectory'
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    value: 24.79,
    description: 'Jovian heavy gravity (2.53g) - fast violent impacts'
  },
  {
    id: 'zero_g',
    name: 'Zero-G / Orbit',
    value: 0.0,
    description: 'Microgravity - objects drift indefinitely at constant velocity'
  }
];

export const PHYSICS_EXPERIMENTS: PhysicsExperiment[] = [
  {
    id: 'exp-ball-drop',
    title: '1. Free Fall & Surface Collision',
    subtitle: 'Observe gravitational acceleration and impact with the reconstructed table.',
    description:
      'Drop a 1.0 kg sphere directly above the reconstructed table surface. Examine how gravitational potential energy transforms into kinetic energy, and how restitution determines the rebound height.',
    objective: 'Demonstrate collision with reconstructed real-world geometry and observe energy dissipation during impact.',
    expectedOutcome: 'The ball accelerates downward at g = 9.81 m/s², collides with the detected table surface, and bounces upward with height h₁ = e² · h₀.',
    formulas: [
      {
        label: 'Velocity before Impact',
        formula: 'v = \\sqrt{2 g h}',
        explanation: 'Final free-fall speed right before striking the table surface'
      },
      {
        label: 'Rebound Height',
        formula: 'h_1 = e^2 \\cdot h_0',
        explanation: 'Height after bounce depends on coefficient of restitution e'
      },
      {
        label: 'Potential Energy',
        formula: 'E_p = m \\cdot g \\cdot h',
        explanation: 'Gravitational potential energy stored at elevation h'
      }
    ],
    setup: {
      gravity: 9.81,
      gravityPreset: 'earth',
      object: {
        type: 'sphere',
        mass: 1.0,
        radius: 0.22,
        position: [0, 2.4, -1.2],
        velocity: [0, 0, 0],
        restitution: 0.78,
        friction: 0.25,
        color: '#38bdf8'
      },
      vectors: {
        showGravity: true,
        showVelocity: true,
        showAcceleration: true,
        showNormalForce: true,
        showTrajectory: true
      }
    }
  },
  {
    id: 'exp-moon-vs-earth',
    title: '2. Planetary Gravity Comparison',
    subtitle: 'Compare gravitational pull across Earth, Moon, Mars, and Jupiter.',
    description:
      'Test identical object drops under Moon gravity (1.62 m/s²) vs Earth (9.81 m/s²) vs Jupiter (24.79 m/s²). Observe the dramatic difference in fall duration, bounce height, and flight time.',
    objective: 'Understand the relationship between gravitational field strength g and kinematics.',
    expectedOutcome: 'On the Moon, fall time is 2.46× longer and bounce duration is vastly extended. On Jupiter, the ball slams down almost instantaneously.',
    formulas: [
      {
        label: 'Fall Time',
        formula: 't = \\sqrt{\\frac{2h}{g}}',
        explanation: 'Time to fall from rest is inversely proportional to √g'
      },
      {
        label: 'Impact Force Impulse',
        formula: 'J = \\Delta p = m (v_f - v_i)',
        explanation: 'Change in momentum during surface contact'
      }
    ],
    setup: {
      gravity: 1.62,
      gravityPreset: 'moon',
      object: {
        type: 'sphere',
        mass: 1.0,
        radius: 0.22,
        position: [0, 2.4, -1.2],
        velocity: [0, 0, 0],
        restitution: 0.85,
        friction: 0.2,
        color: '#c084fc'
      },
      vectors: {
        showGravity: true,
        showVelocity: true,
        showAcceleration: true,
        showTrajectory: true
      }
    }
  },
  {
    id: 'exp-projectile-lab',
    title: '3. Projectile Motion Laboratory',
    subtitle: 'Launch objects with variable angle, velocity, and observe the parabolic trajectory.',
    description:
      'Launch a projectile across the room toward the reconstructed surfaces. Explore the 2D kinematics equations, verify the theoretical parabolic trajectory arc against real-time physics, and test the 45° maximum range theorem.',
    objective: 'Analyze horizontal and vertical velocity decomposition and calculate range, max height, and flight time.',
    expectedOutcome: 'Horizontal velocity vx remains constant, while vertical velocity vy experiences constant downward acceleration -g.',
    formulas: [
      {
        label: 'Maximum Height',
        formula: 'H = y_0 + \\frac{v_0^2 \\sin^2\\theta}{2g}',
        explanation: 'Peak vertical altitude achieved at apex'
      },
      {
        label: 'Horizontal Range',
        formula: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
        explanation: 'Maximum horizontal distance on level surface (maximized at θ = 45°)'
      },
      {
        label: 'Time of Flight',
        formula: 'T = \\frac{2 v_0 \\sin\\theta}{g}',
        explanation: 'Total duration before returning to launch elevation'
      }
    ],
    setup: {
      gravity: 9.81,
      gravityPreset: 'earth',
      launchVelocity: 7.5,
      launchAngle: 45,
      object: {
        type: 'sphere',
        mass: 0.8,
        radius: 0.18,
        position: [-1.8, 0.25, 0.8],
        velocity: [0, 0, 0],
        restitution: 0.7,
        friction: 0.2,
        color: '#fbbf24'
      },
      vectors: {
        showVelocity: true,
        showAcceleration: true,
        showGravity: true,
        showTrajectory: true
      }
    }
  },
  {
    id: 'exp-vector-analysis',
    title: '4. Vector Forces & Normal Reaction',
    subtitle: 'Visualize dynamic 3D vectors for velocity, acceleration, gravity, normal reaction, and net resultant force.',
    description:
      'Examine the active vector balance on the hero object in real-time. When resting on the reconstructed table, observe how the Normal Force FN exactly cancels Gravity Fg (Newton’s 1st Law: ∑F = 0). During collisions and acceleration, see the Net Resultant Force F_net = m·a.',
    objective: 'Bridge conceptual free-body diagrams with real-time 3D spatial simulation vectors.',
    expectedOutcome: 'At rest on table: F_net = 0, F_N = +mg. In free flight: F_net = F_g = -mg. During bounce: large upward normal force and acceleration.',
    formulas: [
      {
        label: "Newton's Second Law",
        formula: '\\vec{F}_{net} = \\sum \\vec{F} = m \\cdot \\vec{a}',
        explanation: 'Resultant force equals mass times acceleration'
      },
      {
        label: 'Normal Force on Level Plane',
        formula: 'F_N = m \\cdot g',
        explanation: 'Equal and opposite surface reaction force'
      }
    ],
    setup: {
      gravity: 9.81,
      gravityPreset: 'earth',
      object: {
        type: 'box',
        mass: 2.0,
        dimensions: [0.4, 0.4, 0.4],
        position: [0, 1.4, -1.2],
        velocity: [0, 0, 0],
        restitution: 0.4,
        friction: 0.3,
        color: '#34d399'
      },
      vectors: {
        showGravity: true,
        showNormalForce: true,
        showFrictionForce: true,
        showResultantForce: true,
        showVelocity: true,
        showAcceleration: true
      }
    }
  },
  {
    id: 'exp-friction-slide',
    title: '5. Surface Friction & Stopping Distance',
    subtitle: 'Slide a physics block across different reconstructed materials (Wood, Ice, Carpet).',
    description:
      'Impart an initial horizontal velocity to a cube sliding along the tabletop or floor. Observe how the kinetic friction force Ff = μ · FN decelerates the block and determine the stopping distance d = v² / (2μg).',
    objective: 'Investigate the coefficient of friction μ and kinetic energy dissipation into thermal work.',
    expectedOutcome: 'Higher friction (e.g. carpet μ = 0.72) stops the block quickly; low friction (ice/polished table μ = 0.12) allows long sliding distance.',
    formulas: [
      {
        label: 'Kinetic Friction Force',
        formula: 'F_f = \\mu_k \\cdot F_N = \\mu_k \\cdot m \\cdot g',
        explanation: 'Resistive force opposing motion'
      },
      {
        label: 'Stopping Distance',
        formula: 'd = \\frac{v_0^2}{2 \\mu_k g}',
        explanation: 'Distance before the sliding object comes to rest'
      },
      {
        label: 'Work Done by Friction',
        formula: 'W = F_f \\cdot d = \\frac{1}{2} m v_0^2',
        explanation: 'Work done by friction equals initial kinetic energy'
      }
    ],
    setup: {
      gravity: 9.81,
      gravityPreset: 'earth',
      object: {
        type: 'box',
        mass: 1.5,
        dimensions: [0.35, 0.35, 0.35],
        position: [-0.8, 0.95, -1.2],
        velocity: [3.5, 0, 0],
        restitution: 0.2,
        friction: 0.35,
        color: '#fb7185'
      },
      vectors: {
        showVelocity: true,
        showFrictionForce: true,
        showNormalForce: true,
        showResultantForce: true
      }
    }
  }
];
