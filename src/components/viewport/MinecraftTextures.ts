import * as THREE from 'three';

// Procedural 16x16 Pixel Texture Generator for Authentic Minecraft Aesthetics
export class MinecraftTextureGenerator {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  private static createPixelCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  private static createTextureFromCanvas(canvas: HTMLCanvasElement): THREE.CanvasTexture {
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  // 1. Oak Planks (Floor & Tabletop base)
  public static getOakPlanks(): THREE.CanvasTexture {
    if (this.cache.has('oak_planks')) return this.cache.get('oak_planks')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const colors = ['#b88748', '#a8793e', '#9b6e35', '#c89656', '#875d2b'];

    // Base fill with subtle grain
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const rand = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const colorIdx = Math.floor(Math.abs(rand) * colors.length);
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Horizontal plank seams (every 4 pixels)
    ctx.fillStyle = '#61411e';
    ctx.fillRect(0, 3, 16, 1);
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(0, 11, 16, 1);
    ctx.fillRect(0, 15, 16, 1);

    // Staggered vertical plank dividers
    ctx.fillRect(5, 0, 1, 3);
    ctx.fillRect(11, 4, 1, 3);
    ctx.fillRect(3, 8, 1, 3);
    ctx.fillRect(13, 12, 1, 3);

    // Nail dots
    ctx.fillStyle = '#422a12';
    ctx.fillRect(4, 1, 1, 1);
    ctx.fillRect(10, 5, 1, 1);
    ctx.fillRect(2, 9, 1, 1);
    ctx.fillRect(12, 13, 1, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('oak_planks', texture);
    return texture;
  }

  // 2. Crafting Table Top (The Central Physics Table Surface)
  public static getCraftingTableTop(): THREE.CanvasTexture {
    if (this.cache.has('crafting_top')) return this.cache.get('crafting_top')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);

    // Dark oak border
    ctx.fillStyle = '#6d4825';
    ctx.fillRect(0, 0, 16, 16);

    // Inner lighter plank area
    ctx.fillStyle = '#a8793e';
    ctx.fillRect(1, 1, 14, 14);

    // 3x3 Crafting Grid (light brown squares with dark lines)
    ctx.fillStyle = '#c89656';
    ctx.fillRect(2, 2, 12, 12);

    ctx.fillStyle = '#5c3a1d';
    // Grid lines
    ctx.fillRect(5, 2, 1, 12);
    ctx.fillRect(9, 2, 1, 12);
    ctx.fillRect(2, 5, 12, 1);
    ctx.fillRect(2, 9, 12, 1);

    // Tool icons: Saw silhouette on top right
    ctx.fillStyle = '#d1d5db';
    ctx.fillRect(11, 3, 2, 1);
    ctx.fillRect(12, 4, 1, 1);
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(13, 2, 1, 1);

    // Pliers / Hammer motif on bottom left
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(3, 11, 1, 2);
    ctx.fillRect(4, 12, 1, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('crafting_top', texture);
    return texture;
  }

  // 3. Crafting Table Side
  public static getCraftingTableSide(): THREE.CanvasTexture {
    if (this.cache.has('crafting_side')) return this.cache.get('crafting_side')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);

    // Wood background
    ctx.fillStyle = '#a8793e';
    ctx.fillRect(0, 0, 16, 16);

    // Wood corner brackets
    ctx.fillStyle = '#6d4825';
    ctx.fillRect(0, 0, 2, 16);
    ctx.fillRect(14, 0, 2, 16);
    ctx.fillRect(0, 0, 16, 2);
    ctx.fillRect(0, 14, 16, 2);

    // Saw / Tool hanging on side
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(5, 4, 6, 2);
    ctx.fillRect(7, 6, 2, 5);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(7, 11, 2, 2);

    // Corner rivets
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(1, 1, 1, 1);
    ctx.fillRect(14, 1, 1, 1);
    ctx.fillRect(1, 14, 1, 1);
    ctx.fillRect(14, 14, 1, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('crafting_side', texture);
    return texture;
  }

  // 4. Stone Bricks (Room Walls)
  public static getStoneBricks(): THREE.CanvasTexture {
    if (this.cache.has('stone_bricks')) return this.cache.get('stone_bricks')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    const grays = ['#7c7c7c', '#8a8a8a', '#6f6f6f', '#969696', '#636363'];

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const rand = (Math.sin(x * 45.123 + y * 91.456) * 12345.67) % 1;
        const colorIdx = Math.floor(Math.abs(rand) * grays.length);
        ctx.fillStyle = grays[colorIdx];
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Brick mortar lines
    ctx.fillStyle = '#424242';
    ctx.fillRect(0, 7, 16, 1);
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(8, 0, 1, 7);
    ctx.fillRect(4, 8, 1, 7);
    ctx.fillRect(12, 8, 1, 7);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('stone_bricks', texture);
    return texture;
  }

  // 5. Bookshelf (Wall Library Block)
  public static getBookshelf(): THREE.CanvasTexture {
    if (this.cache.has('bookshelf')) return this.cache.get('bookshelf')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);

    // Wood frame
    ctx.fillStyle = '#8f6534';
    ctx.fillRect(0, 0, 16, 16);

    // Top shelf opening
    ctx.fillStyle = '#2e1c0c';
    ctx.fillRect(1, 1, 14, 6);
    // Bottom shelf opening
    ctx.fillRect(1, 8, 14, 6);

    // Top books
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea', '#ea580c', '#0891b2'];
    let curX = 2;
    while (curX < 14) {
      const bColor = bookColors[(curX * 3) % bookColors.length];
      const width = Math.min(2, 14 - curX);
      ctx.fillStyle = bColor;
      ctx.fillRect(curX, 1, width, 5);
      // Gold/white book band
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(curX, 3, width, 1);
      curX += width;
    }

    // Bottom books
    curX = 2;
    while (curX < 14) {
      const bColor = bookColors[(curX * 7 + 2) % bookColors.length];
      const width = Math.min(2, 14 - curX);
      ctx.fillStyle = bColor;
      ctx.fillRect(curX, 8, width, 5);
      // White page band
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(curX, 11, width, 1);
      curX += width;
    }

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('bookshelf', texture);
    return texture;
  }

  // 6. TNT Block
  public static getTntTop(): THREE.CanvasTexture {
    if (this.cache.has('tnt_top')) return this.cache.get('tnt_top')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 16, 16);

    // Center gray fuse circle
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(6, 6, 4, 4);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(7, 7, 2, 2);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('tnt_top', texture);
    return texture;
  }

  public static getTntSide(): THREE.CanvasTexture {
    if (this.cache.has('tnt_side')) return this.cache.get('tnt_side')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    // Red sticks
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(0, 0, 16, 16);

    // White band
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 5, 16, 6);

    // Black TNT letters
    ctx.fillStyle = '#111827';
    // 'T'
    ctx.fillRect(2, 6, 3, 1);
    ctx.fillRect(3, 7, 1, 3);
    // 'N'
    ctx.fillRect(6, 6, 1, 4);
    ctx.fillRect(7, 7, 1, 1);
    ctx.fillRect(8, 8, 1, 1);
    ctx.fillRect(9, 6, 1, 4);
    // 'T'
    ctx.fillRect(11, 6, 3, 1);
    ctx.fillRect(12, 7, 1, 3);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('tnt_side', texture);
    return texture;
  }

  // 7. Slime Block (Emerald green bouncy gelatin)
  public static getSlimeTexture(): THREE.CanvasTexture {
    if (this.cache.has('slime')) return this.cache.get('slime')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#73c854';
    ctx.fillRect(0, 0, 16, 16);

    // Dark green jelly core
    ctx.fillStyle = '#559c3d';
    ctx.fillRect(3, 3, 10, 10);

    // Inner bright eyes / highlight
    ctx.fillStyle = '#8de36b';
    ctx.fillRect(4, 4, 3, 3);
    ctx.fillRect(9, 4, 3, 3);
    ctx.fillStyle = '#2a5e1c';
    ctx.fillRect(5, 5, 1, 1);
    ctx.fillRect(10, 5, 1, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('slime', texture);
    return texture;
  }

  // 8. Diamond Block (Radiant cyan gem facets)
  public static getDiamondBlock(): THREE.CanvasTexture {
    if (this.cache.has('diamond')) return this.cache.get('diamond')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#64e6d9';
    ctx.fillRect(0, 0, 16, 16);

    // Bevel highlights
    ctx.fillStyle = '#aaf8f0';
    ctx.fillRect(1, 1, 14, 1);
    ctx.fillRect(1, 1, 1, 14);

    // Bevel shadows
    ctx.fillStyle = '#31a69a';
    ctx.fillRect(1, 14, 14, 1);
    ctx.fillRect(14, 1, 1, 14);

    // Gem cross pattern
    ctx.fillStyle = '#45c4b6';
    ctx.fillRect(5, 5, 6, 6);
    ctx.fillStyle = '#aaf8f0';
    ctx.fillRect(6, 6, 2, 2);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('diamond', texture);
    return texture;
  }

  // 9. Furnace Front (Glowing embers)
  public static getFurnaceFront(): THREE.CanvasTexture {
    if (this.cache.has('furnace_front')) return this.cache.get('furnace_front')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(0, 0, 16, 16);

    // Cobblestone border
    ctx.fillStyle = '#52525b';
    ctx.fillRect(1, 1, 14, 1);
    ctx.fillRect(1, 14, 14, 1);

    // Dark opening
    ctx.fillStyle = '#18181b';
    ctx.fillRect(3, 6, 10, 7);

    // Fire embers
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(4, 9, 8, 3);
    ctx.fillStyle = '#f97316';
    ctx.fillRect(5, 10, 6, 2);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(6, 10, 4, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('furnace_front', texture);
    return texture;
  }

  // 10. Minecraft Chest Front
  public static getChestFront(): THREE.CanvasTexture {
    if (this.cache.has('chest_front')) return this.cache.get('chest_front')!;

    const { canvas, ctx } = this.createPixelCanvas(16, 16);
    // Dark brown wood
    ctx.fillStyle = '#9a6a34';
    ctx.fillRect(0, 0, 16, 16);

    // Black seam
    ctx.fillStyle = '#27170a';
    ctx.fillRect(0, 5, 16, 1);
    ctx.fillRect(0, 0, 1, 16);
    ctx.fillRect(15, 0, 1, 16);

    // Metal lock
    ctx.fillStyle = '#d4d4d8';
    ctx.fillRect(7, 4, 2, 3);
    ctx.fillStyle = '#71717a';
    ctx.fillRect(7, 5, 2, 1);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('chest_front', texture);
    return texture;
  }

  // 11. Pixel Art Painting (Creeper & Sunset Landscape)
  public static getPainting(): THREE.CanvasTexture {
    if (this.cache.has('painting')) return this.cache.get('painting')!;

    const { canvas, ctx } = this.createPixelCanvas(32, 16);
    // Wood frame
    ctx.fillStyle = '#4a2f13';
    ctx.fillRect(0, 0, 32, 16);

    // Canvas background: Sunset Sky
    ctx.fillStyle = '#f97316';
    ctx.fillRect(1, 1, 30, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(1, 6, 30, 3);

    // Sun
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(14, 3, 4, 4);

    // Mountains / green hills
    ctx.fillStyle = '#15803d';
    ctx.fillRect(1, 9, 30, 6);
    ctx.fillStyle = '#166534';
    ctx.fillRect(1, 12, 30, 3);

    // Little blocky tree
    ctx.fillStyle = '#78350f';
    ctx.fillRect(6, 9, 1, 4);
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(5, 7, 3, 3);

    const texture = this.createTextureFromCanvas(canvas);
    this.cache.set('painting', texture);
    return texture;
  }
}
