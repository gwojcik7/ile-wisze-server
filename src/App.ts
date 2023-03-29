import bodyParser from "body-parser";
import express, { Express } from "express";
import IController from "./core/IController";
import { DataSource } from "typeorm";
import useDb from "./common/useDb";
import cors from "cors";

export default class App {
    public app: Express;
    public port: number;
    public dataSource: DataSource;

    constructor(controllers: IController[], port: number) {
        this.app = express();
        this.port = port;

        this.initMiddlewares();
        this.initDbConnection();
        this.initControllers(controllers);
    }

    private initMiddlewares() {
        this.app.use(bodyParser.json());
        this.app.use(cors());
    }

    private initControllers(controllers: IController[]) {
        controllers.forEach((controller) => {
            this.app.use("/", controller.router);
        });
    }

    private initDbConnection = () => {
        const dataSource = useDb();
    };

    public listen() {
        this.app.listen(this.port, () => {
            console.log("listening on port " + this.port);
        });
    }
}
