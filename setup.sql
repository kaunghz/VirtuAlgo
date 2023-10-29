DROP DATABASE IF EXISTS virtualgo;
CREATE DATABASE virtualgo;
\c virtualgo
CREATE TABLE virtu (
    id SERIAL PRIMARY KEY
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20),
    hashed_password CHAR(60)
);
