import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { SEO } from '../components/SEO';
import { FileDropzone } from '../components/dashboard/FileDropzone';
import { FileListTable } from '../components/dashboard/FileListTable';
import { ActionBar } from '../components/dashboard/ActionBar';
import { AccountSummaryPanel } from '../components/dashboard/AccountSummaryPanel';
import { TestimonialSection } from '../components/dashboard/TestimonialSection';
import TestimonialsSection from '../components/ui/testimonial-v2';
import { FeatureGridDemo } from '../components/ui/feature-grid';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { mergePDFs, splitPDF, imagesToPDF, downloadBlob, zipFiles } from '../utils/pdfMergeHelper';
import { extractTextFromFirstPage, suggestFileName } from '../utils/pdfTextExtractor';
import { compressImage, compressPDF } from '../utils/mediaCompressor';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { cn } from '../lib/utils';
import { Wand2, Printer, Files, CheckCircle2, FileText, ArrowRight, Languages, Zap, Image as ImageIcon, Scissors, Minimize2, Lock, Unlock, Stamp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { verifyPdfSignature, convertPdfToWord, convertPdfToImages } from '../utils/pdfAdvancedTools';
import { WebGLShader } from '../components/ui/web-gl-shader';
import { LiquidButton, MetalButton } from '../components/ui/liquid-glass-button';

export interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'processed';
}

type ToolType = 'rename' | 'merge' | 'image-to-pdf' | 'split' | 'compress-image' | 'compress-pdf' | 'validate-signature' | 'pdf-to-word' | 'pdf-to-image' | 'unlock-pdf' | 'protect-pdf' | 'watermark-pdf';

export default function Dashboard() {
  const { profile, incrementUsage, user, settings, unregisteredUsage } = useAuth();
  const { isDark } = useTheme();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [targetSizeKb, setTargetSizeKb] = useState<number | string>(50);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkUsageLimit = (): boolean => {
    if (!user) {
      const limit = settings?.unregisteredDailyLimit ?? 2;
      if (unregisteredUsage >= limit) {
        showToast(`লগিন ছাড়া আপনার লিমিট শেষ। অনুগ্রহ করে লগইন করুন। (Guest limit reached).`, 'error');
        return false;
      }
      return true;
    }
    
    if (profile?.plan === 'pro') return true;
    
    const limit = settings?.freeDailyLimit || profile?.dailyLimit || 5;
    if ((profile?.currentDayUsage || 0) >= limit) {
      showToast('আপনার আজকের লিমিট শেষ। (Daily limit reached).', 'error');
      return false;
    }
    return true;
  };

  React.useEffect(() => {
    if (profile?.plan === 'free' && profile.planExpiresAt) {
      const expiredDate = new Date(profile.planExpiresAt);
      if (expiredDate < new Date() && !sessionStorage.getItem('expiredToastShown')) {
        showToast('আপনার প্রো প্ল্যান এর মেয়াদ শেষ হয়ে গেছে। নতুন করে রিচার্জ করুন।', 'error');
        sessionStorage.setItem('expiredToastShown', 'true');
      }
    }
  }, [profile]);

  const isProFeature = (featureName: keyof typeof settings.features) => {
    return settings?.features?.[featureName] === 'pro';
  };

  const tools = [
    {
      id: 'rename',
      title: 'Auto-Rename',
      titleBn: 'অটো রিনেম',
      desc: 'Smartly renames land records based on plot/dag numbers.',
      descBn: 'প্লট বা দাগ নম্বর অনুযায়ী রেকর্ডের নাম পরিবর্তন করুন।',
      icon: Wand2,
      color: 'bg-blue-600',
      active: true,
      pro: isProFeature('rename')
    },
    {
      id: 'merge',
      title: 'Batch Merge',
      titleBn: 'পিডিএফ মার্জ',
      desc: 'Combine multiple PDFs into one A4 optimized document.',
      descBn: 'একাধিক রেকর্ড একসাথে জোড়া লাগিয়ে প্রিন্ট করুন।',
      icon: Printer,
      color: 'bg-emerald-600',
      active: true,
      pro: isProFeature('mergePdf')
    },
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      titleBn: 'ছবি থেকে পিডিএফ',
      desc: 'Convert multiple images into a single PDF document.',
      descBn: 'একাধিক ছবি (JPG/PNG) থেকে একটি পিডিএফ ফাইল তৈরি করুন।',
      icon: ImageIcon,
      color: 'bg-teal-500',
      active: true,
      pro: isProFeature('imageToPdf')
    },
    {
      id: 'split',
      title: 'Split PDF',
      titleBn: 'পিডিএফ স্প্লিট',
      desc: 'Extract every page of a PDF into a separate document.',
      descBn: 'যেকোনো পিডিএফ থেকে প্রতিটি পেজ আলাদা করে জিপ ফাইলে সেভ করুন।',
      icon: Scissors,
      color: 'bg-rose-500',
      active: true,
      pro: isProFeature('splitPdf')
    },
    {
      id: 'compress-image',
      title: 'Compress Image',
      titleBn: 'ছবি কম্প্রেস',
      desc: 'Reduce the file size of your images (JPG, PNG).',
      descBn: 'যেকোনো ছবির সাইজ কমান।',
      icon: Minimize2,
      color: 'bg-amber-500',
      active: true,
      pro: isProFeature('compressImage')
    },
    {
      id: 'compress-pdf',
      title: 'Compress PDF',
      titleBn: 'পিডিএফ কম্প্রেস',
      desc: 'Reduce the file size of your PDF documents.',
      descBn: 'যেকোনো পিডিএফ-এর সাইজ কমান।',
      icon: Minimize2,
      color: 'bg-teal-500',
      active: true,
      pro: isProFeature('compressPdf')
    },
    {
      id: 'validate-signature',
      title: 'Verify Signature',
      titleBn: 'পিডিএফ ভেরিফিকেশন',
      desc: 'Verify and add a visual Green Tick (✔) mark on signed PDF documents.',
      descBn: 'ডিজিটাল সাইন সত্যি করে ভেরিফাই করুন এবং রাইট চিহ্নটি বসান।',
      icon: CheckCircle2,
      color: 'bg-green-600',
      active: true,
      pro: isProFeature('validateSignature')
    },
    {
      id: 'pdf-to-word',
      title: 'PDF to Word',
      titleBn: 'পিডিএফ টু ওয়ার্ড',
      desc: 'Convert your PDF documents easily into editable Word format (.docx).',
      descBn: 'পিডিএফ ফাইল থেকে এডিটেবল ওয়ার্ড ফাইলে কনভার্ট করুন।',
      icon: FileText,
      color: 'bg-blue-600',
      active: true,
      pro: isProFeature('pdfToWord')
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      titleBn: 'পিডিএফ থেকে ছবি',
      desc: 'Convert all pages of a PDF to separate Image (JPG) files.',
      descBn: 'পিডিএফ ফাইলের প্রতিটি পেজকে আলাদা ইমেজ ফাইলে কনভার্ট করুন।',
      icon: Files,
      color: 'bg-indigo-600',
      active: true,
      pro: false
    },
    {
      id: 'unlock-pdf',
      title: 'Unlock PDF',
      titleBn: 'পিডিএফ আনলক',
      desc: 'Remove password and restrictions from PDF documents.',
      descBn: 'পাসওয়ার্ড যুক্ত পিডিএফ ফাইল আনলক করুন বা পাসওয়ার্ড রিমুভ করুন।',
      icon: Unlock,
      color: 'bg-emerald-500',
      active: true,
      pro: isProFeature('unlockPdf' as keyof typeof settings.features)
    },
    {
      id: 'protect-pdf',
      title: 'Protect PDF',
      titleBn: 'পিডিএফ প্রটেক্ট',
      desc: 'Encrypt and add password protection to your PDF files.',
      descBn: 'আপনার পিডিএফ ফাইলে পাসওয়ার্ড যুক্ত করে সুরক্ষিত রাখুন।',
      icon: Lock,
      color: 'bg-rose-600',
      active: true,
      pro: isProFeature('protectPdf' as keyof typeof settings.features)
    },
    {
      id: 'watermark-pdf',
      title: 'Watermark PDF',
      titleBn: 'পিডিএফ ওয়াটারমার্ক',
      desc: 'Add text or image watermarks to your PDF documents.',
      descBn: 'আপনার পিডিএফ ফাইলে নিজস্ব টেক্সট বা ছবির ওয়াটারমার্ক যুক্ত করুন।',
      icon: Stamp,
      color: 'bg-purple-600',
      active: true,
      pro: isProFeature('watermarkPdf' as keyof typeof settings.features)
    }
  ];
  const handleFilesAdded = (newFiles: File[]) => {
    const items: FileItem[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending'
    }));
    setFiles(prev => [...prev, ...items]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleAutoRename = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    
    try {
      const updatedFiles = await Promise.all(files.map(async (item) => {
        if (item.status === 'processed') return item;
        try {
          const text = await extractTextFromFirstPage(item.file);
          const newName = suggestFileName(text);
          const renamedFile = new File([item.file], newName, { type: item.file.type });
          return { ...item, file: renamedFile, status: 'processed' as const };
        } catch (err) {
          console.error("Extraction error:", err);
          return item;
        }
      }));
      setFiles(updatedFiles);

      const processedFiles = updatedFiles.filter(item => item.status === 'processed').map(item => item.file);
      if (processedFiles.length > 0) {
        if (processedFiles.length === 1) {
          downloadBlob(processedFiles[0], processedFiles[0].name);
        } else {
          const zipBlob = await zipFiles(processedFiles, "Renamed_Files.zip");
          downloadBlob(zipBlob, "Renamed_Files.zip");
        }
        
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            fileName: processedFiles.length === 1 ? processedFiles[0].name : "Renamed_Files.zip",
            fileSize: processedFiles.reduce((acc, file) => acc + file.size, 0),
            processedAt: new Date().toISOString(),
            status: 'processed',
            userId: user.uid
          });
        }
        await incrementUsage('rename', files.length === 1 ? files[0].file.name : `${files.length} files`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergePrint = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;

    setIsProcessing(true);
    try {
      const blob = await mergePDFs(files.map(f => f.file));
      const mergeFileName = `PDFToolbox_Merge_${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlob(blob, mergeFileName);
      
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          fileName: mergeFileName,
          fileSize: blob.size,
          processedAt: new Date().toISOString(),
          status: 'processed',
          userId: user.uid
        });
      }

      await incrementUsage('merge', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
    } catch (error) {
      showToast('An error occurred during processing.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageToPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    try {
      const blob = await imagesToPDF(files.map(f => f.file));
      const pdfName = `PDFToolbox_Images_${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadBlob(blob, pdfName);
      
      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          fileName: pdfName,
          fileSize: blob.size,
          processedAt: new Date().toISOString(),
          status: 'processed',
          userId: user.uid
        });
      }
      await incrementUsage('image-to-pdf', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
    } catch (err) {
      showToast('An error occurred during conversion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    try {
      for (const item of files) {
        const blob = await splitPDF(item.file);
        const zipName = `${item.file.name.replace(/\.[^/.]+$/, "")}_split.zip`;
        downloadBlob(blob, zipName);
        
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            fileName: zipName,
            fileSize: blob.size,
            processedAt: new Date().toISOString(),
            status: 'processed',
            userId: user.uid
          });
        }
      }
      await incrementUsage('split', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
    } catch (err) {
      showToast('An error occurred during splitting.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompressImage = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    setCompressionProgress(0);
    try {
      const processedFiles = [];
      let completed = 0;
      const total = files.length;
      for (const item of files) {
        const isImage = item.file.type.startsWith('image/') || item.file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i);
        if (!isImage) {
          console.warn('Skipping non-image file:', item.file.name);
          completed++;
          continue;
        }
        const compressedBlob = await compressImage(item.file, (Number(targetSizeKb) || 50) / 1024, 0.8, (progress) => {
          setCompressionProgress(Math.round(((completed * 100) + progress) / total));
        });
        completed++;
        setCompressionProgress(Math.round((completed * 100) / total));
        const newName = item.file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg";
        processedFiles.push(new File([compressedBlob], newName, { type: 'image/jpeg' }));
      }
      
      if (processedFiles.length === 0) {
        showToast('কোনো ছবি পাওয়া যায়নি বা আপলোড করা ফাইলটি ছবি নয়।', 'error');
        setIsProcessing(false);
        return;
      }

      
      if (processedFiles.length === 1) {
        downloadBlob(processedFiles[0], processedFiles[0].name);
      } else {
        const zipBlob = await zipFiles(processedFiles, "Compressed_Images.zip");
        downloadBlob(zipBlob, "Compressed_Images.zip");
      }

      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          fileName: processedFiles.length === 1 ? processedFiles[0].name : "Compressed_Images.zip",
          fileSize: processedFiles.reduce((acc, f) => acc + f.size, 0),
          processedAt: new Date().toISOString(),
          status: 'processed',
          userId: user.uid
        });
      }
      await incrementUsage('compress-image', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      alert('ফাইলগুলি সফলভাবে কম্প্রেস এবং ডাউনলোড করা হয়েছে। (Successfully compressed and downloaded).');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during image compression.', 'error');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setCompressionProgress(null), 500);
    }
  };

  const handleCompressPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    setCompressionProgress(0);
    try {
      const processedFiles = [];
      let completed = 0;
      const total = files.length;
      for (const item of files) {
        if (item.file.type !== 'application/pdf') {
          console.warn('Skipping non-PDF file:', item.file.name);
          completed++;
          continue;
        }
        const compressedBlob = await compressPDF(item.file, (Number(targetSizeKb) || 50) / 1024, (progress) => {
          setCompressionProgress(Math.round(((completed * 100) + progress) / total));
        });
        completed++;
        setCompressionProgress(Math.round((completed * 100) / total));
        const newName = item.file.name.replace(/\.[^/.]+$/, "") + "_compressed.pdf";
        processedFiles.push(new File([compressedBlob], newName, { type: 'application/pdf' }));
      }
      
      if (processedFiles.length === 0) {
        showToast('কোনো পিডিএফ পাওয়া যায়নি বা আপলোড করা ফাইলটি পিডিএফ নয়।', 'error');
        setIsProcessing(false);
        return;
      }
      
      if (processedFiles.length === 1) {
        downloadBlob(processedFiles[0], processedFiles[0].name);
      } else {
        const zipBlob = await zipFiles(processedFiles, "Compressed_PDFs.zip");
        downloadBlob(zipBlob, "Compressed_PDFs.zip");
      }

      if (user) {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          fileName: processedFiles.length === 1 ? processedFiles[0].name : "Compressed_PDFs.zip",
          fileSize: processedFiles.reduce((acc, f) => acc + f.size, 0),
          processedAt: new Date().toISOString(),
          status: 'processed',
          userId: user.uid
        });
      }
      await incrementUsage('compress-pdf', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      alert('ফাইলগুলি সফলভাবে কম্প্রেস এবং ডাউনলোড করা হয়েছে। (Successfully compressed and downloaded).');
    } catch (err) {
      showToast('An error occurred during PDF compression.', 'error');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setCompressionProgress(null), 500);
    }
  };

  const handleValidateSignature = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    try {
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        const blob = await verifyPdfSignature(item.file);
        const fileName = item.file.name.replace(/\.[^/.]+$/, "") + "_verified.pdf";
        downloadBlob(blob, fileName);
        
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            fileName,
            fileSize: blob.size,
            processedAt: new Date().toISOString(),
            status: 'processed',
            userId: user.uid
          });
        }
      }
      await incrementUsage('validate-signature', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('পিডিএফ ভেরিফিকেশন সম্পন্ন হয়েছে এবং রাইট চিহ্ন বসানো হয়েছে।', 'success');
    } catch (err) {
      console.error(err);
      showToast('Something went wrong during verification.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfToWord = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    try {
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        const blob = await convertPdfToWord(item.file);
        const fileName = item.file.name.replace(/\.[^/.]+$/, "") + ".docx";
        downloadBlob(blob, fileName);
        
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            fileName,
            fileSize: blob.size,
            processedAt: new Date().toISOString(),
            status: 'processed',
            userId: user.uid
          });
        }
      }
      await incrementUsage('pdf-to-word', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('পিডিএফ থেকে ওয়ার্ড কনভার্ট সম্পন্ন হয়েছে।', 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during Word conversion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfToImage = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    setIsProcessing(true);
    try {
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        const blobs = await convertPdfToImages(item.file);
        
        if (blobs.length === 1) {
          const fileName = item.file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          downloadBlob(blobs[0], fileName);
        } else {
          const imageFiles = blobs.map((blob, index) => new File([blob], `${item.file.name.replace(/\.[^/.]+$/, "")}_page_${index + 1}.jpg`, { type: 'image/jpeg' }));
          const zipBlob = await zipFiles(imageFiles, `${item.file.name.replace(/\.[^/.]+$/, "")}_images.zip`);
          downloadBlob(zipBlob, `${item.file.name.replace(/\.[^/.]+$/, "")}_images.zip`);
        }
        
        if (user) {
          await addDoc(collection(db, 'users', user.uid, 'history'), {
            fileName: item.file.name.replace(/\.[^/.]+$/, "") + "_images",
            fileSize: item.file.size,
            processedAt: new Date().toISOString(),
            status: 'processed',
            userId: user.uid
          });
        }
      }
      await incrementUsage('pdf-to-image', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('পিডিএফ থেকে ছবি কনভার্ট সম্পন্ন হয়েছে।', 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during Image conversion.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    defaultValue: string;
    isPassword?: boolean;
    onConfirm: (val: string | null) => void;
  } | null>(null);

  const requestUserInput = (title: string, defaultValue: string = "", isPassword = false, description?: string): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptConfig({
        isOpen: true,
        title,
        defaultValue,
        isPassword,
        description,
        onConfirm: (val) => {
          setPromptConfig(null);
          resolve(val);
        }
      });
    });
  };

  const handleUnlockPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    
    const pwd = await requestUserInput("পিডিএফ ফাইলের পাসওয়ার্ড দিন (Enter password):", "", true);
    if (pwd === null) return;
    
    setIsProcessing(true);
    try {
      const { unlockPdfFile } = await import('../utils/pdfAdvancedTools');
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        
        try {
          const blob = await unlockPdfFile(item.file, pwd);
          const fileName = item.file.name.replace(/\.[^/.]+$/, "") + "_unlocked.pdf";
          downloadBlob(blob, fileName);
          
          if (user) {
            await addDoc(collection(db, 'users', user.uid, 'history'), {
              fileName,
              fileSize: blob.size,
              processedAt: new Date().toISOString(),
              status: 'processed',
              userId: user.uid
            });
          }
        } catch (e: any) {
          if (e.message === 'PASSWORD_REQUIRED') {
            showToast('ভুল পাসওয়ার্ড। ফাইল আনলক করা সম্ভব হয়নি। (Incorrect Password)', 'error');
            return;
          }
          throw e;
        }
      }
      await incrementUsage('unlock-pdf', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('পিডিএফ আনলক সম্পন্ন হয়েছে।', 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during unlocking.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProtectPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    
    const pwd = await requestUserInput("নতুন পাসওয়ার্ড সেট করুন (Set new password):", "", true);
    if (pwd === null || pwd.trim() === '') {
      showToast('পাসওয়ার্ড দেওয়া হয়নি। (No password provided)', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      const { protectPdfFile } = await import('../utils/pdfAdvancedTools');
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        
        const blob = await protectPdfFile(item.file, pwd);
        const fileName = item.file.name.replace(/\.[^/.]+$/, "") + "_protected.pdf";
        downloadBlob(blob, fileName);
        
        if (user) {
           await addDoc(collection(db, 'users', user.uid, 'history'), {
             fileName,
             fileSize: blob.size,
             processedAt: new Date().toISOString(),
             status: 'processed',
             userId: user.uid
           });
        }
      }
      await incrementUsage('protect-pdf', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('পিডিএফ প্রটেক্ট করা হয়েছে (বর্তমানে ডেমো ভার্সনে)।', 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during protection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWatermarkPdf = async () => {
    if (files.length === 0) return;
    if (!checkUsageLimit()) return;
    
    const text = await requestUserInput("ওয়াটারমার্ক টেক্সট দিন (Enter Watermark Text):", "CONFIDENTIAL", false);
    if (text === null) return;
    
    setIsProcessing(true);
    try {
      const { watermarkPdfFile } = await import('../utils/pdfAdvancedTools');
      for (const item of files) {
        if (item.file.type !== 'application/pdf') continue;
        
        const blob = await watermarkPdfFile(item.file, text);
        const fileName = item.file.name.replace(/\.[^/.]+$/, "") + "_watermarked.pdf";
        downloadBlob(blob, fileName);
        
        if (user) {
           await addDoc(collection(db, 'users', user.uid, 'history'), {
             fileName,
             fileSize: blob.size,
             processedAt: new Date().toISOString(),
             status: 'processed',
             userId: user.uid
           });
        }
      }
      await incrementUsage('watermark-pdf', files.length === 1 ? files[0].file.name : `${files.length} files`);
      setFiles(prev => prev.map(f => ({ ...f, status: 'processed' })));
      showToast('ওয়াটারমার্ক যুক্ত করা সম্পন্ন হয়েছে।', 'success');
    } catch (err) {
      console.error(err);
      showToast('An error occurred during watermarking.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getDropzoneProps = () => {
    switch (activeTool) {
      case 'image-to-pdf':
        return {
          acceptedTypes: ['image/jpeg', 'image/png'],
          title: "ছবি আপলোড করুন",
          subtitle: "আপনার JPG বা PNG ছবিগুলো এখানে ড্র্যাগ করুন।"
        };
      case 'compress-image':
        return {
          acceptedTypes: ['image/jpeg', 'image/png'],
          title: "ছবি আপলোড করুন",
          subtitle: "যে ছবিগুলোর সাইজ কমাবেন সেগুলো ড্র্যাগ করুন।"
        };
      case 'split':
        return {
          acceptedTypes: ['application/pdf'],
          title: "পিডিএফ আপলোড করুন",
          subtitle: "যেই পিডিএফ থেকে পেজ আলাদা করবেন সেটি ড্র্যাগ করুন।"
        };
      case 'compress-pdf':
        return {
          acceptedTypes: ['application/pdf'],
          title: "পিডিএফ আপলোড করুন",
          subtitle: "যে পিডিএফ এর সাইজ কমাবেন সেটি ড্র্যাগ করুন।"
        };
      case 'validate-signature':
        return {
          acceptedTypes: ['application/pdf'],
          title: "ডিজিটাল সাইন করা পিডিএফ আপলোড করুন",
          subtitle: "ভেরিফাই করার জন্য পিডিএফ ড্র্যাগ করুন।"
        };
      case 'pdf-to-word':
        return {
          acceptedTypes: ['application/pdf'],
          title: "ওয়ার্ডে কনভার্ট করার জন্য পিডিএফ আপলোড করুন",
          subtitle: "যে পিডিএফ কনভার্ট করবেন সেটি ড্র্যাগ করুন।"
        };
      case 'pdf-to-image':
        return {
          acceptedTypes: ['application/pdf'],
          title: "ছবিতে কনভার্ট করার জন্য পিডিএফ আপলোড করুন",
          subtitle: "যে পিডিএফ কনভার্ট করবেন সেটি ড্র্যাগ করুন।"
        };
      case 'unlock-pdf':
        return {
          acceptedTypes: ['application/pdf'],
          title: "আনলক করার জন্য পিডিএফ আপলোড করুন",
          subtitle: "পাসওয়ার্ড যুক্ত পিডিএফ ড্র্যাগ করুন।"
        };
      case 'protect-pdf':
        return {
          acceptedTypes: ['application/pdf'],
          title: "প্রটেক্ট করার জন্য পিডিএফ আপলোড করুন",
          subtitle: "যে পিডিএফে পাসওয়ার্ড যুক্ত করবেন সেটি ড্র্যাগ করুন।"
        };
      case 'watermark-pdf':
        return {
          acceptedTypes: ['application/pdf'],
          title: "ওয়াটারমার্ক যুক্ত করার জন্য পিডিএফ আপলোড করুন",
          subtitle: "যে পিডিএফে ওয়াটারমার্ক যোগ করবেন সেটি ড্র্যাগ করুন।"
        };
      default:
        return {
          acceptedTypes: ['application/pdf']
        };
    }
  };

  return (
    <AppLayout>
      <SEO />
      {!user && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-sm border border-white/10">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Welcome Guest
              </div>
              <h2 className="text-2xl md:text-3xl font-bold font-bn mb-2">
                সহজেই আপনার পিডিএফ ও খতিয়ান ম্যানেজ করুন
              </h2>
              <p className="text-blue-100 font-bn text-[15px] leading-relaxed">
                কোনো একাউন্ট ছাড়াই আপনি আমাদের কিছু টুলস চেক করে দেখতে পারেন। ফাইল আপলোড করে কম্প্রেস, স্প্লিট বা মার্জ এর মত কাজগুলো সেকেন্ডের মধ্যে করে নিন।
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {promptConfig && promptConfig.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-xl font-bold font-bn text-slate-800 dark:text-slate-100 mb-2">{promptConfig.title}</h3>
              {promptConfig.description && (
                <p className="text-sm font-bn text-slate-500 mb-4">{promptConfig.description}</p>
              )}
              <input
                type={promptConfig.isPassword ? "password" : "text"}
                autoFocus
                defaultValue={promptConfig.defaultValue}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bn mb-6 text-slate-900 dark:text-slate-100"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    promptConfig.onConfirm(e.currentTarget.value);
                  }
                  if (e.key === 'Escape') {
                    promptConfig.onConfirm(null);
                  }
                }}
                id="custom-prompt-input"
              />
              <div className="flex gap-3 justify-end font-bn">
                <button
                  onClick={() => promptConfig.onConfirm(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('custom-prompt-input') as HTMLInputElement;
                    promptConfig.onConfirm(el?.value || "");
                  }}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  ওকে
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* High-Tech WebGL-Animated Dashboard Banner */}
      <div className="relative mb-10 w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 shadow-lg dark:shadow-2xl transition-all duration-300">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-60">
          <WebGLShader className="absolute inset-0 w-full h-full block pointer-events-none" />
        </div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden rounded-2xl border border-slate-100 dark:border-[#27272a] bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
          <div className="space-y-3.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold font-mono tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                SYSTEM CORE ONLINE
              </span>
              <div className="bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                {!user ? "Guest Mode" : profile?.plan === 'pro' ? "Pro Member" : "Free Account"}
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-bn leading-tight">
              স্মার্ট পিডিএফ টুলস (PDF Tools)
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-bn max-w-2xl">
              ভূমি রেকর্ড প্রসেসিং এর আধুনিক মাধ্যম ও সহজ অটোমেটিক পিডিএফ এডিটার টুলস।
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            {/* Live Usage Indicator inside high tech design */}
            <div className="bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center md:text-right w-full min-w-[200px] shadow-inner backdrop-blur-lg">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase mb-1">
                RESOURCE ALLOCATIONS
              </p>
              <div className="text-lg font-black font-bn text-slate-900 dark:text-white">
                Usage: {!user ? `${unregisteredUsage} / ${settings?.unregisteredDailyLimit ?? 2}` : profile?.plan === 'pro' || profile?.isAdmin ? 'Unlimited' : `${profile?.currentDayUsage || 0} / ${settings?.freeDailyLimit || profile?.dailyLimit || 5}`}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bn mt-1 opacity-80">
                {!user ? "দৈনিক গেস্ট লিমিটেশন সক্রিয়" : profile?.plan === 'pro' ? "আনলিমিটেড প্রো এক্সেস সচল" : "দৈনিক ফ্রি লিমিটেশন সক্রিয়"}
              </p>
            </div>

            {profile?.plan !== 'pro' && !profile?.isAdmin && (
              <a href="/settings" className="mt-1">
                <MetalButton variant="gold" className="font-bn font-bold text-xs tracking-wide">
                  💎 প্রো মেম্বারশিপে আপগ্রেড করুন
                </MetalButton>
              </a>
            )}
          </div>
        </div>
      </div>

      {!activeTool ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 pb-20">
            <div className="lg:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <motion.div
                key={tool.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  if (tool.pro && profile?.plan !== 'pro' && !profile?.isAdmin) {
                    showToast('এই ফিচারটি ব্যবহার করতে প্রো প্ল্যান প্রয়োজন। (Requires Pro Plan)', 'error');
                    return;
                  }
                  if (tool.active) {
                    if (activeTool !== tool.id) {
                      setFiles([]);
                    }
                    setActiveTool(tool.id as ToolType);
                  }
                }}
                className={cn(
                  "group relative bg-white/80 dark:bg-slate-800/90 backdrop-blur-md border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 md:p-8 flex flex-col items-start transition-all duration-300 shadow-sm shadow-slate-100/40 dark:shadow-none",
                  (tool.active && (!tool.pro || profile?.plan === 'pro' || profile?.isAdmin)) ? "cursor-pointer hover:border-blue-450/40 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-slate-100/50 dark:hover:shadow-none" : "opacity-75 grayscale cursor-not-allowed"
                )}
              >
                {tool.pro && (
                  <div className="absolute top-6 right-6 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold rounded-lg uppercase tracking-wider flex items-center gap-1 border border-amber-100/50 dark:border-amber-900/30">
                    <Zap size={10} className="fill-amber-700 dark:fill-amber-400" />
                    Pro
                  </div>
                )}
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-sm shadow-indigo-150/10 dark:shadow-none group-hover:scale-105 transition-transform duration-300 shrink-0", tool.color)}>
                  <tool.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1 font-bn">{tool.titleBn}</h3>
                <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-3 tracking-wide uppercase">{tool.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed font-bn flex-1">{tool.descBn}</p>
                
                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all pt-2 border-t border-slate-100/80 dark:border-slate-700 w-full font-bn">
                  {tool.active ? "ব্যবহার শুরু করুন (Start)" : "আপগ্রেড প্রয়োজন (Pro)"}
                  <ArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1 xl:col-span-1">
            <AccountSummaryPanel />
          </div>
        </div>

        <div className="my-10">
          <FeatureGridDemo />
        </div>

        <TestimonialsSection />
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8 pb-40 sm:pb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setActiveTool(null)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-bn">
              {tools.find(t => t.id === activeTool)?.titleBn} - এ স্বাগতম
            </h3>
          </div>

          {activeTool === 'validate-signature' && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 text-green-900 dark:text-green-300 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-2 font-bn text-lg">
                <CheckCircle2 className="text-green-600" size={20} />
                ডিজিটাল সাইন ভেরিফিকেশন গাইড
              </h4>
              <p className="text-sm border-l-4 border-green-400 pl-3 ml-1 text-green-800 leading-relaxed font-bn">
                আপনার ই-ডিস্ট্রিক্ট বা অন্যান্য ডিজিটাল সিগনেচার যুক্ত পিডিএফ এখানে আপলোড করুন। এই টুলটি আপনার সিগনেচার ভেরিফাই করে পিডিএফ এর উপরে একটি সবুজ রঙের রাইট চিহ্ন (✔) বসিয়ে দেবে, যা প্রিন্ট করলে ভেরিফাইড বলে গণ্য হবে।
              </p>
            </div>
          )}

          {activeTool === 'pdf-to-word' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-blue-900 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-2 font-bn text-lg">
                <FileText className="text-blue-600" size={20} />
                পিডিএফ থেকে ওয়ার্ড কনভার্সন গাইড
              </h4>
              <p className="text-sm border-l-4 border-blue-400 pl-3 ml-1 text-blue-800 leading-relaxed font-bn">
                আপনার যেকোনো পিডিএফ ফাইল এখানে আপলোড করে ওয়ার্ড ফরম্যাটে (.docx) কনভার্ট করতে পারেন। এতে আপনি ফাইলের লেখাগুলো সহজেই পরিবর্তন বা সম্পাদন (Edit) করতে পারবেন।
              </p>
            </div>
          )}

          <FileDropzone onFilesAdded={handleFilesAdded} {...getDropzoneProps()} compact={files.length > 0} />

          {(activeTool === 'compress-image' || activeTool === 'compress-pdf') && files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 sm:px-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <label htmlFor="targetSize" className="font-bold text-slate-800 dark:text-slate-200 text-lg font-bn">কম্প্রেশন টার্গেট সাইজ</label>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bn mt-0.5">আপনার কাঙ্ক্ষিত সাইজ সেট করুন (KB)</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                <input 
                  id="targetSize"
                  type="number"
                  min="1"
                  max="10240"
                  value={targetSizeKb}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setTargetSizeKb('');
                    } else {
                      const numVal = Number(val);
                      setTargetSizeKb(isNaN(numVal) ? '' : numVal);
                    }
                  }}
                  onBlur={() => {
                    if (targetSizeKb === '' || Number(targetSizeKb) < 1) {
                      setTargetSizeKb(50);
                    }
                  }}
                  className="w-24 text-center font-bold text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                />
                <span className="font-bold text-slate-500 dark:text-slate-400 pr-2">KB</span>
              </div>
            </motion.div>
          )}
          
          <FileListTable 
            files={files} 
            onRemove={removeFile} 
          />

          <ActionBar 
            hasFiles={files.length > 0}
            isProcessing={isProcessing}
            activeTool={activeTool}
            onAutoRename={handleAutoRename}
            onMergePrint={handleMergePrint}
            onImageToPdf={handleImageToPdf}
            onSplitPdf={handleSplitPdf}
            onCompressImage={handleCompressImage}
            onCompressPdf={handleCompressPdf}
            onValidateSignature={handleValidateSignature}
            onPdfToWord={handlePdfToWord}
            onPdfToImage={handlePdfToImage}
            onUnlockPdf={handleUnlockPdf}
            onProtectPdf={handleProtectPdf}
            onWatermarkPdf={handleWatermarkPdf}
          />
        </motion.div>
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-6 lg:bottom-12 left-1/2 -translate-x-1/2 z-10 px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md shadow-2xl font-medium border text-center ${
              toast.type === 'error' ? 'bg-red-500/90 text-white border-red-500/50' :
              toast.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-500/50' :
              'bg-slate-800/90 text-white border-slate-700/50'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    
      <AnimatePresence>
        {isProcessing && compressionProgress !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center"
          >
            <div className="w-24 h-24 mb-6 rounded-2xl bg-teal-600 flex items-center justify-center shadow-xl shadow-teal-500/20 relative overflow-hidden">
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-teal-400"
                initial={{ height: "0%" }}
                animate={{ height: `${Math.max(0, Math.min(100, compressionProgress))}%` }}
                transition={{ ease: "linear" }}
              />
              <Zap className="text-white w-12 h-12 relative z-10" />
            </div>
            <h2 className="text-2xl font-bold font-bn text-slate-800 dark:text-slate-100 mb-2">কম্প্রেস করা হচ্ছে...</h2>
            <div className="text-4xl font-bold text-teal-600 font-mono">
              {compressionProgress}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </AppLayout>
  );
}
