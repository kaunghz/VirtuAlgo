DROP DATABASE IF EXISTS virtualgo;
CREATE DATABASE virtualgo;
\c virtualgo

CREATE TABLE Users (
  userId SERIAL PRIMARY KEY,
  username VARCHAR(20),
  saltedPass CHAR(60),
  email VARCHAR(40)
);

CREATE TABLE Portfolio (
	portfolioId SERIAL PRIMARY KEY,
	userId INTEGER REFERENCES Users(userId),
	balance DECIMAL(10, 2)
);

CREATE TABLE Algorithms (
  algorithmId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES Users(userId),
  name VARCHAR(20),
  buyBelowPrice DECIMAL(10, 2),
  buyBelowStocks DECIMAL(10, 2),
  sellBelowPrice DECIMAL(10, 2),
  sellBelowStocks DECIMAL(10, 2),
  sellAbovePrice DECIMAL(10, 2),
  sellAboveStocks DECIMAL(10, 2)
);
