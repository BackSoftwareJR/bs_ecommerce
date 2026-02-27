<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductInquiry;
use App\Models\ProductView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function overview(): JsonResponse
    {
        $productsCount = Product::where('is_active', true)->count();
        $pagesCount = \App\Models\Page::where('is_active', true)->count();
        $inquiriesNew = ProductInquiry::where('status', 'new')->count();
        $viewsLast30 = ProductView::where('viewed_at', '>=', now()->subDays(30))->count();

        return response()->json([
            'data' => [
                'products_count' => $productsCount,
                'pages_count' => $pagesCount,
                'inquiries_new_count' => $inquiriesNew,
                'product_views_last_30_days' => $viewsLast30,
            ],
        ]);
    }

    public function productViews(Request $request): JsonResponse
    {
        $days = min(max((int) $request->get('days', 30), 1), 365);
        $limit = min(max((int) $request->get('limit', 20), 1), 100);
        $since = now()->subDays($days);

        $rows = ProductView::query()
            ->where('viewed_at', '>=', $since)
            ->select('product_id', DB::raw('COUNT(*) as views'))
            ->groupBy('product_id')
            ->orderByDesc('views')
            ->limit($limit)
            ->get();

        $productIds = $rows->pluck('product_id')->toArray();
        $products = Product::whereIn('id', $productIds)->get()->keyBy('id');

        $data = $rows->map(function ($row) use ($products) {
            $product = $products->get($row->product_id);
            return [
                'product_id' => $row->product_id,
                'product_name' => $product?->name,
                'product_slug' => $product?->slug,
                'views' => (int) $row->views,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => ['days' => $days, 'limit' => $limit],
        ]);
    }
}
