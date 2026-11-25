import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CatAudioEngine } from './audio/CatAudioEngine';
import { BrownieCat } from './entities/BrownieCat';
import { HoomanNPC, type HoomanWaypoint } from './entities/HoomanNPC';
import { LulzaCatNPC } from './entities/LulzaCatNPC';
import { MinuNPC } from './entities/MinuNPC';
import { NeighborNPC } from './entities/NeighborNPC';
import { WatchmanNPC } from './entities/WatchmanNPC';
import type {
  BrownieActionState,
  BucketChallenge,
  CrimeStats,
  GamePhase,
  HeistProgress,
  HudSnapshot,
  SpeechBubble,
} from './types';
import { buildApartment, type BuiltApartment, type PigeonActor, type PlatformSurface } from './world/ApartmentBuilder';
import { createApartmentTextures, type ApartmentTextures } from './world/textures';

const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _camGoal = new THREE.Vector3();
const _camLook = new THREE.Vector3();
const _colOut = new THREE.Vector3();
const _npcOut = new THREE.Vector3();
const _pushDir = new THREE.Vector3();

const ATHARVA_BED_POS = new THREE.Vector3(-1.6, 0, -9.04);
const SHRUTI_BED_POS = new THREE.Vector3(-0.9, 0, -9.04);

interface FeatherParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  ttl: number;
}

const BUCKET_CHALLENGE_DEFS: Array<{ id: string; label: string }> = [
  { id: 'back_jump', label: 'Back-Jump Atharva, Shruti, 401, 402 or Watchman' },
  { id: 'pigeon_hunt', label: 'Hunt & Catch Gallery/Terrace/Rooftop Pigeons' },
  { id: 'pigeon_gift', label: 'Drop Caught Live Pigeon Gift at Hooman Feet' },
  { id: 'doorbell_prank', label: 'Ring 402 Bell & Open Neighbor Door' },
  { id: 'invade_402', label: 'Invade Neighbor 402 & Splash Goldfish' },
  { id: 'invade_401', label: 'Ring 401 Bell & Invade Riya’s Flat' },
  { id: 'lulza_date', label: 'Nuzzle Girlfriend Cat Lulza in Flat 401' },
  { id: 'neighbor_escalation', label: 'Escalate Neighbors -> Trigger Front Door Distraction' },
  { id: 'rooftop_climb', label: 'Climb AC Units to Building Rooftop & Water Tank' },
  { id: 'alley_boss', label: 'Win Gangster Minu’s Crush & Catnip Boost' },
  { id: 'elevator_ride', label: 'Ride Elevator to Ground Lobby & Courtyard' },
  { id: 'hoard_collector', label: 'Stash a Treasure on Bedroom Secret Hoard' },
  { id: 'scratch_furniture', label: 'Claw Scratching Post or Neighbor Sofa' },
  { id: 'laptop_mash', label: 'Loaf & Mash Keys on Open Laptop' },
  { id: 'curtain_climb', label: 'Climb a Curtain During Zoomies' },
  { id: 'cat_tv', label: 'Switch Smart TV to Birb Cat TV' },
  { id: 'laser_catch', label: 'Chase & Catch the Red Laser Dot' },
  { id: 'tp_shred', label: 'Unspool Bathroom Toilet Paper' },
  { id: 'catnip_mode', label: 'Sniff Secret Silvervine Catnip Jar' },
  { id: 'cardboard_tank', label: 'Claim the Cardboard Delivery Box' },
  { id: 'sink_splash', label: 'Turn On Hallway Sink Tap' },
  { id: 'switch_troll', label: 'Flicker a Room Wall Light Switch' },
  { id: 'biscuit_baker', label: 'Make Happy Biscuits (Press G)' },
  { id: 'corridor_escape', label: 'Bolt Out Front Door into Floor 4 Corridor' },
  { id: 'taunt_401', label: 'Taunt Sheru inside Flat 401 Lounge' },
  { id: 'delivery_heist', label: 'Rip Blinkit Bag & Steal Milk Packet' },
  { id: 'muddy_paws', label: 'Track Wet Mop Pawprints Indoors' },
  { id: 'yank_laundry', label: 'Yank Terrace Laundry Clothesline Down' },
  { id: 'car_alarm', label: 'Set Off Parked Sedan Car Alarm on Street' },
  { id: 'fried_fish_heist', label: 'Steal Fried Fish from Raju Chai Tapri' },
];

function isSoftwareWebGLContext(gl: WebGLRenderingContext | WebGL2RenderingContext | null): boolean {
  if (!gl) return true;
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export class BrownieGameEngine {
  public readonly audio = new CatAudioEngine();

  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly isSoftwareGl: boolean;
  private readonly textures: ApartmentTextures;
  private readonly apartment: BuiltApartment;
  private readonly brownie: BrownieCat;
  private readonly hoomans: HoomanNPC[];
  private readonly neighbor402: NeighborNPC;
  private readonly neighbor401: NeighborNPC;
  private readonly watchman: WatchmanNPC;
  private readonly minu: MinuNPC;
  private readonly lulza: LulzaCatNPC;
  private readonly caughtPigeonGroup = new THREE.Group();
  private readonly caughtPigeonWingL: THREE.Mesh;
  private readonly caughtPigeonWingR: THREE.Mesh;
  private readonly feathers: FeatherParticle[] = [];
  private readonly featherGeo = new THREE.PlaneGeometry(0.085, 0.04);
  private readonly featherMat = new THREE.MeshStandardMaterial({
    color: 0xe6e8ec,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  private readonly jumpRing: THREE.Mesh;
  private readonly rainLines: THREE.LineSegments;
  private readonly rainPositions: Float32Array;
  private readonly pawDecals: THREE.Mesh[] = [];
  private readonly pawGeo = new THREE.CircleGeometry(0.044, 8);
  private readonly pawMat = new THREE.MeshBasicMaterial({
    color: 0x6b3e1e,
    transparent: true,
    opacity: 0.44,
    depthWrite: false,
  });
  private pawDecalCursor = 0;
  private lastPawStampPos = new THREE.Vector3(999, 999, 999);

  private frameId = 0;
  private disposed = false;
  private contextLost = false;
  private lastTime = performance.now();
  private onHudUpdate: (hud: HudSnapshot) => void;
  private hudThrottle = 0;

  // Shared geometry/material for TP unspool ribbons (zero leak across resets)
  private readonly tpRibbonGeo = new THREE.BoxGeometry(0.085, 0.004, 0.16);
  private readonly tpRibbonMat = new THREE.MeshStandardMaterial({ color: 0xf7f5f0, roughness: 0.92 });

  // Game state
  private phase: GamePhase = 'title';
  private midnightBlend = 0;
  private hoomanEnergy = 100;
  private patienceWarning = 0;
  private noiseLevel = 0;
  private zoomiesMeter = 45;
  private zoomiesActive = false;
  private catnipRemaining = 0;
  private airJailRemaining = 0;
  private photoMode = false;
  private pointerLocked = false;

  // Cat physics
  private catPos = new THREE.Vector3(-0.35, 0, -0.4);
  private lastSafeCatPos = new THREE.Vector3(-0.35, 0, -0.4);
  private catVel = new THREE.Vector3();
  private catYaw = Math.PI * 0.85;
  private grounded = true;
  private actionState: BrownieActionState = 'idle';
  private actionOverride: BrownieActionState | null = null;
  private actionOverrideTimer = 0;
  private meowPulse = 0;
  private pounceCharge = 0;
  private carryingPropId: string | null = null;
  private caughtPigeonActor: PigeonActor | null = null;
  private sitTimer = 0;
  private sitTargetPos: THREE.Vector3 | null = null;
  private sittingSpotId: string | null = null;
  private curtainTimer = 0;
  private activeCurtainId: string | null = null;
  private goblinTarget: HoomanNPC | NeighborNPC | WatchmanNPC | null = null;
  private goblinTimer = 0;
  private wallStareTimer = 0;
  private isPurring = false;
  private lastRoom = 'Living Room';

  // Option 2 & 4 Dynamic Systems (Elevator, Neighbor Escalation, Secret Hoard, Alley Boss)
  private neighborAnnoyance = 0;
  private distractionTimer = 0;
  private hoardCount = 0;
  private alleyRespect = false;
  private lulzaBonded = false;
  private readonly stashedHoardIds = new Set<string>();
  private elevatorFloor: 4 | 0 = 4;
  private elevatorDoorOpenForFloor: 4 | 0 | null = null;
  private elevatorDoorOpenTimer = 0;
  private elev4DoorOpenAmount = 0;
  private elevGDoorOpenAmount = 0;
  private elevatorAnim = {
    active: false,
    targetFloor: 4 as 4 | 0,
    fromY: 0,
    toY: 0,
    t: 0,
  };

  // Interactive Toys & Chaos Combos
  private laserActive = false;
  private laserTimer = 0;
  private laserTarget = new THREE.Vector3(0.1, 0.025, 0.2);
  private laserVel = new THREE.Vector2(1.45, 1.15);
  private catTvOn = false;
  private sinkTapOn = false;
  private tpShreds = 0;
  private roomLightsDimmed: Record<'living' | 'kitchen' | 'study', boolean> = {
    living: false,
    kitchen: false,
    study: false,
  };
  private comboCount = 0;
  private comboTimer = 0;
  private bucketMap: Record<string, boolean> = {};

  // Jump arc
  private jumpArcActive = false;
  private jumpStart = new THREE.Vector3();
  private jumpEnd = new THREE.Vector3();
  private jumpT = 0;
  private jumpDuration = 0.42;
  private jumpPeak = 0.55;
  private bestJumpPlatform: PlatformSurface | null = null;

  // Camera (Stray-style low hero framing + [V] presets, zero auto-recalibration)
  private camYaw = Math.PI * 0.78;
  private camPitch = 0.22;
  private camDist = 2.05;
  private smoothedCamDist = 2.05;
  private smoothedCamLookY = 0.22;
  private cameraPresetIndex = 0;
  private readonly cameraPresets: Array<{
    label: 'Hero Stray' | 'Close Fur' | 'Wide Room';
    dist: number;
    pitch: number;
  }> = [
    { label: 'Hero Stray', dist: 2.05, pitch: 0.22 },
    { label: 'Close Fur', dist: 1.32, pitch: 0.14 },
    { label: 'Wide Room', dist: 3.25, pitch: 0.42 },
  ];
  private draggingOrbit = false;
  private lastPointerX = 0;
  private lastPointerY = 0;

  // Events & stats
  private doorBoltTimer = 24;
  private doorBoltActive = false;
  private doorBoltCountdown = 0;
  private frontDoorManuallyOpen = false;
  private doorAngle = 0;
  private neighborDoorAngle = 0;
  private neighbor401DoorAngle = 0;
  private pigeonCooldown = 0;
  private monsoonMode = false;
  private rainBlend = 0;
  private thunderTimer = 18;
  private wetPawsTimer = 0;
  private wetPawShoutCooldown = 0;
  private deliveryActive = false;
  private deliveryTimer = 12;
  private deliveryDespawnTimer = 0;
  private laundryYanked = false;
  private sheruBarkTimer = 0;
  private carAlarmTimer = 0;
  private bubbles: SpeechBubble[] = [];
  private heist: HeistProgress = {
    salmonTin: false,
    churuTube: false,
    hairTieStash: false,
    paperBallRescued: false,
    escapedBalcony: false,
  };
  private stats: CrimeStats = {
    itemsKnocked: 0,
    backJumps: 0,
    curtainsClimbed: 0,
    laptopLoafs: 0,
    meowsSpammed: 0,
    doorBolts: 0,
    bucketSits: 0,
    pigeonsWatched: 0,
    pigeonsHunted: 0,
    pigeonsCaught: 0,
    giftsDelivered: 0,
    escalationsTriggered: 0,
    hoardStashed: 0,
    thingsScratched: 0,
    timesSpotted: 0,
    paperBallDelivered: false,
    tpShredded: 0,
    lasersCaught: 0,
    biscuitsMade: 0,
    switchesFlipped: 0,
    carAlarmsTriggered: 0,
    deliveriesHeisted: 0,
    maxCombo: 0,
    chaosScore: 0,
    elapsedSeconds: 0,
  };

  // Input state
  private keys = new Set<string>();
  private jumpPressedLatch = false;
  private virtualInput = { moveX: 0, moveY: 0, crouch: false };

  constructor(container: HTMLElement, onHudUpdate: (hud: HudSnapshot) => void) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.isSoftwareGl = isSoftwareWebGLContext(this.renderer.getContext());
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.10;
    const pixelRatio = this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5);
    this.renderer.setPixelRatio(pixelRatio);
    const initW = container.clientWidth || window.innerWidth;
    const initH = container.clientHeight || window.innerHeight;
    this.renderer.setSize(initW, initH);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      52,
      initW / initH,
      0.08,
      110,
    );

    // Warm night skyline backdrop & subtle cozy fog (no cold blue/white wash)
    this.scene.background = new THREE.Color(0x0c0806);
    this.scene.fog = new THREE.FogExp2(0x110b07, 0.015);

    // Rich studio environment reflections for porcelain, chrome, brass, glass & glossy feline eyes
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.34;
    pmrem.dispose();

    // Procedural textures & Apartment World
    this.textures = createApartmentTextures(this.renderer.capabilities.getMaxAnisotropy());
    this.apartment = buildApartment(this.textures);
    this.scene.add(this.apartment.group);

    // Brownie the Binzie Cat (long-hair ginger coat, lion mane ruff, nose freckles, fur bump & bottle-brush tail)
    this.brownie = new BrownieCat(
      this.textures.tabbyFur,
      this.textures.brownieFaceFur,
      this.textures.furAlphaTuft,
      this.textures.brownieEye,
      this.textures.contactShadow,
      this.textures.ruffFur,
      this.textures.furBump,
    );
    this.brownie.root.position.copy(this.catPos);
    this.scene.add(this.brownie.root);

    // Ledge-target indicator ring
    this.jumpRing = new THREE.Mesh(
      new THREE.RingGeometry(0.11, 0.16, 20),
      new THREE.MeshBasicMaterial({ color: 0xf7b733, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
    );
    this.jumpRing.rotation.x = -Math.PI / 2;
    this.jumpRing.visible = false;
    this.scene.add(this.jumpRing);

    // Atharva & Shruti NPCs (routed cleanly through room archways)
    const atharvaWaypoints: HoomanWaypoint[] = [
      { mode: 'sofa_laptop', pos: new THREE.Vector3(-0.78, 0, -1.72), lookYaw: Math.PI, duration: 10 },
      { mode: 'sofa_laptop', pos: new THREE.Vector3(2.5, 0, -2.85), lookYaw: Math.PI, duration: 0.4 },
      { mode: 'washbasin', pos: new THREE.Vector3(2.55, 0, -6.32), lookYaw: -Math.PI / 2, duration: 5 },
      { mode: 'study_desk', pos: new THREE.Vector3(2.5, 0, -8.25), lookYaw: Math.PI, duration: 0.4 },
      { mode: 'study_desk', pos: new THREE.Vector3(3.15, 0, -10.85), lookYaw: -Math.PI / 2, duration: 11 },
      { mode: 'study_desk', pos: new THREE.Vector3(2.5, 0, -8.25), lookYaw: 0, duration: 0.4 },
      { mode: 'sofa_laptop', pos: new THREE.Vector3(2.5, 0, -2.85), lookYaw: 0, duration: 0.4 },
    ];
    const shrutiWaypoints: HoomanWaypoint[] = [
      { mode: 'kitchen_counter', pos: new THREE.Vector3(1.12, 0, -4.1), lookYaw: -Math.PI / 2, duration: 9 },
      { mode: 'balcony_plants', pos: new THREE.Vector3(2.5, 0, -2.85), lookYaw: 0, duration: 0.4 },
      { mode: 'balcony_plants', pos: new THREE.Vector3(3.15, 0, -0.82), lookYaw: Math.PI / 2, duration: 0.4 },
      { mode: 'balcony_plants', pos: new THREE.Vector3(4.1, 0, -1.45), lookYaw: Math.PI, duration: 7 },
      { mode: 'sofa_laptop', pos: new THREE.Vector3(3.15, 0, -0.82), lookYaw: -Math.PI / 2, duration: 0.4 },
      { mode: 'sofa_laptop', pos: new THREE.Vector3(-1.8, 0, -1.65), lookYaw: Math.PI, duration: 9 },
      { mode: 'washbasin', pos: new THREE.Vector3(2.5, 0, -2.85), lookYaw: Math.PI, duration: 0.4 },
      { mode: 'washbasin', pos: new THREE.Vector3(2.52, 0, -6.32), lookYaw: -Math.PI / 2, duration: 5 },
      { mode: 'kitchen_counter', pos: new THREE.Vector3(2.5, 0, -4.3), lookYaw: -Math.PI / 2, duration: 0.4 },
    ];
    this.hoomans = [
      new HoomanNPC('Atharva', atharvaWaypoints, this.textures.contactShadow),
      new HoomanNPC('Shruti', shrutiWaypoints, this.textures.contactShadow),
    ];
    for (const h of this.hoomans) {
      this.scene.add(h.root);
    }

    this.neighbor402 = new NeighborNPC(this.textures.contactShadow);
    this.scene.add(this.neighbor402.root);

    this.neighbor401 = new NeighborNPC(this.textures.contactShadow, {
      id: 'Neighbor 401',
      homePos: new THREE.Vector3(-4.55, 0, -5.2),
      thresholdPos: new THREE.Vector3(-4.55, 0, -3.25),
      corridorWayPos: new THREE.Vector3(-4.55, 0, -2.05),
      returnDoorPos: new THREE.Vector3(-4.55, 0, -3.15),
      chaseBounds: { minX: -11.0, maxX: -3.5, minZ: -10.4, maxZ: -3.05 },
      doorIsSouthSide: false,
      idleYaw: 0,
      shirtColor: 0x1b6b63,
      sashColor: 0x0f3f3a,
      pantsColor: 0x212630,
      hairColor: 0x181416,
      femaleHair: true,
      hasMustache: false,
      hasGlasses: false,
    });
    this.scene.add(this.neighbor401.root);

    this.watchman = new WatchmanNPC(this.textures.contactShadow);
    this.scene.add(this.watchman.root);

    this.minu = new MinuNPC(this.apartment.minuPos, this.textures.contactShadow);
    this.scene.add(this.minu.root);

    this.lulza = new LulzaCatNPC(this.apartment.lulzaPos, this.textures.contactShadow);
    this.scene.add(this.lulza.root);

    // Flapping live pigeon mesh shown in Brownie's mouth when caught
    const cpBodyMat = new THREE.MeshStandardMaterial({ color: 0x8b95a3, roughness: 0.78 });
    const cpWingMat = new THREE.MeshStandardMaterial({ color: 0x626b78, roughness: 0.8 });
    const cpBeakMat = new THREE.MeshStandardMaterial({ color: 0xe2b14a, roughness: 0.5 });
    const cpBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.1, 6, 10), cpBodyMat);
    cpBody.rotation.z = Math.PI / 2;
    this.caughtPigeonGroup.add(cpBody);
    const cpHead = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), cpBodyMat);
    cpHead.position.set(0.095, 0.03, 0);
    this.caughtPigeonGroup.add(cpHead);
    const cpBeak = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.028, 6), cpBeakMat);
    cpBeak.rotation.z = -Math.PI / 2;
    cpBeak.position.set(0.132, 0.025, 0);
    this.caughtPigeonGroup.add(cpBeak);
    const wingGeo = new THREE.BoxGeometry(0.095, 0.012, 0.12);
    this.caughtPigeonWingL = new THREE.Mesh(wingGeo, cpWingMat);
    this.caughtPigeonWingL.position.set(0, 0.02, 0.07);
    this.caughtPigeonGroup.add(this.caughtPigeonWingL);
    this.caughtPigeonWingR = new THREE.Mesh(wingGeo, cpWingMat);
    this.caughtPigeonWingR.position.set(0, 0.02, -0.07);
    this.caughtPigeonGroup.add(this.caughtPigeonWingR);
    this.caughtPigeonGroup.visible = false;
    this.scene.add(this.caughtPigeonGroup);

    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(this.featherGeo, this.featherMat);
      m.visible = false;
      this.scene.add(m);
      this.feathers.push({ mesh: m, vel: new THREE.Vector3(), ttl: 0 });
    }

    // Pooled wet pawprint decals (zero GC / zero memory leak)
    for (let i = 0; i < 24; i++) {
      const decal = new THREE.Mesh(this.pawGeo, this.pawMat);
      decal.rotation.x = -Math.PI / 2;
      decal.visible = false;
      this.scene.add(decal);
      this.pawDecals.push(decal);
    }

    // Lightweight 1-draw-call 3D Monsoon Rain Streaks
    const rainCount = 220;
    this.rainPositions = new Float32Array(rainCount * 6);
    for (let i = 0; i < rainCount; i++) {
      const rx = (Math.random() - 0.5) * 16;
      const ry = Math.random() * 8;
      const rz = (Math.random() - 0.5) * 16;
      this.rainPositions[i * 6 + 0] = rx;
      this.rainPositions[i * 6 + 1] = ry;
      this.rainPositions[i * 6 + 2] = rz;
      this.rainPositions[i * 6 + 3] = rx - 0.08;
      this.rainPositions[i * 6 + 4] = ry - 0.42;
      this.rainPositions[i * 6 + 5] = rz;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const rainMat = new THREE.LineBasicMaterial({
      color: 0xb8d4ee,
      transparent: true,
      opacity: 0.46,
    });
    this.rainLines = new THREE.LineSegments(rainGeo, rainMat);
    this.rainLines.visible = false;
    this.rainLines.frustumCulled = false;
    this.scene.add(this.rainLines);

    this.bindEvents();
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
    void this.audio.loadManifest();
    this.emitHud();
    this.scheduleNextTick();
  }

  public startNewGame(mode: 'story' | 'sandbox') {
    this.phase = mode === 'sandbox' ? 'sandbox' : 'chaos';
    this.midnightBlend = 0;
    this.hoomanEnergy = 100;
    this.patienceWarning = 0;
    this.noiseLevel = 0;
    this.zoomiesMeter = 50;
    this.zoomiesActive = false;
    this.catnipRemaining = 0;
    this.airJailRemaining = 0;
    this.photoMode = false;

    this.catPos.set(-0.35, 0, -0.4);
    this.lastSafeCatPos.copy(this.catPos);
    this.catVel.set(0, 0, 0);
    this.catYaw = Math.PI * 0.85;
    this.actionState = 'idle';
    this.carryingPropId = null;
    this.caughtPigeonActor = null;
    this.caughtPigeonGroup.visible = false;
    this.sitTargetPos = null;
    this.sittingSpotId = null;
    this.goblinTarget = null;
    this.activeCurtainId = null;
    this.doorBoltActive = false;
    this.doorBoltTimer = 20;
    this.frontDoorManuallyOpen = false;
    this.doorAngle = 0;
    this.apartment.setFrontDoorOpen(false);
    this.apartment.frontDoorPivot.rotation.y = 0;
    this.bubbles = [];

    this.neighborAnnoyance = 0;
    this.distractionTimer = 0;
    this.hoardCount = 0;
    this.alleyRespect = false;
    this.lulzaBonded = false;
    this.stashedHoardIds.clear();
    this.elevatorFloor = 4;
    this.elevatorDoorOpenForFloor = null;
    this.elevatorDoorOpenTimer = 0;
    this.elev4DoorOpenAmount = 0;
    this.elevGDoorOpenAmount = 0;
    this.elevatorAnim.active = false;
    this.apartment.elevatorCab.position.y = 0;
    this.apartment.elevDoor4L.position.x = -7.05;
    this.apartment.elevDoor4R.position.x = -6.15;
    this.apartment.elevDoorGL.position.x = -7.05;
    this.apartment.elevDoorGR.position.x = -6.15;
    this.apartment.setElevatorDoorState(4, false);
    this.apartment.setElevatorDoorState(0, false);

    // Reset interactive apartment toys & lights
    this.laserActive = false;
    this.laserTimer = 0;
    this.apartment.laserDotMesh.visible = false;
    this.catTvOn = false;
    this.apartment.tvScreenMat.map = this.textures.tvScreenMusic;
    this.apartment.tvScreenMat.emissiveMap = this.textures.tvScreenMusic;
    this.apartment.tvScreenMat.needsUpdate = true;
    this.sinkTapOn = false;
    this.apartment.sinkWaterStream.visible = false;
    this.tpShreds = 0;
    this.apartment.tpRollMesh.scale.set(1, 1, 1);
    while (this.apartment.tpRibbonGroup.children.length > 0) {
      this.apartment.tpRibbonGroup.remove(this.apartment.tpRibbonGroup.children[0]);
    }
    this.roomLightsDimmed = { living: false, kitchen: false, study: false };
    this.apartment.setRoomLightDimmed('living', false);
    this.apartment.setRoomLightDimmed('kitchen', false);
    this.apartment.setRoomLightDimmed('study', false);
    this.comboCount = 0;
    this.comboTimer = 0;
    this.bucketMap = {};

    for (const p of this.apartment.pigeons) {
      p.active = true;
      p.hunted = false;
      p.group.visible = true;
      p.group.position.copy(p.perchPos);
      p.wingL.rotation.z = 0.15;
      p.wingR.rotation.z = -0.15;
    }
    for (const f of this.feathers) {
      f.ttl = 0;
      f.mesh.visible = false;
    }
    this.actionOverride = null;
    this.actionOverrideTimer = 0;
    this.neighborDoorAngle = 0;
    this.apartment.neighborDoorPivot.rotation.y = 0;
    this.apartment.setNeighborDoorOpen(false);
    this.neighbor401DoorAngle = 0;
    this.apartment.neighbor401DoorPivot.rotation.y = 0;
    this.apartment.setNeighbor401DoorOpen(false);
    this.neighbor402.reset();
    this.neighbor401.reset();
    this.watchman.reset();
    this.minu.reset();
    this.lulza.reset();

    this.heist = {
      salmonTin: false,
      churuTube: false,
      hairTieStash: false,
      paperBallRescued: false,
      escapedBalcony: false,
    };
    for (const item of this.apartment.heistItems) {
      item.collected = false;
      item.mesh.visible = false; // appear in Phase 2 (or always visible in sandbox)
      if (mode === 'sandbox') item.mesh.visible = true;
    }
    for (const prop of this.apartment.props) {
      prop.pos.copy(prop.homePos);
      prop.vel.set(0, 0, 0);
      prop.angVel.set(0, 0, 0);
      prop.mesh.position.copy(prop.homePos);
      prop.mesh.quaternion.copy(prop.homeQuat);
      prop.knocked = false;
    }

    this.monsoonMode = false;
    this.rainBlend = 0;
    this.rainLines.visible = false;
    this.audio.setRainAmbience(false);
    this.wetPawsTimer = 0;
    this.wetPawShoutCooldown = 0;
    for (const d of this.pawDecals) d.visible = false;
    this.deliveryActive = false;
    this.deliveryTimer = 10;
    this.deliveryDespawnTimer = 0;
    this.apartment.deliveryBagGroup.visible = false;
    this.laundryYanked = false;
    this.apartment.terraceLaundryGroup.position.set(-11.65, 1.68, 1.5);
    this.apartment.terraceLaundryGroup.rotation.set(0, 0, 0);
    this.sheruBarkTimer = 0;
    this.carAlarmTimer = 0;

    this.stats = {
      itemsKnocked: 0,
      backJumps: 0,
      curtainsClimbed: 0,
      laptopLoafs: 0,
      meowsSpammed: 0,
      doorBolts: 0,
      bucketSits: 0,
      pigeonsWatched: 0,
      pigeonsHunted: 0,
      pigeonsCaught: 0,
      giftsDelivered: 0,
      escalationsTriggered: 0,
      hoardStashed: 0,
      thingsScratched: 0,
      timesSpotted: 0,
      paperBallDelivered: false,
      tpShredded: 0,
      lasersCaught: 0,
      biscuitsMade: 0,
      switchesFlipped: 0,
      carAlarmsTriggered: 0,
      deliveriesHeisted: 0,
      maxCombo: 0,
      chaosScore: 0,
      elapsedSeconds: 0,
    };

    // Reset hoomans
    this.hoomans[0].mode = 'sofa_laptop';
    this.hoomans[0].investigateTarget = null;
    this.hoomans[1].mode = 'kitchen_counter';
    this.hoomans[1].investigateTarget = null;

    this.pushBubble(
      'Brownie',
      mode === 'sandbox'
        ? 'Free Binzie roam! Hunt pigeons, visit Chai Tapri, or toggle Monsoon [R]!'
        : 'Time to wear down Atharva & Shruti...',
    );
    this.emitHud();
  }

  public toggleMonsoonMode() {
    if (this.phase === 'title' || this.phase === 'victory') return;
    this.monsoonMode = !this.monsoonMode;
    if (this.monsoonMode) {
      this.audio.playThunder();
      this.pushBubble('Brownie', 'Mumbai Monsoon Rain engaged! Watch your paws outside!');
    } else {
      this.audio.setRainAmbience(false);
      this.pushBubble('Brownie', 'Clear evening sky returned.');
    }
    this.emitHud();
  }

  public toggleMidnightSandbox() {
    if (this.phase === 'sandbox') {
      this.midnightBlend = this.midnightBlend > 0.5 ? 0 : 1;
      for (const h of this.hoomans) {
        if (this.midnightBlend > 0.5) {
          h.setSleeping(h.id === 'Atharva' ? ATHARVA_BED_POS : SHRUTI_BED_POS, 0, true);
        } else {
          h.mode = 'sofa_laptop';
        }
      }
    }
  }

  public togglePhotoMode(force?: boolean) {
    this.photoMode = force !== undefined ? force : !this.photoMode;
    if (this.photoMode && document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.emitHud();
  }

  public cycleCameraPreset() {
    if (this.phase === 'title') return;
    this.cameraPresetIndex = (this.cameraPresetIndex + 1) % this.cameraPresets.length;
    const preset = this.cameraPresets[this.cameraPresetIndex];
    this.camDist = preset.dist;
    this.camPitch = preset.pitch;
    this.emitHud();
  }

  public capturePhotoDataUrl(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  public triggerMeow() {
    if (this.phase === 'title' || this.airJailRemaining > 0) return;
    this.meowPulse = 1;
    this.stats.meowsSpammed += 1;
    void this.audio.playSlot('demand_meow');
    if (this.sittingSpotId === 'sofa_laptop' && this.sitTargetPos) {
      this.audio.playKeyboardMash();
      this.pushBubble('Brownie', 'mrrrow;;asdfjkl!!');
      this.registerChaos(12, 'laptop_mash');
    } else {
      this.pushBubble('Brownie', 'MRRROW!!');
    }

    if (this.minu.root.position.distanceTo(this.catPos) < 2.6) {
      this.minu.triggerCrushReact();
      this.pushBubble('Minu', 'Omg look at that chunky ginger meow!! Who’s a handsome gangster boy?!');
    } else if (this.lulza.root.position.distanceTo(this.catPos) < 2.2) {
      this.lulza.triggerLoveReact();
      this.lulzaBonded = true;
      this.lulza.nuzzled = true;
      this.registerChaos(45, 'lulza_date');
      this.pushBubble('Lulza', '*mrrp-trill!* (happy slow-blink purr at Brownie)');
    }

    if (this.phase === 'chaos') {
      // Lure nearest hooman if within earshot
      let nearest: HoomanNPC | null = null;
      let minDist = 7.5;
      for (const h of this.hoomans) {
        const d = h.root.position.distanceTo(this.catPos);
        if (d < minDist) {
          minDist = d;
          nearest = h;
        }
      }
      if (nearest) {
        nearest.sendToInvestigate(this.catPos.clone(), 4.2, false);
        this.drainHoomanEnergy(6, nearest.id, 'Okay Binzie, what do you want?!');
      }
    } else if (this.phase === 'heist') {
      this.addNoise(32);
    }
  }

  public setVirtualMove(moveX: number, moveY: number) {
    this.virtualInput.moveX = THREE.MathUtils.clamp(moveX, -1, 1);
    this.virtualInput.moveY = THREE.MathUtils.clamp(moveY, -1, 1);
  }

  public setVirtualCrouch(active: boolean) {
    this.virtualInput.crouch = active;
  }

  public triggerZoomies() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory' || this.airJailRemaining > 0) return;
    if (this.zoomiesMeter >= 30 && !this.zoomiesActive) {
      this.zoomiesActive = true;
      void this.audio.playSlot('zoomies_yowl');
      this.pushBubble('Brownie', '3 AM ZOOMIES ENGAGED!');
    }
  }

  public triggerJump() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory') return;
    this.tryJump();
  }

  public triggerInteract() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory') return;
    this.tryInteract();
  }

  public triggerLoafOrWallStare() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory') return;
    this.tryLoafOrWallStare();
  }

  public triggerKnead() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory' || this.airJailRemaining > 0) return;
    if (this.actionState === 'knead') {
      this.actionState = 'idle';
      this.audio.setPurring(false);
    } else {
      this.sitTargetPos = null;
      this.sittingSpotId = null;
      this.wallStareTimer = 0;
      this.actionOverride = null;
      this.actionOverrideTimer = 0;
      this.actionState = 'knead';
      this.stats.biscuitsMade += 1;
      this.audio.setPurring(true);
      void this.audio.playSlot('greeting_trill');
      this.pushBubble('Brownie', '*kneading fresh cinnamon biscuits*');
      this.registerChaos(20, 'biscuit_baker');
    }
    this.emitHud();
  }

  public triggerGroom() {
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory' || this.airJailRemaining > 0) return;
    if (this.actionOverride === 'groom') {
      this.actionOverride = null;
      this.actionOverrideTimer = 0;
      this.audio.setPurring(false);
    } else {
      this.sitTargetPos = null;
      this.sittingSpotId = null;
      this.wallStareTimer = 0;
      this.actionOverride = 'groom';
      this.actionOverrideTimer = 4.2;
      this.audio.setPurring(true);
      void this.audio.playSlot('purr_loop');
      this.pushBubble('Brownie', '*licks fluffy paw & washes ears*');
    }
    this.emitHud();
  }

  public orbitCamera(deltaX: number, deltaY: number) {
    if (this.phase === 'title') return;
    this.camYaw -= deltaX * 0.0055;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + deltaY * 0.0045, -0.25, 1.05);
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('contextmenu', this.handleContextMenu);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('wheel', this.handleWheel, { passive: true });
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);
  }

  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private handleContextLost = (e: Event) => {
    e.preventDefault();
    this.contextLost = true;
  };

  private handleContextRestored = () => {
    this.contextLost = false;
    this.lastTime = performance.now();
    this.scheduleNextTick();
  };

  private handleWindowBlur = () => {
    this.keys.clear();
    this.draggingOrbit = false;
    this.jumpPressedLatch = false;
    this.virtualInput.moveX = 0;
    this.virtualInput.moveY = 0;
    this.virtualInput.crouch = false;
  };

  private handleResize = () => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private handlePointerLockChange = () => {
    this.pointerLocked = document.pointerLockElement === this.renderer.domElement;
    this.emitHud();
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (this.phase === 'title') return;
    if (e.pointerType === 'touch') return;
    // Smooth drag-to-orbit without jarring iframe pointer-lock cursor traps
    this.draggingOrbit = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (this.phase === 'title') return;
    if (this.pointerLocked) {
      this.camYaw -= e.movementX * 0.0026;
      this.camPitch = THREE.MathUtils.clamp(this.camPitch + e.movementY * 0.0022, -0.1, 1.18);
    } else if (this.draggingOrbit) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.camYaw -= dx * 0.0055;
      this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0045, -0.1, 1.18);
    }
  };

  private handlePointerUp = () => {
    this.draggingOrbit = false;
  };

  private handleWheel = (e: WheelEvent) => {
    this.camDist = THREE.MathUtils.clamp(this.camDist + e.deltaY * 0.0018, 1.4, 5.2);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    const code = e.code;
    this.keys.add(code);

    if (code === 'KeyP' && this.phase !== 'title') {
      this.togglePhotoMode();
      return;
    }
    if (this.photoMode || this.phase === 'title' || this.phase === 'victory') return;

    if (code === 'Space' && !this.jumpPressedLatch) {
      this.jumpPressedLatch = true;
      this.tryJump();
    } else if (code === 'KeyQ' || code === 'KeyM') {
      this.triggerMeow();
    } else if (code === 'KeyE') {
      this.tryInteract();
    } else if (code === 'KeyF') {
      this.tryLoafOrWallStare();
    } else if (code === 'KeyG') {
      this.triggerKnead();
    } else if (code === 'KeyH') {
      this.triggerGroom();
    } else if (code === 'KeyR') {
      this.toggleMonsoonMode();
    } else if (code === 'KeyV') {
      this.cycleCameraPreset();
    } else if (code === 'ShiftLeft' || code === 'ShiftRight') {
      if (this.zoomiesMeter >= 30 && !this.zoomiesActive) {
        this.zoomiesActive = true;
        void this.audio.playSlot('zoomies_yowl');
        this.pushBubble('Brownie', '3 AM ZOOMIES ENGAGED!');
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
    if (e.code === 'Space') {
      this.jumpPressedLatch = false;
    }
  };

  private scheduleNextTick() {
    if (this.disposed) return;
    if (this.contextLost) {
      this.frameId = window.setTimeout(this.tick, 250);
      return;
    }
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext | null;
    if (!gl || gl.isContextLost()) {
      this.frameId = window.setTimeout(cb, 250);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        gl.deleteSync(sync);
        return;
      }
      if (gl.isContextLost()) {
        this.frameId = window.setTimeout(cb, 250);
        return;
      }
      const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = () => {
    if (this.disposed) return;
    if (this.contextLost) {
      this.scheduleNextTick();
      return;
    }
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTime) / 1000));
    this.lastTime = now;

    if (!this.photoMode) {
      this.updateSimulation(dt, now * 0.001);
    }
    this.updateCamera(dt, now * 0.001);
    this.renderer.render(this.scene, this.camera);

    this.hudThrottle += dt;
    if (this.hudThrottle >= 0.14) {
      this.hudThrottle = 0;
      this.emitHud();
    }
    this.scheduleNextTick();
  };

  private updateSimulation(dt: number, timeSec: number) {
    // Rotate ceiling fans
    for (const fan of this.apartment.ceilingFans) {
      fan.rotation.y += dt * 3.8;
    }

    // Speech bubble TTL
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].ttl -= dt;
      if (this.bubbles[i].ttl <= 0) this.bubbles.splice(i, 1);
    }

    // Decay meow pulse, warning, chaos combo & catnip
    this.meowPulse = Math.max(0, this.meowPulse - dt * 2.8);
    this.patienceWarning = Math.max(0, this.patienceWarning - dt * 4.5);
    this.noiseLevel = Math.max(0, this.noiseLevel - dt * 11);
    if (this.comboTimer > 0) {
      this.comboTimer = Math.max(0, this.comboTimer - dt);
      if (this.comboTimer === 0) this.comboCount = 0;
    }
    if (this.catnipRemaining > 0) {
      this.catnipRemaining = Math.max(0, this.catnipRemaining - dt);
      this.zoomiesMeter = Math.max(this.zoomiesMeter, 90);
    }
    this.apartment.catnipJarMesh.rotation.y += dt * 1.4;

    // Laser Pointer Chase update
    if (this.laserActive) {
      this.laserTimer -= dt;
      if (this.laserTimer <= 0) {
        this.laserActive = false;
        this.apartment.laserDotMesh.visible = false;
      } else {
        this.laserTarget.x += this.laserVel.x * dt;
        this.laserTarget.z += this.laserVel.y * dt;
        if (this.laserTarget.x < -2.35 || this.laserTarget.x > 2.35) {
          this.laserVel.x *= -1;
          this.laserTarget.x = THREE.MathUtils.clamp(this.laserTarget.x, -2.35, 2.35);
        }
        if (this.laserTarget.z < -1.75 || this.laserTarget.z > 1.75) {
          this.laserVel.y *= -1;
          this.laserTarget.z = THREE.MathUtils.clamp(this.laserTarget.z, -1.75, 1.75);
        }
        this.apartment.laserDotMesh.visible = true;
        this.apartment.laserDotMesh.position.set(this.laserTarget.x, 0.025, this.laserTarget.z);

        if (
          this.catPos.y < 0.35 &&
          Math.hypot(this.catPos.x - this.laserTarget.x, this.catPos.z - this.laserTarget.z) < 0.44
        ) {
          this.stats.lasersCaught += 1;
          this.zoomiesMeter = Math.min(100, this.zoomiesMeter + 35);
          this.audio.playLootPickup();
          void this.audio.playSlot('chirp_ekekek');
          this.pushBubble('Brownie', 'CAUGHT THE RED LASER DOT!!');
          this.drainHoomanEnergy(9, 'Shruti', 'Wait how did Binzie actually catch the laser?!');
          this.registerChaos(30, 'laser_catch');
          this.laserTarget.set((Math.random() - 0.5) * 4.0, 0.025, (Math.random() - 0.5) * 3.0);
          this.laserVel.set((Math.random() > 0.5 ? 1 : -1) * 1.55, (Math.random() > 0.5 ? 1 : -1) * 1.25);
        }
      }
    }

    // Title hero portrait showcase on the warm living-room wavy rug
    if (this.phase === 'title') {
      this.catPos.set(-0.85, 0.022, -0.88);
      this.catYaw = Math.PI * 0.16;
      this.brownie.root.position.copy(this.catPos);
      this.brownie.root.rotation.y = this.catYaw;
      this.brownie.update(dt, {
        action: 'idle',
        speed: 0,
        isMidnight: false,
        isPurring: true,
        meowPulse: 0,
        pounceCharge: 0,
        lookPitch: -0.08,
      });
      this.apartment.setLightingPhase(0.18, timeSec, this.catPos.y, 0, false, this.catPos.x, this.catPos.z);
      return;
    }

    // Victory idle
    if (this.phase === 'victory') {
      this.apartment.setLightingPhase(1, timeSec, this.catPos.y, 0, false, this.catPos.x, this.catPos.z);
      this.brownie.update(dt, {
        action: 'loaf',
        speed: 0,
        isMidnight: true,
        isPurring: true,
        meowPulse: 0,
        pounceCharge: 0,
        lookPitch: 0,
      });
      return;
    }

    // Active play timer
    if (this.phase === 'chaos' || this.phase === 'heist') {
      this.stats.elapsedSeconds += dt;
    }

    // Transitioning Evening -> Midnight
    if (this.phase === 'transitioning') {
      this.midnightBlend = Math.min(1, this.midnightBlend + dt * 0.45);
      if (this.midnightBlend >= 1) {
        this.phase = 'heist';
        for (const item of this.apartment.heistItems) {
          item.mesh.visible = !item.collected;
        }
        this.pushBubble('Brownie', 'Hoomans asleep. Time for the Salmon Tin, Churu & Hair-Ties!');
      }
    }

    this.rainBlend = THREE.MathUtils.damp(this.rainBlend, this.monsoonMode ? 1 : 0, 3.2, dt);
    if (this.carAlarmTimer > 0) this.carAlarmTimer = Math.max(0, this.carAlarmTimer - dt);
    this.apartment.setLightingPhase(
      this.midnightBlend,
      timeSec,
      this.catPos.y,
      this.rainBlend,
      this.carAlarmTimer > 0,
      this.catPos.x,
      this.catPos.z,
    );

    // Monsoon Rain Particle Update & Ambient Sound
    const brownieOutdoors =
      this.catPos.y > 2.6 ||
      this.catPos.x > 3.15 ||
      this.catPos.x < -8.6 ||
      this.catPos.z > 10.5 ||
      (this.catPos.y < -6.0 && this.catPos.x < -10.5);
    this.audio.setRainAmbience(this.monsoonMode, brownieOutdoors);
    if (this.monsoonMode) {
      this.thunderTimer -= dt;
      if (this.thunderTimer <= 0) {
        this.thunderTimer = 16 + Math.random() * 14;
        this.audio.playThunder();
      }
      this.rainLines.visible = true;
      // Anchor rain cloud around the outdoor zone / camera look
      const anchorX = brownieOutdoors ? this.catPos.x : -11.5;
      const anchorY = this.catPos.y;
      const anchorZ = brownieOutdoors ? this.catPos.z : 0;
      const len = this.rainPositions.length / 6;
      for (let i = 0; i < len; i++) {
        let x = this.rainPositions[i * 6 + 0];
        let y = this.rainPositions[i * 6 + 1];
        let z = this.rainPositions[i * 6 + 2];
        y -= 13.5 * dt;
        x -= 1.6 * dt;
        if (y < anchorY - 1.5) {
          x = anchorX + (Math.random() - 0.5) * 16;
          y = anchorY + 5.5 + Math.random() * 2.5;
          z = anchorZ + (Math.random() - 0.5) * 16;
        }
        this.rainPositions[i * 6 + 0] = x;
        this.rainPositions[i * 6 + 1] = y;
        this.rainPositions[i * 6 + 2] = z;
        this.rainPositions[i * 6 + 3] = x - 0.08;
        this.rainPositions[i * 6 + 4] = y - 0.42;
        this.rainPositions[i * 6 + 5] = z;
      }
      this.rainLines.geometry.attributes.position.needsUpdate = true;
    } else {
      this.rainLines.visible = false;
    }

    // Sheru Flat 401 Pomeranian excited bounce animation
    if (this.sheruBarkTimer > 0) {
      this.sheruBarkTimer = Math.max(0, this.sheruBarkTimer - dt);
      this.apartment.sheruGroup.position.y = Math.abs(Math.sin(timeSec * 16)) * 0.12;
      this.apartment.sheruGroup.rotation.z = Math.sin(timeSec * 24) * 0.1;
    } else {
      this.apartment.sheruGroup.position.y = THREE.MathUtils.damp(this.apartment.sheruGroup.position.y, 0, 10, dt);
      this.apartment.sheruGroup.rotation.z = THREE.MathUtils.damp(this.apartment.sheruGroup.rotation.z, 0, 10, dt);
    }

    // Live Blinkit Delivery Bag Event outside Flat 4B
    if (!this.deliveryActive) {
      this.deliveryTimer -= dt;
      if (this.deliveryTimer <= 0 && (this.phase === 'chaos' || this.phase === 'sandbox')) {
        this.deliveryActive = true;
        this.deliveryDespawnTimer = 26;
        this.apartment.deliveryBagGroup.visible = true;
        this.audio.playDoorAlert();
        this.pushBubble('Atharva', 'Blinkit delivery left outside 4B! Hope Binzie stays away...');
      }
    } else {
      this.deliveryDespawnTimer -= dt;
      if (this.deliveryDespawnTimer <= 0) {
        this.deliveryActive = false;
        this.deliveryTimer = 34;
        this.apartment.deliveryBagGroup.visible = false;
      }
    }

    // Wet Mop Puddle & Monsoon Pawprint Tracking
    for (const wz of this.apartment.wetFloorZones) {
      if (
        Math.abs(this.catPos.y - wz.y) < 0.35 &&
        Math.hypot(this.catPos.x - wz.x, this.catPos.z - wz.z) < wz.radius
      ) {
        if (this.wetPawsTimer <= 0.2) {
          this.pushBubble('Brownie', '*splish* Wet paws from Kanta Bai’s freshly mopped floor!');
        }
        this.wetPawsTimer = 7.5;
      }
    }
    if (this.monsoonMode && brownieOutdoors) {
      this.wetPawsTimer = Math.max(this.wetPawsTimer, 5.5);
    }
    if (this.wetPawShoutCooldown > 0) this.wetPawShoutCooldown = Math.max(0, this.wetPawShoutCooldown - dt);
    if (this.wetPawsTimer > 0) {
      this.wetPawsTimer = Math.max(0, this.wetPawsTimer - dt);
      if (this.grounded && this.lastPawStampPos.distanceTo(this.catPos) > 0.38) {
        this.lastPawStampPos.copy(this.catPos);
        const decal = this.pawDecals[this.pawDecalCursor % this.pawDecals.length];
        this.pawDecalCursor += 1;
        decal.position.set(this.catPos.x, this.catPos.y + 0.015, this.catPos.z);
        decal.rotation.z = Math.random() * Math.PI * 2;
        decal.visible = true;

        const indoors =
          Math.abs(this.catPos.y) < 0.4 &&
          this.catPos.x >= -3.15 &&
          this.catPos.x <= 3.15 &&
          this.catPos.z <= 2.75;
        if (indoors && !this.bucketMap['muddy_paws']) {
          this.registerChaos(35, 'muddy_paws');
        }
        if (indoors && this.wetPawShoutCooldown <= 0 && this.phase === 'chaos') {
          this.wetPawShoutCooldown = 7.5;
          this.drainHoomanEnergy(12, 'Shruti', 'BINZIE!! WHO TRACKED WET PAWPRINTS ON THE CLEAN FLOOR?!');
        }
      }
    }

    // Neighbor 402 Distraction Window countdown
    if (this.distractionTimer > 0) {
      this.distractionTimer = Math.max(0, this.distractionTimer - dt);
      if (this.distractionTimer === 0) {
        this.pushBubble('Atharva', 'Alright Uncle Verma, we will lock the latch. Goodnight!');
      }
    }

    // Building Rooftop discovery milestone
    if (this.catPos.y >= 3.2 && !this.bucketMap['rooftop_climb']) {
      this.registerChaos(65, 'rooftop_climb');
      this.pushBubble('Brownie', 'Reached the Building Rooftop! Prowl the Water Tank & hunt pigeons!');
    }

    // Elevator Sliding Doors & Vertical Cab Motion (Floor 4 y=0 <-> Ground Lobby y=-11.5)
    const target4Open = !this.elevatorAnim.active && this.elevatorDoorOpenForFloor === 4 ? 1 : 0;
    const targetGOpen = !this.elevatorAnim.active && this.elevatorDoorOpenForFloor === 0 ? 1 : 0;
    this.elev4DoorOpenAmount = THREE.MathUtils.damp(this.elev4DoorOpenAmount, target4Open, 8, dt);
    this.elevGDoorOpenAmount = THREE.MathUtils.damp(this.elevGDoorOpenAmount, targetGOpen, 8, dt);
    this.apartment.elevDoor4L.position.x = -7.05 - this.elev4DoorOpenAmount * 0.9;
    this.apartment.elevDoor4R.position.x = -6.15 + this.elev4DoorOpenAmount * 0.9;
    this.apartment.elevDoorGL.position.x = -7.05 - this.elevGDoorOpenAmount * 0.9;
    this.apartment.elevDoorGR.position.x = -6.15 + this.elevGDoorOpenAmount * 0.9;
    this.apartment.setElevatorDoorState(4, this.elev4DoorOpenAmount > 0.65);
    this.apartment.setElevatorDoorState(0, this.elevGDoorOpenAmount > 0.65);

    if (this.elevatorDoorOpenTimer > 0 && !this.elevatorAnim.active) {
      const standingInDoorway = Math.abs(this.catPos.z - -2.6) < 0.6 && this.catPos.x > -7.6 && this.catPos.x < -5.6;
      if (!standingInDoorway) {
        this.elevatorDoorOpenTimer -= dt;
        if (this.elevatorDoorOpenTimer <= 0) {
          this.elevatorDoorOpenForFloor = null;
        }
      }
    }

    if (this.elevatorAnim.active) {
      this.elevatorAnim.t = Math.min(1, this.elevatorAnim.t + dt / 2.1);
      const u = this.elevatorAnim.t;
      const smooth = u * u * (3 - 2 * u);
      const cabY = THREE.MathUtils.lerp(this.elevatorAnim.fromY, this.elevatorAnim.toY, smooth);
      this.apartment.elevatorCab.position.y = cabY;
      this.catPos.x = THREE.MathUtils.clamp(this.catPos.x, -7.25, -5.95);
      this.catPos.z = THREE.MathUtils.clamp(this.catPos.z, -4.2, -2.95);
      this.catPos.y = cabY;
      this.actionState = 'sit_in';

      if (this.elevatorAnim.t >= 1) {
        this.elevatorAnim.active = false;
        this.elevatorFloor = this.elevatorAnim.targetFloor;
        this.apartment.elevatorCab.position.y = this.elevatorAnim.toY;
        this.catPos.y = this.elevatorAnim.toY;
        this.lastSafeCatPos.copy(this.catPos);
        this.elevatorDoorOpenForFloor = this.elevatorFloor;
        this.elevatorDoorOpenTimer = 10.0;
        this.audio.playElevatorDing();
        this.registerChaos(35, 'elevator_ride');
        this.pushBubble(
          'Brownie',
          this.elevatorFloor === 0
            ? 'Ground Floor Lobby! Dodge Watchman Tiwari & explore the Courtyard!'
            : 'Back on Floor 4 Corridor!',
        );
      }
      this.syncBrownieAndWorld(dt, 0);
      return;
    }

    // Air Jail cooldown
    if (this.airJailRemaining > 0) {
      this.airJailRemaining = Math.max(0, this.airJailRemaining - dt);
      if (this.airJailRemaining === 0) {
        this.pushBubble('Brownie', 'Released from Air Jail. Vengeance.');
      }
    }

    // Front Door Bolt Mini-Event (Phase 1) + Physical Corridor Escape!
    if (this.phase === 'chaos') {
      if (!this.doorBoltActive) {
        this.doorBoltTimer -= dt;
        if (this.doorBoltTimer <= 0) {
          this.doorBoltActive = true;
          this.doorBoltCountdown = 9.0;
          void this.audio.playDoorAlert();
          this.pushBubble('Shruti', 'Parcel at the door! DO NOT let Binzie bolt into the corridor!');
        }
      } else {
        this.doorBoltCountdown -= dt;
        // Brownie physically bolted through the open front door into Floor 4 Corridor!
        if (this.catPos.x < -3.35) {
          this.doorBoltActive = false;
          this.frontDoorManuallyOpen = true;
          this.doorBoltTimer = 36;
          this.stats.doorBolts += 1;
          void this.audio.playSlot('zoomies_yowl');
          this.drainHoomanEnergy(18, 'Atharva', 'BINZIE BOLTED INTO THE CORRIDOR!!');
          this.registerChaos(50, 'corridor_escape');
        } else if (this.doorBoltCountdown <= 0) {
          this.doorBoltActive = false;
          this.doorBoltTimer = 32;
        }
      }
    }
    if (this.catPos.x < -3.35 && !this.bucketMap['corridor_escape']) {
      this.bucketMap['corridor_escape'] = true;
      this.pushBubble('Brownie', 'Out in Floor 4 Corridor! Ring 402 or check the Sky Terrace!');
    }
    const doorIsOpen = this.doorBoltActive || this.frontDoorManuallyOpen;
    const targetDoorAngle = doorIsOpen ? 1.35 : 0;
    this.doorAngle = THREE.MathUtils.damp(this.doorAngle, targetDoorAngle, 7, dt);
    this.apartment.frontDoorPivot.rotation.y = this.doorAngle;
    this.apartment.setFrontDoorOpen(this.doorAngle > 0.45);

    // Neighbor 402 & 401 Door Swing + Trespassing Escalation Checks!
    const brownieInside402 = this.catPos.y > -2 && this.catPos.y < 2.6 && this.catPos.z > 4.45;
    if (brownieInside402) {
      if (!this.bucketMap['invade_402']) {
        this.registerChaos(50, 'invade_402');
        this.pushBubble('Neighbor 402', 'HEY!! 4B ORANGE CAT IN MY HOUSE!!');
        this.addNeighborAnnoyance(24);
      } else if (this.neighbor402.mode === 'annoyed_chase') {
        this.addNeighborAnnoyance(dt * 4.5);
      }
    }
    const nDoorOpen = this.neighbor402.mode !== 'inside_idle' || brownieInside402;
    const targetNDoorAngle = nDoorOpen ? -1.42 : 0;
    this.neighborDoorAngle = THREE.MathUtils.damp(this.neighborDoorAngle, targetNDoorAngle, 6, dt);
    this.apartment.neighborDoorPivot.rotation.y = this.neighborDoorAngle;
    this.apartment.setNeighborDoorOpen(Math.abs(this.neighborDoorAngle) > 0.45);

    const inElevatorShaftArea =
      this.catPos.x >= -7.6 && this.catPos.x <= -5.6 && this.catPos.z >= -4.55;
    const brownieInside401 =
      this.catPos.y > -2 &&
      this.catPos.y < 2.6 &&
      this.catPos.x <= -3.2 &&
      this.catPos.z < -2.6 &&
      !inElevatorShaftArea;
    if (brownieInside401) {
      if (!this.bucketMap['invade_401']) {
        this.registerChaos(50, 'invade_401');
        this.pushBubble('Neighbor 401', 'WAIT—HOW DID 4B’S ORANGE CAT SNEAK INTO 401?!');
        this.addNeighborAnnoyance(22);
      } else if (this.neighbor401.mode === 'annoyed_chase') {
        this.addNeighborAnnoyance(dt * 4.2);
      }
    }
    const n401DoorOpen = this.neighbor401.mode !== 'inside_idle' || brownieInside401;
    const targetN401DoorAngle = n401DoorOpen ? 1.42 : 0;
    this.neighbor401DoorAngle = THREE.MathUtils.damp(this.neighbor401DoorAngle, targetN401DoorAngle, 6, dt);
    this.apartment.neighbor401DoorPivot.rotation.y = this.neighbor401DoorAngle;
    this.apartment.setNeighbor401DoorOpen(Math.abs(this.neighbor401DoorAngle) > 0.45);

    // Animate fluttering pigeon feathers
    for (let i = 0; i < this.feathers.length; i++) {
      const f = this.feathers[i];
      if (f.ttl > 0) {
        f.ttl -= dt;
        f.vel.y -= 1.15 * dt;
        f.vel.x *= Math.exp(-1.5 * dt);
        f.vel.z *= Math.exp(-1.5 * dt);
        f.mesh.position.addScaledVector(f.vel, dt);
        f.mesh.position.x += Math.sin(timeSec * 8 + i) * 0.16 * dt;
        f.mesh.rotation.x += dt * 4.5;
        f.mesh.rotation.y += dt * 6.0;
        if (f.ttl <= 0 || f.mesh.position.y < 0.01) {
          f.ttl = 0;
          f.mesh.visible = false;
        }
      }
    }

    // Action override timer (groom / scratch / drink / pounce_attack)
    if (this.actionOverrideTimer > 0) {
      this.actionOverrideTimer -= dt;
      if (this.actionOverrideTimer <= 0) {
        this.actionOverride = null;
        this.audio.setPurring(false);
      }
    }

    // Pigeons on Balcony (Gallery), Sky Terrace & 402 Balcony + Stalk / Pounce Attack!
    this.pigeonCooldown = Math.max(0, this.pigeonCooldown - dt);
    let anyPigeonActive = false;
    const isCrouching = this.keys.has('KeyC') || this.virtualInput.crouch;
    for (const p of this.apartment.pigeons) {
      if (p.active) {
        anyPigeonActive = true;
        // Bob & peck gently when perched on floor or railing
        const peck = Math.abs(Math.sin(timeSec * 3.8 + p.peckPhase));
        p.group.position.y = p.perchPos.y + peck * 0.014;
        p.wingL.rotation.z = 0.15;
        p.wingR.rotation.z = -0.15;

        const distToCat = p.group.position.distanceTo(this.catPos);
        // Mid-air pounce / leap takedown! Catch live pigeon if mouth free, otherwise scatter!
        if ((!this.grounded || this.jumpArcActive) && distToCat < 0.92) {
          if (!this.caughtPigeonActor && !this.carryingPropId) {
            this.catchPigeon(p);
          } else {
            this.attackPigeon(p);
          }
        } else if (!isCrouching && distToCat < 0.55) {
          // Only spook automatically if sprinting uncrouched right on top of them
          p.active = false;
          p.hunted = false;
          p.timer = 9.0;
          void this.audio.playSlot('chirp_ekekek');
          this.pushBubble('Brownie', 'ek-ek-ek! Spooked a pigeon!');
        }
      } else {
        p.timer -= dt;
        if (p.timer > (p.hunted ? 10.5 : 6.5)) {
          p.group.position.lerp(p.homePos, 1 - Math.exp((p.hunted ? -5.5 : -3.4) * dt));
          p.group.position.y += Math.sin(timeSec * 22) * 0.03;
          p.wingL.rotation.z = 0.4 + Math.sin(timeSec * 34) * 0.85;
          p.wingR.rotation.z = -0.4 - Math.sin(timeSec * 34) * 0.85;
          if (p.hunted) {
            p.group.rotation.z += dt * 9.0;
          }
        } else if (p.timer > 0) {
          p.group.visible = false;
        } else {
          p.active = true;
          p.hunted = false;
          p.group.visible = true;
          p.group.rotation.z = 0;
          p.group.position.copy(p.perchPos);
        }
      }
    }
    if (
      anyPigeonActive &&
      ((this.catPos.x > 2.2 && this.catPos.z > -2.2 && this.catPos.z < 1.2) || this.catPos.x < -8.8) &&
      this.pigeonCooldown <= 0
    ) {
      this.pigeonCooldown = 14;
      this.stats.pigeonsWatched += 1;
      void this.audio.playSlot('chirp_ekekek');
      this.pushBubble('Brownie', 'ek-ek-ek-ek! *stalks pigeons*');
    }

    // Handle special latched states (Shoulder Goblin / Curtain Climb / Sit Spot / Wall Stare)
    if (this.goblinTarget) {
      this.goblinTimer -= dt;
      this.goblinTarget.shoulderAnchor.getWorldPosition(_v1);
      this.catPos.copy(_v1);
      this.catYaw = this.goblinTarget.root.rotation.y;
      this.actionState = 'shoulder_goblin';
      if (this.goblinTimer <= 0) {
        const dropFloorY = this.getFloorBaseY(
          this.goblinTarget.root.position.x,
          this.goblinTarget.root.position.z,
          this.goblinTarget.root.position.y,
        );
        const dropTarget = _v3
          .copy(this.goblinTarget.root.position)
          .add(_v2.set(0, 0, 0.45).applyAxisAngle(_v1.set(0, 1, 0), this.catYaw));
        dropTarget.y = dropFloorY;
        const safeDrop = this.resolveWallCollision(this.goblinTarget.root.position, dropTarget, 0.16, dropFloorY);
        this.catPos.set(safeDrop.x, dropFloorY, safeDrop.z);
        this.lastSafeCatPos.copy(this.catPos);
        this.goblinTarget = null;
        this.actionState = 'idle';
      }
      this.syncBrownieAndWorld(dt, 0);
      return;
    }

    if (this.activeCurtainId) {
      this.curtainTimer -= dt;
      this.actionState = 'curtain_climb';
      const c = this.apartment.curtains.find((x) => x.id === this.activeCurtainId);
      if (c && this.curtainTimer > 0) {
        this.catPos.y = THREE.MathUtils.damp(this.catPos.y, c.topY - 0.35, 6, dt);
        c.mesh.rotation.z = Math.sin(timeSec * 16) * 0.04;
      } else {
        if (c) c.mesh.rotation.z = 0;
        const safeCurtainRelease = this.resolveWallCollision(this.lastSafeCatPos, this.catPos, 0.16, this.catPos.y);
        this.catPos.x = safeCurtainRelease.x;
        this.catPos.z = safeCurtainRelease.z;
        this.activeCurtainId = null;
        this.grounded = false;
        this.catVel.y = 0.5;
      }
      this.syncBrownieAndWorld(dt, 0);
      return;
    }

    // Movement & Input
    const gp = this.readGamepad();
    const moveX = THREE.MathUtils.clamp(
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0) +
        gp.moveX +
        this.virtualInput.moveX,
      -1,
      1,
    );
    const moveZ = THREE.MathUtils.clamp(
      (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
        (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0) -
        gp.moveY +
        this.virtualInput.moveY,
      -1,
      1,
    );

    if (this.keys.has('BracketLeft') || this.keys.has('KeyJ')) this.camYaw += dt * 2.1;
    if (this.keys.has('BracketRight') || this.keys.has('KeyL')) this.camYaw -= dt * 2.1;
    if (Math.abs(gp.lookX) > 0.05) this.camYaw -= gp.lookX * dt * 2.2;
    if (Math.abs(gp.lookY) > 0.05) this.camPitch = THREE.MathUtils.clamp(this.camPitch + gp.lookY * dt * 1.6, -0.1, 1.18);
    if (gp.jump) this.tryJump();
    if (gp.meow) this.triggerMeow();
    if (gp.interact) this.tryInteract();

    const moveLen = Math.hypot(moveX, moveZ);
    const crouching = this.keys.has('KeyC') || gp.crouch || this.virtualInput.crouch;

    // Cancel sit/loaf/knead/wall-stare/groom/scratch/drink when moving
    if (
      moveLen > 0.12 &&
      (this.sitTargetPos ||
        this.wallStareTimer > 0 ||
        this.actionOverride ||
        this.actionState === 'loaf' ||
        this.actionState === 'knead')
    ) {
      this.sitTargetPos = null;
      this.sittingSpotId = null;
      this.wallStareTimer = 0;
      if (this.actionOverride !== 'pounce_attack') {
        this.actionOverride = null;
        this.actionOverrideTimer = 0;
      }
      if (this.actionState === 'knead' || this.actionState === 'loaf') {
        this.actionState = 'idle';
      }
      this.audio.setPurring(false);
      const baseHere = this.getFloorBaseY(this.catPos.x, this.catPos.z, this.catPos.y + 0.12);
      if (this.catPos.y > baseHere + 0.1 && !this.getSurfaceUnder(this.catPos.x, this.catPos.z, this.catPos.y + 0.12)) {
        this.catPos.y = baseHere;
      }
    }

    if (this.sitTargetPos) {
      this.catPos.lerp(this.sitTargetPos, 1 - Math.exp(-12 * dt));
      this.audio.setPurring(true);
      this.sitTimer += dt;
      this.syncBrownieAndWorld(dt, 0);
      return;
    }

    if (this.wallStareTimer > 0) {
      this.wallStareTimer -= dt;
      this.actionState = 'wall_stare';
      this.syncBrownieAndWorld(dt, 0);
      return;
    }

    // Zoomies energy management
    if (this.zoomiesActive) {
      this.zoomiesMeter = Math.max(0, this.zoomiesMeter - dt * 16);
      if (this.zoomiesMeter <= 0) this.zoomiesActive = false;
    } else if (moveLen > 0.2 && !crouching) {
      this.zoomiesMeter = Math.min(100, this.zoomiesMeter + dt * 5.5);
    }

    // Jump Arc motion (Ledge-reading jump with continuous wall clamping)
    if (this.jumpArcActive) {
      this.jumpT += dt / this.jumpDuration;
      if (this.jumpT >= 1) {
        this.jumpArcActive = false;
        const safeLand = this.resolveWallCollision(this.catPos, this.jumpEnd, 0.15, this.jumpEnd.y);
        this.catPos.set(safeLand.x, this.jumpEnd.y, safeLand.z);
        this.lastSafeCatPos.copy(this.catPos);
        this.grounded = true;
        this.catVel.set(0, 0, 0);
        this.audio.playSoftLanding();
        if (Math.random() > 0.45) void this.audio.playSlot('greeting_trill');
        this.checkSwivelChairSpin();
      } else {
        const u = this.jumpT;
        const nextY = THREE.MathUtils.lerp(this.jumpStart.y, this.jumpEnd.y, u) + Math.sin(u * Math.PI) * this.jumpPeak;
        _v2.lerpVectors(this.jumpStart, this.jumpEnd, u);
        const safeStep = this.resolveWallCollision(this.catPos, _v2, 0.15, nextY);
        this.catPos.set(safeStep.x, nextY, safeStep.z);
        this.actionState = 'jump';
      }
      this.syncBrownieAndWorld(dt, 2.5);
      return;
    }

    // Normal Ground / Air Movement
    const catnipBoost = this.catnipRemaining > 0 ? 1.38 : 1.0;
    const baseSpeed = (this.zoomiesActive ? 4.35 : crouching ? 1.15 : 2.35) * catnipBoost;
    let currentSpeed = 0;

    if (moveLen > 0.08) {
      const nX = moveX / Math.max(1, moveLen);
      const nZ = moveZ / Math.max(1, moveLen);
      const forwardX = -Math.sin(this.camYaw);
      const forwardZ = -Math.cos(this.camYaw);
      const rightX = Math.cos(this.camYaw);
      const rightZ = -Math.sin(this.camYaw);

      const worldDirX = forwardX * nZ + rightX * nX;
      const worldDirZ = forwardZ * nZ + rightZ * nX;
      const mag = Math.hypot(worldDirX, worldDirZ) || 1;
      const vx = (worldDirX / mag) * baseSpeed;
      const vz = (worldDirZ / mag) * baseSpeed;

      const targetYaw = Math.atan2(vx, vz);
      this.catYaw = lerpAngle(this.catYaw, targetYaw, 1 - Math.exp(-14 * dt));
      currentSpeed = baseSpeed;

      const nextPos = this.resolveWallCollision(
        this.catPos,
        _v1.set(this.catPos.x + vx * dt, this.catPos.y, this.catPos.z + vz * dt),
        0.15,
      );
      this.catPos.x = nextPos.x;
      this.catPos.z = nextPos.z;
      this.lastSafeCatPos.copy(this.catPos);
    }

    // Vertical gravity & elevation-aware platform grounding
    const baseFloorY = this.getFloorBaseY(this.catPos.x, this.catPos.z, this.catPos.y + 0.25);
    const floorSurface = this.getSurfaceUnder(this.catPos.x, this.catPos.z, this.catPos.y + 0.16);
    const groundY = floorSurface ? Math.max(floorSurface.y, baseFloorY) : baseFloorY;

    if (!this.grounded || this.catPos.y > groundY + 0.02) {
      this.catVel.y -= 14.5 * dt;
      this.catPos.y += this.catVel.y * dt;
      if (this.catPos.y <= groundY) {
        if (this.catVel.y < -3.8 && this.phase === 'heist') {
          this.addNoise(22);
        }
        this.catPos.y = groundY;
        this.catVel.y = 0;
        this.grounded = true;
        this.audio.playSoftLanding();
      }
    } else {
      this.catPos.y = groundY;
    }

    // Determine Brownie action state
    if (this.actionOverride) {
      this.actionState = this.actionOverride;
    } else if (!this.grounded) {
      this.actionState = 'jump';
    } else if (crouching) {
      this.pounceCharge = Math.min(1, this.pounceCharge + dt * 1.4);
      const nearEdge = floorSurface && this.isNearPlatformEdge(this.catPos, floorSurface);
      if (this.pounceCharge > 0.35 && this.bestJumpPlatform) {
        this.actionState = 'pounce_charge';
      } else if (nearEdge) {
        this.actionState = 'peek';
      } else {
        this.actionState = 'crouch';
      }
    } else {
      this.pounceCharge = 0;
      if (currentSpeed > 3.2) this.actionState = 'zoomies';
      else if (currentSpeed > 1.7) this.actionState = 'trot';
      else if (currentSpeed > 0.1) this.actionState = 'walk';
      else if (this.actionState !== 'loaf' && this.actionState !== 'knead') this.actionState = 'idle';
    }

    this.audio.setPurring(
      this.actionState === 'loaf' || this.actionState === 'knead' || this.actionState === 'groom',
    );

    // Update Best Ledge Jump Target
    this.bestJumpPlatform = this.findJumpTarget(crouching ? 1.65 : 1.15);
    if (this.bestJumpPlatform) {
      this.jumpRing.visible = true;
      const clampedX = THREE.MathUtils.clamp(
        this.catPos.x + Math.sin(this.catYaw) * 0.65,
        this.bestJumpPlatform.minX + 0.16,
        this.bestJumpPlatform.maxX - 0.16,
      );
      const clampedZ = THREE.MathUtils.clamp(
        this.catPos.z + Math.cos(this.catYaw) * 0.65,
        this.bestJumpPlatform.minZ + 0.16,
        this.bestJumpPlatform.maxZ - 0.16,
      );
      this.jumpRing.position.set(clampedX, this.bestJumpPlatform.y + 0.025, clampedZ);
    } else {
      this.jumpRing.visible = false;
    }

    this.syncBrownieAndWorld(dt, currentSpeed);
  }

  private syncBrownieAndWorld(dt: number, currentSpeed: number) {
    // Elevation-aware room acoustics
    const room = this.apartment.getRoomNameAt(this.catPos.x, this.catPos.z, this.catPos.y);
    if (room !== this.lastRoom) {
      this.lastRoom = room;
      this.audio.setRoom(room);
    }

    // Update Brownie visual transform & animations
    this.brownie.root.position.copy(this.catPos);
    this.brownie.root.rotation.y = this.catYaw;
    this.brownie.update(dt, {
      action: this.actionState,
      speed: currentSpeed,
      isMidnight: this.midnightBlend > 0.5,
      isPurring:
        this.isPurring ||
        this.actionState === 'loaf' ||
        this.actionState === 'sit_in' ||
        this.actionState === 'knead',
      isCatnip: this.catnipRemaining > 0,
      meowPulse: this.meowPulse,
      pounceCharge: this.pounceCharge,
      lookPitch: this.camPitch,
    });

    // Live Pigeon flapping in mouth
    if (this.caughtPigeonActor) {
      this.caughtPigeonGroup.visible = true;
      this.brownie.mouthAnchor.getWorldPosition(_v1);
      this.caughtPigeonGroup.position.copy(_v1);
      this.caughtPigeonGroup.rotation.y = this.catYaw + Math.PI * 0.5;
      const flap = Math.sin(performance.now() * 0.036) * 0.72;
      this.caughtPigeonWingL.rotation.x = 0.2 + flap;
      this.caughtPigeonWingR.rotation.x = -0.2 - flap;
    } else {
      this.caughtPigeonGroup.visible = false;
    }

    // Swivel chair spin decay
    if (Math.abs(this.apartment.swivelChair.spinVel) > 0.01) {
      this.apartment.swivelChair.group.rotation.y += this.apartment.swivelChair.spinVel * dt;
      this.apartment.swivelChair.spinVel *= Math.exp(-1.8 * dt);
    }

    // Update Physics Props & Paper Ball / Carryable Shiny Treasures
    for (const prop of this.apartment.props) {
      if (this.carryingPropId === prop.id) {
        this.brownie.mouthAnchor.getWorldPosition(_v1);
        prop.pos.copy(_v1);
        prop.mesh.position.copy(_v1);
        prop.vel.set(0, 0, 0);
        continue;
      }

      // Brush collision with moving Brownie (zero-GC _pushDir)
      const d = prop.pos.distanceTo(this.catPos);
      if (d < prop.radius + 0.19 && Math.abs(prop.pos.y - this.catPos.y) < 0.25 && currentSpeed > 1.2) {
        _pushDir.copy(prop.pos).sub(this.catPos);
        _pushDir.y = 0;
        if (_pushDir.lengthSq() > 0.0001) {
          _pushDir.normalize();
          this.batProp(prop, _pushDir, currentSpeed);
        }
      }

      // Elevation-aware gravity & floor settling
      const propBaseY = this.getFloorBaseY(prop.pos.x, prop.pos.z, prop.pos.y + 0.25);
      const under = this.getSurfaceUnder(prop.pos.x, prop.pos.z, prop.pos.y + 0.06);
      const floorY = (under ? Math.max(under.y, propBaseY) : propBaseY) + prop.radius * 0.75;

      if (prop.vel.lengthSq() > 0.0004 || prop.pos.y > floorY + 0.015) {
        prop.vel.y -= 13.5 * dt;
        prop.pos.addScaledVector(prop.vel, dt);
        const clampedProp = this.clampToWalkableRooms(prop.pos.x, prop.pos.z, 0.08, prop.pos.y);
        prop.pos.x = clampedProp.x;
        prop.pos.z = clampedProp.z;

        prop.mesh.rotation.x += prop.angVel.x * dt;
        prop.mesh.rotation.z += prop.angVel.z * dt;

        if (prop.pos.y <= floorY) {
          if (prop.vel.y < -1.8) {
            if (prop.id === 'jingle_ball') {
              this.audio.playBellJingle();
            } else {
              this.audio.playPropClatter(prop.loudness);
            }
            if (!prop.knocked && !prop.isPaperBall) {
              prop.knocked = true;
              this.onPropKnocked(prop);
            }
            prop.vel.y *= -0.32;
          } else {
            prop.vel.y = 0;
          }
          prop.pos.y = floorY;
          prop.vel.x *= Math.exp(-5.5 * dt);
          prop.vel.z *= Math.exp(-5.5 * dt);
          prop.angVel.multiplyScalar(Math.exp(-5.5 * dt));
        }
        prop.mesh.position.copy(prop.pos);
      }
    }

    // Heist Loot collection (Phase 2 or Sandbox)
    if (this.phase === 'heist' || this.phase === 'sandbox') {
      for (const item of this.apartment.heistItems) {
        item.mesh.rotation.y += dt * 1.8;
        if (!item.collected && item.pos.distanceTo(this.catPos) < 0.48) {
          item.collected = true;
          item.mesh.visible = false;
          this.heist[item.id] = true;
          this.audio.playLootPickup();
          void this.audio.playSlot('greeting_trill');
          this.pushBubble('Brownie', `Snagged: ${item.label}!`);
        }
      }

      // Check Balcony Victory Escape once all 3 main heist targets are stolen!
      if (
        this.phase === 'heist' &&
        this.heist.salmonTin &&
        this.heist.churuTube &&
        this.heist.hairTieStash
      ) {
        const bz = this.apartment.balconyEscapeZone;
        if (
          this.catPos.x >= bz.minX &&
          this.catPos.x <= bz.maxX &&
          this.catPos.z >= bz.minZ &&
          this.catPos.z <= bz.maxZ
        ) {
          this.heist.escapedBalcony = true;
          if (this.carryingPropId === 'paper_ball') {
            this.heist.paperBallRescued = true;
          }
          this.phase = 'victory';
          if (document.pointerLockElement) document.exitPointerLock();
          this.audio.playLootPickup();
          void this.audio.playSlot('purr_loop');
          this.emitHud();
        }
      }
    }

    // Update Atharva & Shruti NPCs + Midnight Flashlight Detection
    for (const h of this.hoomans) {
      h.update(dt, this.catPos, this.midnightBlend > 0.5, (from, to) =>
        this.resolveWallCollision(from, to, 0.15, undefined, _npcOut),
      );

      if (this.phase === 'heist' && h.mode === 'patrol_flashlight') {
        const toCat = _v1.copy(this.catPos).sub(h.root.position);
        const dist = toCat.length();
        const forward = _v2.set(Math.sin(h.root.rotation.y), 0, Math.cos(h.root.rotation.y));
        const dot = forward.dot(toCat.normalize());
        const hidden = this.isBrownieHidden();
        if (dist < 4.2 && dot > 0.68 && !hidden) {
          this.stats.timesSpotted += 1;
          void this.audio.playSlot('grumpy_mumble');
          this.pushBubble(h.id, 'BINZIE! Caught red-pawed! Back to the rug!');
          this.catPos.set(-1.1, 0, -1.05);
          this.catVel.set(0, 0, 0);
          this.noiseLevel = 0;
          h.setSleeping(h.id === 'Atharva' ? ATHARVA_BED_POS : SHRUTI_BED_POS, 0, false);
        }
      }
    }

    // Update Neighbor 402 NPC (Uncle Verma) + Shooing Brownie out of 402!
    const brownieInside402 = this.catPos.y > -2 && this.catPos.y < 2.6 && this.catPos.z > 4.45;
    this.neighbor402.update(dt, this.catPos, brownieInside402, (from, to) =>
      this.resolveWallCollision(from, to, 0.15, 0, _npcOut),
    );
    if (
      this.neighbor402.mode === 'annoyed_chase' &&
      this.neighbor402.shooCooldown <= 0 &&
      this.goblinTarget !== this.neighbor402 &&
      this.catPos.distanceTo(this.neighbor402.root.position) < 0.72 &&
      Math.abs(this.catPos.y) < 0.4
    ) {
      this.neighbor402.shooCooldown = 4.5;
      void this.audio.playSlot('grumpy_mumble');
      this.pushBubble('Neighbor 402', 'SHU!! Stay off my masala chai & get out of 402!');
      const pushOut = this.resolveWallCollision(
        this.catPos,
        _v1.set(this.catPos.x, this.catPos.y, Math.max(4.6, this.catPos.z - 0.9)),
        0.15,
      );
      this.catPos.copy(pushOut);
    }

    // Update Neighbor 401 NPC (Riya) + Shooing Brownie out of 401!
    const inElevArea = this.catPos.x >= -7.6 && this.catPos.x <= -5.6 && this.catPos.z >= -4.55;
    const brownieInside401 =
      this.catPos.y > -2 && this.catPos.y < 2.6 && this.catPos.x <= -3.2 && this.catPos.z < -2.6 && !inElevArea;
    this.neighbor401.update(dt, this.catPos, brownieInside401, (from, to) =>
      this.resolveWallCollision(from, to, 0.15, 0, _npcOut),
    );
    if (
      this.neighbor401.mode === 'annoyed_chase' &&
      this.neighbor401.shooCooldown <= 0 &&
      this.goblinTarget !== this.neighbor401 &&
      this.catPos.distanceTo(this.neighbor401.root.position) < 0.72 &&
      Math.abs(this.catPos.y) < 0.4
    ) {
      this.neighbor401.shooCooldown = 4.5;
      void this.audio.playSlot('grumpy_mumble');
      this.pushBubble('Neighbor 401', 'SHU!! Leave my matcha mug & get out of 401!');
      const pushOut401 = this.resolveWallCollision(
        this.catPos,
        _v1.set(this.catPos.x, this.catPos.y, Math.min(-2.85, this.catPos.z + 0.9)),
        0.15,
      );
      this.catPos.copy(pushOut401);
    }

    // Update Watchman Tiwari NPC (Ground Floor Lobby & Courtyard Garden)
    const brownieOnGroundFloor = this.catPos.y < -6.0;
    this.watchman.update(dt, this.catPos, brownieOnGroundFloor, (from, to) =>
      this.resolveWallCollision(from, to, 0.16, -11.5, _npcOut),
    );
    if (
      brownieOnGroundFloor &&
      this.watchman.mode === 'alert_chase' &&
      this.watchman.shooCooldown <= 0 &&
      this.goblinTarget !== this.watchman &&
      this.catPos.distanceTo(this.watchman.root.position) < 0.85 &&
      this.catPos.y < -10.8
    ) {
      this.watchman.shooCooldown = 5.5;
      this.audio.playWatchmanWhistle();
      this.pushBubble('Watchman', '*TWEET!* Shoo! No stray orange cats digging in society parcels!');
      const pushTowardLobby = this.resolveWallCollision(
        this.catPos,
        _v1.set(Math.min(-6.6, this.catPos.x + 1.1), -11.5, this.catPos.z),
        0.15,
        -11.5,
      );
      this.catPos.copy(pushTowardLobby);
    }

    // Update Street Gangster Minu & Girlfriend Cat Lulza
    this.minu.update(dt, this.catPos);
    this.lulza.update(dt, this.catPos);
  }

  private tryJump() {
    if (this.airJailRemaining > 0) return;

    // Release from sit/loaf/knead/wall-stare
    if (this.sitTargetPos || this.wallStareTimer > 0 || this.actionState === 'knead') {
      this.sitTargetPos = null;
      this.sittingSpotId = null;
      this.wallStareTimer = 0;
      if (this.actionState === 'knead') this.actionState = 'idle';
      this.audio.setPurring(false);
    }

    // Curtain Climb during Zoomies or Sprint!
    if (this.zoomiesActive || this.zoomiesMeter > 55) {
      for (const c of this.apartment.curtains) {
        if (Math.hypot(this.catPos.x - c.pos.x, this.catPos.z - c.pos.z) < 0.85) {
          this.activeCurtainId = c.id;
          this.curtainTimer = 2.1;
          this.stats.curtainsClimbed += 1;
          void this.audio.playSlot('zoomies_yowl');
          this.registerChaos(30, 'curtain_climb');
          if (this.phase === 'chaos') {
            this.drainHoomanEnergy(15, 'Shruti', 'NOT THE FAIRY CURTAINS BINZIE!!');
          }
          return;
        }
      }
    }

    if (this.bestJumpPlatform) {
      this.jumpArcActive = true;
      this.jumpT = 0;
      this.jumpStart.copy(this.catPos);
      this.jumpEnd.set(
        THREE.MathUtils.clamp(
          this.catPos.x + Math.sin(this.catYaw) * 0.65,
          this.bestJumpPlatform.minX + 0.16,
          this.bestJumpPlatform.maxX - 0.16,
        ),
        this.bestJumpPlatform.y,
        THREE.MathUtils.clamp(
          this.catPos.z + Math.cos(this.catYaw) * 0.65,
          this.bestJumpPlatform.minZ + 0.16,
          this.bestJumpPlatform.maxZ - 0.16,
        ),
      );
      const safeJumpEnd = this.resolveWallCollision(this.catPos, this.jumpEnd, 0.15, this.jumpEnd.y);
      this.jumpEnd.x = safeJumpEnd.x;
      this.jumpEnd.z = safeJumpEnd.z;
      this.jumpDuration = 0.38;
      this.jumpPeak = Math.max(0.35, (this.jumpEnd.y - this.jumpStart.y) * 0.45 + 0.3);
      this.grounded = false;
      this.pounceCharge = 0;
      return;
    }

    if (this.grounded) {
      this.grounded = false;
      if (this.catnipRemaining > 0) {
        this.catVel.y = 6.1;
      } else {
        this.catVel.y = this.keys.has('KeyC') || this.virtualInput.crouch ? 5.6 : 4.55;
      }
    }
  }

  private tryInteract() {
    if (this.airJailRemaining > 0 || this.elevatorAnim.active) return;

    // 0. If already loafing on Atharva's open laptop -> Mash Keyboard Keys!
    if (this.sittingSpotId === 'sofa_laptop' && this.sitTargetPos) {
      this.audio.playKeyboardMash();
      this.pushBubble('Brownie', 'asdfjkl;;;binzie!!');
      this.drainHoomanEnergy(8, 'Atharva', 'HEY!! Stop typing gibberish into my terminal!!');
      this.registerChaos(18, 'laptop_mash');
      this.emitHud();
      return;
    }

    // 0.5 Handle Caught Live Pigeon in Mouth (Gift to Minu / Lulza / Hooman / Hoard / Release)
    if (this.caughtPigeonActor) {
      // Offer live pigeon gift to Street Gangster Minu
      if (this.minu.root.position.distanceTo(this.catPos) < 2.05) {
        const p = this.caughtPigeonActor;
        p.timer = 16.0;
        this.caughtPigeonActor = null;
        this.caughtPigeonGroup.visible = false;
        this.alleyRespect = true;
        this.minu.crushEarned = true;
        this.minu.triggerCrushReact();
        this.catnipRemaining = Math.max(this.catnipRemaining, 14);
        this.zoomiesMeter = 100;
        this.stats.giftsDelivered += 1;
        this.audio.playLootPickup();
        void this.audio.playSlot('purr_loop');
        this.pushBubble('Minu', 'A LIVE PIGEON FOR ME?! My orange gangster king!! Take this Catnip Stash!');
        this.registerChaos(150, 'alley_boss');
        this.emitHud();
        return;
      }

      // Offer live pigeon treat to Girlfriend Cat Lulza in 401
      if (this.lulza.root.position.distanceTo(this.catPos) < 1.85) {
        const p = this.caughtPigeonActor;
        p.timer = 16.0;
        this.caughtPigeonActor = null;
        this.caughtPigeonGroup.visible = false;
        this.lulzaBonded = true;
        this.lulza.nuzzled = true;
        this.lulza.triggerLoveReact();
        this.zoomiesMeter = 100;
        this.stats.giftsDelivered += 1;
        this.audio.playLootPickup();
        void this.audio.playSlot('purr_loop');
        this.pushBubble('Lulza', '*mrrp-ekekek!* (Lulza swoons over Brownie’s hunting trophy!)');
        this.registerChaos(110, 'lulza_date');
        this.emitHud();
        return;
      }

      // Deliver Live Pigeon Gift at Atharva or Shruti's feet!
      for (const h of this.hoomans) {
        if (h.root.position.distanceTo(this.catPos) < 2.2) {
          const p = this.caughtPigeonActor;
          p.group.visible = true;
          p.group.position.copy(this.catPos);
          p.hunted = false;
          p.timer = 9.0;
          this.caughtPigeonActor = null;
          this.caughtPigeonGroup.visible = false;
          this.spawnFeathers(this.catPos, 12);
          this.stats.giftsDelivered += 1;
          this.audio.playPigeonFlutter();
          void this.audio.playSlot('zoomies_yowl');
          h.triggerShaken(2.6);
          this.drainHoomanEnergy(24, h.id, `AAAHHH!! WHY DID BINZIE DROP A LIVE PIGEON AT MY FEET?!`);
          this.registerChaos(90, 'pigeon_gift');
          this.emitHud();
          return;
        }
      }

      // Stash Pigeon Trophy at Bedroom Secret Hoard
      if (
        Math.abs(this.catPos.y) < 0.5 &&
        Math.hypot(this.catPos.x - 0.18, this.catPos.z - -9.55) < 1.05
      ) {
        this.caughtPigeonActor.timer = 15.0;
        this.caughtPigeonActor = null;
        this.caughtPigeonGroup.visible = false;
        this.hoardCount += 1;
        this.stats.hoardStashed += 1;
        this.audio.playLootPickup();
        this.pushBubble('Brownie', `Stashed pigeon prize on Secret Hoard! (${this.hoardCount} treasures)`);
        this.registerChaos(65, 'hoard_collector');
        this.emitHud();
        return;
      }

      // Allow elevator / doors even with pigeon in mouth!
      const nearZone = this.findNearbyInteractiveZone();
      if (
        nearZone &&
        (nearZone.id.startsWith('elevator_') || nearZone.id === 'front_door')
      ) {
        this.activateInteractiveZone(nearZone);
        return;
      }

      // Otherwise release pigeon cleanly right here
      const p = this.caughtPigeonActor;
      p.group.visible = true;
      p.group.position.copy(this.catPos);
      p.hunted = false;
      p.timer = 8.5;
      this.caughtPigeonActor = null;
      this.caughtPigeonGroup.visible = false;
      this.audio.playPigeonFlutter();
      this.pushBubble('Brownie', 'Let the pigeon flap free!');
      this.emitHud();
      return;
    }

    // 1. Stalk & Catch / Attack Nearby Pigeon!
    const nearbyPigeon = this.findNearbyActivePigeon();
    if (nearbyPigeon) {
      const crouching = this.keys.has('KeyC') || this.virtualInput.crouch;
      if ((crouching || !this.grounded) && !this.carryingPropId) {
        this.catchPigeon(nearbyPigeon);
      } else {
        this.attackPigeon(nearbyPigeon);
      }
      return;
    }

    // 2. Back-Jump Shoulder Goblin on Atharva, Shruti, Neighbor 402, Neighbor 401, or Watchman Tiwari!
    const allHumans: Array<HoomanNPC | NeighborNPC | WatchmanNPC> = [
      ...this.hoomans,
      this.neighbor402,
      this.neighbor401,
      this.watchman,
    ];
    for (const h of allHumans) {
      if (Math.abs(h.root.position.y - this.catPos.y) > 1.8) continue;
      if ('mode' in h && (h.mode === 'sleeping' || h.mode === 'shaken')) continue;
      const dist = h.root.position.distanceTo(this.catPos);
      if (dist < 1.45) {
        const behind = _v1.set(-Math.sin(h.root.rotation.y), 0, -Math.cos(h.root.rotation.y));
        const toCat = _v2.copy(this.catPos).sub(h.root.position).normalize();
        if (behind.dot(toCat) > 0.1 || dist < 0.95) {
          this.goblinTarget = h;
          this.goblinTimer = 2.4;
          this.stats.backJumps += 1;
          h.triggerShaken(2.5);
          void this.audio.playSlot('zoomies_yowl');
          if (h.id === 'Neighbor 402') {
            this.pushBubble('Neighbor 402', 'ARRE!! THIS ORANGE DEMON IS ON MY BACK!!');
            if (this.phase === 'chaos') {
              this.drainHoomanEnergy(14, 'Shruti', 'Did Binzie just jump onto Neighbor Verma?!');
            }
            this.addNeighborAnnoyance(38);
          } else if (h.id === 'Neighbor 401') {
            this.pushBubble('Neighbor 401', 'AAAH!! GET THIS GINGER GREMLIN OFF MY SHOULDERS!!');
            if (this.phase === 'chaos') {
              this.drainHoomanEnergy(14, 'Atharva', 'Binzie ambushed Riya in 401?!');
            }
            this.addNeighborAnnoyance(35);
          } else if (h.id === 'Watchman') {
            this.audio.playWatchmanWhistle();
            this.pushBubble('Watchman', 'ARRE BAAP RE!! ORANGE TIGER ON MY SHOULDERS!!');
          } else {
            this.drainHoomanEnergy(18, h.id, `${h.id === 'Atharva' ? 'OW!!' : 'AAAH!!'} BINZIE GET OFF MY BACK!!`);
          }
          this.registerChaos(40, 'back_jump');
          return;
        }
      }
    }

    // 3. Interactive Apartment Toys, Elevator, Scratch Spots, Water, Hoard, Minu, Lulza & Neighbor Doorbells
    const zone = this.findNearbyInteractiveZone();
    if (zone) {
      this.activateInteractiveZone(zone);
      return;
    }

    // 3.5 Sit/Loaf in special spots (Pink Bucket, Cardboard Box, Vessel Sink, Laptop, Beanbag, Bed)
    for (const spot of this.apartment.sitSpots) {
      if (spot.pos.distanceTo(this.catPos) < 0.85) {
        this.sitTargetPos = spot.pos.clone();
        this.sittingSpotId = spot.id;
        this.catYaw = spot.lookYaw;
        this.actionState = spot.mode;
        this.sitTimer = 0;
        void this.audio.playSlot('greeting_trill');

        if (spot.isLaptop) {
          this.stats.laptopLoafs += 1;
          this.audio.playKeyboardMash();
          this.drainHoomanEnergy(14, 'Atharva', 'Binzie please, I am literally typing on that!');
          this.registerChaos(25, 'laptop_mash');
        } else if (spot.id === 'cardboard_box') {
          this.stats.bucketSits += 1;
          this.pushBubble('Brownie', 'Cardboard Delivery Tank claimed!');
          this.registerChaos(25, 'cardboard_tank');
        } else if (spot.id === 'pink_bucket' || spot.id === 'vessel_sink') {
          this.stats.bucketSits += 1;
          this.drainHoomanEnergy(12, 'Shruti', 'If he fits, he sits... in the sink again.');
          this.registerChaos(25);
        } else {
          this.registerChaos(15);
        }
        this.emitHud();
        return;
      }
    }

    // 4. Drop or Tribute/Stash carried prop (Paper Ball / Brass Whistle / Keychain / Bottle Cap)
    if (this.carryingPropId) {
      const prop = this.apartment.props.find((p) => p.id === this.carryingPropId);
      this.carryingPropId = null;
      if (prop) {
        // Check Secret Hoard first
        if (
          Math.abs(this.catPos.y) < 0.5 &&
          Math.hypot(this.catPos.x - 0.18, this.catPos.z - -9.55) < 1.05
        ) {
          prop.vel.set(0, 0, 0);
          prop.pos.set(
            0.18 + (Math.random() - 0.5) * 0.24,
            0.05,
            -9.55 + (Math.random() - 0.5) * 0.24,
          );
          prop.mesh.position.copy(prop.pos);
          if (!this.stashedHoardIds.has(prop.id)) {
            this.stashedHoardIds.add(prop.id);
            this.hoardCount += 1;
            this.stats.hoardStashed += 1;
          }
          if (prop.isPaperBall) this.stats.paperBallDelivered = true;
          this.audio.playLootPickup();
          this.pushBubble('Brownie', `Stashed ${prop.label} on Bedroom Hoard! (${this.hoardCount} treasures)`);
          this.registerChaos(55, 'hoard_collector');
          this.emitHud();
          return;
        }

        // Check Gift to Street Gangster Minu
        if (this.minu.root.position.distanceTo(this.catPos) < 2.05 && !prop.isPaperBall) {
          this.alleyRespect = true;
          this.minu.crushEarned = true;
          this.minu.triggerCrushReact();
          this.catnipRemaining = Math.max(this.catnipRemaining, 14);
          this.zoomiesMeter = 100;
          prop.vel.set(0, 0, 0);
          prop.pos.set(-16.95, -11.42, -2.35);
          prop.mesh.position.copy(prop.pos);
          this.audio.playLootPickup();
          void this.audio.playSlot('purr_loop');
          this.pushBubble('Minu', `Aww you brought me ${prop.label}?! Heart melted! Take Catnip Boost!`);
          this.registerChaos(120, 'alley_boss');
          this.emitHud();
          return;
        }

        // Check Romantic Gift to Girlfriend Cat Lulza in Flat 401
        if (this.lulza.root.position.distanceTo(this.catPos) < 1.85 && !prop.isPaperBall) {
          this.lulzaBonded = true;
          this.lulza.nuzzled = true;
          this.lulza.triggerLoveReact();
          this.zoomiesMeter = 100;
          prop.vel.set(0, 0, 0);
          prop.pos.set(-7.5, 0.06, -5.25);
          prop.mesh.position.copy(prop.pos);
          this.audio.playLootPickup();
          void this.audio.playSlot('purr_loop');
          this.pushBubble('Lulza', `*purr-trill!* (Lulza loves your ${prop.label} gift!)`);
          this.registerChaos(95, 'lulza_date');
          this.emitHud();
          return;
        }

        prop.vel.set(Math.sin(this.catYaw) * 1.4, 1.2, Math.cos(this.catYaw) * 1.4);
        for (const h of this.hoomans) {
          if (h.root.position.distanceTo(this.catPos) < 1.8) {
            this.stats.paperBallDelivered = true;
            this.drainHoomanEnergy(9, h.id, `Aww he brought ${prop.label}... wait where did he get that?!`);
            this.registerChaos(25);
          }
        }
      }
      return;
    }

    // 5. Swat nearby prop or steal/carry Paper Ball / Whistle / Keychain / Bottle Cap!
    let closestProp = null as (typeof this.apartment.props)[number] | null;
    let bestD = 0.95;
    for (const prop of this.apartment.props) {
      if (Math.abs(prop.pos.y - this.catPos.y) > 0.75) continue;
      const d = prop.pos.distanceTo(this.catPos);
      if (d < bestD) {
        bestD = d;
        closestProp = prop;
      }
    }
    if (closestProp) {
      const crouching = this.keys.has('KeyC') || this.virtualInput.crouch;
      if (closestProp.canCarry && (!closestProp.isPaperBall || crouching)) {
        this.carryingPropId = closestProp.id;
        this.audio.playLootPickup();
        void this.audio.playSlot('greeting_trill');
        if (closestProp.id === 'g_whistle') {
          this.audio.playWatchmanWhistle();
          this.pushBubble('Watchman', 'HEY!! MY BRASS SECURITY WHISTLE!!');
        } else if (closestProp.id === 'g_fried_fish') {
          this.registerChaos(75, 'fried_fish_heist');
          this.pushBubble('Brownie', 'Stole Golden Fried Fish from Raju Chai Tapri!!');
        } else {
          this.pushBubble('Brownie', `Carrying ${closestProp.label} in mouth!`);
        }
      } else {
        const dir = _v1.set(Math.sin(this.catYaw), 0, Math.cos(this.catYaw));
        this.batProp(closestProp, dir, 3.4);
        if (closestProp.isPaperBall) {
          this.carryingPropId = closestProp.id;
          this.pushBubble('Brownie', 'Carrying Paper Ball in mouth!');
        }
      }
    }
  }

  private findNearbyInteractiveZone() {
    for (const z of this.apartment.interactiveZones) {
      if (z.id === 'elevator_ride_4' && (this.elevatorFloor !== 4 || this.elevatorAnim.active || this.catPos.z > -2.65)) {
        continue;
      }
      if (z.id === 'elevator_ride_g' && (this.elevatorFloor !== 0 || this.elevatorAnim.active || this.catPos.z > -2.65)) {
        continue;
      }
      if (z.id === 'steal_delivery' && !this.deliveryActive) {
        continue;
      }
      if (z.id === 'yank_laundry' && this.laundryYanked) {
        continue;
      }
      if (z.id === 'sink_tap') {
        const horiz = Math.hypot(this.catPos.x - z.pos.x, this.catPos.z - z.pos.z);
        const vert = Math.abs(this.catPos.y - z.pos.y);
        if (horiz < 0.78 && vert < 0.95) {
          if (this.sittingSpotId === 'vessel_sink' || !this.sinkTapOn) {
            return z;
          }
        }
        continue;
      }
      if (z.pos.distanceTo(this.catPos) < z.radius) {
        return z;
      }
    }
    return null;
  }

  private activateInteractiveZone(zone: (typeof this.apartment.interactiveZones)[number]) {
    switch (zone.id) {
      case 'cat_tv': {
        this.catTvOn = !this.catTvOn;
        const tex = this.catTvOn ? this.textures.tvScreenCatTv : this.textures.tvScreenMusic;
        this.apartment.tvScreenMat.map = tex;
        this.apartment.tvScreenMat.emissiveMap = tex;
        this.apartment.tvScreenMat.needsUpdate = true;
        this.audio.playSwitchClick();
        if (this.catTvOn) {
          void this.audio.playSlot('chirp_ekekek');
          this.pushBubble('Brownie', 'BIRBS ON CAT TV!! ek-ek-ek!');
          this.drainHoomanEnergy(10, 'Atharva', 'Did Binzie just step on the remote and put Birb TV on?!');
          this.registerChaos(25, 'cat_tv');
        } else {
          this.pushBubble('Brownie', 'Turned TV back to Lo-Fi.');
        }
        break;
      }
      case 'laser_pointer': {
        this.laserActive = true;
        this.laserTimer = 25;
        this.laserTarget.set(0.1, 0.025, 0.25);
        this.apartment.laserDotMesh.visible = true;
        this.audio.playSwitchClick();
        void this.audio.playSlot('chirp_ekekek');
        this.pushBubble('Brownie', 'RED DOT ACTIVATED! CHASE IT!');
        this.registerChaos(15);
        break;
      }
      case 'catnip_pouch': {
        this.catnipRemaining = 14;
        this.zoomiesMeter = 100;
        this.apartment.catnipJarMesh.rotation.z = 0.28;
        void this.audio.playSlot('zoomies_yowl');
        this.pushBubble('Brownie', 'SILVERVINE CATNIP OVERDRIVE!!');
        this.drainHoomanEnergy(14, 'Shruti', 'HE GOT INTO THE SECRET CATNIP JAR ON THE COUNTER!');
        this.registerChaos(35, 'catnip_mode');
        break;
      }
      case 'tp_roll': {
        if (this.tpShreds < 6) {
          this.tpShreds += 1;
          this.stats.tpShredded += 1;
          this.apartment.tpRollMesh.rotation.y += 1.4;
          const shrink = Math.max(0.45, 1 - this.tpShreds * 0.08);
          this.apartment.tpRollMesh.scale.set(shrink, 1, shrink);

          const shred = new THREE.Mesh(this.tpRibbonGeo, this.tpRibbonMat);
          shred.position.set(
            -0.06 - Math.random() * 0.35,
            this.tpShreds * 0.004,
            -0.05 + (Math.random() - 0.5) * 0.45,
          );
          shred.rotation.y = (Math.random() - 0.5) * 2.2;
          this.apartment.tpRibbonGroup.add(shred);

          this.audio.playPaperShred();
          this.pushBubble('Brownie', `TP Roll Unspooled! (${this.tpShreds}/6)`);
          this.drainHoomanEnergy(10, 'Shruti', 'NOOO THE TOILET PAPER ROLL!!');
          this.registerChaos(25, 'tp_shred');
        } else {
          this.audio.playPaperShred();
          this.pushBubble('Brownie', 'Toilet paper completely demolished!');
        }
        break;
      }
      case 'sink_tap': {
        this.sinkTapOn = !this.sinkTapOn;
        this.apartment.sinkWaterStream.visible = this.sinkTapOn;
        this.audio.playWaterSplash();
        if (this.sinkTapOn) {
          this.pushBubble('Brownie', '*bats shiny water stream*');
          this.drainHoomanEnergy(9, 'Atharva', 'Who turned the hallway sink tap back on?!');
          this.registerChaos(20, 'sink_splash');
        } else {
          this.pushBubble('Brownie', 'Turned off tap.');
        }
        break;
      }
      case 'switch_living':
      case 'switch_kitchen':
      case 'switch_study': {
        const roomKey =
          zone.id === 'switch_living' ? 'living' : zone.id === 'switch_kitchen' ? 'kitchen' : 'study';
        this.roomLightsDimmed[roomKey] = !this.roomLightsDimmed[roomKey];
        this.apartment.setRoomLightDimmed(roomKey, this.roomLightsDimmed[roomKey]);
        this.audio.playSwitchClick();
        this.stats.switchesFlipped += 1;
        this.pushBubble(
          'Brownie',
          `*flickers ${roomKey} lights ${this.roomLightsDimmed[roomKey] ? 'OFF' : 'ON'}*`,
        );
        this.drainHoomanEnergy(9, 'Atharva', 'Binzie stop flicking the light switches!!');
        this.registerChaos(20, 'switch_troll');
        break;
      }
      case 'front_door': {
        this.frontDoorManuallyOpen = !this.frontDoorManuallyOpen;
        this.audio.playSwitchClick();
        if (this.frontDoorManuallyOpen) {
          this.pushBubble('Brownie', 'Door pawed wide open! Time to prowl Floor 4 Corridor!');
          this.registerChaos(25, 'corridor_escape');
        } else {
          this.pushBubble('Brownie', 'Nudged the front door shut.');
        }
        break;
      }
      case 'doorbell_402': {
        void this.audio.playDoorAlert();
        void this.audio.playSlot('zoomies_yowl');
        this.neighbor402.onDoorbellRung();
        this.pushBubble('Brownie', '*BOOPED 402 DOORBELL — DOOR OPENED!*');
        this.pushBubble('Neighbor 402', "Who's ringing my bell?! Wait—4B's orange menace?!");
        if (this.phase === 'chaos') {
          this.drainHoomanEnergy(12, 'Atharva', 'He opened Neighbor 402 door!! Stop him!!');
        }
        this.addNeighborAnnoyance(22);
        this.registerChaos(45, 'doorbell_prank');
        break;
      }
      case 'doorbell_401': {
        void this.audio.playDoorAlert();
        void this.audio.playSlot('zoomies_yowl');
        this.neighbor401.onDoorbellRung();
        this.pushBubble('Brownie', '*BOOPED 401 DOORBELL — RIYA OPENED HER DOOR!*');
        this.pushBubble('Neighbor 401', 'Who is at my door? Oh no, 4B’s tabby troublemaker—Lulza, behave!!');
        if (this.phase === 'chaos') {
          this.drainHoomanEnergy(12, 'Shruti', 'Binzie just ding-dong ditched Neighbor 401!!');
        }
        this.addNeighborAnnoyance(22);
        this.registerChaos(45, 'invade_401');
        break;
      }
      case 'scratch_post':
      case 'scratch_living_sofa':
      case 'scratch_402_sofa':
      case 'scratch_401_sofa': {
        this.actionOverride = 'scratch';
        this.actionOverrideTimer = 1.65;
        this.audio.playPaperShred();
        this.stats.thingsScratched += 1;
        this.zoomiesMeter = Math.min(100, this.zoomiesMeter + 20);
        if (zone.id === 'scratch_402_sofa') {
          this.pushBubble('Brownie', '*shreds Neighbor 402 emerald velvet sofa*');
          this.pushBubble('Neighbor 402', 'NOT MY IMPORTED VELVET COUCH!!');
          this.addNeighborAnnoyance(35);
          this.registerChaos(45, 'scratch_furniture');
        } else if (zone.id === 'scratch_401_sofa') {
          this.pushBubble('Brownie', '*shreds Neighbor 401 coral velvet sofa*');
          this.pushBubble('Neighbor 401', 'NOOO NOT MY CORAL VELVET SOFA!!');
          this.addNeighborAnnoyance(32);
          this.registerChaos(45, 'scratch_furniture');
        } else if (zone.id === 'scratch_living_sofa') {
          this.pushBubble('Brownie', '*rakes claws down the mustard sofa*');
          if (this.phase === 'chaos') {
            this.drainHoomanEnergy(11, 'Shruti', 'NOOO use the scratching post, NOT the mustard sofa!!');
          }
          this.registerChaos(30, 'scratch_furniture');
        } else {
          void this.audio.playSlot('purr_loop');
          this.pushBubble('Brownie', '*happy sisal post claw stretch*');
          this.registerChaos(25, 'scratch_furniture');
        }
        break;
      }
      case 'drink_water_bowl': {
        this.actionOverride = 'drink';
        this.actionOverrideTimer = 1.8;
        this.audio.playWaterSplash();
        this.zoomiesMeter = 100;
        this.patienceWarning = Math.max(0, this.patienceWarning - 15);
        this.pushBubble('Brownie', '*mlem mlem mlem — zoomies refilled!*');
        this.registerChaos(15);
        break;
      }
      case 'courtyard_milk': {
        this.actionOverride = 'drink';
        this.actionOverrideTimer = 1.8;
        this.audio.playWaterSplash();
        this.zoomiesMeter = 100;
        this.catnipRemaining = Math.max(this.catnipRemaining, 8);
        this.pushBubble('Brownie', '*mlem mlem — warm courtyard milk saucer boost!*');
        this.registerChaos(30);
        break;
      }
      case 'neighbor_goldfish': {
        this.actionOverride = 'pounce_attack';
        this.actionOverrideTimer = 0.7;
        this.audio.playWaterSplash();
        void this.audio.playSlot('chirp_ekekek');
        this.pushBubble('Brownie', '*SPLASHES NEIGHBOR 402 GOLDFISH BOWL!!*');
        this.pushBubble('Neighbor 402', 'MY GOLDFISH GUPPY!! SOMEBODY CALL SECURITY!!');
        if (this.phase === 'chaos') {
          this.drainHoomanEnergy(16, 'Atharva', 'BINZIE LEAVE VERMA UNCLE GOLDFISH ALONE!!');
        }
        this.addNeighborAnnoyance(40);
        this.registerChaos(55, 'invade_402');
        break;
      }
      case 'sky_lookout': {
        void this.audio.playSlot('greeting_trill');
        this.pushBubble('Brownie', '*watches midnight street cars & neon city lights below*');
        this.registerChaos(15);
        break;
      }
      case 'elevator_call_4': {
        if (this.elevatorAnim.active) break;
        this.elevatorFloor = 4;
        this.apartment.elevatorCab.position.y = 0;
        this.elevatorDoorOpenForFloor = 4;
        this.elevatorDoorOpenTimer = 12.0;
        this.audio.playElevatorDing();
        this.pushBubble('Brownie', 'Elevator arrived at Floor 4! Step inside & ride down!');
        break;
      }
      case 'elevator_call_g': {
        if (this.elevatorAnim.active) break;
        this.elevatorFloor = 0;
        this.apartment.elevatorCab.position.y = -11.5;
        this.elevatorDoorOpenForFloor = 0;
        this.elevatorDoorOpenTimer = 12.0;
        this.audio.playElevatorDing();
        this.pushBubble('Brownie', 'Elevator arrived at Ground Lobby! Step inside!');
        break;
      }
      case 'elevator_ride_4': {
        if (this.elevatorAnim.active) break;
        this.elevatorDoorOpenForFloor = null;
        this.elevatorAnim = { active: true, targetFloor: 0, fromY: 0, toY: -11.5, t: 0 };
        this.audio.playElevatorHum();
        this.pushBubble('Brownie', 'Riding elevator down to Ground Floor Lobby...');
        break;
      }
      case 'elevator_ride_g': {
        if (this.elevatorAnim.active) break;
        this.elevatorDoorOpenForFloor = null;
        this.elevatorAnim = { active: true, targetFloor: 4, fromY: -11.5, toY: 0, t: 0 };
        this.audio.playElevatorHum();
        this.pushBubble('Brownie', 'Riding elevator back up to Floor 4!');
        break;
      }
      case 'greet_minu': {
        this.minu.triggerCrushReact();
        void this.audio.playSlot('greeting_trill');
        if (this.alleyRespect) {
          this.pushBubble('Minu', 'You run these streets now, handsome ginger boss. Any pigeon or tapri snack is yours!');
        } else {
          this.pushBubble(
            'Minu',
            'Pspsps orange cutie! Bring me a Live Pigeon, Tapri Fried Fish, Whistle, or Shiny Keychain!',
          );
        }
        break;
      }
      case 'greet_lulza': {
        this.lulzaBonded = true;
        this.lulza.nuzzled = true;
        this.lulza.triggerLoveReact();
        this.zoomiesMeter = Math.min(100, this.zoomiesMeter + 35);
        void this.audio.playSlot('purr_loop');
        void this.audio.playSlot('greeting_trill');
        this.pushBubble('Brownie', '*nuzzles Lulza’s calico cheek & slow-blinks*');
        this.pushBubble('Lulza', '*mrrp-trill!* (purring happily beside her orange boyfriend)');
        this.registerChaos(80, 'lulza_date');
        break;
      }
      case 'secret_hoard': {
        this.pushBubble(
          'Brownie',
          `Secret Bedroom Hoard (${this.hoardCount} stashed). Bring Paper Ball, Milk Packet, Fried Fish, Whistle or Pigeons here!`,
        );
        break;
      }
      case 'taunt_401': {
        this.sheruBarkTimer = 3.2;
        this.audio.playDogBark();
        void this.audio.playSlot('zoomies_yowl');
        this.pushBubble('Brownie', '*bap-bap near Sheru’s cushion* WOOF WOOF! Sheru is losing his mind in 401!');
        this.addNeighborAnnoyance(16);
        this.drainHoomanEnergy(12, 'Atharva', 'Why is 401 Sheru barking nonstop?! Binzie, come back inside!');
        this.registerChaos(40, 'taunt_401');
        break;
      }
      case 'steal_delivery': {
        if (!this.deliveryActive) break;
        this.deliveryActive = false;
        this.deliveryTimer = 36;
        this.apartment.deliveryBagGroup.visible = false;
        this.stats.deliveriesHeisted += 1;
        this.audio.playPaperShred();
        const milkProp = this.apartment.props.find((p) => p.id === 'g_milk_packet');
        if (milkProp && !this.carryingPropId && !this.caughtPigeonActor) {
          this.carryingPropId = milkProp.id;
          milkProp.pos.set(this.catPos.x, this.catPos.y + 0.1, this.catPos.z);
          milkProp.mesh.position.copy(milkProp.pos);
          this.pushBubble('Brownie', 'Ripped Blinkit bag! Carry Milk Packet to Bedroom Hoard or spill it!');
        } else {
          this.pushBubble('Brownie', 'Tore open the Blinkit bag & spilled snacks!');
        }
        this.drainHoomanEnergy(14, 'Atharva', 'HEY! BINZIE JUST RIPPED OUR BLINKIT BAG OPEN!!');
        this.registerChaos(65, 'delivery_heist');
        break;
      }
      case 'yank_laundry': {
        if (this.laundryYanked) break;
        this.laundryYanked = true;
        this.apartment.terraceLaundryGroup.position.set(-11.2, 0.04, 1.5);
        this.apartment.terraceLaundryGroup.rotation.set(Math.PI / 2, 0.3, 0);
        this.audio.playPaperShred();
        void this.audio.playSlot('greeting_trill');
        this.pushBubble('Brownie', 'YANKED THE TERRACE DUPATTAS DOWN! Instant comfy pile!');
        this.drainHoomanEnergy(15, 'Shruti', 'BINZIE PULLED ALL THE DRYING CLOTHES ONTO THE TERRACE!!');
        this.registerChaos(55, 'yank_laundry');
        break;
      }
      case 'trigger_car_alarm': {
        this.carAlarmTimer = 6.0;
        this.stats.carAlarmsTriggered += 1;
        this.audio.playCarAlarm();
        this.watchman.sendToInvestigate(new THREE.Vector3(-18.2, -11.5, 3.2), 6.5, false);
        this.pushBubble('Brownie', '*BEEP-BEEP-BEEP!* Set off the Sedan Car Alarm! Watchman Tiwari is running!');
        this.registerChaos(75, 'car_alarm');
        break;
      }
    }
    this.emitHud();
  }

  private findNearbyActivePigeon(): PigeonActor | null {
    let best: PigeonActor | null = null;
    let bestD = 1.75;
    for (const p of this.apartment.pigeons) {
      if (!p.active) continue;
      const horiz = Math.hypot(p.group.position.x - this.catPos.x, p.group.position.z - this.catPos.z);
      const vert = Math.abs(p.group.position.y - this.catPos.y);
      if (horiz < bestD && vert < 1.35) {
        bestD = horiz;
        best = p;
      }
    }
    return best;
  }

  private spawnFeathers(origin: THREE.Vector3, count: number) {
    let spawned = 0;
    for (let i = 0; i < this.feathers.length && spawned < count; i++) {
      const f = this.feathers[i];
      if (f.ttl <= 0) {
        f.mesh.visible = true;
        f.mesh.position.set(origin.x, origin.y + 0.14, origin.z);
        f.vel.set((Math.random() - 0.5) * 2.2, 0.9 + Math.random() * 1.4, (Math.random() - 0.5) * 2.2);
        f.ttl = 2.4;
        spawned += 1;
      }
    }
  }

  private catchPigeon(p: PigeonActor) {
    if (!p.active) return;
    p.active = false;
    p.hunted = true;
    p.timer = 999;
    p.group.visible = false;

    this.caughtPigeonActor = p;
    this.spawnFeathers(p.group.position, 8);
    this.stats.pigeonsCaught += 1;
    this.stats.pigeonsHunted += 1;
    this.audio.playPigeonFlutter();
    void this.audio.playSlot('chirp_ekekek');
    this.pushBubble('Brownie', 'CAUGHT A LIVE PIGEON! Drop at Atharva/Shruti feet or gift to Minu / Lulza!');
    this.registerChaos(55, 'pigeon_hunt');
    this.emitHud();
  }

  private attackPigeon(p: PigeonActor) {
    if (!p.active) return;
    p.active = false;
    p.hunted = true;
    p.timer = 14.0;

    // Face pigeon & pounce lunge
    const dx = p.group.position.x - this.catPos.x;
    const dz = p.group.position.z - this.catPos.z;
    if (Math.hypot(dx, dz) > 0.02) {
      this.catYaw = Math.atan2(dx, dz);
    }
    const lungeTarget = this.resolveWallCollision(
      this.catPos,
      _v1.set(this.catPos.x + Math.sin(this.catYaw) * 0.55, this.catPos.y, this.catPos.z + Math.cos(this.catYaw) * 0.55),
      0.15,
    );
    this.catPos.x = lungeTarget.x;
    this.catPos.z = lungeTarget.z;
    this.actionOverride = 'pounce_attack';
    this.actionOverrideTimer = 0.45;

    this.spawnFeathers(p.group.position, 12);

    this.stats.pigeonsHunted += 1;
    this.audio.playPaperShred();
    void this.audio.playSlot('chirp_ekekek');
    this.pushBubble('Brownie', 'EKEKEK POUNCE!! FEATHERS EVERYWHERE!!');
    this.registerChaos(60, 'pigeon_hunt');
    if (this.phase === 'chaos') {
      this.drainHoomanEnergy(12, 'Shruti', 'BINZIE JUST AMBUSHED A PIGEON!!');
    }
    this.emitHud();
  }

  private registerChaos(points: number, bucketId?: string) {
    if (this.comboTimer > 0) {
      this.comboCount += 1;
    } else {
      this.comboCount = 1;
    }
    this.comboTimer = 12.0;
    const mult = Math.min(4, this.comboCount);
    this.stats.chaosScore += points * mult;
    if (this.comboCount > this.stats.maxCombo) {
      this.stats.maxCombo = this.comboCount;
    }
    if (bucketId) {
      this.bucketMap[bucketId] = true;
    }
  }

  private tryLoafOrWallStare() {
    if (this.actionState === 'loaf') {
      this.actionState = 'idle';
      this.audio.setPurring(false);
      return;
    }
    // Check if facing very close to a wall -> 1-Braincell Wall Stare!
    const ahead = _v1.set(this.catPos.x + Math.sin(this.catYaw) * 0.45, this.catPos.y, this.catPos.z + Math.cos(this.catYaw) * 0.45);
    const resolved = this.resolveWallCollision(this.catPos, ahead);
    if (resolved.distanceTo(ahead) > 0.08) {
      this.wallStareTimer = 3.4;
      this.actionState = 'wall_stare';
      this.pushBubble('Brownie', '*stares blankly at wall ghost*');
      if (this.phase === 'chaos') {
        const h = this.hoomans[1];
        h.sendToInvestigate(this.catPos.clone(), 3.8, false);
        this.drainHoomanEnergy(8, 'Shruti', 'Atharva why is he staring at the wall again?!');
      }
      return;
    }
    this.actionState = 'loaf';
    void this.audio.playSlot('greeting_trill');
  }

  private batProp(prop: (typeof this.apartment.props)[number], dir: THREE.Vector3, force: number) {
    prop.vel.set(dir.x * force * 0.85, 1.55, dir.z * force * 0.85);
    prop.angVel.set((Math.random() - 0.5) * 9, 0, (Math.random() - 0.5) * 9);
    this.zoomiesMeter = Math.min(100, this.zoomiesMeter + 12);
    if (prop.id === 'jingle_ball') {
      this.audio.playBellJingle();
    } else {
      this.audio.playPropClatter(prop.loudness);
    }
  }

  private onPropKnocked(prop: (typeof this.apartment.props)[number]) {
    this.stats.itemsKnocked += 1;
    this.registerChaos(20);
    if (prop.id.startsWith('n402_')) {
      this.pushBubble('Neighbor 402', `NOOO! MY ${prop.label.toUpperCase()}!!`);
      if (this.phase === 'chaos') {
        this.drainHoomanEnergy(10, 'Atharva', `Binzie broke Neighbor 402's ${prop.label}!!`);
      }
      this.addNeighborAnnoyance(30);
      return;
    }
    if (prop.id.startsWith('n401_')) {
      this.pushBubble('Neighbor 401', `HEY!! MY ${prop.label.toUpperCase()}!!`);
      if (this.phase === 'chaos') {
        this.drainHoomanEnergy(10, 'Shruti', `Binzie knocked over Neighbor 401's ${prop.label}!!`);
      }
      this.addNeighborAnnoyance(28);
      return;
    }
    if (prop.id === 'g_whistle' || prop.id === 'g_keychain') {
      this.pushBubble('Watchman', `Hey!! Leave the ${prop.label} alone!!`);
      return;
    }
    if (this.phase === 'chaos') {
      const h = this.hoomans[Math.floor(Math.random() * this.hoomans.length)];
      h.sendToInvestigate(prop.pos.clone(), 4.2, false);
      this.drainHoomanEnergy(8, h.id, `BINZIE! My ${prop.label}!!`);
    } else if (this.phase === 'heist') {
      this.addNoise(prop.loudness * 26);
    }
  }

  private addNeighborAnnoyance(delta: number) {
    if (this.distractionTimer > 0) return;
    this.neighborAnnoyance = Math.min(100, this.neighborAnnoyance + delta);
    if (this.neighborAnnoyance >= 100) {
      this.neighborAnnoyance = 0;
      this.distractionTimer = 16.0;
      this.stats.escalationsTriggered += 1;
      this.frontDoorManuallyOpen = true;
      this.audio.playDoorKnock();
      void this.audio.playSlot('grumpy_mumble');
      this.neighbor402.startComplainAt404(16.0);
      this.hoomans[0].sendToFrontDoorDistraction(16.0);
      this.pushBubble('Neighbor 402', '*KNOCK KNOCK!* ATHARVA!! YOUR CAT DESTROYED 402!!');
      this.pushBubble('Atharva', 'Answering 402 at the front door! (16s Distraction Window)');
      this.registerChaos(80, 'neighbor_escalation');
    }
  }

  private drainHoomanEnergy(amount: number, speaker: 'Atharva' | 'Shruti', line: string) {
    if (this.phase !== 'chaos') return;
    this.hoomanEnergy = Math.max(0, this.hoomanEnergy - amount);
    this.patienceWarning = Math.min(100, this.patienceWarning + amount * 1.45);
    this.pushBubble(speaker, line);

    if (this.patienceWarning >= 99 && this.hoomanEnergy > 8) {
      // Air Jail!
      this.patienceWarning = 25;
      this.airJailRemaining = 6.5;
      this.catPos.set(3.85, 0, 0.25); // placed gently onto balcony timeout
      void this.audio.playSlot('grumpy_mumble');
      this.pushBubble('Atharva', '6 seconds of Balcony Air Jail for that!');
    }

    if (this.hoomanEnergy <= 0) {
      this.phase = 'transitioning';
      this.pushBubble('Atharva', 'I cannot keep my eyes open... heading to the bedroom.');
      this.hoomans[0].setSleeping(ATHARVA_BED_POS, 0, false);
      this.hoomans[1].setSleeping(SHRUTI_BED_POS, 0, false);
    }
  }

  private addNoise(amount: number) {
    if (this.phase !== 'heist') return;
    this.noiseLevel = Math.min(100, this.noiseLevel + amount);
    if (this.noiseLevel >= 78) {
      const patroller = this.hoomans[Math.floor(Math.random() * this.hoomans.length)];
      if (patroller.mode === 'sleeping') {
        patroller.sendToInvestigate(this.catPos.clone(), 8.5, true);
        this.pushBubble(patroller.id, 'Huh?! Binzie what was that noise?!');
      }
    }
  }

  private checkSwivelChairSpin() {
    const chair = this.apartment.swivelChair;
    if (Math.hypot(this.catPos.x - chair.pos.x, this.catPos.z - chair.pos.z) < 0.45 && Math.abs(this.catPos.y - chair.seatTopY) < 0.15) {
      chair.spinVel = 8.5;
      if (this.phase === 'chaos') {
        this.drainHoomanEnergy(6, 'Atharva', 'Stop launching off my office chair!');
      }
    }
  }

  private isBrownieHidden(): boolean {
    if (this.actionState === 'loaf' || this.actionState === 'crouch' || this.actionState === 'peek') {
      for (const hs of this.apartment.hideSpots) {
        if (hs.pos.distanceTo(this.catPos) <= hs.radius) return true;
      }
    }
    return false;
  }

  private getFloorBaseY(x: number, z: number, catY: number): number {
    let bestY = -Infinity;
    const rects = this.apartment.walkableRects;
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      const minY = r.minY ?? -0.6;
      const maxY = r.maxY ?? 3.1;
      if (
        catY >= minY &&
        catY <= maxY &&
        x >= r.minX &&
        x <= r.maxX &&
        z >= r.minZ &&
        z <= r.maxZ
      ) {
        const fy = r.floorY ?? 0;
        if (fy > bestY) bestY = fy;
      }
    }
    if (bestY > -Infinity) return bestY;
    return catY < -6.0 ? -11.5 : catY > 2.6 ? 3.25 : 0;
  }

  private getSurfaceUnder(x: number, z: number, maxY: number): PlatformSurface | null {
    const baseY = this.getFloorBaseY(x, z, maxY);
    let best: PlatformSurface | null = null;
    for (const p of this.apartment.platforms) {
      if (x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ && p.y <= maxY && p.y >= baseY - 0.15) {
        if (!best || p.y > best.y) best = p;
      }
    }
    return best;
  }

  private isNearPlatformEdge(pos: THREE.Vector3, p: PlatformSurface): boolean {
    const m = 0.24;
    return (
      Math.abs(pos.x - p.minX) < m ||
      Math.abs(pos.x - p.maxX) < m ||
      Math.abs(pos.z - p.minZ) < m ||
      Math.abs(pos.z - p.maxZ) < m
    );
  }

  private findJumpTarget(maxHeightGain: number): PlatformSurface | null {
    const fx = Math.sin(this.catYaw);
    const fz = Math.cos(this.catYaw);
    let best: PlatformSurface | null = null;
    let bestScore = Infinity;

    for (const p of this.apartment.platforms) {
      const dy = p.y - this.catPos.y;
      if (dy < 0.18 || dy > maxHeightGain) continue;
      const cx = THREE.MathUtils.clamp(this.catPos.x + fx * 0.6, p.minX + 0.12, p.maxX - 0.12);
      const cz = THREE.MathUtils.clamp(this.catPos.z + fz * 0.6, p.minZ + 0.12, p.maxZ - 0.12);
      const horizDist = Math.hypot(cx - this.catPos.x, cz - this.catPos.z);
      if (horizDist > 1.35) continue;
      const dirDot = ((cx - this.catPos.x) * fx + (cz - this.catPos.z) * fz) / Math.max(0.01, horizDist);
      if (dirDot < 0.2 && horizDist > 0.35) continue;

      const score = horizDist + Math.abs(dy) * 0.5;
      if (score < bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  }

  private clampToWalkableRooms(x: number, z: number, margin = 0.04, y = this.catPos.y): { x: number; z: number } {
    const rects = this.apartment.walkableRects;
    let bestX = x;
    let bestZ = z;
    let bestD2 = Infinity;
    let matchedElevation = false;

    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      const minY = r.minY ?? -0.6;
      const maxY = r.maxY ?? 3.1;
      if (y < minY || y > maxY) continue;
      matchedElevation = true;
      const minX = r.minX + margin;
      const maxX = r.maxX - margin;
      const minZ = r.minZ + margin;
      const maxZ = r.maxZ - margin;
      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        return { x, z };
      }
      const cx = THREE.MathUtils.clamp(x, minX, maxX);
      const cz = THREE.MathUtils.clamp(z, minZ, maxZ);
      const dx = x - cx;
      const dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) {
        bestD2 = d2;
        bestX = cx;
        bestZ = cz;
      }
    }

    if (matchedElevation) return { x: bestX, z: bestZ };

    // Fallback across all rects if mid-air between strata
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      const minX = r.minX + margin;
      const maxX = r.maxX - margin;
      const minZ = r.minZ + margin;
      const maxZ = r.maxZ - margin;
      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        return { x, z };
      }
      const cx = THREE.MathUtils.clamp(x, minX, maxX);
      const cz = THREE.MathUtils.clamp(z, minZ, maxZ);
      const dx = x - cx;
      const dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) {
        bestD2 = d2;
        bestX = cx;
        bestZ = cz;
      }
    }
    return { x: bestX, z: bestZ };
  }

  private resolveWallCollision(
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius = 0.15,
    yOverride?: number,
    out: THREE.Vector3 = _colOut,
  ): THREE.Vector3 {
    const catY = yOverride ?? from.y;
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const moveDist = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(moveDist / 0.05));

    let curX = from.x;
    let curZ = from.z;

    for (let step = 1; step <= steps; step++) {
      curX += dx / steps;
      curZ += dz / steps;

      const clampedInit = this.clampToWalkableRooms(curX, curZ, 0.04, catY);
      curX = clampedInit.x;
      curZ = clampedInit.z;

      for (let iter = 0; iter < 4; iter++) {
        for (let i = 0; i < this.apartment.colliders.length; i++) {
          const c = this.apartment.colliders[i];
          if (catY >= c.maxY - 0.06 || catY + 0.26 <= c.minY) continue;

          const closestX = THREE.MathUtils.clamp(curX, c.minX, c.maxX);
          const closestZ = THREE.MathUtils.clamp(curZ, c.minZ, c.maxZ);
          const vx = curX - closestX;
          const vz = curZ - closestZ;
          const d2 = vx * vx + vz * vz;

          if (d2 > 1e-8 && d2 < radius * radius) {
            const d = Math.sqrt(d2);
            const push = radius - d;
            curX += (vx / d) * push;
            curZ += (vz / d) * push;
          } else if (d2 <= 1e-8) {
            // Center is inside AABB: bias exit toward `from` so we never pop out the opposite side of a wall
            const exitLeft = curX - (c.minX - radius);
            const exitRight = c.maxX + radius - curX;
            const exitFront = curZ - (c.minZ - radius);
            const exitBack = c.maxZ + radius - curZ;

            if (from.x <= c.minX && exitLeft <= exitRight + 0.12) curX = c.minX - radius;
            else if (from.x >= c.maxX && exitRight <= exitLeft + 0.12) curX = c.maxX + radius;
            else if (from.z <= c.minZ && exitFront <= exitBack + 0.12) curZ = c.minZ - radius;
            else if (from.z >= c.maxZ && exitBack <= exitFront + 0.12) curZ = c.maxZ + radius;
            else {
              const minExit = Math.min(exitLeft, exitRight, exitFront, exitBack);
              if (minExit === exitLeft) curX = c.minX - radius;
              else if (minExit === exitRight) curX = c.maxX + radius;
              else if (minExit === exitFront) curZ = c.minZ - radius;
              else curZ = c.maxZ + radius;
            }
          }
        }
        const clamped = this.clampToWalkableRooms(curX, curZ, 0.04, catY);
        curX = clamped.x;
        curZ = clamped.z;
      }
    }

    return out.set(curX, to.y, curZ);
  }

  private segmentIntersectsBox(
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number,
  ): boolean {
    let tmin = 0.04;
    let tmax = 0.98;
    const dx = bx - ax;
    const dy = by - ay;
    const dz = bz - az;

    if (Math.abs(dx) < 1e-6) {
      if (ax < minX || ax > maxX) return false;
    } else {
      const inv = 1 / dx;
      let t1 = (minX - ax) * inv;
      let t2 = (maxX - ax) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }

    if (Math.abs(dy) < 1e-6) {
      if (ay < minY || ay > maxY) return false;
    } else {
      const inv = 1 / dy;
      let t1 = (minY - ay) * inv;
      let t2 = (maxY - ay) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }

    if (Math.abs(dz) < 1e-6) {
      if (az < minZ || az > maxZ) return false;
    } else {
      const inv = 1 / dz;
      let t1 = (minZ - az) * inv;
      let t2 = (maxZ - az) * inv;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
      }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }

    return tmax >= tmin;
  }

  private updateCamera(dt: number, timeSec: number) {
    if (this.phase === 'title') {
      // Hero 3/4 portrait orbit showcasing Brownie's cute eyes & warm golden-ginger coat
      const ang = Math.PI * 0.24 + Math.sin(timeSec * 0.34) * 0.42;
      _camGoal.set(-0.85 + Math.sin(ang) * 0.96, 0.39, -0.82 + Math.cos(ang) * 0.96);
      _camLook.set(-0.85, 0.23, -0.80);
      this.camera.position.lerp(_camGoal, 1 - Math.exp(-3.5 * dt));
      this.camera.lookAt(_camLook);
      return;
    }

    const targetFov = this.zoomiesActive ? 60 : 52;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 7, dt);
      this.camera.updateProjectionMatrix();
    }

    const targetLookHeight =
      this.actionState === 'crouch' || this.actionState === 'peek' || this.actionState === 'loaf'
        ? 0.16
        : this.actionState === 'jump'
          ? 0.28
          : 0.22;
    this.smoothedCamLookY = THREE.MathUtils.damp(this.smoothedCamLookY, targetLookHeight, 10, dt);
    this.smoothedCamDist = THREE.MathUtils.damp(this.smoothedCamDist, this.camDist, 10, dt);
    _camLook.set(this.catPos.x, this.catPos.y + this.smoothedCamLookY, this.catPos.z);

    // Elevation-aware camera vertical ceiling bounds
    const inGroundLobby = this.catPos.y < -6.0 && this.catPos.x >= -10.5;
    const onFloor4Outdoors =
      this.catPos.y < 2.6 &&
      ((this.catPos.x > 3.2 && this.catPos.z > -2.6) ||
        (this.catPos.x < -11.4 && this.catPos.z < -2.6) ||
        (this.catPos.x < -8.6 && this.catPos.z >= -2.6) ||
        (this.catPos.z > 10.6 && this.catPos.x < -1.8));
    const onRooftop = this.catPos.y >= 2.6;
    const minCamY = this.catPos.y < -6.0 ? -11.2 : onRooftop ? Math.max(0.28, _camLook.y - 0.65) : 0.28;
    const maxCamY = inGroundLobby
      ? -8.55
      : this.catPos.y < -6.0
        ? -5.2
        : onFloor4Outdoors || onRooftop
          ? _camLook.y + 3.6
          : 2.94;

    // Strictly respect player's orbit yaw/pitch/distance — zero self-calibration, zero corner wall zoom-in!
    const horiz = Math.cos(this.camPitch) * this.smoothedCamDist;
    const vert = Math.sin(this.camPitch) * this.smoothedCamDist;
    _camGoal.set(
      _camLook.x + Math.sin(this.camYaw) * horiz,
      THREE.MathUtils.clamp(_camLook.y + vert, minCamY, maxCamY),
      _camLook.z + Math.cos(this.camYaw) * horiz,
    );

    this.camera.position.lerp(_camGoal, 1 - Math.exp(-14 * dt));
    this.camera.lookAt(_camLook);

    // Architectural Cutaway: any wall slab sitting directly between Camera & Brownie fades cleanly to translucent
    const camPos = this.camera.position;
    const walls = this.apartment.wallMeshes;
    for (let i = 0; i < walls.length; i++) {
      const w = walls[i];
      const blocksView = this.segmentIntersectsBox(
        _camLook.x,
        _camLook.y,
        _camLook.z,
        camPos.x,
        camPos.y,
        camPos.z,
        w.minX - 0.1,
        w.maxX + 0.1,
        w.minY,
        w.maxY,
        w.minZ - 0.1,
        w.maxZ + 0.1,
      );
      const targetOpacity = blocksView ? 0.14 : 1.0;
      const nextOpacity = THREE.MathUtils.damp(w.mat.opacity, targetOpacity, 12, dt);
      w.mat.opacity = nextOpacity;
      const shouldBeTransparent = nextOpacity < 0.985;
      if (w.mat.transparent !== shouldBeTransparent) {
        w.mat.transparent = shouldBeTransparent;
        w.mat.depthWrite = !shouldBeTransparent;
        w.mat.needsUpdate = true;
      }
    }
  }

  private readGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[0];
    if (!gp) {
      return { moveX: 0, moveY: 0, lookX: 0, lookY: 0, jump: false, interact: false, crouch: false, meow: false };
    }
    const dead = (v: number) => (Math.abs(v) < 0.16 ? 0 : v);
    return {
      moveX: dead(gp.axes[0] || 0),
      moveY: dead(gp.axes[1] || 0),
      lookX: dead(gp.axes[2] || 0),
      lookY: dead(gp.axes[3] || 0),
      jump: Boolean(gp.buttons[0]?.pressed),
      crouch: Boolean(gp.buttons[1]?.pressed),
      interact: Boolean(gp.buttons[2]?.pressed),
      meow: Boolean(gp.buttons[3]?.pressed),
    };
  }

  private pushBubble(speaker: SpeechBubble['speaker'], text: string) {
    this.bubbles.unshift({
      id: `${Date.now()}_${Math.random()}`,
      speaker,
      text,
      ttl: 3.8,
    });
    if (this.bubbles.length > 3) this.bubbles.length = 3;
  }

  private computeInteractPrompt(): string | null {
    if (this.airJailRemaining > 0) return `Air Jail (${Math.ceil(this.airJailRemaining)}s)`;
    if (this.elevatorAnim.active) return 'Riding Elevator...';
    if (this.sittingSpotId === 'sofa_laptop' && this.sitTargetPos) {
      return '[E] Mash Laptop Keyboard Keys';
    }
    if (this.caughtPigeonActor) {
      if (this.minu.root.position.distanceTo(this.catPos) < 2.05) {
        return '[E] Gift Live Pigeon to Gangster Minu!';
      }
      if (this.lulza.root.position.distanceTo(this.catPos) < 1.85) {
        return '[E] Gift Live Pigeon to Girlfriend Lulza!';
      }
      for (const h of this.hoomans) {
        if (h.root.position.distanceTo(this.catPos) < 2.2) {
          return `[E] Drop Live Pigeon Gift at ${h.id}'s Feet!`;
        }
      }
      if (Math.abs(this.catPos.y) < 0.5 && Math.hypot(this.catPos.x - 0.18, this.catPos.z - -9.55) < 1.05) {
        return '[E] Stash Pigeon Prize in Secret Hoard';
      }
      return '[E] Release Caught Pigeon';
    }

    const nearPigeon = this.findNearbyActivePigeon();
    if (nearPigeon) {
      const crouching = this.keys.has('KeyC') || this.virtualInput.crouch;
      return crouching ? '[E] Catch Live Pigeon in Mouth!' : '[E] Pounce Pigeon! (Hold C to Catch Live)';
    }
    for (const h of this.hoomans) {
      if (
        Math.abs(h.root.position.y - this.catPos.y) < 1.8 &&
        h.mode !== 'sleeping' &&
        h.mode !== 'shaken' &&
        h.root.position.distanceTo(this.catPos) < 1.45
      ) {
        return `[E] Back-Jump ${h.id}`;
      }
    }
    if (
      Math.abs(this.neighbor402.root.position.y - this.catPos.y) < 1.8 &&
      this.neighbor402.mode !== 'shaken' &&
      this.neighbor402.root.position.distanceTo(this.catPos) < 1.45
    ) {
      return '[E] Back-Jump Neighbor 402!';
    }
    if (
      Math.abs(this.neighbor401.root.position.y - this.catPos.y) < 1.8 &&
      this.neighbor401.mode !== 'shaken' &&
      this.neighbor401.root.position.distanceTo(this.catPos) < 1.45
    ) {
      return '[E] Back-Jump Neighbor 401!';
    }
    if (
      Math.abs(this.watchman.root.position.y - this.catPos.y) < 1.8 &&
      this.watchman.mode !== 'shaken' &&
      this.watchman.root.position.distanceTo(this.catPos) < 1.45
    ) {
      return '[E] Back-Jump Watchman Tiwari!';
    }

    if (this.carryingPropId) {
      const prop = this.apartment.props.find((p) => p.id === this.carryingPropId);
      const lbl = prop ? prop.label : 'Item';
      if (Math.abs(this.catPos.y) < 0.5 && Math.hypot(this.catPos.x - 0.18, this.catPos.z - -9.55) < 1.05) {
        return `[E] Stash ${lbl} in Secret Hoard!`;
      }
      if (this.minu.root.position.distanceTo(this.catPos) < 2.05 && prop && !prop.isPaperBall) {
        return `[E] Gift ${lbl} to Gangster Minu!`;
      }
      if (this.lulza.root.position.distanceTo(this.catPos) < 1.85 && prop && !prop.isPaperBall) {
        return `[E] Gift ${lbl} to Girlfriend Lulza!`;
      }
      return `[E] Drop ${lbl}`;
    }

    const zone = this.findNearbyInteractiveZone();
    if (zone) {
      return `[E] ${zone.label}`;
    }
    for (const s of this.apartment.sitSpots) {
      if (s.pos.distanceTo(this.catPos) < 0.85) return `[E] ${s.label}`;
    }
    for (const p of this.apartment.props) {
      if (Math.abs(p.pos.y - this.catPos.y) > 0.75) continue;
      if (p.pos.distanceTo(this.catPos) < 0.95) {
        if (p.canCarry && !p.isPaperBall) return `[E] Steal/Carry ${p.label}`;
        return p.isPaperBall ? '[E] Carry/Bat Paper Ball' : `[E] Swat ${p.label}`;
      }
    }
    return null;
  }

  private emitHud() {
    const bucketList: BucketChallenge[] = BUCKET_CHALLENGE_DEFS.map((d) => ({
      id: d.id,
      label: d.label,
      done: Boolean(this.bucketMap[d.id]),
    }));

    const carriedProp = this.carryingPropId
      ? this.apartment.props.find((p) => p.id === this.carryingPropId)
      : null;
    const carryingLabel = this.caughtPigeonActor
      ? 'Live Pigeon (Flapping!)'
      : carriedProp
        ? carriedProp.label
        : null;

    this.onHudUpdate({
      phase: this.phase,
      roomName: this.lastRoom,
      hoomanEnergy: Math.round(this.hoomanEnergy),
      patienceWarning: Math.round(this.patienceWarning),
      noiseLevel: Math.round(this.noiseLevel),
      zoomiesMeter: Math.round(this.zoomiesMeter),
      zoomiesActive: this.zoomiesActive,
      catnipRemaining: Math.ceil(this.catnipRemaining),
      laserActive: this.laserActive,
      comboCount: this.comboCount,
      comboTimer: Math.ceil(this.comboTimer),
      actionState: this.actionState,
      carryingItem: carryingLabel,
      interactPrompt: this.computeInteractPrompt(),
      jumpTargetLabel: this.bestJumpPlatform ? `[Space] Leap → ${this.bestJumpPlatform.label}` : null,
      doorBoltActive: this.doorBoltActive,
      doorBoltCountdown: Math.max(0, Math.ceil(this.doorBoltCountdown)),
      pigeonsPresent: this.apartment.pigeons.some((p) => p.active),
      hiddenSafe: this.isBrownieHidden(),
      neighborAnnoyance: Math.round(this.neighborAnnoyance),
      distractionTimer: Math.ceil(this.distractionTimer),
      caughtPigeon: Boolean(this.caughtPigeonActor),
      hoardCount: this.hoardCount,
      alleyRespect: this.alleyRespect,
      lulzaBonded: this.lulzaBonded,
      elevatorBusy: this.elevatorAnim.active,
      monsoonMode: this.monsoonMode,
      wetPaws: this.wetPawsTimer > 0,
      deliveryActive: this.deliveryActive,
      heist: { ...this.heist },
      stats: { ...this.stats },
      bucketList,
      bubbles: [...this.bubbles],
      pointerLocked: this.pointerLocked,
      photoMode: this.photoMode,
      cameraPreset: this.cameraPresets[this.cameraPresetIndex].label,
      airJailRemaining: Math.ceil(this.airJailRemaining),
    });
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);
    this.renderer.domElement.removeEventListener('contextmenu', this.handleContextMenu);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('wheel', this.handleWheel);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.tpRibbonGeo.dispose();
    this.tpRibbonMat.dispose();
    this.featherGeo.dispose();
    this.featherMat.dispose();
    this.pawGeo.dispose();
    this.pawMat.dispose();

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    this.textures.dispose();
    this.audio.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
}
