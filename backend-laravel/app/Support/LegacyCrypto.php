<?php

namespace App\Support;

final class LegacyCrypto
{
    private const ALGORITHM = 'AES-256-CBC';

    public static function encrypt(?string $value): ?string
    {
        if (!$value) {
            return $value;
        }

        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($value, self::ALGORITHM, self::key(), OPENSSL_RAW_DATA, $iv);

        return bin2hex($iv).':'.bin2hex($encrypted ?: '');
    }

    public static function decrypt(?string $value): ?string
    {
        if (!$value) {
            return $value;
        }

        try {
            $parts = explode(':', $value, 2);
            if (count($parts) !== 2) {
                return $value;
            }

            $iv = hex2bin($parts[0]);
            $cipherText = hex2bin($parts[1]);
            if ($iv === false || $cipherText === false) {
                return $value;
            }

            $decrypted = openssl_decrypt($cipherText, self::ALGORITHM, self::key(), OPENSSL_RAW_DATA, $iv);

            return $decrypted === false ? $value : $decrypted;
        } catch (\Throwable) {
            return $value;
        }
    }

    private static function key(): string
    {
        $secret = env('ENCRYPTION_KEY') ?: env('JWT_SECRET') ?: 'development-only-encryption-key';

        return substr(base64_encode(hash('sha256', (string) $secret, true)), 0, 32);
    }
}
