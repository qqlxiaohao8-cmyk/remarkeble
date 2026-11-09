export function Stamp() {
  return <img src="/stamp-approved.png" alt="已核實" className="h-32 w-auto" />;
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
