"use client";

import { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://darkslateblue-cormorant-104679.hostingersite.com";

/**
 * Client component that fetches live branch data from the API
 * and re-renders with fresh details (phone, address, opening hours, etc.)
 * This solves the static-export staleness problem — the static HTML provides
 * the initial SEO render, and this component hydrates with live data.
 */
export function useLiveBranches() {
  const [branches, setBranches] = useState(null);

  useEffect(() => {
    const base = API_BASE.replace(/\/$/, "").replace(/\/api$/i, "");
    fetch(`${base}/api/public/branches`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
        }
      })
      .catch(() => {});
  }, []);

  return branches;
}

export function useLiveBranch(slug) {
  const [branch, setBranch] = useState(null);

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

  return branch;
}
