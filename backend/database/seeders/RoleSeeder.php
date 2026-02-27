<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Requires: composer require spatie/laravel-permission && php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
     */
    public function run(): void
    {
        if (! class_exists(\Spatie\Permission\Models\Role::class)) {
            return;
        }

        $roles = ['SuperAdmin', 'Admin', 'Editor', 'User'];

        foreach ($roles as $name) {
            \Spatie\Permission\Models\Role::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
    }
}
