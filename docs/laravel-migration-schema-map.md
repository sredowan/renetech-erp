# Laravel Migration Schema Map

Source: `backend/models/*.js` Sequelize definitions.

Important: actual inventory found 61 model files. The earlier plan said 62. Treat 61 as the current code inventory unless DB schema export shows an extra unmanaged table.

## Model To Table Map

| Sequelize Model | MySQL Table | Laravel Model |
| --- | --- | --- |
| Account | `accounts` | `App\Models\Account` |
| Activity | `crm_activities` | `App\Models\Activity` |
| Applicant | `applicants` | `App\Models\Applicant` |
| Asset | `assets` | `App\Models\Asset` |
| Attendance | `attendance` | `App\Models\Attendance` |
| AuditLog | `audit_logs` | `App\Models\AuditLog` |
| BankAccount | `bank_accounts` | `App\Models\BankAccount` |
| BankAccountLedgerMap | `bank_account_ledger_maps` | `App\Models\BankAccountLedgerMap` |
| BankStatementLine | `bank_statement_lines` | `App\Models\BankStatementLine` |
| Batch | `batches` | `App\Models\Batch` |
| BlogPost | `blog_posts` | `App\Models\BlogPost` |
| BlogResource | `blog_resources` | `App\Models\BlogResource` |
| Branch | `branches` | `App\Models\Branch` |
| Budget | `budgets` | `App\Models\Budget` |
| CampaignTemplate | `campaign_templates` | `App\Models\CampaignTemplate` |
| Contact | `contacts` | `App\Models\Contact` |
| Course | `courses` | `App\Models\Course` |
| Customer | `customers` | `App\Models\Customer` |
| Enrollment | `enrollments` | `App\Models\Enrollment` |
| Expense | `expenses` | `App\Models\Expense` |
| ExpenseCategory | `expense_categories` | `App\Models\ExpenseCategory` |
| IncomeCategory | `income_categories` | `App\Models\IncomeCategory` |
| Invoice | `invoices` | `App\Models\Invoice` |
| JobPosting | `job_postings` | `App\Models\JobPosting` |
| JournalEntry | `journal_entries` | `App\Models\JournalEntry` |
| JournalLine | `journal_lines` | `App\Models\JournalLine` |
| Lead | `leads` | `App\Models\Lead` |
| LeaveBalance | `leave_balances` | `App\Models\LeaveBalance` |
| LeaveRequest | `leave_requests` | `App\Models\LeaveRequest` |
| LeaveType | `leave_types` | `App\Models\LeaveType` |
| LiquidityMovement | `liquidity_movements` | `App\Models\LiquidityMovement` |
| Material | `materials` | `App\Models\Material` |
| Notification | `notifications` | `App\Models\Notification` |
| Opportunity | `opportunities` | `App\Models\Opportunity` |
| Payroll | `payrolls` | `App\Models\Payroll` |
| PayrollBonus | `payroll_bonuses` | `App\Models\PayrollBonus` |
| PayrollDeduction | `payroll_deductions` | `App\Models\PayrollDeduction` |
| PerformanceReview | `performance_reviews` | `App\Models\PerformanceReview` |
| PteAttempt | `pte_attempts` | `App\Models\PteAttempt` |
| PteTask | `pte_tasks` | `App\Models\PteTask` |
| RbacConfig | `rbac_configs` | `App\Models\RbacConfig` |
| Reconciliation | `reconciliations` | `App\Models\Reconciliation` |
| ReconciliationEvent | `reconciliation_events` | `App\Models\ReconciliationEvent` |
| ReconciliationLine | `reconciliation_lines` | `App\Models\ReconciliationLine` |
| ReconciliationMatch | `reconciliation_matches` | `App\Models\ReconciliationMatch` |
| ReconciliationSession | `reconciliation_sessions` | `App\Models\ReconciliationSession` |
| Resource | `resources` | `App\Models\Resource` |
| Room | `rooms` | `App\Models\Room` |
| RoomBooking | `room_bookings` | `App\Models\RoomBooking` |
| Rule | `automation_rules` | `App\Models\AutomationRule` |
| Shift | `shifts` | `App\Models\Shift` |
| StaffAttendance | `staff_attendance` | `App\Models\StaffAttendance` |
| StaffDocument | `staff_documents` | `App\Models\StaffDocument` |
| StaffPayRule | `staff_pay_rules` | `App\Models\StaffPayRule` |
| StaffProfile | `staff_profiles` | `App\Models\StaffProfile` |
| StaffSchedule | `staff_schedules` | `App\Models\StaffSchedule` |
| Student | `students` | `App\Models\Student` |
| SystemSetting | `system_settings` | `App\Models\SystemSetting` |
| TeacherSession | `teacher_sessions` | `App\Models\TeacherSession` |
| Transaction | `transactions` | `App\Models\Transaction` |
| User | `users` | `App\Models\User` |

## Implemented Eloquent Models

- Phase 1: `User`, `Branch`, `Student`, `RbacConfig`, `SystemSetting`.
- Phase 2: `Course`, `Batch`, `Enrollment`, `Attendance`, `Material`, `PteTask`, `PteAttempt`, `Activity`.
- Phase 3: `Account`, `JournalEntry`, `JournalLine`, `AuditLog`, `Transaction`, `Invoice`, `Customer`, `IncomeCategory`, `Expense`, `ExpenseCategory`, `Budget`, `Asset`, `BankAccount`, `BankAccountLedgerMap`, `LiquidityMovement`, `Reconciliation`, `ReconciliationSession`, `ReconciliationLine`, `ReconciliationEvent`, `ReconciliationMatch`, `BankStatementLine`.
- Phase 4: `StaffProfile`, `StaffAttendance`, `LeaveType`, `LeaveRequest`, `LeaveBalance`, `JobPosting`, `Applicant`, `StaffDocument`, `PerformanceReview`, `Shift`, `StaffSchedule`, `Payroll`, `PayrollBonus`, `PayrollDeduction`, `StaffPayRule`, `TeacherSession`.
- Phase 5: `Lead`, `Contact`, `Opportunity`, `CampaignTemplate`, `AutomationRule`, `Notification`.

## Eloquent Mapping Rules

Every Laravel model must explicitly declare these until schema parity is proven:

```php
protected $table = 'existing_table_name';
protected $primaryKey = 'id';
public $timestamps = true; // only where existing table has timestamps
```

Use casts for Sequelize `JSON`, `BOOLEAN`, `DATE`, `DATEONLY`, and decimal money fields.

## Schema Safety Notes

- Current Node startup calls `model.sync()` for many models. Laravel must not copy this behavior against production.
- `backend/server.js` blocks `DB_SYNC_ALTER=true` in production. Laravel should be stricter: no production migration until manually approved.
- Existing code uses `schemaSafe.js` to tolerate missing columns. Laravel migration must detect actual columns before assuming fields exist.
- Generate schema export before writing migrations: `mysqldump --no-data` outside the app docs.
- Laravel migrations should initially be documentation/parity migrations only, not production-altering migrations.

## High-Risk Schema Areas

- Financial tables: `journal_entries`, `journal_lines`, `accounts`, `transactions`, `invoices`, `expenses`, `reconciliation_*`.
- Auth tables: `users`, `students`, `rbac_configs`, `system_settings`.
- Upload-backed tables: `students`, `branches`, `courses`, `blog_posts`, `resources`, `assets`, `expenses`, `staff_documents`.
- Automation tables: `automation_rules`, `notifications`, birthday and monthly report tracking fields.
