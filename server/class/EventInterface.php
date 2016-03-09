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
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`start`, a.`end`,
            a.`patient_id`, b.`name_first` as 'patient_name_first', b.`name_last` as 'patient_name_last'
            FROM `tab_events` a, `tab_patients` b
            WHERE 1=1
            AND a.`patient_id` = b.`id`
            AND a.`user_id` = :user_id
            AND a.`start` >= :start
            AND a.`end` <= :end
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $response = $this->BD_ENGINE->reqODASQL($params);
            $this->addDataObject($response->data->data);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_events` (
                    `patient_id` ,
                    `start`,
                    `end`,
                    `user_id`,
                    `author_id`,
                    `create_date`
                )
                VALUES (
                    :patient_id, :start, :end, :user_id, :author_id, NOW()
                )
            ;";
            $params->bindsValue = [
                "patient_id" => $this->inputs["patient_id"],
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"],
                "user_id" => $this->inputs["user_id"],
                "author_id" => $this->inputs["author_id"]
            ];
            $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->value = $retour->data;
            $this->addDataStr($params);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
}