import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Clock, FileText, Download, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface HistoryItem {
  id: string;
  userId: string;
  fileName: string;
  action: string;
  timestamp: string;
  fileSize?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'history'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
        setHistory(data);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full py-2 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-blue-100/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200/20 dark:border-blue-900/40 shadow-xs flex-shrink-0">
          <Clock size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-bn tracking-tight">আপনার হিস্ট্রি (History)</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bn">আগে কাজ করা সমস্ত ফাইলের তালিকা নিচে দেওয়া হলো।</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-100 dark:border-slate-800/85 shadow-sm overflow-hidden w-full">
        {history.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/40 rounded-full flex items-center justify-center mb-4 border border-slate-100/50 dark:border-slate-800/30">
              <FileText className="text-slate-300 dark:text-slate-600" size={40} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-bn mb-1">কোনো হিস্ট্রি পাওয়া যায়নি</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bn text-sm">আপনি এখনও কোনো ফাইল প্রসেস করেননি।</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {history.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="w-12 h-12 bg-blue-50/65 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl flex flex-shrink-0 items-center justify-center border border-blue-100/30 dark:border-blue-900/20">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base truncate max-w-[280px] sm:max-w-md md:max-w-xl">{item.fileName}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] md:text-xs font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-100/40 dark:border-blue-900/30">
                        {item.action}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium font-mono text-[11px] md:text-xs">
                        {format(new Date(item.timestamp), 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
