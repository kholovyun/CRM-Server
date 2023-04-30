import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import { UsersService, usersService } from "../services/usersService";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
// import IRequestWithTokenData from '../interfaces/IRequestWithTokenData'
// import { auth } from '../middlewares/auth'

export class UsersController {
    private service: UsersService;
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.router.post("/", this.register);
        this.router.post("/login", this.login);
        // this.router.get('/token', auth, this.checkToken)
        this.service = usersService;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private register = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDto | string> = await this.service.register(req.body);
        res.status(response.status).send(response.result);
    };

    private login = async (req: Request, res: Response): Promise<void> => {
        const response: IResponse<IUserGetDto | string> = await this.service.login(req.body);
        res.status(response.status).send(response.result);
    };
    
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
