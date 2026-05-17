"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Sparkles, BookOpen, Clock } from "lucide-react";

export default function BookingModal({ isOpen, onClose, defaultInterest = "" }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", course_interest: defaultInterest, destination_country: "", message: "" });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setFormData(prev => ({ ...prev, course_interest: defaultInterest }));
    } else {
      document.body.style.overflow = "auto";
      setTimeout(() => setStatus("idle"), 300);
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen, defaultInterest]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      // Re-using contact route for generic booking OR enquiries route
      const isCourseSpecific = !!formData.course_interest;
      const endpoint = isCourseSpecific ? "/api/public/enquiries" : "/api/public/contact";
      
      const payload = isCourseSpecific 
        ? { name: formData.name, email: formData.email, phone: formData.phone, message: formData.message, course_id: formData.course_interest, destination_country: formData.destination_country }
        : { name: formData.name, email: formData.email, phone: formData.phone, message: formData.message, subject: "General Booking/Consultation", destination_country: formData.destination_country };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setStatus(res.ok ? "success" : "error");
    } catch (error) {
      console.error("Booking submission failed", error);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 text-left">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-fade-in-up">
        {status === "success" ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="mb-2 text-2xl font-extrabold text-slate-900">Request Received!</h3>
            <p className="mb-8 text-slate-600">Our academic advisor will contact you shortly to complete your booking.</p>
            <button onClick={onClose} className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white transition hover:bg-slate-800">
              Close Window
            </button>
          </div>
        ) : (
          <>
            <div className="bg-slate-950 p-6 text-white sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
              <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
                <X size={20} />
              </button>
              <h2 className="text-2xl font-extrabold tracking-tight">Book a Session</h2>
              <p className="mt-2 text-sm text-slate-300">Leave your details and we will find the perfect batch for you.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input required type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
                  <input required type="tel" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10" placeholder="+880 1..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <input required type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Interested In</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10" value={formData.course_interest} onChange={(e) => setFormData({ ...formData, course_interest: e.target.value })}>
                    <option value="">General Consultation</option>
                    <option value="PTE">PTE Academic</option>
                    <option value="IELTS">IELTS Preparation</option>
                    <option value="Spoken English">Spoken English</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Destination</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-400/10" value={formData.destination_country} onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}>
                    <option value="">Select Country</option>
                    <option value="Australia">Australia</option>
                    <option value="UK">United Kingdom</option>
                    <option value="USA">USA</option>
                    <option value="Canada">Canada</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              {status === "error" && <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">Failed to submit. Please try again or call us directly.</div>}
              
              <div className="pt-2">
                <button type="submit" disabled={status === "loading"} className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-6 py-4 font-bold text-white transition hover:bg-slate-800 disabled:opacity-70">
                  {status === "loading" ? <><Loader2 size={18} className="mr-2 animate-spin" /> Submitting...</> : "Confirm Booking"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
