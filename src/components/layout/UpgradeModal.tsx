import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { settings, profile, user } = useAuth();
  
  const [step, setStep] = useState<'plans' | 'checkout' | 'success'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = (plan: 'monthly' | 'yearly') => {
    setSelectedPlan(plan);
    setStep('checkout');
  };

  const handleReset = () => {
    setStep('plans');
    setTransactionId('');
    onClose();
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim() || !user || !profile) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userEmail: profile.email,
        plan: selectedPlan,
        transactionId: transactionId.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setStep('success');
    } catch (error) {
      console.error(error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleReset}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl relative flex flex-col max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={handleReset}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>

          <AnimatePresence mode="wait">
            {step === 'plans' && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full min-h-0"
              >
                <div className="p-6 md:p-8 text-center bg-slate-50 border-b border-slate-100 shrink-0">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 font-bn tracking-tight">
                    PRO তে আপগ্রেড করুন
                  </h2>
                  <p className="text-sm md:text-base text-slate-500 font-bn max-w-md mx-auto">
                    যেকোনো লিমিট ছাড়াই আপনার কাজ আরো দ্রুত এবং সহজে করুন।
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8 bg-white flex-1 overflow-y-auto">
                  {/* Free Tier Details */}
                  <div className="border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col relative bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">Free Plan</h3>
                      {profile?.plan === 'free' && (
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200 shrink-0">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-6 font-bn">বেসিক ব্যবহারের জন্য</p>
                    
                    <div className="mb-8">
                       <span className="text-4xl font-extrabold text-slate-900">₹0</span>
                       <span className="text-slate-500 ml-1 font-medium">/ lifetime</span>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      {[
                        { text: `প্রতিদিন ${settings?.freeDailyLimit || 5}টি ফাইল প্রসেসিং`, inc: true },
                        { text: settings?.features?.rename === 'free' ? 'অটো রিনেম ফ্রি' : 'অটো রিনেম প্রো', inc: settings?.features?.rename === 'free' },
                        { text: 'বেসিক সাপোর্ট', inc: true },
                        { text: 'নো অ্যাডস', inc: true },
                      ].map((f, i) => (
                        <div key={i} className={cn("flex items-start gap-3", !f.inc && "opacity-40 grayscale")}>
                          <Check size={18} className={f.inc ? "text-emerald-500 shrink-0" : "text-slate-300 shrink-0"} />
                          <span className="text-sm text-slate-600 font-bn leading-tight pt-0.5">{f.text}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      disabled
                      className="w-full py-3.5 rounded-xl font-bold text-slate-400 bg-slate-50 border border-slate-200 uppercase tracking-widest text-sm transition-all"
                    >
                      {profile?.plan === 'free' ? 'Active' : 'Free'}
                    </button>
                  </div>

                  {/* Pro Tier Details */}
                  <div className="border border-blue-600 shadow-[0_0_40px_-15px_rgba(37,99,235,0.3)] rounded-2xl p-6 md:p-8 flex flex-col relative bg-gradient-to-b from-blue-50/50 to-white">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-blue-900">Pro Plan</h3>
                      {profile?.plan === 'pro' && (
                        <span className="bg-blue-600 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md shadow-blue-600/20 shrink-0">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-600/80 mb-6 font-bn">প্রফেশনালদের জন্য আনলিমিটেড এক্সেস</p>
                    
                    <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
                       <div>
                         <span className="text-4xl font-extrabold text-slate-900">₹{settings?.pricing?.monthly || 149}</span>
                         <span className="text-slate-500 ml-1 font-medium">/ month</span>
                       </div>
                       <div>
                         <span className="text-4xl font-extrabold text-slate-900">₹{settings?.pricing?.yearly || 999}</span>
                         <span className="text-slate-500 ml-1 font-medium">/ year</span>
                       </div>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                      {[
                        { text: 'আনলিমিটেড ফাইল প্রসেসিং' },
                        { text: 'সব প্রিমিয়াম টুলস এর ফুল এক্সেস' },
                        { text: 'এআই ডাটা এক্সট্রাক্ট' },
                        { text: 'এক্সেল এক্সপোর্ট ফিচার' },
                        { text: 'প্রায়োরিটি কাস্টমার সাপোর্ট' },
                      ].map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="rounded-full bg-blue-100 p-0.5 shrink-0">
                             <Check size={14} className="text-blue-600" />
                          </div>
                          <span className="text-sm text-slate-700 font-bold font-bn leading-tight pt-0.5">{f.text}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button 
                        onClick={() => handleCheckout('monthly')}
                        disabled={profile?.plan === 'pro'}
                        className="w-full py-3.5 rounded-xl font-bold text-blue-700 bg-blue-100 border border-blue-200 hover:bg-blue-200 active:scale-[0.98] transition-all uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {profile?.plan === 'pro' ? 'Active' : '1 Month'}
                      </button>
                      <button 
                        onClick={() => handleCheckout('yearly')}
                        disabled={profile?.plan === 'pro'}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed flex-1 shrink-0 whitespace-nowrap"
                      >
                        {profile?.plan === 'pro' ? 'Enjoy PRO' : '1 Year (Save 40%)'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'checkout' && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full bg-slate-50 min-h-0"
              >
                <div className="flex items-center gap-4 p-6 border-b border-slate-200 bg-white shrink-0">
                  <button onClick={() => setStep('plans')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft size={20} className="text-slate-600" />
                  </button>
                  <h2 className="text-xl font-bold text-slate-900 font-sans">Complete Payment</h2>
                </div>
                
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
                      <div className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Total Amount</div>
                      <div className="text-5xl font-extrabold text-slate-900">
                        ₹{selectedPlan === 'yearly' ? (settings?.pricing?.yearly || 999) : (settings?.pricing?.monthly || 149)}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 capitalize font-medium">{selectedPlan} Plan</div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                         <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                           <Send size={18} />
                         </div>
                         <div>
                           <h3 className="font-bold text-slate-900">Payment Instructions</h3>
                           <p className="text-sm text-slate-500">Please complete the payment using details below</p>
                         </div>
                      </div>

                      <div className="pt-2 pb-2">
                        {settings?.payment?.qrCodeImage && (
                          <div className="mb-6 flex justify-center">
                            <div className="bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
                              <img src={settings.payment.qrCodeImage} alt="Payment QR Code" className="w-48 h-48 object-contain rounded-xl" />
                            </div>
                          </div>
                        )}
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pay To UPI ID</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-slate-800 font-medium break-all">
                          {settings?.payment?.upiId || 'No UPI ID configured by admin. Please contact support.'}
                        </div>
                      </div>

                      {(settings?.payment?.instructions) && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 font-medium">
                          {settings.payment.instructions}
                        </div>
                      )}
                    </div>

                    <form onSubmit={handleSubmitPayment} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                       <div>
                         <label className="text-sm font-bold text-slate-700 block mb-2">Transaction ID / UTR Number <span className="text-red-500">*</span></label>
                         <p className="text-xs text-slate-500 mb-2 font-bn">পেমেন্ট কমপ্লিট হওয়ার পর ট্রানজেকশন আইডি বা UTR নাম্বারটি এখানে দিন।</p>
                         <input 
                           type="text" 
                           required
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value)}
                           placeholder="e.g. 123456789012"
                           className="w-full border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow font-mono"
                         />
                       </div>

                       <button 
                         type="submit"
                         disabled={isSubmitting || !transactionId.trim()}
                         className="w-full py-3.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors uppercase tracking-widest text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                       >
                         {isSubmitting ? 'Submitting...' : 'Submit Payment Info'}
                       </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center p-12 text-center h-[500px]"
              >
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 flex items-center justify-center rounded-full mb-6">
                  <CheckCircle2 size={40} className="drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto font-bn">
                  আপনার পেমেন্ট রিকুয়েস্ট সফল ভাবে জমা হয়েছে। এডমিন ভেরিফাই করার পর আপনার একাউন্ট প্রো তে আপগ্রেড করা হবে।
                </p>
                <button
                  onClick={handleReset}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider text-sm hover:bg-slate-800 transition-colors"
                >
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
