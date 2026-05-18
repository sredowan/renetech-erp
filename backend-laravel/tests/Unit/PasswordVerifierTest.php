<?php

namespace Tests\Unit;

use App\Support\PasswordVerifier;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordVerifierTest extends TestCase
{
    public function test_valid_bcrypt_password_passes(): void
    {
        $result = PasswordVerifier::verify('Secret123', Hash::make('Secret123'));

        $this->assertTrue($result['valid']);
        $this->assertFalse($result['needs_rehash']);
    }

    public function test_bcryptjs_prefix_password_passes(): void
    {
        $bcryptJsHash = '$2b$'.substr(Hash::make('Secret123'), 4);

        $result = PasswordVerifier::verify('Secret123', $bcryptJsHash);

        $this->assertTrue($result['valid']);
    }

    public function test_legacy_plaintext_match_passes_and_requests_rehash(): void
    {
        $result = PasswordVerifier::verify('Secret123', 'Secret123');

        $this->assertTrue($result['valid']);
        $this->assertTrue($result['needs_rehash']);
    }

    public function test_invalid_legacy_hash_fails_without_throwing(): void
    {
        $result = PasswordVerifier::verify('Secret123', 'not-the-password');

        $this->assertFalse($result['valid']);
        $this->assertFalse($result['needs_rehash']);
    }
}
