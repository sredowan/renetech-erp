<?php

namespace Tests\Unit;

use App\Support\LegacyCrypto;
use PHPUnit\Framework\TestCase;

class LegacyCryptoTest extends TestCase
{
    public function test_it_round_trips_node_compatible_encrypted_values(): void
    {
        $encrypted = LegacyCrypto::encrypt('secret-value');

        $this->assertIsString($encrypted);
        $this->assertStringContainsString(':', $encrypted);
        $this->assertSame('secret-value', LegacyCrypto::decrypt($encrypted));
    }

    public function test_decrypt_returns_original_value_when_input_is_not_encrypted(): void
    {
        $this->assertSame('plain-value', LegacyCrypto::decrypt('plain-value'));
    }
}
