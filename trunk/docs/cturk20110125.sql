-- phpMyAdmin SQL Dump
-- version 3.1.5
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 25, 2011 at 07:30 AM
-- Server version: 5.1.39
-- PHP Version: 5.2.9-2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `cturk`
--

-- --------------------------------------------------------

--
-- Table structure for table `cturk4_assignments`
--

CREATE TABLE IF NOT EXISTS `cturk4_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL,
  `worker_id` int(11) NOT NULL,
  `hit_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `acceptDate` varchar(16) NOT NULL,
  `submitDate` varchar(16) DEFAULT NULL,
  `finishDate` varchar(16) DEFAULT NULL,
  `expireDate` varchar(16) DEFAULT NULL,
  `data` text,
  `state` varchar(255) NOT NULL,
  `message` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_assignments`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk4_groups`
--

CREATE TABLE IF NOT EXISTS `cturk4_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `requester_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `currencyCode` varchar(64) NOT NULL,
  `reward` varchar(16) NOT NULL,
  `expireDate` varchar(16) NOT NULL,
  `assignmentTime` int(11) NOT NULL COMMENT 'seconds',
  `autoApprovalTime` int(11) NOT NULL COMMENT 'seconds',
  `maxHits` int(11) NOT NULL DEFAULT '0',
  `numCompletedHit` int(11) NOT NULL DEFAULT '0',
  `numAvailableHit` int(11) NOT NULL DEFAULT '0',
  `state` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_groups`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk4_hits`
--

CREATE TABLE IF NOT EXISTS `cturk4_hits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `currencyCode` varchar(64) NOT NULL,
  `reward` varchar(16) NOT NULL,
  `publishDate` varchar(16) NOT NULL,
  `expireDate` varchar(16) NOT NULL,
  `assignmentTime` int(11) NOT NULL COMMENT 'seconds',
  `autoApprovalTime` int(11) NOT NULL COMMENT 'seconds',
  `url` varchar(255) NOT NULL,
  `frameHeight` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `state` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_hits`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk4_payorders`
--

CREATE TABLE IF NOT EXISTS `cturk4_payorders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `senderEmail` varchar(255) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `receiverEmail` varchar(255) NOT NULL,
  `receiverAmount` varchar(255) NOT NULL,
  `payKey` varchar(255) NOT NULL,
  `assignmentIds` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `createDate` varchar(16) NOT NULL,
  `completeDate` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_payorders`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk4_users`
--

CREATE TABLE IF NOT EXISTS `cturk4_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(32) NOT NULL,
  `paypalAccount` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `sex` varchar(16) NOT NULL,
  `buildingName` varchar(255) DEFAULT NULL,
  `streetName` varchar(255) DEFAULT NULL,
  `cityName` varchar(255) DEFAULT NULL,
  `postcode` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `isRequester` int(11) NOT NULL DEFAULT '0',
  `isActive` int(11) NOT NULL DEFAULT '1',
  `isEnabled` int(11) NOT NULL DEFAULT '1',
  `acceptanceRatio` int(11) NOT NULL DEFAULT '0',
  `createDate` varchar(16) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `cturk4_users`
--

INSERT INTO `cturk4_users` (`id`, `username`, `password`, `paypalAccount`, `title`, `firstname`, `surname`, `sex`, `buildingName`, `streetName`, `cityName`, `postcode`, `email`, `isRequester`, `isActive`, `isEnabled`, `acceptanceRatio`, `createDate`) VALUES
(1, 'midfar@qq.com', '21232f297a57a5a743894a0e4a801fc3', 'cturk__1287135123_per@126.com', 'Mr.', 'firstname', 'surname', 'male', 'b', 's', 'c', 'p', 'midfar@qq.com', 1, 1, 1, 67, '1293254326110'),
(2, 'midfar@vip.qq.com', '21232f297a57a5a743894a0e4a801fc3', 'cturk__1287126000_per@126.com', 'Mr.', 'firstname', 'surname', 'male', 'b', 's', 'c', 'p', 'midfar@vip.qq.com', 0, 1, 1, 67, '1293254382316'),
(3, 'admin@midfar.com', '21232f297a57a5a743894a0e4a801fc3', 'cturk__1287563539_per@126.com', 'Mr.', 'f3', 's3', 'male', 'b', 's', 'c', 'p', 'admin@midfar.com', 1, 1, 1, 67, '1293254406452');

-- --------------------------------------------------------

--
-- Table structure for table `cturk4_usertokens`
--

CREATE TABLE IF NOT EXISTS `cturk4_usertokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `resetPasswordToken` varchar(32) DEFAULT NULL,
  `hasUsed` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_usertokens`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk4_workerrequests`
--

CREATE TABLE IF NOT EXISTS `cturk4_workerrequests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `worker_id` int(11) NOT NULL,
  `requester_id` int(11) NOT NULL,
  `createDate` varchar(16) NOT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk4_workerrequests`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk_list`
--

CREATE TABLE IF NOT EXISTS `cturk_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(255) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `hitid` varchar(100) DEFAULT NULL,
  `hittypeid` varchar(100) DEFAULT NULL,
  `AssignmentId` varchar(100) DEFAULT NULL,
  `AssignmentStatus` varchar(100) DEFAULT NULL,
  `WorkerId` varchar(100) DEFAULT NULL,
  `Answers` text,
  `StdAnswers` text,
  `audioLength` varchar(20) DEFAULT NULL,
  `publishDate` varchar(100) DEFAULT NULL,
  `checkDate` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk_list`
--


-- --------------------------------------------------------

--
-- Table structure for table `cturk_list2`
--

CREATE TABLE IF NOT EXISTS `cturk_list2` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `trans_id` int(11) DEFAULT NULL,
  `trans_AssignmentId` varchar(100) DEFAULT NULL,
  `path` varchar(255) NOT NULL,
  `status` int(11) DEFAULT NULL,
  `hitid` varchar(100) DEFAULT NULL,
  `hittypeid` varchar(100) DEFAULT NULL,
  `AssignmentId` varchar(100) DEFAULT NULL,
  `AssignmentStatus` varchar(100) DEFAULT NULL,
  `WorkerId` varchar(100) DEFAULT NULL,
  `StdQuestions` text,
  `Answers` text,
  `StdAnswers` text,
  `audioLength` varchar(20) DEFAULT NULL,
  `publishDate` varchar(100) DEFAULT NULL,
  `checkDate` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk_list2`
--

