CREATE DATABASE virtualgo;
\c virtualgo
CREATE TABLE Users (
	userId SERIAL PRIMARY KEY,
	username VARCHAR(25),
	saltedPass VARCHAR(50)
);

CREATE TABLE Portfolio (
	portfolioId SERIAL PRIMARY KEY,
	userId INTEGER REFERENCES Users(userId),
	balance DECIMAL(10, 2)
);

