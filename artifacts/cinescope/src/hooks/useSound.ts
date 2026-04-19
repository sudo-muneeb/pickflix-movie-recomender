import { useRef, useCallback, useEffect } from "react";

let audioCtx: AudioContext | null = null;
let ambientGain: GainNode | null = null;
let ambientStarted = false;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function startAmbient() {
  if (ambientStarted) return;
  ambientStarted = true;
  const ctx = getAudioCtx();

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.04, ctx.currentTime);
  masterGain.connect(ctx.destination);
  ambientGain = masterGain;

  function makeLayer(freq: number, detune: number, amp: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.detune.setValueAtTime(detune, ctx.currentTime);
    gain.gain.setValueAtTime(amp, ctx.currentTime);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    return osc;
  }

  makeLayer(40, 0, 0.5);
  makeLayer(80, -8, 0.25);
  makeLayer(160, 5, 0.12);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.setValueAtTime(0.07, ctx.currentTime);
  lfoGain.gain.setValueAtTime(0.018, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start();

  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 3);
}

export function useSound() {
  const startedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    try {
      startAmbient();
    } catch (_) {}
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (_) {}
  }, []);

  const playHover = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (_) {}
  }, []);

  useEffect(() => {
    return () => {
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
        ambientGain = null;
        ambientStarted = false;
      }
    };
  }, []);

  return { initAudio, playClick, playHover };
}
