<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductViewController extends Controller
{
    /**
     * Registra una vista sul prodotto (per statistiche).
     * Throttle: 1 vista per prodotto per sessione ogni 24 ore.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->first();
        if (! $product) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $sessionId = $request->session()->getId();
        $cacheKey = 'product_view:' . $product->id . ':' . $sessionId;
        if (Cache::has($cacheKey)) {
            return response()->json(['message' => 'OK']);
        }

        ProductView::create([
            'product_id' => $product->id,
            'viewed_at' => now(),
            'session_id' => $sessionId,
            'ip_address' => $request->ip(),
        ]);

        Cache::put($cacheKey, true, now()->addDay());

        return response()->json(['message' => 'OK']);
    }
}
