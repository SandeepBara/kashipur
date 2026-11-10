<?php

namespace App\Bll\SWM;

use App\Models\DBSystem\UlbMaster;
use App\Models\SWM\Consumer;
use App\Models\SWM\ConsumerDemand;
use App\Models\SWM\RateMaster;
use App\Models\SWM\TaxDetail;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConsumerDemandGenerateBll
{
    public $_REQUEST;
    public $_ConsumerId;
    public $_CurrentDate;
    public $_WaterConstant;
    public $_user;
    public $_ulbTypeId;
    public $_TaxArray;
    public $_DemandArray;
    public $_taxId;
    private $_Consumer;
    private $_demandFrom;

    public function __construct($request)
    {
        $this->_REQUEST = $request;
        $this->_ConsumerId = $request->id;
        $this->_CurrentDate = $this->_REQUEST->currentDate ? $this->_REQUEST->currentDate : Carbon::now()->format('Y-m-d');
        $this->loadParam();
        $this->_TaxArray = collect();
        $this->_DemandArray = collect();
    }

    public function loadParam(){  
        $this->_user = Auth::user();  
        $this->_Consumer = Consumer::find($this->_ConsumerId);   
        $ulbDtl = UlbMaster::find($this->_Consumer->ulb_id);
        $lastDemand = $this->_Consumer->getDemand()->orderBy("demand_upto","desc")->first();
        $this->_demandFrom = $lastDemand ? Carbon::parse($lastDemand->demand_upto)->addDay()->format("Y-m-d") : $this->_Consumer->date_of_effective;
        
        $consumerRequest = camelCase($this->_Consumer->toArray())->toArray();
        $this->_REQUEST->merge($consumerRequest);     
    }

    public function generateMeterDemand(){       
        $counter=1;      
        $currentDate = Carbon::parse($this->_CurrentDate)->endOfMonth();
        $demandFrom = Carbon::parse($this->_demandFrom)->startOfDay();
        while($demandFrom->lte($currentDate)){
            ++$counter;
            $uptoDate = $demandFrom->copy()->endOfMonth()->startOfDay();            
            $dayDiff = $demandFrom->copy()->diffInDays($uptoDate) + 1;
            $totalDay  = $demandFrom->copy()->daysInMonth;
            $newRequest = new Request();
            $newRequest->merge(["dateOfEffective"=>$this->_demandFrom]);
            $newRequest->merge($this->_REQUEST->all());

            $calCulator = new TaxCalculator($newRequest);
            $calCulator->getCharge();
            $rate= $calCulator->_GRID;
            
            $unitRate = $rate["ratePerMonth"]/$totalDay;
            $amount = $unitRate * $dayDiff;
            $this->_DemandArray->push([
                "consumerId"=>$this->_Consumer->id,
                "wardMstrId"=>$this->_Consumer->ward_mstr_id,
                "generationDate"=>Carbon::now()->format("Y-m-d"),
                "userId"=>$this->_user?->id,
                "rate"=>$rate["ratePerMonth"],
                "diffDay"=>$dayDiff,
                "demandFrom"=>$demandFrom->format('Y-m-d'),
                "demandUpto"=>$uptoDate->format('Y-m-d'),
                "amount"=>roundFigure($amount),
                "balance"=>roundFigure($amount),
                "unitAmount"=>$unitRate,
                "demandType"=>"Fixed",
            ]);
            $demandFrom = $uptoDate->addDay();
            
        }
    }

    public function generateDemand(){
        $this->generateMeterDemand();
        $objDemand = new ConsumerDemand();
        $objTaxDetail = new TaxDetail();
        if($this->_DemandArray->count()){
            $this->_TaxArray=[
                "consumerId"=>$this->_Consumer->id,
                "taxType"=>$this->_DemandArray->unique("demandType")->implode(","),
                "totalAmount"=>$this->_DemandArray->sum("amount"),
                "taxJson"=>$this->_DemandArray
            ];
            $newTaxRequest = new Request($this->_TaxArray);
            $this->_taxId = $objTaxDetail->store($newTaxRequest);            
            foreach($this->_DemandArray as $demand){
                $demandRequest = new Request($demand);
                $demandRequest->merge(["taxDetailId"=>$this->_taxId]);
                $objDemand->store($demandRequest);
            }
        }
    }

}
