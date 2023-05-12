import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import IParentGetDto from "../interfaces/IParent/IParentGetDto";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import { ParentsDb, parentsDb } from "../repository/supDb/parentsDb";

export class ParentsController {
    private repository: ParentsDb;
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.getParents);
        this.router.get("/:id", permission() , this.getParentById);
        this.router.post("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR]), this.createParent);
        this.router.patch("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.activateParent);
        this.repository = parentsDb;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getParents = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IParentGetDto[] | string> = await this.repository.getParents(
            user.id, req.params.offset, req.params.limit
        );
        res.status(response.status).send(response.result);
    };

    private getParentById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IParentGetDto | string> = await this.repository.getParentById(
            user.id,
            req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private createParent = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response = await this.repository.createParent(user.id, req.body);
        res.status(response.status).send(response);
    };

    private activateParent = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as {id: string, email: string};
        const response = await this.repository.activateParent(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };
}