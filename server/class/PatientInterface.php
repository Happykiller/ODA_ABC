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
class PatientInterface extends OdaRestInterface {
    /**
     */
    function getAll() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`, a.`active`,
                a.`address_id_default`, b.`code`, b.`adress`, b.`city`, b.`code_postal`
                FROM `tab_patients` a
                LEFT OUTER JOIN `tab_adress` b
                ON a.`address_id_default` = b.`id`
                WHERE 1=1
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $patients = $retour->data->data;

            foreach ($patients as $patient){
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
                        $patient->code = $retour->data->code;
                        $patient->adress = $retour->data->adress;
                        $patient->city = $retour->data->city;
                        $patient->code_postal = $retour->data->code_postal;
                    }
                }
            }

            $this->addDataObject($patients);
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
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`, a.`active`,
                a.`address_id_default`, b.`code`, b.`adress`, b.`city`, b.`code_postal`
                FROM `tab_patients` a
                LEFT OUTER JOIN `tab_adress` b
                ON a.`address_id_default` = b.`id`
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
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     * @param $id
     */
    function updatePatient($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_patients`
                SET
                `name_first`= :name_first,
                `name_last`= :name_last,
                `active`= :active
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "name_first" => $this->inputs["name_first"],
                "name_last" => $this->inputs["name_last"],
                "active" => $this->inputs["active"]
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
    function changeDefaultAddress($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_patients`
                SET
                `address_id_default`= :addressId
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "addressId" => $this->inputs["addressId"]
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
    function removeAddress($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_patients`
                SET
                `address_id_default`= NULL
                WHERE 1=1
                AND `id` = :id
                AND `address_id_default` = :addressId
                ;";
            $params->bindsValue = [
                "id" => $id,
                "addressId" => $this->inputs["addressId"]
            ];
            $params->typeSQL = OdaLibBd::SQL_SCRIPT;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new OdaPrepareReqSql();
            $params->sql = "DELETE FROM `tab_patient_address`
                WHERE 1=1
                AND `patient_id` = :id
                AND `address_id` = :addressId
                ;";
            $params->bindsValue = [
                "id" => $id,
                "addressId" => $this->inputs["addressId"]
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
     */
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_patients` (
                    `name_first` ,
                    `name_last`,
                    `user_id`,
                    `create_date`
                )
                VALUES (
                    :name_first, :name_last, :user_id, NOW()
                )
            ;";
            $params->bindsValue = [
                "name_first" => $this->inputs["name_first"],
                "name_last" => $this->inputs["name_last"],
                "user_id" => $this->inputs["user_id"]
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
    function newAddress($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_adress` (
                    `code` ,
                    `adress`,
                    `city`,
                    `code_postal`
                )
                VALUES (
                    :title, :street, :city, :postCode
                )
            ;";
            $params->bindsValue = [
                "title" => $this->inputs["title"],
                "street" => $this->inputs["street"],
                "city" => $this->inputs["city"],
                "postCode" => $this->inputs["postCode"]
            ];
            $params->typeSQL = OdaLibBd::SQL_INSERT_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);
            $idAddress = $retour->data;

            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_patient_address` (
                    `patient_id` ,
                    `address_id`
                )
                VALUES (
                    :patient_id, :address_id
                )
            ;";
            $params->bindsValue = [
                "patient_id" => $id,
                "address_id" => $idAddress
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
}