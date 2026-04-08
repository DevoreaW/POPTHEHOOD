import { z } from 'zod';
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport } from "../types";

const DiagnosticSchema = z.object({
  severity: z.enum(['GREEN', 'YELLOW', 'RED']),
  analysisSummary: z.string(),
  mostLikelyCauses: z.array(z.object({
    issue: z.string(),
    probability: z.string(),
    reasoning: z.string(),
  })),
  mechanicalExplanation: z.string(),
  recommendedActions: z.array(z.string()),
  costEstimate: z.object({ parts: z.string(), labor: z.string(), total: z.string() }),
  diyVsPro: z.object({
    canDiy: z.boolean(),
    explanation: z.string(),
    safetyWarnings: z.array(z.string()),
  }),
  urgency: z.object({
    timeline: z.string(),
    risksOfDelay: z.string(),
    workarounds: z.string().optional(),
  }),
  followUpQuestions: z.array(z.string()),
  additionalContext: z.object({
    commonModelIssues: z.string(),
    recallPotential: z.string(),
    prevention: z.string(),
  }),
});

const TireScanSchema = z.object({
  healthScore: z.number().min(0).max(100),
  estimatedTreadDepth: z.string(),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Replace Soon', 'Dangerous']),
  findings: z.array(z.string()),
  recommendation: z.string(),
  safetyWarning: z.string().optional(),
  visualAnomalies: z.array(z.string()),
});

export const generateDiagnosticReport = async (
  vehicle: VehicleInfo,
  input: DiagnosticInput
): Promise<DiagnosticReport> => {
  const callDiagnose = async (prompt: string, images?: { data: string; mimeType: string }[]) => {
    const response = await fetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, images })
    });
    const raw = await response.text();
    if (!raw) throw new Error('Empty response from server. Please try again.');
    let data: any;
    try { data = JSON.parse(raw); } catch { throw new Error('Unexpected response from server. Please try again.'); }
    if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
    return data.result;
  };

  const mediaFiles = (input.files || [])
    .filter(f => f.type === 'image' || f.type === 'video')
    .map(f => ({ data: f.data.split(',')[1] || f.data, mimeType: f.mimeType, type: f.type }));

  const imageCount = mediaFiles.filter(f => f.type === 'image').length;
  const videoCount = mediaFiles.filter(f => f.type === 'video').length;
  const mediaParts = mediaFiles.map(({ data, mimeType }) => ({ data, mimeType }));

  const mediaNote = mediaFiles.length > 0
    ? `\nATTACHED MEDIA: The user has provided ${imageCount > 0 ? `${imageCount} image(s)` : ''}${imageCount > 0 && videoCount > 0 ? ' and ' : ''}${videoCount > 0 ? `${videoCount} short video clip(s)` : ''} for visual/audio reference. Analyze them as additional diagnostic evidence alongside the description.\n`
    : '';

  const prompt = `You are an ASE-certified master automotive technician with 25+ years of diagnostic experience.

VEHICLE CONTEXT:
Make: ${vehicle.make}
Model: ${vehicle.model}
Year: ${vehicle.year}
Mileage: ${vehicle.mileage}
Engine Type: ${vehicle.engine || 'Unknown'}

USER SYMPTOM DESCRIPTION:
${input.description}
${mediaNote}
OBD-II CODES:
${input.obdCodes || 'None provided'}

Respond ONLY with a valid JSON object with these fields:
{
  "severity": "GREEN" | "YELLOW" | "RED",
  "analysisSummary": "string",
  "mostLikelyCauses": [{ "issue": "string", "probability": "string", "reasoning": "string" }],
  "mechanicalExplanation": "string",
  "recommendedActions": ["string"],
  "costEstimate": { "parts": "string", "labor": "string", "total": "string" },
  "diyVsPro": { "canDiy": boolean, "explanation": "string", "safetyWarnings": ["string"] },
  "urgency": { "timeline": "string", "risksOfDelay": "string", "workarounds": "string" },
  "followUpQuestions": ["string"],
  "additionalContext": { "commonModelIssues": "string", "recallPotential": "string", "prevention": "string" }
}`;

  const text = await callDiagnose(prompt, mediaParts.length > 0 ? mediaParts : undefined);

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = DiagnosticSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) throw new Error('Invalid response shape');
    return { ...parsed.data, id: crypto.randomUUID(), timestamp: Date.now(), vehicle } as DiagnosticReport;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Diagnosis failed. Please try again with clearer inputs.");
  }
};

export const analyzeTireTread = async (
  imageData: string,
  mimeType: string
): Promise<TireAnalysisReport> => {
  const prompt = `You are a tire specialist. Analyze this tire image and respond ONLY with a valid JSON object:
{
  "healthScore": number,
  "estimatedTreadDepth": "string",
  "condition": "Excellent" | "Good" | "Fair" | "Replace Soon" | "Dangerous",
  "findings": ["string"],
  "recommendation": "string",
  "safetyWarning": "string",
  "visualAnomalies": ["string"]
}`;

  const base64Data = imageData.split(',')[1] || imageData;

  const response = await fetch('/api/tire-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData: base64Data, mimeType, prompt })
  });

  const raw = await response.text();
  if (!raw) throw new Error('Empty response from server. Please try again.');
  let data: any;
  try { data = JSON.parse(raw); } catch { throw new Error('Unexpected response from server. Please try again.'); }
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  const text = data.result;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = TireScanSchema.safeParse(JSON.parse(clean));
    if (!parsed.success) throw new Error('Invalid response shape');
    return { ...parsed.data, id: crypto.randomUUID(), timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to parse tire scan response', error);
    throw new Error('Tire scan failed. Please try again.');
  }
};

export const askFollowUpQuestion = async (
  question: string,
  report: DiagnosticReport,
  userAnswer: string
): Promise<string> => {
  const prompt = `You are an ASE-certified master automotive technician.

VEHICLE: ${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model} (${report.vehicle.mileage} miles)
ORIGINAL DIAGNOSIS SUMMARY: ${report.analysisSummary}
MOST LIKELY CAUSES: ${report.mostLikelyCauses.map(c => c.issue).join(', ')}

FOLLOW-UP QUESTION ASKED: ${question}
USER'S ANSWER: ${userAnswer}

Based on the user's answer, give a focused, practical response in 2-4 sentences that narrows down the diagnosis or tells them what to do next. Plain text only — no JSON, no markdown headers, no bullet points.`;

  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const raw = await response.text();
  if (!raw) throw new Error('Empty response from server. Please try again.');
  let data: any;
  try { data = JSON.parse(raw); } catch { throw new Error('Unexpected response from server. Please try again.'); }
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);
  return data.result;
};

export const searchNearbyServices = async (
  type: 'mechanic' | 'towing',
  latitude: number,
  longitude: number
): Promise<ServiceSearchReport> => {
  const response = await fetch('/api/places', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, type })
  });

  const raw = await response.text();
  if (!raw) throw new Error('Empty response from server. Please try again.');
  let data: any;
  try { data = JSON.parse(raw); } catch { throw new Error('Unexpected response from server. Please try again.'); }
  if (!response.ok) throw new Error(data?.error || `Request failed (${response.status})`);

  if (!data.places || data.places.length === 0) {
    return {
      type,
      text: `No ${type === 'mechanic' ? 'mechanics' : 'towing services'} found nearby.`,
      places: [],
      timestamp: Date.now()
    };
  }

  const places = data.places.map((place: any) => ({
  title: place.title || 'Unknown',
  uri: place.uri || '',
  snippet: place.snippet || ''
}));

  return {
    type,
    text: `Found ${places.length} ${type === 'mechanic' ? 'mechanic shops' : 'towing services'} near you.`,
    places,
    timestamp: Date.now()
  };
};