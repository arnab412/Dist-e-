import React, { useState, useCallback } from 'react';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  acceptedTypes?: string[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function FileDropzone({ 
  onFilesAdded, 
  acceptedTypes = ['application/pdf'],
  title = "ল্যান্ড রেকর্ড ফাইল আপলোড করুন",
  subtitle = "আপনার পিডিএফ ডকুমেন্টটি এখানে ড্র্যাগ করে আনুন অথবা ক্লিক করে পছন্দ করুন।",
  compact = false
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const isAccepted = (file: File) => {
    if (acceptedTypes.includes('*/*')) return true;
    return acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.split('/')[0]);
      }
      return file.type === type;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files as FileList).filter(isAccepted);
    if (droppedFiles.length > 0) {
      onFilesAdded(droppedFiles as File[]);
    }
  }, [onFilesAdded, acceptedTypes]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files as FileList).filter(isAccepted);
      if (selectedFiles.length > 0) {
        onFilesAdded(selectedFiles as File[]);
      }
    }
  };

  const currentAccept = acceptedTypes.join(',');

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-full border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center group overflow-hidden bg-white",
        compact ? "min-h-[160px]" : "min-h-[300px]",
        isDragging 
          ? "border-blue-500 bg-blue-50/50 scale-[1.01]" 
          : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      
      <div className={cn("relative z-10 flex flex-col items-center text-center", compact ? "p-6" : "p-8")}>
        <motion.div
          animate={isDragging ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
          className={cn(
            "rounded-2xl flex items-center justify-center transition-colors duration-300",
            compact ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4",
            isDragging ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
          )}
        >
          <Upload size={compact ? 24 : 32} />
        </motion.div>
        
        <h3 className={cn("font-bold text-slate-900 tracking-tight font-bn", compact ? "text-lg mb-1" : "text-xl mb-2")}>
          {isDragging ? "এখানে ছাড়ুন" : title}
        </h3>
        {!compact && (
          <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-6 font-bn">
            {subtitle}
          </p>
        )}

        <label className={cn("bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl cursor-pointer hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm active:scale-95 font-bn", compact ? "px-5 py-2 mt-2" : "px-6 py-2.5")}>
          ফাইল পছন্দ করুন (Select)
          <input type="file" multiple accept={currentAccept} className="hidden" onChange={handleFileInput} />
        </label>
      </div>

      {isDragging && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-blue-600/5 backdrop-blur-[1px] pointer-events-none" 
        />
      )}
    </div>
  );
}
