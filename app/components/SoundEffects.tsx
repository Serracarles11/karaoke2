"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useBackgroundMusic } from "./BackgroundMusicProvider";

const SOUND_EFFECTS = [
  {
    id: "dramatico",
    label: "Dramatico",
    src: "/sonidos/dramatico.mp3",
    durationMs: 3000,
    gainMultiplier: 4,
    iconSrc: "/botones/drama.svg",
  },
  {
    id: "risa",
    label: "Risa",
    src: "/sonidos/risa.mp3",
    durationMs: 3000,
    gainMultiplier: 2.6,
    iconSrc: "/botones/risa.svg",
  },
  {
    id: "grillos",
    label: "Grillos",
    src: "/sonidos/sonido-grillos.mp3",
    durationMs: 3000,
    gainMultiplier: 2.6,
    iconSrc: "/botones/grillo.svg",
  },
  {
    id: "tambores",
    label: "Tambores",
    src: "/sonidos/tambores.mp3",
    durationMs: 3000,
    gainMultiplier: 2.6,
    iconSrc: "/botones/tambores.svg",
  },
  {
    id: "triste",
    label: "Triste",
    src: "/sonidos/triste.mp3",
    durationMs: 5000,
    gainMultiplier: 2.6,
    iconSrc: "/botones/triste.svg",
  },
  {
    id: "tongo",
    label: "Tongo",
    src: "/sonidos/tongo.mp3",
    durationMs: 5700,
    gainMultiplier: 4,
    emoji: "🤥",
  },
  {
    id: "aplausos",
    label: "Aplausos",
    src: "/sonidos/aplausos.mp3",
    durationMs: 17750,
    gainMultiplier: 2.6,
    emoji: "👏",
  },
] as const;

type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export function useSoundEffects() {
  const { duckBackgroundMusic, restoreBackgroundMusicVolume } = useBackgroundMusic();
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode>>({});
  const stopSoundTimeoutRef = useRef<number | null>(null);
  const currentSoundRef = useRef<string | null>(null);

  useEffect(() => {
    const audioElements = audioRefs.current;

    return () => {
      if (stopSoundTimeoutRef.current !== null) {
        window.clearTimeout(stopSoundTimeoutRef.current);
      }

      for (const audio of Object.values(audioElements)) {
        if (!audio) continue;
        audio.pause();
        audio.currentTime = 0;
      }

      restoreBackgroundMusicVolume();
      void audioContextRef.current?.close().catch(() => {});
    };
  }, [restoreBackgroundMusicVolume]);

  function ensureBoostedAudioNode(
    soundId: string,
    audio: HTMLAudioElement,
    gainMultiplier: number,
  ) {
    const browserWindow = window as WindowWithWebkitAudioContext;
    const AudioContextCtor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
    if (!AudioContextCtor) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    const audioContext = audioContextRef.current;
    if (!mediaSourceNodesRef.current[soundId]) {
      const sourceNode = audioContext.createMediaElementSource(audio);
      const gainNode = audioContext.createGain();
      gainNode.gain.value = gainMultiplier;
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      mediaSourceNodesRef.current[soundId] = sourceNode;
    }
  }

  function playSound(soundId: string) {
    const audio = audioRefs.current[soundId];
    const sound = SOUND_EFFECTS.find((item) => item.id === soundId);
    if (!audio || !sound) return;

    if (stopSoundTimeoutRef.current !== null) {
      window.clearTimeout(stopSoundTimeoutRef.current);
      stopSoundTimeoutRef.current = null;
    }

    if (currentSoundRef.current) {
      const currentAudio = audioRefs.current[currentSoundRef.current];
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    currentSoundRef.current = soundId;
    duckBackgroundMusic();
    audio.currentTime = 0;
    audio.volume = 1;
    ensureBoostedAudioNode(soundId, audio, sound.gainMultiplier);

    if (audioContextRef.current?.state === "suspended") {
      void audioContextRef.current.resume().catch(() => {});
    }

    void audio.play().catch(() => {});

    stopSoundTimeoutRef.current = window.setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
      stopSoundTimeoutRef.current = null;
      if (currentSoundRef.current === soundId) {
        currentSoundRef.current = null;
      }
      restoreBackgroundMusicVolume();
    }, sound.durationMs);
  }

  const soundAudioElements = SOUND_EFFECTS.map((sound) => (
    <audio
      key={sound.id}
      ref={(element) => {
        audioRefs.current[sound.id] = element;
      }}
      preload="auto"
      src={sound.src}
    />
  ));

  return { playSound, soundAudioElements };
}

export function SoundEffectControls({
  onPlaySound,
  variant,
}: {
  onPlaySound: (soundId: string) => void;
  variant: "panel" | "bombo";
}) {
  const isBombo = variant === "bombo";

  return (
    <div
      className={
        isBombo
          ? "tv-glass-button rounded-[1.2rem] border border-white/10 bg-black/24 p-[clamp(8px,0.8vw,12px)] shadow-[0_16px_48px_rgba(0,0,0,0.24)]"
          : ""
      }
    >
      {isBombo ? (
        <p className="mb-2 text-[clamp(9px,0.72vw,12px)] uppercase tracking-[0.28em] text-[#ffd58a]/72 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
          Efectos
        </p>
      ) : null}
      <div
        className={`tv-sound-grid grid content-start ${
          isBombo
            ? "grid-cols-1 gap-[clamp(6px,0.55vw,10px)]"
            : "mt-[clamp(34px,5vh,72px)] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1"
        }`}
        style={isBombo ? undefined : { gap: "clamp(28px, 3vh, 46px)" }}
      >
        {SOUND_EFFECTS.map((sound) => (
          <button
            key={sound.id}
            type="button"
            onClick={() => onPlaySound(sound.id)}
            className="group relative overflow-hidden rounded-[1.1rem] transition hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#120b1a]"
            aria-label={`Reproducir ${sound.label}`}
            title={sound.label}
          >
            <div
              className={`relative overflow-visible rounded-[0.9rem] border border-white/0 bg-transparent p-0 shadow-none ${
                isBombo ? "h-[clamp(38px,4.2vw,58px)] w-[clamp(38px,4.2vw,58px)]" : "h-[clamp(58px,7.2vh,90px)]"
              }`}
            >
              {"iconSrc" in sound ? (
                <Image
                  src={sound.iconSrc}
                  alt={sound.label}
                  fill
                  sizes={isBombo ? "64px" : "(max-width: 1024px) 40vw, 18vw"}
                  className="scale-[0.9] object-contain p-0 transition duration-200 group-hover:scale-[0.94]"
                />
              ) : (
                <span
                  className={`grid h-full w-full place-items-center ${
                    isBombo ? "text-[clamp(1.55rem,2.7vw,2.5rem)]" : "text-[clamp(2.4rem,5vh,4rem)]"
                  }`}
                  aria-hidden="true"
                >
                  {sound.emoji}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
