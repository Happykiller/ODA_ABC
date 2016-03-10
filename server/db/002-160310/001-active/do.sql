SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_adress` ADD `active` TINYINT(1) NOT NULL DEFAULT '1' ;
ALTER TABLE `@prefix@tab_events` ADD `active` TINYINT(1) NOT NULL DEFAULT '1' ;
ALTER TABLE `@prefix@tab_patients` ADD `active` TINYINT(1) NOT NULL DEFAULT '1' ;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;