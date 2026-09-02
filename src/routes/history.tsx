import { createFileRoute } from "@tanstack/react-router";
import { History, Inbox } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/nivox/PageHeader";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Analysis History — NIVOX Voice Defense" },
      {
        name: "description",
        content:
          "Chronological log of completed voice authenticity analyses with risk level, timestamp and predicted speaker.",
      },
      { property: "og:title", content: "Analysis History — NIVOX Voice Defense" },
      {
        property: "og:description",
        content: "Log of completed voice authenticity analyses in NIVOX Voice Defense.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={History}
        title="Analysis History"
        subtitle="Completed analyses, newest first. Populated only by real API responses."
      />

      <Card className="bg-surface-elevated">
        <CardHeader>
          <CardTitle className="text-base">Analysis log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Risk level</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Predicted speaker</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={3} className="py-14">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="rounded-xl bg-muted p-3 text-muted-foreground">
                      <Inbox className="size-5" aria-hidden="true" />
                    </span>
                    <p className="text-sm font-semibold">No analyses recorded yet</p>
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Persistent history is not stored in this build. Completed analyses from the
                      current live call appear in the timeline on the Live Analysis page.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
