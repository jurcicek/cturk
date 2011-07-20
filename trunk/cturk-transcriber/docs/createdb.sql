-- phpMyAdmin SQL Dump
-- version 3.1.2deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Aug 09, 2010 at 09:06 AM
-- Server version: 5.1.31
-- PHP Version: 5.2.6-3ubuntu4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `cturk`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `cturk_list2`
--

