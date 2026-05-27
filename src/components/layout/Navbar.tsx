import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Menu, LogIn, CheckCircle2, Zap, Info, FileText, CreditCard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { db } from '../../firebase';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

import { LogoIcon } from '../ui/LogoIcon';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile, signInWithGoogle } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notifs: any[] = [];
      
      if (user && profile) {
        if (profile.plan === 'free') {
          notifs.push({
            id: 'upgrade-nudge',
            title: 'Upgrade to PRO',
            message: 'Unlock unlimited processing and advanced PDF features.',
            time: new Date(),
            icon: <Zap size={16} className="text-amber-500" />,
            bgColor: 'bg-amber-50'
          });
        } else if (profile.plan === 'pro') {
          if (profile.planExpiresAt) {
            const daysLeft = Math.max(0, Math.ceil((new Date(profile.planExpiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
            if (daysLeft <= 3) {
              notifs.push({
                id: 'pro-expiring',
                title: 'PRO Plan Expiring Soon',
                message: `Your PRO plan will expire in ${daysLeft} days. Recharge now.`,
                time: new Date(),
                icon: <Zap size={16} className="text-red-500" />,
                bgColor: 'bg-red-50'
              });
            }
          }
        }

        try {
          // Fetch recent history
          const qHistory = query(
            collection(db, 'history'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(3)
          );
          const histSnap = await getDocs(qHistory);
          histSnap.docs.forEach((doc) => {
            const data = doc.data();
            notifs.push({
              id: doc.id,
              title: `Processed File: ${data.action}`,
              message: data.fileName,
              time: new Date(data.timestamp),
              icon: <FileText size={16} className="text-blue-500" />,
              bgColor: 'bg-blue-50'
            });
          });

          // Fetch recent payments
          const qPayments = query(
            collection(db, 'payments'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(2)
          );
          const paySnap = await getDocs(qPayments);
          paySnap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'approved') {
              notifs.push({
                id: doc.id,
                title: 'Payment Approved',
                message: `Your ${data.plan} plan has been activated.`,
                time: new Date(data.createdAt),
                icon: <CheckCircle2 size={16} className="text-emerald-500" />,
                bgColor: 'bg-emerald-50'
              });
            } else if (data.status === 'rejected') {
              notifs.push({
                id: doc.id,
                title: 'Payment Rejected',
                message: `Your recent payment was rejected. Check details.`,
                time: new Date(data.createdAt),
                icon: <CreditCard size={16} className="text-rose-500" />,
                bgColor: 'bg-rose-50'
              });
            }
          });

        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
        
        // Sort notifications by date descending
        notifs.sort((a, b) => b.time.getTime() - a.time.getTime());

      } else {
        notifs.push({
          id: 'guest',
          title: 'Welcome Guest',
          message: 'Login to track history and increase daily limits.',
          time: new Date(),
          icon: <Info size={16} className="text-blue-500" />,
          bgColor: 'bg-blue-50'
        });
      }
      
      setNotifications(notifs);
    };

    fetchNotifications();
  }, [user, profile]);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 z-40 w-full lg:w-[calc(100%-16rem)] transition-colors duration-200">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-2 lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Mobile Brand */}
        <div className="flex items-center gap-1 sm:gap-2 lg:hidden mr-2 shrink-0 overflow-hidden">
          <LogoIcon size={22} className="shrink-0 drop-shadow-md" />
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 dark:text-white text-[16px] sm:text-[18px] tracking-tight leading-none font-bn truncate">পিডিএফ<span className="text-red-500">টুলবক্স</span></h1>
          </div>
        </div>

        <div className="max-w-md relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search records..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 shrink-0">
        <div className="relative flex items-center gap-1 sm:gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-slate-100"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          </div>
          
          <AnimatePresence>
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 font-bn">Notifications</h3>
                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{notifications.length} NEW</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map(notif => (
                          <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", notif.bgColor)}>
                              {notif.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 mb-0.5 leading-tight font-bn">{notif.title}</p>
                              <p className="text-xs text-slate-500 mb-1 leading-relaxed font-bn">{notif.message}</p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {formatDistanceToNow(notif.time, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center">
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-none mb-1">
              {user ? (user.displayName || 'User') : 'Guest User'}
            </p>
            <div className="flex items-center justify-end gap-1.5">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide",
                !user ? "bg-slate-100 text-slate-500" :
                profile?.plan === 'pro' ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
              )}>
                {!user ? 'Unregistered' : profile?.plan || 'Free'}
              </span>
            </div>
          </div>
          
          {user ? (
            <div className="w-10 h-10 rounded-full border-2 border-blue-50 p-0.5">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {user.displayName?.[0] || <User size={20} />}
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm font-bn sm:hidden"
            >
              <LogIn size={14} />
              লগিন
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
