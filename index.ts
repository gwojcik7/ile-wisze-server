import dotenv from "dotenv";
import App from "./src/App";
import AuthController from "./src/auth/AuthController";
import IController from "./src/core/IController";
import UserController from "./src/user/UserController";
import FriendController from "./src/friend/FriendController";

dotenv.config();

const controllers: IController[] = [new AuthController(), new UserController(), new FriendController()];

const port = Number(process.env.PORT);
const app = new App(controllers, port);

app.listen();
