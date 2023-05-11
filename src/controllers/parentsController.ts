import express, { Request, Response, Router } from "express";
import { ParentsService, parentsService } from "../services/parentsService";
import IResponse from "../interfaces/IResponse";
import IParentGetDto from "../interfaces/IParent/IParentGetDto";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";

export class ParentsController {
    private service: ParentsService;
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.getParents);
        this.router.get("/:id", permission() , this.getParentById);
        this.router.post("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR]), this.createParent);
        this.router.patch("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.activateParent);
        this.service = parentsService;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getParents = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IParentGetDto[] | string> = await this.service.getParents(
            user.id
        );
        res.status(response.status).send(response.result);
    };

    private getParentById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IParentGetDto | string> = await this.service.getParentById(
            user.id,
            req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private createParent = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response = await this.service.createParent(user.id, req.body);
        res.send(response);
    };

    private activateParent = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as {id: string, email: string};
        const response = await this.service.activateParent(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };
}