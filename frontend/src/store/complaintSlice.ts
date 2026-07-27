import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ComplaintState } from '../types';

const initialState: ComplaintState = {
  customerName: '',
  complaintSource: '',
  productName: '',
  productStrength: '',
  batchNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  affectedQuantity: '',
  complaintCategory: '',
  complaintDescription: '',
  initialSeverity: '',
  priority: '',
  isFilled: false,
  lastUpdatedField: null,
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateComplaint: (state, action: PayloadAction<Partial<ComplaintState>>) => {
      Object.assign(state, action.payload);
      state.isFilled = true;
    },
    setLastUpdatedField: (state, action: PayloadAction<string | null>) => {
      state.lastUpdatedField = action.payload;
    },
    resetComplaint: () => initialState,
  },
});

export const { updateComplaint, setLastUpdatedField, resetComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
