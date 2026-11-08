"use client";

import { useId } from "react";

export function Stamp() {
  const id = `seal${useId().replace(/:/g, "")}`;
  return (
    <div className="-rotate-12 mix-blend-multiply opacity-90" aria-label="已核實">
      <svg viewBox="0 0 120 120" className="h-[4.75rem] w-[4.75rem] text-stamp md:h-24 md:w-24">
        <defs>
          <path id={id} d="M60 60m-40 0a40 40 0 1 1 80 0a40 40 0 1 1-80 0" />
        </defs>
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3" />
        <circle cx="60" cy="60" r="47" fill="none" stroke="currentColor" strokeWidth="1" />
        <text fill="currentColor" fontSize="8" letterSpacing="1.5">
          <textPath href={`#${id}`}>REMARKEBLE · HONG KONG ·</textPath>
        </text>
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="currentColor"
          fontSize="18"
          fontFamily="Songti TC, PMingLiU, serif"
        >
          已核實
        </text>
      </svg>
    </div>
  );
}

export function PendingStamp() {
  return (
    <div className="-rotate-6 text-ink-faint" aria-label="待核實">
      <svg viewBox="0 0 120 120" className="h-[4.75rem] w-[4.75rem] md:h-24 md:w-24">
        <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fill="currentColor"
          fontSize="16"
          fontFamily="Songti TC, PMingLiU, serif"
        >
          待核實
        </text>
      </svg>
    </div>
  );
}
