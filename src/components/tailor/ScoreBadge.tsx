"use client";

function scoreColor(score: number): string {
  if (score >= 75) return "border-brand-500 text-brand-700 bg-brand-50";
  if (score >= 50) return "border-brand-300 text-brand-600 bg-brand-50/80";
  return "border-slate-300 text-slate-600 bg-slate-50";
}

interface ScoreBadgeProps {
  label: string;
  score: number;
  size?: "sm" | "lg";
}

export function ScoreBadge({ label, score, size = "lg" }: ScoreBadgeProps) {
  const ringClass =
    size === "lg"
      ? "score-ring"
      : "flex h-14 w-14 items-center justify-center rounded-full border-4 text-base font-bold";
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${ringClass} ${scoreColor(score)}`}>{score}</div>
      <span className="text-xs font-semibold text-brand-700 text-center">{label}</span>
    </div>
  );
}
