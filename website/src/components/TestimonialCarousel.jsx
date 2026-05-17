"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const defaultTestimonials = [
  { name: "Nusrat Jahan", result: "PTE 79+", course: "PTE Academic", quote: "Language Academy gave me clarity, structure, and the exact feedback I needed. My score jumped from 58 to 79 in just 6 weeks.", avatar: "NJ" },
  { name: "Tanvir Ahmed", result: "IELTS 7.5", course: "IELTS Preparation", quote: "The faculty support felt premium from day one. I always knew what to improve next. Got 7.5 on my first attempt thanks to their mock test strategy.", avatar: "TA" },
  { name: "Rafa Tasnim", result: "Fluent Speaker", course: "Spoken English", quote: "I joined for confidence and left speaking clearly in interviews and presentations. The structured conversation practice changed everything.", avatar: "RT" },
  { name: "Syed Rahman", result: "PTE 85", course: "PTE Academic", quote: "The AI-supported mock tests pinpointed exactly where I was losing marks. The trainers built a plan around those gaps and it worked.", avatar: "SR" },
  { name: "Fatima Akter", result: "IELTS 8.0", course: "IELTS Preparation", quote: "I tried self-study twice and couldn't break band 7. Language Academy's structured approach got me to 8.0 in just one cohort.", avatar: "FA" },
  { name: "Arif Hossain", result: "PTE 72", course: "PTE Academic", quote: "Coming from a Bengali-medium school, I never imagined scoring 72 in PTE. The small batch support made all the difference.",  avatar: "AH" },
];

export default function TestimonialCarousel({ testimonials = defaultTestimonials }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const total = testimonials.length;

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, next]);

  const current = testimonials[activeIndex];

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <div className="premium-panel relative overflow-hidden p-8 md:p-12">
        <Quote size={48} className="absolute right-8 top-8 text-primary/5" />

        <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-10">
          {/* Avatar */}
          <div className="mb-6 flex-shrink-0 md:mb-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-2xl font-bold text-white shadow-[0_12px_30px_-12px_rgba(18,84,147,0.6)]">
              {current.avatar}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-center gap-1 md:justify-start">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-amber-400" fill="currentColor" />
              ))}
            </div>

            <p className="text-lg leading-8 text-slate-700 md:text-xl md:leading-9">
              &ldquo;{current.quote}&rdquo;
            </p>

            <div className="mt-6 flex flex-col items-center gap-1 md:items-start">
              <p className="text-lg font-bold text-slate-900">{current.name}</p>
              <div className="flex items-center gap-3">
                <span className="score-badge">{current.result}</span>
                <span className="text-sm text-slate-500">{current.course}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4 md:justify-end">
          <button
            onClick={prev}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? "w-8 bg-primary" : "w-2 bg-slate-300 hover:bg-slate-400"}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary hover:text-primary"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
