<?php

namespace App\Http\Controllers\DBSystem;

use App\Exceptions\CustomException;
use App\Http\Controllers\Property\PropertyController;
use App\Http\Controllers\Property\SafController;
use App\Http\Controllers\Trade\TradeLicenseController;
use App\Http\Controllers\Water\ConsumerController;
use App\Http\Controllers\Water\WaterApplicationController;
use App\Http\Requests\Common\AddCitizenRequest;
use App\Http\Requests\Common\RequestOtpVerify;
use App\Http\Requests\Common\RequestSendOtpUpdate;
use App\Mail\ForgotPassword;
use App\Models\Citizen;
use App\Models\DBSystem\OtpRequest;
use App\Models\DBSystem\UlbMaster;
use App\Models\Property\ActiveSafDetail;
use App\Models\Property\PropertyDetail;
use App\Models\Property\RejectedSafDetail;
use App\Models\Property\SafDetail;
use App\Models\Trade\ActiveTradeLicense;
use App\Models\Trade\ApplicationTypeMaster;
use App\Models\Trade\RejectedTradeLicense;
use App\Models\Trade\TradeLicense;
use App\Models\Trade\TradeLicenseLog;
use App\Models\Water\Consumer;
use App\Models\Water\WaterActiveApplication;
use App\Models\Water\WaterApplication;
use App\Models\Water\WaterRejectedApplication;
use App\Pipelines\Citizen\SearchByEmail;
use App\Pipelines\Citizen\SearchByMobile;
use App\Trait\Property\PropertyTrait;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Pipeline\Pipeline;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Validator;

class CitizenController extends NotificationController
{
    use PropertyTrait;
    /**
     *       created by: Sandeep Bara
     *       Date       : 2025-07-16
             status     : open
            📖         : read data (read connection use)
            ✍️          : write data (write connection use)
     */

    public $_currentDateTime;
    public $_redis;
    protected $_modelUser;
    protected $_modelOtpRequest;
    protected $_modelUlbWardMaster;
    protected $_UlbMaster;

    protected $_menuController;    
    protected $_mobileRoleArray;
    protected $_ActiveSafDetail;
    protected $_SafDetail;
    protected $_RejectedSafDetail;
    protected $_PropertyDetail;

    protected $_WaterApplication;
    protected $_WaterActiveApplication;
    protected $_WaterRejectedApplication;
    protected $_Consumer;

    protected $_ActiveTradeLicense;
    protected $_RejectedTradeLicense;
    protected $_TradeLicense;
    protected $_TradeLicenseLog;
    
    
    public function __construct()
    {
        parent::__construct();
        $this->_currentDateTime = Carbon::now();
        $this->_modelUser = new Citizen();
        $this->_modelOtpRequest = new OtpRequest();
        $this->_UlbMaster = new UlbMaster();

        $this->_ActiveSafDetail = new ActiveSafDetail();
        $this->_SafDetail = new SafDetail();
        $this->_RejectedSafDetail = new RejectedSafDetail();
        $this->_PropertyDetail = new PropertyDetail();

        $this->_WaterApplication = new WaterApplication();
        $this->_WaterActiveApplication = new WaterActiveApplication();
        $this->_WaterRejectedApplication = new WaterRejectedApplication();
        $this->_Consumer = new Consumer();

        $this->_ActiveTradeLicense = new ActiveTradeLicense();
        $this->_RejectedTradeLicense = new RejectedTradeLicense();
        $this->_TradeLicense = new TradeLicense();
        $this->_TradeLicenseLog = new TradeLicenseLog();

    }

    public function registerOtp(RequestSendOtpUpdate $request){
        try {
            $mobileNo  = $request->phoneNo;
            $otpType = $request->otpType??'Register';
            $request->merge(["strict" => true]);
            if (!$mobileNo) {
                throw new CustomException("Invalid Data Given");
            }
            $userData = $this->_modelUser->where('phone_no', $mobileNo)
                ->orderBy('id', 'DESC')->first();
            if($userData && $mobileNo)
            {
                throw new CustomException("Mobile Already exist");
            }
            $generateOtp = generateOtp();
            $request->merge([
                "mobileNo" => $mobileNo,
                "type" => $otpType,
                "otpType" => $otpType,
                "Otp" => $generateOtp
            ]);
            $smsDta = OTP($request->all(),$otpType);
            if ($mobileNo &&  !$smsDta["status"]) {
                throw new CustomException("Some Error Occurs Server On Otp Sending");
            }
            $sms = $smsDta["sms"] ?? "";
            $temp_id = $smsDta["temp_id"] ?? "";
            $sendsOn = [];
            if ($mobileNo) {
                $response = send_sms($mobileNo, $sms, $temp_id);
                $sendsOn[] = "mobile No.";
            }
            $responseSms = "";
            foreach ($sendsOn as $val) {
                $responseSms .= ($val . " & ");
            }
            $responseSms = trim($responseSms, "& ");
            $responseSms = "OTP send to your " . $responseSms;
            $this->_modelOtpRequest->store($request);
            if(env("APP_DEBUG")){
                $responseSms.=" ".$generateOtp;
            }
            return responseMsg(true, $responseSms, "");
        }catch (CustomException $e) {
            return responseMsg(false, $e->getMessage(), "");
        }catch (Exception $e) {
            return responseMsg(false, "Internal Server Error", "");
        }
    }

    public function verifyOtpAndRegister(RequestOtpVerify $request){
        try{
            $rules=[
                "mobile"=>"required|digits:10",
                "otpType"=>"required|in:Register",
            ];
            $validated = Validator::make( $request->all(),$rules);
            if ($validated->fails()){
                return validationError($validated);
            }
            $response = $this->verifyOtp($request);
            if(!$response->original["status"]){
                return $response;
            }
            $mobileNo = $request->mobile;
            $request->merge(["phoneNo"=>$request->mobile]);
            $userData = $this->_modelUser->where('phone_no', $mobileNo)
                ->orderBy('id', 'DESC')->first();
            if($userData && $mobileNo)
            {
                throw new CustomException("Mobile Already exist");
            }
            $id = $this->_modelUser->store($request);
            $user = $this->_modelUser->find($id);
            $tockenDtl = $user->createToken('citizen-token');

            $ipAddress = getClientIpAddress(); #$req->userAgent()
            $bousuerInfo = [
                "login_type"=>$request->type,
                "latitude" => $request->browserInfo["latitude"] ?? $request->latitude ??"",
                "longitude" => $request->browserInfo["longitude"] ?? $request->longitude ?? "",
                "machine" => $request->browserInfo["machine"] ?? $request->machine ?? "",
                "browser_name" => $request->browserInfo["browserName"]?? $request->browserName ?? $request->userAgent(),
                "ip" => $ipAddress ?? "",
            ];
            DB::table('personal_access_tokens')
                ->where('id', $tockenDtl->accessToken->id)
                ->update($bousuerInfo);
            $token = $tockenDtl->plainTextToken;
            $data['token'] = $token;
            $data['userDetails'] = $user;
            $key = 'last_activity_' . $user->id."_".$tockenDtl->accessToken->id;
            Redis::set($key, $this->_currentDateTime);            // Caching 
            
            return responseMsg(true, "You have Logged In Successfully", camelCase($data));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){dd($e);
            return responseMsg(false,"Server Error","");
        }
    }
    /**=============✍️ create new user ✍️================
     * Store a newly created resource in storage.
     */
    public function store(AddCitizenRequest $request)
    {
        //
        try{
            DB::beginTransaction();
            $userId = $this->_modelUser->store($request); 
            DB::commit();
            return responseMsg(true,"Register Successfully",["id"=>$userId]);
        }catch(CustomException $e){
            DB::rollBack();
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            DB::rollBack();dd($e);
            return responseMsg(false,"Internal Server Error","");
        }
    }

    

    /**=============📖✍️ Login the user ✍️📖================
     * | login the user using email, user_name and password
     */
    public function citizenLoginSendOtp(RequestSendOtpUpdate $request){
        try{
            
            $rules=[
                    "mobile"=>"required|digits:10",
                    "otpType"=>"required|in:Login",
            ];
            $validated = Validator::make( $request->all(),$rules);
            if ($validated->fails()){
                return validationError($validated);
            }
            $email = $request->email;
            $mobileNo  = $request->mobile;
            $otpType = $request->otpType;
            $request->merge(["strict" => true]);
            if (!$email && !$mobileNo) {
                throw new CustomException("Invalid Data Given");
            }
            $userData = $this->_modelUser->where('lock_status', false)
                ->orderBy('id', 'DESC');
            $userData = app(Pipeline::class)
                ->send(
                    $userData
                )
                ->through([
                    SearchByEmail::class,
                    SearchByMobile::class,
                ])
                ->thenReturn()
                ->first();
            if (!$userData && $email) {
                throw new CustomException("Email doesn't exist");
            }
            elseif(!$userData && $mobileNo)
            {
                throw new CustomException("Mobile doesn't exist");
            }

            elseif(!$userData)
            {
                throw new CustomException("Data Not Found");
            }
            $generateOtp = generateOtp();
            $request->merge([
                "mobileNo" => $request->mobile,
                "type" => $otpType,
                "Otp" => $generateOtp,
                "userId" => $userData->id,
                "userType" => $userData->gettable(),
            ]);
            $smsDta = OTP($request->all(),$otpType);
            if ($mobileNo &&  !$smsDta["status"]) {
                throw new CustomException("Some Error Occurs Server On Otp Sending");
            }
            $sms = $smsDta["sms"] ?? "";
            $temp_id = $smsDta["temp_id"] ?? "";
            $sendsOn = [];
            if ($mobileNo) {
                $response = send_sms($mobileNo, $sms, $temp_id);
                $sendsOn[] = "mobile No.";
            }
            if ($email) {
                $sendsOn[] = "Email";
                $details = [
                    "title" => "Login Otp information",
                    "name"  => $userData->getTable() != "users" ? $userData->user_name : $userData->name,
                    "Otp" => $request->Otp
                ];
                try {
                    Mail::to($userData->email)->send(new ForgotPassword($details));
                } catch (Exception $e) {
                    throw new CustomException("Currently Email Service is stopped Please try another way");
                }
            }
            $responseSms = "";
            foreach ($sendsOn as $val) {
                $responseSms .= ($val . " & ");
            }
            $responseSms = trim($responseSms, "& ");
            $responseSms = "OTP send to your " . $responseSms;
            $this->_modelOtpRequest->store($request);
            if(env("APP_DEBUG")){
                $responseSms.=" ".$generateOtp;
            }

            return responseMsg(true, $responseSms, "");
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }
    public function loginAuthOtp(RequestOtpVerify $request){
        try{
            $rules = [
                'mobile' => 'required_without_all:email|digits:10|regex:/[0-9]{10}/',
                'email' => 'required_without_all:mobile|email',
                "otpType"=>"required|in:Login",
            ];

            $validated = Validator::make(
                $request->all(),$rules
            );
            if ($validated->fails()){
                return validationError($validated);
            }
            $response = $this->verifyOtp($request);
            if(!$response->original["status"]){
                return $response;
            }
            $request->merge(["phoneNo"=>$request->mobile]);
            $request->merge(["strict"=>true]);
            $user = $this->_modelUser->orderBy('id', 'DESC');
                
            $user = app(Pipeline::class)
                ->send(
                    $user
                )
                ->through([
                    SearchByEmail::class,
                    SearchByMobile::class,
                ])
                ->thenReturn()
                ->first();
            if (!$user && $request->email){
                throw new CustomException("Oops! Given email does not exist");
            }
            if (!$user && $request->phoneNo){
                throw new CustomException("Oops! Given mobile number does not exist");
            }
            if ($user->lock_status == true){
                throw new CustomException("You are not authorized to log in!");
            }

            $muser = $this->_modelUser->find($user->id);

            $maAllow = $muser->max_login_allow;
            $remain = ($muser->tokens->count("id")??0) - $maAllow;
            $c = 0;
            foreach($muser->tokens->sortBy("id")->values() as  $key =>$token){                  
                if($remain<$key)
                {
                    break;
                }
                $c+=1;
                $userType = $muser->getTable();
                $redisKey  = "ulb_id:" . $userType . ":" . $muser->id . ":" . $token->id;
                Redis::del($redisKey );
                $token->expires_at = Carbon::now();
                $token->update();
                $token->forceDelete();
            }

            $tockenDtl = $user->createToken('my-app-token');
            $ipAddress = getClientIpAddress(); #$req->userAgent()
            $bousuerInfo = [
                "login_type"=>$request->type,
                "latitude" => $request->browserInfo["latitude"] ?? $request->latitude ??"",
                "longitude" => $request->browserInfo["longitude"] ?? $request->longitude ?? "",
                "machine" => $request->browserInfo["machine"] ?? $request->machine ?? "",
                "browser_name" => $request->browserInfo["browserName"]?? $request->browserName ?? $request->userAgent(),
                "ip" => $ipAddress ?? "",
            ];
            DB::table('personal_access_tokens')
                ->where('id', $tockenDtl->accessToken->id)
                ->update($bousuerInfo);

            $token = $tockenDtl->plainTextToken;
            $user->user_img = $user->user_img ? url("/")."/".$user->user_img : null;
            $data['token'] = $token;
            $data['userDetails'] = $user;
            $key = 'last_activity_' . $user->id."_".$tockenDtl->accessToken->id;
            Redis::set($key, $this->_currentDateTime);            // Caching 
            
            return responseMsg(true, "You have Logged In Successfully", camelCase($data));
            

        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    /**=============📖✍️ logout the user ✍️📖================
     * | logout
     */
    public function logout(Request $req)
    {
        try {
            $user = $req->user();
            $userType = $user->getTable();
            $key = "ulb_id:" . $userType . ":" . $user->id . ":" . $req->bearerToken();
            Redis::del($key);
            $req->user()->currentAccessToken()->delete();                               // Delete the Current Accessable Token
            return responseMsgs(true, "You have Logged Out", [], "", "1.0", responseTime(), "POST", $req->deviceId);
        } catch (Exception $e) {
            return response()->json($e, 400);
        }
    }

    public function profile(){
        try{
            $user = Auth::user();
            $user = $this->_modelUser->find($user->id);
            $user->user_img = $user->user_img ? url("/")."/".$user->user_img : null;
            return responseMsg(true,"User Profile",camelCase(remove_null($user)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch (Exception $e) {
            return responseMsg(false,"Internal Server Error","");
        }
    }

    /**Citizen Applications */

    public function citizenApplications(Request $request){
        try{
            
            $user = Auth::user();
            $safController = new SafController();
            $propertyController = new PropertyController();
            $waterApplicationController = new WaterApplicationController();
            $consumerController = new ConsumerController();
            $TradeLicenseController = new TradeLicenseController();

            $saf = [];
            $property = [];
            $waterApplication = [];
            $consumer = [];
            $tradeLicense = [];

            $safResponse = $safController->citizenSaf($request);
            if($safResponse->original["status"]){
                $saf = $safResponse->original["data"];
            }

            $propertyResponse = $propertyController->citizenProperty($request);
            if($propertyResponse->original["status"]){
                $property = $propertyResponse->original["data"];
            }

            $waterApplicationResponse = $waterApplicationController->citizenApplication($request);
            if($waterApplicationResponse->original["status"]){
                $waterApplication = $waterApplicationResponse->original["data"];
            }

            $waterConsumerResponse = $consumerController->citizenConsumer($request);
            if($waterConsumerResponse->original["status"]){
                $consumer = $waterConsumerResponse->original["data"];
            }            
            
            $tradeResponse = $TradeLicenseController->citizenTrade($request);
            if($tradeResponse->original["status"]){
                $tradeLicense = $tradeResponse->original["data"];
            }
            $data["saf"]=$saf;
            $data["property"]=$property;
            $data["waterApplication"]=$waterApplication;
            $data["consumer"]=$consumer;
            $data["tradeLicense"]=$tradeLicense;
            return responseMsg(true,"Citizen App List",camelCase(remove_null($data)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }catch(Exception $e){
            return responseMsg(false,"Server Error","");
        }
    }
}
