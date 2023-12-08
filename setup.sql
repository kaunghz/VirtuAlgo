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

CREATE TABLE Algorithm_Buy_Below (
  AlgorithmBuyBelowId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES USERS(userId),
  name VARCHAR(20) NOT NULL,
  ticker VARCHAR(5) NOT NULL,
  buyBelowPrice DECIMAL(10, 2) NOT NULL,
  buyBelowQuantity INTEGER NOT NULL
);

CREATE TABLE Algorithm_Sell_Above (
  AlgorithmSellAboveId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES USERS(userId),
  name VARCHAR(20) NOT NULL,
  ticker VARCHAR(5) NOT NULL,
  sellAbovePrice DECIMAL(10, 2) NOT NULL,
  sellAboveQuantity INTEGER NOT NULL
);

CREATE TABLE Algorithm_Sell_Below (
  AlgorithmSellBelowId SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES USERS(userId),
  name VARCHAR(20) NOT NULL,
  ticker VARCHAR(5) NOT NULL,
  sellBelowPrice DECIMAL(10, 2) NOT NULL,
  sellBelowQuantity INTEGER NOT NULL
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