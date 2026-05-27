import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bot, User, Trash2 } from 'lucide-react';
import { MultimodalInput } from './ui/multimodal-ai-chat-input';

interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  attachments?: Attachment[];
}

interface AIChatWidgetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SUGGESTED_QUESTIONS = [
  {
    text: "কীভাবে প্রো প্ল্যান আপগ্রেড করব?",
    icon: "💎",
  },
  {
    text: "ডিজিটাল সিগনেচার যাচাই করব কীভাবে?",
    icon: "🔏",
  },
  {
    text: "পিডিএফ মার্জ করতে কি প্রো প্ল্যান লাগে?",
    icon: "📄",
  },
  {
    text: "গেস্ট ইউজার হিসেবে লিমিটেশনস কী?",
    icon: "👤",
  }
];

export function AIChatWidget({ isOpen, setIsOpen }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'হ্যালো! আমি আপনার ২৪/৭ এআই গাইড। আপনার কোন প্রশ্ন থাকলে আমাকে বলতে পারেন আমার সাথে সরাসরি চ্যাট করতে পারেন অথবা নিচের যেকোনো সাজেস্টেড প্রশ্নে ক্লিক করুন।',
      role: 'assistant',
    }
  ]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = ({ input, attachments }: { input: string; attachments: Attachment[] }) => {
    if (!input.trim() && attachments.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      attachments: attachments,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(input),
        role: 'assistant',
      };
      setMessages((prev) => [...prev, responseMessage]);
      setIsGenerating(false);
    }, 1500);
  };

  const getBotResponse = (input: string) => {
    const text = input.toLowerCase();
    
    // Exact & context matching for suggested questions & other typical user problems.
    if (text.includes('password') || text.includes('পাসওয়ার্ড') || text.includes('আনলক')) {
      return 'পিডিএফ ফাইলের পাসওয়ার্ড রিমুভ করার জন্য আপনি "প্রটেকশন ও আনলক" ক্যাটাগরি থেকে "Unlock PDF" টুলটি ব্যবহার করতে পারেন। এটি ক্লিক করে ফাইল সিলেক্ট করুন এবং পাসওয়ার্ড প্রদান নিশ্চিত করে আনলক কপি সেভ করুন!';
    }
    if (text.includes('merge') || text.includes('মার্জ') || text.includes('জোড়') || text.includes('ফাইল জোড়া')) {
      return 'আমাদের স্পেশাল "Merge PDF (মার্জ)" টুলটি ব্যবহারের মাধ্যমে আপনি একাধিক পিডিএফ এক ক্লিকেই এক ফাইলে জোড়া দিতে পারেন। এটি একটি Pro ফিচার, যা আপনার দৈনন্দিন ফাইল সাজানোর সময় দারুণভাবে বাঁচাবে।';
    }
    if (text.includes('conver') || text.includes('কনভার্ট') || text.includes('রূপান্তর') || text.includes('jpg to pdf') || text.includes('image to')) {
      return 'পিডিএফ রূপান্তরের জন্য প্রধান মেনুর "কনভার্সন টুলস" ক্যাটাগরি ব্যবহার করতে পারেন। উদাহরণস্বরূপ: আপনি "Image to PDF" ব্যবহার করে যেকোনো ছবিকে ইনস্ট্যান্টলি পিডিএফে কনভার্ট করতে পারবেন।';
    }
    if (text.includes('signature') || text.includes('সিগনেচার') || text.includes('verify') || text.includes('সাইন') || text.includes('যাচাই')) {
      return 'আমাদের "Verify Signature" টুল অত্যন্ত শক্তিশালী! এখানে আপনি ডিজিটাল সিগনেচার যুক্ত পিডিএফ সাবমিট করলে এটি সিগনেচার নিখুঁতভাবে যাচাই করার সাথে সাথে পিডিএফ ফাইলের ড্রাফটের ওপর একটি সুন্দর সবুজ রঙের "রাইট (✔)" চিহ্ন বা ভেরিফায়েড সিল যুক্ত করে নতুন ফাইল ডাউনলোডের সুযোগ দেয়!';
    }
    if (text.includes('upgrade') || text.includes('আপগ্রেড') || text.includes('প্রো') || text.includes('pro') || text.includes('payment') || text.includes('পেমেন্ট') || text.includes('টাকা') || text.includes('রিচার্জ')) {
      return 'আমাদের Pro মেম্বারশিপে আপগ্রেড করা অত্যন্ত সহজ! অনুগ্রহ করে স্ক্রিনের উপরের "Upgrade" বাটনে যান বা "Settings" পেইজ ভিজিট করুন। সেখানে উল্লিখিত UPI পেমেন্ট ডিটেইলস অনুযায়ী পেমেন্ট করে সফল লেনদেনের পর Transaction ID দিয়ে আপগ্রেড রিকোয়েস্ট জমা দিলেই অ্যাডমিন এটি ইনস্ট্যান্ট বা দ্রুত যাচাই করে আপনার প্রো প্ল্যান সক্রিয় করে দেবে।';
    }
    if (text.includes('guest') || text.includes('গেস্ট') || text.includes('লিমিট') || text.includes('limit') || text.includes('ফ্রি') || text.includes('free')) {
      return 'গেস্ট বা অতিথি ব্যবহারকারি হিসেবে আপনি প্রতিদিন নির্দিষ্ট সীমা (সাধারণত ২টি ফাইল) পর্যন্ত ফাইল প্রসেস করতে পারবেন। আপনার দৈনন্দিন লিমিটেশনস বাড়াতে আপনি একদম বিনামূল্যে একটি সাধারণ ফ্রি অ্যাকাউন্ট খুলতে পারেন বা আনলিমিটেড প্রিমিয়াম ব্যবহারের জন্য Pro অ্যাকাউন্ট এক্সেস সংগ্রহ করতে পারেন।';
    }
    if (text.includes('দাগ') || text.includes('খতিয়ান') || text.includes('রিনেম') || text.includes('rename') || text.includes('auto')) {
      return 'ধন্যবাদ! আমাদের আল্ট্রা-স্মার্ট "Auto-Rename" টুলটি পিডিএফ স্ক্যান করে স্বয়ংক্রিয়ভাবে ভেতরের ভূমি তথ্য, দাগ নম্বর বা প্লট নম্বর নিখুঁত উপায়ে ডিটেক্ট করে সুন্দর নাম বানিয়ে দেয়। এর ফলে খতিয়ান বা দলিল খোঁজা অনেক সহজ হয়।';
    }
    if (text.includes('হিস্ট্রি') || text.includes('ইতিহাস') || text.includes('history')) {
      return 'লগইন করা ইউজারদের জন্য আমাদের "হিস্ট্রি (History)" পেইজে সকল পুরাতন কাজের রেকর্ড দেখতে পাওয়া যায়। এটি আপনার কাজের ধারাবাহিকতা এবং পূর্ববর্তী ফাইল ট্র্যাকিং এ সাহায্য করবে!';
    }
    return 'আমি আপনার সাহায্যকারী এআই গাইড! আপনার যেকোনো সমস্যা (যেমন: পেমেন্ট পদ্ধতি, প্রো মেম্বারশিপ, সাইন ভেরিফাই করা, রিনেম কিংবা পিডিএফ মার্জ করা) সম্পর্কে আমাকে প্রশ্ন করতে পারেন; আমি আপনাকে সঠিক সমাধানের দিকে পয়েন্ট করে দেব।';
  };

  return (
    <>
      {/* Floating button removed from here, as it is now coordinates from AppLayout.tsx in a professional dock */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed bottom-6 right-4 sm:right-6 lg:right-10 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800"
            id="ai-chat-popup-window"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
              <div className="flex items-center gap-3 relative">
                <div className="w-10 h-10 bg-white/11 rounded-full flex items-center justify-center relative border border-white/10">
                   <Bot size={20} className="text-white" />
                   <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bold font-bn text-base leading-tight">এআই সাহায্যকারী</h3>
                  <p className="text-xs text-blue-100 font-bn">সবসময় অন-লাইন</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                 <button 
                  onClick={() => setMessages(messages.slice(0, 1))} 
                  className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="চ্যাট ক্লিয়ার করুন"
                  id="btn-clear-chat"
                 >
                   <Trash2 size={16} />
                 </button>
                 <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  id="btn-close-chat"
                 >
                   <X size={18} />
                 </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50 dark:bg-slate-950/80 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-slate-100 dark:border-slate-800'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-1">
                         {msg.attachments.map((att, i) => (
                           <div key={i} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 w-32 h-24 shadow-sm bg-white dark:bg-slate-900">
                              {att.contentType.startsWith('image/') ? (
                                <img src={att.url} alt="attachment" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 font-bn">
                                  {att.name.split('.').pop()?.toUpperCase()} ফাইল
                                </div>
                              )}
                           </div>
                         ))}
                      </div>
                    )}
                    {msg.content && (
                      <div
                        className={`p-3 rounded-2xl text-[14px] font-bn leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-800/80 rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pre-suggested questions inside empty state (when messages length is 1) */}
              {messages.length === 1 && !isGenerating && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 ml-11 max-w-[85%]"
                  id="suggested-questions-panel"
                >
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bn mb-3.5 flex items-center gap-1.5 uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                    কুইক কোশ্চেন (যেকোনো একটি ক্লিক করুন):
                  </p>
                  <div className="flex flex-col gap-2.5">
                    {SUGGESTED_QUESTIONS.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage({ input: item.text, attachments: [] })}
                        className="w-full text-left p-3 text-xs sm:text-sm font-semibold font-bn text-slate-700 dark:text-slate-200 bg-white hover:bg-blue-50/40 dark:bg-slate-900 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl transition-all shadow-sm active:scale-[0.98] flex items-center gap-2.5 cursor-pointer hover:shadow-md"
                        id={`btn-suggest-${index}`}
                      >
                        <span className="text-base leading-none shrink-0">{item.icon}</span>
                        <span className="flex-1 leading-snug">{item.text}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {isGenerating && (
                 <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-sm">
                       <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce"></span>
                       <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                       <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80">
               <MultimodalInput
                  chatId="global"
                  messages={messages}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  onSendMessage={handleSendMessage}
                  onStopGenerating={() => setIsGenerating(false)}
                  isGenerating={isGenerating}
                  canSend={true}
                  selectedVisibilityType="private"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
