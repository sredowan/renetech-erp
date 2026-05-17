<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogResource extends Model
{
    protected $table = 'blog_resources';

    public $timestamps = false;
    protected $guarded = ['id'];
}
