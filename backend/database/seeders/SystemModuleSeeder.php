<?php

namespace Database\Seeders;

use App\Models\SystemModule;
use Illuminate\Database\Seeder;

class SystemModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            ['name' => 'ecommerce', 'is_active' => false, 'description' => 'E-commerce (products, cart, checkout)'],
            ['name' => 'stripe', 'is_active' => false, 'description' => 'Stripe payments'],
            ['name' => 'blog', 'is_active' => false, 'description' => 'Blog'],
            ['name' => 'portfolio', 'is_active' => false, 'description' => 'Portfolio'],
        ];

        foreach ($modules as $module) {
            SystemModule::updateOrCreate(
                ['name' => $module['name']],
                $module
            );
        }
    }
}
