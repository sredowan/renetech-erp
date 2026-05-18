import CoursesPageClient from "./CoursesPageClient";
import JsonLd, { courseListSchema, breadcrumbSchema } from "@/components/JsonLd";
import { COURSE_FALLBACKS } from "@/lib/courseFallbacks";
import { fetchPublicJson } from "@/lib/serverApi";


export const metadata = {
  title: "Online PTE Course & IELTS Training | Best PTE Coaching Centre Dhaka",
  description:
    "Enroll in our comprehensive PTE course and IELTS training. Access PTE practice online, AI mock tests, and expert instruction at the best PTE coaching centre in Dhaka.",
  alternates: { canonical: "https://languageacademy.com.bd/courses" },
  openGraph: {
    title: "Online PTE Course & IELTS Training | Language Academy",
    description: "Enroll in our comprehensive PTE course and IELTS training. Access PTE practice online, AI mock tests, and expert instruction.",
    url: "https://languageacademy.com.bd/courses",
    images: [{ url: "/pte_course.webp", width: 1200, height: 630, alt: "Online PTE Course & IELTS Training" }],
  },
};

async function getCourses() {
  const data = await fetchPublicJson("/api/public/courses", { fallback: COURSE_FALLBACKS, requireNonEmptyArray: true });
  return Array.isArray(data) && data.length > 0 ? data : COURSE_FALLBACKS;
}

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <>
      {/* ItemList schema — shows courses as rich cards in Google search */}
      {courses.length > 0 && <JsonLd data={courseListSchema(courses)} />}
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://languageacademy.com.bd" },
        { name: "Courses", url: "https://languageacademy.com.bd/courses" },
      ])} />
      <CoursesPageClient initialCourses={courses} />
    </>
  );
}
