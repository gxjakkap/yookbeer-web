-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS "thirtyeight" (
	"stdid" varchar(20) PRIMARY KEY NOT NULL,
	"course" integer NOT NULL,
	"nameth" varchar(255),
	"nameen" varchar(255) NOT NULL,
	"nickth" varchar(255),
	"nicken" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"emailper" varchar(100),
	"emailuni" varchar(100),
	"emerphone" varchar(20),
	"emerrelation" varchar(50),
	"facebook" varchar(255),
	"lineid" varchar(100),
	"instagram" varchar(100),
	"discord" varchar(100),
	"img" varchar(20)
);

