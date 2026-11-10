<?php

use App\Http\Controllers\DashBoardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('dashboard', function (Request $request) {
    $request->merge(["dashboard"=>"dashboard"]);
    return($request->all());
});

Route::middleware(['auth:sanctum',"expireBearerToken","setUlb"])->group(function () {
    Route::controller(DashBoardController::class)->group(function(){
        Route::prefix("/swm")->group(function(){
            Route::post("demand-collection-due","swmDemandCollectionCurrentYear");
            Route::post("monthly-collection","monthlyCollection");
            Route::post("applied-consumer","appliedConnectionCurrentYear");
            Route::post("rfidmap-not-map","totalRFIDMapNotMap");
        });
    });
});

