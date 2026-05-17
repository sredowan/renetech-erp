<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\JournalLine;
use App\Models\Lead;
use App\Models\Student;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function comparison(): JsonResponse
    {
        $branches = Branch::query()->where('is_active', true)->orderBy('name')->get();
        $comparison = $branches->map(function (Branch $branch) {
            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'students' => Student::query()->where('branch_id', $branch->id)->count(),
                'leads' => Lead::query()->where('branch_id', $branch->id)->count(),
                'revenue' => (float) JournalLine::query()->whereHas('account', fn ($query) => $query->where('branch_id', $branch->id)->where('type', 'revenue'))->sum('credit'),
            ];
        });

        return ApiResponse::success($comparison);
    }

    public function trends(): JsonResponse
    {
        $months = collect(range(5, 0))->map(function (int $offset) {
            $date = now()->subMonths($offset);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            return [
                'name' => $date->format('M'),
                'leads' => Lead::query()->whereBetween('created_at', [$start, $end])->count(),
                'revenue' => (float) DB::table('journal_lines')->whereBetween('created_at', [$start, $end])->sum('credit'),
            ];
        });

        return ApiResponse::success($months);
    }

    public function sources(): JsonResponse
    {
        return ApiResponse::success(Lead::query()->selectRaw('source, COUNT(*) as count')->groupBy('source')->get());
    }
}
