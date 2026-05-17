<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class RbacConfig extends Model
{
    protected $table = 'rbac_configs';

    protected $fillable = [
        'config_json',
        'custom_roles_json',
        'updated_by',
    ];

    protected function configJson(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $this->decodeJson($value, []),
            set: fn ($value) => is_string($value) ? $value : json_encode($value ?: new \stdClass()),
        );
    }

    protected function customRolesJson(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $this->decodeJson($value, []),
            set: fn ($value) => is_string($value) ? $value : json_encode($value ?: []),
        );
    }

    private function decodeJson(mixed $value, mixed $fallback): mixed
    {
        if (is_array($value)) {
            return $value;
        }

        $decoded = json_decode((string) $value, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : $fallback;
    }
}
