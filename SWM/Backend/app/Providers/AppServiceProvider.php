<?php

namespace App\Providers;

use App\Models\SWM\Consumer;
use App\Models\SWM\ConsumerTransaction;
use App\Models\User;
use App\Observers\SWM\ConsumerObserver;
use App\Observers\SWM\ConsumerTransactionObserver;
use App\Observers\UserObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        User::observe(UserObserver::class);
        // SWM 
        Consumer::observe(ConsumerObserver::class);
        ConsumerTransaction::observe(ConsumerTransactionObserver::class);

        app()->singleton('requestToken', function () {
            return 'REQ_' . now()->format('YmdHisv') . '_' . bin2hex(random_bytes(5));
        });
    }
}
