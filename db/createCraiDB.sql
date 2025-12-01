DROP database if exists crai-db;
CREATE database crai-db;

use crai-db;

CREATE TABLE UserType (
    userType_id INT AUTO_INCREMENT PRIMARY KEY,
    nameTyme VARCHAR(50) NOT NULL
);


CREATE TABLE User (
    email VARCHAR(100) PRIMARY KEY,
    nameUser VARCHAR(50) NOT NULL,
    surnameUser VARCHAR(50) NOT NULL,
    birthDate DATE,
    userType INT NOT NULL,
    FOREIGN KEY (userType) REFERENCES UserType(userType_id)
);


CREATE TABLE VehicleType (
    vehicleType_id INT AUTO_INCREMENT PRIMARY KEY,
    vehicleTypeName VARCHAR(50) NOT NULL
);


CREATE TABLE Vehicles (
    plate VARCHAR(10) PRIMARY KEY,
    badge VARCHAR(10),
    id_user VARCHAR(100),
    vehicleType_id INT,
    FOREIGN KEY (id_user) REFERENCES User(email),
    FOREIGN KEY (vehicleType_id) REFERENCES VehicleType(vehicleType_id)
);


CREATE TABLE Stolen_vehicle (
    id_robado INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(10) NOT NULL UNIQUE,
    stolen_date DATE,
    FOREIGN KEY (plate) REFERENCES Vehicles(plate)
);


CREATE TABLE Camera (
    camera_id INT AUTO_INCREMENT PRIMARY KEY,
    location_x FLOAT,
    location_y FLOAT,
    badge VARCHAR(10)
);


CREATE TABLE Detection (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id VARCHAR(10) NOT NULL,
    camera_id INT NOT NULL,
    DetectionDate DATETIME NOT NULL,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(plate),
    FOREIGN KEY (camera_id) REFERENCES Camera(camera_id)
);
