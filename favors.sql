/*
 Navicat Premium Data Transfer

 Source Server         : cloud
 Source Server Type    : MySQL
 Source Server Version : 50547
 Source Host           : www.things.buzz
 Source Database       : webuzz

 Target Server Type    : MySQL
 Target Server Version : 50547
 File Encoding         : utf-8

 Date: 07/13/2016 16:24:48 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `favors`
-- ----------------------------
DROP TABLE IF EXISTS `favors`;
CREATE TABLE `favors` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ownerId` varchar(30) DEFAULT NULL,
  `thingId` varchar(30) DEFAULT NULL,
  `source` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `x_ownerId_thingId` (`ownerId`,`thingId`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=latin1;

SET FOREIGN_KEY_CHECKS = 1;
