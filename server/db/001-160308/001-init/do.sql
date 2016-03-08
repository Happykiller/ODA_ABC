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
  `adress_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `adress_id` (`adress_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_patients`
--
ALTER TABLE `@prefix@tab_patients`
ADD CONSTRAINT `fk_patient_adress` FOREIGN KEY (`adress_id`) REFERENCES `@prefix@tab_adress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;


-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;