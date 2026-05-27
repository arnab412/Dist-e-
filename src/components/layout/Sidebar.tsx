import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, History, Settings, LogOut, LogIn, FileText, Zap, X, ShieldAlert, FileQuestion, BookOpen, PenTool, MessageSquare, Newspaper } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { UpgradeModal } from './UpgradeModal';
import { LogoIcon } from '../ui/LogoIcon';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: History, label: 'History', path: '/history', requiresAuth: true },
  { icon: BookOpen, label: 'About Us', path: '/about', requiresAuth: false },
  { icon: FileQuestion, label: 'FAQ', path: '/faq', requiresAuth: false },
  { icon: BookOpen, label: 'Blog', path: '/blog', requiresAuth: false },
  { icon: Newspaper, label: 'News & Tips', path: '/news', requiresAuth: false },
  { icon: Settings, label: 'Settings', path: '/settings', requiresAuth: true },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, signInWithGoogle, logout, profile, settings, unregisteredUsage } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <>
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/80 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6">
        <div className="flex items-center gap-3">
          <LogoIcon size={40} className="shrink-0 drop-shadow-sm" />
          <div className="flex-1">
            <h1 className="font-bold text-slate-900 dark:text-white text-2xl tracking-tight leading-none font-bn">পিডিএফ</h1>
            <span className="font-bold text-red-500 uppercase tracking-widest text-[13px] font-bn">টুলবক্স</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden p-2 -mr-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          if (item.requiresAuth && !user) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'border border-transparent text-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
        {profile?.isAdmin && (
          <>
            <NavLink
              to="/admin/feedbacks"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-2',
                  isActive
                    ? 'bg-amber-50/70 border border-amber-100/40 text-amber-700 font-bold'
                    : 'border border-transparent text-amber-500 hover:bg-amber-50/30 hover:text-amber-600'
                )
              }
            >
              <MessageSquare size={20} />
              View Feedbacks
            </NavLink>
            <NavLink
              to="/admin/blog"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-2',
                  isActive
                    ? 'bg-emerald-50/70 border border-emerald-100/40 text-emerald-700 font-bold'
                    : 'border border-transparent text-emerald-500 hover:bg-emerald-50/30 hover:text-emerald-600'
                )
              }
            >
              <PenTool size={20} />
              Manage Blog
            </NavLink>
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mt-2',
                  isActive
                    ? 'bg-red-50/70 border border-red-100/40 text-red-700 font-bold'
                    : 'border border-transparent text-rose-500 hover:bg-rose-50/30 hover:text-rose-600'
                )
              }
            >
              <Settings size={20} />
              Admin Panel
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 mt-auto">
        {!user && (
          <div className="bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl p-4 mb-4 border border-emerald-100/60 dark:border-emerald-800/40 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Guest User</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed font-bn">
              আপনি ফ্রি গেস্ট হিসেবে ব্যবহার করছেন ({unregisteredUsage} / {settings?.unregisteredDailyLimit ?? 2})। লিমিট বাড়াতে বিনামূল্যে লগিন করুন।
            </p>
            <button 
              onClick={signInWithGoogle}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm font-bn"
            >
              Google দিয়ে লগিন করুন
            </button>
          </div>
        )}

        {(user && profile?.plan === 'free' && !profile?.isAdmin) && (
          <div className="bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">Free Plan</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed font-bn">
              প্রো ভার্সনে আনলিমিটেড ফাইল রিনেম এবং এআই সাপোর্ট পান।
            </p>
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold rounded-xl hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-xs font-bn hover:bg-slate-50"
            >
              Upgrade Now (আপগ্রেড করুন)
            </button>
          </div>
        )}

        {user && (
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 rounded-xl transition-all duration-200 border border-transparent hover:border-rose-100/50 dark:hover:border-transparent font-bn"
          >
            <LogOut size={20} />
            লগ আউট (Log Out)
          </button>
        )}
      </div>
    </aside>
    </>
  );
}
