<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Page extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'body',
        'meta_title',
        'meta_description',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediaable')->orderBy('sort_order');
    }
}
