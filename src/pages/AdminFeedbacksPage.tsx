import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Feedback } from '../types';
import { AppLayout } from '../components/layout/AppLayout';
import { Navigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Image as ImageIcon, CheckCircle, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminFeedbacksPage() {
  const { profile } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.isAdmin) {
      fetchFeedbacks();
    }
  }, [profile]);

  const fetchFeedbacks = async () => {
    try {
      const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
      setFeedbacks(data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Feedback['status']) => {
    try {
      await updateDoc(doc(db, 'feedbacks', id), { status });
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  if (!profile?.isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-bn">
            Feedbacks & Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">View user feedback and bug reports.</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : feedbacks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
              <MessageSquare size={20} /> No feedbacks yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {feedbacks.map(f => (
                <div key={f.id} className={`p-6 transition-colors ${f.status === 'new' ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          f.type === 'bug' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                          f.type === 'feature' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {f.type}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}
                        </span>
                        {f.userEmail && (
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                            {f.userEmail}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 dark:text-slate-100 font-bn text-lg whitespace-pre-wrap">
                        {f.message}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pl-6">
                      {f.screenshotBase64 && (
                        <button 
                          onClick={() => setSelectedScreenshot(f.screenshotBase64!)}
                          className="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors"
                        >
                          <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 relative group">
                             <img src={f.screenshotBase64} alt="Screenshot thumbnail" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <ImageIcon size={20} className="text-white" />
                             </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase">Screenshot</span>
                        </button>
                      )}

                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <select 
                          value={f.status}
                          onChange={(e) => handleStatusChange(f.id, e.target.value as Feedback['status'])}
                          className={`px-3 py-1.5 rounded-lg text-sm font-bold border focus:outline-none ${
                            f.status === 'new' ? 'bg-white dark:bg-slate-900 border-amber-200 text-amber-700 default:border-amber-700' :
                            f.status === 'reviewed' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 text-blue-700' :
                            'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 text-emerald-700'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="px-3 py-1.5 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-sm font-bold transition-colors"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedScreenshot && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
              onClick={() => setSelectedScreenshot(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-white font-bold">Screenshot</h3>
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[80vh] flex items-center justify-center">
                <img src={selectedScreenshot} alt="Full screenshot" className="max-w-full h-auto rounded-lg" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
