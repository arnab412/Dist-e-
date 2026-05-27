import * as React from "react";
import { cn } from "../../lib/utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export interface Feature {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  href: string;
}

export interface FeatureGridProps {
  features: Feature[];
  className?: string;
}

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <a
    href={feature.href}
    className={cn(
      "group",
      "flex flex-col sm:flex-row items-center sm:items-start gap-6",
      "p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800",
      "bg-white dark:bg-slate-900",
      "transition-all duration-300",
      "hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    )}
  >
    <div className="flex-shrink-0 bg-blue-50/50 dark:bg-slate-800/50 p-4 rounded-2xl ring-1 ring-slate-100 dark:ring-slate-800">
      <img 
        src={feature.imageSrc} 
        alt={feature.imageAlt}
        className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    
    <div className="flex flex-1 flex-col h-full font-bn text-center sm:text-left mt-2 sm:mt-0">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
          {feature.title}
        </h3>
        <p className="text-[17px] text-slate-600 dark:text-slate-400 leading-relaxed">
          {feature.description}
        </p>
      </div>
      <div className="flex justify-center sm:justify-start mt-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold">
          <span>ব্যবহার করুন</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  </a>
);

export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ features, className }, ref) => {
    if (!features || features.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2",
          className
        )}
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
    );
  }
);
FeatureGrid.displayName = "FeatureGrid";

// Demo Component Populated with Our Data
const appFeatures: Feature[] = [
  {
    imageSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Tiger%20Face.png",
    imageAlt: "PDF Merge Cartoon Tiger",
    title: "পিডিএফ মার্জ",
    description: "একাধিক পিডিএফ বা দাগ/খতিয়ানের রেকর্ড একসাথে জুড়ে একটি কমপ্লিট ফাইলে পরিণত করুন মাত্র কয়েক সেকেন্ডে। প্রিন্ট করা হবে এখন আরো সহজ।",
    href: "#",
  },
  {
    imageSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Tiger.png",
    imageAlt: "Image to PDF Cartoon Tiger",
    title: "ছবি থেকে পিডিএফ",
    description: "আপনার মোবাইলে তোলা ছবি, জেপিজি (JPG) বা পিএনজি (PNG) ফাইল দিয়ে মুহুর্তের মধ্যে তৈরি করুন প্রফেশনাল পিডিএফ ডকুমেন্ট।",
    href: "#",
  },
  {
    imageSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bug.png",
    imageAlt: "PDF Protect Cartoon Bug",
    title: "পিডিএফ প্রটেক্ট ও আনলক",
    description: "জরুরী ফাইলে পাসওয়ার্ড যুক্ত করে সুরক্ষিত রাখুন। অথবা পাসওয়ার্ড জানা থাকা ফাইলকে চিরতরে আনলক করে ফেলুন খুব সহজেই।",
    href: "#",
  },
  {
    imageSrc: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Lion.png",
    imageAlt: "Sign & Verify Cartoon Lion",
    title: "সিগনেচার ভেরিফিকেশন",
    description: "ই-পর্চা বা ডিজিটাল সাইন করা সরকারি ডকুমেন্টের সিগনেচার নিমিষেই যাচাই করুন এবং সবুজ টিকমার্ক (✔) যুক্ত ভেরিফাইড কপি ডাউনলোড করুন।",
    href: "#",
  },
];

export const FeatureGridDemo = () => {
  return (
    <div className="w-full mx-auto py-16">
      <div className="mb-14 text-center font-bn flex flex-col items-center">
        <div className="border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-6">
          অল-ইন-ওয়ান টুলবক্স (All-in-One Toolbox)
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl leading-tight">
          পিডিএফ রিলেটেড যেকোনো কাজ<br/>এখন এক প্লাটফর্মেই
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
          আপনার মূল্যবান সময় বাঁচাতে আমাদের স্মার্ট ফিচারগুলো ব্যবহার করুন। যেকোনো পিডিএফ দ্রুত এবং সুরক্ষিতভাবে এডিট করার দারুণ অভিজ্ঞতা।
        </p>
      </div>
      
      <FeatureGrid features={appFeatures} />
    </div>
  );
};
