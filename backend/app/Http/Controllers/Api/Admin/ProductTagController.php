<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductTagController extends Controller
{
    public function index(): JsonResponse
    {
        $items = ProductTag::orderBy('sort_order')->orderBy('id')->get();
        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        if (ProductTag::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
        }

        $tag = ProductTag::create($validated);
        return response()->json(['data' => $tag], 201);
    }

    public function update(Request $request, ProductTag $productTag): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        if (isset($validated['slug']) && $validated['slug'] !== $productTag->slug) {
            if (ProductTag::where('slug', $validated['slug'])->where('id', '!=', $productTag->id)->exists()) {
                $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
            }
        }

        $productTag->update($validated);
        return response()->json(['data' => $productTag]);
    }

    public function destroy(ProductTag $productTag): JsonResponse
    {
        $productTag->delete();
        return response()->json(null, 204);
    }
}
