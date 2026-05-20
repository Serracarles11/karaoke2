"use client";

import { useEffect } from "react";
import { useBackgroundMusic } from "./BackgroundMusicProvider";

export default function LoadingScreenMusic() {
  const { resumeBackgroundMusic } = useBackgroundMusic();

  useEffect(() => {
    resumeBackgroundMusic();
  }, [resumeBackgroundMusic]);

  return null;
}
