<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReconciliationSession extends Model
{
    protected $table = 'reconciliation_sessions';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return [
            'recon_date' => 'date',
            'total_inflows' => 'decimal:2',
            'total_outflows' => 'decimal:2',
            'total_ledger_net' => 'decimal:2',
            'total_variance' => 'decimal:2',
            'tolerance_bdt' => 'decimal:2',
            'locked_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(ReconciliationLine::class, 'session_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(ReconciliationEvent::class, 'session_id');
    }
}
