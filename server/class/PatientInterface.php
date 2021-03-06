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
 * @version 0.161122
 */
class PatientInterface extends OdaRestInterface {
    /**
     */
    function getAll() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`, a.`active`, a.`color`,
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
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`, a.`active`, a.`color`,
                a.`address_id_default`, b.`code`, b.`adress`, b.`city`, b.`code_postal`,
                a.`birthday`, a.`secu`, a.`telPerso`, a.`contratStart`, a.`nbHours`, a.`costHour`, a.`health`, a.`notes`
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
                `birthday`= :birthday,
                `secu`= :secu,
                `telPerso`= :telPerso,
                `contratStart`= :contratStart,
                `nbHours`= :nbHours,
                `costHour`= :costHour,
                `health`= :health, 
                `notes`= :notes,
                `active`= :active
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "name_first" => $this->inputs["name_first"],
                "name_last" => $this->inputs["name_last"],
                "birthday" => $this->inputs["birthday"],
                "secu" => $this->inputs["secu"],
                "telPerso" => $this->inputs["telPerso"],
                "contratStart" => $this->inputs["contratStart"],
                "nbHours" => $this->inputs["nbHours"],
                "costHour" => $this->inputs["costHour"],
                "health" => $this->inputs["health"],
                "notes" => $this->inputs["notes"],
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

    /**
     * @param $id
     */
    function changeColor($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "UPDATE `tab_patients`
                SET
                `color`= :color
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
                "color" => $this->inputs["color"]
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
    function newContactFamily($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_contacts` (
                    `patient_id` ,
                    `category`,
                    `label`,
                    `value`,
                    `author_id`,
                    `date_create`
                )
                VALUES (
                    :patient_id, :category, :label, :value, :author_id, NOW()
                )
            ;";
            $params->bindsValue = [
                "patient_id" => $id,
                "category" => $this->inputs["category"],
                "label" => $this->inputs["contactLabel"],
                "value" => $this->inputs["contactValue"],
                "author_id" => $this->inputs["author_id"]
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
     */
    function getContactByPatientId($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`patient_id`, a.`category`, a.`label`, a.`value`, a.`author_id`, a.`date_create`
                FROM `tab_contacts` a
                WHERE 1=1
                AND a.`patient_id` = :patient_id
                AND a.`category` = :category
            ;";
            $params->bindsValue = [
                "patient_id" => $id,
                "category" => $this->inputs["category"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $this->addDataObject($retour->data->data);
        } catch (Exception $ex) {
            $this->dieInError($ex.'');
        }
    }

    /**
     * @param $id
     */
    function removeContact($id) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "DELETE FROM `tab_contacts`
                WHERE 1=1
                AND `id` = :id
                ;";
            $params->bindsValue = [
                "id" => $id,
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