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
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
}