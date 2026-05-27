import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile, GlobalSettings } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Users, Settings, Activity, ArrowLeft, CheckCircle2, Upload, Trash2, Cpu, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminPage() {
  const { profile, settings, loading } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'payments'>('users');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [payments, setPayments] = useState<any[]>([]);

  // Local settings state for editing
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings); // Sync when fetched
  }, [settings]);

  useEffect(() => {
    if (profile?.isAdmin) {
      fetchUsers();
      fetchPayments();
    }
  }, [profile]);

  const fetchPayments = async () => {
    try {
      const qs = await getDocs(collection(db, 'payments'));
      const fetched: any[] = [];
      qs.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() });
      });
      setPayments(fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprovePayment = async (paymentId: string, userId: string, planType: string) => {
    try {
      const now = new Date();
      if (planType === 'yearly') {
        now.setFullYear(now.getFullYear() + 1);
      } else {
        now.setMonth(now.getMonth() + 1);
      }
      const planExpiresAt = now.toISOString();

      await updateDoc(doc(db, 'payments', paymentId), { status: 'approved' });
      await updateDoc(doc(db, 'users', userId), { plan: 'pro', planExpiresAt });
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'approved' } : p));
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, plan: 'pro', planExpiresAt } : u));
    } catch(e) {
      console.error(e);
    }
  };

  const handleRejectPayment = async (paymentId: string) => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status: 'rejected' });
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'rejected' } : p));
    } catch(e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const qs = await getDocs(collection(db, 'users'));
      const fetched: UserProfile[] = [];
      qs.forEach(doc => {
        fetched.push(doc.data() as UserProfile);
      });
      setUsers(fetched);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBan = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isBanned: !current });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: !current } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleTogglePro = async (uid: string, currentPlan: string, grantType: 'free' | '1M' | '1Y' | 'lifetime') => {
    const nextPlan = grantType === 'free' ? 'free' : 'pro';
    let planExpiresAt: string | null = null;
    
    if (grantType === '1M') {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      planExpiresAt = d.toISOString();
    } else if (grantType === '1Y') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      planExpiresAt = d.toISOString();
    } // 'lifetime' will leave planExpiresAt as null

    try {
      const payload: any = { plan: nextPlan };
      if (nextPlan === 'pro') {
        payload.planExpiresAt = planExpiresAt;
      } else {
        payload.planExpiresAt = null; // Remove expiration if downgraded to free
      }
      
      await updateDoc(doc(db, 'users', uid), payload);
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...payload } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAdmin = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isAdmin: !current });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isAdmin: !current } : u));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), localSettings);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings(s => ({
          ...s,
          payment: { ...s.payment, qrCodeImage: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return null;
  if (!profile?.isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-mono selection:bg-[#EBEBEB] selection:text-[#0A0A0A]">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-[#1A1A1A] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 px-6 py-4 rounded-xl flex items-center gap-4 max-w-sm w-full mx-auto backdrop-blur-xl">
              <CheckCircle2 size={24} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div>
                <p className="font-sans font-bold text-emerald-50">Configuration Deployed</p>
                <p className="text-xs text-[#888] mt-0.5">Platform settings updated successfully</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="border-b border-[#2C2C2C]/50 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <Link to="/dashboard" className="text-[#888] hover:text-[#EDEDED] transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <ShieldAlert size={22} className="text-red-500 shrink-0" />
            <h1 className="text-lg md:text-xl font-bold tracking-tight truncate">OVERSIGHT_PROTOCOL</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-3 md:px-4 py-1.5 text-xs md:text-sm uppercase tracking-wider font-semibold transition-all border border-transparent rounded",
              activeTab === 'users' ? "bg-[#EDEDED] text-[#0A0A0A]" : "text-[#888] hover:border-[#2C2C2C]"
            )}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              "px-3 md:px-4 py-1.5 text-xs md:text-sm uppercase tracking-wider font-semibold transition-all border border-transparent rounded",
              activeTab === 'settings' ? "bg-[#EDEDED] text-[#0A0A0A]" : "text-[#888] hover:border-[#2C2C2C]"
            )}
          >
            Config
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={cn(
              "px-3 md:px-4 py-1.5 text-xs md:text-sm uppercase tracking-wider font-semibold transition-all border border-transparent rounded flex items-center gap-2",
              activeTab === 'payments' ? "bg-[#EDEDED] text-[#0A0A0A]" : "text-[#888] hover:border-[#2C2C2C]"
            )}
          >
            Payments
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'users' ? (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-sans">User Directory</h2>
                  <p className="text-[#888] mt-1">Manage platform access and privileges.</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2C2C2C] px-4 py-2 rounded flex items-center gap-3">
                  <Users size={16} className="text-[#888]" />
                  <span className="text-sm font-semibold">{users.length} Indexed</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-[#2C2C2C] rounded-lg bg-[#0F0F0F]">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-[#2C2C2C] bg-[#141414] text-[#888]">
                      <th className="p-4 font-medium uppercase text-xs tracking-wider">UID</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider">Identity</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider border-l border-[#2C2C2C]">Tier</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider">Usage</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider">Role</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider">Status</th>
                      <th className="p-4 font-medium uppercase text-xs tracking-wider border-l border-[#2C2C2C] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]/50">
                    {users.map(u => (
                      <tr key={u.uid} className="hover:bg-[#1A1A1A] transition-colors">
                        <td className="p-4 text-xs text-[#888]">{u.uid.slice(0, 8)}...</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={u.photoURL || 'https://via.placeholder.com/32'} alt="" className="w-8 h-8 rounded-full border border-[#2C2C2C]" />
                            <div className="flex flex-col">
                              <span className="font-sans font-medium">{u.displayName || 'Unknown'}</span>
                              <span className="text-xs text-[#888]">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 border-l border-[#2C2C2C]">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={cn(
                              "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold",
                              u.plan === 'pro' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            )}>
                              {u.plan}
                            </span>
                            {u.plan === 'pro' && (
                              <span className="text-[10px] text-[#888]">
                                {u.planExpiresAt 
                                  ? `${Math.max(0, Math.ceil((new Date(u.planExpiresAt).getTime() - new Date().getTime()) / 1000 / 3600 / 24))} days left`
                                  : 'Lifetime'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-xs">
                          <span className="text-[#EDEDED] font-mono font-bold mr-1">{u.totalUsage || 0}</span>
                          <span className="text-[#888]">total</span>
                          {u.currentDayUsage > 0 && <span className="ml-2 text-emerald-500">+{u.currentDayUsage} today</span>}
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold",
                            u.isAdmin ? "bg-red-500/20 text-red-500 border border-red-500/30" : "text-[#888]"
                          )}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold",
                            u.isBanned ? "bg-red-500 text-white" : "bg-emerald-500/10 text-emerald-400"
                          )}>
                            {u.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 border-l border-[#2C2C2C] text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.plan === 'pro' ? (
                              <button
                                onClick={() => handleTogglePro(u.uid, u.plan, 'free')}
                                className="px-3 py-1.5 text-xs bg-[#1A1A1A] hover:bg-[#2C2C2C] border border-[#2C2C2C] rounded transition-colors"
                              >
                                Revoke PRO
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#2C2C2C] rounded">
                                <button
                                  onClick={() => handleTogglePro(u.uid, u.plan, '1M')}
                                  title="Grant 1 Month"
                                  className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-[#EDEDED] hover:bg-[#2C2C2C] transition-colors rounded-l"
                                >
                                  30D
                                </button>
                                <div className="w-px h-4 bg-[#2C2C2C]"></div>
                                <button
                                  onClick={() => handleTogglePro(u.uid, u.plan, '1Y')}
                                  title="Grant 1 Year"
                                  className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888] hover:text-[#EDEDED] hover:bg-[#2C2C2C] transition-colors"
                                >
                                  365D
                                </button>
                                <div className="w-px h-4 bg-[#2C2C2C]"></div>
                                <button
                                  onClick={() => handleTogglePro(u.uid, u.plan, 'lifetime')}
                                  title="Grant Lifetime PRO"
                                  className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400 hover:bg-[#2C2C2C] transition-colors rounded-r"
                                >
                                  LT
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => handleToggleAdmin(u.uid, !!u.isAdmin)}
                              className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded transition-colors"
                            >
                              {u.isAdmin ? '- Admin' : '+ Admin'}
                            </button>
                            <button
                              onClick={() => handleToggleBan(u.uid, !!u.isBanned)}
                              className="px-3 py-1.5 text-xs bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded transition-colors"
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12 max-w-3xl"
            >
              <div>
                <h2 className="text-2xl font-bold font-sans">Global Platform Configuration</h2>
                <p className="text-[#888] mt-1">Modify pricing and gate features behind PRO tiers.</p>
              </div>

              {/* Pricing & Contact Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2C2C2C] pb-2">
                  <Activity size={18} className="text-emerald-500" />
                  <h3 className="text-lg font-bold">Platform Information & Pricing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Support Email</label>
                    <input 
                      type="email" 
                      value={localSettings.supportEmail || ''}
                      onChange={(e) => setLocalSettings(s => ({ ...s, supportEmail: e.target.value }))}
                      placeholder="support@example.com"
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-sm font-sans focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                    <p className="text-[10px] text-[#888]">Displayed in the footer as contact email.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Guest Daily Limit</label>
                    <input 
                      type="number" 
                      value={localSettings.unregisteredDailyLimit !== undefined ? localSettings.unregisteredDailyLimit : 2}
                      onChange={(e) => setLocalSettings(s => ({ ...s, unregisteredDailyLimit: Number(e.target.value) }))}
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-xl font-bold focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                  </div>
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Free Daily Limit</label>
                    <input 
                      type="number" 
                      value={localSettings.freeDailyLimit !== undefined ? localSettings.freeDailyLimit : 5}
                      onChange={(e) => setLocalSettings(s => ({ ...s, freeDailyLimit: Number(e.target.value) }))}
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-xl font-bold focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                  </div>
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Monthly Price (₹)</label>
                    <input 
                      type="number" 
                      value={localSettings.pricing.monthly}
                      onChange={(e) => setLocalSettings(s => ({ ...s, pricing: { ...s.pricing, monthly: Number(e.target.value) } }))}
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-xl font-bold focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                  </div>
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Yearly Price (₹)</label>
                    <input 
                      type="number" 
                      value={localSettings.pricing.yearly}
                      onChange={(e) => setLocalSettings(s => ({ ...s, pricing: { ...s.pricing, yearly: Number(e.target.value) } }))}
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-xl font-bold focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Settings Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2C2C2C] pb-2">
                  <Activity size={18} className="text-purple-500" />
                  <h3 className="text-lg font-bold">Payment Configuration</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">UPI ID</label>
                    <input 
                      type="text" 
                      value={localSettings.payment?.upiId || ''}
                      onChange={(e) => setLocalSettings(s => ({ ...s, payment: { ...(s.payment || {}), upiId: e.target.value } as any }))}
                      placeholder="e.g., yourname@upi"
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 font-mono focus:outline-none focus:border-[#EDEDED] transition-colors"
                    />
                    
                    <div className="mt-4 pt-4 border-t border-[#2C2C2C]">
                      <label className="text-sm font-bold uppercase tracking-wider text-[#888] block mb-3">QR Code Image</label>
                      
                      {localSettings.payment?.qrCodeImage ? (
                        <div className="relative group rounded-xl overflow-hidden border border-[#2C2C2C] inline-block bg-[#1A1A1A] max-w-xs w-full aspect-square flex items-center justify-center p-4">
                          <img src={localSettings.payment.qrCodeImage} alt="UPI QR" className="max-w-full max-h-full object-contain" />
                          <div className="absolute inset-0 bg-[#0A0A0A]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-md">
                            <button
                              onClick={() => setLocalSettings(s => ({ ...s, payment: { ...s.payment, qrCodeImage: '' } }))}
                              className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded font-bold uppercase tracking-wider text-xs flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} />
                              Remove QR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full aspect-[2/1] bg-[#1A1A1A] border-2 border-dashed border-[#2C2C2C] hover:border-[#EDEDED]/50 hover:bg-[#2C2C2C]/50 transition-all rounded-xl cursor-pointer group">
                          <Upload size={24} className="text-[#888] mb-2 group-hover:text-[#EDEDED] transition-colors" />
                          <span className="text-sm font-bold text-[#888] group-hover:text-[#EDEDED] transition-colors">Upload QR Code</span>
                          <span className="text-[10px] text-[#888] mt-1">(PNG, JPG up to 1MB)</span>
                          <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="p-5 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-4">
                    <label className="text-sm font-bold uppercase tracking-wider text-[#888]">Payment Instructions</label>
                    <textarea 
                      value={localSettings.payment?.instructions || ''}
                      onChange={(e) => setLocalSettings(s => ({ ...s, payment: { ...(s.payment || {}), instructions: e.target.value } as any }))}
                      rows={6}
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 font-sans text-sm resize-none focus:outline-none focus:border-[#EDEDED] transition-colors h-full min-h-[150px]"
                    />
                  </div>
                </div>
              </section>

              {/* Feature Gating Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2C2C2C] pb-2">
                  <Settings size={18} className="text-blue-500" />
                  <h3 className="text-lg font-bold">Access Controls (Feature Gating)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(localSettings.features).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F]">
                      <span className="font-sans font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <select 
                        value={value}
                        onChange={(e) => setLocalSettings(s => ({ ...s, features: { ...s.features, [key]: e.target.value as 'free' | 'pro' } }))}
                        className={cn(
                          "bg-[#1A1A1A] border border-[#2C2C2C] p-2 rounded text-sm font-bold uppercase tracking-wider focus:outline-none",
                          value === 'pro' ? "text-emerald-400" : "text-[#888]"
                        )}
                      >
                        <option value="free">FREE</option>
                        <option value="pro">PRO</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Engine & API Keys Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2C2C2C] pb-2">
                  <Cpu size={18} className="text-emerald-500" />
                  <h3 className="text-lg font-bold">AI Model & Engine Configuration (Groq / OpenRouter)</h3>
                </div>
                <div className="p-6 border border-[#2C2C2C] rounded-lg bg-[#0F0F0F] space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-1">
                        AI Service Provider
                      </label>
                      <select
                        value={localSettings.aiProvider || 'gemini'}
                        onChange={(e) => setLocalSettings(s => ({ ...s, aiProvider: e.target.value as any }))}
                        className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-sm font-semibold text-[#EDEDED] focus:outline-none focus:border-emerald-500 transition-colors text-slate-100"
                      >
                        <option value="gemini" className="bg-[#1A1A1A] text-[#EDEDED]">Google Gemini (Default API)</option>
                        <option value="groq" className="bg-[#1A1A1A] text-[#EDEDED]">Groq Cloud API</option>
                        <option value="openrouter" className="bg-[#1A1A1A] text-[#EDEDED]">OpenRouter API</option>
                      </select>
                      <p className="text-xs text-[#888]">Choose where news/blog requests are routed.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#888]">
                        Model Signature
                      </label>
                      <input
                        type="text"
                        value={localSettings.aiModel || ''}
                        onChange={(e) => setLocalSettings(s => ({ ...s, aiModel: e.target.value }))}
                        placeholder={
                          localSettings.aiProvider === 'groq' 
                            ? 'e.g., llama-3.3-70b-versatile' 
                            : localSettings.aiProvider === 'openrouter'
                            ? 'e.g., meta-llama/llama-3.3-70b-instruct'
                            : 'e.g., gemini-2.5-flash'
                        }
                        className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-sm font-mono text-[#EDEDED] focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <p className="text-xs text-[#888]">
                        The exact identifier of the LLM model to request completions from.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                      <Key size={12} className="text-emerald-500" /> Custom API Key (saved in DB)
                    </label>
                    <input
                      type="password"
                      value={localSettings.aiApiKey || ''}
                      onChange={(e) => setLocalSettings(s => ({ ...s, aiApiKey: e.target.value }))}
                      placeholder="Enter Provider API Key"
                      className="w-full bg-[#1A1A1A] border border-[#2C2C2C] rounded p-3 text-sm font-mono text-[#EDEDED] focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <p className="text-xs text-[#888]">
                      API keys are held securely within your project database and never exposed directly block-side to regular users. Leave empty to use system defaults.
                    </p>
                  </div>
                </div>
              </section>

              <div className="pt-8 border-t border-[#2C2C2C] flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-[#EDEDED] text-[#0A0A0A] hover:bg-white px-8 py-3 rounded font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Deploying...' : 'Deploy Configuration'}
                </button>
              </div>

            </motion.div>
          ) : activeTab === 'payments' ? (
            <motion.div
              key="payments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-sans">Payment Requests</h2>
                  <p className="text-[#888] mt-1">Review and approve upgrade requests from users.</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#2C2C2C] px-4 py-2 rounded flex items-center gap-3">
                  <Activity size={16} className="text-purple-500" />
                  <span className="text-sm font-semibold">{payments.filter(p => p.status === 'pending').length} Pending</span>
                </div>
              </div>

              <div className="bg-[#0F0F0F] border border-[#2C2C2C] rounded-xl overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap min-w-[700px]">
                  <thead className="bg-[#1A1A1A] text-[#888] font-sans uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 font-semibold w-1/4">User</th>
                      <th className="p-4 font-semibold">Plan</th>
                      <th className="p-4 font-semibold">Transaction ID</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2C2C2C]">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-[#888]">No payment requests found.</td>
                      </tr>
                    ) : (
                      payments.map(payment => (
                        <tr key={payment.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-[#EDEDED]">{payment.userEmail}</div>
                            <div className="text-xs text-[#888] font-mono mt-0.5">{payment.userId}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {payment.plan}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs">{payment.transactionId}</td>
                          <td className="p-4 text-[#888] font-mono text-xs">
                            {new Date(payment.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-1 text-[10px] uppercase tracking-wider rounded font-bold",
                              payment.status === 'pending' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              payment.status === 'approved' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              "bg-red-500/10 text-red-500 border border-red-500/20"
                            )}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="p-4 border-l border-[#2C2C2C] text-right">
                            {payment.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprovePayment(payment.id, payment.userId, payment.plan)}
                                  className="px-3 py-1.5 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(payment.id)}
                                  className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded transition-colors"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[#888] text-xs">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
