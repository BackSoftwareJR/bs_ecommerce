<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Setting::all();
        $out = [];
        foreach ($items as $s) {
            $out[$s->key] = [
                'value' => $s->typed_value,
                'type' => $s->type,
            ];
        }
        return response()->json(['data' => $out]);
    }

    public function update(Request $request): JsonResponse
    {
        $payload = $request->all();
        if (isset($payload['settings']) && is_array($payload['settings'])) {
            foreach ($payload['settings'] as $item) {
                $key = $item['key'] ?? null;
                if (!$key) continue;
                $value = $item['value'] ?? null;
                $type = $item['type'] ?? 'string';
                $this->setOne($key, $value, $type);
            }
        } else {
            foreach ($payload as $key => $value) {
                if (is_string($key) && $key !== '') {
                    $this->setOne($key, $value, 'string');
                }
            }
        }

        return response()->json(['message' => 'Impostazioni aggiornate.']);
    }

    private function setOne(string $key, mixed $value, string $type = 'string'): void
    {
        if (is_bool($value)) {
            $value = $value ? '1' : '0';
            $type = 'boolean';
        }
        if (is_array($value) || is_object($value)) {
            $value = json_encode($value);
            $type = 'json';
        }
        Setting::setValue($key, (string) $value, $type);
    }
}
