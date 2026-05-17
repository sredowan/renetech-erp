import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, 
  Target, Calendar, Shield, Save, 
  Loader2, CheckCircle2, AlertCircle, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfileView = () => {
  const { user, refreshUser } = useAuth();
  const student = user?.Student;
  
  const [formData, setFormData] = useState({
    target_score: student?.target_score || 79,
    exam_date: student?.exam_date || '',
    mobile_no: student?.mobile_no || '',
    current_address: student?.current_address || ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // success, error

  const isPremium = student?.plan_type === 'premium';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await api.put('/student/me', formData);
      await refreshUser();
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">My Profile</h1>
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold text-sm ${
          isPremium ? 'bg-[var(--glass)] border-indigo-200 text-indigo-800' : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}>
          {isPremium ? <Zap className="w-4 h-4 fill-indigo-600 text-[var(--primary)]" /> : <Shield className="w-4 h-4" />}
          {isPremium ? 'Premium Plan Active' : 'Basic Free Plan'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Photo & Quick Info */}
        <div className="md:col-span-1 space-y-6">
           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-[var(--accent)] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-5xl font-black shadow-xl ring-4 ring-white dark:ring-gray-700">
                 {user?.name?.[0]}
              </div>
              <h3 className="text-xl font-black">{user?.name}</h3>
              <p className="text-sm text-gray-500 font-medium mb-6">{user?.role === 'student' ? 'PTE Candidate' : user?.role}</p>
              
              <div className="flex flex-col gap-2 mt-2">
                 <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-left border border-[var(--border)] dark:border-gray-800">
                    <Mail className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{user?.email}</span>
                 </div>
                 <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-left border border-[var(--border)] dark:border-gray-800">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">ID: ST-2024-{student?.id}</span>
                 </div>
              </div>
           </div>

           {!isPremium && (
             <div className="bg-gradient-to-br from-[var(--primary)] to-indigo-700 rounded-3xl p-6 text-white text-center shadow-xl shadow-indigo-900/40">
                <Zap className="w-10 h-10 text-yellow-400 fill-yellow-400 mx-auto mb-4" />
                <h4 className="font-black mb-2">Power up your prep</h4>
                <p className="text-xs opacity-70 mb-6">Unlock section-wise AI scoring and mock test analytics.</p>
                <button 
                  onClick={() => navigate('/subscription')}
                  className="w-full py-3 bg-white text-[var(--text-main)] font-black rounded-xl hover:scale-105 transition-transform text-xs"
                >
                  Upgrade Now
                </button>
             </div>
           )}
        </div>

        {/* Right Side: Edit Form */}
        <div className="md:col-span-2 space-y-6">
           <form onSubmit={handleSubmit} className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Target className="w-3.5 h-3.5" /> Target Score
                    </label>
                    <input 
                      type="number" 
                      name="target_score"
                      value={formData.target_score}
                      onChange={handleChange}
                      placeholder="e.g. 79"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5" /> Exam Date
                    </label>
                    <input 
                      type="date" 
                      name="exam_date"
                      value={formData.exam_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Phone className="w-3.5 h-3.5" /> Mobile Number
                    </label>
                    <input 
                      type="text" 
                      name="mobile_no"
                      value={formData.mobile_no}
                      onChange={handleChange}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPin className="w-3.5 h-3.5" /> Current Address
                    </label>
                    <input 
                      type="text" 
                      name="current_address"
                      value={formData.current_address}
                      onChange={handleChange}
                      placeholder="Street, City, Country"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-[var(--border)] dark:border-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                 <div className="flex items-center gap-2">
                    {status === 'success' && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 className="w-4 h-4" /> Profile saved!
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm animate-in shake duration-500">
                        <AlertCircle className="w-4 h-4" /> Save failed.
                      </div>
                    )}
                 </div>
                 <button 
                   type="submit" 
                   disabled={loading}
                   className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                   {loading ? 'Saving...' : 'Save Changes'}
                 </button>
              </div>
           </form>

           <div className="glass-morphism rounded-3xl p-8 border border-[var(--border)] border-[var(--border)] shadow-sm space-y-6">
              <h3 className="text-xl font-black">Account Security</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-[var(--border)] dark:border-gray-800">
                 <div>
                    <h4 className="text-sm font-bold">Password</h4>
                    <p className="text-[10px] text-gray-500">Last changed 3 months ago</p>
                 </div>
                 <button className="px-6 py-2 border border-gray-200 border-[var(--border)] rounded-xl text-xs font-bold hover:bg-white dark:hover:bg-gray-800 transition-all">
                    Update
                 </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-[var(--border)] dark:border-gray-800">
                 <div>
                    <h4 className="text-sm font-bold">Device Limits</h4>
                    <p className="text-[10px] text-gray-500">
                       {isPremium ? `${student?.active_devices?.length || 0} of 2 active` : '1 active device'}
                    </p>
                 </div>
                 <button className="px-6 py-2 border border-gray-200 border-[var(--border)] rounded-xl text-xs font-bold hover:bg-white dark:hover:bg-gray-800 transition-all text-red-600">
                    Wipe Sessions
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileView;
