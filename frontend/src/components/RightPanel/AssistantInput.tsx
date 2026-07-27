import React, { useRef } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface AssistantInputProps {
  inputText: string;
  setInputText: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileUpload: (file: File) => void;
}

export const AssistantInput: React.FC<AssistantInputProps> = React.memo(({
  inputText,
  setInputText,
  onSubmit,
  onFileUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
      <form
        onSubmit={onSubmit}
        className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.txt,.eml"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileUpload(e.target.files[0]);
            }
          }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload Document"
          aria-label="Upload document"
          className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Describe a customer complaint or type corrections..."
          aria-label="Describe a customer complaint"
          className="w-full bg-transparent text-xs py-3.5 pr-2 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
        />

        <div className="flex items-center gap-1.5 pr-2">
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Send message"
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              inputText.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer active:scale-[0.95]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
});

AssistantInput.displayName = 'AssistantInput';
