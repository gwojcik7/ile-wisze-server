import useDb from "../common/useDb";
import IService from "../core/IService";
import { User } from "../user/User";
import UserService from "../user/UserService";
import AcceptFriendDTO from "./DTO/AcceptFriendDTO";
import CreateFriendDTO from "./DTO/CreateFriendDTO";
import { Friend } from "./Friend";
import { FriendStatus } from "./FriendStatus";

export default class FriendService implements IService {
    public getSentInvitations = async (userId: number): Promise<User[]> => {
        const pending = await useDb()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where("friend.userId = :userId AND friend.status = :status")
            .setParameters({
                userId,
                status: FriendStatus.PENDING,
            })
            .getMany();

        // Get user data for each pending
        const users: User[] = [];

        for (const pendingFriend of pending) {
            const user = await useDb()
                .getRepository(User)
                .findOneBy({ id: pendingFriend.friendId });

            if (user) {
                users.push(user);
            }
        }

        return users;
    };

    public getWaitingInvitations = async (userId: number): Promise<User[]> => {
        const invitations = await useDb()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where("friend.friendId = :userId AND friend.status = :status")
            .setParameters({
                userId,
                status: FriendStatus.PENDING,
            })
            .getMany();

        // Get user data for each invitation
        const users: User[] = [];

        for (const invitation of invitations) {
            const user = await useDb()
                .getRepository(User)
                .findOneBy({ id: invitation.userId });

            if (user) {
                users.push(user);
            }
        }

        return users;
    };

    public getFriends = async (userId: number): Promise<User[]> => {
        const friends = await useDb()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where("friend.userId = :userId AND friend.status = :status")
            .orWhere("friend.friendId = :userId AND friend.status = :status")
            .setParameters({
                userId,
                status: FriendStatus.ACCEPTED,
            })
            .getMany();

        // Get user data for each friend
        const users: User[] = [];

        for (const friend of friends) {
            const id =
                friend.userId == userId ? friend.friendId : friend.userId;

            const user = await useDb().getRepository(User).findOneBy({ id });

            if (user) {
                users.push(user);
            }
        }

        return users;
    };

    public add = async (createFriendDTO: CreateFriendDTO): Promise<Friend> => {
        const friend = new Friend();

        const userService = new UserService();

        const friendUser = await userService.getByLogin(
            createFriendDTO.friendLogin
        );

        if (!friendUser) {
            throw new Error("Friend doesn't exist");
        }

        friend.userId = createFriendDTO.userId;
        friend.friendId = friendUser.id;
        friend.status = FriendStatus.PENDING;

        // Check if user is trying to add himself
        if (createFriendDTO.userId == friendUser.id) {
            throw new Error("You can't add yourself");
        }

        // Check if user is already friends
        const isAlreadyFriends = await this.getFriend(
            createFriendDTO.userId,
            friendUser.id
        );

        if (isAlreadyFriends) {
            throw new Error("You are already send an invitation");
        }

        // Check is user exists
        const user = await useDb()
            .getRepository(User)
            .findOneBy({ id: createFriendDTO.userId });

        //Return error if user doesn't exist
        if (!user) {
            throw new Error("User doesn't exist");
        }

        return await useDb().getRepository(Friend).save(friend);
    };

    public async accept(acceptFriendDTO: AcceptFriendDTO): Promise<Friend> {
        const friend = await this.getFriend(
            acceptFriendDTO.userId,
            acceptFriendDTO.friendId
        );

        if (!friend) {
            throw new Error("Friend doesn't exist");
        }

        if (friend.status == FriendStatus.ACCEPTED) {
            throw new Error("You are already accepted friends");
        }

        friend.status = FriendStatus.ACCEPTED;

        return await useDb().getRepository(Friend).save(friend);
    }

    public async reject(acceptFriendDTO: AcceptFriendDTO): Promise<Friend> {
        const friend = await this.getFriend(
            acceptFriendDTO.userId,
            acceptFriendDTO.friendId
        );

        if (!friend) {
            throw new Error("Friend doesn't exist");
        }

        if (friend.status == FriendStatus.REJECTED) {
            throw new Error("You already rejected this friend");
        }

        friend.status = FriendStatus.REJECTED;

        return await useDb().getRepository(Friend).save(friend);
    }

    public async getFriend(
        userId: number,
        friendId: number
    ): Promise<Friend | null> {
        if (!userId || !friendId) {
            throw new Error("Invalid params");
        }

        const friend = await useDb()
            .getRepository(Friend)
            .createQueryBuilder("friend")
            .where(
                "(friend.userId = :userId AND friend.friendId = :friendId) OR (friend.userId = :friendId AND friend.friendId = :userId)"
            )
            .setParameters({
                userId,
                friendId,
            })
            .getOne();

        return friend;
    }

    public async isFriend(userId: number, friendId: number): Promise<boolean> {
        const friend = await this.getFriend(userId, friendId);

        if (!friend) {
            return false;
        }

        return friend.status == FriendStatus.ACCEPTED;
    }
}
