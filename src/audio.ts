import * as Tone from 'tone';

let crunchSynth: Tone.MembraneSynth | null = null;
let noisePopSynth: Tone.NoiseSynth | null = null;
let sickSynth: Tone.MonoSynth | null = null;
let victorySynth: Tone.PolySynth | null = null;
let isAudioInitialized = false;
let isMuted = false;

export function getIsMuted(): boolean {
  return isMuted;
}

export function setIsMuted(muted: boolean): void {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('hamster_game_muted', muted ? 'true' : 'false');
  }
}

export function loadMutePreference(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('hamster_game_muted');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  }
  return isMuted;
}

export async function initAudio(): Promise<void> {
  if (isMuted) return;
  try {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (!noisePopSynth) {
      noisePopSynth = new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0 },
      }).toDestination();
      noisePopSynth.volume.value = -4;
    }
    if (!crunchSynth) {
      crunchSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 3,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
      }).toDestination();
      crunchSynth.volume.value = -3;
    }
    if (!sickSynth) {
      sickSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 3, type: 'lowpass' },
        envelope: { attack: 0.02, decay: 0.35, sustain: 0.1, release: 0.2 },
        filterEnvelope: { attack: 0.01, decay: 0.25, baseFrequency: 140, octaves: 3 },
      }).toDestination();
      sickSynth.volume.value = -2;
    }
    if (!victorySynth) {
      victorySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.4 },
      }).toDestination();
      victorySynth.volume.value = -6;
    }
    isAudioInitialized = true;
  } catch (err) {
    console.warn('Audio init warning:', err);
  }
}

export function playMunchSound(isGold = false): void {
  if (isMuted) return;
  try {
    if (!isAudioInitialized) {
      initAudio();
    }
    const now = Tone.now();
    if (noisePopSynth && crunchSynth) {
      if (isGold) {
        noisePopSynth.triggerAttackRelease('0.04', now);
        crunchSynth.triggerAttackRelease('C5', '0.04', now);

        noisePopSynth.triggerAttackRelease('0.04', now + 0.06);
        crunchSynth.triggerAttackRelease('E5', '0.04', now + 0.06);

        noisePopSynth.triggerAttackRelease('0.04', now + 0.12);
        crunchSynth.triggerAttackRelease('G5', '0.05', now + 0.12);

        noisePopSynth.triggerAttackRelease('0.04', now + 0.18);
        crunchSynth.triggerAttackRelease('C6', '0.06', now + 0.18);
      } else {
        noisePopSynth.triggerAttackRelease('0.03', now);
        crunchSynth.triggerAttackRelease('G4', '0.04', now);

        noisePopSynth.triggerAttackRelease('0.03', now + 0.07);
        crunchSynth.triggerAttackRelease('C5', '0.04', now + 0.07);

        noisePopSynth.triggerAttackRelease('0.03', now + 0.14);
        crunchSynth.triggerAttackRelease('E5', '0.04', now + 0.14);
      }
    }
  } catch {
    // Ignore audio errors gracefully
  }
}

export function playSickSound(): void {
  if (isMuted) return;
  try {
    if (!isAudioInitialized) {
      initAudio();
    }
    if (sickSynth) {
      sickSynth.triggerAttackRelease('G2', '0.45');
      setTimeout(() => {
        try {
          sickSynth?.triggerAttackRelease('Eb2', '0.5');
        } catch {}
      }, 160);
    }
  } catch {
    // Ignore audio errors gracefully
  }
}

export function playVictorySound(): void {
  if (isMuted) return;
  try {
    if (!isAudioInitialized) {
      initAudio();
    }
    if (victorySynth) {
      const now = Tone.now();
      victorySynth.triggerAttackRelease(['C4', 'E4', 'G4'], '0.15', now);
      victorySynth.triggerAttackRelease(['E4', 'G4', 'C5'], '0.15', now + 0.16);
      victorySynth.triggerAttackRelease(['G4', 'C5', 'E5'], '0.15', now + 0.32);
      victorySynth.triggerAttackRelease(['C5', 'E5', 'G5', 'C6'], '0.45', now + 0.48);
    }
  } catch {
    // Ignore audio errors gracefully
  }
}
