<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $assets = BranchScope::apply(Asset::query(), $request)->get();

        return ApiResponse::success([
            'total' => $assets->count(),
            'good' => $assets->whereIn('status', ['active', 'good'])->count(),
            'needsService' => $assets->whereIn('status', ['maintenance', 'repair'])->count(),
            'disposed' => $assets->whereIn('status', ['disposed', 'lost', 'retired'])->count(),
            'totalBookValue' => $assets->sum(fn ($asset) => (float) ($asset->book_value ?: $asset->cost)),
            'totalCost' => $assets->sum(fn ($asset) => (float) $asset->cost),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $assets = BranchScope::apply(Asset::query(), $request)
            ->when($request->query('status'), fn ($query, $value) => $query->where('status', $value))
            ->when($request->query('type'), fn ($query, $value) => $query->where('type', $value))
            ->when($request->query('category'), fn ($query, $value) => $query->where('category', $value))
            ->when($request->query('location'), fn ($query, $value) => $query->where('location', 'like', "%{$value}%"))
            ->when($request->query('search'), function ($query, $value) {
                $query->where(function ($inner) use ($value) {
                    $inner->where('name', 'like', "%{$value}%")
                        ->orWhere('asset_tag', 'like', "%{$value}%")
                        ->orWhere('serial_no', 'like', "%{$value}%")
                        ->orWhere('location', 'like', "%{$value}%");
                });
            })
            ->orderByDesc('created_at')
            ->get();

        return ApiResponse::success($assets);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255']]);
        $branchId = BranchScope::selectedBranchId($request) ?: $request->user()->branch_id;
        $payload = $request->except('image');

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $name = 'asset_'.time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/assets'), $name);
            $payload['image_url'] = '/uploads/assets/'.$name;
        }

        $payload['branch_id'] = $branchId;
        $payload['asset_tag'] = $payload['asset_tag'] ?? 'AST-'.str_pad((string) (Asset::query()->where('branch_id', $branchId)->count() + 1), 3, '0', STR_PAD_LEFT);
        $payload['book_value'] = $payload['book_value'] ?? ($payload['cost'] ?? 0);

        return ApiResponse::success(Asset::query()->create($payload), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $asset = BranchScope::apply(Asset::query(), $request)->find($id);
        if (!$asset) {
            return ApiResponse::error('Asset not found', 404);
        }

        $payload = $request->except(['branch_id', 'image']);
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $name = 'asset_'.time().'_'.$file->getClientOriginalName();
            $file->move(public_path('uploads/assets'), $name);
            $payload['image_url'] = '/uploads/assets/'.$name;
        }

        $asset->fill($payload)->save();

        return ApiResponse::success($asset);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $asset = BranchScope::apply(Asset::query(), $request)->find($id);
        if (!$asset) {
            return ApiResponse::error('Asset not found', 404);
        }

        $asset->delete();

        return ApiResponse::success(['message' => 'Asset deleted']);
    }
}
