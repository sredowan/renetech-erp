"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3, MapPin, Phone } from "lucide-react";
import { getPublicImageUrl } from "@/lib/imageUrl";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://darkslateblue-cormorant-104679.hostingersite.com";

function BranchCardClient({ branch }) {
  const branchImage = getPublicImageUrl(branch.hero_image_url, "/hero_banner.webp");
  const active = !!branch.is_active;
  const content = (
    <div className="group relative h-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)]" data-depth="3">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={branchImage} alt={branch.public_title || branch.name} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" aria-hidden="true" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-900">{branch.type === "head" ? "HQ" : "Branch"}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] ${active ? "bg-emerald-500 text-white" : "bg-amber-400 text-slate-950"}`}>{active ? "Open" : "Coming Soon"}</span>
        </div>
      </div>
      <div className="p-7">
        <h2 className="text-2xl font-extrabold text-slate-900">{branch.public_title || `Language Academy ${branch.name}`}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{active ? branch.public_description : (branch.coming_soon_message || "Admissions and course schedules for this branch will be announced soon.")}</p>
        <div className="mt-6 space-y-3 text-sm font-medium text-slate-500">
          <p className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0 text-primary" />{branch.address || "Address will be announced soon"}</p>
          {branch.phone && <p className="flex items-center gap-2"><Phone size={16} className="shrink-0 text-primary" />{branch.phone}</p>}
          <p className="flex items-center gap-2"><Clock3 size={16} className="shrink-0 text-primary" />{branch.opening_hours || "Sat-Thu: 9:00 AM - 8:00 PM"}</p>
        </div>
        {active ? (
          <div className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-primary">View branch courses <ArrowRight size={16} /></div>
        ) : (
          <div className="mt-7 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">Coming soon</div>
        )}
      </div>
    </div>
  );

  return active ? <Link href={`/branches/${branch.slug || branch.id}`} className="block h-full">{content}</Link> : content;
}

/**
 * Client component that fetches live branch data and overlays it on top of
 * the static-rendered branch cards.
 */
export default function BranchListLive({ staticBranches }) {
  const [liveBranches, setLiveBranches] = useState(null);

  useEffect(() => {
    const base = API_BASE.replace(/\/$/, "").replace(/\/api$/i, "");
    fetch(`${base}/api/public/branches`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveBranches(data);
        }
      })
      .catch(() => {});
  }, []);

  const branches = liveBranches || staticBranches;

  return (
    <section className="container-shell grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-depth="4">
      {branches.map((branch) => <BranchCardClient key={branch.id} branch={branch} />)}
      {branches.length === 0 && (
        <div className="premium-panel p-10 text-center md:col-span-2 lg:col-span-3">
          <h2 className="text-2xl font-extrabold text-slate-900">No branches found</h2>
          <p className="mt-3 text-slate-500">Please check back soon or contact our main campus.</p>
        </div>
      )}
    </section>
  );
}
