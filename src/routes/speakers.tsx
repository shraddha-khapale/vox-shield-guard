import { createFileRoute } from "@tanstack/react-router";
import { Info, UserPlus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/nivox/PageHeader";

export const Route = createFileRoute("/speakers")({
  head: () => ({
    meta: [
      { title: "Enrolled Speakers — NIVOX Voice Defense" },
      {
        name: "description",
        content:
          "Directory of enrolled voice identities used for speaker verification in the NIVOX Voice Defense console.",
      },
      { property: "og:title", content: "Enrolled Speakers — NIVOX Voice Defense" },
      {
        property: "og:description",
        content: "Voice enrolment directory backing speaker verification in NIVOX Voice Defense.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpeakersPage,
});

const SPEAKERS = ["Aryan", "Mayuresh", "Sakshi", "Shraddha"] as const;

function SpeakersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Enrolled Speakers"
        subtitle="Voice identities available to the speaker-verification signal."
      />

      <Card className="bg-surface-elevated">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Enrolment directory</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <UserPlus className="size-4" /> Add voice (coming soon)
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {SPEAKERS.map((name) => (
            <div
              key={name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                  {name.slice(0, 1)}
                </span>
                <p className="text-sm font-medium">{name}</p>
              </div>
              <Badge variant="outline" className="border-risk-low/40 bg-risk-low/10 text-risk-low">
                Enrolled
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          This is a future-ready directory. Enrolment management and per-speaker voice metrics are
          not implemented yet — similarity scores are only ever shown from live analysis responses
          returned by the API.
        </p>
      </div>
    </div>
  );
}
