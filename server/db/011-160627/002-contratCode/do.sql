SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
CREATE TABLE `@prefix@tab_contrat` ( `id` INT NOT NULL AUTO_INCREMENT , `code` VARCHAR(50) NOT NULL , `desc` VARCHAR(500) NOT NULL , PRIMARY KEY (`id`));

INSERT INTO `@prefix@tab_contrat` (`id`, `code`, `desc`) VALUES (NULL, 'freelance', 'freelance'), (NULL, 'yann', 'yann');

ALTER TABLE `@prefix@tab_patients` ADD `contratId` INT(11) NULL DEFAULT NULL AFTER `color`;

ALTER TABLE `@prefix@tab_patients` ADD INDEX(`contratId`);

ALTER TABLE `@prefix@tab_patients` ADD  CONSTRAINT `fk_patient_contrat` FOREIGN KEY (`contratId`) REFERENCES `@prefix@tab_contrat`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;