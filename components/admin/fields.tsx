import { cn } from "@/lib/cn";

export const fieldClass =
  "w-full border-b border-line bg-transparent py-2 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-accent";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] tracking-[0.18em] text-ink-soft">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function InkButton({
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn("rounded-2xl bg-accent px-4 py-3 text-[13px] tracking-[0.14em] text-white disabled:opacity-40", className)}
      {...props}
    />
  );
}

export function QuietButton({
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn("border border-line px-4 py-3 text-[13px] tracking-[0.14em]", className)}
      {...props}
    />
  );
}
