export const STATIC_BRANCHES = [
  {
    id: 1,
    name: "Dhanmondi Branch HQ",
    slug: "dhanmondi-branch-hq",
    public_title: "Language Academy Dhanmondi Branch HQ",
    public_description: "PTE, IELTS, and English language coaching from our Dhanmondi branch.",
    address: "Dhanmondi, Dhaka",
    is_active: true,
  },
  {
    id: 2,
    name: "Mirpur",
    slug: "mirpur",
    public_title: "Language Academy Mirpur",
    public_description: "PTE, IELTS, and English language coaching from our Mirpur branch.",
    address: "Mirpur, Dhaka",
    is_active: true,
  },
];

export const STATIC_BLOG_SLUGS = [
  "pte-academic-preparation-guide-2026",
  "pte-speaking-module-tips-2026",
  "pte-writing-module-mastery-guide",
  "pte-reading-module-strategies-2026",
  "ielts-preparation-guide-2026",
  "pte-listening-module-guide-2026",
  "ielts-vs-pte-comparison-2026",
  "how-to-achieve-ielts-band-7-score",
  "complete-study-abroad-guide-2026",
  "ielts-writing-task-2-essay-guide",
  "study-in-australia-guide-2026",
  "study-in-uk-guide-2026",
  "study-in-canada-guide-2026",
  "top-scholarships-international-students-2026",
  "ielts-speaking-test-tips-2026",
  "study-in-usa-guide-2026",
  "mastering-ielts-30-days-test-2",
];

export function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStaticBranch(slug) {
  return STATIC_BRANCHES.find((branch) => branch.slug === slug) || null;
}

export function getStaticBlog(slug) {
  if (!STATIC_BLOG_SLUGS.includes(slug)) return null;

  const title = titleFromSlug(slug);
  return {
    id: slug,
    slug,
    title,
    excerpt: `Read ${title} from Language Academy Bangladesh.`,
    content: `<p>${title} is available from Language Academy Bangladesh. Please contact our counselors for the latest details and personalized guidance.</p>`,
    category: slug.includes("ielts") ? "IELTS" : slug.includes("study") ? "Study Abroad" : "PTE",
    reading_time: 5,
    published_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
  };
}
