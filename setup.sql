DROP DATABASE IF EXISTS virtualgo;
CREATE DATABASE virtualgo;
\c virtualgo

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20),
  saltedPass CHAR(60),
  email VARCHAR(40)
);

CREATE TABLE Portfolio (
	portfolioId SERIAL PRIMARY KEY,
	userId INTEGER REFERENCES Users(userId),
	balance DECIMAL(10, 2)
);

