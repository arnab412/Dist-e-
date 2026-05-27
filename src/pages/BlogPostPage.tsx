import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { BlogPost } from '../types';
import { SEO } from '../components/SEO';
import { AppLayout } from '../components/layout/AppLayout';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        const q = query(collection(db, 'posts'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          setPost({ id: doc.id, ...doc.data() } as BlogPost);
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-20 min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (!post) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-bn mb-4">
            পোস্টটি পাওয়া যায়নি
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-bn text-lg">
            আপনি যে পোস্টটি খুঁজছেন তা মুছে ফেলা হয়েছে অথবা লিংকটি ভুল।
          </p>
          <button 
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold font-bn transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
            ব্লগে ফিরে যান
          </button>
        </div>
      </AppLayout>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <AppLayout>
      <SEO 
        title={post.seoTitle || `${post.title} - পিডিএফ টুলবক্স`}
        description={post.seoDescription || post.excerpt}
        pathname={`/blog/${post.slug}`}
        type="article"
        image={post.seoImage}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold font-bn mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          সব পোস্ট
        </button>
        
        <article className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 font-bn mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10 border-b border-slate-100 dark:border-slate-700 pb-6 text-sm font-medium text-slate-500 dark:text-slate-400 font-bn">
            <div className="flex flex-wrap items-center gap-6">
              <span className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                <User size={16} />
                {post.authorName}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                {new Date(post.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
              {post.updatedAt !== post.createdAt && (
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Updated: {new Date(post.updatedAt).toLocaleDateString('bn-BD')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Share2 size={14} /> Share
              </span>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#1877F2] hover:text-white transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#1DA1F2] hover:text-white transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter size={16} />
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2] hover:text-white transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </div>
          
          {post.seoImage && (
            <div className="mb-8 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm max-h-[450px] bg-slate-50 dark:bg-slate-900 flex justify-center items-center">
              <img 
                src={post.seoImage} 
                alt={post.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full max-h-[450px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="prose prose-slate dark:prose-invert prose-emerald max-w-none font-bn text-lg leading-relaxed
            prose-headings:font-bold prose-a:text-emerald-600 hover:prose-a:text-emerald-500 prose-img:rounded-xl">
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>
        </article>

        <div className="mt-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 md:p-10 text-white text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold font-bn mb-4">
              আপনার পিডিএফ ফাইলগুলো প্রসেস করতে চান?
            </h3>
            <p className="text-emerald-50 text-lg font-bn mb-8 max-w-2xl mx-auto">
              ই-ডিস্ট্রিক্ট, বাংলারভূমি কিংবা যে কোনো পিডিএফ ফাইল মার্জ ও কমপ্রেস করতে আমাদের সম্পূর্ণ ফ্রি টুলস ব্যবহার করুন। 
            </p>
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-8 py-3 rounded-xl font-bold font-bn text-lg transition-colors shadow-sm"
            >
              টুলস ব্যবহার করুন
              <ArrowLeft className="rotate-180" size={20} />
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full border-[30px] border-white/10" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 rounded-full border-[20px] border-white/10" />
        </div>
      </div>
    </AppLayout>
  );
}
