# NivoX Voice Shield

Build a frontend-only web app called “NIVOX Voice Defense,” a real-time voice authenticity and deepfake detection dashboard for security/fraud analysts. Do not enable Lovable Cloud, Supabase, or any database. It must call a configurable REST API base URL constant set initially to http://localhost:8000.

Dark, clean, analytical security-ops aesthetic: approachable rather than intimidating, sans-serif, generous spacing, subtle data-update animation, meaningful severity colors only (green LOW, amber MEDIUM, red HIGH). Responsive UI.

Implement two clearly switchable tabs:
1) Live Call Simulation: Start Call asks microphone permission, records browser audio with MediaRecorder, sends rolling approximately 4-second chunks to POST `${API_BASE_URL}/analyze` as multipart/form-data audio file. Show active/live recording indicator and Stop Call. As results return, update the prominent result dashboard and append a timestamped risk event to a small running call history/timeline. Clean up media tracks and intervals on stop/unmount. Gracefully show API/mic errors.
2) File Upload: drag/drop and click-to-browse WAV/MP3 audio. Send selected file to same POST /analyze multipart endpoint; show analysis loading/error states.

Create robust client response mapping expecting JSON fields: risk_level, recommended_action, reasons[], speaker_result {predicted_speaker, similarity, all_scores}, synthetic_result {aasist_score, rf_score, combined_score, flagged_by}, explainability {jitter_local, shimmer_local, hnr, f0_mean, f0_std}. Safely handle absent fields and demonstrate the UI with clearly labeled sample/demo data before a real call runs. Keep the API base URL clearly configurable at the top of an API/service code module.

Results UX after each analysis:
- Large, unmissable color-coded LOW/MEDIUM/HIGH risk badge, recommended action block, and reason bullets.
- Secondary detailed analytics: speaker identity and confidence plus horizontal bar chart for every entry in all_scores; two detector cards for AASIST3 neural and Random Forest acoustic showing flagged/not flagged, confidence, and visible agreement/disagreement; acoustic explainability chart for jitter, shimmer, HNR, F0 mean, F0 std alongside typical natural-speech reference ranges / abnormality indication.
- Live-mode timeline of analyzed chunks with time and risk level.

Make all functionality client-side. Test the app build and ensure it renders well.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52ae7af9-aeeb-4980-b9ff-428f1485743b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
