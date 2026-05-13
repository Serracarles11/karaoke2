"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { canciones } from "./canciones";
import PixelCard from "./PixelCard";
import { formatearNumero, useKaraokeGame } from "./useKaraokeGame";

const SOUND_EFFECTS = [
  { id: "dramatico", label: "Dramatico", src: "/sonidos/dramatico.mp3", durationMs: 3000 },
  { id: "risa", label: "Risa", src: "/sonidos/risa.mp3", durationMs: 3000 },
  { id: "grillos", label: "Grillos", src: "/sonidos/sonido-grillos.mp3", durationMs: 3000 },
  { id: "tambores", label: "Tambores", src: "/sonidos/tambores.mp3", durationMs: 3000 },
  { id: "triste", label: "Triste", src: "/sonidos/triste.mp3", durationMs: 5000 },
] as const;

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
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const stopSoundTimeoutRef = useRef<number | null>(null);
  const currentSoundRef = useRef<string | null>(null);
  const songVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    fetch("/api/canciones-disponibles")
      .then((response) => response.json())
      .then((data: { numeros: number[] }) => setDownloadedNumbers(data.numeros))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const video = songVideoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
  }, [selectedSong?.numero]);

  useEffect(() => {
    return () => {
      if (stopSoundTimeoutRef.current !== null) {
        window.clearTimeout(stopSoundTimeoutRef.current);
      }

      for (const audio of Object.values(audioRefs.current)) {
        if (!audio) continue;
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[url('/fondo-bolas.webp')] bg-cover bg-center bg-no-repeat" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,129,86,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(91,163,255,0.16),transparent_30%),linear-gradient(180deg,rgba(5,10,20,0.34),rgba(5,10,20,0.92))]" />

      <div className="relative z-10 mx-auto h-dvh max-w-[1800px] overflow-hidden px-[clamp(14px,1.8vw,30px)] py-[clamp(14px,1.8vw,30px)]">
        <section className="grid h-[calc(100dvh-clamp(28px,3.6vw,60px))] gap-[clamp(12px,1.15vw,22px)] overflow-hidden lg:grid-cols-[1.26fr_1.34fr_0.64fr]">
          <PanelCard className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[clamp(10px,0.72vw,12px)] uppercase tracking-[0.32em] text-white/52">
                  Izquierda
                </p>
                <h2 className="mt-1 text-[clamp(1.2rem,1.7vw,2.1rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
                  Bolas Que Ya Han Salido
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <Link
                  href="/"
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
              <div className="grid h-full grid-cols-10 content-between gap-[clamp(5px,0.45vw,9px)]">
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

          <PanelCard className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[clamp(10px,0.72vw,12px)] uppercase tracking-[0.32em] text-[#ffd58a]/72">
                  Centro
                </p>
                <h2 className="mt-2 line-clamp-2 text-[clamp(1.35rem,2vw,2.6rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
                  {selectedSong?.titulo ?? "Sin cancion seleccionada"}
                </h2>
                <p className="mt-2 text-[clamp(0.88rem,1vw,1.08rem)] text-white/66">
                  {selectedSong?.artista ?? "Artista pendiente"}
                </p>
              </div>
              <div className="shrink-0 rounded-[1.4rem] bg-[#ffd36b]/10 px-[clamp(14px,1.2vw,22px)] py-[clamp(10px,1vw,16px)] text-center">
                <p className="text-[clamp(10px,0.68vw,12px)] uppercase tracking-[0.3em] text-[#ffd58a]/72">
                  Bola
                </p>
                <p className="mt-2 text-[clamp(2rem,3vw,4rem)] font-black leading-none tracking-[-0.08em] text-[#fff0be]">
                  {formatearNumero(currentNumber)}
                </p>
              </div>
            </div>

            <div className="mt-[clamp(12px,1vw,18px)] min-h-0 flex-1 overflow-hidden rounded-4xl bg-[#ff4fa0]">
              <div className="relative h-full">
                {selectedSong && downloadedNumbers.includes(selectedSong.numero) ? (
                  <video
                    ref={songVideoRef}
                    key={selectedSong.numero}
                    src={`/api/video/${selectedSong.numero}`}
                    preload="auto"
                    className="h-full w-full object-cover"
                    style={{ filter: "grayscale(1) brightness(1.15) contrast(1.8)", backgroundColor: "#000" }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center text-white/56">
                    <p className="max-w-lg text-sm leading-7">
                      No hay video descargado para esta cancion todavia.
                    </p>
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: "#ff4fa0", mixBlendMode: "lighten" }}
                />
              </div>
            </div>

            <div className="mt-[clamp(12px,1vw,18px)] flex flex-wrap gap-3">
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

          <PanelCard className="flex h-full min-h-0 flex-col overflow-hidden">
            <p className="text-[clamp(10px,0.72vw,12px)] uppercase tracking-[0.32em] text-white/52">
              Derecha
            </p>
            <h2 className="mt-2 text-[clamp(1.15rem,1.65vw,2rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
              Sonidos
            </h2>
            <p className="mt-3 text-[clamp(0.82rem,0.88vw,0.98rem)] leading-[1.5] text-white/64">
              Pulsa cualquier boton para lanzar el efecto. Cada sonido se reproduce solo unos segundos.
            </p>

            <div className="mt-[clamp(12px,1vw,18px)] flex-1 min-h-0 rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-[clamp(12px,1vw,18px)] shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
              <div className="grid h-full auto-rows-fr gap-3">
                {SOUND_EFFECTS.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => playSoundPreview(sound.id)}
                    className="group relative overflow-hidden rounded-[1.35rem] text-left transition hover:-translate-y-[1px]"
                  >
                    <PixelCard
                      variant="pink"
                      gap={8}
                      speed={48}
                      colors="#ffd0ea,#ff7ec4,#e11d8a"
                      noFocus
                      className="h-full min-h-[clamp(56px,7vh,84px)] rounded-[1.35rem] border border-[#7a2957]/75 bg-[linear-gradient(180deg,rgba(35,16,40,0.96),rgba(17,10,24,0.98))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_34px_rgba(2,6,23,0.38)]"
                    >
                      <div className="absolute inset-0 z-10 flex items-center px-[clamp(14px,1.1vw,18px)] py-[clamp(10px,0.9vw,14px)]">
                        <span>
                          <span className="block text-[clamp(0.92rem,1vw,1.08rem)] font-black tracking-[-0.03em] text-white">
                            {sound.label}
                          </span>
                          <span className="mt-1 block text-[clamp(0.72rem,0.76vw,0.84rem)] uppercase tracking-[0.22em] text-[#9bbcff]">
                            {sound.durationMs / 1000}s
                          </span>
                        </span>
                      </div>
                    </PixelCard>
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
