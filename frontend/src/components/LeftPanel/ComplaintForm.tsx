import React from 'react';
import { Sparkles, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { resetComplaint } from '../../store/complaintSlice';
import { resetChat } from '../../store/chatSlice';
import { FormInputGroup } from './FormInputGroup';

export const ComplaintForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const complaint = useAppSelector((state) => state.complaint);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleReset = () => {
    dispatch(resetComplaint());
    dispatch(resetChat());
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!complaint.isFilled) return;
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Customer Complaint</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
              <Sparkles className="w-3 h-3 text-blue-500" />
              AI Auto Filled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">AI Powered Complaint Form (API & FDF Quality Assurance)</p>
        </div>

        {complaint.isFilled && (
          <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live Sync Ready
          </div>
        )}
      </div>

      {/* Form Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Section 1: Origin & Customer Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              1
            </span>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Origin & Customer Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputGroup
              label="Complaint Source"
              value={complaint.complaintSource}
              isHighlight={complaint.lastUpdatedField === 'complaintSource'}
            />
            <FormInputGroup
              label="Customer Name"
              value={complaint.customerName}
              isHighlight={complaint.lastUpdatedField === 'customerName'}
            />
          </div>
        </div>

        {/* Section 2: Product & Batch Identification */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              2
            </span>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Product & Batch Identification
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputGroup
              label="Product Name"
              value={complaint.productName}
              isHighlight={complaint.lastUpdatedField === 'productName'}
            />
            <FormInputGroup
              label="Product Strength / Grade"
              value={complaint.productStrength}
              isHighlight={complaint.lastUpdatedField === 'productStrength'}
            />
            <FormInputGroup
              label="Batch / Lot Number"
              value={complaint.batchNumber}
              isHighlight={complaint.lastUpdatedField === 'batchNumber'}
            />
            <FormInputGroup
              label="Manufacturing Date"
              type="text"
              value={complaint.manufacturingDate}
              isHighlight={complaint.lastUpdatedField === 'manufacturingDate'}
            />
            <FormInputGroup
              label="Expiry Date"
              type="text"
              value={complaint.expiryDate}
              isHighlight={complaint.lastUpdatedField === 'expiryDate'}
            />
            <FormInputGroup
              label="Affected Quantity"
              value={complaint.affectedQuantity}
              unit="units"
              isHighlight={complaint.lastUpdatedField === 'affectedQuantity'}
            />
          </div>
        </div>

        {/* Section 3: Complaint Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              3
            </span>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Complaint Details
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormInputGroup
              label="Complaint Category"
              value={complaint.complaintCategory}
              isHighlight={complaint.lastUpdatedField === 'complaintCategory'}
            />
            <FormInputGroup
              label="Complaint Description"
              value={complaint.complaintDescription}
              isTextArea
              isHighlight={complaint.lastUpdatedField === 'complaintDescription'}
            />
          </div>
        </div>

        {/* Section 4: Initial Assessment & Priority */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
              4
            </span>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Initial Assessment & Priority
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputGroup
              label="Initial Severity"
              value={complaint.initialSeverity}
              isHighlight={complaint.lastUpdatedField === 'initialSeverity'}
            />
            <FormInputGroup
              label="Priority Level"
              value={complaint.priority}
              isHighlight={complaint.lastUpdatedField === 'priority'}
            />
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 sticky bottom-0">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-all duration-200 shadow-2xs active:scale-[0.98]"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>

        <button
          onClick={handleSave}
          disabled={!complaint.isFilled}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm ${
            complaint.isFilled
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              Complaint Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Complaint
            </>
          )}
        </button>
      </div>
    </div>
  );
};
