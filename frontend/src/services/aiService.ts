import type { ComplaintState, RiskAssessment } from '../types';

export class AiService {
  /**
   * Parse prompt text into complaint form field updates
   */
  public static parseComplaintPrompt(
    promptText: string,
    currentState: ComplaintState
  ): { updates: Partial<ComplaintState>; lastUpdatedField: string | null; isEditMode: boolean } {
    const textLower = promptText.toLowerCase();

    const isEditMode =
      textLower.includes('sorry') ||
      textLower.includes('update') ||
      textLower.includes('batch number is') ||
      textLower.includes('quantity is');

    if (isEditMode && currentState.isFilled) {
      let updatedBatch = currentState.batchNumber;
      let updatedQty = currentState.affectedQuantity;
      let lastUpdated: string | null = null;

      const batchMatch = promptText.match(/batch\s*(?:number)?\s*(?:is|=|:)?\s*([A-Z0-9]+)/i);
      if (batchMatch && batchMatch[1]) {
        updatedBatch = batchMatch[1];
        lastUpdated = 'batchNumber';
      }

      const qtyMatch = promptText.match(
        /quantity\s*(?:is|=|:)?\s*(\d+(?:\s*(?:capsules|tablets|bottles|vials|units|kg))?)/i
      );
      if (qtyMatch && qtyMatch[1]) {
        updatedQty = qtyMatch[1];
        lastUpdated = 'affectedQuantity';
      }

      return {
        updates: {
          batchNumber: updatedBatch,
          affectedQuantity: updatedQty,
        },
        lastUpdatedField: lastUpdated,
        isEditMode: true,
      };
    }

    let customerName = 'Apollo Pharmacy';
    let productName = 'Amoxicillin Capsules';
    let productStrength = '500mg';

    if (textLower.includes('apollo pharmacy')) customerName = 'Apollo Pharmacy';
    if (textLower.includes('amoxicillin')) {
      productName = 'Amoxicillin Capsules';
      productStrength = '500mg';
    }

    return {
      updates: {
        customerName,
        complaintSource: 'Customer Care Portal',
        productName,
        productStrength,
        batchNumber: 'AMX-90821',
        manufacturingDate: '2025-11-10',
        expiryDate: '2027-11-10',
        affectedQuantity: '150 capsules',
        complaintCategory: 'Physical Appearance / Discoloration',
        complaintDescription: promptText,
        initialSeverity: 'Major',
        priority: 'High',
      },
      lastUpdatedField: null,
      isEditMode: false,
    };
  }

  /**
   * Generates AI Risk Assessment based on complaint details
   */
  public static calculateRiskAssessment(severity: string): RiskAssessment {
    if (severity === 'Critical') {
      return {
        severity: 'Critical',
        riskLevel: 'Level 1 (Immediate Recall Evaluation)',
        nextAction: 'Issue Immediate Hold Order & Request Retention Samples',
        reason: 'Sedimentation in liquid formulation may indicate active ingredient precipitation or chemical instability.',
        confidenceScore: 98,
      };
    }

    return {
      severity: 'Major',
      riskLevel: 'Level 2 (Quarantine & Review)',
      nextAction: 'Initiate CAPA Investigation & Quarantine Batch',
      reason: 'Physical defect (discoloration) reported at retail/pharmacy level for active antibiotic lot.',
      confidenceScore: 94,
    };
  }
}
