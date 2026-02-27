<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

Route::get('/', function () {
    return view('welcome');
});

// Route temporanea per generare una APP_KEY da usare in .env
// IMPORTANTE: elimina questa route dopo aver copiato la chiave.
Route::get('/tmp-generate-app-key', function () {
    $key = 'base64:'.base64_encode(random_bytes(32));

    return response()->json([
        'app_key' => $key,
    ]);
});
