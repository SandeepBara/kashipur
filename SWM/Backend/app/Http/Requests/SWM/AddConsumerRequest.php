<?php

namespace App\Http\Requests\SWM;

use App\Http\Requests\ParentRequest;
use App\Models\DBSystem\UlbMaster;
use App\Models\DBSystem\UlbWardMaster;
use App\Models\SWM\CategoryTypeMaster;
use App\Models\SWM\SubCategoryTypeMaster;
use Illuminate\Foundation\Http\FormRequest;

class AddConsumerRequest extends ParentRequest
{
    protected $_UlbWardMaster;
    protected $_UlbMaster;

    protected $_CategoryTypeMaster;
    protected $_SubCategoryTypeMaster;

   function __construct(){
        parent::__construct();
        $this->_UlbWardMaster = new UlbWardMaster();;
        $this->_UlbMaster = new UlbMaster();

        $this->_CategoryTypeMaster = new CategoryTypeMaster();
        $this->_SubCategoryTypeMaster = new SubCategoryTypeMaster(); 
   }

    public function rules(): array
    {
        $user = Auth()->user();
        $ulbId = $user ? $user->ulb_id : null;
        if(!$this->ulbId){
            $this->merge(["ulbId"=>$ulbId]);
        }
        $rules = [
            "wardMstrId"=>"required|exists:".$this->_UlbWardMaster->getConnectionName().".".$this->_UlbWardMaster->getTable().",id",
            // "holdingNo"=>"",
            // "houseNo"=>"",
            "address"=>"required|min:5",
            "pinCode"=>"required|int|regex:/[0-9]{6}/",
            "categoryTypeMasterId" => "required|exists:" .
                $this->_CategoryTypeMaster->getConnectionName() . "." .
                $this->_CategoryTypeMaster->getTable() . ",id,lock_status,false",

            "subCategoryTypeMasterId" => "required|exists:" .
                $this->_SubCategoryTypeMaster->getConnectionName() . "." .
                $this->_SubCategoryTypeMaster->getTable() . ",id,lock_status,false" .
                ($this->categoryTypeMasterId ? (",category_type_master_id," . $this->categoryTypeMasterId) : ""),

            "hasCompostingMachineProvision" => "nullable|boolean",
            "dateOfEffective" => "required|date|date_format:Y-m",

            "ownerDtl"=>"required|array",
            "ownerDtl.*.ownerName"=>"required",
            "ownerDtl.*.guardianName"=>"nullable",
            "ownerDtl.*.relationType"=>"nullable|required_with:ownerDtl.*.guardianName|in:S/O,D/O,W/O,C/O",
            "ownerDtl.*.mobileNo"=>"required|digits:10|regex:/[0-9]{10}/",
            "ownerDtl.*.email"=>"nullable|email",
        ];
        return $rules;
    }
}
