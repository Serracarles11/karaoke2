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
    previewNumber,
    remainingNumbers,
    resetGame,
    selectedSong,
    spinBall,
    spinVersion,
  } = useKaraokeGame();

  return (
    <main className="relative h-dvh overflow-hidden bg-[#08111f] text-white">
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

      <section className="relative h-dvh overflow-hidden">
        <div className="absolute inset-0">
          <BallMachine
            numbers={allNumbers}
            drawnNumbers={drawnNumbers}
            activeNumber={previewNumber}
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
            onClick={resetGame}
            className="mt-[clamp(12px,1.2vw,20px)] rounded-full border border-white/14 bg-black/24 px-[clamp(16px,1.6vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.8rem,0.95vw,1rem)] font-black text-white/88 backdrop-blur-sm transition hover:bg-black/34"
          >
            Reiniciar partida
          </button>
        </div>

        <div className="absolute bottom-[clamp(22px,3vh,34px)] left-1/2 flex w-[min(86vw,58rem)] -translate-x-1/2 flex-col items-center gap-[clamp(10px,1vw,18px)]">
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
              <p className="text-[clamp(10px,0.78vw,13px)] uppercase tracking-[0.42em] text-[#ffd58a]/76 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
                Bola Elegida
              </p>
              <p className="mt-2 text-[clamp(2.75rem,5.2vw,6rem)] font-black leading-none tracking-[-0.08em] text-[#fff0be] [text-shadow:0_4px_24px_rgba(0,0,0,0.58)]">
                {formatearNumero(currentNumber)}
              </p>
              <p className="mt-[clamp(8px,0.9vw,14px)] text-[clamp(1.2rem,1.9vw,2rem)] font-bold text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.55)]">
                {selectedSong.titulo}
              </p>
              <p className="mt-1 text-[clamp(0.85rem,1vw,1rem)] text-white/72 [text-shadow:0_3px_18px_rgba(0,0,0,0.42)]">
                {selectedSong.artista}
              </p>

              <div className="mt-[clamp(12px,1.1vw,20px)] flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/videoclip")}
                  className="rounded-full border border-[#ffd36b]/36 bg-[#ffd36b]/16 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-black text-[#fff0be] shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:bg-[#ffd36b]/22"
                >
                  Ir al videoclip
                </button>
                <button
                  type="button"
                  onClick={spinBall}
                  disabled={isSpinning || remainingNumbers.length === 0}
                  className="rounded-full border border-white/14 bg-white/8 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-semibold text-white/84 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Sacar otra bola
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
                  className="rounded-full border border-white/12 bg-white/8 px-[clamp(10px,0.9vw,14px)] py-[clamp(5px,0.55vw,8px)] text-[clamp(0.78rem,0.9vw,0.95rem)] font-semibold text-white/84 backdrop-blur-sm"
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
