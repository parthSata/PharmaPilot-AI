import React, { useState } from 'react';
import { Sparkles, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { useComplaintForm } from '../../hooks';
import { COMPLAINT_FORM_SECTIONS } from '../../constants/complaint.constants';
import { ApiBackendService } from '../../services/apiBackendService';
import { FormInputGroup, Button, Badge, Card } from '../index';

export const ComplaintForm: React.FC = React.memo(() => {
  const { complaint, handleReset } = useComplaintForm();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    if (!complaint.isFilled) return;
    try {
      await ApiBackendService.createComplaint(complaint);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save complaint to PostgreSQL backend:', error);
    }
  };

  const headerContent = (
    <>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h1>
          <Badge variant="blue" icon={<Sparkles className="w-3 h-3 text-blue-500" />}>
            AI Auto Filled
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">AI Powered Complaint Form (API & FDF Quality Assurance)</p>
      </div>

      {complaint.isFilled && (
        <Badge variant="emerald" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
          Live Sync Ready
        </Badge>
      )}
    </>
  );

  const footerContent = (
    <>
      <Button variant="outline" size="md" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
        Reset Form
      </Button>

      <Button
        variant="primary"
        size="md"
        disabled={!complaint.isFilled}
        leftIcon={isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        onClick={handleSave}
      >
        {isSaved ? 'Complaint Saved!' : 'Save Complaint'}
      </Button>
    </>
  );

  return (
    <Card header={headerContent} footer={footerContent}>
      <div className="space-y-6">
        {COMPLAINT_FORM_SECTIONS.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                {section.id}
              </span>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => (
                <div
                  key={field.key}
                  className={'isTextArea' in field && field.isTextArea ? 'col-span-1 md:col-span-2' : 'col-span-1'}
                >
                  <FormInputGroup
                    label={field.label}
                    value={complaint[field.key as keyof typeof complaint] as string}
                    isTextArea={'isTextArea' in field ? (field.isTextArea as boolean) : false}
                    type={'type' in field ? (field.type as string) : 'text'}
                    unit={'unit' in field ? (field.unit as string) : undefined}
                    isHighlight={complaint.lastUpdatedField === field.key}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

ComplaintForm.displayName = 'ComplaintForm';
