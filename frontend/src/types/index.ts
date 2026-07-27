export interface ComplaintState {
  customerName: string;
  complaintSource: string;
  productName: string;
  productStrength: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  affectedQuantity: string;
  complaintCategory: string;
  complaintDescription: string;
  initialSeverity: string;
  priority: string;
  isFilled: boolean;
  lastUpdatedField: string | null;
}

export interface RiskAssessment {
  severity: 'Critical' | 'Major' | 'Minor' | 'Low' | 'Medium' | 'High';
  riskLevel: string;
  nextAction: string;
  reason: string;
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  riskAssessment?: RiskAssessment;
}

export interface ExtractionProgress {
  isProcessing: boolean;
  progress: number;
  stage: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'autofilling' | 'completed';
  stageText: string;
}
