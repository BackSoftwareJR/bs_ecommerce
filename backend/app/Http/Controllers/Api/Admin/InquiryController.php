<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = ProductInquiry::with('product')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        $perPage = min((int) $request->get('per_page', 20), 100);
        $paginated = $q->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(ProductInquiry $product_inquiry): JsonResponse
    {
        $product_inquiry->load('product');
        return response()->json(['data' => $product_inquiry]);
    }

    public function update(Request $request, ProductInquiry $product_inquiry): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:new,read,closed'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $product_inquiry->update($validated);
        return response()->json(['data' => $product_inquiry->load('product')]);
    }
}
