import { AudioWaveform, BrainCircuit, UserCheck, Activity } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const signals = [
  { icon: UserCheck, label: "Speaker verification", hint: "Similarity against enrolled voices" },
  { icon: BrainCircuit, label: "Synthetic detection", hint: "AASIST3 + Random Forest verdicts" },
  { icon: Activity, label: "Acoustic explainability", hint: "Jitter, shimmer, HNR, F0" },
];

export function EmptyResults({
  title = "No analysis yet",
  description = "Results appear here as soon as the analysis API returns a response. Nothing is pre-filled — every value shown comes from a real call or uploaded file.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Card className="border-dashed bg-surface-elevated">
      <CardContent className="flex flex-col items-center gap-6 py-12 text-center">
        <span className="rounded-2xl bg-muted p-4 text-muted-foreground">
          <AudioWaveform className="size-7" aria-hidden="true" />
        </span>
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-3">
          {signals.map(({ icon: Icon, label, hint }) => (
            <div key={label} className="rounded-xl border border-border bg-surface p-4 text-left">
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
