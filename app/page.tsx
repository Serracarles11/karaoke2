"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { canciones, type Cancion } from "./components/canciones";

function formatearNumero(value: number | null) {
  return value === null ? "--" : value.toString().padStart(2, "0");
}


export default function Home() {
  const [numerosDisponibles, setNumerosDisponibles] = useState<number[]>([]);
  const [numerosSalidos, setNumerosSalidos] = useState<number[]>([]);
  const [numeroActual, setNumeroActual] = useState<number | null>(null);
  const [cancionSeleccionada, setCancionSeleccionada] = useState<Cancion | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSongStarted, setIsSongStarted] = useState(false);
  const [bomboRotation, setBomboRotation] = useState(0);

  const spinTimeoutRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const numerosRestantes = useMemo(
    () => numerosDisponibles.filter((value) => !numerosSalidos.includes(value)),
    [numerosDisponibles, numerosSalidos],
  );

  useEffect(() => {
    fetch("/api/canciones-disponibles")
      .then((res) => res.json())
      .then((data: { numeros: number[] }) => setNumerosDisponibles(data.numeros))
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current !== null) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  function cargarCancionSeleccionada(cancion: Cancion) {
    setCancionSeleccionada(cancion);
    setIsSongStarted(false);
  }

  function empezarCancion() {
    if (!cancionSeleccionada || !videoRef.current) return;
    videoRef.current.play();
    setIsSongStarted(true);
  }

  const spinBall = () => {
    if (isSpinning || numerosRestantes.length === 0) return;

    setIsSpinning(true);
    setNumeroActual(null);
    setIsSongStarted(false);
    setBomboRotation((previous) => previous + 2520);

    spinTimeoutRef.current = window.setTimeout(() => {
      setNumerosSalidos((previous) => {
        const disponibles = numerosDisponibles.filter(
          (value) => !previous.includes(value),
        );

        if (disponibles.length === 0) {
          setIsSpinning(false);
          return previous;
        }

        const elegido =
          disponibles[Math.floor(Math.random() * disponibles.length)];
        const cancion = canciones[elegido];

        setNumeroActual(elegido);
        setIsSpinning(false);
        cargarCancionSeleccionada(cancion);

        return [...previous, elegido];
      });
    }, 3200);
  };

  return (
    <main className="relative h-screen overflow-hidden bg-[#09070d] text-white">


      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,159,252,0.18),_transparent_42%),linear-gradient(180deg,rgba(9,7,13,0.18),rgba(9,7,13,0.9))]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[8%] top-[14%] h-40 w-40 rounded-full bg-[#ff9ffc]/8 blur-3xl" />
        <div className="absolute right-[12%] top-[24%] h-56 w-56 rounded-full bg-[#77d6ff]/8 blur-3xl" />
        <div className="absolute bottom-[14%] left-[42%] h-48 w-48 rounded-full bg-white/6 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex h-screen w-full max-w-7xl flex-col gap-4 px-4 py-4 md:px-5 lg:px-6">
        <header className="flex items-center justify-between gap-4 px-2">
          <span className="text-xs uppercase tracking-[0.35em] text-white/55">
            Karaoke Bingo
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <Metric label="Restantes" value={numerosRestantes.length.toString()} />
            <Metric label="Salidas" value={numerosSalidos.length.toString()} />
            <Metric label="Actual" value={formatearNumero(numeroActual)} />
          </div>
        </header>

        <section className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="relative flex min-h-0 flex-col gap-4 px-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/50">
                  Cancion
                </p>
                <h2 className="mt-1 text-lg font-semibold sm:text-xl">
                  Panel de reproduccion
                </h2>
              </div>
              <div className="rounded-full border border-[#ff9ffc]/25 bg-[#ff9ffc]/8 px-4 py-2 text-sm text-[#ffd3fb] backdrop-blur-sm">
                {cancionSeleccionada
                  ? `Bingo ${formatearNumero(cancionSeleccionada.numero)}`
                  : "Sin cancion seleccionada"}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                  Titulo
                </p>
                <h3 className="mt-2 text-2xl font-semibold leading-tight text-white/96">
                  {cancionSeleccionada?.titulo ?? "Aun no ha salido ninguna cancion"}
                </h3>
                <p className="mt-3 text-base text-white/72">
                  {cancionSeleccionada?.artista ?? "El artista aparecera aqui"}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                  Estado
                </p>
                <p className="mt-2 text-base leading-6 text-white/82">
                  {!cancionSeleccionada
                    ? "Gira el bingo para seleccionar una cancion."
                    : isSongStarted
                      ? "La cancion ya esta reproduciendose."
                      : "El videoclip esta preparado. Pulsa el boton para empezarlo."}
                </p>
                {cancionSeleccionada ? (
                  <button
                    type="button"
                    onClick={empezarCancion}
                    className="mt-4 rounded-full bg-[#ff9ffc] px-4 py-3 text-sm font-semibold text-[#2c0f2d] transition duration-300 hover:bg-[#ffb3fd]"
                  >
                    Empezar cancion
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-[#ff9ffc]/18 bg-black/28 p-3 shadow-[0_0_35px_rgba(255,159,252,0.1)] backdrop-blur-sm">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-white/12 bg-black/70">
                {cancionSeleccionada ? (
                  <video
                    ref={videoRef}
                    key={cancionSeleccionada.numero}
                    src={`/api/video/${cancionSeleccionada.numero}`}
                    controls
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-white/58">
                    <p className="max-w-md px-6 text-sm leading-7">
                      Aqui aparecera el videoclip cuando salga una cancion del bingo.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/12 bg-black/20 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                Letra
              </p>
              <p className="mt-3 max-h-28 overflow-hidden whitespace-pre-line text-sm leading-6 text-white/76">
                {cancionSeleccionada?.letra ??
                  "Aqui puedes colocar la letra real o dejar este bloque como zona de apoyo para la cancion."}
              </p>
            </div>
          </article>

          <aside className="relative min-h-0 px-2">
            <div className="absolute right-[4%] top-[2%] rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-white/72 backdrop-blur-sm">
              00 - 99
            </div>

            <div className="absolute left-[4%] top-[2%]">
              <p className="text-xs uppercase tracking-[0.32em] text-white/50">
                Bingo
              </p>
              <h2 className="mt-1 text-lg font-semibold sm:text-xl">Bombo de canciones</h2>
            </div>

            <div className="absolute left-1/2 top-[14%] h-[21rem] w-[21rem] -translate-x-1/2 lg:h-[23rem] lg:w-[23rem]">
              <Image
                src="/bombo.png"
                alt="Bombo del bingo"
                fill
                priority
                className="transform-gpu object-contain drop-shadow-[0_0_38px_rgba(255,159,252,0.16)] will-change-transform"
                style={{
                  transform: `rotate(${bomboRotation}deg)`,
                  transition: isSpinning
                    ? "transform 3.2s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "transform 0.35s ease-out",
                }}
              />
            </div>

            <div className="absolute left-[6%] top-[56%] right-[6%] flex flex-col gap-3">
              <button
                type="button"
                onClick={spinBall}
                disabled={isSpinning || numerosRestantes.length === 0}
                className="w-full rounded-full bg-[#ff9ffc] px-5 py-3 text-sm font-semibold text-[#2c0f2d] transition duration-300 hover:bg-[#ffb3fd] disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/45"
              >
                {numerosRestantes.length === 0
                  ? "No quedan bolas"
                  : isSpinning
                    ? "Girando..."
                    : "Empezar a girar la bola"}
              </button>

              <div className="rounded-[1.6rem] border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                  Resultado actual
                </p>
                <p className="mt-2 text-sm leading-6 text-white/82">
                  {cancionSeleccionada
                    ? `${formatearNumero(cancionSeleccionada.numero)} · ${cancionSeleccionada.titulo}`
                    : "Cuando salga una bola, aqui veras la cancion asignada."}
                </p>
              </div>
            </div>

            <div className="absolute bottom-[2%] right-[4%] w-[72%] rounded-[1.6rem] border border-white/10 bg-black/18 px-4 py-3 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">
                  Historial
                </p>
                <span className="text-sm text-white/55">Sin repeticion</span>
              </div>
              <div className="mt-3 flex max-h-20 flex-wrap gap-2 overflow-hidden">
                {numerosSalidos.length === 0 ? (
                  <span className="text-sm text-white/48">
                    Aun no ha salido ninguna bola.
                  </span>
                ) : (
                  numerosSalidos.map((value) => (
                    <span
                      key={value}
                      className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-sm text-white/78"
                    >
                      {formatearNumero(value)}
                    </span>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/6 px-3 py-2 backdrop-blur-sm">
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </p>
    </div>
  );
}
