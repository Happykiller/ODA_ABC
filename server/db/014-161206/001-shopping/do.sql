SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
INSERT INTO `@prefix@api_tab_menu` (`id`, `Description`, `Description_courte`, `id_categorie`, `Lien`) VALUES (NULL, 'shoppingList.title', 'shoppingList.title', '3', 'shoppingList');

UPDATE `@prefix@api_tab_menu_rangs_droit` a
  INNER JOIN `@prefix@api_tab_menu` b
    ON b.`Lien` = 'shoppingList'
  INNER JOIN `@prefix@api_tab_rangs` c
    ON c.`id` = a.`id_rang`
       AND c.`indice` in (1,10,20,30)
SET `id_menu` = concat(`id_menu`,b.`id`,';');

INSERT INTO `@prefix@api_tab_menu` (`id`, `Description`, `Description_courte`, `id_categorie`, `Lien`) VALUES (NULL, 'shoppinReport.title', 'shoppinReport.title', '4', 'shoppinReport');

UPDATE `@prefix@api_tab_menu_rangs_droit` a
  INNER JOIN `@prefix@api_tab_menu` b
    ON b.`Lien` = 'shoppinReport'
  INNER JOIN `@prefix@api_tab_rangs` c
    ON c.`id` = a.`id_rang`
       AND c.`indice` in (1,10,20,30)
SET `id_menu` = concat(`id_menu`,b.`id`,';');

--
-- Structure de la table `tab_shopping`
--

CREATE TABLE `@prefix@tab_shopping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `entity` varchar(250) NOT NULL,
  `mode` varchar(250) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `date_action` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `movement` varchar(50) NOT NULL,
  `comment` text NOT NULL,
  `attach_name` varchar(250) NOT NULL,
  `author_id` int(11) NOT NULL,
  `date_record` datetime NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `author_id` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Contraintes pour la table `tab_events`
--
ALTER TABLE `@prefix@tab_shopping`
ADD CONSTRAINT `fk_shopping_patient_id` FOREIGN KEY (`patient_id`) REFERENCES `@prefix@tab_patients` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_shopping_user` FOREIGN KEY (`author_id`) REFERENCES `@prefix@api_tab_utilisateurs` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;