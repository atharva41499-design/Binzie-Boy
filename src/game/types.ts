export type GamePhase =
  | 'title'
  | 'chaos'
  | 'transitioning'
  | 'heist'
  | 'caught'
  | 'victory'
  | 'sandbox';

export type BrownieActionState =
  | 'idle'
  | 'walk'
  | 'trot'
  | 'zoomies'
  | 'crouch'
  | 'peek'
  | 'pounce_charge'
  | 'pounce_attack'
  | 'jump'
  | 'loaf'
  | 'knead'
  | 'groom'
  | 'scratch'
  | 'drink'
  | 'sit_in'
  | 'curtain_climb'
  | 'shoulder_goblin'
  | 'wall_stare';

export type BrownieAudioSlot =
  | 'demand_meow'
  | 'chirp_ekekek'
  | 'greeting_trill'
  | 'purr_loop'
  | 'grumpy_mumble'
  | 'zoomies_yowl';

export interface BrownieAudioClip {
  id: string;
  slot: BrownieAudioSlot;
  label: string;
  url: string;
  fileName: string;
  trimStart: number;
  trimEnd: number | null;
  createdAt: string;
}

export type AudioManifest = Record<BrownieAudioSlot, BrownieAudioClip[]>;

export interface CrimeStats {
  itemsKnocked: number;
  backJumps: number;
  curtainsClimbed: number;
  laptopLoafs: number;
  meowsSpammed: number;
  doorBolts: number;
  bucketSits: number;
  pigeonsWatched: number;
  pigeonsHunted: number;
  pigeonsCaught: number;
  giftsDelivered: number;
  escalationsTriggered: number;
  hoardStashed: number;
  thingsScratched: number;
  timesSpotted: number;
  paperBallDelivered: boolean;
  tpShredded: number;
  lasersCaught: number;
  biscuitsMade: number;
  switchesFlipped: number;
  carAlarmsTriggered: number;
  deliveriesHeisted: number;
  maxCombo: number;
  chaosScore: number;
  elapsedSeconds: number;
}

export interface BucketChallenge {
  id: string;
  label: string;
  done: boolean;
}

export interface HeistProgress {
  salmonTin: boolean;
  churuTube: boolean;
  hairTieStash: boolean;
  paperBallRescued: boolean;
  escapedBalcony: boolean;
}

export interface SpeechBubble {
  id: string;
  speaker: 'Atharva' | 'Shruti' | 'Neighbor 402' | 'Neighbor 401' | 'Watchman' | 'Minu' | 'Lulza' | 'Brownie';
  text: string;
  ttl: number;
}

export interface HudSnapshot {
  phase: GamePhase;
  roomName: string;
  hoomanEnergy: number; // 100 -> 0 in Phase 1
  patienceWarning: number; // 0 -> 100 (air jail risk if caught spamming too hard, decays naturally)
  noiseLevel: number; // 0 -> 100 in Phase 2
  neighborAnnoyance: number; // 0 -> 100 escalation toward 402 knock-knock complaint
  distractionTimer: number; // > 0 when Uncle Verma is complaining at 404 door
  caughtPigeon: boolean; // carrying stunned live pigeon in mouth!
  hoardCount: number; // shiny trophies & toys stashed under bedroom bed / sofa
  alleyRespect: boolean; // earned Minu's street crush & Catnip Overdrive
  lulzaBonded: boolean; // charmed girlfriend Lulza in Flat 401
  elevatorBusy: boolean;
  monsoonMode: boolean;
  wetPaws: boolean;
  deliveryActive: boolean;
  zoomiesMeter: number; // 0 -> 100
  zoomiesActive: boolean;
  catnipRemaining: number; // > 0 when Catnip Super Mode active
  laserActive: boolean;
  comboCount: number;
  comboTimer: number;
  actionState: BrownieActionState;
  carryingItem: string | null;
  interactPrompt: string | null;
  jumpTargetLabel: string | null;
  doorBoltActive: boolean;
  doorBoltCountdown: number;
  pigeonsPresent: boolean;
  hiddenSafe: boolean;
  heist: HeistProgress;
  stats: CrimeStats;
  bucketList: BucketChallenge[];
  bubbles: SpeechBubble[];
  pointerLocked: boolean;
  photoMode: boolean;
  cameraPreset: 'Hero Stray' | 'Close Fur' | 'Wide Room';
  airJailRemaining: number;
}

export const AUDIO_SLOT_META: Array<{
  slot: BrownieAudioSlot;
  title: string;
  cue: string;
}> = [
  {
    slot: 'demand_meow',
    title: 'Demand Meow',
    cue: 'Press [Q] / [M] anytime or lure Atharva & Shruti',
  },
  {
    slot: 'chirp_ekekek',
    title: 'Pigeon Chirp / Ekekek',
    cue: 'Staring at pigeons on the balcony railing or Cat TV',
  },
  {
    slot: 'greeting_trill',
    title: 'Greeting Trill (Mrrp)',
    cue: 'Landing on furniture, hopping up, or starting zoomies',
  },
  {
    slot: 'purr_loop',
    title: 'Purr Engine',
    cue: 'Loafing, making biscuits, or sitting in boxes & buckets',
  },
  {
    slot: 'grumpy_mumble',
    title: 'Grumpy Mumble / Hiss',
    cue: 'Put in Air Jail, spotted at night, or bumped',
  },
  {
    slot: 'zoomies_yowl',
    title: '3 AM Zoomies Yowl',
    cue: 'Activating Zoomies sprint or climbing curtains',
  },
];
