import { GoogleGenerativeAI } from "@google/generative-ai";
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport, ServiceResult } from "../types";

const getAI = () => new GoogleGenerativeAI((import.meta as any).env.VITE_API_KEY);

export const generateDiagnosticReport = async (
  vehicle: VehicleInfo,
  input: DiagnosticInput
): Promise<DiagnosticReport> => {
  const callDiagnose = async (prompt: string) => {
  const response = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  return data.result;
};

  const prompt = `You are an ASE-certified master automotive technician with 25+ years of diagnostic experience.

VEHICLE CONTEXT:
Make: ${vehicle.make}
Model: ${vehicle.model}
Year: ${vehicle.year}
Mileage: ${vehicle.mileage}
Engine Type: ${vehicle.engine || 'Unknown'}

USER SYMPTOM DESCRIPTION:
${input.description}

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

  const text = await callDiagnose(prompt);

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return { ...data, id: crypto.randomUUID(), timestamp: Date.now(), vehicle } as DiagnosticReport;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Diagnosis failed. Please try again with clearer inputs.");
  }
};

export const analyzeTireTread = async (
  imageData: string,
  mimeType: string
): Promise<TireAnalysisReport> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  const result = await model.generateContent([
    prompt,
    { inlineData: { data: imageData.split(',')[1], mimeType } }
  ]);

  const text = result.response.text();
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return { ...data, id: crypto.randomUUID(), timestamp: Date.now() } as TireAnalysisReport;
  } catch (error) {
    console.error("Tire analysis failed", error);
    throw new Error("Tire scan failed. Ensure the photo is clear and shows the tread detail.");
  }
};

export const searchNearbyServices = async (
  type: 'mechanic' | 'towing',
  latitude: number,
  longitude: number
): Promise<ServiceSearchReport> => {
  const ai = getAI();
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = type === 'mechanic'
    ? `Find highly-rated mechanic shops near latitude ${latitude}, longitude ${longitude}. Respond with a JSON object: { "text": "summary", "places": [{ "title": "string", "uri": "", "snippet": "string" }] }`
    : `Find 24/7 towing services near latitude ${latitude}, longitude ${longitude}. Respond with a JSON object: { "text": "summary", "places": [{ "title": "string", "uri": "", "snippet": "string" }] }`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(clean);
    return { type, text: data.text, places: data.places || [], timestamp: Date.now() };
  } catch {
    return { type, text: text, places: [], timestamp: Date.now() };
  }
};