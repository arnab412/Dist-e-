"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  FileText,
  Layers,
  Shield,
  Image as ImageIcon,
  PenTool,
  CheckCircle,
  FileSignature,
  Award,
  Users,
  Settings,
  Sparkles,
  Star,
  ArrowRight,
  Zap,
  TrendingUp,
} from "lucide-react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"

export default function AboutUsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.1 })

  // Parallax effect for decorative elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50])
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 20])
  const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -20])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  const services = [
    {
      icon: <FileText className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "অটো রিনেম",
      description:
        "একাধিক পিডিএফ ফাইলের নাম একসাথে পরিবর্তন করার সহজ সমাধান। এক ক্লিকে সিরিয়াল অনুযায়ী ফাইলগুলোর নাম আপডেট করুন।",
      position: "left",
    },
    {
      icon: <Layers className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "মার্জ ও স্প্লিট",
      description:
        "একাধিক পিডিএফ ফাইল একসাথে যুক্ত করুন কিংবা বড় পিডিএফ থেকে প্রয়োজনীয় পেইজগুলো আলাদা করে নিন খুব সহজেই।",
      position: "left",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "প্রটেকশন ও আনলক",
      description:
        "আপনার গোপনীয় ডকুমেন্টগুলোতে পাসওয়ার্ড দিয়ে সুরক্ষিত রাখুন অথবা দরকারি ফাইলের পাসওয়ার্ড সরিয়ে ফেলুন।",
      position: "left",
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      secondaryIcon: <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "কনভার্সন টুলস",
      description:
        "পিডিএফ থেকে ছবি বা ছবি থেকে পিডিএফে কনভার্ট করুন কোনো প্রকার কোয়ালিটি লস ছাড়াই, দ্রুত এবং নিরাপদে।",
      position: "right",
    },
    {
      icon: <FileSignature className="w-6 h-6" />,
      secondaryIcon: <CheckCircle className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "সিগনেচার ভেরিফিকেশন",
      description:
        "আপনার ডিজিটাল ডকুমেন্টের সোর্স ও সত্যতা যাচাই করতে পিডিএফে থাকা ডিজিটাল সিগনেচার চেক করুন নিমিষেই।",
      position: "right",
    },
    {
      icon: <Settings className="w-6 h-6" />,
      secondaryIcon: <Star className="w-4 h-4 absolute -top-1 -right-1 text-[#A9BBC8]" />,
      title: "কাস্টম টুলস",
      description:
        "পিডিএফ ফাইলে কাস্টম ওয়াটারমার্ক যুক্ত করা থেকে শুরু করে কম্প্রেস করা- সব ধরনের প্রয়োজনীয় টুলস একসাথে।",
      position: "right",
    },
  ]

  const stats = [
    { icon: <Award />, value: 1500, label: "সফল কনভার্সন", suffix: "+" },
    { icon: <Users />, value: 500, label: "সন্তুষ্ট ব্যবহারকারী", suffix: "+" },
    { icon: <Settings />, value: 10, label: "স্মার্ট টুলস", suffix: "+" },
    { icon: <TrendingUp />, value: 99, label: "সাকসেস রেট", suffix: "%" },
  ]

  return (
    <section
      id="about-section"
      ref={sectionRef}
      className="w-full py-24 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden relative transition-colors duration-300"
    >
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-600/5 dark:bg-blue-500/10 blur-3xl"
        style={{ y: y1, rotate: rotate1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-emerald-600/5 dark:bg-emerald-500/10 blur-3xl"
        style={{ y: y2, rotate: rotate2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-blue-600/30 dark:bg-blue-500/30"
        animate={{
          y: [0, -15, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-6 h-6 rounded-full bg-emerald-600/30 dark:bg-emerald-500/30"
        animate={{
          y: [0, 20, 0],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <motion.div
        className="container mx-auto max-w-6xl relative z-10"
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
      >
        <motion.div className="flex flex-col items-center mb-6" variants={itemVariants}>
          <motion.span
            className="text-blue-600 dark:text-blue-400 font-medium mb-2 flex items-center gap-2 font-bn"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Zap className="w-4 h-4" />
            পিডিএফ টুলবক্স
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center font-bn text-slate-900 dark:text-white">আমাদের সম্পর্কে</h2>
          <motion.div
            className="w-24 h-1 bg-blue-600 dark:bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </motion.div>

        <motion.p className="text-center max-w-2xl mx-auto mb-16 text-slate-600 dark:text-slate-400 font-bn text-lg" variants={itemVariants}>
          আমরা একটি আধুনিক ও নিরাপদ পিডিএফ টুলবক্স তৈরি করেছি যা আপনার প্রাত্যহিক কাজগুলোকে আরও সহজ ও দ্রুত করতে সাহায্য করে। পিডিএফ রিনেম, স্প্লিট, মার্জ, এবং কনভার্ট করার মত জটিল কাজগুলো এখন মাত্র কয়েক ক্লিকেই সম্ভব।
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Left Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "left")
              .map((service, index) => (
                <ServiceItem
                  key={`left-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="left"
                />
              ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-center order-first md:order-none mb-8 md:mb-0">
            <motion.div className="relative w-full max-w-xs" variants={itemVariants}>
              <motion.div
                className="rounded-md overflow-hidden shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <img
                  src="https://images.unsplash.com/photo-1618044733300-9472054094ee?q=80&w=2671&auto=format&fit=crop"
                  alt="Modern PDF Tools Workspace"
                  className="w-full h-full object-cover"
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-slate-900/80 dark:from-slate-950/80 to-transparent flex items-end justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                >
                  <motion.button
                    className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold font-bn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/'}
                  >
                    সব টুলস এক্সপ্লোর করুন <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
              <motion.div
                className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-md -m-3 z-[-1]"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              ></motion.div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-8 w-16 h-16 rounded-full bg-blue-600/10 dark:bg-blue-500/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.9 }}
                style={{ y: y1 }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-6 -left-10 w-20 h-20 rounded-full bg-emerald-600/15 dark:bg-emerald-500/20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.1 }}
                style={{ y: y2 }}
              ></motion.div>

              {/* Additional decorative elements */}
              <motion.div
                className="absolute -top-10 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500"
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
              <motion.div
                className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500"
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              ></motion.div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-16">
            {services
              .filter((service) => service.position === "right")
              .map((service, index) => (
                <ServiceItem
                  key={`right-${index}`}
                  icon={service.icon}
                  secondaryIcon={service.secondaryIcon}
                  title={service.title}
                  description={service.description}
                  variants={itemVariants}
                  delay={index * 0.2}
                  direction="right"
                />
              ))}
          </div>
        </div>

        {/* Stats Section */}
        <motion.div
          ref={statsRef}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate={isStatsInView ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <StatCounter
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={index * 0.1}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-20 bg-slate-900 border border-slate-800 dark:border-slate-700 text-white p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex-1 font-bn">
            <h3 className="text-3xl font-bold mb-2">আপনার পিডিএফের কাজগুলো আরও সহজ করতে চান?</h3>
            <p className="text-slate-300 text-lg">আজই আমাদের টুলসগুলো ব্যবহার করে দেখুন সম্পূর্ণ বিনামূল্যে।</p>
          </div>
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold font-bn transition-colors shadow-lg shadow-blue-900/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/'}
          >
            শুরু করুন <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface ServiceItemProps {
  icon: React.ReactNode
  secondaryIcon?: React.ReactNode
  title: string
  description: string
  variants: any
  delay: number
  direction: "left" | "right"
}

function ServiceItem({ icon, secondaryIcon, title, description, variants, delay, direction }: ServiceItemProps) {
  return (
    <motion.div
      className="flex flex-col group"
      variants={variants}
      transition={{ delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="flex items-center gap-3 mb-3"
        initial={{ x: direction === "left" ? -20 : 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.2 }}
      >
        <motion.div
          className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl transition-colors duration-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 relative"
          whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
        >
          {icon}
          {secondaryIcon}
        </motion.div>
        <h3 className="text-xl font-bold font-bn text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {title}
        </h3>
      </motion.div>
      <motion.p
        className="text-[17px] font-bn text-slate-600 dark:text-slate-400 leading-relaxed pl-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: delay + 0.4 }}
      >
        {description}
      </motion.p>
      <motion.div
        className="mt-3 pl-14 flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0 }}
      >
        <span className="flex items-center gap-1 font-bn">
          বিস্তারিত জানুন <ArrowRight className="w-3 h-3" />
        </span>
      </motion.div>
    </motion.div>
  )
}

interface StatCounterProps {
  icon: React.ReactNode
  value: number
  label: string
  suffix: string
  delay: number
}

function StatCounter({ icon, value, label, suffix, delay }: StatCounterProps) {
  const countRef = useRef(null)
  const isInView = useInView(countRef, { once: false })
  const [hasAnimated, setHasAnimated] = useState(false)

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 10,
  })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      springValue.set(value)
      setHasAnimated(true)
    } else if (!isInView && hasAnimated) {
      springValue.set(0)
      setHasAnimated(false)
    }
  }, [isInView, value, springValue, hasAnimated])

  const displayValue = useTransform(springValue, (latest) => Math.floor(latest))

  return (
    <motion.div
      className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center text-center group hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 border border-slate-200/50 dark:border-slate-800/50 hover:shadow-xl hover:shadow-blue-900/5"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay },
        },
      } as any}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors duration-300"
        whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
      >
        {icon}
      </motion.div>
      <motion.div ref={countRef} className="text-4xl font-bold font-bn text-slate-900 dark:text-white flex items-center gap-0.5">
        <motion.span>{displayValue}</motion.span>
        <span className="text-blue-600 dark:text-blue-400">{suffix}</span>
      </motion.div>
      <p className="text-slate-600 dark:text-slate-400 text-lg font-bn mt-2">{label}</p>
      <motion.div className="w-10 h-1 bg-blue-600 dark:bg-blue-500 rounded-full mt-4 group-hover:w-16 transition-all duration-300 opacity-50 group-hover:opacity-100" />
    </motion.div>
  )
}
