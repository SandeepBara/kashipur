<?php

return [
    "SOCIALIST-CLIENT-IDS"=>[
        "google"=>env('GOOGLE_CLIENT_ID', "google"),
        "facebook"=>env('FACEBOOK_CLIENT_ID', "facebook"),
        "git"=>env('GITHUB_CLIENT_ID', "git"),
    ],
    "ULB-DB"=>[
        1=>[
            "swm"=>"pgsql_swm",
        ],
        2=>[
            "swm"=>"pgsql_swm",
        ],
    ],
    "MODULE"=>[
        "SWM"=>1,
        "ACCOUNT"=>2,
    ],
    "USER-TYPE-SHORT-NAME" =>[
        ""                  =>"ONLINE",
        "SUPER ADMIN"       =>  "SUPER ADMIN",
        "ADMIN"             =>  "ADMIN",
        "PROJECT MANAGER"   =>  "PM",
        "PM"                =>  "PM",
        "Team Leader"       =>  "TL",
        "TL"                =>  "TL",
        "JUN SUWIDHA KENDRA" =>  "JSK",
        "JSK"               =>  "JSK",
        "BACK OFFICE"       =>  "BO",
        "BO"                =>  "BO",
        "DEALING ASSISTANT" => "DA",
        "DA"                =>  "DA",
        "ULB TAX COLLECTOR" =>  "UTC",
        "UTC"               =>  "UTC",
        "AJENCY TAX COLLECTOR" => "TC",
        "TAX COLLECTOR"     =>  "TC",
        "TC"                =>  "TC",
        "ATC"               =>  "TC",
        "SECTION INCHARGE"  =>  "SI",
        "SI"                =>  "SI",
        "ASSISTANT TAX SUPRITENDENT" =>  "SI",
        "SECTION HEAD"      =>  "SH",
        "SH"                =>  "SH",
        "TAX DAROGA"        =>  "TD",
        "TD"                =>  "TD",
        "JUNIOR ENGINEER"   =>  "JE",
        "JE"                =>  "JE",
        "ASSISTANT ENGINEER" => "AE",
        "AE"                =>  "AE",
        "EXECUTIVE OFFICER" =>  "EO",
        "EO"                =>  "EO",
        "LIPIK"             =>  "LP",
        "LP"                =>  "LP",
        "SENIOUR LIPIK"     =>  "SRLP",
        "SENIOR LIPIK"    =>  "SRLP",
        "SRLP"              =>  "SRLP",
        "TAX SUPERITENDENT"  =>  "TS", #EO
        "TS"                =>  "TS",
        "DEPUTY MUNICIPAL COMMISSIONER"=>"DMC",
        "DMC"               => "DMC",
        "FIELD ENGINEER"    => "FE", #TC
        "FE"                => "FE" #TC

    ],
    "MOBILE-ROLE"=>[
        5,7,13,15
    ],
    "DOC-RELATIVE-PATHS"=>[
        "USER"=>"user/img",
        "APARTMENT_DOC"=>"Uploads/Apartment",
        "SAF"=>"Uploads/SafDoc",
        "SAF_GEOTAG"=>"Uploads/GeoTag",
        "SAF_DEACTIVATE"=>"Uploads/SafDeactivate",
        "PROPERTY_DEACTIVATE"=>"Uploads/PropDeactivate",
        "PROPERTY_BASIC_EDIT"=>"Uploads/PropBasicEdit",
        "PROPERTY_OWNER_EDIT"=>"Uploads/PropOwnerEdit",
    ],
    "ACTION_TYPE"=>[
        "BTC"=>2,
        "FORWARD"=>1,
        "BACKWARD"=>3,
        "APPROVED"=>5,
        "REJECT"=>4,
    ],
    "PAYMENT_MODE"=>[
        "ONLINE",
        "CASH",
        "CHEQUE",
        "DD",
        "RTGS",
        "NEFT",
        "UPI",
        "CARD",
    ],
    "PAYMENT_STATUS"=>[
        "CLEAR"=>1,
        "PENDING"=>2,
        "BOUNCED"=>3
    ],
    "HOLDING_VALIDATE"=>env("HOLDING_API","127.0.0.1"),
];