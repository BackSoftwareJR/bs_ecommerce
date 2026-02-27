<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductTag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Product::with(['category', 'media', 'tags', 'attributes'])
            ->orderBy('sort_order')
            ->orderBy('id');

        if ($request->filled('category_id')) {
            $q->where('category_id', $request->category_id);
        }
        if ($request->filled('tag')) {
            $q->whereHas('tags', fn ($t) => $t->where('slug', $request->tag));
        }
        if ($request->has('is_active')) {
            $q->where('is_active', $request->boolean('is_active'));
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

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateProduct($request);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        if (Product::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
        }

        $product = Product::create($validated);

        $this->syncAttributes($product, $request->input('attributes', []));
        $this->syncTags($product, $request->input('tag_ids', []));

        return response()->json(['data' => $product->load(['category', 'media', 'tags', 'attributes'])], 201);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'media', 'tags', 'attributes']);
        return response()->json(['data' => $product]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $this->validateProduct($request, $product);

        if (isset($validated['slug']) && $validated['slug'] !== $product->slug) {
            if (Product::where('slug', $validated['slug'])->where('id', '!=', $product->id)->exists()) {
                $validated['slug'] = $validated['slug'] . '-' . Str::random(4);
            }
        }

        $product->update($validated);
        $this->syncAttributes($product, $request->input('attributes', []));
        $this->syncTags($product, $request->input('tag_ids', []));

        return response()->json(['data' => $product->load(['category', 'media', 'tags', 'attributes'])]);
    }

    public function destroy(Product $product): JsonResponse
    {
        foreach ($product->media as $media) {
            \Illuminate\Support\Facades\Storage::disk($media->disk)->delete(rtrim($media->path, '/') . '/' . $media->filename);
        }
        $product->delete();
        return response()->json(null, 204);
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:products,id'],
        ]);

        foreach ($validated['ids'] as $i => $id) {
            Product::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }

    public function storeMedia(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'image', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = 'products/' . $product->id;
        $filename = Str::random(20) . '.' . $file->getClientOriginalExtension();

        $file->storeAs($path, $filename, 'public');

        $maxOrder = $product->media()->max('sort_order') ?? -1;

        $media = $product->media()->create([
            'disk' => 'public',
            'path' => $path,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['data' => $media], 201);
    }

    public function destroyMedia(Product $product, Media $media): JsonResponse
    {
        if ($media->mediaable_type !== Product::class || (int) $media->mediaable_id !== (int) $product->id) {
            return response()->json(['message' => 'Media non appartiene al prodotto.'], 404);
        }
        \Illuminate\Support\Facades\Storage::disk($media->disk)->delete(rtrim($media->path, '/') . '/' . $media->filename);
        $media->delete();
        return response()->json(null, 204);
    }

    public function reorderMedia(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'media_ids' => ['required', 'array'],
            'media_ids.*' => ['integer', 'exists:media,id'],
        ]);

        $mediaIds = $validated['media_ids'];
        $productMedia = $product->media()->whereIn('id', $mediaIds)->pluck('id')->toArray();
        if (count($productMedia) !== count($mediaIds)) {
            return response()->json(['message' => 'Alcuni media non appartengono al prodotto.'], 422);
        }

        foreach ($mediaIds as $i => $id) {
            Media::where('id', $id)->update(['sort_order' => $i]);
        }

        return response()->json(['message' => 'Ordine aggiornato.']);
    }

    private function validateProduct(Request $request, ?Product $product = null): array
    {
        $slugRule = ['nullable', 'string', 'max:255'];
        if ($product) {
            $slugRule[] = Rule::unique('products', 'slug')->ignore($product->id);
        } else {
            $slugRule[] = Rule::unique('products', 'slug');
        }

        return $request->validate([
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => $slugRule,
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'video_url' => ['nullable', 'string', 'max:500'],
            'label' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'attributes' => ['array'],
            'attributes.*.label' => ['required', 'string', 'max:255'],
            'attributes.*.value' => ['nullable', 'string', 'max:255'],
            'tag_ids' => ['array'],
            'tag_ids.*' => ['integer', 'exists:product_tags,id'],
        ]);
    }

    private function syncAttributes(Product $product, array $items): void
    {
        $product->attributes()->delete();
        foreach ($items as $i => $item) {
            if (empty($item['label'])) {
                continue;
            }
            $product->attributes()->create([
                'sort_order' => $i,
                'label' => $item['label'],
                'value' => $item['value'] ?? null,
            ]);
        }
    }

    private function syncTags(Product $product, array $tagIds): void
    {
        $product->tags()->sync($tagIds);
    }
}
