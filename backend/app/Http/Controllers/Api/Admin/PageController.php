<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Page::orderBy('sort_order')->orderBy('id')->get();
        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title']);
        if (Page::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
        }

        $page = Page::create($validated);
        return response()->json(['data' => $page], 201);
    }

    public function show(Page $page): JsonResponse
    {
        return response()->json(['data' => $page]);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        if (isset($validated['slug']) && $validated['slug'] !== $page->slug) {
            if (Page::where('slug', $validated['slug'])->where('id', '!=', $page->id)->exists()) {
                $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
            }
        }

        $page->update($validated);
        return response()->json(['data' => $page]);
    }

    public function destroy(Page $page): JsonResponse
    {
        $page->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:pages,id'],
        ]);

        foreach ($validated['ids'] as $i => $id) {
            Page::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }
}
