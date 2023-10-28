CREATE DATABASE bamazon;
\c bamazon
CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	title VARCHAR(15),
	genre VARCHAR(25),
	quality BOOLEAN
);
