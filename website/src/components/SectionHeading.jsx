"use client";

import AnimateOnScroll from "./AnimateOnScroll";

export default function SectionHeading({ eyebrow, title, subtitle, align = "center", className = "" }) {
  return (
    <AnimateOnScroll variant="fade-up">
      <div className={`mx-auto mb-12 max-w-3xl md:mb-16 ${align === "center" ? "text-center" : "text-left"} ${className}`}>
        {eyebrow && (
          <span className="eyebrow">{eyebrow}</span>
        )}
        {title && (
          <h2 className="mt-5 text-balance text-3xl font-extrabold text-slate-900 md:text-5xl">{title}</h2>
        )}
        {subtitle && (
          <p className="mt-4 text-lg leading-8 text-slate-600">{subtitle}</p>
        )}
      </div>
    </AnimateOnScroll>
  );
}
