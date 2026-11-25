import {
  Camera,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  CloudRain,
  Eye,
  ListChecks,
  Mic,
  Moon,
  RotateCcw,
  Smartphone,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import type { HudSnapshot } from '../game/types';

interface GameHUDProps {
  hud: HudSnapshot;
  muted: boolean;
  touchEnabled: boolean;
  onToggleTouchControls: () => void;
  onToggleMute: () => void;
  onMeow: () => void;
  onOpenVoiceStudio: () => void;
  onTogglePhotoMode: () => void;
  onCycleCamera: () => void;
  onSnapPhoto: () => void;
  onToggleMonsoon: () => void;
  onToggleSandboxNight: () => void;
  onRestart: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  muted,
  touchEnabled,
  onToggleTouchControls,
  onToggleMute,
  onMeow,
  onOpenVoiceStudio,
  onTogglePhotoMode,
  onCycleCamera,
  onSnapPhoto,
  onToggleMonsoon,
  onToggleSandboxNight,
  onRestart,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [bucketOpen, setBucketOpen] = useState(false);

  if (hud.photoMode) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-20 flex justify-center px-4">
        <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/15 bg-[#10151e]/92 px-4 py-2.5 shadow-xl">
          <span className="text-xs font-medium text-[#d8cfc1]">
            Binzie Photo Mode · Drag to frame Brownie
          </span>
          <button
            onClick={onSnapPhoto}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-[#160f07] hover:bg-amber-400 cursor-pointer"
          >
            <Camera className="h-3.5 w-3.5" />
            Save PNG Snapshot
          </button>
          <button
            onClick={onTogglePhotoMode}
            className="rounded-lg border border-white/15 bg-[#1b2230] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#232c3d] cursor-pointer"
          >
            Resume [P]
          </button>
        </div>
      </div>
    );
  }

  const allLootCollected = hud.heist.salmonTin && hud.heist.churuTube && hud.heist.hairTieStash;
  const bucketDoneCount = hud.bucketList.filter((b) => b.done).length;
  const bucketTotalCount = hud.bucketList.length;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
      {/* Top Row: Compact Phase/Objective Left & Energy/Noise Right */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="max-w-xs rounded-xl border border-white/12 bg-[#10151e]/88 px-4 py-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
              <span>{hud.roomName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {hud.phase === 'chaos'
                  ? 'Act 1: Exhaust Hoomans'
                  : hud.phase === 'heist' || hud.phase === 'transitioning'
                    ? 'Act 2: Midnight Heist'
                    : 'Free Binzie Sandbox'}
              </span>
            </div>

            {hud.phase === 'chaos' && (
              <p className="mt-1.5 text-xs leading-snug text-[#ddd4c6]">
                Back-jump hoomans, hunt balcony/terrace pigeons, ring &amp; invade 401/402, claw sofas, or
                mash the laptop!
              </p>
            )}

            {hud.phase === 'sandbox' && (
              <p className="mt-1.5 text-xs leading-snug text-[#ddd4c6]">
                Prowl 4B, 401 &amp; 402, nuzzle Lulza, woo Gangster Minu, hunt pigeons, knead [G], or
                groom [H].
              </p>
            )}

            {(hud.phase === 'heist' || hud.phase === 'transitioning') && (
              <div className="mt-2 space-y-1 text-xs text-[#ddd4c6]">
                <div className={hud.heist.salmonTin ? 'text-emerald-300 line-through' : ''}>
                  • Salmon Tin (Top of Silver Fridge)
                </div>
                <div className={hud.heist.churuTube ? 'text-emerald-300 line-through' : ''}>
                  • Churu Tube (Study Green Shelf)
                </div>
                <div className={hud.heist.hairTieStash ? 'text-emerald-300 line-through' : ''}>
                  • Hair-Tie Stash (Bedroom Rack)
                </div>
                {allLootCollected && (
                  <div className="pt-1 font-semibold text-amber-300">
                    → Escape out the French doors to the Balcony!
                  </div>
                )}
              </div>
            )}

            {hud.carryingItem && (
              <p className="mt-1.5 text-xs font-semibold text-amber-200">
                In mouth: {hud.carryingItem}
              </p>
            )}

            {(hud.catnipRemaining > 0 ||
              hud.laserActive ||
              hud.caughtPigeon ||
              hud.alleyRespect ||
              hud.lulzaBonded ||
              hud.hoardCount > 0 ||
              hud.wetPaws ||
              hud.deliveryActive) && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                {hud.deliveryActive && (
                  <span className="rounded bg-yellow-400/20 px-2 py-0.5 text-yellow-200 border border-yellow-400/45">
                    Blinkit Bag Outside 4B!
                  </span>
                )}
                {hud.wetPaws && (
                  <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-cyan-200 border border-cyan-400/40">
                    Wet Paws (Leave Tracks!)
                  </span>
                )}
                {hud.caughtPigeon && (
                  <span className="rounded bg-orange-500/25 px-2 py-0.5 text-orange-200 border border-orange-400/45">
                    Live Pigeon in Mouth · Drop by Hooman, Minu, or Lulza!
                  </span>
                )}
                {hud.alleyRespect && (
                  <span className="rounded bg-pink-500/20 px-2 py-0.5 text-pink-200 border border-pink-400/40">
                    Minu’s Crush ✓
                  </span>
                )}
                {hud.lulzaBonded && (
                  <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 text-fuchsia-200 border border-fuchsia-400/40">
                    Lulza ❤️
                  </span>
                )}
                {hud.hoardCount > 0 && (
                  <span className="rounded bg-sky-500/15 px-2 py-0.5 text-sky-200 border border-sky-400/35">
                    Secret Hoard: {hud.hoardCount}
                  </span>
                )}
                {hud.catnipRemaining > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-emerald-300 border border-emerald-400/35">
                    <Sparkles className="h-3 w-3" />
                    Catnip Boost ({hud.catnipRemaining}s)
                  </span>
                )}
                {hud.laserActive && (
                  <span className="rounded bg-rose-500/20 px-2 py-0.5 text-rose-300 border border-rose-400/35">
                    Laser Active · Catch Dot!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Collapsible Binzie Bucket List Drawer */}
          {bucketOpen && bucketTotalCount > 0 && (
            <div className="pointer-events-auto max-w-xs rounded-xl border border-amber-400/25 bg-[#10151e]/94 px-3.5 py-2.5 shadow-xl">
              <div className="mb-1.5 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-xs font-semibold text-amber-300">
                  Binzie Bucket List ({bucketDoneCount}/{bucketTotalCount})
                </span>
                <button
                  onClick={() => setBucketOpen(false)}
                  className="text-[11px] text-[#b5aa99] hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
              <div className="max-h-52 space-y-1 overflow-y-auto pr-1 text-[11px]">
                {hud.bucketList.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-1.5 ${
                      item.done ? 'text-emerald-300 line-through' : 'text-[#ddd4c6]'
                    }`}
                  >
                    {item.done ? (
                      <CheckSquare className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    ) : (
                      <Square className="h-3.5 w-3.5 shrink-0 text-[#8b8173]" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Meter Box */}
        <div className="w-60 rounded-xl border border-white/12 bg-[#10151e]/88 px-4 py-3 shadow-lg space-y-2.5">
          {hud.comboCount > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-amber-400/40 bg-amber-500/15 px-2.5 py-1 text-xs">
              <span className="font-bold text-amber-300">Chaos Combo x{Math.min(4, hud.comboCount)}</span>
              <span className="font-mono-tabular text-[11px] text-amber-200">{hud.comboTimer}s</span>
            </div>
          )}

          {hud.phase === 'chaos' ? (
            <>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#c9bfb0]">Hooman Energy</span>
                  <span className="font-mono-tabular font-semibold text-amber-300">{hud.hoomanEnergy}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                  <div
                    className="h-full bg-amber-400 transition-all duration-150"
                    style={{ width: `${hud.hoomanEnergy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#c9bfb0]">Air-Jail Patience Risk</span>
                  <span className="font-mono-tabular text-[#e5988b]">{hud.patienceWarning}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-white/10">
                  <div
                    className="h-full bg-rose-400 transition-all duration-150"
                    style={{ width: `${hud.patienceWarning}%` }}
                  />
                </div>
              </div>
            </>
          ) : hud.phase === 'sandbox' ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#c9bfb0]">Chaos Score</span>
              <span className="font-mono-tabular font-semibold text-amber-300">{hud.stats.chaosScore}</span>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs">
                <span className="text-[#c9bfb0]">Midnight Noise Alert</span>
                <span className="font-mono-tabular font-semibold text-rose-300">{hud.noiseLevel}%</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded bg-white/10">
                <div
                  className="h-full bg-rose-400 transition-all duration-150"
                  style={{ width: `${hud.noiseLevel}%` }}
                />
              </div>
              {hud.hiddenSafe && (
                <p className="mt-1 text-xs font-medium text-emerald-300">Hidden safely in cover</p>
              )}
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-[#c9bfb0]">Zoomies Meter [Shift]</span>
              <span className="font-mono-tabular text-amber-200">{hud.zoomiesMeter}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-orange-400 transition-all duration-150"
                style={{ width: `${hud.zoomiesMeter}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="text-[#c9bfb0]">Neighbor Escalation</span>
              <span className="font-mono-tabular text-rose-300">{hud.neighborAnnoyance}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-white/10">
              <div
                className="h-full bg-red-400 transition-all duration-150"
                style={{ width: `${hud.neighborAnnoyance}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Center Alert Banner (Door Bolt, 402 Distraction, or Air Jail) */}
      {(hud.doorBoltActive || hud.airJailRemaining > 0 || hud.distractionTimer > 0) && (
        <div className="mx-auto rounded-lg border border-amber-400/50 bg-[#1a130b]/95 px-4 py-2 text-center shadow-xl">
          {hud.distractionTimer > 0 ? (
            <p className="text-sm font-bold text-emerald-300">
              402 COMPLAINING AT FRONT DOOR! Kitchen &amp; Study Distraction Window ({hud.distractionTimer}s)
            </p>
          ) : hud.doorBoltActive ? (
            <p className="text-sm font-bold text-amber-300">
              FRONT DOOR OPEN! Bolt to the entry door ({hud.doorBoltCountdown}s)
            </p>
          ) : (
            <p className="text-sm font-bold text-rose-300">
              BALCONY AIR JAIL! Timeout ends in {hud.airJailRemaining}s
            </p>
          )}
        </div>
      )}

      {/* Bottom Area: Bubbles, Interact Prompt & Collapsible Dock */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Speech Bubbles (Left aligned above dock) */}
        {hud.bubbles.length > 0 && (
          <div className="flex w-full max-w-5xl flex-col items-start gap-1.5">
            {hud.bubbles.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-white/12 bg-[#10151e]/92 px-3.5 py-1.5 text-xs text-[#f6efe6] shadow"
              >
                <span
                  className={`font-semibold ${
                    b.speaker === 'Neighbor 402'
                      ? 'text-rose-300'
                      : b.speaker === 'Neighbor 401'
                        ? 'text-teal-300'
                        : b.speaker === 'Watchman'
                          ? 'text-sky-300'
                          : b.speaker === 'Minu'
                            ? 'text-pink-300'
                            : b.speaker === 'Lulza'
                              ? 'text-fuchsia-300'
                              : 'text-amber-300'
                  }`}
                >
                  {b.speaker}:{' '}
                </span>
                <span>{b.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Context Jump / Interact Prompts */}
        {(hud.interactPrompt || hud.jumpTargetLabel) && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {hud.interactPrompt && (
              <div className="rounded-lg border border-amber-400/40 bg-[#141923]/95 px-3.5 py-1.5 text-xs font-semibold text-amber-200 shadow">
                {hud.interactPrompt}
              </div>
            )}
            {hud.jumpTargetLabel && (
              <div className="rounded-lg border border-white/15 bg-[#141923]/95 px-3.5 py-1.5 text-xs font-medium text-[#f5efe6] shadow">
                {hud.jumpTargetLabel}
              </div>
            )}
          </div>
        )}

        {/* Collapsible Bottom Control Dock */}
        <div className="pointer-events-auto flex flex-col items-center">
          <button
            onClick={() => setDockCollapsed((c) => !c)}
            className="mb-1 inline-flex items-center gap-1 rounded-t-lg border border-b-0 border-white/12 bg-[#10151e]/90 px-3 py-0.5 text-[11px] font-medium text-[#b5aa99] hover:text-white cursor-pointer"
          >
            {dockCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {dockCollapsed ? 'Show Controls' : 'Hide Controls'}
          </button>

          {!dockCollapsed && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#10151e]/94 px-3.5 py-2 shadow-xl">
              <button
                onClick={onMeow}
                className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-[#160f07] hover:bg-amber-400 whitespace-nowrap cursor-pointer"
              >
                Meow [Q]
              </button>
              <button
                onClick={() => setBucketOpen((o) => !o)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  bucketOpen
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                    : 'border-white/12 bg-[#19202d] text-[#f5efe6] hover:border-amber-400/40'
                }`}
              >
                <ListChecks className="h-3.5 w-3.5 text-amber-400" />
                Bucket List ({bucketDoneCount}/{bucketTotalCount})
              </button>
              <button
                onClick={onOpenVoiceStudio}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#19202d] px-3 py-1.5 text-xs font-medium text-[#f5efe6] hover:border-amber-400/40 whitespace-nowrap cursor-pointer"
              >
                <Mic className="h-3.5 w-3.5 text-amber-400" />
                Voice Studio
              </button>
              <button
                onClick={onCycleCamera}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#19202d] px-3 py-1.5 text-xs font-medium text-[#f5efe6] hover:border-amber-400/40 whitespace-nowrap cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5 text-amber-400" />
                {hud.cameraPreset} [V]
              </button>
              <button
                onClick={onTogglePhotoMode}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#19202d] px-3 py-1.5 text-xs font-medium text-[#f5efe6] hover:border-amber-400/40 whitespace-nowrap cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-amber-400" />
                Photo [P]
              </button>
              <button
                onClick={onToggleTouchControls}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  touchEnabled
                    ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
                    : 'border-white/12 bg-[#19202d] text-[#f5efe6] hover:border-amber-400/40'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                Touch Pad
              </button>
              <button
                onClick={onToggleMonsoon}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap cursor-pointer ${
                  hud.monsoonMode
                    ? 'border-sky-400/60 bg-sky-500/20 text-sky-200'
                    : 'border-white/12 bg-[#19202d] text-[#f5efe6] hover:border-amber-400/40'
                }`}
              >
                <CloudRain className="h-3.5 w-3.5 text-sky-400" />
                Monsoon [R]
              </button>
              {hud.phase === 'sandbox' && (
                <button
                  onClick={onToggleSandboxNight}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-[#19202d] px-3 py-1.5 text-xs font-medium text-[#f5efe6] hover:border-amber-400/40 whitespace-nowrap cursor-pointer"
                >
                  <Moon className="h-3.5 w-3.5 text-amber-400" />
                  Evening / Midnight
                </button>
              )}
              <button
                onClick={onToggleMute}
                aria-label={muted ? 'Unmute audio' : 'Mute audio'}
                className="rounded-lg border border-white/12 bg-[#19202d] p-1.5 text-[#d5cbbd] hover:text-white cursor-pointer"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button
                onClick={onRestart}
                aria-label="Restart game"
                className="rounded-lg border border-white/12 bg-[#19202d] p-1.5 text-[#d5cbbd] hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <span className="hidden pl-1 text-[11px] text-[#9b9183] lg:inline">
                Drag Look · J/L Orbit · C Crouch · F Loaf · G Knead · H Groom · E Hunt/Interact · Shift Zoomies
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
