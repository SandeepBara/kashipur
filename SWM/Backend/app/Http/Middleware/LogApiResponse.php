<?php

namespace App\Http\Middleware;

use App\Models\ModelLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Str;
class LogApiResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
            
        if ($response->isSuccessful() && $request->isJson() && $request->route()) {
            $action = $request->route()->getActionName();
            $content = json_decode($response->getContent(), true);            
            $requestToken = app('requestToken');
            $logModel = (new ModelLog());
            if (is_array($content) || is_object($content)) {
                if($logModel->where("token", $requestToken)->count()>0){
                    $jsonContent = json_encode($content);
                    $logModel->where("token", $requestToken)->update([
                        "response_body" => $jsonContent
                    ]);
                }
                else{
                    $user = Auth::user();
                    $ulbId = App::has('CurrentUlbId') ? App::get('CurrentUlbId') : $user?->ulb_id;                    

                    $logModel->create([
                            'token'        => $requestToken,
                            'ulb_id'       => $ulbId,
                            'route_name'   => $request->route()->getName(),
                            'payload'      => json_encode($request->all(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                            'response_body'=> json_encode($content), // Log response here too!
                            'user_id'      => $user?->id,
                            'user_type'    => $user?->getTable(),
                            'url'          => $request->fullUrl(),
                            'reference_id' => (string) Str::uuid(),
                            'ip_address'   => $request->ip(),
                    ]);
                }
            }
        }
    }

}
