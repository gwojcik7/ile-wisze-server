import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BillStatus } from "./BillStatus";

@Entity()
export class Bill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    recipientId: number;

    @Column()
    reason: string;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    price: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    dateAdd: Date;

    @Column()
    status: BillStatus;
}
