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
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        title="Live Analysis"
        subtitle="Stream a live call or upload a file — results come only from the configured NIVOX API."
      />

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
    </div>
  );
}
