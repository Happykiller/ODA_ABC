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
            a.`patient_id`, b.`name_first` as 'patient_name_first', b.`name_last` as 'patient_name_last', b.`color` as  'patient_color',
            a.`address_id`,
            a.`googleId`, a.`googleEtag`, a.`googleICalUID`, a.`googleHtmlLink`, IFNULL(TIMEDIFF(a.`end`, a.`start`),'00:00:00') as 'countTime'
            FROM `tab_events` a, `tab_patients` b
            WHERE 1=1
            AND a.`patient_id` = b.`id`
            AND a.`user_id` = :user_id
            AND a.`start` >= :start
            AND a.`end` <= DATE_ADD(STR_TO_DATE(:end,'%Y-%m-%d'), INTERVAL 1 DAY)
            AND a.`active` = 1
            ORDER BY a.`start` ASC
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
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`, a.`active`,
                a.`address_id_default`, b.`code`, b.`adress`, b.`city`, b.`code_postal`
                FROM `tab_patients` a
                LEFT OUTER JOIN `tab_adress` b
                ON a.`address_id_default` = b.`id`
                WHERE 1=1
                AND a.`id` = :patient_id
            ;";
            $params->bindsValue = [
                "patient_id" => $this->inputs["patient_id"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $patient = $retour->data;

            if($patient->address_id_default == null){
                $params = new OdaPrepareReqSql();
                $params->sql = "SELECT a.`id`, a.`code`, a.`adress`, a.`city`, a.`code_postal`
                        FROM `tab_adress` a, `tab_patient_address` b
                        WHERE 1=1
                        AND a.`id` = b.`address_id`
                        AND b.`patient_id` = :patientId
                        AND a.`active` = 1
                        LIMIT 0,1
                    ;";
                $params->bindsValue = [
                    "patientId" => $patient->id
                ];
                $params->typeSQL = OdaLibBd::SQL_GET_ONE;
                $retour = $this->BD_ENGINE->reqODASQL($params);
                if($retour->data){
                    $patient->address_id_default = $retour->data->id;
                }
            }

            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_events` (
                    `patient_id` ,
                    `start`,
                    `end`,
                    `user_id`,
                    `author_id`,
                    `create_date`,
                    `address_id`,
                    `googleId`,
                    `googleEtag`,
                    `googleHtmlLink`,
                    `googleICalUID`
                )
                VALUES (
                    :patient_id, :start, :end, :user_id, :author_id, NOW(),:address_id_default,
                    :googleId, :googleEtag, :googleHtmlLink, :googleICalUID
                )
            ;";
            $params->bindsValue = [
                "patient_id" => $this->inputs["patient_id"],
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"],
                "user_id" => $this->inputs["user_id"],
                "author_id" => $this->inputs["author_id"],
                "googleId" => $this->inputs["googleId"],
                "googleEtag" => $this->inputs["googleEtag"],
                "googleHtmlLink" => $this->inputs["googleHtmlLink"],
                "googleICalUID" => $this->inputs["googleICalUID"],
                "address_id_default" => $patient->address_id_default
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

    /**
     */
    function getById($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`patient_id`, a.`start`, a.`end`, a.`user_id`, a.`address_id`,
                a.`googleId`, a.`googleEtag`, a.`googleICalUID`, a.`googleHtmlLink`,
                a.`note`, IFNULL(TIMEDIFF(a.`end`, a.`start`),'00:00:00') as 'countTime'
                FROM `tab_events` a
                WHERE 1=1
                AND a.`id` = :id
            ;";
            $params->bindsValue = [
                "id" => $id
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataObject($retour->data);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     * @param $id
     */
    function update($id) {
        try {
            if($this->inputs["addressId"] == ''){
                $this->inputs["addressId"] = null;
            }

            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_events`
                SET
                `patient_id`= :patient_id,
                `start`= :start,
                `end`= :end,
                `address_id` = :address_id,
                `note` = :note
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "patient_id" => $this->inputs["patient_id"],
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"],
                "address_id" => $this->inputs["addressId"],
                "note" => $this->inputs["note"]
            ];
            $params->typeSQL = OdaLibBd::SQL_SCRIPT;
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

    /**
     * @param $id
     */
    function delete($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_events`
                SET
                `active`= 0
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id
            ];
            $params->typeSQL = OdaLibBd::SQL_SCRIPT;
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