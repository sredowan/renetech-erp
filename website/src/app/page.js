import React from "react";
import HomepageClient from "./HomepageClient";
import JsonLd, { faqSchema, breadcrumbSchema } from "@/components/JsonLd";
import { getApiBase } from "@/lib/api";
import { COURSE_FALLBACKS } from "@/lib/courseFallbacks";

export const revalidate = 300;

const HOMEPAGE_REVALIDATE_SECONDS = 300;
const isProductionBuild = process.env.NEXT_PHASE === "phase-production-build";

/* ─── Homepage SEO Metadata ────────────────────────────────── */
export const metadata = {
  title: "Best PTE Coaching Centre in Dhaka, Bangladesh | Online PTE Course & IELTS Preparation — Language Academy",
  description:
    "Language Academy Bangladesh — #1 PTE coaching centre in Dhanmondi, Dhaka. Expert trainers, AI-scored mock tests, small batches (max 12 students). PTE Academic, IELTS & Spoken English courses. Online & offline classes. Study abroad consulting for Australia, Canada & UK. Book a free consultation today!",
  keywords: [
    /* ── Core PTE ── */
    "best pte coaching centre dhaka bangladesh",
    "pte coaching centre dhaka",
    "pte course in dhaka",
    "pte practice online bangladesh",
    "online pte course dhaka",
    "pte centre dhaka",
    "best pte coaching bangladesh",
    "pte academic preparation dhaka",
    "pte mock test online bangladesh",
    "pte classes near me dhanmondi",
    "pte coaching near me dhaka",
    "pte speaking practice online",
    "pte exam preparation tips",
    /* ── IELTS ── */
    "ielts coaching centre dhaka",
    "ielts preparation bangladesh",
    "best ielts coaching dhaka",
    "ielts 7 band coaching bangladesh",
    "ielts vs pte which is easier",
    /* ── English + Skills ── */
    "spoken english course dhaka",
    "english language course bangladesh",
    "english proficiency test preparation dhaka",
    /* ── Study Abroad ── */
    "study abroad from bangladesh",
    "study abroad consulting dhaka",
    "australia student visa bangladesh",
    "canada study visa from bangladesh",
    "pte score for australia pr",
    "pte score requirement australia migration",
    "study in uk from bangladesh",
    /* ── Brand + Geo ── */
    "language academy bangladesh",
    "language academy dhanmondi dhaka",
    "pte course dhanmondi",
  ],
  alternates: {
    canonical: "https://languageacademy.com.bd",
  },
  openGraph: {
    title: "Best PTE Coaching Centre in Dhaka | Online & Offline PTE Course — Language Academy Bangladesh",
    description:
      "#1 PTE coaching in Dhanmondi, Dhaka. AI mock tests, expert trainers, max 12 per batch. PTE, IELTS & Spoken English. Online & offline. Study abroad consulting. Enroll today!",
    url: "https://languageacademy.com.bd",
    images: [{ url: "/hero_banner.webp", width: 1200, height: 630, alt: "Language Academy Bangladesh — Best PTE Coaching Centre in Dhaka with AI mock tests and expert trainers" }],
  },
};

/* ─── Homepage FAQ data (for structured data) ──────────────── */
const homeFaqs = [
  ["What skills are tested in the PTE Listening section?", "Identifying key information from spoken audio clips, understanding different English accents, accurate note-taking under time pressure, identifying errors in spoken content, writing from dictation, and selecting the most appropriate summary."],
  ["How do I choose the right course?", "Start with a free consultation. Our academic advisors assess your current level, timeline, and target score to recommend the perfect course and batch for you."],
  ["Do you offer flexible schedules?", "Yes. We run weekday morning, afternoon, and weekend batches so you can fit serious preparation into your busy routine."],
  ["Is mock test support included?", "Absolutely. All courses include AI-scored full-length mock tests, detailed analytics, and trainer-led review sessions."],
  ["What is the class size?", "We maintain a maximum of 12 students per cohort to ensure personalized attention, stronger accountability, and faster improvement."],
  ["What is the difference between PTE and IELTS?", "PTE Academic is fully computer-based with AI scoring and results in 1\u20132 days, while IELTS has a face-to-face speaking test with results in 3\u201313 days. Both are accepted worldwide. PTE is especially popular for Australia and New Zealand immigration."],
  ["What PTE score do I need to study in Australia?", "For Australian student visas, you typically need a PTE score of 50\u201365 depending on the course. For Skilled Migration (PR), a PTE score of 65+ is generally required, with higher scores earning additional points."],
  ["Do you offer study abroad consulting?", "Yes. Along with PTE and IELTS coaching, we provide study abroad guidance for Australia, Canada, UK, New Zealand, and more. Our advisors help with university selection, visa requirements, and score targets."],
  ["Can I prepare for PTE or IELTS online?", "Yes. Language Academy offers both online and offline classes from our Dhanmondi, Dhaka centre. Online students get the same curriculum, AI mock tests, and trainer support as in-person learners."],
  ["How long does PTE or IELTS preparation take?", "Most students achieve their target score within 4\u20138 weeks of focused preparation. The exact timeline depends on your current English level and target score."],
];

async function getFeaturedCourses() {
  try {
    const res = await fetch(`${getApiBase()}/api/public/courses`, {
      next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return COURSE_FALLBACKS.slice(0, 6);
    const data = await res.json();
    return (Array.isArray(data) && data.length > 0 ? data : COURSE_FALLBACKS).slice(0, 6);
  } catch (error) {
    if (!isProductionBuild) console.error("Error fetching courses:", error);
    return COURSE_FALLBACKS.slice(0, 6);
  }
}

async function getRecentBlogs() {
  try {
    const res = await fetch(`${getApiBase()}/api/public/blog`, {
      next: { revalidate: HOMEPAGE_REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 3);
  } catch (error) {
    if (!isProductionBuild) console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function Home() {
  const [featuredCourses, recentBlogs] = await Promise.all([
    getFeaturedCourses(),
    getRecentBlogs(),
  ]);

  return (
    <>
      {/* FAQ Schema for AI Search — this is what ChatGPT/Perplexity/Google AI Overview parse */}
      <JsonLd data={faqSchema(homeFaqs)} />
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://languageacademy.com.bd" },
      ])} />
      <HomepageClient courses={featuredCourses} blogs={recentBlogs} />
    </>
  );
}
