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
class ReportInterface extends OdaRestInterface {
    /**
     */
    function getCountTime($userId) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT IFNULL(SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(a.`end`, a.`start`)))),'00:00:00') as 'countTime'
                FROM `tab_events` a
                WHERE 1=1
                AND a.`user_id` = :user_id
                AND a.`start` >= :start
                AND a.`end` <= :end
                AND a.`active` = 1
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataObject($retour->data->countTime);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     */
    function getHeat($userId) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT DATE_FORMAT(a.`start`, '%Y-%m-%d') as 'date', count(*) as 'count'
                FROM `tab_events` a
                WHERE 1=1
                AND a.`user_id` = :user_id
                AND a.`start` >= :start
                AND a.`end` <= :end
                AND a.`active` = 1
                GROUP BY DATE_FORMAT(a.`start`, '%Y-%m-%d')
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataObject($retour->data->data);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
}