SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------

--
-- Structure de la table `tab_adress_trajet`
--

CREATE TABLE IF NOT EXISTS `@prefix@tab_adress_trajet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adress_id_ori` int(11) NOT NULL,
  `adress_id_dest` int(11) NOT NULL,
  `distance` varchar(250) NOT NULL,
  `distance_m` int(11) NOT NULL,
  `duration` varchar(250) NOT NULL,
  `duration_s` int(11) NOT NULL,
  `travel_mode` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `adress_id_ori_2` (`adress_id_ori`,`adress_id_dest`),
  KEY `adress_id_ori` (`adress_id_ori`),
  KEY `adress_id_dest` (`adress_id_dest`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- Contraintes pour les tables exportées
--

--
-- Contraintes pour la table `tab_adress_trajet`
--
ALTER TABLE `@prefix@tab_adress_trajet`
ADD CONSTRAINT `fk_adress_trajet_dest_id` FOREIGN KEY (`adress_id_dest`) REFERENCES `@prefix@tab_adress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
ADD CONSTRAINT `fk_adress_trajet_ori_id` FOREIGN KEY (`adress_id_ori`) REFERENCES `@prefix@tab_adress` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;


-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;