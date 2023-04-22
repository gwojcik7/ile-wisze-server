import { Request, Response, Router } from "express";
import {verifyToken} from "../auth/TokenMiddleware";
import IController from "../core/IController";
import CreateUserDTO from "./DTO/CreateUserDTO";
import UserService from "./UserService";

export default class UserController implements IController {
    public path = "/user";
    public router: Router = Router();
    public service = new UserService();

    constructor() {
        this.initRoutes();
    }

    public initRoutes = () => {
        this.router.get(this.path, verifyToken, this.getAll);
        this.router.post(this.path, verifyToken, this.add);
    };

    public getAll = async (req: Request, res: Response) => {
        try {
            const users = await this.service.getAll();
            res.send({
                message: "Success!",
                data: {
                    users,
                },
            });
        } catch (error) {
            res.send({
                message: "Cannot get all users",
                error,
            });
        }
    };

    public add = async (req: Request, res: Response) => {
        const createUserDTO = new CreateUserDTO(
            req.body.firstName,
            req.body.lastName,
            req.body.login,
            req.body.password
        );

        try {
            const user = await this.service.add(createUserDTO);
            res.status(201).send({
                id: user.id,
            });
        } catch (error: any) {
            res.status(409).send({
                error: error.sqlMessage,
            });
        }
    };
}
