SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
--
-- Structure de la table `tab_contacts`
--

CREATE TABLE `@prefix@tab_contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `category` varchar(250) NOT NULL,
  `label` varchar(250) NOT NULL,
  `value` varchar(250) NOT NULL,
  `author_id` int(11) NOT NULL,
  `date_create` datetime NOT NULL,
   PRIMARY KEY (`id`),
   KEY `patient_id` (`patient_id`),
   KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la table `tab_contacts`
--
ALTER TABLE `@prefix@tab_contacts`
  ADD CONSTRAINT `fk_contacts_author` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contacts_patient` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;