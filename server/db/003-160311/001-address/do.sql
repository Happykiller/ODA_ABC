SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_patients` DROP FOREIGN KEY `fk_patient_adress`;
ALTER TABLE `@prefix@tab_patients` DROP `adress_id`;
ALTER TABLE `@prefix@tab_patients` ADD `address_id_default` INT(11) NULL DEFAULT NULL AFTER `user_id`, ADD INDEX (`address_id_default`) ;
ALTER TABLE `@prefix@tab_patients` ADD CONSTRAINT `fk_patient_adress_default` FOREIGN KEY (`address_id_default`) REFERENCES `@prefix@tab_adress`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Structure de la table `tab_patient_address`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_patient_address` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `address_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `address_id` (`address_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_patient_address`
--
ALTER TABLE `@prefix@tab_patient_address`
ADD CONSTRAINT `fk_patient_address_address` FOREIGN KEY (`address_id`) REFERENCES `@prefix@tab_adress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_patient_address_patient` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_events` ADD `address_id` INT NULL AFTER `patient_id`;
ALTER TABLE `@prefix@tab_events` ADD INDEX(`address_id`);
ALTER TABLE `@prefix@tab_events` ADD CONSTRAINT `fk_event_address` FOREIGN KEY (`address_id`) REFERENCES `@prefix@tab_adress`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;