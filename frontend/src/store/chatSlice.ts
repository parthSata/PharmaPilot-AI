import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage, ExtractionProgress } from '../types';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  extractionProgress: ExtractionProgress;
}

const initialState: ChatState = {
  messages: [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your PharmaPilot AI Assistant. Upload a complaint document (PDF, DOCX, TXT, EML) or type customer feedback details below. I will automatically extract and populate the QMS Complaint Form.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isTyping: false,
  extractionProgress: {
    isProcessing: false,
    progress: 0,
    stage: 'idle',
    stageText: '',
  },
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    setIsTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setExtractionProgress: (state, action: PayloadAction<Partial<ExtractionProgress>>) => {
      state.extractionProgress = { ...state.extractionProgress, ...action.payload };
    },
    resetChat: () => initialState,
  },
});

export const { addMessage, setIsTyping, setExtractionProgress, resetChat } = chatSlice.actions;
export default chatSlice.reducer;
