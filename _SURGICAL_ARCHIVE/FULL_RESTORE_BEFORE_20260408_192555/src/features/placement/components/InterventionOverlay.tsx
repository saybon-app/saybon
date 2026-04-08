// /features/placement/components/InterventionOverlay.tsx

import styles from "../styles/intervention.module.css";

type Props = {
  phase: string;
  onContinue: () => void;
  onReveal: () => void;
};

export default function InterventionOverlay({
  phase,
  onContinue,
  onReveal,
}: Props) {
  if (phase === "idle") return null;

  return (
    <div className={styles.overlay}>
      {phase === "fadeOutQuestion" && (
        <div className={styles.fadeScreen} />
      )}

      {(phase === "teacherIn" || phase === "playing") && (
        <div className={styles.teacherWrapper}>
          <img
            src="/assets/teacher/glow-teacher.png"
            className={styles.teacher}
            alt="Teacher"
          />
        </div>
      )}

      {phase === "buttons" && (
        <div className={styles.buttonWrap}>
          <button className={styles.primary} onClick={onContinue}>
            Continue with test
          </button>

          <button className={styles.secondary} onClick={onReveal}>
            Go to level reveal
          </button>
        </div>
      )}
    </div>
  );
}
