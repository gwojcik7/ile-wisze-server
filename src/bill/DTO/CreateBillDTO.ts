import { BillStatus } from "../BillStatus";

export default class CreateBillDTO {
    constructor(
        public userId: number,
        public recipientId: number,
        public reason: string,
        public price: number,
        public status: BillStatus
    ) {}
}
