<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PteAttempt extends Model
{
    protected $table = 'pte_attempts';

    protected $fillable = ['branch_id', 'student_id', 'task_id', 'response', 'score', 'evaluation', 'is_mock_test'];

    protected function casts(): array
    {
        return [
            'response' => 'array',
            'evaluation' => 'array',
            'score' => 'decimal:2',
            'is_mock_test' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'student_id');
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(PteTask::class, 'task_id');
    }
}
