<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'short_description',
        'description',
        'price',
        'compare_at_price',
        'is_active',
        'is_featured',
        'sort_order',
        'meta_title',
        'meta_description',
        'video_url',
        'label',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function media(): MorphMany
    {
        return $this->morphMany(Media::class, 'mediaable')->orderBy('sort_order');
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(ProductAttribute::class, 'product_id')->orderBy('sort_order');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(ProductTag::class, 'product_product_tag')
            ->withTimestamps();
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(ProductInquiry::class, 'product_id');
    }

    public function views(): HasMany
    {
        return $this->hasMany(ProductView::class, 'product_id');
    }
}
