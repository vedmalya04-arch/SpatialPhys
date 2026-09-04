import * as THREE from 'three';
import { ReconstructedSurface } from '../../types';
import { MinecraftTextureGenerator } from './MinecraftTextures';

export class MinecraftRoomMesh {
  public group: THREE.Group;
  private torchLights: THREE.PointLight[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.buildRoom();
  }

  private buildRoom(): void {
    // Textures
    const oakPlanksTex = MinecraftTextureGenerator.getOakPlanks();
    oakPlanksTex.wrapS = THREE.RepeatWrapping;
    oakPlanksTex.wrapT = THREE.RepeatWrapping;

    const stoneBricksTex = MinecraftTextureGenerator.getStoneBricks();
    stoneBricksTex.wrapS = THREE.RepeatWrapping;
    stoneBricksTex.wrapT = THREE.RepeatWrapping;

    const craftingTopTex = MinecraftTextureGenerator.getCraftingTableTop();
    const craftingSideTex = MinecraftTextureGenerator.getCraftingTableSide();
    const bookshelfTex = MinecraftTextureGenerator.getBookshelf();
    const furnaceFrontTex = MinecraftTextureGenerator.getFurnaceFront();
    const chestFrontTex = MinecraftTextureGenerator.getChestFront();
    const paintingTex = MinecraftTextureGenerator.getPainting();

    // 1. FLOOR: Oak Wood Planks (8m x 8m)
    const floorGeo = new THREE.BoxGeometry(8, 0.2, 8);
    oakPlanksTex.repeat.set(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      map: oakPlanksTex,
      roughness: 0.8,
      metalness: 0.05
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.1, -1.2);
    floorMesh.receiveShadow = true;
    this.group.add(floorMesh);

    // 2. CENTRAL MINECRAFT CRAFTING BENCH (The Physics Table)
    const tableTopW = 2.8;
    const tableTopH = 0.16;
    const tableTopD = 1.6;
    const tableElevation = 0.78;

    // Materials array for 6 faces: [right, left, top, bottom, front, back]
    const tableMats = [
      new THREE.MeshStandardMaterial({ map: craftingSideTex, roughness: 0.6 }), // +x
      new THREE.MeshStandardMaterial({ map: craftingSideTex, roughness: 0.6 }), // -x
      new THREE.MeshStandardMaterial({ map: craftingTopTex, roughness: 0.5 }),  // +y (Crafting Grid Top)
      new THREE.MeshStandardMaterial({ map: oakPlanksTex, roughness: 0.8 }),     // -y
      new THREE.MeshStandardMaterial({ map: craftingSideTex, roughness: 0.6 }), // +z
      new THREE.MeshStandardMaterial({ map: craftingSideTex, roughness: 0.6 })  // -z
    ];

    const tableTopGeo = new THREE.BoxGeometry(tableTopW, tableTopH, tableTopD);
    const tableTopMesh = new THREE.Mesh(tableTopGeo, tableMats);
    tableTopMesh.position.set(0, tableElevation, -1.2);
    tableTopMesh.castShadow = true;
    tableTopMesh.receiveShadow = true;
    this.group.add(tableTopMesh);

    // Chunky Square Voxel Legs (Oak Log texture)
    const legW = 0.16;
    const legH = tableElevation - tableTopH / 2;
    const legMat = new THREE.MeshStandardMaterial({
      map: oakPlanksTex,
      roughness: 0.7
    });

    const legOffsets = [
      [-tableTopW / 2 + 0.12, -tableTopH / 2 - legH / 2, -tableTopD / 2 + 0.12],
      [tableTopW / 2 - 0.12, -tableTopH / 2 - legH / 2, -tableTopD / 2 + 0.12],
      [-tableTopW / 2 + 0.12, -tableTopH / 2 - legH / 2, tableTopD / 2 - 0.12],
      [tableTopW / 2 - 0.12, -tableTopH / 2 - legH / 2, tableTopD / 2 - 0.12]
    ];

    legOffsets.forEach(([lx, ly, lz]) => {
      const legGeo = new THREE.BoxGeometry(legW, legH, legW);
      const legMesh = new THREE.Mesh(legGeo, legMat);
      legMesh.position.set(lx, ly, lz);
      legMesh.castShadow = true;
      legMesh.receiveShadow = true;
      tableTopMesh.add(legMesh);
    });

    // 3. BACK WALL: Stone Bricks with Window
    const wallHeight = 4.0;
    const wallZ = -3.2;

    const backWallMat = new THREE.MeshStandardMaterial({
      map: stoneBricksTex,
      roughness: 0.9
    });

    // Back wall left panel
    stoneBricksTex.repeat.set(6, 8);
    const backWallLeftGeo = new THREE.BoxGeometry(2.5, wallHeight, 0.4);
    const backWallLeft = new THREE.Mesh(backWallLeftGeo, backWallMat);
    backWallLeft.position.set(-2.75, wallHeight / 2, wallZ);
    backWallLeft.receiveShadow = true;
    this.group.add(backWallLeft);

    // Back wall right panel
    const backWallRightGeo = new THREE.BoxGeometry(2.5, wallHeight, 0.4);
    const backWallRight = new THREE.Mesh(backWallRightGeo, backWallMat);
    backWallRight.position.set(2.75, wallHeight / 2, wallZ);
    backWallRight.receiveShadow = true;
    this.group.add(backWallRight);

    // Back wall top lintel above window
    const backWallTopGeo = new THREE.BoxGeometry(3.0, 1.2, 0.4);
    const backWallTop = new THREE.Mesh(backWallTopGeo, backWallMat);
    backWallTop.position.set(0, wallHeight - 0.6, wallZ);
    this.group.add(backWallTop);

    // Back wall bottom sill below window
    const backWallBottomGeo = new THREE.BoxGeometry(3.0, 1.0, 0.4);
    const backWallBottom = new THREE.Mesh(backWallBottomGeo, backWallMat);
    backWallBottom.position.set(0, 0.5, wallZ);
    this.group.add(backWallBottom);

    // 4. MINECRAFT GLASS WINDOW & SUNNY OUTDOOR SKY
    // Glass panes
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1
    });
    const glassGeo = new THREE.BoxGeometry(2.9, 1.8, 0.08);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 1.9, wallZ);
    this.group.add(glassMesh);

    // Window muntins (wooden frame cross)
    const frameMat = new THREE.MeshStandardMaterial({ map: oakPlanksTex, roughness: 0.7 });
    const horizMuntin = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.08, 0.12), frameMat);
    horizMuntin.position.set(0, 1.9, wallZ);
    this.group.add(horizMuntin);

    const vertMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.12), frameMat);
    vertMuntin.position.set(0, 1.9, wallZ);
    this.group.add(vertMuntin);

    // Sky plane visible through the window
    const skyGeo = new THREE.PlaneGeometry(6, 4);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.FrontSide
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(0, 2.2, wallZ - 1.2);
    this.group.add(skyMesh);

    // Blocky white clouds in the window sky
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cloud1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.3, 0.1), cloudMat);
    cloud1.position.set(-0.6, 2.6, wallZ - 1.0);
    this.group.add(cloud1);

    const cloud2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.1), cloudMat);
    cloud2.position.set(1.1, 2.2, wallZ - 1.0);
    this.group.add(cloud2);

    // Distant green voxel hill outside
    const hillMat = new THREE.MeshBasicMaterial({ color: 0x15803d });
    const hill = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.8, 0.1), hillMat);
    hill.position.set(0, 1.2, wallZ - 1.0);
    this.group.add(hill);

    // 5. LEFT WALL: BOOKSHELF CORNER (Minecraft Enchanting Room Aesthetic)
    const bookshelfMat = new THREE.MeshStandardMaterial({
      map: bookshelfTex,
      roughness: 0.7
    });

    const shelfBlockSize = 0.8;
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const shelfGeo = new THREE.BoxGeometry(shelfBlockSize, shelfBlockSize, shelfBlockSize);
        const shelfMesh = new THREE.Mesh(shelfGeo, bookshelfMat);
        shelfMesh.position.set(
          -3.5 + shelfBlockSize / 2,
          row * shelfBlockSize + shelfBlockSize / 2,
          -2.4 + col * shelfBlockSize
        );
        shelfMesh.castShadow = true;
        shelfMesh.receiveShadow = true;
        this.group.add(shelfMesh);
      }
    }

    // 6. RIGHT WALL: MINECRAFT FURNACES & CHESTS
    const furnaceMat = [
      new THREE.MeshStandardMaterial({ map: stoneBricksTex }), // +x
      new THREE.MeshStandardMaterial({ map: stoneBricksTex }), // -x
      new THREE.MeshStandardMaterial({ map: stoneBricksTex }), // +y
      new THREE.MeshStandardMaterial({ map: stoneBricksTex }), // -y
      new THREE.MeshStandardMaterial({ map: furnaceFrontTex, emissive: new THREE.Color(0xf97316), emissiveIntensity: 0.4 }), // +z (front)
      new THREE.MeshStandardMaterial({ map: stoneBricksTex })  // -z
    ];

    const furnaceGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const furnaceMesh = new THREE.Mesh(furnaceGeo, furnaceMat);
    furnaceMesh.position.set(2.8, 0.4, -2.4);
    furnaceMesh.rotation.y = -Math.PI / 4;
    furnaceMesh.castShadow = true;
    furnaceMesh.receiveShadow = true;
    this.group.add(furnaceMesh);

    // Warm orange point light from furnace embers
    const furnaceLight = new THREE.PointLight(0xff6600, 1.8, 4);
    furnaceLight.position.set(2.6, 0.5, -2.2);
    this.group.add(furnaceLight);

    // Oak Chest block next to furnace
    const chestMat = [
      new THREE.MeshStandardMaterial({ map: oakPlanksTex }),
      new THREE.MeshStandardMaterial({ map: oakPlanksTex }),
      new THREE.MeshStandardMaterial({ map: oakPlanksTex }),
      new THREE.MeshStandardMaterial({ map: oakPlanksTex }),
      new THREE.MeshStandardMaterial({ map: chestFrontTex }),
      new THREE.MeshStandardMaterial({ map: oakPlanksTex })
    ];
    const chestGeo = new THREE.BoxGeometry(0.7, 0.65, 0.7);
    const chestMesh = new THREE.Mesh(chestGeo, chestMat);
    chestMesh.position.set(2.4, 0.325, -1.4);
    chestMesh.rotation.y = -Math.PI / 6;
    chestMesh.castShadow = true;
    this.group.add(chestMesh);

    // 7. MINECRAFT WALL TORCHES (2 Glowing Torches)
    this.addTorch(-2.2, 2.6, wallZ + 0.25);
    this.addTorch(2.2, 2.6, wallZ + 0.25);

    // 8. MINECRAFT PAINTING (Framed Landscape)
    const paintingGeo = new THREE.BoxGeometry(1.8, 0.9, 0.05);
    const paintingMat = new THREE.MeshStandardMaterial({
      map: paintingTex,
      roughness: 0.6
    });
    const paintingMesh = new THREE.Mesh(paintingGeo, paintingMat);
    paintingMesh.position.set(-1.8, 3.2, wallZ + 0.22);
    this.group.add(paintingMesh);
  }

  private addTorch(x: number, y: number, z: number): void {
    const torchGroup = new THREE.Group();
    torchGroup.position.set(x, y, z);

    // Wooden handle stick
    const stickMat = new THREE.MeshStandardMaterial({
      color: 0x854d0e,
      roughness: 0.9
    });
    const stick = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), stickMat);
    stick.rotation.x = Math.PI / 8; // Tilted slightly away from wall
    torchGroup.add(stick);

    // Flame head (glowing yellow/orange voxel)
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15
    });
    const flame = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.08), flameMat);
    flame.position.set(0, 0.2, 0.08);
    torchGroup.add(flame);

    // Inner bright white flame core
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.05, 0.04),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    core.position.set(0, 0.2, 0.08);
    torchGroup.add(core);

    // Warm flickering point light
    const light = new THREE.PointLight(0xffa200, 2.2, 6);
    light.position.set(0, 0.25, 0.15);
    light.castShadow = true;
    torchGroup.add(light);
    this.torchLights.push(light);

    this.group.add(torchGroup);
  }

  // Animate torch light flickering
  public update(timeSec: number): void {
    this.torchLights.forEach((light, i) => {
      const flicker = Math.sin(timeSec * 8 + i * 2.5) * 0.15 + Math.sin(timeSec * 15 + i) * 0.08;
      light.intensity = 2.2 + flicker;
    });
  }
}
