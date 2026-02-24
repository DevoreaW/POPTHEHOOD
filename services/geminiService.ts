
import { GoogleGenAI, Type } from "@google/genai";
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport, ServiceResult } from "../types";

export const generateDiagnosticReport = async (
  vehicle: VehicleInfo,
  input: DiagnosticInput
): Promise<DiagnosticReport> => {
const ai = new GoogleGenAI({ apiKey: (import.meta as any).env.VITE_API_KEY });
const systemInstruction = `You are an ASE-certified master automotive technician with 25+ years of diagnostic experience. 
Analyze vehicle symptoms, audio of sounds (knocking, grinding, etc.), photos/videos of leaks or damage, and OBD-II codes.
Provide a structured, professional, and honest diagnostic report. 
Prioritize safety above all else. Use the provided JSON schema for your response.`;

  const prompt = `
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

DIAGNOSTIC INPUTS:
User has provided ${input.files.length} media files (images/audio/video). 
Please analyze them carefully to identify abnormal sounds, visual leaks, smoke patterns, or mechanical wear.
`;

  const contents = {
    parts: [
      { text: prompt },
      ...input.files.map(f => ({
        inlineData: {
          data: f.data.split(',')[1] || f.data,
          mimeType: f.mimeType
        }
      }))
    ]
  };

  const response = await ai.models.generateContent({
model: "gemini-2.0-flash",    contents,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          severity: { type: Type.STRING, enum: ['GREEN', 'YELLOW', 'RED'] },
          analysisSummary: { type: Type.STRING },
          mostLikelyCauses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING },
                probability: { type: Type.STRING },
                reasoning: { type: Type.STRING }
              },
              required: ['issue', 'probability', 'reasoning']
            }
          },
          mechanicalExplanation: { type: Type.STRING },
          recommendedActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          costEstimate: {
            type: Type.OBJECT,
            properties: {
              parts: { type: Type.STRING },
              labor: { type: Type.STRING },
              total: { type: Type.STRING }
            },
            required: ['parts', 'labor', 'total']
          },
          diyVsPro: {
            type: Type.OBJECT,
            properties: {
              canDiy: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING },
              safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['canDiy', 'explanation', 'safetyWarnings']
          },
          urgency: {
            type: Type.OBJECT,
            properties: {
              timeline: { type: Type.STRING },
              risksOfDelay: { type: Type.STRING },
              workarounds: { type: Type.STRING }
            },
            required: ['timeline', 'risksOfDelay']
          },
          followUpQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          additionalContext: {
            type: Type.OBJECT,
            properties: {
              commonModelIssues: { type: Type.STRING },
              recallPotential: { type: Type.STRING },
              prevention: { type: Type.STRING }
            },
            required: ['commonModelIssues', 'recallPotential', 'prevention']
          }
        },
        required: [
          'severity', 'analysisSummary', 'mostLikelyCauses', 
          'mechanicalExplanation', 'recommendedActions', 
          'costEstimate', 'diyVsPro', 'urgency', 
          'followUpQuestions', 'additionalContext'
        ]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      vehicle
    } as DiagnosticReport;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Diagnosis failed. Please try again with clearer inputs.");
  }
};

export const analyzeTireTread = async (
  imageData: string,
  mimeType: string
): Promise<TireAnalysisReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are a tire specialist and ASE mechanic. 
Analyze the provided tire image to estimate tread depth (in 32nds of an inch), check for wear patterns (inner/outer wear, feathering), and inspect for sidewall damage, cracks, or bulges.
Provide an honest safety assessment. Use the provided JSON schema.`;

  const prompt = `Perform a high-precision tire health scan on the attached image. 
Estimate the remaining life and identify any safety hazards.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: imageData.split(',')[1], mimeType } }
      ]
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          healthScore: { type: Type.NUMBER },
          estimatedTreadDepth: { type: Type.STRING },
          condition: { type: Type.STRING, enum: ['Excellent', 'Good', 'Fair', 'Replace Soon', 'Dangerous'] },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING },
          safetyWarning: { type: Type.STRING },
          visualAnomalies: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['healthScore', 'estimatedTreadDepth', 'condition', 'findings', 'recommendation', 'visualAnomalies']
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      ...data,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    } as TireAnalysisReport;
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-flash'; // Correct model for maps grounding
  
  const prompt = type === 'mechanic' 
    ? "Find highly-rated local mechanic shops and auto repair services near me. Provide a brief summary of their reputations."
    : "Find immediate 24/7 towing services and roadside assistance near me. Prioritize services with quick response times.";

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude, longitude }
        }
      }
    }
  });

  const places: ServiceResult[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  for (const chunk of groundingChunks) {
    if (chunk.maps) {
      places.push({
        title: chunk.maps.title || 'Unknown Business',
        uri: chunk.maps.uri || '',
        snippet: chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0]
      });
    }
  }

  return {
    type,
    text: response.text || 'Here are the nearby services I found.',
    places: places.filter(p => p.uri),
    timestamp: Date.now()
  };
};
