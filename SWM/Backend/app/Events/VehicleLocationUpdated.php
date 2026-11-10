<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; 
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VehicleLocationUpdated implements ShouldBroadcast 
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    /**
     * Define the channel name.
     */
    public function broadcastOn(): array
    {
        // For real-time tracking, 'fleet-monitoring' is a good descriptive name
        return [
            new Channel('fleet-monitoring'), 
        ];
    }

    /**
     * Optional: Define a custom name for the event in Javascript
     */
    public function broadcastAs(): string
    {
        return 'location.updated';
    }
}
