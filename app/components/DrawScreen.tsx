"use client";

import { useRouter } from "next/navigation";
import BallMachine from "./BallMachine";
import { formatearNumero, useKaraokeGame } from "./useKaraokeGame";

export default function DrawScreen() {
  const router = useRouter();
  const {
    allNumbers,
    currentNumber,
    drawnNumbers,
    isSpinning,
    remainingNumbers,
    selectedSong,
    spinBall,
    spinVersion,
  } = useKaraokeGame();

  return (
    <main className="screen-shell relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/fondo.webm" type="video/webm" />
        <source src="/fondo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,129,86,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(91,163,255,0.16),transparent_30%),linear-gradient(180deg,rgba(5,10,20,0.16),rgba(5,10,20,0.72))]" />

      <section className="screen-fill relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <BallMachine
            numbers={allNumbers}
            drawnNumbers={drawnNumbers}
            selectedNumber={currentNumber}
            spinVersion={spinVersion}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,214,107,0.05),transparent_24%),linear-gradient(180deg,rgba(2,7,14,0.04),rgba(2,7,14,0.18))]" />

        <div className="absolute left-[clamp(16px,2vw,40px)] top-[clamp(16px,2vw,40px)] max-w-[min(36vw,38rem)]">
          <p className="text-[clamp(10px,0.8vw,13px)] uppercase tracking-[0.46em] text-[#ffd58a]/76 [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
            Karaoke Bingo
          </p>
        </div>

        <div className="absolute right-[clamp(16px,2vw,40px)] top-[clamp(16px,2vw,40px)] text-right">
          <p className="text-[clamp(10px,0.75vw,13px)] uppercase tracking-[0.34em] text-white/55 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
            Restantes
          </p>
          <p className="mt-2 text-[clamp(2.25rem,4.4vw,5rem)] font-black leading-none tracking-[-0.08em] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.55)]">
            {remainingNumbers.length}
          </p>
          <p className="mt-[clamp(10px,1vw,16px)] text-[clamp(10px,0.75vw,13px)] uppercase tracking-[0.34em] text-white/45 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
            Ultima Bola
          </p>
          <p className="mt-2 text-[clamp(2rem,3.7vw,4.2rem)] font-black leading-none tracking-[-0.08em] text-[#fff0be] [text-shadow:0_4px_24px_rgba(0,0,0,0.55)]">
            {formatearNumero(currentNumber)}
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Ir a pantalla de carga"
            title="Ir a pantalla de carga"
            className="mt-[clamp(12px,1.2vw,20px)] rounded-full border border-white/8 bg-black/10 px-[clamp(8px,0.8vw,12px)] py-[clamp(4px,0.5vw,6px)] text-[clamp(0.55rem,0.65vw,0.7rem)] font-medium uppercase tracking-[0.18em] text-white/22 opacity-30 backdrop-blur-sm transition hover:bg-black/34 hover:text-white/80 hover:opacity-100"
          >
            Pantalla de carga
          </button>
        </div>

        {currentNumber !== null && selectedSong ? (
          <div className="absolute left-1/2 top-[clamp(18px,2.2vw,42px)] z-10 w-[min(78vw,72rem)] -translate-x-1/2 px-4 text-center">
            <p className="text-[clamp(11px,0.82vw,14px)] uppercase tracking-[0.42em] text-[#ffd58a]/76 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
              Cancion Elegida
            </p>
            <p className="mt-3 text-[clamp(2rem,3.8vw,4.4rem)] font-black leading-[0.94] tracking-[-0.08em] text-white [text-shadow:0_5px_28px_rgba(0,0,0,0.62)]">
              {selectedSong.titulo}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.15vw,1.2rem)] font-medium text-white/76 [text-shadow:0_3px_18px_rgba(0,0,0,0.42)]">
              {selectedSong.artista}
            </p>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-[clamp(22px,3vh,34px)] px-4">
          <div className="tv-draw-center mx-auto flex w-full max-w-[58rem] flex-col items-center gap-[clamp(10px,1vw,18px)]">
            <button
              type="button"
              onClick={spinBall}
              disabled={isSpinning || remainingNumbers.length === 0}
              className="rounded-full bg-[linear-gradient(135deg,#ffd36b,#ff8c59)] px-[clamp(24px,2.2vw,38px)] py-[clamp(12px,1.25vw,18px)] text-[clamp(0.95rem,1.15vw,1.2rem)] font-black text-[#1f1305] shadow-[0_10px_40px_rgba(255,146,89,0.32)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {remainingNumbers.length === 0
                ? "No quedan bolas"
                : isSpinning
                  ? "Eligiendo bola..."
                  : "Sacar bola"}
            </button>

            {currentNumber !== null && selectedSong ? (
              <div className="w-full text-center">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/videoclip")}
                    className="tv-glass-button rounded-full border border-[#ffd36b]/36 bg-[#ffd36b]/16 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-black text-[#fff0be] shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:bg-[#ffd36b]/22"
                  >
                    Ir al videoclip
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="tv-glass-button rounded-full border border-white/14 bg-white/8 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-semibold text-white/84 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Pantalla de carga
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-[clamp(0.85rem,1vw,1rem)] leading-[1.6] text-white/66 [text-shadow:0_3px_18px_rgba(0,0,0,0.42)]">
                  El acceso al videoclip aparecera cuando ya haya salido una bola.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-[clamp(18px,2.4vh,30px)] left-[clamp(16px,2vw,40px)] max-w-[min(28vw,26rem)]">
          <div className="flex flex-wrap gap-2">
            {drawnNumbers.length === 0 ? (
              <p className="text-[clamp(0.8rem,0.92vw,0.95rem)] leading-[1.5] text-white/58 [text-shadow:0_3px_18px_rgba(0,0,0,0.45)]">
                Aun no ha salido ninguna bola.
              </p>
            ) : (
              drawnNumbers.slice(-12).map((number) => (
                <span
                  key={number}
                  className="tv-glass-button rounded-full border border-white/12 bg-white/8 px-[clamp(10px,0.9vw,14px)] py-[clamp(5px,0.55vw,8px)] text-[clamp(0.78rem,0.9vw,0.95rem)] font-semibold text-white/84 backdrop-blur-sm"
                >
                  {number.toString().padStart(2, "0")}
                </span>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
