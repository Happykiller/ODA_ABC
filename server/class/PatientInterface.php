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
            $params->sql = "SELECT a.`id`, a.`name_first`, a.`name_last`
                FROM `tab_patients` a
                WHERE 1=1
            ;";
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
}