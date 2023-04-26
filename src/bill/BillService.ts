import useDb from "../common/useDb";
import IService from "../core/IService";
import FriendService from "../friend/FriendService";
import UserService from "../user/UserService";
import { Bill } from "./Bill";
import { BillStatus } from "./BillStatus";
import CreateBillDTO from "./DTO/CreateBillDTO";
import BillResponseObject from "./ResponseObject/BillResponseObject";

export default class BillService implements IService {
    private friendService: FriendService;
    private userService: UserService;

    constructor() {
        this.friendService = new FriendService();
        this.userService = new UserService();
    }

    public getPending = async (userId: number): Promise<BillResponseObject[]> => {
        const bills = await useDb()
            .getRepository(Bill)
            .createQueryBuilder("bill")
            .where("bill.userId = :userId OR bill.recipientId = :userId")
            .andWhere("bill.status = :status", { status: BillStatus.PENDING })
            .setParameters({
                userId,
            })
            .getMany();

        return await this.getResponseObjects(bills);
    };

    getPendingFromLast30Days = async (userId: number): Promise<BillResponseObject[]> => {
        const bills = await useDb()
            .getRepository(Bill)
            .createQueryBuilder("bill")
            .where("(bill.userId = :userId OR bill.recipientId = :userId)", { userId })
            .andWhere("bill.dateAdd >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)")
            .andWhere("bill.status = :status", { status: BillStatus.PENDING })
            .getMany();

        return await this.getResponseObjects(bills);
    };

    public add = async (createUserDTO: CreateBillDTO): Promise<Bill> => {
        if (createUserDTO.userId === createUserDTO.recipientId) {
            throw new Error("You can't add bill to yourself");
        }

        const isFriend = this.friendService.isFriend(createUserDTO.userId, createUserDTO.recipientId);

        if (!isFriend) {
            throw new Error("You can't add bill to non friend");
        }

        const bill = new Bill();

        bill.userId = createUserDTO.userId;
        bill.recipientId = createUserDTO.recipientId;
        bill.reason = createUserDTO.reason;
        bill.price = createUserDTO.price;

        return await useDb().getRepository(Bill).save(bill);
    };

    private getResponseObject = async (bill: Bill): Promise<BillResponseObject | null> => {
        const user = await this.userService.getById(bill.userId);
        const recipient = await this.userService.getById(bill.recipientId);

        if (!user || !recipient) {
            new Error("User or recipient not found");
            return null;
        }

        return {
            ...bill,
            user,
            recipient,
        };
    };

    private getResponseObjects = async (bills: Bill[]): Promise<BillResponseObject[]> => {
        const responseObjects = [];

        for (const bill of bills) {
            const responseObject = await this.getResponseObject(bill);

            if (!responseObject) {
                continue;
            }

            responseObjects.push(responseObject);
        }

        return responseObjects;
    };

    public getTotalRepayment = async (userId: number): Promise<number> => {
        const bills = await useDb()
            .getRepository(Bill)
            .createQueryBuilder("bill")
            .where("bill.userId = :userId", { userId })
            .andWhere("bill.status = :status", { status: BillStatus.PENDING })
            .getMany();

        let totalRepayment = 0;

        for (const bill of bills) {
            totalRepayment += Number(bill.price);
        }

        return totalRepayment;
    };

    public getTotalOwed = async (userId: number): Promise<number> => {
        const bills = await useDb()
            .getRepository(Bill)
            .createQueryBuilder("bill")
            .where("bill.recipientId = :userId", { userId })
            .andWhere("bill.status = :status", { status: BillStatus.PENDING })
            .getMany();

        let totalOwed = 0;

        for (const bill of bills) {
            totalOwed += Number(bill.price);
        }

        return totalOwed;
    };
}
