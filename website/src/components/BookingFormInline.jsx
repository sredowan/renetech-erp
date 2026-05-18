"use client";

import React, { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function BookingFormInline() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", course_interest: "", destination_country: "", message: "" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
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

  if (status === "success") {
    return (
      <div className="premium-panel flex flex-col items-center justify-center p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-slate-900">Request Received!</h3>
        <p className="mb-8 text-slate-600">Our academic advisor will contact you shortly to complete your booking.</p>
        <button onClick={() => setStatus("idle")} className="secondary-btn w-full">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="premium-panel overflow-hidden">
      <div className="bg-primary p-6 sm:p-8 text-white">
        <h3 className="text-2xl font-bold tracking-tight">Book a Session</h3>
        <p className="mt-2 text-primary-foreground/80">Leave your details and we will find the perfect batch for you.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 bg-white">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full Name</label>
          <input required type="text" className="form-input-premium" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
            <input required type="tel" className="form-input-premium" placeholder="+880 1..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <input required type="email" className="form-input-premium" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Interested In</label>
            <select className="form-input-premium" value={formData.course_interest} onChange={(e) => setFormData({ ...formData, course_interest: e.target.value })}>
              <option value="">General Consultation</option>
              <option value="PTE">PTE Academic</option>
              <option value="IELTS">IELTS Preparation</option>
              <option value="Spoken English">Spoken English</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferred Destination</label>
            <select className="form-input-premium" value={formData.destination_country} onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}>
              <option value="">Select Country</option>
              <option value="Australia">Australia</option>
              <option value="UK">United Kingdom</option>
              <option value="USA">USA</option>
              <option value="Canada">Canada</option>
              <option value="Others">Others</option>
            </select>
          </div>
        </div>

        {status === "error" && <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">Failed to submit. Please try again.</div>}
        
        <div className="pt-2">
          <button type="submit" disabled={status === "loading"} className="primary-btn w-full !py-4 shadow-xl shadow-primary/20 disabled:opacity-70">
            {status === "loading" ? <><Loader2 size={18} className="mr-2 animate-spin" /> Submitting...</> : "Confirm Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
