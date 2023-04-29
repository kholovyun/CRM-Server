import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import { UsersService, usersService } from "../services/usersService";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import { getStatusCode } from "http-status-codes";
// import { EStatuses } from '../enums/EStatuses'
// import IRequestWithTokenData from '../interfaces/IRequestWithTokenData'
// import IUserGetDto from '../interfaces/IUserGetDto'
// import { auth } from '../middlewares/auth'
// import { usersService, UsersService } from '../services/usersService'
export class UsersController {
    private service: UsersService;
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.router.post("/", this.register);
        // this.router.post('/login', this.login)
        // this.router.get('/token', auth, this.checkToken)
        this.service = usersService;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private register = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDto | undefined> = await this.service.register(req.body);
        res.status(getStatusCode(response.status)).send(response);
    };

    // private login = async (req: Request, res: Response): Promise<void> => {
    //     const response: IResponse<
    //     { username: string; token: string } | undefined
    //     > = await this.service.login(req.body);
    //     res.send(response);
    // };
    
    // private checkToken = async (
    //     expressReq: Request,
    //     res: Response,
    // ): Promise<void> => {
    //     const req = expressReq as IRequestWithTokenData;
    //     const response: IResponse<IUserGetDto | undefined> = {
    //     status: EStatuses.OK,
    //     result: req.dataFromToken as IUserGetDto,
    //     message: "",
    //     };
    //     res.send(response);
    // };
}
