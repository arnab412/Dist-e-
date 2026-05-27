import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors py-12 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-5xl font-bold font-bn text-slate-900 dark:text-white mb-8">সেবার শর্তাবলী (Terms of Service)</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-bn text-lg leading-relaxed space-y-6">
          <p>
            পিডিএফ টুলবক্স ব্যবহারে আপনাকে স্বাগতম! আমাদের ওয়েবসাইট এবং টুলস ব্যবহার করার আগে দয়া করে নিম্নের শর্তাবলী মন দিয়ে পড়ুন। আমাদের ওয়েবসাইট ব্যবহার করার অর্থ হলো আপনি এই শর্তাবলীতে সম্মত হচ্ছেন।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">১. সেবা প্রদান</h2>
          <p>
            পিডিএফ টুলবক্স ব্যবহারকারীদের পিডিএফ ফাইল মার্জ, স্প্লিট, কনভার্ট, লক, এবং আনলক করার মত সুবিধা প্রদান করে। আমরা কোনো নোটিশ ছাড়াই এই ফিচারগুলোতে পরিবর্তন আনার বা নতুন সুবিধা যোগ করার অধিকার সংরক্ষণ করি।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">২. ব্যবহারকারীর দায়িত্ব</h2>
          <p>
            আমাদের প্ল্যাটফর্ম ব্যবহার করে কোনো অবৈধ কাজ করা বা বেআইনি ডকুমেন্টের আদান-প্রদান করা সম্পূর্ণ নিষিদ্ধ। আপনি নিশ্চিত করছেন যে আপনার আপলোড করা পিডিএফ ফাইলগুলি আপনার নিজস্ব অথবা এগুলো ব্যবহার করার সঠিক অনুমতি আপনার আছে।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৩. অ্যাকাউন্টের সুরক্ষা</h2>
          <p>
            আপনি যদি আমাদের পোর্টালে কোনো অ্যাকাউন্ট খুলেন, তবে তার পাসওয়ার্ড ও অন্যান্য তথ্য গোপন রাখার সম্পূর্ণ দায়িত্ব আপনার। আপনার অ্যাকাউন্ট থেকে হওয়া যেকোনো কার্যকলাপের জন্য আপনি দায়ী থাকবেন।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৪. ওয়ারেন্টি অস্বীকার (Disclaimer of Warranties)</h2>
          <p>
            আমরা সর্বোচ্চ চেষ্টা করি যাতে আমাদের সেবা সবসময় ত্রুটিমুক্ত ও নিরবচ্ছিন্ন থাকে, তবে প্রযুক্তিগত সমস্যার কারণে সাময়িক বিভ্রাট হতে পারে। আমরা কোনো ধরনের এক্সপ্রেস বা ইমপ্লায়েড ওয়ারেন্টি প্রদান করি না। আপনার ফাইলগুলো নিজ দায়িত্বে আপলোড এবং ডাউনলোড করবেন।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৫. দায়বদ্ধতার সীমাবদ্ধতা (Limitation of Liability)</h2>
          <p>
            আমাদের টুলস ব্যবহারের ফলে কোনো ডাটা হারানো, ক্ষতি হওয়া বা ব্যবসায়িক লোকসান হলে পিডিএফ টুলবক্স এর জন্য দায়বদ্ধ থাকবে না। সর্বদা নিজের গুরুত্বপূর্ণ ফাইলের ব্যাকআপ রাখবেন বলে আমরা আশা করি।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৬. শর্তাবলীর পরিবর্তন</h2>
          <p>
            আমরা প্রয়োজন অনুসারে যেকোনো সময় এই শর্তাবলীতে পরিবর্তন আনতে পারি। আপডেট করা শর্তাবলী এই পেজে প্রকাশ করা হবে।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">যোগাযোগ</h2>
          <p>
            এই টার্মস অফ সার্ভিস নিয়ে কোনো জিজ্ঞাসা থাকলে ইমেইল করুন: support@pdftoolbox.bd
          </p>
        </div>
      </div>
    </div>
  );
}
