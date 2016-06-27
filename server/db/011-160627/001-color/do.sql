SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_patients` ADD `color` VARCHAR(50) NOT NULL DEFAULT '#95a5a6' AFTER `name_last`;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;