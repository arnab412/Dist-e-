import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'bug' | 'feature' | 'general'>('bug');
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      alert('Image must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        userId: user?.uid || null,
        userEmail: user?.email || null,
        type,
        message,
        screenshotBase64: screenshot,
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        setScreenshot(null);
        setType('bug');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {success ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-bn">
                  ধন্যবাদ!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-bn">
                  আপনার ফিডব্যাক সফলভাবে পাঠানো হয়েছে।
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-bn flex items-center gap-2">
                    <MessageSquare size={20} className="text-emerald-500" />
                    মতামত বা রিপোর্ট দিন
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl">
                      {(['bug', 'feature', 'general'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`flex-1 py-2 text-sm font-bold font-bn rounded-lg capitalize transition-colors ${
                            type === t
                              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {t === 'bug' ? 'সমস্যা রিপোর্ট' : t === 'feature' ? 'নতুন ফিচার' : 'মতামত'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        type === 'bug' ? 'সমস্যাটি বিস্তারিত লিখুন...' :
                        type === 'feature' ? 'কেমন ফিচার চান?' :
                        'আপনার মতামত লিখুন...'
                      }
                      className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-slate-900 dark:text-slate-100 font-bn"
                      required
                    />
                  </div>

                  <div className="mb-6">
                    {screenshot ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <img src={screenshot} alt="Screenshot" className="w-full max-h-48 object-contain" />
                        <button
                          type="button"
                          onClick={() => setScreenshot(null)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors shadow-lg"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-bn"
                      >
                        <ImageIcon size={24} />
                        <span>স্ক্রিনশট যুক্ত করুন (Optional)</span>
                      </button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold font-bn transition-colors shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={18} />
                        পাঠিয়ে দিন
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
