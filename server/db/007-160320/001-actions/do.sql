SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
--
-- Structure de la table `tab_actions`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `action_type_id` int(11) NOT NULL,
  `action_sub_type_id` int(11) NOT NULL,
  `comment` varchar(500) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '1',
  `author_id` int(11) NOT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  KEY `action_type_id` (`action_type_id`),
  KEY `action_sub_type_id` (`action_sub_type_id`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Structure de la table `tab_actions_sub_type`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_actions_sub_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_type_id` int(11) NOT NULL,
  `label` varchar(250) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `action_id` (`action_type_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=15 ;

--
-- Contenu de la table `tab_actions_sub_type`
--

INSERT INTO `@prefix@tab_actions_sub_type` (`action_type_id`, `label`) VALUES
  (1, 'Aide à la toilette'),
  (1, 'Au lavabo'),
  (1, 'Complète au lit'),
  (2, 'Autonome'),
  (2, 'Aide humaine'),
  (2, 'Lève malade'),
  (3, 'Installation'),
  (3, 'Aide complète'),
  (3, 'Sonde'),
  (4, 'Contient'),
  (4, 'Sonde'),
  (4, 'Transfert chaise pot'),
  (4, 'Bassin / Pistolet'),
  (4, 'Projection');

-- --------------------------------------------------------

--
-- Structure de la table `tab_actions_type`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_actions_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(250) NOT NULL,
  `placeholder` VARCHAR(250) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Contenu de la table `tab_actions_type`
--

INSERT INTO `@prefix@tab_actions_type` (`label`, `placeholder`) VALUES
  ('Toilette', 'participation, douleurs, difficultés'),
  ('Transfert', 'appréhensions, douleurs, difficultés'),
  ('Repas', 'stimulations, quantités'),
  ('Elimination', '');

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_actions`
--
ALTER TABLE `@prefix@tab_actions`
ADD CONSTRAINT `fk_action_user` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_action_action_sub_type` FOREIGN KEY (`action_sub_type_id`) REFERENCES `@prefix@tab_actions_sub_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_action_action_type` FOREIGN KEY (`action_type_id`) REFERENCES `@prefix@tab_actions_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_action_event` FOREIGN KEY (`event_id`) REFERENCES `@prefix@tab_events` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `tab_actions_sub_type`
--
ALTER TABLE `@prefix@tab_actions_sub_type`
ADD CONSTRAINT `fk_actions_actions_sub` FOREIGN KEY (`action_type_id`) REFERENCES `@prefix@tab_actions_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;