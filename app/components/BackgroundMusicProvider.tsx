"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

const BACKGROUND_MUSIC_SRC =
  "/musica/The%20Game%20Show%20Theme%20Music%20%5BUaRrDZWhtWA%5D.mp3";
const DRAW_MUSIC_SRC = "/musica/sorteo-bola.mp3";
const BALL_REVEAL_SOUND_SRC = "/sonidos/win31.mp3";
export const BACKGROUND_MUSIC_VOLUME = 1;

type BackgroundMusicContextValue = {
  duckBackgroundMusic: () => void;
  isBackgroundMusicMuted: boolean;
  pauseBackgroundMusic: () => void;
  pauseDrawMusic: () => void;
  playBallRevealSound: () => void;
  playDrawMusic: () => void;
  restoreBackgroundMusicVolume: () => void;
  resumeBackgroundMusic: () => void;
  toggleBackgroundMusicMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue | null>(null);

const DUCKED_BACKGROUND_MUSIC_VOLUME = 0.14;
const AUDIO_FADE_MS = 900;
const AUDIO_FADE_STEP_MS = 40;

export function BackgroundMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const drawAudioRef = useRef<HTMLAudioElement | null>(null);
  const ballRevealAudioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundFadeIntervalRef = useRef<number | null>(null);
  const drawFadeIntervalRef = useRef<number | null>(null);
  const isActivatedRef = useRef(false);
  const isDuckedRef = useRef(false);
  const isManuallyPausedRef = useRef(false);
  const isDrawMusicPlayingRef = useRef(false);
  const [isBackgroundMusicMuted, setIsBackgroundMusicMuted] = useState(false);

  const clearAudioFade = useCallback((fadeRef: MutableRefObject<number | null>) => {
    if (fadeRef.current === null) return;

    window.clearInterval(fadeRef.current);
    fadeRef.current = null;
  }, []);

  const fadeAudioVolume = useCallback(
    (
      audio: HTMLAudioElement | null,
      targetVolume: number,
      fadeRef: MutableRefObject<number | null>,
      options: { pauseWhenDone?: boolean; playWhenPaused?: boolean; restart?: boolean } = {},
    ) => {
      clearAudioFade(fadeRef);
      if (!audio) return;

      if (options.restart) {
        audio.currentTime = 0;
      }

      if (targetVolume > 0 && audio.paused && options.playWhenPaused) {
        audio.volume = 0;
        void audio.play().catch(() => {});
      }

      if (targetVolume > 0 && audio.paused) {
        audio.volume = targetVolume;
        return;
      }

      const startVolume = audio.volume;
      const totalSteps = Math.max(1, Math.ceil(AUDIO_FADE_MS / AUDIO_FADE_STEP_MS));
      let currentStep = 0;

      if (startVolume === targetVolume) {
        if (options.pauseWhenDone) {
          audio.pause();
        }
        return;
      }

      fadeRef.current = window.setInterval(() => {
        currentStep += 1;
        const progress = Math.min(currentStep / totalSteps, 1);
        audio.volume = startVolume + (targetVolume - startVolume) * progress;

        if (progress < 1) return;

        clearAudioFade(fadeRef);
        audio.volume = targetVolume;
        if (options.pauseWhenDone) {
          audio.pause();
        }
      }, AUDIO_FADE_STEP_MS);
    },
    [clearAudioFade],
  );

  const fadeOutAllBackgroundAudio = useCallback(() => {
    fadeAudioVolume(audioRef.current, 0, backgroundFadeIntervalRef, {
      pauseWhenDone: true,
    });
    fadeAudioVolume(drawAudioRef.current, 0, drawFadeIntervalRef, {
      pauseWhenDone: true,
    });
  }, [fadeAudioVolume]);

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

    if (isDrawMusicPlayingRef.current) {
      fadeAudioVolume(audio, 0, backgroundFadeIntervalRef, { pauseWhenDone: true });
      return;
    }

    const targetVolume = isDuckedRef.current
      ? DUCKED_BACKGROUND_MUSIC_VOLUME
      : BACKGROUND_MUSIC_VOLUME;
    fadeAudioVolume(audio, targetVolume, backgroundFadeIntervalRef, {
      playWhenPaused: true,
    });
  }, [fadeAudioVolume, isBackgroundMusicMuted]);

  const duckBackgroundMusic = useCallback(() => {
    isDuckedRef.current = true;
    const audio = audioRef.current;
    const drawAudio = drawAudioRef.current;

    if (audio) {
      fadeAudioVolume(audio, DUCKED_BACKGROUND_MUSIC_VOLUME, backgroundFadeIntervalRef);
    }

    if (drawAudio) {
      fadeAudioVolume(drawAudio, DUCKED_BACKGROUND_MUSIC_VOLUME, drawFadeIntervalRef);
    }
  }, [fadeAudioVolume]);

  const pauseBackgroundMusic = useCallback(() => {
    isManuallyPausedRef.current = true;
    isDrawMusicPlayingRef.current = false;
    fadeOutAllBackgroundAudio();
  }, [fadeOutAllBackgroundAudio]);

  const restoreBackgroundMusicVolume = useCallback(() => {
    isDuckedRef.current = false;
    const audio = audioRef.current;
    const drawAudio = drawAudioRef.current;

    if (audio) {
      fadeAudioVolume(audio, BACKGROUND_MUSIC_VOLUME, backgroundFadeIntervalRef);
    }

    if (drawAudio) {
      fadeAudioVolume(drawAudio, BACKGROUND_MUSIC_VOLUME, drawFadeIntervalRef);
    }
  }, [fadeAudioVolume]);

  const resumeBackgroundMusic = useCallback(() => {
    isManuallyPausedRef.current = false;
    playIfAllowed();
  }, [playIfAllowed]);

  const pauseDrawMusic = useCallback(() => {
    isDrawMusicPlayingRef.current = false;
    fadeAudioVolume(drawAudioRef.current, 0, drawFadeIntervalRef, {
      pauseWhenDone: true,
    });
    playIfAllowed();
  }, [fadeAudioVolume, playIfAllowed]);

  const playDrawMusic = useCallback(() => {
    const drawAudio = drawAudioRef.current;

    isManuallyPausedRef.current = false;
    isDrawMusicPlayingRef.current = true;
    fadeAudioVolume(audioRef.current, 0, backgroundFadeIntervalRef, {
      pauseWhenDone: true,
    });

    if (!drawAudio || !isActivatedRef.current || isBackgroundMusicMuted) {
      return;
    }

    fadeAudioVolume(drawAudio, BACKGROUND_MUSIC_VOLUME, drawFadeIntervalRef, {
      playWhenPaused: true,
      restart: true,
    });
  }, [fadeAudioVolume, isBackgroundMusicMuted]);

  const playBallRevealSound = useCallback(() => {
    if (!isActivatedRef.current || isBackgroundMusicMuted) return;

    const audio = ballRevealAudioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = BACKGROUND_MUSIC_VOLUME;
    void audio.play().catch(() => {});
  }, [isBackgroundMusicMuted]);

  const toggleBackgroundMusicMute = useCallback(() => {
    setIsBackgroundMusicMuted((current) => {
      const next = !current;
      if (next) {
        fadeOutAllBackgroundAudio();
      }
      return next;
    });
  }, [fadeOutAllBackgroundAudio]);

  useEffect(() => {
    const ballRevealAudio = ballRevealAudioRef.current;

    return () => {
      clearAudioFade(backgroundFadeIntervalRef);
      clearAudioFade(drawFadeIntervalRef);
      ballRevealAudio?.pause();
    };
  }, [clearAudioFade]);

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
      pauseDrawMusic,
      playDrawMusic,
      playBallRevealSound,
      restoreBackgroundMusicVolume,
      resumeBackgroundMusic,
      toggleBackgroundMusicMute,
    }),
    [
      duckBackgroundMusic,
      isBackgroundMusicMuted,
      pauseBackgroundMusic,
      pauseDrawMusic,
      playDrawMusic,
      playBallRevealSound,
      restoreBackgroundMusicVolume,
      resumeBackgroundMusic,
      toggleBackgroundMusicMute,
    ],
  );

  return (
    <BackgroundMusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="auto" loop src={BACKGROUND_MUSIC_SRC} />
      <audio ref={drawAudioRef} preload="auto" loop src={DRAW_MUSIC_SRC} />
      <audio ref={ballRevealAudioRef} preload="auto" src={BALL_REVEAL_SOUND_SRC} />
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
