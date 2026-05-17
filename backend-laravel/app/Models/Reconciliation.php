<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reconciliation extends Model
{
    protected $table = 'reconciliations';

    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['statement_date' => 'date', 'reconciled_at' => 'datetime', 'verified' => 'boolean', 'verified_at' => 'datetime'];
    }
}
