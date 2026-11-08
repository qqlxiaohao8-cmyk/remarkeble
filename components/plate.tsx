import { cn } from "@/lib/cn";
import type { Motif, Tone } from "@/lib/types";

type Palette = {
  bg: string;
  ink: string;
  mid: string;
  accent: string;
  wash: string;
};

const PALETTES: Record<Tone, Palette> = {
  silver: { bg: "#ddd6ca", ink: "#2a2622", mid: "#8d8478", accent: "#6f5d49", wash: "#ece6db" },
  sepia: { bg: "#e7d5b8", ink: "#3d2b1f", mid: "#a6845e", accent: "#7a4b2e", wash: "#f1e4cd" },
  cyan: { bg: "#d3e1e3", ink: "#1b333c", mid: "#6e8e97", accent: "#2c5c6a", wash: "#e6f1f2" },
  night: { bg: "#2c2825", ink: "#f0e6d6", mid: "#9a8d80", accent: "#e07a52", wash: "#3a342f" },
};

const DRAWINGS: Record<Motif, (palette: Palette) => React.ReactNode> = {
  tea: (p) => (
    <>
      <circle cx="100" cy="132" r="58" fill={p.wash} stroke="none" />
      <ellipse cx="100" cy="196" rx="48" ry="8" />
      <path d="M76 98h48v58c0 16-11 26-24 26s-24-10-24-26V98Z" />
      <path d="M82 128h36v22c0 10-8 16-18 16s-18-6-18-16v-22Z" fill={p.accent} opacity="0.45" stroke="none" />
      <path d="M124 116h16c8 0 12 9 7 16-5 8-16 7-20 0" />
      <path d="M90 78c2-14 10-14 10 0" />
      <path d="M106 68c2-16 10-16 10 0" />
    </>
  ),
  noodles: (p) => (
    <>
      <circle cx="100" cy="132" r="58" fill={p.wash} stroke="none" />
      <ellipse cx="100" cy="148" rx="52" ry="28" />
      <ellipse cx="100" cy="142" rx="36" ry="16" />
      <path d="M78 140c10 6 16-6 26 0s16 6 24-2" />
      <path d="M80 148c12 4 14-6 26-1s14 6 22-2" />
      <path d="M128 92l34-28" />
      <path d="M136 98l32-24" />
      <circle cx="86" cy="136" r="4" fill={p.accent} stroke="none" />
      <circle cx="112" cy="132" r="3.5" fill={p.accent} stroke="none" />
    </>
  ),
  congee: (p) => (
    <>
      <circle cx="104" cy="136" r="56" fill={p.wash} stroke="none" />
      <path d="M58 150h78c2 28-14 46-39 46S56 178 58 150Z" />
      <path d="M70 150c8 10 48 10 58 0" />
      <path d="M78 126c4-16 12-16 14 0" />
      <path d="M96 118c4-18 12-18 12 2" />
      <path d="M132 118c18 8 28 28 16 40" />
      <ellipse cx="154" cy="162" rx="16" ry="6" />
    </>
  ),
  seafood: (p) => (
    <>
      <circle cx="100" cy="120" r="52" fill={p.wash} stroke="none" />
      <path d="M28 168c20 8 40 8 144 0" />
      <path d="M24 180c28 10 48 8 152 0" />
      <path d="M48 118c18-28 52-30 78-8 10 8 18 28 6 40-18 18-62 16-84-6-8-8-8-18 0-26Z" />
      <circle cx="92" cy="112" r="2" fill={p.ink} stroke="none" />
      <path d="M118 108c10 4 16 2 22-4" />
      <path d="M132 146c16 2 22 12 16 20-8 2-18-4-22-10" />
      <path d="M146 150c8-8 16-6 18 2" />
    </>
  ),
  cart: (p) => (
    <>
      <circle cx="100" cy="128" r="54" fill={p.wash} stroke="none" />
      <path d="M46 86h108l-8 28H58L46 86Z" />
      <path d="M58 114h88v42H58z" />
      <path d="M58 132h88" />
      <circle cx="74" cy="168" r="10" />
      <circle cx="128" cy="168" r="10" />
      <path d="M74 168h54" />
      <circle cx="86" cy="128" r="6" />
      <circle cx="112" cy="128" r="6" />
      <path d="M70 86V70h60v16" />
    </>
  ),
  dessert: (p) => (
    <>
      <circle cx="100" cy="140" r="58" fill={p.wash} stroke="none" />
      <path d="M48 150h42c1 20-8 32-21 32s-22-12-21-32Z" />
      <path d="M110 146h42c1 22-8 34-21 34s-22-12-21-34Z" />
      <circle cx="62" cy="146" r="2" fill={p.ink} stroke="none" />
      <circle cx="74" cy="140" r="2" fill={p.ink} stroke="none" />
      <circle cx="68" cy="152" r="2" fill={p.ink} stroke="none" />
      <path d="M118 146h26" stroke={p.accent} />
      <path d="M122 118c3-12 9-12 10 0" />
      <path d="M150 168c12 6 18 16 8 22" />
    </>
  ),
  roast: (p) => (
    <>
      <circle cx="100" cy="130" r="50" fill={p.wash} stroke="none" />
      <path d="M100 58v18" />
      <path d="M92 76h16" />
      <path d="M86 76c2 36 6 62 14 78 8-16 12-42 14-78" />
      <path d="M96 96c8 8 12 8 16-2" stroke={p.accent} />
      <path d="M46 196h108" />
      <path d="M58 196v16h84v-16" />
      <path d="M150 150l22 28" />
      <path d="M168 168l10 18" />
    </>
  ),
  egg: (p) => (
    <>
      <circle cx="100" cy="132" r="56" fill={p.wash} stroke="none" />
      <rect x="40" y="168" width="120" height="28" />
      <circle cx="72" cy="124" r="22" />
      <circle cx="72" cy="124" r="10" fill={p.accent} opacity="0.55" stroke="none" />
      <circle cx="124" cy="118" r="22" />
      <circle cx="124" cy="118" r="10" fill={p.accent} opacity="0.55" stroke="none" />
      <path d="M92 168c0-16 8-28 16-28s16 12 16 28" />
      <path d="M100 150h16" />
    </>
  ),
  dried: (p) => (
    <>
      <circle cx="100" cy="128" r="54" fill={p.wash} stroke="none" />
      <path d="M58 150c8-28 22-40 28-40 4 18 2 36-6 52" />
      <path d="M70 146c6-16 14-22 16-22 2 12 0 24-4 34" />
      <path d="M108 92h28v70h-28z" />
      <path d="M108 112h28" />
      <path d="M116 92c4-16 20-16 24 0" />
      <ellipse cx="78" cy="188" rx="22" ry="6" />
      <path d="M146 132c16 4 20 18 10 26" />
    </>
  ),
  stilt: (p) => (
    <>
      <circle cx="110" cy="132" r="52" fill={p.wash} stroke="none" />
      <path d="M24 168c24 8 48 8 152 0" />
      <path d="M20 182c32 10 60 8 164-2" />
      <path d="M48 168V132h28l6-16h22v52" />
      <path d="M54 132v-22h18v22" />
      <path d="M96 168V120h34l8-18h24v66" />
      <path d="M148 168V138h22v30" />
      <path d="M40 168v28M70 168v28M104 168v28M150 168v28M176 168v24" />
      <path d="M28 196c10-6 16-4 22 2 8-8 16-6 22 2" />
    </>
  ),
  rice: (p) => (
    <>
      <circle cx="100" cy="138" r="58" fill={p.wash} stroke="none" />
      <ellipse cx="100" cy="156" rx="54" ry="18" />
      <path d="M70 146c8-20 22-30 30-30s22 12 30 30" />
      <path d="M78 140c6-8 14-10 22-4" />
      <path d="M112 128c8 2 14 10 12 18" stroke={p.accent} />
      <path d="M124 118l28-22" />
      <path d="M132 124l26-18" />
      <path d="M64 176h72" />
    </>
  ),
  stall: (p) => (
    <>
      <circle cx="100" cy="136" r="54" fill={p.wash} stroke="none" />
      <path d="M36 112h128l-16 28H52L36 112Z" />
      <path d="M52 140h96v8H52z" />
      <path d="M64 148v36M136 148v36" />
      <path d="M58 184h84" />
      <path d="M78 184v16h-8M122 184v16h8" />
      <path d="M100 112V86" />
      <circle cx="100" cy="82" r="5" />
      <path d="M92 100c3-10 13-10 16 0" />
    </>
  ),
};

export function Plate({
  motif,
  tone,
  className,
  label,
}: {
  motif: Motif;
  tone: Tone;
  className?: string;
  label?: string;
}) {
  const palette = PALETTES[tone];
  return (
    <div className={cn("overflow-hidden", className)}>
      <svg viewBox="0 0 200 260" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label} className="h-full w-full">
        <rect width="200" height="260" fill={palette.bg} />
        <rect x="10" y="10" width="180" height="240" fill="none" stroke={palette.mid} strokeWidth="0.6" />
        <g stroke={palette.mid} strokeWidth="0.7" fill="none">
          <path d="M16 24h8M20 20v8" />
          <path d="M176 24h8M180 20v8" />
          <path d="M16 236h8M20 232v8" />
          <path d="M176 236h8M180 232v8" />
        </g>
        <g fill="none" stroke={palette.ink} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
          {DRAWINGS[motif](palette)}
        </g>
      </svg>
      <div className={cn("absolute inset-0", tone === "night" ? "plate-grain plate-grain-night" : "plate-grain")} />
    </div>
  );
}
