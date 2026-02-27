<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    /**
     * Endpoint per richieste informazioni su un prodotto.
     * Salva in product_inquiries (product_id da product_slug se presente).
     *
     * Payload atteso (JSON):
     * - product_slug (string, opzionale)
     * - name (string, obbligatorio)
     * - email (string, obbligatorio)
     * - message (string, obbligatorio)
     */
    public function product(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_slug' => ['nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $productId = null;
        if (! empty($validated['product_slug'])) {
            $product = Product::where('slug', $validated['product_slug'])->first();
            $productId = $product?->id;
        }

        ProductInquiry::create([
            'product_id' => $productId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message' => $validated['message'],
            'status' => 'new',
        ]);

        return response()->json([
            'status' => 'ok',
            'message' => 'Richiesta ricevuta. Verrai ricontattato al più presto.',
        ]);
    }
}

