import IService from "../core/IService";
import jwt from "jsonwebtoken";
import useDb from "../common/useDb";
import { User } from "../user/User";
import bcrypt from "bcrypt";

export default class AuthService implements IService {
    public signIn = async (
        login: string,
        password: string
    ): Promise<boolean> => {
        const userRaw = await useDb()
            .getRepository(User)
            .createQueryBuilder("user")
            .select("user.login, user.password")
            .where("user.login = :login", { login })
            .getRawOne();

        if (!userRaw) {
            return false;
        }

        const passwordMatches = bcrypt.compareSync(password, userRaw.password);

        if (!passwordMatches) {
            return false;
        }

        return true;
    };

    public generateToken = (userId: number): string | false => {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            return false;
        }

        return jwt.sign(userId.toString(), secret);
    };

    public isValidToken(token: string): boolean {
        const secret = process.env.JWT_SECRET || "";

        return !!jwt.verify(token, secret.toString());
    }
}
