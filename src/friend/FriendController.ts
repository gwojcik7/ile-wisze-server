import { Request, Response, Router } from "express";
import IController from "../core/IController";
import FriendService from "./FriendService";
import {verifyToken, getUserId } from "../auth/TokenMiddleware";
import CreateFriendDTO from "./DTO/CreateFriendDTO";
import AcceptFriendDTO from "./DTO/AcceptFriendDTO";
import RejectFriendDTO from "./DTO/RejectFriendDTO";

export default class FriendController implements IController {
    public path = "/friend";
    public router: Router = Router();
    public service = new FriendService();

    constructor() {
        this.initRoutes();
    }

    public initRoutes = () => {
        this.router.get(this.path, verifyToken, this.getFriends);
        this.router.post(this.path, verifyToken, this.add);
        this.router.post(this.path + "/accept", verifyToken, this.accept);
        this.router.post(this.path + "/reject", verifyToken, this.reject);
        this.router.get(this.path + "/invitations", verifyToken, this.getInvitations);
        this.router.get(this.path + "/pending", verifyToken, this.getPending);
    };

    public add = async (req: Request, res: Response) => {
        if (!req.body.login) {
            res.status(400).send({
                message: "Missing params",
            });
        }

        const login = req.body.login;
        const userId = getUserId(req);

        if(!userId) {
            res.status(401).send({
                message: "Unauthorized",
            });
            return false;
        }

        const createFriendDTO = new CreateFriendDTO(
            userId,
            login
        );

        try {
            const friend = await this.service.add(createFriendDTO);
            res.status(201).send(friend);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public accept = async (req: Request, res: Response) => {
        if (!req.body.userId || !req.body.friendId) {
            res.status(400).send({
                message: "Missing params",
            });
        }

        const acceptFriendDTO = new AcceptFriendDTO(
            req.body.userId,
            req.body.friendId
        );

        try {
            const friend = await this.service.accept(acceptFriendDTO);
            res.status(201).send(friend);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public reject = async (req: Request, res: Response) => {

        if (!req.body.userId || !req.body.friendId) {
            res.status(400).send({
                message: "Missing params",
            });
        }

        const rejectFriendDTO = new RejectFriendDTO(
            req.body.userId,
            req.body.friendId
        );

        try {
            const friend = await this.service.reject(rejectFriendDTO);
            res.status(201).send(friend);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getInvitations = async (req: Request, res: Response) => {
        const userId = req.body.userId;

        try {
            const invitations = await this.service.getInvitations(userId);
            res.status(200).send(invitations);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getFriends = async (req: Request, res: Response) => {
        const userId = req.body.userId;

        try {
            const friends = await this.service.getFriends(userId);
            res.status(200).send(friends);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getPending = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if(!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId
            });
            return false;
        }

        try {
            const pending = await this.service.getPending(userId);
            res.status(200).send(pending);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };
}
