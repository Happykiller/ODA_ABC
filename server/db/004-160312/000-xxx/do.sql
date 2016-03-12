SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------
ALTER TABLE `@prefix@tab_events` ADD `googleEtag` VARCHAR(500) NOT NULL AFTER `end`, ADD `googleId` VARCHAR(500) NOT NULL AFTER `googleEtag`, ADD `googleHtmlLink` VARCHAR(500) NOT NULL AFTER `googleId`, ADD `googleICalUID` VARCHAR(500) NOT NULL AFTER `googleHtmlLink`;
-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;