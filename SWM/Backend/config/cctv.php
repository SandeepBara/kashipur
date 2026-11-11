<?php

return [
    // Configure each camera's supported stream type and URL through CCTV_CAMERAS.
    'cameras' => json_decode(env('CCTV_CAMERAS', '[]'), true) ?: [],
];
