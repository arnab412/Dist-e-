import React from 'react';
import { FileText, AlertCircle, CheckCircle2, Building2, Map, FileBadge } from 'lucide-react';

export function PortalInfoPanel() {
  const services = [
    { title: 'Income Certificate', titleBn: 'ইনকাম সার্টিফিকেট (Income)', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Domicile Certificate', titleBn: 'ডোমিসাইল সার্টিফিকেট (Domicile)', icon: FileBadge, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Caste Certificate', titleBn: 'কাষ্ট সার্টিফিকেট (SC/ST/OBC)', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Land Records (RoR)', titleBn: 'খতিয়ান ও দাগের তথ্য', icon: Map, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'NKDA Services', titleBn: 'এন কে ডি এ সার্ভিস', icon: Building2, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col shadow-sm h-full">
      <div className="bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 font-bn text-lg leading-tight">পোর্টাল গাইডলাইন</h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Portal Services</p>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 font-bn leading-relaxed">
          ই-ডিস্ট্রিক্ট এবং বাংলারভূমি ওয়েবসাইট থেকে ডাউনলোড করা ডকুমেন্টস গুলো (যেমন: পেমেন্ট রিসিট ও সার্টিফিকেট) এই টুলের মাধ্যমে খুব সহজেই প্রসেস করতে পারবেন।
        </p>

        <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-4 font-bn">সাপোর্টেড ডকুমেন্টস তালিকা:</h4>
        <div className="space-y-4 mb-8 flex-1">
          {services.map((svc, idx) => (
            <div key={idx} className="flex items-center gap-4 group cursor-default">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${svc.bg} dark:bg-opacity-20 ${svc.color}`}>
                <svc.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 font-bn leading-tight">{svc.titleBn}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{svc.title}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-2xl p-5 mt-auto">
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 mb-2 font-bn flex items-center gap-2">
            <AlertCircle size={16} /> সি.এস.সি (CSC) ভি.এল.ই দের ক্ষেত্রে:
          </h4>
          <ul className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed font-bn space-y-2 list-disc pl-4">
            <li>পিডিএফ মার্জ টুলের সাহায্যে মূল সার্টিফিকেট এবং মানি রিসিট একসাথে মার্জ করে গ্রাহকদের দিন।</li>
            <li>রিনেম টুলের সাহায্যে এপ্লিকেশন নম্বর দিয়ে হাজার হাজার ফাইল এক ক্লিকে সেভ ও সাজিয়ে রাখুন।</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
