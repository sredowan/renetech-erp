<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    protected $table = 'bank_accounts';

    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['balance' => 'decimal:2'];
    }
}
