<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Middleware that converts snake_case Eloquent relation keys in JSON responses
 * to PascalCase to match the legacy Node.js/Sequelize convention that the
 * React admin-portal frontend expects.
 *
 * Only known relation keys are converted so plain data fields (like "status",
 * "branch_id") are left untouched.
 */
class PascalCaseRelations
{
    /**
     * Map of snake_case relation keys => PascalCase equivalents.
     * Only keys present in this map are renamed.
     */
    private const KEY_MAP = [
        'user'              => 'User',
        'batch'             => 'Batch',
        'course'            => 'Course',
        'branch'            => 'Branch',
        'student'           => 'Student',
        'enrollment'        => 'Enrollment',
        'enrollments'       => 'Enrollments',
        'invoice'           => 'Invoice',
        'invoices'          => 'Invoices',
        'lead'              => 'Lead',
        'contact'           => 'Contact',
        'opportunity'       => 'Opportunity',
        'account'           => 'Account',
        'transaction'       => 'Transaction',
        'transactions'      => 'Transactions',
        'recorder'          => 'Recorder',
        'staff'             => 'Staff',
        'category'          => 'Category',
        'customer'          => 'Customer',
        'creator'           => 'Creator',
        'trainer'           => 'Trainer',
        'counselor'         => 'Counselor',
        'manager'           => 'Manager',
        'income_category'   => 'IncomeCategory',
        'expense_category'  => 'ExpenseCategory',
        'staff_profile'     => 'StaffProfile',
        'staff_pay_rule'    => 'StaffPayRule',
        'debit_account'     => 'DebitAccount',
        'credit_account'    => 'CreditAccount',
        'accounts'          => 'Accounts',
        'journal_entries'   => 'JournalEntries',
        'journal_entry'     => 'JournalEntry',
        'poster'            => 'Poster',
        'uploader'          => 'Uploader',
        'lines'             => 'Lines',
        'members'           => 'Members',
        'activities'        => 'Activities',
        'payments'          => 'Payments',
        'students'          => 'Students',
        'batches'           => 'Batches',
        'courses'           => 'Courses',
        'staff_profiles'    => 'StaffProfiles',
        'staff_attendances' => 'StaffAttendances',
        'employee'          => 'Employee',
        'approver'          => 'Approver',
        'reviewer'          => 'Reviewer',
        'leave_type'        => 'LeaveType',
        'job_posting'       => 'JobPosting',
        'shift'             => 'Shift',
        'applicants'        => 'Applicants',
    ];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            if ($request->is('api/*/auth/*') || $request->is('api/auth/*')) {
                return $response;
            }

            $data = $response->getData(true);
            $data = $this->transformKeys($data);
            $response->setData($data);
        }

        return $response;
    }

    /**
     * Recursively walk the response array and rename known relation keys.
     */
    private function transformKeys($data)
    {
        if (!is_array($data)) {
            return $data;
        }

        $result = [];
        foreach ($data as $key => $value) {
            // Recurse into nested arrays/objects
            $value = $this->transformKeys($value);

            // Check if this key should be renamed
            if (is_string($key) && isset(self::KEY_MAP[$key])) {
                // Only rename if value looks like a relation (object or array of objects, or null)
                if ($this->looksLikeRelation($value)) {
                    $result[self::KEY_MAP[$key]] = $value;
                    continue;
                }
            }

            $result[$key] = $value;
        }

        return $result;
    }

    /**
     * Determine if a value "looks like" an Eloquent relation:
     * - null (not loaded / empty)
     * - associative array (single belongsTo)
     * - sequential array of associative arrays (hasMany)
     */
    private function looksLikeRelation($value): bool
    {
        if ($value === null) return true;
        if (!is_array($value)) return false;

        // Empty array is ambiguous but treat as relation (empty hasMany)
        if (empty($value)) return true;

        // Sequential (indexed) array — check first element is associative
        if (array_is_list($value)) {
            return is_array($value[0] ?? null);
        }

        // Associative array — looks like an object/model
        return true;
    }
}
