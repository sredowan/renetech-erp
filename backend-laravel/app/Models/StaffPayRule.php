<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffPayRule extends Model
{
    protected $table = 'staff_pay_rules';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return [
            'base_salary' => 'decimal:2',
            'class_rate' => 'decimal:2',
            'hourly_rate' => 'decimal:2',
            'festival_bonus' => 'decimal:2',
            'conveyance_fee' => 'decimal:2',
            'other_allowance' => 'decimal:2',
            'deduction' => 'decimal:2',
            'student_rate' => 'decimal:2',
            'is_payroll_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
