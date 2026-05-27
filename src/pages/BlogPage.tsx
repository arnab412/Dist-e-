import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { AppLayout } from '../components/layout/AppLayout';
import { motion } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        setPosts(data.filter(post => post.status === 'published'));
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <AppLayout>
      <SEO 
        title="ব্লগ - পিডিএফ টুলবক্স" 
        description="পিডিএফ টুলস এবং বিভিন্ন প্রযুক্তি সংক্রান্ত লেটেস্ট টিউটোরিয়াল ও আর্টিকেল পড়ুন পিডিএফ টুলবক্স ব্লগে।" 
        pathname="/blog"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 font-bn mb-4">
            আমাদের ব্লগ
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-bn text-lg">
            লেটেস্ট আপডেট, টিউটোরিয়াল এবং প্রয়োজনীয় তথ্য জানুন
          </p>
        </div>

        <div className="mb-10 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-2xl p-6 md:p-8 flex items-center justify-between flex-col md:flex-row gap-6 border border-slate-800 dark:border-emerald-800/30 shadow-lg relative overflow-hidden text-center md:text-left">
          <div className="relative z-10 max-w-xl">
            <h3 className="text-xl md:text-2xl font-bold text-white font-bn mb-2">
              আপনার পিডিএফ ফাইলগুলো প্রসেস করতে চান?
            </h3>
            <p className="text-slate-300 font-bn text-sm md:text-base">
              ই-ডিস্ট্রিক্ট, বাংলারভূমি কিংবা যে কোনো পিডিএফ ফাইল সহজে মার্জ ও কমপ্রেস করতে আমাদের ফ্রি টুলস ব্যবহার করুন।
            </p>
          </div>
          <Link 
            to="/"
            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-bold font-bn flex items-center gap-2 transition-colors relative z-10"
          >
            টুলস ব্যবহার করুন
            <ArrowRight size={18} />
          </Link>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 font-bn text-lg">কোনো পোস্ট পাওয়া যায়নি।</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={post.id}
              >
                <Link to={`/blog/${post.slug}`} className="block group">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all duration-300">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-bn mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 font-bn line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 font-bn">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-emerald-500" />
                          {post.authorName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-emerald-500" />
                          {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                            year: 'numeric', month: 'long', day: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 group-hover:gap-3 transition-all font-bn">
                        পড়ুন <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
