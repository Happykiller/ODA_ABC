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
class ReportInterface extends OdaRestInterface {
    /**
     */
    function getCountTime($userId) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT IFNULL(SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(a.`end`, a.`start`)))),'00:00:00') as 'countTime'
                FROM `tab_events` a
                WHERE 1=1
                AND a.`user_id` = :user_id
                AND a.`start` >= :start
                AND a.`end` <= :end
                AND a.`active` = 1
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
            ];
            $params->typeSQL = OdaLibBd::SQL_GET_ONE;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new stdClass();
            $params->retourSql = $retour;
            $this->addDataObject($retour->data->countTime);
        } catch (Exception $ex) {
            $this->object_retour->strErreur = $ex.'';
            $this->object_retour->statut = self::STATE_ERROR;
            die();
        }
    }

    /**
     */
    function getHeat($userId) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT DATE_FORMAT(a.`start`, '%Y-%m-%d') as 'date', count(*) as 'count'
                FROM `tab_events` a
                WHERE 1=1
                AND a.`user_id` = :user_id
                AND a.`start` >= :start
                AND a.`end` <= :end
                AND a.`active` = 1
                GROUP BY DATE_FORMAT(a.`start`, '%Y-%m-%d')
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
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
     */
    function getAllTrajet($userId) {
        try {
            $params = new OdaPrepareReqSql();
            $params->sql = "DROP TABLE IF EXISTS tmp0;
            CREATE TEMPORARY TABLE tmp0 AS
              SELECT
              a.`id` as 'event_id_dest',
              a.`address_id` AS 'address_id_dest',
              a.`start` as 'start_dest',
              (
                SELECT MAX(b.`start`) as 'start_ori'
                FROM `tab_events` b
                WHERE 1 = 1
                      AND b.`start` < a.`start`
                      AND b.`active` = 1
                      AND b.`author_id` = a.`author_id`
                      AND DATE_FORMAT(b.`start`, '%Y-%m-%d') = DATE_FORMAT(a.`start`, '%Y-%m-%d')
              ) AS 'start_ori'
            FROM `tab_events` a
            WHERE 1 = 1
              AND a.`active` = 1
              AND a.`author_id` = :user_id
            ;
            
            DROP TABLE IF EXISTS tmp1;
            CREATE TEMPORARY TABLE tmp1 AS
            SELECT b.`id` as 'event_id_ori', b.`address_id` as 'address_id_ori', a.`start_ori`, a.`event_id_dest`, a.`address_id_dest`, a.`start_dest`
              FROM `tmp0` a, `tab_events` b
              WHERE 1=1
              AND a.`start_ori` = b.`start`
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
            ];
            $params->typeSQL = OdaLibBd::SQL_SCRIPT;
            $retour = $this->BD_ENGINE->reqODASQL($params);

            $params = new OdaPrepareReqSql();
            $params->sql = "SELECT c.`event_id_ori`, c.`address_id_ori`, CONCAT(a.`adress`, ' ', a.`code_postal`, ' ', a.`city`, ' france') as 'address_label_ori', c.`start_ori`, 
            c.`event_id_dest`, c.`address_id_dest`, CONCAT(b.`adress`, ' ', b.`code_postal`, ' ', b.`city`, ' france') as 'address_label_dest', c.`start_dest`, d.`distance`, d.`distance_m`, d.`duration`, d.`duration_s`
            FROM tmp1 c
            LEFT OUTER JOIN `tab_adress_trajet` d
              ON
                ( d.`adress_id_dest` = c.`address_id_dest` AND d.`adress_id_ori` = c.`address_id_ori` )
              OR
                ( d.`adress_id_dest` = c.`address_id_ori` AND d.`adress_id_ori` = c.`address_id_dest` )
            , `tab_adress` a, `tab_adress` b
            WHERE c.address_id_ori = a.id
            AND c.address_id_dest = b.id
            ORDER BY c.start_ori
            ;";
            $params->bindsValue = [
                "user_id" => $userId,
                "start" => $this->inputs["start"],
                "end" => $this->inputs["end"]
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