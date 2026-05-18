"use client";

import React, { useState } from "react";
import { X, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnquireModal({ courseId, courseTitle, defaultBatchId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");

  const handleOpen = (e) => { e.preventDefault(); setIsOpen(true); };
  const handleClose = () => { setIsOpen(false); setStatus("idle"); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, course_id: courseId, batch_id: defaultBatchId }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch (error) {
      console.error("Enquiry submission failed", error);
      setStatus("error");
    }
  };

  return (
    <>
      <button onClick={handleOpen} className="secondary-btn w-full justify-center">Enquire Now</button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl md:p-8"
            >
              <button onClick={handleClose} className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>

              {status === "success" ? (
                <div className="text-center py-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Enquiry Sent!</h3>
                  <p className="text-slate-600 mb-6">Our team will get back to you shortly regarding {courseTitle}.</p>
                  <button onClick={handleClose} className="primary-btn">Close</button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-900 pr-8">Enquire about {courseTitle}</h3>
                  <p className="mt-2 text-sm text-slate-600 mb-6">Leave your details and we will guide you on the next steps.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                      <input required type="text" className="form-input-premium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                        <input required type="tel" className="form-input-premium" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input required type="email" className="form-input-premium" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Message (Optional)</label>
                      <textarea rows={3} className="form-input-premium" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Any specific questions regarding schedule or fees?" />
                    </div>
                    {status === "error" && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">Failed to submit enquiry. Please try again.</div>}
                    <button type="submit" disabled={status === "loading"} className="primary-btn w-full mt-2">
                      {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Enquiry"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
