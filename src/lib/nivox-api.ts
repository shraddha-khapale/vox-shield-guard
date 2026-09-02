/**
 * NIVOX Voice Defense — API service module.
 *
 * ⚙️ CONFIGURE THE BACKEND HERE.
 * Change this single constant to point the whole app at another server.
 */
export const API_BASE_URL = "http://localhost:8000";

export const ANALYZE_ENDPOINT = `${API_BASE_URL}/analyze`;

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";

export type SpeakerResult = {
  predicted_speaker: string | null;
  similarity: number | null;
  all_scores: Record<string, number>;
};

export type SyntheticResult = {
  aasist_score: number | null;
  rf_score: number | null;
  combined_score: number | null;
  flagged_by: string[];
};

export type Explainability = {
  jitter_local: number | null;
  shimmer_local: number | null;
  hnr: number | null;
  f0_mean: number | null;
  f0_std: number | null;
};

export type AnalysisResult = {
  risk_level: RiskLevel;
  recommended_action: string | null;
  reasons: string[];
  speaker_result: SpeakerResult;
  synthetic_result: SyntheticResult;
  explainability: Explainability;
};

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v)
    ? v
    : typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))
      ? Number(v)
      : null;

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v : null;

const strArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim() !== "") : [];

const scoreMap = (v: unknown): Record<string, number> => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, raw] of Object.entries(v as Record<string, unknown>)) {
    const n = num(raw);
    if (n !== null) out[k] = n;
  }
  return out;
};

const riskLevel = (v: unknown): RiskLevel => {
  const s = String(v ?? "").toUpperCase();
  return s === "LOW" || s === "MEDIUM" || s === "HIGH" ? s : "UNKNOWN";
};

/** Defensively maps any (possibly partial) backend payload into AnalysisResult. */
export function mapAnalysisResponse(raw: unknown): AnalysisResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  const speaker = (r["speaker_result"] ?? {}) as Record<string, unknown>;
  const synth = (r["synthetic_result"] ?? {}) as Record<string, unknown>;
  const expl = (r["explainability"] ?? {}) as Record<string, unknown>;

  return {
    risk_level: riskLevel(r["risk_level"]),
    recommended_action: str(r["recommended_action"]),
    reasons: strArray(r["reasons"]),
    speaker_result: {
      predicted_speaker: str(speaker["predicted_speaker"]),
      similarity: num(speaker["similarity"]),
      all_scores: scoreMap(speaker["all_scores"]),
    },
    synthetic_result: {
      aasist_score: num(synth["aasist_score"]),
      rf_score: num(synth["rf_score"]),
      combined_score: num(synth["combined_score"]),
      flagged_by: strArray(synth["flagged_by"]),
    },
    explainability: {
      jitter_local: num(expl["jitter_local"]),
      shimmer_local: num(expl["shimmer_local"]),
      hnr: num(expl["hnr"]),
      f0_mean: num(expl["f0_mean"]),
      f0_std: num(expl["f0_std"]),
    },
  };
}

/** POSTs an audio blob/file to `${API_BASE_URL}/analyze` as multipart/form-data. */
export async function analyzeAudio(
  audio: Blob,
  filename = "audio.webm",
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("audio", audio, filename);
  form.append("file", audio, filename);

  let response: Response;
  try {
    response = await fetch(ANALYZE_ENDPOINT, {
      method: "POST",
      body: form,
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new Error(
      `Could not reach the analysis API at ${ANALYZE_ENDPOINT}. Check that the service is running and CORS is allowed.`,
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Analysis API returned ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  const json = await response.json().catch(() => {
    throw new Error("Analysis API returned a response that was not valid JSON.");
  });
  return mapAnalysisResponse(json);
}

/** Clearly labelled sample payload used to demonstrate the UI before any real call. */
export const DEMO_RESULT: AnalysisResult = mapAnalysisResponse({
  risk_level: "MEDIUM",
  recommended_action: "Escalate to step-up verification before authorising any transaction.",
  reasons: [
    "Speaker similarity below enrolment threshold (0.61 < 0.75)",
    "Random Forest acoustic model flagged unnatural shimmer",
    "AASIST3 neural score in the uncertain band",
  ],
  speaker_result: {
    predicted_speaker: "speaker_04 (A. Mehta)",
    similarity: 0.61,
    all_scores: {
      "speaker_04 (A. Mehta)": 0.61,
      "speaker_11 (R. Osei)": 0.44,
      "speaker_02 (L. Chen)": 0.29,
      "speaker_07 (D. Novak)": 0.18,
    },
  },
  synthetic_result: {
    aasist_score: 0.52,
    rf_score: 0.78,
    combined_score: 0.65,
    flagged_by: ["random_forest"],
  },
  explainability: {
    jitter_local: 0.019,
    shimmer_local: 0.071,
    hnr: 14.2,
    f0_mean: 138.4,
    f0_std: 11.7,
  },
});

export const REFERENCE_RANGES: Record<
  keyof Explainability,
  { label: string; unit: string; min: number; max: number; axisMax: number }
> = {
  jitter_local: { label: "Jitter (local)", unit: "", min: 0.001, max: 0.02, axisMax: 0.04 },
  shimmer_local: { label: "Shimmer (local)", unit: "", min: 0.01, max: 0.06, axisMax: 0.12 },
  hnr: { label: "HNR", unit: "dB", min: 15, max: 30, axisMax: 40 },
  f0_mean: { label: "F0 mean", unit: "Hz", min: 85, max: 255, axisMax: 320 },
  f0_std: { label: "F0 std", unit: "Hz", min: 10, max: 45, axisMax: 80 },
};

export type TimelineEvent = {
  id: string;
  time: string;
  risk: RiskLevel;
  note: string;
};
