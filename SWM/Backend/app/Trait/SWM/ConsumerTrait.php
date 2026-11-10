<?php

namespace App\Trait\SWM;

use App\Models\DBSystem\UlbMaster;
use App\Models\DBSystem\UlbWardMaster;
use App\Models\SWM\CategoryTypeMaster;
use App\Models\SWM\Consumer;
use App\Models\SWM\SubCategoryTypeMaster;
use Illuminate\Support\Facades\DB;

trait ConsumerTrait
{    
    public function adjustValue($consumer){
        
        $ulbDtl = UlbMaster::find($consumer->ulb_id);
        $oldWard = UlbWardMaster::find($consumer->ward_mstr_id);
        $categoryTypeMaster = CategoryTypeMaster::find($consumer->category_type_master_id);
        $subCategoryTypeMaster = SubCategoryTypeMaster::find($consumer->sub_category_type_master_id);
        

        
        $consumer->category_type = $categoryTypeMaster->category_type??"";
        $consumer->sub_category_type = $subCategoryTypeMaster->sub_category_type??"";
        $consumer->ulb_name = $ulbDtl->ulb_name??"";
        $consumer->ward_no = $oldWard->ward_no??"";
        return $consumer;
    }

    public function consumerMetaDataList(){
        return Consumer::from("consumers as app")  
                ->join("category_type_masters as ctm", "ctm.id", "app.category_type_master_id")
                ->join("sub_category_type_masters as sctm", "sctm.id", "app.sub_category_type_master_id")
                ->join(DB::raw("(
                    SELECT consumer_id,
                        STRING_AGG(owner_name, ',') AS owner_name,
                        STRING_AGG(guardian_name, ',') AS guardian_name,
                        STRING_AGG(CAST(mobile_no AS VARCHAR), ',') AS mobile_no
                    FROM consumer_owners
                    WHERE lock_status = false
                    GROUP BY consumer_id
                ) AS w"), "w.consumer_id", "=", "app.id")
                ->join("ulb_ward_masters as wm", "wm.id", "=", "app.ward_mstr_id")            
                ->where("app.lock_status",false)
                ->select("app.id",
                "app.consumer_no",
                "app.address",
                "holding_no",
                "wm.ward_no",
                "w.owner_name",
                "w.guardian_name",
                "w.mobile_no",
            );
    }
}
