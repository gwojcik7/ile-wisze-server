import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../user/User";
import dotenv from "dotenv";

dotenv.config();

const dataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User],
    subscribers: [],
    migrations: [],
});

dataSource
    .initialize()
    .then(() => {
        // here you can start to work with your database
    })
    .catch((error) => console.log(error));

export default function useDb(): DataSource {
    return dataSource;
}
