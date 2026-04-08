// /features/placement/hooks/useIntervention.ts

import { useEffect, useRef, useState } from "react";

export function useIntervention(audioSrc: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [phase, setPhase] = useState<
    | "idle"
    | "fadeOutQuestion"
    | "teacherIn"
    | "playing"
    | "teacherOut"
    | "buttons"
  >("idle");

  useEffect(() => {
    if (!audioSrc) return;

    audioRef.current = new Audio(audioSrc);

    audioRef.current.onended = () => {
      setPhase("teacherOut");
      setTimeout(() => {
        setPhase("buttons");
      }, 1200);
    };
  }, [audioSrc]);

  const startIntervention = () => {
    setPhase("fadeOutQuestion");

    setTimeout(() => {
      setPhase("teacherIn");

      setTimeout(() => {
        setPhase("playing");
        audioRef.current?.play();
      }, 900);
    }, 900);
  };

  return {
    phase,
    startIntervention,
  };
}
