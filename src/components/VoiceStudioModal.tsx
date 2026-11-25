import { Mic, Play, Square, Trash2, Upload, Volume2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { CatAudioEngine } from '../game/audio/CatAudioEngine';
import { AUDIO_SLOT_META, type AudioManifest, type BrownieAudioSlot } from '../game/types';

interface VoiceStudioModalProps {
  audioEngine: CatAudioEngine;
  manifest: AudioManifest;
  onManifestUpdated: (m: AudioManifest) => void;
  onClose: () => void;
}

export const VoiceStudioModal: React.FC<VoiceStudioModalProps> = ({
  audioEngine,
  manifest,
  onManifestUpdated,
  onClose,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<BrownieAudioSlot>('demand_meow');
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [draftTrimStart, setDraftTrimStart] = useState(0);
  const [draftTrimEnd, setDraftTrimEnd] = useState<string>('');
  const [draftLabel, setDraftLabel] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const uploadBlob = async (blob: Blob, ext: string, defaultLabel: string) => {
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read audio file'));
        reader.readAsDataURL(blob);
      });
      const base64 = dataUrl.split(',')[1] || '';
      const parsedEnd = draftTrimEnd.trim() ? Number(draftTrimEnd) : null;

      const res = await fetch('/api/brownie-audio/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: selectedSlot,
          label: draftLabel.trim() || defaultLabel,
          ext,
          dataBase64: base64,
          trimStart: draftTrimStart,
          trimEnd: parsedEnd && Number.isFinite(parsedEnd) && parsedEnd > draftTrimStart ? parsedEnd : null,
        }),
      });
      const json = (await res.json()) as { manifest?: AudioManifest; error?: string };
      if (!res.ok || !json.manifest) {
        throw new Error(json.error || 'Upload failed');
      }
      audioEngine.setManifest(json.manifest);
      onManifestUpdated(json.manifest);
      setDraftLabel('');
      setDraftTrimStart(0);
      setDraftTrimEnd('');
      setStatusMsg('Saved straight to /public/audio/brownie/ for your GitHub repo.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save clip');
    } finally {
      setBusy(false);
    }
  };

  const handleFilePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
    await uploadBlob(file, ext, file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const startRecording = async () => {
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        const ext = mr.mimeType.includes('ogg') ? 'ogg' : 'webm';
        void uploadBlob(blob, ext, `Brownie Mic ${new Date().toLocaleTimeString()}`);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = window.setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      setErrorMsg('Microphone permission denied or unavailable. You can upload .mp3/.wav/.m4a files anytime.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleDelete = async (slot: BrownieAudioSlot, id: string) => {
    setBusy(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/brownie-audio/${slot}/${id}`, { method: 'DELETE' });
      const json = (await res.json()) as { manifest?: AudioManifest; error?: string };
      if (!res.ok || !json.manifest) throw new Error(json.error || 'Delete failed');
      audioEngine.setManifest(json.manifest);
      onManifestUpdated(json.manifest);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const currentMeta = AUDIO_SLOT_META.find((m) => m.slot === selectedSlot)!;
  const slotClips = manifest[selectedSlot] || [];

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-[#06080d]/80 p-4">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/15 bg-[#121720] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#fff8ee]">Brownie Voice Studio</h2>
            <p className="text-xs text-[#b5aa99]">
              Record Brownie live or upload .mp3 / .wav / .m4a clips. Saved directly into your repo.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Voice Studio"
            className="rounded-lg p-2 text-[#b5aa99] transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
          {/* Slot selector */}
          <div className="studio-scroll overflow-y-auto border-b border-white/10 p-4 md:col-span-5 md:border-r md:border-b-0">
            <div className="space-y-2">
              {AUDIO_SLOT_META.map((item) => {
                const count = manifest[item.slot]?.length || 0;
                const active = item.slot === selectedSlot;
                return (
                  <button
                    key={item.slot}
                    onClick={() => setSelectedSlot(item.slot)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-amber-400/60 bg-amber-500/12 text-[#fff8ee]'
                        : 'border-white/8 bg-[#181e2a] text-[#d3cabd] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{item.title}</span>
                      <span className="font-mono-tabular text-xs text-amber-300">
                        {count > 0 ? `${count} real` : 'synth'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#9e9486]">{item.cue}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected slot controls & clips */}
          <div className="studio-scroll flex flex-col gap-4 overflow-y-auto p-6 md:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold text-[#fff8ee]">{currentMeta.title}</h3>
                <p className="text-xs text-[#a99f90]">{currentMeta.cue}</p>
              </div>
              <button
                onClick={() => void audioEngine.playSlot(selectedSlot)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/25 whitespace-nowrap cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                Test In-Game Sound
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-lg border border-white/10 bg-[#181e2a] p-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-[#b5aa99]">Clip Label</label>
                <input
                  type="text"
                  value={draftLabel}
                  onChange={(e) => setDraftLabel(e.target.value)}
                  placeholder="e.g. Loud Dinner Scream"
                  className="mt-1 w-full rounded-md border border-white/12 bg-[#0f141c] px-2.5 py-1.5 text-xs text-white placeholder-[#6d6559] focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#b5aa99]">Trim Start (sec)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={draftTrimStart}
                  onChange={(e) => setDraftTrimStart(Math.max(0, Number(e.target.value) || 0))}
                  className="font-mono-tabular mt-1 w-full rounded-md border border-white/12 bg-[#0f141c] px-2.5 py-1.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-[#b5aa99]">Trim End (optional)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={draftTrimEnd}
                  onChange={(e) => setDraftTrimEnd(e.target.value)}
                  placeholder="Full"
                  className="font-mono-tabular mt-1 w-full rounded-md border border-white/12 bg-[#0f141c] px-2.5 py-1.5 text-xs text-white placeholder-[#6d6559] focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!recording ? (
                <button
                  disabled={busy}
                  onClick={() => void startRecording()}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-[#160f07] hover:bg-amber-400 disabled:opacity-50 cursor-pointer"
                >
                  <Mic className="h-4 w-4" />
                  Record Brownie Live
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 cursor-pointer"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  Stop &amp; Save ({recSeconds}s)
                </button>
              )}

              <button
                disabled={busy || recording}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#1b2230] px-4 py-2 text-xs font-semibold text-[#f5efe6] hover:border-amber-400/50 disabled:opacity-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 text-amber-400" />
                Upload Audio File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.m4a,.mp3,.wav,.ogg,.webm"
                onChange={(e) => void handleFilePick(e)}
                className="hidden"
              />
            </div>

            {errorMsg && <p className="text-xs font-medium text-rose-400">{errorMsg}</p>}
            {statusMsg && <p className="text-xs font-medium text-emerald-400">{statusMsg}</p>}

            <div className="space-y-2 border-t border-white/10 pt-3">
              <p className="text-xs font-semibold text-[#c5bba9]">
                Saved Clips for {currentMeta.title} ({slotClips.length})
              </p>
              {slotClips.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-[#8f8678]">
                  No custom clips saved yet—currently using the procedural cat vocal fallback. Add one or
                  more clips of Brownie and the game will pick randomly between them!
                </p>
              ) : (
                slotClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#181e2a] px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#fff8ee]">{clip.label}</p>
                      <p className="font-mono-tabular text-xs text-[#9e9486]">
                        Trim: {clip.trimStart.toFixed(1)}s → {clip.trimEnd ? `${clip.trimEnd.toFixed(1)}s` : 'end'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => void audioEngine.previewClip(clip.url, clip.trimStart, clip.trimEnd)}
                        aria-label={`Preview ${clip.label}`}
                        className="rounded-md border border-white/10 bg-[#10151e] p-1.5 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => void handleDelete(selectedSlot, clip.id)}
                        aria-label={`Delete ${clip.label}`}
                        className="rounded-md border border-white/10 bg-[#10151e] p-1.5 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
