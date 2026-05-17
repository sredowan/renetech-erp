<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Resource extends Model
{
    protected $table = 'resources';

    protected $guarded = ['id'];
    protected function casts(): array
    {
        return ['is_free' => 'boolean'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function blogs(): BelongsToMany
    {
        return $this->belongsToMany(BlogPost::class, 'blog_resources', 'resource_id', 'blog_post_id');
    }
}
