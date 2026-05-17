<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Material;
use App\Support\ApiResponse;
use App\Support\BranchScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    public function byBatch(Request $request, int $batchId): JsonResponse
    {
        $batch = BranchScope::apply(Batch::query(), $request)->find($batchId);
        if (!$batch) {
            return ApiResponse::error('Batch not found', 404);
        }

        return ApiResponse::success(Material::query()->where('batch_id', $batchId)->latest('id')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'batch_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'url' => ['required', 'string', 'max:255'],
        ]);

        $material = Material::query()->create(array_merge($request->all(), [
            'batch_id' => $data['batch_id'],
            'title' => $data['title'],
            'url' => $data['url'],
            'created_by' => $request->user()->id,
            'type' => $request->input('type', 'document'),
        ]));

        return ApiResponse::success($material, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $material = Material::query()->find($id);
        if (!$material) {
            return ApiResponse::error('Material not found', 404);
        }

        $material->delete();

        return ApiResponse::success(['message' => 'Material deleted successfully']);
    }

    public function share(Request $request): JsonResponse
    {
        $request->validate([
            'batch_id' => ['required', 'integer'],
            'material_id' => ['nullable', 'integer'],
        ]);

        return ApiResponse::success(['message' => 'Material shared to batch successfully']);
    }
}
