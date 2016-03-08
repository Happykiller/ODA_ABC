<?php
namespace Abc;

use Exception;
use Oda\OdaLibBd;
use Oda\OdaRestInterface;
use Oda\SimpleObject\OdaPrepareReqSql;
use \stdClass;

/**
 * Project class
 *
 * Tool
 *
 * @author  Fabrice Rosito <rosito.fabrice@gmail.com>
 * @version 0.150221
 */
class EventInterface extends OdaRestInterface {
    /**
     */
    function getForAUser($userId) {
        try {
            $response = new stdClass();
            $response->id = 1;
            $response->title = "test";
            $response->allDay = 0;
            $response->start = "2016-03-08 14:30:00";
            $response->end = "2016-03-08 15:30:00";
            $tabArray = array($response);
            $this->addDataObject($tabArray);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
}