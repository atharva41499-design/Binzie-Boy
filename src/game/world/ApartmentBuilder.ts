import * as THREE from 'three';
import type { ApartmentTextures } from './textures';

export interface BoxCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
  isWall?: boolean;
}

export interface WalkableRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY?: number;
  maxY?: number;
  floorY?: number;
}

export interface PlatformSurface {
  id: string;
  label: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  y: number;
  isCozy?: boolean;
  isLaptop?: boolean;
  isHighPerch?: boolean;
}

export interface PhysicsProp {
  id: string;
  label: string;
  mesh: THREE.Object3D;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  angVel: THREE.Vector3;
  homePos: THREE.Vector3;
  homeQuat: THREE.Quaternion;
  radius: number;
  knocked: boolean;
  isPaperBall?: boolean;
  canCarry?: boolean;
  loudness: number;
}

export interface CurtainAnchor {
  id: string;
  label: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  topY: number;
  climbedRecently: number;
}

export interface SitSpot {
  id: string;
  label: string;
  pos: THREE.Vector3;
  lookYaw: number;
  mode: 'sit_in' | 'loaf';
  isLaptop?: boolean;
}

export interface HideSpot {
  id: string;
  label: string;
  pos: THREE.Vector3;
  radius: number;
}

export interface HeistItem {
  id: 'salmonTin' | 'churuTube' | 'hairTieStash';
  label: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  collected: boolean;
}

export interface PigeonActor {
  group: THREE.Group;
  wingL: THREE.Mesh;
  wingR: THREE.Mesh;
  homePos: THREE.Vector3;
  perchPos: THREE.Vector3;
  location: 'balcony' | 'terrace' | 'neighbor_balcony' | 'rooftop' | 'courtyard';
  active: boolean;
  hunted: boolean;
  timer: number;
  peckPhase: number;
}

export interface WallMeshRecord {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

export interface InteractiveZone {
  id:
    | 'cat_tv'
    | 'laser_pointer'
    | 'tp_roll'
    | 'catnip_pouch'
    | 'sink_tap'
    | 'switch_living'
    | 'switch_kitchen'
    | 'switch_study'
    | 'front_door'
    | 'doorbell_402'
    | 'doorbell_401'
    | 'sky_lookout'
    | 'scratch_post'
    | 'scratch_living_sofa'
    | 'scratch_402_sofa'
    | 'scratch_401_sofa'
    | 'drink_water_bowl'
    | 'neighbor_goldfish'
    | 'elevator_call_4'
    | 'elevator_ride_4'
    | 'elevator_call_g'
    | 'elevator_ride_g'
    | 'greet_minu'
    | 'greet_lulza'
    | 'courtyard_milk'
    | 'secret_hoard'
    | 'taunt_401'
    | 'steal_delivery'
    | 'yank_laundry'
    | 'trigger_car_alarm';
  label: string;
  pos: THREE.Vector3;
  radius: number;
}

export interface WetFloorZone {
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface BuiltApartment {
  group: THREE.Group;
  colliders: BoxCollider[];
  wallMeshes: WallMeshRecord[];
  walkableRects: WalkableRect[];
  platforms: PlatformSurface[];
  props: PhysicsProp[];
  curtains: CurtainAnchor[];
  sitSpots: SitSpot[];
  hideSpots: HideSpot[];
  heistItems: HeistItem[];
  interactiveZones: InteractiveZone[];
  wetFloorZones: WetFloorZone[];
  pigeons: PigeonActor[];
  frontDoorPivot: THREE.Group;
  setFrontDoorOpen: (open: boolean) => void;
  neighborDoorPivot: THREE.Group;
  setNeighborDoorOpen: (open: boolean) => void;
  neighbor401DoorPivot: THREE.Group;
  setNeighbor401DoorOpen: (open: boolean) => void;
  elevatorCab: THREE.Group;
  elevDoor4L: THREE.Mesh;
  elevDoor4R: THREE.Mesh;
  elevDoorGL: THREE.Mesh;
  elevDoorGR: THREE.Mesh;
  setElevatorDoorState: (floor: 4 | 0, open: boolean) => void;
  minuPos: THREE.Vector3;
  lulzaPos: THREE.Vector3;
  sheruGroup: THREE.Group;
  deliveryBagGroup: THREE.Group;
  terraceLaundryGroup: THREE.Group;
  carHazardLights: THREE.Mesh[];
  goldfishPivot: THREE.Group;
  ceilingFans: THREE.Group[];
  fairyLightPoints: THREE.Points;
  dustMotes: THREE.Points;
  laserDotMesh: THREE.Mesh;
  sinkWaterStream: THREE.Mesh;
  tpRibbonGroup: THREE.Group;
  tpRollMesh: THREE.Mesh;
  catnipJarMesh: THREE.Group;
  tvScreenMat: THREE.MeshStandardMaterial;
  setRoomLightDimmed: (room: 'living' | 'kitchen' | 'study', dimmed: boolean) => void;
  swivelChair: {
    group: THREE.Group;
    seatTopY: number;
    spinVel: number;
    pos: THREE.Vector3;
  };
  laptopPos: THREE.Vector3;
  balconyEscapeZone: { minX: number; maxX: number; minZ: number; maxZ: number };
  setLightingPhase: (
    midnightBlend: number,
    timeSec: number,
    focusY?: number,
    rainAmount?: number,
    carAlarmActive?: boolean,
    focusX?: number,
    focusZ?: number,
  ) => void;
  getRoomNameAt: (x: number, z: number, y?: number) => string;
}

export function buildApartment(tex: ApartmentTextures): BuiltApartment {
  const group = new THREE.Group();
  const colliders: BoxCollider[] = [];
  const wallMeshes: WallMeshRecord[] = [];
  const platforms: PlatformSurface[] = [];
  const props: PhysicsProp[] = [];
  const curtains: CurtainAnchor[] = [];
  const sitSpots: SitSpot[] = [];
  const hideSpots: HideSpot[] = [];
  const heistItems: HeistItem[] = [];
  const interactiveZones: InteractiveZone[] = [];
  const wetFloorZones: WetFloorZone[] = [];
  const ceilingFans: THREE.Group[] = [];

  // Exact Elevation-Aware Walkable Rects (Floor 4 + Multi-Room 401/402 + Elevator Cab + Building Rooftop + Ground Lobby, Courtyard & Street Gali)
  const walkableRects: WalkableRect[] = [
    { minX: -3.1, maxX: 3.1, minZ: -2.7, maxZ: 2.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // Living Room
    { minX: -3.45, maxX: -2.95, minZ: 1.24, maxZ: 2.06, minY: -0.6, maxY: 3.1, floorY: 0 }, // Front Entry Doorway
    { minX: -8.5, maxX: -3.28, minZ: -2.5, maxZ: 4.3, minY: -0.6, maxY: 3.1, floorY: 0 }, // Floor 4 Corridor & Elevator Lobby
    { minX: -7.42, maxX: -5.78, minZ: -4.42, maxZ: -2.4, minY: -0.6, maxY: 3.1, floorY: 0 }, // Floor 4 Elevator Cab
    // Neighbor 402 Multi-Room 1BHK (South)
    { minX: -5.84, maxX: -4.96, minZ: 4.1, maxZ: 4.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Entry Doorway
    { minX: -8.5, maxX: -1.88, minZ: 4.48, maxZ: 10.5, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Living Lounge
    { minX: -2.05, maxX: -1.55, minZ: 5.3, maxZ: 6.5, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Lounge <-> Kitchen Door
    { minX: -1.7, maxX: 2.1, minZ: 4.5, maxZ: 7.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Kitchen & Dining
    { minX: -2.05, maxX: -1.55, minZ: 8.5, maxZ: 9.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Lounge <-> Bedroom Door
    { minX: -1.7, maxX: 2.1, minZ: 7.9, maxZ: 11.3, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Bedroom
    { minX: -0.85, maxX: 0.05, minZ: 11.15, maxZ: 11.65, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Bedroom <-> Bath Door
    { minX: -1.7, maxX: 0.5, minZ: 11.5, maxZ: 13.3, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Bathroom
    { minX: -6.15, maxX: -4.65, minZ: 10.3, maxZ: 10.85, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Balcony Doorway
    { minX: -8.5, maxX: -2.3, minZ: 10.68, maxZ: 12.1, minY: -0.6, maxY: 3.1, floorY: 0 }, // 402 Balcony
    // Neighbor 401 Multi-Room 1BHK (North across corridor)
    { minX: -5.0, maxX: -4.1, minZ: -2.85, maxZ: -2.35, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Entry Doorway
    { minX: -5.62, maxX: -3.28, minZ: -7.3, maxZ: -2.68, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Lounge East
    { minX: -8.52, maxX: -5.62, minZ: -7.3, maxZ: -4.58, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Lounge West
    { minX: -8.85, maxX: -8.35, minZ: -6.5, maxZ: -5.1, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Lounge <-> Kitchen Arch
    { minX: -11.3, maxX: -8.68, minZ: -7.3, maxZ: -2.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Kitchenette
    { minX: -11.65, maxX: -11.15, minZ: -6.5, maxZ: -5.1, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Kitchen <-> Balcony Door
    { minX: -12.9, maxX: -11.48, minZ: -10.1, maxZ: -3.9, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Balcony
    { minX: -5.5, maxX: -4.3, minZ: -7.65, maxZ: -7.15, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Lounge <-> Bedroom Door
    { minX: -7.1, maxX: -3.28, minZ: -10.7, maxZ: -7.48, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Bedroom
    { minX: -7.45, maxX: -6.95, minZ: -9.6, maxZ: -8.6, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Bedroom <-> Bath Door
    { minX: -11.3, maxX: -7.28, minZ: -10.7, maxZ: -7.48, minY: -0.6, maxY: 3.1, floorY: 0 }, // 401 Bathroom
    // Sky Terrace (maxY: 8.5 so descending from Rooftop is never clamped!)
    { minX: -8.85, maxX: -8.35, minZ: -1.85, maxZ: 1.65, minY: -0.6, maxY: 3.1, floorY: 0 }, // Sky Terrace Breezeway Arch
    { minX: -12.25, maxX: -8.68, minZ: -2.5, maxZ: 3.3, minY: -0.6, maxY: 8.5, floorY: 0 }, // Open-Air Sky Terrace Lounge
    // Flat 4B Remaining Rooms
    { minX: 2.95, maxX: 3.45, minZ: -1.68, maxZ: 0.08, minY: -0.6, maxY: 3.1, floorY: 0 }, // Balcony French Doorway
    { minX: 3.28, maxX: 5.06, minZ: -2.5, maxZ: 1.7, minY: -0.6, maxY: 3.1, floorY: 0 }, // Balcony
    { minX: 1.9, maxX: 3.1, minZ: -3.1, maxZ: -2.5, minY: -0.6, maxY: 3.1, floorY: 0 }, // Living <-> Kitchen Archway
    { minX: 0.1, maxX: 5.1, minZ: -5.7, maxZ: -2.9, minY: -0.6, maxY: 3.1, floorY: 0 }, // Kitchen & Dining Nook
    { minX: 1.9, maxX: 3.1, minZ: -6.1, maxZ: -5.5, minY: -0.6, maxY: 3.1, floorY: 0 }, // Nook <-> Hallway Archway
    { minX: 1.9, maxX: 3.1, minZ: -8.1, maxZ: -5.9, minY: -0.6, maxY: 3.1, floorY: 0 }, // Back Hallway
    { minX: 1.55, maxX: 2.05, minZ: -7.85, maxZ: -7.05, minY: -0.6, maxY: 3.1, floorY: 0 }, // Hallway <-> Bedroom Doorway
    { minX: -2.3, maxX: 1.7, minZ: -11.1, maxZ: -6.9, minY: -0.6, maxY: 3.1, floorY: 0 }, // Bedroom 1
    { minX: 2.05, maxX: 2.95, minZ: -8.45, maxZ: -7.95, minY: -0.6, maxY: 3.1, floorY: 0 }, // Hallway <-> Study Doorway
    { minX: 1.9, maxX: 6.1, minZ: -12.3, maxZ: -8.3, minY: -0.6, maxY: 3.1, floorY: 0 }, // Study / Office
    { minX: 4.65, maxX: 5.45, minZ: -8.45, maxZ: -7.95, minY: -0.6, maxY: 3.1, floorY: 0 }, // Study <-> Bathroom Doorway
    { minX: 4.3, maxX: 6.3, minZ: -8.1, maxZ: -6.0, minY: -0.6, maxY: 3.1, floorY: 0 }, // Attached Bathroom
    // Level 1: Building Rooftop & Water Tank Terrace (y = 3.25)
    { minX: -8.55, maxX: -3.28, minZ: -4.4, maxZ: 4.3, minY: 2.55, maxY: 8.5, floorY: 3.25 },
    { minX: -9.22, maxX: -8.4, minZ: -0.5, maxZ: 1.5, minY: 2.55, maxY: 8.5, floorY: 3.25 }, // Rooftop Climb/Drop Access Ledge
    // Level -1: Ground Floor Lobby, Elevator Cab, Courtyard Garden & Society Street Gali (y = -11.5)
    { minX: -7.42, maxX: -5.78, minZ: -4.42, maxZ: -2.4, minY: -13.2, maxY: -9.0, floorY: -11.5 },
    { minX: -10.5, maxX: -3.3, minZ: -4.6, maxZ: 4.3, minY: -13.2, maxY: -9.0, floorY: -11.5 }, // Ground Lobby
    { minX: -15.5, maxX: -10.35, minZ: -5.2, maxZ: 5.2, minY: -13.2, maxY: -9.0, floorY: -11.5 }, // Courtyard Garden & Gate
    { minX: -15.75, maxX: -15.25, minZ: -1.25, maxZ: 1.25, minY: -13.2, maxY: -9.0, floorY: -11.5 }, // Open Courtyard Gate Arch
    { minX: -21.2, maxX: -15.45, minZ: -8.2, maxZ: 8.2, minY: -13.2, maxY: -9.0, floorY: -11.5 }, // Society Street Gali & Chai Tapri
  ];

  // Shared materials
  const wallCreamMat = new THREE.MeshStandardMaterial({ color: 0xefe8dc, roughness: 0.9 });
  const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xe3dbd0, roughness: 0.72 });
  const tealWallMat = new THREE.MeshStandardMaterial({ map: tex.tealPlaster, roughness: 0.86 });
  const taupeWallMat = new THREE.MeshStandardMaterial({ color: 0x745f4f, roughness: 0.92 });
  const walnutMat = new THREE.MeshStandardMaterial({
    map: tex.walnutWood,
    bumpMap: tex.walnutBump,
    bumpScale: 0.005,
    roughness: 0.44,
    metalness: 0.04,
  });
  const blackGraniteMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.2, metalness: 0.16 });
  const porcelainFloorMat = new THREE.MeshStandardMaterial({
    map: tex.porcelainTile,
    bumpMap: tex.porcelainBump,
    bumpScale: 0.007,
    roughness: 0.14,
    metalness: 0.08,
  });
  const balconyFloorMat = new THREE.MeshStandardMaterial({ map: tex.balconyTile, roughness: 0.68 });
  const bathTileMat = new THREE.MeshStandardMaterial({ map: tex.bathroomTile, roughness: 0.34 });
  const subwayTileMat = new THREE.MeshStandardMaterial({ map: tex.subwayTile, roughness: 0.28 });
  const mosaicTileMat = new THREE.MeshStandardMaterial({ map: tex.blackMosaicTile, roughness: 0.3 });
  const whiteTrimMat = new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.52 });
  const ceramicWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.22, metalness: 0.04 });
  const mustardMat = new THREE.MeshStandardMaterial({
    map: tex.mustardFabric,
    bumpMap: tex.fabricBump,
    bumpScale: 0.009,
    roughness: 0.9,
  });
  const burgundyMat = new THREE.MeshStandardMaterial({ map: tex.burgundyLeather, roughness: 0.44 });
  const beigeCurtainMat = new THREE.MeshStandardMaterial({ color: 0xc8b7a0, roughness: 0.92, side: THREE.DoubleSide });
  const orangeCurtainMat = new THREE.MeshStandardMaterial({
    map: tex.orangeStripedCurtain,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });
  const blackCurtainMat = new THREE.MeshStandardMaterial({
    map: tex.blackGoldCurtain,
    roughness: 0.88,
    side: THREE.DoubleSide,
  });
  const plantLeafMat = new THREE.MeshStandardMaterial({ color: 0x244c29, roughness: 0.65, side: THREE.DoubleSide });
  const vineLeafMat = new THREE.MeshStandardMaterial({ color: 0x336634, roughness: 0.7, side: THREE.DoubleSide });
  const marigoldOrangeMat = new THREE.MeshStandardMaterial({ color: 0xeb6e18, roughness: 0.82 });
  const marigoldYellowMat = new THREE.MeshStandardMaterial({ color: 0xf4b622, roughness: 0.82 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd9dee3, metalness: 0.88, roughness: 0.18 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a148, metalness: 0.72, roughness: 0.28 });
  const terracottaMat = new THREE.MeshStandardMaterial({ map: tex.terracottaPot, roughness: 0.72 });
  const sageMetalMat = new THREE.MeshStandardMaterial({ color: 0x627766, roughness: 0.52, metalness: 0.26 });

  // Helpers
  const addWall = (
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    height: number,
    thickness: number,
    mat: THREE.Material,
    baseY = 0,
    collide = true,
  ) => {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    // Per-wall material instance so camera cutaway can fade blocking walls individually
    const wallMat =
      mat instanceof THREE.MeshStandardMaterial
        ? mat.clone()
        : new THREE.MeshStandardMaterial({ color: 0xefe8dc, roughness: 0.9 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, height, thickness), wallMat);
    mesh.position.set((x1 + x2) / 2, baseY + height / 2, (z1 + z2) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    group.add(mesh);

    const half = thickness * 0.52;
    const minX = Math.min(x1, x2) - half;
    const maxX = Math.max(x1, x2) + half;
    const minZ = Math.min(z1, z2) - half;
    const maxZ = Math.max(z1, z2) + half;

    wallMeshes.push({
      mesh,
      mat: wallMat,
      minX,
      maxX,
      minZ,
      maxZ,
      minY: baseY,
      maxY: baseY + height,
    });

    // Subtle floor baseboard trim for full-height walls
    if (baseY === 0 && height >= 2.5) {
      const skirt = new THREE.Mesh(new THREE.BoxGeometry(len, 0.085, thickness + 0.016), baseboardMat);
      skirt.position.set((x1 + x2) / 2, 0.0425, (z1 + z2) / 2);
      skirt.rotation.y = mesh.rotation.y;
      skirt.receiveShadow = true;
      group.add(skirt);
    }

    if (collide) {
      colliders.push({ minX, maxX, minZ, maxZ, minY: baseY, maxY: baseY + height, isWall: true });
    }
    return mesh;
  };

  const addBox = (
    cx: number,
    cy: number,
    cz: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    opts?: { collide?: boolean; platformLabel?: string; isCozy?: boolean; isHighPerch?: boolean },
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(cx, cy, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    if (opts?.collide) {
      colliders.push({
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
        minY: cy - h / 2,
        maxY: cy + h / 2,
      });
    }
    if (opts?.platformLabel) {
      platforms.push({
        id: opts.platformLabel.toLowerCase().replace(/\s+/g, '_'),
        label: opts.platformLabel,
        minX: cx - w / 2,
        maxX: cx + w / 2,
        minZ: cz - d / 2,
        maxZ: cz + d / 2,
        y: cy + h / 2,
        isCozy: opts.isCozy,
        isHighPerch: opts.isHighPerch,
      });
    }
    return mesh;
  };

  const addPaneledDoorLeaf = (
    hingeX: number,
    hingeZ: number,
    width: number,
    openAngle: number,
    baseRotY = 0,
  ) => {
    const doorPivot = new THREE.Group();
    doorPivot.position.set(hingeX, 0, hingeZ);
    doorPivot.rotation.y = baseRotY + openAngle;

    const slab = new THREE.Mesh(new THREE.BoxGeometry(width, 2.16, 0.045), walnutMat);
    slab.position.set(width / 2, 1.08, 0);
    slab.castShadow = true;
    doorPivot.add(slab);

    // Molded decorative door trim strips & stainless steel handle
    for (const py of [0.58, 1.56]) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, 0.72, 0.056), walnutMat);
      panel.position.set(width / 2, py, 0);
      doorPivot.add(panel);
    }
    for (const side of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.022, 0.04), chromeMat);
      handle.position.set(width - 0.1, 1.02, side * 0.036);
      doorPivot.add(handle);
    }
    for (const hy of [0.35, 1.08, 1.82]) {
      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), chromeMat);
      hinge.position.set(0.008, hy, 0.024);
      doorPivot.add(hinge);
    }
    group.add(doorPivot);
    return doorPivot;
  };

  const addSwitchboard = (x: number, y: number, z: number, rotY = 0) => {
    const board = new THREE.Group();
    board.position.set(x, y, z);
    board.rotation.y = rotY;
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.018), whiteTrimMat);
    board.add(plate);
    for (let i = -2; i <= 2; i++) {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.022), ceramicWhiteMat);
      sw.position.set(i * 0.03, 0, 0.004);
      board.add(sw);
    }
    group.add(board);
  };

  const addCeilingFan = (x: number, z: number) => {
    const fan = new THREE.Group();
    fan.position.set(x, 2.96, z);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), chromeMat);
    rod.position.y = 0.08;
    fan.add(rod);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.1, 14), walnutMat);
    fan.add(hub);
    const trimRing = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.01, 6, 16), goldMat);
    trimRing.rotation.x = Math.PI / 2;
    trimRing.position.y = -0.04;
    fan.add(trimRing);
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.014, 0.12), walnutMat);
      const ang = (i * Math.PI * 2) / 3;
      blade.position.set(Math.cos(ang) * 0.35, -0.015, Math.sin(ang) * 0.35);
      blade.rotation.y = -ang;
      fan.add(blade);
    }
    group.add(fan);
    ceilingFans.push(fan);
  };

  const addMarigoldGarland = (x: number, yTop: number, z: number, height: number, colorMat: THREE.Material) => {
    const garland = new THREE.Group();
    garland.position.set(x, yTop, z);
    const count = Math.floor(height / 0.1);
    for (let i = 0; i < count; i++) {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.056, 0), colorMat);
      puff.position.y = -i * 0.1;
      puff.rotation.y = i * 0.6;
      garland.add(puff);
    }
    group.add(garland);
  };

  const addPlant = (x: number, y: number, z: number, scale = 1, redFlowers = false, stumpPot = false) => {
    const plant = new THREE.Group();
    plant.position.set(x, y, z);
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * scale, 0.12 * scale, 0.32 * scale, 12),
      stumpPot ? walnutMat : terracottaMat,
    );
    pot.position.y = 0.16 * scale;
    pot.castShadow = true;
    pot.receiveShadow = true;
    plant.add(pot);

    const soil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145 * scale, 0.145 * scale, 0.02, 10),
      new THREE.MeshStandardMaterial({ color: 0x2b1e15, roughness: 0.95 }),
    );
    soil.position.y = 0.31 * scale;
    plant.add(soil);

    const leafCount = 10;
    for (let i = 0; i < leafCount; i++) {
      const ang = (i / leafCount) * Math.PI * 2 + i * 0.32;
      const stem = new THREE.Group();
      stem.position.y = 0.28 * scale;
      stem.rotation.y = ang;
      stem.rotation.x = 0.34 + (i % 3) * 0.22;

      const stalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008 * scale, 0.011 * scale, 0.26 * scale, 5),
        plantLeafMat,
      );
      stalk.position.set(0, 0.12 * scale, 0.06 * scale);
      stalk.rotation.x = 0.45;
      stem.add(stalk);

      const blade = new THREE.Mesh(
        new THREE.CircleGeometry(0.18 * scale, 7),
        redFlowers && i % 2 === 0
          ? new THREE.MeshStandardMaterial({ color: 0xb92228, roughness: 0.65, side: THREE.DoubleSide })
          : plantLeafMat,
      );
      blade.scale.set(0.75, 1.38, 1);
      blade.position.set(0, 0.26 * scale, 0.14 * scale);
      blade.rotation.x = -0.7;
      blade.castShadow = true;
      stem.add(blade);
      plant.add(stem);
    }
    group.add(plant);
    return plant;
  };

  const addPhysicsProp = (
    id: string,
    label: string,
    mesh: THREE.Object3D,
    x: number,
    y: number,
    z: number,
    radius: number,
    loudness = 1.6,
    isPaperBall = false,
    canCarry = isPaperBall,
  ) => {
    mesh.position.set(x, y, z);
    group.add(mesh);
    props.push({
      id,
      label,
      mesh,
      pos: new THREE.Vector3(x, y, z),
      vel: new THREE.Vector3(),
      angVel: new THREE.Vector3(),
      homePos: new THREE.Vector3(x, y, z),
      homeQuat: mesh.quaternion.clone(),
      radius,
      knocked: false,
      loudness,
      isPaperBall,
      canCarry,
    });
  };

  // ==========================================================
  // 1. FLOORS, CEILINGS & STRUCTURAL DROP BEAMS
  // ==========================================================
  const addFloorZone = (minX: number, maxX: number, minZ: number, maxZ: number, mat: THREE.Material, y = 0) => {
    const w = maxX - minX;
    const d = maxZ - minZ;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), mat);
    mesh.position.set((minX + maxX) / 2, y - 0.04, (minZ + maxZ) / 2);
    mesh.receiveShadow = true;
    group.add(mesh);
  };

  addFloorZone(-3.2, 3.2, -2.8, 2.8, porcelainFloorMat);
  addFloorZone(3.2, 5.2, -2.6, 1.8, balconyFloorMat, -0.02);
  addFloorZone(0.0, 5.2, -5.8, -2.8, porcelainFloorMat);
  addFloorZone(1.8, 3.2, -8.2, -5.8, porcelainFloorMat);
  addFloorZone(-2.4, 1.8, -11.2, -6.8, porcelainFloorMat);
  addFloorZone(1.8, 6.2, -12.4, -8.2, porcelainFloorMat);
  addFloorZone(4.2, 6.4, -8.2, -5.9, bathTileMat);

  // Ceilings (y = 3.1) + structural soffit beams seen in apartment photos
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.95 });
  const addCeiling = (minX: number, maxX: number, minZ: number, maxZ: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(maxX - minX, maxZ - minZ), ceilingMat);
    m.rotation.x = Math.PI / 2;
    m.position.set((minX + maxX) / 2, 3.1, (minZ + maxZ) / 2);
    group.add(m);
  };
  addCeiling(-3.2, 3.2, -2.8, 2.8);
  addCeiling(0.0, 5.2, -5.8, -2.8);
  addCeiling(1.8, 3.2, -8.2, -5.8);
  addCeiling(-2.4, 1.8, -11.2, -6.8);
  addCeiling(1.8, 6.2, -12.4, -8.2);
  addCeiling(4.2, 6.4, -8.2, -5.9);

  // Overhead concrete soffit beams (Living West, Living North, Kitchen, Study)
  addBox(-3.04, 2.92, 0, 0.32, 0.36, 5.6, wallCreamMat);
  addBox(0, 2.92, -2.66, 6.4, 0.36, 0.28, wallCreamMat);
  addBox(2.6, 2.92, -5.66, 5.2, 0.36, 0.28, wallCreamMat);

  // Ceiling fans in Living Room, Dining/Kitchen, Bedroom, Study
  addCeilingFan(0.0, 0.0);
  addCeilingFan(2.6, -4.3);
  addCeilingFan(-0.4, -9.0);
  addCeilingFan(4.0, -10.3);

  // ==========================================================
  // 2. ARCHITECTURAL WALLS, DOORWAYS & FRAMES
  // ==========================================================
  const H = 3.1;
  const T = 0.14;

  // Living Room Perimeter
  addWall(-3.2, 2.8, 3.2, 2.8, H, T, tealWallMat); // South Teal Feature Wall
  addWall(-3.2, -2.8, -3.2, 1.15, H, T, wallCreamMat);
  addWall(-3.2, 2.15, -3.2, 2.8, H, T, wallCreamMat);
  addWall(-3.2, 1.15, -3.2, 2.15, 0.9, T, wallCreamMat, 2.2);

  // Front Entry Door Frame & Swinging Paneled Door + White Headphones
  addBox(-3.16, 1.11, 1.14, 0.16, 2.22, 0.05, walnutMat);
  addBox(-3.16, 1.11, 2.16, 0.16, 2.22, 0.05, walnutMat);
  addBox(-3.16, 2.22, 1.65, 0.16, 0.05, 1.06, walnutMat);

  const frontDoorPivot = new THREE.Group();
  frontDoorPivot.position.set(-3.15, 0, 2.15);
  const frontDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.18, 0.98), walnutMat);
  frontDoorMesh.position.set(0, 1.09, -0.49);
  frontDoorMesh.castShadow = true;
  frontDoorPivot.add(frontDoorMesh);
  // Door latch + peephole + over-ear headphones
  const doorLatch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.12), chromeMat);
  doorLatch.position.set(0.03, 1.04, -0.84);
  frontDoorPivot.add(doorLatch);
  const hpBand = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.013, 8, 16, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xe6e2da, roughness: 0.35 }),
  );
  hpBand.position.set(0.05, 1.32, -0.58);
  frontDoorPivot.add(hpBand);
  for (const cz of [-0.66, -0.5]) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, 0.025, 12),
      new THREE.MeshStandardMaterial({ color: 0xdfd9cf, roughness: 0.4 }),
    );
    cup.rotation.z = Math.PI / 2;
    cup.position.set(0.055, 1.24, cz);
    frontDoorPivot.add(cup);
  }
  group.add(frontDoorPivot);
  const frontDoorCollider: BoxCollider = {
    minX: -3.26,
    maxX: -3.06,
    minZ: 1.15,
    maxZ: 2.15,
    minY: 0,
    maxY: 2.2,
    isWall: true,
  };
  colliders.push(frontDoorCollider);
  const setFrontDoorOpen = (open: boolean) => {
    frontDoorCollider.maxY = open ? -1 : 2.2;
  };
  interactiveZones.push({
    id: 'front_door',
    label: 'Paw Open / Close Front Door',
    pos: new THREE.Vector3(-3.12, 0.25, 1.65),
    radius: 0.95,
  });

  // Living North wall with Marigold Archway (x: 1.8 to 3.2 open)
  addWall(-3.2, -2.8, 1.8, -2.8, H, T, wallCreamMat);
  addWall(1.8, -2.8, 3.2, -2.8, 0.85, T, wallCreamMat, 2.25);

  // Living East wall with French Balcony Doors (z: -1.8 to 0.2 open!)
  addWall(3.2, 0.2, 3.2, 2.8, H, T, wallCreamMat);
  addWall(3.2, -2.8, 3.2, -1.8, H, T, wallCreamMat);
  addWall(3.2, -1.8, 3.2, 0.2, 0.85, T, wallCreamMat, 2.25);
  // Black granite French door floor threshold
  addBox(3.2, 0.006, -0.8, 0.16, 0.012, 2.0, blackGraniteMat);
  // 6-pane Horizontal Grille French Doors swung wide open
  for (const [dz, rot] of [
    [-1.78, 1.15],
    [0.18, -1.25],
  ] as Array<[number, number]>) {
    const leaf = new THREE.Group();
    leaf.position.set(3.22, 0, dz);
    leaf.rotation.y = rot;
    // Outer stile & rails
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.85), whiteTrimMat);
    topRail.position.set(0.42, 2.15, 0);
    topRail.rotation.y = Math.PI / 2;
    leaf.add(topRail);
    const botRail = topRail.clone();
    botRail.position.y = 0.08;
    leaf.add(botRail);
    const midRail = topRail.clone();
    midRail.position.y = 1.05;
    leaf.add(midRail);
    for (const sx of [0.04, 0.8]) {
      const stile = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.2, 0.07), whiteTrimMat);
      stile.position.set(sx, 1.1, 0);
      stile.rotation.y = Math.PI / 2;
      leaf.add(stile);
    }
    // Horizontal white window grille bars
    for (const gy of [0.35, 0.6, 0.84, 1.32, 1.58, 1.84]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.025, 0.72), whiteTrimMat);
      bar.position.set(0.42, gy, 0);
      bar.rotation.y = Math.PI / 2;
      leaf.add(bar);
    }
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(0.72, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xd8eef5, transparent: true, opacity: 0.18, roughness: 0.08 }),
    );
    glass.position.set(0.42, 1.12, 0);
    glass.rotation.y = Math.PI / 2;
    leaf.add(glass);
    group.add(leaf);
  }

  // Balcony Boundaries
  addWall(3.2, -2.6, 5.2, -2.6, 2.9, T, taupeWallMat);
  addWall(3.2, 1.8, 5.2, 1.8, 1.08, 0.1, taupeWallMat);
  const railGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.98, 4.4),
    new THREE.MeshStandardMaterial({ color: 0xaad4e6, transparent: true, opacity: 0.22, roughness: 0.08 }),
  );
  railGlass.position.set(5.14, 0.52, -0.4);
  group.add(railGlass);
  // Chrome posts + handrail
  for (const pz of [-2.52, -1.1, 0.35, 1.72]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.04, 0.05), chromeMat);
    post.position.set(5.14, 0.52, pz);
    group.add(post);
  }
  addBox(5.14, 1.04, -0.4, 0.075, 0.055, 4.45, chromeMat, {
    collide: true,
    platformLabel: 'Balcony Railing',
    isHighPerch: true,
  });

  // Kitchen & Dining Nook Walls
  addWall(0.0, -5.8, 0.0, -2.8, H, T, wallCreamMat);
  addWall(5.2, -5.8, 5.2, -2.6, H, T, wallCreamMat);
  addWall(0.0, -5.8, 1.8, -5.8, H, T, wallCreamMat);
  addWall(3.2, -5.8, 5.2, -5.8, H, T, wallCreamMat);
  addWall(1.8, -5.8, 3.2, -5.8, 0.85, T, wallCreamMat, 2.25);

  // Back Hallway Walls (clean doorway seams!)
  addWall(1.8, -6.95, 1.8, -5.8, H, T, wallCreamMat);
  addWall(1.8, -8.2, 1.8, -7.95, H, T, wallCreamMat);
  addWall(1.8, -7.95, 1.8, -6.95, 0.85, T, wallCreamMat, 2.25);
  addWall(3.2, -8.2, 3.2, -5.8, H, T, wallCreamMat);

  // Bedroom 1 Walls (trimmed flush at x=1.74 on south corner so doorway stays 100% open!)
  addWall(-2.4, -11.2, 1.8, -11.2, H, T, wallCreamMat);
  addWall(-2.4, -11.2, -2.4, -6.8, H, T, wallCreamMat);
  addWall(-2.4, -6.8, 1.73, -6.8, H, T, wallCreamMat);
  addWall(1.8, -11.2, 1.8, -7.95, H, T, wallCreamMat);
  // Bedroom Door Frame & Open Door Leaf
  addBox(1.8, 1.12, -7.95, 0.18, 2.24, 0.05, walnutMat);
  addBox(1.8, 1.12, -6.95, 0.18, 2.24, 0.05, walnutMat);
  addPaneledDoorLeaf(1.74, -7.92, 0.92, -0.55, -Math.PI / 2);

  // Study / Office Walls (Doorway at z = -8.2, x: 1.95 to 3.05; Bathroom doorway at z = -8.2, x: 4.55 to 5.55)
  addWall(1.8, -12.4, 1.8, -8.2, H, T, wallCreamMat);
  addWall(1.8, -12.4, 6.2, -12.4, H, T, wallCreamMat);
  addWall(6.2, -12.4, 6.2, -8.2, H, T, wallCreamMat);
  addWall(3.05, -8.2, 4.55, -8.2, H, T, wallCreamMat);
  addWall(5.55, -8.2, 6.2, -8.2, H, T, wallCreamMat);
  addWall(1.95, -8.2, 3.05, -8.2, 0.85, T, wallCreamMat, 2.25);
  addBox(1.96, 1.12, -8.2, 0.06, 2.24, 0.18, walnutMat);
  addBox(3.04, 1.12, -8.2, 0.06, 2.24, 0.18, walnutMat);
  addPaneledDoorLeaf(1.98, -8.24, 0.96, -1.15, 0);

  // Black granite bathroom door frame & open walnut door
  addBox(4.52, 1.12, -8.2, 0.08, 2.24, 0.18, blackGraniteMat);
  addBox(5.58, 1.12, -8.2, 0.08, 2.24, 0.18, blackGraniteMat);
  addBox(5.05, 2.26, -8.2, 1.14, 0.08, 0.18, blackGraniteMat);
  addWall(4.55, -8.2, 5.55, -8.2, 0.85, T, wallCreamMat, 2.25);
  addPaneledDoorLeaf(5.54, -8.14, 0.9, 1.3, Math.PI);

  // Attached Bathroom Walls
  addWall(4.2, -8.2, 4.2, -5.9, H, T, bathTileMat);
  addWall(6.4, -8.2, 6.4, -5.9, H, T, bathTileMat);
  addWall(4.2, -5.9, 6.4, -5.9, H, T, bathTileMat);

  // Interactive Wall Switchboards
  addSwitchboard(-1.85, 1.25, -2.72, 0);
  addSwitchboard(2.25, 1.48, 2.72, Math.PI);
  interactiveZones.push({
    id: 'switch_living',
    label: 'Flicker Living Room Lights',
    pos: new THREE.Vector3(-1.85, 0.25, -2.55),
    radius: 0.9,
  });
  addSwitchboard(1.55, 1.25, -5.72, 0);
  interactiveZones.push({
    id: 'switch_kitchen',
    label: 'Flicker Kitchen Lights',
    pos: new THREE.Vector3(1.55, 0.25, -5.5),
    radius: 0.9,
  });
  addSwitchboard(2.05, 1.22, -9.2, Math.PI / 2);
  interactiveZones.push({
    id: 'switch_study',
    label: 'Flicker Study Lights',
    pos: new THREE.Vector3(2.1, 0.25, -9.2),
    radius: 0.9,
  });
  addSwitchboard(5.85, 1.22, -8.28, Math.PI);

  // ==========================================================
  // 3. DETAILED LIVING ROOM FURNITURE & PROPS
  // ==========================================================
  // Modular 2-Piece Mustard Sofa with dark wooden legs & split cushion seams
  for (const fx of [-2.18, -0.9, 0.45]) {
    for (const fz of [-2.68, -1.98]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.018, 0.06, 8), walnutMat);
      foot.position.set(fx, 0.03, fz);
      group.add(foot);
    }
  }
  addBox(-0.85, 0.24, -2.32, 2.84, 0.36, 0.88, mustardMat, {
    collide: true,
    platformLabel: 'Mustard Sofa',
    isCozy: true,
  });
  // Individual tufted seat cushion caps
  for (const cx of [-1.56, -0.14]) {
    addBox(cx, 0.43, -2.3, 1.36, 0.06, 0.82, mustardMat);
  }
  // Thick rounded back bolsters + decorative throw pillows + TV Remote
  addBox(-1.58, 0.56, -2.56, 1.05, 0.3, 0.26, mustardMat, { collide: true });
  addBox(-0.14, 0.56, -2.56, 1.05, 0.3, 0.26, mustardMat, { collide: true });
  const coralPillowMat = new THREE.MeshStandardMaterial({ color: 0xc85d44, roughness: 0.88 });
  const creamPillowMat = new THREE.MeshStandardMaterial({ color: 0xede3d2, roughness: 0.88 });
  for (const [px, rotZ, mat] of [
    [-2.02, 0.24, coralPillowMat],
    [0.32, -0.22, creamPillowMat],
    [-1.22, -0.14, creamPillowMat],
  ] as Array<[number, number, THREE.Material]>) {
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.12), mat);
    cushion.position.set(px, 0.6, -2.38);
    cushion.rotation.set(-0.22, rotZ * 0.5, rotZ);
    cushion.castShadow = true;
    group.add(cushion);
  }
  // Black Smart TV Remote resting on sofa
  const tvRemote = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.018, 0.17), blackGraniteMat);
  tvRemote.position.set(0.15, 0.47, -2.06);
  tvRemote.rotation.y = 0.28;
  group.add(tvRemote);
  interactiveZones.push({
    id: 'cat_tv',
    label: 'Step on Remote → Toggle Cat TV',
    pos: new THREE.Vector3(0.15, 0.46, -2.06),
    radius: 0.85,
  });

  hideSpots.push({ id: 'under_sofa', label: 'Behind Mustard Sofa', pos: new THREE.Vector3(-2.05, 0, -2.0), radius: 0.72 });

  // Open Laptop + Water Bottle on the mustard sofa!
  const laptopPos = new THREE.Vector3(-0.78, 0.46, -2.14);
  const laptopBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.018, 0.24),
    new THREE.MeshStandardMaterial({ color: 0xb0b5bd, metalness: 0.65, roughness: 0.25 }),
  );
  laptopBase.position.copy(laptopPos);
  group.add(laptopBase);
  const keyboardPad = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.004, 0.12), blackGraniteMat);
  keyboardPad.position.set(laptopPos.x, laptopPos.y + 0.01, laptopPos.z - 0.03);
  group.add(keyboardPad);
  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.23, 0.012),
    new THREE.MeshStandardMaterial({
      map: tex.laptopScreen,
      emissive: 0x3b82f6,
      emissiveMap: tex.laptopScreen,
      emissiveIntensity: 0.9,
      roughness: 0.18,
    }),
  );
  laptopScreen.position.set(laptopPos.x, laptopPos.y + 0.12, laptopPos.z - 0.115);
  laptopScreen.rotation.x = -0.22;
  group.add(laptopScreen);
  // Half-full clear water bottle beside laptop
  const bottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.19, 10),
    new THREE.MeshStandardMaterial({ color: 0x9cd2f0, transparent: true, opacity: 0.52, roughness: 0.12 }),
  );
  bottle.position.set(-0.48, 0.55, -2.26);
  group.add(bottle);
  const bottleCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8),
    new THREE.MeshStandardMaterial({ color: 0x1d68b8 }),
  );
  bottleCap.position.set(-0.48, 0.655, -2.26);
  group.add(bottleCap);

  sitSpots.push({
    id: 'sofa_laptop',
    label: 'Loaf & Mash Laptop Keyboard',
    pos: new THREE.Vector3(laptopPos.x, 0.46, -2.05),
    lookYaw: 0,
    mode: 'loaf',
    isLaptop: true,
  });

  // Open Corrugated Delivery Cardboard Box ("If I Fits, I Sits" Stealth Tank - roomy so Brownie sits cleanly INSIDE!)
  const boxGroup = new THREE.Group();
  const boxX = -2.18;
  const boxZ = 1.72;
  boxGroup.position.set(boxX, 0, boxZ);
  boxGroup.rotation.y = 0.28;
  const boxMat = new THREE.MeshStandardMaterial({ map: tex.cardboardBox, roughness: 0.88, side: THREE.DoubleSide });
  const boxFloor = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.02, 0.56), boxMat);
  boxFloor.position.y = 0.01;
  boxGroup.add(boxFloor);
  for (const [wx, wz, rw, rd, flapRot] of [
    [0, -0.275, 0.56, 0.02, -0.58],
    [0, 0.275, 0.56, 0.02, 0.58],
    [-0.275, 0, 0.02, 0.56, 0],
    [0.275, 0, 0.02, 0.56, 0],
  ] as Array<[number, number, number, number, number]>) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.3, 0.02 === rd ? rd : rd), boxMat);
    wall.position.set(wx, 0.15, wz);
    wall.castShadow = true;
    wall.receiveShadow = true;
    boxGroup.add(wall);
    if (flapRot !== 0) {
      const flap = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.14, 0.015), boxMat);
      flap.position.set(wx, 0.32, wz + Math.sign(wz) * 0.05);
      flap.rotation.x = flapRot;
      boxGroup.add(flap);
    }
  }
  group.add(boxGroup);
  sitSpots.push({
    id: 'cardboard_box',
    label: 'Sit Inside Cardboard Box',
    pos: new THREE.Vector3(boxX, 0.018, boxZ),
    lookYaw: 0.28,
    mode: 'sit_in',
  });
  hideSpots.push({ id: 'cardboard_hide', label: 'Cardboard Stealth Tank', pos: new THREE.Vector3(boxX, 0, boxZ), radius: 0.52 });

  // 3 Framed Stone/Brick Wall Art Panels above Sofa
  for (const [bx, bw, bh] of [
    [-1.7, 0.56, 0.37],
    [-0.85, 0.8, 0.53],
    [0.05, 0.56, 0.37],
  ]) {
    addBox(bx, 1.76, -2.7, bw + 0.03, bh + 0.03, 0.03, walnutMat);
    addBox(bx, 1.76, -2.68, bw, bh, 0.035, new THREE.MeshStandardMaterial({ map: tex.brickArt, roughness: 0.88 }));
  }

  // Sculpted Burgundy Leather Beanbag (multi-lobed cushion profile)
  const beanbagGroup = new THREE.Group();
  beanbagGroup.position.set(-2.42, 0, -2.02);
  const bbBase = new THREE.Mesh(new THREE.SphereGeometry(0.54, 18, 14), burgundyMat);
  bbBase.scale.set(1.16, 0.62, 1.06);
  bbBase.position.y = 0.28;
  bbBase.castShadow = true;
  bbBase.receiveShadow = true;
  beanbagGroup.add(bbBase);
  const bbBack = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), burgundyMat);
  bbBack.scale.set(1.0, 1.05, 0.72);
  bbBack.position.set(-0.14, 0.48, -0.14);
  bbBack.castShadow = true;
  beanbagGroup.add(bbBack);
  group.add(beanbagGroup);
  platforms.push({
    id: 'burgundy_beanbag',
    label: 'Burgundy Beanbag',
    minX: -2.92,
    maxX: -1.92,
    minZ: -2.5,
    maxZ: -1.5,
    y: 0.6,
    isCozy: true,
  });
  sitSpots.push({
    id: 'beanbag_cozy',
    label: 'Curl Up on Beanbag',
    pos: new THREE.Vector3(-2.35, 0.6, -1.96),
    lookYaw: 0.7,
    mode: 'loaf',
  });
  hideSpots.push({ id: 'behind_beanbag', label: 'Behind Beanbag', pos: new THREE.Vector3(-2.8, 0, -2.4), radius: 0.68 });

  // Plush Wavy Brown & Cream Rug + Brownie's Bowls + Red Floor Cushion
  const rug = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 0.022, 1.2),
    new THREE.MeshStandardMaterial({ map: tex.wavyRug, roughness: 0.96 }),
  );
  rug.position.set(-1.12, 0.011, -1.04);
  rug.receiveShadow = true;
  group.add(rug);

  const floorCushion = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.36), burgundyMat);
  floorCushion.position.set(-1.68, 0.04, -1.18);
  floorCushion.rotation.y = 0.2;
  group.add(floorCushion);

  for (const [bx, col] of [
    [-1.65, 0x3b4d5e],
    [-1.36, 0xdad4c8],
  ] as Array<[number, number]>) {
    const bowl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.09, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.28 }),
    );
    bowl.position.set(bx, 0.032, -1.52);
    group.add(bowl);
  }
  const bowlWater = new THREE.Mesh(
    new THREE.CircleGeometry(0.095, 16),
    new THREE.MeshStandardMaterial({ color: 0x8ed6f2, transparent: true, opacity: 0.72, roughness: 0.1 }),
  );
  bowlWater.rotation.x = -Math.PI / 2;
  bowlWater.position.set(-1.36, 0.056, -1.52);
  group.add(bowlWater);
  interactiveZones.push({
    id: 'drink_water_bowl',
    label: 'Lap Water from Bowl',
    pos: new THREE.Vector3(-1.36, 0.08, -1.52),
    radius: 0.75,
  });

  // Sisal Cat Scratching Post with Dangling Pom-Pom + Sofa Arm Scratch Zone (Stray-style!)
  const scratchBase = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.36), walnutMat);
  scratchBase.position.set(0.82, 0.02, -2.35);
  scratchBase.castShadow = true;
  group.add(scratchBase);
  const sisalMat = new THREE.MeshStandardMaterial({ color: 0xcab082, roughness: 0.96 });
  const sisalPost = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.058, 0.62, 12), sisalMat);
  sisalPost.position.set(0.82, 0.33, -2.35);
  sisalPost.castShadow = true;
  group.add(sisalPost);
  const scratchTop = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 14), mustardMat);
  scratchTop.position.set(0.82, 0.65, -2.35);
  group.add(scratchTop);
  const pomString = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 4), ceramicWhiteMat);
  pomString.position.set(0.71, 0.56, -2.35);
  group.add(pomString);
  const pomBall = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), coralPillowMat);
  pomBall.position.set(0.71, 0.47, -2.35);
  group.add(pomBall);
  platforms.push({
    id: 'sisal_post_top',
    label: 'Scratching Post Perch',
    minX: 0.66,
    maxX: 0.98,
    minZ: -2.51,
    maxZ: -2.19,
    y: 0.67,
  });
  interactiveZones.push({
    id: 'scratch_post',
    label: 'Claw & Scratch Sisal Post',
    pos: new THREE.Vector3(0.82, 0.2, -2.35),
    radius: 0.78,
  });
  interactiveZones.push({
    id: 'scratch_living_sofa',
    label: 'Shred Mustard Sofa Corner',
    pos: new THREE.Vector3(0.55, 0.22, -2.02),
    radius: 0.8,
  });

  // Tall Alocasia Plant in Carved Wood-Stump Pot
  addPlant(1.18, 0, -2.3, 1.38, false, true);

  // Dark Walnut Entry Chest (Detailed 2 Drawers + Upper Doors + Leaning Mirror + Gold Chains + Diyas)
  addBox(-2.86, 0.52, -0.35, 0.48, 1.04, 0.88, walnutMat, {
    collide: true,
    platformLabel: 'Walnut Entry Cabinet',
    isHighPerch: true,
  });
  // Silver drawer handles & cabinet seam grooves
  for (const hy of [0.22, 0.44]) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.016, 0.16), chromeMat);
    handle.position.set(-2.61, hy, -0.35);
    group.add(handle);
  }
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.44, 0.01), blackGraniteMat);
  seam.position.set(-2.618, 0.78, -0.35);
  group.add(seam);

  // Leaning Mirror cleanly rested against wall + gold beaded hanging garlands with brass cords
  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.56, 0.4), whiteTrimMat);
  mirrorFrame.position.set(-3.04, 1.32, -0.35);
  mirrorFrame.rotation.z = -0.04;
  group.add(mirrorFrame);
  const mirrorGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.52, 0.36),
    new THREE.MeshStandardMaterial({ color: 0xd6e8f4, metalness: 0.96, roughness: 0.04 }),
  );
  mirrorGlass.position.set(-3.035, 1.32, -0.35);
  mirrorGlass.rotation.z = -0.04;
  group.add(mirrorGlass);
  // Gold beaded hanging wall garlands flanking cabinet (mounted on brass wire cord)
  for (const gz of [-0.95, 0.25]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.94, 6), goldMat);
    cord.position.set(-3.08, 1.60, gz);
    group.add(cord);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.015, 8), goldMat);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(-3.085, 2.07, gz);
    group.add(pin);
    for (let i = 0; i < 10; i++) {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), goldMat);
      bead.position.set(-3.08, 2.05 - i * 0.1, gz);
      group.add(bead);
    }
  }
  // Knockable Brass Candle Cup & Painted Clay Diya on Walnut Cabinet!
  const brassCup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.08, 12), goldMat);
  brassCup.castShadow = true;
  addPhysicsProp('cabinet_cup', 'Brass Candle Cup', brassCup, -2.78, 1.08, -0.1, 0.055, 2.0);
  const diya = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.045, 10), terracottaMat);
  diya.rotation.x = Math.PI;
  addPhysicsProp('cabinet_diya', 'Painted Clay Diya', diya, -2.78, 1.06, -0.58, 0.06, 2.1);

  // Open 2-Tier Walnut TV Console + Flat Screen TV + Teal Wall Sconce + Orange Lantern
  addBox(0.15, 0.05, 2.46, 1.85, 0.06, 0.46, walnutMat, { collide: true });
  addBox(0.15, 0.23, 2.46, 1.82, 0.035, 0.44, walnutMat);
  addBox(0.15, 0.42, 2.46, 1.85, 0.05, 0.46, walnutMat, {
    collide: true,
    platformLabel: 'TV Console',
  });
  for (const px of [-0.74, 0.15, 1.04]) {
    addBox(px, 0.23, 2.46, 0.04, 0.36, 0.42, walnutMat);
  }
  // White Xbox/console box & white bowl inside TV shelf
  addBox(-0.32, 0.29, 2.46, 0.28, 0.06, 0.24, ceramicWhiteMat);
  addBox(-0.32, 0.12, 2.46, 0.14, 0.08, 0.14, ceramicWhiteMat);

  // Flat Screen TV + Y-feet + Cat TV Material + Laser Pointer Toy
  const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.88, 0.04), blackGraniteMat);
  tvFrame.position.set(0.15, 0.9, 2.53);
  tvFrame.castShadow = true;
  group.add(tvFrame);
  const tvScreenMat = new THREE.MeshStandardMaterial({
    map: tex.tvScreenMusic,
    emissive: 0xffffff,
    emissiveMap: tex.tvScreenMusic,
    emissiveIntensity: 0.72,
    roughness: 0.14,
  });
  const tvPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), tvScreenMat);
  tvPanel.position.set(0.15, 0.9, 2.508);
  tvPanel.rotation.y = Math.PI;
  group.add(tvPanel);
  for (const fx of [-0.35, 0.65]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.18), blackGraniteMat);
    leg.position.set(fx, 0.47, 2.5);
    group.add(leg);
  }
  // Red Laser Pointer Toy on TV Console + Active 3D Laser Dot
  const laserBody = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 10), chromeMat);
  laserBody.rotation.z = Math.PI / 2;
  laserBody.position.set(-0.42, 0.46, 2.34);
  group.add(laserBody);
  const laserTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2233 }),
  );
  laserTip.position.set(-0.35, 0.46, 2.34);
  group.add(laserTip);
  interactiveZones.push({
    id: 'laser_pointer',
    label: 'Bat Red Laser Toy ON',
    pos: new THREE.Vector3(-0.4, 0.46, 2.34),
    radius: 0.85,
  });
  const laserDotMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.028, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xff1e2d }),
  );
  laserDotMesh.visible = false;
  group.add(laserDotMesh);

  // Teal Wall Accent Sconce high above TV
  const sconce = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.05, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0xceb38e, emissive: 0xffd08c, emissiveIntensity: 0.65 }),
  );
  sconce.position.set(0.15, 2.25, 2.68);
  group.add(sconce);

  // Knockable ceramic trinket on TV stand
  const tvVase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 0.13, 12), ceramicWhiteMat);
  addPhysicsProp('tv_vase', 'Ceramic Vase', tvVase, 0.92, 0.51, 2.38, 0.065, 2.2);

  // Jingle Bell Ball Physics Toy near Living <-> Hallway rug
  const bellGroup = new THREE.Group();
  const bellBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.048, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0xd9383a, roughness: 0.28, metalness: 0.2 }),
  );
  bellGroup.add(bellBall);
  const bellStripe = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.008, 6, 16), goldMat);
  bellGroup.add(bellStripe);
  bellGroup.castShadow = true;
  addPhysicsProp('jingle_ball', 'Jingle Bell Ball', bellGroup, 0.65, 0.048, -0.85, 0.052, 0.8, false);

  // Glowing Ribbed Orange Floor Lantern right of TV
  const orangeLanternMat = new THREE.MeshStandardMaterial({
    color: 0xff8a26,
    emissive: 0xff6e14,
    emissiveIntensity: 1.55,
    roughness: 0.72,
  });
  const tvLantern = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), orangeLanternMat);
  tvLantern.scale.set(1.06, 0.88, 1.06);
  tvLantern.position.set(1.38, 0.15, 2.42);
  group.add(tvLantern);

  // Fiddle/Rubber Plant in Blue-and-White Patterned Ceramic Pot + A-Frame Ladder Plant Stand
  addPlant(2.15, 0, 2.36, 1.15);

  const aFrame = new THREE.Group();
  aFrame.position.set(-1.55, 0, 2.42);
  // 4 slanted wooden frame rails
  for (const sx of [-0.2, 0.2]) {
    for (const [sz, tilt] of [
      [-0.14, -0.14],
      [0.14, 0.14],
    ]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.32, 0.025), walnutMat);
      rail.position.set(sx, 0.65, sz);
      rail.rotation.x = tilt;
      aFrame.add(rail);
    }
  }
  for (const [sy, w, d] of [
    [0.24, 0.44, 0.36],
    [0.72, 0.38, 0.28],
    [1.22, 0.32, 0.22],
  ]) {
    const tier = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), walnutMat);
    tier.position.set(0, sy, 0);
    tier.castShadow = true;
    aFrame.add(tier);
  }
  group.add(aFrame);
  colliders.push({ minX: -1.78, maxX: -1.32, minZ: 2.2, maxZ: 2.64, minY: 0, maxY: 1.25 });
  platforms.push({
    id: 'plant_stand',
    label: 'Plant Stand',
    minX: -1.75,
    maxX: -1.35,
    minZ: 2.24,
    maxZ: 2.58,
    y: 1.24,
    isHighPerch: true,
  });
  addPlant(-1.55, 1.24, 2.42, 0.68);
  // Small brass hammered planter on middle shelf
  const midPot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.14, 12), goldMat);
  midPot.position.set(-1.55, 0.8, 2.42);
  group.add(midPot);

  // Iconic Curved Natural Driftwood Branch Floor Lamp (South-West Teal Corner)
  const branchMat = new THREE.MeshStandardMaterial({ color: 0x8b6c4e, roughness: 0.9 });
  const branchBasket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.14, 0.38, 14),
    new THREE.MeshStandardMaterial({ color: 0xb78b56, roughness: 0.9 }),
  );
  branchBasket.position.set(-2.68, 0.19, 2.38);
  branchBasket.castShadow = true;
  group.add(branchBasket);
  colliders.push({ minX: -2.88, maxX: -2.48, minZ: 2.18, maxZ: 2.58, minY: 0, maxY: 0.42 });

  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.68, 0.25, 2.38),
    new THREE.Vector3(-2.6, 1.4, 2.42),
    new THREE.Vector3(-2.25, 2.1, 2.32),
    new THREE.Vector3(-1.75, 2.28, 2.18),
  ]);
  const branchMesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.032, 8, false), branchMat);
  branchMesh.castShadow = true;
  group.add(branchMesh);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xfff2dc,
    emissive: 0xffc67c,
    emissiveIntensity: 1.15,
    roughness: 0.65,
    side: THREE.DoubleSide,
  });
  const branchShade = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 14, 1, true), shadeMat);
  branchShade.position.set(-1.78, 2.02, 2.18);
  group.add(branchShade);

  // Warm Amber/Peach Corner Lamp behind Beanbag
  const pinkLampMat = new THREE.MeshStandardMaterial({
    color: 0xffbe88,
    emissive: 0xff8538,
    emissiveIntensity: 1.45,
    roughness: 0.58,
  });
  const pinkLampShade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.24, 14),
    pinkLampMat,
  );
  pinkLampShade.position.set(-2.85, 1.48, -2.5);
  group.add(pinkLampShade);
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, 1.45, 8), blackGraniteMat);
  lampPole.position.set(-2.85, 0.72, -2.5);
  group.add(lampPole);

  // 3D Wave-Pleated Climbable Curtains + Curtain Rods!
  const buildPleatedCurtain = (
    id: string,
    label: string,
    x: number,
    z: number,
    width: number,
    rotY: number,
    mat: THREE.Material,
  ) => {
    const cGroup = new THREE.Group();
    cGroup.position.set(x, 0, z);
    cGroup.rotation.y = rotY;

    // White curtain rod & silver finial rings
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, width + 0.2, 8), whiteTrimMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.y = 2.58;
    cGroup.add(rod);

    const folds = 7;
    const foldW = width / folds;
    for (let i = 0; i < folds; i++) {
      const fx = -width / 2 + foldW * (i + 0.5);
      const pleat = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.052, 2.52, 8, 1, false), mat);
      pleat.scale.set(foldW / 0.09, 1, 0.65);
      pleat.position.set(fx, 1.3, (i % 2 === 0 ? 1 : -1) * 0.015);
      pleat.castShadow = true;
      cGroup.add(pleat);
    }

    group.add(cGroup);
    curtains.push({ id, label, mesh: cGroup, pos: new THREE.Vector3(x, 0, z), topY: 2.48, climbedRecently: 0 });
    hideSpots.push({ id: `curtain_${id}`, label: `Behind ${label}`, pos: new THREE.Vector3(x, 0, z), radius: 0.65 });
  };
  buildPleatedCurtain('living_fairy', 'Fairy-Light Curtains', 3.04, 1.48, 2.1, -Math.PI / 2, beigeCurtainMat);
  buildPleatedCurtain('nook_orange', 'Orange Striped Curtains', 5.04, -4.3, 1.85, -Math.PI / 2, orangeCurtainMat);
  buildPleatedCurtain('bed_beige', 'Bedroom Curtains', -2.24, -8.3, 1.75, Math.PI / 2, beigeCurtainMat);
  buildPleatedCurtain('study_black', 'Black Gold-Leaf Curtains', 2.85, -12.24, 1.85, 0, blackCurtainMat);
  buildPleatedCurtain('study_beige', 'Study Beige Curtains', 6.04, -11.1, 1.75, -Math.PI / 2, beigeCurtainMat);

  // Twinkling Fairy-Light Particles on Living Room Curtains + Balcony Bulbs
  const fairyCoords: number[] = [];
  for (let s = 0; s < 14; s++) {
    const fz = 0.45 + (s / 13) * 2.05;
    for (let b = 0; b < 7; b++) {
      fairyCoords.push(2.98, 0.3 + b * 0.34 + Math.random() * 0.08, fz);
    }
  }
  // Hanging balcony string bulbs
  for (let i = 0; i < 6; i++) {
    fairyCoords.push(4.3 + i * 0.14, 2.15 - Math.sin((i / 5) * Math.PI) * 0.35, -0.5 + i * 0.15);
  }
  const fairyGeo = new THREE.BufferGeometry();
  fairyGeo.setAttribute('position', new THREE.Float32BufferAttribute(fairyCoords, 3));
  const fairyMat = new THREE.PointsMaterial({
    map: tex.glowHalo,
    color: 0xffdf99,
    size: 0.13,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const fairyLightPoints = new THREE.Points(fairyGeo, fairyMat);
  group.add(fairyLightPoints);

  // Marigold Garlands on Living Archway & Hallway
  addMarigoldGarland(1.88, 2.25, -2.72, 2.05, marigoldYellowMat);
  addMarigoldGarland(1.88, 2.25, -5.72, 2.05, marigoldYellowMat);
  addMarigoldGarland(3.1, 2.25, -5.72, 2.05, marigoldOrangeMat);

  // ==========================================================
  // 4. BALCONY PROPS, MARIGOLD RAILING & NIGHT CITY SKYLINE
  // ==========================================================
  for (let i = 0; i < 16; i++) {
    const gz = -2.2 + i * 0.25;
    const mat = i % 2 === 0 ? marigoldOrangeMat : marigoldYellowMat;
    const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 0), mat);
    puff.position.set(5.08, 0.92 - Math.sin((i / 15) * Math.PI) * 0.24, gz);
    group.add(puff);
  }
  // Overhead balcony clothes-drying rack rods
  for (const rx of [3.75, 4.05, 4.35, 4.65]) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 2.4, 6), chromeMat);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(rx, 2.65, -0.4);
    group.add(bar);
  }
  // White metal plant rack + grow bags + red poinsettias
  addBox(4.35, 0.18, -2.18, 1.05, 0.03, 0.36, whiteTrimMat, { collide: true, platformLabel: 'Balcony Plant Stand' });
  addPlant(3.65, 0, -2.2, 0.95, false, true);
  addPlant(4.25, 0.2, -2.2, 0.85, false);
  addPlant(4.78, 0, -2.2, 0.95, true);
  addPlant(4.85, 0, -1.55, 0.85, true);

  // Balcony string-light cable + 3D warm glass bulbs
  const bulbCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(3.35, 2.45, -1.7),
    new THREE.Vector3(4.2, 2.02, -0.4),
    new THREE.Vector3(5.02, 2.42, 0.95),
  ]);
  const bulbWire = new THREE.Mesh(new THREE.TubeGeometry(bulbCurve, 14, 0.008, 6, false), blackGraniteMat);
  group.add(bulbWire);
  const bulbGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff3d4,
    emissive: 0xffb84d,
    emissiveIntensity: 2.0,
    roughness: 0.25,
  });
  for (let i = 0; i <= 6; i++) {
    const pt = bulbCurve.getPoint(i / 6);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), bulbGlowMat);
    bulb.position.set(pt.x, pt.y - 0.04, pt.z);
    group.add(bulb);
  }

  // Night City Skyline Towers + Twilight Moon & Stars outside Balcony
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 16, 14),
    new THREE.MeshBasicMaterial({ color: 0xfff0cc }),
  );
  moonMesh.position.set(28, 13.5, -14);
  group.add(moonMesh);

  const cityMat = new THREE.MeshStandardMaterial({
    map: tex.cityWindowGrid,
    emissive: 0xffffff,
    emissiveMap: tex.cityWindowGrid,
    emissiveIntensity: 0.85,
    roughness: 0.8,
  });
  const towerSpecs: Array<[number, number, number, number, number]> = [
    [13, -7, 3.2, 16, 3.4],
    [17, 1, 3.8, 22, 4.0],
    [14, 7, 3.0, 14, 3.2],
    [22, -4, 4.5, 26, 4.5],
    [21, 9, 4.2, 19, 3.8],
    [18, -11, 3.5, 18, 3.5],
  ];
  for (const [tx, tz, tw, th, td] of towerSpecs) {
    const bldg = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), cityMat);
    bldg.position.set(tx, th / 2 - 4, tz);
    group.add(bldg);
  }

  // ==========================================================
  // 4B. OUTSIDE CORRIDOR (FLOOR 4B), NEIGHBOR 402, ELEVATOR LOBBY & SKY TERRACE
  // ==========================================================
  const corridorFloorMat = new THREE.MeshStandardMaterial({
    map: tex.corridorTile,
    roughness: 0.22,
    metalness: 0.08,
  });
  addFloorZone(-8.6, -3.2, -2.6, 4.4, corridorFloorMat);
  addCeiling(-8.6, -3.2, -2.6, 4.4);
  addFloorZone(-12.4, -8.6, -2.6, 3.4, balconyFloorMat, -0.02);

  // Corridor East Wall South of 4B (clean corridor wall + society noticeboard, replacing the tiny old 401 grill cutout)
  addWall(-3.2, 2.8, -3.2, 4.4, H, T, wallCreamMat);
  addBox(-3.28, 1.55, 3.6, 0.04, 0.72, 1.05, walnutMat);
  addBox(-3.31, 1.55, 3.6, 0.02, 0.62, 0.95, new THREE.MeshStandardMaterial({ color: 0x3b6e5c, roughness: 0.88 }));

  // North Corridor Wall: Elevator Shaft (-7.5..-5.7) + Flat 401 Swinging Entry Doorway (-5.05..-4.05, z=-2.6)
  addWall(-8.6, -2.6, -7.5, -2.6, H, T, wallCreamMat);
  addWall(-5.7, -2.6, -5.05, -2.6, H, T, wallCreamMat);
  addWall(-4.05, -2.6, -3.2, -2.6, H, T, wallCreamMat);
  addWall(-5.05, -2.6, -4.05, -2.6, 0.9, T, wallCreamMat, 2.2);
  addWall(-7.5, -2.6, -5.7, -2.6, 0.9, T, wallCreamMat, 2.2);

  // Neighbor 401 Entry Door Frame, Swinging Door, Plaque & Doorbell
  addBox(-5.07, 1.11, -2.58, 0.05, 2.22, 0.16, walnutMat);
  addBox(-4.03, 1.11, -2.58, 0.05, 2.22, 0.16, walnutMat);
  addBox(-4.55, 2.22, -2.58, 1.08, 0.05, 0.16, walnutMat);
  const neighbor401DoorPivot = new THREE.Group();
  neighbor401DoorPivot.position.set(-5.05, 0, -2.58);
  const n401DoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.18, 0.06), walnutMat);
  n401DoorMesh.position.set(0.5, 1.09, 0);
  n401DoorMesh.castShadow = true;
  neighbor401DoorPivot.add(n401DoorMesh);
  const n401Plaque = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.02), goldMat);
  n401Plaque.position.set(0.5, 1.62, 0.04);
  neighbor401DoorPivot.add(n401Plaque);
  const n401Handle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.08), chromeMat);
  n401Handle.position.set(0.88, 1.02, 0);
  neighbor401DoorPivot.add(n401Handle);
  group.add(neighbor401DoorPivot);
  const neighbor401DoorCollider: BoxCollider = {
    minX: -5.08,
    maxX: -4.02,
    minZ: -2.7,
    maxZ: -2.48,
    minY: 0,
    maxY: 2.2,
    isWall: true,
  };
  colliders.push(neighbor401DoorCollider);
  const setNeighbor401DoorOpen = (open: boolean) => {
    neighbor401DoorCollider.maxY = open ? -1 : 2.2;
  };
  addBox(-4.55, 0.008, -2.05, 0.88, 0.016, 0.52, new THREE.MeshStandardMaterial({ color: 0x6b3a4a, roughness: 0.95 }));
  const bell401Plate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.02), whiteTrimMat);
  bell401Plate.position.set(-3.86, 1.18, -2.51);
  group.add(bell401Plate);
  const bell401Btn = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffb347, emissive: 0xff8800, emissiveIntensity: 1.9 }),
  );
  bell401Btn.position.set(-3.86, 1.18, -2.49);
  group.add(bell401Btn);
  interactiveZones.push({
    id: 'doorbell_401',
    label: 'Boop Neighbor 401 Doorbell!',
    pos: new THREE.Vector3(-4.2, 0.25, -2.15),
    radius: 0.95,
  });

  // Corridor South Wall (Apt 402 at z=4.4)
  addWall(-8.6, 4.4, -5.92, 4.4, H, T, wallCreamMat);
  addWall(-4.88, 4.4, -3.2, 4.4, H, T, wallCreamMat);
  addWall(-5.92, 4.4, -4.88, 4.4, 0.9, T, wallCreamMat, 2.2);
  // West Wall separating Lobby from Open-Air Sky Terrace (wide open breezeway z: -1.9 .. 1.7)
  addWall(-8.6, -2.6, -8.6, -1.9, H, T, wallCreamMat);
  addWall(-8.6, 1.7, -8.6, 4.4, H, T, wallCreamMat);
  addWall(-8.6, -1.9, -8.6, 1.7, 0.65, T, wallCreamMat, 2.45);

  // Welcome Mat + Parcel Delivery Box + Door Plaque + Kanta Bai Mop & Wet Floor Puddle + Blinkit Bag outside 4B
  addBox(-3.68, 0.008, 1.65, 0.56, 0.016, 0.9, new THREE.MeshStandardMaterial({ color: 0x8f5b38, roughness: 0.96 }));
  addBox(-3.27, 1.56, 2.38, 0.02, 0.14, 0.24, goldMat);
  const parcelBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.22, 0.28),
    new THREE.MeshStandardMaterial({ map: tex.cardboardBox, roughness: 0.85 }),
  );
  addPhysicsProp('corridor_parcel', 'Swiggy Parcel Box', parcelBox, -3.65, 0.12, 2.28, 0.15, 1.5);

  // Blinkit Live Delivery Bag + Stealable Milk Packet (toggled visible during live Delivery event)
  const deliveryBagGroup = new THREE.Group();
  deliveryBagGroup.position.set(-4.02, 0, 1.55);
  const bagMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.34, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xf7cb15, roughness: 0.72 }),
  );
  bagMesh.position.y = 0.17;
  bagMesh.castShadow = true;
  deliveryBagGroup.add(bagMesh);
  const bagStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.27, 0.08, 0.21),
    new THREE.MeshStandardMaterial({ color: 0x16803c, roughness: 0.65 }),
  );
  bagStripe.position.y = 0.26;
  deliveryBagGroup.add(bagStripe);
  deliveryBagGroup.visible = false;
  group.add(deliveryBagGroup);
  interactiveZones.push({
    id: 'steal_delivery',
    label: 'Rip Blinkit Bag & Steal Milk Packet!',
    pos: new THREE.Vector3(-4.02, 0.2, 1.55),
    radius: 0.95,
  });
  const milkPacketMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.045, 0.16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.25 }),
  );
  addPhysicsProp('g_milk_packet', 'Blinkit Milk Packet', milkPacketMesh, -4.02, -50, 1.55, 0.055, 1.4, false, true);

  // Kanta Bai's Morning Mop Bucket + Freshly Mopped Wet Floor Puddles (Floor 4 Corridor & Ground Lobby)
  const addMopAndPuddle = (mx: number, my: number, mz: number) => {
    const mopBucket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.12, 0.26, 14),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.45 }),
    );
    mopBucket.position.set(mx, my + 0.13, mz);
    mopBucket.castShadow = true;
    group.add(mopBucket);
    const mopStick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.05, 8), chromeMat);
    mopStick.position.set(mx + 0.06, my + 0.56, mz);
    mopStick.rotation.z = -0.22;
    group.add(mopStick);
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.68, 20),
      new THREE.MeshStandardMaterial({
        color: 0x99d6f2,
        transparent: true,
        opacity: 0.28,
        roughness: 0.04,
        metalness: 0.2,
        depthWrite: false,
      }),
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(mx + 0.42, my + 0.012, mz - 0.12);
    group.add(puddle);
    wetFloorZones.push({ x: mx + 0.42, y: my, z: mz - 0.12, radius: 0.72 });
  };
  addMopAndPuddle(-5.15, 0, 1.25);
  addMopAndPuddle(-6.2, -11.5, 0.9);

  // Neighbor Apartment 402 Swinging Door Frame & Doorbell Prank!
  addBox(-5.92, 1.11, 4.38, 0.05, 2.22, 0.16, walnutMat);
  addBox(-4.88, 1.11, 4.38, 0.05, 2.22, 0.16, walnutMat);
  addBox(-5.4, 2.22, 4.38, 1.08, 0.05, 0.16, walnutMat);
  const neighborDoorPivot = new THREE.Group();
  neighborDoorPivot.position.set(-5.9, 0, 4.38);
  const neighborDoorMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.18, 0.06), walnutMat);
  neighborDoorMesh.position.set(0.5, 1.09, 0);
  neighborDoorMesh.castShadow = true;
  neighborDoorPivot.add(neighborDoorMesh);
  const neighborPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.02), goldMat);
  neighborPlaque.position.set(0.5, 1.62, -0.04);
  neighborDoorPivot.add(neighborPlaque);
  const neighborHandle = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 0.08), chromeMat);
  neighborHandle.position.set(0.88, 1.02, 0);
  neighborDoorPivot.add(neighborHandle);
  group.add(neighborDoorPivot);
  const neighborDoorCollider: BoxCollider = {
    minX: -5.94,
    maxX: -4.86,
    minZ: 4.3,
    maxZ: 4.48,
    minY: 0,
    maxY: 2.2,
    isWall: true,
  };
  colliders.push(neighborDoorCollider);
  const setNeighborDoorOpen = (open: boolean) => {
    neighborDoorCollider.maxY = open ? -1 : 2.2;
  };

  addBox(-5.4, 0.008, 3.85, 0.88, 0.016, 0.52, new THREE.MeshStandardMaterial({ color: 0x3b4d5e, roughness: 0.95 }));
  const doorbellPlate = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.02), whiteTrimMat);
  doorbellPlate.position.set(-4.72, 1.18, 4.31);
  group.add(doorbellPlate);
  const doorbellGlowMat = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff8800,
    emissiveIntensity: 1.9,
  });
  const doorbellButton = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), doorbellGlowMat);
  doorbellButton.position.set(-4.72, 1.18, 4.29);
  group.add(doorbellButton);
  interactiveZones.push({
    id: 'doorbell_402',
    label: 'Boop Neighbor 402 Doorbell!',
    pos: new THREE.Vector3(-4.72, 0.25, 4.02),
    radius: 0.95,
  });

  // 2-Tier Shoe Rack outside Apt 402 with Knockable Sneakers & Sandals
  addBox(-4.05, 0.24, 4.12, 0.78, 0.48, 0.34, walnutMat, { collide: true, platformLabel: '402 Shoe Rack' });
  const shoeColors = [0xd94e42, 0x2f68a6, 0xe8b638, 0xf2f0eb];
  for (let s = 0; s < 4; s++) {
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.075, 0.22),
      new THREE.MeshStandardMaterial({ color: shoeColors[s], roughness: 0.72 }),
    );
    addPhysicsProp(`neighbor_shoe_${s}`, 'Neighbor Sneaker', shoe, -4.26 + s * 0.14, 0.52, 4.1, 0.09, 1.4);
  }

  // Corridor Parcel Mountain ("Claim Corridor Parcel Box"!)
  addBox(-6.6, 0.17, -2.1, 0.62, 0.34, 0.52, new THREE.MeshStandardMaterial({ map: tex.cardboardBox, roughness: 0.88 }), {
    collide: true,
    platformLabel: 'Corridor Parcel Stack',
  });
  sitSpots.push({
    id: 'corridor_parcel_box',
    label: 'Sit on Corridor Parcel Box',
    pos: new THREE.Vector3(-6.6, 0.35, -2.1),
    lookYaw: 0,
    mode: 'loaf',
  });

  // Red Glass Fire Extinguisher Cabinet (North Corridor Wall, East of 401 Door)
  addBox(-3.58, 1.38, -2.48, 0.34, 0.54, 0.14, new THREE.MeshStandardMaterial({ color: 0xbf2c24, roughness: 0.35 }));
  addBox(-3.58, 1.38, -2.4, 0.24, 0.4, 0.02, new THREE.MeshStandardMaterial({ color: 0xaad8e6, transparent: true, opacity: 0.4 }));

  // ==========================================================
  // WORKING BUILDING ELEVATOR SHAFT & CAB (Floor 4 y=0 <-> Ground Lobby y=-11.5)
  // ==========================================================
  addWall(-7.5, -4.5, -7.5, -2.6, 14.8, T, wallCreamMat, -11.5);
  addWall(-5.7, -4.5, -5.7, -2.6, 14.8, T, wallCreamMat, -11.5);
  addWall(-7.5, -4.5, -5.7, -4.5, 14.8, T, wallCreamMat, -11.5);
  // Elevator Mid-Shaft Blocking Walls (between y=-9.3 and y=0)
  addWall(-7.5, -2.6, -5.7, -2.6, 9.3, T, wallCreamMat, -9.3);

  const elevDoorMat = new THREE.MeshStandardMaterial({ color: 0xc2c7ce, metalness: 0.78, roughness: 0.22 });
  const elevDoor4L = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.18, 0.05), elevDoorMat);
  elevDoor4L.position.set(-7.05, 1.09, -2.6);
  group.add(elevDoor4L);
  const elevDoor4R = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.18, 0.05), elevDoorMat);
  elevDoor4R.position.set(-6.15, 1.09, -2.6);
  group.add(elevDoor4R);
  const elevDoor4Collider: BoxCollider = {
    minX: -7.55,
    maxX: -5.65,
    minZ: -2.72,
    maxZ: -2.48,
    minY: 0,
    maxY: 2.25,
    isWall: true,
  };
  colliders.push(elevDoor4Collider);

  const elevDoorGL = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.18, 0.05), elevDoorMat);
  elevDoorGL.position.set(-7.05, -10.41, -2.6);
  group.add(elevDoorGL);
  const elevDoorGR = new THREE.Mesh(new THREE.BoxGeometry(0.88, 2.18, 0.05), elevDoorMat);
  elevDoorGR.position.set(-6.15, -10.41, -2.6);
  group.add(elevDoorGR);
  const elevDoorGCollider: BoxCollider = {
    minX: -7.55,
    maxX: -5.65,
    minZ: -2.72,
    maxZ: -2.48,
    minY: -11.5,
    maxY: -9.2,
    isWall: true,
  };
  colliders.push(elevDoorGCollider);

  const setElevatorDoorState = (floor: 4 | 0, open: boolean) => {
    if (floor === 4) elevDoor4Collider.maxY = open ? -1 : 2.25;
    else elevDoorGCollider.maxY = open ? -12.5 : -9.2;
  };

  // Floor 4 & Ground Elevator Call Buttons + Cab Interior Panel
  const elevBtnGlowMat = new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0xff8c1a, emissiveIntensity: 2.0 });
  addBox(-5.42, 1.18, -2.51, 0.1, 0.16, 0.02, blackGraniteMat);
  addBox(-5.42, 1.18, -2.49, 0.04, 0.04, 0.02, elevBtnGlowMat);
  addBox(-6.6, 2.45, -2.51, 0.42, 0.18, 0.03, blackGraniteMat);
  addBox(-6.6, 2.45, -2.49, 0.14, 0.1, 0.02, elevBtnGlowMat);

  addBox(-5.42, -10.32, -2.51, 0.1, 0.16, 0.02, blackGraniteMat);
  addBox(-5.42, -10.32, -2.49, 0.04, 0.04, 0.02, elevBtnGlowMat);

  interactiveZones.push(
    {
      id: 'elevator_call_4',
      label: 'Paw Elevator Call Button (Floor 4)',
      pos: new THREE.Vector3(-5.42, 0.25, -2.28),
      radius: 0.95,
    },
    {
      id: 'elevator_ride_4',
      label: 'Ride Elevator Down to Ground Lobby',
      pos: new THREE.Vector3(-6.6, 0.25, -3.55),
      radius: 1.05,
    },
    {
      id: 'elevator_call_g',
      label: 'Paw Elevator Call Button (Ground Lobby)',
      pos: new THREE.Vector3(-5.42, -11.25, -2.28),
      radius: 0.95,
    },
    {
      id: 'elevator_ride_g',
      label: 'Ride Elevator Up to Floor 4',
      pos: new THREE.Vector3(-6.6, -11.25, -3.55),
      radius: 1.05,
    },
  );

  // Moving Warm-Lit Elevator Cab (y = 0 at Floor 4 <-> y = -11.5 at Ground Lobby)
  const elevatorCab = new THREE.Group();
  elevatorCab.position.set(-6.6, 0, -3.55);
  const cabFloor = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 1.72), porcelainFloorMat);
  cabFloor.position.y = -0.04;
  cabFloor.receiveShadow = true;
  elevatorCab.add(cabFloor);
  const cabCeiling = new THREE.Mesh(
    new THREE.BoxGeometry(1.68, 0.08, 1.72),
    new THREE.MeshStandardMaterial({ color: 0xffecb8, emissive: 0xffb347, emissiveIntensity: 0.95 }),
  );
  cabCeiling.position.y = 2.26;
  elevatorCab.add(cabCeiling);
  for (const [cx, cz, cw, cd] of [
    [0, -0.86, 1.68, 0.04],
    [-0.84, 0, 0.04, 1.72],
    [0.84, 0, 0.04, 1.72],
  ] as Array<[number, number, number, number]>) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(cw, 2.24, cd), walnutMat);
    panel.position.set(cx, 1.12, cz);
    elevatorCab.add(panel);
  }
  const cabRail = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.035, 0.04), goldMat);
  cabRail.position.set(0, 0.92, -0.78);
  elevatorCab.add(cabRail);
  group.add(elevatorCab);

  // Cozy Corridor Bench & Plants on West Corridor Wall (clear of widened breezeway z: -1.9..1.7)
  addBox(-8.2, 0.22, 2.75, 0.56, 0.44, 1.25, walnutMat, { collide: true, platformLabel: 'Corridor Bench' });
  addPlant(-8.05, 0, 3.85, 1.25);

  // Shiny Brass Bottle Cap on Corridor Floor (Carryable Treasure / Hockey-Puck Toy!)
  const bottleCapToy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.042, 0.045, 0.018, 12),
    goldMat,
  );
  addPhysicsProp('corridor_cap', 'Shiny Brass Bottle Cap', bottleCapToy, -5.5, 0.02, 1.4, 0.05, 1.1, false, true);

  // Warm Corridor Sconce Fixtures along Corridor
  const corridorSconceMat = new THREE.MeshStandardMaterial({
    color: 0xffe4a3,
    emissive: 0xff9f2e,
    emissiveIntensity: 1.9,
    roughness: 0.3,
  });
  for (const [sx, sz] of [
    [-3.55, -2.48],
    [-7.95, -2.48],
    [-6.6, 4.28],
  ]) {
    const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.18, 12), corridorSconceMat);
    sconce.position.set(sx, 2.15, sz);
    group.add(sconce);
  }

  // Open-Air 4th-Floor Sky Terrace Lounge (x: -12.4 .. -8.6, z: -2.6 .. 3.4)
  addWall(-12.4, -2.6, -8.6, -2.6, 1.08, 0.12, taupeWallMat);
  addWall(-12.4, 3.4, -8.6, 3.4, 1.08, 0.12, taupeWallMat);
  addWall(-12.4, -2.6, -12.4, 3.4, 0.38, 0.14, taupeWallMat);
  const terraceGlass = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.7, 6.0),
    new THREE.MeshStandardMaterial({ color: 0xaad4e6, transparent: true, opacity: 0.22, roughness: 0.08 }),
  );
  terraceGlass.position.set(-12.34, 0.72, 0.4);
  group.add(terraceGlass);
  addBox(-12.34, 1.1, 0.4, 0.08, 0.06, 6.04, chromeMat, {
    collide: true,
    platformLabel: 'Sky Terrace Railing',
    isHighPerch: true,
  });

  // Cozy Outdoor Terrace Lounge Bench + String Bulbs + City Telescope Perch
  addBox(-10.1, 0.22, 2.35, 1.45, 0.44, 0.68, walnutMat, {
    collide: true,
    platformLabel: 'Sky Terrace Lounge Bench',
    isCozy: true,
  });
  addBox(-10.1, 0.46, 2.35, 1.38, 0.08, 0.62, mustardMat, { isCozy: true });
  sitSpots.push({
    id: 'terrace_lounge',
    label: 'Loaf on Sky Terrace Lounge',
    pos: new THREE.Vector3(-10.1, 0.5, 2.35),
    lookYaw: -Math.PI / 2,
    mode: 'loaf',
  });

  // Brass Rooftop Telescope looking over the Neon City Boulevard
  const scopeStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.95, 10), blackGraniteMat);
  scopeStand.position.set(-11.85, 0.48, -1.75);
  group.add(scopeStand);
  const scopeTube = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.42, 12), goldMat);
  scopeTube.rotation.z = Math.PI / 2 - 0.18;
  scopeTube.position.set(-11.9, 0.98, -1.75);
  group.add(scopeTube);
  interactiveZones.push({
    id: 'sky_lookout',
    label: 'Watch Midnight City Traffic Below',
    pos: new THREE.Vector3(-11.65, 0.25, -1.75),
    radius: 0.95,
  });

  // Terrace Clothesline & Hanging Colorful Dupattas (Yank Down for Chaos!)
  for (const pz of [0.35, 2.65]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.75, 8), chromeMat);
    pole.position.set(-11.65, 0.88, pz);
    group.add(pole);
  }
  const clothesLine = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 2.3, 6), blackGraniteMat);
  clothesLine.rotation.x = Math.PI / 2;
  clothesLine.position.set(-11.65, 1.68, 1.5);
  group.add(clothesLine);
  const terraceLaundryGroup = new THREE.Group();
  terraceLaundryGroup.position.set(-11.65, 1.68, 1.5);
  const clothColors = [0xf59e0b, 0x0d9488, 0xdb2777];
  clothColors.forEach((col, i) => {
    const cloth = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.68, 0.44),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.92 }),
    );
    cloth.position.set(0, -0.34, -0.68 + i * 0.68);
    cloth.castShadow = true;
    terraceLaundryGroup.add(cloth);
  });
  group.add(terraceLaundryGroup);
  interactiveZones.push({
    id: 'yank_laundry',
    label: 'Yank Terrace Laundry Down!',
    pos: new THREE.Vector3(-11.35, 0.35, 1.5),
    radius: 1.05,
  });

  // ==========================================================
  // STRAY-STYLE VERTICAL AC CLIMB & BUILDING ROOFTOP (y = 3.25)
  // ==========================================================
  // Step 1 -> AC Compressor #1 -> AC Compressor #2 -> Rooftop Ledge
  addBox(-9.02, 0.36, -2.1, 0.62, 0.72, 0.64, walnutMat, { collide: true, platformLabel: 'Terrace Wooden Crate' });
  const acUnitMat = new THREE.MeshStandardMaterial({ color: 0xd4d0c8, roughness: 0.48, metalness: 0.22 });
  const acFans: THREE.Mesh[] = [];
  for (const [az, ay, lbl] of [
    [-1.18, 1.44, 'AC Compressor #1'],
    [-0.22, 2.28, 'AC Compressor #2'],
  ] as Array<[number, number, string]>) {
    addBox(-8.96, ay - 0.2, az, 0.56, 0.4, 0.72, acUnitMat, {
      collide: true,
      platformLabel: lbl,
      isHighPerch: true,
    });
    const acFan = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 6), blackGraniteMat);
    acFan.rotation.z = Math.PI / 2;
    acFan.position.set(-9.25, ay - 0.2, az);
    group.add(acFan);
    acFans.push(acFan);
  }
  // Rooftop Access / Descent Stepping Ledge protruding at x = -8.85, y = 3.25
  addBox(-8.85, 3.16, 0.52, 0.72, 0.18, 1.9, taupeWallMat, {
    collide: true,
    platformLabel: 'Rooftop Access Ledge',
    isHighPerch: true,
  });

  // Main Building Rooftop Deck (y = 3.25 over Corridor & Elevator Penthouse)
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c5752, roughness: 0.88 });
  addFloorZone(-8.6, -3.2, -4.5, 4.4, roofMat, 3.25);
  // Low Brick Rooftop Parapets (wide open climb/descent gap at x=-8.6, z=-0.5..1.5)
  addWall(-8.6, -4.5, -3.2, -4.5, 0.44, 0.16, taupeWallMat, 3.25);
  addWall(-3.2, -4.5, -3.2, 4.4, 0.44, 0.16, taupeWallMat, 3.25);
  addWall(-8.6, 4.4, -3.2, 4.4, 0.44, 0.16, taupeWallMat, 3.25);
  addWall(-8.6, -4.5, -8.6, -0.5, 0.44, 0.16, taupeWallMat, 3.25);
  addWall(-8.6, 1.5, -8.6, 4.4, 0.44, 0.16, taupeWallMat, 3.25);

  // Rooftop Warm Solar Bollards
  for (const [bx, bz] of [
    [-8.2, -4.1],
    [-3.6, -4.1],
    [-3.6, 4.0],
    [-8.2, 4.0],
  ]) {
    addBox(bx, 3.45, bz, 0.12, 0.4, 0.12, blackGraniteMat);
    const bCap = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), bulbGlowMat);
    bCap.position.set(bx, 3.68, bz);
    group.add(bCap);
  }

  // Elevated Blue Overhead Water Tank + Climbable Pipe Crate -> Tank Top Perch (y = 4.65)!
  addBox(-5.25, 3.57, -1.65, 0.62, 0.64, 0.62, walnutMat, {
    collide: true,
    platformLabel: 'Water Tank Pipe Step',
  });
  addBox(-4.35, 3.55, -1.45, 1.15, 0.6, 1.15, taupeWallMat, { collide: true });
  const waterTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.85, 18),
    new THREE.MeshStandardMaterial({ color: 0x205885, roughness: 0.45 }),
  );
  waterTank.position.set(-4.35, 4.26, -1.45);
  waterTank.castShadow = true;
  group.add(waterTank);
  colliders.push({ minX: -4.92, maxX: -3.78, minZ: -2.02, maxZ: -0.88, minY: 3.85, maxY: 4.65 });
  platforms.push({
    id: 'rooftop_water_tank',
    label: 'Overhead Water Tank Perch',
    minX: -4.85,
    maxX: -3.85,
    minZ: -1.95,
    maxZ: -0.95,
    y: 4.69,
    isHighPerch: true,
  });

  // Rooftop Solar Panels & Dish Antenna
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x162742, metalness: 0.68, roughness: 0.2 });
  addBox(-4.3, 3.52, 1.6, 1.05, 0.54, 1.55, solarMat, {
    collide: true,
    platformLabel: 'Rooftop Solar Panel',
  });
  const dishStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.72, 8), chromeMat);
  dishStand.position.set(-7.6, 3.61, -3.5);
  group.add(dishStand);
  const dishBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.42),
    ceramicWhiteMat,
  );
  dishBowl.position.set(-7.6, 3.98, -3.5);
  dishBowl.rotation.set(0.65, 0.4, 0);
  group.add(dishBowl);

  // Rooftop Hangout Crate & Golden Sardine Tin (formerly Billa Bhai's rooftop perch)
  addBox(-6.95, 3.47, 3.15, 0.92, 0.44, 0.78, walnutMat, {
    collide: true,
    platformLabel: 'Rooftop Lookout Crate',
    isCozy: true,
  });
  addBox(-6.32, 3.31, 3.15, 0.24, 0.12, 0.24, goldMat);

  // Local Female Gangster "Minu" in Society Street Gali near Raju Chai Tapri
  const minuPos = new THREE.Vector3(-17.35, -11.5, -2.55);
  addBox(-17.35, -11.28, -3.25, 0.64, 0.44, 0.56, walnutMat, {
    collide: true,
    platformLabel: 'Minu Street Crate',
  });
  interactiveZones.push({
    id: 'greet_minu',
    label: 'Flirt / Greet Minu (Local Gangster Boss!)',
    pos: new THREE.Vector3(-17.0, -11.25, -2.35),
    radius: 1.45,
  });

  // ==========================================================
  // GROUND FLOOR BUILDING LOBBY & COURTYARD GARDEN (y = -11.5)
  // ==========================================================
  const lobbyFloorMat = new THREE.MeshStandardMaterial({ map: tex.corridorTile, roughness: 0.24, metalness: 0.1 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x264d2b, roughness: 0.94 });
  const courtyardStoneMat = new THREE.MeshStandardMaterial({ map: tex.balconyTile, roughness: 0.76 });

  addFloorZone(-10.5, -3.2, -4.6, 4.4, lobbyFloorMat, -11.5);
  addFloorZone(-15.5, -10.5, -5.4, 5.4, courtyardStoneMat, -11.5);
  // Lobby ceiling (y = -8.35, single-sided downward plane so it never blocks camera from Floor 4!)
  const lobbyCeiling = new THREE.Mesh(new THREE.PlaneGeometry(7.3, 9.0), ceilingMat);
  lobbyCeiling.rotation.x = Math.PI / 2;
  lobbyCeiling.position.set(-6.85, -8.35, -0.1);
  group.add(lobbyCeiling);

  // Ground Lobby Perimeter Walls (baseY = -11.5, height = 3.15)
  addWall(-3.2, -4.6, -3.2, 4.4, 3.15, T, wallCreamMat, -11.5); // East Lobby wall
  addWall(-10.5, -4.6, -7.5, -4.6, 3.15, T, wallCreamMat, -11.5);
  addWall(-5.7, -4.6, -3.2, -4.6, 3.15, T, wallCreamMat, -11.5);
  addWall(-10.5, 4.4, -3.2, 4.4, 3.15, T, wallCreamMat, -11.5);
  // Ground Elevator flanking walls at z = -2.6
  addWall(-10.5, -2.6, -7.5, -2.6, 3.15, T, wallCreamMat, -11.5);
  addWall(-5.7, -2.6, -3.2, -2.6, 3.15, T, wallCreamMat, -11.5);
  addWall(-7.5, -2.6, -5.7, -2.6, 0.95, T, wallCreamMat, -9.3);
  // West Glass Lobby Entrance (open x = -10.5, z = -1.7 .. 1.9!)
  addWall(-10.5, -4.6, -10.5, -1.7, 3.15, T, wallCreamMat, -11.5);
  addWall(-10.5, 1.9, -10.5, 4.4, 3.15, T, wallCreamMat, -11.5);
  addWall(-10.5, -1.7, -10.5, 1.9, 0.85, T, wallCreamMat, -9.2);

  // Brass Apartment Mailboxes (401-404) & Lobby Sofa
  addBox(-4.2, -10.2, -2.5, 1.35, 0.72, 0.24, goldMat);
  addBox(-3.9, -11.26, 0.2, 0.78, 0.48, 1.75, mustardMat, {
    collide: true,
    platformLabel: 'Ground Lobby Sofa',
    isCozy: true,
  });

  // Watchman Security Desk + Glowing Green Desk Lamp + Stealable Brass Whistle!
  addBox(-4.65, -11.02, 2.8, 1.15, 0.96, 0.78, walnutMat, {
    collide: true,
    platformLabel: 'Watchman Security Desk',
    isHighPerch: true,
  });
  const watchmanLampShade = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.14, 12),
    new THREE.MeshStandardMaterial({ color: 0x2f7d4d, emissive: 0xffc864, emissiveIntensity: 1.2 }),
  );
  watchmanLampShade.position.set(-4.3, -10.22, 2.95);
  group.add(watchmanLampShade);
  const whistleMesh = new THREE.Group();
  const whBody = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.08, 10), goldMat);
  whBody.rotation.z = Math.PI / 2;
  whistleMesh.add(whBody);
  const whRing = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12), goldMat);
  whRing.position.set(-0.045, 0, 0);
  whistleMesh.add(whRing);
  addPhysicsProp('g_whistle', 'Watchman Brass Whistle', whistleMesh, -4.85, -10.5, 2.65, 0.055, 1.7, false, true);

  // Lobby Potted Palms & Warm Sconces
  addPlant(-9.9, -11.5, -2.1, 1.2);
  addPlant(-9.9, -11.5, 2.3, 1.2);
  for (const sz of [-1.2, 2.8]) {
    const ls = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.18, 10), bulbGlowMat);
    ls.position.set(-3.32, -9.4, sz);
    group.add(ls);
  }

  // Courtyard Garden Planters, Wrought-Iron Society Fence & Hedges (natural outdoor perimeter!)
  addBox(-13.2, -11.34, -4.5, 3.6, 0.32, 1.2, grassMat, { collide: true, platformLabel: 'North Courtyard Lawn' });
  addBox(-13.2, -11.34, 4.5, 3.6, 0.32, 1.2, grassMat, { collide: true, platformLabel: 'South Courtyard Lawn' });
  addPlant(-11.8, -11.18, -4.5, 1.35, true);
  addPlant(-14.3, -11.18, -4.5, 1.45, false, true);
  addPlant(-11.8, -11.18, 4.5, 1.35, false);
  addPlant(-14.3, -11.18, 4.5, 1.45, true, true);
  // Wrought-iron courtyard gate posts along x = -15.5 (wide open gate at z = -1.3 .. +1.3 into Society Street Gali!)
  for (let fz = -5.2; fz <= 5.2; fz += 0.55) {
    if (Math.abs(fz) < 1.35) continue;
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 6), blackGraniteMat);
    bar.position.set(-15.5, -10.88, fz);
    group.add(bar);
  }
  addBox(-15.5, -10.28, -3.35, 0.08, 0.06, 3.9, blackGraniteMat, { collide: true });
  addBox(-15.5, -10.28, 3.35, 0.08, 0.06, 3.9, blackGraniteMat, { collide: true });

  // Courtyard Stone Bench + Stray Cat Milk Saucer + Postman Parcels + Shiny Keychain!
  addBox(-12.3, -11.26, -3.25, 1.35, 0.48, 0.54, courtyardStoneMat, {
    collide: true,
    platformLabel: 'Courtyard Garden Bench',
  });
  const milkPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.03, 14), ceramicWhiteMat);
  milkPlate.position.set(-11.4, -11.48, -3.15);
  group.add(milkPlate);
  const milkLiquid = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), ceramicWhiteMat);
  milkLiquid.rotation.x = -Math.PI / 2;
  milkLiquid.position.set(-11.4, -11.462, -3.15);
  group.add(milkLiquid);
  interactiveZones.push({
    id: 'courtyard_milk',
    label: 'Lap Courtyard Stray Milk Saucer',
    pos: new THREE.Vector3(-11.4, -11.38, -3.15),
    radius: 0.85,
  });

  // Postman Parcel Pile & Stealable Shiny Keychain
  addBox(-9.5, -11.32, 3.5, 0.54, 0.36, 0.54, new THREE.MeshStandardMaterial({ map: tex.cardboardBox, roughness: 0.88 }), {
    collide: true,
    platformLabel: 'Lobby Mail Parcel',
  });
  const keychain = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 6, 12), goldMat);
  keychain.rotation.x = Math.PI / 2;
  addPhysicsProp('g_keychain', 'Shiny Brass Keychain', keychain, -9.5, -11.12, 3.5, 0.055, 1.3, false, true);

  // ==========================================================
  // WALKABLE SOCIETY STREET GALI (x: -21.4 .. -15.4, y = -11.5)
  // ==========================================================
  const streetSidewalkMat = new THREE.MeshStandardMaterial({ color: 0x3b3834, roughness: 0.84 });
  const sidewalkFloor = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 17.5), streetSidewalkMat);
  sidewalkFloor.rotation.x = -Math.PI / 2;
  sidewalkFloor.position.set(-18.4, -11.5, 0);
  sidewalkFloor.receiveShadow = true;
  group.add(sidewalkFloor);
  addBox(-21.3, -11.44, 0, 0.35, 0.12, 17.5, courtyardStoneMat); // street curb

  // 1. Raju Chai Tapri (Street Tea Stall) at (-18.4, -11.5, -5.2)
  const tapriTealMat = new THREE.MeshStandardMaterial({ color: 0x0f5c6e, roughness: 0.78 });
  addBox(-18.4, -11.08, -5.2, 1.55, 0.84, 0.86, tapriTealMat, {
    collide: true,
    platformLabel: 'Chai Tapri Counter',
  });
  addBox(-18.4, -10.64, -5.2, 1.62, 0.05, 0.94, walnutMat, {
    platformLabel: 'Chai Tapri Countertop',
  });
  for (const [px, pz] of [
    [-19.1, -5.6],
    [-17.7, -5.6],
    [-19.1, -4.8],
    [-17.7, -4.8],
  ]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.05, 6), blackGraniteMat);
    post.position.set(px, -10.48, pz);
    group.add(post);
  }
  const tapriRoof = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.06, 1.35),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.55, metalness: 0.3 }),
  );
  tapriRoof.position.set(-18.4, -9.45, -5.2);
  tapriRoof.rotation.x = 0.14;
  group.add(tapriRoof);
  const tapriBulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), bulbGlowMat);
  tapriBulb.position.set(-18.4, -9.65, -4.95);
  group.add(tapriBulb);
  const tapriKettle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.18, 12), chromeMat);
  tapriKettle.position.set(-18.72, -10.52, -5.2);
  group.add(tapriKettle);
  // Stealable Golden Fried Fish on Chai Tapri Counter!
  const fishGroup = new THREE.Group();
  const tapriFishBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xe68a2e, roughness: 0.65 }),
  );
  tapriFishBody.scale.set(1.5, 0.55, 0.75);
  fishGroup.add(tapriFishBody);
  const fishTail = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.05, 6),
    new THREE.MeshStandardMaterial({ color: 0xc96818, roughness: 0.7 }),
  );
  fishTail.rotation.z = -Math.PI / 2;
  fishTail.position.x = -0.09;
  fishGroup.add(fishTail);
  addPhysicsProp('g_fried_fish', 'Tapri Fried Fish', fishGroup, -18.05, -10.58, -5.1, 0.06, 1.5, false, true);

  // 2. Parked Bajaj-Style Scooter at (-17.5, -11.5, 5.2)
  const scooterBlueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.35, metalness: 0.25 });
  addBox(-17.5, -11.02, 5.2, 0.44, 0.44, 1.15, scooterBlueMat, {
    collide: true,
    platformLabel: 'Parked Scooter Seat',
  });
  for (const wz of [4.72, 5.68]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.11, 14), blackGraniteMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(-17.5, -11.31, wz);
    group.add(wheel);
  }
  const scooterHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.52, 8), chromeMat);
  scooterHandle.rotation.z = Math.PI / 2;
  scooterHandle.position.set(-17.5, -10.58, 4.72);
  group.add(scooterHandle);

  // 3. Parked Sedan Car with Warm Cozy Bonnet + Triggerable Car Alarm at (-19.8, -11.5, 4.0)
  const parkedCarMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.28, metalness: 0.35 });
  addBox(-19.8, -11.12, 4.0, 1.48, 0.62, 3.2, parkedCarMat, {
    collide: true,
    platformLabel: 'Warm Car Bonnet',
    isCozy: true,
  });
  addBox(-19.8, -10.62, 4.2, 1.32, 0.44, 1.55, parkedCarMat, {
    collide: true,
    platformLabel: 'Parked Car Roof',
    isHighPerch: true,
  });
  const carHazardLights: THREE.Mesh[] = [];
  for (const [lx, lz] of [
    [-20.38, 2.4],
    [-19.22, 2.4],
    [-20.38, 5.6],
    [-19.22, 5.6],
  ]) {
    const blink = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.12, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b }),
    );
    blink.position.set(lx, -11.08, lz);
    blink.visible = false;
    group.add(blink);
    carHazardLights.push(blink);
  }
  interactiveZones.push({
    id: 'trigger_car_alarm',
    label: 'Set Off Car Alarm & Wake Tiwari!',
    pos: new THREE.Vector3(-19.1, -11.2, 3.2),
    radius: 1.35,
  });

  // Warm Terrace Overhead Café String Lights
  const terraceWireCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-8.7, 2.65, -2.2),
    new THREE.Vector3(-10.5, 2.25, 0.4),
    new THREE.Vector3(-12.2, 2.55, 3.0),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(terraceWireCurve, 14, 0.008, 6, false), blackGraniteMat));
  for (let i = 0; i <= 7; i++) {
    const pt = terraceWireCurve.getPoint(i / 7);
    const tBulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), bulbGlowMat);
    tBulb.position.set(pt.x, pt.y - 0.04, pt.z);
    group.add(tBulb);
  }

  // GTA-Style Street Boulevard West of Society Street Gali (y = -11.5) with Streetlights & Moving Headlight/Taillight Traffic!
  const streetAsphaltMat = new THREE.MeshStandardMaterial({ color: 0x121318, roughness: 0.45 });
  const streetAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(12, 90), streetAsphaltMat);
  streetAsphalt.rotation.x = -Math.PI / 2;
  streetAsphalt.position.set(-27.5, -11.5, 0);
  group.add(streetAsphalt);
  // Dashed warm amber street center dividers & sodium streetlamps
  for (let sz = -34; sz <= 34; sz += 6.5) {
    const dash = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 2.2),
      new THREE.MeshBasicMaterial({ color: 0xc9963b }),
    );
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(-27.5, -11.48, sz);
    group.add(dash);

    if (sz % 13 === 0) {
      const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 4.8, 6), blackGraniteMat);
      lampPost.position.set(-21.25, -9.1, sz);
      group.add(lampPost);
      const sodiumLamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffa638 }),
      );
      sodiumLamp.position.set(-21.85, -6.75, sz);
      group.add(sodiumLamp);
    }
  }

  const trafficCars: Array<{ group: THREE.Group; laneX: number; speed: number; zMin: number; zMax: number }> = [];
  for (let c = 0; c < 6; c++) {
    const carG = new THREE.Group();
    const northBound = c % 2 === 0;
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 0.72, 3.8),
      new THREE.MeshStandardMaterial({ color: northBound ? 0x1c2536 : 0x3b1e24, roughness: 0.35 }),
    );
    carBody.position.y = 0.48;
    carG.add(carBody);
    const headCol = northBound ? 0xffe9b5 : 0xff3b30;
    const tailCol = northBound ? 0xff3b30 : 0xffe9b5;
    for (const hx of [-0.55, 0.55]) {
      const fLight = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.16, 0.1), new THREE.MeshBasicMaterial({ color: headCol }));
      fLight.position.set(hx, 0.45, 1.92);
      carG.add(fLight);
      const rLight = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.1), new THREE.MeshBasicMaterial({ color: tailCol }));
      rLight.position.set(hx, 0.45, -1.92);
      carG.add(rLight);
    }
    const laneX = northBound ? -24.8 : -30.2;
    carG.position.set(laneX, -11.5, -30 + c * 11.5);
    group.add(carG);
    trafficCars.push({ group: carG, laneX, speed: northBound ? 9.5 : -11.2, zMin: -38, zMax: 38 });
  }

  // Western GTA-Style Neon City Skyline Towers & Rooftop Glow Strips
  const westTowerSpecs: Array<[number, number, number, number, number, number]> = [
    [-39, -14, 4.2, 24, 4.6, 0xff9f38],
    [-43, 0, 5.0, 30, 5.2, 0xff4e88],
    [-38, 13, 4.0, 21, 4.2, 0x38d9f5],
    [-49, -8, 5.5, 34, 5.5, 0xffb347],
    [-47, 10, 4.8, 27, 4.8, 0xff7b38],
  ];
  for (const [tx, tz, tw, th, td, neonHex] of westTowerSpecs) {
    const bldg = new THREE.Mesh(new THREE.BoxGeometry(tw, th, td), cityMat);
    bldg.position.set(tx, th / 2 - 11.5, tz);
    group.add(bldg);
    const roofStrip = new THREE.Mesh(
      new THREE.BoxGeometry(tw + 0.12, 0.24, td + 0.12),
      new THREE.MeshBasicMaterial({ color: neonHex }),
    );
    roofStrip.position.set(tx, th - 11.5, tz);
    group.add(roofStrip);
  }

  // ==========================================================
  // 4C. BELIEVABLE MULTI-ROOM NEIGHBOR 402 APARTMENT (Lounge, Kitchen, Bedroom, Bathroom, Balcony!)
  // ==========================================================
  addFloorZone(-8.6, -1.8, 4.4, 10.6, porcelainFloorMat);
  addCeiling(-8.6, -1.8, 4.4, 10.6);
  addCeilingFan(-5.2, 7.5);
  addFloorZone(-8.6, -2.2, 10.6, 12.2, balconyFloorMat, -0.02);

  addFloorZone(-1.8, 2.2, 4.4, 7.8, porcelainFloorMat); // 402 Kitchen & Dining
  addCeiling(-1.8, 2.2, 4.4, 7.8);
  addFloorZone(-1.8, 2.2, 7.8, 11.4, porcelainFloorMat); // 402 Bedroom
  addCeiling(-1.8, 2.2, 7.8, 11.4);
  addCeilingFan(0.2, 9.6);
  addFloorZone(-1.8, 0.6, 11.4, 13.4, bathTileMat); // 402 Bathroom
  addCeiling(-1.8, 0.6, 11.4, 13.4);

  // Neighbor 402 Perimeter & Multi-Room Interior Walls
  const terracottaWallMat = new THREE.MeshStandardMaterial({ color: 0x9c553b, roughness: 0.88 });
  const emeraldVelvetMat = new THREE.MeshStandardMaterial({ color: 0x245948, roughness: 0.85 });
  addWall(-8.6, 4.4, -8.6, 10.6, H, T, wallCreamMat);
  addWall(-3.2, 4.4, 2.2, 4.4, H, T, wallCreamMat); // North shared wall along kitchen
  addWall(2.2, 4.4, 2.2, 11.4, H, T, terracottaWallMat); // East exterior wall
  addWall(-8.6, 10.6, -6.2, 10.6, H, T, wallCreamMat);
  addWall(-4.6, 10.6, -1.8, 10.6, H, T, wallCreamMat);
  addWall(-6.2, 10.6, -4.6, 10.6, 0.9, T, wallCreamMat, 2.2);

  // Interior partition x = -1.8 (Kitchen doorway z: 5.2..6.6, Bedroom doorway z: 8.4..9.8)
  addWall(-1.8, 4.4, -1.8, 5.2, H, T, wallCreamMat);
  addWall(-1.8, 5.2, -1.8, 6.6, 0.85, T, wallCreamMat, 2.25);
  addWall(-1.8, 6.6, -1.8, 8.4, H, T, wallCreamMat);
  addWall(-1.8, 8.4, -1.8, 9.8, 0.85, T, wallCreamMat, 2.25);
  addWall(-1.8, 9.8, -1.8, 11.4, H, T, wallCreamMat);

  // Kitchen <-> Bedroom divider z = 7.8
  addWall(-1.8, 7.8, 2.2, 7.8, H, T, wallCreamMat);
  // Bedroom South wall with Bath doorway (x: -0.9..0.1)
  addWall(-1.8, 11.4, -0.9, 11.4, H, T, wallCreamMat);
  addWall(-0.9, 11.4, 0.1, 11.4, 0.85, T, wallCreamMat, 2.25);
  addWall(0.1, 11.4, 2.2, 11.4, H, T, wallCreamMat);
  // 402 Bathroom perimeter
  addWall(-1.8, 11.4, -1.8, 13.4, H, T, bathTileMat);
  addWall(0.6, 11.4, 0.6, 13.4, H, T, bathTileMat);
  addWall(-1.8, 13.4, 0.6, 13.4, H, T, bathTileMat);

  // Neighbor 402 Balcony Railing
  addWall(-8.6, 10.6, -8.6, 12.2, 1.08, 0.12, taupeWallMat);
  addWall(-2.2, 10.6, -2.2, 12.2, 1.08, 0.12, taupeWallMat);
  addWall(-8.6, 12.2, -2.2, 12.2, 0.36, 0.14, taupeWallMat);
  const nBalcGlass = new THREE.Mesh(
    new THREE.BoxGeometry(6.4, 0.72, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xaad4e6, transparent: true, opacity: 0.22, roughness: 0.08 }),
  );
  nBalcGlass.position.set(-5.4, 0.72, 12.14);
  group.add(nBalcGlass);
  addBox(-5.4, 1.1, 12.14, 6.42, 0.06, 0.08, chromeMat, {
    collide: true,
    platformLabel: '402 Balcony Railing',
    isHighPerch: true,
  });

  // Emerald Velvet Chesterfield Sofa + Scratchable Corner in Apt 402 Lounge
  addBox(-3.35, 0.24, 6.65, 0.94, 0.44, 2.25, emeraldVelvetMat, {
    collide: true,
    platformLabel: 'Neighbor 402 Emerald Sofa',
    isCozy: true,
  });
  addBox(-2.92, 0.56, 6.65, 0.22, 0.46, 2.2, emeraldVelvetMat, { collide: true });
  interactiveZones.push({
    id: 'scratch_402_sofa',
    label: 'Claw & Shred Neighbor 402 Sofa!',
    pos: new THREE.Vector3(-3.85, 0.25, 5.7),
    radius: 0.85,
  });
  sitSpots.push({
    id: 'sofa_402',
    label: 'Loaf on Neighbor 402 Velvet Sofa',
    pos: new THREE.Vector3(-3.4, 0.47, 6.65),
    lookYaw: -Math.PI / 2,
    mode: 'loaf',
  });

  // Warm Wood Chai Coffee Table + Knockable Chai Kettle, Cup & Biscuit Plate!
  addBox(-5.05, 0.24, 6.65, 0.85, 0.48, 1.35, walnutMat, {
    collide: true,
    platformLabel: 'Neighbor Chai Table',
  });
  const chaiKettle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.16, 12), goldMat);
  addPhysicsProp('n402_kettle', '402 Brass Chai Kettle', chaiKettle, -5.05, 0.56, 6.9, 0.08, 2.3);
  const chaiCup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.035, 0.075, 10), ceramicWhiteMat);
  addPhysicsProp('n402_chai_cup', 'Hot Masala Chai Cup', chaiCup, -4.95, 0.52, 6.45, 0.055, 2.1);
  const biscuitPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.02, 14), ceramicWhiteMat);
  addPhysicsProp('n402_biscuits', 'Marie Biscuit Plate', biscuitPlate, -5.15, 0.5, 6.2, 0.09, 1.9);

  // Neighbor 402 Warm Floor Lamp beside Sofa
  const lampPole402 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1.52, 10), blackGraniteMat);
  lampPole402.position.set(-2.55, 0.76, 4.95);
  group.add(lampPole402);
  const lampShade402Mat = new THREE.MeshStandardMaterial({
    color: 0xffdf9e,
    emissive: 0xff9b2e,
    emissiveIntensity: 1.5,
    roughness: 0.45,
  });
  const lampShade402 = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.28, 14), lampShade402Mat);
  lampShade402.position.set(-2.55, 1.58, 4.95);
  group.add(lampShade402);

  // Vintage TV Console + Glowing TV + Knockable Golden Trophy
  addBox(-7.9, 0.32, 7.25, 0.56, 0.64, 1.85, walnutMat, {
    collide: true,
    platformLabel: '402 TV Console',
  });
  addBox(-8.12, 0.98, 7.25, 0.06, 0.64, 1.12, new THREE.MeshStandardMaterial({ color: 0x162230, emissive: 0x3b7a57, emissiveIntensity: 0.75 }));
  const trophyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.22, 10), goldMat);
  addPhysicsProp('n402_trophy', '402 Cricket Trophy', trophyMesh, -7.82, 0.75, 6.52, 0.075, 2.4);

  // Neighbor 402 Goldfish Glass Bowl on Pedestal
  addBox(-7.75, 0.36, 5.2, 0.46, 0.72, 0.46, walnutMat, {
    collide: true,
    platformLabel: '402 Goldfish Pedestal',
  });
  const bowlGlass = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 16, 14),
    new THREE.MeshStandardMaterial({ color: 0xaee6ff, transparent: true, opacity: 0.36, roughness: 0.08 }),
  );
  bowlGlass.scale.set(1.0, 0.85, 1.0);
  bowlGlass.position.set(-7.75, 0.88, 5.2);
  group.add(bowlGlass);
  const goldfishPivot = new THREE.Group();
  goldfishPivot.position.set(-7.75, 0.88, 5.2);
  const goldfishBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.036, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xff6b1a, emissive: 0xd9480f, emissiveIntensity: 0.45, roughness: 0.3 }),
  );
  goldfishBody.scale.set(0.7, 0.85, 1.6);
  goldfishBody.position.set(0.08, 0, 0);
  goldfishPivot.add(goldfishBody);
  group.add(goldfishPivot);
  interactiveZones.push({
    id: 'neighbor_goldfish',
    label: 'Paw & Splash 402 Goldfish Bowl!',
    pos: new THREE.Vector3(-7.45, 0.4, 5.2),
    radius: 0.95,
  });

  // 402 Lounge Armchair & Bookshelf + Plants
  addBox(-8.0, 0.32, 9.75, 0.56, 0.64, 1.05, walnutMat, { collide: true, platformLabel: '402 Bookshelf' });
  addPlant(-7.8, 0, 8.75, 1.1, true);
  addPlant(-3.0, 0, 11.4, 1.0, false, true);

  // 402 Modular Kitchen & Dining Room (x: -1.8 .. 2.2, z: 4.4 .. 7.8)
  addBox(1.8, 0.42, 6.1, 0.68, 0.84, 2.8, sageMetalMat, {
    collide: true,
    platformLabel: '402 Kitchen Counter',
    isHighPerch: true,
  });
  addBox(0.35, 0.42, 4.78, 2.4, 0.84, 0.62, sageMetalMat, { collide: true });
  const pickleJar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0xc24c28, roughness: 0.35 }),
  );
  addPhysicsProp('n402_pickle', '402 Mango Pickle Jar', pickleJar, 1.75, 0.92, 5.65, 0.07, 2.2);
  const vase402 = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.24, 12), terracottaMat);
  addPhysicsProp('n402_vase', '402 Terracotta Vase', vase402, 0.35, 0.96, 4.82, 0.08, 2.3);
  addBox(0.05, 0.38, 6.65, 0.92, 0.76, 0.72, walnutMat, { collide: true, platformLabel: '402 Dining Table' });
  addBox(-0.6, 0.22, 6.65, 0.36, 0.44, 0.36, walnutMat, { collide: true });
  addBox(0.7, 0.22, 6.65, 0.36, 0.44, 0.36, walnutMat, { collide: true });

  // 402 Bedroom (x: -1.8 .. 2.2, z: 7.8 .. 11.4)
  addBox(0.8, 0.24, 9.85, 1.55, 0.48, 2.0, walnutMat, {
    collide: true,
    platformLabel: '402 Guest Bed',
    isCozy: true,
  });
  addBox(0.8, 0.5, 9.75, 1.48, 0.08, 1.75, terracottaWallMat);
  addBox(1.5, 0.62, 9.85, 0.12, 0.88, 1.6, walnutMat, { collide: true });
  sitSpots.push({
    id: 'bed_402',
    label: 'Snooze on Uncle Verma Bed',
    pos: new THREE.Vector3(0.7, 0.56, 9.85),
    lookYaw: -Math.PI / 2,
    mode: 'loaf',
  });
  addBox(-0.85, 0.95, 10.95, 1.2, 1.9, 0.56, walnutMat, { collide: true, platformLabel: '402 Wardrobe' });
  addBox(-0.18, 0.28, 8.35, 0.44, 0.56, 0.44, walnutMat, { collide: true });
  const clock402 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.06), goldMat);
  addPhysicsProp('n402_alarm', '402 Brass Alarm Clock', clock402, -0.18, 0.61, 8.35, 0.06, 2.1);

  // 402 Attached Bathroom (x: -1.8 .. 0.6, z: 11.4 .. 13.4)
  addBox(-1.35, 0.22, 12.6, 0.44, 0.44, 0.52, ceramicWhiteMat, { collide: true, platformLabel: '402 Toilet Lid' });
  addBox(0.25, 0.42, 12.5, 0.44, 0.84, 0.56, ceramicWhiteMat, { collide: true, platformLabel: '402 Bathroom Sink' });
  const lotion402 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.14, 10), emeraldVelvetMat);
  addPhysicsProp('n402_shampoo', '402 Hair Oil Bottle', lotion402, 0.22, 0.92, 12.35, 0.045, 1.6);

  // ==========================================================
  // 4D. BELIEVABLE MULTI-ROOM NEIGHBOR 401 APARTMENT (Riya + Girlfriend Cat Lulza + Sheru!)
  // ==========================================================
  const blushWallMat = new THREE.MeshStandardMaterial({ color: 0xd99b8c, roughness: 0.88 });
  const coralSofa401Mat = new THREE.MeshStandardMaterial({ color: 0xb84a55, roughness: 0.86 });
  const pinkCushionMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.85 });

  // 401 Floors & Ceilings
  addFloorZone(-5.7, -3.2, -7.4, -2.6, porcelainFloorMat);
  addFloorZone(-8.6, -5.7, -7.4, -4.5, porcelainFloorMat);
  addCeiling(-5.7, -3.2, -7.4, -2.6);
  addCeiling(-8.6, -5.7, -7.4, -4.5);
  addCeilingFan(-4.5, -5.0);

  addFloorZone(-11.4, -8.6, -7.4, -2.6, porcelainFloorMat); // 401 Kitchenette
  addCeiling(-11.4, -8.6, -7.4, -2.6);
  addFloorZone(-7.2, -3.2, -10.8, -7.4, porcelainFloorMat); // 401 Bedroom
  addCeiling(-7.2, -3.2, -10.8, -7.4);
  addCeilingFan(-5.2, -9.1);
  addFloorZone(-11.4, -7.2, -10.8, -7.4, bathTileMat); // 401 Bathroom
  addCeiling(-11.4, -7.2, -10.8, -7.4);
  addFloorZone(-13.0, -11.4, -10.2, -3.8, balconyFloorMat, -0.02); // 401 Balcony

  // 401 Outer & Interior Walls (East wall straight along x=-3.2 cleanly clear of 4B!)
  addWall(-3.2, -10.8, -3.2, -2.6, H, T, blushWallMat);
  addWall(-11.4, -10.8, -3.2, -10.8, H, T, wallCreamMat);
  addWall(-11.4, -2.6, -7.5, -2.6, H, T, wallCreamMat); // South wall of 401 Kitchenette (flush with Sky Terrace north)
  addWall(-11.4, -10.8, -11.4, -6.6, H, T, wallCreamMat);
  addWall(-11.4, -5.0, -11.4, -2.6, H, T, wallCreamMat);
  addWall(-11.4, -6.6, -11.4, -5.0, 0.85, T, wallCreamMat, 2.25); // Balcony sliding arch

  // Lounge <-> Kitchenette divider at x = -8.6 (Archway z: -6.6 .. -5.0)
  addWall(-8.6, -7.4, -8.6, -6.6, H, T, wallCreamMat);
  addWall(-8.6, -5.0, -8.6, -2.6, H, T, wallCreamMat);
  addWall(-8.6, -6.6, -8.6, -5.0, 0.85, T, wallCreamMat, 2.25);

  // Lounge/Kitchenette <-> Bedroom/Bath divider at z = -7.4 (Bedroom Doorway x: -5.6 .. -4.2)
  addWall(-11.4, -7.4, -5.6, -7.4, H, T, wallCreamMat);
  addWall(-4.2, -7.4, -3.2, -7.4, H, T, wallCreamMat);
  addWall(-5.6, -7.4, -4.2, -7.4, 0.85, T, wallCreamMat, 2.25);

  // Bedroom <-> Bathroom divider at x = -7.2 (Bathroom Doorway z: -9.7 .. -8.5)
  addWall(-7.2, -10.8, -7.2, -9.7, H, T, bathTileMat);
  addWall(-7.2, -8.5, -7.2, -7.4, H, T, bathTileMat);
  addWall(-7.2, -9.7, -7.2, -8.5, 0.85, T, bathTileMat, 2.25);

  // 401 Balcony Railings (x: -13.0 .. -11.4, z: -10.2 .. -3.8)
  addWall(-13.0, -10.2, -11.4, -10.2, 1.08, 0.12, taupeWallMat);
  addWall(-13.0, -3.8, -11.4, -3.8, 1.08, 0.12, taupeWallMat);
  addWall(-13.0, -10.2, -13.0, -3.8, 0.38, 0.14, taupeWallMat);
  const b401Glass = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.7, 6.4),
    new THREE.MeshStandardMaterial({ color: 0xaad4e6, transparent: true, opacity: 0.22, roughness: 0.08 }),
  );
  b401Glass.position.set(-12.94, 0.72, -7.0);
  group.add(b401Glass);
  addBox(-12.94, 1.1, -7.0, 0.08, 0.06, 6.44, chromeMat, {
    collide: true,
    platformLabel: '401 Balcony Railing',
    isHighPerch: true,
  });

  // 401 Boutique Lounge Furniture: Coral Sofa, Coffee Table, TV Console & Warm Lamp
  addBox(-3.75, 0.24, -5.25, 0.92, 0.44, 2.05, coralSofa401Mat, {
    collide: true,
    platformLabel: '401 Velvet Sofa',
    isCozy: true,
  });
  addBox(-3.36, 0.56, -5.25, 0.2, 0.44, 2.0, coralSofa401Mat, { collide: true });
  interactiveZones.push({
    id: 'scratch_401_sofa',
    label: 'Claw & Shred Neighbor 401 Sofa!',
    pos: new THREE.Vector3(-4.2, 0.25, -4.45),
    radius: 0.85,
  });
  sitSpots.push({
    id: 'sofa_401',
    label: 'Loaf on Neighbor 401 Coral Sofa',
    pos: new THREE.Vector3(-3.8, 0.47, -5.25),
    lookYaw: -Math.PI / 2,
    mode: 'loaf',
  });

  addBox(-5.1, 0.22, -5.25, 0.76, 0.44, 1.15, walnutMat, { collide: true, platformLabel: '401 Coffee Table' });
  const n401Perfume = new THREE.Mesh(
    new THREE.BoxGeometry(0.07, 0.11, 0.07),
    new THREE.MeshStandardMaterial({ color: 0xf9a8d4, roughness: 0.18, metalness: 0.25 }),
  );
  addPhysicsProp('n401_perfume', '401 Glass Perfume Bottle', n401Perfume, -5.1, 0.49, -5.05, 0.055, 2.1);
  const n401Cup = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.07, 10), ceramicWhiteMat);
  addPhysicsProp('n401_teacup', '401 Matcha Cup', n401Cup, -5.05, 0.48, -5.55, 0.05, 1.9);

  // TV Console against Elevator South-North Wall (z = -4.85)
  addBox(-6.6, 0.28, -4.88, 1.55, 0.56, 0.48, walnutMat, { collide: true, platformLabel: '401 Media Console' });
  addBox(-6.6, 0.88, -4.74, 1.05, 0.58, 0.05, blackGraniteMat);
  const candle401 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 10), pinkCushionMat);
  addPhysicsProp('n401_candle', '401 Scented Candle', candle401, -6.05, 0.62, -4.85, 0.05, 1.8);

  // Fluffy Pomeranian "Sheru" inside Flat 401 on his Pet Cushion!
  addBox(-5.85, 0.04, -6.55, 0.64, 0.08, 0.54, mustardMat, { collide: false, platformLabel: 'Sheru Pet Bed' });
  const sheruGroup = new THREE.Group();
  sheruGroup.position.set(-5.85, 0.07, -6.55);
  sheruGroup.rotation.y = 0.4;
  const pomCreamMat = new THREE.MeshStandardMaterial({ color: 0xf7ecd9, roughness: 0.92 });
  const pomDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e1814, roughness: 0.4 });
  const sheruBody = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), pomCreamMat);
  sheruBody.scale.set(0.95, 0.85, 1.25);
  sheruBody.position.set(0, 0.2, 0);
  sheruGroup.add(sheruBody);
  const sheruHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), pomCreamMat);
  sheruHead.position.set(0, 0.34, 0.13);
  sheruGroup.add(sheruHead);
  for (const sx of [-0.04, 0.04]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), pomDarkMat);
    eye.position.set(sx, 0.36, 0.22);
    sheruGroup.add(eye);
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.055, 8), pomCreamMat);
    ear.position.set(sx * 1.35, 0.44, 0.12);
    sheruGroup.add(ear);
  }
  const sheruNose = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), pomDarkMat);
  sheruNose.position.set(0, 0.33, 0.245);
  sheruGroup.add(sheruNose);
  const sheruTail = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), pomCreamMat);
  sheruTail.position.set(0, 0.3, -0.14);
  sheruGroup.add(sheruTail);
  group.add(sheruGroup);
  interactiveZones.push({
    id: 'taunt_401',
    label: 'Taunt Sheru in Flat 401!',
    pos: new THREE.Vector3(-5.85, 0.25, -6.1),
    radius: 1.05,
  });

  // Lulza (Neighbor Cat & Brownie's Girlfriend!) on Pink Cat Cushion & Cat Tree inside 401 Lounge
  const lulzaPos = new THREE.Vector3(-7.75, 0.08, -5.25);
  addBox(-7.75, 0.04, -5.25, 0.72, 0.08, 0.66, pinkCushionMat, {
    collide: false,
    platformLabel: 'Lulza Pink Cat Cushion',
    isCozy: true,
  });
  addBox(-8.12, 0.38, -6.75, 0.46, 0.76, 0.46, walnutMat, { collide: true, platformLabel: 'Lulza Cat Tree' });
  interactiveZones.push({
    id: 'greet_lulza',
    label: 'Nuzzle & Flirt with Lulza (Girlfriend Cat!)',
    pos: new THREE.Vector3(-7.45, 0.25, -5.25),
    radius: 1.25,
  });

  // 401 Kitchenette (x: -11.4 .. -8.6, z: -7.4 .. -2.6)
  addBox(-10.0, 0.42, -3.05, 2.3, 0.84, 0.68, ceramicWhiteMat, {
    collide: true,
    platformLabel: '401 Kitchen Counter',
    isHighPerch: true,
  });
  const fridge401Mat = new THREE.MeshStandardMaterial({ color: 0xbac0c8, metalness: 0.64, roughness: 0.26 });
  addBox(-10.9, 0.92, -6.9, 0.72, 1.84, 0.68, fridge401Mat, {
    collide: true,
    platformLabel: '401 Fridge Top',
    isHighPerch: true,
  });
  const mug401 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 10), pinkCushionMat);
  addPhysicsProp('n401_mug', '401 Pink Coffee Mug', mug401, -9.6, 0.9, -3.05, 0.055, 2.0);
  const cookieJar401 = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.14, 12), goldMat);
  addPhysicsProp('n401_cookie_jar', '401 Treat Cookie Jar', cookieJar401, -10.4, 0.92, -3.05, 0.07, 2.2);

  // 401 Bedroom (x: -7.2 .. -3.2, z: -10.8 .. -7.4)
  addBox(-5.15, 0.24, -9.55, 1.65, 0.48, 2.05, walnutMat, {
    collide: true,
    platformLabel: '401 Queen Bed',
    isCozy: true,
  });
  addBox(-5.15, 0.5, -9.45, 1.56, 0.08, 1.8, coralSofa401Mat);
  addBox(-5.15, 0.62, -10.52, 1.72, 0.88, 0.14, walnutMat, { collide: true });
  sitSpots.push({
    id: 'bed_401',
    label: 'Curl Up on Neighbor 401 Bed',
    pos: new THREE.Vector3(-5.15, 0.56, -9.45),
    lookYaw: 0,
    mode: 'loaf',
  });
  addBox(-6.68, 0.36, -8.15, 0.52, 0.72, 1.05, walnutMat, { collide: true, platformLabel: '401 Vanity Dresser' });
  const jewelryBox = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.11), goldMat);
  addPhysicsProp('n401_jewelry', '401 Jewelry Box', jewelryBox, -6.65, 0.78, -8.15, 0.065, 2.1);

  // 401 Bathroom (x: -11.4 .. -7.2, z: -10.8 .. -7.4)
  addBox(-10.8, 0.22, -10.1, 0.46, 0.44, 0.54, ceramicWhiteMat, { collide: true, platformLabel: '401 Toilet Lid' });
  addBox(-10.85, 0.42, -8.2, 0.48, 0.84, 0.62, ceramicWhiteMat, { collide: true, platformLabel: '401 Vanity Sink' });
  const lotion401 = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 0.13, 10), pinkCushionMat);
  addPhysicsProp('n401_lotion', '401 Rose Lotion Bottle', lotion401, -10.85, 0.91, -8.35, 0.045, 1.6);

  // 401 Balcony Plant & Cane Chair
  addPlant(-12.2, 0, -4.4, 1.15, true);
  addBox(-12.25, 0.24, -8.8, 0.64, 0.48, 0.64, walnutMat, {
    collide: true,
    platformLabel: '401 Balcony Cane Chair',
    isCozy: true,
  });

  // Pigeons on Balcony (Gallery), Sky Terrace, Neighbor 402 Balcony, Building Rooftop & Courtyard Garden!
  const pigeons: PigeonActor[] = [];
  const pigeonSpecs: Array<{
    perch: [number, number, number];
    home: [number, number, number];
    rotY: number;
    location: PigeonActor['location'];
  }> = [
    { perch: [5.14, 1.07, -0.95], home: [11.5, 4.6, -2.5], rotY: -Math.PI / 2, location: 'balcony' },
    { perch: [5.14, 1.07, 0.3], home: [12.0, 5.0, 2.2], rotY: -Math.PI / 2, location: 'balcony' },
    { perch: [4.35, 0.0, -1.25], home: [10.5, 4.4, -0.8], rotY: -0.6, location: 'balcony' },
    { perch: [-10.55, 0.0, -0.45], home: [-18.5, 4.8, -2.0], rotY: 0.5, location: 'terrace' },
    { perch: [-11.45, 0.0, 1.35], home: [-19.5, 5.2, 3.0], rotY: -0.4, location: 'terrace' },
    { perch: [-12.34, 1.13, 0.15], home: [-20.0, 5.5, 0.4], rotY: Math.PI / 2, location: 'terrace' },
    { perch: [-5.2, 1.13, 12.14], home: [-5.2, 5.0, 19.5], rotY: Math.PI, location: 'neighbor_balcony' },
    { perch: [-12.94, 1.13, -6.5], home: [-19.5, 5.0, -9.5], rotY: Math.PI / 2, location: 'neighbor_balcony' },
    { perch: [-5.8, 3.25, -1.2], home: [-12.0, 7.5, -6.5], rotY: 0.4, location: 'rooftop' },
    { perch: [-4.35, 4.69, -1.45], home: [-9.0, 8.2, -6.0], rotY: -0.6, location: 'rooftop' },
    { perch: [-13.4, -11.5, 1.55], home: [-22.0, -5.5, 6.0], rotY: 0.9, location: 'courtyard' },
    { perch: [-12.2, -11.5, -1.4], home: [-20.0, -5.0, -6.5], rotY: -0.5, location: 'courtyard' },
  ];
  const pBodyMat = new THREE.MeshStandardMaterial({ color: 0x7b8694, roughness: 0.7 });
  const pHeadMat = new THREE.MeshStandardMaterial({ color: 0x4f5c6b, roughness: 0.58 });
  const pWingMat = new THREE.MeshStandardMaterial({ color: 0x626e7d, roughness: 0.68 });
  const pBeakMat = new THREE.MeshStandardMaterial({ color: 0xdca952 });

  for (let p = 0; p < pigeonSpecs.length; p++) {
    const spec = pigeonSpecs[p];
    const pGroup = new THREE.Group();
    const pBody = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), pBodyMat);
    pBody.scale.set(0.88, 0.9, 1.48);
    pBody.position.y = 0.085;
    pBody.castShadow = true;
    pGroup.add(pBody);

    const pNeckRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.042, 0.012, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x3b846d, roughness: 0.45 }),
    );
    pNeckRing.rotation.x = Math.PI / 2;
    pNeckRing.position.set(0, 0.135, 0.075);
    pGroup.add(pNeckRing);

    const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.052, 8, 8), pHeadMat);
    pHead.position.set(0, 0.17, 0.085);
    pGroup.add(pHead);

    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.042, 4), pBeakMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.165, 0.138);
    pGroup.add(beak);

    const wingGeo = new THREE.BoxGeometry(0.025, 0.085, 0.17);
    const wingL = new THREE.Mesh(wingGeo, pWingMat);
    wingL.position.set(-0.085, 0.1, -0.01);
    wingL.rotation.z = 0.15;
    pGroup.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, pWingMat);
    wingR.position.set(0.085, 0.1, -0.01);
    wingR.rotation.z = -0.15;
    pGroup.add(wingR);

    const pTail = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.1), pHeadMat);
    pTail.position.set(0, 0.08, -0.14);
    pTail.rotation.x = 0.25;
    pGroup.add(pTail);

    const perchPos = new THREE.Vector3(spec.perch[0], spec.perch[1], spec.perch[2]);
    const homePos = new THREE.Vector3(spec.home[0], spec.home[1], spec.home[2]);
    pGroup.position.copy(perchPos);
    pGroup.rotation.y = spec.rotY;
    group.add(pGroup);
    pigeons.push({
      group: pGroup,
      wingL,
      wingR,
      homePos,
      perchPos,
      location: spec.location,
      active: true,
      hunted: false,
      timer: 12 + p * 3,
      peckPhase: p * 1.4,
    });
  }

  // ==========================================================
  // 5. DETAILED KITCHEN & UTILITY NOOK (Zero Trash!)
  // ==========================================================
  const coralCabinetMat = new THREE.MeshStandardMaterial({ color: 0xd95950, roughness: 0.42 });
  // Subway tile backsplash + black diamond mosaic accent wall
  addBox(0.08, 1.55, -4.3, 0.02, 1.35, 2.8, subwayTileMat);
  addBox(0.45, 1.55, -5.72, 0.75, 1.35, 0.02, mosaicTileMat);

  // Kitchen Counter Base (Coral & Cream drawers with silver pull bars!) + Black Granite Top
  addBox(0.42, 0.41, -4.3, 0.66, 0.82, 2.8, coralCabinetMat, { collide: true });
  for (let d = 0; d < 3; d++) {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.018, 0.18), chromeMat);
    handle.position.set(0.76, 0.22 + d * 0.22, -5.15);
    group.add(handle);
  }
  addBox(0.76, 0.41, -4.55, 0.02, 0.78, 0.42, ceramicWhiteMat); // cream cabinet door
  addBox(0.42, 0.85, -4.3, 0.72, 0.06, 2.86, blackGraniteMat, {
    collide: true,
    platformLabel: 'Kitchen Counter',
    isHighPerch: true,
  });
  // Recessed stainless sink + chrome gooseneck faucet
  addBox(0.42, 0.882, -4.15, 0.42, 0.01, 0.52, chromeMat);
  const faucetCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.24, 0.88, -4.15),
    new THREE.Vector3(0.24, 1.12, -4.15),
    new THREE.Vector3(0.36, 1.14, -4.15),
    new THREE.Vector3(0.38, 1.05, -4.15),
  ]);
  const faucet = new THREE.Mesh(new THREE.TubeGeometry(faucetCurve, 10, 0.012, 8, false), chromeMat);
  group.add(faucet);
  // 2-burner induction stove + glowing coils + electric kettle + hanging kitchen towel
  addBox(0.42, 0.89, -5.15, 0.42, 0.025, 0.58, blackGraniteMat);
  for (const bz of [-5.0, -5.3]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.008, 6, 18),
      new THREE.MeshBasicMaterial({ color: 0xe64522 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0.42, 0.905, bz);
    group.add(ring);
  }
  const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.17, 12), chromeMat);
  kettle.position.set(0.32, 0.96, -4.72);
  kettle.castShadow = true;
  group.add(kettle);
  addBox(0.11, 1.42, -3.55, 0.03, 0.42, 0.22, new THREE.MeshStandardMaterial({ color: 0x223654, roughness: 0.9 }));

  // Sliding Kitchen Window with Exhaust Fan
  addBox(0.42, 1.85, -5.72, 0.88, 0.65, 0.04, new THREE.MeshStandardMaterial({ color: 0x162230, emissive: 0x1a3048, emissiveIntensity: 0.45 }));

  // Warm Brass Kitchen Pendant Lamp (y = 2.74 above Kitchen/Dining threshold)
  const kitchenBulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe8b0,
    emissive: 0xffb338,
    emissiveIntensity: 1.85,
    roughness: 0.32,
  });
  const kitchenPendantCord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 6), blackGraniteMat);
  kitchenPendantCord.position.set(1.85, 2.92, -4.35);
  group.add(kitchenPendantCord);
  const kitchenPendantShade = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.14, 16, 1, true), goldMat);
  kitchenPendantShade.position.set(1.85, 2.72, -4.35);
  group.add(kitchenPendantShade);
  const kitchenPendantBulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 10), kitchenBulbMat);
  kitchenPendantBulb.position.set(1.85, 2.66, -4.35);
  group.add(kitchenPendantBulb);

  // Counter Shelf Rack + Calathea + Terracotta Handi + Secret Catnip Jar!
  addBox(0.36, 1.06, -3.28, 0.42, 0.36, 0.62, walnutMat, {
    collide: true,
    platformLabel: 'Counter Rack',
    isHighPerch: true,
  });
  addPlant(0.38, 1.24, -3.12, 0.52);
  const catnipJarMesh = new THREE.Group();
  catnipJarMesh.position.set(0.42, 1.24, -3.44);
  const nipBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0x4ca662, emissive: 0x1e6b34, emissiveIntensity: 0.45, roughness: 0.32 }),
  );
  nipBody.position.y = 0.06;
  catnipJarMesh.add(nipBody);
  const nipLid = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.025, 12), goldMat);
  nipLid.position.y = 0.125;
  catnipJarMesh.add(nipLid);
  group.add(catnipJarMesh);
  interactiveZones.push({
    id: 'catnip_pouch',
    label: 'Sniff Silvervine Catnip Jar',
    pos: new THREE.Vector3(0.42, 1.24, -3.44),
    radius: 0.72,
  });
  const handi = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), terracottaMat);
  handi.scale.set(1.05, 0.82, 1.05);
  handi.position.set(0.38, 0.96, -3.62);
  group.add(handi);
  const handiKnob = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), terracottaMat);
  handiKnob.position.set(0.38, 1.09, -3.62);
  group.add(handiKnob);

  // Knockable spice jars on kitchen counter!
  for (let s = 0; s < 2; s++) {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.11, 10),
      new THREE.MeshStandardMaterial({ color: s === 0 ? 0xe6a139 : 0xc94238, roughness: 0.35 }),
    );
    addPhysicsProp(`kitchen_jar_${s}`, 'Kitchen Spice Jar', jar, 0.58, 0.94, -4.45 - s * 0.32, 0.05, 2.3);
  }

  // Detailed Silver Double-Door Refrigerator
  const fridgeMat = new THREE.MeshStandardMaterial({ color: 0xbac0c8, metalness: 0.64, roughness: 0.26 });
  addBox(1.22, 0.925, -5.3, 0.76, 1.85, 0.68, fridgeMat, {
    collide: true,
    platformLabel: 'Top of Silver Fridge',
    isHighPerch: true,
  });
  // Freezer seam + recessed vertical silver door handles + sticky notes
  addBox(1.22, 1.28, -4.958, 0.74, 0.015, 0.01, blackGraniteMat);
  addBox(1.56, 1.15, -4.955, 0.03, 0.6, 0.02, chromeMat);
  addBox(1.06, 1.48, -4.955, 0.09, 0.09, 0.01, new THREE.MeshStandardMaterial({ color: 0xf6df6b, roughness: 0.8 }));
  addBox(1.2, 1.46, -4.955, 0.09, 0.09, 0.01, new THREE.MeshStandardMaterial({ color: 0xe9e1c4, roughness: 0.8 }));

  // Dining Nook (Zero Trash!): Wooden side table, Terracotta Matka on stand, Brick Art, Brownie's Litter Box
  addBox(4.05, 0.21, -5.28, 1.08, 0.42, 0.6, walnutMat, {
    collide: true,
    platformLabel: 'Nook Side Table',
  });
  addBox(4.05, 1.72, -5.7, 0.62, 0.46, 0.04, new THREE.MeshStandardMaterial({ map: tex.brickArt, roughness: 0.88 }));
  const ceramicBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.075, 14), ceramicWhiteMat);
  addPhysicsProp('nook_bowl', 'Ceramic Bowl', ceramicBowl, 3.85, 0.46, -5.22, 0.085, 1.8);

  // Terracotta Matka Water Pot on Wooden Stool
  addBox(3.82, 0.14, -3.22, 0.36, 0.28, 0.36, walnutMat, { collide: true });
  const matka = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), terracottaMat);
  matka.position.set(3.82, 0.46, -3.22);
  matka.castShadow = true;
  group.add(matka);
  const matkaLid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.05, 12), terracottaMat);
  matkaLid.position.set(3.82, 0.67, -3.22);
  group.add(matkaLid);

  // Clean Beige Litter Box
  addBox(4.64, 0.09, -3.28, 0.54, 0.18, 0.42, new THREE.MeshStandardMaterial({ color: 0xe6dac9, roughness: 0.55 }), {
    collide: true,
    platformLabel: 'Litter Box Rim',
  });

  // ==========================================================
  // 6. BACK HALLWAY HOLLOW LATHE VESSEL WASHBASIN
  // ==========================================================
  addBox(1.88, 1.4, -6.32, 0.02, 2.2, 1.0, subwayTileMat);
  addBox(2.12, 0.41, -6.32, 0.44, 0.82, 0.64, blackGraniteMat, {
    collide: true,
    platformLabel: 'Washbasin Counter',
  });
  // Hollow LatheGeometry ceramic vessel sink (so Brownie actually sits INSIDE it!)
  const sinkPts = [
    new THREE.Vector2(0.001, 0.0),
    new THREE.Vector2(0.14, 0.0),
    new THREE.Vector2(0.21, 0.15),
    new THREE.Vector2(0.19, 0.15),
    new THREE.Vector2(0.13, 0.025),
    new THREE.Vector2(0.001, 0.025),
  ];
  const vesselBasin = new THREE.Mesh(new THREE.LatheGeometry(sinkPts, 20), ceramicWhiteMat);
  vesselBasin.position.set(2.14, 0.82, -6.32);
  vesselBasin.castShadow = true;
  group.add(vesselBasin);
  const basinTap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 0.18, 8), chromeMat);
  basinTap.position.set(1.94, 0.91, -6.32);
  group.add(basinTap);
  const sinkWaterStream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.012, 0.14, 8),
    new THREE.MeshBasicMaterial({ color: 0x99e6ff, transparent: true, opacity: 0.72 }),
  );
  sinkWaterStream.position.set(2.01, 0.9, -6.32);
  sinkWaterStream.visible = false;
  group.add(sinkWaterStream);
  interactiveZones.push({
    id: 'sink_tap',
    label: 'Turn On Sink Tap & Splash Water',
    pos: new THREE.Vector3(2.18, 0.86, -6.32),
    radius: 0.82,
  });
  sitSpots.push({
    id: 'vessel_sink',
    label: 'Sit Inside Vessel Sink',
    pos: new THREE.Vector3(2.18, 0.835, -6.32),
    lookYaw: Math.PI / 2,
    mode: 'sit_in',
  });

  // ==========================================================
  // 7. BEDROOM 1 (Walnut Bed, Headboard, Charcoal Duvet, Clothing Rack with Hanging Clothes)
  // ==========================================================
  addBox(-1.25, 0.22, -9.9, 1.75, 0.44, 1.95, walnutMat, {
    collide: true,
    platformLabel: 'Platform Bed',
    isCozy: true,
  });
  addBox(-1.25, 0.72, -10.86, 1.78, 0.65, 0.08, walnutMat); // walnut headboard
  addBox(-1.25, 0.48, -9.85, 1.65, 0.14, 1.82, new THREE.MeshStandardMaterial({ color: 0x222630, roughness: 0.95 }), {
    platformLabel: 'Bed Mattress',
    isCozy: true,
  });
  // Draped woven mustard-ochre throw blanket & pillows
  addBox(-1.25, 0.56, -9.35, 1.68, 0.03, 0.72, mustardMat);
  for (const px of [-1.62, -0.88]) {
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.36), ceramicWhiteMat);
    pillow.position.set(px, 0.6, -10.52);
    group.add(pillow);
  }
  // Warm Amber Bedside Wall Sconce above Headboard
  const bedBulbMat = new THREE.MeshStandardMaterial({
    color: 0xffe4ad,
    emissive: 0xffa033,
    emissiveIntensity: 1.55,
    roughness: 0.4,
  });
  const bedSconceMount = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 10), goldMat);
  bedSconceMount.rotation.x = Math.PI / 2;
  bedSconceMount.position.set(-1.25, 1.56, -11.1);
  group.add(bedSconceMount);
  const bedSconceShade = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.14, 12), bedBulbMat);
  bedSconceShade.position.set(-1.25, 1.58, -11.0);
  group.add(bedSconceShade);
  sitSpots.push({
    id: 'bed_nap',
    label: 'Knead & Loaf on Bed',
    pos: new THREE.Vector3(-0.9, 0.55, -9.35),
    lookYaw: 0.4,
    mode: 'loaf',
  });

  // Secret Binzie Treasure Hoard Mat beside Bed!
  const hoardMatMesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0xb55336, roughness: 0.92 }),
  );
  hoardMatMesh.rotation.x = -Math.PI / 2;
  hoardMatMesh.position.set(0.18, 0.012, -9.55);
  group.add(hoardMatMesh);
  interactiveZones.push({
    id: 'secret_hoard',
    label: 'Secret Binzie Treasure Hoard Stash',
    pos: new THREE.Vector3(0.18, 0.05, -9.55),
    radius: 0.95,
  });

  // Clothing Rack + Orange Boxes + Hanging Shirts on Hangers
  addBox(0.95, 0.22, -10.82, 0.92, 0.44, 0.42, new THREE.MeshStandardMaterial({ color: 0xc97338, roughness: 0.75 }), {
    collide: true,
    platformLabel: 'Storage Boxes',
  });
  const rackPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.58, 8), whiteTrimMat);
  rackPole.position.set(0.54, 0.79, -10.82);
  group.add(rackPole);
  const rackPole2 = rackPole.clone();
  rackPole2.position.set(1.36, 0.79, -10.82);
  group.add(rackPole2);
  const rackBar = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.86, 8), whiteTrimMat);
  rackBar.rotation.z = Math.PI / 2;
  rackBar.position.set(0.95, 1.56, -10.82);
  group.add(rackBar);

  const shirtColors = [0x1c202a, 0x384e68, 0xd4cfc7, 0x562b26];
  shirtColors.forEach((col, i) => {
    const shirt = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.56, 0.36),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.88 }),
    );
    shirt.position.set(0.68 + i * 0.17, 1.24, -10.82);
    shirt.castShadow = true;
    group.add(shirt);
  });

  // ==========================================================
  // 8. STUDY / OFFICE ROOM (L-Desk, Ergonomic Swivel Chair, Vertical LED, Green Rack, Lanterns)
  // ==========================================================
  addBox(2.38, 0.375, -11.15, 0.78, 0.75, 1.72, walnutMat, {
    collide: true,
    platformLabel: 'Study Desk',
    isHighPerch: true,
  });
  addBox(3.18, 0.375, -11.75, 1.12, 0.75, 0.72, walnutMat, {
    collide: true,
    platformLabel: 'Study Desk Corner',
    isHighPerch: true,
  });
  // Dual Monitors with crisp UI screens on stands + keyboard pad + mouse
  const monMat = new THREE.MeshStandardMaterial({
    map: tex.studyScreen,
    emissive: 0x38bdf8,
    emissiveMap: tex.studyScreen,
    emissiveIntensity: 0.82,
    roughness: 0.18,
  });
  addBox(2.16, 1.02, -11.35, 0.035, 0.36, 0.62, monMat);
  addBox(2.16, 0.8, -11.35, 0.06, 0.1, 0.1, blackGraniteMat);
  addBox(2.36, 1.02, -11.95, 0.62, 0.36, 0.035, monMat);
  addBox(2.36, 0.8, -11.95, 0.1, 0.1, 0.06, blackGraniteMat);
  addBox(2.48, 0.76, -11.3, 0.28, 0.012, 0.44, blackGraniteMat);
  addBox(2.5, 0.762, -10.95, 0.09, 0.018, 0.06, blackGraniteMat); // wireless mouse

  // Knockable Study Mug on Desk
  const deskMug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.042, 0.1, 12),
    new THREE.MeshStandardMaterial({ color: 0xe69528, roughness: 0.3 }),
  );
  addPhysicsProp('study_mug', 'Study Coffee Mug', deskMug, 2.58, 0.8, -10.75, 0.055, 2.1);

  // Tall Glowing Vertical LED Corner Lamp (visible in Study photo!)
  const ledBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.025, 0.14), blackGraniteMat);
  ledBase.position.set(2.05, 0.012, -9.65);
  group.add(ledBase);
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0xffeaad,
    emissive: 0xffaa2b,
    emissiveIntensity: 2.4,
  });
  const ledPole = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 1.38, 12), ledMat);
  ledPole.position.set(2.05, 0.7, -9.65);
  group.add(ledPole);

  // Detailed 5-Star Ergonomic Black Mesh Swivel Office Chair
  const swivelGroup = new THREE.Group();
  const chairBasePos = new THREE.Vector3(3.18, 0, -10.85);
  swivelGroup.position.copy(chairBasePos);
  const chairMat = new THREE.MeshStandardMaterial({ color: 0x16181d, roughness: 0.7 });
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 0.28), chairMat);
    leg.position.set(Math.sin(ang) * 0.14, 0.05, Math.cos(ang) * 0.14);
    leg.rotation.y = ang;
    swivelGroup.add(leg);
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.02, 8), chairMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(ang) * 0.26, 0.024, Math.cos(ang) * 0.26);
    swivelGroup.add(wheel);
  }
  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.42, 10), chromeMat);
  chairStem.position.y = 0.24;
  swivelGroup.add(chairStem);
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.075, 0.48), chairMat);
  chairSeat.position.y = 0.48;
  chairSeat.castShadow = true;
  swivelGroup.add(chairSeat);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.58, 0.05), chairMat);
  chairBack.position.set(0, 0.82, 0.23);
  chairBack.rotation.x = -0.08;
  chairBack.castShadow = true;
  swivelGroup.add(chairBack);
  for (const ax of [-0.26, 0.26]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.26), chairMat);
    arm.position.set(ax, 0.65, 0.02);
    swivelGroup.add(arm);
    const armPost = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.03), chairMat);
    armPost.position.set(ax, 0.56, 0.06);
    swivelGroup.add(armPost);
  }
  group.add(swivelGroup);
  platforms.push({
    id: 'swivel_chair',
    label: 'Swivel Office Chair',
    minX: chairBasePos.x - 0.3,
    maxX: chairBasePos.x + 0.3,
    minZ: chairBasePos.z - 0.3,
    maxZ: chairBasePos.z + 0.3,
    y: 0.52,
  });

  // Sage-Green 4-Tier Metal Industrial Shelving Unit + Doormat + Filmstrip Mirror
  const shelfX = 4.68;
  const shelfZ = -11.96;
  addBox(shelfX, 0.008, -11.42, 0.86, 0.015, 0.45, new THREE.MeshStandardMaterial({ color: 0x26292e, roughness: 0.9 }));
  for (const sx of [-0.42, 0.42]) {
    for (const sz of [-0.2, 0.2]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.56, 0.035), sageMetalMat);
      post.position.set(shelfX + sx, 0.78, shelfZ + sz);
      group.add(post);
    }
  }
  for (const sy of [0.22, 0.68, 1.14, 1.54]) {
    addBox(shelfX, sy, shelfZ, 0.88, 0.035, 0.44, sageMetalMat, {
      collide: sy < 0.3,
      platformLabel: sy > 1.4 ? 'Top of Green Shelf' : 'Green Shelf Tier',
      isHighPerch: sy > 1.4,
    });
  }
  // Books & storage bins on the sage-green shelving unit
  for (let b = 0; b < 4; b++) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.24, 0.18),
      new THREE.MeshStandardMaterial({ color: [0x2f5a7a, 0xa83e32, 0xd8a136, 0x2b323c][b], roughness: 0.85 }),
    );
    book.position.set(shelfX - 0.25 + b * 0.055, 0.82, shelfZ);
    group.add(book);
  }
  addBox(shelfX + 0.18, 0.34, shelfZ, 0.32, 0.2, 0.3, new THREE.MeshStandardMaterial({ color: 0x3b4452, roughness: 0.9 }));
  addBox(shelfX - 0.18, 1.26, shelfZ, 0.28, 0.18, 0.28, terracottaMat);
  addPlant(4.02, 0, -11.92, 0.72);

  // East Study Wall: Orange Paper Lanterns + Tall Gold Wire Rack with 2 Cream Pillows + Brown Fabric Cubes
  for (let i = 0; i < 2; i++) {
    const lant = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), orangeLanternMat);
    lant.position.set(5.96, 2.38 - i * 0.28, -9.85);
    group.add(lant);
  }
  addBox(5.92, 0.48, -9.28, 0.32, 0.96, 0.48, goldMat, {
    collide: true,
    platformLabel: 'Pillow Wire Rack',
  });
  addBox(5.92, 1.06, -9.28, 0.36, 0.22, 0.48, ceramicWhiteMat, { platformLabel: 'Stacked Pillows', isCozy: true });
  addBox(5.56, 0.18, -9.65, 0.38, 0.36, 0.42, new THREE.MeshStandardMaterial({ color: 0x4b3832, roughness: 0.9 }), {
    collide: true,
    platformLabel: 'Storage Cubes',
  });

  // ==========================================================
  // 9. ATTACHED BATHROOM (Toilet, Toilet Paper Unspooler, Shower, Basin, Loofahs, Pink Bucket)
  // ==========================================================
  // Sculpted Western Toilet
  addBox(5.88, 0.21, -6.35, 0.44, 0.42, 0.56, ceramicWhiteMat, { collide: true, platformLabel: 'Toilet Lid' });
  addBox(6.02, 0.56, -6.15, 0.38, 0.38, 0.22, ceramicWhiteMat, { collide: true, platformLabel: 'Toilet Tank' });
  const toiletSeat = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 8, 16), ceramicWhiteMat);
  toiletSeat.rotation.x = Math.PI / 2;
  toiletSeat.position.set(5.88, 0.43, -6.42);
  group.add(toiletSeat);

  // Unspoolable Toilet Paper Roll + Dynamic Shred Ribbon Group!
  const tpHolder = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.16), chromeMat);
  tpHolder.position.set(6.3, 0.62, -6.68);
  group.add(tpHolder);
  const tpRollMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.11, 14),
    ceramicWhiteMat,
  );
  tpRollMesh.rotation.x = Math.PI / 2;
  tpRollMesh.position.set(6.24, 0.62, -6.68);
  group.add(tpRollMesh);
  const tpRibbonGroup = new THREE.Group();
  tpRibbonGroup.position.set(6.18, 0.015, -6.72);
  group.add(tpRibbonGroup);
  interactiveZones.push({
    id: 'tp_roll',
    label: 'Unspool Toilet Paper Roll',
    pos: new THREE.Vector3(6.0, 0.25, -6.68),
    radius: 0.85,
  });

  // Chrome Shower Arm, Shower Head & Wall Mirror above Sink
  const showerHead = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.04, 0.04, 12), chromeMat);
  showerHead.position.set(4.52, 2.05, -7.45);
  showerHead.rotation.z = -0.5;
  group.add(showerHead);
  const bathMirror = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.68, 0.48),
    new THREE.MeshStandardMaterial({ color: 0xcfe4f0, metalness: 0.92, roughness: 0.08 }),
  );
  bathMirror.position.set(4.3, 1.48, -6.65);
  group.add(bathMirror);

  // Floating Ceramic Washbasin + Chrome Tap + Soap Caddy + Hanging Loofahs
  const bathSink = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.52), ceramicWhiteMat);
  bathSink.position.set(4.5, 0.76, -6.65);
  group.add(bathSink);
  const bathTap = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.14, 8), chromeMat);
  bathTap.position.set(4.36, 0.9, -6.65);
  group.add(bathTap);
  addBox(4.38, 1.15, -6.65, 0.12, 0.08, 0.32, blackGraniteMat);
  // Black & Lavender Loofahs hanging on shower wall
  const loofah1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 1), new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: 0.95 }));
  loofah1.position.set(4.38, 1.35, -7.25);
  group.add(loofah1);
  const loofah2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.085, 1), new THREE.MeshStandardMaterial({ color: 0xc5b4e3, roughness: 0.95 }));
  loofah2.position.set(4.38, 1.32, -7.12);
  group.add(loofah2);

  // Hollow LatheGeometry Pink Plastic Bucket (roomy enough so Brownie fits cleanly INSIDE!)
  const bucketPts = [
    new THREE.Vector2(0.001, 0),
    new THREE.Vector2(0.165, 0),
    new THREE.Vector2(0.225, 0.34),
    new THREE.Vector2(0.21, 0.34),
    new THREE.Vector2(0.15, 0.02),
    new THREE.Vector2(0.001, 0.02),
  ];
  const pinkBucket = new THREE.Mesh(
    new THREE.LatheGeometry(bucketPts, 20),
    new THREE.MeshStandardMaterial({ color: 0xeb92a8, roughness: 0.4, side: THREE.DoubleSide }),
  );
  pinkBucket.position.set(5.32, 0.0, -6.68);
  pinkBucket.castShadow = true;
  group.add(pinkBucket);
  sitSpots.push({
    id: 'pink_bucket',
    label: 'Squeeze into Pink Bucket',
    pos: new THREE.Vector3(5.32, 0.025, -6.68),
    lookYaw: 0,
    mode: 'sit_in',
  });

  // ==========================================================
  // 10. CRUMPLED PAPER BALL (Physics Toy + Mouth Carry!)
  // ==========================================================
  const paperBallMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.055, 0),
    new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.85, flatShading: true }),
  );
  paperBallMesh.castShadow = true;
  addPhysicsProp('paper_ball', 'Crumpled Paper Ball', paperBallMesh, -0.55, 0.055, -0.65, 0.06, 0.4, true);

  // ==========================================================
  // 11. PHASE 2 MIDNIGHT HEIST ITEMS
  // ==========================================================
  const makeLoot = (
    id: HeistItem['id'],
    label: string,
    x: number,
    y: number,
    z: number,
    colorHex: number,
    accentHex: number,
  ) => {
    const lootGroup = new THREE.Group();
    lootGroup.position.set(x, y, z);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: colorHex, emissive: accentHex, emissiveIntensity: 0.55, roughness: 0.35 }),
    );
    body.position.y = 0.08;
    body.castShadow = true;
    lootGroup.add(body);
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.12, 0.16, 20),
      new THREE.MeshBasicMaterial({ color: 0xffd56b, side: THREE.DoubleSide, transparent: true, opacity: 0.75 }),
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.015;
    lootGroup.add(halo);
    group.add(lootGroup);
    heistItems.push({ id, label, mesh: lootGroup, pos: new THREE.Vector3(x, y, z), collected: false });
  };

  makeLoot('salmonTin', 'Temptations Salmon Tin (Fridge Top)', 1.22, 1.86, -5.3, 0xf29f24, 0xc95a0e);
  makeLoot('churuTube', 'Churu Creamy Treat Tube (Green Shelf)', 4.68, 1.56, -11.96, 0xe84862, 0x991b33);
  makeLoot('hairTieStash', 'Golden Hair-Tie Stash (Bedroom Rack)', 0.95, 0.45, -10.82, 0xf2c94c, 0x9c7211);

  // ==========================================================
  // 12. WARM YELLOW/ORANGE LAMP RIG + ADDITIVE GLOW POOLS
  // ==========================================================
  // Subtle warm amber bounce — zero cold white studio floodlight!
  const hemi = new THREE.HemisphereLight(0xffc478, 0x2a180d, 0.28);
  group.add(hemi);

  // Soft warm golden rim spill (1024px directional shadow caster dynamically centered on Brownie!)
  const keySunLight = new THREE.DirectionalLight(0xffa64d, 0.34);
  keySunLight.position.set(4.5, 9.5, 3.5);
  keySunLight.castShadow = true;
  keySunLight.shadow.mapSize.set(1024, 1024);
  keySunLight.shadow.radius = 1.6;
  keySunLight.shadow.camera.near = 1;
  keySunLight.shadow.camera.far = 24;
  keySunLight.shadow.camera.left = -6.5;
  keySunLight.shadow.camera.right = 6.5;
  keySunLight.shadow.camera.top = 6.5;
  keySunLight.shadow.camera.bottom = -6.5;
  keySunLight.shadow.bias = -0.00045;
  keySunLight.shadow.normalBias = 0.018;
  group.add(keySunLight);
  group.add(keySunLight.target);

  // 7 Localized Warm Yellow/Orange Lamp PointLights (stays comfortably within WebGL uniform budget)
  const driftwoodLampLight = new THREE.PointLight(0xffb54a, 5.4, 9.4, 1.35);
  driftwoodLampLight.position.set(-1.78, 1.92, 2.15);
  group.add(driftwoodLampLight);

  const beanbagLampLight = new THREE.PointLight(0xff8c42, 3.8, 7.6, 1.4);
  beanbagLampLight.position.set(-2.7, 1.38, -2.32);
  group.add(beanbagLampLight);

  const orangeLanternLight = new THREE.PointLight(0xff721c, 3.2, 6.2, 1.45);
  orangeLanternLight.position.set(1.38, 0.38, 2.24);
  group.add(orangeLanternLight);

  const kitchenPendantLight = new THREE.PointLight(0xffb94a, 5.2, 9.4, 1.35);
  kitchenPendantLight.position.set(1.85, 2.52, -4.35);
  group.add(kitchenPendantLight);

  const studyLedLight = new THREE.PointLight(0xffa438, 5.2, 9.8, 1.35);
  studyLedLight.position.set(2.35, 1.25, -9.65);
  group.add(studyLedLight);

  const bedroomSconceLight = new THREE.PointLight(0xff9e3d, 3.6, 7.8, 1.4);
  bedroomSconceLight.position.set(-1.25, 1.48, -10.65);
  group.add(bedroomSconceLight);

  const balconyAccentLight = new THREE.PointLight(0xff9f38, 3.6, 8.2, 1.4);
  balconyAccentLight.position.set(4.25, 2.05, -0.4);
  group.add(balconyAccentLight);

  const corridorWarmLight = new THREE.PointLight(0xffa63b, 5.6, 13.5, 1.3);
  corridorWarmLight.position.set(-6.0, 2.38, 1.0);
  group.add(corridorWarmLight);

  const neighbor402Light = new THREE.PointLight(0xffa43c, 5.2, 11.5, 1.32);
  neighbor402Light.position.set(-4.8, 2.35, 7.1);
  group.add(neighbor402Light);

  // 10th Smart Zone Light (adapts cleanly between Rooftop, Elevator Cab & Ground Lobby/Courtyard without exceeding GPU light budget!)
  const altitudeZoneLight = new THREE.PointLight(0xffb14a, 6.2, 18.0, 1.2);
  altitudeZoneLight.position.set(-6.0, 5.4, 0.2);
  group.add(altitudeZoneLight);

  const addGlowPool = (x: number, y: number, z: number, size: number, colorHex: number, opacity = 0.55) => {
    const mat = new THREE.MeshBasicMaterial({
      map: tex.glowHalo,
      color: colorHex,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(x, y, z);
    group.add(pool);
    return mat;
  };
  const glowMats = [
    addGlowPool(-1.78, 0.022, 2.18, 2.3, 0xffbe5c, 0.52),
    addGlowPool(1.38, 0.022, 2.38, 1.75, 0xff7018, 0.65),
    addGlowPool(-2.65, 0.022, -2.25, 2.2, 0xff823c, 0.52),
    addGlowPool(2.15, 0.022, -9.65, 2.4, 0xffae38, 0.58),
    addGlowPool(-1.25, 0.57, -10.5, 2.1, 0xffb85c, 0.46),
    addGlowPool(-5.8, 0.022, 1.1, 3.4, 0xffaa3d, 0.42),
    addGlowPool(-10.5, 0.005, 0.4, 3.2, 0xff9b38, 0.36),
    addGlowPool(-2.35, 0.022, 5.05, 2.6, 0xffa638, 0.5),
  ];

  // Hanging Vine Accent Strips on Living / Bedroom / Kitchen Walls
  const vinePositions: Array<[number, number, number, number]> = [
    [3.12, 2.45, -0.8, 2.4],
    [-1.4, 2.45, -11.08, 3.4],
    [0.9, 2.45, -5.68, 1.7],
  ];
  for (const [vx, vy, vz, span] of vinePositions) {
    for (let i = 0; i < 10; i++) {
      const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.055, 5), vineLeafMat);
      leaf.position.set(
        vx + (span > 2 ? (i - 4.5) * 0.25 : 0),
        vy - (i % 2) * 0.14,
        vz + (span === 2.4 ? (i - 4.5) * 0.22 : 0),
      );
      group.add(leaf);
    }
  }

  // Ambient Floating Dust Motes in Warm Lamp Beams
  const dustCoords: number[] = [];
  for (let i = 0; i < 65; i++) {
    dustCoords.push(
      -2.6 + Math.random() * 7.2,
      0.35 + Math.random() * 2.1,
      -5.5 + Math.random() * 7.8,
    );
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustCoords, 3));
  const dustMotes = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      map: tex.glowHalo,
      color: 0xffd28a,
      size: 0.062,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(dustMotes);

  const roomDimState = { living: false, kitchen: false, study: false };
  const setRoomLightDimmed = (room: 'living' | 'kitchen' | 'study', dimmed: boolean) => {
    roomDimState[room] = dimmed;
  };

  let prevTimeSec = 0;
  const setLightingPhase = (
    midnightBlend: number,
    timeSec: number,
    focusY = 0,
    rainAmount = 0,
    carAlarmActive = false,
    focusX = 0,
    focusZ = 0,
  ) => {
    const dt = prevTimeSec > 0 ? Math.min(0.06, Math.max(0, timeSec - prevTimeSec)) : 0.016;
    prevTimeSec = timeSec;

    // Texel-snapped directional shadow target so sharp shadows follow Brownie across every flat, rooftop & street
    const snapX = Math.round(focusX * 4) * 0.25;
    const snapY = Math.round(focusY * 4) * 0.25;
    const snapZ = Math.round(focusZ * 4) * 0.25;
    keySunLight.target.position.set(snapX, snapY, snapZ);
    keySunLight.position.set(snapX + 4.5, snapY + 9.5, snapZ + 3.5);

    const m = THREE.MathUtils.clamp(midnightBlend, 0, 1);
    const rain = THREE.MathUtils.clamp(rainAmount, 0, 1);
    hemi.intensity = THREE.MathUtils.lerp(0.28, 0.11, m) * THREE.MathUtils.lerp(1.0, 0.72, rain);
    keySunLight.intensity = THREE.MathUtils.lerp(0.34, 0.10, m) * THREE.MathUtils.lerp(1.0, 0.6, rain);

    // Wet sheen on outdoor asphalt, footpath & terrace during monsoon rain
    streetSidewalkMat.roughness = THREE.MathUtils.lerp(0.84, 0.14, rain);
    streetAsphaltMat.roughness = THREE.MathUtils.lerp(0.45, 0.09, rain);
    balconyFloorMat.roughness = THREE.MathUtils.lerp(0.75, 0.16, rain);

    // Gentle breeze sway on hanging terrace laundry
    terraceLaundryGroup.rotation.z = Math.sin(timeSec * 2.4) * (0.06 + rain * 0.09);

    // Blinking amber car alarm hazard lights
    const flashOn = carAlarmActive && Math.floor(timeSec * 5.5) % 2 === 0;
    for (let i = 0; i < carHazardLights.length; i++) {
      carHazardLights[i].visible = flashOn;
    }

    const livingOn = !roomDimState.living;
    const kitchenOn = !roomDimState.kitchen;
    const studyOn = !roomDimState.study;

    driftwoodLampLight.intensity = livingOn ? THREE.MathUtils.lerp(5.4, 3.1, m) : 0.08;
    beanbagLampLight.intensity = livingOn ? THREE.MathUtils.lerp(3.8, 2.2, m) : 0.06;
    orangeLanternLight.intensity = livingOn ? THREE.MathUtils.lerp(3.2, 2.8, m) : 1.15;

    kitchenPendantLight.intensity = kitchenOn ? THREE.MathUtils.lerp(5.2, 2.4, m) : 0.1;
    studyLedLight.intensity = studyOn ? THREE.MathUtils.lerp(5.2, 2.6, m) : 0.12;
    bedroomSconceLight.intensity = livingOn ? THREE.MathUtils.lerp(3.6, 1.8, m) : 0.45;
    balconyAccentLight.intensity = THREE.MathUtils.lerp(3.2, 4.1, m);
    corridorWarmLight.intensity = THREE.MathUtils.lerp(5.6, 4.2, m);
    neighbor402Light.intensity = THREE.MathUtils.lerp(5.2, 3.4, m);

    // Move altitude zone light seamlessly to Rooftop vs Flat 401 vs Ground Lobby, Courtyard & Street
    if (focusY < -3.0) {
      altitudeZoneLight.position.set(-14.5, -8.5, 0.0);
      altitudeZoneLight.intensity = 7.8;
    } else if (focusY > 2.2) {
      altitudeZoneLight.position.set(-5.8, 5.8, 0.2);
      altitudeZoneLight.intensity = 5.4;
    } else {
      altitudeZoneLight.position.set(-6.5, 2.35, -6.4);
      altitudeZoneLight.intensity = 5.6;
    }

    // Spin outdoor AC fans smoothly
    for (let i = 0; i < acFans.length; i++) {
      acFans[i].rotation.x += dt * 7.5;
    }

    // Sync lamp shade & bulb emissives so flicking switches visibly turns lamps off/on
    shadeMat.emissiveIntensity = livingOn ? THREE.MathUtils.lerp(1.45, 0.95, m) : 0.08;
    pinkLampMat.emissiveIntensity = livingOn ? THREE.MathUtils.lerp(1.45, 0.95, m) : 0.08;
    orangeLanternMat.emissiveIntensity = livingOn ? 1.65 : 0.75;
    kitchenBulbMat.emissiveIntensity = kitchenOn ? THREE.MathUtils.lerp(1.85, 1.0, m) : 0.08;
    ledMat.emissiveIntensity = studyOn ? THREE.MathUtils.lerp(2.4, 1.4, m) : 0.12;
    bedBulbMat.emissiveIntensity = livingOn ? THREE.MathUtils.lerp(1.55, 0.9, m) : 0.28;
    bulbGlowMat.emissiveIntensity = THREE.MathUtils.lerp(1.8, 2.4, m);
    lampShade402Mat.emissiveIntensity = THREE.MathUtils.lerp(1.5, 1.0, m);

    const flicker0 = Math.sin(timeSec * 2.5) * 0.04;
    glowMats[0].opacity = livingOn ? THREE.MathUtils.lerp(0.45, 0.65, m) + flicker0 : 0.06;
    glowMats[1].opacity = THREE.MathUtils.lerp(0.55, 0.78, m) + Math.sin(timeSec * 2.5 + 1) * 0.04;
    glowMats[2].opacity = livingOn ? THREE.MathUtils.lerp(0.45, 0.65, m) + Math.sin(timeSec * 2.5 + 2) * 0.04 : 0.05;
    glowMats[3].opacity = studyOn ? THREE.MathUtils.lerp(0.5, 0.72, m) + Math.sin(timeSec * 2.5 + 3) * 0.04 : 0.08;
    glowMats[4].opacity = livingOn ? THREE.MathUtils.lerp(0.38, 0.55, m) + Math.sin(timeSec * 2.5 + 4) * 0.04 : 0.14;
    glowMats[5].opacity = THREE.MathUtils.lerp(0.42, 0.55, m) + Math.sin(timeSec * 2.1) * 0.03;
    glowMats[6].opacity = THREE.MathUtils.lerp(0.36, 0.52, m) + Math.sin(timeSec * 2.8) * 0.03;
    glowMats[7].opacity = THREE.MathUtils.lerp(0.44, 0.58, m) + Math.sin(timeSec * 2.3 + 2) * 0.03;

    // Goldfish circles peacefully inside Neighbor 402 bowl
    goldfishPivot.rotation.y = timeSec * 1.6;

    // Cruise boulevard traffic cars smoothly below Sky Terrace
    for (let i = 0; i < trafficCars.length; i++) {
      const car = trafficCars[i];
      car.group.position.z += car.speed * dt;
      if (car.speed > 0 && car.group.position.z > car.zMax) car.group.position.z = car.zMin;
      if (car.speed < 0 && car.group.position.z < car.zMin) car.group.position.z = car.zMax;
    }

    fairyMat.opacity = 0.72 + Math.sin(timeSec * 4.2) * 0.22;
    dustMotes.position.y = Math.sin(timeSec * 0.45) * 0.08;
    dustMotes.rotation.y = Math.sin(timeSec * 0.12) * 0.04;
  };

  const getRoomNameAt = (x: number, z: number, y = 0): string => {
    if (y < -6.0) {
      if (z < -2.6 && x >= -7.6 && x <= -5.6) return 'Elevator Cab';
      if (x < -15.5) return 'Society Street Gali';
      if (x < -10.5) return 'Courtyard Garden';
      return 'Ground Floor Lobby';
    }
    if (y > 2.6) return 'Building Rooftop';
    if (z < -2.6 && x >= -7.6 && x <= -5.6 && z >= -4.55) return 'Elevator Cab';
    // Neighbor 401 Multi-Room Flat (x <= -3.2, z < -2.6)
    if (x <= -3.2 && z < -2.6) {
      if (x < -11.4) return 'Neighbor 401 Balcony';
      if (z < -7.4 && x < -7.2) return 'Neighbor 401 Bathroom';
      if (z < -7.4) return 'Neighbor 401 Bedroom';
      if (x < -8.6) return 'Neighbor 401 Kitchenette';
      return 'Neighbor 401 Lounge';
    }
    // Neighbor 402 Multi-Room Flat (z > 4.4)
    if (z > 4.4) {
      if (z > 10.6 && x < -1.8) return 'Neighbor 402 Balcony';
      if (z > 11.4) return 'Neighbor 402 Bathroom';
      if (x > -1.8 && z > 7.8) return 'Neighbor 402 Bedroom';
      if (x > -1.8) return 'Neighbor 402 Kitchen';
      return 'Neighbor 402 Lounge';
    }
    if (x < -8.6) return 'Sky Terrace Lounge';
    if (x < -3.2) return 'Floor 4 Corridor';
    if (x > 3.2 && z > -2.65 && z < 1.9) return 'Balcony';
    if (z >= -2.8) return 'Living Room';
    if (x >= 4.2 && z >= -8.2 && z <= -5.85) return 'Bathroom';
    if (z >= -5.8 && x < 2.3) return 'Kitchen';
    if (z >= -5.8 && x >= 2.3) return 'Dining Nook';
    if (x < 1.8 && z < -6.7) return 'Bedroom';
    if (z < -8.2 && x >= 1.8) return 'Study & Office';
    return 'Hallway';
  };

  return {
    group,
    colliders,
    wallMeshes,
    walkableRects,
    platforms,
    props,
    curtains,
    sitSpots,
    hideSpots,
    heistItems,
    interactiveZones,
    wetFloorZones,
    pigeons,
    frontDoorPivot,
    setFrontDoorOpen,
    neighborDoorPivot,
    setNeighborDoorOpen,
    neighbor401DoorPivot,
    setNeighbor401DoorOpen,
    elevatorCab,
    elevDoor4L,
    elevDoor4R,
    elevDoorGL,
    elevDoorGR,
    setElevatorDoorState,
    minuPos,
    lulzaPos,
    sheruGroup,
    deliveryBagGroup,
    terraceLaundryGroup,
    carHazardLights,
    goldfishPivot,
    ceilingFans,
    fairyLightPoints,
    dustMotes,
    laserDotMesh,
    sinkWaterStream,
    tpRibbonGroup,
    tpRollMesh,
    catnipJarMesh,
    tvScreenMat,
    setRoomLightDimmed,
    swivelChair: {
      group: swivelGroup,
      seatTopY: 0.52,
      spinVel: 0,
      pos: chairBasePos,
    },
    laptopPos,
    balconyEscapeZone: { minX: 3.35, maxX: 5.05, minZ: -2.4, maxZ: 1.65 },
    setLightingPhase,
    getRoomNameAt,
  };
}
