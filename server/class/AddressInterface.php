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
class AddressInterface extends OdaRestInterface {
    /**
     */
    function getById($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`code`, a.`adress`, a.`city`, a.`code_postal`
                FROM `tab_adress` a
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
            $this->dieInError($ex.'');
        }
    }

    /**
     */
    function getByPatientId($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`code`, a.`adress`, a.`city`, a.`code_postal`, c.`address_id_default`
                FROM `tab_adress` a, `tab_patient_address` b, `tab_patients` c
                WHERE 1=1
                AND c.`id` = :patient_id
                AND a.`id` = b.`address_id`
                AND b.`patient_id` = :patient_id
                AND a.`active` = 1
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
            $this->dieInError($ex.'');
        }
    }

    /**
     */
    function createTrajet() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_adress_trajet` (
                    `adress_id_ori` ,
                    `adress_id_dest`,
                    `distance`,
                    `distance_m`,
                    `duration`,
                    `duration_s`
                )
                VALUES (
                    :adress_id_ori, :adress_id_dest, :distance, :distance_m, :duration, :duration_s
                )
            ;";
            $params->bindsValue = [
                "adress_id_ori" => $this->inputs["address_id_ori"],
                "adress_id_dest" => $this->inputs["address_id_dest"],
                "distance" => $this->inputs["distance"],
                "distance_m" => $this->inputs["distance_m"],
                "duration" => $this->inputs["duration"],
                "duration_s" => $this->inputs["duration_s"]
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
            $params->sql = "UPDATE `tab_adress`
                SET
                `code`= :title,
                `adress`= :street,
                `city`= :city,
                `code_postal` = :postCode
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "title" => $this->inputs["title"],
                "street" => $this->inputs["street"],
                "city" => $this->inputs["city"],
                "postCode" => $this->inputs["postCode"]
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