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
    function create() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "INSERT INTO  `tab_shopping` (
                    `entity`, `mode`, `patient_id`, `date_record`, `author_id`, `amount`, `movement`, `comment`
                )
                VALUES (
                    :entity, :mode, :patient_id, NOW(), :author_id, :amount, :movement, :comment
                )
            ;";
            $params->bindsValue = [
                "entity" => $this->inputs["entity"],
                "mode" => $this->inputs["mode"],
                "patient_id" => $this->inputs["patient_id"],
                "author_id" => $this->inputs["author_id"],
                "amount" => $this->inputs["amount"],
                "movement" => $this->inputs["movement"],
                "comment" => $this->inputs["comment"]
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