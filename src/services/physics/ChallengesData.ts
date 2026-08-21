import { PhysicsChallenge } from '../../types';

export const PHYSICS_CHALLENGES: PhysicsChallenge[] = [
  {
    id: 'ch-restitution-desk',
    title: 'Challenge 1: Desk Restitution & Landing Target',
    difficulty: 'Easy',
    description: 'Adjust restitution (e) and drop position to make the ball bounce and come to rest inside the target desk zone.',
    instructions:
      'Modify the ball restitution / bounciness so energy dissipates gently upon colliding with your real desk surface and the ball stays securely inside the target marker.',
    targetDescription: 'Bounce and Rest on Desk Surface (Elevation ~0.78m)',
    targetPosition: [0, 0.85, -1.2],
    targetRadius: 0.65,
    targetType: 'land_on_table',
    requiredGravity: 9.81,
    initialObject: {
      type: 'sphere',
      mass: 1.0,
      radius: 0.2,
      position: [0, 2.2, -1.2],
      velocity: [0, 0, 0],
      restitution: 0.45,
      friction: 0.35,
      color: '#38bdf8'
    },
    hint: 'Lower restitution (e ≈ 0.35 - 0.50) prevents excessive high bounces off your desk.',
    completed: false
  },
  {
    id: 'ch-distance-3m',
    title: 'Challenge 2: 3-Meter Projectile Range Target',
    difficulty: 'Medium',
    description: 'Configure launch angle (θ) and initial velocity (v0) to hit a 3-meter range target.',
    instructions:
      'Using the kinematics equation R = (v₀² sin 2θ) / g, calibrate your projectile launcher to land within ±0.25m of the 3.00m target beacon.',
    targetDescription: 'Hit Range Target at 3.0m (Tolerance ±0.25m)',
    targetPosition: [0, 0.05, -2.4],
    targetRadius: 0.4,
    targetType: 'distance',
    targetValue: 3.0,
    requiredGravity: 9.81,
    initialObject: {
      type: 'sphere',
      mass: 0.8,
      radius: 0.18,
      position: [0, 0.2, 0.6],
      velocity: [0, 0, 0],
      restitution: 0.65,
      friction: 0.25,
      color: '#fbbf24'
    },
    hint: 'At θ = 45°, required v₀ = √(9.81 · 3.0) ≈ 5.42 m/s.',
    completed: false
  },
  {
    id: 'ch-height-hurdle-1_5m',
    title: 'Challenge 3: 1.5m Vertical Height Hurdle',
    difficulty: 'Medium',
    description: 'Clear a 1.5m vertical height hurdle using projectile arc kinematics.',
    instructions:
      'Maximize vertical kinetic energy (vy = v₀ sin θ) so the sphere achieves an apex altitude of at least 1.50m above the launch origin.',
    targetDescription: 'Achieve Peak Altitude ≥ 1.50m',
    targetPosition: [0, 1.5, -1.0],
    targetRadius: 0.5,
    targetType: 'max_height',
    targetValue: 1.5,
    requiredGravity: 9.81,
    initialObject: {
      type: 'sphere',
      mass: 0.6,
      radius: 0.18,
      position: [0, 0.25, -0.5],
      velocity: [0, 0, 0],
      restitution: 0.7,
      friction: 0.2,
      color: '#c084fc'
    },
    hint: 'Use a launch angle of 60°–80° with velocity > 5.5 m/s to easily surpass 1.5m altitude.',
    completed: false
  },
  {
    id: 'ch-lunar-touchdown',
    title: 'Challenge 4: Lunar Low-G Soft Touchdown',
    difficulty: 'Hard',
    description: 'Under Moon gravity (1.62 m/s²), land the ball in the target zone without bouncing off.',
    instructions:
      'Lunar gravity is 6× weaker than Earth. Fine-tune your launch velocity for a gentle touchdown on the target surface without overshooting.',
    targetDescription: 'Land on Lunar Target Zone under g = 1.62 m/s²',
    targetPosition: [1.2, 0.85, -1.0],
    targetRadius: 0.5,
    targetType: 'land_on_table',
    requiredGravity: 1.62,
    initialObject: {
      type: 'sphere',
      mass: 1.2,
      radius: 0.2,
      position: [-1.2, 0.25, 0.5],
      velocity: [0, 0, 0],
      restitution: 0.4,
      friction: 0.4,
      color: '#34d399'
    },
    hint: 'Use low velocity (2.5 – 3.2 m/s) to prevent the ball from floating past the target.',
    completed: false
  },
  {
    id: 'ch-friction-brake',
    title: 'Challenge 5: Kinetic Friction Stopping Zone',
    difficulty: 'Expert',
    description: 'Slide the cube across the desk surface so friction brings it to rest inside the target zone.',
    instructions:
      'Calculate the stopping distance d = v₀² / (2μg). Adjust the initial push velocity so the block stops precisely inside the target boundary.',
    targetDescription: 'Stop Block inside Target Zone (d = 1.2m, μ = 0.24)',
    targetPosition: [0.6, 0.85, -1.2],
    targetRadius: 0.35,
    targetType: 'friction_stop',
    requiredGravity: 9.81,
    initialObject: {
      type: 'box',
      mass: 2.0,
      dimensions: [0.3, 0.3, 0.3],
      position: [-0.6, 0.85, -1.2],
      velocity: [0, 0, 0],
      restitution: 0.1,
      friction: 0.24,
      color: '#fb7185'
    },
    hint: 'For distance 1.2m and μ = 0.24, v₀ = √(2 · μ · g · d) ≈ 2.37 m/s.',
    completed: false
  }
];
