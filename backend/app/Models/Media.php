<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $appends = ['url'];

    protected $fillable = [
        'mediaable_type',
        'mediaable_id',
        'disk',
        'path',
        'filename',
        'original_name',
        'mime_type',
        'size',
        'alt',
        'caption',
        'sort_order',
    ];

    public function mediaable(): MorphTo
    {
        return $this->morphTo();
    }

    /** URL pubblico del file (dopo storage:link). */
    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url(rtrim($this->path, '/') . '/' . $this->filename);
    }
}
