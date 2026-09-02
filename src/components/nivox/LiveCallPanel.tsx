import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Mic, PhoneCall, PhoneOff, Radio } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DEMO_RESULT,
  analyzeAudio,
  type AnalysisResult,
  type TimelineEvent,
} from "@/lib/nivox-api";

import { ResultDashboard } from "./ResultDashboard";
import { RiskIcon, riskStyles } from "./risk-ui";

const CHUNK_MS = 4000;

export function LiveCallPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(0);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controllersRef = useRef<Set<AbortController>>(new Set());
  const activeRef = useRef(false);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        /* already stopped */
      }
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const sendChunk = useCallback(async (blob: Blob) => {
    if (!blob.size) return;
    const controller = new AbortController();
    controllersRef.current.add(controller);
    setPending((n) => n + 1);
    try {
      const analysis = await analyzeAudio(
        blob,
        `live-chunk-${Date.now()}.webm`,
        controller.signal,
      );
      if (!activeRef.current) return;
      const time = new Date().toLocaleTimeString();
      setError(null);
      setResult(analysis);
      setUpdatedAt(time);
      setEvents((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            time,
            risk: analysis.risk_level,
            note: analysis.reasons[0] ?? analysis.recommended_action ?? "Chunk analysed",
          },
          ...prev,
        ].slice(0, 30),
      );
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Chunk analysis failed.");
    } finally {
      controllersRef.current.delete(controller);
      setPending((n) => Math.max(0, n - 1));
    }
  }, []);

  const startSegment = useCallback(() => {
    const stream = streamRef.current;
    if (!stream || !activeRef.current) return;
    const chunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream);
    } catch {
      setError("This browser could not start a MediaRecorder for the microphone stream.");
      return;
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      if (chunks.length) void sendChunk(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
    };
    recorder.start();
  }, [sendChunk]);

  const startCall = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone capture is not supported in this browser.");
      return;
    }
    if (typeof window === "undefined" || typeof window.MediaRecorder === "undefined") {
      setError("MediaRecorder is not available in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      setError(
        err instanceof Error && err.name === "NotAllowedError"
          ? "Microphone permission was denied. Allow access to run a live call."
          : "Could not access the microphone.",
      );
      return;
    }
    activeRef.current = true;
    setIsRecording(true);
    setEvents([]);
    startSegment();
    intervalRef.current = setInterval(() => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state === "recording") recorder.stop();
      startSegment();
    }, CHUNK_MS);
  }, [startSegment]);

  const stopCall = useCallback(() => {
    cleanup();
    setIsRecording(false);
    setPending(0);
  }, [cleanup]);

  const showDemo = result === null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="bg-surface-elevated">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "flex size-12 items-center justify-center rounded-full",
                  isRecording
                    ? "animate-live-ring bg-risk-high/15 text-risk-high"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isRecording ? <Radio className="size-5" /> : <Mic className="size-5" />}
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {isRecording ? "Live — recording call audio" : "Idle — no active call"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRecording
                    ? `Streaming ~${CHUNK_MS / 1000}s chunks to /analyze${pending ? ` · ${pending} in flight` : ""}`
                    : "Start a call to capture microphone audio and analyse it continuously."}
                </p>
              </div>
            </div>
            {isRecording ? (
              <Button variant="destructive" onClick={stopCall}>
                <PhoneOff className="size-4" /> Stop call
              </Button>
            ) : (
              <Button onClick={() => void startCall()}>
                <PhoneCall className="size-4" /> Start call
              </Button>
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

        <ResultDashboard
          result={result ?? DEMO_RESULT}
          isDemo={showDemo}
          {...(updatedAt ? { updatedAt } : {})}
        />
      </div>

      <Card className="h-fit bg-surface-elevated lg:sticky lg:top-6">
        <CardHeader>
          <CardTitle className="text-base">Call timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Risk events for each analysed chunk will appear here during a live call.
            </p>
          ) : (
            <ol className="space-y-3">
              {events.map((event) => {
                const styles = riskStyles[event.risk];
                return (
                  <li
                    key={event.id}
                    className={cn(
                      "animate-data-in rounded-lg border p-3 text-sm",
                      styles.border,
                      styles.bg,
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn("flex items-center gap-2 font-semibold", styles.text)}>
                        <RiskIcon risk={event.risk} className="size-4" />
                        {event.risk}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{event.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
