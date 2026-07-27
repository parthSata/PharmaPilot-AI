export const COMPLAINT_FORM_SECTIONS = [
  {
    id: 1,
    title: 'Origin & Customer Details',
    fields: [
      { key: 'complaintSource', label: 'Complaint Source' },
      { key: 'customerName', label: 'Customer Name' },
    ],
  },
  {
    id: 2,
    title: 'Product & Batch Identification',
    fields: [
      { key: 'productName', label: 'Product Name' },
      { key: 'productStrength', label: 'Product Strength / Grade' },
      { key: 'batchNumber', label: 'Batch / Lot Number' },
      { key: 'manufacturingDate', label: 'Manufacturing Date', type: 'text' },
      { key: 'expiryDate', label: 'Expiry Date', type: 'text' },
      { key: 'affectedQuantity', label: 'Affected Quantity', unit: 'units' },
    ],
  },
  {
    id: 3,
    title: 'Complaint Details',
    fields: [
      { key: 'complaintCategory', label: 'Complaint Category' },
      { key: 'complaintDescription', label: 'Complaint Description', isTextArea: true },
    ],
  },
  {
    id: 4,
    title: 'Initial Assessment & Priority',
    fields: [
      { key: 'initialSeverity', label: 'Initial Severity' },
      { key: 'priority', label: 'Priority Level' },
    ],
  },
] as const;

export const SUPPORTED_FILE_TYPES = ['PDF', 'DOCX', 'TXT', 'EML'] as const;
export const MAX_FILE_SIZE_MB = 10;
export const PLACEHOLDER_WAITING_AI = 'Waiting for AI...';
