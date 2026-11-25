import { ArrowUp, Cat, EyeOff, Hand, Volume2, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TouchControlsProps {
  interactPrompt: string | null;
  zoomiesActive: boolean;
  zoomiesMeter: number;
  onMove: (x: number, y: number) => void;
  onOrbit: (dx: number, dy: number) => void;
  onJump: () => void;
  onInteract: () => void;
  onMeow: () => void;
  onCrouchChange: (crouching: boolean) => void;
  onZoomies: () => void;
  onLoaf: () => void;
  onKnead: () => void;
  onGroom: () => void;
}

const STICK_MAX_RADIUS = 44;
const STICK_FOLLOW_SLACK = 50;

function cleanInteractLabel(prompt: string | null): string {
  if (!prompt) return 'Swat / Sit';
  return prompt.replace(/^\[E\]\s*/i, '');
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  interactPrompt,
  zoomiesActive,
  zoomiesMeter,
  onMove,
  onOrbit,
  onJump,
  onInteract,
  onMeow,
  onCrouchChange,
  onZoomies,
  onLoaf,
  onKnead,
  onGroom,
}) => {
  const moveZoneRef = useRef<HTMLDivElement | null>(null);
  const stickPointerIdRef = useRef<number | null>(null);
  const stickAnchorRef = useRef<{ x: number; y: number }>({ x: 84, y: 180 });
  const orbitPointerIdRef = useRef<number | null>(null);
  const lastOrbitPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [stickActive, setStickActive] = useState(false);
  const [stickAnchor, setStickAnchor] = useState<{ x: number; y: number } | null>(null);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [crouchToggled, setCrouchToggled] = useState(false);

  useEffect(() => {
    return () => {
      onMove(0, 0);
      onCrouchChange(false);
    };
  }, [onMove, onCrouchChange]);

  const clampAnchorToZone = (x: number, y: number, rect: DOMRect) => {
    const pad = 54;
    return {
      x: Math.min(Math.max(x, pad), Math.max(pad, rect.width - pad)),
      y: Math.min(Math.max(y, pad), Math.max(pad, rect.height - pad)),
    };
  };

  const updateStickFromClient = (clientX: number, clientY: number) => {
    const zone = moveZoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    let anchor = stickAnchorRef.current;
    let dx = localX - anchor.x;
    let dy = localY - anchor.y;
    let dist = Math.hypot(dx, dy);

    // Dynamic floating jiggle room: if thumb sweeps past follow slack, gently pull base along
    if (dist > STICK_FOLLOW_SLACK) {
      const pull = (dist - STICK_FOLLOW_SLACK) / dist;
      anchor = clampAnchorToZone(anchor.x + dx * pull, anchor.y + dy * pull, rect);
      stickAnchorRef.current = anchor;
      setStickAnchor(anchor);
      dx = localX - anchor.x;
      dy = localY - anchor.y;
      dist = Math.hypot(dx, dy);
    }

    if (dist > STICK_MAX_RADIUS) {
      const scale = STICK_MAX_RADIUS / dist;
      dx *= scale;
      dy *= scale;
    }

    setKnobOffset({ x: dx, y: dy });
    // Dragging UP (dy < 0) means forward (+moveY)
    onMove(dx / STICK_MAX_RADIUS, -dy / STICK_MAX_RADIUS);
  };

  const handleStickPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (stickPointerIdRef.current !== null) return;
    const zone = moveZoneRef.current;
    if (!zone) return;
    const rect = zone.getBoundingClientRect();
    const anchor = clampAnchorToZone(e.clientX - rect.left, e.clientY - rect.top, rect);
    stickPointerIdRef.current = e.pointerId;
    stickAnchorRef.current = anchor;
    setStickAnchor(anchor);
    setStickActive(true);
    setKnobOffset({ x: 0, y: 0 });
    e.currentTarget.setPointerCapture(e.pointerId);
    onMove(0, 0);
  };

  const handleStickPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    updateStickFromClient(e.clientX, e.clientY);
  };

  const releaseStick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerIdRef.current !== e.pointerId) return;
    stickPointerIdRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setStickActive(false);
    setStickAnchor(null);
    setKnobOffset({ x: 0, y: 0 });
    onMove(0, 0);
  };

  const handleOrbitPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (orbitPointerIdRef.current !== null) return;
    orbitPointerIdRef.current = e.pointerId;
    lastOrbitPosRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleOrbitPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (orbitPointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - lastOrbitPosRef.current.x;
    const dy = e.clientY - lastOrbitPosRef.current.y;
    lastOrbitPosRef.current = { x: e.clientX, y: e.clientY };
    onOrbit(dx, dy);
  };

  const releaseOrbit = (e: React.PointerEvent<HTMLDivElement>) => {
    if (orbitPointerIdRef.current !== e.pointerId) return;
    orbitPointerIdRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const toggleCrouch = () => {
    setCrouchToggled((prev) => {
      const next = !prev;
      onCrouchChange(next);
      return next;
    });
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-15 select-none">
      {/* Transparent Camera Orbit Surface on Right Half (above buttons) */}
      <div
        onPointerDown={handleOrbitPointerDown}
        onPointerMove={handleOrbitPointerMove}
        onPointerUp={releaseOrbit}
        onPointerCancel={releaseOrbit}
        aria-label="Touch camera look pad"
        className="pointer-events-auto absolute top-24 right-0 bottom-52 left-1/2 touch-none"
      />

      {/* Dynamic Left-Side Floating Movement Joystick Zone */}
      <div
        ref={moveZoneRef}
        onPointerDown={handleStickPointerDown}
        onPointerMove={handleStickPointerMove}
        onPointerUp={releaseStick}
        onPointerCancel={releaseStick}
        aria-label="Dynamic movement joystick zone"
        className="pointer-events-auto absolute top-28 bottom-14 left-0 w-[46%] touch-none"
      >
        {stickActive && stickAnchor ? (
          <div
            style={{
              left: `${stickAnchor.x}px`,
              top: `${stickAnchor.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-none absolute flex h-28 w-28 items-center justify-center rounded-full border-2 border-amber-300/50 bg-[#10151e]/78 shadow-xl"
          >
            <div className="h-14 w-14 rounded-full border border-white/12" />
            <div
              style={{
                transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
              }}
              className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/80 bg-amber-500/95 text-[#160f07] shadow-lg"
            >
              <Cat className="h-5 w-5" />
            </div>
          </div>
        ) : (
          <div className="pointer-events-none absolute bottom-5 left-6 flex flex-col items-center gap-1 opacity-75 sm:bottom-6 sm:left-8">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-amber-300/35 bg-[#10151e]/55 shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/55 bg-amber-500/80 text-[#160f07] shadow">
                <Cat className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-[#d8cfc1]/90">Drag anywhere to move</span>
          </div>
        )}
      </div>

      {/* Bottom-Right Thumb Action Cluster */}
      <div className="pointer-events-auto absolute right-4 bottom-16 flex flex-col items-end gap-2 sm:right-7 sm:bottom-18">
        {/* Secondary utility row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              toggleCrouch();
            }}
            className={`flex h-11 min-w-[44px] touch-none items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold shadow-lg transition-colors ${
              crouchToggled
                ? 'border-amber-300 bg-amber-500 text-[#160f07]'
                : 'border-white/20 bg-[#10151e]/88 text-[#f5efe6]'
            }`}
          >
            <EyeOff className="h-4 w-4" />
            <span className="whitespace-nowrap">{crouchToggled ? 'Crouching' : 'Crouch'}</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onLoaf();
            }}
            className="flex h-11 min-w-[44px] touch-none items-center gap-1.5 rounded-xl border border-white/20 bg-[#10151e]/88 px-3 text-xs font-semibold text-[#f5efe6] active:bg-[#1c2534] shadow-lg"
          >
            <span className="whitespace-nowrap">Loaf / Stare</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onKnead();
            }}
            className="flex h-11 min-w-[44px] touch-none items-center gap-1.5 rounded-xl border border-white/20 bg-[#10151e]/88 px-3 text-xs font-semibold text-amber-200 active:bg-[#1c2534] shadow-lg"
          >
            <span className="whitespace-nowrap">Biscuits</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onGroom();
            }}
            className="flex h-11 min-w-[44px] touch-none items-center gap-1.5 rounded-xl border border-white/20 bg-[#10151e]/88 px-3 text-xs font-semibold text-amber-100 active:bg-[#1c2534] shadow-lg"
          >
            <span className="whitespace-nowrap">Groom</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onZoomies();
            }}
            disabled={!zoomiesActive && zoomiesMeter < 30}
            className={`flex h-11 min-w-[44px] touch-none items-center gap-1 rounded-xl border px-3 text-xs font-semibold shadow-lg ${
              zoomiesActive
                ? 'border-orange-300 bg-orange-500 text-[#160f07]'
                : zoomiesMeter >= 30
                  ? 'border-orange-400/50 bg-[#1c1610]/90 text-orange-300 active:bg-orange-500/30'
                  : 'border-white/10 bg-[#10151e]/70 text-white/40'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span className="whitespace-nowrap">Zoomies</span>
          </button>
        </div>

        {/* Primary thumb arc: Meow, Interact, Jump */}
        <div className="flex items-end gap-2.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onMeow();
            }}
            className="flex h-12 min-w-[48px] touch-none flex-col items-center justify-center rounded-xl border border-amber-300/40 bg-[#141a24]/92 px-3.5 text-amber-300 active:bg-amber-500 active:text-[#160f07] shadow-lg"
          >
            <Volume2 className="h-4 w-4" />
            <span className="text-[10px] font-semibold">Meow</span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onInteract();
            }}
            className={`flex h-14 min-w-[68px] touch-none flex-col items-center justify-center rounded-xl border px-3.5 shadow-xl transition-colors ${
              interactPrompt
                ? 'border-amber-300 bg-amber-400/95 text-[#160f07]'
                : 'border-white/20 bg-[#141a24]/92 text-[#f5efe6] active:bg-[#222c3c]'
            }`}
          >
            <Hand className="h-5 w-5" />
            <span className="max-w-[96px] truncate text-[11px] font-bold">
              {cleanInteractLabel(interactPrompt)}
            </span>
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              onJump();
            }}
            className="flex h-16 w-16 touch-none flex-col items-center justify-center rounded-2xl border-2 border-amber-300/75 bg-amber-500/92 text-[#160f07] active:scale-95 active:bg-amber-400 shadow-xl"
          >
            <ArrowUp className="h-6 w-6 stroke-[2.5]" />
            <span className="text-xs font-extrabold">Leap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
