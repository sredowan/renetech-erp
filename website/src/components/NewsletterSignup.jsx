"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";

export default function NewsletterSignup({ variant = "default" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate success (no backend endpoint yet)
    setTimeout(() => setStatus("success"), 1200);
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-accent/10 px-5 py-4 text-sm font-semibold text-accent">
        <CheckCircle2 size={20} />
        <span>Thank you! You&apos;ll hear from us soon.</span>
      </div>
    );
  }

  if (variant === "dark") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          Subscribe
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-input-premium flex-1"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="primary-btn whitespace-nowrap disabled:opacity-60"
      >
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Subscribe"}
      </button>
    </form>
  );
}
