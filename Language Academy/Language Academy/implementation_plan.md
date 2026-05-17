# Implementation Plan - Renetech Stitch Full-Stack App (v2)

## Goal
Build a multi-branch language academy management system based on the "Stitch" design system. The app includes an Admin/Staff React portal with a "Control Center" for the head branch, a Student Flutter mobile app, and an Express Node.js backend with a remote MySQL database.

## Proposed Changes

### [Backend] Multi-Branch Express API
- **Branch Hierarchy**: Every entity is scoped by `branch_id`. 
- **Control Logic**: 
  - `branch_id` is automatically injected into queries for branch-level users.
  - Head branch admins (`role: super_admin`) can bypass branch filters or use `?branchId=all` for global aggregates.
- **Advanced Accounting**:
  - Double-entry journaling system linked to POS and Expenses.
  - Automatic journal creation on fee collection and payroll processing.
- **Reconciliation Engine**: 
  - CSV/OFX import for bank statements.
  - Smart matching algorithm based on date, amount, and reference.

### [Database] Schema Updates
Implemented in [database_design.md](file:///C:/Users/Redowan%20Sayem/.gemini/antigravity/brain/00037fc4-0617-4291-8e51-4d5e1743fd30/database_design.md):
- `branches`: Registry for head and local branches.
- `accounts` & `journal_entries`: Double-entry accounting core.
- `bank_statement_lines` & `reconciliations`: Reconciliation system.
- `report_configs`: Global and branch-specific reporting.

### [Frontend - React] Control Center & Global Dashboard
- **Global View**: Head branch users see a "Global Selector" in the top bar to switch between branches or view "All Branches" (Consolidated).
- **Consolidated Dashboard**: Aggregate metrics (Revenue, Leads, Attendance) across the entire agency.
- **Accounting Workspace**: 
  - Ledger viewer with branch filtering.
  - Reconciliation wizard (split screens: Bank vs Book).
- **Reports Builder**: Generate P&L, Balance Sheet, and Cash Flow per branch or consolidated.

---

## Step-by-Step Guidelines & Prompts for Antigravity

### Phase 1: Core Multi-Branch Infrastructure
1. "Update the backend to include `branch_id` in all core models. Create a `Branch` model and link it as a foreign key to Users, Students, Leads, and Transactions."
2. "Implement a 'Global Context' middleware for the head branch. If a user is from the head branch, allow them to view and filter data across all branches."

### Phase 2: Advanced Accounting & Reconciliation
1. "Implement the double-entry accounting engine: Create `/journal` endpoints and ensure every transaction (Fee payment, Expense, Payroll) creates corresponding journal lines in the `journal_lines` table."
2. "Build the Bank Reconciliation API: Create a route to upload bank statements and another to fetch potential matches from the general ledger."

### Phase 3: Reporting & Global Dashboard
1. "Develop the Report Engine: Create an endpoint that aggregates financial data by `branch_id` to generate individual and consolidated P&L statements."
2. "Update the Dashboard API: Return global statistics (total students across all branches, total revenue sum, avg PTE score agency-wide) for head branch admins."

### Phase 4: Frontend Branch Switching
1. "Add a Branch Switcher component to the Sidebar/Topbar. Store the active `branchId` in a global React context."
2. "Update the Dashboard view to display consolidated charts when 'All Branches' is selected."

## Verification Plan

### Automated Tests
- Test cases for 'Cross-Branch Security': Ensure a branch admin cannot access data from another branch by changing the `branch_id` in the API request.
- Reconciliation logic tests: Verify that matching a statement line correctly updates its `is_matched` status and balances.

### Manual Verification
- **Global Control**: Log in as a Head Branch Admin -> Switch between Branch A and Branch B -> Verify that charts and tables update correctly.
- **Consolidated Report**: Log in as Head Branch Admin -> Generate "Global P&L" -> Verify that the sum matches the individual branch reports.
- **Reconciliation**: Upload a sample bank CSV -> Use the UI to match it with a 'POS Fee' transaction -> Check ledger balance.
