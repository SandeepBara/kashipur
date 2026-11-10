<?php

namespace App\Jobs;

use App\Events\VehicleLocationUpdated;
use App\Models\DBSystem\DriverDetail;
use App\Models\DBSystem\VehicleDetail;
use App\Models\DBSystem\VehicleMovementLog;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Request;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessVehicleLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function handle(): void
    {
        try {
            // 1. Save Log
            $logModel = new VehicleMovementLog();
            // It is better to use a dedicated method that takes an array, 
            // but keeping your 'store' logic if it requires a Request object:
            $logModel->store(new Request($this->data));

            // 2. Identify Vehicle
            $gpsId = $this->data['gpsId'] ?? null;
            $vehicle = VehicleDetail::where("lock_status", false)
                ->where("gps_id", $gpsId)
                ->first();

            if (!$vehicle) {
                Log::warning("Job processed but Vehicle not found for GPS: " . $gpsId);
                return;
            }

            // 3. Fetch Path & Driver (Optimized)
            $currentDate = Carbon::now()->toDateString();
            
            $logs = VehicleMovementLog::select(
                    "vehicle_movement_logs.latitude", 
                    "vehicle_movement_logs.longitude", 
                    "vehicle_movement_logs.id",
                    "vehicle_driver_maps.driver_id"
                )
                ->join("vehicle_driver_maps", "vehicle_driver_maps.id", "vehicle_movement_logs.vehicle_driver_map_id")
                ->where("vehicle_movement_logs.lock_status", false)
                ->where("vehicle_driver_maps.vehicle_id", $vehicle->id)
                ->whereDate("vehicle_movement_logs.created_at", $currentDate)
                ->orderBy("vehicle_movement_logs.id", "ASC")
                ->get();

            // Take last 50 points for the path
            $path = $logs->take(-50)->values();
            $lastEntry = $path->last();
            
            // Get Driver info
            $driver = $lastEntry ? DriverDetail::find($lastEntry->driver_id) : null;

            // 4. Prepare Object for Frontend
            $vehicle->type = "truck";
            $vehicle->path = $path;
            $vehicle->latitude = $lastEntry?->latitude;
            $vehicle->longitude = $lastEntry?->longitude;
            $vehicle->driver_name = $driver?->driver_name ?? 'Unknown';

            // 5. Convert to Array safely for Logging and Broadcasting
            $processedData = camelCase(remove_null($vehicle))->toArray();
            
            // FIX: Access object property, not array key
            $logId =  $processedData['id'] ;

            Log::info("✅ Dispatching Broadcast for Vehicle ID: " . $logId);

            event(new VehicleLocationUpdated($processedData));
            
        } catch (\Exception $e) {
            Log::error("❌ Vehicle Job Failed: " . $e->getMessage(), [
                'line' => $e->getLine(),
                'gpsId' => $this->data['gpsId'] ?? 'unknown'
            ]);
            throw $e; 
        }
    }
}