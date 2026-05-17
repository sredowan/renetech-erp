import React, { useState } from 'react';
import { Zap, Check, Shield, Smartphone, ArrowRight, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const SubscriptionView = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const student = user?.Student;
  const isPremium = student?.plan_type === 'premium';

  const handleUpgrade = async (method) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call to backend payment simulation
      const response = await api.post('/payment/simulate', {
        method,
        amount: 2500
      });
      
      await refreshUser();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 glass-morphism rounded-2xl shadow-2xl border border-emerald-500/20 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4">Subscription Activated!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Welcome to PTE Premium. You now have full access to AI scoring, mock tests, and our prediction question bank for the next 90 days.
        </p>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[var(--text-main)] mb-4">Choose Your Growth Plan</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Invest in your future. Get the tools used by successful PTE candidates to smash their score goals.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Free Plan */}
        <div className="glass-morphism p-8 rounded-3xl border border-gray-200 border-[var(--border)] shadow-sm opacity-80">
          <h3 className="text-xl font-bold mb-2">Basic Practice</h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black">Free</span>
            <span className="text-gray-500 text-sm">/ Lifetime</span>
          </div>
          <ul className="space-y-4 mb-10">
            {[
              "Limited question bank access",
              "Standard practice interface",
              "No AI scoring feedback",
              "Max 1 mini mock test",
              "Basic score reports",
              "Single device only"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-gray-400" /> {item}
              </li>
            ))}
          </ul>
          <button disabled className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 font-bold rounded-xl cursor-not-allowed">
            {isPremium ? 'Downgraded after expiry' : 'Current Plan'}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="glass-morphism p-8 rounded-3xl border-2 border-indigo-600 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-white px-6 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-md">
            RECOMMENDED
          </div>
          
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            PTE Premium Success <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </h3>
          <div className="flex items-baseline gap-1 mb-6">
            <span className="text-4xl font-black">2500</span>
            <span className="text-lg font-bold">BDT</span>
            <span className="text-gray-500 text-sm ml-1">/ 90 Days</span>
          </div>

          <ul className="space-y-4 mb-10">
            {[
              "Unlimited Practice & Question Bank",
              "Full AI Scoring (Speaking & Writing)",
              "Unlimited Full Mock Tests",
              "Repeated & Prediction Questions",
              "Advanced Skill Analytics & Trends",
              "Study Plans & PDF Material Access",
              "Dual Device Simultaneous Sync",
              "Personalized Performance Review"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[var(--text-main)] font-medium">
                <Check className="w-4 h-4 text-emerald-500" /> {item}
              </li>
            ))}
          </ul>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {isPremium ? (
            <div className="w-full py-4 text-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl border border-emerald-200 dark:border-emerald-800">
              Active until {new Date(student.premium_expiry_date).toLocaleDateString()}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {['bKash', 'Nagad', 'AmarPay', 'SSLCommerz'].map((method) => (
                  <button
                    key={method}
                    disabled={loading}
                    onClick={() => handleUpgrade(method.toLowerCase())}
                    className="flex flex-col items-center justify-center p-4 border border-gray-200 border-[var(--border)] rounded-xl hover:border-indigo-600 hover:bg-[var(--glass)] dark:hover:bg-indigo-900/20 transition-all font-bold text-sm disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mb-2" /> : <CreditCard className="w-5 h-5 mb-2 text-[var(--primary)]" />}
                    {method}
                  </button>
                ))}
              </div>
              <div className="pt-4 flex items-center gap-2 text-[10px] text-gray-400">
                <Shield className="w-3 h-3" /> Secure checkout. Non-refundable.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-[var(--accent)]" />
          </div>
          <h4 className="font-bold mb-2">Instant Activation</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Your premium features unlock the moment your payment is confirmed.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4">
            <Smartphone className="w-6 h-6 text-purple-600" />
          </div>
          <h4 className="font-bold mb-2">Multi-Device Sync</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Study on your laptop or mobile. We sync your progress everywhere.</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <h4 className="font-bold mb-2">Trust & Quality</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">Trusted by 1000+ students. 99.9% scoring accuracy guarantee.</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionView;
