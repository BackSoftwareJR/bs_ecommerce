<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ProductViewController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\Admin\CategoryController;
use App\Http\Controllers\Api\Admin\InquiryController;
use App\Http\Controllers\Api\Admin\PageController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProductTagController;
use App\Http\Controllers\Api\Admin\SettingController;
use App\Http\Controllers\Api\Admin\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Rate limiting: throttle:api (default), throttle:auth (login), throttle:sensitive (checkout, etc.)
|
*/

Route::middleware(['throttle:api'])->group(function () {
    // Auth (pubblico)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:web');

    Route::middleware('auth:web')->get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });

    // API pubbliche per il frontend (storefront)
    Route::prefix('public')->group(function () {
        Route::get('/settings', [PublicController::class, 'settings']);
        Route::get('/products', [PublicController::class, 'products']);
        Route::get('/products/{slug}', [PublicController::class, 'productBySlug']);
        Route::post('/products/{slug}/view', [ProductViewController::class, 'store']);
        Route::get('/categories', [PublicController::class, 'categories']);
        Route::get('/pages', [PublicController::class, 'pages']);
        Route::get('/pages/{slug}', [PublicController::class, 'pageBySlug']);
    });

    // Richieste informazioni prodotto (contatti)
    Route::post('/contact/product', [ContactController::class, 'product']);

    // API admin (protette: auth + ruolo admin/editor)
    Route::prefix('admin')->middleware(['auth:web', 'admin'])->group(function () {
        Route::get('/user', function (\Illuminate\Http\Request $request) {
            return $request->user();
        });
        Route::put('/products-reorder', [AdminProductController::class, 'reorder'])->name('admin.products.reorder');
        Route::post('/products/{product}/media', [AdminProductController::class, 'storeMedia'])->name('admin.products.media.store');
        Route::delete('/products/{product}/media/{media}', [AdminProductController::class, 'destroyMedia'])->name('admin.products.media.destroy');
        Route::put('/products/{product}/media-reorder', [AdminProductController::class, 'reorderMedia'])->name('admin.products.media.reorder');
        Route::apiResource('products', AdminProductController::class);
        Route::put('/pages-reorder', [PageController::class, 'reorder'])->name('admin.pages.reorder');
        Route::apiResource('pages', PageController::class);
        Route::get('/inquiries', [InquiryController::class, 'index']);
        Route::get('/inquiries/{product_inquiry}', [InquiryController::class, 'show']);
        Route::put('/inquiries/{product_inquiry}', [InquiryController::class, 'update']);
        Route::get('/stats/overview', [StatsController::class, 'overview']);
        Route::get('/stats/product-views', [StatsController::class, 'productViews']);
        Route::get('/settings', [SettingController::class, 'index']);
        Route::put('/settings', [SettingController::class, 'update']);
        Route::get('/categories', [\App\Http\Controllers\Api\PublicController::class, 'categories']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::apiResource('product-tags', ProductTagController::class)->parameters(['product-tags' => 'productTag']);
    });
});

