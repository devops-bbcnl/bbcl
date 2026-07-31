import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  tone?: "default" | "blue" | "gold";
};

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-slate-100 text-slate-600",
  blue: "bg-bb-blue/10 text-bb-blue",
  gold: "bg-bb-gold/10 text-bb-gold",
};

export function StatCard({ label, value, Icon, tone = "default" }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold tabular-nums leading-tight text-slate-900">{value}</p>
        <p className="truncate text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
