import { z } from 'zod';

export const complaintFormSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  complaintSource: z.string().min(2, 'Complaint source is required'),
  productName: z.string().min(2, 'Product name is required'),
  productStrength: z.string().min(1, 'Product strength is required'),
  batchNumber: z.string().min(3, 'Batch number is required'),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  affectedQuantity: z.string().optional(),
  complaintCategory: z.string().min(2, 'Complaint category is required'),
  complaintDescription: z.string().optional(),
  initialSeverity: z.enum(['Critical', 'Major', 'Minor']).default('Critical'),
  priority: z.enum(['Urgent', 'Standard', 'Low']).default('Urgent'),
});

export type ComplaintFormValues = z.infer<typeof complaintFormSchema>;
