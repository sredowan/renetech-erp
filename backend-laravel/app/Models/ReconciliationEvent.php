<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReconciliationEvent extends Model
{
    protected $table = 'reconciliation_events';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return ['old_value' => 'array', 'new_value' => 'array'];
    }
}
