import React from 'react';
import AboutUsSection from '../components/ui/about-us-section';
import TestimonialsSection from '../components/ui/testimonial-v2';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AboutUsSection />
      <div className="bg-[#f8f8f2] dark:bg-slate-950 -mt-10">
        <TestimonialsSection />
      </div>
    </div>
  );
}
