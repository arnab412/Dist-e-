import React from 'react';
import { motion } from "framer-motion";

// --- Types ---
interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

// --- Data ---
const testimonials: Testimonial[] = [
  {
    text: "এই টুলবক্সটি আমার প্রতিদিনের কাজের ধরন বদলে দিয়েছে। একসাথে অনেকগুলো পিডিএফ রিনেম করা এখন মাত্র কয়েক সেকেন্ডের ব্যাপার।",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "অদিতি রায়",
    role: "গ্রাফিক্স ডিজাইনার",
  },
  {
    text: "আমি আগে অনেক টুল ব্যবহার করেছি কিন্তু এটার মত এত সহজ ইন্টারফেস কোথাও পাইনি। খুব দ্রুত কাজ হয় এবং কোনো কোয়ালিটি লস হয় না।",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "রাজীব চ্যাটার্জী",
    role: "ডাটা এন্ট্রি স্পেশালিস্ট",
  },
  {
    text: "পিডিএফ লক বা আনলক করা এখন আমার কাছে জলের মত সোজা। সবচেয়ে ভালো দিক হলো ফাইলগুলোর নিরাপত্তা বজায় থাকে।",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "স্নেহা দাস",
    role: "অ্যাসিস্ট্যান্ট ম্যানেজার",
  },
  {
    text: "এই টুলটি ফ্রিতে এত ফিচার দিচ্ছে যা অন্যান্য পেইড টুলেও পাওয়া যায় না। বিশেষ করে মার্জ এবং স্প্লিট অপশনটা দারুণ।",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "অমিত সেন",
    role: "প্রজেক্ট কো-অর্ডিনেটর",
  },
  {
    text: "যেকোনো ব্রাউজার থেকে খুব সহজেই ব্যবহার করা যায়। বড় সাইজের ফাইল খুব দ্রত প্রসেস হয়, যা আমাকে অনেক সময় বাঁচায়।",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "পায়েল মিত্র",
    role: "শিক্ষক",
  },
  {
    text: "অফিসের কাজের জন্য প্রতিদিন আমাকে পিডিএফ কনভার্ট করতে হয়। এর থেকে নির্ভরযোগ্য এবং ফাস্ট কোনো ওয়েবসাইট আমি দেখিনি।",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "সায়ন ঘোষ",
    role: "কর্পোরেট এক্সিকিউটিভ",
  },
  {
    text: "সার্টিফিকেট বা সিগনেচার ভেরিফাই করার জন্য এটি সেরা একটি উপায়। ক্লায়েন্টদের ডকুমেন্ট চেক করা এখন একদম নিশ্চিন্ত ব্যাপার।",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "অরিন্দম সাহা",
    role: "ফ্রিল্যান্সার",
  },
  {
    text: "কনভার্সনের পর টেক্সট বা ছবির কোনো সমস্যা হয় না। আমার সকল দরকারি ফাইলের জন্য এটাই এখন একমাত্র পছন্দ।",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "তনুশ্রী বোস",
    role: "কন্টেন্ট ক্রিয়েটর",
  },
  {
    text: "কাস্টমার সাপোর্ট খুবই ভালো, একবার একটা সমস্যা হয়েছিল, সাথে সাথে সমাধান করে দিয়েছে। অসাধারন একটি টুলস।",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "রাহুল মজুমদার",
    role: "আইটি সাপোর্ট",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

// --- Sub-Components ---
const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-transparent transition-colors duration-300 list-none m-0 p-0"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li 
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? "true" : "false"}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  whileFocus={{ 
                    scale: 1.03,
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    transition: { type: "spring", stiffness: 400, damping: 17 }
                  }}
                  className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-lg shadow-black/5 max-w-xs w-full bg-white dark:bg-slate-800 transition-all duration-300 cursor-default select-none group focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-bn" 
                >
                  <blockquote className="m-0 p-0">
                    <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal m-0 transition-colors duration-300 text-lg">
                      {text}
                    </p>
                    <footer className="flex items-center gap-3 mt-6">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-neutral-100 dark:ring-neutral-700 group-hover:ring-blue-500/30 transition-all duration-300 ease-in-out"
                      />
                      <div className="flex flex-col">
                        <cite className="font-bold not-italic tracking-tight leading-5 text-neutral-900 dark:text-white transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="text-sm leading-5 tracking-tight text-neutral-500 dark:text-neutral-400 mt-0.5 transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section 
      aria-labelledby="testimonials-heading"
      className="bg-transparent py-24 relative overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 }
        }}
        className="container px-4 z-10 mx-auto"
      >
        <div className="flex flex-col items-center justify-center max-w-[640px] mx-auto mb-16 font-bn">
          <div className="flex justify-center">
            <div className="border border-neutral-300 dark:border-neutral-700 py-1 px-4 rounded-full text-sm font-bold tracking-wide text-neutral-600 dark:text-neutral-400 bg-neutral-100/50 dark:bg-neutral-800/50 transition-colors">
              ব্যবহারকারীদের মতামত
            </div>
          </div>

          <h2 id="testimonials-heading" className="text-4xl md:text-5xl font-bold tracking-tight mt-6 text-center text-neutral-900 dark:text-white transition-colors">
            আমাদের ইউজাররা যা বলেন
          </h2>
          <p className="text-center mt-5 text-neutral-500 dark:text-neutral-400 text-xl leading-relaxed max-w-sm transition-colors">
            হাজারো মানুষ তাদের দৈনন্দিন কাজকে সহজ করতে আমাদের পিডিএফ টুলস ব্যবহার করছেন।
          </p>
        </div>

        <div 
          className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[740px] overflow-hidden"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  );
};
