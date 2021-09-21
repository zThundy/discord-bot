-- --------------------------------------------------------
-- Host:                         localhost
-- Versione server:              5.7.34-log - MySQL Community Server (GPL)
-- S.O. server:                  Win64
-- HeidiSQL Versione:            10.3.0.5771
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dump della struttura del database bot
CREATE DATABASE IF NOT EXISTS `bot` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `bot`;

-- Dump della struttura di tabella bot.announces
CREATE TABLE IF NOT EXISTS `announces` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `channelId` varchar(255) DEFAULT NULL,
  `guild` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella bot.servers
CREATE TABLE IF NOT EXISTS `servers` (
  `id` varchar(255) DEFAULT NULL,
  `slotChannelId` varchar(255) DEFAULT NULL,
  `ticketMessId` varchar(255) DEFAULT NULL,
  `ticketChanId` varchar(255) DEFAULT NULL,
  `ticketCategoryId` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella bot.slot
CREATE TABLE IF NOT EXISTS `slot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guild` varchar(255) DEFAULT NULL,
  `user` varchar(255) DEFAULT NULL,
  `currency` float NOT NULL DEFAULT '0',
  `lastDaily` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella bot.tickets
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guild` varchar(255) DEFAULT NULL,
  `channelId` varchar(255) DEFAULT NULL,
  `ticketId` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- L’esportazione dei dati non era selezionata.

-- Dump della struttura di tabella bot.warns
CREATE TABLE IF NOT EXISTS `warns` (
  `id` int(11) NOT NULL,
  `user` varchar(255) DEFAULT NULL,
  `warnid` int(11) NOT NULL DEFAULT '0',
  `reason` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- L’esportazione dei dati non era selezionata.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
