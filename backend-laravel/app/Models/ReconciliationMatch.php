<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReconciliationMatch extends Model
{
    protected $table = 'reconciliation_matches';

    protected $keyType = 'string';
    public $incrementing = false;
    protected $guarded = ['id'];
}
