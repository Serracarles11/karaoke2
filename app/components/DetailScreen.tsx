"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  BACKGROUND_MUSIC_VOLUME,
  useBackgroundMusic,
} from "./BackgroundMusicProvider";
import BallMachine from "./BallMachine";
import ShinyText from "./ShinyText";
import { canciones } from "./canciones";
import { formatearNumero, useKaraokeGame } from "./useKaraokeGame";

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

const START_SONG_DELAY_MS = 2000;
const SONG_TRANSITION_FADE_MS = 1200;
const SONG_TRANSITION_FADE_STEP_MS = 40;
const UNEXPECTED_PAUSE_RETRY_MS = 250;
const DUCKED_SONG_VIDEO_VOLUME = 0.18;
const SONG_START_OFFSETS_SECONDS: Partial<Record<number, number>> = {
  1: 3.75,
  7: 15,
  23: 1,
  24: 1.3,
  27: 19,
  31: 16,
  12: 4,
  13: 15,
  34: 14,
  35: 1.1,
  40: 3,
  41: 1,
  43: 23,
  44: 12,
  55: 3,
  57: 12,
  75: 5,
  86: 32,
  95: 25,
};

function getSongStartOffset(song: { numero: number; titulo: string } | null | undefined) {
  if (!song) return 0;

  return SONG_START_OFFSETS_SECONDS[song.numero] ?? 0;
}

function getBallAccent(ballNumber: number | null) {
  if (ballNumber === null) {
    return { light: "#ffffff", mid: "#cbd5e1", dark: "#475569" };
  }

  return ballNumber <= 19
    ? { light: "#ff9e9e", mid: "#ef4444", dark: "#991b1b" }
    : ballNumber <= 39
      ? { light: "#fff1a6", mid: "#facc15", dark: "#a16207" }
      : ballNumber <= 59
        ? { light: "#ffb5df", mid: "#ec4899", dark: "#9d174d" }
        : ballNumber <= 79
          ? { light: "#b8f7b8", mid: "#22c55e", dark: "#166534" }
          : { light: "#e5b8ff", mid: "#c026d3", dark: "#6b21a8" };
}

function CurrentSongBall({ number }: { number: number | null }) {
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const accent = getBallAccent(number);
  const label = number === null ? "--" : number.toString().padStart(2, "0");

  useEffect(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas || number === null) return;

    const fire = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });
    const options = {
      spread: 90,
      startVelocity: 32,
      ticks: 90,
      gravity: 0.85,
      decay: 0.91,
      scalar: 0.78,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#ffd36b", "#ff4fa0", "#5ba3ff", "#b8f7b8", "#fffef7"],
      disableForReducedMotion: true,
    };

    void fire({ ...options, particleCount: 70 });
    const secondBurst = window.setTimeout(() => {
      void fire({ ...options, particleCount: 38, startVelocity: 24, scalar: 0.62 });
    }, 130);

    return () => {
      window.clearTimeout(secondBurst);
    };
  }, [number]);

  return (
    <div className="current-song-ball-float relative aspect-square w-[clamp(5.8rem,7.6vw,8.6rem)] shrink-0 overflow-visible">
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none absolute -inset-[55%] z-0 h-[210%] w-[210%]"
        aria-hidden="true"
      />
      <div className="current-song-ball-sway relative z-10 h-full w-full">
        <div
          className="current-song-ball-pulse relative grid h-full w-full place-items-center rounded-full border-[3px] border-black/90 shadow-[0_0_34px_rgba(255,212,84,0.42),0_18px_40px_rgba(0,0,0,0.38)]"
          style={{
            background: `radial-gradient(circle at 38% 34%, #fffef7 0 12%, ${accent.light} 28%, #ffd85a 58%, ${accent.dark} 100%)`,
          }}
        >
          <div className="absolute inset-[14%] rounded-full border-[2.5px] border-white/75" />
          <div className="current-song-ball-glint absolute left-[24%] top-[22%] h-[28%] w-[28%] rounded-full bg-white/70" />
          <div className="current-song-ball-spark absolute left-[18%] top-[16%] h-[12%] w-[12%] rounded-full bg-white/85" />
          <span className="relative text-[clamp(1.9rem,3vw,3.3rem)] font-black leading-none tracking-[-0.08em] text-[#111] [text-shadow:0_1px_4px_rgba(255,255,255,0.22)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

function seekVideoToSongStart(
  video: HTMLVideoElement,
  song: { numero: number; titulo: string } | null | undefined,
) {
  const startOffset = getSongStartOffset(song);
  video.currentTime = startOffset;
  return startOffset;
}

function enforceVideoStartOffset(
  video: HTMLVideoElement,
  song: { numero: number; titulo: string } | null | undefined,
) {
  const startOffset = getSongStartOffset(song);
  if (startOffset > 0 && video.currentTime < startOffset - 0.05) {
    video.currentTime = startOffset;
  }
}

function setSongVideoVolume(video: HTMLVideoElement) {
  video.volume = BACKGROUND_MUSIC_VOLUME;
}

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
  const router = useRouter();
  const {
    allNumbers,
    currentNumber,
    drawnNumbers,
    drawnNumbersSet,
    isSpinning,
    remainingNumbers,
    resetGame,
    selectDrawnSong,
    selectedSong,
    spinBall,
    spinVersion,
  } = useKaraokeGame();
  const [videoSources, setVideoSources] = useState<Record<number, string>>({});
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [isBomboVisible, setIsBomboVisible] = useState(false);
  const [isLyricsFullscreen, setIsLyricsFullscreen] = useState(false);
  const videoShellRef = useRef<HTMLDivElement | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<Record<string, GainNode>>({});
  const mediaSourceNodesRef = useRef<Record<string, MediaElementAudioSourceNode>>({});
  const stopSoundTimeoutRef = useRef<number | null>(null);
  const backgroundResumeTimeoutRef = useRef<number | null>(null);
  const startSongTimeoutRef = useRef<number | null>(null);
  const unexpectedPauseTimeoutRef = useRef<number | null>(null);
  const songFadeIntervalRef = useRef<number | null>(null);
  const shouldSongBePlayingRef = useRef(false);
  const isNaturalEndFadeRef = useRef(false);
  const wasSpinningRef = useRef(false);
  const currentSoundRef = useRef<string | null>(null);
  const songVideoRef = useRef<HTMLVideoElement | null>(null);
  const {
    duckBackgroundMusic,
    isBackgroundMusicMuted,
    pauseBackgroundMusic,
    pauseDrawMusic,
    playBallRevealSound,
    playDrawMusic,
    restoreBackgroundMusicVolume,
    resumeBackgroundMusic,
    stopBallRevealSound,
    toggleBackgroundMusicMute,
  } = useBackgroundMusic();

  useEffect(() => {
    fetch("/canciones-manifest.json", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: CancionesManifest) => {
        const availableSongs = data.canciones ?? [];
        setVideoSources(
          Object.fromEntries(availableSongs.map((song) => [song.numero, song.src])),
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const video = songVideoRef.current;
    if (!video) return;

    setSongVideoVolume(video);
    shouldSongBePlayingRef.current = false;
    isNaturalEndFadeRef.current = false;
    video.pause();
    seekVideoToSongStart(video, selectedSong);
  }, [selectedSong]);

  useEffect(() => {
    const audioElements = audioRefs.current;

    return () => {
      if (stopSoundTimeoutRef.current !== null) {
        window.clearTimeout(stopSoundTimeoutRef.current);
      }

      if (backgroundResumeTimeoutRef.current !== null) {
        window.clearTimeout(backgroundResumeTimeoutRef.current);
      }

      if (startSongTimeoutRef.current !== null) {
        window.clearTimeout(startSongTimeoutRef.current);
      }

      if (unexpectedPauseTimeoutRef.current !== null) {
        window.clearTimeout(unexpectedPauseTimeoutRef.current);
      }

      if (songFadeIntervalRef.current !== null) {
        window.clearInterval(songFadeIntervalRef.current);
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

  useEffect(() => {
    if (wasSpinningRef.current && !isSpinning && currentNumber !== null) {
      playBallRevealSound();
    }

    wasSpinningRef.current = isSpinning;
  }, [currentNumber, isSpinning, playBallRevealSound]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsLyricsFullscreen(document.fullscreenElement === videoShellRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (backgroundResumeTimeoutRef.current !== null) {
      window.clearTimeout(backgroundResumeTimeoutRef.current);
      backgroundResumeTimeoutRef.current = null;
    }

    if (isSongPlaying) {
      pauseBackgroundMusic();
      return;
    }

    backgroundResumeTimeoutRef.current = window.setTimeout(() => {
      resumeBackgroundMusic();
      backgroundResumeTimeoutRef.current = null;
    }, 1000);
  }, [isSongPlaying, pauseBackgroundMusic, resumeBackgroundMusic]);

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
    duckBackgroundMusic();
    if (songVideoRef.current) {
      songVideoRef.current.volume = DUCKED_SONG_VIDEO_VOLUME;
    }
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
      if (songVideoRef.current) {
        setSongVideoVolume(songVideoRef.current);
      }
    }, sound.durationMs);
  }

  function clearPendingSongStart() {
    if (startSongTimeoutRef.current === null) return;

    window.clearTimeout(startSongTimeoutRef.current);
    startSongTimeoutRef.current = null;
  }

  function clearUnexpectedPauseRetry() {
    if (unexpectedPauseTimeoutRef.current === null) return;

    window.clearTimeout(unexpectedPauseTimeoutRef.current);
    unexpectedPauseTimeoutRef.current = null;
  }

  function clearSongFade() {
    if (songFadeIntervalRef.current === null) return;

    window.clearInterval(songFadeIntervalRef.current);
    songFadeIntervalRef.current = null;
  }

  function fadeOutCurrentSong() {
    clearPendingSongStart();
    clearUnexpectedPauseRetry();
    clearSongFade();
    shouldSongBePlayingRef.current = false;

    const video = songVideoRef.current;
    if (!video || video.paused || video.volume <= 0) {
      if (video) {
        setSongVideoVolume(video);
      }
      setIsSongPlaying(false);
      return Promise.resolve();
    }

    const startVolume = video.volume;
    const totalSteps = Math.ceil(
      SONG_TRANSITION_FADE_MS / SONG_TRANSITION_FADE_STEP_MS,
    );
    let currentStep = 0;

    return new Promise<void>((resolve) => {
      songFadeIntervalRef.current = window.setInterval(() => {
        currentStep += 1;
        const progress = Math.min(currentStep / totalSteps, 1);

        video.volume = Math.max(0, startVolume * (1 - progress));

        if (progress < 1) return;

        clearSongFade();
        video.pause();
        setSongVideoVolume(video);
        setIsSongPlaying(false);
        resolve();
      }, SONG_TRANSITION_FADE_STEP_MS);
    });
  }

  function playVideoAfterDelay(video: HTMLVideoElement) {
    clearSongFade();
    clearUnexpectedPauseRetry();
    shouldSongBePlayingRef.current = true;
    isNaturalEndFadeRef.current = false;
    setIsSongPlaying(true);

    startSongTimeoutRef.current = window.setTimeout(() => {
      startSongTimeoutRef.current = null;
      void video.play().catch(() => {
        shouldSongBePlayingRef.current = false;
        setIsSongPlaying(false);
      });
    }, START_SONG_DELAY_MS);
  }

  function playSong() {
    const video = songVideoRef.current;
    if (!video) return;

    clearPendingSongStart();
    stopBallRevealSound();
    pauseDrawMusic();
    pauseBackgroundMusic();
    setSongVideoVolume(video);
    seekVideoToSongStart(video, selectedSong);
    playVideoAfterDelay(video);
  }

  function pauseSong() {
    clearPendingSongStart();
    clearUnexpectedPauseRetry();
    clearSongFade();
    shouldSongBePlayingRef.current = false;
    setIsSongPlaying(false);
    songVideoRef.current?.pause();
  }

  function resumeSong() {
    clearPendingSongStart();
    stopBallRevealSound();
    const video = songVideoRef.current;
    if (!video) return;

    pauseBackgroundMusic();
    pauseDrawMusic();
    setSongVideoVolume(video);
    playVideoAfterDelay(video);
  }

  function restartSong() {
    const video = songVideoRef.current;
    if (!video) return;

    clearPendingSongStart();
    clearUnexpectedPauseRetry();
    stopBallRevealSound();
    pauseDrawMusic();
    pauseBackgroundMusic();
    setSongVideoVolume(video);
    seekVideoToSongStart(video, selectedSong);
    shouldSongBePlayingRef.current = true;
    isNaturalEndFadeRef.current = false;
    setIsSongPlaying(true);
    void video.play().catch(() => {
      shouldSongBePlayingRef.current = false;
      setIsSongPlaying(false);
    });
  }

  async function showBomboAndPauseSong() {
    await fadeOutCurrentSong();
    setIsBomboVisible(true);
  }

  function stopCurrentSong() {
    clearPendingSongStart();
    clearUnexpectedPauseRetry();
    clearSongFade();
    shouldSongBePlayingRef.current = false;
    songVideoRef.current?.pause();
    if (songVideoRef.current) {
      setSongVideoVolume(songVideoRef.current);
    }
    setIsSongPlaying(false);
  }

  async function handleSelectDrawnSong(number: number) {
    await fadeOutCurrentSong();
    selectDrawnSong(number);
  }

  async function handleSpinBall() {
    await fadeOutCurrentSong();
    playDrawMusic();
    spinBall();
  }

  function requestLyricsFullscreen() {
    const fullscreenTarget = videoShellRef.current ?? songVideoRef.current;
    if (!fullscreenTarget) return;

    void fullscreenTarget.requestFullscreen().catch(() => {});
  }

  function exitLyricsFullscreen() {
    if (!document.fullscreenElement) return;

    void document.exitFullscreen().catch(() => {});
  }

  function goToLoadingScreen() {
    router.push("/");
  }

  function confirmResetGame() {
    const shouldReset = window.confirm("¿Seguro que quieres reiniciar la partida?");
    if (!shouldReset) return;

    stopCurrentSong();
    resetGame();
  }

  function handleSongMetadataLoaded(event: SyntheticEvent<HTMLVideoElement>) {
    setSongVideoVolume(event.currentTarget);
    seekVideoToSongStart(event.currentTarget, selectedSong);
  }

  function handleSongReady(event: SyntheticEvent<HTMLVideoElement>) {
    enforceVideoStartOffset(event.currentTarget, selectedSong);
  }

  function handleSongPause(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    if (
      !shouldSongBePlayingRef.current ||
      isNaturalEndFadeRef.current ||
      video.ended
    ) {
      setIsSongPlaying(false);
      return;
    }

    clearUnexpectedPauseRetry();
    unexpectedPauseTimeoutRef.current = window.setTimeout(() => {
      unexpectedPauseTimeoutRef.current = null;
      if (!shouldSongBePlayingRef.current || video.ended) return;

      void video.play().catch(() => {
        shouldSongBePlayingRef.current = false;
        setIsSongPlaying(false);
      });
    }, UNEXPECTED_PAUSE_RETRY_MS);
  }

  function handleSongTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget;
    const remainingSeconds = video.duration - video.currentTime;

    if (
      !shouldSongBePlayingRef.current ||
      isNaturalEndFadeRef.current ||
      !Number.isFinite(remainingSeconds) ||
      remainingSeconds > SONG_TRANSITION_FADE_MS / 1000
    ) {
      return;
    }

    isNaturalEndFadeRef.current = true;
    void fadeOutCurrentSong();
  }

  function handleSongEnded() {
    clearUnexpectedPauseRetry();
    shouldSongBePlayingRef.current = false;
    isNaturalEndFadeRef.current = false;
    setIsSongPlaying(false);
  }

  function getSelectedSongVideoSource() {
    if (!selectedSong) return undefined;

    const source = videoSources[selectedSong.numero];
    if (!source) return undefined;

    const startOffset = getSongStartOffset(selectedSong);
    return startOffset > 0 ? `${source}#t=${startOffset}` : source;
  }

  const selectedSongVideoSource = getSelectedSongVideoSource();

  return (
    <main className="screen-shell relative h-dvh overflow-hidden bg-[#08111f] text-white">
      <div className="absolute inset-0 bg-[url('/fondo-bolas.webp')] bg-cover bg-center bg-no-repeat" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,129,86,0.14),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(91,163,255,0.16),transparent_30%),linear-gradient(180deg,rgba(5,10,20,0.34),rgba(5,10,20,0.92))]" />

      <div className="screen-stage relative z-10 mx-auto h-full max-w-[1800px] px-[clamp(14px,1.8vw,30px)] py-[clamp(14px,1.8vw,30px)]">
        <section className="tv-detail-grid grid h-full min-h-0 gap-[clamp(12px,1.15vw,22px)] overflow-hidden lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]">
          <PanelCard className="tv-card flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden !p-3 sm:!p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <h2 className="inline-flex w-fit rounded-[1rem] bg-black/26 px-[clamp(10px,0.9vw,16px)] py-[clamp(6px,0.55vw,10px)] text-[clamp(1.3rem,1.85vw,2.25rem)] font-black leading-[0.98] tracking-[-0.07em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-sm [text-shadow:0_4px_18px_rgba(0,0,0,0.42)]">
                  Bolas Que Ya Han Salido
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={showBomboAndPauseSong}
                  className="rounded-full bg-[#ff4fa0]/14 px-[clamp(12px,1vw,18px)] py-[clamp(6px,0.65vw,10px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-semibold text-white/88 transition hover:bg-[#ff4fa0]/22"
                >
                  Volver al bombo
                </button>
                <button
                  type="button"
                  onClick={confirmResetGame}
                  className="rounded-full bg-[#ff4fa0]/12 px-[clamp(12px,1vw,18px)] py-[clamp(6px,0.65vw,10px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-black text-white/88 transition hover:bg-[#ff4fa0]/20"
                >
                  Reiniciar partida
                </button>
              </div>
            </div>

            <div className="mt-[clamp(8px,0.7vw,12px)] flex-1 min-h-0 overflow-hidden rounded-[2rem] bg-[rgba(8,18,40,0.78)] p-[clamp(8px,0.7vw,12px)] shadow-[0_22px_60px_rgba(4,10,24,0.38)]">
              <div className="grid h-full grid-cols-5 justify-items-center content-start gap-[clamp(6px,0.48vw,10px)] sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {allNumbers.map((number) => {
                  const song = canciones[number];
                  const isDrawn = drawnNumbersSet.has(number);
                  const active = currentNumber === number;

                  return (
                    <button
                      key={number}
                      type="button"
                      onClick={() => handleSelectDrawnSong(number)}
                      disabled={!isDrawn || !song}
                      className={`flex h-[clamp(2.9rem,3.5vw,4.1rem)] w-[clamp(2.9rem,3.5vw,4.1rem)] items-center justify-center rounded-full text-center transition ${
                        active
                          ? "bg-[#ff4fa0] text-white shadow-[0_10px_30px_rgba(255,79,160,0.28)]"
                        : isDrawn
                          ? "bg-[#d9aa2b] text-[#1c1203] shadow-[0_10px_30px_rgba(255,211,107,0.2)] hover:brightness-105"
                          : "bg-black/72 text-white"
                      } ${isDrawn ? "cursor-pointer" : "cursor-default"} p-0.5`}
                    >
                      <span className="block text-[clamp(0.98rem,1.22vw,1.42rem)] font-black leading-none tracking-[-0.08em]">
                        {number.toString().padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-[clamp(2px,0.24vw,5px)] bg-transparent p-0 shadow-none">
              <div className="flex flex-col gap-0.5">
                <div className="shrink-0">

                </div>

                <div className="grid grid-cols-7 gap-1">
                {SOUND_EFFECTS.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => playSoundPreview(sound.id)}
                    className="group flex min-h-[50px] items-center justify-center overflow-hidden rounded-[0.9rem] border border-white/10 bg-black/18 px-2 py-1 transition hover:-translate-y-[1px] hover:bg-black/26 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#120b1a]"
                    aria-label={`Reproducir ${sound.label}`}
                  >
                    <div className="relative h-[28px] w-[28px] shrink-0 overflow-visible">
                      {"iconSrc" in sound ? (
                        <Image
                          src={sound.iconSrc}
                          alt={sound.label}
                          fill
                          sizes="64px"
                          className="scale-[0.92] object-contain p-0 transition duration-200 group-hover:scale-[0.98]"
                        />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[1.65rem]" aria-hidden="true">
                          {sound.emoji}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                </div>
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

          <PanelCard className="tv-card flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden !p-1 sm:!p-2">
            <div className="relative flex min-w-0 items-start justify-center pr-[clamp(6.2rem,8vw,9.2rem)] pt-[clamp(0.7rem,1vw,1.15rem)]">
              <div className="min-w-0 text-center">
                <h2 className="mt-1 max-w-full text-[clamp(1.25rem,1.8vw,2.35rem)] font-black leading-[1.02] tracking-[-0.06em] text-white">
                  <ShinyText
                    text={selectedSong?.titulo ?? "Sin cancion seleccionada"}
                    speed={3.4}
                    delay={1.4}
                    color="#ffffff"
                    shineColor="#ffd36b"
                    spread={105}
                    direction="left"
                  />
                </h2>
                <p className="mt-1 text-[clamp(0.82rem,0.92vw,1rem)] text-white/66">
                  {selectedSong?.artista ?? "Artista pendiente"}
                </p>
              </div>
              <div className="absolute right-0 top-[clamp(0.35rem,0.55vw,0.7rem)] z-20">
                <CurrentSongBall number={currentNumber} />
              </div>
            </div>

            <div className="mt-[clamp(4px,0.45vw,8px)] min-h-0 w-full flex-1 overflow-hidden rounded-[2rem]">
              <div
                ref={videoShellRef}
                className="tv-video-shell relative flex h-full min-h-[520px] w-full max-w-full overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(3,7,16,0.86),rgba(0,0,0,0.96))] p-0 shadow-[0_28px_80px_rgba(0,0,0,0.42)] lg:min-h-0"
                style={{ isolation: "isolate" }}
              >
                {selectedSong && selectedSongVideoSource ? (
                  <div className="tv-video-frame relative h-full min-h-0 w-full max-w-full overflow-hidden rounded-[1.2rem] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
                    <div className="pointer-events-none absolute inset-0 z-10 rounded-[1.2rem] border border-white/8" />
                    <video
                      ref={songVideoRef}
                      key={`${selectedSong.numero}:${getSongStartOffset(selectedSong)}`}
                      src={selectedSongVideoSource}
                      preload="auto"
                      className="tv-video-element absolute inset-0 h-full w-full scale-[1.3] object-cover object-center"
                      playsInline
                      onLoadedMetadata={handleSongMetadataLoaded}
                      onLoadedData={handleSongReady}
                      onCanPlay={handleSongReady}
                      onPlaying={handleSongReady}
                      onPlay={() => {
                        shouldSongBePlayingRef.current = true;
                        setIsSongPlaying(true);
                        pauseBackgroundMusic();
                      }}
                      onPause={handleSongPause}
                      onTimeUpdate={handleSongTimeUpdate}
                      onEnded={handleSongEnded}
                      style={{ backgroundColor: "#000" }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 w-full items-center justify-center rounded-[1.2rem] border border-dashed border-white/14 bg-black/45 px-8 text-center text-white/56">
                    <div>
                      <p className="text-[clamp(1rem,1.1vw,1.12rem)] font-semibold text-white/74">
                        No hay video disponible para esta cancion.
                      </p>
                      <p className="mt-3 max-w-lg text-sm leading-7 text-white/50">
                        El marco ya esta fijado para television; en cuanto exista archivo, entrara en este escenario sin deformarse.
                      </p>
                    </div>
                  </div>
                )}
                {isLyricsFullscreen ? (
                  <div className="tv-fullscreen-controls absolute bottom-[clamp(10px,1vw,18px)] left-1/2 z-30 flex w-[min(94%,64rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-full border border-white/12 bg-black/48 px-3 py-2 opacity-95 shadow-[0_18px_48px_rgba(0,0,0,0.38)] backdrop-blur-md">
                    <button
                      type="button"
                      onClick={playSong}
                      disabled={!selectedSongVideoSource}
                      className="rounded-full bg-[#ffd36b]/22 px-[clamp(12px,1vw,18px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(0.72rem,0.82vw,0.92rem)] font-semibold text-[#fff0be] transition hover:bg-[#ffd36b]/32 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Iniciar
                    </button>
                    <button
                      type="button"
                      onClick={resumeSong}
                      disabled={!selectedSongVideoSource}
                      className="rounded-full bg-[#5ba3ff]/18 px-[clamp(12px,1vw,18px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(0.72rem,0.82vw,0.92rem)] font-semibold text-white/90 transition hover:bg-[#5ba3ff]/28 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Reanudar
                    </button>
                    <button
                      type="button"
                      onClick={pauseSong}
                      disabled={!selectedSongVideoSource}
                      className="rounded-full bg-[#ff4fa0]/18 px-[clamp(12px,1vw,18px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(0.72rem,0.82vw,0.92rem)] font-semibold text-white/90 transition hover:bg-[#ff4fa0]/28 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Parar
                    </button>
                    <button
                      type="button"
                      onClick={restartSong}
                      disabled={!selectedSongVideoSource}
                      className="rounded-full bg-white/12 px-[clamp(12px,1vw,18px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(0.72rem,0.82vw,0.92rem)] font-semibold text-white/90 transition hover:bg-white/18 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Volver a empezar
                    </button>
                    <button
                      type="button"
                      onClick={exitLyricsFullscreen}
                      className="rounded-full bg-black/42 px-[clamp(12px,1vw,18px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(0.72rem,0.82vw,0.92rem)] font-semibold text-white/90 transition hover:bg-black/62"
                    >
                      Salir pantalla completa
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-[clamp(4px,0.45vw,8px)] flex flex-wrap gap-2">
              <button
                type="button"
                onClick={playSong}
                className="rounded-full bg-[#ffd36b]/18 px-[clamp(14px,1vw,20px)] py-[clamp(8px,0.72vw,11px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-semibold text-[#fff0be] transition hover:bg-[#ffd36b]/26"
              >
                Empezar cancion
              </button>
              <button
                type="button"
                onClick={isSongPlaying ? pauseSong : resumeSong}
                className="rounded-full bg-[#ff4fa0]/12 px-[clamp(14px,1vw,20px)] py-[clamp(8px,0.72vw,11px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-semibold text-white/90 transition hover:bg-[#ff4fa0]/20"
              >
                {isSongPlaying ? "Parar" : "Reanudar"}
              </button>
              <button
                type="button"
                onClick={toggleBackgroundMusicMute}
                className="rounded-full bg-[#ff4fa0]/12 px-[clamp(14px,1vw,20px)] py-[clamp(8px,0.72vw,11px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-semibold text-white/90 transition hover:bg-[#ff4fa0]/20"
              >
                {isBackgroundMusicMuted ? "Activar fondo" : "Mutear fondo"}
              </button>
              <button
                type="button"
                onClick={requestLyricsFullscreen}
                disabled={!selectedSongVideoSource}
                className="rounded-full bg-[#5ba3ff]/14 px-[clamp(14px,1vw,20px)] py-[clamp(8px,0.72vw,11px)] text-[clamp(0.76rem,0.84vw,0.92rem)] font-semibold text-white/90 transition hover:bg-[#5ba3ff]/22 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Letra pantalla completa
              </button>
            </div>
          </PanelCard>
        </section>
      </div>

      {isBomboVisible ? (
        <section className="fixed inset-0 z-50 overflow-hidden bg-[#08111f] text-white">
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

          <div className="absolute inset-0">
            <BallMachine
              numbers={allNumbers}
              drawnNumbers={drawnNumbers}
              selectedNumber={currentNumber}
              spinVersion={spinVersion}
            />
          </div>

          <div className="absolute right-[clamp(16px,2vw,40px)] top-[clamp(16px,2vw,40px)] z-10 text-right">
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
          </div>

          <div className="absolute right-[clamp(16px,2vw,40px)] top-1/2 z-30 -translate-y-1/2">
            <div className="tv-glass-button rounded-[1.2rem] border border-white/10 bg-black/24 p-[clamp(8px,0.8vw,12px)] shadow-[0_16px_48px_rgba(0,0,0,0.24)]">
              <p className="mb-2 text-[clamp(9px,0.72vw,12px)] uppercase tracking-[0.28em] text-[#ffd58a]/72 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">
                Efectos
              </p>
              <div className="grid grid-cols-1 content-start gap-[clamp(6px,0.55vw,10px)]">
                {SOUND_EFFECTS.map((sound) => (
                  <button
                    key={sound.id}
                    type="button"
                    onClick={() => playSoundPreview(sound.id)}
                    className="group relative overflow-hidden rounded-[1.1rem] transition hover:-translate-y-[1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffd36b]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#120b1a]"
                    aria-label={`Reproducir ${sound.label}`}
                    title={sound.label}
                  >
                    <div className="relative h-[clamp(38px,4.2vw,58px)] w-[clamp(38px,4.2vw,58px)] overflow-visible rounded-[0.9rem] border border-white/0 bg-transparent p-0 shadow-none">
                      {"iconSrc" in sound ? (
                        <Image
                          src={sound.iconSrc}
                          alt={sound.label}
                          fill
                          sizes="64px"
                          className="scale-[0.9] object-contain p-0 transition duration-200 group-hover:scale-[0.94]"
                        />
                      ) : (
                        <span
                          className="grid h-full w-full place-items-center text-[clamp(1.55rem,2.7vw,2.5rem)]"
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

          <div className="absolute inset-x-0 bottom-[clamp(22px,3vh,34px)] z-10 px-4">
            <div className="tv-draw-center mx-auto flex w-full max-w-[58rem] flex-col items-center gap-[clamp(10px,1vw,18px)]">
              <button
                type="button"
                onClick={handleSpinBall}
                disabled={isSpinning || remainingNumbers.length === 0}
                className="rounded-full bg-[linear-gradient(135deg,#ffd36b,#ff8c59)] px-[clamp(24px,2.2vw,38px)] py-[clamp(12px,1.25vw,18px)] text-[clamp(0.95rem,1.15vw,1.2rem)] font-black text-[#1f1305] shadow-[0_10px_40px_rgba(255,146,89,0.32)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {remainingNumbers.length === 0
                  ? "No quedan bolas"
                  : isSpinning
                    ? "Eligiendo bola..."
                    : "Sacar bola"}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsBomboVisible(false)}
                  className="tv-glass-button rounded-full border border-[#ffd36b]/36 bg-[#ffd36b]/16 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-black text-[#fff0be] shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:bg-[#ffd36b]/22"
                >
                  Volver al videoclip
                </button>
                <button
                  type="button"
                  onClick={goToLoadingScreen}
                  className="tv-glass-button rounded-full border border-white/14 bg-white/8 px-[clamp(18px,1.5vw,24px)] py-[clamp(10px,1vw,14px)] text-[clamp(0.82rem,0.95vw,1rem)] font-semibold text-white/84 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm transition hover:bg-white/12"
                >
                  Pantalla de carga
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
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
