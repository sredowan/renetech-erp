<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    protected $table = 'courses';

    protected $fillable = [
        'branch_id', 'title', 'description', 'category', 'base_fee', 'duration_weeks',
        'slug', 'short_description', 'level', 'image_url', 'instructor_name',
        'instructor_bio', 'instructor_video_url', 'what_you_will_learn', 'modules',
        'tags', 'is_published', 'status',
    ];

    protected function casts(): array
    {
        return [
            'base_fee' => 'decimal:2',
            'what_you_will_learn' => 'array',
            'modules' => 'array',
            'is_published' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class, 'course_id');
    }
}
