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

 Date: 07/13/2016 16:25:00 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `follows`
-- ----------------------------
DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(30) DEFAULT NULL,
  `followId` varchar(30) DEFAULT NULL,
  `source` varchar(10) DEFAULT NULL,
  `createDate` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `index_userId_followId_unique` (`userId`,`followId`) USING HASH
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1;

SET FOREIGN_KEY_CHECKS = 1;
