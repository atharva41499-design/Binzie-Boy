import { RotateCcw, Trophy } from 'lucide-react';
import React from 'react';
import type { CrimeStats, HeistProgress } from '../game/types';

interface CrimeReportModalProps {
  stats: CrimeStats;
  heist: HeistProgress;
  onPlayAgain: () => void;
  onFreeRoam: () => void;
}

export const CrimeReportModal: React.FC<CrimeReportModalProps> = ({
  stats,
  heist,
  onPlayAgain,
  onFreeRoam,
}) => {
  const chaosScore = Math.max(
    0,
    stats.chaosScore + (heist.paperBallRescued ? 60 : 0) - stats.timesSpotted * 30,
  );

  const rank =
    chaosScore >= 320
      ? 'S-Tier Orange Menace'
      : chaosScore >= 160
        ? 'Certified Binzie Royalty'
        : 'Sneaky Midnight Loaf';

  const mins = Math.floor(stats.elapsedSeconds / 60);
  const secs = Math.floor(stats.elapsedSeconds % 60);

  return (
    <div className="pointer-events-auto fixed inset-0 z-30 flex items-center justify-center bg-[#070a0f]/82 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-amber-400/30 bg-[#131822] p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/PXL_20261107_162933945_7855e5a2.jpg"
              alt="Brownie triumphant"
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-xl border border-amber-400/40 object-cover"
            />
            <div>
              <p className="text-xs font-semibold tracking-wide text-amber-300">
                Balcony Victory Feast · {mins}m {secs.toString().padStart(2, '0')}s · Chaos Score {chaosScore}
              </p>
              <h2 className="font-display text-2xl font-extrabold text-[#fff8ee] sm:text-3xl">
                Binzie Crime Report Card
              </h2>
              <p className="mt-0.5 text-sm font-medium text-amber-200">{rank}</p>
            </div>
          </div>
          <Trophy className="h-8 w-8 shrink-0 text-amber-400" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            ['Items Knocked', stats.itemsKnocked],
            ['Shoulder Back-Jumps', stats.backJumps],
            ['Pigeons Hunted', stats.pigeonsHunted],
            ['Live Pigeons Caught', stats.pigeonsCaught],
            ['Pigeon Gifts Dropped', stats.giftsDelivered],
            ['402 Escalations', stats.escalationsTriggered],
            ['Hoard Stashed', stats.hoardStashed],
            ['Sofas & Posts Clawed', stats.thingsScratched],
            ['Curtains Climbed', stats.curtainsClimbed],
            ['Laptop Loafs', stats.laptopLoafs],
            ['TP Shredded', stats.tpShredded],
            ['Lasers Caught', stats.lasersCaught],
            ['Biscuits Kneaded', stats.biscuitsMade],
            ['Max Chaos Combo', `x${Math.max(1, stats.maxCombo)}`],
            ['Bucket / Box Sits', stats.bucketSits],
            ['Times Spotted', stats.timesSpotted],
          ].map(([label, val]) => (
            <div key={String(label)} className="rounded-lg border border-white/8 bg-[#19202d] px-3 py-2">
              <p className="text-[11px] text-[#a59b8d]">{label}</p>
              <p className="font-mono-tabular mt-0.5 text-lg font-bold text-[#fff8ee]">{val}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/8 bg-[#19202d] px-4 py-3 text-xs text-[#d6cdc0]">
          Heist Haul: Temptations Salmon Tin ✓ · Churu Creamy Tube ✓ · Hair-Tie Stash ✓ · Crumpled Paper Ball{' '}
          {heist.paperBallRescued ? 'Rescued ✓' : 'Left inside'}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onFreeRoam}
            className="rounded-lg border border-white/15 bg-[#1b2230] px-4 py-2 text-sm font-medium text-[#f5efe6] hover:border-amber-400/40 cursor-pointer"
          >
            Continue Free Roam
          </button>
          <button
            onClick={onPlayAgain}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-[#160f07] hover:bg-amber-400 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Play Heist Again
          </button>
        </div>
      </div>
    </div>
  );
};
