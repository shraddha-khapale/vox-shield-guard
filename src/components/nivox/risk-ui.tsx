import { AlertTriangle, CheckCircle2, HelpCircle, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/nivox-api";

export const riskStyles: Record<
  RiskLevel,
  { text: string; bg: string; border: string; bar: string; label: string }
> = {
  LOW: {
    text: "text-risk-low",
    bg: "bg-risk-low/10",
    border: "border-risk-low/60",
    bar: "bg-risk-low",
    label: "Low risk",
  },
  MEDIUM: {
    text: "text-risk-medium",
    bg: "bg-risk-medium/10",
    border: "border-risk-medium/70",
    bar: "bg-risk-medium",
    label: "Medium risk",
  },
  HIGH: {
    text: "text-risk-high",
    bg: "bg-risk-high/10",
    border: "border-risk-high/80",
    bar: "bg-risk-high",
    label: "High risk",
  },
  UNKNOWN: {
    text: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border",
    bar: "bg-muted-foreground",
    label: "Unknown",
  },
};

export function RiskIcon({ risk, className }: { risk: RiskLevel; className?: string }) {
  const Icon =
    risk === "LOW"
      ? CheckCircle2
      : risk === "MEDIUM"
        ? AlertTriangle
        : risk === "HIGH"
          ? ShieldAlert
          : HelpCircle;
  return <Icon className={className} aria-hidden="true" />;
}

export function MeterBar({
  value,
  max = 1,
  tone = "primary",
  className,
}: {
  value: number;
  max?: number;
  tone?: "primary" | "low" | "medium" | "high" | "muted";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  const toneClass = {
    primary: "bg-primary",
    low: "bg-risk-low",
    medium: "bg-risk-medium",
    high: "bg-risk-high",
    muted: "bg-muted-foreground",
  }[tone];
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", toneClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function fmt(value: number | null, digits = 2, unit = "") {
  if (value === null) return "—";
  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ""}`;
}
