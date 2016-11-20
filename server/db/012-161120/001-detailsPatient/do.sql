SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_patients`
  ADD `birthday` DATE NOT NULL AFTER `address_id_default`,
  ADD `secu` INT(11) NOT NULL AFTER `birthday`,
  ADD `telPerso` VARCHAR(50) NOT NULL AFTER `secu`,
  ADD `contratStart` DATE NOT NULL AFTER `telPerso`,
  ADD `nbHours` INT(3) NOT NULL AFTER `contratStart`,
  ADD `costHour` DECIMAL(10,2) NOT NULL AFTER `nbHours`,
  ADD `health` VARCHAR(1000) NOT NULL AFTER `costHour`,
  ADD `notes` TEXT NOT NULL AFTER `health`
;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;