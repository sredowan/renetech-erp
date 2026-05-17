<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

final class BranchScope
{
    public static function selectedBranchId(Request $request): ?int
    {
        $user = $request->user();
        if (!$user) {
            return null;
        }

        $requested = $request->header('X-Branch-Id') ?? $request->query('branchId');
        $user->loadMissing('branch:id,type');

        if ($user->role === 'super_admin' && $user->branch?->type === 'head') {
            if ($requested === 'all') {
                return null;
            }

            return $requested ? (int) $requested : (int) $user->branch_id;
        }

        return (int) $user->branch_id;
    }

    public static function apply(Builder $query, Request $request, string $column = 'branch_id'): Builder
    {
        $branchId = self::selectedBranchId($request);

        return $branchId ? $query->where($column, $branchId) : $query;
    }
}
