<?php
namespace Project;

require '../header.php';
require '../vendor/autoload.php';
require '../config/config.php';

use stdClass, \Oda\OdaLib;

//--------------------------------------------------------------------------
$retours = array();

//--------------------------------------------------------------------------
$retours[] = OdaLib::test("sayHello",function() {
    $v_test = ProjectInterface::sayHello();
    OdaLib::equal($v_test, "hello", "Test OK : Passed!");
}
);

//--------------------------------------------------------------------------
$resultats = new stdClass();
$resultats->details = $retours;
$resultats->succes = 0;
$resultats->echec = 0;
$resultats->total = 0;
foreach($retours as $key => $value) {
    $resultats->succes += $value->succes;
    $resultats->echec += $value->echec;
    $resultats->total += $value->total;
}

var_dump($resultats);