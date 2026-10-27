<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RecommendationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'budget_min' => ['nullable', 'integer', 'min:0'],
            'budget_max' => ['required', 'integer', 'min:2000000'],
            'category_id' => ['nullable', 'string', 'exists:categories,id'],
            'preferred_device_type' => ['nullable', 'string', 'in:Laptop,PC Rakitan,Laptop 2-in-1,Mini PC,PC Desktop'],
            'priority_focus' => ['nullable', 'string', 'in:balanced,performance,budget,display,portability'],
            'require_upgradeable_ram' => ['nullable', 'boolean'],
            'require_dedicated_gpu' => ['nullable', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'status_code' => 422,
            'message' => 'Validasi kuesioner rekomendasi gagal',
            'errors' => $validator->errors(),
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ], 422));
    }
}
