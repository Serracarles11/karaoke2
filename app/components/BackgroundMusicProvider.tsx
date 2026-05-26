"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const BACKGROUND_MUSIC_SRC =
  "/musica/The%20Game%20Show%20Theme%20Music%20%5BUaRrDZWhtWA%5D.mp3";
export const BACKGROUND_MUSIC_VOLUME = 1;

type BackgroundMusicContextValue = {
  duckBackgroundMusic: () => void;
  isBackgroundMusicMuted: boolean;
  pauseBackgroundMusic: () => void;
  restoreBackgroundMusicVolume: () => void;
  resumeBackgroundMusic: () => void;
  toggleBackgroundMusicMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

const DUCKED_BACKGROUND_MUSIC_VOLUME = 0.14;

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActivatedRef = useRef(false);
  const isDuckedRef = useRef(false);
  const isManuallyPausedRef = useRef(false);
  const [isBackgroundMusicMuted, setIsBackgroundMusicMuted] = useState(false);

  const playIfAllowed = useCallback(() => {
    const audio = audioRef.current;
    if (
      !audio ||
      !isActivatedRef.current ||
      isManuallyPausedRef.current ||
      isBackgroundMusicMuted
    ) {
      return;
    }

    audio.volume = isDuckedRef.current
      ? DUCKED_BACKGROUND_MUSIC_VOLUME
      : BACKGROUND_MUSIC_VOLUME;
    void audio.play().catch(() => {});
  }, [isBackgroundMusicMuted]);

  const duckBackgroundMusic = useCallback(() => {
    isDuckedRef.current = true;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = DUCKED_BACKGROUND_MUSIC_VOLUME;
  }, []);

  const pauseBackgroundMusic = useCallback(() => {
    isManuallyPausedRef.current = true;
    audioRef.current?.pause();
  }, []);

  const restoreBackgroundMusicVolume = useCallback(() => {
    isDuckedRef.current = false;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = BACKGROUND_MUSIC_VOLUME;
  }, []);

  const resumeBackgroundMusic = useCallback(() => {
    isManuallyPausedRef.current = false;
    playIfAllowed();
  }, [playIfAllowed]);

  const toggleBackgroundMusicMute = useCallback(() => {
    setIsBackgroundMusicMuted((current) => {
      const next = !current;
      if (next) {
        audioRef.current?.pause();
      }
      return next;
    });
  }, []);

  useEffect(() => {
    function activateBackgroundMusic() {
      isActivatedRef.current = true;
      playIfAllowed();
    }

    document.addEventListener("pointerdown", activateBackgroundMusic, { capture: true });
    document.addEventListener("keydown", activateBackgroundMusic, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", activateBackgroundMusic, { capture: true });
      document.removeEventListener("keydown", activateBackgroundMusic, { capture: true });
    };
  }, [playIfAllowed]);

  const value = useMemo(
    () => ({
      duckBackgroundMusic,
      isBackgroundMusicMuted,
      pauseBackgroundMusic,
      restoreBackgroundMusicVolume,
      resumeBackgroundMusic,
      toggleBackgroundMusicMute,
    }),
    [
      duckBackgroundMusic,
      isBackgroundMusicMuted,
      pauseBackgroundMusic,
      restoreBackgroundMusicVolume,
      resumeBackgroundMusic,
      toggleBackgroundMusicMute,
    ],
  );

  return (
    <BackgroundMusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" loop src={BACKGROUND_MUSIC_SRC} />
    </BackgroundMusicContext.Provider>
  );
}

export function useBackgroundMusic() {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error("useBackgroundMusic must be used within BackgroundMusicProvider");
  }

  return context;
}
