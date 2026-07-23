"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { canciones, type Cancion } from "./canciones";

const GAME_COOKIE_NAME = "karaoke_bingo_state";
const GAME_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type StoredGameState = {
  currentNumber: number | null;
  drawnNumbers: number[];
};

// Nota: este componente puede ejecutarse embebido en un <iframe> de terceros
// (p.ej. dayoffevents.com incrustando esta app de Vercel). En ese contexto los
// navegadores (Chrome con bloqueo de cookies de terceros, Safari ITP, Firefox
// ETP) bloquean o particionan las cookies de terceros, por lo que
// document.cookie puede fallar silenciosamente al leer/escribir. localStorage
// no tiene esa restricción de SameSite y sigue funcionando de forma fiable
// incluso con "storage partitioning", así que es el mecanismo principal.
// Se mantiene la cookie como intento adicional (por compatibilidad con
// visitas directas / la app de escritorio) pero nunca como única fuente.

function readGameCookie() {
  if (typeof document === "undefined") return null;

  const rawCookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${GAME_COOKIE_NAME}=`));

  if (!rawCookie) return null;

  const rawValue = rawCookie.slice(GAME_COOKIE_NAME.length + 1);

  try {
    return JSON.parse(decodeURIComponent(rawValue)) as StoredGameState;
  } catch {
    return null;
  }
}

function writeGameCookie(state: StoredGameState) {
  if (typeof document === "undefined") return;

  try {
    document.cookie = `${GAME_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(state))}; path=/; max-age=${GAME_COOKIE_MAX_AGE}; samesite=none; secure`;
  } catch {
    // Puede fallar en contextos de terceros con cookies bloqueadas: no pasa nada,
    // localStorage es la fuente de verdad.
  }
}

function clearGameCookie() {
  if (typeof document === "undefined") return;

  try {
    document.cookie = `${GAME_COOKIE_NAME}=; path=/; max-age=0; samesite=none; secure`;
  } catch {
    // ignorar
  }
}

function readGameStorage(): StoredGameState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(GAME_COOKIE_NAME);
    if (!raw) return null;
    return JSON.parse(raw) as StoredGameState;
  } catch {
    return null;
  }
}

function writeGameStorage(state: StoredGameState) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(GAME_COOKIE_NAME, JSON.stringify(state));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota, etc.): se ignora,
    // la partida seguirá funcionando en memoria durante la sesión actual.
  }
}

function clearGameStorage() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(GAME_COOKIE_NAME);
  } catch {
    // ignorar
  }
}

function readGameState(): StoredGameState | null {
  return readGameStorage() ?? readGameCookie();
}

function writeGameState(state: StoredGameState) {
  writeGameStorage(state);
  writeGameCookie(state);
}

function clearGameState() {
  clearGameStorage();
  clearGameCookie();
}

export function formatearNumero(value: number | null) {
  return value === null ? "--" : value.toString().padStart(2, "0");
}

export function useKaraokeGame() {
  const allNumbers = useMemo(() => canciones.map((cancion) => cancion.numero), []);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [previewNumber, setPreviewNumber] = useState<number | null>(null);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [selectedSong, setSelectedSong] = useState<Cancion | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinVersion, setSpinVersion] = useState(0);

  const drawTimeoutRef = useRef<number | null>(null);
  const previewTimeoutRef = useRef<number | null>(null);
  const hasLoadedGameRef = useRef(false);
  const isReviewModeRef = useRef(false);
  const remainingNumbers = useMemo(
    () => allNumbers.filter((number) => !drawnNumbers.includes(number)),
    [allNumbers, drawnNumbers],
  );
  const drawnNumbersSet = useMemo(() => new Set(drawnNumbers), [drawnNumbers]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    isReviewModeRef.current = searchParams.get("revision") === "1";

    if (isReviewModeRef.current) {
      const restoreTimeout = window.setTimeout(() => {
        setDrawnNumbers(allNumbers);
        setCurrentNumber(null);
        setSelectedSong(null);
        setSpinVersion((value) => value + 1);
        hasLoadedGameRef.current = true;
      }, 0);

      return () => {
        window.clearTimeout(restoreTimeout);
      };
    }

    const storedState = readGameState();
    if (!storedState) {
      hasLoadedGameRef.current = true;
      return;
    }

    const validDrawnNumbers = storedState.drawnNumbers.filter((number) =>
      allNumbers.includes(number),
    );
    const validCurrentNumber =
      storedState.currentNumber !== null && allNumbers.includes(storedState.currentNumber)
        ? storedState.currentNumber
        : null;

    const restoreTimeout = window.setTimeout(() => {
      setDrawnNumbers(validDrawnNumbers);
      setCurrentNumber(validCurrentNumber);
      setSelectedSong(validCurrentNumber !== null ? canciones[validCurrentNumber] ?? null : null);
      setSpinVersion((value) => value + 1);
      hasLoadedGameRef.current = true;
    }, 0);

    return () => {
      window.clearTimeout(restoreTimeout);
    };
  }, [allNumbers]);

  useEffect(() => {
    if (!hasLoadedGameRef.current) return;
    if (isReviewModeRef.current) return;

    writeGameState({
      currentNumber,
      drawnNumbers,
    });
  }, [currentNumber, drawnNumbers]);

  useEffect(() => {
    return () => {
      if (drawTimeoutRef.current !== null) {
        window.clearTimeout(drawTimeoutRef.current);
      }

      if (previewTimeoutRef.current !== null) {
        window.clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  function clearSpinTimers() {
    if (drawTimeoutRef.current !== null) {
      window.clearTimeout(drawTimeoutRef.current);
      drawTimeoutRef.current = null;
    }

    if (previewTimeoutRef.current !== null) {
      window.clearTimeout(previewTimeoutRef.current);
      previewTimeoutRef.current = null;
    }
  }

  function spinBall() {
    if (isSpinning || remainingNumbers.length === 0) return;

    clearSpinTimers();
    setSpinVersion((value) => value + 1);
    setIsSpinning(true);
    setPreviewNumber(remainingNumbers[0] ?? null);
    setCurrentNumber(null);
    setSelectedSong(null);

    const schedulePreviewStep = () => {
      setPreviewNumber((current) => {
        const pool = remainingNumbers.filter((number) => number !== current);
        return pool[Math.floor(Math.random() * pool.length)] ?? remainingNumbers[0] ?? null;
      });

      previewTimeoutRef.current = window.setTimeout(
        schedulePreviewStep,
        Math.floor(90 + Math.random() * 910),
      );
    };

    schedulePreviewStep();

    drawTimeoutRef.current = window.setTimeout(() => {
      if (previewTimeoutRef.current !== null) {
        window.clearTimeout(previewTimeoutRef.current);
      }

      const selected =
        remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)] ?? null;

      setPreviewNumber(selected);
      setCurrentNumber(selected);

      if (selected !== null) {
        setDrawnNumbers((previous) => [...previous, selected]);
        setSelectedSong(canciones[selected] ?? null);
      }

      setIsSpinning(false);
      drawTimeoutRef.current = null;
    }, 3400);
  }

  function resetGame() {
    clearSpinTimers();

    if (isReviewModeRef.current) {
      setDrawnNumbers(allNumbers);
      setPreviewNumber(null);
      setCurrentNumber(null);
      setSelectedSong(null);
      setIsSpinning(false);
      setSpinVersion((value) => value + 1);
      return;
    }

    clearGameState();
    setDrawnNumbers([]);
    setPreviewNumber(null);
    setCurrentNumber(null);
    setSelectedSong(null);
    setIsSpinning(false);
    setSpinVersion((value) => value + 1);
  }

  function selectDrawnSong(number: number) {
    if (!drawnNumbersSet.has(number)) return;

    const song = canciones[number];
    if (!song) return;

    setCurrentNumber(song.numero);
    setSelectedSong(song);
  }

  return {
    allNumbers,
    currentNumber,
    drawnNumbers,
    drawnNumbersSet,
    isSpinning,
    previewNumber,
    remainingNumbers,
    resetGame,
    selectDrawnSong,
    selectedSong,
    spinBall,
    spinVersion,
  };
}
