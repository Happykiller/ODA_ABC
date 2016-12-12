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
 * @version 0.161208
 */
class ShoppingInterface extends OdaRestInterface {
    
    /**
     */
    function getAll() {
        try {
            $filter_patient = "";
            if($this->inputs["patient_id"] != null){
                $filter_patient = " AND a.`patient_id` = ".$this->inputs["patient_id"];
            }

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`entity`, a.`mode`, a.`patient_id`, a.`date_record`, a.`author_id`, a.`amount`, a.`movement`, a.`comment`, a.`date_action`, a.`attach_name`,
                b.`name_first` as 'patient_firstname', b.`name_last` as 'patient_lastname',
                c.`code_user` as 'author_code', c.`nom` as 'author_firstname', c.`prenom` as 'author_lastname'
                FROM `tab_shopping` a, `tab_patients` b, `api_tab_utilisateurs` c
                WHERE 1=1
                AND a.`active` = :active
                AND a.`patient_id` = b.`id`
                AND a.`author_id` = c.`id`
                $filter_patient
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $params->bindsValue = [
                "active" => $this->inputs["active"]
            ];
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $shopping = $retour->data->data;

            $this->addDataObject($shopping);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }

    /**
     */
    function getById($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT SELECT a.`id`, a.`entity`, a.`mode`, a.`patient_id`, a.`date_record`, a.`author_id`, a.`amount`, a.`movement`, a.`comment`, a.`date_action`, a.`attach_name`,
                b.`name_first` as 'patient_firstname', b.`name_last` as 'patient_lastname',
                c.`code_user` as 'author_code', c.`nom` as 'author_firstname', c.`prenom` as 'author_lastname'
                FROM `tab_shopping` a, `api_tab_utilisateurs` b, `api_tab_utilisateurs` c
                WHERE 1=1
                AND a.`id` = :id
            ;";
            $params->bindsValue = [
                "id" => $id
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $this->addDataObject($retour->data);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }
    
    /**
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_shopping` (
                    `entity`, `mode`, `patient_id`, `date_record`, `author_id`, `amount`, `movement`, `comment`, `date_action`
                )
                VALUES (
                    :entity, :mode, :patient_id, NOW(), :author_id, :amount, :movement, :comment, :date_action
                )
            ;";
            $params->bindsValue = [
                "entity" => $this->inputs["entity"],
                "mode" => $this->inputs["mode"],
                "patient_id" => $this->inputs["patient_id"],
                "author_id" => $this->inputs["author_id"],
                "amount" => $this->inputs["amount"],
                "movement" => $this->inputs["movement"],
                "comment" => $this->inputs["comment"],
                "date_action" => $this->inputs["date_action"]
            ];
            $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataReqSQL($params);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }

    /**
     * @param $id
     */
    function update($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_shopping`
                SET
                `attach_name`= :attach_name
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "attach_name" => $this->inputs["attach_name"]
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

    /**
     * @param $id
     */
    function delete($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_shopping`
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
            $this->dieInError($ex.'');
        }
    }

    /**
     * @param $patient_idid
     */
    function getReport($patient_id) {
        try {
            $finacialReport = new stdClass();

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT SUM(IF(a.`movement`='spent', 0-a.`amount`,a.`amount`)) as 'balanceOld'
                FROM `tab_shopping` a
                WHERE 1=1
                AND a.`active` = 1
                AND a.`patient_id` = :patient_id
                AND a.`date_action` < :begin
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $params->bindsValue = [
                "patient_id" => $patient_id,
                "begin" => $this->inputs["begin"]
            ];
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $finacialReport->balanceOld = $retour->data->balanceOld;

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT SUM(IF(a.`movement`='spent', 0-a.`amount`,a.`amount`)) as 'balanceCurrent'
                FROM `tab_shopping` a
                WHERE 1=1
                AND a.`active` = 1
                AND a.`patient_id` = :patient_id
                AND a.`date_action` >= :begin
                AND a.`date_action` <= :end
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $params->bindsValue = [
                "patient_id" => $patient_id,
                "begin" => $this->inputs["begin"],
                "end" => $this->inputs["end"]
            ];
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $finacialReport->balanceCurrent = $retour->data->balanceCurrent;

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`entity`, a.`mode`, a.`patient_id`, a.`date_record`, a.`author_id`, a.`amount`, a.`movement`, a.`comment`, a.`date_action`, a.`attach_name`,
                b.`name_first` as 'patient_firstname', b.`name_last` as 'patient_lastname',
                c.`code_user` as 'author_code', c.`nom` as 'author_firstname', c.`prenom` as 'author_lastname'
                FROM `tab_shopping` a, `tab_patients` b, `api_tab_utilisateurs` c
                WHERE 1=1
                AND a.`active` = 1
                AND a.`patient_id` = b.`id`
                AND a.`author_id` = c.`id`
                AND a.`patient_id` = :patient_id
                AND a.`date_action` >= :begin
                AND a.`date_action` <= :end
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $params->bindsValue = [
                "patient_id" => $patient_id,
                "begin" => $this->inputs["begin"],
                "end" => $this->inputs["end"]
            ];
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $finacialReport->listRecord = $retour->data->data;

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`name_first` as 'patient_firstname', a.`name_last` as 'patient_lastname'
                FROM `tab_patients` a
                WHERE 1=1
                AND a.`id` = :patient_id
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $params->bindsValue = [
                "patient_id" => $patient_id
            ];
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $finacialReport->infos = $retour->data;

            $this->addDataObject($finacialReport);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }
}