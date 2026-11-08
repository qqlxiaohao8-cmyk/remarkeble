import { cn } from "@/lib/cn";

const TONES = {
  ink: "border-ink text-ink",
  stamp: "border-stamp text-stamp",
  quiet: "border-dashed border-line text-ink-faint",
} as const;

export function RecordMark({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: keyof typeof TONES;
}) {
  return (
    <span className={cn("inline-flex border px-1.5 py-0.5 text-[10px] tracking-[0.14em]", TONES[tone])}>
      {children}
    </span>
  );
}
