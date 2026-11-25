import { Mic, Play, Sparkles, Volume2 } from 'lucide-react';
import React from 'react';

interface TitleOverlayProps {
  onStartStory: () => void;
  onStartSandbox: () => void;
  onOpenVoiceStudio: () => void;
  customClipCount: number;
}

export const TitleOverlay: React.FC<TitleOverlayProps> = ({
  onStartStory,
  onStartSandbox,
  onOpenVoiceStudio,
  customClipCount,
}) => {
  return (
    <div className="pointer-events-auto fixed inset-0 z-20 flex items-end justify-start bg-gradient-to-tr from-[#090c12]/92 via-[#090c12]/45 to-transparent p-8 sm:p-12">
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-4">
          <img
            src="/assets/aistudio/PXL_20261113_103704865_c9279e0b.jpg"
            alt="Brownie the Binzie Cat"
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-xl border border-amber-400/40 object-cover shadow-lg"
          />
          <div>
            <p className="text-xs font-medium tracking-wide text-amber-300">
              Atharva &amp; Shruti&apos;s Apartment · Two-Act Feline Heist
            </p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#fff8ee] sm:text-5xl">
              Brownie the Binzie Cat
            </h1>
          </div>
        </div>

        <p className="max-w-lg text-sm leading-relaxed text-[#d9d0c3] sm:text-base">
          Wear down Atharva &amp; Shruti with pure orange-cat chaos—back-jump their shoulders, loaf on the
          open laptop, bolt the front door, climb fairy-light curtains, and sit in the pink bathroom
          bucket. Once the lights go out, climb the silver fridge and steal the midnight treats.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={onStartStory}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-[#140e07] transition-colors hover:bg-amber-400 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            Play Midnight Heist
          </button>

          <button
            onClick={onStartSandbox}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#161c26]/95 px-4 py-2.5 text-sm font-medium text-[#f5efe6] transition-colors hover:border-amber-400/40 hover:bg-[#1e2634] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            Free Apartment Sandbox
          </button>

          <button
            onClick={onOpenVoiceStudio}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#161c26]/95 px-4 py-2.5 text-sm font-medium text-[#f5efe6] transition-colors hover:border-amber-400/40 hover:bg-[#1e2634] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Mic className="h-4 w-4 text-amber-400" />
            Brownie Voice Studio
            <span className="font-mono-tabular text-xs text-amber-300">({customClipCount})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-white/10 pt-4 text-xs text-[#b5aa99]">
          <span className="inline-flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-amber-400" />
            Drag to look · Scroll to zoom
          </span>
          <span aria-hidden="true">·</span>
          <span>WASD Move</span>
          <span aria-hidden="true">·</span>
          <span>J/L Orbit</span>
          <span aria-hidden="true">·</span>
          <span>Space Ledge-Jump</span>
          <span aria-hidden="true">·</span>
          <span>C Crouch &amp; Table Peek</span>
          <span aria-hidden="true">·</span>
          <span>E Swat / Back-Jump / Sit</span>
          <span aria-hidden="true">·</span>
          <span>Q Meow</span>
          <span aria-hidden="true">·</span>
          <span>Shift Zoomies</span>
        </div>
      </div>
    </div>
  );
};
