"use client";

import { useEffect, useState } from "react";
import { Clock3, MapPin, Phone } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://darkslateblue-cormorant-104679.hostingersite.com";

/**
 * Client component that fetches live branch detail data and re-renders
 * the contact info panel with fresh data from the admin panel.
 * This replaces the stale static-export data without affecting SEO.
 */
export default function BranchDetailLive({ slug, staticBranch }) {
  const [branch, setBranch] = useState(staticBranch);

  useEffect(() => {
    if (!slug) return;
    const base = API_BASE.replace(/\/$/, "").replace(/\/api$/i, "");
    fetch(`${base}/api/public/branches/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setBranch(data);
        }
      })
      .catch(() => {});
  }, [slug]);

  return (
    <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur" data-depth="3">
      <div className="space-y-4 text-sm font-medium text-white/75">
        <p className="flex items-start gap-3"><MapPin className="mt-1 shrink-0 text-accent" size={18} />{branch.address || "Address will be announced soon"}</p>
        {branch.phone && <p className="flex items-center gap-3"><Phone className="shrink-0 text-accent" size={18} />{branch.phone}</p>}
        <p className="flex items-center gap-3"><Clock3 className="shrink-0 text-accent" size={18} />{branch.opening_hours || "Sat-Thu: 9:00 AM - 8:00 PM"}</p>
      </div>
    </div>
  );
}
