import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport } from "../types";

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

  const data = await response.json();
  const text = data.result;

  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    return { ...parsed, id: crypto.randomUUID(), timestamp: Date.now() };
  } catch (error) {
    console.error('Failed to parse tire scan response', error);
    throw new Error('Tire scan failed. Please try again.');
  }
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

  const data = await response.json();

  if (!data.places || data.places.length === 0) {
    return {
      type,
      text: `No ${type === 'mechanic' ? 'mechanics' : 'towing services'} found nearby.`,
      places: [],
      timestamp: Date.now()
    };
  }

  const places = data.places.map((place: any) => ({
    title: place.displayName?.text || 'Unknown',
    uri: place.websiteUri || '',
    snippet: `${place.formattedAddress || ''} ${place.rating ? `⭐ ${place.rating} (${place.userRatingCount} reviews)` : ''} ${place.internationalPhoneNumber || ''}`
  }));

  return {
    type,
    text: `Found ${places.length} ${type === 'mechanic' ? 'mechanic shops' : 'towing services'} near you.`,
    places,
    timestamp: Date.now()
  };
};