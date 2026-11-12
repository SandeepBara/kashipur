<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('pgsql')->create('cctv_cameras', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('ulb_id')->index();
            $table->string('name', 150);
            $table->string('type', 24);
            $table->text('stream_url')->nullable();
            $table->text('rtsp_url')->nullable();
            $table->boolean('enabled')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
            $table->index(['ulb_id', 'enabled']);
        });
    }

    public function down(): void
    {
        Schema::connection('pgsql')->dropIfExists('cctv_cameras');
    }
};
