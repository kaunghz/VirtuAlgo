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
  portfolioName VARCHAR(20),
	userId INTEGER REFERENCES Users(userId),
	balance DECIMAL(10, 2)
);

CREATE TABLE Portfolio_Stock (
	portfolioId INTEGER REFERENCES Portfolio(portfolioId),
  stockName VARCHAR(5),
	stockAmount INTEGER,
  totalPrice DECIMAL(10, 2)
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

CREATE TABLE Portfolio_History (
	portfolioId INTEGER REFERENCES Portfolio(portfolioId),
  stockName VARCHAR(5),
	stockAmount INTEGER,
  stockPrice DECIMAL(10, 2),
  totalStock INTEGER,
  portfolioBalance DECIMAL(10, 2),
  transactionDate TIMESTAMP
);

INSERT INTO users (username, saltedPass, email) VALUES ('test', '$2b$10$DicT0edfb5vM8qVNHkjqmOSyRvOQaiCdLTBvxF7lsEjRkcEmGSgE.', 'qwert1234@gmail.com');
INSERT INTO portfolio (portfolioName, userId, balance) VALUES ('port1', 1, 10000.00);