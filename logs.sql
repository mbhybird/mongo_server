/*
 Navicat Premium Data Transfer

 Source Server         : cloud
 Source Server Type    : MySQL
 Source Server Version : 50544
 Source Host           : www.things.buzz
 Source Database       : webuzz

 Target Server Type    : MySQL
 Target Server Version : 50544
 File Encoding         : utf-8

 Date: 03/31/2016 12:11:40 PM
*/

SET NAMES utf8;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `logs`
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `things` varchar(30) NOT NULL,
  `createBy` varchar(30) NOT NULL,
  `logType` varchar(10) NOT NULL,
  `logTime` datetime NOT NULL,
  `beacon_major` int(11) NOT NULL,
  `beacon_minor` int(11) NOT NULL,
  `beacon_range` varchar(10) NOT NULL,
  `location_lat` float NOT NULL,
  `location_lng` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=latin1;

-- ----------------------------
--  Procedure structure for `proc_HeatChart`
-- ----------------------------
DROP PROCEDURE IF EXISTS `proc_HeatChart`;
delimiter ;;
CREATE DEFINER=`webuzz.user`@`%` PROCEDURE `proc_HeatChart`(IN min int)
select things,count(*) as heat from
(
	select things,createBy from logs where logType='I' 
	and logTime>=date_add(date_add(UTC_TIMESTAMP(), interval +8 hour),interval -(min) minute) 
	group by things,createBy
)a
group by things
 ;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
