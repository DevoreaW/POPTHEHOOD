
export enum Severity {
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  RED = 'RED'
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  mileage: string;
  engine?: string;
}

export interface DiagnosticInput {
  description: string;
  obdCodes?: string;
  files: {
    data: string;
    mimeType: string;
    name: string;
    type: 'image' | 'audio' | 'video';
  }[];
}

export interface CauseItem {
  issue: string;
  probability: string;
  reasoning: string;
}

export interface CostEstimate {
  parts: string;
  labor: string;
  total: string;
}

export interface DiagnosticReport {
  id: string;
  timestamp: number;
  vehicle: VehicleInfo;
  severity: Severity;
  analysisSummary: string;
  mostLikelyCauses: CauseItem[];
  mechanicalExplanation: string;
  recommendedActions: string[];
  costEstimate: CostEstimate;
  diyVsPro: {
    canDiy: boolean;
    explanation: string;
    safetyWarnings: string[];
  };
  urgency: {
    timeline: string;
    risksOfDelay: string;
    workarounds?: string;
  };
  followUpQuestions: string[];
  additionalContext: {
    commonModelIssues: string;
    recallPotential: string;
    prevention: string;
  };
}

export interface TireAnalysisReport {
  id: string;
  timestamp: number;
  healthScore: number;
  estimatedTreadDepth: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Replace Soon' | 'Dangerous';
  findings: string[];
  recommendation: string;
  safetyWarning?: string;
  visualAnomalies: string[];
}

export interface ServiceResult {
  title: string;
  uri: string;
  snippet?: string;
}

export interface ServiceSearchReport {
  type: 'mechanic' | 'towing';
  text: string;
  places: ServiceResult[];
  timestamp: number;
}
