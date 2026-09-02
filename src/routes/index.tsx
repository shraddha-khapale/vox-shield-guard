import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_BASE_URL } from "@/lib/nivox-api";
import { FileUploadPanel } from "@/components/nivox/FileUploadPanel";
import { LiveCallPanel } from "@/components/nivox/LiveCallPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NIVOX Voice Defense — Deepfake & Voice Authenticity Dashboard" },
      {
        name: "description",
        content:
          "Real-time voice authenticity and deepfake detection dashboard for fraud analysts: live call risk scoring, speaker verification and acoustic explainability.",
      },
      { property: "og:title", content: "NIVOX Voice Defense — Voice Deepfake Detection" },
      {
        property: "og:description",
        content:
          "Analyse live calls and uploaded audio for synthetic speech with risk scoring, speaker matching and acoustic explainability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">NIVOX Voice Defense</h1>
              <p className="text-sm text-muted-foreground">
                Real-time voice authenticity &amp; deepfake detection
              </p>
            </div>
          </div>
          <p className="rounded-lg border border-border bg-surface-elevated px-3 py-2 font-mono text-xs text-muted-foreground">
            API: {API_BASE_URL}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Tabs defaultValue="live" className="space-y-8">
          <TabsList className="h-auto w-full max-w-md bg-surface-elevated p-1">
            <TabsTrigger value="live" className="flex-1 py-2">
              Live call simulation
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1 py-2">
              File upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="live" className="focus-visible:outline-none">
            <LiveCallPanel />
          </TabsContent>
          <TabsContent value="upload" className="focus-visible:outline-none">
            <FileUploadPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        Client-side analyst console · all analysis performed by the configured NIVOX API
      </footer>
    </div>
  );
}
