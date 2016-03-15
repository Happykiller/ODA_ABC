SET FOREIGN_KEY_CHECKS=0;
-- --------------------------------------------------------

ALTER TABLE `@prefix@tab_events` ADD `note` TEXT NOT NULL AFTER `googleICalUID`;

-- --------------------------------------------------------
SET FOREIGN_KEY_CHECKS=1;