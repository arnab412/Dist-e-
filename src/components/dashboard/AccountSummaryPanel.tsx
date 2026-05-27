import React, { useEffect, useState } from 'react';
import { Activity, Shield, FileText, Zap, Crown, History, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'motion/react';

interface HistoryItem {
  id: string;
  fileName: string;
  processedAt: string;
  status?: string;
}

export function AccountSummaryPanel() {
  const { profile, user, settings, unregisteredUsage } = useAuth();
  const [recentFiles, setRecentFiles] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'users', user.uid, 'history'),
        orderBy('processedAt', 'desc'),
        limit(5)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HistoryItem[];
      setRecentFiles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isPro = profile?.plan === 'pro' || profile?.isAdmin;
  const dailyLimit = user ? (settings?.freeDailyLimit || profile?.dailyLimit || 5) : (settings?.unregisteredDailyLimit ?? 2);
  const currentUsage = user ? (profile?.currentDayUsage || 0) : unregisteredUsage;
  const usagePercentage = isPro ? 0 : Math.min(100, (currentUsage / dailyLimit) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/85 overflow-hidden shadow-sm shadow-slate-100/40 dark:shadow-none transition-all duration-350 sticky top-24">
      <div className="bg-gradient-to-r from-indigo-50/30 to-indigo-50/10 dark:from-indigo-950/20 dark:to-transparent flex items-center gap-3 px-6 py-5 border-b border-slate-100/80 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Activity size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 font-bn text-lg leading-tight">অ্যাকাউন্ট ওভারভিউ</h3>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account & Usage</p>
        </div>
      </div>
      
      <div className="p-6 flex flex-col gap-6">
        {/* Usage Stats Widget */}
        <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-bn flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> আজকের ব্যবহার (Daily Usage)
            </h4>
            <span className="text-xs font-bold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-md font-mono">
              {isPro ? 'Unlimited' : `${currentUsage} / ${dailyLimit}`}
            </span>
          </div>
          
          {!isPro && (
            <div className="space-y-2">
              <div className={`h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${usagePercentage >= 80 && usagePercentage < 100 ? 'ring-2 ring-amber-400/50 animate-pulse ring-offset-1 dark:ring-offset-slate-900' : ''} ${usagePercentage >= 100 ? 'ring-2 ring-rose-500/50 animate-pulse ring-offset-1 dark:ring-offset-slate-900' : ''}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${usagePercentage >= 100 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : usagePercentage >= 80 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-emerald-500'}`}
                />
              </div>
              <p className={`text-xs font-bn text-right ${usagePercentage >= 100 ? 'text-rose-500' : usagePercentage >= 80 ? 'text-amber-500 dark:text-amber-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {usagePercentage >= 100 ? 'আপনার ডেইলি লিমিট শেষ' : `আর ${Math.max(0, dailyLimit - currentUsage)} টি ফাইল প্রসেস করতে পারবেন`}
              </p>
            </div>
          )}
          
          {isPro && (
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg mt-2">
              <Crown size={16} />
              <span className="text-sm font-bold font-bn">প্রো প্ল্যান অ্যাক্টিভ রয়েছে</span>
            </div>
          )}
        </div>

        {/* Recent History */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 font-bn flex items-center gap-2">
              <History size={16} className="text-blue-500" /> রিসেন্ট হিস্ট্রি (History)
            </h4>
            <Link to="/history" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold font-bn flex items-center gap-1">
              সব দেখুন <ArrowRight size={12} />
            </Link>
          </div>
          
          <div>
            {!user ? (
               <div className="flex items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/30">
                 <div>
                    <h5 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-bn mb-1">লগইন করা নেই</h5>
                    <p className="text-xs text-slate-500 font-bn">হিস্ট্রি সেভ করতে লগইন করুন</p>
                 </div>
               </div>
            ) : loading ? (
              <div className="flex justify-center p-4">
                 <div className="animate-pulse flex space-x-4 w-full">
                   <div className="flex-1 space-y-4 py-1">
                     <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                     <div className="space-y-3">
                       <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                       <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                     </div>
                   </div>
                 </div>
              </div>
            ) : recentFiles.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200/60 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/20">
                 <FileText size={24} className="text-slate-300 dark:text-slate-600 mb-2" />
                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-bn">কোনো হিস্ট্রি পাওয়া যায়নি</p>
               </div>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-50/40 hover:bg-slate-100/40 dark:bg-slate-900/10 dark:hover:bg-slate-800/45 rounded-xl transition-colors border border-transparent">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/45 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{file.fileName}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {file.processedAt ? formatDistanceToNow(new Date(file.processedAt), { addSuffix: true }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security / Quality Assurance notice */}
        <div className="bg-emerald-500/[0.03] dark:bg-emerald-950/10 border border-emerald-500/15 dark:border-emerald-900/30 rounded-2xl p-4 mt-2 mb-2 shadow-xs">
          <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2 font-bn flex items-center gap-2">
            <Shield size={16} /> 100% সুরক্ষিত ও বিশ্বস্ত
          </h4>
          <ul className="text-xs text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed font-bn space-y-1.5 list-disc pl-4">
            <li>আপনার আপলোড করা সমস্ত ফাইল সম্পূর্ণ সুরক্ষিত।</li>
            <li>কাজ শেষ হওয়ার সাথে সাথেই সার্ভার থেকে ফাইল ডিলিট করে দেওয়া হয়।</li>
            <li>কোনো থার্ড-পার্টি ওয়েবসাইটের সাথে ডেটা শেয়ার করা হয় না।</li>
            <li>আপনার কোনো ব্যক্তিগত তথ্যের রেকর্ড আমরা সেভ রাখি না।</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
