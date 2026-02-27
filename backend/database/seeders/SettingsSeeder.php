<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['site_name', 'La mia vetrina', 'string'],
            ['hero_title', 'Benvenuto', 'string'],
            ['hero_subtitle', 'Scopri i nostri prodotti.', 'string'],
            ['cta_text', 'Contattaci per maggiori informazioni.', 'string'],
            ['footer_text', '© ' . date('Y') . ' — Tutti i diritti riservati.', 'string'],
            ['meta_description', '', 'string'],
        ];

        foreach ($defaults as [$key, $value, $type]) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'type' => $type]
            );
        }
    }
}
