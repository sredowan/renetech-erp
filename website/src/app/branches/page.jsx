import { Sparkles } from "lucide-react";
import JsonLd, { breadcrumbSchema } from "@/components/JsonLd";
import { fetchPublicJson } from "@/lib/serverApi";
import BranchListLive from "@/components/BranchListLive";


export const metadata = {
  title: "Our Branches | Best PTE Coaching Centre Dhaka & IELTS Training",
  description: "Find our PTE centre branches in Dhaka. Discover schedules for PTE practice online, offline PTE courses, and IELTS coaching at Language Academy.",
  alternates: { canonical: "https://languageacademy.com.bd/branches" },
};

async function getBranches() {
  const data = await fetchPublicJson("/api/public/branches", { fallback: [], requireNonEmptyArray: true });
  return Array.isArray(data) ? data : [];
}

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://languageacademy.com.bd" },
        { name: "Branches", url: "https://languageacademy.com.bd/branches" },
      ])} />
      <div className="pb-24">
        <section className="relative overflow-hidden pb-14 pt-8 md:pb-20 md:pt-14" data-depth="0">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" data-depth="1" />
          <div className="container-shell text-center" data-depth="4">
            <span className="eyebrow"><Sparkles size={14} /> Branch Network</span>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold text-slate-900 md:text-6xl">Choose your Language Academy branch.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">Each active branch has its own courses, batches, posts, and booking links. Upcoming locations are marked as coming soon.</p>
          </div>
        </section>

        <BranchListLive staticBranches={branches} />
      </div>
    </>
  );
}
