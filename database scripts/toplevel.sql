CREATE TABLE IF NOT EXISTS Institutions
(
    id          UUID    NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR NOT NULL,
    address     VARCHAR NOT NULL,
    ip_address  INET    NOT NULL,
    port_number INT2    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name),
    CHECK (length(btrim(name)) > 0),
    CHECK (length(btrim(address)) > 0),
    CHECK (port_number BETWEEN 0 AND 65535)
);

INSERT INTO Institutions (name, address, ip_address, port_number) VALUES ('FER', 'Unska 3, 10000 Zagreb', '127.0.0.1', 8082);
INSERT INTO Institutions (name, address, ip_address, port_number) VALUES ('Siemens Energy', 'Heinzelova 70a, 10000 Zagreb', '127.0.0.1', 8083);


CREATE TABLE IF NOT EXISTS Users
(
    id                 UUID     NOT NULL DEFAULT gen_random_uuid(),
    username           VARCHAR  NOT NULL,
    password           CHAR(32) NOT NULL,
    administrator      BOOL     NOT NULL DEFAULT false,
    superuser          BOOL     NOT NULL DEFAULT false,
    first_name         VARCHAR  NOT NULL,
    last_name          VARCHAR  NOT NULL,
    doctor_of_medicine BOOL     NOT NULL DEFAULT false,
    active             BOOL     NOT NULL DEFAULT true,
    institution        UUID     NOT NULL,
    address            VARCHAR,
    email              VARCHAR,
    phone              VARCHAR,
    PRIMARY KEY (id),
    UNIQUE (username),
    FOREIGN KEY (institution) REFERENCES Institutions (id) ON DELETE RESTRICT,
    CHECK (length(btrim(username)) > 0),
    CHECK (length(btrim(password)) = 32),
    CHECK (length(btrim(first_name)) > 0),
    CHECK (length(btrim(last_name)) > 0)
);


INSERT INTO Users (username, password, administrator, superuser, first_name, last_name, doctor_of_medicine, active, institution)
VALUES ('Test', '0cbc6611f5540bd0809a388dc95a615b', FALSE, TRUE, 'Testni', 'Korisnik', TRUE, TRUE, (SELECT id FROM Institutions WHERE name = 'Siemens Energy'));
INSERT INTO Users (username, password, administrator, superuser, first_name, last_name, doctor_of_medicine, active, institution)
VALUES ('Admin1', '2e33a9b0b06aa0a01ede70995674ee23', TRUE, FALSE, 'Administrator', '1', TRUE, TRUE, (SELECT id FROM Institutions WHERE name = 'FER'));
INSERT INTO Users (username, password, administrator, superuser, first_name, last_name, doctor_of_medicine, active, institution)
VALUES ('Admin2', '21eed4f2e9ab214fdbf00a2a091d63c4', TRUE, FALSE, 'Administrator', '2', TRUE, TRUE, (SELECT id FROM Institutions WHERE name = 'FER'));
INSERT INTO Users (username, password, administrator, superuser, first_name, last_name, doctor_of_medicine, active, institution)
VALUES ('Admin3', '84ff2c4b8b18c28f042557c0637c8528', TRUE, FALSE, 'Administrator', '3', TRUE, TRUE, (SELECT id FROM Institutions WHERE name = 'Siemens Energy'));



CREATE TABLE IF NOT EXISTS Patients
(
    id               UUID    NOT NULL DEFAULT gen_random_uuid(),
    first_name       VARCHAR NOT NULL,
    last_name        VARCHAR NOT NULL,
    gender           CHAR    NOT NULL,
    date_of_birth    DATE    NOT NULL,
    insurance_number DECIMAL NOT NULL,
    address          VARCHAR,
    email            VARCHAR,
    phone            VARCHAR,
    PRIMARY KEY (id),
    UNIQUE (insurance_number),
    CHECK (insurance_number > 0),
    CHECK (length(btrim(first_name)) > 0),
    CHECK (length(btrim(last_name)) > 0),
    CHECK (gender IN ('M', 'F'))
);

INSERT INTO Patients (first_name, last_name, gender, date_of_birth, insurance_number) VALUES ('John', 'Doe', 'M', '1900-01-01', 1234567890);


CREATE TABLE IF NOT EXISTS Image_types
(
    id          UUID    NOT NULL DEFAULT gen_random_uuid(),
    description VARCHAR NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (description),
    CHECK (length(btrim(description)) > 0)
);

INSERT INTO Image_types (description) VALUES ('Computed tomography');
INSERT INTO Image_types (description) VALUES ('Magnetic resonance');
INSERT INTO Image_types (description) VALUES ('Ultrasonic');
