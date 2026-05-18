"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { canciones } from "./canciones";
import { formatearNumero, useKaraokeGame } from "./useKaraokeGame";

const SOUND_EFFECTS = [
  {
    id: "dramatico",
    label: "Dramatico",
    src: "/sonidos/dramatico.mp3",
    durationMs: 3000,
    iconSrc: "/botones/drama.svg",
  },
  {
    id: "risa",
    label: "Risa",
    src: "/sonidos/risa.mp3",
    durationMs: 3000,
    iconSrc: "/botones/risa.svg",
  },
  {
    id: "grillos",
    label: "Grillos",
    src: "/sonidos/sonido-grillos.mp3",
    durationMs: 3000,
    iconSrc: "/botones/grillo.svg",
  },
  {
    id: "tambores",
    label: "Tambores",
    src: "/sonidos/tambores.mp3",
    durationMs: 3000,
    iconSrc: "/botones/tambores.svg",
  },
  {
    id: "triste",
    label: "Triste",
    src: "/sonidos/triste.mp3",
    durationMs: 5000,
    iconSrc: "/botones/triste.svg",
  },
] as const;

const SOUND_GAIN_MULTIPLIER = 1.8;

const VIDEO_FRAME_OVERRIDES: Partial<
  Record<
    number,
    {
      scale: number;
      translateXPercent: number;
      translateYPercent?: number;
    }
  >
> = {
  // Some downloaded karaoke videos are exported with the lyric column pushed to one side.
  // These overrides let the frame be re-centered per song without breaking the default layout.
  26: { scale: 1.18, translateXPercent: -14 },
};

const DEFAULT_VIDEO_FRAME = {
  scale: 1.22,
  translateXPercent: -18,
  translateYPercent: 0,
} as const;

type CancionesManifest = {
  canciones: Array<{
    numero: number;
    src: string;
  }>;
};

type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

export default function DetailScreen() {
  const {
    allNumbers,
    currentNumber,
    drawnNumbersSet,
    resetGame,
    selectDrawnSong,
    selectedSong,
  } = useKaraokeGame();
  const [downloadedNumbers, setDownloadedNumbers] = useState<number[]>([]);
  const [videoSources, setVideoSources] = useState<Record<number, string>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Record<string, GainNode>>({});
  const mediaSourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode>>({});
  const stopSoundTimeoutRef = useRef<number | null>(null);
  const currentSoundRef = useRef<string | null>(null);
  const songVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch("/canciones-manifest.json", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: CancionesManifest) => {
        const availableSongs = data.canciones ?? [];
        setDownloadedNumbers(availableSongs.map((song) => song.numero));
        setVideoSources(
          Object.fromEntries(availableSongs.map((song) => [song.numero, song.src])),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const video = songVideoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  }, [selectedSong?.numero]);

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

      void audioContextRef.current?.close().catch(() => {});
    };
  }, []);

  function ensureBoostedAudioNode(soundId: string, audio: HTMLAudioElement) {
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
      gainNode.gain.value = SOUND_GAIN_MULTIPLIER;
      sourceNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      mediaSourceNodesRef.current[soundId] = sourceNode;
      gainNodesRef.current[soundId] = gainNode;
    }
  }

  function playSoundPreview(soundId: string) {
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
    audio.currentTime = 0;
    audio.volume = 1;
    ensureBoostedAudioNode(soundId, audio);

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
    }, sound.durationMs);
  }

  function playSong() {
    const video = songVideoRef.current;
    if (!video) return;
    void video.play().catch(() => {});
  }

  function pauseSong() {
    songVideoRef.current?.pause();
  }

  function restartSong() {
    const video = songVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }

  const videoFrame =
    selectedSong ? (VIDEO_FRAME_OVERRIDES[selectedSong.numero] ?? DEFAULT_VIDEO_FRAME) : DEFAULT_VIDEO_FRAME;
  const videoTransform = `translate(${videoFrame.translateXPercent}%, ${videoFrame.translateYPercent ?? 0}%) scale(${videoFrame.scale})`;

  return (
    <main className="screen-shell relative min-h-screen overflow-x-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[url('/fondo-bolas.webp')] bg-cover bg-center bg-no-repeat" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,129,86,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(91,163,255,0.16),transparent_30%),linear-gradient(180deg,rgba(5,10,20,0.34),rgba(5,10,20,0.92))]" />

      <div className="screen-stage relative z-10 mx-auto max-w-[1800px] px-[clamp(14px,1.8vw,30px)] py-[clamp(14px,1.8vw,30px)]">
        <section className="tv-detail-grid grid min-h-screen gap-[clamp(12px,1.15vw,22px)] pb-4 lg:grid-cols-[1fr_1.3fr] xl:h-[calc(100vh-clamp(28px,3.6vw,60px))] xl:grid-cols-[1.08fr_1.45fr_0.72fr] xl:overflow-hidden">
          <PanelCard className="tv-card flex min-h-0 flex-col overflow-hidden xl:h-full">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[clamp(10px,0.72vw,12px)] uppercase tracking-[0.32em] text-white/52">
                  Izquierda
                </p>
                <h2 className="mt-1 text-[clamp(1.2rem,1.7vw,2.1rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
                  Bolas Que Ya Han Salido
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <Link
                  href="/bombo"
                  className="rounded-full bg-white/8 px-[clamp(14px,1.1vw,20px)] py-[clamp(8px,0.8vw,12px)] text-[clamp(0.8rem,0.9vw,0.98rem)] font-semibold text-white/82 transition hover:bg-white/12"
                >
                  Volver al bombo
                </Link>
                <button
                  type="button"
                  onClick={resetGame}
                  className="rounded-full bg-black/24 px-[clamp(14px,1.1vw,20px)] py-[clamp(8px,0.8vw,12px)] text-[clamp(0.8rem,0.9vw,0.98rem)] font-black text-white/88 transition hover:bg-black/34"
                >
                  Reiniciar partida
                </button>
              </div>
            </div>

            <div className="mt-[clamp(12px,1vw,18px)] flex-1 min-h-0 rounded-[2rem] bg-[rgba(8,18,40,0.78)] p-[clamp(10px,0.9vw,16px)] shadow-[0_22px_60px_rgba(4,10,24,0.38)]">
              <div className="grid grid-cols-5 gap-[clamp(5px,0.45vw,9px)] sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:h-full xl:content-between">
                {allNumbers.map((number) => {
                  const song = canciones[number];
                  const isDrawn = drawnNumbersSet.has(number);
                  const active = currentNumber === number;

                  return (
                    <button
                      key={number}
                      type="button"
                      onClick={() => selectDrawnSong(number)}
                      disabled={!isDrawn || !song}
                      className={`aspect-square min-h-[clamp(2rem,2.35vw,2.9rem)] rounded-full text-center transition ${
                        active
                          ? "bg-[#ff4fa0] text-white shadow-[0_10px_30px_rgba(255,79,160,0.28)]"
                        : isDrawn
                          ? "bg-[#d9aa2b] text-[#1c1203] shadow-[0_10px_30px_rgba(255,211,107,0.2)] hover:brightness-105"
                          : "bg-black/72 text-white"
                      } ${isDrawn ? "cursor-pointer" : "cursor-default"} p-0.5`}
                    >
                      <span className="block text-[clamp(0.82rem,1vw,1.18rem)] font-black tracking-[-0.08em]">
                        {number.toString().padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </PanelCard>

          <PanelCard className="tv-card flex min-h-0 flex-col overflow-hidden xl:h-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="text-[clamp(10px,0.72vw,12px)] uppercase tracking-[0.32em] text-[#ffd58a]/72">
                  Centro
                </p>
                <h2 className="mt-2 text-[clamp(1.35rem,2vw,2.6rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
                  {selectedSong?.titulo ?? "Sin cancion seleccionada"}
                </h2>
                <p className="mt-2 text-[clamp(0.88rem,1vw,1.08rem)] text-white/66">
                  {selectedSong?.artista ?? "Artista pendiente"}
                </p>
              </div>
              <div className="w-fit shrink-0 rounded-[1.4rem] bg-[#ffd36b]/10 px-[clamp(14px,1.2vw,22px)] py-[clamp(10px,1vw,16px)] text-center">
                <p className="text-[clamp(10px,0.68vw,12px)] uppercase tracking-[0.3em] text-[#ffd58a]/72">
                  Bola
                </p>
                <p className="mt-2 text-[clamp(2rem,3vw,4rem)] font-black leading-none tracking-[-0.08em] text-[#fff0be]">
                  {formatearNumero(currentNumber)}
                </p>
              </div>
            </div>

            <div className="mt-[clamp(8px,0.7vw,14px)] min-h-0 flex-1 overflow-hidden rounded-4xl">
              <div
                className="tv-video-shell relative flex aspect-video min-h-[240px] items-center justify-center overflow-hidden bg-black md:min-h-[320px] xl:h-full xl:min-h-0"
                style={{ isolation: "isolate" }}
              >
                {selectedSong && downloadedNumbers.includes(selectedSong.numero) ? (
                  <div className="tv-video-frame flex h-full w-full items-center justify-center p-[clamp(14px,2.2vw,28px)]">
                    <video
                      ref={songVideoRef}
                      key={selectedSong.numero}
                      src={videoSources[selectedSong.numero]}
                      preload="auto"
                      className="tv-video-element h-full w-full object-contain object-center"
                      playsInline
                      style={{
                        backgroundColor: "#000",
                        transform: videoTransform,
                        transformOrigin: "center center",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center text-white/56">
                    <p className="max-w-lg text-sm leading-7">
                      No hay video descargado para esta cancion todavia.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[clamp(8px,0.7vw,14px)] flex flex-wrap gap-3">
              <button
                type="button"
                onClick={playSong}
                className="rounded-full bg-[#ffd36b]/18 px-[clamp(16px,1.2vw,22px)] py-[clamp(10px,0.9vw,14px)] text-[clamp(0.82rem,0.92vw,1rem)] font-semibold text-[#fff0be] transition hover:bg-[#ffd36b]/26"
              >
                Empezar cancion
              </button>
              <button
                type="button"
                onClick={pauseSong}
                className="rounded-full bg-white/8 px-[clamp(16px,1.2vw,22px)] py-[clamp(10px,0.9vw,14px)] text-[clamp(0.82rem,0.92vw,1rem)] font-semibold text-white/86 transition hover:bg-white/12"
              >
                Parar
              </button>
              <button
                type="button"
                onClick={restartSong}
                className="rounded-full bg-white/8 px-[clamp(16px,1.2vw,22px)] py-[clamp(10px,0.9vw,14px)] text-[clamp(0.82rem,0.92vw,1rem)] font-semibold text-white/86 transition hover:bg-white/12"
              >
                Volver a empezar
              </button>
            </div>
          </PanelCard>

          <PanelCard className="tv-card flex min-h-0 flex-col overflow-hidden lg:col-span-2 xl:col-span-1 xl:h-full">
            <div className="flex-1 min-h-0 rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-[clamp(12px,1vw,18px)] shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
              <div className="tv-sound-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:h-full xl:auto-rows-fr xl:grid-cols-1">
                {SOUND_EFFECTS.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => playSoundPreview(sound.id)}
                    className="group relative overflow-hidden rounded-[1.35rem] transition hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#120b1a]"
                    aria-label={`Reproducir ${sound.label}`}
                  >
                    <div className="relative h-full min-h-[clamp(56px,7vh,84px)] overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/24 p-[clamp(8px,0.8vw,12px)] shadow-[0_14px_34px_rgba(2,6,23,0.38)]">
                      <Image
                        src={sound.iconSrc}
                        alt={sound.label}
                        fill
                        sizes="(max-width: 1024px) 40vw, 18vw"
                        className="scale-[0.8] object-contain p-[clamp(8px,0.8vw,12px)] transition duration-200 group-hover:scale-[0.84]"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {SOUND_EFFECTS.map((sound) => (
              <audio
                key={sound.id}
                ref={(element) => {
                  audioRefs.current[sound.id] = element;
                }}
                preload="auto"
                src={sound.src}
              />
            ))}
          </PanelCard>
        </section>
      </div>
    </main>
  );
}

function PanelCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`rounded-[2.1rem] bg-transparent p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6 ${className}`}
    >
      {children}
    </article>
  );
}
