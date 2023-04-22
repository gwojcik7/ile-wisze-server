import { getUserId } from "../auth/TokenMiddleware";
import useDb from "../common/useDb";
import IService from "../core/IService";
import CreateUserDTO from "./DTO/CreateUserDTO";
import { User } from "./User";

export default class UserService implements IService {
    public getAll = async () => {
        return await useDb().getRepository(User).find();
    };

    public getByLogin = async (login: string): Promise<User | null> => {
        return await useDb().getRepository(User).findOneBy({ login });
    };

    public getById = async (id: number): Promise<User | null> => {
        return await useDb().getRepository(User).findOneBy({ id });
    }

    public add = async (createUserDTO: CreateUserDTO): Promise<User> => {
        const user = new User();

        user.firstName = createUserDTO.firstName;
        user.lastName = createUserDTO.lastName;
        user.login = createUserDTO.login;
        user.password = createUserDTO.password;

        return await useDb().getRepository(User).save(user);
    };
}
