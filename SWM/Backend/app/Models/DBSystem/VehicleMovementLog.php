<?php

namespace App\Models\DBSystem;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class VehicleMovementLog extends ParamModel
{
    use HasFactory;
    protected $fillable = [
        "vehicle_driver_map_id",
        "latitude",
        "longitude",
        "timestamp",
        "speed",
        "lock_status",
    ];


    public function store(Request $request){
        $inputs = snakeCase($request);
        $data= self::create($inputs->all());
        return $data->id;
    }

    public function edit($request){
        $inputs= snakeCase($request)->filter(function($val,$index){
            return (in_array($index,$this->fillable));
        });
        $model = self::find($request->id);
        $returnData= $model->update($inputs->all());
        return $returnData;
    }
}
