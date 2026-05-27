import React from 'react';
import { Wand2, Printer, Loader2, Image as ImageIcon, Scissors, Minimize2, CheckCircle2, FileText, Lock, Unlock, Stamp } from 'lucide-react';

interface ActionBarProps {
  hasFiles: boolean;
  isProcessing: boolean;
  activeTool: string | null;
  onAutoRename: () => void;
  onMergePrint: () => void;
  onImageToPdf: () => void;
  onSplitPdf: () => void;
  onCompressImage?: () => void;
  onCompressPdf?: () => void;
  onValidateSignature?: () => void;
  onPdfToWord?: () => void;
  onPdfToImage?: () => void;
  onUnlockPdf?: () => void;
  onProtectPdf?: () => void;
  onWatermarkPdf?: () => void;
}

export function ActionBar({ 
  hasFiles, 
  isProcessing, 
  activeTool,
  onAutoRename, 
  onMergePrint,
  onImageToPdf,
  onSplitPdf,
  onCompressImage,
  onCompressPdf,
  onValidateSignature,
  onPdfToWord,
  onPdfToImage,
  onUnlockPdf,
  onProtectPdf,
  onWatermarkPdf
}: ActionBarProps) {
  if (!hasFiles || !activeTool) return null;

  return (
    <div className="fixed sm:sticky bottom-0 left-0 w-full sm:bottom-8 sm:mt-8 p-4 sm:p-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_-8px_30px_rgb(0,0,0,0.08)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 rounded-2xl flex flex-row items-center gap-2 sm:gap-3 pointer-events-auto w-full sm:w-auto overflow-x-auto">
        
        {activeTool === 'rename' && (
          <button
            onClick={onAutoRename}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-100 font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'রিনেম করুন (Rename)'}
          </button>
        )}

        {activeTool === 'merge' && (
          <button
            onClick={onMergePrint}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'পিডিএফ মার্জ করুন (Merge)'}
          </button>
        )}

        {activeTool === 'image-to-pdf' && (
          <button
            onClick={onImageToPdf}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'পিডিএফ তৈরি করুন (Create PDF)'}
          </button>
        )}

        {activeTool === 'split' && (
          <button
            onClick={onSplitPdf}
            disabled={isProcessing}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Scissors size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'পিডিএফ স্প্লিট করুন (Split)'}
          </button>
        )}

        {activeTool === 'compress-image' && (
          <button
            onClick={onCompressImage}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Minimize2 size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'কম্প্রেস করুন (Compress)'}
          </button>
        )}
        
        {activeTool === 'compress-pdf' && (
          <button
            onClick={onCompressPdf}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Minimize2 size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'কম্প্রেস করুন (Compress PDF)'}
          </button>
        )}

        {activeTool === 'validate-signature' && (
          <button
            onClick={onValidateSignature}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'ভেরিফাই করুন (Verify)'}
          </button>
        )}

        {activeTool === 'pdf-to-word' && (
          <button
            onClick={onPdfToWord}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'ওয়ার্ডে কনভার্ট (To Word)'}
          </button>
        )}

        {activeTool === 'pdf-to-image' && (
          <button
            onClick={onPdfToImage}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-indigo-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'ছবিতে কনভার্ট (To Image)'}
          </button>
        )}

        {activeTool === 'unlock-pdf' && (
          <button
            onClick={onUnlockPdf}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Unlock size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'আনলক করুন (Unlock)'}
          </button>
        )}

        {activeTool === 'protect-pdf' && (
          <button
            onClick={onProtectPdf}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-rose-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'প্রটেক্ট করুন (Protect)'}
          </button>
        )}

        {activeTool === 'watermark-pdf' && (
          <button
            onClick={onWatermarkPdf}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 bg-purple-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed group font-bn whitespace-nowrap"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Stamp size={16} />}
            {isProcessing ? 'প্রসেসিং...' : 'ওয়াটারমার্ক যোগ করুন (Watermark)'}
          </button>
        )}

      </div>
    </div>
  );
}
