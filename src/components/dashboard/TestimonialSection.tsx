import React from 'react';
import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    text: "এই টুলগুলো ব্যবহার করে আমাদের অফিসের ঘণ্টার পর ঘণ্টার কাজ এখন কয়েক মিনিটেই হয়ে যায়। বিশেষ করে অটো রিনেম এবং স্প্লিট টুল অসাধারণ!",
    name: "অর্ণব সেন",
    role: "অফিস এক্সিকিউটিভ",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    text: "পিডিএফ থেকে ওয়ার্ড কনভার্সন এতো নিখুঁতভাবে হয় যা আগে কোনো ফ্রি টুলে দেখিনি। সাইটের ডিজাইন অনেক সুন্দর আর ফাস্ট।",
    name: "অদিতি দাস",
    role: "ডাটা এন্ট্রি অপারেটর",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    text: "ডিজিটাল সিগনেচার ভেরিফিকেশন এবং পিডিএফ প্রটেক্ট টুলের সাহায্যে এখন সিকিউরিটির কোনো চিন্তা নেই। প্রতিটি টুলই খুব দরকারী।",
    name: "রোহিত পাল",
    role: "অ্যাডমিন অফিসার",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?img=14"
  }
];

export function TestimonialSection() {
  return (
    <section className="py-16 mt-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 font-bn tracking-tight">
          ব্যবহারকারীদের মতামত
        </h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400 font-bn text-lg">
          আমাদের টুলগুলো তাদের দৈনন্দিন কাজে কীভাবে সাহায্য করছে, জেনে নিন।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {testimonials.map((t, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className="relative bg-white dark:bg-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300"
            style={{
              // Asymmetric / Squircle shapes (no perfect squares or circles)
              borderRadius: idx % 2 === 0 ? '2rem 1rem 3rem 1rem' : '1rem 3rem 1rem 2rem'
            }}
          >
            <div className="absolute top-6 right-6 text-slate-100 dark:text-slate-700/50">
              <Quote size={48} className="rotate-180" />
            </div>
            
            <div className="flex items-center gap-1 mb-6">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 font-bn text-lg leading-relaxed relative z-10 mb-8 font-medium">
              "{t.text}"
            </p>
            
            <div className="flex items-center gap-4 mt-auto">
              <div 
                className="w-14 h-14 overflow-hidden border-2 border-emerald-100 dark:border-emerald-900/50"
                style={{ borderRadius: '1.2rem 0.8rem 1.2rem 0.8rem' }}
              >
                <img unselectable="on" src={t.avatar} alt={t.name} className="w-full h-full object-cover select-none pointer-events-none" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 font-bn text-lg">{t.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bn font-medium">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
