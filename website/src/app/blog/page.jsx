import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import { getPublicImageUrl } from "@/lib/imageUrl";
import { fetchPublicJson } from "@/lib/serverApi";
import LearningHubClient from "@/components/blog/LearningHubClient";


export const metadata = {
  title: "PTE & IELTS Blog | Tips & PTE Practice Online Resources",
  description:
    "Explore expert tips for PTE and IELTS. Get free resources, online PTE course materials, and study abroad guides from the best PTE coaching centre in Dhaka.",
  alternates: { canonical: "https://languageacademy.com.bd/blog" },
  openGraph: {
    title: "PTE & IELTS Blog | Language Academy",
    description: "Explore expert tips for PTE and IELTS. Get free resources, online PTE course materials, and study abroad guides.",
    url: "https://languageacademy.com.bd/blog",
    images: [{ url: "/hero_banner.webp", width: 1200, height: 630, alt: "Language Academy Learning Hub" }],
  },
};

async function getBlogs() {
  return fetchPublicJson("/api/public/blog", { fallback: [], requireNonEmptyArray: true });
}

async function getResources() {
  return fetchPublicJson("/api/public/resources", { fallback: [] });
}

export default async function LearningHubPage() {
  const blogs = await getBlogs();
  const resources = await getResources();

  return <LearningHubClient blogs={blogs} resources={resources} />;
}
