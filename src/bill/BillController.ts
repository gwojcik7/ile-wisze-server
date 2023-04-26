import { Request, Response, Router } from "express";
import IController from "../core/IController";
import { verifyToken, getUserId } from "../auth/TokenMiddleware";
import BillService from "./BillService";
import CreateBillDTO from "./DTO/CreateBillDTO";
import { BillStatus } from "./BillStatus";

export default class BillController implements IController {
    public path = "/bill";
    public router: Router = Router();
    public service = new BillService();

    constructor() {
        this.initRoutes();
    }

    public initRoutes = () => {
        this.router.get(this.path + "/pending", verifyToken, this.getPending);
        this.router.get(this.path + "/pending/recent", verifyToken, this.getPendingFromLast30Days);
        this.router.get(this.path + "/total/repayment", verifyToken, this.getTotalRepayment);
        this.router.get(this.path + "/total/owed", verifyToken, this.getTotalOwed);
        this.router.post(this.path, verifyToken, this.add);
    };

    public getPending = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId,
            });
            return false;
        }

        try {
            const bills = await this.service.getPending(userId);
            res.status(200).send(bills);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getPendingFromLast30Days = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId,
            });
            return false;
        }

        try {
            const bills = await this.service.getPendingFromLast30Days(userId);
            res.status(200).send(bills);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public add = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId,
            });
            return false;
        }

        if (!req.body.recipientId || !req.body.reason || !req.body.price) {
            res.status(400).send({
                message: "Missing params",
            });
        }

        const createBillDTO = new CreateBillDTO(
            userId,
            req.body.recipientId,
            req.body.reason,
            req.body.price,
            BillStatus.PENDING
        );

        try {
            const bill = await this.service.add(createBillDTO);
            res.status(201).send(bill);
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getTotalRepayment = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId,
            });
            return false;
        }

        try {
            const total = await this.service.getTotalRepayment(userId);
            res.status(200).send({
                value: total,
            });
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };

    public getTotalOwed = async (req: Request, res: Response) => {
        const userId = getUserId(req);

        if (!userId) {
            res.status(401).send({
                message: "Unauthorized",
                userId: userId,
            });
            return false;
        }

        try {
            const total = await this.service.getTotalOwed(userId);
            res.status(200).send({
                value: total,
            });
        } catch (error: any) {
            res.status(409).send({
                message: error.message,
            });
        }
    };
}
