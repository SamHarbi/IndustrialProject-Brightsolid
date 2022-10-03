-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 03, 2022 at 02:17 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `brightsolid`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_id` int(11) NOT NULL,
  `account_ref` varchar(20) NOT NULL,
  `platform_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `customer_id` int(11) NOT NULL,
  `customer_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `exception`
--

CREATE TABLE `exception` (
  `exception_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `last_updated_by` int(11) NOT NULL,
  `exception_value` varchar(20) NOT NULL,
  `justification` varchar(300) NOT NULL,
  `review_date` timestamp NULL DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `exception_audit`
--

CREATE TABLE `exception_audit` (
  `exception_audit_id` int(11) NOT NULL,
  `exception_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `action` varchar(300) NOT NULL,
  `action_dt` timestamp NULL DEFAULT NULL,
  `old_exception_value` varchar(20) NOT NULL,
  `new_exception_value` varchar(20) NOT NULL,
  `old_justification` varchar(300) NOT NULL,
  `new_justification` varchar(300) NOT NULL,
  `old_review_date` timestamp NULL DEFAULT NULL,
  `new_review_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `non_compliance`
--

CREATE TABLE `non_compliance` (
  `resource_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `non_compliance_audit`
--

CREATE TABLE `non_compliance_audit` (
  `non_complaince_audit_id` int(11) NOT NULL,
  `non_compliance_id` int(11) NOT NULL,
  `resource_id` int(11) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(300) NOT NULL,
  `action_dt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `platform`
--

CREATE TABLE `platform` (
  `platform_id` int(11) NOT NULL,
  `platform_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `resource`
--

CREATE TABLE `resource` (
  `resource_id` int(11) NOT NULL,
  `resource_ref` varchar(20) NOT NULL,
  `account_id` int(11) NOT NULL,
  `resource_type_id` int(11) NOT NULL,
  `resource_name` varchar(20) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `resource_metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`resource_metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `resource_type`
--

CREATE TABLE `resource_type` (
  `resource_type_id` int(11) NOT NULL,
  `resource_type_name` varchar(20) NOT NULL,
  `platform_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `rule`
--

CREATE TABLE `rule` (
  `rule_id` int(11) NOT NULL,
  `rule_name` varchar(20) NOT NULL,
  `resource_type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `role_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `user_role_id` int(11) NOT NULL,
  `user_role_name` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `platform_id` (`platform_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`customer_id`);

--
-- Indexes for table `exception`
--
ALTER TABLE `exception`
  ADD PRIMARY KEY (`exception_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `rule_id` (`rule_id`);

--
-- Indexes for table `exception_audit`
--
ALTER TABLE `exception_audit`
  ADD PRIMARY KEY (`exception_audit_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `exception_id` (`exception_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `rule_id` (`rule_id`);

--
-- Indexes for table `non_compliance`
--
ALTER TABLE `non_compliance`
  ADD PRIMARY KEY (`resource_id`,`rule_id`),
  ADD UNIQUE KEY `resource_id` (`resource_id`,`rule_id`),
  ADD KEY `rule_id` (`rule_id`);

--
-- Indexes for table `non_compliance_audit`
--
ALTER TABLE `non_compliance_audit`
  ADD PRIMARY KEY (`non_complaince_audit_id`),
  ADD KEY `resource_id` (`resource_id`),
  ADD KEY `rule_id` (`rule_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `platform`
--
ALTER TABLE `platform`
  ADD PRIMARY KEY (`platform_id`);

--
-- Indexes for table `resource`
--
ALTER TABLE `resource`
  ADD PRIMARY KEY (`resource_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `resource_type_id` (`resource_type_id`);

--
-- Indexes for table `resource_type`
--
ALTER TABLE `resource_type`
  ADD PRIMARY KEY (`resource_type_id`),
  ADD KEY `platform_id` (`platform_id`);

--
-- Indexes for table `rule`
--
ALTER TABLE `rule`
  ADD PRIMARY KEY (`rule_id`),
  ADD KEY `resource_type_id` (`resource_type_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`user_role_id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `account_ibfk_1` FOREIGN KEY (`platform_id`) REFERENCES `platform` (`platform_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `account_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exception`
--
ALTER TABLE `exception`
  ADD CONSTRAINT `exception_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exception_ibfk_2` FOREIGN KEY (`rule_id`) REFERENCES `rule` (`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exception_audit`
--
ALTER TABLE `exception_audit`
  ADD CONSTRAINT `exception_audit_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exception_audit_ibfk_2` FOREIGN KEY (`exception_id`) REFERENCES `exception` (`exception_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exception_audit_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exception_audit_ibfk_4` FOREIGN KEY (`rule_id`) REFERENCES `rule` (`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `non_compliance`
--
ALTER TABLE `non_compliance`
  ADD CONSTRAINT `non_compliance_ibfk_1` FOREIGN KEY (`rule_id`) REFERENCES `rule` (`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `non_compliance_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `non_compliance_audit`
--
ALTER TABLE `non_compliance_audit`
  ADD CONSTRAINT `non_compliance_audit_ibfk_1` FOREIGN KEY (`resource_id`) REFERENCES `resource` (`resource_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `non_compliance_audit_ibfk_2` FOREIGN KEY (`rule_id`) REFERENCES `rule` (`rule_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `non_compliance_audit_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `resource`
--
ALTER TABLE `resource`
  ADD CONSTRAINT `resource_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resource_ibfk_2` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`resource_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `resource_type`
--
ALTER TABLE `resource_type`
  ADD CONSTRAINT `resource_type_ibfk_1` FOREIGN KEY (`platform_id`) REFERENCES `platform` (`platform_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rule`
--
ALTER TABLE `rule`
  ADD CONSTRAINT `rule_ibfk_1` FOREIGN KEY (`resource_type_id`) REFERENCES `resource_type` (`resource_type_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `user_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`user_role_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
