import React, { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  MessageCircleQuestion, 
  Search, 
  X, 
  HelpCircle, 
  Sparkles, 
  CreditCard, 
  Layers, 
  ChevronRight, 
  Mail, 
  MessageSquareShare 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface FaqItem {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'features';
}

const faqs: FaqItem[] = [
  {
    category: 'general',
    question: 'OVERSIGHT_PROTOCOL কী?',
    answer: 'এটি একটি স্মার্ট প্ল্যাটফর্ম যেখানে আপনি খুব সহজে পিডিএফ, ছবি, এবং প্রোডাক্টিভিটি টুলস ব্যবহার করে আপনার দৈনন্দিন কাজগুলোকে অটোমেট করতে পারেন। আমাদের স্পেশাল টুলগুলো ভূমি ও অন্যান্য ডকুমেন্ট প্রসেসিং এর কাজে দারুণ উপকারে আসে।'
  },
  {
    category: 'general',
    question: 'guest ইউজার হিসেবে আমি কী কী করতে পারবো?',
    answer: 'guest বা লগিন ছাড়া ইউজাররা প্রতিদিন নির্দিষ্ট একটি লিমিট পর্যন্ত কিছু টুলস ফ্রিতে ব্যবহার করতে পারবেন। লিমিট পার হলে, আরও কাজ করার জন্য আপনাকে একটি ফ্রি অ্যাকাউন্ট খুলতে হবে।'
  },
  {
    category: 'general',
    question: 'ফ্রিতে অ্যাকাউন্ট বানালে সুবিধা কী?',
    answer: 'ফ্রি অ্যাকাউন্ট বানালে আপনি প্রতিদিন কিছুটা বেশি লিমিট পাবেন। তবে আনলিমিটেড ব্যবহার করতে বা প্রিমিয়াম টুলস যেমন "Batch Merge" ও অন্যান্য Pro টুল ব্যবহার করতে প্রো প্ল্যান দরকার হবে।'
  },
  {
    category: 'pricing',
    question: 'PRO প্ল্যান এর দাম কত এবং কিভাবে রিচার্জ করবো?',
    answer: 'প্রো প্ল্যানের মাসিক ও বার্ষিক প্যাকেজ রয়েছে, যা আপনি অ্যাপ এর সেটিংস/আপগ্রেড থেকে চেক করতে পারেন। পেমেন্ট করার জন্য ইউপিআই (UPI) ব্যবহার করতে হবে এবং লেনদেনের পর Transaction ID দিয়ে রিকোয়েস্ট জমা দিতে হবে।'
  },
  {
    category: 'pricing',
    question: 'কীভাবে আমি প্রো প্ল্যান আপগ্রেডের রিকোয়েস্ট পাঠাবো?',
    answer: 'অ্যাপ্লিকেশনের "Upgrade" বাটনে ক্লিক করে নির্দিষ্ট পেমেন্ট আইডিতে পেমেন্ট করুন। এরপর ট্রানজ্যাকশন আইডি (Transaction ID) ফর্মে বসিয়ে সাবমিট করুন। অ্যাডমিন আপনার পেমেন্ট দেখে খুব দ্রুত প্রো প্ল্যান কনফার্ম করে দেবে।'
  },
  {
    category: 'features',
    question: 'পিডিএফ মার্জ করতে কি প্রো প্ল্যান লাগে?',
    answer: 'হ্যাঁ, প্রোডাক্টিভিটি বাড়ানো এবং সার্ভারের কস্ট ম্যানেজ করার জন্য আমাদের কিছু এডভান্সড টুলস, যেমন- পিডিএফ মার্জ করা প্রো প্ল্যানের অধীনে রাখা হয়েছে।'
  },
  {
    category: 'features',
    question: 'অটো রিনেম (Auto-Rename) টুল কিভাবে কাজ করে?',
    answer: 'আমাদের স্মার্ট "Auto-Rename" টুলটি পিডিএফ স্ক্যান করে ভেতরের দাগ নম্বর বা প্লট নম্বর শনাক্ত করে এবং স্বয়ংক্রিয়ভাবে একটি সুন্দর নাম তৈরি করে দেয়, যা প্রচুর সময় বাঁচায়।'
  },
  {
    category: 'features',
    question: 'ডিজিটাল সাইন ভেরিফিকেশন কিভাবে হয়?',
    answer: '"Verify Signature" টুলে আপনি ডিজিটাল সাইন করা পিডিএফ দিলে, এটি সিগনেচার যাচাই করে এবং পিডিএফের উপর একটি সবুজ রঙের ভেরিফায়েড "রাইট (✔) চিহ্ন" বসিয়ে দেয়।'
  },
  {
    category: 'general',
    question: 'এখানে কি ফাইল সেভ থাকে বা প্রাইভেসির কোনো ঝুঁকি আছে?',
    answer: 'আপনার সব কাজ আপনার ব্রাউজারে বা আমাদের সম্পূর্ণ সিকিউরড সার্ভারে সাময়িকভাবে প্রসেস হয় এবং কোনো ব্যক্তিগত ফাইল আমরা দীর্ঘ সময়ের জন্য সেভ করে রাখি না। গোপনীয়তা ও সুরক্ষা আমাদের মূল লক্ষ্য।'
  },
  {
    category: 'pricing',
    question: 'প্রো প্ল্যানের মেয়াদ কীভাবে দেখব?',
    answer: '"সেটিংস" (Settings) অপশনে গিয়ে আপনি আপনার প্রো প্ল্যানের বর্তমান স্ট্যাটাস এবং মেয়াদ উত্তীর্ণের তারিখ দেখতে পাবেন। এছাড়া, মেয়াদ শেষের আগে আপনি রিমাইন্ডার পাবেন।'
  },
  {
    category: 'features',
    question: 'Image to PDF কী কাজ করে?',
    answer: 'আপনার দরকারি অনেকগুলি জেপিজি বা পিএনজি ছবি একসাথে আপলোড করলে, টুলটি সেকেন্ডের মধ্যে সেগুলোকে একটি সিঙ্গেল পিডিএফ ফাইলে পরিবর্তন করে দেয়।'
  },
  {
    category: 'pricing',
    question: 'পেমেন্ট অনুমোদনে কতক্ষণ সময় লাগে?',
    answer: 'সাধারণত কিছুক্ষণের মধ্যেই অ্যাডমিন পেমেন্ট চেক করে অনুমোদন দিয়ে দেন। তবে নেটওয়ার্ক বা অন্য কোনো কারণে সর্বোচ্চ কয়েক ঘন্টা সময় লাগতে পারে।'
  },
  {
    category: 'pricing',
    question: 'ফ্রি ইউজার এবং প্রো ইউজারের লিমিটেশনের পার্থক্য কী?',
    answer: 'ফ্রি ইউজাররা প্রতিদিন ৫টি বা নির্দিষ্ট সংখ্যক কাজ করতে পারবেন, অন্যদিকে প্রো ইউজারদের ব্যবহারের কোনো নির্দিষ্ট লিমিট নেই এবং তাঁরা সব প্রিমিয়াম ফিচার আনলিমিটেড ব্যবহার করতে পারবেন।'
  },
  {
    category: 'features',
    question: 'কিভাবে হিস্ট্রি দেখতে পাব?',
    answer: '"হিস্ট্রি" (History) পেইজে গেলে আপনি আগে যেসব ফাইল নিয়ে কাজ করেছেন তার একটি তালিকা দেখতে পারবেন, তবে এটি শুধুমাত্র লগইন করা ইউজারদের জন্য।'
  },
  {
    category: 'general',
    question: 'যদি কোনো সমস্যা হয় তাহলে কার সাথে যোগাযোগ করব?',
    answer: 'যেকোনো ধরনের অসুবিধা বা পেমেন্ট সংক্রান্ত ঝামেলার জন্য আপনি প্ল্যাটফর্মের অ্যাডমিনের সাথে ইমেইল বা প্রদত্ত যোগাযোগের মাধ্যমে কথা বলতে পারেন।'
  }
];

const categoryTabs = [
  { id: 'all', label: 'সব প্রশ্ন', icon: HelpCircle },
  { id: 'general', label: 'সাধারণ জিজ্ঞাসা', icon: MessageCircleQuestion },
  { id: 'pricing', label: 'প্রো প্ল্যান ও পেমেন্ট', icon: CreditCard },
  { id: 'features', label: 'টুলস ও ফিচারসমূহ', icon: Layers },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'pricing' | 'features'>('all');

  // Filter FAQs based on active category and search query
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-600 to-indigo-700 dark:from-indigo-950 dark:via-blue-900 dark:to-slate-900 rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-400/20 text-white">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-white/20 backdrop-blur-md rounded-full tracking-wider uppercase font-bn">
              <Sparkles size={12} className="text-yellow-300 animate-pulse" />
              হেল্প সেন্টার ও সাপোর্ট
            </span>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black font-bn tracking-tight mt-1 leading-tight">
                সাধারণ প্রশ্ন ও উত্তর (FAQ)
              </h1>
              <p className="text-blue-100/90 hover:text-white transition-colors duration-200 mt-2 font-bn text-sm sm:text-base max-w-2xl leading-relaxed">
                আপনার মনে যেসব সাধারণ প্রশ্ন ঘুরপাক খাচ্ছে, তার সাহায্যকারী উত্তরগুলো এখানে এক ক্লিকে পেয়ে যাবেন। ক্যাটাগরি অনুযায়ী ব্রাউজ করুন অথবা সরাসরি সার্চ করুন!
              </p>
            </div>

            {/* Premium Custom Search */}
            <div className="relative max-w-xl group mt-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-blue-200 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা উত্তর দিয়ে খুঁজুন..."
                className="w-full pl-12 pr-12 py-3.5 bg-white/10 backdrop-blur-md hover:bg-white/15 focus:bg-white text-slate-900 dark:text-slate-100 placeholder-blue-100/70 focus:placeholder-slate-400 border border-white/20 focus:border-white rounded-2xl outline-none transition-all shadow-inner font-bn text-base w-full focus:text-slate-900 dark:focus:text-slate-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-blue-100 hover:text-white dark:hover:text-slate-900 transition-colors focus:outline-none"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Tabs Section */}
        <div className="flex gap-2 p-1 overflow-x-auto no-scrollbar bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-800 backdrop-blur-sm">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id as any);
                  setOpenIndex(null); // Reset accordions on category switch
                }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bn text-sm font-semibold whitespace-nowrap transition-all duration-300 focus:outline-none shrink-0",
                  isActive
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/40 dark:border-slate-800"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon size={16} className={cn("transition-transform", isActive && "scale-110")} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center px-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-bn uppercase tracking-wider">
            খুঁজে পাওয়া গেছে: {filteredFaqs.length} টি উত্তর
          </p>
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-bn hover:underline"
            >
              রিসেট ফিল্টার
            </button>
          )}
        </div>

        {/* Accordions Block */}
        <div className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const globalIndex = faqs.findIndex(f => f.question === faq.question);
                const isOpen = openIndex === globalIndex;
                
                // Styling accents based on category
                const catColors = {
                  general: "border-l-blue-500",
                  pricing: "border-l-emerald-500",
                  features: "border-l-indigo-500",
                };

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    key={faq.question} 
                    className={cn(
                      "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 group hover:shadow-md border-l-4",
                      catColors[faq.category],
                      isOpen 
                        ? "shadow-sm border-slate-300/80 dark:border-slate-700/80 bg-slate-50/20 dark:bg-slate-900" 
                        : "hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                    >
                      <div className="flex-1 pr-4">
                        <span className={cn(
                          "font-bold text-slate-800 dark:text-slate-200 font-bn text-base sm:text-lg tracking-tight transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400",
                          isOpen && "text-blue-600 dark:text-blue-400"
                        )}>
                          {faq.question}
                        </span>
                      </div>
                      <div className={cn(
                        "p-1.5 rounded-full transition-all duration-350 shrink-0",
                        isOpen 
                          ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rotate-180" 
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-800 dark:group-hover:bg-slate-800 dark:group-hover:text-white"
                      )}>
                        <ChevronDown size={18} />
                      </div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-300 font-bn leading-relaxed text-sm sm:text-base border-t border-slate-150 dark:border-slate-800/50">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              // Empty State
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 space-y-4"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform">
                  <Search size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 font-bn">দুঃখিত, কোনো মিল খুঁজে পাওয়া যায়নি!</h3>
                  <p className="text-slate-500 font-bn text-sm">অনুগ্রহ করে ভিন্ন কোনো শব্দ ব্যবহার করে আবার সার্চ ট্রাই করুন অথবা রিসেট ফিল্টারে ক্লিক করুন।</p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold font-bn hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all outline-none border border-transparent shadow-sm"
                >
                  রিসেট এবং সব লেখা দেখান
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact/Support CTA Widget */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-950 dark:text-white font-bn tracking-tight flex items-center justify-center md:justify-start gap-2">
              <MessageSquareShare size={20} className="text-indigo-500 shrink-0" />
              আপনার কাঙ্ক্ষিত প্রশ্নটি খুঁজে পাননি?
            </h3>
            <p className="text-slate-500 font-bn text-xs sm:text-sm">
              কোনো চিন্তা করার প্রয়োজন নেই! আপনি যেকোনো সমস্যায় অ্যাডমিন বা আমাদের সাপোর্ট সেন্টারে সরাসরি যোগাযোগ করতে পারেন।
            </p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="mailto:support@oversight.com"
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bn text-sm font-bold shadow-sm transition-all focus:outline-none"
            >
              <Mail size={16} />
              ইমেইল সাপোর্ট
            </a>
            <NavLinkWrapper />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Simple internal helper wrapper to link properly
function NavLinkWrapper() {
  return (
    <a
      href="/settings"
      className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bn text-sm font-bold shadow-sm transition-all focus:outline-none hover:shadow-md"
    >
      যোগাযোগ করুন
      <ChevronRight size={16} />
    </a>
  );
}

