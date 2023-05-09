import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import { UsersService, usersService } from "../services/usersService";
import IUserGetDtoWithToken from "../interfaces/IUser/IUserGetDtoWithToken";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import { StatusCodes } from "http-status-codes";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import { IMessage } from "../interfaces/IMessage";

export class UsersController {
    private service: UsersService;
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.post("/", this.register);
        this.router.post("/login", this.login);
        this.router.get("/token", permission(), this.checkToken);
        this.router.get("/", permission([ERoles.ADMIN]), this.getUsers);
        this.router.get("/:id", permission(), this.getUserById);
        this.router.patch("/", permission(), this.editUser);
        this.router.post("/set-password", this.setPassword);
        this.service = usersService;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getUsers = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDto[] | string> = await this.service.getUsers();
        res.status(response.status).send(response.result);
    };

    private getUserById = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDto | string> = await this.service.getUserByid(req.params.id);
        res.status(response.status).send(response.result);
    };

    private register = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDtoWithToken | string> = await this.service.register(req.body);
        res.status(response.status).send(response.result);
    };

    private login = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDtoWithToken | IMessage> = await this.service.login(req.body);
        res.status(response.status).send(response.result);
    };

    private editUser = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const response: IResponse<IUserGetDto | string> = await this.service.editUser(req.body, user.id);
        res.status(response.status).send(response.result);
    };

    private setPassword = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IMessage> = await this.service.setPassword(req.body);
        res.status(response.status).send(response.result);
    };

    private checkToken = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        res.status(StatusCodes.OK).send(req.dataFromToken);
    };
}