SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
INSERT INTO `@prefix@api_tab_menu` (`Description`, `Description_courte`, `id_categorie`, `Lien`) VALUES ('patients.title', 'patients.title', '3', 'patients');

UPDATE `@prefix@api_tab_menu_rangs_droit` a
  INNER JOIN `@prefix@api_tab_menu` b
    ON b.`Lien` = 'patients'
  INNER JOIN `@prefix@api_tab_rangs` c
    ON c.`id` = a.`id_rang`
       AND c.`indice` in (1,10,20)
SET `id_menu` = concat(`id_menu`,b.`id`,';');


-- --------------------------------------------------------
--
-- Structure de la table `tab_adress`
--

CREATE TABLE `@prefix@tab_adress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `adress` varchar(250) NOT NULL,
  `code_postal` varchar(250) NOT NULL,
  `city` varchar(250) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

INSERT INTO `@prefix@api_tab_menu` (`Description`, `Description_courte`, `id_categorie`, `Lien`) VALUES ('planning.title', 'planning.title', '3', 'planning');

UPDATE `@prefix@api_tab_menu_rangs_droit` a
  INNER JOIN `@prefix@api_tab_menu` b
    ON b.`Lien` = 'planning'
  INNER JOIN `@prefix@api_tab_rangs` c
    ON c.`id` = a.`id_rang`
       AND c.`indice` in (1,10,20)
SET `id_menu` = concat(`id_menu`,b.`id`,';');

-- --------------------------------------------------------

--
-- Structure de la table `tab_patients`
--

CREATE TABLE `@prefix@tab_patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name_first` varchar(250) NOT NULL,
  `name_last` varchar(250) NOT NULL,
  `user_id` int(11) NOT NULL,
  `birthday` DATE NOT NULL,
  `secu` INT(11) NOT NULL,
  `telPerso` VARCHAR(50) NOT NULL,
  `contratStart` DATE NOT NULL,
  `nbHours` INT(3) NOT NULL,
  `costHour` DECIMAL(10,2) NOT NULL,
  `health` VARCHAR(1000) NOT NULL,
  `notes` TEXT NOT NULL,
  `adress_id` int(11) DEFAULT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adress_id` (`adress_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la table `tab_patients`
--
ALTER TABLE `@prefix@tab_patients`
ADD CONSTRAINT `fk_patient_adress` FOREIGN KEY (`adress_id`) REFERENCES `@prefix@tab_adress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------

--
-- Structure de la table `tab_events`
--

CREATE TABLE `@prefix@tab_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `start` datetime NOT NULL,
  `end` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `create_date` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `user_id` (`user_id`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la table `tab_events`
--
ALTER TABLE `@prefix@tab_events`
ADD CONSTRAINT `fk_patient_author` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_event_patient` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`),
  ADD KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la table `tab_contacts`
--
ALTER TABLE `@prefix@tab_contacts`
  ADD CONSTRAINT `fk_contacts_author` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_contacts_patient` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;