import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFileUpload, isProcessing }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'
        } ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.eml,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
          <UploadCloud className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-800">
            Drop Complaint Document, Email, or Photo <span className="text-slate-400 font-normal">or</span>{' '}
            <span className="text-blue-600 underline underline-offset-2">Browse File</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Max file size: 10MB</p>
        </div>

        {/* Supported Format Pills */}
        <div className="flex items-center justify-center flex-wrap gap-1.5 mt-1">
          {['PDF', 'DOCX', 'EML', 'PNG / JPG', 'TXT'].map((ext) => (
            <span
              key={ext}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 shadow-2xs"
            >
              {ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
