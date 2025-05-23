import { DataSource } from "typeorm";
import {MYSQL_PASSWORD, MYSQL_PORT, MYSQL_USERNAME} from "../../../global.config";
import { User } from "./entities/user/user";

export const AppDataSource = new DataSource({
	type: "mysql",
	host: process.env.NODE_ENV == "production" ? "mysql" : "localhost",
	port: MYSQL_PORT,
	username: MYSQL_USERNAME,
	password: MYSQL_PASSWORD,
	database: "monopoly",
	synchronize: true,
	entities: [__dirname + "/entities/*{.js,.ts}"],
});

export const UserDataSource = new DataSource({
	type: "mysql",
	host: process.env.NODE_ENV == "production" ? "mysql" : "localhost",
	port: MYSQL_PORT,
	username: MYSQL_USERNAME,
	password: MYSQL_PASSWORD,
	database: "fatpaper_user",
	synchronize: true,
	entities: [User],
});
