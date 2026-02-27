<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
        ]);

        $slug = Str::slug($validated['name']);
        $base = $slug;
        $i = 1;
        while (Category::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }

        $category = Category::create([
            'name'      => $validated['name'],
            'slug'      => $slug,
            'parent_id' => $validated['parent_id'] ?? null,
            'is_active' => true,
        ]);

        return response()->json(['data' => $category], 201);
    }
}
