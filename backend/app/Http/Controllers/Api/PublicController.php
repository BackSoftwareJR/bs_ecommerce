<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Page;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    /** Impostazioni sito (chiave-valore per il frontend). */
    public function settings(): JsonResponse
    {
        $items = Setting::all();
        $out = [];
        foreach ($items as $s) {
            $out[$s->key] = $s->typed_value;
        }
        return response()->json($out);
    }

    /** Elenco prodotti (attivi). Filtri: featured, category_id, tag (slug), sort, per_page. */
    public function products(Request $request): JsonResponse
    {
        $q = Product::where('is_active', true)
            ->with(['media', 'tags', 'attributes'])
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($request->boolean('featured')) {
            $q->where('is_featured', true);
        }
        if ($request->filled('category_id')) {
            $q->where('category_id', $request->category_id);
        }
        if ($request->filled('tag')) {
            $q->whereHas('tags', fn ($t) => $t->where('slug', $request->tag));
        }
        if ($request->get('sort') === 'newest') {
            $q->orderByDesc('created_at');
        }

        $perPage = min((int) $request->get('per_page', 24), 100);
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

    /** Singolo prodotto per slug (con media, tags, attributes, video_url, label). */
    public function productBySlug(string $slug): JsonResponse
    {
        $product = Product::where('slug', $slug)
            ->where('is_active', true)
            ->with(['media', 'tags', 'attributes', 'category'])
            ->first();
        if (! $product) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json(['data' => $product]);
    }

    /** Elenco categorie (attive). */
    public function categories(): JsonResponse
    {
        $items = Category::where('is_active', true)->with('children')->orderBy('sort_order')->orderBy('id')->get();
        return response()->json(['data' => $items]);
    }

    /** Elenco pagine (attive). */
    public function pages(): JsonResponse
    {
        $items = Page::where('is_active', true)->orderBy('sort_order')->orderBy('id')->get();
        return response()->json(['data' => $items]);
    }

    /** Singola pagina per slug. */
    public function pageBySlug(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->where('is_active', true)->first();
        if (! $page) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json(['data' => $page]);
    }
}
