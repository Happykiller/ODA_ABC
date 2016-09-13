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
class ActionsInterface extends OdaRestInterface {
    /**
     */
    function getAllByEvent() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`event_id`, a.`comment`, a.`active`,
                a.`action_type_id`, b.`label` as 'action_type_label',
                a.`action_sub_type_id`, c.`label` as 'action_sub_type_label'
                FROM `tab_actions` a, `tab_actions_type` b, `tab_actions_sub_type` c
                WHERE 1=1
                AND a.`action_type_id` = b.`id`
                AND a.`action_sub_type_id` = c.`id`
                AND a.`event_id` = :id
            ;";
            $params->bindsValue = [
                "id" => $this->inputs["event_id"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $actions = $retour->data->data;

            $this->addDataObject($actions);
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
            $params->sql = "INSERT INTO  `tab_actions` (
                    `event_id` ,
                    `action_type_id`,
                    `action_sub_type_id`,
                    `comment`,
                    `author_id`,
                    `create_date`
                )
                VALUES (
                    :event_id, :action_type_id, :action_sub_type_id, :comment, :author_id, NOW()
                )
            ;";
            $params->bindsValue = [
                "event_id" => $this->inputs["event_id"],
                "action_type_id" => $this->inputs["action_type_id"],
                "action_sub_type_id" => $this->inputs["action_sub_type_id"],
                "comment" => $this->inputs["comment"],
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
    function getAllType() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`label`, a.`placeholder`, a.`active`
                FROM `tab_actions_type` a
                WHERE 1=1
                ORDER BY a.`label` ASC
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $result = $retour->data->data;

            $this->addDataObject($result);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }
    /**
     */
    function getAllSubType() {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT a.`id`, a.`action_type_id`, a.`label`, a.`active`
                FROM `tab_actions_sub_type` a
                WHERE 1=1
                ORDER BY a.`label` ASC
            ;";
            $params->typeSQL = OdaLibBd::SQL_GET_ALL;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $result = $retour->data->data;

            $this->addDataObject($result);
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
            $params->sql = "UPDATE `tab_actions`
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