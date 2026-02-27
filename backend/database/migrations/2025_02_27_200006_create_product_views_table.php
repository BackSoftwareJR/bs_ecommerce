<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamp('viewed_at')->useCurrent();
            $table->string('session_id', 100)->nullable();
            $table->string('ip_address', 45)->nullable();

            $table->index(['product_id', 'viewed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_views');
    }
};
