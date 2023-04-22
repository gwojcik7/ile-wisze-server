import { Request, Response, Router } from "express";
import IController from "../core/IController";
import UserService from "../user/UserService";
import AuthService from "./AuthService";
import { getUserId } from "./TokenMiddleware";

export default class AuthController implements IController {
    public path = "/auth";
    public router: Router = Router();
    public service: AuthService = new AuthService();

    constructor() {
        this.initRoutes();
    }

    public initRoutes = () => {
        this.router.post(this.path, this.signIn);
        this.router.post(this.path + "/token/validate", this.validateToken);
    };

    private signIn = async (request: Request, response: Response) => {
        const login = request.body.login;
        const password = request.body.password;

        const signIn = await this.service.signIn(login, password);

        if (!signIn) {
            return response.status(401).send({
                error: "Nieprawidłowe dane logowania",
            });
        }

        const user = await new UserService().getByLogin(login);

        if(!user) {
            return response.status(401).send({
                error: "Wystąpił nieoczekiwany błąd podczas logowania - użytkownik nie istnieje",
            });
        }

        const token = this.service.generateToken(user.id);

        if (!user) {
            return response.status(401).send({
                error: "Wystąpił nieoczekiwany błąd podczas logowania",
            });
        }

        return response.status(200).send({
            user,
            token,
        });
    };

    public validateToken = async (request: Request, response: Response) => {
        const token = request.body.token;

        if (!token) {
            return response.status(401).send({
                error: "Nieprawidłowy token",
            });
        }

        try {
            const isValid = this.service.isValidToken(token);

            if (!isValid) {
                return response.status(401).send({
                    error: "Nieprawidłowy token",
                });
            }
            const userId = getUserId(request);

            if (!userId) {
                return response.status(401).send({
                    error: "Nieprawidłowy użytkownik",
                });
            }
                    
            const user = await new UserService().getById(userId);

            if (!user) {
                return response.status(401).send({
                    error: "Nieprawidłowy obiekt użytkownika",
                });
            }

            return response.status(200).send({
                user,
                token,
            });
            
        } catch (error) {
            return response.status(401).send({
                error: "Nieprawidłowy token",
            });
        }
    };
}
