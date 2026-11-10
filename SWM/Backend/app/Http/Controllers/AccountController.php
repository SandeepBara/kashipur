<?php

namespace App\Http\Controllers;

use App\Bll\SWM\TransactionDeactivationBll;
use App\Exceptions\CustomException;
use App\Http\Controllers\SWM\ReportController;
use App\Models\DBSystem\ModuleMaster;
use App\Models\SWM\ChequeDetail;
use App\Models\SWM\Consumer;
use App\Models\SWM\ConsumerTransaction;
use App\Models\SWM\ConsumerTransactionDeactivation;
use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
class AccountController extends Controller
{
    //
    private $_SystemConstant;
    private $_MODULE_ID;
    private $_User;
    private $_ModuleMaster;

    private $_ConsumerTransaction;
    private $_Consumer;
    private $_ConsumerTransactionDeactivation;

    function __construct()
    {
        $this->_SystemConstant = Config::get("SystemConstant");
        $this->_MODULE_ID = $this->_SystemConstant["MODULE"]["ACCOUNT"];  

        $this->_User = new User();
        $this->_ModuleMaster = new ModuleMaster();

        $this->_ConsumerTransaction = new ConsumerTransaction();
        $this->_Consumer = new Consumer();
        $this->_ConsumerTransactionDeactivation = new ConsumerTransactionDeactivation();
    }

    private function begin(){
        DB::connection($this->_ConsumerTransaction->getConnectionName())->beginTransaction();
    }
    private function rollBack(){
        DB::connection($this->_ConsumerTransaction->getConnectionName())->rollBack();
    }
    private function commit(){
        DB::connection($this->_ConsumerTransaction->getConnectionName())->commit();
    }

    public function userList(Request $request){
        try{
            $rules = [
                "userId"=>"nullable|integer|exists:".$this->_User->getConnectionName().".".$this->_User->getTable().",id",
                "fromDate"=>"required|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d"),
                "uptoDate"=>"required|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d")
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $swmTran = $this->_ConsumerTransaction->where("lock_status",false)->whereIn("payment_status",[1,2])->where("user_type","!=","ONLINE")->whereBetween("tran_date",[$request->fromDate,$request->uptoDate]);
            if($request->userId){
                $swmTran->where("user_id",$request->userId);
            }
            $swmTran = $swmTran->get();
            
            $userIds = $swmTran->pluck("user_id");
            $uniqueId = $userIds->unique();
            $data = $this->_User->whereIn("id",$uniqueId->toArray())
                    ->orderBy("id","ASC")
                    ->get()
                    ->map(function($item)use($swmTran){
                        $swm = $swmTran->where("user_id",$item->id);
                        $swmVerified = $swm->where("verification_status",1);

                        $item->swm_amount = roundFigure($swm->sum("payable_amt"));
                        $item->swm_verified_amount = roundFigure($swmVerified->sum("payable_amt"));
                        $item->swm_count = ($swm->count());

                        $item->total_amount = roundFigure($item->swm_amount);
                        $item->total_verified_amount = roundFigure($item->swm_verified_amount);
                        $item->total_app = ($item->swm_count );
                        $item->user_img = $item->user_img ? url("/")."/".$item->user_img : null;
                        return $item;
                    });
            return responseMsg(true,"Data Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function userCash(Request $request){
        try{
            $rules = [
                "userId"=>"required|integer|exists:".$this->_User->getConnectionName().".".$this->_User->getTable().",id",
                "fromDate"=>"required|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d"),
                "uptoDate"=>"required|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d")
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $allUser = $this->_User->all();
            $user = $this->_User->find($request->userId);
            $user->user_img = $user->user_img ? url("/")."/".$user->user_img : null;
            $swmTran = $this->_ConsumerTransaction->where("lock_status",false)
                        ->whereIn("payment_status",[1,2])
                        ->where("user_id",$user->id)->where("user_type","!=","ONLINE")
                        ->whereBetween("tran_date",[$request->fromDate,$request->uptoDate])
                        ->orderBy("id","ASC")
                        ->get()
                        ->map(function($item) use($allUser){
                            $item->verified_by_user_name = $allUser->where("id",$item->verified_by)->first()?->name;
                            $item->app_no = $this->_Consumer->find($item->consumer_id)?->consumer_no;
                            $cheque = $item->getChequeDtl();
                            $item->cheque_no = $cheque?->cheque_no;
                            $item->cheque_date = $cheque?->cheque_date;
                            $item->bank_name = $cheque?->bank_name;
                            $item->branch_name = $cheque?->branch_name;
                            return $item;
                        });
            $paymentModeSummary = Collect(Config::get("SystemConstant.PAYMENT_MODE"))
                                ->map(function($item)use($swmTran){
                                    $swm = $swmTran->where("payment_mode",$item);
                                    return [
                                        "mode"=>$item,
                                        "amount"=>roundFigure($swm->sum("payable_amt")),
                                    ];
                                });
            $data=[
                "userDtl"=>$user,
                "paymentModeSummary"=>$paymentModeSummary,
                "swm"=>$swmTran,
                "swmAmount"=>roundFigure($swmTran->sum("payable_amt")),
                "totalAmount"=>roundFigure($swmTran->sum("payable_amt")),
            ];
            return responseMsg(true,"Data Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function cashVerify(Request $request){
        try{
            $rules = [
                "swm"=>"nullable|array",
                "swm.*.id"=>"nullable|integer|exists:".$this->_ConsumerTransaction->getConnectionName().".".$this->_ConsumerTransaction->getTable().",id,lock_status,false,verification_status,0",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $role = $user->getRoleDetailsByUserId()->first();
            if($user->getTable()!="users" || !$role){
                throw new CustomException("Access Denial");
            }  
            $userPermission = $role?->getRolePermission()->where("ulb_id",$user->ulb_id)->where("module_id",$this->_MODULE_ID)->first();    
            if(!$userPermission || !$userPermission->can_cash_verify){
                throw new CustomException("Permission Denial");
            }
            $this->begin();
            #swm
            if($request->swm){
                foreach($request->swm as $val){
                    $tran = $this->_ConsumerTransaction->find($val["id"]);
                    $tran->verification_status=1;
                    $tran->verified_by = $user->id;
                    $tran->verify_date = Carbon::now();
                    $tran->update();

                }
            }
            $this->commit();            
            return responseMsg(true,"Case Verify","");
        }catch(CustomException $e){
            $this->rollback();
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            $this->rollback();
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function bankReconciliationList(Request $request){
        try{
            
            $rules = [
                "chequeNo"=>"nullable|string",
                "fromDate"=>"required_without:chequeNo|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d"),
                "uptoDate"=>"required_without:chequeNo|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d"),
                "moduleId"=>"required|integer|exists:".$this->_ModuleMaster->getTable().",id",
                "paymentMode"=>"nullable|string|in:CHEQUE,DD,NEFT,RTGS",
                "verificationStatus"=>"nullable|string|in:PENDING,CLEAR,BOUNCED",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $configModule = $this->_SystemConstant["MODULE"];
            switch($request->moduleId){
                case $configModule["SWM"] : $data = $this->_ConsumerTransaction->from("consumer_transactions as tran")
                                                              ->join("cheque_details as cheque",function($join){
                                                                    $join->on('cheque.transaction_id','tran.id')
                                                                    ->where('cheque.lock_status', false);
                                                              })
                                                              ->leftJoin("users",function($join){
                                                                    $join->on('users.id','tran.user_id')
                                                                    ->where('tran.user_type',"<>","ONLINE");
                                                              });
                    break;
                
            }
            if($request->fromDate && $request->uptoDate){
                $data->whereBetween("tran.tran_date",[$request->fromDate, $request->uptoDate]);
            }
            if($request->paymentMode){
                $data->where(DB::raw("upper(tran.payment_mode)"),$request->paymentMode);
            }
            if($request->chequeNo){
                $data->where("cheque.cheque_no",$request->chequeNo);
            }
            if($request->verificationStatus){
                $verificationStatus = $this->_SystemConstant["PAYMENT_STATUS"][$request->verificationStatus];
                $data->where("tran.payment_status",$verificationStatus);
            }
            $data = $data->select("tran.*","cheque.cheque_no","cheque.cheque_date","cheque.cheque_date",
                                    "cheque.bank_name","cheque.branch_name","cheque.clear_bounce_date",
                                    "cheque.remarks","cheque.bounce_amount",
                                    "users.name as user_name")
                    ->where("tran.lock_status",false)
                    ->orderBy("tran.id","DESC");
            $data = paginator($data,$request);
            return responseMsg(true,"Transaction List Fetched",camelCase(remove_null($data)));            
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){dd($e);
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function bankReconciliation(Request $request){
        try{
            $rules = [
                "moduleId" => "required|integer|exists:" . $this->_ModuleMaster->getTable() . ",id",
                "tranId" => [
                    "required",
                    "integer",
                    function ($attribute, $value, $fail) use ($request) {
                        $configModule = $this->_SystemConstant["MODULE"];
                        $exists = false;
                        switch ($request->moduleId) {
                            case $configModule["SWM"]:
                                $exists = $this->_ConsumerTransaction->where("lock_status",false)->where("id", $value)->exists();
                                break;
                        }
                        if ($request->moduleId && !$exists) {
                            $fail("The {$attribute} is invalid.");
                        }
                    },
                ],
                "verificationStatus" => "required|in:CLEAR,BOUNCED",
                "bounceAmount"=>"nullable|numeric|min:0",
                "remarks"=>"required_if:verificationStatus,BOUNCED|string|min:5",
                "clearBounceDate"=>"required|date|date_format:Y-m-d|before_or_equal:".Carbon::now()->format("Y-m-d"),
            ];

            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $role = $user->getRoleDetailsByUserId()->first();
            if($user->getTable()!="users" || !$role){
                throw new CustomException("Access Denial");
            }  
            $userPermission = $role?->getRolePermission()->where("ulb_id",$user->ulb_id)->where("module_id",$this->_MODULE_ID)->first();          
            if(!$userPermission || !$userPermission->can_cheque_status_verify){
                throw new CustomException("Permission Denial");
            }
            $configModule = $this->_SystemConstant["MODULE"];
            $verificationStatus = $this->_SystemConstant["PAYMENT_STATUS"][$request->verificationStatus];
            switch ($request->moduleId) {
                case $configModule["SWM"]:
                    $tran = $this->_ConsumerTransaction->find($request->tranId);
                    $cheque = ChequeDetail::where("lock_status",false)->where("transaction_id",$tran->id)->first();
                    $objTranDeactivate = new TransactionDeactivationBll($request->tranId);
                    break;
                default : throw new CustomException("Tran section Not Found");
            }
            $tran->payment_status = $verificationStatus;
            $cheque->cheque_status = $verificationStatus;
            $cheque->clear_bounce_date = $request->clearBounceDate;
            $cheque->remarks = $request->remarks;
            $cheque->bounce_amount = $request->bounceAmount;
            
            $this->begin();  
            $objTranDeactivate->chequeBounce();          
            $tran->update();
            $cheque->update();
            $this->commit();
            return responseMsg(true,"Transaction Reconciliation","");
        }catch(CustomException $e){
            $this->rollback();
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            $this->rollback();
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function searchTransaction(Request $request){
        try{
            $rules = [
                "moduleId" => "required|integer|exists:" . $this->_ModuleMaster->getTable() . ",id",
                "tranNo" => "required",
            ];

            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $configModule = $this->_SystemConstant["MODULE"];
            switch($request->moduleId){
                case $configModule["SWM"]:
                    $data = $this->_ConsumerTransaction
                            ->where("tran_no",$request->tranNo)
                            ->where("lock_status",false)
                            ->whereIn("payment_status",[1,2])
                            ->get()
                            ->map(function($item){
                                $app = $this->_Consumer->find($item->consumer_id);
                                $item->app_no = $app?->consumer_no;
                                $item->app_typ ="Swm";
                                $item->ward_no = $app?->getWardOldWardNo()?->ward_no;
                                $item->new_ward_no = $app?->getWardNewdWardNo()?->ward_no;
                                return $item;
                            });
                    break;
                default : throw new CustomException("Tran section Not Found");
            }
            $data = $data->map(function($item){
                $cheque = $item->getChequeDtl();
                $item->cheque_no = $cheque?->cheque_no;
                $item->cheque_date = $cheque?->cheque_date;
                $item->bank_name = $cheque?->bank_name;
                $item->branch_name = $cheque?->branch_name;
                return $item;
            });
            return responseMsg(true,"Data Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function updatePaymentMode(Request $request){
        try{
            $rules = [
                "moduleId" => "required|integer|exists:" . $this->_ModuleMaster->getTable() . ",id",
                "tranId" => [
                    "required",
                    "integer",
                    function ($attribute, $value, $fail) use ($request) {
                        $configModule = $this->_SystemConstant["MODULE"];
                        $exists = false;
                        switch ($request->moduleId) {
                            case $configModule["SWM"]:
                                $exists = $this->_ConsumerTransaction->where("id", $value)->where("lock_status",false)->where("verification_status",0)->exists();
                                break;
                        }
                        if ($request->moduleId && !$exists) {
                            $fail("The {$attribute} is invalid.");
                        }
                    },
                ],
                "paymentMode" => "required|in:CASH,CHEQUE,DD,NEFT,RTGS",
                "chequeNo"=>"required_unless:paymentMode,CASH",
                "chequeDate"=>"required_unless:paymentMode,CASH",                
                "bankName"=>"required_unless:paymentMode,CASH",
                "branchName"=>"required_unless:paymentMode,CASH",
            ];

            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $role = $user->getRoleDetailsByUserId()->first();
            if($user->getTable()!="users" || !$role){
                throw new CustomException("Access Denial");
            }  
            $userPermission = $role?->getRolePermission()->where("ulb_id",$user->ulb_id)->where("module_id",$this->_MODULE_ID)->first();          
            if(!$userPermission || !$userPermission->can_payment_mode_update){
                throw new CustomException("Permission Denial");
            }
            $configModule = $this->_SystemConstant["MODULE"];
            switch ($request->moduleId) {
                case $configModule["SWM"]:
                    $tran = $this->_ConsumerTransaction->find($request->tranId);
                    $cheque = ChequeDetail::where("lock_status",false)->where("transaction_id",$tran->id)->first();
                    break;
                default : throw new CustomException("Tran section Not Found");
            }
            $tran->payment_mode = $request->paymentMode;
            if($request->paymentMode!="CASH"){
                if(!$cheque){
                    switch ($request->moduleId) {
                        case $configModule["SWM"]:
                            $cheque = ChequeDetail::where("transaction_id",$tran->id)->first();
                            if(!$cheque){
                                $cheque = new ChequeDetail();
                                $cheque->transaction_id = $tran->id;
                            }
                            break;
                    }                    
                }
                $cheque->lock_status = false;
                $cheque->cheque_no = $request->chequeNo;
                $cheque->cheque_date = $request->chequeDate;
                $cheque->bank_name = $request->bankName;
                $cheque->branch_name = $request->branchName;
            }else{
                if($cheque){
                    $cheque->lock_status = true;
                }
            }
            $this->begin();
            $tran->update();
            if($cheque){
                $cheque->save();
            }
            $this->commit();
            return responseMsg(true,"Transaction Update","");
        }catch(CustomException $e){
            $this->rollback();
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            $this->rollback();
            return responseMsg(false,"Server Error !!!","");
        }

    }

    public function deactivateTransaction(Request $request){
        try{
            $rules = [
                "moduleId" => "required|integer|exists:" . $this->_ModuleMaster->getTable() . ",id",
                "tranId" => [
                    "required",
                    "integer",
                    function ($attribute, $value, $fail) use ($request) {
                        $configModule = $this->_SystemConstant["MODULE"];
                        $exists = false;
                        switch ($request->moduleId) {
                            case $configModule["SWM"]:
                                $exists = $this->_ConsumerTransaction->where("id", $value)->where("lock_status",false)->whereIn("payment_status",[1,2])->exists();
                                break;
                        }
                        if ($request->moduleId && !$exists) {
                            $fail("The {$attribute} is invalid.");
                        }
                    },
                ],
                "document"=>[
                    "required",
                    "mimes:bmp,jpeg,jpg,png,pdf",
                    function ($attribute, $value, $fail) {
                        if($value instanceof UploadedFile){
                            $maxSize = $value->getClientOriginalExtension() === 'application/pdf' ? 10240 : 5120; // Size in KB
                            $maxSizeBytes = $maxSize * 1024; // Convert to bytes
                            if ($value->getSize() > $maxSizeBytes) {
                                $fail('The ' . $attribute . ' may not be greater than ' . $maxSize . ' kilobytes.');
                            }
                        }
                    },

                ],
                "remarks"=>"required|string|min:10",
            ];

            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $role = $user->getRoleDetailsByUserId()->first();
            if($user->getTable()!="users" || !$role){
                throw new CustomException("Access Denial");
            }  
            $userPermission = $role?->getRolePermission()->where("ulb_id",$user->ulb_id)->where("module_id",$this->_MODULE_ID)->first();          
            if(!$userPermission || !$userPermission->can_tran_deactivate){
                throw new CustomException("Permission Denial");
            }
            $configModule = $this->_SystemConstant["MODULE"];
            $relativePath="Uploads/SwmTranDeactivation";            
            $logModal = $this->_ConsumerTransactionDeactivation;
            switch($request->moduleId){
                case $configModule["SWM"]:
                    $relativePath="Uploads/SwmTranDeactivation";
                    $objTranDeactivate = new TransactionDeactivationBll($request->tranId);
                    $logModal = $this->_ConsumerTransactionDeactivation;
                    break;
                default : throw new CustomException("Tran section Not Found");
            }

            $imageName = (string) Str::uuid().".".$request->document->getClientOriginalExtension();
            $request->document->move($relativePath, $imageName);
            $request->merge([
                "transactionId"=>$request->tranId,
                "docPath"=>$relativePath."/".$imageName,
                "userId"=>$user->id
            ]);
            $this->begin();
            $objTranDeactivate->deactivateTransaction();
            $logModal->store($request);
            $this->commit();
            return responseMsg(true,"Transaction Deactivated","");

        }catch(CustomException $e){
            $this->rollback();
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            $this->rollback();
            return responseMsg(false,"Server Error !!!","");
        }
        
    }

    public function deactivatedTranList(Request $request){
        try{
            $rules = [
                "moduleId" => "required|integer|exists:" . $this->_ModuleMaster->getTable() . ",id",                
            ];

            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $configModule = $this->_SystemConstant["MODULE"];
            switch($request->moduleId){
                case $configModule["SWM"]:
                    $orm = $this->_ConsumerTransaction
                        ->from("consumer_transaction_deactivations as tran_d")
                        ->join("consumer_transactions as tran","tran.id","tran_d.transaction_id");
                    break;
                default : throw new CustomException("Tran section Not Found");
            }
            $orm->where("tran_d.lock_status",false);
            if($request->fromDate){
                $orm->where(DB::raw("cast(tran_d.created_at as date)"),">=",$request->fromDate);
            }
            if($request->uptoDate){
                $orm->where(DB::raw("cast(tran_d.created_at as date)"),"<=",$request->uptoDate);
            }
            if($request->tranNo){
                $orm->where("tran.tran_no","ILIKE","%".$request->tranNo."%");
            }
            $orm->select("tran_d.*","tran.tran_date","tran.tran_no","tran.payment_mode","tran.payable_amt","tran.tran_type");
            
            $list = paginator($orm,$request);
            $list["data"] = collect($list["data"])->map(function($item){ 
                $item->doc_path = $item->doc_path ? trim(Config::get("app.url"),'\\/')."/".$item->doc_path:"";
                $user = User::find($item->user_id);
                $item->deactivate_by = $user?->name;
                $item->user_img = $item->user_img ? trim(Config::get("app.url"),'\\/')."/".$item->user_img:"";
                return $item;
            });
            return responseMsg(true,"Deactivate Tran List",camelCase(remove_null($list)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error !!!","");
        }
    }

    public function collectionSummary(Request $request){
        try{
            $rules=[
                "fromDate"=>"required|date|before_or_equal:".Carbon::now()->format("Y-m-d"),
                "uptoDate"=>"required|date|before_or_equal:".Carbon::now()->format("Y-m-d"),
            ];
            $request->merge(["active_tran"=>true]);
            $swmReports = new ReportController();
            $swmResponse = $swmReports->collectionSummary($request);            
            $swmTran = $swmResponse->original["status"]?$swmResponse->original["data"]:collect();
            $paymentListResponse = $swmReports->getPaymentMode($request);
            $paymentListResponse = $paymentListResponse->original["status"]?$paymentListResponse->original["data"]:collect();
            $paymentMode = collect()
                        ->merge($paymentListResponse->pluck("paymentMode"))
                        ->unique()
                        ->sort();


            
            $swm = $paymentMode->map(function($val)use($swmTran){  
                $list = $swmTran->where("paymentMode",$val);              
                return[
                        "key"=>$val,
                        "amount"=>roundFigure($list->sum("payableAmt")),
                        "count"=>$list->count(),
                ];
            });


            $paymentModeWise = $paymentMode->map(function($val)use($swmTran){  
                $swmAmount = $swmTran->where("paymentMode",$val);          
                return[
                        "key"=>$val,
                        "amount"=>roundFigure($swmAmount->sum("payableAmt")),
                        "count"=>($swmAmount->count()),
                    ];
            });
            $data=[
                "paymentModeWise"=>$paymentModeWise->values(),
                "total"=>[
                            "count"=>$paymentModeWise->sum("count"),
                            "amount"=>roundFigure($paymentModeWise->sum("amount")),
                ],
                "table"=>[   
                    [
                        "title"=>"SWM Collection Description",
                        "data"=>$swm->values(),
                        "total"=>[
                            "count"=>$swm->sum("count"),
                            "amount"=>roundFigure($swm->sum("amount")),
                        ]
                    ],
                ],
            ];
            
            return responseMsg(true,"all module collection summary",camelCase(remove_null($data)));

        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error !!!","");
        }
    }
}
