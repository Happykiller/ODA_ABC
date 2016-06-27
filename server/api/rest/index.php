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

$slim->get('/patient/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->getById($id);
});

$slim->put('/patient/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("name_first","name_last","active");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->updatePatient($id);
});

$slim->post('/patient/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("name_first","name_last","user_id");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->create();
});

$slim->put('/patient/:id/default_address/', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->arrayInput = array("addressId");
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->changeDefaultAddress($id);
});

$slim->delete('/patient/:id/remove_address/', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->arrayInput = array("addressId");
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->removeAddress($id);
});

$slim->post('/patient/:id/new_address/', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->arrayInput = array("title", "street", "city", "postCode");
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->newAddress($id);
});

$slim->put('/patient/:id/color/', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->arrayInput = array("color");
    $params->slim = $slim;
    $INTERFACE = new PatientInterface($params);
    $INTERFACE->changeColor($id);
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
    $params->arrayInput = array("patient_id","start","end","user_id","author_id","googleId","googleEtag","googleHtmlLink","googleICalUID");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new EventInterface($params);
    $INTERFACE->create();
});

$slim->get('/event/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new EventInterface($params);
    $INTERFACE->getById($id);
});

$slim->put('/event/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("patient_id","start","end","note");
    $params->arrayInputOpt = array("addressId"=>null);
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new EventInterface($params);
    $INTERFACE->update($id);
});

$slim->delete('/event/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new EventInterface($params);
    $INTERFACE->delete($id);
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

$slim->get('/report/heat/:userId', function ($userId) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $params->arrayInput = array("start", "end");
    $INTERFACE = new ReportInterface($params);
    $INTERFACE->getHeat($userId);
});

$slim->get('/report/trajet/:userId', function ($userId) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $params->arrayInput = array("start", "end");
    $INTERFACE = new ReportInterface($params);
    $INTERFACE->getAllTrajet($userId);
});

$slim->get('/report/synth_user_patient', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $params->arrayInput = array("userId", "patientId", "dateStart", "dateEnd");
    $INTERFACE = new ReportInterface($params);
    $INTERFACE->getSynthUserPatient();
});

//--------------------------------------------------------------------------
// ADDRESS

$slim->get('/address/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new AddressInterface($params);
    $INTERFACE->getById($id);
});

$slim->get('/address/search/patient/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new AddressInterface($params);
    $INTERFACE->getByPatientId($id);
});

$slim->post('/address/trajet/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("address_id_ori","address_id_dest","distance","distance_m","duration","duration_s");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new AddressInterface($params);
    $INTERFACE->createTrajet();
});

$slim->put('/address/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->arrayInput = array("title", "street", "city", "postCode");
    $params->slim = $slim;
    $INTERFACE = new AddressInterface($params);
    $INTERFACE->update($id);
});

//--------------------------------------------------------------------------
// ACTIONS

$slim->get('/actions/search/event/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("event_id");
    $params->slim = $slim;
    $INTERFACE = new ActionsInterface($params);
    $INTERFACE->getAllByEvent();
});

$slim->post('/actions/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("event_id","action_type_id","action_sub_type_id","comment","author_id");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new ActionsInterface($params);
    $INTERFACE->create();
});

$slim->get('/actions/type/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new ActionsInterface($params);
    $INTERFACE->getAllType();
});

$slim->get('/actions/sub_type/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->slim = $slim;
    $INTERFACE = new ActionsInterface($params);
    $INTERFACE->getAllSubType();
});

$slim->delete('/actions/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new ActionsInterface($params);
    $INTERFACE->delete($id);
});

//--------------------------------------------------------------------------
// MEMOS

$slim->get('/memo/search/patient/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInputOpt = array("read"=>0, "active"=>1);
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->getByPatientId($id);
});

$slim->get('/memo/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->getById($id);
});

$slim->post('/memo/', function () use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("patient_id","content","author_id");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->create();
});

$slim->put('/memo/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("content");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->update($id);
});

$slim->put('/memo/:id/read', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->arrayInput = array("value");
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->read($id);
});

$slim->delete('/memo/:id', function ($id) use ($slim) {
    $params = new OdaPrepareInterface();
    $params->modePublic = false;
    $params->slim = $slim;
    $INTERFACE = new MemoInterface($params);
    $INTERFACE->delete($id);
});

//--------------------------------------------------------------------------

$slim->run();