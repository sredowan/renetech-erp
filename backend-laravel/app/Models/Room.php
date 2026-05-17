<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $table = 'rooms';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return ['facilities' => 'array'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(RoomBooking::class, 'room_id');
    }
}
