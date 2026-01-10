drop database if exists `crai`;
create database `crai`;
use `crai`;

-- Ensure application user exists even if root creates the schema
CREATE USER IF NOT EXISTS 'crai_user'@'%' IDENTIFIED BY 'crai_pass';
GRANT ALL PRIVILEGES ON `crai`.* TO 'crai_user'@'%';
FLUSH PRIVILEGES;

CREATE TABLE userType (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nameType VARCHAR(50) NOT NULL
);


CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(50),
    surname VARCHAR(50),
    fullName VARCHAR(100),
    picture VARCHAR(255),
    sub VARCHAR(100),
    email_verified BOOLEAN,
    locale VARCHAR(10),
    iat BIGINT,
    exp BIGINT,
    userType INT NOT NULL,

    FOREIGN KEY (userType) REFERENCES userType(id) ON DELETE RESTRICT ON UPDATE CASCADE
);


CREATE TABLE vehicles (
    plate VARCHAR(10) PRIMARY KEY,
    badge VARCHAR(10),
    userId VARCHAR(100),
    vehicleTypeId INT,

    FOREIGN KEY (userId) REFERENCES user(email) ON DELETE SET NULL ON UPDATE CASCADE,
);


CREATE TABLE stolenVehicle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(10) NOT NULL UNIQUE,
    stolenDate DATE,

    FOREIGN KEY (plate) REFERENCES vehicles(plate) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE camera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    locationX DECIMAL(9,6),
    locationY DECIMAL(9,6)
);


CREATE TABLE detection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(10) NOT NULL,
    cameraId INT NOT NULL,
    detectionDate DATETIME NOT NULL,

    FOREIGN KEY (vehicleId) REFERENCES vehicles(plate) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (cameraId) REFERENCES camera(id) ON DELETE RESTRICT ON UPDATE CASCADE
);
