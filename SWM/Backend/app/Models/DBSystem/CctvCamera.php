<?php

namespace App\Models\DBSystem;

class CctvCamera extends ParamModel
{
    protected $fillable = [
        'ulb_id',
        'name',
        'type',
        'stream_url',
        'rtsp_url',
        'enabled',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'rtsp_url' => 'encrypted',
            'enabled' => 'boolean',
        ];
    }
}
