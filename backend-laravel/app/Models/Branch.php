<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends Model
{
    protected $table = 'branches';

    protected $fillable = [
        'name',
        'code',
        'slug',
        'type',
        'address',
        'phone',
        'email',
        'public_title',
        'public_description',
        'seo_title',
        'seo_description',
        'hero_image_url',
        'opening_hours',
        'map_url',
        'coming_soon_message',
        'is_active',
        'manager_id',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'branch_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'branch_id');
    }

    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'branch_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'branch_id');
    }
}
