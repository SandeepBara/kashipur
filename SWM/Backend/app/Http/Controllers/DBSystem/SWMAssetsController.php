<?php

namespace App\Http\Controllers\DBSystem;

use App\Exceptions\CustomException;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessVehicleLog;
use App\Models\DBSystem\CctvCamera;
use App\Models\DBSystem\DriverDetail;
use App\Models\DBSystem\UlbWardMaster;
use App\Models\DBSystem\VehicleDetail;
use App\Models\DBSystem\VehicleDriverMap;
use App\Models\DBSystem\VehicleMovementLog;
use App\Models\DBSystem\VehicleTypeMaster;
use App\Models\DBSystem\VehicleWardMap;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\Process\Process;

class SWMAssetsController extends Controller
{
    //
    private $_VehicleTypeMaster;
    private $_VehicleDetail;
    private $_VehicleWardMap;
    private $_DriverDetail;
    private $_VehicleDriverMap;
    private $_VehicleMovementLog;
    private $_UlbWardMaster;

    function __construct()
    {
        $this->_VehicleDetail = new VehicleDetail();
        $this->_VehicleTypeMaster = new VehicleTypeMaster();
        $this->_VehicleWardMap = new VehicleWardMap();
        $this->_VehicleDriverMap = new VehicleDriverMap();
        $this->_VehicleMovementLog = new VehicleMovementLog();
        $this->_DriverDetail = new DriverDetail();
        $this->_UlbWardMaster = new UlbWardMaster();
    }

    private function canManageCctvCameras(): bool
    {
        try {
            $user = auth()->user();
            if (!$user) {
                return false;
            }

            return $user->getRoleDetailsByUserId()->get()->contains(function ($role) {
                return in_array(strtoupper((string) $role->role_name), Config::get('SystemConstant.CAN_CRUDE_CCTV', []));
            });
        } catch (Exception $e) {
            return false;
        }
    }

    private function currentCctvUlbId(): ?int
    {
        try {
            $ulbId = app()->bound('CurrentUlbId') ? app('CurrentUlbId') : auth()->user()?->ulb_id;
            return $ulbId ? (int) $ulbId : null;
        } catch (Exception $e) {
            return null;
        }
    }

    public function getCctvCameras(Request $request)
    {
        try {
            $ulbId = $this->currentCctvUlbId();
            if (!$ulbId) {
                return response()->json(["status" => false, "message" => "ULB context is required", "data" => null], 422);
            }

            $cameras = CctvCamera::where('ulb_id', $ulbId)
                ->where('enabled', true)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'stream_url'])
                ->map(fn ($camera) => [
                    'id' => $camera->id,
                    'name' => $camera->name,
                    'type' => $camera->type,
                    'stream_url' => $camera->stream_url,
                ])
                ->map(fn ($camera) => camelCase($camera)->all())
                ->values()
                ->all();

            return responseMsg(true, "CCTV camera list", [
                'cameras' => $cameras,
                'canManage' => $this->canManageCctvCameras(),
            ]);
        } catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), '');
        } catch (Exception $e) {
            return responseMsg(false, 'Internal Server Error', '');
        }
    }

    public function addCctvCamera(Request $request)
    {
        try {
            return $this->saveCctvCameraRecord($request, false);
        } catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), '');
        } catch (Exception $e) {
            return responseMsg(false, 'Internal Server Error', '');
        }
    }

    public function editCctvCamera(Request $request)
    {
        try {
            return $this->saveCctvCameraRecord($request, true);
        } catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), '');
        } catch (Exception $e) {
            return responseMsg(false, 'Internal Server Error', '');
        }
    }

    private function isValidCctvPlaybackUrl(string $url, string $type): bool
    {
        try {
            $parts = parse_url(trim($url));
            $allowedSchemes = in_array($type, ['webrtc', 'ip', 'rtsp', 'ffmpeg'], true)
                ? ['http', 'https', 'ws', 'wss']
                : ['http', 'https'];
            if (!is_array($parts) || !isset($parts['scheme'], $parts['host']) || !in_array(strtolower($parts['scheme']), $allowedSchemes, true)) {
                return false;
            }

            $host = trim($parts['host'], '[]');
            return filter_var($host, FILTER_VALIDATE_IP) !== false
                || preg_match('/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/i', $host) === 1;
        } catch (Exception $e) {
            return false;
        }
    }

    private function saveCctvCameraRecord(Request $request, bool $isEdit)
    {
        try {
            if (!$this->canManageCctvCameras()) {
                return response()->json(["status" => false, "message" => "Administrator access is required", "data" => null], 403);
            }

            $ulbId = $this->currentCctvUlbId();
            if (!$ulbId) {
                return response()->json(["status" => false, "message" => "ULB context is required", "data" => null], 422);
            }

            $rules = [
                'name' => 'required|string|max:150',
                'type' => 'required|in:viewer,hls,video,mjpeg,webrtc,ip,rtsp,ffmpeg',
                'streamUrl' => 'nullable|string|max:2048',
                'sourceUrl' => ['nullable', 'string', 'max:2048', 'regex:/^(?:rtsps?:\/\/|ffmpeg:(?:https?|rtsps?):\/\/)/i'],
            ];
            if ($isEdit) {
                $rules['id'] = 'required|integer';
            }

            $validator = Validator::make($request->all(), $rules);
            if ($validator->fails()) {
                return response()->json(["status" => false, "message" => "Validation error", "errors" => $validator->errors(), "data" => null], 422);
            }
            if ($request->filled('streamUrl') && !$this->isValidCctvPlaybackUrl((string) $request->streamUrl, (string) $request->type)) {
                return response()->json(["status" => false, "message" => in_array($request->type, ['webrtc', 'ip', 'rtsp', 'ffmpeg'], true) ? "A valid HTTP(S) or WebSocket playback URL is required" : "A valid http:// or https:// playback URL is required", "data" => null], 422);
            }

            $camera = $isEdit
                ? CctvCamera::where('ulb_id', $ulbId)->find($request->id)
                : new CctvCamera();
            if ($isEdit && !$camera) {
                return response()->json(["status" => false, "message" => "Camera not found", "data" => null], 404);
            }
            $hasPrivateSource = in_array($request->type, ['ip', 'rtsp', 'ffmpeg'], true);
            if ($hasPrivateSource && !$request->filled('sourceUrl') && !$camera?->rtsp_url) {
                return response()->json(["status" => false, "message" => "A camera source URL is required for this camera type", "data" => null], 422);
            }
            if (!$hasPrivateSource && !$request->filled('streamUrl')) {
                return response()->json(["status" => false, "message" => "A browser stream URL is required for this camera type", "data" => null], 422);
            }

            $camera->ulb_id = $ulbId;
            $camera->name = $request->name;
            $camera->type = $request->type;
            $camera->stream_url = $request->filled('streamUrl') ? $request->streamUrl : null;
            if ($request->filled('sourceUrl')) {
                $camera->rtsp_url = $request->sourceUrl;
            }
            if (!$hasPrivateSource) {
                $camera->rtsp_url = null;
            }
            $camera->enabled = true;
            if (!$camera->exists) {
                $camera->created_by = auth()->id();
            }
            $camera->save();

            return responseMsg(true, $isEdit ? "CCTV camera updated" : "CCTV camera added", camelCase($camera->only(['id', 'name', 'type', 'stream_url', 'enabled'])));
        } catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), '');
        } catch (Exception $e) {
            return responseMsg(false, 'Internal Server Error', '');
        }
    }

    public function deleteCctvCamera(Request $request)
    {
        try {
            if (!$this->canManageCctvCameras()) {
                return response()->json(["status" => false, "message" => "Administrator access is required", "data" => null], 403);
            }

            $ulbId = $this->currentCctvUlbId();
            if (!$ulbId) {
                return response()->json(["status" => false, "message" => "ULB context is required", "data" => null], 422);
            }

            $validator = Validator::make($request->all(), ['id' => 'required|integer']);
            if ($validator->fails()) {
                return response()->json(["status" => false, "message" => "A valid camera ID is required", "data" => null], 422);
            }

            $camera = CctvCamera::where('ulb_id', $ulbId)->find($request->id);
            if (!$camera) {
                return response()->json(["status" => false, "message" => "Camera not found", "data" => null], 404);
            }

            $camera->enabled = false;
            $camera->save();
            return responseMsg(true, "CCTV camera disabled", null);
        } catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), '');
        } catch (Exception $e) {
            return responseMsg(false, 'Internal Server Error', '');
        }
    }

    public function vehicleTypeList(Request $request){
        try{
            $user = Auth()->user();
            $ulbId = $request->ulbId??$user->ulb_id;            
            $data = $this->_VehicleTypeMaster;
           
            if($request->key){
                $data = $data->where(function($where) use($request){
                    $where->orWhere("vehicle_type","ILIKE","%".$request->key."%");
                });
            }
            if($request->all){
                $data = $data->where("lock_status",false)->get();
                return responseMsg(true,"All Vehicle Type List",camelCase(remove_null($data)));
            }
            if($request->has("offset") && $request->has("limit")){
                $data = $data->where("lock_status",false)->offset($request->offset)->limit($request->limit)->get();
                return responseMsg(true,"All Vehicle Type List",camelCase(remove_null($data)));
            }
            $data->orderBy("id","ASC");
            $data = paginator($data,$request);
            $data["data"]= collect($data["data"])->map(function($val){
                $val->total_active_vehicle = $val->getVehicleList()->where("lock_status",false)->count();                
                return $val;
            });
            return responseMsg(true,"Vehicle Type Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleTypeAdd(Request $request){
        try{
            $rules = [
                "vehicleType"=>"required|unique:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",vehicle_type",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $id = $this->_VehicleTypeMaster->store($request);
            $data = $this->_VehicleTypeMaster->find($id);
            return responseMsg(true,"new Vehicle Type Add",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleTypeEdit(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",id",
                "vehicleType"=>"required|unique:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",vehicle_type".($request->id ? (",".$request->id.",id") : ""),
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $id = $this->_VehicleTypeMaster->edit($request);
            $data = $this->_VehicleTypeMaster->find($id);
            return responseMsg(true,"Vehicle Type Edit",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
            
    }

    public function vehicleTypeDtl(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",id"
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_VehicleTypeMaster->find($request->id);
            return responseMsg(true,"Vehicle Type Dtl",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
            
    }

    public function vehicleTypeLockUnlock(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",id",
                "lockStatus"=>"required|bool",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_VehicleTypeMaster->edit($request);
            return responseMsg(true,"Vehicle Type Update","");
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }


    public function vehicleList(Request $request){
        try{
            $user = Auth()->user();
            $ulbId = $request->ulbId??$user->ulb_id;            
            $data = $this->_VehicleDetail->select("vehicle_details.*","vehicle_type_masters.vehicle_type","driver_details.driver_name","vehicle_driver_maps.vehicle_id","vehicle_driver_maps.driver_id")
                ->join("vehicle_type_masters","vehicle_type_masters.id","vehicle_details.vehicle_type_id")
                ->leftJoin("vehicle_driver_maps",function($join){
                    $join->on("vehicle_driver_maps.vehicle_id","vehicle_details.id")
                    ->where("vehicle_driver_maps.lock_status",false);
                })
                ->leftJoin("driver_details","driver_details.id","vehicle_driver_maps.driver_id");
           
            if($request->key){
                $data = $data->where(function($where) use($request){
                    $where->orWhere("vehicle_type_masters.vehicle_type","ILIKE","%".$request->key."%")
                    ->orWhere("vehicle_details.vehicle_no","ILIKE","%".$request->key."%");
                });
            }
            if($request->all){
                $data = $data->where("vehicle_details.lock_status",false)->get();
                return responseMsg(true,"All Vehicle List",camelCase(remove_null($data)));
            }
            if($request->has("offset") && $request->has("limit")){
                $data = $data->where("vehicle_details.lock_status",false)->offset($request->offset)->limit($request->limit)->get();
                return responseMsg(true,"All Vehicle List",camelCase(remove_null($data)));
            }
            $data->orderBy("vehicle_details.id","ASC");
            $data = paginator($data,$request);
            return responseMsg(true,"Vehicle Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleAdd(Request $request){
        try{
            $rules = [
                "vehicleTypeId" => "required|exists:" .
                    $this->_VehicleTypeMaster->getConnectionName() . "." .
                    $this->_VehicleTypeMaster->getTable() . ",id",

                "vehicleNo" => "required|unique:" .
                    $this->_VehicleDetail->getConnectionName() . "." .
                    $this->_VehicleDetail->getTable() . ",vehicle_no",

                "gpsId" => "nullable|unique:" .
                    $this->_VehicleDetail->getConnectionName() . "." .
                    $this->_VehicleDetail->getTable() . ",gps_id",
                "wardIds" => "required|array",
                "wardIds.*" => "integer|exists:" .$this->_UlbWardMaster->getConnectionName().".". $this->_UlbWardMaster->getTable() . ",id",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $request->merge(["userId"=>$user->id,"ulbId"=>$user->ulb_id]);
            DB::beginTransaction();
            $id = $this->_VehicleDetail->store($request);
            foreach($request->wardIds as $val){
                $newRequest = new Request(["wardMstrId"=>$val,"vehicleId"=>$id,"userId"=>$user->id]);
                $this->_VehicleWardMap->store($newRequest);
            }
            DB::commit();
            $data = $this->_VehicleDetail->find($id);
            return responseMsg(true,"new Vehicle Add",camelCase(remove_null($data)));
        }catch(CustomException $e){
            DB::rollback();
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            DB::rollback();
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleEdit(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",id",
                "vehicleTypeId" => "required|exists:" .
                    $this->_VehicleTypeMaster->getConnectionName() . "." .
                    $this->_VehicleTypeMaster->getTable() . ",id",

                "vehicleNo" => "required|unique:" .
                    $this->_VehicleDetail->getConnectionName() . "." .
                    $this->_VehicleDetail->getTable() . ",vehicle_no"
                    .($request->id ? (",".$request->id.",id") : ""),
                    

                "gpsId" => "nullable|unique:" .
                    $this->_VehicleDetail->getConnectionName() . "." .
                    $this->_VehicleDetail->getTable() . ",gps_id"
                    .($request->id ? (",".$request->id.",id") : ""),
                "wardIds" => "required|array",
                "wardIds.*" => "integer|exists:" .$this->_UlbWardMaster->getConnectionName().".". $this->_UlbWardMaster->getTable() . ",id",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            DB::beginTransaction();
            $id = $this->_VehicleDetail->edit($request);
            $this->_VehicleWardMap->where("vehicle_id",$request->id)->update(["lock_status"=>true]);
            foreach($request->wardIds as $val){
                $newRequest = new Request(["wardMstrId"=>$val,"vehicleId"=>$request->id,"userId"=>$user->id]);
                $this->_VehicleWardMap->store($newRequest);
            }
            DB::commit();
            $data = $this->_VehicleDetail->find($id);
            return responseMsg(true,"Vehicle Edit",camelCase(remove_null($data)));
        }catch(CustomException $e){
            DB::rollback();
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            DB::rollback();
            return responseMsg(false,"Internal Server Error","");
        }
            
    }

    public function vehicleDtl(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleDetail->getConnectionName().".".$this->_VehicleDetail->getTable().",id"
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_VehicleDetail->find($request->id);
            $data->vehicle_type = $this->_VehicleTypeMaster->find($data->vehicle_type_id)?->vehicle_type;
            return responseMsg(true,"Vehicle Dtl",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
            
    }

    public function getVehicleWardMap(Request $request){
        try{
            $user = Auth()->user();
            $rules = [
                "vehicleId"=>"required|digits_between:1,9223372036854775807|exists:".$this->_VehicleDetail->getConnectionName().".".$this->_VehicleDetail->getTable().",id",
                
            ];
            $validated = Validator::make($request->all(),$rules);
            if($validated->fails()){
                return validationError($validated);
            }
            $vehicle = $this->_VehicleDetail->find($request->vehicleId);
            $wardMaps = $vehicle->getVehicleWards()->get();
            return responseMsg(true,"Ward Vehicle Map",camelCase($wardMaps));

        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleLockUnlock(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleDetail->getConnectionName().".".$this->_VehicleDetail->getTable().",id",
                "lockStatus"=>"required|bool",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_VehicleDetail->edit($request);
            return responseMsg(true,"Vehicle Update","");
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleMovement111(Request $request){
        try{
            $rules = [
                "gpsId"=>"required|exists:".$this->_VehicleDetail->getConnectionName().".".$this->_VehicleDetail->getTable().",gps_id",
                "latitude"=>"required",
                "longitude"=>"required",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $vehicle = $this->_VehicleDetail->where("gps_id",$request->gpsId)->first();
            $vehicleDriverMap = $this->_VehicleDriverMap->where("vehicle_id",$vehicle?->id)->first();
            $request->merge([
                "vehicle_driver_map_id"=>$vehicleDriverMap?->id,
                "created_at"
            ]);
            $id = $this->_VehicleMovementLog->store($request);
            return responseMsg(true,"Update Date",["id"=>$id]);
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleMovement(Request $request)
    {
        try {
            // 1. Validation
            $data = $request->validate([
                "gpsId" => "required",
                "latitude" => "required|numeric",
                "longitude" => "required|numeric",
                "speed" => "nullable|numeric",
                "timestamp" => "nullable"
            ]);

            // 2. Optimized Metadata Lookup (Cache for 24h)
            $cacheKey = "vehicle_meta_" . $request->gpsId;
            $meta = Cache::remember($cacheKey, 86400, function() use ($request) {
                $vehicle = $this->_VehicleDetail->where("gps_id", $request->gpsId)->first();
                if (!$vehicle) return null;
                
                $driverMap = $this->_VehicleDriverMap->where("vehicle_id", $vehicle->id)->first();
                return [
                    'vehicle_id' => $vehicle->id,
                    'map_id' => $driverMap?->id
                ];
            });

            if (!$meta) {
                return responseMsg(false, "Vehicle not found", "");
            }

            // 3. Update Redis Live Status (For instant Map updates)
            Redis::hmset("live_location:{$request->gpsId}", [
                'lat' => $request->latitude,
                'lng' => $request->longitude,
                'speed' => $request->speed ?? 0,
                'updated_at' => now()->toDateTimeString()
            ]);

            // 4. Prepare Job Data
            $logData = array_merge($data, [
                'vehicle_driver_map_id' => $meta['map_id'],
                'vehicle_id' => $meta['vehicle_id'],
                'created_at' => $request->timestamp ?? now()
            ]);

            // 5. Dispatch to Queue
            ProcessVehicleLog::dispatch($logData)->onQueue('telemetry');

            return responseMsg(true, "Data Received", ["id" => $request->gpsId]);

        } catch (Exception $e) {
            return responseMsg(false, "Internal Error", $e->getMessage());
        }
    }
    

    public function driverList(Request $request){
        try{
            $user = Auth()->user();
            $ulbId = $request->ulbId??$user->ulb_id;            
            $data = $this->_DriverDetail->select("driver_details.*","vehicle_details.vehicle_no","vehicle_type_masters.vehicle_type","vehicle_driver_maps.vehicle_id","vehicle_driver_maps.driver_id")
                ->leftJoin("vehicle_driver_maps",function($join){
                    $join->on("vehicle_driver_maps.driver_id","driver_details.id")
                    ->where("vehicle_driver_maps.lock_status",false);
                })
                ->leftJoin("vehicle_details","vehicle_details.id","vehicle_driver_maps.vehicle_id")
                ->leftJoin("vehicle_type_masters","vehicle_type_masters.id","vehicle_details.vehicle_type_id");
           
            if($request->key){
                $data = $data->where(function($where) use($request){
                    $where->orWhere("vehicle_type_masters.vehicle_type","ILIKE","%".$request->key."%")
                    ->orWhere("vehicle_details.vehicle_no","ILIKE","%".$request->key."%")
                    ->orWhere("driver_details.driver_name","ILIKE","%".$request->key."%")
                    ->orWhere("driver_details.mobile_no","ILIKE","%".$request->key."%");
                });
            }
            if($request->all){
                $data = $data->where("driver_details.lock_status",false)->get();
                return responseMsg(true,"All Driver List",camelCase(remove_null($data)));
            }
            if($request->has("offset") && $request->has("limit")){
                $data = $data->where("driver_details.lock_status",false)->offset($request->offset)->limit($request->limit)->get();
                return responseMsg(true,"All Driver List",camelCase(remove_null($data)));
            }
            $data->orderBy("driver_details.id","ASC");
            $data = paginator($data,$request);
            $data["data"] = collect($data["data"])->map(function($item){
                $item->img_path = $item->img_path ? url("/")."/".$item->img_path : null;
                return $item;
            });
            return responseMsg(true,"Driver Fetched",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function uploadDoc(Request $request){
        try{
            $userId = $request->id;
            $user = $this->_DriverDetail->find($request->id);
            if($request->imgDoc){
                $relativePath = "driver/img";
                $imageName = $userId.".".$request->imgDoc->getClientOriginalExtension();
                $filePath = public_path( $user->img_path);
                if (file_exists($filePath)) {
                    // Delete the file
                    @unlink($filePath);
                }
                $request->imgDoc->move($relativePath, $imageName);
                $request->merge(["imgPath"=>$relativePath."/".$imageName]);
            }

            $user->img_path = $request->imgPath ? $request->imgPath : $user->img_path;           
            $user->update();
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }


    public function driverAdd(Request $request){
        try{
            $userImgDocClosure = function ($attribute, $value, $fail) {
                if($value instanceof UploadedFile){
                    // Correct the confusing PDF check logic to simple max size for images
                    $maxSize = 5120; // 5MB in KB
                    $maxSizeBytes = $maxSize * 1024;
                    if ($value->getSize() > $maxSizeBytes) {
                        $fail('The ' . $attribute . ' may not be greater than ' . $maxSize . ' kilobytes.');
                    }
                }
            };
            $rules = [
                "firstName" => "required",
                "middleName" => "nullable",
                "lastName" => "nullable",
                "email" => "nullable",
                "mobileNo" => "required|digits:10|regex:/[0-9]{10}/",
                "licenseNo"=>"required|unique:" .
                    $this->_DriverDetail->getConnectionName() . "." .
                    $this->_DriverDetail->getTable() . ",license_no",
                "licenseValidUpto"=>"required|date|after_or_equal:". Carbon::now()->format("Y-m-d"),
                "imgDoc"=>[
                    "nullable",
                    "mimes:bmp,jpeg,jpg,png",
                    $userImgDocClosure,
                ],
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $request->merge(["userId"=>$user->id,"ulbId"=>$user->ulb_id,"driverName"=>trim($request->firstName." ".$request->middleName." ".$request->lastName)]);
            DB::beginTransaction();
            $id = $this->_DriverDetail->store($request); 
            $request->merge(["id"=>$id]);           
            $this->uploadDoc($request);
            DB::commit();
            $data = $this->_DriverDetail->find($id);
            return responseMsg(true,"new Driver Add",camelCase(remove_null($data)));
        }catch(CustomException $e){
            DB::rollback();
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            DB::rollback();
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function driverEdit(Request $request){
        try{
            $userImgDocClosure = function ($attribute, $value, $fail) {
                if($value instanceof UploadedFile){
                    // Correct the confusing PDF check logic to simple max size for images
                    $maxSize = 5120; // 5MB in KB
                    $maxSizeBytes = $maxSize * 1024;
                    if ($value->getSize() > $maxSizeBytes) {
                        $fail('The ' . $attribute . ' may not be greater than ' . $maxSize . ' kilobytes.');
                    }
                }
            };
            $rules = [
                "id"=>"required|numeric|exists:".$this->_VehicleTypeMaster->getConnectionName().".".$this->_VehicleTypeMaster->getTable().",id",                
                "firstName" => "required",
                "middleName" => "nullable",
                "lastName" => "nullable",
                "email" => "nullable",
                "mobileNo" => "required|digits:10|regex:/[0-9]{10}/",
                "licenseNo"=>"required|unique:" .
                    $this->_DriverDetail->getConnectionName() . "." .
                    $this->_DriverDetail->getTable() . ",license_no"
                    .($request->id ? (",".$request->id.",id") : ""),                
                "licenseValidUpto"=>"required|date|after_or_equal:". Carbon::now()->format("Y-m-d"),
                "imgDoc"=>[
                    "nullable",
                    "mimes:bmp,jpeg,jpg,png",
                    $userImgDocClosure,
                ],
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $request->merge(["driverName"=>trim($request->firstName." ".$request->middleName." ".$request->lastName)]);  
            DB::beginTransaction();
            $id = $this->_DriverDetail->edit($request);
            $this->uploadDoc($request);
            DB::commit();
            $data = $this->_DriverDetail->find($id);
            return responseMsg(true,"Driver Edit",camelCase(remove_null($data)));
        }catch(CustomException $e){
            DB::rollback();
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            DB::rollback();
            return responseMsg(false,"Internal Server Error","");
        }
            
    }

    public function driverDtl(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_DriverDetail->getConnectionName().".".$this->_DriverDetail->getTable().",id"
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_DriverDetail->find($request->id);
            return responseMsg(true,"Driver Dtl",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
            
    }


    public function driverLockUnlock(Request $request){
        try{
            $rules = [
                "id"=>"required|numeric|exists:".$this->_DriverDetail->getConnectionName().".".$this->_DriverDetail->getTable().",id",
                "lockStatus"=>"required|bool",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();  
            $data = $this->_DriverDetail->edit($request);
            return responseMsg(true,"Driver Update","");
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function vehicleDriverMap(Request $request){
        try{
            $rules = [
                "vehicleId"=>"required|numeric|exists:".$this->_VehicleDetail->getConnectionName().".".$this->_VehicleDetail->getTable().",id",
                "driverId"=>"required|numeric|exists:".$this->_DriverDetail->getConnectionName().".".$this->_DriverDetail->getTable().",id",
            ];
            $validator = Validator::make($request->all(),$rules);
            if($validator->fails()){
                return validationError($validator);
            }
            $user = Auth()->user();
            $request->merge(["user_id"=>$user->id]);
            $this->_VehicleDriverMap->where("vehicle_id",$request->vehicleId)->update(["lock_status"=>true]);  
            $data = $this->_VehicleDriverMap->store($request);
            return responseMsg(true,"Vehicle Driver Mapped","");
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }
}
