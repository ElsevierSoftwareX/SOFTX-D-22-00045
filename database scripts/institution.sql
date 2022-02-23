CREATE TABLE IF NOT EXISTS Nodes
(
    id          UUID    NOT NULL DEFAULT gen_random_uuid(),
    name        VARCHAR NOT NULL,
    ip_address  VARCHAR NOT NULL,
    port_number INT2    NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (name),
    CHECK (length(btrim(name)) > 0),
    CHECK (port_number BETWEEN 0 AND 65535)
);

CREATE TABLE IF NOT EXISTS Radiology_report
(
    id                 UUID      NOT NULL DEFAULT gen_random_uuid(),
    description        VARCHAR   NOT NULL,
    findings           VARCHAR   NOT NULL,
    conclusion         VARCHAR   NOT NULL,
    recommendation     VARCHAR,
    date_and_time      TIMESTAMP NOT NULL,
    patient            UUID      NOT NULL,
    doctor_of_medicine UUID      NOT NULL,
    PRIMARY KEY (id),
    CHECK (length(btrim(description)) > 0),
    CHECK (length(btrim(findings)) > 0),
    CHECK (length(btrim(conclusion)) > 0)
);

CREATE TABLE IF NOT EXISTS Images
(
    id                UUID      NOT NULL DEFAULT gen_random_uuid(),
    date_and_time     TIMESTAMP NOT NULL,
    image_type        UUID      NOT NULL,
    node              UUID      NOT NULL,
    patient           UUID      NOT NULL,
    description       VARCHAR   NOT NULL,
    checksum          CHAR(32)  NOT NULL,
    rows              INT2      NOT NULL,
    columns           INT2      NOT NULL,
    frames            INT2      NOT NULL,
    rescale_slope     FLOAT     DEFAULT 1.0,
    rescale_intercept FLOAT     DEFAULT 0.0,
    window_center     FLOAT     DEFAULT 0.0,
    window_width      FLOAT     DEFAULT 1.0,
    PRIMARY KEY (id),
    FOREIGN KEY (node) REFERENCES nodes (id) ON DELETE RESTRICT,
    UNIQUE (checksum),
    CHECK (length(btrim(description)) > 0),
    CHECK (rows > 0),
    CHECK (columns > 0),
    CHECK (frames > 0)
);

CREATE TABLE IF NOT EXISTS Radiology_report_images
(
    id               UUID NOT NULL DEFAULT gen_random_uuid(),
    radiology_report UUID NOT NULL,
    institution      UUID NOT NULL,
    image            UUID NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (radiology_report, image),
    FOREIGN KEY (radiology_report) REFERENCES Radiology_report (id) ON DELETE RESTRICT
);

--Institution 1
INSERT INTO Nodes (name, ip_address, port_number) VALUES ('Node 1', 'sivr.info', 8083);
