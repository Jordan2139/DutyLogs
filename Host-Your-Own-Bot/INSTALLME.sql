CREATE DATABASE IF NOT EXISTS `fivemdutylogs`;
USE `fivemdutylogs`;

CREATE TABLE IF NOT EXISTS `dutylogs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `steam` text COLLATE utf8mb4_unicode_520_ci,
  `guild` text COLLATE utf8mb4_unicode_520_ci,
  `server` bigint(20) DEFAULT NULL,
  `onduty` text COLLATE utf8mb4_unicode_520_ci,
  `starttime` datetime DEFAULT NULL,
  `endtime` datetime DEFAULT NULL,
  `department` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=217 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `logchannels` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `guild` text COLLATE utf8mb4_unicode_520_ci,
  `channelid` text COLLATE utf8mb4_unicode_520_ci,
  `type` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `players` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `steam` text COLLATE utf8mb4_unicode_520_ci,
  `license` text COLLATE utf8mb4_unicode_520_ci,
  `license2` text COLLATE utf8mb4_unicode_520_ci,
  `xbl` text COLLATE utf8mb4_unicode_520_ci,
  `live` text COLLATE utf8mb4_unicode_520_ci,
  `discord` text COLLATE utf8mb4_unicode_520_ci,
  `fivem` text COLLATE utf8mb4_unicode_520_ci,
  `guild` text COLLATE utf8mb4_unicode_520_ci,
  `server` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE IF NOT EXISTS `servers` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ip` text COLLATE utf8mb4_unicode_520_ci,
  `port` text COLLATE utf8mb4_unicode_520_ci,
  `guild` text COLLATE utf8mb4_unicode_520_ci,
  `addedBy` text COLLATE utf8mb4_unicode_520_ci,
  `inactive` tinyint(1) DEFAULT '0',
  `name` text COLLATE utf8mb4_unicode_520_ci,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `steam` text COLLATE utf8mb4_unicode_520_ci,
  `server` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;