<?php

namespace Abc;

require '../../header.php';
require "../../vendor/autoload.php";
require '../../config/config.php';

use cebe\markdown\GithubMarkdown;
use Slim\Slim;
use \stdClass, \Oda\SimpleObject\OdaPrepareInterface, \Oda\SimpleObject\OdaPrepareReqSql, \Oda\OdaLibBd;
use Oda\OdaRestInterface;

$slim = new Slim();
//--------------------------------------------------------------------------

$slim->notFound(function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new OdaRestInterface($params);
    $INTERFACE->dieInError('not found');
});

$slim->get('/', function () {
    $markdown = file_get_contents('./doc.markdown', true);
    $parser = new GithubMarkdown();
    echo $parser->parse($markdown);
});

//--------------------------------------------------------------------------
// PATIENT

$slim->get('/patient/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->getAll();
});

$slim->post('/patient/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("name_first","name_last","user_id");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->create();
});

//--------------------------------------------------------------------------
// EVENT

$slim->get('/event/search/user/:userId', function ($userId) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $params->arrayInput = array("start", "end");
    $INTERFACE = new EventInterface($params);
    $INTERFACE->getForAUser($userId);
});

$slim->post('/event/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("patient_id","start","end","user_id","author_id");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new EventInterface($params);
    $INTERFACE->create();
});

//--------------------------------------------------------------------------
// REPORT

$slim->get('/report/count_time/:userId', function ($userId) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $params->arrayInput = array("start", "end");
    $INTERFACE = new ReportInterface($params);
    $INTERFACE->getCountTime($userId);
});

//--------------------------------------------------------------------------

$slim->run();