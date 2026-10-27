<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ComparisonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_ids' => ['required', 'array', 'min:2', 'max:4'],
            'device_ids.*' => ['required', 'string', 'exists:devices,id'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'status_code' => 422,
            'message' => 'Validasi komparasi perangkat gagal',
            'errors' => $validator->errors(),
            'meta' => [
                'system_name' => config('brand.name'),
                'timestamp' => now()->toISOString(),
            ],
        ], 422));
    }
}
