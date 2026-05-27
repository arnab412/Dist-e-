import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CreditCard, LogOut, Activity, User as UserIcon, Zap, Loader2, IndianRupee, QrCode, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInCalendarDays } from 'date-fns';
import { AwardBadge } from '../components/ui/award-badge';

export default function SettingsPage() {
  const { profile, settings, logout, loading, updateProfileName } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  if (loading || !profile) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  const isPro = profile.plan === 'pro';
  const dailyLimit = settings.freeDailyLimit || profile.dailyLimit || 5;
  const usagePercentage = isPro ? 0 : Math.min(100, (profile.currentDayUsage / dailyLimit) * 100);

  const startEditingName = () => {
    setNewName(profile.displayName || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === profile.displayName) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await updateProfileName(newName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update name", error);
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full py-2 space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-bn tracking-tight">অ্যাকাউন্ট সেটিংস (Account Settings)</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bn">আপনার প্রোফাইল, সুবিধা এবং সাবস্ক্রিপশন পরিচালনা করুন।</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-4">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={profile.displayName} className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-800" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <UserIcon className="text-slate-400 dark:text-slate-500" size={32} />
              </div>
            )}
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditingName(false);
                    }}
                  />
                  <button 
                    onClick={handleSaveName} 
                    disabled={isSavingName}
                    className="p-1.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
                  >
                    {isSavingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                  <button 
                    onClick={() => setIsEditingName(false)} 
                    disabled={isSavingName}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{profile.displayName || 'No Name'}</h2>
                  <button 
                    onClick={startEditingName}
                    className="p-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-all rounded-md hover:bg-indigo-50 dark:hover:bg-slate-800"
                    title="Edit Name"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
              <p className="text-slate-500 dark:text-slate-400 text-sm font-mono text-[13px]">{profile.email}</p>
            </div>
          </div>
          
          <div className="space-y-4 flex-grow">
            <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100 dark:border-slate-800">
               <span className="text-slate-500 dark:text-slate-400 font-bn font-medium">অ্যাকাউন্ট টাইপ</span>
               <span className="font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs">
                 {profile.isAdmin ? 'Admin' : 'User'}
               </span>
            </div>
            <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100 dark:border-slate-800">
               <span className="text-slate-500 dark:text-slate-400 font-bn font-medium">অ্যাকাউন্ট আইডি</span>
               <span className="text-slate-400 dark:text-slate-500 font-mono text-xs">{profile.uid.slice(0, 8)}...</span>
            </div>
          </div>
          
        </motion.div>

        {/* Plan & Subscription Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden flex flex-col ${isPro ? 'bg-gradient-to-br from-indigo-950 to-slate-900 border-indigo-900/40 text-indigo-100 dark:text-indigo-200' : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800'}`}
        >
          {isPro && (
            <>
              <div className="absolute -right-12 -top-12 opacity-10 pointer-events-none">
                <Zap size={180} />
              </div>
              <div className="hidden sm:block absolute right-6 top-6 z-20 pointer-events-auto">
                <div className="scale-75 origin-top-right">
                  <AwardBadge type="golden-kitty" />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isPro ? 'bg-indigo-805/80 text-indigo-200' : 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                <CreditCard size={24} />
              </div>
              <h3 className={`text-lg font-bold font-bn ${isPro ? 'text-white' : 'text-slate-900 dark:text-white'}`}>সাবস্ক্রিপশন প্ল্যান</h3>
            </div>
            
            {isPro && (
              <div className="block sm:hidden z-20 pointer-events-auto">
                <div className="scale-95 origin-left">
                  <AwardBadge type="golden-kitty" />
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 flex-grow">
            <div className="flex items-end gap-2 mb-4">
               <span className="text-4xl font-extrabold tracking-tight">
                 {isPro ? 'Pro' : 'Free'}
               </span>
               <span className={`text-sm mb-1 ${isPro ? 'text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}>
                 Plan
               </span>
            </div>

            {isPro ? (
              <div className="space-y-4">
                <p className="text-indigo-200 text-sm font-bn">
                  আপনার প্রো প্ল্যানের মেয়াদ শেষ হবে: <strong className="text-white font-mono text-base">{profile.planExpiresAt ? format(new Date(profile.planExpiresAt), 'dd/MM/yyyy') : 'লাইফটাইম (Lifetime)'}</strong>
                </p>
                {profile.planExpiresAt ? (
                  <div className="inline-flex items-center bg-indigo-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-indigo-700/30 shadow-inner">
                    <span className="text-indigo-200 text-sm font-bn mr-2">মেয়াদ বাকি আছে:</span>
                    <strong className="text-white text-lg font-mono">
                      {Math.max(0, differenceInCalendarDays(new Date(profile.planExpiresAt), new Date()))} দিন
                    </strong>
                  </div>
                ) : (
                  <div className="inline-flex items-center bg-indigo-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-indigo-700/30 shadow-inner">
                    <span className="text-indigo-200 text-sm font-bn mr-2">মেয়াদ বাকি আছে:</span>
                    <strong className="text-white text-lg font-mono">
                      আনলিমিটেড
                    </strong>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400 text-sm font-bn">
                 আপনি বর্তমানে ফ্রি প্ল্যান ব্যবহার করছেন। আনলিমিটেড ব্যবহার করতে প্রো প্ল্যানে আপগ্রেড করুন।
              </p>
            )}
          </div>

          {!isPro && (
             <div className="mt-6 flex flex-col gap-3">
               <button 
                 onClick={() => setShowPayment(!showPayment)}
                 className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 rounded-xl font-bold font-bn text-sm hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
               >
                 {showPayment ? 'পেমেন্ট তথ্য বন্ধ করুন' : 'আপগ্রেড টু প্রো (Upgrade to Pro)'}
                 {!showPayment && <Zap size={16} className="text-amber-400" />}
               </button>

               <AnimatePresence>
                 {showPayment && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }} 
                     animate={{ height: 'auto', opacity: 1 }} 
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                     <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                       <div className="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-300 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30">
                         <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                            <IndianRupee size={16} className="text-indigo-600 dark:text-indigo-400" />
                            প্রাইসিং (Pricing)
                         </h4>
                         <ul className="text-sm font-medium space-y-1">
                           <li className="flex justify-between"><span>মাসিক (Monthly):</span> <span>₹{settings.pricing?.monthly || 149}</span></li>
                           <li className="flex justify-between"><span>বার্ষিক (Yearly):</span> <span>₹{settings.pricing?.yearly || 999}</span></li>
                         </ul>
                       </div>

                       <div className="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300/90 p-4 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 space-y-3">
                         <h4 className="font-bold text-sm flex items-center gap-2">
                           <QrCode size={16} className="text-emerald-600 dark:text-emerald-400" />
                           পেমেন্ট নির্দেশিকা
                         </h4>
                         
                         {settings.payment?.upiId && (
                           <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-emerald-200 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-center text-sm font-mono font-bold select-all">
                             {settings.payment.upiId}
                           </div>
                         )}
                         
                         <p className="text-xs leading-relaxed font-bn">
                           {settings.payment?.instructions || 'উপরের UPI ID-তে পেমেন্ট করে অ্যাডমিনকে Transaction ID মেসেজ করুন।'}
                         </p>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          )}
        </motion.div>

        {/* Usage Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm md:col-span-2 flex flex-col sm:flex-row gap-8 items-center"
        >
          <div className="flex-shrink-0 p-4 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/30">
            <Activity size={32} />
          </div>
          
          <div className="flex-grow w-full">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-bn">দৈনিক ব্যবহার (Daily Usage)</h3>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {isPro ? 'Unlimited' : `${profile.currentDayUsage} / ${dailyLimit}`}
              </span>
            </div>
            
            {!isPro && (
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${usagePercentage >= 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            )}
            
            <div className="mt-4 flex gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div>
                <span className="font-bn">মোট ফাইল প্রসেস:</span> <strong className="text-slate-800 dark:text-slate-100">{profile.totalUsage || 0}</strong>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100/70 dark:border-rose-950/40 shadow-sm md:col-span-2 flex justify-between items-center"
        >
           <div className="font-bn">
             <h3 className="text-rose-600 dark:text-rose-400 font-bold text-lg mb-1">অ্যাকাউন্ট লগআউট</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm">আপনি চাইলে যেকোনো সময় লগআউট করতে পারেন।</p>
           </div>
           
           <button 
             onClick={logout}
             className="px-6 py-2.5 bg-rose-50/70 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-900/35 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl font-bold font-bn flex items-center gap-2 transition-colors border border-rose-100/30 dark:border-transparent"
           >
             <LogOut size={18} />
             লগআউট
           </button>
        </motion.div>

      </div>
    </div>
  );
}
