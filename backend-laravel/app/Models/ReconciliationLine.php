<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReconciliationLine extends Model
{
    protected $table = 'reconciliation_lines';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return [
            'operational_inflows' => 'decimal:2',
            'operational_outflows' => 'decimal:2',
            'operational_net' => 'decimal:2',
            'opening_balance' => 'decimal:2',
            'expected_closing_balance' => 'decimal:2',
            'actual_closing_balance' => 'decimal:2',
            'discrepancy_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'ledger_debit' => 'decimal:2',
            'ledger_credit' => 'decimal:2',
            'ledger_net' => 'decimal:2',
            'variance' => 'decimal:2',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ReconciliationSession::class, 'session_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
