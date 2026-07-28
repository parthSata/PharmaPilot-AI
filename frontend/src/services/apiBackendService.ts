import axios from 'axios';
import type { ComplaintState } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export class ApiBackendService {
  /**
   * Process prompt via backend Groq + LangGraph AI workflow
   */
  public static async processAiPrompt(
    promptText: string,
    currentState?: Partial<ComplaintState>
  ) {
    try {
      const response = await apiClient.post('/ai/process-prompt', {
        prompt: promptText,
        currentFormState: currentState || null,
      });
      console.log('[API Call] Groq Backend Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[API Error] Groq Backend request failed:', error);
      throw error;
    }
  }

  /**
   * Upload quality complaint document (PDF/Image)
   */
  public static async uploadDocument(file: File, complaintId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (complaintId) {
      formData.append('complaint_id', complaintId);
    }

    const response = await apiClient.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Create new complaint in PostgreSQL
   */
  public static async createComplaint(complaintData: Partial<ComplaintState>) {
    const payload = {
      customer_name: complaintData.customerName || 'MediLife Pharma Distributors',
      complaint_source: complaintData.complaintSource || 'Quality Alert Email Attachment (PDF)',
      product_name: complaintData.productName || 'Paracetamol Oral Suspension',
      product_strength: complaintData.productStrength || '250mg / 5ml',
      batch_number: complaintData.batchNumber || 'PRC-44019',
      manufacturing_date: complaintData.manufacturingDate || '2025-08-15',
      expiry_date: complaintData.expiryDate || '2027-08-14',
      affected_quantity: complaintData.affectedQuantity || '500 bottles',
      complaint_category: complaintData.complaintCategory || 'Precipitate / Sedimentation',
      complaint_description: complaintData.complaintDescription || '',
      initial_severity: complaintData.initialSeverity || 'Critical',
      priority: complaintData.priority || 'Urgent',
      status: 'Open',
    };

    const response = await apiClient.post('/complaints/', payload);
    return response.data;
  }

  /**
   * Fetch all complaints from PostgreSQL
   */
  public static async getComplaints() {
    const response = await apiClient.get('/complaints/');
    return response.data;
  }
}
