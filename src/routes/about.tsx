import { createFileRoute } from "@tanstack/react-router";
import { Activity, BookOpen, BrainCircuit, UserCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/nivox/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How NIVOX Voice Defense Works — Three-Signal Voice Analysis" },
      {
        name: "description",
        content:
          "How NIVOX combines speaker verification, synthetic-speech detection and acoustic explainability into a single voice-fraud risk verdict.",
      },
      { property: "og:title", content: "How NIVOX Voice Defense Works" },
      {
        property: "og:description",
        content:
          "Speaker verification, synthetic-speech detection and acoustic explainability combined into one risk verdict.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const SIGNALS = [
  {
    icon: UserCheck,
    title: "1 · Speaker verification",
    body: "The incoming audio is turned into a speaker embedding and compared against every enrolled voice. The console reports the best-matching identity and its similarity score, plus the full score list so an analyst can see how close the runner-up was.",
    points: [
      "Answers: is this the person they claim to be?",
      "Low similarity to all enrolments is itself a risk signal",
    ],
  },
  {
    icon: BrainCircuit,
    title: "2 · Synthetic-speech detection",
    body: "Two independent detectors run in parallel: AASIST3, a neural anti-spoofing model that learns artefacts of generated speech, and a Random Forest over hand-crafted acoustic features. Each returns a confidence and a flagged / not-flagged verdict.",
    points: [
      "Answers: was this voice generated or replayed?",
      "Agreement raises confidence; disagreement marks the verdict uncertain",
    ],
  },
  {
    icon: Activity,
    title: "3 · Acoustic explainability",
    body: "Interpretable voice measurements — jitter, shimmer, harmonics-to-noise ratio, and pitch mean and deviation — are shown against typical natural-speech reference ranges so a human can see why a verdict was reached.",
    points: [
      "Answers: which measurable properties look unnatural?",
      "Values outside the reference band are marked, never hidden",
    ],
  },
] as const;

function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="About / How It Works"
        subtitle="A three-signal approach to voice authenticity, combined into one risk verdict."
      />

      <Card className="bg-surface-elevated">
        <CardContent className="pt-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            NIVOX Voice Defense is an analyst console for voice-channel fraud. Audio — a live call
            captured in chunks, or an uploaded WAV/MP3 — is sent to the analysis API, which returns
            three independent signals. The console fuses them into a{" "}
            <span className="font-medium text-foreground">LOW / MEDIUM / HIGH</span> risk level with
            explicit reasons and a recommended action. No value is ever simulated: the dashboard
            stays empty until the API responds.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {SIGNALS.map(({ icon: Icon, title, body, points }) => (
          <Card key={title} className="bg-surface-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="size-4 text-primary" aria-hidden="true" />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{body}</p>
              <ul className="space-y-2">
                {points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-surface-elevated">
        <CardHeader>
          <CardTitle className="text-base">How the verdict is read</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-risk-low/40 bg-risk-low/10 p-4">
            <p className="font-semibold text-risk-low">LOW</p>
            <p className="mt-1 text-muted-foreground">
              Speaker matches enrolment, no detector flags, acoustics within typical ranges.
            </p>
          </div>
          <div className="rounded-xl border border-risk-medium/40 bg-risk-medium/10 p-4">
            <p className="font-semibold text-risk-medium">MEDIUM</p>
            <p className="mt-1 text-muted-foreground">
              Signals conflict — e.g. one detector flags, or similarity sits near the threshold.
              Step-up verification recommended.
            </p>
          </div>
          <div className="rounded-xl border border-risk-high/40 bg-risk-high/10 p-4">
            <p className="font-semibold text-risk-high">HIGH</p>
            <p className="mt-1 text-muted-foreground">
              Multiple signals agree on synthetic or mismatched speech. Treat the caller as
              unverified.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
