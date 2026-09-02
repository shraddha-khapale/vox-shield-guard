import { Activity, BrainCircuit, Trees, UserCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { REFERENCE_RANGES, type AnalysisResult, type Explainability } from "@/lib/nivox-api";

import { MeterBar, RiskIcon, fmt, riskStyles } from "./risk-ui";

function DetectorCard({
  title,
  subtitle,
  icon: Icon,
  score,
  flagged,
}: {
  title: string;
  subtitle: string;
  icon: typeof BrainCircuit;
  score: number | null;
  flagged: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface-elevated p-5",
        flagged ? riskStyles.HIGH.border : riskStyles.LOW.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-muted p-2 text-muted-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0",
            flagged
              ? `${riskStyles.HIGH.bg} ${riskStyles.HIGH.text} ${riskStyles.HIGH.border}`
              : `${riskStyles.LOW.bg} ${riskStyles.LOW.text} ${riskStyles.LOW.border}`,
          )}
        >
          {flagged ? "Flagged" : "Not flagged"}
        </Badge>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">Synthetic confidence</span>
          <span className="font-mono text-base font-semibold">{fmt(score)}</span>
        </div>
        <MeterBar value={score ?? 0} tone={flagged ? "high" : "low"} />
      </div>
    </div>
  );
}

function ExplainabilityRow({
  metricKey,
  value,
}: {
  metricKey: keyof Explainability;
  value: number | null;
}) {
  const ref = REFERENCE_RANGES[metricKey];
  const abnormal = value !== null && (value < ref.min || value > ref.max);
  const pct = (v: number) => Math.max(0, Math.min(100, (v / ref.axisMax) * 100));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium">{ref.label}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono">
            {value === null ? "—" : `${value} ${ref.unit}`.trim()}
          </span>
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs",
              value === null
                ? "text-muted-foreground"
                : abnormal
                  ? `${riskStyles.HIGH.bg} ${riskStyles.HIGH.text} ${riskStyles.HIGH.border}`
                  : `${riskStyles.LOW.bg} ${riskStyles.LOW.text} ${riskStyles.LOW.border}`,
            )}
          >
            {value === null ? "no data" : abnormal ? "outside typical" : "typical"}
          </span>
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 rounded-full bg-risk-low/25"
          style={{ left: `${pct(ref.min)}%`, width: `${pct(ref.max) - pct(ref.min)}%` }}
        />
        {value !== null && (
          <div
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-background transition-all duration-700",
              abnormal ? "bg-risk-high" : "bg-risk-low",
            )}
            style={{ left: `${pct(value)}%` }}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Typical natural speech: {ref.min}–{ref.max} {ref.unit}
      </p>
    </div>
  );
}

export function ResultDashboard({
  result,
  updatedAt,
}: {
  result: AnalysisResult;
  updatedAt?: string;
}) {
  const styles = riskStyles[result.risk_level];
  const synth = result.synthetic_result;
  const flaggedBy = synth.flagged_by.map((f) => f.toLowerCase());
  const aasistFlagged = flaggedBy.some((f) => f.includes("aasist"));
  const rfFlagged = flaggedBy.some((f) => f.includes("rf") || f.includes("forest"));
  const agree = aasistFlagged === rfFlagged;
  const scores = Object.entries(result.speaker_result.all_scores).sort((a, b) => b[1] - a[1]);
  const topScore = scores[0]?.[1] ?? 1;

  return (
    <div key={updatedAt} className="animate-data-in space-y-6">


      <Card className={cn("border-2 bg-surface-elevated", styles.border, styles.bg)}>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className={cn("rounded-2xl p-3", styles.bg, styles.text)}>
                <RiskIcon risk={result.risk_level} className="size-8" />
              </span>
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                  Risk level
                </p>
                <p className={cn("text-4xl font-bold tracking-tight sm:text-5xl", styles.text)}>
                  {result.risk_level}
                </p>
              </div>
            </div>
            {updatedAt && (
              <p className="text-xs text-muted-foreground">Analysed at {updatedAt}</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Recommended action
            </p>
            <p className="mt-1 text-base font-medium">
              {result.recommended_action ?? "No recommendation returned by the API."}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Reasons
            </p>
            {result.reasons.length ? (
              <ul className="mt-2 space-y-2">
                {result.reasons.map((reason, i) => (
                  <li key={`${i}-${reason}`} className="flex gap-2 text-sm">
                    <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", styles.bar)} />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No reasons provided.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-surface-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCheck className="size-4 text-muted-foreground" aria-hidden="true" />
              Speaker identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Predicted speaker</p>
                <p className="text-lg font-semibold">
                  {result.speaker_result.predicted_speaker ?? "Unidentified"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Similarity</p>
                <p className="font-mono text-lg font-semibold">
                  {fmt(result.speaker_result.similarity)}
                </p>
              </div>
            </div>
            {scores.length ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  All enrolment scores
                </p>
                {scores.map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate pr-2">{name}</span>
                      <span className="font-mono text-muted-foreground">{value.toFixed(2)}</span>
                    </div>
                    <MeterBar
                      value={value}
                      max={Math.max(1, topScore)}
                      tone={value === topScore ? "primary" : "muted"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No comparison scores returned.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <DetectorCard
            title="AASIST3"
            subtitle="Neural spoof detector"
            icon={BrainCircuit}
            score={synth.aasist_score}
            flagged={aasistFlagged}
          />
          <DetectorCard
            title="Random Forest"
            subtitle="Acoustic feature detector"
            icon={Trees}
            score={synth.rf_score}
            flagged={rfFlagged}
          />
          <div
            className={cn(
              "rounded-xl border p-4 text-sm",
              agree ? riskStyles.LOW.border : riskStyles.MEDIUM.border,
              agree ? riskStyles.LOW.bg : riskStyles.MEDIUM.bg,
            )}
          >
            <p className={cn("font-semibold", agree ? riskStyles.LOW.text : riskStyles.MEDIUM.text)}>
              {agree ? "Detectors agree" : "Detectors disagree"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {agree
                ? aasistFlagged
                  ? "Both models flag this audio as synthetic."
                  : "Neither model flags this audio as synthetic."
                : `Only ${aasistFlagged ? "AASIST3" : "Random Forest"} flagged this audio — treat the verdict as uncertain.`}
            </p>
            <p className="mt-3 flex items-baseline justify-between">
              <span className="text-muted-foreground">Combined score</span>
              <span className="font-mono font-semibold">{fmt(synth.combined_score)}</span>
            </p>
            <MeterBar
              className="mt-2"
              value={synth.combined_score ?? 0}
              tone={agree && !aasistFlagged ? "low" : "medium"}
            />
          </div>
        </div>
      </div>

      <Card className="bg-surface-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
            Acoustic explainability
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {(Object.keys(REFERENCE_RANGES) as Array<keyof Explainability>).map((key) => (
            <ExplainabilityRow key={key} metricKey={key} value={result.explainability[key]} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
