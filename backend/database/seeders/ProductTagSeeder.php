<?php

namespace Database\Seeders;

use App\Models\ProductTag;
use Illuminate\Database\Seeder;

class ProductTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            ['name' => 'Nuovo', 'slug' => 'nuovo', 'sort_order' => 1],
            ['name' => 'Ultimi arrivi', 'slug' => 'ultimi-arrivi', 'sort_order' => 2],
            ['name' => 'In offerta', 'slug' => 'in-offerta', 'sort_order' => 3],
            ['name' => 'Bestseller', 'slug' => 'bestseller', 'sort_order' => 4],
        ];

        foreach ($tags as $tag) {
            ProductTag::firstOrCreate(
                ['slug' => $tag['slug']],
                $tag
            );
        }
    }
}
