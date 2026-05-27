import React from 'react';
import { Mail, Shield, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../ui/LogoIcon';

export function Footer() {
  const { settings } = useAuth();
  const supportEmail = settings?.supportEmail || 'support@pdftoolbox.bd';

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 py-16 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Section */}
          <div className="md:col-span-5 lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <LogoIcon size={36} className="shrink-0 drop-shadow-md" />
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white font-bn tracking-tight">পিডিএফ<span className="text-red-500">টুলবক্স</span></h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-bn text-[17px] leading-relaxed max-w-md">
              অফিসিয়াল এবং ব্যক্তিগত কাজে পিডিএফ ফাইলের ঝামেলা এড়াতে আমাদের স্মার্ট টুলবক্স ব্যবহার করুন। কম্প্রেস, কনভার্ট, এবং সিকিউরিটি সবকিছু এখন এক জায়গায়।
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-2 rounded-full border border-emerald-200 dark:border-emerald-900 font-bn">
                <Shield size={16} />
                100% নিরাপদ এবং সুরক্ষিত
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 lg:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-bold font-bn text-xl mb-6">গুরুত্বপূর্ণ লিংকসমূহ</h3>
            <ul className="space-y-4 font-bn text-[17px] text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  হোম পেইজ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  ব্লগ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                  সাধারণ জিজ্ঞাসা
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Support */}
          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="text-slate-900 dark:text-white font-bold font-bn text-xl mb-6">আমাদের সাথে যোগাযোগ করুন</h3>
            <div className="flex flex-col gap-5">
              <a href={`mailto:${supportEmail}`} className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="p-3 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                  <Mail size={20} />
                </div>
                <div className="font-bn">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-0.5">ইমেইল</p>
                  <p className="font-bold text-slate-900 dark:text-white tracking-wide">{supportEmail}</p>
                </div>
              </a>
              <div className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Zap size={20} />
                </div>
                <div className="font-bn">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-0.5">সাপোর্ট</p>
                  <p className="font-bold text-slate-900 dark:text-white tracking-wide">24/7 লাইভ চ্যাট সাপোর্ট</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 font-bn text-[15px] text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} পিডিএফ টুলবক্স। সর্বস্বত্ব সংরক্ষিত。</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
