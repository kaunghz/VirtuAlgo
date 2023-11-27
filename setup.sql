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

CREATE TABLE Stock (
	stockId SERIAL PRIMARY KEY,
	stockName VARCHAR(5),
	stockPrice DECIMAL(10, 2)
);

CREATE TABLE Portfolio_Stock (
	portfolioId INTEGER REFERENCES Portfolio(portfolioId),
	stockId INTEGER REFERENCES Stock(stockId),
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

INSERT INTO users (username, saltedPass, email) VALUES ('test', '$2b$10$DicT0edfb5vM8qVNHkjqmOSyRvOQaiCdLTBvxF7lsEjRkcEmGSgE.', 'qwert1234@gmail.com')
