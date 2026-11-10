<?php

namespace App\Models\DBSystem;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class VehicleDetail extends ParamModel
{
    use HasFactory;
    protected $fillable = [
        "ulb_id",
        "vehicle_no",
        "vehicle_type_id",
        "img_path",
        "imp_unique_ref_no",
        "gps_id",
        "user_id",
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

    public function getVehicleWards(){
        return $this->hasManyThrough(UlbWardMaster::class,VehicleWardMap::class,"vehicle_id","id","id","ward_mstr_id")->where((new VehicleWardMap())->getTable().".lock_status",false);
    }
}
