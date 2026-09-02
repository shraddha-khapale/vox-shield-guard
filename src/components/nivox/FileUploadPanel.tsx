import { useCallback, useRef, useState, type DragEvent } from "react";
import { AlertCircle, FileAudio, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { analyzeAudio, type AnalysisResult } from "@/lib/nivox-api";

import { EmptyResults } from "./EmptyResults";
import { ResultDashboard } from "./ResultDashboard";
import { riskStyles } from "./risk-ui";

const ACCEPT = ".wav,.mp3,audio/wav,audio/x-wav,audio/mpeg,audio/mp3";

function isAudioFile(file: File) {
  return /\.(wav|mp3)$/i.test(file.name) || file.type.startsWith("audio/");
}

export function FileUploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const runAnalysis = useCallback(async (selected: File) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeAudio(selected, selected.name);
      setResult(analysis);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const accept = useCallback(
    (selected: File | undefined) => {
      if (!selected) return;
      if (!isAudioFile(selected)) {
        setError("Please choose a WAV or MP3 audio file.");
        return;
      }
      setFile(selected);
      void runAnalysis(selected);
    },
    [runAnalysis],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-surface-elevated">
        <CardContent className="pt-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
            )}
          >
            <UploadCloud className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-semibold">Drop a WAV or MP3 file here</p>
            <p className="text-xs text-muted-foreground">or click to browse from your device</p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => accept(e.target.files?.[0])}
            />
          </div>

          {file && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
              <span className="flex items-center gap-2">
                <FileAudio className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium">{file.name}</span>
                <span className="text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => void runAnalysis(file)}
              >
                Re-analyse
              </Button>
            </div>
          )}

          {loading && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analysing audio…
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className={cn(
            "flex gap-3 rounded-xl border p-4 text-sm",
            riskStyles.HIGH.border,
            riskStyles.HIGH.bg,
          )}
        >
          <AlertCircle className={cn("mt-0.5 size-4 shrink-0", riskStyles.HIGH.text)} />
          <p>{error}</p>
        </div>
      )}

      {result ? (
        <ResultDashboard result={result} {...(updatedAt ? { updatedAt } : {})} />
      ) : (
        <EmptyResults
          title="No file analysed yet"
          description="Upload a WAV or MP3 file to see risk level, speaker match, detector verdicts and acoustic explainability returned by the analysis API."
        />
      )}
    </div>
  );
}
