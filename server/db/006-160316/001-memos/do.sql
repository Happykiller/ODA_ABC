SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
--
-- Structure de la table `tab_memos`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_memos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `content` varchar(500) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `read` tinyint(1) NOT NULL,
  `author_id` int(11) NOT NULL,
  `date_create` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_memos`
--
ALTER TABLE `@prefix@tab_memos`
ADD CONSTRAINT `fk_memo_user` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_memo_patient` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;