<?php

namespace App\Models\DBSystem;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Http\Request;

class DriverDetail extends ParamModel
{
    use HasFactory;

    protected $fillable = [
        "ulb_id",
        "driver_name",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "mobile_no",
        "img_path",
        "imp_unique_ref_no",
        "license_no",
        "license_valid_upto",
        "description",
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
}
