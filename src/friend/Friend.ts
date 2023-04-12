import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import { FriendStatus } from "./FriendStatus";

@Entity()
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  friendId: number;

  @Column()
  status: FriendStatus;
}