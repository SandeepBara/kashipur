<?php

namespace App\Models\SWM;

use App\Models\DBSystem\UlbWardMaster;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consumer extends ParamModel
{
    use HasFactory;
    protected $fillable = [
        "consumer_no",
        "rf_id",
        "rf_id_install_by",
        "rf_id_install_date",
        "qr_code",
        "ulb_id",
        "ward_mstr_id",
        "holding_no",
        "property_detail_id",
        "category_type_master_id",
        "sub_category_type_master_id",
        "has_composting_machine_provision",
        "total_no_of_flat",
        "actual_no_of_flat",
        "type_of_multi_storey_building",
        "date_of_effective",
        "house_no",
        "address",
        "landmark",
        "ps",
        "street_name",
        "locality",
        "pin_code",
        "latitude",
        "longitude",
        "altitude",
        "citizen_id",
        "user_id",
        "apply_date",
        "lock_status",
    ];

    public function getWardOldWardNo(){
        return $this->belongsTo(UlbWardMaster::class,"ward_mstr_id","id")->first();
    }
    public function getWardNewdWardNo(){
        return $this->belongsTo(UlbWardMaster::class,"new_ward_mstr_id","id")->first();
    }

    public function getOwners(){
        return $this->hasMany(ConsumerOwner::class,"consumer_id","id")->where("lock_status",false)->get();
    }


    public function getTrans(){
        return $this->hasMany(ConsumerTransaction::class,"consumer_id","id")
            ->where("lock_status",false)
            ->whereIn("payment_status",[1,2])
            ->orderBy("tran_date","DESC")
            ->orderBy("id","DESC")
            ->get();
    }

    public function getLastTran(){
        return $this->hasMany(ConsumerTransaction::class,"consumer_id","id")
            ->where("lock_status",false)
            ->whereIn("payment_status",[1,2])
            ->orderBy("tran_date","DESC")
            ->orderBy("id","DESC")
            ->first();
    }

    public function getDemand(){
        return $this->hasMany(ConsumerDemand::class,"consumer_id","id")->where("lock_status",false);
    }
}
