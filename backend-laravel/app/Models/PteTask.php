<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PteTask extends Model
{
    protected $table = 'pte_tasks';

    protected $fillable = ['section', 'type', 'content', 'correct_answer', 'max_score', 'is_free_available', 'is_premium_only'];

    protected function casts(): array
    {
        return [
            'content' => 'array',
            'correct_answer' => 'array',
            'is_free_available' => 'boolean',
            'is_premium_only' => 'boolean',
        ];
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(PteAttempt::class, 'task_id');
    }
}
