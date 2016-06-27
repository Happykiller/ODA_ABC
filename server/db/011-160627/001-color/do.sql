SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_patients` ADD `color` VARCHAR(50) NOT NULL DEFAULT 'concrete' AFTER `name_last`;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;