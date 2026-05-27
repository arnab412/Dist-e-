import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { BlogPost } from '../types';
import { AppLayout } from '../components/layout/AppLayout';
import { Edit, Trash2, Plus, X, Save, Sparkles, Eye, Search, Globe, CheckCircle, HelpCircle, AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminBlogPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('draft');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoImage, setSeoImage] = useState('');

  // AI Generator States
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('informative');
  const [aiLanguage, setAiLanguage] = useState('Bengali');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long' | 'exhaustive'>('long');
  const [isGenerating, setIsGenerating] = useState(false);

  // Custom polished Centered Dialog State System (for reliable sandbox operation)
  const [dialog, setDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showCustomAlert = (titleText: string, msgText: string) => {
    setDialog({
      show: true,
      title: titleText,
      message: msgText,
      type: 'alert',
      onConfirm: () => setDialog(prev => ({ ...prev, show: false }))
    });
  };

  const showCustomConfirm = (titleText: string, msgText: string, onAgree: () => void) => {
    setDialog({
      show: true,
      title: titleText,
      message: msgText,
      type: 'confirm',
      onConfirm: () => {
        setDialog(prev => ({ ...prev, show: false }));
        onAgree();
      },
      onCancel: () => setDialog(prev => ({ ...prev, show: false }))
    });
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[];
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isAdmin) {
      fetchPosts();
    }
  }, [profile]);

  if (!profile?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setStatus('draft');
    setSeoTitle('');
    setSeoDescription('');
    setSeoImage('');
    setAiTopic('');
    setIsEditing(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setStatus(post.status);
    setSeoTitle(post.seoTitle || '');
    setSeoDescription(post.seoDescription || '');
    setSeoImage(post.seoImage || '');
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    showCustomConfirm(
      'ব্লগ পোস্ট মুছার সতর্কতা',
      'আপনি কি নিশ্চিত যে এই ব্লগ পোস্টটি ডিলেট করতে চান? (Are you sure you want to delete this post?)',
      async () => {
        try {
          await deleteDoc(doc(db, 'posts', id));
          setPosts(posts.filter(p => p.id !== id));
          await fetchPosts();
          showCustomAlert('ডিলেট সফল!', 'পোস্টটি সফলভাবে ডিলেট করা হয়েছে! (Post deleted successfully)');
        } catch (error: any) {
          console.error('Error deleting post:', error);
          showCustomAlert('ত্রুটি!', `পোস্টটি ডিলেট করতে সমস্যা হয়েছে! এরর: ${error.message || 'Firebase Database Permission Denied.'}`);
        }
      }
    );
  };

  // Dynamic SEO Score Calculation & Warnings for Google Recommended Limits
  const calculateSeoScore = () => {
    let score = 0;
    const tLength = seoTitle.trim().length || title.trim().length || 0;
    const dLength = seoDescription.trim().length || excerpt.trim().length || 0;
    const cLength = content?.trim().length || 0;

    // 1. Meta Title Score (Max 30)
    if (tLength >= 35 && tLength <= 60) {
      score += 30; // Perfect limit
    } else if (tLength > 0 && tLength <= 65) {
      score += 20; // Acceptable limit
    } else if (tLength > 65) {
      score += 10; // Exceeds limit
    }

    // 2. Meta Description Score (Max 30)
    if (dLength >= 110 && dLength <= 155) {
      score += 30; // Perfect limit
    } else if (dLength > 0 && dLength <= 160) {
      score += 20; // Acceptable limit
    } else if (dLength > 160) {
      score += 10; // Exceeds limit
    }

    // 3. Slug Score (Max 15)
    const isSlugOk = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim()) && slug.trim().length > 0;
    if (isSlugOk) {
      score += 15;
    }

    // 4. Content Structure (H2/H3 Check) (Max 10)
    const hasHeadings = /^(##|###)\s+\S+/m.test(content || '');
    if (hasHeadings) {
      score += 10;
    }

    // 5. Content Length / Word Count (Max 15)
    const words = content?.trim() ? content.trim().split(/\s+/).length : 0;
    if (words >= 350) {
      score += 15;
    } else if (words >= 150) {
      score += 8;
    } else if (words > 0) {
      score += 3;
    }

    return {
      score,
      tLength,
      dLength,
      words,
      isSlugOk,
      hasHeadings,
      titleStatus: tLength === 0 ? 'empty' : (tLength > 65 ? 'exceeded' : (tLength >= 35 && tLength <= 60 ? 'perfect' : 'warning')),
      descStatus: dLength === 0 ? 'empty' : (dLength > 160 ? 'exceeded' : (dLength >= 110 && dLength <= 155 ? 'perfect' : 'warning')),
    };
  };

  const seoInfo = calculateSeoScore();

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      return showCustomAlert('অনুরোধ', 'অনুগ্রহ করে ব্লগের মূল বিষয় বা কীওয়ার্ড টাইপ করুন।');
    }
    setIsGenerating(true);
    try {
      const resp = await fetch('/api/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: aiTopic,
          tone: aiTone,
          language: aiLanguage,
          length: aiLength
        })
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(errorText || 'Failed to connect to AI generator.');
      }
      
      const data = await resp.json();
      if (data.status === 'ok' && data.blog) {
        const b = data.blog;
        setTitle(b.title || '');
        setSlug(b.slug || '');
        setExcerpt(b.excerpt || '');
        setContent(b.content || '');
        setSeoTitle(b.seoTitle || '');
        setSeoDescription(b.seoDescription || '');
        showCustomAlert('অসাধারণ!', 'AI দিয়ে সম্পূর্ণ ব্লগ কন্টেন্ট, মেটা ট্যাগ এবং এসইও অপ্টিমাইজড স্ল্যাগ তৈরি করা হয়েছে। আপনি চাইলে নিচে এগুলি পরিবর্তন করতে পারবেন।');
      } else {
        throw new Error(data.error || 'Invalid API Response structure.');
      }
    } catch (err: any) {
      console.error(err);
      showCustomAlert('ত্রুটি!', `কন্টেন্ট জেনারেট করতে সমস্যা হয়েছে: ${err.message || err}. অনুগ্রহ করে অ্যাডমিন প্যানেলে API কী সঠিক কিনা চেক করুন।`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) return showCustomAlert('জরুরী তথ্য অনুপস্থিত', 'Title, Slug, and Content are required.');

    const postData = {
      title,
      slug,
      excerpt,
      content,
      status,
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      seoImage,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'posts', editingId), postData);
        showCustomAlert('সম্পন্ন!', 'Post updated.');
      } else {
        const newPostData = {
          ...postData,
          authorId: user?.uid,
          authorName: profile?.displayName || user?.displayName || 'Admin',
          createdAt: new Date().toISOString(),
        };
        await addDoc(collection(db, 'posts'), newPostData);
        showCustomAlert('সফল!', 'Post created and auto-added to Google XML Sitemap!');
      }
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      showCustomAlert('ত্রুটি!', 'Error saving post.');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-bn">
              Blog Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Create and manage blog posts.</p>
          </div>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition-colors"
            >
              <Plus size={18} /> Add New Post
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm space-y-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-500 animate-pulse" />
                <span>{editingId ? 'ব্লগটি এডিট করুন (Edit Post)' : 'নতুন ব্লগ পোস্ট লিখুন (Create New Post)'}</span>
              </h2>
              <button 
                type="button" 
                onClick={resetForm}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Co-Pilot Assistant Workstation */}
            <div className="bg-gradient-to-br from-emerald-50/40 via-teal-50/10 to-transparent dark:from-slate-900/40 dark:via-emerald-950/10 dark:to-transparent border border-emerald-100/70 dark:border-emerald-900/30 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 text-white p-1 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">AI কন্টেন্ট রাইটার (স্বয়ংক্রিয় SEO অপ্টিমাইজড ব্লগ)</h3>
                  <p className="text-xs text-slate-400">আপনার কীওয়ার্ড বা বিষয়ের উপর ভিত্তি করে আকর্ষক হেডিং ও বাংলা এডিট-রেডি টেক্সট লিখুন ১-ক্লিকে</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ব্লগের বিষয়বস্তু বা কিওয়ার্ডসমূহ (Topic or Keywords)</label>
                  <textarea 
                    value={aiTopic}
                    onChange={e => setAiTopic(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    rows={2}
                    placeholder="e.g., বাংলারভূমি খতিয়ান ও দাগের তথ্য জানার সঠিক নিয়ম বা How to compress PDF files to under 2MB for online portals"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">লেখার ধরণ ও টোন (Tone)</label>
                    <select
                      value={aiTone}
                      onChange={e => setAiTone(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="informative">Informative & Professional (তথ্যবহুল)</option>
                      <option value="casual">Casual & Helpful (সহজ সরল ভাষায়)</option>
                      <option value="technical">Technical Tutorial (ধাপ-ভিত্তিক টিউটোরিয়াল)</option>
                      <option value="engaging">Highly Engaging / News Hook (আকর্ষণীয় আপডেট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">ভাষা (Language)</label>
                    <select
                      value={aiLanguage}
                      onChange={e => setAiLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Bengali">Bengali (সম্পূর্ণ বাংলা ভাষায়)</option>
                      <option value="English">English (Full English)</option>
                      <option value="Mixed">Bengali & English Mixed (বাংলিশ / সাধারণ মুখের রূপ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">শব্দ সংখ্যা ও গভীরতা (Length & Word Target)</label>
                    <select
                      value={aiLength}
                      onChange={e => setAiLength(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="long">Long Guide (১০০০ - ১৫০০+ শব্দ) [Default]</option>
                      <option value="exhaustive font-semibold">Exhaustive Mega Guide (১৫০০ - ২৫০০+ শব্দ)</option>
                      <option value="medium">Medium Form (৬০০ - ৯০০ শব্দ)</option>
                      <option value="short">Short Form (৩০০ - ৫০০ শব্দ)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 px-6 rounded-xl text-xs shadow transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full mr-1" />
                        AI ব্লগ তৈরি করছে, অনুগ্রহ করে ১০-১৫ সেকেন্ড অপেক্ষা করুন...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-teal-200" />
                        AI দিয়ে ব্লগ ও মেটা লিখুন (Build content with active AI model)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Standard Fields Grid */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ব্লগ শিরোনাম (Title)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100"
                    placeholder="Post title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ইউআরএল স্ল্যাগ (URL Slug - English only)</label>
                  <input 
                    type="text" 
                    value={slug} 
                    onChange={e => setSlug(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100 font-mono text-sm"
                    placeholder="how-to-compress-pdfs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">সংক্ষিপ্ত সারমর্ম (Excerpt - Short summary for list view)</label>
                <textarea 
                  value={excerpt} 
                  onChange={e => setExcerpt(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100"
                  rows={2}
                  placeholder="Summary for the blog list page..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ব্লগ থাম্বনেইল ছবি ইউআরএল (Blog Thumbnail Image URL - Optional)</label>
                <div className="flex gap-4 items-center">
                  <div className="flex-grow">
                    <input 
                      type="url" 
                      value={seoImage} 
                      onChange={e => setSeoImage(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100 font-sans text-sm"
                      placeholder="e.g., https://example.com/wp-content/uploads/seo-blog-thumbnail.jpg"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">থাম্বনেইল ও সার্চ রেজাল্ট ইমেজ হিসেবে ব্যবহারের জন্য ছবিটির ড্রাইভ, পোস্টলার বা ক্লাউড ইউআরএল দিন।</p>
                  </div>
                  {seoImage && (
                    <div className="relative w-16 h-12 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner flex items-center justify-center">
                      <img 
                        src={seoImage} 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/100x75/0f172a/ffffff?text=Image+Error';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ব্লগের মূল কন্টেন্ট (Content - GitHub Markdown Allowed)</label>
                <textarea 
                  value={content} 
                  onChange={e => setContent(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-slate-100 font-mono text-sm shadow-inner"
                  rows={12}
                  placeholder="# Heading 1&#10;&#10;Write your markdown here..."
                  required
                />
              </div>

              {/* Advanced SEO Tool & Live Google Snippet simulator */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 md:p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Search size={16} className="text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                    SEO Optimization / Google SERP Checker
                  </h4>
                </div>

                {/* Dynamic circular SEO performance gauge and smart guidelines */}
                <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center text-center">
                    <div className="relative flex items-center justify-center">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-slate-100 dark:text-slate-800"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="38"
                          stroke={
                            seoInfo.score < 50
                              ? '#f43f5e'
                              : seoInfo.score < 80
                              ? '#f59e0b'
                              : '#10b981'
                          }
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - seoInfo.score / 100)}
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{seoInfo.score}</span>
                        <span className="text-[10px] text-slate-400 block -mt-1">/ 100</span>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">SEO স্কোর</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                        seoInfo.score < 50
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                          : seoInfo.score < 80
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                      }`}>
                        {seoInfo.score < 50 ? 'দুর্বল (Weak)' : seoInfo.score < 80 ? 'চলবে (Good)' : 'চমৎকার (Excellent!)'}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-3 text-left">
                    <h5 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">এসইও চেকলিস্ট (SEO Recommendations)</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Title check */}
                      <div className="flex items-center gap-2">
                        {seoInfo.titleStatus === 'perfect' ? (
                          <div className="p-0.5 bg-emerald-500 text-white rounded-full"><Check size={10} /></div>
                        ) : (
                          <div className="p-0.5 bg-amber-500 text-white rounded-full"><AlertCircle size={10} /></div>
                        )}
                        <span className="text-slate-600 dark:text-slate-300">
                          মেটা টাইটেল: <strong className="font-mono">{seoInfo.tLength}</strong>/৬৫ অক্ষর (অনুকূল ৩৫-৬০)
                        </span>
                      </div>

                      {/* Description check */}
                      <div className="flex items-center gap-2">
                        {seoInfo.descStatus === 'perfect' ? (
                          <div className="p-0.5 bg-emerald-500 text-white rounded-full"><Check size={10} /></div>
                        ) : (
                          <div className="p-0.5 bg-amber-500 text-white rounded-full"><AlertCircle size={10} /></div>
                        )}
                        <span className="text-slate-600 dark:text-slate-300">
                          মেটা ডেসক্রিপশন: <strong className="font-mono">{seoInfo.dLength}</strong>/১৬০ অক্ষর (অনুকূল ১১০-১৫৫)
                        </span>
                      </div>

                      {/* Slug format check */}
                      <div className="flex items-center gap-2">
                        {seoInfo.isSlugOk ? (
                          <div className="p-0.5 bg-emerald-500 text-white rounded-full"><Check size={10} /></div>
                        ) : (
                          <div className="p-0.5 bg-rose-500 text-white rounded-full"><AlertTriangle size={10} /></div>
                        )}
                        <span className="text-slate-600 dark:text-slate-300">
                          ইংরেজি এবং হাইফেন-ভিত্তিক স্ল্যাগ
                        </span>
                      </div>

                      {/* Content headings headings check */}
                      <div className="flex items-center gap-2">
                        {seoInfo.hasHeadings ? (
                          <div className="p-0.5 bg-emerald-500 text-white rounded-full"><Check size={10} /></div>
                        ) : (
                          <div className="p-0.5 bg-slate-400 text-white rounded-full"><AlertCircle size={10} /></div>
                        )}
                        <span className="text-slate-600 dark:text-slate-300">
                          হেডিংস সাজানো (H2/H3 Tags)
                        </span>
                      </div>

                      {/* Content word length checks */}
                      <div className="flex items-center gap-2 sm:col-span-2">
                        {seoInfo.words >= 350 ? (
                          <div className="p-0.5 bg-emerald-500 text-white rounded-full"><Check size={10} /></div>
                        ) : (
                          <div className="p-0.5 bg-amber-500 text-white rounded-full"><AlertCircle size={10} /></div>
                        )}
                        <span className="text-slate-600 dark:text-slate-300">
                          শব্দ সংখ্যা: <strong className="font-mono">{seoInfo.words}</strong> (এসইও এর জন্য নুন্যতম ৩৫০ শব্দ রিকমেন্ডেড)
                        </span>
                      </div>
                    </div>

                    {/* Highly clear text warning overlay if GoogleRecommendedLimits are exceeded */}
                    <div className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {seoInfo.titleStatus === 'exceeded' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20 px-2 py-1 rounded">
                          <AlertTriangle size={11} className="shrink-0" />
                          <span>মেটা টাইটেল ৬৫টি অক্ষরের বেশি হয়েছে! গুগল সার্চে বেশি কন্টেন্ট (...) চিহ্ন নিয়ে কেটে যাবে।</span>
                        </div>
                      )}
                      {seoInfo.descStatus === 'exceeded' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50/50 dark:bg-rose-950/20 px-2 py-1 rounded">
                          <AlertTriangle size={11} className="shrink-0" />
                          <span>মেটা বিবরণ ১৬০টি অক্ষরের বেশি হয়েছে! গুগলে লেখাটি কেটে বাদ যাবে।</span>
                        </div>
                      )}
                      {seoInfo.titleStatus === 'perfect' && seoInfo.descStatus === 'perfect' && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-1 rounded">
                          <Check size={11} className="shrink-0" />
                          <span>অসাধারণ! মেটা টাইটেল এবং বিবরণ উভয়ই গুগলের আদর্শ পরিমাপের মধ্যে রয়েছে।</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0B0B0C] border border-slate-200 dark:border-slate-800 p-5 rounded-xl text-left max-w-xl shadow-sm">
                  {/* Google snippet structure mimicking standard SERPs */}
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-600 dark:text-slate-400 truncate font-mono">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded">
                      <Globe size={11} className="text-slate-400" />
                    </div>
                    <span>https://{window.location.host || 'pdftoolbox.bd'} › blog</span>
                    <span className="text-[#888]">› {slug || 'your-slug'}</span>
                  </div>
                  
                  <div className="text-[#1a0dab] dark:text-[#8ab4f8] text-lg font-semibold hover:underline cursor-pointer leading-snug mb-1 truncate font-sans">
                    {seoTitle || title || 'আপনার ব্লগের চমৎকার এসইও শিরোনাম এখানে প্রদর্শিত হবে'}
                  </div>
                  
                  <p className="text-xs text-slate-600 dark:text-[#bdc1c6] leading-relaxed break-words line-clamp-2 font-sans">
                    {seoDescription || excerpt || 'সার্চ ইঞ্জিনের ফলাফলে ব্যবহারকারীকে আকর্ষণ করার জন্য আপনার চমৎকার মেটা বিবরণ এখানে প্রদর্শিত হবে। ব্লগের মূল বার্তা এখানে ফুটিয়ে তুলুন এবং সেরা কিওয়ার্ড রাখুন।'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">SEO Meta Title (ফরমেটেড টাইটেল)</label>
                      <span className={`text-[10px] font-mono leading-none font-bold px-1.5 py-0.5 rounded ${
                        seoTitle.length > 65 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400'
                      }`}>
                        {seoTitle.length} / 65
                      </span>
                    </div>
                    <input 
                      type="text"
                      value={seoTitle}
                      onChange={e => setSeoTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="SEO Meta Title"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">গুগলে দেখানোর জন্য ৬০-৬৫ অক্ষরের ভেতরে রাখুন।</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">SEO Meta Description (সার্চ ডেসক্রিপশন)</label>
                      <span className={`text-[10px] font-mono leading-none font-bold px-1.5 py-0.5 rounded ${
                        seoDescription.length > 160 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400'
                      }`}>
                        {seoDescription.length} / 160
                      </span>
                    </div>
                    <textarea 
                      value={seoDescription}
                      onChange={e => setSeoDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      rows={2}
                      placeholder="SEO Meta Description details"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">সবচেয়ে দরকারী তথ্য এবং কীওয়ার্ড দিয়ে ১৫০ অক্ষরের মধ্যে সাজান।</p>
                  </div>
                </div>
              </div>

              {/* Status and Action Panel */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">স্ট্যাটাস (Status):</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as 'draft' | 'published')}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="draft">Draft (খসড়া)</option>
                    <option value="published">Published (সবার জন্য প্রকাশিত)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="px-5 py-2.5 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-2.5 rounded-xl font-bold text-xs shadow transition-colors"
                  >
                    <Save size={14} /> 
                    <span>সংরক্ষণ করুন (Save Post)</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading...</div>
            ) : posts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No blog posts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {posts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{post.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">/{post.slug}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            post.status === 'published' 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                          }`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(post)}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Centered Dialog Modal System */}
      {dialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur overlay */}
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => {
              if (dialog.type === 'alert' && dialog.onConfirm) {
                dialog.onConfirm();
              }
            }}
          />

          {/* Dialog Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative z-10 transform scale-100 transition-all duration-200 animate-in fade-in zoom-in-95 ease-out text-center">
            <div className="flex flex-col items-center">
              {/* Alert / Warning Icon */}
              <div className={`p-4 rounded-2xl mb-4 ${
                dialog.type === 'confirm' 
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/30' 
                  : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
              }`}>
                {dialog.type === 'confirm' ? (
                  <AlertTriangle className="h-6 w-6 text-rose-500 animate-pulse" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                )}
              </div>

              {/* Title Header */}
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1 font-sans">
                {dialog.title}
              </h3>

              {/* Message Details */}
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                {dialog.message}
              </p>

              {/* Actions Panel */}
              <div className="flex items-center justify-center gap-2.5 w-full">
                {dialog.type === 'confirm' ? (
                  <>
                    <button
                      type="button"
                      onClick={dialog.onCancel}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors"
                    >
                      বাতিল করুন / Cancel
                    </button>
                    <button
                      type="button"
                      onClick={dialog.onConfirm}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      হ্যাঁ, ডিলেট করুন
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={dialog.onConfirm}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    ঠিক আছে / OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
