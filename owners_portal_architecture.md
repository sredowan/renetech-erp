# Global Owners Portal: Architecture & Blueprint

## Vision & Objective
While the current Admin Portal effectively functions as the operating system for **Language Academy Main HQ**, a centralized **Owners Portal** is planned to sit one level above the operational hierarchy. 

This overarching dashboard will act as a *Super-Admin Command Center*, granting franchise owners and key stakeholders a bird's-eye view over an unlimited number of future branches without cluttering the day-to-day operations of the HQ portal.

---

## 1. Multi-Tenant Branch Management Structure
The entire system relies heavily on the `branch_id` database index.
- **Admin Portals (Current):** Restricted automatically via JWT middleware to only fetch `students`, `teachers`, `ledgers`, and `transactions` where `branch_id = X`.
- **Owners Portal (Future):** Exempt from the strict `branch_id` lockdown, performing grouped aggregations (`GROUP BY branch_id`) to generate organization-wide metrics.

### Key Capabilities:
- **Branch Provisioning:** Owners can create a new Branch Profile (e.g., "Language Academy - Uttara"). Doing so instantly spins up an isolated logical database environment for that branch.
- **Master Metrics Dashboard:** Aggregate P&L, global revenue streams, and cross-branch performance comparisons on a single screen.

---

## 2. Global Views & Reporting
The Owners Portal will feature dedicated screens summarizing the entire enterprise macro-ecosystem:

1. **Global Financial Ledger:** 
   - Unified chart of accounts showing total Cash, absolute Revenue, and consolidated Expenses across *all* branches.
   - Real-time aggregation of branch-specific bank accounts vs HQ bank accounts.
2. **Global HR & Resource Tracker:**
   - Central directory of all teachers and staff mapped to their respective branches.
   - Asset tracking for all physical equipment (PCs, projectors, furniture) allocated to various physical spaces globally.
3. **Student Distribution Map:**
   - Live heatmaps and charts showing batch enrollments, pipeline conversions, and top-performing courses mapped by geometric branch origin.

---

## 3. Implementation Roadmap
When it is time to build this portal, the technical approach will be:
1. **Frontend Bootstrapping:** Clone the existing Admin Portal scaffolding but strip out operational tasks (like "Collect Fee" or "Add Student"). Replace these with purely analytical read-only charts and "Create Branch" forms.
2. **Backend Unlocking:** Create a new subset of `/api/global/...` routes specifically protected by a `super_owner` role middleware that executes queries without the `where { branch_id }` limitation, returning global multi-dimensional arrays.
3. **Deploy:** Mount the frontend on a subdomain like `owners.languageacademy.tech`.
