import { User } from "../../user/User";
import { Bill } from "../Bill";

export default interface BillResponseObject {
    id: number;
    user: User;
    recipient: User;
    reason: string;
    price: number;
    dateAdd: Date;
}
