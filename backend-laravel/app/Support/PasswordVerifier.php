<?php

namespace App\Support;

use Illuminate\Support\Facades\Hash;
use RuntimeException;

class PasswordVerifier
{
    /**
     * @return array{valid: bool, needs_rehash: bool}
     */
    public static function verify(string $plain, ?string $stored): array
    {
        if (!$stored) {
            return ['valid' => false, 'needs_rehash' => false];
        }

        $hash = str_starts_with($stored, '$2b$') ? '$2y$'.substr($stored, 4) : $stored;

        try {
            if (Hash::check($plain, $hash)) {
                return ['valid' => true, 'needs_rehash' => Hash::needsRehash($hash)];
            }
        } catch (RuntimeException) {
            // Some legacy records contain non-bcrypt values. Treat mismatches as invalid, not 500s.
        }

        if (hash_equals($stored, $plain)) {
            return ['valid' => true, 'needs_rehash' => true];
        }

        return ['valid' => false, 'needs_rehash' => false];
    }
}
