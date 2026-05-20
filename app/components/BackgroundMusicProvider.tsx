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
const BACKGROUND_MUSIC_VOLUME = 0.35;

type BackgroundMusicContextValue = {
  isBackgroundMusicMuted: boolean;
  pauseBackgroundMusic: () => void;
  resumeBackgroundMusic: () => void;
  toggleBackgroundMusicMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isActivatedRef = useRef(false);
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

    audio.volume = BACKGROUND_MUSIC_VOLUME;
    void audio.play().catch(() => {});
  }, [isBackgroundMusicMuted]);

  const pauseBackgroundMusic = useCallback(() => {
    isManuallyPausedRef.current = true;
    audioRef.current?.pause();
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
      isBackgroundMusicMuted,
      pauseBackgroundMusic,
      resumeBackgroundMusic,
      toggleBackgroundMusicMute,
    }),
    [
      isBackgroundMusicMuted,
      pauseBackgroundMusic,
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
