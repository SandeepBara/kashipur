<?php

namespace App\Console\Commands;

use App\Jobs\ProcessConsumerDemand;
use App\Models\SWM\Consumer;
use Carbon\Carbon;
use Illuminate\Console\Command;

class GenerateDemandCommandMonthly extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'swm:generate-demand-command-monthly';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Carbon's built-in check for the last day of the month
        if (Carbon::now()->isLastOfMonth()) {
            $this->startCalculation();
        } else {
            $this->warn("Today is not the last day of the month. Skipping...");
        }
    }

    public function startCalculation()
    {
        $this->info("Starting Demand Generation for " . Carbon::now()->format('F Y'));

        // Target date for the demand (1st of next month)
        $startOfNextMonth = Carbon::now()->addMonthNoOverflow()->startOfMonth()->format("Y-m-d");

        // CRITICAL: added 'use ($startOfNextMonth)' to the closure
        Consumer::where("lock_status", false)->chunkById(1000, function ($consumers) use ($startOfNextMonth) {
            foreach ($consumers as $consumer) {
                // $this->info prints to the DISPATCHER window
                $this->info("Dispatching Consumer ID: {$consumer->id}");
                
                ProcessConsumerDemand::dispatch($consumer->id, $startOfNextMonth);
            }
        });

        $this->info("Successfully dispatched all consumers to the queue.");
    }
    
}
