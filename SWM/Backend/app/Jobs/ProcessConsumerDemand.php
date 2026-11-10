<?php

namespace App\Jobs;

use App\Bll\SWM\ConsumerDemandGenerateBll;
use Carbon\Carbon;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessConsumerDemand implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $consumerId;
    public $currentDate;

    public function __construct($consumerId,$currentDate=null)
    {
        $this->consumerId = $consumerId;
        $this->currentDate = $currentDate;
    }

    public function handle(): void
    { 
        $currentMonthStartDate = Carbon::now()->format("Y-m-01");
        try {
            DB::transaction(function () {
                $request = new Request(["id" => $this->consumerId,"currentDate"=>$this->currentDate]);
                $objDemandBll = new ConsumerDemandGenerateBll($request);
                $objDemandBll->generateDemand();
            });

            // This prints to your Windows Command Prompt / Terminal
            echo "\033[32m[COMPLETE]\033[0m Consumer ID: {$this->consumerId}\n";

        } catch (Exception $e) {
            // This prints the error to the terminal in Red
            echo "\033[31m[FAILED]\033[0m   Consumer ID: {$this->consumerId} - {$e->getMessage()}\n";
            
            // Re-throw the exception so Laravel knows the job actually failed
            throw $e; 
        }
    }

    public function failed(Exception $exception): void
    {
        \Log::error("Demand Generation failed for Consumer ID {$this->consumerId}: " . $exception->getMessage());
    }
}