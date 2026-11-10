<?php

namespace App\Http\Controllers;

use App\Exceptions\CustomException;
use App\Http\Controllers\SWM\ReportController;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;

class DashBoardController extends Controller
{
    /**
     * create date : 2025-08-13
     * status : open
     */

    private $_SwmReportController;

    function __construct()
    {
        $this->_SwmReportController = new ReportController();
    }

    public function swmDemandCollectionCurrentYear(Request $request){
        try{ 
            $request->merge(["all"=>true]);
            $propResponse = $this->_SwmReportController->wardWiseDcb($request); 
            if(!$propResponse->original["status"]){
                return $propResponse;
            } 
            $response = collect($propResponse->original["data"]["summary"]??[]);
            return responseMsg(true,"Swm Demand Collection Due",camelCase(remove_null($response)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function monthlyCollection(Request $request){
        try{ 
            $fyear = getFY();
            if ($request->fyear) {
                $fyear = $request->fyear;
            }

            list($fromDate, $uptoDate) = FyearFromUptoDate($fyear);
            $request->merge(["fromDate" => $fromDate, "uptoDate" => $uptoDate]);

            $propResponse = $this->_SwmReportController->dateWiseCollection($request);

            if (!$propResponse->original["status"]) {
                return $propResponse;
            }

            $data = collect($propResponse->original["data"]["data"] ?? []);

            $fromDate = Carbon::parse($fromDate);
            $uptoDate = Carbon::parse($uptoDate);

            $response = collect();

            while ($fromDate->lte($uptoDate)) {
                $monthStart = $fromDate->clone()->startOfMonth()->format("Y-m-d");
                $monthEnd = $fromDate->clone()->endOfMonth()->format("Y-m-d");

                // ✅ Correct use of whereBetween
                $coll = $data->whereBetween("date", [$monthStart, $monthEnd]);

                $response->push([
                    "month" => $fromDate->format("Y-m"),
                    "amount" => roundFigure($coll->sum("amount")),
                    "consumer" => ($coll->sum("consumer")),
                    "count" => $coll->count(),
                ]);

                // ✅ Safely move to the next month
                $fromDate->addMonthNoOverflow();
            }

            return responseMsg(true, "Swm Monthly Collection", camelCase(remove_null($response)));

        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function totalRFIDMapNotMap(Request $request){
        try{ 
            $fyear = getFY();
            if ($request->fyear) {
                $fyear = $request->fyear;
            }

            list($fromDate, $uptoDate) = FyearFromUptoDate($fyear);
            $request->merge(["uptoDate" => $uptoDate,"all"=>true]);

            $propResponse = $this->_SwmReportController->consumerRFIDmaped($request);

            if (!$propResponse->original["status"]) {
                return $propResponse;
            }

            $data = collect($propResponse->original["data"] ?? []);

            $mapCount = $data->filter(fn($item) => !empty($item['rfId']))->count();
            $notMapCount = $data->filter(fn($item) => empty($item['rfId']))->count();
            $response =[
                "mapData"=>$mapCount,
                "notMapData"=>$notMapCount,
            ];

            return responseMsg(true, "Data Fetched", camelCase(remove_null($response)));

        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

    public function appliedConnectionCurrentYear(Request $request){
        try{ 
            $fyear = $request->fyear??getFY();
            list($fromDate,$uptoDate) = FyearFromUptoDate($fyear);
            $request->merge(["all"=>true,"fromDate"=>$fromDate,"uptoDate"=>$uptoDate]);

            $propResponse = $this->_SwmReportController->wardWiseAppliedList($request); 
            if(!$propResponse->original["status"]){
                return $propResponse;
            } 
            $response = collect($propResponse->original["data"]["summary"]??[]);
            return responseMsg(true,"Applied Consumer",camelCase(remove_null($response)));
        }catch(CustomException $e){
            return responseMsg(false,$e->getMessage(),"");
        }
        catch(Exception $e){
            return responseMsg(false,"Internal Server Error","");
        }
    }

}
