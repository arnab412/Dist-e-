import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors py-12 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl md:text-5xl font-bold font-bn text-slate-900 dark:text-white mb-8">প্রাইভেসি পলিসি (Privacy Policy)</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-bn text-lg leading-relaxed space-y-6">
          <p>
            পিডিএফ টুলবক্সে আপনার স্বাগতম। এই প্রাইভেসি পলিসিতে বলা হয়েছে কীভাবে আমরা আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি। আমাদের পরিষেবাগুলো ব্যবহার করার মাধ্যমে, আপনি এই পলিসির শর্তাবলীতে সম্মতি প্রদান করছেন।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
          <p>
            আমরা শুধুমাত্র সেই তথ্যগুলোই সংগ্রহ করি যা আমাদের পরিষেবাগুলো সঠিকভাবে প্রদান করতে প্রয়োজনীয়। যেমন- অ্যাকাউন্ট তৈরি করার সময় আপনার ইমেইল এবং নাম ব্যবহার করা হতে পারে। আপলোড করা পিডিএফ ফাইলগুলো প্রসেস করার পর আমাদের সার্ভার থেকে স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">২. ফাইলের নিরাপত্তা</h2>
          <p>
            আপনার আপলোড করা ডকুমেন্টের গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। ফাইলগুলি শুধুমাত্র আপনার অনুরোধ করা কাজ (যেমন কনভার্ট, স্প্লিট বা মার্জ) সম্পাদনের জন্য ব্যবহৃত হয়। আমরা আপনার ফাইলগুলো তৃতীয় কোনো পক্ষের সাথে শেয়ার করি না।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৩. কুকিজ (Cookies)</h2>
          <p>
            আপনাকে সেরা অভিজ্ঞতা প্রদান করতে আমরা লগইন সেশন এবং সাধারণ সেটিংস মনে রাখার জন্য কুকিজ ব্যবহার করতে পারি। আপনি চাইলে আপনার ব্রাউজার সেটিংস থেকে কুকিজ বন্ধ করতে পারেন, তবে এতে ওয়েবসাইটের কিছু ফিচার কাজ নাও করতে পারে।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৪. তৃতীয় পক্ষের পরিষেবা</h2>
          <p>
            আমাদের প্ল্যাটফর্মের কিছু অংশ গুগল ফায়ারবেস (Google Firebase) এর মতো তৃতীয় পক্ষের প্রযুক্তির উপর নির্ভরশীল হতে পারে, যারা ব্যবহারকারীর লগইন প্রমাণীকরণ এবং ডাটাবেস পরিচালনা করে। তাদের নিজস্ব প্রাইভেসি পলিসিও প্রযোজ্য হবে।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">৫. নীতিমালা পরিবর্তন</h2>
          <p>
            আমরা যেকোনো সময় এই পলিসিতে পরিবর্তন আনার অধিকার রাখি। পরিবর্তন হলে তা এই পেজেই আপডেট করা হবে।
          </p>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-4">যোগাযোগ</h2>
          <p>
            এই প্রাইভেসি পলিসি নিয়ে আপনার কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করতে পারেন: support@pdftoolbox.bd
          </p>
        </div>
      </div>
    </div>
  );
}
