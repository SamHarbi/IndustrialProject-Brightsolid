DROP DATABASE IF EXISTS `test`;

CREATE DATABASE `test`;

USE `test`;

CREATE TABLE test(
    ID int not NULL PRIMARY KEY,
    Name int,
    State decimal(5,2)
);

INSERT INTO test
VALUES
(1,Test1,76.3),
(2,Test2,68.3),
(3,Test3,48.3);
