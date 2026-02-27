<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('mediaable_type');
            $table->unsignedBigInteger('mediaable_id');
            $table->string('disk')->default('public');
            $table->string('path');
            $table->string('filename');
            $table->string('original_name')->nullable();
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size')->default(0);
            $table->string('alt', 255)->nullable();
            $table->string('caption', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['mediaable_type', 'mediaable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
