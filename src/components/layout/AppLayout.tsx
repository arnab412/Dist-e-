import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { FeedbackModal } from '../FeedbackModal';
import { AIChatWidget } from '../AIChatWidget';
import { MessageSquarePlus, Bot } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 transition-colors duration-200" id="app-layout-root">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            id="mobile-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0" id="main-content-wrapper">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="mt-16 p-4 lg:p-8 flex-1 relative flex flex-col min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden" id="app-main-view">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-full mx-auto w-full flex-1 flex flex-col min-w-0 overflow-x-hidden"
          >
            {children}
          </motion.div>
          <Footer />
        </main>
      </div>

      {/* Floating Action Buttons Dock */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 sm:gap-3" id="floating-actions-dock">
        {/* Feedback Button */}
        <button
          id="btn-feedback"
          onClick={() => setIsFeedbackOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full sm:rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 font-bn text-sm font-bold border border-emerald-500/20"
          title="রিপোর্ট / মতামত"
        >
          <MessageSquarePlus size={18} className="animate-pulse" />
          <span className="hidden sm:inline">রিপোর্ট / মতামত</span>
        </button>

        {/* AI Guide Button */}
        {!isAIChatOpen && (
          <button
            id="btn-ai-guide"
            onClick={() => setIsAIChatOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/10 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full sm:rounded-2xl shadow-lg flex items-center gap-2 transition-all hover:scale-105 active:scale-95 font-bn text-sm font-bold border border-blue-500/20 animate-bounce"
            style={{ animationDuration: '3s' }}
            title="এআই গাইড"
          >
            <Bot size={18} />
            <span className="hidden sm:inline">এআই গাইড</span>
          </button>
        )}
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <AIChatWidget isOpen={isAIChatOpen} setIsOpen={setIsAIChatOpen} />
    </div>
  );
}
