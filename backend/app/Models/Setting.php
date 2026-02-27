<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    /** Restituisce il valore tipizzato. */
    public function getTypedValueAttribute(): mixed
    {
        return match ($this->type) {
            'boolean' => filter_var($this->value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($this->value, true),
            default => $this->value,
        };
    }

    /** Recupera un setting per chiave (con cache opzionale). */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->typed_value : $default;
    }

    /** Imposta un setting per chiave. */
    public static function setValue(string $key, mixed $value, string $type = 'string'): void
    {
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        }
        if (is_bool($value)) {
            $value = $value ? '1' : '0';
            $type = 'boolean';
        }

        static::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value, 'type' => $type]
        );
        Cache::forget('settings');
    }
}
