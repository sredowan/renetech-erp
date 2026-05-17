<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    protected $table = 'leave_types';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return ['is_paid' => 'boolean'];
    }
}
