<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationRule extends Model
{
    protected $table = 'automation_rules';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'config' => 'array'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }
}
