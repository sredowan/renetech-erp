<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    protected $table = 'students';

    protected $fillable = [
        'user_id',
        'branch_id',
        'batch_id',
        'guardian_id',
        'first_name',
        'middle_name',
        'last_name',
        'mobile_no',
        'date_of_birth',
        'plan_type',
        'premium_expiry_date',
        'status',
        'photograph_url',
        'educational_details',
        'employment_details',
        'active_devices',
        'target_score',
        'exam_date',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
            'premium_expiry_date' => 'datetime',
            'active_devices' => 'array',
            'educational_details' => 'array',
            'employment_details' => 'array',
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

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class, 'student_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'student_id');
    }
}
