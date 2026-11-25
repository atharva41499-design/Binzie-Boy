import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CrimeReportModal } from './components/CrimeReportModal';
import { GameHUD } from './components/GameHUD';
import { TitleOverlay } from './components/TitleOverlay';
import { TouchControls } from './components/TouchControls';
import { VoiceStudioModal } from './components/VoiceStudioModal';
import { BrownieGameEngine } from './game/BrownieGameEngine';
import type { AudioManifest, HudSnapshot } from './game/types';

const INITIAL_HUD: HudSnapshot = {
  phase: 'title',
  roomName: 'Living Room',
  hoomanEnergy: 100,
  patienceWarning: 0,
  noiseLevel: 0,
  neighborAnnoyance: 0,
  distractionTimer: 0,
  caughtPigeon: false,
  hoardCount: 0,
  alleyRespect: false,
  lulzaBonded: false,
  elevatorBusy: false,
  monsoonMode: false,
  wetPaws: false,
  deliveryActive: false,
  zoomiesMeter: 50,
  zoomiesActive: false,
  catnipRemaining: 0,
  laserActive: false,
  comboCount: 0,
  comboTimer: 0,
  actionState: 'loaf',
  carryingItem: null,
  interactPrompt: null,
  jumpTargetLabel: null,
  doorBoltActive: false,
  doorBoltCountdown: 0,
  pigeonsPresent: true,
  hiddenSafe: false,
  heist: {
    salmonTin: false,
    churuTube: false,
    hairTieStash: false,
    paperBallRescued: false,
    escapedBalcony: false,
  },
  stats: {
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
  },
  bucketList: [],
  bubbles: [],
  pointerLocked: false,
  photoMode: false,
  cameraPreset: 'Hero Stray',
  airJailRemaining: 0,
};

const EMPTY_MANIFEST: AudioManifest = {
  demand_meow: [],
  chirp_ekekek: [],
  greeting_trill: [],
  purr_loop: [],
  grumpy_mumble: [],
  zoomies_yowl: [],
};

function detectTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<BrownieGameEngine | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [voiceStudioOpen, setVoiceStudioOpen] = useState(false);
  const [manifest, setManifest] = useState<AudioManifest>(EMPTY_MANIFEST);
  const [muted, setMuted] = useState(false);
  const [touchEnabled, setTouchEnabled] = useState<boolean>(() => detectTouchDevice());
  const [engineError, setEngineError] = useState<string | null>(null);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    let engine: BrownieGameEngine | null = null;
    try {
      setEngineError(null);
      engine = new BrownieGameEngine(mount, (snapshot) => {
        setHud(snapshot);
      });
      engineRef.current = engine;

      void engine.audio.loadManifest().then((loaded) => {
        setManifest(loaded);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to start 3D WebGL renderer.';
      setEngineError(msg);
      console.error('Brownie 3D engine initialization error:', err);
    }

    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
  }, []);

  const customClipCount = useMemo(() => {
    return Object.values(manifest).reduce((sum, list) => sum + list.length, 0);
  }, [manifest]);

  const handleOpenVoiceStudio = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setVoiceStudioOpen(true);
  }, []);

  const handleToggleMute = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const next = !engine.audio.isMuted();
    engine.audio.setMuted(next);
    setMuted(next);
  }, []);

  const handleSnapPhoto = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const dataUrl = engine.capturePhotoDataUrl();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `brownie-binzie-${Date.now()}.png`;
    link.click();
  }, []);

  const handleTouchMove = useCallback((x: number, y: number) => {
    engineRef.current?.setVirtualMove(x, y);
  }, []);

  const handleTouchOrbit = useCallback((dx: number, dy: number) => {
    engineRef.current?.orbitCamera(dx, dy);
  }, []);

  const handleTouchCrouch = useCallback((crouching: boolean) => {
    engineRef.current?.setVirtualCrouch(crouching);
  }, []);

  const showTouchControls =
    touchEnabled &&
    hud.phase !== 'title' &&
    hud.phase !== 'victory' &&
    !hud.photoMode &&
    !voiceStudioOpen;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0c0806]">
      {/* Dedicated WebGL mount container */}
      <div ref={canvasMountRef} className="h-full w-full" />

      {engineError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0c0806]/95 p-6 text-amber-50">
          <div className="max-w-md rounded-2xl border border-amber-500/30 bg-[#1a120d] p-6 shadow-2xl">
            <h1 className="text-lg font-semibold text-amber-300">3D Graphics Context Unavailable</h1>
            <p className="mt-2 text-sm text-amber-100/80">{engineError}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-400"
            >
              Reload Game
            </button>
          </div>
        </div>
      )}

      {!engineError && hud.phase === 'title' && (
        <TitleOverlay
          onStartStory={() => engineRef.current?.startNewGame('story')}
          onStartSandbox={() => engineRef.current?.startNewGame('sandbox')}
          onOpenVoiceStudio={handleOpenVoiceStudio}
          customClipCount={customClipCount}
        />
      )}

      {hud.phase !== 'title' && hud.phase !== 'victory' && (
        <GameHUD
          hud={hud}
          muted={muted}
          touchEnabled={touchEnabled}
          onToggleTouchControls={() => setTouchEnabled((t) => !t)}
          onToggleMute={handleToggleMute}
          onMeow={() => engineRef.current?.triggerMeow()}
          onOpenVoiceStudio={handleOpenVoiceStudio}
          onTogglePhotoMode={() => engineRef.current?.togglePhotoMode()}
          onCycleCamera={() => engineRef.current?.cycleCameraPreset()}
          onSnapPhoto={handleSnapPhoto}
          onToggleMonsoon={() => engineRef.current?.toggleMonsoonMode()}
          onToggleSandboxNight={() => engineRef.current?.toggleMidnightSandbox()}
          onRestart={() => engineRef.current?.startNewGame(hud.phase === 'sandbox' ? 'sandbox' : 'story')}
        />
      )}

      {showTouchControls && (
        <TouchControls
          interactPrompt={hud.interactPrompt}
          zoomiesActive={hud.zoomiesActive}
          zoomiesMeter={hud.zoomiesMeter}
          onMove={handleTouchMove}
          onOrbit={handleTouchOrbit}
          onJump={() => engineRef.current?.triggerJump()}
          onInteract={() => engineRef.current?.triggerInteract()}
          onMeow={() => engineRef.current?.triggerMeow()}
          onCrouchChange={handleTouchCrouch}
          onZoomies={() => engineRef.current?.triggerZoomies()}
          onLoaf={() => engineRef.current?.triggerLoafOrWallStare()}
          onKnead={() => engineRef.current?.triggerKnead()}
          onGroom={() => engineRef.current?.triggerGroom()}
        />
      )}

      {hud.phase === 'victory' && (
        <CrimeReportModal
          stats={hud.stats}
          heist={hud.heist}
          onPlayAgain={() => engineRef.current?.startNewGame('story')}
          onFreeRoam={() => engineRef.current?.startNewGame('sandbox')}
        />
      )}

      {voiceStudioOpen && engineRef.current && (
        <VoiceStudioModal
          audioEngine={engineRef.current.audio}
          manifest={manifest}
          onManifestUpdated={setManifest}
          onClose={() => setVoiceStudioOpen(false)}
        />
      )}
    </main>
  );
}
