<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Throwable;

class Phase9SafeDbCommand extends Command
{
    protected $signature = 'migration:phase9-safe-db
        {--connect : Connect to the configured database after safety checks pass}
        {--migrate-sanctum : Run only the Sanctum personal_access_tokens migration after safety checks pass}
        {--allow-backed-up-remote : Allow an existing remote database name after confirming a backup exists}';

    protected $description = 'Validate that the configured database is a safe dev/copy target before migration parity work.';

    private const SAFE_NAME_HINTS = ['dev', 'copy', 'test', 'testing', 'local', 'staging', 'sandbox'];

    private const UNSAFE_NAME_HINTS = ['prod', 'production', 'live'];

    public function handle(): int
    {
        $connectionName = config('database.default');
        $connection = config("database.connections.{$connectionName}", []);
        $database = (string) ($connection['database'] ?? '');
        $host = (string) ($connection['host'] ?? '');

        $this->line('Phase 9 safe database check');
        $this->line("Connection: {$connectionName}");
        $this->line('Host: '.($host ?: '(none)'));
        $this->line('Database: '.($database ?: '(none)'));

        if (!in_array($connectionName, ['mysql', 'mariadb'], true)) {
            $this->error('Refusing to continue: Phase 9 requires DB_CONNECTION=mysql or DB_CONNECTION=mariadb for the copied MySQL database.');

            return self::FAILURE;
        }

        if (!$this->isSafeDatabaseName($database) && !$this->option('allow-backed-up-remote')) {
            $this->error('Refusing to continue: DB_DATABASE must clearly identify a dev/copy/test target and must not look production-like.');
            $this->line('Expected one of: '.implode(', ', self::SAFE_NAME_HINTS));
            $this->line('Forbidden hints: '.implode(', ', self::UNSAFE_NAME_HINTS));

            return self::FAILURE;
        }

        if (!$this->isSafeDatabaseName($database) && $this->option('allow-backed-up-remote')) {
            $this->warn('Override accepted: using an existing remote database because a backup was confirmed by the operator.');
        }

        if (app()->environment('production')) {
            $this->error('Refusing to continue: APP_ENV=production is not allowed for migration parity work.');

            return self::FAILURE;
        }

        $this->info('Safety gate passed.');

        if ($this->option('connect') || $this->option('migrate-sanctum')) {
            if (!$this->verifyConnection()) {
                return self::FAILURE;
            }
        }

        if ($this->option('migrate-sanctum')) {
            return $this->runSanctumMigration();
        }

        $this->line('Next: run with --connect to verify DB reachability, then --migrate-sanctum to create only Sanctum tokens.');

        return self::SUCCESS;
    }

    private function isSafeDatabaseName(string $database): bool
    {
        $database = strtolower(trim(basename(str_replace('\\', '/', $database))));
        if ($database === '') {
            return false;
        }

        foreach (self::UNSAFE_NAME_HINTS as $hint) {
            if (str_contains($database, $hint)) {
                return false;
            }
        }

        foreach (self::SAFE_NAME_HINTS as $hint) {
            if (str_contains($database, $hint)) {
                return true;
            }
        }

        return false;
    }

    private function verifyConnection(): bool
    {
        try {
            DB::connection()->getPdo();
            $this->info('Database connection verified.');
            return true;
        } catch (Throwable $exception) {
            $this->error('Database connection failed: '.$exception->getMessage());
            return false;
        }
    }

    private function runSanctumMigration(): int
    {
        $this->warn('Running only Sanctum personal_access_tokens migration. No legacy schema migrations will run.');

        return Artisan::call('migrate', [
            '--path' => 'database/migrations/2026_05_16_200206_create_personal_access_tokens_table.php',
            '--force' => true,
        ]);
    }
}
