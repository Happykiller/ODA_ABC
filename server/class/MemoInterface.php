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
class MemoInterface extends OdaRestInterface {

    /**
     */
    function getById($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`patient_id`, a.`author_id`, a.`content`, a.`read`, a.`read`, a.`date_create`
                FROM `tab_memos` a
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
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_memos` (
                    `patient_id` ,
                    `content`,
                    `author_id`,
                    `date_create`
                )
                VALUES (
                    :patient_id, :content, :author_id, NOW()
                )
            ;";
            $params->bindsValue = [
                "patient_id" => $this->inputs["patient_id"],
                "content" => $this->inputs["content"],
                "author_id" => $this->inputs["author_id"]
            ];
            $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataReqSQL($params);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     */
    function getByPatientId($id) {
        try {
            $filtreActive = '';
            if($this->inputs["active"] != null){
                $filtreActive = ' AND a.`active` = '.$this->inputs["active"];
            }

            $filtreRead = '';
            if($this->inputs["read"] != null){
                $filtreRead = ' AND a.`read` = '.$this->inputs["read"];
            }

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`patient_id`, a.`author_id`, a.`content`, a.`read`, a.`read`, a.`date_create`
                FROM `tab_memos` a
                WHERE 1=1
                AND a.`patient_id` = :patient_id
                $filtreActive
                $filtreRead
            ;";
            $params->bindsValue = [
                "patient_id" => $id
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

    /**
     * @param $id
     */
    function read($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_memos`
                SET
                `read`= :value
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "value" => $this->inputs["value"]
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
            $params->sql = "UPDATE `tab_memos`
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

    /**
     * @param $id
     */
    function update($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_memos`
                SET
                `content`= :content
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "content" => $this->inputs["content"]
            ];
            $params->typeSQL = OdaLibBd::SQL_SCRIPT;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->value = $retour->data;
            $this->addDataStr($params);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }
}