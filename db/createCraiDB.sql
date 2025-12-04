drop database if exists `crai-db`;
create database `crai-db`;
use `crai-db`;

CREATE TABLE UserType (
    userTypeId INT AUTO_INCREMENT PRIMARY KEY,
    nameTyme VARCHAR(50) NOT NULL
);


CREATE TABLE User (
    email VARCHAR(100) PRIMARY KEY,
    nameUser VARCHAR(50) NOT NULL,
    surnameUser VARCHAR(50) NOT NULL,
    birthDate DATE,
    userType INT NOT NULL,
    FOREIGN KEY (userType) REFERENCES UserType(userTypeId)
);


CREATE TABLE VehicleType (
    vehicleTypeId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleTypeName VARCHAR(50) NOT NULL
);


CREATE TABLE Vehicles (
    plate VARCHAR(10) PRIMARY KEY,
    badge VARCHAR(10),
    idUser VARCHAR(100),
    vehicleTypeId INT,
    FOREIGN KEY (idUser) REFERENCES User(email),
    FOREIGN KEY (vehicleTypeId) REFERENCES VehicleType(vehicleTypeId)
);


CREATE TABLE StolenVehicle (
    idRobado INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(10) NOT NULL UNIQUE,
    stolenDate DATE,
    FOREIGN KEY (plate) REFERENCES Vehicles(plate)
);


CREATE TABLE Camera (
    cameraId INT AUTO_INCREMENT PRIMARY KEY,
    locationX FLOAT,
    locationY FLOAT,
    badge VARCHAR(10)
);


CREATE TABLE Detection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(10) NOT NULL,
    cameraId INT NOT NULL,
    detectionDate DATETIME NOT NULL,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(plate),
    FOREIGN KEY (cameraId) REFERENCES Camera(cameraId)
);
