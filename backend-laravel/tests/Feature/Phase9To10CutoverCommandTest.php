<?php

namespace Tests\Feature;

use Tests\TestCase;

class Phase9To10CutoverCommandTest extends TestCase
{
    public function test_phase_9_safe_db_command_passes_for_dev_copy_name_without_connecting(): void
    {
        config([
            'database.default' => 'mysql',
            'database.connections.mysql.database' => 'language_academy_dev_copy',
            'database.connections.mysql.host' => '127.0.0.1',
        ]);

        $this->artisan('migration:phase9-safe-db')
            ->expectsOutputToContain('Safety gate passed.')
            ->assertExitCode(0);
    }

    public function test_phase_9_safe_db_command_rejects_production_like_database_name(): void
    {
        config([
            'database.default' => 'mysql',
            'database.connections.mysql.database' => 'language_academy_prod',
            'database.connections.mysql.host' => '127.0.0.1',
        ]);

        $this->artisan('migration:phase9-safe-db')
            ->expectsOutputToContain('Refusing to continue')
            ->assertExitCode(1);
    }

    public function test_phase_9_safe_db_command_allows_backed_up_remote_override(): void
    {
        config([
            'database.default' => 'mysql',
            'database.connections.mysql.database' => 'u741405899_languageacdb',
            'database.connections.mysql.host' => 'srv483.hstgr.io',
        ]);

        $this->artisan('migration:phase9-safe-db --allow-backed-up-remote')
            ->expectsOutputToContain('Override accepted')
            ->assertExitCode(0);
    }

    public function test_phase_9_safe_db_command_rejects_non_mysql_connections(): void
    {
        config([
            'database.default' => 'sqlite',
            'database.connections.sqlite.database' => database_path('database.sqlite'),
        ]);

        $this->artisan('migration:phase9-safe-db')
            ->expectsOutputToContain('Phase 9 requires DB_CONNECTION=mysql or DB_CONNECTION=mariadb')
            ->assertExitCode(1);
    }

    public function test_phase_10_contract_command_lists_representative_endpoints(): void
    {
        $this->artisan('migration:phase10-contracts --list')
            ->expectsTable(['Method', 'Path', 'Group', 'Notes'], array_map(fn (array $contract) => [
                $contract['method'],
                $contract['path'],
                $contract['group'],
                $contract['notes'] ?? '',
            ], config('migration_contracts.endpoints')))
            ->assertExitCode(0);
    }
}
