import React, { useState } from 'react';
import { File as FileIcon, Trash2, CheckCircle, Clock, Download, Eye, X, FileText, Image as ImageIcon, Info } from 'lucide-react';
import { formatFileSize, cn } from '../../lib/utils';
import { FileItem } from '../../pages/Dashboard';

interface FileListTableProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onDownload?: (file: File) => void;
}

export function FileListTable({ files, onRemove, onDownload }: FileListTableProps) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [detailsFile, setDetailsFile] = useState<File | null>(null);
  const [fileDetails, setFileDetails] = useState<any>(null);

  if (files.length === 0) return null;

  const handleShowDetails = async (file: File) => {
    setDetailsFile(file);
    if (file.type !== 'application/pdf') {
       setFileDetails({ type: file.type, size: file.size });
       return;
    }
    
    setFileDetails({ loading: true });
    
    try {
      const { PDFDocument } = await import('pdf-lib-plus-encrypt');
      const arrayBuffer = await file.arrayBuffer();
      
      let doc;
      try {
        doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      } catch (err: any) {
         if (err.message && err.message.toLowerCase().includes('encrypt')) {
            setFileDetails({ size: file.size, isEncrypted: true });
            return;
         }
         throw err;
      }
      
      const isEncrypted = doc.isEncrypted;
      const pageCount = doc.getPageCount();
      let width = 0, height = 0;
      if (pageCount > 0) {
        const page = doc.getPage(0);
        const size = page.getSize();
        width = Math.round(size.width);
        height = Math.round(size.height);
      }
      
      setFileDetails({
        size: file.size,
        isEncrypted,
        pageCount,
        width,
        height
      });

    } catch (error) {
       console.error("Error reading PDF details:", error);
       setFileDetails({ size: file.size, error: 'Could not parse PDF metadata' });
    }
  };

  const handleDownload = (file: File) => {
    if (onDownload) {
      onDownload(file);
    } else {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileIcon = (type: string, className: string) => {
    if (type === 'application/pdf') return <FileText className={className} />;
    if (type.startsWith('image/')) return <ImageIcon className={className} />;
    return <FileIcon className={className} />;
  };

  return (
    <>
      <div className="mt-6 lg:mt-8">
        {/* Desktop Table View */}
        <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bn">ফাইলের নাম (File Name)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bn">সাইজ (Size)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bn">স্ট্যাটাস (Status)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right font-bn">অ্যাকশন (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {files.map((file) => (
                  <tr key={file.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          {getFileIcon(file.file.type, "w-5 h-5")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 max-w-[200px] xl:max-w-xs">{file.file.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Modified {new Date(file.file.lastModified).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.file.size)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold",
                        file.status === 'processed' 
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                          : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      )}>
                        {file.status === 'processed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {file.status === 'processed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleShowDetails(file.file)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="বিস্তারিত">
                          <Info size={18} />
                        </button>
                        <button onClick={() => setPreviewFile(file.file)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="ভিউ করুন">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDownload(file.file)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="ডাউনলোড করুন">
                          <Download size={18} />
                        </button>
                        <button onClick={() => onRemove(file.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all" title="ডিলিট করুন">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {files.map((file) => (
            <div key={file.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  {getFileIcon(file.file.type, "w-5 h-5")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 break-words">{file.file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatFileSize(file.file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0",
                  file.status === 'processed' 
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {file.status === 'processed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {file.status === 'processed' ? 'সম্পন্ন' : 'অপেক্ষমান'}
                </span>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => handleShowDetails(file.file)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="বিস্তারিত">
                    <Info size={16} />
                  </button>
                  <button onClick={() => setPreviewFile(file.file)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="ভিউ করুন">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleDownload(file.file)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all" title="ডাউনলোড করুন">
                    <Download size={16} />
                  </button>
                  <button onClick={() => onRemove(file.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all" title="ডিলিট করুন">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 truncate pr-4">{previewFile.name}</h3>
              <button 
                onClick={() => setPreviewFile(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 overflow-hidden relative min-h-[50vh]">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(previewFile)} 
                  alt={previewFile.name}
                  className="w-full h-full object-contain"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe 
                  src={`${URL.createObjectURL(previewFile)}#toolbar=0`}
                  className="w-full h-full border-0 absolute inset-0"
                  title="PDF Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <FileIcon size={48} className="mb-4 opacity-50" />
                  <p className="font-medium text-sm">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {detailsFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg font-bn truncate pr-4">ফাইল ডিটেইলস (File Details)</h3>
              <button 
                onClick={() => setDetailsFile(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 min-h-[200px]">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-5 mb-5">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {getFileIcon(detailsFile.type, "w-6 h-6")}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{detailsFile.name}</p>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{formatFileSize(detailsFile.size)}</p>
                </div>
              </div>

              {!fileDetails ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : fileDetails.loading ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm font-bn">তথ্য সংগ্রহ করা হচ্ছে...</p>
                </div>
              ) : fileDetails.error ? (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm text-center">
                  {fileDetails.error}
                </div>
              ) : (
                <div className="space-y-4 font-bn text-[15px]">
                  {fileDetails.type ? (
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">Type</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{fileDetails.type}</span>
                    </div>
                  ) : null}
                  
                  {fileDetails.pageCount !== undefined && (
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">পেজ সংখ্যা (Pages)</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{fileDetails.pageCount}</span>
                    </div>
                  )}
                  
                  {fileDetails.width !== undefined && fileDetails.height !== undefined && (
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">ডাইমেনশন (Dimensions)</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{fileDetails.width} × {fileDetails.height}</span>
                    </div>
                  )}

                  {fileDetails.isEncrypted !== undefined && (
                     <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                       <span className="text-slate-500 dark:text-slate-400">এনক্রিপশন (Encryption)</span>
                       <span className={cn(
                         "font-bold px-2 py-1 rounded",
                         fileDetails.isEncrypted ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                       )}>
                         {fileDetails.isEncrypted ? 'লকড (Locked)' : 'আনলকড (Unlocked)'}
                       </span>
                     </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button 
                onClick={() => setDetailsFile(null)}
                className="px-5 py-2 font-bold font-bn bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                ক্লোজ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
